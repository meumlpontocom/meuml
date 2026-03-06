import datetime
import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.access_type import AccessType      
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from workers.helpers import get_tool, format_ml_date, get_advertisings, get_account_advertisings_info
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits

LOGGER = get_task_logger(__name__)


def discount_apply_many(pool, user_id, filter_query, filter_values, start_date, finish_date, buyers_discount, best_buyers_discount):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'apply-discount')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)

        advertising_discount_apply = queue.signature('long_running:discount_apply_item')

        advertisings_dict = {}
        for advertising in advertisings:
            advertisings_dict[advertising['external_id']] = advertising

        for account_id, account in accounts.items():
            account_advertisings = account['advertisings']

            query = f'SELECT external_data FROM meuml.accounts WHERE id = :account_id'
            account_data = action.fetchone(query, {'account_id': int(account_id)})
            account_reputation = account_data.get('external_data', {}).get('seller_reputation', {}).get('level_id','')

            for advertising_id in account_advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising_id, action)

                if account_reputation not in ['5_green', '4_light_green']:
                    update_process_item(process_item_id, None, False, action, f'Anúncio #{advertising_id} - Reputação do vendedor deve ser, no mínimo, verde.')

                elif advertisings_dict[advertising_id]['condition'] != 'new':
                    update_process_item(process_item_id, None, False, action, f'Anúncio #{advertising_id} - Condição do produto deve ser "Novo".')

                else:
                    if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                        advertising_discount_apply.delay(
                            account_id=int(account_id),
                            tool=tool,
                            process_item_id=process_item_id,
                            ml_item_id=advertising_id,
                            start_date=start_date,
                            finish_date=finish_date,
                            buyers_discount=buyers_discount, 
                            best_buyers_discount= best_buyers_discount
                        )
                    else:
                        update_process_item(process_item_id, None, False, action, f'Anúncio #{advertising} - Operação não realizada (créditos insuficientes).')
    
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def discount_remove_many(pool, user_id, filter_query, filter_values):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'remove-discount')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)

        advertising_discount_remove = queue.signature('long_running:discount_remove_item')

        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising, action)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    advertising_discount_remove.delay(
                        account_id=int(account_id),
                        tool=tool,
                        process_item_id=process_item_id,
                        ml_item_id=advertising
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f'Anúncio #{advertising} - Operação não realizada (créditos insuficientes).')
    
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
