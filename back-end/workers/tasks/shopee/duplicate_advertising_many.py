import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import  get_conn
from libs.queue.queue import app as queue
from workers.helpers import get_tool
from workers.helpers import get_tool, get_accounts, get_advertisings, get_account_advertisings_info, refresh_token, get_account
from workers.loggers import create_process

LOGGER = get_task_logger(__name__)

def shopee_advertising_duplicate_many_owned(user_id: int, filter_query: str, filter_values: dict, filter_total: int, data: dict, select_all: bool):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'duplicate-advertisings-shopee')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        processes = {}
        account_advertisings = {}
        query = "SELECT name FROM shopee.advertisings WHERE account_id = :account_id AND status != 'DELETED'"

        for account_id in data['account_id']:
            processes[str(account_id)] = create_process(account_id=account_id, user_id=user_id, tool_id=tool['id'], tool_price=tool.get('price'), items_total=filter_total, action=action, platform="SP")
            account_advertisings[str(account_id)] = action.fetchall(query, {'account_id': account_id})
            account_advertisings[str(account_id)] = [advertising['name']  for advertising in account_advertisings[str(account_id)]]

        if select_all:
            advertisings = get_advertisings(action, user_id, filter_query, filter_values, platform="SP")
            copy_accounts = get_account_advertisings_info(advertisings, action, tool, False, platform="SP")

            advertisings = []
            for account_id, account in copy_accounts.items():
                for advertising in account['advertisings']:
                    advertisings.append({
                        'id': advertising,
                        'account_id': account_id
                    })
        else:
            advertisings = data['advertisings']
            copy_accounts = {}

            for advertising in advertisings:
                if advertising['account_id'] not in copy_accounts:
                    account = get_account(action, advertising['account_id'], platform="SP")
                    access_token = refresh_token(action=action, account=account, platform="SP")

                    copy_accounts[str(advertising['account_id'])] = {
                        'id': advertising['account_id'],
                        'access_token': access_token['access_token'] if access_token else None
                    }

        accounts = get_accounts(action, data['account_id'], platform="SP")

        advertising_duplicate_item = queue.signature('long_running:shopee_advertising_duplicate_item')
        for advertising in advertisings:
            seller_id = str(advertising['account_id'])

            advertising_duplicate_item.delay(
                tool=tool,
                processes=processes,
                accounts=accounts,
                advertising=advertising,
                mass_override=data['mass_override'],
                account_advertisings=account_advertisings,
                allow_duplicated_title=data['allow_duplicated_title'], 
                allow_duplicated_account=data['allow_duplicated_account'],
                owner_account_id=copy_accounts[seller_id]['id'],
                owner_access_token=copy_accounts[seller_id]['access_token']
            )

    except Exception:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def advertising_replicate_mercadolibre_many(user_id: int, filter_total: int, data: dict):
    try:
        advertising_replicate_mercadolibre_item = queue.signature(
            'long_running:advertising_replicate_mercadolibre_item'
        )

        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, 'duplicate-advertisings-ml-sp')
        
        if tool is None:
            LOGGER.error('Tool not found')
            return

        processes = {}
        for account_id in data.get('attributes',{}).get('account_id', []):
            processes[str(account_id)] = create_process(
                account_id=account_id, user_id=user_id, tool_id=tool['id'],
                tool_price=tool.get('price'), items_total=filter_total,
                action=action, platform="SP"
            )

        advertisings = data.get('attributes', {}).get('advertisings', [])
        accounts = get_accounts(action, data.get('attributes',{}).get('account_id', []), platform="SP")
        
        first_account_key = next(iter(accounts)) 
        first_account_id = accounts[first_account_key]['id']

        for advertising in advertisings:
            advertising_replicate_mercadolibre_item.delay(
                tool=tool,
                processes=processes,
                shopee_account_id=first_account_id,
                ml_account_id=advertising.get("account_id"),
                advertising=advertising,
            )

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
