import datetime
import json
import pendulum
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.queue.queue import app as queue
from workers.helpers import get_tool, format_ml_date
from workers.loggers import create_process, create_process_item, update_process_item
import gc

LOGGER = get_task_logger(__name__)

def parse_shopee_items(account_id: int, process_id: int):
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = f"""
            INSERT INTO shopee.advertisings (id, account_id, external_id, item_sku, gtin_code, status, "name", description, images, currency,
                        has_variation, price, stock, create_time, update_time, weight, category_id, original_price,
                        rating_star, cmt_count, sales, "views", likes, package_length, package_width, package_height,
                        days_to_ship, size_chart, "condition", discount_id, is_2tier_item, tenures, reserved_stock,
                        is_pre_order, inflated_price, inflated_original_price, sip_item_price, price_source, wholesales,
                        attributes, min_variation_price, max_variation_price, min_variation_original_price, max_variation_original_price,
                        tier1, tier2, logistics)
                SELECT
                    (external_data ->> 'item_id')::bigint as id,
                    (external_data ->> 'shopid')::bigint as account_id,
                    (external_data ->> 'item_id')::bigint as external_id,
                    external_data ->> 'item_sku' as item_sku,
                    external_data ->> 'gtin_code' as gtin_code,
                    external_data ->> 'item_status' as status,
                    external_data ->> 'item_name' as "name",
                    external_data ->> 'description' as description,
                    external_data -> 'image' ->> 'image_url_list' as images,
                    external_data ->> 'currency' as currency,
                    (external_data ->> 'has_model')::bool as has_variation,
                    (external_data ->> 'price')::numeric(15,2) as price,
                    (external_data ->> 'stock')::integer as stock,
                    TO_TIMESTAMP((external_data ->> 'create_time')::integer) as create_time,
                    TO_TIMESTAMP((external_data ->> 'update_time')::integer) as update_time,
                    (external_data ->> 'weight')::numeric(15,2) as weight,
                    (external_data ->> 'category_id')::bigint as category_id,
                    (external_data ->> 'original_price')::numeric(15,2) as original_price,
                    (external_data ->> 'rating_star')::numeric(3,2) as rating_star,
                    (external_data ->> 'cmt_count')::integer as cmt_count,
                    (external_data ->> 'sales')::integer as sales,
                    (external_data ->> 'views')::integer as "views",
                    (external_data ->> 'likes')::integer as likes,
                    (external_data -> 'dimension' ->> 'package_length')::numeric(15,2) as package_length,
                    (external_data -> 'dimension' ->> 'package_width')::numeric(15,2) as package_width,
                    (external_data -> 'dimension' ->> 'package_height')::numeric(15,2) as package_height,
                    (external_data -> 'pre_order' ->> 'days_to_ship')::integer as days_to_ship,
                    external_data ->> 'size_chart' as size_chart,
                    external_data ->> 'condition' as "condition",
                    (external_data ->> 'discount_id')::bigint as discount_id,
                    (external_data ->> 'is_2tier_item')::bool as is_2tier_item,
                    external_data -> 'tenures' as tenures,
                    (external_data ->> 'reserved_stock')::integer as reserved_stock,
                    (external_data -> 'pre_order' ->> 'is_pre_order')::bool as is_pre_order,
                    (external_data -> 'price_info' -> 0 ->> 'inflated_price_of_current_price')::numeric(15,2) as inflated_price,
                    (external_data -> 'price_info' -> 0 ->> 'inflated_price_of_original_price')::numeric(15,2) as inflated_original_price,
                    (external_data -> 'price_info' -> 0 ->> 'sip_item_price')::numeric(15,2) as sip_item_price,
                    external_data ->> 'price_source' as price_source,
                    (external_data ->> 'wholesales')::jsonb as wholesales,
                    (external_data ->> 'attribute_list')::jsonb as attributes,
                    (external_data ->> 'min_variation_price')::numeric(15,2) as min_variation_price,
                    (external_data ->> 'max_variation_price')::numeric(15,2) as max_variation_price,
                    (external_data ->> 'min_variation_original_price')::numeric(15,2) as min_variation_original_price,
                    (external_data ->> 'max_variation_original_price')::numeric(15,2) as max_variation_original_price,
                    external_data ->> 'tier1' as tier1,
                    external_data ->> 'tier2' as tier2,
                    external_data -> 'logistic_info' as logistics
                FROM shopee_stage.items_{account_id}
            ON CONFLICT (id)
            DO UPDATE SET
                account_id = excluded.account_id,
                item_sku = excluded.item_sku,
                gtin_code = excluded.gtin_code,
                status = excluded.status,
                "name" = excluded."name",
                description = excluded.description,
                images = excluded.images,
                currency = excluded.currency,
                has_variation = excluded.has_variation,
                price = excluded.price,
                stock = excluded.stock,
                create_time = excluded.create_time,
                update_time = excluded.update_time,
                weight = excluded.weight,
                category_id = excluded.category_id,
                original_price = excluded.original_price,
                rating_star = excluded.rating_star,
                cmt_count = excluded.cmt_count,
                sales = excluded.sales,
                "views" = excluded."views",
                likes = excluded.likes,
                package_length = excluded.package_length,
                package_width = excluded.package_width,
                package_height = excluded.package_height,
                days_to_ship = excluded.days_to_ship,
                size_chart = excluded.size_chart,
                "condition" = excluded."condition",
                discount_id = excluded.discount_id,
                is_2tier_item = excluded.is_2tier_item,
                tenures = excluded.tenures,
                reserved_stock = excluded.reserved_stock,
                is_pre_order = excluded.is_pre_order,
                inflated_price = excluded.inflated_price,
                inflated_original_price = excluded.inflated_original_price,
                sip_item_price = excluded.sip_item_price,
                price_source = excluded.price_source,
                wholesales = excluded.wholesales,
                attributes = excluded.attributes,
                min_variation_price = excluded.min_variation_price,
                max_variation_price = excluded.max_variation_price,
                min_variation_original_price = excluded.min_variation_original_price,
                max_variation_original_price = excluded.max_variation_original_price,
                tier1 = excluded.tier1,
                tier2 = excluded.tier2,
                logistics = excluded.logistics
        """
        action.execute(query)

        parse_shopee_item_variations(action, account_id)
        # parse_shopee_item_attributes(action, account_id)
        # parse_shopee_item_logistics(action, account_id)
        # parse_wholesales(account_id, action)

        remove_deleted_advertisings(account_id, action)

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


