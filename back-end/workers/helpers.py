import json
import os
from sys import platform
import requests
from bs4 import BeautifulSoup
from celery.utils.log import get_task_logger
from datetime import datetime, timedelta
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from libs.payments.payment_helper import verify_tool_access
from libs.push.push_notifications import send_notification
from libs.shopee_api.shopee_api import ShopeeApi
from libs.whatsapp_api.whatapp_api import WhatsappApi
from requests_oauthlib import OAuth2Session
from workers.loggers import create_process, create_process_item, update_process_item

LOG_REFRESH_TOKEN = '[account_id="%d"] Request new token'
LOG_TOOL_NOT_FOUND = 'Tool not found'

LOGGER = get_task_logger(__name__)


def chunk_list(values_list: list, chunk_size: int):
    for i in range(0, len(values_list), chunk_size):
        yield values_list[i:i+chunk_size]


def get_access_token(action: QueueActions, account: dict):
    return refresh_token(account, action, True)


def get_tool(action, tool):
    query = """
        SELECT tl.*, mt.module_id, COALESCE(mt.access_type, 0) as access_type
        FROM meuml.tools tl
        LEFT JOIN meuml.module_tasks mt ON mt.tool_id = tl.id
        WHERE
    """
    if isinstance(tool, int):
        query += ' id = :id'
        values = {'id': tool}
    else:
        query += ' key = :key'
        values = {'key': tool}
    return action.fetchone(query, values)


def invalid_access_token(action, account_id, user_id, name):
    LOGGER.error('Invalid access token')


def search_customers_account_list(account_id, action):
    accounts_query = f"""
        SELECT id, access_token, access_token_expires_at, refresh_token
        FROM meuml.accounts
        WHERE id = {account_id}
    """
    ml_accounts = action.fetchall(accounts_query)
    accounts_token = [refresh_token(account, action)
                      for account in ml_accounts]
    accounts_token = [token for token in accounts_token if token]

    if len(accounts_token) == 0:
        return

    access_token = accounts_token[0]['access_token']

    query = """
        SELECT b.customer_id as id
        FROM meuml.blacklists b
        WHERE b.account_id = :account_id
        AND not exists (SELECT 1 FROM meuml.customers c where c.id = b.customer_id)
    """
    customers = action.fetchall(query, {'account_id': account_id})

    for customer in customers:
        search_customer_account = queue.signature(
            'long_running:search_customer_account')
        search_customer_account.delay(
            customer_id=customer['id'], action=None, access_token=access_token, skip_db=True)


