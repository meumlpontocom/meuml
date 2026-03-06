import datetime
import json
import pendulum
from celery import chord, group, chain
from celery.result import AsyncResult
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access
from libs.queue.queue import app as queue
from workers.helpers import refresh_token, get_account, get_access_token, invalid_access_token, get_tool, format_ml_date
from workers.loggers import create_process, create_process_item, update_process_item
from workers.tasks.mercadolibre.advertising_import_item import advertising_import_item, mshops_advertising_import_item
from time import sleep
import gc

LOGGER = get_task_logger(__name__)


class NoItemsException(Exception):
    pass


def create_table_items(account, action):
    # query = f"""
    #     CREATE TABLE IF NOT EXISTS meli_stage.items_{account["id"]}
    #         PARTITION OF meli_stage.items
    #         FOR VALUES IN ({account["id"]})
    # """
    # action.execute(query, {'account_id': account['id']})
    pass


def create_table_mshops_items(account, action):
    query = f"""
        CREATE TABLE IF NOT EXISTS meli_stage.mshops_items_{account["id"]} 
            PARTITION OF meli_stage.mshops_items 
            FOR VALUES IN ({account["id"]})
    """
    action.execute(query, {'account_id': account['id']})


def truncate_table_items(account, action):
    query = f'TRUNCATE meli_stage.items_{account["id"]}'
    action.execute(query, {})


def truncate_table_mshops_items(account, action):
    query = f'TRUNCATE meli_stage.mshops_items_{account["id"]}'
    action.execute(query, {})


def delete_catalog_advertisings(account, action):
    query = f'DELETE FROM meuml.catalog_advertisings WHERE account_id=:account_id'
    action.execute(query, {'account_id': account["id"]})


def update_account_total_advertisings(account_id, total, action):
    query = 'update meuml.accounts set total_advertisings = :new_total where id = :account_id'
    values = {
        'account_id': account_id,
        'new_total': total
    }
    action.execute(query, values)


def fetch_advertisings(ml_api: MercadoLibreApi, ml_user_id: str, limit: int, scroll_id: str, status: str, channel="marketplace"):
    # XXX: token could expire here, validate, and refresh if need
    # could raise a exception, and the upper loop could handle it
    response = ml_api.get(f'/users/{ml_user_id}/items/search', params={
        'search_type': 'scan',
        'limit': limit,
        'scroll_id': scroll_id,
        'status': status,
        'buying_mode': 'buy_it_now',
        'channels': channel
    })

    if response.status_code in [403, 400]:
        LOGGER.error('is sleeping for...')
        LOGGER.error(ml_user_id)
        sleep(5)
        response = ml_api.get(f'/users/{ml_user_id}/items/search', params={
            'search_type': 'scan',
            'limit': limit,
            'scroll_id': scroll_id,
            'status': status,
            'buying_mode': 'buy_it_now',
            'channels': channel
        })
    return response.json()


def count_advertisings(ml_api: MercadoLibreApi, ml_user_id: str, status: str = None, channel="marketplace"):
    # XXX: token could expire here, validate, and refresh if need
    # could raise a exception, and the upper loop could handle it
    params = {'buying_mode': 'buy_it_now', 'channels': channel}
    if status:
        params['status'] = status
    response = ml_api.get(f'/users/{ml_user_id}/items/search', params=params)
    if response.status_code == 403:
        response = ml_api.get(
            f'/users/{ml_user_id}/items/search', params=params)

    return response.json()


