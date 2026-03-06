# import cx_Oracle
import json
import math
import os
import settings
import subprocess
import sys
import time
from datetime import datetime
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access


class CategoriesActions(Actions):

    @jwt_required
    @prepare
    def categories(self):
        method = request.method

        if method == 'POST':
            try:
                process = subprocess.Popen([sys.executable, os.getenv('root_folder') + '/cron/ml_categories.py'],
                                           stdout=subprocess.PIPE,
                                           stderr=subprocess.STDOUT)

                return self.return_success('Sincronização de categorias do Mercado Livre iniciado com sucesso',{'PID': process.pid})
            except Exception:
                self.abort_json({
                    'message': f'Não foi possível iniciar a sincronização de categorias do Mercado Livre.',
                    'status': 'error',
                }, 400)

        elif method == 'GET':

            tool = self.get_tool('categories')
            code, message = verify_tool_access(action=self, user_id=self.user['id'], tool=tool, any_account=True)

            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            if 'page' not in request.args:
                page = 0
                
                if 'offset' in request.args:
                    offset = int(request.args['offset'])
                else:
                    offset = 0

                if 'limit' in request.args:
                    limit = int(request.args['limit'])
                else:
                    limit = 50
            else:
                limit = 50
                page = int(request.args['page'])
                page -= 1
                offset = int(page) * limit
                if offset < 0:
                    offset = 0

            ALLOWED_SORT_ORDERS = {'asc', 'desc'}
            if 'sortOrder' in request.args:
                sortOrder = str(request.args['sortOrder']).lower()
                if sortOrder not in ALLOWED_SORT_ORDERS:
                    sortOrder = 'asc'
            else:
                sortOrder = 'asc'

            fields = ['id', 'date_created', 'batch', 'path', 'name', 'external_id', 'has_shipping_data', 'has_children', 'height', 'weight', 'width', 'length', 'cubage', 'highest_dimension']
            if 'sortName' in request.args:
                sortName = str(request.args['sortName'])
                if sortName not in fields:
                    sortName = 'id'
            else:
                sortName = 'id'
            fields_str = ','.join(fields)
            query_str = 'SELECT ' + fields_str +'  FROM meuml.ml_categories WHERE '
            filter_values = {}

            if 'filter' in request.args:
                query_str += ' weight is not null and '

                query_str += " upper(path) LIKE upper(:filter_val) "
                filter_values = {'filter_val': f"%%{request.args['filter']}%%"}
                try:
                    total = self.fetchone("SELECT count(id) FROM meuml.ml_categories WHERE weight is not null and upper(path) LIKE upper(:filter_val)", filter_values)
                except Exception as e:
                    print(e)
            else:
                try:
                    total = self.fetchone('SELECT count(id) FROM meuml.ml_categories WHERE weight is not null ', {})
                except Exception as e:
                    print(e)

                query_str += ' weight is not null '

            if sortName == 'id':
                query_str += ' ORDER BY CAST(REPLACE(external_id, \'MLB\',\'\') AS bigint) ' + sortOrder
            else:
                query_str += ' ORDER BY ' + sortName + ' ' + sortOrder

            if sortName != 'id':
                query_str += ',id DESC'

            filter_values['offset'] = offset
            filter_values['limit'] = limit
            query_str += ' offset :offset rows fetch next :limit rows only'

            try:
                categories = self.fetchall(query_str, filter_values)
            except Exception as e:
                print(e)
                self.abort_json({
                    'message': f'Categoria Não foi possível localizar categorias.',
                    'status': 'error',
                }, 400)

            total = total['count']
            last_page = math.ceil(total / limit)

            actual_page = math.ceil(offset / limit)

            if actual_page == 0:
                actual_page = 1

            next_page = page + 1

            previous_page = actual_page - 1
            if previous_page < 1:
                previous_page = None

            meta = {
                'total': total,
                'offset': offset,
                'limit': limit,
                'pages': last_page + 1,
                'page': page + 1,
                'next_page': next_page + 1,
                'previous_page': page,
                'last_page': last_page + 1,
                'first_page': 1
            }

            c = 0
            for rs in categories:
                if categories[c]['height'] is not None and categories[c]['width'] is not None and categories[c]['length'] is not None:
                    categories[c]['cubage'] = str(categories[c]['height']) + 'cm X ' + str(categories[c]['width']) + 'cm X ' + str(categories[c]['length']) + 'cm'
                else:
                    categories[c]['cubage'] = ''

                if 'weight' in rs:
                    if categories[c]['weight'] is not None:
                        categories[c]['weight'] = str(categories[c]['weight'] / 1000) + 'kg' if categories[c]['weight'] > 0 else str(categories[c]['weight']) + 'g'
                    else:
                        categories[c]['weight'] = ''

                c+=1

            modTimesinceEpoc = os.path.getmtime(os.getenv('ROOT_FOLDER') + '/categoriesMLB')
            modificationTime = datetime.fromtimestamp(modTimesinceEpoc).strftime('%Y-%m-%d %H:%M:%S')
            meta['last_update'] = modificationTime

            return self.return_success(data=categories, meta=meta)


    @jwt_required
    @prepare
    def categories_tree(self):
        accounts_query  = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts 
            WHERE user_id = :user_id AND status = 1
        """
        ml_accounts = self.fetchall(accounts_query, {'user_id': self.user['id']})
        accounts_token = [self.refresh_token(account, platform="ML") for account in ml_accounts]
        accounts_token = [token for token in accounts_token if token]

        if len(accounts_token) == 0:
            self.abort_json({
                'message': f'É necessário possuir uma conta do Mercado Livre autenticada para continuar.',
                'status': 'error',
            }, 403)

        ml_api = MercadoLibreApi(access_token=accounts_token[0]['access_token'])
        data ={}

        if request.method == 'GET':
            response = ml_api.get('/sites/MLB/categories')
            if response.status_code == 200:
                data = response.json()
        else:
            category_id = request.args.get('category_id')
            response = ml_api.get(f'/categories/{category_id}')

            if response.status_code == 200:
                response_data = response.json()
                data['id'] = response_data.get('id')
                data['name'] = response_data.get('name')
                data['domain_id'] = response_data.get('settings', {}).get('catalog_domain')
                data['permalink'] = response_data['permalink'][:4]+'s'+response_data['permalink'][4:] if response_data.get('permalink') and response_data['permalink'][4] == ':' else response_data.get('permalink')
                data['thumbnail'] = response_data['picture'][:4]+'s'+response_data['picture'][4:] if response_data.get('picture') and response_data['picture'][4] == ':' else response_data.get('picture')
                data['total_items_in_this_category'] = response_data.get('total_items_in_this_category')
                data['path'] = response_data.get('path_from_root', [])
                data['children'] = response_data.get('children_categories', [])
                data['is_leaf'] = False if len(data['children']) > 0 else True
                
                if data['is_leaf']:
                    data['max_pictures_per_item'] = response_data.get('settings', {}).get('max_pictures_per_item')
                    data['max_pictures_per_item_var'] =  response_data.get('settings', {}).get('max_pictures_per_item_var')
                    data['minimum_price'] = response_data.get('settings', {}).get('minimum_price')
                    data['shipping_modes'] = response_data.get('settings', {}).get('shipping_modes',[])

                    # Trends
                    response = ml_api.get(f'/trends/MLB/{data["id"]}')
                    if response.status_code == 200:
                        response_data = response.json()
                        if response_data and isinstance(response_data, list) and len(response_data) > 0:
                            data['trends'] = [trend['keyword'] for trend in response_data]
                            data['trends'] = ', '.join(data['trends'])
                        else:
                            data['trends'] = ''
                    else:
                        print(response)

                    # Dimensions
                    response = ml_api.get(f'/categories/{data["id"]}/shipping')
                    if response.status_code == 200:
                        response_data = response.json()
                        if response_data and isinstance(response_data, dict):
                            response_data.pop('category_id', None)
                            data['dimensions'] = response_data
                        else:
                            data['dimensions'] = {
                                'width': None,
                                'height': None,
                                'length': None,
                                'weight': None
                            }
                    else:
                        print(response)

                    # Attributes
                    if request.args.get('include_attributes', '0') == '1':
                        response = ml_api.get(f'/categories/{data["id"]}/attributes')
                        if response.status_code == 200:
                            response_data = response.json()
                            if response_data and isinstance(response_data, list) and len(response_data) > 0:
                                data['attributes'] = response_data
                            else:
                                data['attributes'] = []
                        else:
                            print(response)
                    
                    # Attributes
                    if request.args.get('include_attributes', '0') == '1':
                        response = ml_api.get(f'/categories/{data["id"]}/sale_terms')
                        if response.status_code == 200:
                            response_data = response.json()
                            if response_data and isinstance(response_data, list) and len(response_data) > 0:
                                data['sales_terms'] = response_data
                            else:
                                data['sale_terms'] = []
                        else:
                            print(response)
                
        if len(data) == 0:
            self.abort_json({
                'message': f'Erro de comunicação com o Mercado Livre. Por favor, tente novamente',
                'status': 'error',
                'error': response.json()
            }, 502)

        return self.return_success(data=data)
    

    @jwt_required
    @prepare
    def category_predictor(self):
        accounts_query  = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts 
            WHERE user_id = :user_id AND status = 1
        """
        ml_accounts = self.fetchall(accounts_query, {'user_id': self.user['id']})
        accounts_token = [self.refresh_token(account, platform="ML") for account in ml_accounts]
        accounts_token = [token for token in accounts_token if token]

        if len(accounts_token) == 0:
            self.abort_json({
                'message': f'É necessário possuir uma conta do Mercado Livre autenticada para continuar.',
                'status': 'error',
            }, 403)

        ml_api = MercadoLibreApi(access_token=accounts_token[0]['access_token'])
        data = {}
        title = request.args.get('title')

        if not title or len(title) == 0:
            self.abort_json({
                'message': f'Preencha o título do anúncio',
                'status': 'error'
            }, 400)

        response = ml_api.get(f'/sites/MLB/domain_discovery/search?q={title}')
        if response.status_code == 200:
            data = response.json()

        return self.return_success(data=data)
