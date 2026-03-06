import json
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.translations.months import MonthsPTBR
from math import ceil


class ModerationsActions(Actions):
    @jwt_required
    @prepare
    def moderations(self):
        query = 'SELECT id, access_token_expires_at, access_token, refresh_token, name FROM meuml.accounts WHERE id=:account_id'
        account = self.fetchone(query, {'account_id': request.args.get('account_id')})

        if account is None:
            self.abort_json({
                'message': f"Nenhuma conta do Mercado Livre encontrada.",
                'status': 'error',
            }, 400)
        
        access_token = self.refresh_token(account=account)
        if not access_token:
            self.abort_json({
                'message': f"Não foi possível renovar o token de acesso ao Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']
        
        ml_api = MercadoLibreApi(access_token=access_token)
        
        page = int(request.args['page']) if request.args.get('page') else 1  
        limit = 20
        offset = (page-1) * limit
        
        params={
            'limit': limit,
            'offset': offset
        }

        if request.args.get('date_from'):
            params['date_created_since'] = request.args['date_from']

        if request.args.get('date_to'):
            params['date_created_to'] = request.args['date_to']

        if request.args.get('element_type'):
            params['element_type'] = request.args['element_type']

        if request.args.get('language'):
            params['language'] = request.args['language']

        if request.args.get('sort_order') and request.args['sort_order'] == 'asc':
            params['sort'] = 'date_created_asc'

        response = ml_api.get(
            f"/moderations/infractions/{account['id']}",
            params=params
        )
        
        response_data = response.json()
        status_code = response.status_code

        if status_code != 200:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre",
                'status': 'error',
                'error': response_data
            }, 502)

        results = response_data['infractions'] if response_data.get('infractions') else [] 

        data = []
        element_types = {'ITM': 'Anúncio', 'QUE': 'Pergunta/Resposta', 'REV': 'Opinião sobre produto'}
        for result in results:
            data.append({
                'id': result['id'],
                'date_created': result['date_created'],
                'account_id': account['id'],
                'account_name': account['name'],
                'element_id': result['element_id'],
                'element_type': element_types.get(result['element_type'],result['element_type']),
                'related_item_id': result['related_item_id'],
                'reason': result['reason'],
                'remedy': result['remedy'],

            })

        total = response_data['paging']['total'] if response_data else 0
        last_page = ceil(total / limit)
        meta = {
            'total': total,
            'offset': offset,
            'limit': limit,
            'pages': last_page + 1,
            'page': page,
            'next_page': page + 1,
            'previous_page': page-1,
            'last_page': last_page,
            'first_page': 1
        }
        
        return self.return_success(data=data, meta=meta)


    @jwt_required
    @prepare
    def get_total_moderated_advertisings_by_account(self):
        query = """
            SELECT id, access_token_expires_at, access_token, refresh_token, name 
            FROM meuml.accounts 
            WHERE user_id = :user_id 
            AND status = 1
            ORDER BY name
        """
        accounts = self.fetchall(query, {'user_id': self.user['id']})

        if not accounts:
            self.abort_json({
                'message': f"Nenhuma conta autenticada do Mercado Livre encontrada.",
                'status': 'error',
            }, 400)
        
        data = []
        for account in accounts:
            access_token = self.refresh_token(account=account)
            if access_token:
                access_token = access_token['access_token']
                
                ml_api = MercadoLibreApi(access_token=access_token)
                response = ml_api.get(f'/users/{account["id"]}/items/search?status=pending')
                response_data = response.json()

                data.append({
                    'account_id': account['id'],
                    'account_name': account['name'],
                    'moderated_advertisings': None if response.status_code != 200 else response_data['paging']['total'] 
                })

        return self.return_success(data=data)