def enqueue_mshops_items(tool_id: int, process_id: int, account: dict, ml_items_ids: list, access_token: str, routine=False) -> None:
    action = QueueActions()
    action.conn = get_conn()

    try:
        advertisings_json = []
        failed_advertisings = []

        if isinstance(ml_items_ids, list) and len(ml_items_ids) > 0:
            for ml_item_id in ml_items_ids:
                advertising_json, message = mshops_advertising_import_item(
                    None, account['id'], account['user_id'], ml_item_id, None, access_token, False, action.conn, routine)

                if not advertising_json:
                    failed_advertisings.append([ml_item_id, message])
                else:
                    advertisings_json.append(
                        [ml_item_id, message, advertising_json])

            if len(advertisings_json) > 0:
                process_query = """
                    INSERT INTO meuml.process_items 
                        (user_id, account_id, process_id, item_external_id, status, message, http_status) 
                    VALUES 
                """
                process_values = []

                query = """
                    INSERT INTO meli_stage.mshops_items 
                        (account_id, item_id, external_data, status) 
                    VALUES 
                """
                values = []

                i = 0
                data = {}
                for ml_item_id, message, advertising_json in advertisings_json:
                    values.append(
                        f" ({advertising_json['account_id']}, '{advertising_json['advertising_id']}', :data{i}, {advertising_json['status']}) ")
                    process_values.append(
                        f" ({account['user_id']}, {account['id']}, {process_id}, '{ml_item_id}', 1, '{message}', 200) ")
                    data[f'data{i}'] = advertising_json['external_data']
                    i += 1

                query += ', '.join(values)
                query += "ON CONFLICT (account_id, item_id) DO UPDATE SET external_data=excluded.external_data, status=excluded.status"
                action.execute(query, data)

                process_query += ', '.join(process_values)
                action.execute(process_query)

            if len(failed_advertisings) > 0:
                process_query = """
                    INSERT INTO meuml.process_items 
                        (user_id, account_id, process_id, item_external_id, status, message, http_status) 
                    VALUES 
                """
                process_values = []

                for ml_item_id, message in failed_advertisings:
                    process_values.append(
                        f" ({account['user_id']}, {account['id']}, {process_id}, '{ml_item_id}', 0, '{message}', 502) ")

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
                task = queue.signature('long_running:advertising_stage_parsing', args=(
                    account['id'], process_id, tool_id, False))
                task.delay()

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def enqueue_items(tool_id: int, process_id: int, account: dict, ml_items_ids: list, access_token: str, routine=False) -> None:
    action = QueueActions()
    action.conn = get_conn()

    try:
        advertisings_json = []
        failed_advertisings = []

        if isinstance(ml_items_ids, list) and len(ml_items_ids) > 0:
            for ml_item_id in ml_items_ids:
                advertising_json, message = advertising_import_item(
                    None, account['id'], account['user_id'], ml_item_id, None, access_token, False, action.conn, routine)

                if not advertising_json:
                    failed_advertisings.append([ml_item_id, message])
                else:
                    advertisings_json.append(
                        [ml_item_id, message, advertising_json])

            if len(advertisings_json) > 0:
                process_query = """
                    INSERT INTO meuml.process_items 
                        (user_id, account_id, process_id, item_external_id, status, message, http_status) 
                    VALUES 
                """
                process_values = []

                query = """
                    INSERT INTO meli_stage.items 
                        (account_id, item_id, external_data, status) 
                    VALUES 
                """
                values = []

                i = 0
                data = {}
                for ml_item_id, message, advertising_json in advertisings_json:
                    values.append(
                        f" ({advertising_json['account_id']}, '{advertising_json['advertising_id']}', :data{i}, {advertising_json['status']}) ")
                    process_values.append(
                        f" ({account['user_id']}, {account['id']}, {process_id}, '{ml_item_id}', 1, '{message}', 200) ")
                    data[f'data{i}'] = advertising_json['external_data']
                    i += 1

                query += ', '.join(values)
                query += "ON CONFLICT (account_id, item_id, inserted_at) DO UPDATE SET external_data=excluded.external_data, status=excluded.status"
                action.execute(query, data)

                process_query += ', '.join(process_values)
                action.execute(process_query)

            if len(failed_advertisings) > 0:
                process_query = """
                    INSERT INTO meuml.process_items 
                        (user_id, account_id, process_id, item_external_id, status, message, http_status) 
                    VALUES 
                """
                process_values = []

                for ml_item_id, message in failed_advertisings:
                    process_values.append(
                        f" ({account['user_id']}, {account['id']}, {process_id}, '{ml_item_id}', 0, '{message}', 502) ")

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
                task = queue.signature('long_running:advertising_stage_parsing', args=(
                    account['id'], process_id, tool_id))
                task.delay()

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def extract_advertisings_ids(response_data):
    ml_items_ids = response_data.get('results', [])
    scroll_id = response_data.get('scroll_id')
    # if not ml_items_ids or len(ml_items_ids) == 0:
    #     # XXX: raise with the response ?
    #     raise NoItemsException()
    total: int = response_data.get('paging', {}).get('total', 0)
    return ml_items_ids, scroll_id, total


