import json
import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.access_type import AccessType
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import get_tool, get_advertisings, get_account_advertisings_info, refresh_token, get_account, invalid_access_token
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits, rollback_credits_transaction


LOGGER = get_task_logger(__name__)


def catalog_evaluate_eligibility_set_many(user_id: int, filter_query: str, filter_values: dict):
    evaluate_eligibility_set_item = queue.signature('long_running:chart_advertisings_set_item')

    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'evaluate-eligibility')

        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)

        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising, action)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    evaluate_eligibility_set_item.delay(
                        account_id=int(account_id),
                        tool=tool,
                        process_item_id=process_item_id,
                        advertising_id=advertising
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f'Marcar para Avaliação - Anúncio #{advertising} - Operação não realizada (créditos insuficientes).')

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def catalog_evaluate_eligibility_set_item(account_id: int, tool: dict, process_item_id: int, advertising_id: str, conn=None):
    action = QueueActions()
    action.conn = conn if conn else get_conn()

    account = get_account(action=action, account_id=account_id)
    status_code = 500
    response = None
    message = None

    try:
        if account is None:
            status_code = 403
            message = f'Marcar para Avaliação - Anúncio #{advertising_id} - Erro ao marcar para Avaliação (verifique se a conta está ativa e autenticada).'
            return (status_code, message)

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            status_code = 403
            message = f'Marcar para Avaliação - Anúncio #{advertising_id} - Erro ao marcar para Avaliação (não foi possível renovar o token de acesso).'
            return (status_code, message)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.post(
            f'/catalog_listing_eligibility/moderation_buybox/evaluate',
            json={'item_id': advertising_id}
        )
        status_code = response.status_code

        if response.status_code == 200:
            message = f'Marcar para Avaliação - Anúncio #{advertising_id} - marcada com sucesso.'
            update_process_item(process_item_id, response, True, action, message)

    except:
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())
    finally:
        if status_code != 200:
            if not message:
                message = f'Marcar para Avaliação - Anúncio #{advertising_id} - Erro ao marcar para Avaliação'
            update_process_item(process_item_id, response, False, action, message)

        if not conn:
            action.conn.close()

    return (status_code, message)
