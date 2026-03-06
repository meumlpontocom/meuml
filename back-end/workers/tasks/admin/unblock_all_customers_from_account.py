from workers.helpers import  refresh_token
from celery.utils.log import get_task_logger
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn

LOGGER = get_task_logger(__name__)

def get_account(action: QueueActions, account_id: int):

    query_account = 'select id, external_name, user_id, access_token, access_token_expires_at, refresh_token FROM meuml.accounts where id = :account_id'

    account = action.fetchone(query_account, {
        'account_id': account_id
    })


    if account is None:
        print(f'Account {account_id} não localizado')
    return account

def get_access_token(action: QueueActions, account: dict):

    return refresh_token(account, action, True)


def unblock_all_customers_from_account(conn, account_id):

    action = QueueActions()
    action.conn = get_conn()

    try:

        account = get_account(action=action, account_id=account_id)

        access_token = refresh_token(action=action, account=account)
        #print(access_token)
        if access_token == False:
            print(f'Não foi possível renovar o token da conta {account_id}')
            return False
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        bids_data = ml_api.get(f'/users/{account_id}/order_blacklist').json()
        
        print(bids_data)
        for bids_item in bids_data:
            
            id = bids_item['user']['id']

            try:
                reqd = ml_api.delete(f'/users/{account_id}/order_blacklist/{id}')
                #ptint(reqd)
                print(f'Usuário: {id} deletado com sucesso bids')
            except:
                print(f'Erro ao deletar usuário: {id}')



        questions_offset = 0
        questions_limit = 50
        questions_len = 50

        stop = False
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
                    print(id)
                    # print(account_id)
                    try:
                        reqd = ml_api.delete(f'/users/{account_id}/questions_blacklist/{id}')

                        if reqd.status_code != 200:
                            print(reqd.json())
                        # print(reqd)
                        print(reqd.json())
                        # print(f'Usuário: {id} deletado com sucesso questions')
                    except:
                        print(f'Erro ao deletar usuário: {id}')

            else:
                print('Todos os usuários desbloqueados para perguntas')
                break
        query = 'DELETE FROM meuml.blacklists WHERE account_id = :account_id'
        action.execute(query,  {'account_id': account_id})
        
        query = 'DELETE FROM meuml.blacklist_orders WHERE account_id = :account_id'
        action.execute(query,  {'account_id': account_id})
        
        query = 'DELETE FROM meuml.blacklist_questions WHERE account_id = :account_id'
        action.execute(query,  {'account_id': account_id})

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()