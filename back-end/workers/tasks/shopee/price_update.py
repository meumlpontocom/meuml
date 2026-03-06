import json
import traceback
from celery.utils.log import get_task_logger
from decimal import *
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.queue.queue import app as queue
from libs.shopee_api.shopee_api import ShopeeApi
from workers.helpers import get_tool, get_advertisings, get_account_advertisings_info, refresh_token, get_account, invalid_access_token
from workers.loggers import create_process, create_process_item, update_process_item

LOGGER = get_task_logger(__name__)


def shopee_alter_price_many(user_id: int, filter_query: str, filter_values: dict, filter_total: int, data: dict, select_all: bool):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'alter-price-shopee')

        if tool is None:
            LOGGER.error('Tool not found')
            return

        advertisings = get_advertisings(
            action, user_id, filter_query, filter_values, platform="SP"
        )

        accounts = get_account_advertisings_info(
            advertisings, action, tool, True, platform="SP"
        )

        batch_size = 10

        for account_id, account in accounts.items():
            advertisings = accounts[account_id]['advertisings']

            for i in range(0, len(advertisings), batch_size):
                shopee_alter_price_batch = queue.signature(
                    'long_running:shopee_alter_price_batch',
                    args=(
                        tool,
                        int(account_id),
                        account['process_id'],
                        advertisings[i:i + batch_size],
                        data
                    )
                )

                shopee_alter_price_batch.delay()

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def shopee_alter_price_batch(tool: dict, account_id: int, process_id: int, items: list, data: dict, conn=None):
    action = QueueActions()
    action.conn = conn if conn else get_conn()
    message = ''
    status_code = 200

    try:
        account = get_account(
            action=action, account_id=account_id, platform="SP"
        )

        access_token = refresh_token(
            action=action, account=account, platform="SP"
        )

        if not access_token:
            invalid_access_token(
                action, account_id,
                account['user_id'], account['name']
            )
            return
        else:
            access_token = access_token['access_token']

        sp_api = ShopeeApi(shop_id=account_id, access_token=access_token)

        change_value = data['change_value'] if data['change_type'] == 'INCREASE' else data['change_value'] * (-1)

        for item_id in items:
            process_item_id = create_process_item(
                process_id, int(account_id), str(item_id), action
            )

            response = sp_api.get(
                path='/api/v2/product/get_item_base_info', version='v2',
                additional_params={'item_id_list': item_id}
            )

            response_data = response.json()

            if response.status_code != 200 or (response_data.get('error') and len(response_data.get('error')) > 0):
                status_code = 502
                message = f'Alterar Preço Anúncio #{item_id} - Erro ao sincronizar preço atual (falha ao comunicar-se com Shopee)'

                update_process_item(
                    process_item_id, response, False, action, message
                )
                continue
            else:
                advertising = response_data['response']['item_list'][0]

            price_list = []
            message_variation = ''

            if advertising['has_model']:
                message_variation = ' com variação'

                response = sp_api.get(
                    path='/api/v2/product/get_model_list', version='v2',
                    additional_params={'item_id': item_id}
                )

                response_variation = response.json()

                if response.status_code != 200 or (response_variation.get('error') and len(response_variation.get('error')) > 0):
                    status_code = 502
                    message = f'Alterar Preço Anúncio #{item_id} com variação - Erro ao sincronizar preço atual (falha ao comunicar-se com Shopee)'

                    update_process_item(
                        process_item_id, response, False, action, message
                    )
                    continue
                else:
                    for model in response_variation['response']['model']:
                        original_price = model['price_info'][0]['original_price']

                        if data['is_percentage']:
                            new_price = Decimal(
                                float(original_price) / (1.0 - change_value / 100.0)
                            )
                        else:
                            new_price = Decimal(float(original_price) + change_value)

                        new_price = float(new_price.quantize(
                            Decimal('1.000'), rounding=ROUND_UP)
                        )

                        price_list.append({
                            'model_id': model['model_id'],
                            'original_price': new_price
                        })
            else:
                original_price = advertising['price_info'][0]['original_price'] if advertising['price_info'][0].get(
                    'original_price'
                ) else advertising['price_info'][0]['current_price']

                if data['is_percentage']:
                    new_price = Decimal(
                        float(original_price) / (1.0 - change_value / 100.0)
                    )
                else:
                    new_price = Decimal(float(original_price) + change_value)

                new_price = float(new_price.quantize(
                    Decimal('1.000'), rounding=ROUND_UP)
                )

                price_list.append({
                    'original_price': new_price
                })

            response = sp_api.post(
                path='/api/v2/product/update_price', version='v2',
                json={
                    'item_id': item_id,
                    'price_list': price_list
                }
            )

            response_update_price = response.json()

            if response.status_code != 200 or (response_update_price.get('error') and len(response_update_price.get('error')) > 0):
                message = f'Alterar Preço Anúncio #{item_id} Erro ao atualizar preço (falha ao comunicar-se com Shopee)'

                update_process_item(
                    process_item_id, response, False, action, message
                )
                continue
            else:
                success_list = response_update_price['response']['success_list']
                failure_list = response_update_price['response']['failure_list']

            message_wholesale = ''

            if advertising.get('wholesales'):
                status, error = update_wholesales(
                    sp_api, item_id, advertising['wholesales'],
                    change_value, data['is_percentage']
                )

                if status is False:
                    message_wholesale = f'- Erro ao atualizar preço atacado ({error})'
                else:
                    message_wholesale = f'- Preço Atacado atualizado com sucesso'

            for item in success_list:
                message = f'Alterar Preço Anúncio #{item_id}{message_variation} - Preço atualizado com sucesso {message_wholesale}'

                update_process_item(
                    process_item_id, response, True, action, message
                )

            for item in failure_list:
                status_code = 502
                message = f'Alterar Preço Anúncio #{item_id}{message_variation} - Erro ao atualizar preço ({item.get("failed_reason", "falha ao comunicar-se com Shopee")}) {message_wholesale}'

                update_process_item(
                    process_item_id, response, False, action, message
                )
    except Exception:
        LOGGER.error(traceback.format_exc())

    finally:
        if conn is None:
            action.conn.close()


    return status_code, message


def update_wholesales(sp_api, item_id, wholesales, change_value, is_percentage):
    updated_wholesales = []

    for wholesale in wholesales:
        new_price = wholesale['unit_price']

        if is_percentage:
            new_price = Decimal(
                float(new_price) / (1.0 - change_value / 100.0)
            )
        else:
            new_price = Decimal(float(new_price) + change_value)

        new_price = float(new_price.quantize(
            Decimal('1.000'), rounding=ROUND_UP)
        )

        updated_wholesales.append({
            'min_count': wholesale['min_count'],
            'max_count': wholesale['max_count'],
            'unit_price': new_price
        })

    response = sp_api.post(
        path='/api/v2/product/update_item',
        version='v2',
        json={
            'item_id': item_id,
            'wholesale': updated_wholesales
        }
    )
    response_data = response.json()

    if response.status_code != 200 or (response_data.get('error') and len(response_data.get('error')) > 0):
        return False, response_data.get('error')
    else:
        return True, None
