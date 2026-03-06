from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.access_type import AccessType      
from libs.queue.queue import app as queue
from workers.helpers import get_tool, get_advertisings, get_account_advertisings_info
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits

LOGGER = get_task_logger(__name__)

def shipping_mercadoenvios_flex_many(pool, user_id: int, filter_query: str, filter_values: dict, activate: bool):
    try:
        mercadoenvios_flex_set_item = queue.signature('long_running:mercadoenvios_flex_set_item')

        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, 'change-mercadoenvios-flex')
        if tool is None:
            LOGGER.error('Tool not found')
            return
        
        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)

        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising, action)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    mercadoenvios_flex_set_item.delay(
                        account_id=int(account_id),
                        tool=tool,
                        process_item_id=process_item_id,
                        ml_item_id=advertising,
                        activate=activate
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f'Anúncio #{advertising} - Operação não realizada (créditos insuficientes).')

    
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
