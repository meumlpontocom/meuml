import traceback
from celery.utils.log import get_task_logger
from json import dumps
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.enums.promotions import Promotions
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import get_tool, refresh_token
from workers.loggers import create_process


LOGGER = get_task_logger(__name__)


def promotions_import_all(account_id: int):
    action = QueueActions()
    action.conn = get_conn()

    try:
        import_promotion = queue.signature(
            'long_running:promotions_import_item')

        query = """
            SELECT ac.id, ac.user_id, ac.name, ac.access_token, ac.access_token_expires_at, ac.refresh_token 
            FROM meuml.accounts ac 
            WHERE ac.id = :id AND ac.status = 1
        """
        account = action.fetchone(query, {'id': account_id})

        if not account:
            return

        access_token = refresh_token(account, action, platform="ML")

        if not access_token:
            return

        limit = 50
        offset = 0
        ml_api = MercadoLibreApi(access_token=access_token['access_token'])

        query = "DELETE FROM meuml.promotion_advertisings WHERE account_id = :account_id"
        action.execute(query, {'account_id': account_id})

        query = "DELETE FROM meuml.promotions WHERE account_id = :account_id"
        action.execute(query, {'account_id': account_id})

        query = """
            INSERT INTO meuml.promotions (account_id, promotion_type_id, external_id, status, name, start_date, finish_date, deadline_date, benefits, offers)
            VALUES (:account_id, :promotion_type_id, :external_id, :status, :name, :start_date, :finish_date, :deadline_date, :benefits, :offers)
            RETURNING id
        """

        while True:
            response = ml_api.get(f'/seller-promotions/users/{account["id"]}', params={
                'limit': limit,
                'offset': offset
            })

            if response.status_code != 200:
                break

            offset += limit
            response_data = response.json()
            total = response_data['paging']['total']

            promotions = response_data['results']

            for promotion in promotions:
                promotion_id = action.execute_insert(query, {
                    'account_id': account_id,
                    'promotion_type_id': Promotions.types.get(promotion['type']),
                    'external_id': promotion['id'],
                    'status': promotion.get('status'),
                    'name': promotion.get('name'),
                    'start_date': promotion.get('start_date'),
                    'finish_date': promotion.get('finish_date'),
                    'deadline_date': promotion.get('deadline_date'),
                    'benefits': dumps(promotion['benefits']) if promotion.get('benefits') else None,
                    'offers': dumps(promotion['offers']) if promotion.get('offers') else None
                })

                if promotion_id:
                    import_promotion.delay(
                        account=account,
                        promotion_id=promotion_id,
                        promotion_external_id=promotion['id'],
                        promotion_type=promotion['type']
                    )

            if offset >= total:
                break

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def promotions_import_item(account: dict, promotion_id: int, promotion_external_id: str, promotion_type: str):
    action = QueueActions()
    action.conn = get_conn()

    try:
        access_token = refresh_token(action=action, account=account)

        if not access_token:
            return

        tool = get_tool(action, 'import-promotion')

        limit = 50
        offset = 0
        ml_api = MercadoLibreApi(access_token=access_token['access_token'])

        query = """
            INSERT INTO meuml.promotion_advertisings
                (account_id, promotion_id, advertising_id, offer_id, status, price, original_price, max_original_price, meli_percentage, seller_percentage, stock_min, stock_max, start_date, end_date)
            VALUES 
        """

        process_query = """
            INSERT INTO meuml.process_items 
                (user_id, account_id, process_id, item_external_id, status, message, http_status) 
            VALUES 
        """

        process_id = None
        items_total = 0

        while True:
            response = ml_api.get(f'/seller-promotions/promotions/{promotion_external_id}/items?promotion_type={promotion_type}', params={
                'limit': limit,
                'offset': offset
            })

            response_data = response.json()

            if response.status_code != 200 or response_data['results'] is None:
                break

            offset += limit
            total = response_data['paging']['total']

            items = response_data['results']
            items_total += len(items)

            values = {}
            values_query = []
            process_values_query = []

            if not process_id:
                process_id = create_process(
                    account['id'], account['user_id'], tool['id'], tool['price'], total, action)

            for i, item in enumerate(items):
                values_query.append(
                    f" ({account['id']}, {promotion_id}, :advertising_id{i}, :offer_id{i}, :status{i}, :price{i}, :original_price{i}, :max_original_price{i}, :meli_percentage{i}, :seller_percentage{i}, :stock_min{i}, :stock_max{i}, :start_date{i}, :end_date{i}) ")

                values[f'advertising_id{i}'] = item.get('id')
                values[f'offer_id{i}'] = item.get('offer_id')
                values[f'status{i}'] = item.get('status')
                values[f'price{i}'] = item.get('price')
                values[f'original_price{i}'] = item.get('original_price')
                values[f'max_original_price{i}'] = item.get(
                    'max_original_price')
                values[f'meli_percentage{i}'] = item.get('meli_percentage')
                values[f'seller_percentage{i}'] = item.get('seller_percentage')
                values[f'stock_min{i}'] = item['stock'].get('min') if item.get(
                    'stock') and isinstance(item['stock'], dict) else None
                values[f'stock_max{i}'] = item['stock'].get('max') if item.get(
                    'stock') and isinstance(item['stock'], dict) else None
                values[f'start_date{i}'] = item.get(
                    'start_date') if item.get('start_date') else None
                values[f'end_date{i}'] = item.get(
                    'end_date')if item.get('end_date') else None

                process_values_query.append(
                    f" ({account['user_id']}, {account['id']}, {process_id}, '{item['id']}', 1, 'Promoção #{promotion_external_id} - Anúncio #{item.get('id')} sincronizado com sucesso', 200) ")

            if len(values_query) > 0:
                action.execute(query + ','.join(values_query), values)
                action.execute(process_query + ','.join(process_values_query))

            if offset >= total:
                break

        if not process_id:
            process_id = create_process(
                account['id'], account['user_id'], tool['id'], tool['price'], 1, action)
            action.execute(
                process_query + f" ({account['user_id']}, {account['id']}, {process_id}, '{promotion_external_id}', 0, 'Promoção #{promotion_external_id} - Erro ao sincronizar anúncios da promoção', 502) ")

        elif items_total < total:
            process_values_query = []
            for i in range(total - items_total):
                process_values_query.append(
                    f" ({account['user_id']}, {account['id']}, {process_id}, '{promotion_external_id}', 0, 'Promoção #{promotion_external_id} - Erro ao sincronizar anúncios da promoção', 502) ")
            action.execute(process_query + ','.join(process_values_query))

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
