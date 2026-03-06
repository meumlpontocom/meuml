import datetime
# import cx_Oracle
import psycopg2
import json
import requests
import pendulum
from datetime import timedelta
from flask import request
from flask_jwt_simple import jwt_required, get_jwt_identity
from libs.actions.actions import Actions
from libs.enums.marketplace import Marketplace
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access

from libs.schema.accounts_schema import (
    OAuthSchema, UpdateAccountName
)

from libs.helpers.OAuth2 import OAuth2

from libs.exceptions.exceptions import AccountsActionsException

from libs.decorator.prepare import prepare

from libs.queue.queue import app as queue

'''
    Essa classe é responsável por
'''


class AccountsActions(Actions):

    def create_table_advertisings(self, account):
        query = f"""
            CREATE TABLE IF NOT EXISTS meuml.advertisings_{account}
                PARTITION OF meuml.advertisings
                FOR VALUES IN ({account})
        """
        self.execute(query, {'account_id': account})

    @jwt_required
    @prepare
    def account_visits(self):
        if 'account_id' in request.args:
            accounts_id = request.args['account_id'].split(',')
            accounts_id = [int(account_id) for account_id in accounts_id]
            accounts_info = self.fetchall(
                'SELECT * FROM meuml.accounts WHERE user_id=:id AND id = ANY(:accounts_id)',
                {'id': self.user['id'], 'accounts_id': accounts_id})
        else:
            accounts_info = self.fetchall(
                'SELECT * FROM meuml.accounts WHERE user_id=:id', {'id': self.user['id']})
            accounts_id = [account['id'] for account in accounts_info]

        tool = self.get_tool('accounts-visits')
        code, message = verify_tool_access(
            self, self.user['id'], accounts_id, tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        last_month = (datetime.datetime.now() -
                      timedelta(days=30)).strftime("%Y-%m-%d")
        window_from = datetime.datetime.strptime(
            request.args.get('window_from', last_month), "%Y-%m-%d")

        today = datetime.datetime.now().strftime("%Y-%m-%d")
        window_to = datetime.datetime.strptime(
            request.args.get('window_to', today), "%Y-%m-%d")

        query = 'SELECT * FROM meuml.account_visits WHERE account_id = ANY(:accounts_id) '
        query += 'AND visits_at >= :window_from AND visits_at <= :window_to ORDER BY visits_at, account_id ASC'

        visits_info = self.fetchall(query, {'accounts_id': accounts_id, 'window_from': window_from, 'window_to': window_to})

        return self.return_success(data={'accounts': accounts_info, 'visits': visits_info})

    @jwt_required
    @prepare
    def sync_all_accounts(self):

        query = 'select * FROM meuml.accounts where user_id = :user_id'
        values = {
            'user_id': self.user['id']
        }

        query_shopee = 'select * FROM shopee.accounts where user_id = :user_id'
        values_shopee = {
            'user_id': self.user['id']
        }

        accounts = self.fetchall(query, values)
        accounts_shopee = self.fetchall(query_shopee, values_shopee)

        if len(accounts) == 0 and len(accounts_shopee) == 0:
            self.abort_json({
                'message': f'Impossível iniciar a sincronização, nenhuma conta  foi localizada.',
                'status': 'error',
            }, 400)

        account_update_external_data = queue.signature(
            'short_running:account_update_external_data')

        # for account in accounts:
        #     self.create_table_advertisings(account['id'])

        advertising_import_all = queue.signature(
            'long_running:advertising_import_all')

        mshops_advertising_import_all = queue.signature(
            'long_running:mshops_advertising_import_all')

        order_import_all = queue.signature('long_running:order_import_all')

        blacklist_import_all = queue.signature(
            'long_running:blacklist_import_all')

        promotions_import_all = queue.signature(
            'long_running:promotions_import_all')

        # SHOPEE
        shopee_import_item_list = queue.signature(
            'long_running:shopee_import_item_list'
        )
        # shopee_import_order_list = queue.signature(
        #     'long_running:shopee_import_order_list'
        # )

        failed_accounts = []
        for account in accounts:
            if self.validate_account(account):
                print(f"Starting synchronizing {account['id']} in queue...")
                account_update_external_data.delay(account_id=account['id'])
                advertising_import_all.delay(account_id=account['id'])
                # mshops_advertising_import_all.delay(account_id=account['id'])
                order_import_all.delay(account_id=account['id'])
                # blacklist_import_all.delay(account_id=account['id'])
                promotions_import_all.delay(account_id=account['id'])
            else:
                failed_accounts.append(account['name'])

        for account in accounts_shopee:
            if self.refresh_token(account, platform="SP"):
                shopee_import_item_list.delay(self.user['id'], account['id'])
                # shopee_import_order_list.delay(self.user['id'], account['id'])
            else:
                failed_accounts.append(account['name'])

        if len(failed_accounts) > 0:
            error_message = f"não foi possível renovar token de acesso da(s) conta(s) {', '.join(failed_accounts)}, por favor exclua e adicione novamente esta(s) conta(s)"
            return self.return_success(f"Sincronização das contas ativas iniciada com sucesso. No entanto, {error_message}", {})

        return self.return_success("Sincronização iniciada com sucesso", {})

    @jwt_required
    @prepare
    def sync_account(self, account_id: int = None):

        if account_id is None:
            self.abort_json({
                'message': f'Conta inválida',
                'status': 'error',
            }, 400)

        account_update_external_data = queue.signature(
            'short_running:account_update_external_data')

        # self.create_table_advertisings(account_id)

        advertising_import_all = queue.signature(
            'long_running:advertising_import_all')

        mshops_advertising_import_all = queue.signature(
            'long_running:mshops_advertising_import_all')

        order_import_all = queue.signature('long_running:order_import_all')

        blacklist_import_all = queue.signature(
            'long_running:blacklist_import_all')

        promotions_import_all = queue.signature(
            'long_running:promotions_import_all')

        query = 'select * FROM meuml.accounts where id = :id and user_id = :user_id'

        values = {
            'id': account_id,
            'user_id': self.user['id']
        }
        account = self.fetchone(query, values)
        self.validate_account_or_abort(account)

        account_update_external_data.delay(account_id=account['id'])
        advertising_import_all.delay(account_id=account['id'])
        # mshops_advertising_import_all.delay(account_id=account['id'])
        order_import_all.delay(account_id=account['id'])
        # blacklist_import_all.delay(account_id=account['id'])
        promotions_import_all.delay(account_id=account['id'])
        return self.return_success("Sincronização de conta iniciada com sucesso", {"account_id": account['id'], "start": pendulum.now()})

    @jwt_required
    @prepare
    def account_index(self, account_id: int = None):

        query = 'select id, user_id FROM meuml.accounts where id = :id and user_id = :user_id'

        values = {
            'id': account_id,
            'user_id': self.user['id']
        }
        account = self.fetchone(query, values)

        if account is None:
            self.abort_json({
                'message': f'Conta do Mercado Livre não localizada.',
                'status': 'error',
            }, 400)

        method = request.method

        if method == 'DELETE':
            return self.account_delete(account)
        elif method == 'PUT':
            return self.account_update(account)
        elif method == 'GET':
            pass
            # TODO:

    def account_update(self, account: dict):

        self.validate(UpdateAccountName())

        if account['user_id'] != self.user['id']:
            self.abort_json({
                'message': f'Conta do Mercado Livre pertence a outro e-mail',
                'status': 'error',
            }, 400)

        query = 'UPDATE meuml.accounts set name = :name where id = :id'

        values = {
            'name': self.data['name'],
            'id': account['id']
        }

        self.execute(query, values)

        return self.return_success("Conta atualizada com sucesso", values)

    def account_delete(self, account: {}):

        if account['user_id'] != self.user['id']:
            self.abort_json({
                'message': f'Conta do Mercado Livre pertence a outro e-mail',
                'status': 'error',
            }, 400)

        query = 'UPDATE meuml.accounts set user_id = null where id = :id and user_id  = :user_id '
        values = {
            'id': account['id'],
            'user_id': self.user['id']
        }
        self.execute(query, values)

        query = 'DELETE FROM stock.account_warehouse WHERE account_id = :account_id AND marketplace_id = :marketplace_id'
        values = {'account_id': account['id'], 'marketplace_id': Marketplace.MercadoLibre}
        self.execute(query, values)

        return self.return_success("Conta deletada com sucesso", {"account_id": account['id']})

    @jwt_required
    @prepare
    def accounts(self):
        query = """
            SELECT DISTINCT
                string_agg(su.package_id::varchar,',' ORDER BY su.package_id) as package_id,
                string_agg(su.modules::varchar,',' ORDER BY su.modules) as modules,
                string_agg(pm.module_id::varchar,',' ORDER BY pm.module_id ) as package_modules,
                ac.*,
                external_data -> 'internal_tags' as internal_tags,
                external_data -> 'tags' as tags,
                external_data -> 'shipping_modes' as shipping_modes,
                wh.id as warehouse_id,
                wh.code as warehouse_code,
                wh."name" as warehouse_name
            FROM meuml.accounts ac
            LEFT JOIN meuml.subscription_accounts sa ON sa.account_id = ac.id
            LEFT JOIN meuml.subscriptions su ON sa.subscription_id = su.id AND su.expiration_date > NOW() AND su.user_id = ac.user_id
            LEFT JOIN meuml.package_modules pm on pm.package_id = su.package_id
            LEFT JOIN meuml.questions qu ON qu.account_id = ac.id
            LEFT JOIN stock.marketplaces mp on mp.abbreviation = 'ML'
            LEFT JOIN stock.account_warehouse aw on aw.marketplace_id = mp.id and aw.account_id = ac.id
            LEFT JOIN stock.warehouses wh on wh.id = aw.warehouse_id
            WHERE ac.user_id = :user_id
            GROUP BY ac.id, wh.id
        """
        values = {'user_id': self.user['id']}
        accounts = self.fetchall(query, values)

        modules_data = self.fetchall(
            "SELECT id::varchar FROM meuml.modules m WHERE price=0")
        modules_data = ','.join([str(module['id']) for module in modules_data])

        for i, account in enumerate(accounts):
            ml_api = MercadoLibreApi(access_token=account['access_token'])
            try:
                response_items = ml_api.get(
                    f"/users/{account['id']}/items/search",
                    params={'search_type': 'scan'}
                )

                response_items = response_items.json()
                account['total_advertisings'] = response_items['paging']['total']

            except Exception:
                pass

            account['platform'] = 'ML'
            account['internal_status'] = account.pop('status', None)

            if not account.get('shipping_modes'):
                account['shipping_modes'] = []
            if 'me2' in account['shipping_modes']:
                account['shipping_modes'] = ['me2']

            account_tags = account['tags'] if account['tags'] is not None else []

            if 'mshops' in account_tags:
                if account['internal_tags'] is not None:
                    account['internal_tags'].append('mshops')
                else:
                    account['internal_tags'] = ['mshops']

            account['permissions'] = {}
            account['permissions']['package_id'] = account.pop(
                'package_id', None)
            if account['permissions']['package_id'] is not None:
                account['permissions']['package_id'] = list(set(
                    [int(package_id) for package_id in account['permissions']['package_id'].split(',')]))

            account['permissions']['modules_id'] = []

            account_modules = [modules_data]
            if account['modules']:
                account_modules.append(account['modules'])
            if account['package_modules']:
                account_modules.append(account['package_modules'])
            if len(account_modules) > 0:
                modules = ','.join(account_modules)
                modules = list(set([int(module)
                               for module in modules.split(',')]))
                modules = ','.join([str(module) for module in modules])
            account.pop('modules', None)
            account.pop('package_modules', None)

            account['permissions']['modules_id'] = modules
            if account['permissions']['modules_id'] is not None:
                account['permissions']['modules_id'] = list(set(
                    [int(module_id) for module_id in account['permissions']['modules_id'].split(',')]))

            accounts[i] = account

        query = """
           SELECT DISTINCT
                string_agg(su.package_id::varchar,',' ORDER BY su.package_id) as package_id,
                string_agg(su.modules::varchar,',' ORDER BY su.modules) as modules,
                string_agg(pm.module_id::varchar,',' ORDER BY pm.module_id ) as package_modules,
           			ac.id, ac.user_id, ac.date_created, ac.date_modified, ac.access_token, ac.access_token_expires_in,
                    ac.refresh_token, ac.refresh_token_expires_in, ac.shop_name, ac.country, ac.shop_description,
                    ac.videos, ac.images, ac.disable_make_offer, ac.enable_display_unitno, ac.item_limit, ac.status,
                    ac.installment_status, ac.sip_a_shops, ac.is_cb, ac.non_pre_order_dts, ac.auth_time, ac.expire_time,
                    ac.internal_status, 'SP' as platform, ac.name,
                    wh.id as warehouse_id, wh.code as warehouse_code, wh."name" as warehouse_name
            FROM shopee.accounts ac
            LEFT JOIN meuml.subscription_accounts sa ON sa.account_id = ac.id
            LEFT JOIN meuml.subscriptions su ON sa.subscription_id = su.id AND su.expiration_date > NOW() AND su.user_id = ac.user_id
            LEFT JOIN meuml.package_modules pm on pm.package_id = su.package_id
            LEFT JOIN stock.marketplaces mp on mp.abbreviation = 'SP'
            LEFT JOIN stock.account_warehouse aw on aw.marketplace_id = mp.id and aw.account_id = ac.id
            LEFT JOIN stock.warehouses wh on wh.id = aw.warehouse_id
            WHERE ac.user_id = :user_id
            GROUP BY ac.id, wh.id
        """
        shopee_accounts = self.fetchall(query, {'user_id': self.user['id']})

        shopee_advertisings_count = self.fetchall(
            "SELECT ac.id as account, count(ad.*) as total FROM shopee.advertisings ad RIGHT JOIN shopee.accounts ac ON ad.account_id = ac.id WHERE ac.user_id=:user_id GROUP BY ac.id",
            {'user_id': self.user['id']})
        shopee_advertisings_count = {
            str(row['account']): row['total'] for row in shopee_advertisings_count}

        for account in shopee_accounts:
            account['total_advertisings'] = shopee_advertisings_count[str(
                account['id'])]
            account['total_orders'] = 0

            account['permissions'] = {}
            account['permissions']['package_id'] = account.pop(
                'package_id', None)
            if account['permissions']['package_id'] is not None:
                account['permissions']['package_id'] = list(set(
                    [int(package_id) for package_id in account['permissions']['package_id'].split(',')]))

            account['permissions']['modules_id'] = []

            account_modules = [modules_data]
            if account['modules']:
                account_modules.append(account['modules'])
            if account['package_modules']:
                account_modules.append(account['package_modules'])
            if len(account_modules) > 0:
                modules = ','.join(account_modules)
                modules = list(set([int(module)
                               for module in modules.split(',')]))
                modules = ','.join([str(module) for module in modules])
            account.pop('modules', None)
            account.pop('package_modules', None)

            account['permissions']['modules_id'] = modules
            if account['permissions']['modules_id'] is not None:
                account['permissions']['modules_id'] = list(set(
                    [int(module_id) for module_id in account['permissions']['modules_id'].split(',')]))

        accounts = accounts+shopee_accounts

        return self.return_success(data=accounts, meta={
            'total': len(accounts)
        })

    @jwt_required
    @prepare
    def subscripted_accounts(self):
        query = """
            SELECT ac.*
            FROM meuml.accounts ac
            JOIN meuml.subscription_accounts sa ON sa.account_id = ac.id
            JOIN meuml.subscriptions su ON sa.subscription_id = su.id
            WHERE su.expiration_date > :now AND su.user_id = :user_id
        """
        values = {'user_id': self.user['id'], 'now': datetime.datetime.now()}

        accounts = self.fetchall(query, values)

        for account in accounts:
            if account.get('external_data') is None:
                account['external_data'] = {}
                account['external_data']['name'] = ''
                account['external_data']['email'] = ''
                account['external_data']['thumbnail'] = None

        return self.return_success(data=accounts, meta={
            'total': len(accounts)
        })

    @jwt_required
    @prepare
    def new_account(self):
        self.validate(OAuthSchema())

        code = self.data['code']

        if code is None:
            raise AccountsActionsException(
                "Impossível adicionar uma conta do mercado livre sem o atrribute code válido")

        oauth = OAuth2()

        try:
            oauth.generate_token(code)
        except Exception as e:
            self.abort_json({
                'message': f'Erro ao adicionar conta: {str(e)}',
                'status': 'error',
            }, 404)

        try:
            access_token = oauth.get_auth_token()
            ml_api = MercadoLibreApi(access_token=access_token)
            response = ml_api.get('/users/me')

            if response.status_code != 200:
                raise

            response = response.json()

            response_shipping_preferences = ml_api.get(
                f'/users/{response["id"]}/shipping_preferences')
            status_code = response_shipping_preferences.status_code

            if status_code == 200:
                response_shipping_preferences = response_shipping_preferences.json()
                response["shipping_modes"] = response_shipping_preferences['modes']

        except Exception as e:
            print(e)
            self.abort_json({
                'message': f'Impossível gerar o access token .',
                'status': 'error',
            }, 401)

        external_id = str(response['id'])
        external_nickname = response['nickname']
        external_registration_date = datetime.datetime.strptime(
            response['registration_date'].split('.')[0], '%Y-%m-%dT%H:%M:%S')
        external_email = response['email']
        external_permalink = response['permalink']

        now = pendulum.now()

        query = 'select * FROM meuml.accounts where id = :id and user_id is not null'

        values = {
            'id': external_id
        }

        account = self.fetchone(query, values)

        message = f"Conta {external_nickname}<{external_email}> adicionada com sucesso"
        if account is not None:
            if account['user_id'] != self.user['id']:
                from_user = self.fetchone("SELECT email FROM meuml.users WHERE id=:id", {
                                          'id': account['user_id']})
                message += f". Transferida de {from_user['email']}"
            else:
                message += ". Autenticação com o Mercado Livre renovada"

        query = 'select * FROM meuml.accounts where id = :id'
        values = {
            'id': external_id
        }

        account = self.fetchone(query, values)

        try:
            response_items = ml_api.get(f'/users/{external_id}/items/search', params={
                'search_type': 'scan'
            })

            if response_items.status_code != 200:
                raise

            response_items = response_items.json()

        except Exception as e:
            print(e)
            self.abort_json({
                'message': f'Impossível gerar o access token .',
                'status': 'error',
            }, 401)

        total_advertisings = response_items['paging']['total']

        total_orders = response['seller_reputation']['transactions']['total']

        flex_account_response = ml_api.get(
            f'/shipping/flex/sites/MLB/users/{external_id}/subscriptions/v1'
        )
        status_code = flex_account_response.status_code

        if status_code == 200:
            data = flex_account_response.json()
            has_flex_signature = next((signature for signature in data if signature['mode'] == 'FLEX' and signature['status']['id'] == 'in'), None)

            if has_flex_signature:
                internal_tags = response.get('internal_tags')
                if internal_tags is None:
                    internal_tags = ["meuml_tag_flex"]
                else:
                    internal_tags.append("meuml_tag_flex")
                response["internal_tags"] = internal_tags

        if account is not None:
            fields = ['user_id', 'external_name', 'name', 'access_token', 'access_token_created_at',
                      'access_token_expires_at', 'external_data', 'total_orders', 'total_advertisings',
                      'external_nickname', 'external_registration_date', 'external_email', 'external_permalink', 'refresh_token', 'status']

            sets = [f'{x} = :{x}' for x in fields]
            sets_str = ', '.join(sets)

            query_update = f'UPDATE meuml.accounts set {sets_str} where id = :id'
            update_values = {
                'id': external_id,
                'user_id': self.user['id'],
                'external_name': external_nickname,
                'name': external_nickname,
                'access_token': oauth.get_auth_token(),
                'access_token_created_at': now,
                'access_token_expires_at': now.add(seconds=oauth.get_expires_in()),
                'external_data': json.dumps(response),
                'external_nickname': external_nickname,
                'external_registration_date': external_registration_date,
                'external_email': external_email,
                'external_permalink': external_permalink,
                'refresh_token': oauth.refresh_token,
                'status': 1
            }

            update_values['total_orders'] = total_orders
            update_values['total_advertisings'] = total_advertisings

            self.execute(query_update, update_values)

        else:

            fields = ['id', 'refresh_token', 'user_id', 'external_name', 'name', 'access_token', 'access_token_created_at', 'access_token_expires_at', 'external_data',
                      'total_orders', 'total_advertisings', 'external_nickname', 'external_registration_date', 'external_email', 'external_permalink', 'status']
            fields_str = ', '.join(fields)
            fields_v_str = ', :'.join(fields)
            insert_account = f'insert into meuml.accounts ({fields_str}) VALUES '
            insert_account += f' (:{fields_v_str})'

            insert_values = {
                'id': external_id,
                'user_id': self.user['id'],
                'external_name': external_nickname,
                'name': external_nickname,
                'access_token': oauth.get_auth_token(),
                'access_token_created_at': now,
                'access_token_expires_at': now.add(seconds=oauth.get_expires_in()),
                'external_data': json.dumps(response),
                'external_nickname': external_nickname,
                'external_registration_date': external_registration_date,
                'external_email': external_email,
                'external_permalink': external_permalink,
                'refresh_token': oauth.refresh_token,
                'status': 1
            }

            insert_values['total_orders'] = total_orders
            insert_values['total_advertisings'] = total_advertisings

            try:
                self.execute(insert_account, insert_values)
            except Exception as e:
                print(e)
                self.abort_json({
                    'message': f'Erro ao salvar conta',
                    'status': 'error',
                }, 409)

        query = "SELECT account_id FROM meuml.account_visits WHERE account_id = %s"
        has_history = self.fetchone(query, (external_id,))

        if not has_history:
            response = ml_api.get(
                f'/users/{external_id}/items_visits/time_window?last=30&unit=day')

            if response.status_code == 200:
                results = response.json().get('results', [])
                query = 'INSERT INTO meuml.account_visits (account_id, visits_at, visits) VALUES (%s, %s, %s)'

                for result in results:
                    values = (
                        external_id,
                        result['date'][:10],
                        result['total'],
                    )
                    try:
                        self.execute(query, values)
                    except Exception as e:
                        print(e)

        blacklist_import_all = queue.signature(
            'long_running:blacklist_import_all')
        # blacklist_import_all.delay(account_id=external_id)

        # self.create_table_advertisings(external_id)

        advertising_import_all = queue.signature(
            'long_running:advertising_import_all')
        advertising_import_all.delay(account_id=external_id, new_account=True)

        mshops_advertising_import_all = queue.signature(
            'long_running:mshops_advertising_import_all')
        # mshops_advertising_import_all.delay(
        #     account_id=external_id, new_account=True)

        order_import_all = queue.signature('long_running:order_import_all')
        order_import_all.delay(
            account_id=account['id'], only_recent_orders=True)

        return self.return_success(message, {"account_id": external_id})

    @jwt_required
    @prepare
    def search_account(self):
        accounts_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND status = 1
        """
        ml_accounts = self.fetchall(
            accounts_query, {'user_id': self.user['id']})
        accounts_token = [self.refresh_token(
            account, platform="ML") for account in ml_accounts]
        accounts_token = [token for token in accounts_token if token]

        if len(accounts_token) == 0:
            self.abort_json({
                'message': f'É necessário possuir uma conta do Mercado Livre autenticada para continuar.',
                'status': 'error',
            }, 403)

        ml_api = MercadoLibreApi(
            access_token=accounts_token[0]['access_token'])

        user = {}

        # Encontra ID do usuário caso apenas Apelido tenha sido fornecido
        if 'id' not in request.args and 'nickname' in request.args:
            try:
                response = ml_api.get(
                    f'/sites/MLB/search?nickname={request.args["nickname"]}').json()
            except:
                self.abort_json({
                    'message': f'Usuário não encontrado através do Apelido.',
                    'status': 'error',
                }, 401)

            if 'seller' in response:
                user['id'] = response['seller']['id']

        # Coleta informações públicas do Usuário através do ID
        if 'id' in request.args or 'id' in user:
            user['id'] = request.args["id"] if 'id' in request.args else user['id']

            try:
                response = ml_api.get(f'/users/{user["id"]}').json()
            except:
                self.abort_json({
                    'message': f'Usuário não encontrado através do ID.',
                    'status': 'error',
                }, 401)

            if 'id' in response:
                user['name'] = response.get('nickname')
                user['external_name'] = response.get('nickname')
                user['external_nickname'] = response.get('nickname')
                user['external_registration_date'] = datetime.datetime.strptime(
                    response.get('registration_date').split('.')[0], '%Y-%m-%dT%H:%M:%S')
                user['external_permalink'] = response.get('permalink')
                user['external_data'] = json.dumps(response)
                user['total_orders'] = response['seller_reputation']['transactions']['total'] if response.get(
                    'seller_reputation') else None

        # Caso usuário foi encontrado, salva dados no banco
        if user.get('external_name') is not None:
            query = 'select * FROM meuml.accounts where id = :id and user_id is null'
            values = {
                'id': user['id']
            }
            account = self.fetchone(query, values)

            if account is None:
                fields_str = ', '.join(user.keys())
                fields_v_str = ', :'.join(user.keys())
                insert_query = f'insert into meuml.accounts ({fields_str}) VALUES '
                insert_query += f' (:{fields_v_str})'

                try:
                    self.execute(insert_query, user)
                except Exception as e:
                    print(e)
                    self.abort_json({
                        'message': f'Erro ao salvar conta',
                        'status': 'error',
                    }, 409)
                return self.return_success("Conta salva com sucesso.", {'account': user})

            else:
                sets = [f'{x} = :{x}' for x in user.keys()]
                sets_str = ', '.join(sets)
                update_query = f'UPDATE meuml.accounts set {sets_str} where id = :id'

                try:
                    self.execute(update_query, user)
                except Exception as e:
                    print(e)
                    self.abort_json({
                        'message': f'Erro ao atualizar conta',
                        'status': 'error',
                    }, 409)
                return self.return_success("Conta atualizada com sucesso.", {'account': user})
        else:
            self.abort_json({
                'message': f'Usuário não encontrado.',
                'status': 'error',
            }, 401)

    @jwt_required
    @prepare
    def search_user_info(self):
        accounts_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND status = 1
        """
        ml_accounts = self.fetchall(
            accounts_query, {'user_id': self.user['id']})
        accounts_token = [self.refresh_token(
            account, platform="ML") for account in ml_accounts]
        accounts_token = [token for token in accounts_token if token]

        if len(accounts_token) == 0:
            self.abort_json({
                'message': f'É necessário possuir uma conta do Mercado Livre autenticada para continuar.',
                'status': 'error',
            }, 403)

        ml_api = MercadoLibreApi(
            access_token=accounts_token[0]['access_token']
        )

        user = {}

        # Encontra ID do usuário caso apenas Apelido tenha sido fornecido
        if 'nickname' in request.args:
            try:
                response = ml_api.get(
                    f'/sites/MLB/search?nickname={request.args["nickname"]}'
                ).json()

            except:
                self.abort_json({
                    'message': f'Usuário não encontrado através do Apelido.',
                    'status': 'error',
                }, 401)

            if 'seller' in response:
                user['id'] = response['seller']['id']
            else:
                try:
                    response = requests.get(
                        f'https://www.mercadolivre.com.br/perfil/{request.args["nickname"]}'
                    )

                    user['id'] = response.text.partition(
                        'user_id'
                    )[2].split(':')[1].split(',')[0]
                except:
                    self.abort_json({
                        'message': f'Usuário não encontrado através do Apelido.',
                        'status': 'error',
                    }, 401)

            # Coleta informações públicas do Usuário através do ID
            try:
                response = ml_api.get(f'/users/{user["id"]}').json()
            except:
                self.abort_json({
                    'message': f'Usuário não encontrado através do ID.',
                    'status': 'error',
                }, 401)

            return self.return_success(data=response)

        else:
            self.abort_json({
                'message': f'Usuário não encontrado.',
                'status': 'error',
            }, 401)

    @jwt_required
    @prepare
    def get_accounts_official_stores(self):
        ml_accounts_ids = request.args.get('accounts_ids', None)
        ml_accounts_ids = ml_accounts_ids.split(',')

        all_account_official_stores = []

        for ml_account_id in ml_accounts_ids:
            account_official_stores = {'account_id': ml_account_id, 'official_stores': []}

            query = """
                SELECT id, access_token, access_token_expires_at, refresh_token
                FROM meuml.accounts
                WHERE id=:id AND status = 1
            """
            ml_account = self.fetchone(query, {'id': ml_account_id})
            account_token = ml_account['access_token']

            ml_api = MercadoLibreApi(access_token=account_token)

            try:
                response = ml_api.get(
                    f"/users/{ml_account_id}/brands",
                    params={'search_type': 'scan'}
                )

                if response.status_code != 200:
                    all_account_official_stores.append(account_official_stores)
                    continue

                response = response.json()

                response_official_stores = response.get('brands', [])

                for official_store in response_official_stores:
                    official_store_data = {
                        'id': official_store.get('official_store_id', None),
                        'name': official_store.get('name')
                    }

                    account_official_stores['official_stores'].append(official_store_data)

                all_account_official_stores.append(account_official_stores)

            except Exception:
                pass
        
        return self.return_success(data=all_account_official_stores)