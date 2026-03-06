#from async_worker.bitflix_async_worker.helpers import db_transaction, refresh_token
#from bitflix_mercadolibre_api import MercadoLibreApi
#!from bitflix_models import Account, BlacklistBlock
from celery.utils.log import get_task_logger

LOG_PLAIN_TEXT_NOT_CHANGED = ''

LOG_SELLER_NOT_FOUND = '[seller_id="%s"] Seller not found'
LOG_BLACKLIST_LIST_NOT_FOUND = '[blacklist_list_id="%s"] Blacklist list not found'

LOG_ACCOUNTS_NOT_FOUND = 'Accounts not found'
LOG_ACCOUNT_NOT_FOUND = 'Account not found'
LOG_ACCOUNT_NOT_OWNED = 'Account belongs to another user'

LOG_BLOCK_NOT_FOUND = 'Block not found'

LOG_BLACKLISTING_BIDS = '[account_id="%s"][ml_customer_id="%s"] Customer bids blacklisted'
LOG_BLACKLISTING_QUESTIONS = '[account_id="%s"][ml_customer_id="%s"] Customer questions blacklisted'

LOGGER = get_task_logger(__name__)
from libs.database.database_postgres import conn_pool, get_conn


def blacklist_unblock_customer(pool, seller_id: int, block_id: int, bids: bool, questions: bool):

    action = QueueActions()
    action.conn = pool

    with db_transaction() as db_session:

        block: BlacklistBlock = db_session.query(BlacklistBlock).get(block_id)

        if block is None:
            LOGGER.error(LOG_BLOCK_NOT_FOUND)
            return

        account: Account = db_session.query(Account).get(block.account_id)
        if account is None:
            LOGGER.error(LOG_ACCOUNT_NOT_FOUND)
            return

        if seller_id != account.seller_id:
            LOGGER.error(LOG_ACCOUNT_NOT_OWNED)
            return

        refresh_token(account, db_session)

        block.bids = bids
        block.questions = questions

        error = False

        ml_api = MercadoLibreApi(access_token=account.access_token)

        if not bids:
            LOGGER.info(LOG_BLACKLISTING_BIDS, account.id, block.customer_id)
            req_bids = ml_api.delete(f'/users/{account.external_id}/order_blacklist/{block.customer_id}')
            if req_bids.status_code != 200:
                error = True

        if not questions:
            LOGGER.info(LOG_BLACKLISTING_QUESTIONS, account.id, block.customer_id)
            req_questions = ml_api.delete(f'/users/{account.external_id}/questions_blacklist/{block.customer_id}')
            if req_questions.status_code != 200:
                error = True

        if not error:
            if not bids and not questions:
                db_session.delete(block)
            db_session.commit()
    action.conn.close()