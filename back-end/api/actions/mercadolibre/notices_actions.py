import json
import requests
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from marshmallow import ValidationError

class NoticesActions(Actions):
    @jwt_required
    @prepare
    def show_notices(self):
        query = "SELECT * FROM meuml.accounts WHERE status=1 AND user_id = %s "
        values = (self.user['id'],)

        if len(request.args.get('account_id', '')) > 0:
            accs = request.args.get('account_id').split(',')
            values = (self.user['id'], *accs)
            query += f'AND id IN (%s{", %s"*(len(accs)-1)})'

        accounts = self.fetchall(query, values)
        accounts_token = [self.refresh_token(account, platform="ML") for account in accounts]
        accounts_token = [token for token in accounts_token if token]

        if len(accounts_token) == 0:
            self.abort_json({
                'message': f'É necessário possuir uma conta do Mercado Livre autenticada para continuar.',
                'status': 'error',
            }, 403)
             
        try:
            data = {}

            for i, account in enumerate(accounts):
                ml_api = MercadoLibreApi(access_token=accounts_token[i]['access_token'])

                account_id_str = str(account['id'])
                
                data[account_id_str] = {
                    'notices': [],
                    'total_notices': 0
                }
                
                token = self.refresh_token(account, account['refresh_token'])
                loop = True

                while loop:
                    loop = False
                    response = ml_api.get('/communications/notices', params={
                            'access_token': token['access_token'],
                            'limit': request.args.get('limit', 20),
                            'offset': request.args.get('offset', 0)
                        })

                    if response.status_code == 200:
                        response = response.json()
                        data[account_id_str]['notices'] += response.get('results', [])
                        paging = response.get('paging', {})

                        if paging.get('offset', 0) + paging.get('limit', 0) < paging.get('total', 0):
                            loop = True
                data[account_id_str]['total_notices'] = len(data[account_id_str]['notices'])

        except Exception as e:
            print(e)
            self.abort_json({
                'message': f'Internal error.',
                'status': 'error'
            }, 500)

        return self.return_success("Novidades do Mercado Livre", data)