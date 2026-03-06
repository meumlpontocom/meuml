import datetime
import json
import requests
import settings
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access
from workers.helpers import refresh_token, get_account, get_tool, search_customers_account_list
from workers.loggers import create_process, create_process_item, update_process_item

LOGGER = get_task_logger(__name__)


def chunks(values_list, size):
    for i in range(0, len(values_list), size):
        yield values_list[i:i+size]


def blacklist_import_all(pool, account_id, new_account=False):
    try:
        action = QueueActions()
        action.conn = get_conn()

        tool_bids = get_tool(action, 'import-order-blacklist')
        tool_questions = get_tool(action, 'import-question-blacklist')

        if tool_bids is None or tool_questions is None:
            LOGGER.error('Tool not found')
            return

        account = get_account(action=action, account_id=account_id)

        code_bids, *_ = verify_tool_access(
            action=action, user_id=account['user_id'], accounts_id=[account_id], tool=tool_bids)
        code_questions, *_ = verify_tool_access(
            action=action, user_id=account['user_id'], accounts_id=[account_id], tool=tool_questions)

        if code_bids != 200 or code_questions != 200:
            LOGGER.error(f'Account {account_id} not allowed to import blacklist')
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            bids_process_id = create_process(
                account['id'], account['user_id'], tool_bids['id'], tool_bids['price'], 1, action)
            questions_process_id = create_process(
                account['id'], account['user_id'], tool_questions['id'], tool_questions['price'], 1, action)

            process_item_id_bids = create_process_item(
                bids_process_id, account_id, 0, action, f'Não foi possível renovar a chave de acesso da conta {account["external_name"]}', tool_bids['id'])
            process_item_id_questions = create_process_item(
                questions_process_id, account_id, 0, action, f'Não foi possível renovar a chave de acesso da conta {account["external_name"]}', tool_questions['id'])

            update_process_item(process_item_id_bids, True, 0, action,
                                f'Não foi possível renovar a chave de acesso da conta {account["external_name"]}')
            update_process_item(process_item_id_questions, True, 0, action,
                                f'Não foi possível renovar a chave de acesso da conta {account["external_name"]}')
            return

        if True:  # new_account:
            create_stage_tables(action, account_id)

        truncate_stage_tables(action, account_id)

        access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        bids_data = ml_api.get(f'/users/{account_id}/order_blacklist').json()
        orders_blacklist_response_status = bids_data.get('status', 200)

        bids_total = len(bids_data) if orders_blacklist_response_status == 200 else 0

        questions_offset = 0
        questions_limit = 50
        questions_data = ml_api.get(f'/users/{account_id}/questions_blacklist', params={
            'offset': questions_offset,
            'limit': questions_limit
        }).json()
        questions_total = questions_data.get('paging', {}).get('total', 0)
        questions_len = len(questions_data.get('users', []))

        if bids_total + questions_len == 0:
            LOGGER.error('no blacklist to import')
            return
        bids_process_id = create_process(
            account['id'], account['user_id'], tool_bids['id'], tool_bids['price'], bids_total, action)
        questions_process_id = create_process(
            account['id'], account['user_id'], tool_questions['id'], tool_questions['price'], questions_total, action)

        blacklist_ids: dict = {}

        if orders_blacklist_response_status != 405:
            for chunk in chunks(bids_data, 100):
                query = f"""
                    INSERT INTO meli_stage.blacklist_orders_{account_id} (account_id, customer_id) 
                    VALUES 
                """
                values = []

                process_query = f"""
                    INSERT INTO meuml.process_items
                        (user_id, account_id, process_id, item_external_id, status, message, http_status)
                    VALUES 
                """
                process_values = []

                for bids_item in chunk:
                    customer_id = bids_item['user']['id']
                    customer_id_str = str(customer_id)

                    if customer_id_str not in blacklist_ids:
                        blacklist_ids[customer_id_str] = 'orders'
                        values.append(f' ({account_id}, {customer_id}) ')
                        process_values.append(
                            f" ({account['user_id']}, {account['id']}, {bids_process_id}, {customer_id}, 1, 'Comprador #{customer_id} bloqueado para vendas - Sincronizado com sucesso', 200) ")

                query += ', '.join(values)
                action.execute(query)

                process_query += ', '.join(process_values)
                action.execute(process_query)

        questions_len = 50
        while True:
            if questions_len < 50:
                break

            questions_data = ml_api.get(f'/users/{account_id}/questions_blacklist', params={
                'offset': questions_offset,
                'limit': questions_limit
            }).json()

            if 'users' not in questions_data:
                break

            questions_len = len(questions_data.get('users', []))
            questions_offset += questions_limit

            query = f"""
                INSERT INTO meli_stage.blacklist_questions_{account_id} (account_id, customer_id) 
                VALUES 
            """
            values = []

            process_query = f"""
                INSERT INTO meuml.process_items
                    (user_id, account_id, process_id, item_external_id, status, message, http_status)
                VALUES 
            """
            process_values = []

            for question_item in questions_data['users']:
                customer_id = question_item['id']
                customer_id_str = str(customer_id)

                if 'questions' != blacklist_ids.get(customer_id_str, ''):
                    blacklist_ids[customer_id_str] = 'questions'
                    values.append(f' ({account_id}, {customer_id}) ')
                    process_values.append(
                        f" ({account['user_id']}, {account['id']}, {questions_process_id}, {customer_id}, 1, 'Comprador #{customer_id} bloqueado para perguntas - Sincronizado com sucesso', 200) ")

            query += ', '.join(values)
            action.execute(query)

            process_query += ', '.join(process_values)
            action.execute(process_query)

        if len(blacklist_ids) == 0:
            print('Nenhum bloqueio')
            return

        merge_staged_data(action, account_id)

        query = """
            UPDATE meuml.processes 
                SET date_finished = NOW()
                WHERE id = :process_id 
        """
        action.execute(query, {'process_id': bids_process_id})
        action.execute(query, {'process_id': questions_process_id})

        search_customers_account_list(account_id, action)

    except Exception as e:
        LOGGER.error('error importing questions and orders')
        LOGGER.error(json.dumps(e))
    finally:
        action.conn.close()


