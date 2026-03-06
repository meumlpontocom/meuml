import json
from logging import ERROR
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


def advertising_status_set_many(pool, user_id: int, filter_query: str, filter_values: dict, status: str, tool=None, related_id=None, ml=True):
    advertising_status_set_item = queue.signature(
        'local_priority:advertising_status_set_item')

    action = QueueActions()
    action.conn = get_conn()

    try:
        if tool is None:
            tool = get_tool(action, 'alter-status')

        advertisings = get_advertisings(
            action, user_id, filter_query, filter_values, ml=ml)

        accounts = get_account_advertisings_info(
            advertisings, action, tool, related_id=related_id, ml=ml)

        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                process_item_id = create_process_item(
                    account['process_id'], int(account_id), advertising, action)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    advertising_status_set_item.delay(
                        account_id=int(account_id),
                        tool=tool,
                        process_item_id=process_item_id,
                        ml_item_id=advertising,
                        status=status,
                        ml=ml
                    )
                else:
                    update_process_item(process_item_id, None, False, action,
                                        f'Status de Anúncio #{advertising} - Operação não realizada (créditos insuficientes)')
    except Exception as e:
        LOGGER.error(e)
    finally:
        if pool is not None:
            action.conn.close()
