import json
import math
import re
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.schema.advertisings_schema import NewAdvertisingSchema, AdvertisingUpdateSchema
from libs.translations.mercadolibre_advertising import MLAdvertisingPTBR
from marshmallow import ValidationError
from workers.helpers import get_tool
from workers.loggers import create_process, create_process_item, update_process_item
from workers.tasks.mercadolibre.advertising_import_item import get_or_create_advertising


class AdvertisingsActions(Actions):
    @jwt_required
    @prepare
    def create_advertising(self):
        self.validate(NewAdvertisingSchema())
        request_data = self.data

        if not request_data['create_catalog_advertising'] and not request_data['create_classic_advertising']:
            self.abort_json({
                'message': f"Selecione publicação em Lista Geral OU Catálogo.",
                'status': 'error',
            }, 400)

        has_variations = True if request_data.get('variations') and len(
            request_data['variations']) > 0 else False

        if has_variations and request_data['create_catalog_advertising']:
            self.abort_json({
                'message': f"Anúncios com variações não podem ser publicados diretamente em Catálogo.",
                'status': 'error',
            }, 400)

        if request_data.get('catalog_id') is None and request_data['create_catalog_advertising']:
            self.abort_json({
                'message': f"Para publicação em Catálogo informe o id de catálogo.",
                'status': 'error',
            }, 400)

        if len(request_data.get('title', '')) > 60:
            self.abort_json({
                'message': f"O título do anúncio deve conter no máximo 60 caracteres.",
                'status': 'error'
            }, 400)

        tool = self.get_tool('create-advertising')

        query = 'SELECT id, access_token_expires_at, access_token, refresh_token FROM meuml.accounts WHERE user_id=:user_id AND status=1'
        accounts = self.fetchall(query, {'user_id': self.user['id']})

        if len(accounts) == 0:
            self.abort_json({
                'message': f"Nenhuma conta do Mercado Livre encontrada.",
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
        }

        if request_data.get('immediate_payment'):
            advertising['tags'] = ['immediate_payment']

        if request_data.get('sale_terms'):
            advertising['sale_terms'] = request_data['sale_terms']

        if request_data.get('shipping'):
            advertising['shipping'] = request_data['shipping']

        if has_variations:
            advertising['variations'] = []
            for variation in request_data['variations']:
                variation['price'] = advertising['price']
                advertising['variations'].append(variation)

        elif request_data['create_catalog_advertising'] and not request_data['create_classic_advertising']:
            advertising['catalog_product_id'] = request_data['catalog_id']
            advertising['catalog_listing'] = True

        response_data = []
        errors_data = []
        for account in accounts:
            if account['id'] not in request_data['account_id']:
                continue

            process_id = create_process(account_id=account['id'], user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get(
                'price'), items_total=1, action=self)
            process_item_id = create_process_item(
                process_id, account['id'], account['id'], self)

            access_token = self.refresh_token(account=account)
            if access_token is None:
                update_process_item(process_item_id, False, False, self,
                                    f'Novo Anúncio - Não foi possível renovar o token de acesso.')
                continue
            else:
                access_token = access_token['access_token']

            ml_api = MercadoLibreApi(access_token=access_token)
            response = ml_api.post('/items', json=advertising)
            data = response.json()

            if response.status_code in [200, 201]:
                response_data.append(data)
                message = f'Novo Anúncio - Anúncio #{data["id"]} publicado com sucesso '
                message = message + \
                    'na lista geral.' if request_data['create_classic_advertising'] else message + 'em Catálogo.'

                description_msg = ''
                description = {'plain_text': request_data.get('description')}
                if description.get('plain_text'):
                    response_description = ml_api.post(
                        f'/items/{data["id"]}/description', json=description)

                    if response_description.status_code not in [200, 201]:
                        description_error_data = response_description.json()
                        description_msg = 'Erro ao inserir descrição: ' + \
                            json.dumps(description_error_data)

                eligibility_msg = ''
                if request_data['evaluate_eligibility']:
                    response_eligibility = ml_api.post(
                        f'/catalog_listing_eligibility/moderation_buybox/evaluate',
                        json={
                            "item_id": data["id"]
                        }
                    )

                    if response_eligibility.status_code not in [200, 201]:
                        eligibility_error_data = response_eligibility.json()
                        eligibility_msg = "\tErro ao marcar anúncio para avaliação de catálogo: " + \
                            json.dumps(eligibility_error_data)

                if not has_variations and request_data['create_catalog_advertising'] and request_data['create_classic_advertising']:
                    update_process_item(process_item_id, response, True, self,
                                        f'Novo Anúncio - Anúncio #{data["id"]} publicado com sucesso na lista geral. Publicando em catálogo, por favor, aguarde. {description_msg}')
                    create_and_publish_advertising = queue.signature(
                        'short_running:catalog_publish_new_advertising')
                    create_and_publish_advertising.apply_async(
                        (account['id'], data['id'], request_data['catalog_id'], process_item_id), countdown=60)
                else:
                    update_process_item(
                        process_item_id, response, True, self, message+description_msg+eligibility_msg)
                    create_advertising = queue.signature(
                        'short_running:advertising_import_item')
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

        message = 'Anúncio publicado com sucesso.' if len(
            accounts) == 1 else 'Anúncios publicados com sucesso.'

        return self.return_success(message, response_data)

    @jwt_required
    @prepare
    def filter_options(self):
        accounts_query = f'SELECT ad.account_id, ac.name FROM meuml.advertisings ad JOIN meuml.accounts ac ON ad.account_id=ac.id WHERE ac.user_id=:user_id'
        status_query = f'SELECT distinct status FROM meuml.advertisings ad JOIN meuml.accounts ac ON ad.account_id=ac.id WHERE ac.user_id=:user_id'
        free_shipping_query = f'SELECT distinct free_shipping FROM meuml.advertisings ad JOIN meuml.accounts ac ON ad.account_id=ac.id WHERE ac.user_id=:user_id'
        listing_type_query = f'SELECT distinct listing_type_id FROM meuml.advertisings ad JOIN meuml.accounts ac ON ad.account_id=ac.id WHERE ac.user_id=:user_id'
        condition_query = f'SELECT distinct condition FROM meuml.advertisings ad JOIN meuml.accounts ac ON ad.account_id=ac.id WHERE ac.user_id=:user_id'

        try:
            data = {}
            data['accounts_options'] = self.fetchall(
                accounts_query, {'user_id': self.user["id"]})
            data['status_options'] = self.fetchall(
                status_query, {'user_id': self.user["id"]})
            data['free_shipping_options'] = self.fetchall(
                free_shipping_query, {'user_id': self.user["id"]})
            data['listing_type_options'] = self.fetchall(
                listing_type_query, {'user_id': self.user["id"]})
            data['condition_options'] = self.fetchall(
                condition_query, {'user_id': self.user["id"]})
        except Exception as e:
            print(e)

        return(data)

    @jwt_required
    @prepare
    def advertisings(self):
        # fields = ['ad.id, ad.external_id', 'ad.date_created', 'ad.last_updated AS "date_modified"', 'ad.title', 'ad.price',
        #           'COALESCE(ad.original_price, ad_dc.original_price) as original_price', 'CAST(ad.free_shipping AS char(1))',
        #           'ad.listing_type_id as "listing_type"', 'ad.account_id', 'ad.condition', 'ad.status', 'ad.sold_quantity',
        #           'ad.available_quantity', 'ac.external_name', 'ad.secure_thumbnail', 'ad.tags', 'ad.variations', 'ad.permalink',
        #           'ad.shipping_tags', 'array_agg(tg.name ORDER BY tg.name) as meuml_tags', 'ad.sku', 'ad.description',
        #           'ad.last_updated', 'ad.shipping_mode', 'ad.gtin', 'ad.category_id',
        #           """(SELECT json_agg(promotion_advertising) as promotions
        #             FROM (
        #                 SELECT
        #                     pr.id, pr.external_id,
        #                     pr.status as promotion_status, pr.name as promotion_name, pr.start_date as promotion_start_date,
        #                     pr.finish_date as promotion_finish_date, pr.deadline_date as promotion_deadline_date,
        #                     pr.benefits as promotion_benefits, pr.offers as promotion_benefits,
        #                     pt.key as promotion_type, pt.name as promotion_type_name,
        #                     pa.status, pa.price, pa.original_price, pa.max_original_price,
        #                     pa.meli_percentage, pa.seller_percentage, pa.stock_min, pa.stock_max,
        #                     pa.start_date, pa.end_date
        #                 FROM meuml.promotion_advertisings pa
        #                 JOIN meuml.promotions pr ON pr.id = pa.promotion_id
        #                 JOIN meuml.promotion_types pt ON pt.id = pr.promotion_type_id
        #                 WHERE pa.advertising_id = ad.external_id
        #             ) as promotion_advertising
        #         ) as promotions"""]

        # if self.user['id'] == 31867 or self.user['id'] == '31867':
        fields = ['ad.id, ad.external_id', 'ad.date_created', 'ad.last_updated AS "date_modified"', 'ad.title', 'ad.price',
                'COALESCE(ad.original_price, ad_dc.original_price) as original_price', 'CAST(ad.free_shipping AS char(1))',
                'ad.listing_type_id as "listing_type"', 'ad.account_id', 'ad.condition', 'ad.status', 'ad.sold_quantity',
                'ad.available_quantity', 'ac.external_name', 'ad.secure_thumbnail', 'ad.tags', 'ad.variations', 'ad.permalink',
                'ad.shipping_tags', 'array_agg(tg.name ORDER BY tg.name) as meuml_tags', 'ad.sku', 'ad.description',
                'ad.last_updated', 'ad.shipping_mode', 'ad.gtin', 'ad.category_id',
                """(SELECT json_agg(promotion_advertising) as promotions
                FROM (
                    SELECT
                        pr.id, pr.external_id,
                        pr.status as promotion_status, pr.name as promotion_name, pr.start_date as promotion_start_date,
                        pr.finish_date as promotion_finish_date, pr.deadline_date as promotion_deadline_date,
                        pr.benefits as promotion_benefits, pr.offers as promotion_benefits,
                        pt.key as promotion_type, pt.name as promotion_type_name,
                        pa.status, pa.price, pa.original_price, pa.max_original_price,
                        pa.meli_percentage, pa.seller_percentage, pa.stock_min, pa.stock_max,
                        pa.start_date, pa.end_date
                    FROM meuml.promotion_advertisings pa
                    JOIN meuml.promotions pr ON pr.id = pa.promotion_id
                    JOIN meuml.promotion_types pt ON pt.id = pr.promotion_type_id
                    WHERE pa.advertising_id = ad.external_id
                ) as promotion_advertising
            ) as promotions""",
            """(SELECT jsonb_build_object(
                    'height', attrs -> 'SELLER_PACKAGE_HEIGHT',
                    'length', attrs -> 'SELLER_PACKAGE_LENGTH',
                    'width',  attrs -> 'SELLER_PACKAGE_WIDTH',
                    'weight', attrs -> 'SELLER_PACKAGE_WEIGHT'
                )
                FROM (
                    SELECT jsonb_object_agg(attr->>'id', attr->>'value_name') AS attrs
                    FROM jsonb_array_elements(ad.attributes) AS attr
                    WHERE attr->>'id' IN (
                    'SELLER_PACKAGE_HEIGHT',
                    'SELLER_PACKAGE_LENGTH',
                    'SELLER_PACKAGE_WIDTH',
                    'SELLER_PACKAGE_WEIGHT'
                    )
                ) filtered
            ) AS seller_package_dimensions"""
        ]

        query = f"""
            SELECT {",".join(fields)}
            FROM meuml.advertisings ad
            LEFT JOIN meuml.accounts ac ON ad.account_id = ac.id
            LEFT JOIN meuml.advertising_discounts ad_dc ON
                ad.external_id = ad_dc.external_id AND now() between ad_dc.start_date and ad_dc.finish_date
            LEFT JOIN meuml.tagged_items ti ON ti.item_id = ad.external_id AND ti.type_id = 1
            LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id
        """
        values = {'user_id': self.user['id']}

        values, query, total, * \
            _ = self.apply_filter(
                request, query, group_by=" ad.id, ad_dc.id, ac.id ")
        query = self.order(request, fields, query)
        params, query = self.paginate(request, query)

        try:
            advertisings = self.fetchall(query, values)
            for advertising in advertisings:
                advertising['tags'] = advertising['tags'].split(
                    ',') if advertising['tags'] else ''

                advertising['external_data'] = {}
                advertising['external_data']['secure_thumbnail'] = advertising['secure_thumbnail']
                advertising['external_data']['tags'] = advertising['tags']
                advertising['external_data']['variations'] = advertising.pop(
                    'variations', [])

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
    def advertisings_all(self, specific_request=None):
        fields = ['ad.id, ad.external_id', 'ad.date_created', 'ad.last_updated AS "date_modified"', 'ad.title', 'ad.price',
                  'COALESCE(ad.original_price, ad_dc.original_price) as original_price', 'CAST(ad.free_shipping AS char(1))',
                  'ad.listing_type_id as "listing_type"', 'ad.account_id', 'ad.condition', 'ad.status', 'ad.sold_quantity',
                  'ad.available_quantity', 'ac.external_name', 'ad.secure_thumbnail', 'ad.tags', 'ad.variations', 'ad.permalink',
                  'ad.shipping_tags', 'array_agg(tg.name ORDER BY tg.name) as meuml_tags', 'ad.sku', 'ad.description',
                  'ad.last_updated', 'ad.shipping_mode', 'ad.gtin', 'ad.category_id',
                  """(SELECT json_agg(promotion_advertising) as promotions
                    FROM (
                        SELECT
                            pr.id, pr.external_id,
                            pr.status as promotion_status, pr.name as promotion_name, pr.start_date as promotion_start_date,
                            pr.finish_date as promotion_finish_date, pr.deadline_date as promotion_deadline_date,
                            pr.benefits as promotion_benefits, pr.offers as promotion_benefits,
                            pt.key as promotion_type, pt.name as promotion_type_name,
                            pa.status, pa.price, pa.original_price, pa.max_original_price,
                            pa.meli_percentage, pa.seller_percentage, pa.stock_min, pa.stock_max,
                            pa.start_date, pa.end_date
                        FROM meuml.promotion_advertisings pa
                        JOIN meuml.promotions pr ON pr.id = pa.promotion_id
                        JOIN meuml.promotion_types pt ON pt.id = pr.promotion_type_id
                        WHERE pa.advertising_id = ad.external_id
                    ) as promotion_advertising
                ) as promotions"""]

        query = f"""
            SELECT {",".join(fields)}
            FROM meuml.advertisings ad
            LEFT JOIN meuml.accounts ac ON ad.account_id = ac.id
            LEFT JOIN meuml.advertising_discounts ad_dc ON
                ad.external_id = ad_dc.external_id AND now() between ad_dc.start_date and ad_dc.finish_date
            LEFT JOIN meuml.tagged_items ti ON ti.item_id = ad.external_id AND ti.type_id = 1
            LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id
        """
        values = {'user_id': self.user['id']}

        request_to_use = specific_request if specific_request else request

        values, query, total, * \
            _ = self.apply_filter(
                request_to_use, query, group_by=" ad.id, ad_dc.id, ac.id ")
        query = self.order(request_to_use, fields, query)

        try:
            advertisings = self.fetchall(query, values)
            for advertising in advertisings:
                advertising['tags'] = advertising['tags'].split(
                    ',') if advertising['tags'] else ''

                advertising['external_data'] = {}
                advertising['external_data']['secure_thumbnail'] = advertising['secure_thumbnail']
                advertising['external_data']['tags'] = advertising['tags']
                advertising['external_data']['variations'] = advertising.pop(
                    'variations', [])

        except Exception as e:
            self.abort_json({
                'message': f'Erro ao localizar anúncios.',
                'status': 'error',
            }, 400)

        if total == 0:
            return []

        if specific_request:
            return advertisings

        return self.return_success(data=advertisings)

    @jwt_required
    @prepare
    def calculate_total_replication_cost(self):
        all_advertisings_to_replicate = self.advertisings_all(request)
        total_ads_amount = len(all_advertisings_to_replicate)

        total_cost = 0

        regular_accounts_amount = int(request.args.get('regular_accounts_amount', 0))
        user_product_accounts_amount = int(request.args.get('user_product_accounts_amount', 0))

        if user_product_accounts_amount == 0:
            total_cost = total_ads_amount * regular_accounts_amount * 0.25
            return self.return_success(data={'total_cost': total_cost})
            
        total_variations_amount = 0
        regular_ads_amount = total_ads_amount

        for advertising in all_advertisings_to_replicate:
            external_data = advertising.get('external_data', {})
            variations = external_data.get('variations', [])
            variations_amount = len(variations)

            if variations_amount > 0:
                total_variations_amount += variations_amount
                regular_ads_amount -= 1

        user_product_account_ads = (regular_ads_amount + total_variations_amount) * user_product_accounts_amount
        regular_accounts_ads = total_ads_amount * regular_accounts_amount

        total_cost = (user_product_account_ads + regular_accounts_ads) * 0.25
        return self.return_success(data={'total_cost': total_cost})

    @jwt_required
    @prepare
    def mass_recreate_advertising(self):
        self.abort_json({
            'message': f"Função bloqueada.",
            'status': 'error',
        }, 403)

        query = 'SELECT id, access_token_expires_at, access_token, refresh_token FROM meuml.accounts WHERE id=:account_id'
        account = self.fetchone(
            query, {'account_id': request.args['account_id']})

        if account is None:
            self.abort_json({
                'message': f"Nenhuma conta do Mercado Livre encontrada.",
                'status': 'error',
            }, 400)

        access_token = self.refresh_token(account=account)
        if access_token is None or access_token is False:
            self.abort_json({
                'message': f"Token não renovado.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        # query = "SELECT count(*) FROM backup2 b WHERE b.item_id not like 'MLB15231%%'"
        # total = self.fetchone(query)
        # return self.return_success(data=total)

        query = "SELECT * FROM backup2 b WHERE b.item_id not like 'MLB15231%%' and LENGTH(external_data ->> 'title') > 60"
        advertisings = self.fetchall(query)

        count = 0
        tried = 0
        ignored = 0
        for advertising_row in advertisings:
            status_code = 404
            data = {}

            advertising = advertising_row['external_data']
            advertising.pop('id', None)
            advertising.pop('base_price', None)
            advertising.pop('original_price', None)
            advertising.pop('eligible', None)
            advertising.pop('advertising_id', None)
            advertising.pop('descriptions', None)
            advertising.pop('account_id', None)
            advertising.pop('stop_time', None)
            advertising.pop('parent_item_id', None)
            advertising.pop('health', None)
            advertising.pop('differential_pricing', None)
            advertising.pop('thumbnail', None)
            advertising.pop('secure_thumbnail', None)
            advertising.pop('permalink', None)
            advertising.pop('end_time', None)
            advertising.pop('seller_id', None)
            advertising.pop('inventory_id', None)
            advertising.pop('initial_quantity', None)
            advertising.pop('seller_contact', None)
            advertising.pop('date_created', None)
            advertising.pop('expiration_time', None)
            advertising.pop('item_relations', None)
            advertising.pop('geolocation', None)
            advertising.pop('deal_ids', None)
            advertising.pop('warnings', None)
            advertising.pop('international_delivery_mode', None)
            advertising.pop('sub_status', None)
            advertising.pop('catalog_status', None)
            advertising.pop('listing_source', None)
            advertising.pop('subtitle', None)
            advertising.pop('last_updated', None)
            advertising.pop('catalog_product_id', None)
            advertising.pop('sold_quantity', None)
            advertising.pop('start_time', None)
            advertising.get('shipping', {}).pop('logistic_type', None)
            # advertising.pop('seller_address', None)
            advertising['title'] = advertising['title'][:60] if len(
                advertising['title']) > 60 else advertising['title']

            allowed_attributes = []

            if len(advertising.get('attributes', [])) > 0:
                response = ml_api.get(
                    f'/categories/{advertising["category_id"]}/attributes')
                if response.status_code == 200:
                    response_data = response.json()
                    allowed_attributes = [attribute['id'] for attribute in response_data if not attribute.get(
                        'tags', {}).get('read_only', False)]
                attributes = []
                for attribute in advertising.get('attributes', []):
                    if len(allowed_attributes) == 0 or attribute['id'] in allowed_attributes:
                        attributes.append(attribute)
                advertising['attributes'] = attributes

            if len(advertising.get('variations', [])) > 0:
                variations = []
                for variation in advertising.get('variations', []):
                    variation.pop('id', None)
                    variation.pop('catalog_product_id', None)

                    if len(variation.get('attributes', [])) > 0:
                        if len(allowed_attributes) == 0:
                            response = ml_api.get(
                                f'/categories/{advertising["category_id"]}/attributes')
                            if response.status_code == 200:
                                response_data = response.json()
                                allowed_attributes = [attribute['id'] for attribute in response_data if not attribute.get(
                                    'tags', {}).get('read_only', False)]
                        attributes = []
                        for attribute in variation.get('attributes', []):
                            if len(allowed_attributes) == 0 or attribute['id'] in allowed_attributes:
                                attributes.append(attribute)
                        variation['attributes'] = attributes

                    variations.append(variation)
                advertising['variations'] = variations

            print(
                f"catalog: {advertising.get('catalog_listing', False)}, variations: {len(advertising.get('variations', []))}")
            #print(json.dumps(advertising, indent=4, sort_keys=True))

            if (request.args['catalog'] == '1' and advertising.get('catalog_listing')) or (request.args['catalog'] == '0' and not advertising.get('catalog_listing', False)):
                tried += 1
                response = ml_api.post('/items', json=advertising)
                status_code = response.status_code
                data = response.json()
            else:
                ignored += 1

            if status_code in [200, 201]:
                count += 1
            else:
                print(json.dumps(data, indent=4, sort_keys=True))

        return self.return_success(f'{count} anúncios publicados de {tried} tentativas. Ignorados {ignored}')

    @jwt_required
    @prepare
    def get_description(self, advertising_id):
        ml_api = MercadoLibreApi()
        response = ml_api.get(f"/items/{advertising_id}/description")
        response_data = response.json()
        status_code = response.status_code

        if status_code != 200:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre",
                'status': 'error',
                'error': response_data
            }, 502)

        description = {"description": {
            "plain_text": response_data.get('plain_text')}}

        return self.return_success(data=description)

    @jwt_required
    @prepare
    def advertising(self, advertising_id):
        if request.method == 'GET':
            query = f"""
                SELECT ac.*
                FROM meuml.advertisings ad
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
                if response_data['catalog_listing']:
                    editableFields = ['listing_type_id',
                                      'sale_terms_manufacturing_time', 'status']
                    if response_data['sold_quantity'] == 0:
                        editableFields += ['sale_terms_warranty_time',
                                           'sale_terms_warranty_type', 'shipping']

                else:
                    editableFields = ['attributes', 'description', 'listing_type_id',
                                      'pictures', 'sale_terms_manufacturing_time', 'status', 'video_id']
                    if response_data['sold_quantity'] == 0:
                        editableFields += ['category_id', 'condition', 'sale_terms_warranty_time',
                                           'sale_terms_warranty_type', 'shipping', 'title']

                if len(response_data.get('variations', [])) == 0:
                    editableFields += ['available_quantity', 'price']
                else:
                    editableFields += ['variations']
                editableFields.sort()

            advertising = response_data
            advertising.pop('descriptions', None)
            # advertising.pop('attributes', None)
            if response.status_code == 200:
                advertising['description'] = {
                    'plain_text': response_data_description['plain_text']}
            else:
                advertising['description'] = {'plain_text': None}
            advertising['editable_fields'] = editableFields

            return self.return_success(data=advertising)
        else:
            self.validate(AdvertisingUpdateSchema())
            request_data = self.data

            accounts_query = """
                SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token
                FROM meuml.accounts ac
                JOIN meuml.advertisings ad ON ad.account_id = ac.id
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

            if 'variations' in advertising:
                variations = []
                for variation in advertising['variations']:
                    variation_editable = {}

                    for key, value in variation.items():
                        if key in ['attribute_combinations', 'attributes', 'available_quantity', 'id', 'picture_ids', 'price', 'sale_terms']:
                            variation_editable[key] = value

                    if len(variation_editable) > 0:
                        variations.append(variation_editable)

                if len(variations) > 0:
                    advertising['variations'] = variations
                else:
                    advertising.pop('variations', None)

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
                FROM meuml.advertisings ad
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
