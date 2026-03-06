
import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn  
from libs.enums.access_type import AccessType      
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from typing import Dict, Any
from workers.helpers import refresh_token, get_account, invalid_access_token, get_tool
from workers.loggers import update_process_item
from workers.payment_helpers import rollback_credits_transaction

LOG_PLAIN_TEXT_NOT_CHANGED = ''
LOG_ACCOUNT_NOT_FOUND = '[seller_id="%s"] Account not found.'
LOG_SELLER_NOT_FOUND = '[seller_id="%s"] Seller not found.'
LOG_TOOL_NOT_FOUND = '[tool_id="%s"] Tool not found.'
LOG_ADVERTISING_NOT_FOUND = '[ml_item_id="%s"] Advertising not found.'
LOG_BALANCE_NOT_FOUND = '[ml_item_id="%s"] Balance not found.'
LOG_NOT_ENOUGH_BALANCE = '[seller_id="%s"] Not enough balance.'

LOGGER = get_task_logger(__name__)


def advertising_description_add_header_footer_item(pool, account_id: int, tool: dict, process_item_id: int, ml_item_id: str, header: str, footer: str, conn=None):
    action = QueueActions()
    action.conn = get_conn() if not conn else conn

    account = get_account(action=action, account_id=account_id)
    status_code = None
    response = None
    message = ''
    process_text = ''

    try:
        if account is None:
            LOGGER.error(LOG_ACCOUNT_NOT_FOUND, account_id)
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        advertising_description = fetch_description(ml_api, ml_item_id)
        plain_text = advertising_description.get('plain_text', '')

        if not header and not footer:
            LOGGER.warning(LOG_PLAIN_TEXT_NOT_CHANGED)
            return

        process_text = ''
        if header:
            process_text += ' cabeçalho'
            plain_text = f'{header}\n\n{plain_text}'
        if footer:
            process_text += ' rodapé'
            plain_text = f'{plain_text}\n\n{footer}'

        response = ml_api.put(f'/items/{ml_item_id}/description', json={
            'plain_text': plain_text,
        })
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
                'plain_text': plain_text,
            })
        
        status_code = response.status_code
        
        if response.status_code == 200:
            message = f'Descrição de Anúncio #{ml_item_id} - Texto de{process_text} atualizado com sucesso.'
            update_process_item(process_item_id, response, True, action, message)            
    
    except Exception as e:
        LOGGER.error(e)
        message = f'Descrição de Anúncio #{ml_item_id} - Erro ao atualizar texto de{process_text}.'
        return 500, message
    finally:
        if status_code != 200:
            credits_msg = ''
            if tool['access_type'] == AccessType.credits:
                rollback_credits_transaction(action, process_item_id, account['user_id'], tool['price'])
                credits_msg = '(crédito restituído)'
            update_process_item(process_item_id, response, False, action, f'Descrição de Anúncio #{ml_item_id} - Erro ao atualizar descrição de cabeçalho/rodapé {credits_msg}')
        if pool is not None:
            action.conn.close()
    
    return (status_code, message)


def fetch_description(ml_api: MercadoLibreApi, ml_item_id: str) -> Dict[str, Any]:
    response = ml_api.get(f'/items/{ml_item_id}/description')
    if response.status_code == 403:
        response = ml_api.get(f'/items/{ml_item_id}/description')
        
    return response.json()
