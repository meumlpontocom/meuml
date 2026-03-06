import json
from celery.utils.log import get_task_logger
from datetime import datetime
from libs.queue.queue import app as queue
from requests import Response

LOGGER = get_task_logger(__name__)


def use_credits(action, user_id, process_item_id, tool_price):
    updated_row = False
    inserted_row = False
    status = False
    tool_price = tool_price

    # Desde que implementamos a alteração de servidor, em alguns casos o tool_price tem vindo como um 
    # dicionário do tipo {'__type__': 'decimal', '__value__': 0.25}. Em outros casos, ele vem só o valor mesmo, como esperado.
    # Então vamos verificar o tipo dele antes de aplicar o float no value.
    dict_type = type({})
    if type(tool_price) == dict_type:
        tool_price = tool_price.get('__value__')

    tool_price = float(tool_price)

    try:
        action.conn.autocommit = False
        action.conn.commit()

        query = """
            INSERT INTO meuml.credit_transactions (user_id, process_item_id, amount, deposit) 
            VALUES (:user_id, :process_item_id, :amount, :deposit) 
            RETURNING id
        """
        values = {
            'user_id': user_id,
            'process_item_id': process_item_id,
            'amount': (tool_price*(-1)),
            'deposit': False
        }
        inserted_row = action.execute_insert(query, values)

        if inserted_row:
            update_query = """
                UPDATE meuml.credits
                SET date_modified = NOW(), amount = amount - :cost
                WHERE user_id = :user_id AND (amount - :cost) >= 0
                RETURNING id
            """
            values = {
                'user_id': user_id, 
                'cost': tool_price
            }
            updated_row = action.execute_returning(update_query, values)

            if updated_row:
                status = True

        if status:
            action.conn.commit()
        else:
            action.conn.rollback()
        
        action.conn.autocommit = True
        return status

    except Exception as e:
        action.conn.rollback()
        action.conn.autocommit = True
        LOGGER.error(e)
        return False


def rollback_credits_transaction(action, process_item_id, user_id, tool_price):
    # Desde que implementamos a alteração de servidor, em alguns casos o tool_price tem vindo como um 
    # dicionário do tipo {'__type__': 'decimal', '__value__': 0.25}. Em outros casos, ele vem só o valor mesmo, como esperado.
    # Então vamos verificar o tipo dele antes de aplicar o float no value.
    dict_type = type({})
    if type(tool_price) == dict_type:
        tool_price = tool_price.get('__value__')

    tool_price = float(tool_price)
    
    try:
        action.conn.autocommit = False
        action.conn.commit()

        query = """
            DELETE FROM meuml.credit_transactions
            WHERE process_item_id = :process_item_id
        """
        action.execute(query, {'process_item_id': process_item_id})

        query = f"""
            UPDATE meuml.credits
            SET date_modified = NOW(), amount = amount + :value
            WHERE user_id = :user_id
        """
        values = {
            'user_id': user_id, 
            'value': tool_price
        }
        action.execute(query, values)

        action.conn.commit()
        action.conn.autocommit = True

    except Exception as e:
        action.conn.rollback()
        action.conn.autocommit = True
        LOGGER.error(e)