def search_customer_account(pool, customer_id, action=None, access_token=None, skip_db=False):
    if pool is not None:
        action = QueueActions()
        action.conn = get_conn()

    try:
        ml_api = MercadoLibreApi(access_token=access_token)

        if not skip_db:
            field = 'id' if str(customer_id).isdigit() else 'external_name'
            query = f'SELECT id, external_name FROM meuml.customers WHERE {field} = :customer'
            user = action.fetchone(query, {'customer': customer_id})
        else:
            user = None

        if user is None:
            user = {}

            # Encontra ID do usuário caso apenas Apelido tenha sido fornecido
            if not str(customer_id).isdigit():
                response = ml_api.get(
                    f'/sites/MLB/search?nickname={customer_id}')

                if response.status_code == 200:
                    response = response.json()
                    user['id'] = response.get('seller', {}).get('id')
            else:
                user['id'] = int(customer_id)

            # Coleta informações públicas do Usuário através do ID
            if 'id' in user:
                user_id = user["id"]
                user = {}
                response = ml_api.get(f'/users/{user_id}')

                if response.status_code == 200 and 'id' in response.json():
                    response = response.json()
                    user['id'] = user_id
                    user['external_name'] = response.get('nickname')
                    user['registration_date'] = response.get(
                        'registration_date')
                    user['country_id'] = response.get('country_id')
                    user['state'] = response.get('address', {}).get('state')
                    user['city'] = response.get('address', {}).get('city')
                    user['user_type'] = response.get('user_type')
                    user['tags'] = response.get('tags')
                    user['logo'] = response.get('logo')
                    user['points'] = response.get('points')
                    user['site_id'] = response.get('site_id')
                    user['permalink'] = response.get('permalink')
                    user['level_id'] = response.get(
                        'seller_reputation', {}).get('level_id')
                    user['power_seller_status'] = response.get(
                        'seller_reputation', {}).get('power_seller_status')
                    user['seller_transactions_canceled'] = response.get(
                        'seller_reputation', {}).get('transactions', {}).get('canceled')
                    user['seller_transactions_completed'] = response.get(
                        'seller_reputation', {}).get('transactions', {}).get('completed')
                    user['seller_ratings_negative'] = response.get('seller_reputation', {}).get(
                        'transactions', {}).get('ratings', {}).get('negative')
                    user['seller_ratings_neutral'] = response.get('seller_reputation', {}).get(
                        'transactions', {}).get('ratings', {}).get('neutral')
                    user['seller_ratings_positive'] = response.get('seller_reputation', {}).get(
                        'transactions', {}).get('ratings', {}).get('positive')
                    user['seller_transactions_total'] = response.get(
                        'seller_reputation', {}).get('transactions', {}).get('total')
                    user['buyer_tags'] = response.get(
                        'buyer_reputation', {}).get('tags')
                    user['buyer_site_status'] = response.get(
                        'status', {}).get('site_status')

            # Caso usuário foi encontrado, salva dados no banco
            if user.get('external_name') is not None:
                fields_str = ', '.join(user.keys())
                fields_v_str = ', :'.join(user.keys())
                insert_query = f'insert into meuml.customers ({fields_str}) VALUES '
                insert_query += f' (:{fields_v_str})'
                print(user)
                action.execute(insert_query, user)
        return user
    except Exception as e:
        LOGGER.error(e)
        return {}
    finally:
        if pool is not None:
            action.conn.close()


def account_update_external_data(pool, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action=action, account_id=account_id)

        tool = get_tool(action, 'account-update')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        code, *_ = verify_tool_access(
            action=action, user_id=account['user_id'], accounts_id=[account_id], tool=tool)
        if code != 200:
            LOGGER.error('Account not allowed')
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id,
                                 account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.get(f'/users/me')

        if response.status_code == 200:
            query = "update meuml.accounts SET external_data = :external_data, total_orders = :total_orders WHERE id = :account_id"
            response_data = response.json()

            account_id = str(account['id'])
            response = ml_api.get(
                f'/shipping/flex/sites/MLB/users/{account_id}/subscriptions/v1')
            
            status_code = response.status_code

            if status_code == 200:
                data = response.json()
                has_flex_signature = next((signature for signature in data if signature['mode'] == 'FLEX' and signature['status']['id'] == 'in'), None)

                if has_flex_signature:
                    internal_tags = response_data.get('internal_tags')
                    if internal_tags is None:
                        internal_tags = ["meuml_tag_flex"]
                    else:
                        internal_tags.append("meuml_tag_flex")
                    response_data["internal_tags"] = internal_tags

            response_shipping_preferences = ml_api.get(
                f'/users/{account["id"]}/shipping_preferences')
            status_code = response_shipping_preferences.status_code

            if status_code == 200:
                response_shipping_preferences = response_shipping_preferences.json()
                response_data["shipping_modes"] = response_shipping_preferences['modes']

            new_external_data = json.dumps(response_data)
            action.execute(query, {'external_data': new_external_data, 'account_id': account['id'], 'total_orders': response_data.get(
                'seller_reputation', {}).get('transactions', {}).get('total', 0)})

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def get_plain_text(html):
    is_html = bool(BeautifulSoup(html, "html.parser").find())

    if not is_html:
        return html

    soup = BeautifulSoup(html)

    if not is_html:
        return html

    soup = BeautifulSoup(html)

    for script in soup(["script", "style"]):
        script.extract()

    text = soup.get_text()

    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)

    return text


