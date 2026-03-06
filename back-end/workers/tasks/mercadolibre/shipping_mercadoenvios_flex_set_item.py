
import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn  
from libs.enums.access_type import AccessType      
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from typing import Dict, Any
from workers.helpers import refresh_token, get_account, invalid_access_token
from workers.loggers import update_process_item
from workers.payment_helpers import rollback_credits_transaction

LOGGER = get_task_logger(__name__)

def shipping_mercadoenvios_flex_item(pool, account_id: int, tool: dict, process_item_id: int, ml_item_id: str, activate: bool, conn=None):
    response = None
    status_code = None
    message = ''

    try:
        action = QueueActions()
        action.conn = conn if conn else get_conn()

        account = get_account(action=action, account_id=account_id)
        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        if activate:
            # response = ml_api.post(f'/sites/MLB/shipping/selfservice/items/{ml_item_id}', json=None)
            response = ml_api.post(f'/flex/sites/MLB/items/{ml_item_id}/v2', json={})
        else:
            # response = ml_api.delete(f'/sites/MLB/shipping/selfservice/items/{ml_item_id}')
            response = ml_api.delete(f'/flex/sites/MLB/items/{ml_item_id}/v2')

        status_code = response.status_code
        
        if status_code in [204,400]:
            status = 'ativado' if activate else 'desativado'
            status = 'já ' + status if status_code == 400 else status
            status_code = 200
            message = f'Anúncio #{ml_item_id} - Mercado Envios Flex {status}.'
            update_process_item(process_item_id, response, True, action, message)
            
            old_tag = 'self_service_out' if activate else 'self_service_in'
            new_tag = 'self_service_in' if activate else 'self_service_out'
            query = f"""
                UPDATE meuml.advertisings 
                SET shipping_tags = REPLACE(shipping_tags::text,'{old_tag}','{new_tag}')::jsonb 
                WHERE external_id = :id
            """
            action.execute(query, {'id': ml_item_id})
        else:
            message = f'Anúncio #{ml_item_id} - Mercado Envios Flex não disponível para este anúncio.'
            update_process_item(process_item_id, response, False, action, message)

    except Exception as e:
        LOGGER.error(e)
        message = f'Anúncio #{ml_item_id} - Erro ao atualizar status Mercado Envios Flex.'
        return 500, message

    finally:
        if status_code != 200:
            credits_msg = ''
            if tool['access_type'] == AccessType.credits:
                rollback_credits_transaction(action, process_item_id, account['user_id'], tool['price'])
                credits_msg = ' (crédito restituído)'
            message = f'Anúncio #{ml_item_id} - Erro ao atualizar status Mercado Envios Flex{credits_msg}.'
            update_process_item(process_item_id, response, False, action, message)
        if pool is not None:
            action.conn.close()
    
    return (status_code, message)
