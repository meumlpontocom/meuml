import json
import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.enums.access_type import AccessType
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import (
    get_tool,
    get_accounts,
    get_advertisings,
    get_account_advertisings_info,
    refresh_token,
    get_account,
)
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits

LOGGER = get_task_logger(__name__)


def advertising_duplicate_many(
    user_id: int, data: dict, total: int, query_endpoint: str
):
    advertising_duplicate_item = queue.signature(
        "long_running:advertising_duplicate_item"
    )

    try:
        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, "duplicate-advertisings")
        if tool is None:
            LOGGER.error("Tool not found")
            return

        accounts = get_accounts(action, data["account_id"])

        if query_endpoint:
            first_account_id, first_account = list(accounts.items())[0]
            ml_api = MercadoLibreApi(first_account["access_token"])
            limit = 50
            offset = 0
            max_advertisings = 1000
            advertisings_id = [ad["id"] for ad in data["advertisings"]]
            data["advertisings"] = []

            while offset < max_advertisings:
                response = ml_api.get(
                    query_endpoint + f"&offset={offset}&limit={limit}"
                )
                status_code = response.status_code
                response_data = response.json()

                if status_code != 200:
                    for account_id in data["account_id"]:
                        process_id = create_process(
                            account_id=account_id,
                            user_id=user_id,
                            tool_id=tool["id"],
                            tool_price=tool.get("price"),
                            items_total=1,
                            action=action,
                        )
                        process_item_id = create_process_item(
                            process_id, account_id, account_id, action
                        )
                        update_process_item(
                            process_item_id,
                            response,
                            False,
                            action,
                            f"Replicação de Anúncio - Falha ao carregar dados do Mercado Livre, operação cancelada.",
                        )
                    return

                for advertising in response_data.get("results", []):
                    if advertising["id"] not in advertisings_id:
                        data["advertisings"].append({"id": advertising["id"]})

                offset += limit
                if offset >= response_data["paging"]["total"]:
                    break

        total = len(data["advertisings"])
        processes = {}
        account_advertisings = {}
        query = "SELECT title FROM meuml.advertisings WHERE account_id = :account_id"
        for account_id in data["account_id"]:
            processes[str(account_id)] = create_process(
                account_id=account_id,
                user_id=user_id,
                tool_id=tool["id"],
                tool_price=tool.get("price"),
                items_total=total,
                action=action,
            )
            account_advertisings[str(account_id)] = action.fetchall(
                query, {"account_id": account_id}
            )

            titles_list = []
            for advertising in account_advertisings[str(account_id)]:
                titles_list.append(advertising["title"])
            account_advertisings[str(account_id)] = titles_list

        for advertising in data["advertisings"]:
            advertising_duplicate_item.delay(
                tool=tool,
                operation_type="external",
                processes=processes,
                accounts=accounts,
                advertising=advertising,
                mass_override=data["mass_override"],
                account_advertisings=account_advertisings,
                allow_duplicated_title=data["allow_duplicated_title"],
                allow_duplicated_account=data["allow_duplicated_account"],
                allow_copying_warranty=data["allow_copying_warranty"],
            )

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def advertising_duplicate_many_owned(
    user_id: int,
    filter_query: str,
    filter_values: dict,
    filter_total: int,
    data: dict,
    select_all: bool,
    selected_official_store: dict,
    replication_mode: str = 'standard',
):
    try:
        advertising_duplicate_item = queue.signature(
            "long_running:advertising_duplicate_item"
        )

        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, "duplicate-advertisings")
        if tool is None:
            LOGGER.error("Tool not found")
            return

        processes = {}
        account_advertisings = {}
        query = "SELECT title FROM meuml.advertisings WHERE account_id = :account_id"
        for account_id in data["account_id"]:
            processes[str(account_id)] = create_process(
                account_id=account_id,
                user_id=user_id,
                tool_id=tool["id"],
                tool_price=tool.get("price"),
                items_total=filter_total,
                action=action,
            )
            account_advertisings[str(account_id)] = action.fetchall(
                query, {"account_id": account_id}
            )

            titles_list = []
            for advertising in account_advertisings[str(account_id)]:
                titles_list.append(advertising["title"])
            account_advertisings[str(account_id)] = titles_list

        if select_all:
            advertisings = get_advertisings(
                action, user_id, filter_query, filter_values
            )
            copy_accounts = get_account_advertisings_info(
                advertisings, action, tool, False
            )

            advertisings = []
            for account_id, account in copy_accounts.items():
                for advertising in account["advertisings"]:
                    advertisings.append({"id": advertising, "account_id": account_id})
        else:
            advertisings = data["advertisings"]
            copy_accounts = {}
            for advertising in advertisings:
                if advertising.get("account_id", None) not in copy_accounts:
                    account = get_account(action, advertising.get("account_id", None))
                    access_token = refresh_token(action=action, account=account)
                    copy_accounts[str(advertising.get("account_id", None))] = {
                        "id": advertising.get("account_id", None),
                        "access_token": (
                            access_token["access_token"] if access_token else None
                        ),
                    }

        accounts = get_accounts(action, data["account_id"])

        for advertising in advertisings:
            seller_id = str(advertising.get("account_id", None))

            advertising_duplicate_item.delay(
                tool=tool,
                operation_type="owned",
                processes=processes,
                accounts=accounts,
                advertising=advertising,
                mass_override=data["mass_override"],
                account_advertisings=account_advertisings,
                allow_duplicated_title=data["allow_duplicated_title"],
                allow_duplicated_account=data["allow_duplicated_account"],
                allow_copying_warranty=data["allow_copying_warranty"],
                owner_account_id=copy_accounts[seller_id]["id"],
                owner_access_token=copy_accounts[seller_id]["access_token"],
                replication_mode=replication_mode,
                selected_official_store=selected_official_store
            )

    except Exception as e:
        LOGGER.error(e)
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def advertising_replicate_shopee_many(user_id: int, filter_total: int, data: dict):
    try:
        advertising_replicate_shopee_item = queue.signature(
            "long_running:advertising_replicate_shopee_item"
        )

        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, "duplicate-advertisings-sp-ml")
        if tool is None:
            LOGGER.error("Tool not found")
            return

        total_items = data.get('variations_amount', filter_total)

        processes = {}
        for account_id in data["accounts_id"]:
            processes[str(account_id)] = create_process(
                account_id=account_id,
                user_id=user_id,
                tool_id=tool["id"],
                tool_price=tool.get("price"),
                items_total=total_items,
                action=action,
            )

        advertisings = data["advertisings"]

        accounts = get_accounts(action, data["accounts_id"])

        for advertising in advertisings:
            advertising_replicate_shopee_item.delay(
                tool=tool,
                processes=processes,
                accounts=accounts,
                advertising=advertising,
            )

    except Exception as e:
        LOGGER.error(e)
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
