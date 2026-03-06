import requests
import traceback
from celery.utils.log import get_task_logger
from io import BytesIO
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.enums.access_type import AccessType      
from libs.enums.marketplace import Marketplace
from libs.minio_api.minio_api import upload_image
from libs.queue.queue import app as queue
from PIL import Image
from workers.helpers import refresh_token, get_account, invalid_access_token, get_tool, get_advertisings, get_account_advertisings_info
from workers.loggers import create_process_item, update_process_item
from workers.payment_helpers import use_credits


LOGGER = get_task_logger(__name__)


def article_import_mercadolibre_many(user_id: int, filter_query: str, filter_values: dict):
    action = QueueActions()
    action.conn = get_conn()

    try:
        article_import_item = queue.signature('long_running:article_import_item')

        tool = get_tool(action, 'article-import-mercadolibre')
        if tool is None:
            LOGGER.error('Tool not found')
            return
        
        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)

        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            query = f"""
                SELECT wh.id 
                FROM stock.warehouses wh 
                LEFT JOIN stock.account_warehouse aw ON aw.warehouse_id = wh.id AND aw.account_id = :account_id AND aw.marketplace_id = :marketplace_id 
                WHERE (wh.is_default OR aw.warehouse_id IS NOT NULL) AND wh.user_id = {user_id} 
                ORDER BY wh.is_default 
                LIMIT 1
            """
            warehouse = action.fetchone(query, {'account_id': account_id, 'marketplace_id': Marketplace.MercadoLibre.value})

            for advertising in advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising, action)

                if not warehouse:
                    message = f'Importação de Anúncio #{item_id} - Armazém padrão para conta #{account_id} não encontrado'
                    update_process_item(process_item_id, False, False, action, message)
                    continue

                if tool['access_type'] == AccessType.free \
                or tool['access_type'] == AccessType.subscription \
                or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    article_import_item.delay(
                        user_id=user_id,
                        account_id=int(account_id),
                        process_item_id=process_item_id,
                        marketplace_id=Marketplace.MercadoLibre.value,
                        item_id=advertising,
                        warehouse=warehouse
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f'Importação de Anúncio #{advertising} - Operação não realizada (créditos insuficientes).')

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def article_import_shopee_many(user_id: int, filter_query: str, filter_values: dict):
    action = QueueActions()
    action.conn = get_conn()

    try:
        article_import_item = queue.signature('long_running:article_import_item')

        tool = get_tool(action, 'article-import-shopee')
        
        if tool is None:
            LOGGER.error('Tool not found')
            return

        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)

        # Atualiza anúncios por batch e altera preço quando finalizado
        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            query = f"""
                SELECT wh.id 
                FROM stock.warehouses wh 
                LEFT JOIN stock.account_warehouse aw ON aw.warehouse_id = wh.id AND aw.account_id = :account_id AND aw.marketplace_id = :marketplace_id 
                WHERE (wh.is_default OR aw.warehouse_id IS NOT NULL) AND wh.user_id = {user_id} 
                ORDER BY wh.is_default 
                LIMIT 1
            """
            warehouse = action.fetchone(query, {'account_id': account_id, 'marketplace_id': Marketplace.Shopee.value})

            for advertising in advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising, action)

                if not warehouse:
                    message = f'Importação de Anúncio #{advertising} - Armazém padrão para conta #{account_id} não encontrado'
                    update_process_item(process_item_id, False, False, action, message)
                    continue

                if tool['access_type'] == AccessType.free \
                or tool['access_type'] == AccessType.subscription \
                or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    article_import_item.delay(
                        user_id=user_id,
                        account_id=int(account_id),
                        process_item_id=process_item_id,
                        marketplace_id=Marketplace.Shopee.value,
                        item_id=advertising,
                        warehouse=warehouse
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f'Importação de Anúncio #{advertising} - Operação não realizada (créditos insuficientes).')
    
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def article_import_item(user_id: int, account_id: int, process_item_id: int, marketplace_id: int, item_id: str, warehouse: dict, conn = None):
    action = QueueActions()
    action.conn = conn if conn else get_conn()

    try:
        if not warehouse:
            message = f'Importação de Anúncio #{item_id} - Armazém padrão para conta #{account_id} não encontrado'
            update_process_item(process_item_id, False, False, action, message)
            return message, 400

        advertising_variations, parent_id = get_advertising_variations(action, marketplace_id, item_id)

        if not advertising_variations:
            message = f'Importação de Anúncio #{item_id} - Dados do anúncio não encontrados'
            update_process_item(process_item_id, False, False, action, message)
            return message, 400

        if parent_id:
            query = f"""
                INSERT INTO stock.article (user_id, name, sku, description, is_parent, from_marketplace_id, from_advertising_id) 
                VALUES (:user_id, :name, :sku, :description, :is_parent, :from_marketplace_id, :from_advertising_id) 
                RETURNING id
            """
            values = {
                'user_id': user_id, 
                'name': advertising_variations[0]['name'], 
                'sku': advertising_variations[0]['sku'], 
                'description': advertising_variations[0]['description'], 
                'is_parent': True, 
                'from_marketplace_id': marketplace_id, 
                'from_advertising_id': advertising_variations[0]['external_id']
            }
            parent_id = action.execute_insert(query, values)

            if not parent_id:
                message = f'Importação de Anúncio #{item_id} - Erro ao importar pai das variações (SKU duplicada)'
                update_process_item(process_item_id, False, False, action, message)
                return message, 400
        
        inserted_article_ids = []
        for advertising in advertising_variations:
            query = """
                INSERT INTO stock.article (user_id, parent_id, name, sku, description, from_marketplace_id, from_advertising_id, from_variation_id) 
                VALUES (:user_id, :parent_id, :name, :sku, :description, :from_marketplace_id, :from_advertising_id, :from_variation_id) 
                RETURNING id
            """
            values = {
                'user_id': user_id, 
                'parent_id': parent_id, 
                'name': advertising['name'] if not parent_id else advertising['name'] + ' - ' + advertising['variation_name'],
                'sku': advertising['sku'] if not parent_id else advertising['variation_sku'], 
                'description': advertising['description'],
                'from_marketplace_id': marketplace_id, 
                'from_advertising_id': advertising['external_id'], 
                'from_variation_id': advertising['variation_external_id']
            }
            article_id = action.execute_insert(query, values) 

            if not article_id:
                message = f'Importação de Anúncio #{item_id} - Erro ao adicionar produto (SKU duplicada)'
                update_process_item(process_item_id, False, False, action, message)
                handle_failed_importation(action, parent_id, inserted_article_ids)
                return message, 400
            else:
                inserted_article_ids.append(article_id) 

            query = """
                INSERT INTO stock.stock (article_id, qtd_total, qtd_available, qtd_reserved) 
                VALUES(:article_id, :qtd_total, :qtd_available, :qtd_reserved)
                RETURNING id
            """
            values = {
                'article_id': article_id,
                'qtd_total': advertising['stock'] if not parent_id else advertising['variation_stock'],
                'qtd_available': advertising['stock'] if not parent_id else advertising['variation_stock'],
                'qtd_reserved': advertising['reserved_stock'] if not parent_id else advertising['variation_reserved_stock']
            }
            stock_id = action.execute_insert(query, values)

            if not stock_id:
                message = f'Importação de Anúncio #{item_id} - Erro ao adicionar estoque do produto'
                update_process_item(process_item_id, False, False, action, message)
                handle_failed_importation(action, parent_id, inserted_article_ids)
                return message, 400 

            query = """
                INSERT INTO stock.stock_item (stock_id, warehouse_id, expiration_date, price_buy, qtd_total, qtd_available, qtd_reserved)
                VALUES (:stock_id, :warehouse_id, :expiration_date, :price_buy, :qtd_total, :qtd_available, :qtd_reserved)
            """
            values = {
                'stock_id': stock_id, 
                'warehouse_id': warehouse['id'],
                'expiration_date': None, 
                'price_buy': None, 
                'qtd_total': advertising['stock'] if not parent_id else advertising['variation_stock'],
                'qtd_available': advertising['stock'] if not parent_id else advertising['variation_stock'],
                'qtd_reserved': advertising['reserved_stock'] if not parent_id else advertising['variation_reserved_stock']
            }
            action.execute(query, values)

            query = """
                INSERT INTO stock.stock_in (article_id, warehouse_id, quantity, price_buy, expiration_date, buy_id)
                VALUES (:article_id, :warehouse_id, :quantity, :price_buy, :expiration_date, :buy_id)
            """
            values = {
                'article_id': article_id, 
                'warehouse_id': warehouse['id'],
                'quantity': advertising['stock'] if not parent_id else advertising['variation_stock'],
                'price_buy': None, 
                'expiration_date': None,
                'buy_id': None,
            }
            action.execute(query, values)

            if advertising['attributes']:
                query = """
                    INSERT INTO stock.article_attr (article_id, field, value)
                    VALUES 
                """
                
                values = []
                field_value = {}
                for i, attribute in enumerate(advertising['attributes']):
                    values.append(f"({article_id}, :field{i}, :value{i})")
                    field_value[f'field{i}'] = attribute['field']
                    field_value[f'value{i}'] = attribute['value']

                query += ', '.join(values)
                action.execute(query, field_value)

            images = import_external_images(action, user_id, advertising['images'])
            if images:
                query = """
                    INSERT INTO stock.article_images (article_id, image_id, is_main_image)
                    VALUES 
                """

                values = []
                for i, image_id in enumerate(images):
                    is_main_image = True if i == 0 else False
                    values.append(f"({article_id}, {image_id}, {is_main_image})")

                query += ', '.join(values)
                action.execute(query)

        message = f'Importação de Anúncio #{item_id} - Sucesso ao importar anúncio para controle de estoque.'
        update_process_item(process_item_id, True, True, action, message)

        return message, 200

    except:
        LOGGER.error(traceback.format_exc())
        message = f'Importação de Anúncio #{item_id} - Erro ao importar anúncio para controle de estoque.'
        update_process_item(process_item_id, False, False, action, message)
        return message, 500
    finally:
        if conn is None:
            action.conn.close()


