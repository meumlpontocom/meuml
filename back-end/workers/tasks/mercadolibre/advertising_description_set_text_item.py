from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn  
from libs.enums.access_type import AccessType      
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import refresh_token, invalid_access_token, get_account
from workers.loggers import update_process_item
from workers.payment_helpers import rollback_credits_transaction

LOG_PLAIN_TEXT_NOT_CHANGED = ''
LOG_ACCOUNT_NOT_FOUND = '[account_id="%s"] Account not found.'
LOG_TOOL_NOT_FOUND = '[tool_id="%s"] Tool not found.'
LOG_ADVERTISING_NOT_FOUND = '[ml_item_id="%s"] Advertising not found.'
LOG_BALANCE_NOT_FOUND = '[ml_item_id="%s"] Balance not found.'
LOG_NOT_ENOUGH_BALANCE = '[seller_id="%s"] Not enough balance.'

LOGGER = get_task_logger(__name__)


def advertising_description_text_set_item(pool, account_id: int, tool: dict, ml_item_id: str, description: str, process_item_id: int, conn=None):
    action = QueueActions()
    action.conn = get_conn() if not conn else conn

    account = get_account(action=action, account_id=account_id)
    status_code = None
    response = None

    try:
        if account is None:
            LOGGER.error(LOG_ACCOUNT_NOT_FOUND, account_id)
            return

        query = 'SELECT * FROM meuml.advertisings WHERE account_id = :account_id AND external_id = :external_id'
        
        advertising = action.fetchone(query, {'external_id': ml_item_id, 'account_id': account_id})

        if advertising is None:
            LOGGER.error(LOG_ADVERTISING_NOT_FOUND, ml_item_id)
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.put(f'/items/{ml_item_id}/description', json={
                                'plain_text': description,
                            })
        status_code = response.status_code

        if response.status_code == 403:
            access_token = action.refresh_token(account=account)
            if access_token == False:
                action.abort_json({
                    'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                    'status': 'error',
                }, 400)
            else:
                access_token = access_token['access_token']
            ml_api = MercadoLibreApi(access_token=access_token)
            response = ml_api.put(f'/items/{ml_item_id}/description', json={
                'plain_text': description,
            })

        status_code = response.status_code

        if response.status_code == 200:
            message = f'Descrição de Anúncio #{ml_item_id} - Texto fixo atualizado com sucesso.'
            update_process_item(process_item_id, response, True, action, message)
    
    except Exception as e:
        LOGGER.error(e)
    finally:
        if status_code != 200:
            credits_msg=''
            if tool['access_type'] == AccessType.credits:
                rollback_credits_transaction(action, process_item_id, account['user_id'], tool['price'])
                credits_msg = '(crédito restituído)'
            message = f'Descrição de Anúncio #{ml_item_id} - Erro ao atualizar texto fixo {credits_msg}'
            update_process_item(process_item_id, response, False, action, message)
        if pool is not None:
            action.conn.close()
    return (status_code, message)