def get_files(action, user_id, filter_query, filter_values):
    query = f"""
        SELECT DISTINCT fi.id
        FROM meuml.files fi
        LEFT JOIN meuml.tagged_items ti ON ti.item_id = fi.id::varchar AND ti.type_id = 3
        LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id
    """

    if filter_query:
        query += filter_query

    return action.fetchall(query, filter_values)


def format_ml_date(ml_date):
    if not ml_date or type(ml_date) == datetime:
        return ml_date
    if 19 < len(ml_date) < 29:
        ml_date = datetime.strptime(
            ml_date[:-3]+ml_date[-2:], '%Y-%m-%dT%H:%M:%S.%fZ')
    else:
        ml_date = datetime.strptime(ml_date[:-6], '%Y-%m-%dT%H:%M:%S.%f')
    #date = ml_date.strftime('%Y-%m-%d %H:%M:%S')
    return ml_date


############################
##
# Refresh Token
##
def refresh_token(account, action: QueueActions, force=False, platform="ML"):
    if not account:
        return False

    if platform == "ML":
        return refresh_token_mercadolibre(account, action, force)
    elif platform == "SP":
        return refresh_token_shopee(account, action, force)


def refresh_token_shopee(account, action: QueueActions, force=False):
    if 'access_token_expires_in' not in account:
        return False

    expires_in: int = (
        account['access_token_expires_in'] - datetime.now()).total_seconds()

    token = {
        'expires_in': account['access_token_expires_in'],
        'access_token': account['access_token'],
        'refresh_token': account['refresh_token'],
        'token_type': 'Bearer',
    }

    if expires_in > 3600 and force != True:
        print('Access Token still valid, not refreshing...')
        return token
    else:
        sp_api = ShopeeApi(account['access_token'],
                           account['access_token_expires_in'],)
        values = sp_api.get_refresh_token(
            account['id'], account['refresh_token'], account['refresh_token_expires_in'], action)

        if not values:
            return False

        token['expires_in'] = values['access_token_expires_in']
        token['access_token'] = values['access_token']
        token['refresh_token'] = values['refresh_token']

        account['access_token'] = values['access_token']
        account['access_token_expires_in'] = values['access_token_expires_in']
        account['refresh_token'] = values['refresh_token']
        account['refresh_token_expires_in'] = values.get(
            'refresh_token_expires_in')

        return token


