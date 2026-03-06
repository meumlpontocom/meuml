from libs.database.models.blacklist_list_blocks import BlacklistListBlocks

from celery.utils.log import get_task_logger

from libs.actions.queue_actions import QueueActions

LOG_PLAIN_TEXT_NOT_CHANGED = ''

LOG_SELLER_NOT_FOUND = '[seller_id="%s"] Seller not found'
LOG_BLACKLIST_LIST_NOT_FOUND = '[blacklist_list_id="%s"] Blacklist list not found'
LOG_ACCOUNT_NOT_OWNED = 'Account belongs to another user'

LOG_BLOCK_NOT_FOUND = 'Block not found'
LOG_ACCOUNTS_NOT_FOUND = 'Accounts not found'

LOG_BLACKLISTING_BIDS = '[account_id="%s"][ml_customer_id="%s"] Customer bids blacklisted'
LOG_BLACKLISTING_QUESTIONS = '[account_id="%s"][ml_customer_id="%s"] Customer questions blacklisted'

LOGGER = get_task_logger(__name__)


from libs.database.database_postgres import conn_pool, get_conn

def blacklist_update_customer_list(pool, user_id: int, account_id: int, blacklist_id: int, block_id: int):

    action = QueueActions()
    action.conn = get_conn()

    try:
        query = 'select id, account_id, customer_id FROM meuml.blacklist_block where id = :id'
        values = {'id': block_id}
        block = action.fetchone(query, values)

        if block is None:
            LOGGER.error(LOG_BLOCK_NOT_FOUND)
            return

        blacklist_block = action.db_session(BlacklistListBlocks)
        blacklist_block.customer_id = block['customer_id']
        blacklist_block.account_id = user_id
        blacklist_block.blacklist_id = blacklist_id

        blacklist_block = blacklist_block.save()
    
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
