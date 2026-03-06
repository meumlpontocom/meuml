from datetime import datetime
from libs.enums.access_type import AccessType   
from workers.loggers import create_process, create_process_item, update_process_item
from celery.utils.log import get_task_logger

LOGGER = get_task_logger(__name__)


class InsufficientCredits(Exception):
    pass

def user_credits(action, user_id):
    query = """
        SELECT *
        FROM meuml.credits
        WHERE user_id = :user_id
    """
    values = {'user_id': user_id}
    user_credits = action.fetchone(query, values)
    return user_credits['amount'] if user_credits else 0


def user_valid_subscriptions(action, user_id):
    query = """
        SELECT *
        FROM meuml.subscription_accounts sa 
        JOIN meuml.subscriptions su ON sa.subscription_id = su.id
        WHERE su.user_id = :user_id AND expiration_date > :now
    """
    values = {
        'user_id': user_id,
        'now': datetime.strftime(datetime.now(), '%Y-%m-%d %H:%M:%S.%f')
    }
    return action.fetchall(query, values)


def user_accounts(action, user_id):
    query = f'SELECT id FROM meuml.accounts WHERE user_id = :user_id'
    ml_accounts = action.fetchall(query, {'user_id': user_id})
    ml_accounts = [account['id'] for account in ml_accounts]

    query = f'SELECT id FROM shopee.accounts WHERE user_id = :user_id'
    sp_accounts = action.fetchall(query, {'user_id': user_id})
    sp_accounts = [account['id'] for account in sp_accounts]

    accounts = ml_accounts + sp_accounts
    return accounts


def user_subscripted_accounts(action, user_id, module_id=None, include_professional_package=True):
    query = """
       SELECT *
       FROM meuml.subscription_accounts sa 
       JOIN meuml.subscriptions su ON sa.subscription_id = su.id
       WHERE su.user_id = :user_id AND expiration_date > :now
    """
    values = {
       'user_id': user_id,
       'now': datetime.strftime(datetime.now(), '%Y-%m-%d %H:%M:%S.%f')
    }

    if module_id:
        query += f" AND ({'su.package_id = 2 OR ' if include_professional_package else ''}string_to_array(su.modules, ',') @> array['{module_id}']) "

    accounts = action.fetchall(query, values)
    accounts = [account['account_id'] for account in accounts]
    return accounts


def has_permission(action, user_id, accounts, tool_id, any_account=False):
    accounts = accounts if len(accounts) > 0 else user_accounts(action, user_id)
    subscriptions = user_valid_subscriptions(action, user_id)
    subscripted_accounts = [account['account_id'] for account in subscriptions]
    permission = False

    if not any_account and not all(account in subscripted_accounts for account in accounts):
        return False

    for subscription in subscriptions:
        if subscription['package_id']:
            query = """
                SELECT module_id
                FROM meuml.package_modules 
                WHERE package_id = :package_id
            """
            values = {'package_id': subscription['package_id']}
            modules = action.fetchall(query, values)
            modules = [module['module_id'] for module in modules]
        else:
            modules = subscription['modules'].split(',')
        
        if len(modules) == 0:
            continue

        query = f"""
            SELECT tool_id 
            FROM meuml.module_tasks
            WHERE module_id IN (
        """
        values = {}
        for i in range(len(modules)):
            query += f':mod{str(i)},'
            values['mod'+str(i)] = int(modules[i])
        query = query[:-1] + ')'

        module_tasks = action.fetchall(query , values)

        if any(tool_id == module_task['tool_id'] for module_task in module_tasks):
            permission = True

    return permission


