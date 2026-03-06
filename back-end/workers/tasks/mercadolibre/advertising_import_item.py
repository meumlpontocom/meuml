import datetime
import json
import pendulum
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.advertising_status import AdvertisingStatus
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from workers.helpers import refresh_token, get_account, get_access_token, invalid_access_token, get_tool, format_ml_date
from workers.loggers import create_process, create_process_item, update_process_item, log_daily_routine, log_daily_routine_timestamp
from workers.tasks.mercadolibre.catalog_publishing import search_catalog_product_id, verify_eligibility
from workers.tasks.mercadolibre import advertising_stage_parsing

import gc

LOGGER = get_task_logger(__name__)


class FailedRequest(Exception):
    pass


class InsertError(Exception):
    LOGGER.error(Exception)
    pass


def mshops_advertising_import_item(pool, account_id: int, user_id: int, ml_item_id: str, process_item_id: int, access_token, update=False, conn=None, routine=False):
    action = QueueActions()
    action.conn = get_conn() if pool is not None else conn

    try:
        ml_api = MercadoLibreApi(access_token=access_token)
        response_data, response = fetch_advertising(ml_api, ml_item_id)

        if response.status_code == 200:
            response_description = ml_api.get(
                f"/items/{ml_item_id}/description")

            if response_description.status_code == 200:
                response_description_data = response_description.json()
                response_data['description'] = response_description_data.get(
                    'plain_text')

    except FailedRequest as e:
        LOGGER.error(e)

        message = f'Anúncio #{ml_item_id} importado -  Erro ao sincronizar (falha de comunicação com o Mercado Livre)'

        if routine:
            log_daily_routine({
                'task': 'Synchronize advertisings routine',
                'status': 'failed',
                'details': f'exception raised during advertising importing: {account_id} - advertising {ml_item_id} - error message: {str(e)}',
            })

        if pool:
            action.conn.close()

        return None, message

    try:
        advertising = get_or_create_advertising(
            pool=pool, account_id=account_id, external_id=ml_item_id, advertising=response_data, ml_api=ml_api, action=action, update=update, ml=False)

        message = f'Anúncio #{ml_item_id} importado -  Sincronizado com sucesso'

    except Exception as e:
        LOGGER.error(e)

        message = f'Anúncio #{ml_item_id} importado -  Erro ao sincronizar'

        if routine:
            log_daily_routine({
                'task': 'Synchronize advertisings routine',
                'status': 'failed',
                'details': f'exception raised during advertising importing: {account_id} - advertising {ml_item_id} - error message: {str(e)}',
            })

        return None, message

    finally:
        if routine:
            log_daily_routine_timestamp(
                task='Synchronize advertisings routine')

        if pool is not None:
            action.conn.close()

    gc.collect()
    return advertising, message


