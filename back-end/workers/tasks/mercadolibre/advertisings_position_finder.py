#!/usr/bin/env python3

import json
import os
import time
import traceback
from celery.utils.log import get_task_logger
from datetime import datetime, timedelta, date
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import refresh_token, get_account, get_access_token, invalid_access_token, get_tool, format_ml_date
from workers.loggers import log_daily_routine, log_daily_routine_timestamp


LOGGER = get_task_logger(__name__)
LOOKUP_LIMIT = 1000
MAX_VISIT_HISTORY = 30


def advertising_lookup_visits(pool, advertising_id, account_id, last_n_days=1, date_ids={}):
    try:
        action = QueueActions()
        action.conn = get_conn()

        account = action.fetchone(
            "SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token, ac.user_id, ac.name FROM meuml.accounts ac WHERE ac.id = :account_id", {'account_id': account_id})

        if account is None:
            return

        access_token = refresh_token(action=action, account=account)

        if not access_token:
            log_daily_routine({
                'task': 'Lookup advertising visits',
                'status': 'failed',
                'details': f'error renewing access_token - account_id: {account_id} - advertising_id {advertising_id}',
            })
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token, forcelist=[
                                 500, 510, 429, 502], retries_total=3, backoff_factor=2.5)
        response = ml_api.get(
            f'/items/{advertising_id}/visits/time_window?unit=day&last={last_n_days}')

        if response.status_code == 200:
            query = """
                INSERT INTO dw.f_advertising_visits (advertising_id, data_id, qtd_visitas, account_id) 
                VALUES 
            """
            results = response.json().get('results', [])

            values = []
            for result in results:
                values.append(
                    f" ('{advertising_id}', {date_ids.get(result['date'][:10]) if date_ids.get(result['date'][:10]) else 'null'}, {result['total']}, {account_id}) ")

            query += ','.join(values) + \
                ' ON CONFLICT (advertising_id, data_id) DO UPDATE SET qtd_visitas=EXCLUDED.qtd_visitas'
            action.execute(query, raise_exception=True)

        elif response.status_code != 200:
            details = f'advertising {advertising_id}, last {last_n_days} days - code {response.status_code}: {json.dumps(response.json())}'
            log_daily_routine({
                'task': 'Lookup advertising visits',
                'status': 'failed',
                'details': details,
            })
    except Exception as e:
        LOGGER.error(traceback.format_exc())
        log_daily_routine({
            'task': 'Lookup advertising visits',
            'status': 'failed',
            'details': f'exception raised during visits lookup - account {account_id} - advertising {advertising_id} - error message: {str(e)}',
        })
    finally:
        log_daily_routine_timestamp(task='Lookup advertising visits')
        action.conn.close()


def process_response_results(action, response, advertisings, finished, date_ids={}):
    lookup_visits = queue.signature('items_queue:advertising_lookup_visits')

    insert_query = 'INSERT INTO meuml.advertising_positions (advertising_id, account_id, position_at, position) '
    insert_query += 'VALUES (:advertising_id, :account_id, :position_at, :position)'

    results = response.get('results', [])
    offset = response['paging']['offset']

    try:
        for i, result in enumerate(results, 1):
            position = offset + i

            if 'id' in result and result['id'] in advertisings.keys():
                advertising_id = result['id']
                lookup_visits.apply_async(
                    (advertising_id, advertisings[advertising_id]['account_id'], 1, date_ids), countdown=0.05)

                values = {}
                values['account_id'] = advertisings[advertising_id]['account_id']
                values['advertising_id'] = advertising_id
                values['position'] = position
                yesterday = (datetime.today() - timedelta(days=1)
                             ).strftime('%Y-%m-%d 00:00:00')
                values['position_at'] = datetime.strptime(
                    yesterday, "%Y-%m-%d %H:%M:%S")
                action.execute(insert_query, values)
                advertisings.pop(result['id'], None)
                finished += 1

    except Exception as e:
        LOGGER.error(traceback.format_exc())
        log_daily_routine({
            'task': 'Find advertising position',
            'status': 'failed',
            'details': str(e)
        })

    return advertisings, finished