def user_has_permission(action, user_id, tool_id):   
    subscriptions = action.fetchall("""
        SELECT su.id, su.modules, su.package_id, string_agg(pm.module_id::varchar, ',') as package_modules
        FROM meuml.subscriptions su 
        LEFT JOIN meuml.package_modules pm ON pm.package_id = su.package_id 
        WHERE su.user_id = :user_id AND su.expiration_date > NOW()
        GROUP BY su.id
    """, {'user_id': user_id})

    user_modules = []
    for subscription in subscriptions:
        if subscription['package_id']:
            user_modules += subscription['package_modules'].split(',')
        else:
            user_modules += subscription['modules'].split(',')
    
    if len(user_modules) == 0:
        return False

    user_modules = [str(module_id) for module_id in set(user_modules)]

    module_tasks = action.fetchall(f"""
        SELECT mt.module_id
        FROM meuml.module_tasks mt
        WHERE mt.access_type = 3 AND mt.tool_id = {tool_id} AND mt.module_id IN ({','.join(user_modules)})
    """)

    if len(module_tasks) == 0:
        return False

    return True


def has_credits(action, user_id, amount):
    query = """
        SELECT amount
        FROM meuml.credits
        WHERE user_id = :user_id
    """
    values = {'user_id': user_id}
    credits = action.fetchone(query, values)
    
    if credits and credits['amount'] - amount >= 0:
        return True
    else:
        return False   


def verify_tool_access(action, user_id, accounts_id=[], tool={}, total_items=1, any_account=False):
    message = None
    code = 200

    if tool['access_type'] == AccessType.user_subscription:
        if not user_has_permission(action, user_id, tool['id']):
            message = 'Essa funcionalidade é exclusiva para contas assinantes do MeuML v2. Faça já sua assinatura e obtenha acesso'
            code = 402

    elif tool['access_type'] == AccessType.subscription:
        has_permission_response = has_permission(action, user_id, accounts_id, tool['id'], any_account)

        if not has_permission_response:
            message = 'Essa funcionalidade é exclusiva para contas assinantes do MeuML v2. Faça já sua assinatura e obtenha acesso'
            code = 402

    elif tool['access_type'] == AccessType.credits:
        total_price = total_items * tool['price']
        available_credits = user_credits(action, user_id)

        if available_credits == 0:
            required_credits = str(total_price).replace('.',',')
            message = f'Essa funcionalidade exige que você adicione R${required_credits} de crédito.'
            code = 402

    return code, message


def use_credits(action, user_id, process_item_id, tool_price, tool):
    updated_row = False
    inserted_row = False

    if tool['access_type'] != AccessType.credits:
        return True

    try:
        update_query = """
            UPDATE meuml.credits
            SET date_modified = :now, amount = amount - :cost
            WHERE user_id = :user_id AND (amount - :cost1) >= 0
            RETURNING id
        """
        values = {
            'user_id': user_id, 
            'cost': tool_price,
            'cost1': tool_price,
            'now': datetime.now()
        }
        updated_row = action.execute_returning(update_query, values)
       
        if updated_row:
            query = """
                INSERT INTO meuml.credit_transactions (user_id, process_item_id, amount, deposit) 
                VALUES (:user_id, :process_item_id, :amount, :deposit) 
                RETURNING id
            """
            values = {
                'user_id': user_id,
                'process_item_id': process_item_id,
                'amount': - tool_price,
                'deposit': False
            }
            inserted_row = action.execute_insert(query, values)
            
            if inserted_row:
                return True

        return False

    except Exception as e:
        print(e)
        return False
    finally:
        if not (updated_row and inserted_row):
            rollback_credits_transaction(action, process_item_id, user_id, tool_price)


def rollback_credits_transaction(action, process_item_id, user_id, tool_price):
    try:
        query = """
            DELETE FROM meuml.credit_transactions
            WHERE process_item_id = :process_item_id
            RETURNING amount
        """
        transaction = action.execute_returning(query, {'process_item_id': process_item_id})
        if transaction:
            query = f"""
                UPDATE meuml.credits
                SET date_modified = :now, amount = amount + :value
                WHERE user_id = :user_id
            """
            values = {
                'user_id': user_id, 
                'value': transaction['amount'],
                'now': datetime.now()
            }
            action.execute(query, values)
        
    except Exception as e:
        print(e)

def string_to_dict(string, arg_name):
        items = string.split(',')
        args = {}
        query = ''

        for i, item in enumerate(items):
            args[arg_name+str(i)] = item
            query += f':{arg_name}{str(i)},'
        query = query[:-1] + ') '

        return args, query
