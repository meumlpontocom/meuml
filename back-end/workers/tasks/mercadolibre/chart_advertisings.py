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


def chart_advertisings_set_many(user_id: int, filter_query: str, filter_values: dict, chart_id: str, row_id: str):
    chart_advertisings_set_item = queue.signature('long_running:chart_advertisings_set_item')

    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'link-chart-advertisings')

        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)

        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising, action)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    chart_advertisings_set_item.delay(
                        account_id=int(account_id),
                        tool=tool,
                        process_item_id=process_item_id,
                        advertising_id=advertising,
                        chart_id=chart_id,
                        row_id=row_id
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f'Associação Medidas - Anúncio #{advertising_id} - Operação não realizada (créditos insuficientes).')

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def chart_advertisings_set_item(account_id: int, tool: dict, process_item_id: int, advertising_id: str, chart_id: str, row_id: str, conn=None):
    action = QueueActions()
    action.conn = conn if conn else get_conn()

    account = get_account(action=action, account_id=account_id)
    status_code = 500
    response = None
    message = None

    try:
        if account is None:
            status_code = 403
            message = f'Associação Medidas - Anúncio #{advertising_id} - Erro ao associar Medidas (verifique se a conta está ativa e autenticada).'
            return (status_code, message)

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            status_code = 403
            message = f'Associação Medidas - Anúncio #{advertising_id} - Erro ao associar Medidas (não foi possível renovar o token de acesso).'
            return (status_code, message)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.get(f'/items/{advertising_id}', params={'include_attributes':'all'})

        if response.status_code != 200:
            status_code = 502
            message = f'Associação Medidas - Anúncio #{advertising_id} - Erro de comunicação com o Mercado Livre (falha ao sincronizar anúncio).'
            return (status_code, message)

        advertising = response.json()
        data = {'attributes': advertising['attributes']}

        data['attributes'] = [attribute for attribute in data['attributes'] if attribute['id'] not in ["SIZE_GRID_ID", "SIZE_GRID_ROW_ID"]]
        data['attributes'].append({
            "id": "SIZE_GRID_ID",
            "value_id": "11273930",
            "value_name": chart_id
        })
        data['attributes'].append({
            "id": "SIZE_GRID_ROW_ID",
            "value_id": "11286240",
            "value_name": row_id
        })

        response = ml_api.put(f'/items/{advertising_id}', json=data)
        status_code = response.status_code

        if response.status_code == 200:
            message = f'Associação Medidas - Anúncio #{advertising_id} - Medidas associadas com sucesso.'
            update_process_item(process_item_id, response, True, action, message)

    except:
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())
    finally:
        if status_code != 200:
            if not message:
                message = f'Associação Medidas - Anúncio #{advertising_id} - Erro ao associar Medidas'
            update_process_item(process_item_id, response, False, action, message)

        if not conn:
            action.conn.close()

    return (status_code, message)
