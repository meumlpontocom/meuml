import datetime
import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from workers.helpers import refresh_token, invalid_access_token, format_ml_date

LOGGER = get_task_logger(__name__)


def order_items_import(account_id, access_token, order_id, order_date_created, pack_id, items, shipment_items, action, single_order=False):    
    for item in items:
        item['order_id'] = int(order_id)
        item['order_date_created'] = order_date_created 
        item['account_id'] = account_id
        item['pack_id'] = pack_id

        for index, shipment_item in enumerate(shipment_items):
            if item['item']['id'] == shipment_item['id']:
                item['item']['dimensions'] = shipment_item.get('dimensions')
                item['item']['description'] = shipment_item.get('description')
                shipment_items.pop(index)
                break

        if not single_order:
            query = f"""
                INSERT INTO meli_stage.order_items (id_item, account_id, order_id, external_data, stage_status) 
                VALUES (:id_item, :account_id, :order_id, :external_data, 0) 
                ON CONFLICT (id_item, account_id, order_id)
                    DO UPDATE SET external_data = excluded.external_data, stage_status = excluded.stage_status
            """
            values = {
                'id_item': item['item']['id'],
                'account_id': account_id,
                'order_id': order_id,
                'external_data': json.dumps(item)
            }
            action.execute(query, values)
    
    return items
