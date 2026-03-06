from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.schema.ipfilter_schema import IPListSchema
from os import getenv

class IPFilterActions(Actions):
    @jwt_required
    @prepare
    def delete(self):
        self.validate(IPListSchema())

        query = """
            SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token, us.is_admin
            FROM meuml.users us
            JOIN meuml.accounts ac
                ON ac.user_id = us.id
            WHERE us.id = :id AND ac.status = 1
            LIMIT 1
        """

        account = self.fetchone(query, {'id': self.user['id']})

        if not account:
            self.abort_json({
                'message': f"Usuário não possui contas do Mercado Livre ativas.",
                'status': 'error',
            }, 400)

        if not account['is_admin']:
            self.abort_json({
                'message': f"Apenas administradores possuem permissão de gerenciamento de IPs.",
                'status': 'error',
            }, 403)

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.post(
            path='/auth-traffic/ip-segmentation/remove-ip-entry',
            json={
                'client_id': getenv('CLIENT_ID'),
                'ip_list': self.data['ip_list']
            }
        )

        return self.return_success(data=response.json())


    @jwt_required
    @prepare
    def get(self):
        query = """
            SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token, us.is_admin
            FROM meuml.users us
            JOIN meuml.accounts ac
                ON ac.user_id = us.id
            WHERE us.id = :id AND ac.status = 1
            LIMIT 1
        """

        account = self.fetchone(query, {'id': self.user['id']})

        if not account:
            self.abort_json({
                'message': f"Usuário não possui contas do Mercado Livre ativas.",
                'status': 'error',
            }, 400)

        if not account['is_admin']:
            self.abort_json({
                'message': f"Apenas administradores possuem permissão de gerenciamento de IPs.",
                'status': 'error',
            }, 403)

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.get(f'/auth-traffic/ip-segmentation/ip-entries/{getenv("CLIENT_ID")}')

        return self.return_success(data=response.json())


    @jwt_required
    @prepare
    def store(self):
        self.validate(IPListSchema())

        query = """
            SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token, us.is_admin
            FROM meuml.users us
            JOIN meuml.accounts ac
                ON ac.user_id = us.id
            WHERE us.id = :id AND ac.status = 1
            LIMIT 1
        """

        account = self.fetchone(query, {'id': self.user['id']})

        if not account:
            self.abort_json({
                'message': f"Usuário não possui contas do Mercado Livre ativas.",
                'status': 'error',
            }, 400)

        if not account['is_admin']:
            self.abort_json({
                'message': f"Apenas administradores possuem permissão de gerenciamento de IPs.",
                'status': 'error',
            }, 403)

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.post(
            path='/auth-traffic/ip-segmentation/add-ip-entry',
            json={
                'client_id': getenv('CLIENT_ID'),
                'ip_list': self.data['ip_list']
            }
        )

        return self.return_success(data=response.json())
