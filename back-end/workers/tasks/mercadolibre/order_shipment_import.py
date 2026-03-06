import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from workers.helpers import refresh_token, invalid_access_token, format_ml_date

LOGGER = get_task_logger(__name__)


def order_shipment_import(account_id, access_token, order_id, order_date_created, pack_id, shipment_id, action, single_order=False):
    ml_api = MercadoLibreApi(access_token=access_token)

    response = ml_api.get(f"/shipments/{shipment_id}", headers={'x-format-new': 'true'})

    if response.status_code != 200:
        return {}

    shipment = response.json()

    shipment['order_id'] = int(order_id)
    shipment['order_date_created'] = order_date_created
    shipment['pack_id'] = pack_id

    response = ml_api.get(f"/shipments/{shipment_id}/carrier")

    if response.status_code == 200:
        response = response.json()
        shipment['carrier_name'] = response.get('name')
        shipment['carrier_url'] = response.get('url')
    else:
        shipment['carrier_name'] = None
        shipment['carrier_url'] = None

    response = ml_api.get(f"/shipments/{shipment_id}/history", headers={'x-format-new': 'true'})

    if response.status_code == 200:
        shipment['history'] = response.json()
    else:
        shipment['history'] = None

    if not single_order:
        query = f"""
            INSERT INTO meli_stage.order_shipments (id_shipment, account_id, order_id, external_data, stage_status) 
                VALUES (:id_shipment, :account_id, :order_id, :external_data, 0) 
            ON CONFLICT (id_shipment, account_id)
                DO UPDATE SET external_data = excluded.external_data, stage_status = excluded.stage_status
        """
        values = {
            'id_shipment': shipment['id'],
            'account_id': account_id,
            'order_id': order_id,
            'external_data': json.dumps(shipment)
        }
        action.execute(query, values)
    
    return shipment