def remove_deleted_advertisings(account_id, action):
    query = f"""
            DELETE FROM shopee.advertisings sp_ads
            WHERE account_id = :account_id
                AND NOT exists (
                    SELECT j.item_id FROM shopee_stage.items_{account_id} j
                WHERE j.item_id = sp_ads.id
            )
        """
    action.execute(query, {'account_id': account_id})


def parse_shopee_item(account_id: int, advertising_id: str, conn=None):
    try:
        action = QueueActions()
        action.conn = conn if conn else get_conn()


        query = f"""
                INSERT INTO shopee.advertisings (id, account_id, external_id, item_sku, gtin_code, status, "name", description, images, currency,
                        has_variation, price, stock, create_time, update_time, weight, category_id, original_price, 
                        rating_star, cmt_count, sales, "views", likes, package_length, package_width, package_height, 
                        days_to_ship, size_chart, "condition", discount_id, is_2tier_item, tenures, reserved_stock, 
                        is_pre_order, inflated_price, inflated_original_price, sip_item_price, price_source, wholesales,
                        attributes, min_variation_price, max_variation_price, min_variation_original_price, max_variation_original_price,
                        tier1, tier2, logistics)
                SELECT
                    (external_data ->> 'item_id')::bigint as id,
                    (external_data ->> 'shopid')::bigint as account_id,
                    (external_data ->> 'item_id')::varchar as external_id,
                    external_data ->> 'item_sku' as item_sku,
                    external_data ->> 'gtin_code' as gtin_code,
                    external_data ->> 'item_status' as status,
                    external_data ->> 'item_name' as "name",
                    external_data ->> 'description' as description,
                    external_data -> 'image' ->> 'image_url_list' as images,
                    external_data ->> 'currency' as currency,
                    (external_data ->> 'has_model')::bool as has_variation,
                    (external_data ->> 'price')::numeric(15,2) as price,
                    (external_data ->> 'stock')::integer as stock,
                    TO_TIMESTAMP((external_data ->> 'create_time')::integer) as create_time,
                    TO_TIMESTAMP((external_data ->> 'update_time')::integer) as update_time,
                    (external_data ->> 'weight')::numeric(15,2) as weight,
                    (external_data ->> 'category_id')::bigint as category_id,
                    (external_data ->> 'original_price')::numeric(15,2) as original_price,
                    (external_data ->> 'rating_star')::numeric(3,2) as rating_star,
                    (external_data ->> 'cmt_count')::integer as cmt_count,
                    (external_data ->> 'sales')::integer as sales,
                    (external_data ->> 'views')::integer as "views",
                    (external_data ->> 'likes')::integer as likes,
                    (external_data -> 'dimension' ->> 'package_length')::numeric(15,2) as package_length,
                    (external_data -> 'dimension' ->> 'package_width')::numeric(15,2) as package_width,
                    (external_data -> 'dimension' ->> 'package_height')::numeric(15,2) as package_height,
                    (external_data -> 'pre_order' ->> 'days_to_ship')::integer as days_to_ship,
                    external_data ->> 'size_chart' as size_chart,
                    external_data ->> 'condition' as "condition",
                    (external_data ->> 'discount_id')::bigint as discount_id,
                    (external_data ->> 'is_2tier_item')::bool as is_2tier_item,
                    external_data -> 'tenures' as tenures,
                    (external_data ->> 'reserved_stock')::integer as reserved_stock,
                    (external_data -> 'pre_order' ->> 'is_pre_order')::bool as is_pre_order,
                    (external_data -> 'price_info' -> 0 ->> 'inflated_price_of_current_price')::numeric(15,2) as inflated_price,
                    (external_data -> 'price_info' -> 0 ->> 'inflated_price_of_original_price')::numeric(15,2) as inflated_original_price,
                    (external_data -> 'price_info' -> 0 ->> 'sip_item_price')::numeric(15,2) as sip_item_price,
                    external_data ->> 'price_source' as price_source,
                    (external_data ->> 'wholesales')::jsonb as wholesales,
                    (external_data ->> 'attribute_list')::jsonb as attributes,
                    (external_data ->> 'min_variation_price')::numeric(15,2) as min_variation_price,
                    (external_data ->> 'max_variation_price')::numeric(15,2) as max_variation_price,
                    (external_data ->> 'min_variation_original_price')::numeric(15,2) as min_variation_original_price,
                    (external_data ->> 'max_variation_original_price')::numeric(15,2) as max_variation_original_price,
                    external_data ->> 'tier1' as tier1,
                    external_data ->> 'tier2' as tier2,
                    external_data -> 'logistic_info' as logistics
                FROM shopee_stage.items_{account_id}
                WHERE item_id = {advertising_id}
            ON CONFLICT (id)
            DO UPDATE SET
                account_id = excluded.account_id,
                item_sku = excluded.item_sku,
                gtin_code = excluded.gtin_code,
                status = excluded.status,
                "name" = excluded."name",
                description = excluded.description,
                images = excluded.images,
                currency = excluded.currency,
                has_variation = excluded.has_variation,
                price = excluded.price,
                stock = excluded.stock,
                create_time = excluded.create_time,
                update_time = excluded.update_time,
                weight = excluded.weight,
                category_id = excluded.category_id,
                original_price = excluded.original_price,
                rating_star = excluded.rating_star,
                cmt_count = excluded.cmt_count,
                sales = excluded.sales,
                "views" = excluded."views",
                likes = excluded.likes,
                package_length = excluded.package_length,
                package_width = excluded.package_width,
                package_height = excluded.package_height,
                days_to_ship = excluded.days_to_ship,
                size_chart = excluded.size_chart,
                "condition" = excluded."condition",
                discount_id = excluded.discount_id,
                is_2tier_item = excluded.is_2tier_item,
                tenures = excluded.tenures,
                reserved_stock = excluded.reserved_stock,
                is_pre_order = excluded.is_pre_order,
                inflated_price = excluded.inflated_price,
                inflated_original_price = excluded.inflated_original_price,
                sip_item_price = excluded.sip_item_price,
                price_source = excluded.price_source,
                wholesales = excluded.wholesales,
                attributes = excluded.attributes,
                min_variation_price = excluded.min_variation_price,
                max_variation_price = excluded.max_variation_price,
                min_variation_original_price = excluded.min_variation_original_price,
                max_variation_original_price = excluded.max_variation_original_price,
                tier1 = excluded.tier1,
                tier2 = excluded.tier2,
                logistics = excluded.logistics
        """
        action.execute(query)

        parse_shopee_item_variations(action, account_id, advertising_id)
        # parse_shopee_item_attributes(action, account_id, advertising_id)
        # parse_shopee_item_logistics(action, account_id, advertising_id)

    except Exception as e:
        LOGGER.error('error parsing shopee ad from stage')
        LOGGER.error(e)
    finally:
        if not conn:
            action.conn.close()