def refresh_token_mercadolibre(account, action: QueueActions, force=False):
    if not account:
        return False

    now = datetime.now()

    expires_in: int = 0

    if 'access_token_expires_at' in account:
        if account['access_token_expires_at'] is not None:
            if type(account['access_token_expires_at']) == str:
                access_token_expires_at = datetime.strptime(
                    account['access_token_expires_at'][:19], '%Y-%m-%dT%H:%M:%S')
            else:
                access_token_expires_at = account['access_token_expires_at']
            expires_in: int = (access_token_expires_at - now).total_seconds()

    token = {
        'expires_in': expires_in,
        'access_token': account['access_token'],
        'refresh_token': account['refresh_token'],
        'token_type': 'Bearer',
    }

    print(token)

    if expires_in > 3600 and force != True:
        #print('not expired')
        LOGGER.warning('Access Token still valid, not refreshing...')
        token['access_token_expires_at'] = token['expires_in']
        return token

    query_account = 'SELECT access_token, refresh_token, access_token_expires_at FROM meuml.accounts WHERE id = :account_id AND status=1'
    refresh_account = action.fetchone(
        query_account, {'account_id': account['id']})
    account['access_token'] = refresh_account['access_token']
    account['refresh_token'] = refresh_account['refresh_token']
    account['access_token_expires_at'] = refresh_account['access_token_expires_at']
    expires_in: int = (access_token_expires_at - now).total_seconds()
    token = {
        'expires_in': expires_in,
        'access_token': account['access_token'],
        'refresh_token': account['refresh_token'],
        'token_type': 'Bearer',
    }
    if expires_in > 3600 and force != True:
        LOGGER.warning('Access Token still valid, not refreshing...')
        token['access_token_expires_at'] = token['expires_in']
        return token

    LOGGER.warning(LOG_REFRESH_TOKEN, account['id'])

    oauth_agent = OAuth2Session(
        client_id=os.getenv('CLIENT_ID'),
        redirect_uri=os.getenv('CALLBACK_URL'),
        token=token,
    )

    try:
        req = requests.post(os.getenv('TOKEN_URL') + '?grant_type=refresh_token&client_id=' + os.getenv(
            'CLIENT_ID') + '&client_secret=' + os.getenv('CLIENT_SECRET') + '&&refresh_token=' + account['refresh_token'])
        new_token = req.json()

        if req.status_code != 200:
            LOGGER.error('Token refresh response: ' + str(req.status_code))
            query = 'update meuml.accounts SET status = :expired_status WHERE id = :id'
            action.execute(query, {'expired_status': 0, 'id': account['id']})

            account = action.fetchone(
                f"SELECT id, user_id, name FROM meuml.accounts WHERE id = {account['id']}")

            send_notification(
                str(account['user_id']),
                {'title': 'MeuML - conta do Mercado Livre perdeu autenticação',
                'url': '/contas',
                'body': f'A conta {account["name"]} do Mercado Livre perdeu autenticação. Por favor, faça login e autorize novamente a integração com o MeuML'}
            )

            WhatsappApi.send_text_message_to_user(
                action,
                account['user_id'],
                account['id'],
                'ML',
                'whatsapp-auth',
                'lost_authentication_ml',
                account_name=account['name']
            )

            return False
    except Exception as e:
        LOGGER.error(e)
        query = 'update meuml.accounts SET status = :expired_status WHERE id = :id'
        action.execute(query, {'expired_status': 0, 'id': account['id']})

        account = action.fetchone(
            f"SELECT id, user_id, name FROM meuml.accounts WHERE id = {account['id']}")

        send_notification(
            str(account['user_id']),
            {'title': 'MeuML - conta do Mercado Livre perdeu autenticação',
            'url': '/contas',
            'body': f'A conta {account["name"]} do Mercado Livre perdeu autenticação. Por favor, faça login e autorize novamente a integração com o MeuML'}
        )

        WhatsappApi.send_text_message_to_user(
            action,
            account['user_id'],
            account['id'],
            'ML',
            'whatsapp-auth',
            'lost_authentication_ml',
            account_name=account['name']
        )

        return False

    query = f'update meuml.accounts ' \
            f' set access_token = :access_token, ' \
            f' access_token_created_at = :access_token_created_at, ' \
            f' access_token_expires_at = :access_token_expires_at,' \
            f' refresh_token = :refresh_token where id = :id'

    values = {
        'access_token': new_token['access_token'],
        'access_token_created_at': now,
        'access_token_expires_at': now + timedelta(seconds=new_token['expires_in']),
        'refresh_token': new_token['refresh_token'],
        'id': account['id']
    }

    action.execute(query=query, values=values)

    account['access_token'] = values['access_token']
    account['access_token_created_at'] = values['access_token_created_at']
    account['access_token_expires_at'] = values['access_token_expires_at']
    account['refresh_token'] = values['refresh_token']

    return values


############################
##
# Get account by ID
##
def get_account(action: QueueActions, account_id: int, platform="ML"):
    if platform == "ML":
        query_account = 'select ID, USER_ID, ACCESS_TOKEN, REFRESH_TOKEN, NAME, EXTERNAL_NAME, ACCESS_TOKEN_EXPIRES_AT FROM meuml.accounts where id = :account_id and status=1'
        account = action.fetchone(query_account, {'account_id': account_id})
    else:
        query_account = 'SELECT * FROM shopee.accounts WHERE id = :account_id AND internal_status = 1'
        account = action.fetchone(query_account, {'account_id': account_id})

    if account is None:
        print(f'Conta {platform} {account_id} não existente ou desativada')

    return account


