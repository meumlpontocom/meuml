
import json
import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn  
from libs.enums.marketplace import Marketplace
from libs.exceptions.exceptions import ShopeeConnectionException
from libs.queue.queue import app as queue
from libs.shopee_api.shopee_api import ShopeeApi
from workers.helpers import get_tool
from workers.loggers import create_process, create_process_item, update_process_item

LOGGER = get_task_logger(__name__)

def create_table_orders(account_id, action):
    query = f"""
        CREATE TABLE IF NOT EXISTS shopee_stage.orders_{account_id} 
            PARTITION OF shopee_stage.orders 
            FOR VALUES IN ({account_id})
    """
    action.execute(query)

    query = f"""
        CREATE TABLE IF NOT EXISTS shopee_stage.order_items_{account_id} 
            PARTITION OF shopee_stage.order_items 
            FOR VALUES IN ({account_id})
    """
    action.execute(query)


def truncate_table_orders(account_id, action):
    query = f'TRUNCATE shopee_stage.orders_{account_id}'
    action.execute(query)

    query = f'TRUNCATE shopee_stage.order_items_{account_id}'
    action.execute(query)


def shopee_count_orders(account_id):
    limit = 100
    offset = 0
    total = 0
    has_more_orders = True
    sp_api = ShopeeApi(shop_id=account_id)

    while has_more_orders:
        response = sp_api.post(
            path='/api/v1/orders/get', 
            version='v1', 
            additional_params={'order_status': 'ALL', 'pagination_entries_per_page': limit, 'pagination_offset': offset}
        )
        data = json.loads(response.content)

        if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0) or 'orders' not in data:
            break

        total += len(data['orders'])
        offset += limit
        has_more_orders = data.get('more')

    return total


def shopee_order_page_import(tool_id:int, process_id: int, account: dict, page_ids: list, routine=False):
    action = QueueActions()
    action.conn = get_conn()

    try:
        sp_api = ShopeeApi(shop_id=account['id'])

        response = sp_api.post(path='/api/v1/orders/detail', version='v1', 
            additional_params={'ordersn_list': page_ids}
        )
        data = json.loads(response.content)
        
        if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0) or 'orders' not in data:
            process_query = """
                INSERT INTO meuml.process_items 
                    (user_id, account_id, process_id, item_external_id, status, message, http_status, http_body) 
                VALUES 
            """
            process_values = []
            data = json.dumps(data.get('error'))

            for order_id in page_ids:
                message = f'Importar Venda #{order_id} - Erro ao sincronizar (falha ao comunicar-se com Shopee)'
                process_values.append(f" ({account['user_id']}, {account['id']}, {process_id}, '{order_id}', 0, '{message}', {response.status_code}, '{data}') ")                              
            
            process_query += ', '.join(process_values)
            action.execute(process_query)

        else:
            orders_query = f"""
                INSERT INTO shopee_stage.orders_{account['id']}
                    (account_id, order_id, external_data) 
                VALUES 
            """
            orders_values = []
            orders_data = {}

            order_items_query = f"""
                INSERT INTO shopee_stage.order_items_{account['id']}
                    (account_id, order_id, item_id, variation_id, external_data) 
                VALUES 
            """
            order_items_values = []
            order_items_data = {}

            process_query = """
                INSERT INTO meuml.process_items 
                    (user_id, account_id, process_id, item_external_id, status, message, http_status) 
                VALUES 
            """
            process_values = []

            order_count = 0
            item_count = 0
            for order in data['orders']:
                message = f"Importar Venda #{order['ordersn']} - venda sincroniza com sucesso"
                process_values.append(f" ({account['user_id']}, {account['id']}, {process_id}, '{order['ordersn']}', 1, '{message}', 200) ")                              
                
                for item in order.pop('items', []):
                    order_items_values.append(f" ({account['id']}, '{order['ordersn']}', {item['item_id']}, {item['variation_id']}, :json{item_count}) ")
                    order_items_data[f'json{item_count}'] = json.dumps(item)
                    item_count += 1
                
                orders_values.append(f" ({account['id']}, '{order['ordersn']}', :json{order_count}) ")
                orders_data[f'json{order_count}'] = json.dumps(order)
                order_count+=1

            orders_query += ', '.join(orders_values)
            orders_query += " ON CONFLICT (order_id, account_id) DO UPDATE SET external_data=excluded.external_data, date_created=NOW() "
            LOGGER.warning(orders_query)
            action.execute(orders_query, orders_data)

            order_items_query += ', '.join(order_items_values)
            order_items_query += " ON CONFLICT (order_id, account_id, item_id, variation_id) DO UPDATE SET external_data=excluded.external_data, date_created=NOW() "
            LOGGER.warning(order_items_query)
            action.execute(order_items_query, order_items_data)

            process_query += ', '.join(process_values)
            action.execute(process_query)

        query = """
            SELECT p.id, items_total, sum(CASE WHEN pit.status = 2 THEN 0 ELSE 1 end) as items_finished 
            FROM meuml.processes p, meuml.process_items pit 
            WHERE p.id = :process_id AND pit.process_id = p.id 
            GROUP BY p.id 
            LIMIT 1
        """
        process_data = action.fetchone(query, {'process_id': process_id})
        
        if process_data and process_data['items_total'] == process_data['items_finished']:
            task = queue.signature('long_running:shopee_order_stage_parsing', args=(account['id'], process_id))
            task.delay()

    except Exception:
        LOGGER.error(traceback.format_exc()) 
    finally:
        action.conn.close()


