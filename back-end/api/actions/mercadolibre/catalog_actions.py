import json
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from fuzzywuzzy import fuzz, process
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from libs.payments.payment_helper import verify_tool_access, user_subscripted_accounts
from libs.schema.advertisings_schema import NewAdvertisingSchema
from libs.schema.catalog_schema import PriceToWinConditionsSchema
from libs.translations.mercadolibre_advertising import MLAdvertisingPTBR
from libs.translations.mercadolibre_price_to_win import MLPriceToWinPTBR

class CatalogActions(Actions):
    @jwt_required
    @prepare
    def catalog_advertisings(self):
        fields = ['ad.id, ad.external_id', 'ad.title', 'ad.price', 'ad.account_id', 
                'ad.status', 'ac.external_name', 'CAST(ad.catalog_status AS char(1))', 
                'ad2.title AS "original_title"', 'ad.category_id', 'ad.secure_thumbnail',
                'ad.tags', 'ad.catalog_listing', 'ad.catalog_product_id', 'ad.domain_id', 
                'ad.eligible', 'ad.catalog_product_name', 'ad.item_relations', 'ad.permalink', 
                'ad.moderation_date', 'ad.variations',
                "TO_CHAR(pw.date_modified, 'yyyy-mm-dd HH:MM:SS') AS pw_date_modified", 'pw.current_price as pw_current_price', 
                'pw.price_to_win as pw_price_to_win', 'pw.status AS pw_status', 
                'pw.competitors_sharing_first_place as pw_competitors_sharing_first_place', 
                'pw.visit_share as pw_visit_share', 'pw.consistent as pw_consistent', 
                'pw.boosts as pw_boosts', 'pw.winner_id as pw_winner_id', 'pw.reason as pw_reason',
                'pw.winner_price as pw_winner_price', 'pw.winner_boosts as pw_winner_boosts']   
        
        query = f"""
            SELECT {",".join(fields)} 
            FROM meuml.advertisings ad 
            LEFT JOIN meuml.accounts ac ON ad.account_id = ac.id 
            LEFT JOIN meuml.advertising_discounts ad_dc ON 
                ad.external_id = ad_dc.external_id AND now() between ad_dc.start_date and ad_dc.finish_date 
            LEFT JOIN meuml.catalog_advertisings ca ON ad.external_id = ca.catalog_advertising_id 
            LEFT JOIN meuml.advertisings ad2 ON ad2.external_id = ca.advertising_id 
            LEFT JOIN meuml.catalog_price_to_win pw ON ad.external_id = pw.id
        """ 
        values = {'user_id': self.user['id']}

        values, query, total, *_ = self.apply_filter(request, query)
        query = self.order(request, fields, query)
        params, query = self.paginate(request, query)

        try:
            advertisings = self.fetchall(query, values)
            for advertising in advertisings:
                advertising['pw_status_ptbr'] = MLPriceToWinPTBR.translate(advertising['pw_status'])
                
                if advertising['pw_reason']:
                    reasons = []
                    for reason in advertising['pw_reason']:
                        reasons.append(MLPriceToWinPTBR.translate(reason))
                    advertising['pw_reason'] = reasons
                
                if isinstance(advertising['pw_boosts'], list):
                    for boost in advertising['pw_boosts']:
                        boost['status_ptbr'] = MLPriceToWinPTBR.translate(boost['status'])
                        boost['description'] = MLPriceToWinPTBR.translate(boost['id'])
                elif isinstance(advertising['pw_boosts'], dict):
                    boosts = []
                    for key, value in advertising['pw_boosts'].items():
                        boosts.append({
                            'id': key,
                            'status': None,
                            'status_ptbr': None,
                            'description': MLPriceToWinPTBR.translate(key),
                        })
                    advertising['pw_boosts'] = boosts

                if advertising['pw_winner_boosts']:
                    for boost in advertising['pw_winner_boosts']:
                        boost['status_ptbr'] = MLPriceToWinPTBR.translate(boost['status'])
                        boost['description'] = MLPriceToWinPTBR.translate(boost['id'])
                
                advertising['tags'] = advertising['tags'].split(',') if advertising['tags'] else ''

                advertising['external_data'] = {}
                advertising['external_data']['secure_thumbnail'] = advertising['secure_thumbnail']
                advertising['external_data']['tags'] = advertising['tags']
                advertising['external_data']['catalog_listing'] = advertising.pop('catalog_listing')
                advertising['external_data']['catalog_product_id'] = advertising.pop('catalog_product_id')
                advertising['external_data']['domain_id'] = advertising.pop('domain_id')
                advertising['external_data']['variations'] = advertising.pop('variations',[])
                advertising['external_data']['eligible'] = advertising.pop('eligible',0)
                advertising['external_data']['catalog_product_name'] = advertising.pop('catalog_product_name')

                advertising['external_data']['item_relations'] = advertising.pop('item_relations',[])
                if advertising['original_title']:
                    advertising['external_data']['item_relations'][0]['original_title'] = advertising['original_title']
        except Exception as e:
            print(query)
            print(values)
            print(e)
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
    def publish_advertising(self, advertising_id):
        query = 'SELECT * FROM meuml.advertisings WHERE external_id = :advertising_id'
        advertising = self.fetchall(query, {'advertising_id': advertising_id})

        if len(advertising) == 0:
            self.abort_json({
                    'message': f'O anúncio {advertising_id} não foi encontrado.',
                    'status': 'error',
                }, 400)
        else:
            advertising = advertising[0]

        if advertising['catalog_listing'] is True:
            self.abort_json({
                    'message': f'O anúncio #{advertising_id} já está em Catálogo.',
                    'status': 'error',
                }, 400)

        if advertising['eligible'] == 0:
            self.abort_json({
                    'message': f'O anúncio #{advertising_id} não é elegível para publicação em Catálogo.',
                    'status': 'error',
                }, 400)

        tool = self.get_tool('publish-catalog-single')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=[advertising['account_id']], tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        catalog_publish_advertising = queue.signature('short_running:catalog_publish_advertising')
        catalog_publish_advertising.delay(advertising['id'])
        return self.return_success("Anúncio enviado ao Catálogo. Confira o andamento em Processos.", {})


    @jwt_required
    @prepare
    def publish_all(self):
        if 'account_ids' not in request.args:
            self.abort_json({
                    'message': f'Informe o(s) ID(s) da(s) conta(s) para publicação em Catálogo.',
                    'status': 'error',
                }, 400)

        if len(request.args['account_ids']) == 0:
            self.abort_json({
                    'message': f'Informe as contas para publicação em Catálogo.',
                    'status': 'error',
                }, 400)

        tool = self.get_tool('publish-catalog')
        accounts = request.args['account_ids'].split(',')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=accounts, tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        catalog_publish_all = queue.signature('local_priority:catalog_publish_all')
        catalog_publish_all.delay(self.user['id'], request.args['account_ids'])

        return self.return_success("Anúncios sendo enviados ao Catálogo. Confira o andamento em Processos.", {})


    @jwt_required
    @prepare
    def publish_multiple_advertisings(self):
        if 'advertising_ids' not in request.args:
            self.abort_json({
                    'message': f'Informe os IDs dos anúncios para publicação em Catálogo.',
                    'status': 'error',
                }, 400)

        if len(request.args['advertising_ids']) == 0:
            self.abort_json({
                    'message': f'Informe os IDs dos anúncios para publicação em Catálogo.',
                    'status': 'error',
                }, 400)

        catalog_publish_multiple_advertisings = queue.signature('local_priority:catalog_publish_multiple_advertisings')
        catalog_publish_multiple_advertisings.delay(self.user['id'], request.args['advertising_ids'])

        return self.return_success("Anúncios sendo enviados ao Catálogo. Confira o andamento em Processos.", {})


    @jwt_required
    @prepare
    def publish_variation(self, advertising_id, variation_ids):
        query = 'SELECT * FROM meuml.advertisings WHERE external_id = :advertising_id'
        advertising = self.fetchall(query, {'advertising_id': advertising_id})

        if len(advertising) == 0:
            self.abort_json({
                    'message': f'O anúncio {advertising_id} não foi encontrado.',
                    'status': 'error',
                }, 400)
        else:
            advertising = advertising[0]

        variation_ids_to_publish = variation_ids.split(',')
        advertising_variations = advertising['variations']
        eligible_ids = []
        not_eligible_ids = []

        for variation in advertising_variations:
            if str(variation['id']) in variation_ids_to_publish:
                variation_ids_to_publish.remove(str(variation['id']))

                if variation['eligible'] == 1 and variation['catalog_listing'] is False:
                    eligible_ids.append(variation['id'])
                else:
                    not_eligible_ids.append(str(variation['id']))

        if len(variation_ids_to_publish) > 0:
            self.abort_json({
                'message': f"As variações #{', #'.join(variation_ids_to_publish)} não pertencem ao anúncio #{advertising_id}.",
                'status': 'error',
            }, 400)

        if len(not_eligible_ids) > 0:
            self.abort_json({
                'message': f"As variações #{', #'.join(not_eligible_ids)} já estão em Catálogo ou não são elegíveis.",
                'status': 'error',
            }, 400)

        tool = self.get_tool('publish-catalog-single')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=[advertising['account_id']], tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        catalog_publish_variations = queue.signature('short_running:catalog_publish_variations')
        catalog_publish_variations.delay(advertising['id'], eligible_ids)

        return self.return_success(f"Variações do anúncio #{advertising_id} enviadas para publicação. Confira o andamento em Processos", {})


    @jwt_required
    @prepare
    def get_catalog_candidates(self):
        query = 'SELECT * FROM meuml.advertisings WHERE external_id = :id'
        advertising = self.fetchall(query, {'id': request.args.get('advertising_id')})

        if len(advertising) == 0:
            self.abort_json({
                'message': f"Anúncio não encontrado.",
                'status': 'error',
            }, 400)
        else:
            advertising = advertising[0]

        get_account_query = 'SELECT * FROM meuml.accounts WHERE id = :account_id'
        account = self.fetchone(get_account_query, {'account_id': advertising['account_id']})

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)


        params = {
            'status': 'active',
            'site_id': advertising.get('site_id', 'MLB')
        }
        if 'alternative_product_title' in request.args:
            params['q'] = request.args['alternative_product_title']
        else:
            params['q'] = advertising.get('title')

            if 'variation_id' in request.args:
                variations = advertising['variations']

                index = None
                for i, variation in enumerate(variations):
                    if variation['id'] == request.args['variation_id']:
                        index = i
                        break
                
                if type(index) is int and index < len(variations):
                    for attribute in variations[index].get('attribute_combinations', []):
                        params['q'] += f" {attribute.get('value_name', '')}"

        response = ml_api.get(f'/products/search', params=params).json()
        results = response.get('results', [])
        list_size = 10 if len(results) > 10 else len(results)

        result_names = [result.get('name') for result in results]
        result_ranking = process.extract(params['q'], result_names, scorer=fuzz.token_sort_ratio, limit=list_size)
        result_ranking = [name for (name, score) in result_ranking]
       
        candidates = [None] * list_size
        for result in response.get('results', []):
            data = {}
            data['id'] = result['id']
            data['domain_id'] = result['domain_id']
            data['name'] = result['name']
            data['pictures'] = []
            for picture in result['pictures']:
                data['pictures'].append(picture['url'])

            index = result_ranking.index(data['name'])
            candidates[index] = data

        return self.return_success(f"Lista de Produtos de Catálogo similares ao Anúncio {request.args['advertising_id']}", {'catalog_candidates': candidates})


    @jwt_required
    @prepare
    def replace_catalog_listing(self):
        required_fields = ['catalog_advertising_id', 'new_catalog_product_id', 'new_catalog_product_name']
        filled_fields = request.args.to_dict()

        for field in required_fields:
            if field not in filled_fields:
                self.abort_json({
                    'message': f'Preencha todos os campos obrigatórios.',
                    'status': 'error',
                }, 400)

        advertising = self.fetchone('SELECT account_id FROM meuml.advertisings WHERE external_id = :id')

        if not advertising:
            self.abort_json({
                'message': f'Anúncio não encontrado.',
                'status': 'error',
            }, 400)
                
        tool = self.get_tool('publish-catalog-single')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=[advertising['account_id']], tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        replace_listing = queue.signature('short_running:catalog_replace_listing')
        replace_listing.delay(
            user_id = self.user['id'],
            new_product_name=request.args['new_catalog_product_name'],
            new_product_id=request.args['new_catalog_product_id'], 
            current_product_id=request.args['catalog_advertising_id']
        )

        return self.return_success(f"Alteração de Catálogo em andamento. Confira os detalhes em Processos", {})


    @jwt_required
    @prepare
    def get_conditions_to_win(self):
        if 'advertising_id' not in request.args or 'account_id' not in request.args:
            self.abort_json({
                'message': f'Informe os IDs da conta e do anúncio de catálogo.',
                'status': 'error',
            }, 400)


        get_account_query = 'SELECT * FROM meuml.accounts WHERE id = :account_id'
        account = self.fetchone(get_account_query, {'account_id': request.args['account_id']})
        
        if account is None:
            self.abort_json({
                'message': f"Não foi possível encontrar conta #{request.args['account_id']} do Mercado Livre.",
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

        ml_api = MercadoLibreApi(access_token=access_token, forcelist=[510])
        response = ml_api.get(f'/items/{request.args["advertising_id"]}/price_to_win')

        if response.status_code == 200:
            data = response.json()
            tool = self.get_tool('price-to-win-catalog')
            code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=[request.args['account_id']], tool=tool)

            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            status_dict = {
                'winning': 'Vencendo',
                'competing': 'Competindo'
            }
            data['status'] = status_dict.get(data['status'])

            reason_dict = {
                'non_trusted_seller': 'O vendedor não está na lista de permissões de fraude. Não pode competir. Ele aparece nas listagens em segundo plano.',
                'reputation_below_threshold': 'O vendedor não atinge a reputação mínima para ganhar. Não pode competir. Aparece apenas nas listagens.',
                'winner_has_better_reputation': 'O vendedor tem uma reputação que pode competir, mas há um vencedor com uma reputação melhor. No momento, ele aparece apenas nas listagens (caixa amarela com vencedor verde).' ,
                'manufacturing_time': 'O item possui manufacturing time, aparece apenas nas listagens e não pode vencer porque o vencedor possui estoque imediato.',
                'temporarily_winning_manufacturing_time': 'O item possui manufacturing time, está ganhando temporariamente porque não há concorrentes no mesmo nível de reputação sem MF.',
                'temporarily_competing_manufacturing_time': 'O item possui manufacturing time, está competindo temporariamente porque não há concorrentes no mesmo nível de reputação sem MF, o vencedor também possui MF.',
                'temporarily_winning_best_reputation_available': 'O vendedor não é verde, mas tem uma reputação que pode ganhar e é a melhor oferta disponível. Ele está ganhando temporariamente. Se uma oferta melhor aparecer, pare de ganhar.',
                'temporarily_competing_best_reputation_available': 'O vendedor não é verde, mas é a melhor reputação disponível, está competindo temporariamente. O vencedor também é da mesma reputação. Se um best-seller aparecer, ele será listado apenas novamente.',
                'item_paused': 'O item está em pausa, não pode ser listado.',
                'item_not_opted_in': 'O item não aderiu o catálogo, não pode ser listado ou é um item de teste.'
            }
            data['reason'] = [reason_dict.get(reason) for reason in data.get('reason',[])]

            return self.return_success(f"Condições para ganhar destaque em Catálogo", data)
        else:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre {response.status_code}.",
                'status': 'error'
            }, 502)


    @jwt_required
    @prepare
    def search_product(self):
        data = []
        
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
        params={ 
                'site_id': 'MLB',
                'status': 'active',
                'q': request.args['title']
            }
        
        if len(request.args.get('domain_id','')) > 0:
            params['domain_id'] = request.args['domain_id']
        
        response = ml_api.get('/products/search', params=params)
        
        if response.status_code == 200:
            response_data = response.json()
            titles = []
            for product in response_data.get('results',[]):
                titles.append(product.get('name'))

                if request.args.get('include_attributes') == '0':
                    product.pop('attributes',None)

            if len(titles) > 0:
                similarity_order = process.extract(request.args['title'], titles, scorer=fuzz.token_sort_ratio)
                for title, percentage in similarity_order:
                    index = titles.index(title)
                    response_data['results'][index]['title_similarity'] = percentage
                    data.append(response_data['results'][index])

        else:
            self.abort_json({
                'message': f'Erro de comunicação com o Mercado Livre. Por favor, tente novamente',
                'status': 'error',
                'error': response.json()
            }, 502)

        return self.return_success(data=data)

    
    @jwt_required
    @prepare
    def set_price_to_win(self):
        required_fields = ['advertising_id', 'account_id', 'price']

        if not all(field in request.args for field in required_fields):
            self.abort_json({
                'message': f'Informe o novo Preço e os IDs da conta e do anúncio de catálogo.',
                'status': 'error',
            }, 400)
    
        get_account_query = 'SELECT * FROM meuml.accounts WHERE id = :account_id'
        account = self.fetchone(get_account_query, {'account_id': request.args['account_id']})

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        tool = self.get_tool('price-to-win-catalog')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=[request.args['account_id']], tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        response = ml_api.put(f'/items/{request.args["advertising_id"]}', json={"price": request.args["price"]})

        if response.status_code == 403:
            access_token = self.refresh_token(account=account)
            if access_token == False:
                self.abort_json({
                    'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                    'status': 'error',
                }, 400)
            else:
                access_token = access_token['access_token']
            ml_api = MercadoLibreApi(access_token=access_token)
            response = ml_api.put(f'/items/{request.args["advertising_id"]}', json={"price": request.args["price"]})
            
        if response.status_code != 200:
            self.abort_json({
                'message': f'Erro ao atualizar preço do Anúncio #{request.args["advertising_id"]}.',
                'status': 'error',
            }, 400)

        update_query = 'update meuml.advertisings SET price = :price WHERE external_id = :external_id'
        self.execute(update_query, {"price": float(request.args["price"]), "external_id": request.args["advertising_id"]} )

        return self.return_success(f"Preço atualizado para destaque em Catálogo.", {})


    @jwt_required
    @prepare
    def compare_attributes(self):
        advertising_id = request.args.get('advertising_id')

        query = """
            SELECT ad.external_id, ad.title, ad.catalog_product_id, ad.catalog_status, it.external_data -> 'attributes' as attributes, ad.variations,  
                ac.id, ac.access_token_expires_at, ac.access_token, ac.refresh_token 
            FROM meuml.accounts ac 
            JOIN meuml.advertisings ad ON ad.account_id = ac.id 
            JOIN meli_stage.items it ON it.item_id = ad.external_id
            WHERE ad.external_id = :id
        """
        advertising = self.fetchone(query, {'id': advertising_id})

        if advertising is None:
            self.abort_json({
                'message': f"Anúncio não encontrado.",
                'status': 'error',
            }, 400)

        account = {
            'id': advertising.pop('id'),
            'access_token_expires_at': advertising.pop('access_token_expires_at'),
            'access_token': advertising.pop('access_token'),
            'refresh_token': advertising.pop('refresh_token')
        }
        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        advertising_attributes = {}
        for attribute in advertising['attributes']:
            advertising_attributes[attribute['id']] = attribute['value_name']

        if len(advertising['variations']) == 0:
            if advertising['catalog_status'] != 1:
                self.abort_json({
                    'message': f"Anúncio não elegível para catálogo",
                    'status': 'error'
                }, 400)

            response = ml_api.get(f'/products/{advertising["catalog_product_id"]}')
            status_code = response.status_code
            response_data = response.json()

            if status_code not in [200, 404]:
                self.abort_json({
                    'message': f"Erro de comunicação com o Mercado Livre.",
                    'status': 'error',
                    'errors': response_data
                }, 502)

            attributes = {}
            for attribute in response_data['attributes']:
                attributes[attribute['id']] = {
                    'name': attribute['name'],
                    'catalog_value_name': attribute['value_name'],
                    'value_name': advertising_attributes.get(attribute['id'])
                }
                attributes[attribute['id']]['equals'] = attributes[attribute['id']]['catalog_value_name'] == attributes[attribute['id']]['value_name']
            
            data = {
                'id': advertising['external_id'],
                'name': advertising['title'],
                'catalog_product_id': response_data.get('id'),
                'catalog_product_name': response_data.get('name'),
                'catalog_domain_id': response_data.get('domain_id'),
                'catalog_sold': response_data.get('sold'),
                'catalog_permalink': response_data.get('permalink'),
                'catalog_pictures': response_data.get('pictures'),
                'attributes': attributes
            }

            return self.return_success(data={'data': data})
        else:
            data = {}
            data['variations'] = []
            for variation in advertising['variations']:
                if variation.get('eligible', 0) == 1 or (variation.get('catalog_product_id') and len(variation.get('item_relations',[]))==0):
                    response = ml_api.get(f'/products/{variation["catalog_product_id"]}')
                    status_code = response.status_code
                    response_data = response.json()

                    if status_code != 200:
                        self.abort_json({
                            'message': f"Erro de comunicação com o Mercado Livre.",
                            'status': 'error',
                            'errors': response_data
                        }, 502)

                    variation_attributes = {}
                    for attribute in variation['attributes']:
                        variation_attributes[attribute['id']] = attribute['value_name']

                    title = advertising['title']
                    for attribute in variation['attribute_combinations']:
                        if len(advertising['variations']) > 1:
                            title += ' ' + attribute['value_name']
                        variation_attributes[attribute['id']] = attribute['value_name']

                    attributes = {}
                    for attribute in response_data['attributes']:
                        variation_value = variation_attributes[attribute['id']] if attribute['id'] in variation_attributes else advertising_attributes.get(attribute['id'])

                        attributes[attribute['id']] = {
                            'name': attribute['name'],
                            'catalog_value_name': attribute['value_name'],
                            'value_name': variation_value
                        }
                        attributes[attribute['id']]['equals'] = attributes[attribute['id']]['catalog_value_name'] == attributes[attribute['id']]['value_name']

                    data['variations'].append({
                        'id': variation['id'],
                        'name': title,
                        'catalog_product_id': response_data.get('id'),
                        'catalog_product_name': response_data.get('name'),
                        'catalog_domain_id': response_data.get('domain_id'),
                        'catalog_sold': response_data.get('sold'),
                        'catalog_permalink': response_data.get('permalink'),
                        'catalog_pictures': response_data.get('pictures'),
                        'attributes': attributes
                    })

            return self.return_success(data=data)


    @jwt_required
    @prepare
    def get_best_price(self, advertising_id):
        account = self.fetchone(f"""
            SELECT ad.tags, ac.id, ac.access_token, ac.access_token_created_at, ac.access_token_expires_at, ac.refresh_token 
            FROM meuml.advertisings ad 
            JOIN meuml.accounts ac ON ac.id = ad.account_id 
            WHERE ad.external_id = :id AND ac.status = 1 AND ac.user_id = {self.user['id']}
        """, {'id': advertising_id})

        if account is None:
            self.abort_json({
                'message': f"Anúncio deve pertencer a uma conta do Mercado Livre atualmente autenticada.",
                'status': 'error'
            }, 400)

        if 'best_price_eligible' not in account['tags']:
            self.abort_json({
                'message': f"Anúncio não elegível para destaque.",
                'status': 'error'
            }, 400)            

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 403)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.get(f'/items/{advertising_id}/best-price')

        if response.status_code != 200:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error'
            }, 502)

        response_data = response.json()

        return self.return_success(data=response_data)


    @jwt_required
    @prepare
    def apply_best_price(self, advertising_id):
        new_price = request.args.get('price')

        if not new_price or len(new_price) == 0 or not new_price.replace('.','').isdigit():
            self.abort_json({
                'message': f"Preço informado é inválido.",
                'status': 'error'
            }, 400)
        else:
            new_price = float(new_price)

        account = self.fetchone(f"""
            SELECT ad.tags, ac.id, ac.access_token, ac.access_token_created_at, ac.access_token_expires_at, ac.refresh_token 
            FROM meuml.advertisings ad 
            JOIN meuml.accounts ac ON ac.id = ad.account_id 
            WHERE ad.external_id = :id AND ac.status = 1 AND ac.user_id = {self.user['id']}
        """, {'id': advertising_id})

        if account is None:
            self.abort_json({
                'message': f"Anúncio deve pertencer a uma conta do Mercado Livre atualmente autenticada.",
                'status': 'error'
            }, 400)

        if 'best_price_eligible' not in account['tags']:
            self.abort_json({
                'message': f"Anúncio não elegível para destaque.",
                'status': 'error'
            }, 400)

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 403)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.get(f'/items/{advertising_id}/best-price')

        if response.status_code != 200:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error'
            }, 502)

        response_data = response.json()

        if float(response_data['winner_price']) != new_price:
            self.abort_json({
                'message': f"Atualização de preço cancelada pois o preço para obter destaque foi alterado pelo Mercado Livre.",
                'status': 'error'
            }, 409)

        response = ml_api.put(f'/items/{advertising_id}', json={
            'price': new_price
        })

        if response.status_code != 200:
            self.abort_json({
                'message': f"Erro ao atualizar preço do anúncio.",
                'status': 'error'
            }, response.status_code)

        return self.return_success(f"Preço atualizado para destaque especial em Catálogo.", {})


    @jwt_required
    @prepare
    def apply_price_to_win_conditions(self, advertising_id):
        self.validate(PriceToWinConditionsSchema())

        query = """
            SELECT ad.id, ad.external_id, ad.account_id, ad.listing_type_id, ad.free_shipping 
            FROM meuml.advertisings ad 
            WHERE ad.external_id = :id
        """
        advertising = self.fetchone(query, {'id': advertising_id})
        if not advertising:
            self.abort_json({
                'message': f"Anúncio não encontrado.",
                'status': 'error',
            }, 404)

        query = """
            SELECT ac.id, ac.user_id, ac.name, ac.access_token, ac.refresh_token, ac.access_token_expires_at   
            FROM meuml.accounts ac
            WHERE ac.id = :id AND ac.user_id = :user_id AND ac.status = 1
        """
        account = self.fetchone(query, {'id': advertising['account_id'], 'user_id': self.user['id']})
        if not account:
            self.abort_json({
                'message': f"Conta autenticada não encontrada.",
                'status': 'error',
            }, 404)

        access_token = self.refresh_token(account=account)
        if not access_token:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 403)

        ml_api = MercadoLibreApi(access_token=access_token['access_token'])
        conditions = {}

        if self.data.get('no_interest') and advertising['listing_type_id'] != 'gold_pro':
            response = ml_api.put(f'/items/{advertising_id}', json={'id': 'gold_pro'})
            response_data = response.json()

            if response.status_code != 200:
                self.abort_json({
                    'message': f"Não foi possível alterar o tipo de publicação (Oferta sem juros).",
                    'status': 'error',
                    'error': response_data
                }, response.status_code)
        
        if self.data.get('price'):
            conditions['price'] = self.data['price']
        
        if self.data.get('free_shipping') and advertising['free_shipping'] != 1:
            conditions['shipping'] = {
                "mode": "me2",
                "local_pick_up": False,
                "free_methods": [{
                    "id": 100009,
                    "rule": {
                        "free_mode": "country",
                        "value": None
                    }
                }]
            }

        if not conditions and (not self.data.get('no_interest') or advertising['listing_type_id'] == 'gold_pro'):
            self.abort_json({
                'message': f"Nenhuma condição disponível para atualização.",
                'status': 'error',
            }, 400)

        response = ml_api.put(f'/items/{advertising_id}', json=conditions)
        response_data = response.json()

        if response.status_code != 200:
            error_message = f"(Mercado Livre: {response_data['message']})" if response_data.get('message') else ''
            self.abort_json({
                'message': f"Não foi possível atualizar o anúncio {error_message}",
                'status': 'error',
                'errors': response_data
            }, response.status_code)

        return self.return_success(f"Anúncio atualizado com sucesso")
