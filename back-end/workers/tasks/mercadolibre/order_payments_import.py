import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from workers.helpers import refresh_token, invalid_access_token, format_ml_date

LOGGER = get_task_logger(__name__)


def order_payments_import(account_id, access_token, order_id, order_date_created, pack_id, payments, action, single_order=False):
    for payment in payments:
        payment['order_id'] = int(order_id)
        payment['order_date_created'] = order_date_created
        payment['pack_id'] = pack_id

        if not single_order:
            query = f"""
                INSERT INTO meli_stage.order_payments (id_payment, account_id, order_id, external_data, stage_status) 
                    VALUES (:id_payment, :account_id, :order_id, :external_data, 0)
                ON CONFLICT (id_payment, account_id)
                    DO UPDATE SET external_data = excluded.external_data, stage_status = excluded.stage_status
            """
            values = {
                'id_payment': payment['id'],
                'account_id': account_id,
                'order_id': order_id,
                'external_data': json.dumps(payment)
            }
            action.execute(query, values)

    return payments