# This routine is no longer being used because it depends on a ML route that was blocked
def find_category_advertisings_position(pool, category_id, subscripted_accounts_params, subscripted_accounts_values, date_ids={}):
    action = QueueActions()
    action.conn = get_conn()

    try:
        admin_accounts = action.fetchall("""
            SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token, ac.user_id, ac.name  
            FROM meuml.accounts ac 
            JOIN meuml.users us ON us.id = ac.user_id 
            WHERE ac.status = 1 AND us.is_admin IS TRUE
        """)

        for account in admin_accounts:
            access_token = refresh_token(
                action=action, account=account, force=True)
            if not access_token:
                invalid_access_token(
                    action, account['id'], account['user_id'], account['name'])
                continue
            else:
                access_token = access_token['access_token']
                break

        if not access_token:
            log_daily_routine({
                'task': 'Find advertising position',
                'status': 'failed',
                'details': f'Not possible to renewing admin access_token - category {category_id}'
            })
            return

        ml_api = MercadoLibreApi(access_token=access_token)

        advertisings_query = f'SELECT id, external_id, account_id FROM meuml.advertisings WHERE category_id=:category_id AND status=:status AND account_id IN ({subscripted_accounts_params})'
        subscripted_accounts_values['category_id'] = category_id
        subscripted_accounts_values['status'] = 'active'
        advertisings_rows = action.fetchall(
            advertisings_query, subscripted_accounts_values)

        print(f"Categoria {category_id} - Total de Anúncios: ",
              len(advertisings_rows))

        if len(advertisings_rows) > 0:
            advertisings = {}
            for row in advertisings_rows:
                advertisings[row['external_id']] = {
                    'id': row.get('id'),
                    'account_id': row['account_id']
                }

            limit = 50
            offset = 0
            finished = 0

            while offset < LOOKUP_LIMIT:
                response = ml_api.get(
                    f'/sites/MLB/search?category={category_id}&limit={limit}&offset={offset}')

                if response.status_code == 200:
                    response = response.json()
                    advertisings, finished = process_response_results(
                        action, response, advertisings, finished, date_ids)
                else:
                    details = f'category {category_id}, offset {offset}, limit {limit} - code {response.status_code}: {json.dumps(response.json())}'
                    log_daily_routine({
                        'task': 'Find advertising position',
                        'status': 'failed',
                        'details': details
                    })
                offset += limit

                if finished == len(advertisings_rows):
                    break

            insert_query = 'INSERT INTO meuml.advertising_positions (advertising_id, account_id, position_at, position) '
            insert_query += 'VALUES (:advertising_id, :account_id, :position_at, :position) '
            lookup_visits = queue.signature(
                'items_queue:advertising_lookup_visits')

            for advertising_id, advertising in advertisings.items():
                lookup_visits.apply_async(
                    (advertising_id, advertising['account_id'], 1, date_ids), countdown=0.05)

                values = {}
                values['account_id'] = advertising['account_id']
                values['advertising_id'] = advertising_id
                values['position'] = LOOKUP_LIMIT
                yesterday = (datetime.today() - timedelta(days=1)
                             ).strftime('%Y-%m-%d 00:00:00')
                values['position_at'] = datetime.strptime(
                    yesterday, "%Y-%m-%d %H:%M:%S")
                action.execute(insert_query, values)

    except Exception as e:
        LOGGER.error(traceback.format_exc())
        log_daily_routine({
            'task': 'Find advertising position',
            'status': 'failed',
            'details': str(e)
        })
    finally:
        log_daily_routine_timestamp(task='Find advertising position')
        action.conn.close()


def update_accounts_visits(accounts, pool, date_id=None):
    try:
        action = QueueActions()
        action.conn = get_conn()

        for account in accounts:
            access_token = refresh_token(
                action=action, account=account, force=True)
            if not access_token:
                invalid_access_token(
                    action, account['id'], account['user_id'], account['name'])
                log_daily_routine({
                    'task': 'Lookup advertising visits',
                    'status': 'failed',
                    'details': f'error renewing access_token - account_id: {account["id"]}',
                })
            else:
                access_token = access_token['access_token']

            ml_api = MercadoLibreApi(access_token=access_token, forcelist=[
                                     500, 510, 429, 502], retries_total=3, backoff_factor=2.5)
            response = ml_api.get(
                f'/users/{account["id"]}/items_visits/time_window?last=1&unit=day')

            if response.status_code == 200:
                results = response.json().get('results', [])

                if len(results) > 0:
                    query = """
                        INSERT INTO dw.f_account_visits (account_id, data_id, qtd_visitas, active_advertisings)
                            SELECT
                                :account_id as account_id,
                                :data_id as data_id,
                                :qtd_visitas as qtd_visitas,
                                count(ad.id) as active_advertisings
                            FROM meuml.advertisings ad
                            WHERE ad.status = 'active' AND ad.account_id = :account_id
                        ON CONFLICT (account_id, data_id)
                        DO UPDATE SET
                            qtd_visitas=EXCLUDED.qtd_visitas
                    """
                    action.execute(query, {'account_id': account['id'], 'data_id': date_id, 'qtd_visitas': results[0]['total']})
    except Exception as e:
        LOGGER.error(traceback.format_exc())
        log_daily_routine({
            'task': 'Lookup advertising visits',
            'status': 'failed',
            'details': f'exception raised during accounts visits lookup - error message: {str(e)}',
        })
    finally:
        action.conn.close()


