
import json
import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn  
from libs.enums.marketplace import Marketplace
from libs.exceptions.exceptions import ShopeeConnectionException
from libs.shopee_api.shopee_api import ShopeeApi
from workers.tasks.shopee.orders_parsing import parse_shopee_orders
from workers.tasks.stock_operations import decrease_stock

LOGGER = get_task_logger(__name__)

def shopee_import_order(account_id, order_id, action, is_new_order=False):
    try:
        sp_api = ShopeeApi(shop_id=account_id)

        response = sp_api.post(path='/api/v1/orders/detail', version='v1', 
            additional_params={'ordersn_list': [order_id]}
        )
        data = json.loads(response.content)
        
        if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0) or 'orders' not in data:
            return

        data = data['orders'][0]
        items = data.pop('items', [])

        query_insert = f"""
            INSERT INTO shopee_stage.orders_{account_id}
                (account_id, order_id, external_data) 
            VALUES (:account_id, :order_id, :external_data)
            ON CONFLICT (account_id, order_id)
                DO UPDATE SET 
                    external_data=excluded.external_data,
                    date_created=NOW()
        """
        values = {
            'account_id': account_id,
            'order_id': order_id,
            'external_data': json.dumps(data)
        }
        action.execute(query_insert, values)

        order_items_query = f"""
            INSERT INTO shopee_stage.order_items_{account_id}
                (account_id, order_id, item_id, variation_id, external_data) 
            VALUES 
        """
        order_items_values = []
        order_items_data = {}
        
        for i, item in enumerate(items):
            order_items_values.append(f" ({account_id}, '{order_id}', {item['item_id']}, {item['variation_id']}, :json{i}) ")
            order_items_data[f'json{i}'] = json.dumps(item)
        
        order_items_query += ', '.join(order_items_values)
        order_items_query += " ON CONFLICT (order_id, account_id, item_id, variation_id) DO UPDATE SET external_data=excluded.external_data, date_created=NOW() "
        action.execute(order_items_query, order_items_data)

        parse_shopee_orders(account_id, None, order_id, action.conn)

        if is_new_order and items and data['order_status'] in ['UNPAID', 'READY_TO_SHIP']:
            account = action.fetchone("SELECT ac.id, ac.user_id FROM shopee.accounts ac WHERE ac.id = :id", {'id': account_id})
            for item in items:
                details = {
                    'sku': item['variation_sku'] if item.get('variation_sku') else item['item_sku'],
                    'quantity': int(item['variation_quantity_purchased']),
                    'price_sell': float(item['variation_discounted_price']) if item.get('variation_discounted_price') else float(item['variation_original_price']),
                    'sell_id': order_id,
                    'order_status': data['order_status'],
                    'advertising_id': str(item['item_id']),
                    'variation_id': str(item.get('variation_id'))
                }
                if details['sku'] and len(details['sku']) > 0:
                    decrease_stock(account['user_id'], account['id'], Marketplace.Shopee.value, details, conn=action.conn)

            if data['order_status'] == 'READY_TO_SHIP':
                return {'order': data, 'items': items}

    except ShopeeConnectionException as e:
        LOGGER.error(e)

    except Exception:
        LOGGER.error(traceback.format_exc()) 
