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
LOG_ADVERTISING_NOT_FOUND = '[ml_item_id="%s"] Advertising not found.'
LOG_BALANCE_NOT_FOUND = '[ml_item_id="%s"] Balance not found.'
LOG_NOT_ENOUGH_BALANCE = '[seller_id="%s"] Not enough balance.'

LOGGER = get_task_logger(__name__)
TOOL_KEY = 2


def advertising_price_set_batch_items(account_id, ml_items_id, process_items_id, price_premium, price_classic, price_free, price_rate, access_token):
    advertising_price_set_item = queue.signature('local_priority:advertising_price_set_item')

    for ml_item_id, process_item_id in zip(ml_items_id, process_items_id):
        advertising_price_set_item.delay(account_id, ml_item_id, process_item_id, price_premium, price_classic, price_free, price_rate, access_token)


def advertising_price_set_many(pool, user_id: int, filter_query: str, filter_values: dict, price_premium: float, price_classic: float, price_free: float, price_rate: bool):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'modify-advertising-price')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)

        # Atualiza anúncios por batch e altera preço quando finalizado
        for account_id, account in accounts.items():
            advertisings = accounts[account_id]['advertisings']

            for advertising in advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising, action)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    advertising_price_set_item = queue.signature('local_priority:advertising_price_set_item', 
                                                            args=(
                                                                tool, int(account_id), advertising, process_item_id, 
                                                                price_premium, price_classic, price_free, 
                                                                price_rate
                                                            ),
                                                            immutable=True
                                                        )
                    advertising_price_set_item.delay()
                else:
                    update_process_item(process_item_id, None, False, action, f'Alteração de preço Anúncio #{advertising} - Operação não realizada (créditos insuficientes).')
    
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
