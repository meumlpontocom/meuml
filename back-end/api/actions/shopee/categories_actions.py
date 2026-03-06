from flask import request
from flask_jwt_simple import jwt_required
import requests
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.shopee_api.shopee_api import ShopeeApi


class ShopeeCategoriesActions(Actions):
    @jwt_required
    @prepare
    def categories_tree(self):
        accounts_query = """
            SELECT id, access_token, access_token_expires_in,
                refresh_token, refresh_token_expires_in
            FROM shopee.accounts
            WHERE user_id = :user_id AND internal_status = 1
        """
        sp_accounts = self.fetchall(
            accounts_query, {'user_id': self.user['id']}
        )

        accounts_token = [
            self.refresh_token(account, platform="SP") for account in sp_accounts
        ]

        accounts_token = [token for token in accounts_token if token]

        if len(accounts_token) == 0:
            self.abort_json({
                'message': f'É necessário possuir uma conta da Shopee autenticada para continuar.',
                'status': 'error',
            }, 403)

        sp_api = ShopeeApi(
            access_token=accounts_token[0]['access_token'],
            shop_id=accounts_token[0]['account_id']
        )

        data = {}

        if request.method == 'GET':
            response_category = sp_api.get(
                path='/api/v2/product/get_category', version='v2',
                additional_params={'language': 'pt-br'}
            )

            if response_category.status_code != 200:
                self.abort_json({
                    'message': 'Erro ao comunicar-se com a Shopee.',
                    'status': 'error',
                    'error': f'Status Code: {response_category.status_code}',
                    'details': response_category.text  
                }, 502)

            try:
                response_category_json = response_category.json()
            except requests.exceptions.JSONDecodeError as e:
                self.abort_json({
                    'message': 'Erro ao decodificar a resposta da Shopee. Formato inválido.',
                    'status': 'error',
                    'details': response_category.text 
                }, 502)

            if response_category_json.get('error'):
                self.abort_json({
                    'message': 'Erro de comunicação com a Shopee.',
                    'status': 'error',
                    'error': response_category_json['error']
                }, 502)

            data = response_category_json.get('response', {}).get('category_list', [])

            return self.return_success(data=data)


    @jwt_required
    @prepare
    def category_predictor(self):
        accounts_query = """
            SELECT id, access_token, access_token_expires_in,
                   refresh_token, refresh_token_expires_in
            FROM shopee.accounts
            WHERE user_id = :user_id AND internal_status = 1
        """
        sp_accounts = self.fetchall(
            accounts_query, {'user_id': self.user['id']}
        )

        accounts_token = [
            self.refresh_token(account, platform="SP") for account in sp_accounts
        ]

        accounts_token = [token for token in accounts_token if token]

        if len(accounts_token) == 0:
            self.abort_json({
                'message': f'É necessário possuir uma conta da Shopee autenticada para continuar.',
                'status': 'error',
            }, 403)

        sp_api = ShopeeApi(
            access_token=accounts_token[0]['access_token'],
            shop_id=accounts_token[0]['account_id']
        )

        title = request.args.get('title')

        if not title or len(title) == 0:
            self.abort_json({
                'message': f'Preencha o título do anúncio',
                'status': 'error'
            }, 400)

        response_recommend = sp_api.get(
            path='/api/v2/product/category_recommend', version='v2',
            additional_params={'item_name': title}
        )

        response_recommend_json = response_recommend.json()
        print('recommended category -> ', response_recommend_json)

        if response_recommend.status_code not in [200, 201] or (response_recommend_json.get('error') and response_recommend_json.get('error').strip()):
            self.abort_json({
                'message': f'Erro de comunicação com a Shopee. Por favor, tente novamente',
                'path': '/api/v2/product/category_recommend',
                'status': 'error',
                'error': response_recommend_json
            }, 502)

        category_ids = response_recommend_json['response']

        return self.return_success(data=category_ids)
