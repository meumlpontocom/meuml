from datetime import datetime
import json
import re
import traceback
from celery.utils.log import get_task_logger
from decimal import *
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.queue.queue import app as queue
from libs.shopee_api.shopee_api import ShopeeApi
from workers.helpers import (
    get_tool,
    refresh_token,
    get_account,
)
from workers.loggers import create_process, create_process_item, update_process_item
from babel.dates import format_date

LOGGER = get_task_logger(__name__)


def shopee_alter_description_many(
    user_id: int,
    account_id: int,
    adverts_ids: list,
):
    action = QueueActions()
    action.conn = get_conn()

    tool = get_tool(action, 'mass_alter_description_shopee')
    if tool is None:
        LOGGER.error('Tool not found')
        return

    process_id = create_process(account_id=account_id, user_id=user_id, tool_id=tool['id'], tool_price=tool.get('price'), items_total=len(adverts_ids), action=action, platform="SP")

    try:
        batch_size = 10
        for i in range(0, len(adverts_ids), batch_size):
            shopee_alter_description_batch = queue.signature(
                "long_running:shopee_alter_description_batch",
                args=(
                    user_id,
                    account_id,
                    adverts_ids[i : i + batch_size],
                    process_id,
                ),
            )

            shopee_alter_description_batch.delay()

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def shopee_alter_description_batch(user_id: int, account_id: int, adverts_ids: list, process_id: int):
    action = QueueActions()
    action.conn = get_conn()
    message = ""
    status_code = 200

    try:
        account = get_account(action, account_id, platform="SP")
        access_token = refresh_token(action=action, account=account, platform="SP")

        sp_api = ShopeeApi(
            shop_id=account_id,
            access_token=access_token["access_token"],
        )

        for ad_id in adverts_ids:
            process_item_id = create_process_item(
                process_id, int(account_id), str(ad_id), action
            )

            response = sp_api.get(
                path="/api/v2/product/get_item_base_info",
                version="v2",
                additional_params={
                    "item_id_list": [ad_id],
                },
            )

            response_data = response.json()

            if response.status_code != 200 or (response_data.get('error') and len(response_data.get('error')) > 0):
                status_code = 502
                message = f'Alterar Descrição Anúncio #{ad_id} - Erro ao buscar informações do anúncio (falha ao comunicar-se com Shopee)'

                update_process_item(
                    process_item_id, response, False, action, message
                )
                continue
            else:
                advertising = response_data['response']['item_list'][0]

            description_type = advertising.get("description_type")

            data_extenso = format_date(datetime.now(), "dd 'de' MMMM 'de' yyyy", locale='pt_BR')

            if description_type == "normal":
                old_description = advertising.get("description")

                pattern = r"\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}"
                match = re.search(pattern, old_description)

                if not match:
                    message = f'Alterar Descrição Anúncio #{ad_id} - Não é necessário atualizar. Não foi encontrado a data e hora no final da descrição do anúncio'
                    update_process_item(
                        process_item_id, response, True, action, message
                    )
                    continue

                new_description = re.sub(
                    pattern, f"{data_extenso}", old_description
                )

                payload = {
                    "item_id": ad_id,
                    "description_type": "normal",
                    "description": new_description,
                }

                response_update = sp_api.post(
                    path="/api/v2/product/update_item",
                    version="v2",
                    json=payload,
                )

                response_update_data = response_update.json()

                if response_update.status_code != 200 or (response_update_data.get('error') and len(response_update_data.get('error')) > 0):
                    status_code = 502
                    message = f'Alterar Descrição Anúncio #{ad_id} - Erro ao atualizar descrição (normal) do anúncio (falha ao comunicar-se com Shopee)'

                    update_process_item(
                        process_item_id, response, False, action, message
                    )
                    continue

                query_update = f"""
                    UPDATE shopee.advertisings
                    SET description = :description
                    WHERE account_id IN (
                        SELECT id
                        FROM shopee.accounts
                        WHERE user_id = :user_id
                    )
                    AND account_id = :account_id;
                """

                values = {
                    "description": new_description,
                    "user_id": user_id,
                    "account_id": account_id,
                }

                action.execute(query_update, values)

                message = f'Alterar Descrição Anúncio #{ad_id} - Descrição atualizada com sucesso!'
                update_process_item(
                    process_item_id, response, True, action, message
                )
            if description_type == "extended":
                description_info = advertising.get("description_info", {})
                extended_description = description_info.get(
                    "extended_description", {}
                )
                field_list = extended_description.get("field_list", [])

                for field in field_list:
                    if field.get("field_type") == "text":
                        old_description = field.get("text")

                        pattern = r"(\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2})$"
                        match = re.search(pattern, old_description)

                        if not match:
                            message = f'Alterar Descrição Anúncio #{ad_id} - Não é necessário atualizar. Não foi encontrado a data e hora no final da descrição do anúncio'
                            update_process_item(
                                process_item_id, response, True, action, message
                            )
                            continue

                        new_description = re.sub(
                            pattern,
                            f"{data_extenso}",
                            old_description,
                        )

                        payload = {
                            "item_id": ad_id,
                            "description_type": "extended",
                            "description_info": {
                                "extended_description": {
                                    "field_list": [
                                        {
                                            "field_type": "text",
                                            "text": new_description,
                                        }
                                    ]
                                }
                            },
                        }

                        response_update = sp_api.post(
                            path="/api/v2/product/update_item",
                            version="v2",
                            json=payload,
                        )
                        response_update_data = response_update.json()

                        if response_update.status_code != 200 or (response_update_data.get('error') and len(response_update_data.get('error')) > 0):
                            status_code = 502
                            message = f'Alterar Descrição Anúncio #{ad_id} - Erro ao atualizar descrição (extended) do anúncio (falha ao comunicar-se com Shopee)'

                            update_process_item(
                                process_item_id, response, False, action, message
                            )
                            continue

                        query_update = f"""
                            UPDATE shopee.advertisings
                            SET description = :description
                            WHERE account_id IN (
                                SELECT id
                                FROM shopee.accounts
                                WHERE user_id = :user_id
                            )
                            AND account_id = :account_id;
                        """

                        values = {
                            "description": new_description,
                            "user_id": user_id,
                            "account_id": account_id,
                        }

                        action.execute(query_update, values)

                        message = f'Alterar Descrição Anúncio #{ad_id} - Descrição atualizada com sucesso!'
                        update_process_item(
                            process_item_id, response, True, action, message
                        )
    except Exception:
        LOGGER.error(traceback.format_exc())

    finally:
        action.conn.close()

    return status_code, message