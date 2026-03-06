import json
import math
import re
import traceback
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.enums.access_type import AccessType   
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access, user_subscripted_accounts
from libs.schema.advertisings_schema import AdvertisingUpdatePriceSchema
from marshmallow import ValidationError

class StatsActions(Actions):
    @jwt_required
    @prepare
    def get_quality_grid(self):
        tool = self.get_tool('advertisings-positions')
        subscripted_accounts = user_subscripted_accounts(self, self.user['id'])
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=subscripted_accounts, tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        fields = ['ac.id AS "account_id"', 'ac.name AS "account"', 'ad.external_id', 'ad.title', 'ad.secure_thumbnail', 
                 'ad.status', 'ad.tags', 'ad.catalog_listing', "ad.sku",
                 'COALESCE(CAST(ap.position AS varchar(15)),\'Não Disponível\') AS "position"',
                 'COALESCE(CAST(av.qtd_visitas AS varchar(15)),\'Não Disponível\') AS "visits"',
                 'COALESCE(CAST((ad.quality*100)::int AS varchar(15)),\'Não Disponível\') AS "quality"']    

        values = {'user_id': self.user['id']}

        grid_day = datetime.now() - timedelta(days=1)
        values['position_at'] = datetime.strptime(f'{grid_day.year}-{grid_day.month}-{grid_day.day}', "%Y-%m-%d")       
        date_id = self.fetchone(f'SELECT dw.get_data_id(\'{values["position_at"]}\') as initial, dw.get_data_id(current_date) as current')
        values['visits_at'] = date_id['initial'] if date_id['initial'] else -1

        # visits_table = "dw.f_advertising_visits" if not date_id['initial'] or date_id['initial'] > date_id['current']-90 else "historic.advertising_visits_hist"
        visits_table = "dw.f_advertising_visits"

        query = f"""
            SELECT {",".join(fields)} 
            FROM meuml.advertisings ad 
            LEFT JOIN meuml.advertising_positions ap 
                ON ad.external_id = ap.advertising_id AND ap.position_at = :position_at 
            LEFT JOIN {visits_table} av 
                ON ad.external_id = av.advertising_id AND av.data_id = :visits_at 
            JOIN meuml.accounts ac ON ad.account_id = ac.id 
        """  

        add_query = " AND ad.account_id IN ("
        for account_id in subscripted_accounts:
            add_query += str(account_id) + ","
        add_query = add_query[:-1] + ") "

        values, query, total, *_ = self.apply_filter(request, query, values=values, additional_conditions=add_query)

        query = self.order(request, fields, query, change_default_order='quality')
        params, query = self.paginate(request, query)
        
        try:
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

            response = ml_api.get('/sites/MLB/health_levels')
            quality_levels = {}
            levels_pt = self.get_levels_pt()

            if response.status_code == 200:
                response_data = response.json()

                for level in response_data:
                    quality_levels[levels_pt.get(level['level'],level['level'])] = level['health_max'] * 100

            advertisings = self.fetchall(query, values)

            for advertising in advertisings:
                advertising['pictures_status'] = 'Neutra'
                if 'good_quality_picture' in advertising['tags'] or 'good_quality_thumbnail' in advertising['tags'] :
                    advertising['pictures_status'] = 'Boa'

                elif 'poor_quality_picture' in advertising['tags'] or 'poor_quality_thumbnail' in advertising['tags']:
                    advertising['pictures_status'] = 'Ruim'

                if advertising['quality'].isdigit():
                    quality = int(advertising['quality'])

                    if quality < 60:
                        advertising['quality_color'] = 'red'
                    elif quality < 80:
                        advertising['quality_color'] = 'yellow'
                    elif quality < 100:
                        advertising['quality_color'] = 'green'
                    else:
                        advertising['quality_color'] = 'dark-green'

                    for level, health_max in quality_levels.items():
                        if quality <= health_max:
                            advertising['level'] = level
                            break
                else:
                    advertising['quality_color'] = None
                # advertising.pop('tags', None)

        except Exception as e:
            print(traceback.format_exc()) 
            self.abort_json({
                'message': f'Erro ao localizar anúncios.',
                'status': 'error',
            }, 400)

        meta = self.generate_meta(params, total)

        if total == 0:
            return self.return_success('Nenhum anúncio encontrado.', {}, meta=meta)        

        return self.return_success(data=advertisings, meta=meta)


    @jwt_required
    @prepare
    def get_advertising_quality_details(self):
        query = """
            SELECT ac.*, ad.status as advertising_status
            FROM meuml.advertisings ad 
            JOIN meuml.accounts ac ON ad.account_id = ac.id 
            WHERE ad.external_id = :id
        """
        advertising_id = request.args.get('advertising_id')
        account = self.fetchone(query, {'id': advertising_id})

        if account is None:
            self.abort_json({
                'message': f"Não foi possível encontrar a conta Mercado Livre.",
                'status': 'error',
            }, 400)

        if account['advertising_status'] != 'active':
            self.abort_json({
                'message': f"Os detalhes de qualidade estão disponíveis apenas para anúncios ativos.",
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
        advertising_id = request.args.get('advertising_id')
        levels_pt = self.get_levels_pt()
        quality_goals_pt = self.get_quality_goals_pt()

        goals_response = ml_api.get(f'/items/{advertising_id}/health')
        goals_data = goals_response.json()

        if goals_response.status_code != 200:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error',
                'errors': goals_data
            }, 502)
        
        actions_response = ml_api.get(f'/items/{advertising_id}/health/actions')
        actions_data = actions_response.json()

        if actions_response.status_code != 200:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error',
                'errors': actions_data
            }, 502)

        goals = []
        for goal in goals_data['goals']:
            goal['description'] = quality_goals_pt.get(goal['id'])
            goals.append(goal)

        actions = []
        for action in actions_data['actions']:
            action['description'] =  quality_goals_pt.get(action['id'])
            actions.append(action)

        data = {
            'id': advertising_id,
            'quality': int(goals_data['health'] * 100),
            'level': levels_pt.get(goals_data['level'], goals_data['level']),
            'goals': goals,
            'actions': actions
        }
        
        return self.return_success(data=data)


    @jwt_required
    @prepare
    def get_advertising_position_details(self):
        values = {}
        conditions = []

        if 'advertising_id' in request.args:
            conditions.append('ap.advertising_id = :advertising_id')
            values['advertising_id'] = request.args['advertising_id']
        else:
            self.abort_json({
                'message': f'Informe o ID do anúncio.',
                'status': 'error'
            }, 400)

        fields = ['ad.id, ad.external_id', 'ad.date_created', 'ad.last_updated AS "date_modified"', 'ad.title', 'ad.price', 'ad.free_shipping', 'ad.listing_type_id as "listing_type"', 'ad.account_id',
                 'ad.condition', 'ad.status', 'ad.sold_quantity', 'ad.available_quantity', 'ac.external_name',
                 'ad.catalog_status', 'ad2.title AS "original_title"', 'ad.category_id',  'COALESCE(CAST((ad.quality*100)::int AS varchar(15)),\'Não Disponível\') AS "quality"',
                 'ad.secure_thumbnail', 'ad.tags', 'ad.catalog_listing', 'ad.catalog_product_id', 'ad.domain_id', 'ad.eligible', 'ad.variations',
                 'ad.catalog_product_name', 'ad.item_relations', 'ad.original_price']

        query = f'SELECT ' + ', '.join(fields) + ' FROM meuml.advertisings ad JOIN meuml.accounts ac ON ad.account_id = ac.id '
        query += 'LEFT JOIN meuml.catalog_advertisings ca ON ad.external_id = ca.catalog_advertising_id '
        query += 'LEFT JOIN meuml.advertisings ad2 ON ad2.external_id = ca.advertising_id '
        query += 'JOIN meuml.users u ON ac.user_id = u.id '
        query += 'WHERE ad.external_id = :advertising_id AND u.id=:user_id'
        values['user_id'] = self.user['id'] 
        advertising = self.fetchall(query, values)
        del values['user_id']
        
        if len(advertising) > 0:
            advertising = advertising[0]
            advertising['external_data'] = {}
            advertising['external_data']['secure_thumbnail'] = advertising['secure_thumbnail']
            advertising['external_data']['tags'] = advertising.pop('tags').split(',') if advertising['tags'] else ''
            advertising['external_data']['catalog_listing'] = advertising.pop('catalog_listing')
            advertising['external_data']['catalog_product_id'] = advertising.pop('catalog_product_id')
            advertising['external_data']['domain_id'] = advertising.pop('domain_id')
            advertising['free_shipping'] = advertising['free_shipping']
            advertising['external_data']['variations'] = advertising.pop('variations',[])
            advertising['external_data']['eligible'] = advertising.pop('eligible',0)
            advertising['external_data']['catalog_product_name'] = advertising.pop('catalog_product_name')

            advertising['external_data']['item_relations'] = advertising.pop('item_relations',[])
            if advertising['original_title']:
                advertising['external_data']['item_relations'][0]['original_title'] = advertising['original_title']
        else:
            self.abort_json({
                'message': f'Anúncio não encontrado.',
                'status': 'error'
            }, 400)

        tool = self.get_tool('advertisings-positions')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=[advertising['account_id']], tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)
    
        conditions = [] 
        conditions.append('dt >= :window_from')
        last_month = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        window_from = datetime.strptime(request.args.get('window_from', last_month), "%Y-%m-%d")
        values['window_from'] = window_from

        conditions.append('dt <= :window_to')
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        window_to = datetime.strptime(request.args.get('window_to', yesterday), "%Y-%m-%d")
        values['window_to'] = window_to

        if window_from > window_to:
            self.abort_json({
                'message': f'Data de início maior que data final.',
                'status': 'error'
            }, 400)
        
        days = (window_to - window_from).days + 1
        query = 'SELECT ap.position, TO_CHAR(dt, \'MM/DD/YYYY\') AS "position_at" FROM meuml.advertising_positions ap '
        query += f"""
                RIGHT JOIN (
                    select i::date as dt
	                from generate_series('{window_from}', '{window_to}', '1 day'::interval) i
                ) data_table 
        """
        query += 'ON dt = POSITION_AT AND ap.ADVERTISING_ID=:advertising_id WHERE '
        query += ' AND '.join(conditions)
        query += ' ORDER BY dt ASC'
        
        positioning_info = [] 
       
        try:
            positioning_info = self.fetchall(query, values)

        except Exception as e:
            print(e)

        data = {
            'advertising': advertising,
            'positions': positioning_info
        }
       
        return self.return_success(data=data)


    @jwt_required
    @prepare
    def get_advertising_visits_details(self):
        values = {}
        conditions = []

        if 'advertising_id' in request.args:
            conditions.append('ap.advertising_id = :advertising_id')
            values['advertising_id'] = request.args['advertising_id']
        else:
            self.abort_json({
                'message': f'Informe o ID do anúncio.',
                'status': 'error'
            }, 400)

        fields = ['ad.id, ad.external_id', 'ad.date_created', 'ad.last_updated AS "date_modified"', 'ad.title', 'ad.price', 'ad.free_shipping', 'ad.listing_type_id as "listing_type"', 'ad.account_id',
                 'ad.condition', 'ad.status', 'ad.sold_quantity', 'ad.available_quantity', 'ac.external_name',
                 'ad.catalog_status', 'ad2.title AS "original_title"', 'ad.category_id',  'COALESCE(CAST((ad.quality*100)::int AS varchar(15)),\'Não Disponível\') AS "quality"',
                 'ad.secure_thumbnail', 'ad.tags', 'ad.catalog_listing', 'ad.catalog_product_id', 'ad.domain_id', 'ad.eligible', 'ad.variations',
                 'ad.catalog_product_name', 'ad.item_relations', 'ad.original_price']

        query = f"""
            SELECT {', '.join(fields)} 
            FROM meuml.advertisings ad 
            JOIN meuml.accounts ac ON ad.account_id = ac.id 
            LEFT JOIN meuml.catalog_advertisings ca ON ad.external_id = ca.catalog_advertising_id 
            LEFT JOIN meuml.advertisings ad2 ON ad2.external_id = ca.advertising_id 
            JOIN meuml.users u ON ac.user_id = u.id 
            WHERE ad.external_id = :advertising_id AND u.id=:user_id
        """
        values['user_id'] = self.user['id'] 
        advertising = self.fetchall(query, values)
        del values['user_id']
        
        if len(advertising) > 0:
            advertising = advertising[0]
            advertising['external_data'] = {}
            advertising['external_data']['secure_thumbnail'] = advertising['secure_thumbnail']
            advertising['external_data']['tags'] = advertising.pop('tags').split(',') if advertising['tags'] else ''
            advertising['external_data']['catalog_listing'] = advertising.pop('catalog_listing')
            advertising['external_data']['catalog_product_id'] = advertising.pop('catalog_product_id')
            advertising['external_data']['domain_id'] = advertising.pop('domain_id')
            advertising['free_shipping'] = advertising['free_shipping']
            advertising['external_data']['variations'] = advertising.pop('variations',[])
            advertising['external_data']['eligible'] = advertising.pop('eligible',0)
            advertising['external_data']['catalog_product_name'] = advertising.pop('catalog_product_name')

            advertising['external_data']['item_relations'] = advertising.pop('item_relations',[])
            if advertising['original_title']:
                advertising['external_data']['item_relations'][0]['original_title'] = advertising['original_title']
        else:
            self.abort_json({
                'message': f'Anúncio não encontrado.',
                'status': 'error'
            }, 400)

        tool = self.get_tool('advertisings-visits')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=[advertising['account_id']], tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)
    
        last_month = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        window_from = datetime.strptime(request.args.get('window_from', last_month), "%Y-%m-%d")
        # values['window_from'] = window_from

        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        window_to = datetime.strptime(request.args.get('window_to', yesterday), "%Y-%m-%d")
        # values['window_to'] = window_to

        if window_from > window_to:
            self.abort_json({
                'message': f'Data de início maior que data final.',
                'status': 'error'
            }, 400)
        
        date_ids = self.fetchone(f"SELECT dw.get_data_id('{window_from}') as initial, dw.get_data_id('{window_to}') as final, dw.get_data_id(current_date) as current ")

        # visits_table = "dw.f_advertising_visits" if date_ids['initial'] > date_ids['current']-90 else "historic.advertising_visits_hist"
        visits_table = "dw.f_advertising_visits"

        query = f"""
            SELECT av.qtd_visitas as visits, TO_CHAR(dd.data_date, \'MM/DD/YYYY\') AS "visits_at" 
            FROM dw.dim_datas dd 
            LEFT JOIN {visits_table} av
                ON av.advertising_id=:advertising_id AND av.data_id = dd.id
            WHERE av.data_id BETWEEN {date_ids['initial']} AND {date_ids['final']}  
            ORDER BY dd.data_date ASC
        """
        visits_info = [] 

        try:
            visits_info = self.fetchall(query, values)

        except Exception as e:
            print(e)

        # Generate daily data when window outside of dw.dim_datas
        if len(visits_info) == 0:
            day = window_from
            while True:
                visits_info.append({'visits_at': day.strftime("%m/%d/%Y"), 'visits': None})
                if day >= window_to:
                    break
                day = day + timedelta(days=1)

        data = {
            'advertising': advertising,
            'visits': visits_info
        }
       
        return self.return_success(data=data)


    @jwt_required
    @prepare
    def position_improvement_recommendations(self):
        advertising = self.fetchone('SELECT * FROM meuml.advertisings WHERE external_id = :id', {'id': request.args.get('advertising_id')})
        if advertising is None:
            self.abort_json({
                'message': f'Anúncio não encontrado.',
                'status': 'error'
            }, 400)

        advertising_recommendations = [
            {
                'message': 'Qualidade profissional',
                'status': True if advertising['catalog_status'] == '2' or advertising['quality'] == 1 else False
            },
            {
                'message': 'Tipo de anúncio Premium',
                'status': True if advertising['listing_type_id'] == 'gold_pro' else False
            },
            {
                'message': 'Mercado Envios',
                'status': True if 'me' in advertising['shipping_mode'] else False
            },
            {
                'message': 'Frete grátis',
                'status': True if advertising['free_shipping'] else False
            },
            {
                'message': 'Mercado Pago',
                'status': True if advertising.get('accepts_mercadopago') else False
            },        
            {
                'message': 'Parcelamento sem juros',
                'status': True if advertising.get('external_data',{}).get('installments', {}).get('rate') == 0 else False
            },
            {
                'message': 'Foto(s) de qualidade',
                'status': True if 'good_quality_picture' in advertising['tags'] else False
            },
            {
                'message': 'Boa descrição técnica',
                'status': True if 'incomplete_technical_specs' not in advertising['tags'] else False
            },
            {
                'message': 'Preço competitivo',
                'status': True if 'not_market_price' not in advertising['tags'] else False
            }
        ]

        return self.return_success(data=advertising_recommendations)


    def get_levels_pt(self):
        return {
            'basic': 'Qualidade Básica',
            'standard': 'Qualidade Satisfatória',
            'professional': 'Qualidade Profissional'
        }     


    def get_quality_goals_pt(self):
        return {
            'technical_specification': 'verificar a qualidade dos atributos e completar ficha técnica.',
            'buybox': 'publicar em catálogo.',
            'variations': 'utilizar variações para a publicação.',
            'product_identifiers': 'informar código universal do produto.',
            'picture': 'verificar qualidade das imagens.',
            'price': 'publicar com preço mais competitivo.',
            'me2': 'utilizar Mercado Envios na publicação.',
            'free_shipping': 'oferecer frete grátis.',
            'flex': 'utilizar Mercado Envios Flex.',
            'immediate_payment': 'utilizar Mercado Pago (tag immediate_payment).',
            'classic': 'publicar um anúncio com exposição clássico.',
            'premium': 'publicar anúncio como premium (parcelamento sem juros).',
            'size_chart': 'informar a tabela de medidas.',
            'publish': 'publicar um anúncio.'
        }
