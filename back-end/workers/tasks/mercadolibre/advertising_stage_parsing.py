from datetime import datetime
import json
import pendulum
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import get_tool, format_ml_date, refresh_token
from workers.loggers import create_process, create_process_item, update_process_item
import gc

LOGGER = get_task_logger(__name__)


def parse_advertising_json_all(pool, account_id: int, process_id: int, status: int = None, ml=True):
    try:
        action = QueueActions()
        action.conn = get_conn()

        adv_table = 'advertisings' if ml else 'mshops_advertisings'
        items_table = 'items' if ml else 'mshops_items'

        date_now = datetime.now().strftime("%Y%m%d")

        query = f"""
            DELETE FROM meuml.variations va
            WHERE va.account_id = :account_id
        """
        #action.execute(query, {'account_id': account_id})

        query = f"""
            INSERT INTO meuml.variations
                    (id, date_created, date_modified, account_id, advertising_id, price, available_quantity, 
                    sold_quantity, sku, seller_custom_field, catalog_product_id, inventory_id, 	
                    "attributes", attribute_combinations, item_relations, picture_ids, sale_terms)
                SELECT 
                    (variation ->> 'id')::bigint as id, 
                    date_created,
                    last_updated as date_modified,
                    account_id, 
                    advertising_id, 
                    (variation ->> 'price')::numeric(12,2) as price, 
                    (variation ->> 'available_quantity')::integer as available_quantity, 
                    (variation ->> 'sold_quantity')::integer as sold_quantity, 
                    (SELECT (jsonb_path_query(
                        variation -> 'attributes', 
                        '$[*] ? (@.id == "SELLER_SKU")'
                        )->> 'value_name'
                    )) as sku,
                    variation ->> 'seller_custom_field' as seller_custom_field, 
                    variation ->> 'catalog_product_id' as catalog_product_id, 
                    variation ->> 'inventory_id' as inventory_id, 
                    variation -> 'attributes' as "attributes", 
                    variation -> 'attribute_combinations' as attribute_combinations, 
                    variation -> 'item_relations' as item_relations, 
                    variation -> 'picture_ids' as picture_ids, 
                    variation -> 'sale_terms' as sale_terms
                FROM ( 
                    SELECT 
                        it.item_id as advertising_id, 
                        it.account_id,
                        ((it.external_data ->> 'date_created')::timestamp without time zone) as date_created, 
                        ((it.external_data ->> 'last_updated')::timestamp without time zone) as last_updated, 
                        jsonb_array_elements(it.external_data -> 'variations') as variation 
                    FROM meli_stage.items_{date_now} it
                    WHERE jsonb_array_length(it.external_data -> 'variations') > 0 
                ) subquery
            ON CONFLICT (id)
                DO UPDATE SET 
                    date_created=excluded.date_created, 
                    date_modified=excluded.date_modified,
                    price=excluded.price, 
                    available_quantity=excluded.available_quantity, 
                    sold_quantity=excluded.sold_quantity, 
                    sku=excluded.sku, 
                    seller_custom_field=excluded.seller_custom_field, 
                    catalog_product_id=excluded.catalog_product_id, 
                    inventory_id=excluded.inventory_id,	
                    "attributes"=excluded."attributes",
                    attribute_combinations=excluded.attribute_combinations, 
                    item_relations=excluded.item_relations, 
                    picture_ids=excluded.picture_ids, 
                    sale_terms=excluded.sale_terms
        """
        # action.execute(query)

        count_query = f"""
            SELECT count(*) as total
            FROM meli_stage.{items_table}_{date_now}
            WHERE status = {status}
            AND account_id = {account_id}
            AND item_id NOT IN (SELECT external_id FROM meuml.{adv_table} WHERE account_id = {account_id})
        """

        insert_query = f"""
            INSERT INTO meuml.{adv_table} (external_id, account_id, site_id, category_id, title, status, domain_id,
                catalog_product_id, catalog_listing, currency_id, price, condition, initial_quantity, 
                available_quantity, sold_quantity, listing_type_id, free_shipping, shipping_mode, buying_mode, 
                permalink, secure_thumbnail, tags, start_time, date_created, last_updated, parent_item_id, 
                accepts_mercadopago, warranty, total_listing_fee, catalog_status, quality, expires_at, 
                original_price, eligible, catalog_product_name, variations, item_relations, sku, shipping_tags,
                moderation_date, logistic_type, pictures, description, attributes) 
            SELECT 
                external_data ->> 'id' as external_id, 
                CAST(external_data ->> 'seller_id' AS bigint) as account_id, 
                external_data ->> 'site_id' as site_id, 
                external_data ->> 'category_id' as category_id, 
                external_data ->> 'title' as title, 
                external_data ->> 'status' as status, 
                external_data ->> 'domain_id' as domain_id, 
                external_data ->> 'catalog_product_id' as catalog_product_id, 
                CAST(external_data ->> 'catalog_listing' AS boolean) as catalog_listing, 
                external_data ->> 'currency_id' as currency_id, 
                CAST(external_data ->> 'price' as numeric) as price, 
                external_data ->> 'condition' as condition, 
                CAST(external_data ->> 'initial_quantity' as integer) as initial_quantity, 
                CAST(external_data ->> 'available_quantity' as integer) as available_quantity, 
                CAST(external_data ->> 'sold_quantity' as integer) as sold_quantity, 
                external_data ->> 'listing_type_id' as listing_type_id, 
                CAST(external_data ->  'shipping' ->> 'free_shipping' as boolean)::int as free_shipping, 
                external_data ->  'shipping' ->> 'mode' as shipping_mode, 
                external_data ->> 'buying_mode' as buying_mode, 
                external_data ->> 'permalink' as permalink, 
                COALESCE(external_data ->> 'secure_thumbnail', external_data ->> 'thumbnail') as secure_thumbnail,
                TRANSLATE(external_data ->> 'tags', '["] ', '') as tags, 
                CAST(external_data ->> 'start_time' as timestamp without time zone) as start_time, 
                CAST(external_data ->> 'date_created' as timestamp without time zone) as date_created, 
                CAST(external_data ->> 'last_updated' as timestamp without time zone) as last_updated, 
                external_data ->> 'parent_item_id' as parent_item_id, 
                CAST(external_data ->> 'accepts_mercadopago' AS boolean) as accepts_mercadopago, 
                external_data ->> 'warranty' as warranty, 
                CAST(external_data ->> 'total_listing_fee' as numeric) as total_listing_fee, 
                CAST(external_data ->> 'catalog_status' as smallint) as catalog_status, 
                CAST(external_data ->> 'health' as float) as quality, 
                CAST(external_data ->> 'stop_time' as timestamp without time zone) as expires_at, 
                CAST(external_data ->> 'original_price' as numeric) as original_price, 
                CAST(external_data ->> 'eligible' as boolean)::int as eligible, 
                external_data ->> 'catalog_product_name' as catalog_product_name, 
                external_data -> 'variations' as variations, 
                external_data -> 'item_relations' as item_relations, 
                external_data ->> 'sku' as sku, 
                external_data -> 'shipping' -> 'tags' as shipping_tags, 
                CAST(external_data ->> 'moderation_date' as timestamp without time zone) as moderation_date, 
                external_data ->  'shipping' ->> 'logistic_type' as logistic_type,
                external_data -> 'pictures' as pictures, 
                external_data ->> 'description' as description,
                external_data -> 'attributes' as attributes 
            FROM meli_stage.{items_table}_{date_now} i
            WHERE status = {status}
            AND account_id = {account_id}
            AND item_id NOT IN (SELECT external_id FROM meuml.{adv_table} WHERE account_id = {account_id}) 
            LIMIT 100
        """

        while True:
            remaining_for_insert = action.fetchone(count_query)

            if not remaining_for_insert or remaining_for_insert['total'] == 0:
                break

            action.execute(insert_query)

        count_query = f"""
            SELECT count(*) as total 
            FROM meli_stage.{items_table}_{date_now} it, meuml.{adv_table} ad
            WHERE it.status = {status} 
                AND ad.external_id = it.item_id 
                AND ad.account_id = {account_id} 
                AND (it.external_data ->> 'last_updated')::timestamp > ad.last_updated 
        """

        update_query = f"""
            WITH modified_advertisings AS (
                SELECT it.item_id, it.external_data 
                FROM meli_stage.{items_table}_{date_now} it, meuml.{adv_table} ad
                WHERE it.status = {status} 
                    AND ad.external_id = it.item_id 
                    AND ad.account_id = {account_id} 
                    AND (it.external_data ->> 'last_updated')::timestamp > ad.last_updated 
                LIMIT 100 
            ) 
            UPDATE 
                meuml.{adv_table}
            SET 
                site_id = modified_advertisings.external_data ->> 'site_id', 
                category_id = modified_advertisings.external_data ->> 'category_id', 
                title = modified_advertisings.external_data ->> 'title', 
                status = modified_advertisings.external_data ->> 'status', 
                domain_id = modified_advertisings.external_data ->> 'domain_id', 
                catalog_product_id = modified_advertisings.external_data ->> 'catalog_product_id', 
                catalog_listing = (modified_advertisings.external_data ->> 'catalog_listing')::boolean, 
                currency_id = modified_advertisings.external_data ->> 'currency_id', 
                price = (modified_advertisings.external_data ->> 'price')::numeric, 
                condition = modified_advertisings.external_data ->> 'condition', 
                initial_quantity = (modified_advertisings.external_data ->> 'initial_quantity')::integer, 
                available_quantity = (modified_advertisings.external_data ->> 'available_quantity')::integer, 
                sold_quantity = (modified_advertisings.external_data ->> 'sold_quantity')::integer, 
                listing_type_id = modified_advertisings.external_data ->> 'listing_type_id', 
                free_shipping = ((modified_advertisings.external_data ->  'shipping' ->> 'free_shipping')::boolean)::int, 
                shipping_mode = modified_advertisings.external_data ->  'shipping' ->> 'mode', 
                buying_mode = modified_advertisings.external_data ->> 'buying_mode', 
                permalink = modified_advertisings.external_data ->> 'permalink', 
                secure_thumbnail = modified_advertisings.external_data ->> 'secure_thumbnail', 
                tags = TRANSLATE(modified_advertisings.external_data ->> 'tags', '["] ', ''), 
                start_time = (modified_advertisings.external_data ->> 'start_time')::timestamp, 
                date_created = (modified_advertisings.external_data ->> 'date_created')::timestamp, 
                last_updated = (modified_advertisings.external_data ->> 'last_updated')::timestamp, 
                parent_item_id = modified_advertisings.external_data ->> 'parent_item_id', 
                accepts_mercadopago = (modified_advertisings.external_data ->> 'accepts_mercadopago')::boolean, 
                warranty = modified_advertisings.external_data ->> 'warranty', 
                total_listing_fee = (modified_advertisings.external_data ->> 'total_listing_fee')::numeric, 
                catalog_status = (modified_advertisings.external_data ->> 'catalog_status')::smallint, 
                quality = (modified_advertisings.external_data ->> 'health')::float, 
                expires_at = (modified_advertisings.external_data ->> 'stop_time')::timestamp, 
                original_price = (modified_advertisings.external_data ->> 'original_price')::numeric, 
                eligible = ((modified_advertisings.external_data ->> 'eligible')::boolean)::int, 
                catalog_product_name = modified_advertisings.external_data ->> 'catalog_product_name', 
                variations = modified_advertisings.external_data -> 'variations', 
                item_relations = modified_advertisings.external_data -> 'item_relations', 
                sku = modified_advertisings.external_data ->> 'sku', 
                shipping_tags = modified_advertisings.external_data -> 'shipping' -> 'tags', 
                moderation_date = (modified_advertisings.external_data ->> 'moderation_date')::timestamp, 
                logistic_type = modified_advertisings.external_data ->  'shipping' ->> 'logistic_type',
                pictures = modified_advertisings.external_data -> 'pictures',
                description = modified_advertisings.external_data ->> 'description',
                attributes = modified_advertisings.external_data -> 'attributes' 
            FROM modified_advertisings 
            WHERE external_id = modified_advertisings.item_id
        """

        while True:
            remaining_for_update = action.fetchone(count_query)

            if not remaining_for_update or remaining_for_update['total'] == 0:
                break

            action.execute(update_query)

        remove_deleted_advertisings(account_id, action, ml)

        query = """
            UPDATE meuml.processes 
                SET date_finished = NOW()
                WHERE id = :process_id 
        """
        action.execute(query, {'process_id': process_id})
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def remove_deleted_advertisings(account_id, action, ml=True):
    adv_table = 'advertisings' if ml else 'mshops_advertisings'

    date_now = datetime.now().strftime("%Y%m%d")

    query = f"""
            DELETE FROM meuml.{adv_table} ml_ads
            WHERE account_id = :account_id AND ml_ads.external_id NOT IN (
                SELECT json.item_id
                FROM meli_stage.items_{date_now} json
                WHERE account_id = {account_id}
            )
        """
    action.execute(query, {'account_id': account_id})

    query = f"""
            DELETE FROM meuml.variations va
            WHERE va.account_id = :account_id AND va.advertising_id NOT IN (
                SELECT json.item_id
                FROM meli_stage.items_{date_now} json
                WHERE account_id = {account_id}
            )
        """
    #action.execute(query, {'account_id': account_id})

    if ml:
        query = f"""
            DELETE FROM meuml.catalog_price_to_win catalog_price
            WHERE catalog_price.account_id = :account_id AND catalog_price.id NOT IN (
                SELECT ad.external_id
                FROM meuml.advertisings ad
                JOIN meuml.accounts ac ON ac.id = ad.account_id
                WHERE ac.id = :account_id AND ad.catalog_listing IS TRUE
            )
        """
        action.execute(query, {'account_id': account_id})