def advertising_import_item(pool, account_id: int, user_id: int, ml_item_id: str, process_item_id: int, access_token, update=False, conn=None, routine=False):
    action = QueueActions()
    action.conn = get_conn() if pool is not None else conn

    try:
        ml_api = MercadoLibreApi(access_token=access_token)
        response_data, response = fetch_advertising(ml_api, ml_item_id)

        if response.status_code == 200:
            response_description = ml_api.get(
                f"/items/{ml_item_id}/description")

            if response_description.status_code == 200:
                response_description_data = response_description.json()
                response_data['description'] = response_description_data.get(
                    'plain_text')

            response_price = ml_api.get(
                f"/items/{ml_item_id}/sale_price?context=channel_marketplace"
            )

            if response_price.status_code == 200:
                response_price_data = response_price.json()
                response_data['price'] = response_price_data.get('amount')

            if response_data.get('tags') and 'catalog_forewarning' in response_data['tags']:
                moderation = ml_api.get(
                    f'/items/{ml_item_id}/catalog_forewarning/date')
                if moderation.status_code == 200:
                    response_data['moderation_date'] = moderation.json().get(
                        'moderation_date')

            if response_data.get('tags') and 'catalog_product_candidate' in response_data['tags']:
                validation_fields = {
                    "site_id": response_data.get('site_id'),
                    # "title": response_data.get('title'),
                    # "description": response_data.get('description') if isinstance(response_data.get('description'), str) else response_data.get('description', {}).get('plain_text'),
                    # "category_id": response_data.get('category_id'),
                    # "pictures": response_data.get('pictures'),
                    "domain_id": response_data.get('domain_id'),
                    "attributes": response_data.get('attributes')
                }

                validation = ml_api.get(
                    f'/catalog_product_candidate/validate', json=validation_fields)
                if validation.status_code == 400:
                    response_data['validation'] = validation.json()
                    response_data['tags'].append('meuml_poor_quality')
                elif validation.status_code == 204:
                    response_data['tags'].append('meuml_high_quality')

            if response_data.get('catalog_listing') and response_data.get('catalog_product_id'):
                response_price_to_win = ml_api.get(
                    f"/items/{ml_item_id}/price_to_win?siteId=MLB&version=v2")

                if response_price_to_win.status_code == 200:
                    upsert_catalog_competition(
                        action, account_id, response_price_to_win.json())

    except FailedRequest as e:
        LOGGER.error(e)

        message = f'Anúncio #{ml_item_id} importado -  Erro ao sincronizar (falha de comunicação com o Mercado Livre)'

        if routine:
            log_daily_routine({
                'task': 'Synchronize advertisings routine',
                'status': 'failed',
                'details': f'exception raised during advertising importing: {account_id} - advertising {ml_item_id} - error message: {str(e)}',
            })

        if pool:
            action.conn.close()

        return None, message

    try:
        advertising = get_or_create_advertising(
            pool=pool, account_id=account_id, external_id=ml_item_id, advertising=response_data, ml_api=ml_api, action=action, update=update)
        message = f'Anúncio #{ml_item_id} importado -  Sincronizado com sucesso'

    except Exception as e:
        LOGGER.error(e)

        message = f'Anúncio #{ml_item_id} importado -  Erro ao sincronizar'

        if routine:
            log_daily_routine({
                'task': 'Synchronize advertisings routine',
                'status': 'failed',
                'details': f'exception raised during advertising importing: {account_id} - advertising {ml_item_id} - error message: {str(e)}',
            })

        return None, message

    finally:
        if routine:
            log_daily_routine_timestamp(
                task='Synchronize advertisings routine')

        if pool is not None:
            action.conn.close()

    gc.collect()
    return advertising, message


def fetch_advertising(ml_api: MercadoLibreApi, ml_item_id: str, all_attributes=True):
    response = ml_api.get(f'/items/{ml_item_id}',
                          params={'include_attributes': all_attributes})

    if response.status_code == 403:
        response = ml_api.get(
            f'/items/{ml_item_id}', params={'include_attributes': all_attributes})

    if response.status_code != 200:
        raise FailedRequest(response)

    response_data = response.json()
    response_data['sku'] = None

    for attribute in response_data.get('attributes', []):
        if attribute.get('name', '') == 'SKU':
            if len(attribute.get('values', [])) > 0:
                response_data['sku'] = [
                    value.get('name', '') for value in attribute.get('values')]
                response_data['sku'] = response_data['sku'][0] if isinstance(
                    response_data['sku'], list) and len(response_data['sku']) > 0 else None
            break

    return response_data, response


def get_or_create_advertising(pool, account_id, external_id: str, advertising: dict, ml_api, action: QueueActions, update=False, single=False, ml=True):

    if ml:
        advertising = verify_eligibility(pool, ml_api, advertising)
        if advertising.get('catalog_listing'):
            advertising['catalog_status'] = 2
        else:
            advertising['catalog_status'] = int(advertising.get('eligible', 0))
    else:
        advertising['catalog_status'] = 0

    status = AdvertisingStatus.status.get(advertising['status'], 52)
    advertising['account_id'] = account_id
    advertising['advertising_id'] = external_id
    advertising['external_data'] = json.dumps(advertising)
    advertising['status'] = status

    parse_json = update or single
    # insert_advertising_images(account_id, advertising, action)

    if parse_json:
        insert_advertising_json(account_id, advertising,
                                action, parse_json, ml)

    return advertising