def get_advertising_variations(action, marketplace_id: int, item_id: str):
    if marketplace_id == Marketplace.MercadoLibre.value:
        query = """
            SELECT
                ad.external_id, 
                ad.title as name, 
                ad.sku, 
                ad.description, 
                ad.available_quantity as stock,
                0 as reserved_stock,
                ad.pictures as images, 
                ad.attributes, 
                ad.variations, 
                NULL as variation_external_id, 
                NULL as variation_name, 
                NULL as variation_sku, 
                NULL as variation_stock,
                NULL as variation_reserved_stock
            FROM meuml.advertisings ad 
            WHERE ad.external_id = :id 
        """
        advertising = action.fetchone(query, {'id': item_id})
        advertising_variations = []
        parent_id = None

        images = {}
        for image in advertising['images']:
            images[image['id']] = image['secure_url']
        
        advertising['images'] = [image['secure_url'] for image in advertising['images']]

        attributes = advertising['attributes'] if advertising['attributes'] else []
        for i in range(len(attributes)):
            attributes[i] = {
                'field': attributes[i].get('name'),
                'value': attributes[i].get('value_name')
            }

        for variation in advertising.pop('variations'):
            variation_sku = None

            variation_images = [images[image_id] for image_id in variation['picture_ids']]

            variation_attributes = variation['attributes'] if variation.get('attributes') else []
            for i in range(len(variation_attributes)):
                if variation_attributes[i].get('id') == 'SELLER_SKU':
                    variation_sku = variation_attributes[i].get('value_name')

                variation_attributes[i] = {
                    'field': variation_attributes[i].get('name'),
                    'value': variation_attributes[i].get('value_name')
                }

            variation_name = []
            variation_combinations_attributes = variation['attribute_combinations'] if variation.get('attribute_combinations') else []
            for i in range(len(variation_combinations_attributes)):
                variation_combinations_attributes[i] = {
                    'field': variation_combinations_attributes[i].get('name'),
                    'value': variation_combinations_attributes[i].get('value_name')
                }
                if variation_combinations_attributes[i]:
                    variation_name.append(variation_combinations_attributes[i]['value']) 

            parent_id = advertising['external_id'] 
            advertising_variations.append({
                'external_id': parent_id,
                'name': advertising['name'],
                'sku': advertising['sku'],
                'description': advertising['description'],
                'stock': advertising['stock'],
                'reserved_stock': advertising['reserved_stock'],
                'images': variation_images,
                'attributes': attributes + variation_attributes + variation_combinations_attributes,
                'variation_external_id': variation.get('id'),
                'variation_name': ','.join(variation_name),
                'variation_sku': variation_sku,
                'variation_stock': variation['available_quantity'] if variation.get('available_quantity') else 0,
                'variation_reserved_stock': 0
            })

        if not advertising_variations:
            advertising_variations.append(advertising)

    elif marketplace_id == Marketplace.Shopee.value:
        query = """
            SELECT 
                ad.external_id, 
                ad.name, 
                ad.item_sku as sku,
                ad.description, 
                ad.stock,
                ad.reserved_stock,
                ad.images, 
                ad.attributes, 
                va.id as variation_external_id,
                va.name as variation_name, 
                va.variation_sku,
                va.stock as variation_stock,
                va.reserved_stock as variation_reserved_stock,
                ad.has_variation 
            FROM shopee.advertisings ad 
            LEFT JOIN shopee.variations va ON va.advertising_id = ad.id 
            WHERE ad.external_id = :id 
        """
        advertising_variations = action.fetchall(query, {'id': item_id})
        parent_id = None

        if advertising_variations and advertising_variations[0]['has_variation']:
            parent_id = advertising_variations[0]['external_id']

        for advertising_variation in advertising_variations:
            attributes = advertising_variation['attributes'] if advertising_variation.get('attributes') else []
            for attribute in attributes:
                attribute = {
                    'field': attribute.get('attribute_name'),
                    'value': attribute.get('attribute_value')
                }

    return advertising_variations, parent_id


