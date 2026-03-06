import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn   
from libs.enums.access_type import AccessType
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access
from workers.helpers import get_tool, format_ml_date, get_account, refresh_token, invalid_access_token
from workers.payment_helpers import use_credits

LOGGER = get_task_logger(__name__)

def fetch_account_question_number(pool, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'import-questions')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        account = get_account(action=action, account_id=account_id)
        if account is None:
            return

        code, message = verify_tool_access(action=action, user_id=account['user_id'], accounts_id=[account_id], tool=tool)
        if code != 200:
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']
        
        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.get(f'/my/received_questions/search', params={
            'status' : 'UNANSWERED',
        })

        response_data = response.json()

        questions = []
        if 'questions' in response_data:
            questions = response_data['questions'] 
        
        unanswered_number = len(questions)
        insert_or_update_unanswered_questions(action, account_id, unanswered_number)

    except Exception as e:
        LOGGER.error(e)
    finally:
        if pool is not None:
            action.conn.close()


def insert_or_update_unanswered_questions(action, account_id, unanswered):
    query = """
        INSERT INTO meuml.questions (account_id, unanswered_questions)
            VALUES (:account_id, :unanswered)
        ON CONFLICT (account_id) 
            DO UPDATE SET unanswered_questions=EXCLUDED.unanswered_questions  
    """
    action.execute(query, {'account_id': account_id, 'unanswered': unanswered})
