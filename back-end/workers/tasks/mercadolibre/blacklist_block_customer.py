import datetime
import requests
import json
from collections import Counter
from workers.helpers import get_tool, refresh_token, search_customer_account, search_customers_account_list
from workers.loggers import create_process, create_process_item, update_process_item
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue

from celery.utils.log import get_task_logger

from libs.actions.queue_actions import QueueActions

LOG_PLAIN_TEXT_NOT_CHANGED = ''

LOG_SELLER_NOT_FOUND = '[seller_id="%s"] Seller not found'
LOG_BLACKLIST_LIST_NOT_FOUND = '[blacklist_list_id="%s"] Blacklist list not found'

LOG_ACCOUNTS_NOT_FOUND = 'Accounts not found'

LOG_BLACKLISTING_BIDS = '[account_id="%s"][ml_customer_id="%s"] Customer bids blacklisted'
LOG_BLACKLISTING_QUESTIONS = '[account_id="%s"][ml_customer_id="%s"] Customer questions blacklisted'

LOG_NEW_BLACKLIST_BLOCK = '[account_id="%s"][ml_item_id="%s"] New BlacklistBlock.'

LOGGER = get_task_logger(__name__)

def get_account(action: QueueActions, account_id: int):


    query_account = 'select ID, USER_ID, ACCESS_TOKEN, REFRESH_TOKEN, EXTERNAL_NAME, ACCESS_TOKEN_EXPIRES_AT FROM meuml.accounts where id = :account_id'

    account = action.fetchone(query_account, {
        'account_id': account_id
    })

    if account is None:
        LOGGER.error(LOG_ACCOUNTS_NOT_FOUND, account_id)
        return

    return account