def parse_shopee_item_variations(action, account_id, advertising_id=None):
    condition = "" if not advertising_id else f" WHERE item_id = '{advertising_id}' "

    query = f"""
        INSERT INTO shopee.variations (variation_id, advertising_id, variation_sku, name,
                price, stock, status, create_time, update_time, original_price, discount_id,
                reserved_stock, inflated_price, inflated_original_price, sip_item_price, price_source)
            SELECT
                (external_data ->> 'variation_id')::bigint as variation_id,
                (external_data ->> 'item_id')::bigint as advertising_id,
                external_data ->> 'variation_sku' as variation_sku,
                external_data ->> 'name' as name,
                (external_data ->> 'price')::numeric(15,2) as price,
                (external_data ->> 'stock')::integer as stock,
                external_data ->> 'status' as status,
                TO_TIMESTAMP((external_data ->> 'create_time')::integer) as create_time,
                TO_TIMESTAMP((external_data ->> 'create_time')::integer) as update_time,
                (external_data ->> 'original_price')::numeric(15,2) as original_price,
                (external_data ->> 'discount_id')::bigint as discount_id,
                (external_data ->> 'reserved_stock')::integer as reserved_stock,
                (external_data ->> 'inflated_price')::numeric(15,2) as inflated_price,
                (external_data ->> 'inflated_original_price')::numeric(15,2) as inflated_original_price,
                (external_data ->> 'sip_item_price')::numeric(15,2) as sip_item_price,
                external_data ->> 'price_source' as price_source
            FROM shopee_stage.item_variations_{account_id} {condition}
        ON CONFLICT (variation_id)
            DO UPDATE SET
                variation_sku = excluded.variation_sku,
                name = excluded.name,
                price = excluded.price,
                stock = excluded.stock,
                status = excluded.status,
                create_time = excluded.create_time,
                update_time = excluded.update_time,
                original_price = excluded.original_price,
                discount_id = excluded.discount_id,
                reserved_stock = excluded.reserved_stock,
                inflated_price = excluded.inflated_price,
                inflated_original_price = excluded.inflated_original_price,
                sip_item_price = excluded.sip_item_price,
                price_source = excluded.price_source
    """
    action.execute(query)


