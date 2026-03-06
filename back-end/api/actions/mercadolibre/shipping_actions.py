from flask import request
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.enums.access_type import AccessType
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access
from libs.schema.shipping_schema import ShippingModificationTemplateSchema
from workers.loggers import create_process_item, create_process
from workers.tasks.mercadolibre.shipping_mercadoenvios_flex_set_item import shipping_mercadoenvios_flex_item


class ShippingActions(Actions):
    @jwt_required
    @prepare
    def adopt_mercadoenvios_flex(self):
        account_id = request.form.get('account_id')
        data = {
            'delivery_window': request.form.get('delivery_window'),
            'settings': [{
                'cutoff': {
                    'week': {
                        'value': int(request.form['cutoff_weekday']) if str(request.form.get('cutoff_weekday')).isdigit() else None,
                    },
                    'saturday': {
                        'value': int(request.form['cutoff_saturday']) if str(request.form.get('cutoff_saturday')).isdigit() else None,
                        'enabled': True if request.form.get('is_saturday_enabled') == '1' else False
                    },
                    'sunday': {
                        'value': int(request.form['cutoff_sunday']) if str(request.form.get('cutoff_sunday')).isdigit() else None,
                        'enabled': True if request.form.get('is_sunday_enabled') == '1' else False
                    }
                },
                'capacity': int(request.form['capacity']) if str(request.form.get('capacity')).isdigit() else None
            }]
        }

        if data['delivery_window'] not in ['same_day', 'next_day']:
            self.abort_json({
                'message': f"A janela de entrega deve ser same_day ou next_day.",
                'status': 'error',
            }, 400)
        
        if data['settings'][0]['capacity'] and data['settings'][0]['capacity'] not in [10, 20, 30, 40, 60, 60, 80, 100, 0]:
            self.abort_json({
                'message': f"A capacidade deve ser um valor da lista (10/20/30/40/60/80/100/0).",
                'status': 'error',
            }, 400)

        if data['delivery_window'] == 'next_day' and (not data['settings'][0]['cutoff']['week']['value'] \
            or data['settings'][0]['cutoff']['week']['value'] < 12 or data['settings'][0]['cutoff']['week']['value'] > 18):
            self.abort_json({
                'message': f"O horário limite em dias de semana deve estar entre 12 e 18.",
                'status': 'error',
            }, 400)

        if data['delivery_window'] == 'next_day' and  data['settings'][0]['cutoff']['saturday']['enabled'] and (not data['settings'][0]['cutoff']['saturday']['value'] \
            or data['settings'][0]['cutoff']['saturday']['value'] < 12 or data['settings'][0]['cutoff']['saturday']['value'] > 18):
            self.abort_json({
                'message': f"O horário limite em dias de semana deve estar entre 12 e 18.",
                'status': 'error',
            }, 400)

        if data['delivery_window'] == 'next_day' and  data['settings'][0]['cutoff']['sunday']['enabled'] and (not data['settings'][0]['cutoff']['sunday']['value'] \
            or data['settings'][0]['cutoff']['sunday']['value'] < 12 or data['settings'][0]['cutoff']['sunday']['value'] > 18):
            self.abort_json({
                'message': f"O horário limite em dias de semana deve estar entre 12 e 18.",
                'status': 'error',
            }, 400)

        query = """
            SELECT id, access_token_expires_at, access_token, refresh_token, external_data -> 'internal_tags' as internal_tags 
            FROM meuml.accounts 
            WHERE id=:account_id
        """
        account = self.fetchone(query, {'account_id': request.form.get('account_id')})

        if account is None:
            self.abort_json({
                'message': f"Nenhuma conta do Mercado Livre encontrada.",
                'status': 'error',
            }, 400)

        if not account['internal_tags'] or 'meuml_tag_flex' not in account['internal_tags']:
            self.abort_json({
                'message': f"Esta conta ainda não possui permissão para utilizar o Mercado Envios Flex.",
                'status': 'error',
            }, 403)
        
        access_token = self.refresh_token(account=account)
        if access_token is None or access_token is False:
            self.abort_json({
                'message': f"Token não renovado.",
                'status': 'error',
            }, 400)

        access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        account_id = str(account['id'])
        service_type = 'lightweight'
        query = {
            "query": "{ configuration(user_id: "+account_id+", service_type: \""+service_type+"\"){ adoption{ service_id status {id cause date} creation_date last_update penalty_status recover_date delivery_window } address{ id address_line zip_code city{ id name } } capacity{ availables selected current_count } cutoff{ availables{ value unit } selected{ week saturday sunday } } working_days training_time{ offset{ value unit } activation_date } zones{ id label price{ cents currency_id decimal_separator fraction symbol } is_mandatory selected neighborhoods polygon{ type geometry{ type coordinates } properties{ name } } } }}"
        }
        response = ml_api.post(f'/shipping/flex/sites/MLB/configuration', headers={'Accept-version': 'v2'}, json=query)
        response_data = response.json()

        if response.status_code not in [200,201,404]:
            response_data['query'] = query
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error',
                'error': response_data
            }, 502)

        data['service_id'] = response_data['configuration']['adoption']['service_id']

        response = ml_api.put(f'/shipping/flex/sites/MLB/users/{account_id}/adoption', headers={'Accept-version': 'v2'}, json=[data])
        status_code = response.status_code
        response_data = response.json()
            
        if status_code not in [200,201,404]:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error',
                'error': response_data
            }, 502)

        if status_code == 404:
            self.abort_json({
                'message': f"Dados do Mercado Envios Flex não encontrados para esta conta.",
                'status': 'error',
            }, 404)

        return self.return_success("Configurações Salvas", data=response_data)


    @jwt_required
    @prepare
    def change_mercadoenvios_flex(self):
        if 'activate' not in request.form and request.form['activate'] not in ['0', '1']:
            self.abort_json({
                'message': f'Preencha todos os campos obrigatórios.',
                'status': 'error',
            }, 400)
        activate = True if request.form['activate'] == '1' else False

        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message':'Preencha o parâmetro de confirmação.',
                'status':'error',
            }, 400)
        else:
            confirmed = True if request.args.get('confirmed','0') == '1' else False

        is_single = self.is_single_advertising(request)
        if is_single:
            tool = self.get_tool('change-mercadoenvios-flex-single')
        else:
            tool = self.get_tool('change-mercadoenvios-flex')

        print('here 1')

        subscription_required = tool['access_type'] == AccessType.subscription
        additional_query = " AND ad.status IN ('active', 'paused') AND ac.external_data ->> 'internal_tags' like '%%meuml_tag_flex%%' "
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(request, additional_conditions=additional_query, subscription_required=subscription_required, mass_operation=True)

        if not confirmed and filter_total>1:
            return self.return_success(f"A operação modificará: {filter_total} anúncios")
        elif not confirmed and filter_total==1:
            advertising = self.fetchone("SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
            return self.return_success(f"A operação modificará o anúncio {advertising['external_id']} - {advertising['title']}")
        elif not confirmed:
            return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success("Nenhum produto elegivel para alteração.")

        code, message = verify_tool_access(self, self.user['id'], accounts_id, tool, filter_total)

        print('here 2 - verified tool')
        print(code)

        print('filter total - ')
        print(filter_total)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        elif filter_total > 1:
            shipping_mercadoenvios_flex_set_many = queue.signature('local_priority:mercadoenvios_flex_set_many')
            shipping_mercadoenvios_flex_set_many.delay(user_id=self.user['id'], filter_query=filter_query, filter_values=filter_values, activate=activate)
            return self.return_success("Alteração em massa de Mercado Envios Flex iniciada. Confira o andamento em Processos", {})
        
        else:
            advertising = self.fetchone("SELECT account_id, external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)

            if not advertising:
                self.abort_json({
                    'message':'Anúncio não encontrado',
                    'status':'error',
                })

            process_id = create_process(account_id=advertising['account_id'], user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self)
            process_item_id = create_process_item(process_id, advertising['account_id'], advertising['external_id'], self)
            status_code, message = shipping_mercadoenvios_flex_item(None, advertising['account_id'], tool, process_item_id, advertising['external_id'], activate, self.conn)

            if status_code != 200:
                self.abort_json({
                    'message':message,
                    'status':'error',
                })

            return self.return_success(message)


    @jwt_required
    @prepare
    def check_configuration_mercadoenvios_flex(self):
        query = """
            SELECT id, access_token_expires_at, access_token, refresh_token, external_data -> 'internal_tags' as internal_tags 
            FROM meuml.accounts 
            WHERE id=:account_id
        """
        account = self.fetchone(query, {'account_id': request.args.get('account_id')})

        if account is None:
            self.abort_json({
                'message': f"Nenhuma conta do Mercado Livre encontrada.",
                'status': 'error',
            }, 400)

        if not account['internal_tags'] or 'meuml_tag_flex' not in account['internal_tags']:
            self.abort_json({
                'message': f"Esta conta ainda não possui permissão para utilizar o Mercado Envios Flex.",
                'status': 'error',
            }, 403)
        
        access_token = self.refresh_token(account=account)
        if access_token is None or access_token is False:
            self.abort_json({
                'message': f"Token não renovado.",
                'status': 'error',
            }, 400)

        access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        account_id = str(account['id'])
        service_type = 'lightweight'
        query = {
            "query": "{ configuration(user_id: "+account_id+", service_type: \""+service_type+"\"){ adoption{ service_id status {id cause date} creation_date last_update penalty_status recover_date delivery_window } address{ id address_line zip_code city{ id name } } capacity{ availables selected current_count } cutoff{ availables{ value unit } selected{ week saturday sunday } } working_days training_time{ offset{ value unit } activation_date } zones{ id label price{ cents currency_id decimal_separator fraction symbol } is_mandatory selected neighborhoods polygon{ type geometry{ type coordinates } properties{ name } } } }}"
        }
        response = ml_api.post(f'/shipping/flex/sites/MLB/configuration', headers={'Accept-version': 'v2'}, json=query)
        status_code = response.status_code
        response_data = response.json()

        if status_code not in [200,201,404]:
            response_data['query'] = query
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error',
                'error': response_data
            }, 502)

        if status_code == 404:
            self.abort_json({
                'message': f"Dados do Mercado Envios Flex não encontrados para esta conta.",
                'status': 'error',
            }, 404)

        return self.return_success("Configurações Mercado de Envios Flex", data=response_data)


    @jwt_required
    @prepare
    def expand_mercadoenvios_flex(self):
        query = """
            SELECT id, access_token_expires_at, access_token, refresh_token, external_data -> 'internal_tags' as internal_tags 
            FROM meuml.accounts 
            WHERE id=:account_id
        """
        account = self.fetchone(query, {'account_id': request.args.get('account_id')})

        if account is None:
            self.abort_json({
                'message': f"Nenhuma conta do Mercado Livre encontrada.",
                'status': 'error',
            }, 400)

        if not account['internal_tags'] or 'meuml_tag_flex' not in account['internal_tags']:
            self.abort_json({
                'message': f"Esta conta ainda não possui permissão para utilizar o Mercado Envios Flex.",
                'status': 'error',
            }, 403)
        
        access_token = self.refresh_token(account=account)
        if access_token is None or access_token is False:
            self.abort_json({
                'message': f"Token não renovado.",
                'status': 'error',
            }, 400)
        
        access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        if request.method == 'GET':
            account_id = str(account['id'])
            service_type = 'lightweight'
            query = {
                "query": "{ configuration(user_id: "+account_id+", service_type: \""+service_type+"\"){ adoption{ service_id status {id cause date} creation_date last_update penalty_status recover_date delivery_window } address{ id address_line zip_code city{ id name } } capacity{ availables selected current_count } cutoff{ availables{ value unit } selected{ week saturday sunday } } working_days training_time{ offset{ value unit } activation_date } zones{ id label price{ cents currency_id decimal_separator fraction symbol } is_mandatory selected neighborhoods polygon{ type geometry{ type coordinates } properties{ name } } } }}"
            }
            response = ml_api.post(f'/shipping/flex/sites/MLB/configuration', headers={'Accept-version': 'v2'}, json=query)
            status_code = response.status_code
            response_data = response.json()
            
            if status_code not in [200,201,404]:
                response_data['query'] = query
                self.abort_json({
                    'message': f"Erro de comunicação com o Mercado Livre.",
                    'status': 'error',
                    'error': response_data
                }, 502)

            if status_code == 404:
                self.abort_json({
                    'message': f"Dados do Mercado Envios Flex não encontrados para esta conta.",
                    'status': 'error',
                }, 404)
    
            zones = response_data.get('configuration').get('zones', [])

            return self.return_success("Zonas de cobertura disponíveis", data=zones)

        elif request.method == 'PUT':
            if not request.args.get('zones') or len(request.args['zones']) == 0:
                self.abort_json({
                    'message': f"Preencha o campo de zonas de cobertura.",
                    'status': 'error',
                }, 400)
            zones = request.args['zones'].split(',')

            ml_api = MercadoLibreApi(access_token=access_token)

            service_type = 'lightweight'
            response = ml_api.put(f'/shipping/flex/sites/MLB/coverages/users/{account["id"]}/services/types/{service_type}/zones', headers={'Accept-version': 'v1'}, json=zones)
            status_code = response.status_code
            response_data = response.json()
            response_data = [] if response_data is None else response_data 
                
            if status_code not in [200,201]:
                self.abort_json({
                    'message': f"Erro de comunicação com o Mercado Livre.",
                    'status': 'error',
                    'error': response_data
                }, 502)

            return self.return_success("Cobertura Mercado Envios Flex Atualizada", data=response_data)

    @jwt_required
    @prepare
    def schedule_get(self):
        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
            LIMIT 1
        """
        ml_account = self.fetchone(
            account_query,
            {
                'user_id': self.user['id'],
                'account_id': request.args.get('account_id')
            }
        )

        account_token = self.refresh_token(
            ml_account, platform="ML"
        )

        if not account_token:
            self.abort_json({
                'message': f'''
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                ''',
                'status': 'error',
            }, 403)

        ml_api = MercadoLibreApi(
            access_token=account_token['access_token']
        )

        response = ml_api.get(
            f"/users/{request.args.get('account_id')}/shipping/schedule/{request.args.get('logistic_type')}"
        )
        data = response.json()

        if response.status_code != 200:
            self.abort_json({
                'message': f'Erro de comunicação com o Mercado Livre',
                'status': 'error',
                'details': data,
            }, response.status_code)

        return self.return_success(data=data)

    @jwt_required
    @prepare
    def processing_time_middleend_get(self):
        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
            LIMIT 1
        """
        ml_account = self.fetchone(
            account_query,
            {
                'user_id': self.user['id'],
                'account_id': request.args.get('account_id')
            }
        )

        account_token = self.refresh_token(
            ml_account, platform="ML"
        )

        if not account_token:
            self.abort_json({
                'message': f'''
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                ''',
                'status': 'error',
            }, 403)

        ml_api = MercadoLibreApi(
            access_token=account_token['access_token']
        )

        response = ml_api.get(
            f"/shipping/users/{request.args.get('account_id')}/processing_time_middleend/{request.args.get('logistic_type')}"
        )
        data = response.json()

        if response.status_code != 200:
            self.abort_json({
                'message': f'Erro de comunicação com o Mercado Livre',
                'status': 'error',
                'details': data,
            }, response.status_code)

        return self.return_success(data=data)

    @jwt_required
    @prepare
    def processing_time_middleend_update(self):
        self.validate(ShippingModificationTemplateSchema())
        request_data = self.data

        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
        """
        ml_account = self.fetchone(
            account_query,
            {
                'user_id': self.user['id'],
                'account_id': request_data['account_id']
            }
        )

        account_token = self.refresh_token(
            ml_account, platform="ML"
        )

        if not account_token:
            self.abort_json({
                'message': f'''
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                ''',
                'status': 'error',
            }, 403)

        ml_api = MercadoLibreApi(
            access_token=account_token['access_token']
        )

        response = ml_api.put(
            f"/shipping/users/{request_data['account_id']}/processing_time_middleend/{request_data['logistic_type']}",
            json={"processing_times": request_data['processing_times']}
        )
        data = response.json()

        if response.status_code not in [200, 201]:
            self.abort_json({
                'message': f'Erro de comunicação com o Mercado Livre',
                'status': 'error',
                'details': data,
            }, response.status_code)

        return self.return_success(data=data)
