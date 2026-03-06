from flask_jwt_simple import jwt_required

from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.queue.queue import app as queue

class AdminActions(Actions):

    @jwt_required
    @prepare
    def get_all_users_blocked_by_account(self, account_id: int):

        query_account = 'select id, external_name, user_id, access_token, access_token_expires_at, refresh_token FROM meuml.accounts where id = :account_id'

        account = self.fetchone(query_account, {
            'account_id': account_id
        })

        if account is None:
            print(f'Account {account_id} não localizado')

        ml_api = MercadoLibreApi(access_token=account['access_token'])

        bids_data = ml_api.get(f'/users/{account_id}/order_blacklist').json()

        bids_users_id: list = []
        for bids_item in bids_data:

            id = bids_item['user']['id']
            bids_users_id.append(id)

        questions_offset = 0
        questions_limit = 50

        questions_users_id: list = []
        while True:

            questions_data = ml_api.get(f'/users/{account_id}/questions_blacklist', params={
                'offset': questions_offset,
                'limit': questions_limit
            }).json()

            questions_len = len(questions_data['users'])

            if questions_len > 0:
                questions_offset += questions_limit

            for question_item in questions_data['users']:

                id = question_item['id']

                questions_users_id.append(id)


        return self.return_success(
            "Desbloqueio iniciado",
            {
                'questions_users_id': questions_users_id,
                'bids_users_id': bids_users_id
            }
        )

    @jwt_required
    @prepare
    def unblock_all_customers_ml(self):

        query = 'select id, user_id, access_token,refresh_token FROM meuml.accounts where user_id = :user_id'
        values = {
            'user_id': self.user['id']
        }

        accounts = self.fetchall(query, values)

        if accounts is None:
            self.abort_json(
                {
                    'errors': ['Sem acesso ao access_token do id informado'],
                    'message': "Não foi possível desbloquear compradores"
                },
                422
            )

        for account in accounts:
            unblock_task = queue.signature(
                'short_running:unblock_all_customers_from_account')
            unblock_task.delay(account_id=account['id'])

        return self.return_success(
            "Desbloqueio iniciado",
            {}
        )