def advertisings_position_finder(pool):
    action = QueueActions()
    action.conn = get_conn()

    try:
        log_daily_routine_timestamp(
            task='Find advertising position', start=True)
        log_daily_routine_timestamp(
            task='Lookup advertising visits', start=True)

        accounts_query = """
            SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token, ac.user_id, ac.name 
            FROM meuml.accounts ac 
            JOIN meuml.subscription_accounts sa ON sa.account_id = ac.id 
            JOIN meuml.subscriptions su ON sa.subscription_id = su.id 
            WHERE su.expiration_date > now() AND ac.status = 1 AND (su.package_id > 1 or su.modules like '%%7%%') 
        """

        subscripted_accounts = action.fetchall(accounts_query)

        if len(subscripted_accounts) > 0:
            yesterday = (date.today() - timedelta(days=1)).strftime('%Y-%m-%d')
            date_id = action.fetchone(
                "SELECT dw.get_data_id(:yesterday) as initial", {'yesterday': yesterday})
            date_id = date_id['initial']

            update_accounts_visits(subscripted_accounts, pool, date_id)

            subscripted_accounts_params = ''
            subscripted_accounts_values = {}

            for i, account in enumerate(subscripted_accounts):
                subscripted_accounts_params += f':{str(i)},'
                subscripted_accounts_values[str(i)] = account['id']
            subscripted_accounts_params = subscripted_accounts_params[:-1]

            categories_query = f'SELECT DISTINCT category_id FROM meuml.advertisings WHERE category_id IS NOT NULL AND account_id IN ({subscripted_accounts_params})'
            categories = action.fetchall(
                categories_query, subscripted_accounts_values)

            last_year = (date.today() - timedelta(days=395)
                         ).strftime('%Y-%m-%d')
            today = date.today().strftime('%Y-%m-%d')
            date_ids = action.fetchall(
                "SELECT id, TO_CHAR(data_date, 'YYYY-MM-DD') as data_date FROM dw.dim_datas WHERE data_date >= :last_year AND data_date <= :today", {'last_year': last_year, 'today': today})
            date_ids = {date_id['data_date']: date_id['id']
                        for date_id in date_ids}

            # Disable this routine because it uses a route in ML that was blocked
            # find_category_advertisings_position = queue.signature(
            #     'long_running:find_category_advertisings_position')
            # for category in categories:
            #     find_category_advertisings_position.delay(
            #         category['category_id'], subscripted_accounts_params, subscripted_accounts_values, date_ids)
        else:
            log_daily_routine_timestamp(task='Find advertising position')
            log_daily_routine_timestamp(task='Lookup advertising visits')

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def account_visits_complete_history_lookup(action, account_id, access_token, date_ids={}):
    try:
        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.get(
            f'/users/{account_id}/items_visits/time_window?last={MAX_VISIT_HISTORY}&unit=day')

        if response.status_code == 200:
            results = response.json().get('results', [])

            for day_visits in results:
                query = 'INSERT INTO dw.f_account_visits (account_id, data_id, qtd_visitas) VALUES (%s, %s, %s) ON CONFLICT (account_id, data_id) DO UPDATE SET qtd_visitas=EXCLUDED.qtd_visitas'
                values = (
                    account_id,
                    date_ids.get(day_visits['date'][:10]),
                    day_visits['total']
                )
                action.execute(query, values)
    except Exception as e:
        LOGGER.error(traceback.format_exc())


def visits_complete_history_lookup(pool, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        last_year = (date.today() - timedelta(days=395)).strftime('%Y-%m-%d')
        today = date.today().strftime('%Y-%m-%d')
        date_ids = action.fetchall(
            "SELECT id, TO_CHAR(data_date, 'YYYY-MM-DD') as data_date FROM dw.dim_datas WHERE data_date >= :last_year AND data_date <= :today", {'last_year': last_year, 'today': today})
        date_ids = {date_id['data_date']: date_id['id']
                    for date_id in date_ids}

        account_query = """
            SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token, ac.user_id, ac.name
            FROM meuml.accounts ac
            WHERE ac.id = :account_id
        """
        account = action.fetchone(account_query, {'account_id': account_id})

        if account is None:
            return

        access_token = refresh_token(
            action=action, account=account, force=True)
        if not access_token:
            invalid_access_token(
                action, account['id'], account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        account_visits_complete_history_lookup(
            action, account_id, access_token, date_ids)

        query = f"""
            SELECT item_id 
            FROM meli_stage.items_{account_id} 
        """
        advertisings = action.fetchall(query, {'account_id': account_id})
        lookup_visits = queue.signature(
            'items_queue:advertising_lookup_visits')

        for advertising in advertisings:
            lookup_visits.apply_async(
                (advertising['item_id'], account_id, MAX_VISIT_HISTORY, date_ids), countdown=0.05)

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
