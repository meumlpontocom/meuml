import json
from libs.translations.mercadolibre_advertising import MLAdvertisingPTBR
from flask import request
from libs.actions.actions import Actions
from flask_jwt_simple import jwt_required
from libs.queue.queue import app as queue
from libs.decorator.prepare import prepare
from libs.enums.access_type import AccessType
from libs.payments.payment_helper import verify_tool_access
from libs.payments.payment_helper import user_subscripted_accounts
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.schema.advertisings_schema import MshopAdvertisingUpdateSchema, NewMshopsAdvertisingSchema
from workers.loggers import create_process, create_process_item, update_process_item
from workers.tasks.mercadolibre.advertising_status_item import advertising_status_set_item


class MshopsAdvertisingsActions(Actions):

    @jwt_required
    @prepare
    def advertisings(self):

        fields = ['ad.id, ad.external_id', 'ad.date_created', 'ad.last_updated AS "date_modified"', 'ad.title', 'ad.price',
                  'CAST(ad.free_shipping AS char(1))',
                  'ad.listing_type_id as "listing_type"', 'ad.account_id', 'ad.condition', 'ad.status', 'ad.sold_quantity',
                  'ad.available_quantity', 'ac.external_name', 'ad.secure_thumbnail', 'ad.permalink',
                  'ad.shipping_tags', 'ad.sku', 'ad.description',
                  'ad.last_updated', 'ad.shipping_mode']

        query = f"""
            SELECT {",".join(fields)}
            FROM meuml.mshops_advertisings ad
            LEFT JOIN meuml.accounts ac ON ad.account_id = ac.id
        """

        values = {'user_id': self.user['id']}

        values, query, total, * \
            _ = self.filter_query(
                request, query, group_by=" ad.id, ac.id ")

        query = self.order(request, fields, query)
        params, query = self.paginate(request, query)

        try:
            advertisings = self.fetchall(query, values)
            for advertising in advertisings:
                advertising['external_data'] = {}
                advertising['external_data']['secure_thumbnail'] = advertising['secure_thumbnail']

        except Exception as e:
            self.abort_json({
                'message': f'Erro ao localizar anúncios.',
                'status': 'error',
            }, 400)

        if total == 0:
            return self.return_success('Nenhum anúncio localizado.', {})

        meta = self.generate_meta(params, total)
        return self.return_success(data=advertisings, meta=meta)

    @jwt_required
    @prepare
    def create_advertising(self):
        self.validate(NewMshopsAdvertisingSchema())
        request_data = self.data

        if len(request_data.get('title', '')) > 60:
            self.abort_json({
                'message': f"O título do anúncio deve conter no máximo 60 caracteres.",
                'status': 'error'
            }, 400)

        tool = self.get_tool('create-advertising')

        query = 'SELECT id, access_token_expires_at, access_token, refresh_token FROM meuml.accounts WHERE user_id=:user_id AND status=1 AND id=:id'

        account = self.fetchone(
            query, {'user_id': self.user['id'], "id": request_data.get('account_id', '')})

        if account is None:
            self.abort_json({
                'message': f"Conta do Mercado Livre não encontrada.",
                'status': 'error',
            }, 400)

        pictures = []
        for picture_id in request_data['pictures']:
            pictures.append({'id': picture_id})

        advertising = {
            'site_id': 'MLB',
            'title': request_data['title'],
            'category_id': request_data['category_id'],
            'price': request_data['price'],
            'currency_id': 'BRL',
            'available_quantity': request_data['available_quantity'],
            'buying_mode': 'buy_it_now',
            'condition': request_data['condition'],
            'listing_type_id': request_data['listing_type_id'],
            'pictures': pictures,
            'attributes': request_data['attributes'],
            'channels': request_data['channels']
        }

        if request_data.get('immediate_payment'):
            advertising['tags'] = ['immediate_payment']

        if request_data.get('sale_terms'):
            advertising['sale_terms'] = request_data['sale_terms']

        if request_data.get('shipping'):
            advertising['shipping'] = request_data['shipping']

        # has_variations = True if request_data.get('variations') and len(
        #     request_data['variations']) > 0 else False

        # if has_variations:
        #     advertising['variations'] = []
        #     for variation in request_data['variations']:
        #         variation['price'] = advertising['price']
        #         advertising['variations'].append(variation)

        response_data = []
        errors_data = []

        process_id = create_process(account_id=account['id'], user_id=self.user['id'],
                                    tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self, platform='MS')

        process_item_id = create_process_item(
            process_id, account['id'], account['id'], self)

        access_token = self.refresh_token(account=account)

        if access_token is None:
            update_process_item(process_item_id, False, False, self,
                                f'Novo Anúncio - Não foi possível renovar o token de acesso.')
        else:
            access_token = access_token['access_token']

            ml_api = MercadoLibreApi(access_token=access_token)
            response = ml_api.post('/items', json=advertising)
            data = response.json()

            if response.status_code in [200, 201]:
                response_data.append(data)
                message = f'Novo Anúncio - Anúncio #{data["id"]} publicado com sucesso'

                description_msg = ''

                description = {'plain_text': request_data.get('description')}

                if description.get('plain_text'):
                    response_description = ml_api.post(
                        f'/items/{data["id"]}/description', json=description)

                    if response_description.status_code not in [200, 201]:
                        description_error_data = response_description.json()
                        description_msg = 'Erro ao inserir descrição: ' + \
                            json.dumps(description_error_data)

                if request_data['price'] != request_data['mshops_price']:
                    response_mshops_price = ml_api.post(
                        f'/items/{data["id"]}/prices/types/standard/channels/mshops', json={
                            "amount": request_data['mshops_price'],
                            "currency_id": "BRL"
                        })

                    if response_mshops_price.status_code not in [200, 201]:
                        description_error_data = response_description.json()
                        description_msg = 'Erro ao alterar preço: ' + \
                            json.dumps(description_error_data)

                update_process_item(process_item_id, response,
                                    True, self, message+description_msg)

                create_advertising = queue.signature(
                    'short_running:mshops_advertising_import_item')

                create_advertising.delay(
                    account['id'], self.user['id'], data['id'], process_item_id, access_token, update=True)
            else:
                error_data = {}
                error_data['details'] = data

                error_data['validations'] = []
                causes = data.get('cause', [])

                if isinstance(data.get('error'), str) and len(data['error']) > 0:
                    causes.append({'code': data['error']})

                for cause in causes:
                    if cause.get('code'):
                        cause_message = 'Erro de validação durante a publicação do anúncio'

                        if cause['code'] == 'item.start_time.invalid':
                            cause_message = 'A data inicial do anúncio só pode ser atualizada nos produtos ainda não ativos'
                        elif cause['code'] == 'item.category_id.invalid':
                            cause_message = f'A categoria {request_data["category_id"]} não existe ou não é folha'
                        elif cause['code'] == 'item.buying_mode.invalid':
                            cause_message = f'A categoria {request_data["category_id"]} não aceita a modalidade de anúncio de compra imediata'
                        elif cause['code'] == 'item.attributes.missing_required':
                            cause_message = f'Atributos obrigatórios da categoria {request_data["category_id"]} não foram preenchidos'
                        elif cause['code'] == 'item.listing_type_id.invalid':
                            cause_message = f'A categoria {request_data["category_id"]} não aceita este tipo de anúncio'
                        elif cause['code'] == 'item.listing_type_id.requiresPictures':
                            cause_message = 'As imagens são obrigatórias para este tipo de anúncio'
                        elif cause['code'] == 'item.site_id.invalid':
                            cause_message = 'Site MLB inválido'
                        elif cause['code'] == 'item.description.max':
                            cause_message = 'O número de caracteres da descrição deve ter menos de 50.000 caracteres'
                        elif cause['code'] == 'item.pictures.max':
                            cause_message = 'Quantidade de imagens máxima ultrapassada'
                        elif cause['code'] == 'item.attributes.invalid_length':
                            cause_message = 'Tamanho de valor inválido para o atributo'
                        elif cause['code'] == 'seller.unable_to_list':
                            cause_message = 'O vendedor não pode anunciar'
                        elif 'item.variations' in cause['code']:
                            cause_message = 'Erro na validação de variação'
                        elif 'item.channels.invalid' in cause['code']:
                            cause_message = 'Conta de usuário não tem permissão para publicar em Mshops'

                        error_data['validations'].append(cause_message)

                errors_data.append(error_data)
                error_message = 'Erro de validação durante a publicação do anúncio' if data.get(
                    'message', '') == 'Validation error' else 'Erro durante a publicação'
                update_process_item(
                    process_item_id, response, False, self, f'Novo Anúncio - {error_message}.')

        if len(response_data) == 0:
            self.abort_json({
                'message': error_message,
                'status': 'error',
                'errors': errors_data
            }, 502)

        message = 'Anúncio publicado com sucesso.'

        return self.return_success(message, response_data)

    @jwt_required
    @prepare
    def alter_mass_advertising_status(self):
        required_fields = ['status']
        filled_fields = request.form

        for field in required_fields:
            if field not in filled_fields:
                self.abort_json({
                    'message': 'Informe todos os campos obrigatorios.',
                    'status': 'error',
                }, 400)

        status = request.form['status']
        is_single = self.is_single_advertising(request)

        if is_single:
            tool = self.get_tool('alter-status-single')
        else:
            tool = self.get_tool('alter-status')

        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message': 'Preencha o parâmetro de confirmação.',
                'status': 'error',
            }, 400)
        else:
            confirmed = True if request.args.get(
                'confirmed', '0') == '1' else False

        subscription_required = tool['access_type'] == AccessType.subscription

        additional_query = " AND ad.status IN ('active', 'paused', 'closed') " if status != "deleted" else " AND ad.status = 'closed' "

        filter_values, filter_query, filter_total, accounts_id, *_ = self.filter_query(
            request, additional_conditions=additional_query, subscription_required=subscription_required, mass_operation=True)

        if not confirmed and filter_total > 1:
            return self.return_success(f"A operação modificará: {filter_total} anúncios")

        elif not confirmed and filter_total == 1:
            advertising = self.fetchone(
                "SELECT external_id, title FROM meuml.mshops_advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)

            return self.return_success(f"A operação modificará o anúncio {advertising['external_id']} - {advertising['title']}")
        elif not confirmed:
            return self.return_success(f"A operação não modificará nenhum anúncio")
        if filter_total == 0:
            return self.return_success("Nenhum produto elegivel para a alteração.")

        code, message = verify_tool_access(
            self, self.user['id'], accounts_id, tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        elif filter_total > 1:
            advertising_status_set_many = queue.signature(
                'local_priority:advertising_status_set_many')

            advertising_status_set_many.delay(
                user_id=self.user['id'], filter_query=filter_query, filter_values=filter_values, status=status, ml=False)

            return self.return_success(f"Alteração em massa do status de {filter_total} produtos iniciada. Confira o andamento em processos")
        else:
            advertising = self.fetchone(
                "SELECT external_id, title, account_id FROM meuml.mshops_advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)

            if not advertising:
                self.abort_json({
                    'message': "Anúncio não encontrado",
                    'status': 'error',
                }, 400)

            code, message = verify_tool_access(
                self, self.user['id'], accounts_id, tool)

            process_id = create_process(account_id=advertising['account_id'], user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get(
                'price'), items_total=1, action=self, platform='MS')

            process_item_id = create_process_item(
                process_id, advertising['account_id'], advertising['external_id'], self)

            status_code, message = advertising_status_set_item(
                None, advertising['account_id'], tool, process_item_id, advertising['external_id'], status, self.conn, ml=False)

            if status_code != 200:
                self.abort_json({
                    'message': message,
                    'error': 'status',
                }, 400)

            return self.return_success(f'Alteração de status concluída.')

    @jwt_required
    @prepare
    def update_advertising_shipping(self, advertising_id):
        request_data = request.json

        query = f"""
                SELECT ac.*
                FROM meuml.mshops_advertisings ad
                JOIN meuml.accounts ac ON ac.id = ad.account_id
                WHERE ac.status = 1 AND ac.user_id = :user_id AND ad.external_id = :id
            """
        values = {'user_id': self.user['id'], 'id': advertising_id}

        account = self.fetchone(query, values)

        if account is None:
            self.abort_json({
                'message': f"Conta do Mercado Livre não encontrada",
                'status': 'error',
            }, 400)

        access_token = self.refresh_token(account=account)

        if access_token is None or access_token is False:
            self.abort_json({
                'message': f"Token não renovado",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.put(
            f'/items/{advertising_id}/shipping', {
                "mshops": {
                    "free_shipping": request_data['free_shipping']
                }
            })

        response_data = response.json()

        if response.status_code != 200:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre",
                'status': 'error',
                'errors': response_data
            }, 502)
        else:
            message = f"Frete grátis aplicado para o anúncio {advertising_id} com sucesso!" if request_data[
                'free_shipping'] else f"Frete grátis removido do anúncio {advertising_id} com sucesso!"

            try:
                query = f"""
                    UPDATE meuml.mshops_advertisings ma
                    SET free_shipping = {int(request_data['free_shipping'])}
                    WHERE ma.external_id = '{advertising_id}'
                """

                self.execute(query)
            except Exception as e:
                self.abort_json({
                    'message': f"Erro ao atualizar frete grátis no anúncio {advertising_id}",
                    'status': 'error',
                    'errors': e
                }, 500)

            return self.return_success(message)

    @jwt_required
    @prepare
    def advertising(self, advertising_id):
        if request.method == 'GET':
            query = f"""
                SELECT ac.*
                FROM meuml.mshops_advertisings ad 
                JOIN meuml.accounts ac ON ac.id = ad.account_id
                WHERE ac.status = 1 AND ac.user_id = :user_id AND ad.external_id = :id
            """
            values = {'user_id': self.user['id'], 'id': advertising_id}

            account = self.fetchone(query, values)

            if account is None:
                self.abort_json({
                    'message': f"Conta do Mercado Livre não encontrada",
                    'status': 'error',
                }, 400)

            access_token = self.refresh_token(account=account)
            if access_token is None or access_token is False:
                self.abort_json({
                    'message': f"Token não renovado",
                    'status': 'error',
                }, 400)
            else:
                access_token = access_token['access_token']

            ml_api = MercadoLibreApi(access_token=access_token)

            response = ml_api.get(
                f'/items/{advertising_id}', params={'include_attributes': 'all'})
            response_data = response.json()

            if response.status_code != 200:
                self.abort_json({
                    'message': f"Erro de comunicação com o Mercado Livre",
                    'status': 'error',
                    'errors': response_data
                }, 502)

            response = ml_api.get(
                f'/categories/{response_data["category_id"]}/attributes')

            if response.status_code != 200:
                self.abort_json({
                    'message': f"Erro de comunicação com o Mercado Livre",
                    'status': 'error',
                    'errors': response_data
                }, 502)

            response_data_attributes = response.json()

            response_data_attributes = {
                attribute['id']: attribute for attribute in response_data_attributes}

            for index, attribute in enumerate(response_data['attributes']):
                value_id = attribute.get('value_id')
                value_name = attribute.get('value_name')
                attribute = response_data_attributes.get(attribute['id'], {})
                attribute['value_id'] = value_id
                attribute['value_name'] = value_name
                response_data['attributes'][index] = attribute

            response = ml_api.get(f"/items/{advertising_id}/description")
            response_data_description = response.json()

            if response.status_code not in [200, 404]:
                self.abort_json({
                    'message': f"Erro de comunicação com o Mercado Livre",
                    'status': 'error',
                    'errors': response_data
                }, 502)

            editableFields = []

            if response_data['status'] == 'active':
                editableFields = ['attributes', 'description', 'listing_type_id',
                                  'pictures', 'sale_terms_manufacturing_time', 'status', 'video_id']

                if response_data['sold_quantity'] == 0:
                    editableFields += ['category_id', 'condition', 'sale_terms_warranty_time',
                                       'sale_terms_warranty_type', 'shipping', 'title', 'available_quantity', 'price']

                editableFields.sort()

            advertising = response_data
            advertising.pop('descriptions', None)

            if response.status_code == 200:
                advertising['description'] = {
                    'plain_text': response_data_description['plain_text']}
            else:
                advertising['description'] = {'plain_text': None}

            advertising['editable_fields'] = editableFields

            return self.return_success(data=advertising)
        else:
            self.validate(MshopAdvertisingUpdateSchema())

            request_data = self.data

            accounts_query = """
                SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token
                FROM meuml.accounts ac
                JOIN meuml.mshops_advertisings ad ON ad.account_id = ac.id
                WHERE ac.user_id = :user_id AND ac.status = 1 AND ad.external_id = :id
            """

            ml_accounts = self.fetchall(
                accounts_query, {'user_id': self.user['id'], 'id': advertising_id})

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

            response = ml_api.get(f'/items/{advertising_id}')

            current_advertising = response.json()

            if response.status_code != 200:
                self.abort_json({
                    'message': f"Erro de comunicação com o Mercado Livre",
                    'status': 'error',
                }, 502)

            advertising = {key: value for key,
                           value in request_data.items() if value is not None}

            description = advertising.pop('description', None)

            listing_type_id = advertising.pop('listing_type_id', None)

            advertising.get('shipping', {}).pop('store_pick_up', None)

            advertising.get('shipping', {}).pop('tags', None)

            if 'pictures' in advertising:
                pictures = [{'id': picture['id']}
                            for picture in advertising['pictures']]
                advertising['pictures'] = pictures

            if 'sale_terms' in advertising:
                sale_terms = []
                for sale_term in advertising['sale_terms']:
                    if sale_term['id'] in ['MANUFACTURING_TIME', 'WARRANTY_TIME', 'WARRANTY_TYPE']:
                        if current_advertising['sold_quantity'] == 0 or sale_term['id'] == 'MANUFACTURING_TIME':
                            sale_terms.append(
                                {'id': sale_term['id'], 'value_name': sale_term['value_name']})

                if len(sale_terms) > 0:
                    advertising['sale_terms'] = sale_terms
                else:
                    advertising.pop('sale_terms', None)

            if 'attributes' in advertising:
                attributes = []
                for attribute in advertising['attributes']:
                    attributes.append(
                        {'id': attribute['id'], 'value_name': attribute['value_name']})

                if len(attributes) > 0:
                    advertising['attributes'] = attributes
                else:
                    advertising.pop('attributes', None)

            if advertising.get('video_id'):
                regex = r"(?:\/|%3D|v=|vi=)([0-9A-z-_]{11})(?:[%#?&]|$)"
                video_id = advertising['video_id']
                video_id = re.findall(regex, video_id)

                if len(video_id) > 0:
                    advertising['video_id'] = video_id[0]
                else:
                    advertising.pop('video_id', None)

            query = f"""
                SELECT ac.*, ad.listing_type_id 
                FROM meuml.mshops_advertisings ad 
                JOIN meuml.accounts ac ON ac.id = ad.account_id
                WHERE ac.status = 1 AND ac.user_id = :user_id AND ad.external_id = :id
            """

            values = {'user_id': self.user['id'], 'id': advertising_id}
            account = self.fetchone(query, values)

            access_token = self.refresh_token(account=account)

            if access_token is None or access_token is False:
                self.abort_json({
                    'message': f"Token não renovado",
                    'status': 'error',
                }, 400)
            else:
                access_token = access_token['access_token']

            if account['listing_type_id'] == 'free' and isinstance(advertising.get('available_quantity'), int) and advertising['available_quantity'] > 1:
                self.abort_json({
                    'message': f"Anúncio com listagem grátis possuem estoque máximo de 1 produto",
                    'status': 'error',
                }, 400)

            ml_api = MercadoLibreApi(access_token=access_token)

            errors = []
            errors_json = []

            if advertising:
                response = ml_api.put(
                    f'/items/{advertising_id}', json=advertising)

                response_data = response.json()

                if response.status_code != 200:
                    errors = [MLAdvertisingPTBR.translate(
                        key) for key in advertising.keys()]
                    errors_json.append(response_data)
            else:
                response = ml_api.get(
                    f'/items/{advertising_id}', params={'include_attributes': 'all'})
                response_data = response.json()

            if description:
                response = ml_api.put(f'/items/{advertising_id}/description', json={
                                      'plain_text': description.get('plain_text', '')})

                response_data_description = response.json()

                if response.status_code != 200:
                    errors.append('Descrição')
                    errors_json.append(response_data_description)
                else:
                    response_data['description'] = response_data_description

            if listing_type_id and listing_type_id != account['listing_type_id']:
                response = ml_api.post(
                    f'/items/{advertising_id}/listing_type', json={'id': listing_type_id})
                response_data_listing = response.json()

                if response.status_code != 200:
                    errors.append('Tipo de Exposição')
                    errors_json.append(response_data_listing)
                else:
                    response_data['listing_type_id'] = listing_type_id

            if len(errors) > 0:
                self.abort_json({
                    'message': f"Erro ao atualizar {', '.join(errors)} do anúncio",
                    'status': 'error',
                    'errors': errors_json
                }, 400)

            return self.return_success("Anúncio atualizado com sucesso", data=response_data)

    def filter_query(self, request, query='', values=None, group_by=None, additional_conditions=None, subscription_required=False, module_id=None, mass_operation=False, advertisings_id=None):
        select_all = bool(int(request.args.get('select_all', 0)))
        total = 0
        accounts = []

        k = query.rfind('FROM')

        if k == -1:
            count_query = """
                SELECT count(distinct ad.id), ac.id, ac.name FROM meuml.mshops_advertisings ad JOIN meuml.accounts ac ON ad.account_id = ac.id 
                JOIN meuml.users u ON ac.user_id = u.id
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

        if 'filter_string' in request.args and request.args['filter_string']:
            keywords = request.args["filter_string"].split(',')

            for i, keyword in enumerate(keywords):
                filter_query += f' AND (UPPER(ad.title) LIKE :filter_string{i} '
                filter_query += f' OR ad.external_id LIKE :filter_string{i} '
                filter_query += f' OR UPPER(ad.sku) LIKE :filter_string{i}) '
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
            print(e)

        query += filter_query

        return filter_values, query, total, accounts, grouped_count
