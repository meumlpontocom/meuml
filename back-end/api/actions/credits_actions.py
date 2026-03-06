import json
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.enums.access_type import AccessType
from libs.queue.queue import app as queue

MINIMUM_CREDITS_PURCHASE = 1

class CreditsActions(Actions):
    @jwt_required
    @prepare
    def available_credits(self):
        query = """
            SELECT amount
            FROM meuml.credits
            WHERE user_id = :user_id
        """
        values = {'user_id': self.user['id']}
        data = self.fetchone(query, values)
        
        if data is None:
            return self.return_success("Sua conta ainda não possui créditos")

        return self.return_success("Créditos", data)


    @jwt_required
    @prepare
    def credits_extract(self):
        fields = ['ct.date_created', 'ct.deposit', 'ct.amount', "pt.account_id", "COALESCE(ac.name, '-') AS account_name", 'tl.name AS task', 'pt.item_external_id']
        query = f"""
            SELECT {', '.join(fields)}
            FROM meuml.credit_transactions ct 
            LEFT JOIN meuml.process_items pt ON ct.process_item_id = pt.id 
            LEFT JOIN meuml.tools tl ON pt.tool_id = tl.id 
            LEFT JOIN meuml.accounts ac ON pt.account_id = ac.id 
        """
        
        values, query, total, *_ = self.apply_filter(request, query)
        query = self.order(request, fields, query, default_table='ct')
        params, query = self.paginate(request, query)

        try:
            data = self.fetchall(query, values)
        except Exception as e:
            print(query)
            print(values)
            print(e)
            self.abort_json({
                'message': f'Erro ao localizar dados do extrato.',
                'status': 'error',
            }, 500)

        if total == 0:
            return self.return_success("Nenhuma transação encontrada")

        meta = self.generate_meta(params, total)

        return self.return_success(data=data, meta=meta)


    @jwt_required
    @prepare
    def buy_credits(self):
        total_price = float(request.form.get('credits_amount', 0))

        if total_price < MINIMUM_CREDITS_PURCHASE:
            self.abort_json({
                'message': f'O valor mínimo de créditos aceito é R$ {MINIMUM_CREDITS_PURCHASE:.2f}'.replace('.',','),
                'status': 'error',
            }, 400)

        query = """
                INSERT INTO meuml.internal_orders (user_id, total_price, access_type) 
                VALUES (:user_id, :total_price, :access_type) 
                RETURNING id
            """
        values = {
            'user_id': self.user['id'],
            'total_price': request.form.get('credits_amount'),
            'access_type': AccessType.credits
        }
        
        try:
            values['id'] = self.execute_insert(query, values)
        except Exception as e:
            print(e)
            self.abort_json({
                'message': f'Erro ao registrar pedido de créditos. Ordem cancelada',
                'status': 'error',
            }, 500)

        return self.return_success(f'Pedido registrado. Realize o pagamento para receber seus créditos', values)

    
    def apply_filter(self, request, query=''):
        total = 0
        accounts = []
        filter_query = 'WHERE ac.user_id=:user_id AND ac.status=1 '
        filter_values = {'user_id': self.user['id']}

        k = query.find('FROM')
        count_query = 'SELECT count(*), ac.id ' + query[k:]

        if 'filter_account' in request.args:
            filter_query += 'AND ac.id IN ('
            d, query_list = self.string_to_dict(request.args['filter_account'], 'account')
            filter_values.update(d)
            filter_query += query_list

        if 'transaction_type' in request.args:
            if request.args['transaction_type'] == 'deposit':
                filter_query += 'AND ct.deposit IS TRUE '
            elif request.args['transaction_type'] == 'use':
                filter_query += 'AND ct.deposit IS FALSE '

        if 'filter_task' in request.args:
            filter_query += 'AND tl.key IN ('
            d, query_list = self.string_to_dict(request.args['filter_task'], 'task')
            filter_values.update(d)
            filter_query += query_list

        try:
            grouped_count = self.fetchall(count_query + filter_query + ' GROUP BY ac.id', filter_values)
            accounts = [account['id'] for account in grouped_count]
            total = sum([count['count'] for count in grouped_count])
        except Exception as e:
            print(e)

        query += filter_query
        
        return filter_values, query, total, accounts