def fail_synchronization(action, account, process_id):
    process_item_id = create_process_item(process_id, account['id'], account['id'], action, platform=Marketplace.Shopee)
    update_process_item(process_item_id, False, False, action,
        f'Vendas conta #{account["id"]} - Erro ao sincronizar (falha ao comunicar-se com Shopee)')

    query = """
        UPDATE meuml.processes 
            SET date_finished = NOW()
            WHERE id = :process_id 
    """
    action.execute(query, {'process_id': process_id})


def shopee_import_order_list(user_id, account_id=None, routine=False):
    action = QueueActions()
    action.conn = get_conn()
    
    try:
        import_order_page = queue.signature('long_running:shopee_order_page_import')

        tool = get_tool(action, 'import-shopee-orders')

        query = """
            SELECT * 
            FROM shopee.accounts 
            WHERE user_id = :user_id AND internal_status = 1 
        """
        values = {'user_id': user_id}

        if account_id:
            query += " AND id = :id"
            values['id'] = account_id
        
        accounts = action.fetchall(query, values)

        for account in accounts:
            create_table_orders(account['id'], action)
            truncate_table_orders(account['id'], action)

            sp_api = ShopeeApi(shop_id=account['id'])
            offset = 0
            limit = 100
            has_more_orders = True
            total = shopee_count_orders(account['id'])

            if total > 0:
                process_id = create_process(account_id=account['id'], user_id=account['user_id'], tool_id=tool['id'], tool_price=tool['price'], items_total=total, action=action, platform="SP")
                
                while offset < total and has_more_orders:
                    response = sp_api.post(
                        path='/api/v1/orders/get', 
                        version='v1', 
                        additional_params={'order_status': 'ALL', 'pagination_entries_per_page': limit, 'pagination_offset': offset}
                    )
                    data = json.loads(response.content)

                    if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0) or 'orders' not in data:
                        fail_synchronization(action, account, process_id)
                        break

                    page_ids = [order['ordersn'] for order in data['orders']]

                    import_order_page.delay(tool['id'], process_id, account, page_ids, routine)
                    offset += limit
                    has_more_orders = data.get('more')

    except ShopeeConnectionException as e:
        LOGGER.error(e)

    except Exception:
        LOGGER.error(traceback.format_exc()) 
    
    finally:
        action.conn.close()
