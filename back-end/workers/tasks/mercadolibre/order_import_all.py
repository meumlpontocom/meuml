import json
import traceback
from celery import chord
from celery.utils.log import get_task_logger
from datetime import datetime, timezone, timedelta
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access
from workers.helpers import refresh_token, get_account, get_access_token, invalid_access_token, get_tool, format_ml_date
from workers.loggers import create_process, create_process_item, update_process_item, log_daily_routine, log_daily_routine_timestamp

LOGGER = get_task_logger(__name__)


class NoOrdersException(Exception):
    pass

def attempt_to_create_order_tables(account_id, action, only_tables=['orders', 'order_items', 'order_messages', 'order_payments', 'order_shipments']):
    if 'orders' in only_tables:
        query = f"""
            CREATE TABLE IF NOT EXISTS meli_stage.orders_{account_id} 
                PARTITION OF meli_stage.orders 
                FOR VALUES IN ({account_id})
        """
        action.execute(query)

    if 'order_items' in only_tables:
        query = f"""
            CREATE TABLE IF NOT EXISTS meli_stage.order_items_{account_id} 
                PARTITION OF meli_stage.order_items 
                FOR VALUES IN ({account_id})
        """
        action.execute(query)

    if 'order_messages' in only_tables:
        query = f"""
            CREATE TABLE IF NOT EXISTS meli_stage.order_messages_{account_id} 
                PARTITION OF meli_stage.order_messages 
                FOR VALUES IN ({account_id})
        """
        action.execute(query)  

    if 'order_payments' in only_tables:
        query = f"""
            CREATE TABLE IF NOT EXISTS meli_stage.order_payments_{account_id} 
                PARTITION OF meli_stage.order_payments 
                FOR VALUES IN ({account_id})
        """
        action.execute(query)  

    if 'order_shipments' in only_tables:
        query = f"""
            CREATE TABLE IF NOT EXISTS meli_stage.order_shipments_{account_id} 
                PARTITION OF meli_stage.order_shipments 
                FOR VALUES IN ({account_id})
        """
        action.execute(query)   

    
def count_orders(ml_api: MercadoLibreApi, ml_user_id: str, only_recent_orders, oldest_order=None):
    endpoint = '/orders/search/recent' if only_recent_orders else '/orders/search'
    params = {'seller':ml_user_id}
    if oldest_order is not None:
        params['order.date_created.to'] = oldest_order
    response = ml_api.get(endpoint, params=params)
    return response.json(), response


def fetch_orders(ml_api, ml_user_id, limit, offset, only_recent_orders, oldest_order=None):
    endpoint = '/orders/search/recent' if only_recent_orders else '/orders/search'
    params = {
        'seller': ml_user_id,
        'sort': 'date_desc',
        'limit': limit,
        'offset': offset,
    }
    if oldest_order is not None:
        params['order.date_created.to'] = oldest_order
    response = ml_api.get(endpoint, params=params)
    return response.json(), response


def orders_insert_batch(process_id, account, ml_orders, response, action, routine=False):
    access_token = refresh_token(action=action, account=account)
    if access_token == False:
        invalid_access_token(action, account['id'], account['user_id'], account['external_name'])
        return
    else:
        access_token = access_token['access_token']

    order_import_item = queue.signature('long_running:order_import_item')

    for order in ml_orders:
        order_data = {'id': order['id'], 'expiration_date': order.get('expiration_date', None)}
        process_item_id = create_process_item(process_id, account['id'], order['id'], action)
        order_import_item.delay(account['id'], order_data, process_item_id, single_order=False, routine=routine, update_orders=True)


def truncate_order_tables(account_id, action):
    LOGGER.warning('TRUNCATE staging order tables')
    #query = f'TRUNCATE meli_stage.orders_{account_id}'
    #action.execute(query, {})

    #query = f'TRUNCATE meli_stage.order_items_{account_id}'
    #action.execute(query, {})

    #query = f'TRUNCATE meli_stage.order_messages_{account_id}'
    #action.execute(query, {})

    #query = f'TRUNCATE meli_stage.order_payments_{account_id}'
    #action.execute(query, {})

    #query = f'TRUNCATE meli_stage.order_shipments_{account_id}'
    #action.execute(query, {})


def update_account_total_orders(account, new_total, action):
    query = 'UPDATE meuml.ACCOUNTS set total_orders = :new_total where id = :account_id and user_id = :user_id'
    values = {
        'account_id': account['id'],
        'user_id': account['user_id'],
        'new_total': new_total
    }
    action.execute(query, values)


def order_import_all(pool, account_id, only_recent_orders=True, routine=False, oldest_order=None):
    try:
        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, 'import-recent-order') if only_recent_orders else get_tool(action, 'import-order')

        if tool is None:
            LOGGER.error('Tool not found')
            return

        account = get_account(action=action, account_id=account_id)

        code, *_ = verify_tool_access(action=action, user_id=account['user_id'], accounts_id=[account_id], tool=tool)

        if code != 200:
            LOGGER.error('Account not allowed')
            return

        access_token = refresh_token(action=action, account=account)
        
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        response_data, response = count_orders(ml_api, account['id'], only_recent_orders, oldest_order)
        total_orders = 0
        limit = 50
        total = 0 if response.status_code != 200 else response_data.get('paging', {}).get('total', 0)
        offset = 0

        if total > 0:
            attempt_to_create_order_tables(account_id, action)
            #truncate_order_tables(account_id, action)

            process_id = create_process(account_id=account['id'], user_id=account['user_id'], tool_id=tool['id'], tool_price=tool['price'], items_total=total, action=action)

            while total_orders < total:

                response_data, response = fetch_orders(ml_api, account['id'], limit, offset, only_recent_orders, oldest_order)
                ml_orders = response_data.get('results', [])

                if response.status_code != 200 or len(ml_orders) == 0:
                    break

                offset += limit
                total_orders += len(ml_orders)
                
                orders_insert_batch(process_id, account, ml_orders, response, action, routine)

                if offset / 9900 == 1:
                    offset = 0
                    oldest_order = datetime.strptime(ml_orders[-1]['date_created'][:-10], "%Y-%m-%dT%H:%M:%S")-timedelta(milliseconds=1)
                    oldest_order = oldest_order.strftime("%Y-%m-%dT%H:%M:%S") + '.999-' + ml_orders[-1]['date_created'][-5:]

        if total_orders != total:
            query = """
                UPDATE meuml.processes 
                    SET items_total = :total
                    WHERE id = :process_id 
            """
            action.execute(query, {'process_id': process_id, 'total': total_orders})
        
        if total_orders < total:
            process_message = "Importar Vendas - erro de comunicação com o Mercado Livre" 
            process_item_id = create_process_item(process_id, account['id'], account['id'], action)
            update_process_item(process_item_id, False, False, action, process_message)

            if routine:
                query = "UPDATE meuml.accounts SET has_historical_orders = false WHERE id = :id"
                action.execute(query, {'id': account['id']})
                
                log_daily_routine({
                    'task': 'Synchronize orders routine',
                    'status': 'failed',
                    'details': f'error while syncing orders from: {account_id} ',
                })

        elif total_orders >= total and not only_recent_orders:
            query = "UPDATE meuml.accounts SET has_historical_orders = true WHERE id = :id"
            action.execute(query, {'id': account['id']})

        # total_orders = account.get('external_data', {}).get('seller_reputation',{}).get('transactions', {}).get('total', total_orders)
        # update_account_total_orders(account, total_orders, action)
    
    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()

