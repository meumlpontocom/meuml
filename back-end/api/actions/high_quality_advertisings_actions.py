import json
import traceback
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.schema.advertisings_schema import NewAdvertisingSchema, AdvertisingHighQualityPropertiesSchema
from math import ceil


class HighQualityAdvertisingsActions(Actions):
    @jwt_required
    @prepare
    def validate_high_quality(self):
        try:
            status_code = None
            self.validate(NewAdvertisingSchema())
            request_data = self.data

            query = """
                SELECT ac.* 
                FROM meuml.accounts ac   
                WHERE ac.id = :id
            """
            account = self.fetchone(query, {'id': request_data['account_id'][0]})

            if account is None:
                self.abort_json({
                    'message': f"Não foi possível encontrar a conta Mercado Livre.",
                    'status': 'error',
                }, 400)

            access_token = self.refresh_token(account=account)
            if access_token == False:
                self.abort_json({
                    'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                    'status': 'error',
                }, 400)
            else:
                access_token = access_token['access_token']
            
            ml_api = MercadoLibreApi(access_token=access_token)

            validation_fields = {
                "site_id": 'MLB',
                #"title": request_data.get('title'),
                #"description": request_data.get('description') if isinstance(request_data.get('description'), str) else request_data.get('description', {}).get('plain_text'),
                #"category_id": request_data.get('category_id'),
                #"pictures": request_data.get('pictures'),
                "domain_id": request_data.get('domain_id'),
                "attributes": request_data.get('attributes')
            }

            for attribute in validation_fields['attributes']:
                if attribute.get('id') == 'GTIN':
                    if not validation_fields['domain_id']:
                        self.abort_json({
                            'message': f"Para validar o código identificador, informe o domain_id.",
                            'status': 'error',
                        }, 400)
                    break

            validation = ml_api.post(f'/catalog_product_candidate/validate', json=validation_fields)
            status_code = validation.status_code

            if validation.status_code == 204:
                return self.return_success("Este anúncio foi validado como alta qualidade")
            
            try:
                response_data = validation.json()
            except:
                response_data = {'status_code': validation.status_code}

            if validation.status_code != 400:
                self.abort_json({
                    'message': f"Erro de comunicação com o Mercado Livre.",
                    'status': 'error'
                }, 502)

            else:
                message = f"Este anúncio exige melhorias na qualidade da publicação."          
                errors = self.parse_errors(response_data)
            
                if len(errors) > 0:
                    message += " Detalhes: " + '; '.join(errors)

                self.abort_json({
                    'message': message,
                    'status': 'error',
                    'errors': errors
                }, 400)
        except Exception as e:
            print(traceback.format_exc()) 
            self.abort_json({
                'message': f'code: {status_code}',
                'status': 'error',
                'errors': traceback.format_exc()
            }, 400)

    @jwt_required
    @prepare
    def edit_high_quality_properties(self):
        if request.method == "GET":
            query = """
                SELECT ad.external_id as id, ad.title, ad.site_id, ad.category_id, ad.domain_id,
                    it.external_data -> 'pictures' as pictures, it.external_data -> 'attributes' as attributes,
                    it.external_data -> 'description' as description, 
                    CAST(external_data ->> 'sold_quantity' as integer) as sold_quantity
                FROM meuml.advertisings ad
                JOIN meli_stage.items it ON it.item_id = ad.external_id
                WHERE it.item_id = :id
            """
            advertising = self.fetchone(query, {'id': request.args['advertising_id']})
            
            if advertising is None:
                self.abort_json({
                    'message': f"Não foi possível encontrar o anúncio.",
                    'status': 'error',
                }, 400)

            accounts_query  = """
                SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token
                FROM meuml.accounts ac
                JOIN meuml.advertisings ad ON ad.account_id = ac.id
                WHERE user_id = :user_id AND status = 1 AND ad.external_id = :id
            """
            ml_accounts = self.fetchall(accounts_query, {'user_id': self.user['id'], 'id': request.args['advertising_id']})
            accounts_token = [self.refresh_token(account, platform="ML") for account in ml_accounts]
            accounts_token = [token for token in accounts_token if token]

            if len(accounts_token) == 0:
                self.abort_json({
                    'message': f'É necessário possuir uma conta do Mercado Livre autenticada para continuar.',
                    'status': 'error',
                }, 403)

            ml_api = MercadoLibreApi(access_token=accounts_token[0]['access_token'])
            description_response = ml_api.get(f"/items/{request.args['advertising_id']}/description")
            if description_response.status_code == 200:
                advertising['description'] = {'plain_text': description_response.json().get('plain_text')}

            if advertising['sold_quantity'] > 0:
                advertising['isTitleEditable'] = False
            else:
                advertising['isTitleEditable'] = True

            return self.return_success(data=advertising)

        else:
            self.validate(AdvertisingHighQualityPropertiesSchema())
            request_data = self.data

            query = "SELECT ac.* FROM meuml.accounts ac JOIN meuml.advertisings ad ON ac.id = ad.account_id WHERE ad.external_id = :id"
            account = self.fetchone(query, {'id': request_data['id']})
            if account is None:
                self.abort_json({
                    'message': f"Não foi possível encontrar a conta Mercado Livre.",
                    'status': 'error',
                }, 400)

            access_token = self.refresh_token(account=account)
            if access_token == False:
                self.abort_json({
                    'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                    'status': 'error',
                }, 400)
            else:
                access_token = access_token['access_token']
        
            ml_api = MercadoLibreApi(access_token=access_token)
            validate_data = request_data
        
            if validate_data.get('description'):
                validate_data['description'] = validate_data['description']['plain_text']
            if validate_data.get('pictures'):
                validate_data['pictures'] = [picture['id'] for picture in validate_data['pictures']]

            validate_data.pop('title', None)
            validate_data.pop('description', None)
            validate_data.pop('category_id', None)
            validate_data.pop('pictures', None)

            for attribute in validate_data.get('attributes'):
                if attribute.get('id') == 'GTIN':
                    if not validate_data.get('domain_id'):
                        self.abort_json({
                            'message': f"Para validar o código identificador, informe o domain_id.",
                            'status': 'error',
                        }, 400)
                    break

            validation = ml_api.post(f'/catalog_product_candidate/validate', json=validate_data)
        
            if validation.status_code != 204:
                message = f"Os dados enviados para edição não atingem a alta qualidade do Mercado Livre, edição cancelada."         
                errors = self.parse_errors(validation.json())
            
                if len(errors) > 0:
                    message += " Detalhes: " + '; '.join(errors)

                self.abort_json({
                    'message': message,
                    'status': 'error',
                    'errors': errors
                }, 400)
            
            update_data = {
                'description': request_data.get('description'),
                'attributes': request_data.get('attributes'),
                'pictures': request_data.get('pictures')
            }
            if request_data.get('title'):
                update_data['title'] = request_data['title']

            response = ml_api.put(f"/items/{request_data['id']}", json=update_data)

            if response.status_code != 200:
                self.abort_json({
                    'message': f"Anúncio de alta qualidade, porém ocorreu um erro ao atualizar os dados no Mercado Livre.",
                    'status': 'error',
                    'errors': response.json()
                }, 502)

            return self.return_success("Anúncio editado com sucesso!")


    def parse_errors(self, response_data):
        errors = []

        for cause in response_data.get('cause', []):
            error_msg = None

            if cause.get('code') == 'item.product_identifier.invalid':
                error_msg = f'O código identificador não corresponde ao seu produto'
            
            elif cause.get('code') == 'item.title.invalid':
                error_msg = f'O título faz referência à assuntos inválidos'

                title_codes = {
                    "SHIPPING": "informações sobre frete",
                    "METHOD_OF_PAYMENT": "informações sobre métodos de pagamento",
                    "BILLING": "informações sobre faturamento",
                    "WARRANTY": "informações sobre garantia do produto",
                    "LOCATION": "informações sobre a localização do produto/loja"
                }

                details = []
                for reference in cause.get('references', []):
                    if title_codes.get(reference):
                        details.append(title_codes.get(reference))

                if len(details) > 0:
                    error_msg += ' (' + ', '.join(details) + ')'

            elif cause.get('code') == 'item.description.invalid':
                error_msg = f'A descrição faz referência à assuntos inválidos'

                description_codes = {
                    "PICKUP": "informações sobre retiramento em loja",
                    "TECHNICAL_SUPPORT": " informações sobre o serviço pós venda",
                    "ABOUT_US": "informações sobre o vendedor",
                    "FAQ": "informações sobre perguntas frequentes",
                    "STOCK": "informações sobre o estoque",
                    "LEGAL": "informações legais ex: Termos e Condições",
                    "OFFICE_HOURS": "informações sobre horários de disponibilidade",
                    "LINK_TO_STORE": "contém links para outras publicações do Mercado Livre ou links externos"
                }

                details = []
                for reference in cause.get('references', []):
                    if description_codes.get(reference):
                        details.append(description_codes.get(reference))

                if len(details) > 0:
                    error_msg += ' (' + ', '.join(details) + ')'

            elif cause.get('code') == 'item.picture.invalid':
                error_msg = "A qualidade da imagem é ruim"
            else:
                error_msg = cause.get('message')
            
            if error_msg:
                errors.append(error_msg)

        return errors
