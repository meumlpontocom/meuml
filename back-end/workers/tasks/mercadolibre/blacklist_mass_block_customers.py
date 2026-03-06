from workers.loggers import create_process
from libs.queue.queue import app as queue

from celery.utils.log import get_task_logger

LOG_PLAIN_TEXT_NOT_CHANGED = ''

LOG_SELLER_NOT_FOUND = '[seller_id="%s"] Seller not found'

LOG_ACCOUNTS_NOT_FOUND = 'Accounts not found'

LOGGER = get_task_logger(__name__)

TOOL_KEY = 'block-user'

from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn


def blacklist_mass_block_customers(pool, user_id: int, accounts: list, blacklist_id: int, bids: bool, questions: bool):
    try: 
        action = QueueActions()
        action.conn = get_conn()

        query = 'SELECT name FROM meuml.blacklist_lists WHERE id = :id'
        blacklist_list = action.fetchone(query, {'id': blacklist_id})

        query = 'SELECT customer_id FROM meuml.blacklist_list_blocks WHERE blacklist_id = :blacklist_id'
        blocks = action.fetchall(query, {'blacklist_id': blacklist_id}) 

        for account_id in accounts:
            if len(blocks) > 0:
                count_blocks = len(blocks) if bids ^ questions else  len(blocks) * 2    
                process_id = create_process(account_id, user_id, 8, None, count_blocks, action)

            for block in blocks:
                blacklist_block_customer = queue.signature('long_running:blacklist_block_customer')
                blacklist_block_customer.delay(
                                            account_id=account_id, 
                                            motive_id=9,
                                            motive_description='Importação da lista de bloqueios "' + blacklist_list['name'] + '"',
                                            customer_id=block['customer_id'], 
                                            blacklist_id=blacklist_id,
                                            bids=bids, 
                                            questions=questions,
                                            process_id=process_id, 
                                            list_block_c= True
                                        )
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
