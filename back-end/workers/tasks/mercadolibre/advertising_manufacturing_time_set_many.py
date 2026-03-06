import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn  
from libs.enums.access_type import AccessType      
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import get_tool, get_advertisings, get_account_advertisings_info
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits

LOG_ACCOUNT_NOT_FOUND = '[account_id="%s"] Account not found.'
LOG_TOOL_NOT_FOUND = '[tool_id="%s"] Tool not found.'

LOGGER = get_task_logger(__name__)


def advertising_manufacturing_time_set_many(pool, user_id: int, filter_query: str, filter_values: dict, days: int, tool=None, related_id=None):
    advertising_manufacturing_time_set_item = queue.signature('local_priority:advertising_manufacturing_time_set_item')

    action = QueueActions()
    action.conn = get_conn()

    try:
        if tool is None:
            tool = get_tool(action, 'alter-manufacturing-time')
        
        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool, related_id=related_id)

        # Atualiza anúncios por batch e altera preço quando finalizado
        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising, action)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    advertising_manufacturing_time_set_item.delay(
                        account_id=int(account_id),
                        tool=tool,
                        process_item_id=process_item_id,
                        ml_item_id=advertising,
                        days=days
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f'Prazo de Envio Anúncio #{advertising} - Operação não realizada (créditos insuficientes).')
    
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
