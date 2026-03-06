import json
import time
import traceback
from celery.utils.log import get_task_logger
from datetime import datetime, timezone
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.marketplace import Marketplace
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access
from workers.helpers import refresh_token, get_account, get_access_token, invalid_access_token, get_tool, format_ml_date
from workers.loggers import create_process, create_process_item, update_process_item, log_daily_routine, log_daily_routine_timestamp
from workers.tasks.mercadolibre.order_items_import import order_items_import
from workers.tasks.mercadolibre.order_messages_import import order_messages_import
from workers.tasks.mercadolibre.order_payments_import import order_payments_import
from workers.tasks.mercadolibre.order_shipment_import import order_shipment_import
from workers.tasks.mercadolibre.order_stage_parsing import parse_order_json
from workers.tasks.stock_operations import decrease_stock

LOGGER = get_task_logger(__name__)


def order_import_item(account_id, order, process_item_id=None, single_order=False, routine=False, is_new_order=False, update_orders=False):
    try:
        order_expiration_date = order.get('expiration_date', None)

        action = QueueActions()
        action.conn = get_conn()

        account = get_account(action=action, account_id=account_id)

        access_token = refresh_token(action=action, account=account)

        if access_token == False:
            invalid_access_token(
                action, account['id'], account['user_id'], account['external_name'])
            return None
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        # time.sleep(2)
        response = ml_api.get(f'/orders/{order["id"]}')

        if response.status_code == 200:
            order = response.json()
        else:
            if not single_order:
                update_process_item(process_item_id, False, False, action,
                                    f"Venda #{order['id']} - erro durante importação")
            return None

        if order.get('buyer', {}).get('id'):
            response = ml_api.get(
                f'/users/{order["buyer"]["id"]}?attributes=points')

            if response.status_code == 200:
                order['buyer']['buyer_points'] = response.json().get('points')

        if order_expiration_date:
            order['expiration_date'] = order_expiration_date

        items = order.pop('order_items', None)
        pack_id = order.pop('pack_id', None)
        pack_id = pack_id if pack_id else int(order['id'])
        payments = order.pop('payments', None)
        shipping = order.get('shipping', {})
        order.pop('seller', None)
        order['id'] = int(order['id'])
        order['pack_id'] = pack_id
        order['account_id'] = account_id
        shipment = {}

        if not single_order:
            query = f"""
                INSERT INTO meli_stage.orders (order_id, account_id, external_data, stage_status) 
                VALUES (:order_id, :account_id, :external_data, 0)
                ON CONFLICT (order_id, account_id)
                    DO UPDATE SET external_data = excluded.external_data, stage_status = excluded.stage_status
            """
            values = {
                'order_id': int(order['id']),
                'account_id': account['id'],
                'external_data': json.dumps(order)
            }
            action.execute(query, values)

        if shipping and 'id' in shipping:
            shipment = order_shipment_import(
                account['id'], access_token, order['id'], order['date_created'], pack_id, shipping['id'], action, single_order)

        if items:
            items = order_items_import(account['id'], access_token, order['id'], order['date_created'], pack_id, items, shipment.get(
                "shipping_items", []), action, single_order)

        if pack_id:
            messages = order_messages_import(
                account['id'], access_token, order['id'], order['date_created'], pack_id, action, single_order)

        if payments:
            payments = order_payments_import(
                account['id'], access_token, order['id'], order['date_created'], pack_id, payments, action, single_order)

        if single_order or update_orders:
            parse_order_json(account_id=account['id'], process_id=None, single_order_id=True, data={
                             'order': order, 'items': items, 'messages': messages, 'payments': payments, 'shipment': shipment})

            if not single_order:
                update_process_item(process_item_id, True, True, action,
                                f"Venda #{order['id']} - sucesso na importação")
            if routine:
                log_daily_routine_timestamp(task='Synchronize orders routine')
        else:
            update_process_item(process_item_id, True, True, action,
                                f"Venda #{order['id']} - sucesso na importação")
            

        if is_new_order and items:
            item = items[0]
            details = {
                'sku': item['item']['seller_sku'],
                'quantity': int(item['quantity']),
                'price_sell': float(item['unit_price']),
                'sell_id': str(order['id']),
                'order_status': order['status'],
                'advertising_id': str(item['item']['id']),
                'variation_id': str(item['item'].get('variation_id'))
            }
            if details['sku'] and len(details['sku']) > 0:
                decrease_stock(account['user_id'], account['id'],
                               Marketplace.MercadoLibre.value, details, conn=action.conn)

        if single_order:
            return {'order': order, 'items': items}

    except Exception as e:
        LOGGER.error(traceback.format_exc())

        if not single_order:
            update_process_item(process_item_id, False, False, action,
                                f"Venda #{order['id']} - erro durante importação")

        if routine:
            log_daily_routine({
                'task': 'Synchronize orders routine',
                'status': 'failed',
                'details': f'error while syncing orders from: {account_id} ',
            })
    finally:
        action.conn.close()
