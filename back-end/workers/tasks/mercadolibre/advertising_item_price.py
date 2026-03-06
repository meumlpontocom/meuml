from celery.utils.log import get_task_logger


LOGGER = get_task_logger(__name__)


def update_mshops_item_price(action, account_id, data):
    item_id = data['id']
    amount = data["prices"][0]["amount"]
    
    query = f"""
        UPDATE meuml.mshops_advertisings
        SET price = :amount
        WHERE external_id = :id AND account_id = '{account_id}'
    """

    values = {"amount": amount, "id": item_id}

    action.execute(query, values)
