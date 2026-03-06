import json
import math
import requests
import os
import inspect
import re
import random
import string
from math import floor, ceil
from typing import Any
from marshmallow.schema import Schema
from marshmallow import ValidationError
from flask import request, abort, make_response, jsonify
from requests_oauthlib import OAuth2Session

# import cx_Oracle
import psycopg2
try:
    from flask import _app_ctx_stack as ctx_stack
except ImportError:  # pragma: no cover
    from flask import _request_ctx_stack as ctx_stack

from libs.exceptions.exceptions import ActionsException
from libs.database.model import Model
from libs.database.types import Type
from libs.payments.payment_helper import user_subscripted_accounts
from datetime import timedelta, datetime
from libs.schema.auth_schema import LoginSchema
from libs.shopee_api.shopee_api import ShopeeApi
from libs.database.database_postgres import connection
from libs.push.push_notifications import send_notification
from libs.whatsapp_api.whatapp_api import WhatsappApi


class Actions(object):

    def __init__(self):
        self = ctx_stack

    def id_generator(self, size=8, chars=string.ascii_uppercase + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))

    def db_session(self, model: Model) -> Model:

        model = model()
        model.__cursor__ = self.cursor
        return model

    def validate_account(self, account):
        if account is None:
            return False

        if account['status'] == 0:
            return False

        if self.refresh_token(account) is False:
            return False

        return True

    def validate_account_or_abort(self, account):
        if account is None:
            self.abort_json({
                'message': f'Não autorizado',
                'status': 'error',
            }, 401)

        if account['status'] == 0:
            self.abort_json({
                'message': f"Não foi possível renovar o token de acesso da conta {account['name']}, por favor exclua e adicione novamente esta conta",
                'status': 'error',
            }, 400)

        if self.refresh_token(account) is False:
            self.abort_json({
                'message': f"Não foi possível renovar o token de acesso da conta {account['name']}, por favor exclua e adicione novamente esta conta",
                'status': 'error',
            }, 400)

    def get_cursor(self):
        cursor = None

        for attempt in range(3):
            try:
                if self.conn is None or self.conn.closed == 1:
                    self.conn = connection(port=os.getenv('PG_DB_DIRECT_PORT'))
                cursor = self.conn.cursor()
            except Exception as e:
                print(e)
            else:
                break

        return cursor

    def execute(self, query: str, values={}, commit=True, use_Oracle=False):
        query = self.parse_query_dictionary(query, values)
        cursor = self.get_cursor()

        for attempt in range(3):
            try:
                if not values:
                    cursor.execute(query)
                else:
                    cursor.execute(query, values)
            except Exception as e:
                print(e)
                try:
                    self.conn.rollback()
                except Exception:
                    pass
            else:
                cursor.close()
                break

    def execute_insert(self, query: str, values: dict = {}, commit=True, use_Oracle=False):
        query = self.parse_query_dictionary(query, values)
        cursor = self.get_cursor()

        for attempt in range(3):
            try:
                if not values:
                    cursor.execute(query)
                else:
                    cursor.execute(query, values)
            except Exception as e:
                print(e)
                try:
                    self.conn.rollback()
                except Exception:
                    pass
            else:
                break

        try:
            id = cursor.fetchone()[0]
        except:
            id = None
        finally:
            cursor.close()

        return id

    def execute_returning(self, query: str, values: dict = {}, returning_type='number', commit=True, use_Oracle=False, raise_exception=False):
        query = self.parse_query_dictionary(query, values)
        cursor = self.get_cursor()
        returned_value = None

        try:
            if not values:
                cursor.execute(query)
            else:
                cursor.execute(query, values)

            returned_value = cursor.fetchone()
            if returned_value is not None:
                returned_value = returned_value[0]
        except Exception as e:
            print(e)
            if raise_exception:
                raise
            else:
                try:
                    self.conn.rollback()
                except Exception:
                    pass
        finally:
            cursor.close()

        return returned_value

    def fetchone(self, query: str, values={}, use_Oracle=False):
        query = self.parse_query_dictionary(query, values)
        cursor = self.get_cursor()
        data = None

        for attempt in range(3):
            try:
                cursor.execute(query, values)
                data = cursor.fetchone()
            except Exception as e:
                print(e)
                data = None
            else:
                break

        if data is None:
            return None

        try:
            column_names = list(map(lambda x: x.lower(), [
                d[0] for d in cursor.description]))

            new_dict = {}
            for i, field in enumerate(data):
                new_dict[column_names[i].lower()] = field
            data = new_dict
        except:
            pass
        finally:
            cursor.close()

        if data is None or len(data) == 0:
            return None

        return data

    def fetchall(self, query: str, values={}, use_Oracle=False):
        query = self.parse_query_dictionary(query, values)
        
        cursor = self.get_cursor()
        data = []

        for attempt in range(3):
            try:
                cursor.execute(query, values)
                data = cursor.fetchall()
            except Exception as e:
                data = []
            else:
                break

        if data is None or len(data) == 0:
            return []

        try:
            columns = [i[0] for i in cursor.description]
            results = []

            for row in data:
                new_dict = {}
                c = 0
                for field in row:
                    new_dict[columns[c].lower()] = field
                    c += 1
                results.append(new_dict)
        except Exception as e:
            print(e)
        finally:
            cursor.close()

        return results

    # def refresh_token(self, refresh_token ):

    #     url = 'https://api.mercadolibre.com/oauth/token?grant_type=refresh_token'
    #     url += '&client_id=' + os.getenv('CLIENT_ID')
    #     url += '&client_secret=' + os.getenv('CLIENT_SECRET')
    #     url += '&refresh_token=' + refresh_token

    #     response = requests.post(url)

    #     if response.status_code == 400:
    #         query = 'update meuml.accounts SET status = :expired_status WHERE id = :id'
    #         self.execute(query, {'expired_status': 0, 'id': account['id']})
    #         raise Exception('Houve um erro ou requerir a chave de autenticação: ' + json.dumps(response.json()))
    #     elif response.status_code != 400 and response.status_code != 200:
    #         query = 'update meuml.accounts SET status = :expired_status WHERE id = :id'
    #         self.execute(query, {'expired_status': 0, 'id': account['id']})
    #         raise Exception('Houve um erro inesperado ao requerir a chave de autenticação.')

    #     return response.json()

    def refresh_token(self, account, force=False, platform="ML"):
        if account is None:
            return None

        if platform == "ML":
            return self.refresh_token_mercadolibre(account, force)
        elif platform == "SP":
            return self.refresh_token_shopee(account, force)

    def refresh_token_shopee(self, account, force=False):

        if 'access_token_expires_in' not in account:
            return False

        expires_in: int = (
            account['access_token_expires_in'] - datetime.now()).total_seconds()

        token = {
            'expires_in': expires_in,
            'access_token': account['access_token'],
            'refresh_token': account['refresh_token'],
            'token_type': 'Bearer',
            'account_id': account['id'],
        }

        if expires_in > 3600 and force != True:
            print('Access Token still valid, not refreshing...')
            return token
        else:
            sp_api = ShopeeApi(account['access_token'],
                               account['access_token_expires_in'],)
            values = sp_api.get_refresh_token(
                account['id'], account['refresh_token'], account['refresh_token_expires_in'], self)

            if not values:
                return False

            token['expires_in'] = (
                values['access_token_expires_in'] - datetime.now()).total_seconds()
            token['access_token'] = values['access_token']
            token['refresh_token'] = values['refresh_token']

            return token

    def refresh_token_mercadolibre(self, account, force=False):

        now = datetime.now()

        expires_in: int = 0

        if 'access_token_expires_at' in account:
            if account['access_token_expires_at'] is not None:
                if type(account['access_token_expires_at']) == str:
                    access_token_expires_at = datetime.strptime(
                        account['access_token_expires_at'], '%Y-%m-%dT%H:%M:%S')
                else:
                    access_token_expires_at = account['access_token_expires_at']
                expires_in: int = (
                    access_token_expires_at - now).total_seconds()

        token = {
            'expires_in': expires_in,
            'access_token': account['access_token'],
            'refresh_token': account['refresh_token'],
            'token_type': 'Bearer',
        }

        if expires_in > 3600 and force != True:
            #print('not expired')
            print('Access Token still valid, not refreshing...')
            return token

        oauth_agent = OAuth2Session(
            client_id=os.getenv('CLIENT_ID'),
            redirect_uri=os.getenv('CALLBACK_URL'),
            token=token,
        )

        try:
            req = requests.post(os.getenv('TOKEN_URL') + '?grant_type=refresh_token&client_id=' + os.getenv(
                'CLIENT_ID') + '&client_secret=' + os.getenv('CLIENT_SECRET') + '&&refresh_token=' + account['refresh_token'])
            new_token = req.json()

            if req.status_code == 403:
                req = requests.post(os.getenv('TOKEN_URL') + '?grant_type=refresh_token&client_id=' + os.getenv(
                    'CLIENT_ID') + '&client_secret=' + os.getenv('CLIENT_SECRET') + '&&refresh_token=' + account['refresh_token'])
                new_token = req.json()

            if req.status_code != 200:
                print('Token refresh response: ' + str(req.status_code))
                query = 'update meuml.accounts SET status = :expired_status WHERE id = :id'
                self.execute(query, {'expired_status': 0, 'id': account['id']})

                account = self.fetchone(
                    f"SELECT id, user_id, name FROM meuml.accounts WHERE id = {account['id']}")

                send_notification(str(account['user_id']), {'title': 'MeuML - conta do Mercado Livre perdeu autenticação', 'url': '/contas',
                                  'body': f'A conta {account["name"]} do Mercado Livre perdeu autenticação. Por favor, faça login e autorize novamente a integração com o MeuML'})

                WhatsappApi.send_text_message_to_user(
                    self,
                    account['user_id'],
                    account['id'],
                    'ML',
                    'whatsapp-auth',
                    'lost_authentication_ml',
                    account_name=account['name']
                )

                return False
        except Exception as e:
            print(e)
            query = 'update meuml.accounts SET status = :expired_status WHERE id = :id'
            self.execute(query, {'expired_status': 0, 'id': account['id']})

            account = self.fetchone(
                f"SELECT id, user_id, name FROM meuml.accounts WHERE id = {account['id']}")

            send_notification(str(account['user_id']), {'title': 'MeuML - conta do Mercado Livre perdeu autenticação', 'url': '/contas',
                              'body': f'A conta {account["name"]} do Mercado Livre perdeu autenticação. Por favor, faça login e autorize novamente a integração com o MeuML'})

            WhatsappApi.send_text_message_to_user(
                self,
                account['user_id'],
                account['id'],
                'ML',
                'whatsapp-auth',
                'lost_authentication_ml',
                account_name=account['name']
            )

            return False

        query = f'update meuml.accounts ' \
                f' set access_token = :access_token, ' \
                f' access_token_created_at = :access_token_created_at, ' \
                f' access_token_expires_at = :access_token_expires_at,' \
                f' refresh_token = :refresh_token where id = :id'

        values = {
            'access_token': new_token['access_token'],
            'access_token_created_at': now,
            'access_token_expires_at': now + timedelta(seconds=new_token['expires_in']),
            'refresh_token': new_token['refresh_token'],
            'id': account['id']
        }

        self.execute(query=query, values=values)

        return values

    def schema_decode(self, object):

        if type(object) == list:
            rs = []
            for item in object:
                rs.append(self.decode_object(item))
            return rs
        else:
            return self.decode_object(object)

    def isDevMode(self):
        self.logger.error(request.headers.get('DevMode'))
        return request.headers.get('DevMode') == '9fc6fc17ee99b8b94eb477094062fb91b8062ca1c460' and os.getenv('ENV') == 'Development'

    def decode_object(self, object: Type):
        dict_attr: dict = {}
        attributes = inspect.getmembers(
            object, lambda a: not(inspect.isroutine(a)))
        attrs: list = [a for a in attributes if not(
            a[0].startswith('__') and a[0].endswith('__'))]

        del attrs[0]

        for item in attrs:
            name = item[0]
            val = item[1]
            if isinstance(val, Type):
                val = val.value if val.value != '' else val.default
                if val == '__FALSE__|!':
                    val = None

            dict_attr[name] = val

        return dict_attr

    def parse_query_dictionary(self, query: str, values):
        if not values or isinstance(values, tuple):
            return query
        for key in values.keys():
            query = re.sub(rf':{key}(\b)', rf'%({key})s', query)
        return query

    def validate(self, schema: Schema):
        try:
            if schema is None:
                raise ActionsException(
                    'É necessário informar um Schema para validar a requisição.')

            if not request.is_json:
                return self.abort_json({
                    'message': f'Requisição post precisa conter o formato JSON',
                    'status': 'error'
                }, 422)
                
            try:
                json_data = request.get_json()
                
            except:
                return self.abort_json({
                    'message': f'Requisição post sem corpo json',
                    'status': 'error'
                }, 400)

            if isinstance(json_data, dict):
                data, errors = schema.load(json_data)
            else:
                data = []
                for obj in json_data:
                    objs, errors = schema.load(obj)
                    data.append(objs)

            self.data = data
        except ValidationError as err:
            self.abort_json(
                {'status': 'error', 'message': 'Campos Inválidos', 'data': err.messages})
        except Exception as e:
            self.abort_json({
                'message': f'Requisição post sem corpo json',
                'status': 'error',
                'details': str(e)
            }, 400)

    def return_success(self, message: str = 'NM', data: Any = {}, code: int = 200, meta=None):
        if 'data' in data:
            data = data['data']
        rs = {
            'status': 'success',
            'statusCode': code,
            'message': message,
            'data': data
        }

        rs['meta'] = meta

        return make_response(
            jsonify(rs),
            code
        )

    '''
        Aborta a requisição com a mensagem presente em body
    '''

    def abort_json(self, body: dict = None, code: int = 422):
        if body is None:
            abort(make_response(
                '{"erro": "Não foi possível identificar o erro"}', 500))
        else:
            body['statusCode'] = code
        body_json = jsonify(body)
        abort(make_response(body_json, code))

        return make_response(
            jsonify({
                'status': 'success',
                'message': 'Foram encontrados (' + str(meta['total']) + ') registros.',
                'data': data,
                'meta': meta
            }),
            code
        )

    def generate_meta(self, params, total):
        last_page = math.ceil(total / params['limit'])
        actual_page = math.ceil(params['offset'] / params['limit'])

        if actual_page == 0:
            actual_page = 1

        next_page = params['page'] + 1
        previous_page = actual_page - 1

        if previous_page < 1:
            previous_page = None

        meta = {
            'total': total,
            'offset': params['offset'],
            'limit': params['limit'],
            'pages': last_page + 1,
            'page': params['page'] + 1,
            'next_page': next_page + 1,
            'previous_page': params['page'],
            'last_page': last_page,
            'first_page': 1
        }
        return meta

    def paginate(self, request, query):
        values = {}
        values['page'] = int(request.args.get('page', 0))
        values['offset'] = int(request.args.get('offset', 0))
        values['limit'] = int(request.args.get('limit', 50))

        if 'page' in request.args:
            values['page'] = int(request.args['page']) - 1
            values['offset'] = values['page'] * values['limit']
            if values['offset'] < 0:
                values['offset'] = 0

        query += f' offset ' + \
            str(values['offset'])+' rows fetch next ' + \
            str(values['limit'])+' rows only'

        return values, query

    def order(self, request, fields, query, default_table='ad', join_tables=[], change_default_order=None):
        fields = [field if type(re.search('"(.*)"', field)) is type(None)
                  else re.search('"(.*)"', field).group(1) for field in fields]
        fields = [field[3:] if field[2] == '.' else field for field in fields]
        values = {}

        if 'sort_order' in request.args and request.args['sort_order'] == 'asc':
            values['sort_order'] = 'asc'
        else:
            values['sort_order'] = 'desc'

        if 'sort_name' in request.args and request.args['sort_name'] in fields:
            if request.args['sort_name'] == 'date_modified' and len(join_tables) > 0:
                query += f" ORDER BY least(coalesce({default_table}.date_modified, DATE 'infinity')"
                for table in join_tables:
                    query += f",coalesce({table}.date_modified, DATE 'infinity')"
                query += f") {values['sort_order']} "
            elif values['sort_order'] == 'asc':
                query += f" ORDER BY {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
            else:
                query += f" ORDER BY ({default_table}.{request.args['sort_name']} IS NULL), {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "

        else:
            if default_table == 'ad' and not change_default_order:
                query += f" ORDER BY CAST(REPLACE(ad.external_id, \'MLB\',\'\') AS bigint) {values['sort_order']} "
            elif change_default_order and change_default_order == 'quality':
                query += f" ORDER BY (case ad.status when 'active' then 1 when 'paused' then 2 when 'closed' then 3 else 4 end), ap.position asc "
            else:
                query += f" ORDER BY {default_table}.id {values['sort_order']} "

        return query

    def is_single_advertising(self, request, advertisings_id=None):
        is_single = False

        if not advertisings_id:
            advertisings_id = request.form.get('advertisings_id', '') if len(request.form.get(
                'advertisings_id', '')) > 0 else request.args.get('advertisings_id', '')

        advertisings_id = None if not advertisings_id else advertisings_id.split(
            ',')

        select_all = bool(int(request.args.get('select_all', 0)))

        if select_all is False and advertisings_id and len(advertisings_id) == 1:
            is_single = True

        return is_single

    def apply_filter(self, request, query='', values=None, additional_conditions=None, subscription_required=False, mass_operation=False, group_by=None, advertisings_id=None, platform="ML", module_id=None):
        if platform == "ML":
            return self.apply_filter_mercadolibre(request, query, values, additional_conditions, subscription_required, mass_operation, group_by, advertisings_id, module_id)
        else:
            return self.apply_filter_shopee(request, query, values, additional_conditions, subscription_required, mass_operation, group_by, advertisings_id)

    def apply_filter_shopee(self, request, query='', values=None, additional_conditions=None, subscription_required=False, mass_operation=False, group_by=None, advertisings_id=None):
        select_all = bool(int(request.args.get('select_all', 0)))
        total = 0
        accounts = []

        k = query.find('FROM')
        if k == -1:
            count_query = """
                SELECT count(distinct ad.id), ac.id
                FROM shopee.advertisings ad
                JOIN shopee.accounts ac ON ad.account_id = ac.id
                JOIN meuml.users u ON ac.user_id = u.id
                LEFT JOIN meuml.tagged_items ti ON ti.item_id = ad.id::varchar AND ti.type_id = 2
                LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id
            """
        else:
            count_query = 'SELECT count(distinct ad.id), ac.id ' + query[k:]

        if not values:
            filter_query = ' WHERE ac.user_id=:user_id AND ac.internal_status=1 '
            filter_values = {'user_id': self.user['id']}
        else:
            filter_query = ' WHERE ac.user_id=:user_id AND ac.internal_status=1 '
            filter_values = values

        if subscription_required:
            subscripted_accounts = user_subscripted_accounts(
                self, self.user['id'])
            if len(subscripted_accounts) == 0:
                total = 0
                return filter_values, query, total, accounts
            filter_query += f' AND ad.account_id IN ({",".join([str(acc) for acc in subscripted_accounts])}) '

        if not advertisings_id:
            advertisings_id = request.form.get('advertisings_id', []) if len(request.form.get(
                'advertisings_id', [])) > 0 else request.args.get('advertisings_id', [])

        if len(advertisings_id) > 0:
            if select_all is False:
                filter_query += f' AND ad.id IN ({advertisings_id}) '
            else:
                filter_query += f' AND ad.id NOT IN ({advertisings_id}) '
        # elif mass_operation:
        #     total = 0
        #     return filter_values, query, total, accounts

        if 'filter_string' in request.args:
            filter_query += ' AND (UPPER(ad.name) LIKE :filter_string '
            filter_values['filter_string'] = f'%%{request.args["filter_string"].upper()}%%'

            if not request.args["filter_string"].isdigit():
                filter_query += ') '
            else:
                filter_query += ' OR ad.id = :filter_string_id) '
                filter_values['filter_string_id'] = int(
                    request.args["filter_string"])

        if 'filter_account' in request.args:
            filter_query += ' AND ac.id IN ('

            accounts = request.args["filter_account"].split(',')
            for i, account in enumerate(accounts, 1):
                filter_values['filter_account'+str(i)] = int(account)
                filter_query += ':filter_account'+str(i)+','
            filter_query = filter_query[:-1] + ') '

        if 'status' in request.args:
            filter_query += ' AND ad.status IN ('
            d, query_list = self.string_to_dict(
                request.args['status'], 'status')
            filter_values.update(d)
            filter_query += query_list

        if 'condition' in request.args:
            filter_query += ' AND ad.condition IN ('
            d, query_list = self.string_to_dict(
                request.args['condition'], 'condition')
            filter_values.update(d)
            filter_query += query_list

        if 'stock' in request.args:
            filter_query += ' AND ad.stock > 0 '

        if 'has_free_shipping' in request.args and request.args['has_free_shipping']:
            if request.args['has_free_shipping'] == '0':
                filter_query += ' AND ad.logistics @> \'[{"is_free": false}]\' '
            elif request.args['has_free_shipping'] == '1':
                filter_query += ' AND ad.logistics @> \'[{"is_free": true}]\' '

        if 'meuml_tags' in request.args:
            filter_query += f""" AND {len(request.args["meuml_tags"].split(','))} = (
                SELECT COUNT(distinct ti2.tag_id)
                FROM meuml.tagged_items ti2
                WHERE ti2.tag_id IN ({request.args["meuml_tags"]}) AND ti2.item_id = ad.id
                GROUP BY ti2.item_id
            )
            """

        if additional_conditions:
            filter_query += additional_conditions

        try:
            if group_by:
                grouped_count = self.fetchall(
                    count_query + filter_query + f' GROUP BY ac.id, {group_by}', filter_values)
                filter_query += f' GROUP BY {group_by} '
            else:
                grouped_count = self.fetchall(
                    count_query + filter_query + ' GROUP BY ad.id, ac.id', filter_values)

            accounts = [account['id'] for account in grouped_count]
            total = sum([count['count'] for count in grouped_count])
        except Exception as e:
            print(e)

        query += filter_query

        return filter_values, query, total, accounts

    def apply_filter_mercadolibre(self, request, query='', values=None, additional_conditions=None, subscription_required=False, mass_operation=False, group_by=None, advertisings_id=None, module_id=None):
        select_all = bool(int(request.args.get('select_all', 0)))
        total = 0
        accounts = []

        k = query.rfind('FROM')
        if k == -1:
            count_query = """
                SELECT count(distinct ad.id), ac.id, ac.name FROM meuml.advertisings ad JOIN meuml.accounts ac ON ad.account_id = ac.id
                JOIN meuml.users u ON ac.user_id = u.id
                LEFT JOIN meuml.tagged_items ti ON ti.item_id = ad.external_id AND ti.type_id = 1
                LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id
            """
        else:
            count_query = 'SELECT count(distinct ad.id), ac.id, ac.name ' + \
                query[k:]

        if not values:
            filter_query = ' WHERE ac.user_id=:user_id AND ac.status=1 '
            filter_values = {'user_id': self.user['id']}
        else:
            filter_query = ' WHERE ac.user_id=:user_id AND ac.status=1 '
            filter_values = values

        if subscription_required:
            subscripted_accounts = user_subscripted_accounts(
                self, self.user['id'], module_id)
            if len(subscripted_accounts) == 0:
                total = 0
                return filter_values, query, total, accounts, {}
            filter_query += f' AND ad.account_id IN ({",".join([str(acc) for acc in subscripted_accounts])}) '

        if not advertisings_id:
            advertisings_id = request.form.get('advertisings_id', []) if len(request.form.get(
                'advertisings_id', [])) > 0 else request.args.get('advertisings_id', [])

        if len(advertisings_id) > 0:
            if select_all is False:
                filter_query += ' AND ad.external_id IN ('
                d, query_list = self.string_to_dict(
                    advertisings_id, 'advertising')
                filter_values.update(d)
                filter_query += query_list
            else:
                filter_query += ' AND ad.external_id NOT IN ('
                d, query_list = self.string_to_dict(
                    advertisings_id, 'advertising')
                filter_values.update(d)
                filter_query += query_list
        # elif mass_operation:
        #     total = 0
        #     return filter_values, query, total, accounts

        if 'filter_string' in request.args and request.args['filter_string']:
            keywords = request.args["filter_string"].split(',')

            for i, keyword in enumerate(keywords):
                filter_query += f' AND (UPPER(ad.title) LIKE :filter_string{i} '
                filter_query += f' OR ad.external_id LIKE :filter_string{i} '
                filter_query += f' OR UPPER(ad.sku) LIKE :filter_string{i} '
                filter_query += f' OR UPPER(ad.gtin) LIKE :filter_string{i}) '
                filter_values[f'filter_string{i}'] = f'%%{keyword.upper()}%%'

        if 'filter_account' in request.args:
            filter_query += ' AND ac.id IN ('

            accounts = request.args["filter_account"].split(',')
            for i, account in enumerate(accounts, 1):
                filter_values['filter_account'+str(i)] = int(account)
                filter_query += ':filter_account'+str(i)+','
            filter_query = filter_query[:-1] + ') '

        if 'status' in request.args:
            filter_query += ' AND ad.status IN ('
            d, query_list = self.string_to_dict(
                request.args['status'], 'status')
            filter_values.update(d)
            filter_query += query_list

        if 'free_shipping' in request.args:
            filter_query += ' AND ad.free_shipping IN ('
            d, query_list = self.string_to_dict(
                request.args['free_shipping'], 'free_shipping')
            filter_values.update(d)
            filter_query += query_list

        if 'filter_shipping_mode' in request.args and request.args['filter_shipping_mode']:
            filter_query += ' AND ad.shipping_mode IN ('
            d, query_list = self.string_to_dict(
                request.args['filter_shipping_mode'], 'filter_shipping_mode')
            filter_values.update(d)
            filter_query += query_list

        if 'advert_type' in request.args:
            filter_query += ' AND ad.listing_type_id IN ('
            d, query_list = self.string_to_dict(
                request.args['advert_type'], 'advert_type')
            filter_values.update(d)
            filter_query += query_list

        if 'condition' in request.args:
            filter_query += ' AND ad.condition IN ('
            d, query_list = self.string_to_dict(
                request.args['condition'], 'condition')
            filter_values.update(d)
            filter_query += query_list

        if 'filter_tags' in request.args:
            allowed_tags = ['catalog_boost', 'loyalty_discount_eligible', 'poor_quality_picture', 'good_quality_picture',
                            'poor_quality_thumbnail', 'good_quality_thumbnail', 'catalog_forewarning', 'catalog_product_candidate',
                            'best_price_eligible']
            tags = request.args["filter_tags"].lower().split(',')

            if 'loyalty_discount_applied' in tags:
                filter_query += ' AND ad.original_price IS NOT NULL '

            if 'loyalty_discount_eligible' in tags:
                filter_query += " AND (ad.tags LIKE '%%loyalty_discount_eligible%%' AND ad.original_price IS NULL) "
                tags.remove('loyalty_discount_eligible')

            if 'self_service_in' in tags:
                filter_query += " AND ad.shipping_tags LIKE '%%self_service_in%%' "
                tags.remove('self_service_in')

            if 'self_service_out' in tags:
                filter_query += " AND ad.shipping_tags LIKE '%%self_service_out%%' "
                tags.remove('self_service_out')

            filter_query += ' AND ('
            used_tag_filter = False
            for i, tag in enumerate(tags):
                if tag in allowed_tags:
                    filter_query += f' ad.tags LIKE :filter_tag{str(i)} OR '
                    filter_values['filter_tag'+str(i)] = f'%%{tag}%%'
                    used_tag_filter = True
            if used_tag_filter:
                filter_query = filter_query[:-3] + ')'
            else:
                filter_query = filter_query[:-5]

        if 'filter_catalog' in request.args:
            filter_query += ' AND ad.catalog_status = :catalog_status '
            filter_values['catalog_status'] = int(
                request.args['filter_catalog'])

        if 'position' in request.args:
            filter_query += ' AND ap.position <= :position '
            filter_values['position'] = int(request.args['position'])

            
        print('meuml tags - ', request.args.get('meuml_tags', ''))

        if len(request.args.get('meuml_tags', '')) > 0:
            print('adding query')
            filter_query += f""" AND {len(request.args["meuml_tags"].split(','))} = (
                SELECT COUNT(distinct ti2.tag_id)
                FROM meuml.tagged_items ti2
                WHERE ti2.tag_id IN ({request.args["meuml_tags"]}) AND ti2.item_id = ad.external_id
                GROUP BY ti2.item_id
            )
            """

        if 'filter_price_to_win' in request.args and len(request.args['filter_price_to_win']) > 0:
            filter_query += ' AND pw.status IN ('
            d, query_list = self.string_to_dict(
                request.args['filter_price_to_win'], 'filter_price_to_win')
            filter_values.update(d)
            filter_query += query_list

        promotions_filter = []
        if 'promotion_deal' in request.args and len(request.args['promotion_deal']) > 0:
            d, query_list = self.string_to_dict(
                request.args['promotion_deal'], 'promotion_deal')
            filter_values.update(d)

            promotions_filter.append(f""" EXISTS (
                    SELECT 1
                    FROM meuml.promotion_advertisings pa_deal
                    JOIN meuml.promotions pr_deal ON pr_deal.id = pa_deal.promotion_id
                    WHERE pa_deal.advertising_id = ad.external_id AND pr_deal.promotion_type_id = 1 AND pa_deal.status IN ({query_list}
                    LIMIT 1
                )
            """)

        if 'promotion_marketplace_campaign' in request.args and len(request.args['promotion_marketplace_campaign']) > 0:
            d, query_list = self.string_to_dict(
                request.args['promotion_marketplace_campaign'], 'promotion_marketplace_campaign')
            filter_values.update(d)

            promotions_filter.append(f""" EXISTS (
                    SELECT 1
                    FROM meuml.promotion_advertisings pa_campaign
                    JOIN meuml.promotions pr_campaign ON pr_campaign.id = pa_campaign.promotion_id
                    WHERE pa_campaign.advertising_id = ad.external_id AND pr_campaign.promotion_type_id = 2 AND pa_campaign.status IN ({query_list}
                    LIMIT 1
                )
            """)

        if 'promotion_dod' in request.args and len(request.args['promotion_dod']) > 0:
            d, query_list = self.string_to_dict(
                request.args['promotion_dod'], 'promotion_dod')
            filter_values.update(d)

            promotions_filter.append(f""" EXISTS (
                    SELECT 1
                    FROM meuml.promotion_advertisings pa_dod
                    JOIN meuml.promotions pr_dod ON pr_dod.id = pa_dod.promotion_id
                    WHERE pa_dod.advertising_id = ad.external_id AND pr_dod.promotion_type_id = 3 AND pa_dod.status IN ({query_list}
                    LIMIT 1
                )
            """)

        if 'promotion_lightning' in request.args and len(request.args['promotion_lightning']) > 0:
            d, query_list = self.string_to_dict(
                request.args['promotion_lightning'], 'promotion_lightning')
            filter_values.update(d)

            promotions_filter.append(f""" EXISTS (
                    SELECT 1
                    FROM meuml.promotion_advertisings pa_lightning
                    JOIN meuml.promotions pr_lightning ON pr_lightning.id = pa_lightning.promotion_id
                    WHERE pa_lightning.advertising_id = ad.external_id AND pr_lightning.promotion_type_id = 4 AND pa_lightning.status IN ({query_list}
                    LIMIT 1
                )
            """)

        if 'promotion_volume' in request.args and len(request.args['promotion_volume']) > 0:
            d, query_list = self.string_to_dict(
                request.args['promotion_volume'], 'promotion_volume')
            filter_values.update(d)

            promotions_filter.append(f""" EXISTS (
                    SELECT 1
                    FROM meuml.promotion_advertisings pa_volume
                    JOIN meuml.promotions pr_volume ON pr_volume.id = pa_volume.promotion_id
                    WHERE pa_volume.advertising_id = ad.external_id AND pr_volume.promotion_type_id = 6 AND pa_volume.status IN ({query_list}
                    LIMIT 1
                )
            """)

        if 'promotion_pre_negotiated' in request.args and len(request.args['promotion_pre_negotiated']) > 0:
            d, query_list = self.string_to_dict(
                request.args['promotion_pre_negotiated'], 'promotion_pre_negotiated')
            filter_values.update(d)

            promotions_filter.append(f""" EXISTS  (
                    SELECT 1
                    FROM meuml.promotion_advertisings pa_pre
                    JOIN meuml.promotions pr_pre ON pr_pre.id = pa_pre.promotion_id
                    WHERE pa_pre.advertising_id = ad.external_id AND pr_pre.promotion_type_id = 7 AND pa_pre.status IN ({query_list}
                    LIMIT 1
                )
            """)

        if len(promotions_filter) > 0:
            filter_query += f" AND ({' OR '.join(promotions_filter)}) "

        if additional_conditions:
            filter_query += additional_conditions

        try:
            if group_by:
                print('on filter - 22')
                grouped_count = self.fetchall(
                    count_query + filter_query + f' GROUP BY ac.id, {group_by}', filter_values)
                filter_query += f' GROUP BY {group_by} '
                print('on filter - 23')
            else:
                print('on filter - 24')
                grouped_count = self.fetchall(
                    count_query + filter_query + ' GROUP BY ad.id, ac.id', filter_values)
                print('on filter - 25')

            accounts = list(set([account['id'] for account in grouped_count]))
            total = sum([count['count'] for count in grouped_count])

            count_by_account = {}
            for row in grouped_count:
                if row['name'] in count_by_account:
                    count_by_account[row['name']] += row['count']
                else:
                    count_by_account[row['name']] = row['count']
            grouped_count = count_by_account

        except Exception as e:
            print('this exception here')
            print(e)

        query += filter_query

        return filter_values, query, total, accounts, grouped_count

    def string_to_dict(self, string, arg_name):
        if isinstance(string, str):
            items = string.split(',')
        else:
            items = string
        args = {}
        query = ''

        for i, item in enumerate(items):
            args[arg_name+str(i)] = item
            query += f':{arg_name}{str(i)},'
        query = query[:-1] + ') '

        return args, query

    def list_to_dict(self, arg_list, arg_name):
        items = arg_list
        args = {}
        query = ''

        for i, item in enumerate(items):
            args[arg_name+str(i)] = item
            query += f':{arg_name}{str(i)},'
        query = query[:-1] + ') '

        return args, query

    def create_process(self, account_id, tool_id, tool_price, items_total):
        query = 'insert into meuml.processes (' \
                'account_id, ' \
                'user_id,' \
                'tool_id,' \
                'tool_price,' \
                'items_total ' \
                ') values (' \
            ':account_id,' \
                ':user_id,' \
                ':tool_id,' \
                ':tool_price,' \
                ':items_total' \
                ') returning id'
        values = {
            'account_id': account_id,
            'user_id': self.user['id'],
            'tool_id': tool_id,
            'tool_price': tool_price,
            'items_total': items_total
        }

        return self.execute_insert(query, values)

    def get_tool(self, tool):
        query = """
            SELECT tl.*, mt.module_id, COALESCE(mt.access_type, 0) as access_type
            FROM meuml.tools tl
            LEFT JOIN meuml.module_tasks mt ON mt.tool_id = tl.id
            WHERE
        """
        if isinstance(tool, int):
            query += ' id = :id'
            values = {'id': tool}
        else:
            query += ' key = :key'
            values = {'key': tool}
        return self.fetchone(query, values)

    def check_mshop_tag(self, account_id):
        query = """
            SELECT external_data -> 'tags' AS tags FROM meuml.accounts WHERE id = :account_id
        """

        tags_query = self.fetchone(query, {"account_id": account_id})

        hasMshopTag = False

        for tag in tags_query['tags']:
            if "mshops" in tag:
                hasMshopTag = True

        return hasMshopTag
