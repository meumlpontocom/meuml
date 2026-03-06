import json
import traceback
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access, user_subscripted_accounts
from workers.helpers import get_tool
from werkzeug.exceptions import HTTPException


class DashboardActions(Actions):
    @jwt_required
    @prepare
    def index(self):
        data = {}
        accounts = []

        today = (datetime.today()).strftime("%Y-%m-%d")
        from_date = datetime.strptime(
            request.args.get('from_date', today), "%Y-%m-%d")
        to_date = datetime.strptime(
            request.args.get('to_date', today), "%Y-%m-%d")

        tool = self.get_tool('dashboard')

        query = """
            SELECT DISTINCT 
                concat_ws(
                    ',', 
                    string_agg(su.modules::varchar,',' ORDER BY su.modules), 
                    string_agg(pm.module_id::varchar,',' ORDER BY pm.module_id), 
                    string_agg(fr.module_id::varchar,',' ORDER BY pm.module_id)
                ) as modules, 
                ac.id, ac.status, ac.access_token_expires_at, ac.access_token, ac.refresh_token, ac.name 
            FROM meuml.accounts ac 
            LEFT JOIN meuml.subscription_accounts sa ON sa.account_id = ac.id 
            LEFT JOIN meuml.subscriptions su ON sa.subscription_id = su.id AND su.expiration_date > NOW() 
            LEFT JOIN meuml.package_modules pm ON pm.package_id = su.package_id
            LEFT JOIN meuml.package_modules fr ON fr.package_id = 1
            WHERE ac.user_id = :user_id AND ac.status = 1
            GROUP BY ac.id
        """
        accounts = self.fetchall(query, {'user_id': self.user['id']})
        accounts = [account for account in accounts if tool['access_type'] == 0 or str(
            tool['module_id']) in account['modules'].split(',')]
        accounts_id = [str(account['id']) for account in accounts]

        if len(accounts) == 0:
            self.abort_json({
                'message': 'Essa funcionalidade é exclusiva para contas assinantes do MeuML v2. Faça já sua assinatura e obtenha acesso',
                'status': 'error',
            }, 402)

        additional_condition = f" ({','.join(accounts_id)}) "

        # Get current period data
        data['daily'] = self.get_daily_data(
            from_date, to_date, additional_condition)
        data['summary'] = self.get_advertising_visits(
            from_date, to_date, additional_condition)
        data['summary'] = self.get_orders(
            data['summary'], from_date, to_date, additional_condition)
        data['summary'] = self.get_questions_quantity(
            data['summary'], accounts)

        # Generate daily data when window outside of dw.dim_datas
        if len(data['daily']) == 0:
            day = from_date
            while True:
                data['daily'].append({'date': day.strftime(
                    "%m/%d/%Y"), 'orders': None, 'visits': None})
                if day >= to_date:
                    break
                day = day + timedelta(days=1)

        # Get current visits from ML
        if today == to_date.strftime("%Y-%m-%d"):
            visits_today = self.get_visits_today(accounts)
            data['summary']['total_visits'] += visits_today

            for day in data['daily']:
                if day['date'] == (datetime.today()).strftime("%m/%d/%Y"):
                    day['visits'] = visits_today
                    break

            # Get current active advertising quantity
            if today == from_date.strftime("%Y-%m-%d"):
                count = self.fetchone(
                    f"SELECT count(*) AS active_advertisings FROM meuml.advertisings ad WHERE status = 'active' AND ad.account_id IN {additional_condition}")
                if count:
                    data['summary']['active_advertisings'] = count['active_advertisings']

        # Get previous period daily data
        period_length = (to_date - from_date).days + 1
        from_date = datetime.strptime(
            (from_date-timedelta(days=period_length)).strftime("%Y-%m-%d"), "%Y-%m-%d")
        to_date = datetime.strptime(
            (to_date-timedelta(days=period_length)).strftime("%Y-%m-%d"), "%Y-%m-%d")

        #data['previous_daily'] = self.get_daily_data(from_date, to_date)
        previous_summary = self.get_advertising_visits(
            from_date, to_date, additional_condition)
        previous_summary = self.get_orders(
            previous_summary, from_date, to_date, additional_condition)
        previous_summary['new_questions'] = 0

        # calculate percentage variation
        data['percent_variance'] = {}

        for key, value in previous_summary.items():
            if value != 0 and key != 'new_questions':
                data['percent_variance'][key] = str(
                    int(100 * (data['summary'][key] - value) / value)) + '%'
            else:
                data['percent_variance'][key] = 'N/A'

        return self.return_success(data=data)

    def get_advertising_visits(self, from_date, to_date, additional_condition):
        date_ids = self.fetchone(
            f"SELECT dw.get_data_id('{from_date}') as initial, dw.get_data_id('{to_date}') as final ")

        # Get ads and visits total quantity
        query = f"""
            SELECT COALESCE(MAX(active_advertisings),0) as active_advertisings, COALESCE(SUM(av.qtd_visitas),0)::integer as total_visits
            FROM meuml.accounts ac 
            JOIN dw.f_account_visits av ON av.account_id = ac.id
            WHERE ac.user_id = :user_id AND av.data_id BETWEEN {date_ids['initial']} AND {date_ids['final']} 
            AND ac.id IN {additional_condition}
        """
        values = {'user_id': self.user['id']}
        summary = self.fetchone(query, values)

        if not summary:
            summary = {
                'active_advertisings': 0,
                'total_visits': 0
            }

        return summary

    def get_orders(self, summary, from_date, to_date, additional_condition):
        # Get orders total quantity
        query = f"""
            SELECT os.substatus, COUNT(od.id)::integer quantity, SUM(od.total_amount) as total_amount
            FROM meuml.accounts ac 
            JOIN meuml.orders od ON od.account_id = ac.id
            LEFT JOIN meuml.order_shipments os ON os.order_id = od.id 
            WHERE ac.user_id = :user_id AND od.status = 'paid' AND od.date_created BETWEEN '{from_date.strftime("%Y-%m-%d 00:00:00")}' AND '{to_date.strftime("%Y-%m-%d 23:59:59")}'
            AND ac.id IN {additional_condition}
            GROUP BY os.substatus
        """

        values = {'user_id': self.user['id']}
        orders = self.fetchall(query, values)

        summary['total_orders'] = 0
        summary['new_orders'] = 0
        total_amount = 0

        for order in orders:
            total_amount += order['total_amount']
            if order['substatus'] == 'ready_to_print':
                summary['new_orders'] += order['quantity']
            else:
                summary['total_orders'] += order['quantity']

        summary['total_amount'] = total_amount
        return summary

    def get_questions_quantity(self, summary, accounts):
        summary['new_questions'] = 0
        for account in accounts:
            access_token = self.refresh_token(account=account)
            if not access_token:
                continue
            access_token = access_token['access_token']
            ml_api = MercadoLibreApi(access_token=access_token)

            response = ml_api.get(
                f'/my/received_questions/search', params={'status': 'UNANSWERED'})
            response_data = response.json()

            if response.status_code == 200 and response_data.get('total'):
                summary['new_questions'] += response_data.get('total')
        return summary

    def get_visits_today(self, accounts):
        visits_today = 0
        today = datetime.today()

        for account in accounts:
            access_token = self.refresh_token(account=account)
            if not access_token:
                continue
            access_token = access_token['access_token']
            ml_api = MercadoLibreApi(access_token=access_token)

            response = ml_api.get(f'/users/{account["id"]}/items_visits',
                                  params={
                                      'date_from': today.strftime("%Y-%m-%d"),
                                      'date_to': (today + timedelta(days=1)).strftime("%Y-%m-%d")
                                  })
            response_data = response.json()

            if response.status_code == 200 and response_data.get('total_visits'):
                visits_today += response_data.get('total_visits')
        return visits_today

    def get_daily_data(self, from_date, to_date, additional_condition):
        date_ids = self.fetchone(
            f"SELECT dw.get_data_id('{from_date}') as initial, dw.get_data_id('{to_date}') as final ")

        query = f"""
            SELECT TO_CHAR(dd.data_date, \'MM/DD/YYYY\') as date, COUNT(od.id)::integer as orders, SUM(av.qtd_visitas)::integer as visits 
			FROM dw.dim_datas dd
            JOIN meuml.accounts ac ON ac.user_id = :user_id
            LEFT JOIN meuml.orders od ON od.account_id = ac.id AND od.date_created::date = dd.data_date 
            LEFT JOIN dw.f_account_visits av ON av.account_id = ac.id AND av.data_id = dd.id
            WHERE dd.id BETWEEN {date_ids['initial']} AND {date_ids['final']} AND ac.id IN {additional_condition}
            GROUP BY "date" 
            ORDER BY "date" 
        """
        values = {'user_id': self.user['id']}
        data = self.fetchall(query, values)
        return data

    @jwt_required
    @prepare
    def summary(self):
        try:
            data = {}

            query = f"""
                SELECT 
                    ac.id, ac.name, ac.internal_status, ac.platform, ac.platform_name, 
                    COALESCE(string_agg(CASE WHEN su.package_id = 2 THEN 'Profissional' 
                    WHEN su.modules IS NOT NULL and su.id IS NOT NULL THEN 'Personalizado' 
                    END, ','), 'Gratuito') as "subscription"
                FROM (
                    SELECT ml.id, ml.name, ml.status as internal_status, 'ML' as platform, 'Mercado Livre' as platform_name 
                    FROM meuml.accounts ml
                    WHERE ml.user_id = :user_id 
                    UNION 
                    SELECT sp.id, sp.name, sp.internal_status, 'SP' as platform, 'Shopee' as platform_name
                    FROM shopee.accounts sp
                    WHERE sp.user_id = :user_id
                ) ac
                LEFT JOIN meuml.subscription_accounts sa ON sa.account_id = ac.id
                LEFT JOIN meuml.subscriptions su ON su.id = sa.subscription_id AND su.expiration_date > NOW()
                GROUP BY ac.id, ac.name, ac.internal_status, ac.platform, ac.platform_name 
                ORDER BY ac.platform, ac.name
            """
            data['subscriptions'] = self.fetchall(
                query, {'user_id': self.user['id']})

            query = """
                SELECT cr.amount 
                FROM meuml.credits cr
                WHERE cr.user_id = :user_id
            """
            data['credits'] = self.fetchone(
                query, {'user_id': self.user['id']})

            query = """
                SELECT us.name, us.email
                FROM meuml.users us
                WHERE us.id = :user_id
            """
            data['user'] = self.fetchone(query, {'user_id': self.user['id']})

            return self.return_success(data=data)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc())

            self.abort_json({
                'message': f'Erro ao buscar informações do usuário',
                'status': 'error',
            }, 500)