def mshops_advertising_import_all(pool, account_id, new_account=False, routine=False):
    action = QueueActions()
    action.conn = get_conn()

    LOGGER.warning('IMPORTANDO MSHOPS')

    try:
        tool = get_tool(action, 'import-item')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        account = get_account(action=action, account_id=account_id)

        code, *_ = verify_tool_access(
            action=action, user_id=account['user_id'], accounts_id=[account_id], tool=tool)
        if code != 200:
            LOGGER.error('Account not allowed')
            return

        if True:  # new_account:
            create_table_mshops_items(account, action)

        truncate_table_mshops_items(account, action)

        access_token = refresh_token(
            action=action, account=account, force=True)

        if access_token == False:
            invalid_access_token(action, account_id,
                                 account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = count_advertisings(ml_api, account['id'], channel='mshops')
        total_advertisings = 0
        limit = 100
        total = response['paging']['total']
        scroll_id = None

        if total > 0:
            total = 0

            for status in ['active', 'paused', 'closed', 'pending,not_yet_active,programmed']:
                response = count_advertisings(
                    ml_api, account['id'], status, channel='mshops')
                scroll_id = None
                total_advertisings = 0
                total_status = response['paging']['total']

                if total_status > 0:
                    if tool is None:
                        tool_key = f'import-item-{status}' if status != 'pending,not_yet_active,programmed' else f'import-item-others'
                        tool = get_tool(action, tool_key)
                        if tool is None:
                            continue

                    process_id = create_process(account_id=account['id'], user_id=account['user_id'],
                                                tool_id=tool['id'], tool_price=tool['price'], items_total=total_status, action=action)

                    while True:
                        response_data = fetch_advertisings(
                            ml_api, account['id'], limit, scroll_id, status, channel='mshops')

                        ml_items_ids, scroll_id, total = extract_advertisings_ids(
                            response_data)

                        total_advertisings += len(ml_items_ids)

                        if len(ml_items_ids) > 0:
                            task = queue.signature('long_running:enqueue_mshops_items', args=(
                                tool['id'], process_id, account, ml_items_ids, access_token, routine))

                            task.delay()
                        else:
                            break

                    total += total_advertisings
                    if total_advertisings < total_status:
                        query = """
                            UPDATE meuml.processes 
                                SET items_total = :total
                                WHERE id = :process_id 
                        """
                        action.execute(
                            query, {'process_id': process_id, 'total': total_advertisings})

                tool = None

        update_account_total_advertisings(account_id, total, action)

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
        gc.collect()


def advertising_import_all(pool, account_id, new_account=False, routine=False):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'import-item')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        account = get_account(action=action, account_id=account_id)

        code, *_ = verify_tool_access(
            action=action, user_id=account['user_id'], accounts_id=[account_id], tool=tool)
        if code != 200:
            LOGGER.error('Account not allowed')
            return

        # if True:  # new_account:
        #     create_table_items(account, action)

        # truncate_table_items(account, action)
        delete_catalog_advertisings(account, action)

        access_token = refresh_token(
            action=action, account=account, force=True)

        if access_token == False:
            invalid_access_token(action, account_id,
                                 account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        response = count_advertisings(ml_api, account['id'])
        total_advertisings = 0
        limit = 100
        total = response['paging']['total']
        scroll_id = None

        LOGGER.error('importing ad for account')
        LOGGER.error(account_id)

        if total > 0:
            total = 0

            for status in ['active', 'paused', 'closed', 'pending,not_yet_active,programmed']:
                response = count_advertisings(ml_api, account['id'], status)

                scroll_id = None
                total_advertisings = 0
                total_status = response['paging']['total']

                if total_status > 0:
                    if tool is None:
                        tool_key = f'import-item-{status}' if status != 'pending,not_yet_active,programmed' else f'import-item-others'
                        tool = get_tool(action, tool_key)
                        if tool is None:
                            continue

                    process_id = create_process(account_id=account['id'], user_id=account['user_id'],
                                                tool_id=tool['id'], tool_price=tool['price'], items_total=total_status, action=action)

                    while True:
                        response_data = fetch_advertisings(
                            ml_api, account['id'], limit, scroll_id, status)
                        ml_items_ids, scroll_id, total = extract_advertisings_ids(
                            response_data)
                        total_advertisings += len(ml_items_ids)

                        if len(ml_items_ids) > 0:
                            task = queue.signature('long_running:enqueue_items', args=(
                                tool['id'], process_id, account, ml_items_ids, access_token, routine))
                            task.delay()
                        else:
                            break

                    total += total_advertisings
                    if total_advertisings < total_status:
                        query = """
                            UPDATE meuml.processes 
                                SET items_total = :total
                                WHERE id = :process_id 
                        """
                        action.execute(
                            query, {'process_id': process_id, 'total': total_advertisings})

                tool = None

        update_account_total_advertisings(account_id, total, action)

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
        gc.collect()