def import_external_images(action, user_id: int, images_url: list):
    images_id = []
    types = ['image/webp','image/jpeg','image/gif','image/jpg','image/png']
    supported_extensions = ['webp', 'jpeg', 'jpg', 'gif', 'png']

    for image_url in images_url:
        image = Image.open(requests.get(image_url, stream = True).raw)
        
        filename = image_url.split('/')[-1] 
        extension = filename.split('.')[-1]
        content_type = list(filter(lambda x: image.format.lower() in x, types))
        
        if content_type:
            if extension not in supported_extensions:
                filename += '.' + image.format.lower()

            image_bytes = BytesIO()
            image.save(image_bytes, format=image.format)
            image_bytes.seek(0)
            
            data = {
                'filedata': image_bytes,
                'filename': filename,
                'content_type': content_type[0]
            }

            image_id = upload_image(action, user_id, data)

            if image_id:
                images_id.append(image_id)

    return images_id


def handle_failed_importation(action, parent_id, inserted_article_ids):
    if not inserted_article_ids:
        return

    query = f"""
        DELETE FROM stock.stock_in WHERE article_id IN ({','.join([str(article_id) for article_id in inserted_article_ids])})
    """
    action.execute(query)

    query = f"""
        DELETE FROM stock.stock_item WHERE stock_id IN (SELECT st.id FROM stock.stock st WHERE article_id IN ({','.join([str(article_id) for article_id in inserted_article_ids])})) 
    """
    action.execute(query)

    query = f"""
        DELETE FROM stock.stock WHERE article_id IN ({','.join([str(article_id) for article_id in inserted_article_ids])})
    """
    action.execute(query)

    query = f"""
        DELETE FROM stock.article_attr WHERE article_id IN ({','.join([str(article_id) for article_id in inserted_article_ids])})
    """
    action.execute(query)

    query = f"""
        DELETE FROM stock.article_images WHERE article_id IN ({','.join([str(article_id) for article_id in inserted_article_ids])})
    """
    action.execute(query)

    query = f"""
        DELETE FROM stock.article WHERE id IN ({','.join([str(article_id) for article_id in inserted_article_ids])})
    """
    action.execute(query)

    if parent_id:
        query = f"""
            DELETE FROM stock.stock_in WHERE article_id = {parent_id}
        """
        action.execute(query)

        query = f"""
            DELETE FROM stock.stock_item WHERE stock_id IN (SELECT st.id FROM stock.stock st WHERE article_id = {parent_id}) 
        """
        action.execute(query)

        query = f"""
            DELETE FROM stock.stock WHERE article_id = {parent_id}
        """
        action.execute(query)

        query = f"""
            DELETE FROM stock.article_attr WHERE article_id = {parent_id}
        """
        action.execute(query)

        query = f"""
            DELETE FROM stock.article_images WHERE article_id = {parent_id}
        """
        action.execute(query)

        query = f"""
            DELETE FROM stock.article WHERE id = {parent_id}
        """
        action.execute(query)