def insert_advertising_images(account_id, advertising, action):
    for picture in advertising.get('pictures', []):
        image = {
            'id': picture['id'],
            'account_id': account_id,
            'title': advertising['title'],
            'secure_thumbnail': picture['secure_url']
        }

        query_insert = f"""
            INSERT INTO meuml.images
                                (id, account_id, title, image_url) 
                        VALUES (:id, :account_id, :title, :secure_thumbnail)
            ON CONFLICT (id)
                        DO UPDATE SET secure_thumbnail=excluded.image_url
        """
        action.execute(query_insert, image)

        query_insert = f"""
            INSERT INTO meuml.images_advertisings
                                (image_id, advertising_id, account_id) 
                        VALUES (:image_id, :ad, :account_id)
            ON CONFLICT (image_id, advertising_id)
                        DO NOTHING
        """
        action.execute(query_insert, {
                       'image_id': image['id'], 'ad': advertising['advertising_id'], 'account_id': account_id})


def insert_advertising_json(account_id, advertising, action, single, ml=True):
    try:
        insert_into = "meli_stage.items" if ml else 'meli_stage.mshops_items'

        query_insert = f"""
                INSERT INTO {insert_into}
                                    (account_id, item_id, external_data, status) 
                            VALUES (:account_id, :advertising_id, :external_data, :status)
                ON CONFLICT (account_id, item_id, inserted_at)
                            DO UPDATE SET external_data=excluded.external_data, status=excluded.status
            """

        action.execute(query_insert, advertising)

        if single:
            advertising_stage_parsing.parse_advertising_json_single_item(
                None, account_id, advertising['advertising_id'], action.conn, ml=ml)
    except Exception as e:
        LOGGER.error(e)


def update_advertising_json(advertising, action):
    external_id = advertising.pop('advertising_id')

    query = 'UPDATE meuml.advertisings SET '
    for column in advertising.keys():
        query += f'{column} = :{column}, '
    query = query[:-2] + ' WHERE external_id = :advertising_id'

    advertising['advertising_id'] = external_id
    action.execute(query, advertising)


def upsert_catalog_competition(action, account_id, price_to_win):
    query = f"""
        INSERT INTO meuml.catalog_price_to_win
            (id, account_id, catalog_product_id, current_price, price_to_win, 
            status, competitors_sharing_first_place, visit_share, consistent, 
            boosts, winner_id, winner_price, winner_boosts, reason)
        VALUES (:id, :account_id, :catalog_product_id, :current_price, :price_to_win, 
            :status, :competitors_sharing_first_place, :visit_share, :consistent, 
            :boosts, :winner_id, :winner_price, :winner_boosts, :reason)
        ON CONFLICT (id) 
        DO UPDATE SET 
            date_modified = NOW(),
            current_price = excluded.current_price, 
            price_to_win = excluded.price_to_win, 
            status = excluded.status, 
            competitors_sharing_first_place = excluded.competitors_sharing_first_place,
            visit_share = excluded.visit_share, 
            consistent = excluded.consistent, 
            boosts = excluded.boosts, 
            winner_id = excluded.winner_id, 
            winner_price = excluded.winner_price, 
            winner_boosts = excluded.winner_boosts,
            reason = excluded.reason
    """
    values = {
        'id': price_to_win['item_id'],
        'account_id': account_id,
        'catalog_product_id': price_to_win.get('catalog_product_id'),
        'current_price': price_to_win.get('current_price'),
        'price_to_win': price_to_win.get('price_to_win'),
        'status': price_to_win.get('status'),
        'competitors_sharing_first_place': price_to_win['competitors_sharing_first_place'] if price_to_win.get('competitors_sharing_first_place') and price_to_win['competitors_sharing_first_place'] != 'null' else None,
        'visit_share': price_to_win.get('visit_share'),
        'consistent': price_to_win.get('consistent'),
        'boosts': json.dumps(price_to_win['boosts']) if price_to_win.get('boosts') else None,
        'winner_id': price_to_win['winner'].get('item_id') if price_to_win.get('winner') else None if price_to_win.get('winner') else None,
        'winner_price': price_to_win['winner'].get('price') if price_to_win.get('winner') else None,
        'winner_boosts': json.dumps(price_to_win['winner']['boosts']) if price_to_win.get('winner') and price_to_win['winner'].get('boosts') else None,
        'reason': json.dumps(price_to_win['reason']) if price_to_win.get('reason') else None
    }
    action.execute(query, values)