############################
##
# Get accounts by user
##
def get_accounts(action, accounts_id, platform="ML"):
    if platform == "ML":
        return get_accounts_mercadolibre(action, accounts_id)
    else:
        return get_accounts_shopee(action, accounts_id)


def get_accounts_shopee(action, accounts_id):
    query = f"""
        SELECT *
        FROM shopee.accounts
        WHERE id IN ({','.join([str(account_id) for account_id in accounts_id])})
    """
    accounts = action.fetchall(query)

    accounts_dict = {}
    for account in accounts:
        access_token = refresh_token(
            action=action, account=account, platform="SP")

        if access_token is False or access_token is None:
            invalid_access_token(
                action, account['id'], account['user_id'], account['name'])
        else:
            account['access_token'] = access_token['access_token']
            account['access_token_expires_in'] = access_token['expires_in']
            account['refresh_token'] = access_token['refresh_token']

        accounts_dict[str(account['id'])] = account

    return accounts_dict


def get_accounts_mercadolibre(action, accounts_id):
    query = f"""
        SELECT id, user_id, name, access_token, refresh_token, access_token_expires_at,
            external_data ->> 'user_type' as user_type, 
            external_data -> 'company' ->> 'brand_name' as brand_name,
            external_data->>'tags' as account_tags
        FROM meuml.accounts
        WHERE id IN ({','.join([str(account_id) for account_id in accounts_id])})
    """
    accounts = action.fetchall(query)

    accounts_dict = {}
    for account in accounts:
        access_token = refresh_token(action=action, account=account)

        if access_token is False or access_token is None:
            invalid_access_token(
                action, account['id'], account['user_id'], account['name'])
        else:
            account['access_token'] = access_token['access_token']
            account['access_token_expires_at'] = access_token['access_token_expires_at']
            account['refresh_token'] = access_token['refresh_token']

            if account['user_type'] == 'brand':
                if account['user_id'] == 4072:
                    account['official_store_id'] = 1954
                if account['id'] == 93173510:
                    account['official_store_id'] = 3262
                if account['user_id'] == 780:
                    account['official_store_id'] = 2620
                if account['user_id'] == 4314:
                    account['official_store_id'] = 3479
                if account['user_id'] == 17565:
                    account['official_store_id'] = 3594
                if account['user_id'] == 17961:
                    account['official_store_id'] = 85722
                if account['user_id'] == 9943:
                    account['official_store_id'] = 4763
                if account['user_id'] == 3184:
                    account['official_store_id'] = 3420
                if account['user_id'] == 24163:
                    account['official_store_id'] = 5110
                if account['user_id'] == 3820:
                    account['official_store_id'] = 4740
                if account['id'] == 279717774:
                    account['official_store_id'] = 95624
                if account['id'] == 390291047:
                    account['official_store_id'] = 149302
                if account['id'] == 1186841373:
                    account['official_store_id'] = 245722
                # if account['id'] == 2457806887: --> URBANO_BAGS
                #     account['official_store_id'] = 106482
                #ml_api = MercadoLibreApi(access_token=access_token)
                #response = ml_api.get(f'/users/{account["id"]}/brands')
                # if response.status_code == 200:
                #    response_data = response.json()
                #    for brand in response_data.get('brands', []):
                #        if brand.get('fantasy_name') and account.get('brand_name') and brand['fantasy_name'].upper() == account['brand_name'].upper():
                #            account['official_store_id'] = brand['official_store_id']
                #            break
        accounts_dict[str(account['id'])] = account

    return accounts_dict

############################
##
# Get advertisings
##