def process_bids_block(action: QueueActions, process_id: int, account: dict, customer_id: int, customer: dict, ml_api: MercadoLibreApi, bids: bool):
    final_bids = True
    if bids:
        process_item_id_bids = create_process_item(process_id, account['id'], customer_id, action, f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Em Andamento.', 6)
        LOGGER.info(LOG_BLACKLISTING_BIDS, account['id'], customer_id)
        try:
            req_bids = ml_api.post(f'/users/{account["id"]}/order_blacklist', json={
                'user_id': customer_id,
            })

            if req_bids.status_code in [200,201] :
                update_process_item(process_item_id_bids, req_bids, 1, action,
                                    f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Bloqueado com sucesso.')
                print('Bids: Bloquear usuário de id: ' + str(customer_id))

            elif req_bids.status_code == 404:
                update_process_item(process_item_id_bids, req_bids, 0, action,
                                    f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Usuário não existe ou foi desabilitado pelo Mercado Livre..')
                print("bids não localizado" + str(customer_id))
            elif req_bids.status_code == 304:
                update_process_item(process_item_id_bids, req_bids, 1, action,
                                    f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Este comprador já estava bloqueado.')
                print("bids já bloqueado" + str(customer_id))
            else:
                update_process_item(process_item_id_bids, final_bids, 0, action, f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Falha no bloqueio.')
        except Exception as e:
            print(e)
            update_process_item(process_item_id_bids, final_bids, 0, action, f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Falha no bloqueio.')
            print("erro bids Usuario bloqueado " + str(customer_id))

def process_questions_block(action: QueueActions, process_id: int, account: dict, customer_id: int, customer: dict, ml_api: MercadoLibreApi, questions: bool):

    if questions:
        final_questions = True
        process_item_id_questions = create_process_item(process_id, account['id'], customer_id, action, f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Em andamento.', 7)

        try:
            LOGGER.info(LOG_BLACKLISTING_QUESTIONS, account['id'], customer_id)
            req_questions = ml_api.post(f'/users/{account["id"]}/questions_blacklist', json={
                'user_id': customer_id,
            })

            if req_questions.status_code == 200:
                data_res = req_questions.json()
                if 'status' in data_res:
                    if data_res['status'] == 'User is already blocked to ask questions.':
                        update_process_item(process_item_id_questions, req_questions, 1, action,
                                            f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Este comprador já estava bloqueado.')
                        return

                update_process_item(process_item_id_questions, req_questions, 1, action,
                                    f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Bloqueado com sucesso.')
                print('perguntas: Bloquear usuário de id: ' + str(customer_id))
            elif req_questions.status_code == 404:
                update_process_item(process_item_id_questions, req_questions, 0, action,
                                    f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Comprador desabilitado.')
                print("perguntas não localizado" + str(customer_id))
            elif req_questions.status_code == 304:
                update_process_item(process_item_id_questions, req_questions, 1, action,
                                    f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Este comprador já estava bloqueado.')
                print("perguntas já bloqueado" + str(customer_id))
            else:
                update_process_item(process_item_id_questions, req_questions, False, action, f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Falha no bloqueio.')
        except Exception as e:
            print(e)
            update_process_item(process_item_id_questions, final_questions, 0, action, f'Bloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Falha no bloqueio.')
            print("perguntas Usuario bloqueado " + str(customer_id))


def blacklist_block_customer_list(pool, user_id, blocks): 
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'block-user')

        query = 'SELECT id FROM meuml.accounts WHERE user_id = :user_id AND status=1'
        accounts = action.fetchall(query, {'user_id': user_id})
        accounts = [account['id'] for account in accounts]

        block_count = Counter()
        for block in blocks:
            if str(block['customer_id']).isdigit() and block['account_id'] in accounts:
                block_count[str(block['account_id'])] += 1 if block['bids'] ^ block['questions'] else 2

        process_ids = {}
        for account_id, len_data in block_count.items():
            process_ids[account_id] = create_process(account_id, user_id, tool['id'], tool['price'], len_data, action)
        
        for block in blocks:
            if block['account_id'] not in accounts:
                continue

            elif str(block['customer_id']).isdigit():
                blacklist_mass_block = queue.signature('long_running:blacklist_block_customer')
                blacklist_mass_block.delay(
                    account_id=block['account_id'],
                    motive_id = block['motive_id'],
                    motive_description = block['motive_description'] if 'motive_description' in block else 'Motivo não especificado',
                    customer_id = block['customer_id'],
                    bids = int(block['bids']),
                    questions  = int(block['questions']),
                    blacklist_id=0,
                    process_id = process_ids[str(block['account_id'])],
                    list_block_c = False
                )
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


"""
    Efetua o bloqueio de um comprador do mercado livre
"""
def blacklist_block_customer(pool, account_id: int, motive_id: int, motive_description: str, customer_id: int, bids: bool,
                            questions: bool, blacklist_id: int, process_id: int, list_block_c: bool = False):
    action = QueueActions()
    action.conn = get_conn()

    try:
        if customer_id == None:
            return False

        if type(account_id) is not int:
            account_id = account_id['account_id']

        account = get_account(action=action, account_id=account_id)

        access_token = refresh_token(account, action, False)

        if access_token == False:
            bids_process_id = create_process(account['id'], account['user_id'], 3, None, 1, action)
            questions_process_id = create_process(account['id'], account['user_id'], 5, None, 1, action)
            ext_name = account['external_name']
            process_item_id_bids = create_process_item(bids_process_id, account_id, 0, action,
                                                    f'Não foi possível renovar a chave de acesso da conta {ext_name}', 3)

            process_item_id_questions = create_process_item(questions_process_id, account_id, 0, action,
                                                            f'Não foi possível renovar a chave de acesso da conta {ext_name}',
                                                            3)

            update_process_item(process_item_id_bids, True, 0, action,
                                f'Não foi possível renovar a chave de acesso da conta {ext_name}')

            update_process_item(process_item_id_questions, True, 0, action,
                                f'Não foi possível renovar a chave de acesso da conta {ext_name}')

            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)
        
        customer = search_customer_account(None, customer_id, action, access_token)

        if 'id' in customer:
            customer_id = customer.get('id')

        external_id = account['id']

        if bids == False and questions == False:
        # if bids == False:
            process_item_id_bids = create_process_item(process_id, account['id'], customer_id, action, f'Desbloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Desbloqueio em andamento.', 6)
            req_bids = ml_api.delete(f'/users/{external_id}/order_blacklist/{customer_id}')
            query = 'UPDATE meuml.blacklist_blocks set bids = :bids where account_id = :account_id and customer_id = :customer_id'
            values = {
                'account_id':account['id'],
                'customer_id':customer_id,
                'bids':int(bids),
            }
            action.execute(query, values)

            if req_bids.status_code in [200,201]:
                update_process_item(process_item_id_bids, req_bids, 1, action,
                                    f'Desbloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Desbloqueado com sucesso.')

            elif req_bids.status_code == 404:
                update_process_item(process_item_id_bids, req_bids, 0, action,
                                    f'Desbloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Usuário não existe ou foi desabilitado pelo Mercado Livre..')
                print("desbloqueio de bids não localizado" + str(customer_id))

            else:
                update_process_item(process_item_id_bids, req_bids, 1, action,
                                    f'Desbloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para vendas - Comprador já se encontra desbloqueado.')

        # if questions == False:
            process_item_id_questions = create_process_item(process_id, account['id'], customer_id, action, f'Desbloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Desbloqueio em andamento', 7)
            req_questions = ml_api.delete(f'/users/{external_id}/questions_blacklist/{customer_id}')
            query = 'UPDATE meuml.blacklist_blocks set questions = :questions where account_id = :account_id and customer_id = :customer_id'
            values = {
                'account_id':account['id'],
                'customer_id':customer_id,
                'questions':int(questions)
            }
            action.execute(query, values)
            if req_questions.status_code in [200,201]:
                update_process_item(process_item_id_questions, req_questions, 1, action,
                                    f'Desbloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Desbloqueado com sucesso.')

            elif req_questions.status_code == 404:
                update_process_item(process_item_id_questions, req_questions, 0, action,
                                    f'Desbloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Usuário não existe ou foi desabilitado pelo Mercado Livre..')
                print("desbloqueaio de perguntas não localizado" + str(customer_id))
            else:
                update_process_item(process_item_id_questions, req_questions, 1, action,
                                    f'Desbloqueando comprador #{customer_id}: {customer.get("external_name",  "")} para perguntas - Comprador já se encontra desbloqueado.')

        if bids == False and questions == False:
            delete_block(account, customer_id, action)
            return

        if not customer:
            print("1. Usuário ML não localizado para bloqueio")
            req = None

            if bids:
                process_item_id_bids = create_process_item(process_id, account['id'], customer_id, action,
                                                            f'Bloqueando comprador #{customer_id} para vendas - Em andamento',
                                                            6)
                update_process_item(process_item_id_bids, req, 0, action,
                                    f'Bloqueando comprador #{customer_id} para vendas - Usuário não existe ou foi desabilitado pelo Mercado Livre..')

            if questions:
                process_item_id_questions = create_process_item(process_id, account['id'], customer_id, action,
                                                            f'Bloqueando comprador #{customer_id} para perguntas - Em andamento',
                                                            7)
                update_process_item(process_item_id_questions, req, 0, action,
                                    f'Bloqueando comprador #{customer_id} para perguntas - Usuário não existe ou foi desabilitado pelo Mercado Livre..')
            return

        blacklist_block = get_block(account, customer_id, action)
        if blacklist_block:
            previous_bids = blacklist_block['bids'] if blacklist_block['bids'] == 1 else bids
            previous_questions = blacklist_block['questions'] if blacklist_block['questions'] == 1 else questions
        else:
            previous_bids = bids
            previous_questions = questions

        delete_block(account, customer_id, action)

        if not motive_id:
            blacklist_block = get_or_create_list_block(account, customer_id, action)
        else:
            blacklist_block = get_or_create_block(account, customer_id, action, motive_id, motive_description, bool(previous_bids), bool(previous_questions)) 

        process_bids_block(action, process_id=process_id, account=account, customer_id=customer_id, customer=customer, ml_api=ml_api, bids=bids)
        process_questions_block(action, process_id=process_id, account=account, customer_id=customer_id, customer=customer, ml_api=ml_api, questions=questions)
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def get_block(account, customer_id, action):
    query = """
        SELECT bb.id, (bo.account_id/bo.account_id) AS bids, (bq.account_id/bq.account_id) AS questions 
        FROM 
            meuml.blacklists bb 
            LEFT JOIN meuml.blacklist_orders bo 
                ON bo.account_id = bb.account_id AND bo.customer_id = bb.customer_id 
            LEFT JOIN meuml.blacklist_questions bq 
                ON bq.account_id = bb.account_id AND bq.customer_id = bb.customer_id 
            LEFT JOIN meuml.blacklist_customers bc 
                ON bc.id = bb.customer_id 
        WHERE bb.account_id = :account_id AND bb.customer_id = :customer_id
    """
    values = {
        'account_id' : account['id'],
        'customer_id': customer_id
    }
    return action.fetchone(query, values)


def delete_block(account, customer_id, action):
    query_delete = """
        DELETE FROM meuml.blacklists bb 
        WHERE bb.account_id = :account_id AND bb.customer_id = :customer_id
    """
    values = {
        'customer_id': customer_id,
        'account_id': account['id']
    }
    action.execute(query_delete, values)

    query_delete = """
        DELETE FROM meuml.blacklist_orders bo 
        WHERE bo.account_id = :account_id AND bo.customer_id = :customer_id
    """
    values = {
        'customer_id': customer_id,
        'account_id': account['id']
    }
    action.execute(query_delete, values)
    
    query_delete = """
        DELETE FROM meuml.blacklist_questions bq 
        WHERE bq.account_id = :account_id AND bq.customer_id = :customer_id
    """
    values = {
        'customer_id': customer_id,
        'account_id': account['id']
    }
    action.execute(query_delete, values)


def get_or_create_list_block(account, customer_id: int, action):
    query = 'select id FROM meuml.blacklist_list_blocks where account_id = :account_id and customer_id = :customer_id'
    values = {
        'account_id' : account['id'],
        'customer_id': customer_id
    }
    blacklist_block = action.fetchone(query, values)

    if blacklist_block is None:
        LOGGER.info(LOG_NEW_BLACKLIST_BLOCK, account['id'], customer_id)
        query = 'insert into meuml.blacklist_list_blocks (user_id, account_id, customer_id) values (:user_id, :account_id, :customer_id)'
        values = {
            'user_id': account['user_id'],
            'account_id': account['id'],
            'customer_id': customer_id
        }
        action.execute_insert(query, values)

    return blacklist_block


def get_or_create_block(account, customer_id: int, action, motive_id, motive_description, bids, questions):
    blacklist_block = None #get_block(account, customer_id, action)

    if bids or questions:
        query_insert = """
            INSERT INTO meuml.blacklists (account_id, customer_id, motive_id, motive_description) 
            VALUES (:account_id, :customer_id, :motive_id, :motive_description) 
            RETURNING id 
        """
        values = {
            'account_id': account['id'],
            'customer_id': customer_id,
            'motive_id': motive_id,
            'motive_description': motive_description
        }
        blacklist_block = action.execute_insert(query_insert, values)

        if bids:
            query_insert = """
                INSERT INTO meuml.blacklist_orders (account_id, customer_id) VALUES (:account_id, :customer_id) 
            """
            action.execute(query_insert, {'account_id': account['id'], 'customer_id': customer_id})

        if questions:
            query_insert = """
                INSERT INTO meuml.blacklist_questions (account_id, customer_id) VALUES (:account_id, :customer_id) 
            """
            action.execute(query_insert, {'account_id': account['id'], 'customer_id': customer_id})

    return blacklist_block
