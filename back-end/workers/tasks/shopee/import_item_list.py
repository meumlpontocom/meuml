
import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.access_type import AccessType
from libs.enums.marketplace import Marketplace
from libs.exceptions.exceptions import ShopeeConnectionException
from libs.queue.queue import app as queue
from libs.shopee_api.shopee_api import ShopeeApi
from workers.helpers import get_tool, refresh_token
from workers.loggers import create_process, create_process_item, update_process_item

LOGGER = get_task_logger(__name__)


def create_table_items(account_id, action):
    query = f"""
        CREATE TABLE IF NOT EXISTS shopee_stage.items_{account_id}
            PARTITION OF shopee_stage.items
            FOR VALUES IN ({account_id})
    """
    action.execute(query)

    query = f"""
        CREATE TABLE IF NOT EXISTS shopee_stage.item_variations_{account_id}
            PARTITION OF shopee_stage.item_variations
            FOR VALUES IN ({account_id})
    """
    action.execute(query)

    # query = f"""
    #     CREATE TABLE IF NOT EXISTS shopee_stage.item_attributes_{account_id}
    #         PARTITION OF shopee_stage.item_attributes
    #         FOR VALUES IN ({account_id})
    # """
    # action.execute(query)

    # query = f"""
    #     CREATE TABLE IF NOT EXISTS shopee_stage.item_logistics_{account_id}
    #         PARTITION OF shopee_stage.item_logistics
    #         FOR VALUES IN ({account_id})
    # """
    # action.execute(query)


def truncate_table_items(account_id, action):
    query = f'TRUNCATE shopee_stage.items_{account_id}'
    action.execute(query)

    query = f'TRUNCATE shopee_stage.item_variations_{account_id}'
    action.execute(query)

    # query = f'TRUNCATE shopee_stage.item_attributes_{account_id}'
    # action.execute(query)

    # query = f'TRUNCATE shopee_stage.item_logistics_{account_id}'
    # action.execute(query)


def shopee_import_item_list(user_id, account_id=None):
    action = QueueActions()
    action.conn = get_conn()

    try:
        import_item = queue.signature('long_running:shopee_import_item')

        tool = get_tool(action, 'import-shopee-item')

        query = """
            SELECT *
            FROM shopee.accounts
            WHERE user_id = :user_id AND internal_status = 1
        """
        values = {'user_id': user_id}

        if account_id:
            query += " AND id = :id"
            values['id'] = account_id

        accounts = action.fetchall(query, values)

        for account in accounts:
            create_table_items(account['id'], action)
            truncate_table_items(account['id'], action)

            access_token = refresh_token(
                action=action, account=account, platform="SP"
            )

            if not access_token:
                process_id = create_process(account_id=account['id'], user_id=account['user_id'], tool_id=tool['key'], tool_price=tool['price'], items_total=1, action=action, platform="SP")
                process_item_id = create_process_item(process_id, account['id'], account['id'], action)
                update_process_item(process_item_id, False, False, action,
                            f'Importação de Anúncios Loja #{account["id"]} - Erro ao sincronizar (não foi possível renovar o token de acesso)')
                break

            sp_api = ShopeeApi(
                shop_id=account['id'],
                access_token=access_token['access_token']
            )

            for status in ['BANNED', 'UNLIST', 'NORMAL']:
                response = sp_api.get(
                    path='/api/v2/product/get_item_list', version='v2',
                    additional_params={
                        'offset': 0,
                        'page_size': 1,
                        'item_status': status,
                    }
                )

                data = response.json()

                if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0):

                    process_id = create_process(account_id=account['id'], user_id=account['user_id'], tool_id=tool['id'], tool_price=tool['price'], items_total=1, action=action, platform="SP")

                    process_item_id = create_process_item(process_id, account['id'], account['id'], action, platform=Marketplace.Shopee)

                    update_process_item(process_item_id, False, False, action,
                            f'Anúncios conta #{account["id"]} -  Erro ao sincronizar (falha ao comunicar-se com Shopee)')
                    return

                data = data['response']

                offset = 0
                limit = 100
                total = data['total_count']

                if total > 0:
                    process_id = create_process(account_id=account['id'], user_id=account['user_id'], tool_id=tool['id'], tool_price=tool['price'], items_total=total, action=action, platform="SP")

                    while data.get('has_next_page') or offset == 0:
                        response = sp_api.get(
                            path='/api/v2/product/get_item_list', version='v2',
                            additional_params={
                                'offset': offset,
                                'page_size': limit,
                                'item_status': status,
                            }
                        )
                        data = response.json()

                        if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0):
                            process_item_id = create_process_item(process_id, account['id'], account['id'], action, platform=Marketplace.Shopee)
                            update_process_item(process_item_id, False, False, action,
                                    f'Anúncios conta #{account["id"]} -  Erro ao sincronizar (falha ao comunicar-se com Shopee)')
                            break

                        data = data['response']

                        for item in data['item']:
                            import_item.delay(
                                tool, process_id, item['item_id'],
                                account['id'], account['access_token'],
                                account['access_token_expires_in']
                            )

                        offset += 100
                        if offset >= total:
                            break

    except ShopeeConnectionException as e:
        LOGGER.error('error importing shopee ad - ')
        LOGGER.error(e)

    except Exception as e:
        LOGGER.error('error importing shopee ad - 1.1 ')
        LOGGER.error(e)

    finally:
        action.conn.close()