def get_advertisings(action: QueueActions, user_id: int, filter_query: str = None, filter_values: dict = {}, platform="ML", ml=True):
    if platform == "ML":
        adv_table = 'advertisings' if ml else 'mshops_advertisings'

        query = f"""
            SELECT DISTINCT ad.external_id, ad.account_id, ad.condition
            FROM meuml.{adv_table} ad
            JOIN meuml.accounts ac ON ad.account_id = ac.id
        """

        if ml:
            query += " LEFT JOIN meuml.tagged_items ti ON ti.item_id = ad.external_id AND ti.type_id = 1 LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id"
    else:
        query = f"""
            SELECT DISTINCT ad.id, ad.account_id, ad.condition
            FROM shopee.advertisings ad
            JOIN shopee.accounts ac ON ad.account_id = ac.id
            LEFT JOIN meuml.tagged_items ti ON ti.item_id = ad.external_id AND ti.type_id = 2
            LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id
        """

    if filter_query:
        query += filter_query

    return action.fetchall(query, filter_values)

############################
##
# Get advertisings by account with details
##


def get_account_advertisings_info(advertisings: dict, action: QueueActions, tool: dict, create_new_process=True, platform="ML", related_id=None, ml=True):
    if platform == "ML":
        return get_account_advertisings_info_mercadolibre(advertisings, action, tool, create_new_process, related_id, ml)
    else:
        return get_account_advertisings_info_shopee(advertisings, action, tool, create_new_process)


def get_account_advertisings_info_shopee(advertisings: dict, action: QueueActions, tool: dict, create_new_process=True):
    # Separa anúncios por conta
    accounts = {}
    for advertising in advertisings:
        account_id = str(advertising['account_id'])

        if account_id not in accounts:
            accounts[account_id] = {
                'total': 1,
                'advertisings': [advertising['id']],
                'id': int(account_id)
            }
        else:
            accounts[account_id]['total'] += 1
            accounts[account_id]['advertisings'].append(advertising['id'])

    # Verifica access_token de cada conta e cria processo
    for account_id, account_dict in accounts.items():
        if account_dict['total'] > 0:
            account = get_account(
                action=action, account_id=account_id, platform="SP")

            if create_new_process:
                accounts[account_id]['process_id'] = create_process(account_id=account_id, user_id=account['user_id'], tool_id=tool['id'], tool_price=tool.get(
                    'price'), items_total=account_dict['total'], action=action, platform="SP")

            access_token = refresh_token(
                action=action, account=account, platform="SP")
            if access_token is False or access_token is None:
                invalid_access_token(action, account_id,
                                     account['user_id'], account['name'])
            else:
                account_dict['access_token'] = access_token['access_token']
                account_dict['name'] = account['name']

    return accounts


def get_account_advertisings_info_mercadolibre(advertisings: dict, action: QueueActions, tool: dict, create_new_process=True, related_id=None, ml=True):
    # Separa anúncios por conta
    accounts = {}
    for advertising in advertisings:
        account_id = str(advertising['account_id'])

        if account_id not in accounts:
            accounts[account_id] = {
                'total': 1,
                'advertisings': [advertising['external_id']],
                'id': int(account_id)
            }
        else:
            accounts[account_id]['total'] += 1
            accounts[account_id]['advertisings'].append(
                advertising['external_id'])

    # Verifica access_token de cada conta e cria processo
    for account_id, account_dict in accounts.items():
        if account_dict['total'] > 0:
            account = get_account(action=action, account_id=account_id)
            platform = 'ML' if ml else 'MS'

            if create_new_process:
                accounts[account_id]['process_id'] = create_process(account_id=account_id, user_id=account['user_id'], tool_id=tool['id'], tool_price=tool.get(
                    'price'), items_total=account_dict['total'], action=action, platform=platform, related_id=related_id)

            access_token = refresh_token(action=action, account=account)
            if access_token is False or access_token is None:
                invalid_access_token(action, account_id,
                                     account['user_id'], account['name'])
            else:
                account_dict['access_token'] = access_token['access_token']
                account_dict['name'] = account['name']
                account_dict['account_data'] = {
                    'id': account['id'],
                    'user_id': account['user_id'],
                    'name': account['name'],
                    'access_token': account['access_token'],
                    'refresh_token': account['refresh_token'],
                    'access_token_expires_at': account['access_token_expires_at']
                }

    return accounts