def parse_advertising_json_single_item(pool, account_id: int, advertising_id: str, conn=None, ml=True):
    try:
        action = QueueActions()
        action.conn = conn if conn else get_conn()

        items_table = "items" if ml else 'mshops_items'
        adv_table = "advertisings" if ml else 'mshops_advertisings'

        date_now = datetime.now().strftime("%Y%m%d")

        query = f"""
            INSERT INTO meuml.{adv_table} (external_id, account_id, site_id, category_id, title, status, domain_id,
					  catalog_product_id, catalog_listing, currency_id, price, condition, initial_quantity, 
					  available_quantity, sold_quantity, listing_type_id, free_shipping, shipping_mode, buying_mode, 
					  permalink, secure_thumbnail, tags, start_time, date_created, last_updated, parent_item_id, 
					  accepts_mercadopago, warranty, total_listing_fee, catalog_status, quality, expires_at, 
					  original_price, eligible, catalog_product_name, variations, item_relations, sku, shipping_tags,
                      moderation_date, logistic_type, pictures, description, attributes) 
                SELECT 
                    external_data ->> 'id' as external_id,
                    CAST(external_data ->> 'seller_id' AS bigint) as account_id,
                    external_data ->> 'site_id' as site_id,
                    external_data ->> 'category_id' as category_id,
                    external_data ->> 'title' as title,
                    external_data ->> 'status' as status,
                    external_data ->> 'domain_id' as domain_id,
                    external_data ->> 'catalog_product_id' as catalog_product_id,
                    CAST(external_data ->> 'catalog_listing' AS boolean) as catalog_listing,
                    external_data ->> 'currency_id' as currency_id,
                    CAST(external_data ->> 'price' as numeric) as price,
                    external_data ->> 'condition' as condition,
                    CAST(external_data ->> 'initial_quantity' as integer) as initial_quantity,
                    CAST(external_data ->> 'available_quantity' as integer) as available_quantity,
                    CAST(external_data ->> 'sold_quantity' as integer) as sold_quantity,
                    external_data ->> 'listing_type_id' as listing_type_id,
                    CAST(external_data ->  'shipping' ->> 'free_shipping' as boolean)::int as free_shipping,
                    external_data ->  'shipping' ->> 'mode' as shipping_mode,
                    external_data ->> 'buying_mode' as buying_mode,
                    external_data ->> 'permalink' as permalink,
                    COALESCE(external_data ->> 'secure_thumbnail', external_data ->> 'thumbnail') as secure_thumbnail,
                    TRANSLATE(external_data ->> 'tags', '["] ', '') as tags,
                    CAST(external_data ->> 'start_time' as timestamp without time zone) as start_time,
                    CAST(external_data ->> 'date_created' as timestamp without time zone) as date_created,
                    CAST(external_data ->> 'last_updated' as timestamp without time zone) as last_updated,
                    external_data ->> 'parent_item_id' as parent_item_id,
                    CAST(external_data ->> 'accepts_mercadopago' AS boolean) as accepts_mercadopago,
                    external_data ->> 'warranty' as warranty,
                    CAST(external_data ->> 'total_listing_fee' as numeric) as total_listing_fee,
                    CAST(external_data ->> 'catalog_status' as smallint) as catalog_status,
                    CAST(external_data ->> 'health' as float) as quality,
                    CAST(external_data ->> 'stop_time' as timestamp without time zone) as expires_at,
                    CAST(external_data ->> 'original_price' as numeric) as original_price,
                    CAST(external_data ->> 'eligible' as boolean)::int as eligible,
                    external_data ->> 'catalog_product_name' as catalog_product_name,
                    external_data -> 'variations' as variations,
                    external_data -> 'item_relations' as item_relations,
                    external_data ->> 'sku' as sku,
                    external_data -> 'shipping' -> 'tags' as shipping_tags,
                    CAST(external_data ->> 'moderation_date' as timestamp without time zone) as moderation_date, 
                    external_data ->  'shipping' ->> 'logistic_type' as logistic_type,
                    external_data -> 'pictures' as pictures,
                    external_data ->> 'description' as description,
                    external_data -> 'attributes' as attributes
                FROM meli_stage.{items_table}_{date_now} i
                WHERE item_id = '{advertising_id}'
        ON CONFLICT (external_id)
            DO UPDATE SET
                category_id=excluded.category_id,
                title=excluded.title,
                status=excluded.status,
                domain_id=excluded.domain_id,
                catalog_product_id=excluded.catalog_product_id,
                catalog_listing=excluded.catalog_listing,
                price=excluded.price,
                condition=excluded.condition,
                initial_quantity=excluded.initial_quantity,
                available_quantity=excluded.available_quantity,
                sold_quantity=excluded.sold_quantity,
                listing_type_id=excluded.listing_type_id,
                free_shipping=excluded.free_shipping,
                shipping_mode=excluded.shipping_mode,
                buying_mode=excluded.buying_mode,
                permalink=excluded.permalink,
                secure_thumbnail=excluded.secure_thumbnail,
                tags=excluded.tags,
                start_time=excluded.start_time,
                date_created=excluded.date_created,
                last_updated=excluded.last_updated,
                parent_item_id=excluded.parent_item_id,
                accepts_mercadopago=excluded.accepts_mercadopago,
                warranty=excluded.warranty,
                total_listing_fee=excluded.total_listing_fee,
                catalog_status=excluded.catalog_status,
                quality=excluded.quality,
                expires_at=excluded.expires_at,
                original_price=excluded.original_price,
                eligible=excluded.eligible,
                catalog_product_name=excluded.catalog_product_name,
                variations=excluded.variations,
                item_relations=excluded.item_relations,
                sku=excluded.sku,
                shipping_tags=excluded.shipping_tags,
                moderation_date=excluded.moderation_date, 
                logistic_type=excluded.logistic_type,
                pictures=excluded.pictures,
                description=excluded.description,
                attributes=excluded.attributes
        """

        action.execute(query)

        query = f"""
            DELETE FROM meuml.variations va
            WHERE va.account_id = :account_id AND va.advertising_id = '{advertising_id}'
        """
       #action.execute(query, {'account_id': account_id})

        query = f"""
            INSERT INTO meuml.variations
                    (id, date_created, date_modified, account_id, advertising_id, price, available_quantity, 
                    sold_quantity, sku, seller_custom_field, catalog_product_id, inventory_id, 	
                    "attributes", attribute_combinations, item_relations, picture_ids, sale_terms)
                SELECT 
                    (variation ->> 'id')::bigint as id, 
                    date_created,
                    last_updated as date_modified,
                    account_id, 
                    advertising_id, 
                    (variation ->> 'price')::numeric(12,2) as price, 
                    (variation ->> 'available_quantity')::integer as available_quantity, 
                    (variation ->> 'sold_quantity')::integer as sold_quantity, 
                    (SELECT (jsonb_path_query(
                        variation -> 'attributes', 
                        '$[*] ? (@.id == "SELLER_SKU")'
                        )->> 'value_name'
                    )) as sku,
                    variation ->> 'seller_custom_field' as seller_custom_field, 
                    variation ->> 'catalog_product_id' as catalog_product_id, 
                    variation ->> 'inventory_id' as inventory_id, 
                    variation -> 'attributes' as "attributes", 
                    variation -> 'attribute_combinations' as attribute_combinations, 
                    variation -> 'item_relations' as item_relations, 
                    variation -> 'picture_ids' as picture_ids, 
                    variation -> 'sale_terms' as sale_terms
                FROM ( 
                    SELECT 
                        it.item_id as advertising_id, 
                        it.account_id,
                        ((it.external_data ->> 'date_created')::timestamp without time zone) as date_created, 
                        ((it.external_data ->> 'last_updated')::timestamp without time zone) as last_updated, 
                        jsonb_array_elements(it.external_data -> 'variations') as variation 
                    FROM meli_stage.items it 
                    WHERE jsonb_array_length(it.external_data -> 'variations') > 0 AND it.item_id = '{advertising_id}'
                ) subquery
            ON CONFLICT (id)
                DO UPDATE SET 
                    date_created=excluded.date_created, 
                    date_modified=excluded.date_modified,
                    price=excluded.price, 
                    available_quantity=excluded.available_quantity, 
                    sold_quantity=excluded.sold_quantity, 
                    sku=excluded.sku, 
                    seller_custom_field=excluded.seller_custom_field, 
                    catalog_product_id=excluded.catalog_product_id, 
                    inventory_id=excluded.inventory_id,	
                    "attributes"=excluded."attributes",
                    attribute_combinations=excluded.attribute_combinations, 
                    item_relations=excluded.item_relations, 
                    picture_ids=excluded.picture_ids, 
                    sale_terms=excluded.sale_terms
        """
        # action.execute(query)

        if not ml:
            set_advertising_shipping(account_id, advertising_id, action)

    except Exception as e:
        LOGGER.error(e)
    finally:
        if pool is not None:
            action.conn.close()


def set_advertising_shipping(account_id, advertising_id, action):
    try:
        query = f"""
                SELECT *
                FROM meuml.accounts ac WHERE ac.id = :account_id
            """

        account = action.fetchone(query, {'account_id': account_id})

        access_token = refresh_token(
            account=account, action=action, platform="ML")

        ml_api = MercadoLibreApi(access_token=access_token['access_token'])
        response = ml_api.get(f"/items/{advertising_id}/shipping")


        if response.status_code == 200:
            response_data = response.json()
            channels = response_data['channels']

            shipping_options = [channel for channel in channels if channel['id'] == 'mshops'][0]
            LOGGER.error(int(shipping_options['free_shipping']))

            query = f"""
                UPDATE meuml.mshops_advertisings ma
                SET free_shipping = {int(shipping_options['free_shipping'])}
                WHERE ma.external_id = '{advertising_id}'
            """

            action.execute(query)

    except Exception as e:
        LOGGER.error(e)
