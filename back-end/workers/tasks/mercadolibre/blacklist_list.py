from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.queue.queue import app as queue
from celery.utils.log import get_task_logger

LOGGER = get_task_logger(__name__)

def blacklist_add_customer_list(pool, customers, accounts, user_id, list_name, list_import=False, bids=False, questions=False):

    action = QueueActions()
    action.conn = get_conn()
    
    try:
        query = 'SELECT id FROM meuml.blacklist_lists WHERE name = :name'
        blacklist = action.fetchone(query, {'name': list_name})
        list_id = blacklist['id']

        for customer in customers:
            if str(customer).isdigit():
                query = """
                    INSERT INTO meuml.blacklist_list_blocks (motive_description, motive_id, user_id, customer_id, blacklist_id)
                    VALUES (:motive_description, :motive_id, :user_id, :customer_id, :blacklist_id) 
                """
                values = {
                    'motive_description': 'Importação da lista de bloqueios "' + list_name + '"',
                    'motive_id': 9,
                    'user_id': user_id,
                    'customer_id': customer,
                    'blacklist_id': list_id
                }
                action.execute(query, values)

        if list_import:
            blacklist_mass_block = queue.signature('long_running:blacklist_mass_block_customers')
            blacklist_mass_block.delay(seller_id=user_id, accounts=accounts, blacklist_id=list_id, bids=bids, questions=questions)
    
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