def create_stage_tables(action, account_id):
    query = f"""
        CREATE TABLE IF NOT EXISTS meli_stage.blacklist_orders_{account_id} 
            PARTITION OF meli_stage.blacklist_orders 
            FOR VALUES IN ({account_id})
    """
    action.execute(query)

    query = f"""
        CREATE TABLE IF NOT EXISTS meli_stage.blacklist_questions_{account_id} 
            PARTITION OF meli_stage.blacklist_questions 
            FOR VALUES IN ({account_id})
    """
    action.execute(query)


def truncate_stage_tables(action, account_id):
    query = f"""
        TRUNCATE TABLE meli_stage.blacklist_orders_{account_id}
    """
    action.execute(query)

    query = f"""
        TRUNCATE TABLE meli_stage.blacklist_questions_{account_id}
    """
    action.execute(query)


def merge_staged_data(action, account_id):
    query = f"""
        INSERT INTO meuml.blacklist_orders (account_id, customer_id) 
            SELECT account_id, customer_id 
            FROM meli_stage.blacklist_orders_{account_id} 
        ON CONFLICT (account_id, customer_id) 
            DO NOTHING
    """
    action.execute(query)

    query = f"""
        INSERT INTO meuml.blacklist_questions (account_id, customer_id) 
            SELECT account_id, customer_id 
            FROM meli_stage.blacklist_questions_{account_id}  
        ON CONFLICT (account_id, customer_id) 
            DO NOTHING
    """
    action.execute(query)

    default_motive_id = 9
    default_motive_description = 'Motivo não especificado'
    query = f"""
        INSERT INTO meuml.blacklists (account_id, customer_id, motive_id, motive_description) 
            SELECT bb.account_id, bb.customer_id, {default_motive_id}, '{default_motive_description}' 
            FROM 
	        	(
	                SELECT ms_ord.account_id, ms_ord.customer_id 
	                FROM meli_stage.blacklist_orders_{account_id} ms_ord 
	            UNION 
	                SELECT  ms_que.account_id, ms_que.customer_id 
	                FROM meli_stage.blacklist_questions_{account_id} ms_que
	            ) AS bb 
        ON CONFLICT (account_id, customer_id) 
            DO NOTHING
    """
    action.execute(query)

    remove_deleted_blocks(action, account_id)


def remove_deleted_blocks(action, account_id):
    query = f"""
        DELETE FROM meuml.blacklists ml_bl 
        WHERE ml_bl.account_id = :account_id AND ml_bl.customer_id NOT IN (
                SELECT ms_ord.customer_id 
                FROM meli_stage.blacklist_orders_{account_id} ms_ord 
            UNION
                SELECT ms_que.customer_id 
                FROM meli_stage.blacklist_questions_{account_id} ms_que
        )
    """
    action.execute(query, {'account_id': account_id})

    query = f"""
        DELETE FROM meuml.blacklist_orders ml_ord 
        WHERE ml_ord.account_id = :account_id AND ml_ord.customer_id NOT IN (
            SELECT ms_ord.customer_id 
            FROM meli_stage.blacklist_orders_{account_id} ms_ord
        )
    """
    action.execute(query, {'account_id': account_id})

    query = f"""
        DELETE FROM meuml.blacklist_questions ml_que 
        WHERE ml_que.account_id = :account_id AND ml_que.customer_id NOT IN (
            SELECT ms_que.customer_id 
            FROM meli_stage.blacklist_questions_{account_id} ms_que
        )
    """
    action.execute(query, {'account_id': account_id})
