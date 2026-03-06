from libs.queue.queue import app as queue

from celery.utils.log import get_task_logger

LOG_PLAIN_TEXT_NOT_CHANGED = ''

LOG_SELLER_NOT_FOUND = '[seller_id="%s"] Seller not found'

LOG_ACCOUNTS_NOT_FOUND = 'Accounts not found'

LOGGER = get_task_logger(__name__)

from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn


def blacklist_mass_update_customers_list(pool, user_id: int, blocks: list, blacklist_id: int):
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = """
            SELECT id 
            FROM meuml.accounts 
            WHERE user_id = :user_id
        """
        accounts = action.fetchall(query, {'user_id': user_id})
        accounts_id = [account['id'] for account in accounts]

        for block in blocks:
            if old_block['account_id'] not in accounts_id:
                continue

            query = 'select id, account_id  FROM meuml.blacklist_block where id = :id'
            values = {'id': block['block_id']}
            old_block = action.fetchone(query, values)

            if old_block is None:
                continue

            blacklist_update_block_customer = queue.signature('short_running:blacklist_update_customer_list')
            blacklist_update_block_customer.delay(seller_id=user_id, account_id=old_block['account_id'], blacklist_id=blacklist_id, block_id=block['block_id'])
        
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