def parse_shopee_item_attributes(action, account_id, advertising_id=None):
    condition = "" if not advertising_id else f" WHERE item_id = '{advertising_id}' "

    query = f"""
        INSERT INTO shopee.attributes (attribute_id, advertising_id, attribute_name,
                is_mandatory, attribute_type, attribute_value)
            SELECT
                (external_data ->> 'attribute_id')::bigint as attribute_id,
                item_id as advertising_id,
                external_data ->> 'attribute_name' as attribute_name,
                (external_data ->> 'is_mandatory')::bool as is_mandatory,
                external_data ->> 'attribute_type' as attribute_type,
                external_data ->> 'attribute_value' as attribute_value
            FROM shopee_stage.item_attributes_{account_id} {condition}
        ON CONFLICT (attribute_id)
            DO UPDATE SET
                attribute_name = excluded.attribute_name,
                is_mandatory = excluded.is_mandatory,
                attribute_type = excluded.attribute_type,
                attribute_value = excluded.attribute_value
    """
    action.execute(query)


def parse_shopee_item_logistics(action, account_id, advertising_id=None):
    condition = "" if not advertising_id else f" WHERE item_id = '{advertising_id}' "

    query = f"""
        INSERT INTO shopee.logistics (logistic_id, advertising_id, logistic_name, enabled,
                shipping_fee, size_id, is_free, estimated_shipping_fee)
            SELECT
                (external_data ->> 'logistic_id')::bigint as logistic_id,
                item_id as advertising_id,
                external_data ->> 'logistic_name' as logistic_name,
                (external_data ->> 'enabled')::bool as enabled,
                (external_data ->> 'shipping_fee')::numeric(15,2) as shipping_fee,
                (external_data ->> 'size_id')::bigint as size_id,
                (external_data ->> 'is_free')::bool as is_free,
                (external_data ->> 'estimated_shipping_fee')::numeric(15,2) as estimated_shipping_fee
            FROM shopee_stage.item_logistics_{account_id} {condition}
        ON CONFLICT (logistic_id)
            DO UPDATE SET
                logistic_name = excluded.logistic_name,
                enabled = excluded.enabled,
                shipping_fee = excluded.shipping_fee,
                size_id = excluded.size_id,
                is_free = excluded.is_free,
                estimated_shipping_fee = excluded.estimated_shipping_fee

    """
    action.execute(query)


# def parse_shopee_item_wholesales(account_id, action):
#     query = f"""
#         INSERT INTO shopee.wholesales (advertising_id, min, max, unit_price)
#             SELECT
#                 advertising_id,
#                 min,
#                 max,
#                 unit_price
#             FROM shopee_stage.item_wholesales_{account_id}
#         ON CONFLICT (advertisingid)
#             DO UPDATE SET
#                 advertising_id = excluded.advertising_id,
#                 min = excluded.min,
#                 max = excluded.max,
#                 unit_price = excluded.unit_price
#     """
#     action.execute(query)
