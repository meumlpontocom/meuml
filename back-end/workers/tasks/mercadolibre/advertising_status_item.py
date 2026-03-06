import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.access_type import AccessType
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from workers.helpers import refresh_token, get_account, invalid_access_token, format_ml_date
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import rollback_credits_transaction


LOGGER = get_task_logger(__name__)

LOG_ACCOUNT_NOT_FOUND = '[account_id="%s"] Account not found.'
LOG_TOOL_NOT_FOUND = '[tool_id="%s"] Tool not found.'
LOG_ADVERTISING_NOT_FOUND = '[ml_item_id="%s"] Advertising not found.'
LOG_BALANCE_NOT_FOUND = '[ml_item_id="%s"] Balance not found.'
LOG_NOT_ENOUGH_BALANCE = '[seller_id="%s"] Not enough balance.'


def advertising_status_set_item(pool, account_id: int, tool: dict, process_item_id: int, ml_item_id: str, status: str, conn=None, ml=True):
    action = QueueActions()
    action.conn = get_conn() if not conn else conn
    account = get_account(action=action, account_id=account_id)
    status_code = 500
    response = None

    from_table = 'meuml.advertisings' if ml else 'meuml.mshops_advertisings'

    try:
        status_ptbr = {
            'active': 'ativo',
            'closed': 'finalizado',
            'paused': 'pausado',
            'deleted': 'excluído'
        }

        if account is None:
            LOGGER.error(LOG_ACCOUNT_NOT_FOUND, account_id)
            status_code = 500
            message = f'Alterar Status de Anúncio #{ml_item_id} - erro ao alterar o status (conta não encontrada)'
            update_process_item(process_item_id, None, False, action, message)
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id,
                                 account['user_id'], account['name'])
            status_code = 400
            message = f'Alterar Status de Anúncio #{ml_item_id} - erro ao alterar o status (token não renovado)'
            update_process_item(process_item_id, None, False, action, message)
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        query = f'SELECT * FROM {from_table} WHERE account_id = :account_id AND external_id = :external_id'

        advertising = action.fetchone(
            query, {'external_id': ml_item_id, 'account_id': account_id})

        if advertising is None:
            status_code = 500
            message = f'Alterar Status de Anúncio #{ml_item_id} - erro ao alterar o status (anúncio não encontrado)'
            update_process_item(process_item_id, None, False, action, message)
            return

        if advertising['status'] == status:
            status_code = 200
            message = f'Alterar Status de Anúncio #{ml_item_id} - anúncio já {status_ptbr[status]}.'
            update_process_item(process_item_id, None, True, action, message)

        elif status == "deleted":
            if advertising['status'] != 'closed':
                message = f'Alterar Status de Anúncio #{ml_item_id} - erro: anúncio ainda não finalizado.'
                update_process_item(process_item_id, False,
                                    False, action, message)
                status_code = 200

            else:
                response = ml_api.put(f'/items/{ml_item_id}', json={
                    'deleted': 'true',
                })
                status_code = response.status_code

                if response.status_code == 200:
                    message = f'Alterar Status de Anúncio #{ml_item_id} - anúncio excluído com sucesso.'
                    update_process_item(
                        process_item_id, response, True, action, message)

                    query = f'DELETE FROM {from_table} WHERE external_id = :external_id'

                    values = {'external_id': ml_item_id}

                    action.execute(query, values)
                else:
                    message = f'Alterar Status de Anúncio #{ml_item_id} - erro durante exclusão.'
                    update_process_item(
                        process_item_id, response, False, action, message)
        else:
            response = ml_api.put(f'/items/{ml_item_id}', json={
                'status': status,
            })
            status_code = response.status_code

            if response.status_code == 200:
                message = f'Alterar Status de Anúncio #{ml_item_id} - alteração realizada com sucesso.'
                update_process_item(
                    process_item_id, response, True, action, message)

                query = f'UPDATE {from_table} SET status = :status WHERE external_id = :external_id'
                values = {
                    'status': status,
                    'external_id': ml_item_id,
                }

                action.execute(query, values)
            else:
                message = f'Alterar Status de Anúncio #{ml_item_id} - erro ao alterar o status'
                if advertising['status'] == 'closed':
                    message += ' (anúncio finalizado não pode ser modificado)'

                update_process_item(
                    process_item_id, response, False, action, message)

    except Exception as e:
        LOGGER.error(e)
        message = f'Alterar Status de Anúncio #{ml_item_id} - erro ao alterar o status.'
        update_process_item(process_item_id, response, False, action, message)
    finally:
        if pool is not None:
            action.conn.close()
    return status_code, message
