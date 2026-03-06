from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn

LOGGER = get_task_logger(__name__)

def parse_shopee_orders(account_id: int, process_id: int=None, order_id: int=None, conn=None):
    try:
        action = QueueActions()
        action.conn = conn if conn else get_conn()

        parse_shopee_order_items(action, account_id, order_id)
        where_condition = f"WHERE order_id = '{order_id}'" if order_id else ''

        query = f"""
            INSERT INTO shopee.orders (id, account_id, create_time, update_time, country, currency, 
                    cod, tracking_no, days_to_ship, recipient_address_name, recipient_address_phone, 
                    recipient_address_town, recipient_address_district, recipient_address_city, 
                    recipient_address_state, recipient_address_country, recipient_address_zipcode, 
                    recipient_address_full_address, estimated_shipping_fee, actual_shipping_cost, 
                    total_amount, escrow_amount, order_status, shipping_carrier, payment_method, 
                    goods_to_declare, message_to_seller, note, note_update_time, pay_time, dropshipper, 
                    credit_card_number, buyer_username, dropshipper_phone, ship_by_date, is_split_up, 
                    buyer_cancel_reason, cancel_by, fm_tn, cancel_reason, escrow_tax, 
                    is_actual_shipping_fee_confirmed, buyer_cpf_id, order_flag, lm_tn)
                SELECT 
                    order_id as id,
                    account_id,
                    to_timestamp((external_data ->> 'create_time')::integer) AS create_time,
                    to_timestamp((external_data ->> 'update_time')::integer) AS update_time,
                    external_data ->> 'country' AS country,
                    external_data ->> 'currency' AS currency,
                    (external_data ->> 'cod')::boolean AS cod,
                    external_data ->> 'tracking_no' AS tracking_no,
                    (external_data ->> 'days_to_ship')::integer AS days_to_ship, 
                    external_data -> 'recipient_address' ->> 'name' AS recipient_address_name,
                    external_data -> 'recipient_address' ->> 'phone' AS recipient_address_phone,
                    external_data -> 'recipient_address' ->> 'town' AS recipient_address_town,
                    external_data -> 'recipient_address' ->> 'district' AS recipient_address_district,
                    external_data -> 'recipient_address' ->> 'city' AS recipient_address_city,
                    external_data -> 'recipient_address' ->> 'state' AS recipient_address_state,
                    external_data -> 'recipient_address' ->> 'country' AS recipient_address_country,
                    external_data -> 'recipient_address' ->> 'zipcode' AS recipient_address_zipcode,
                    external_data -> 'recipient_address' ->> 'full_address' AS recipient_address_full_address,
                    (external_data ->> 'estimated_shipping_fee')::numeric(12,2) AS estimated_shipping_fee,
                    (NULLIF(external_data ->> 'actual_shipping_cost',''))::numeric(12,2) AS actual_shipping_cost,
                    (external_data ->> 'total_amount')::numeric(12,2) AS total_amount,
                    (external_data ->> 'escrow_amount')::numeric(12,2) AS escrow_amount,
                    external_data ->> 'order_status' AS order_status,
                    external_data ->> 'shipping_carrier' AS shipping_carrier,
                    external_data ->> 'payment_method' AS payment_method,
                    (external_data ->> 'goods_to_declare')::boolean AS goods_to_declare,
                    external_data ->> 'message_to_seller' AS message_to_seller,
                    external_data ->> 'note' AS note,
                    to_timestamp((external_data ->> 'note_update_time')::integer) AS note_update_time, 
                    (external_data ->> 'pay_time')::integer AS pay_time,
                    external_data ->> 'dropshipper' AS dropshipper,
                    external_data ->> 'credit_card_number' AS credit_card_number,
                    external_data ->> 'buyer_username' AS buyer_username,
                    external_data ->> 'dropshipper_phone' AS dropshipper_phone,
                    (external_data ->> 'ship_by_date')::integer AS ship_by_date,
                    (external_data ->> 'is_split_up')::boolean AS is_split_up,
                    external_data ->> 'buyer_cancel_reason' AS buyer_cancel_reason,
                    external_data ->> 'cancel_by' AS cancel_by,
                    external_data ->> 'fm_tn' AS fm_tn,
                    external_data ->> 'cancel_reason' AS cancel_reason,
                    (external_data ->> 'escrow_tax')::numeric(12,2) AS escrow_tax,
                    (external_data ->> 'is_actual_shipping_fee_confirmed')::boolean AS is_actual_shipping_fee_confirmed,
                    external_data ->> 'buyer_cpf_id' AS buyer_cpf_id,
                    external_data ->> 'order_flag' AS order_flag,
                    external_data ->> 'lm_tn' AS lm_tn
                FROM shopee_stage.orders_{account_id} {where_condition}
            ON CONFLICT (id)
            DO UPDATE SET 
                update_time = excluded.update_time,
                country = excluded.country,
                currency = excluded.currency,
                cod = excluded.cod,
                tracking_no = excluded.tracking_no,
                days_to_ship = excluded.days_to_ship, 
                recipient_address_name = excluded.recipient_address_name,
                recipient_address_phone = excluded.recipient_address_phone,
                recipient_address_town = excluded.recipient_address_town,
                recipient_address_district = excluded.recipient_address_district,
                recipient_address_city = excluded.recipient_address_city,
                recipient_address_state = excluded.recipient_address_state,
                recipient_address_country = excluded.recipient_address_country,
                recipient_address_zipcode = excluded.recipient_address_zipcode,
                recipient_address_full_address = excluded.recipient_address_full_address,
                estimated_shipping_fee = excluded.estimated_shipping_fee,
                actual_shipping_cost = excluded.actual_shipping_cost,
                total_amount = excluded.total_amount,
                escrow_amount = excluded.escrow_amount,
                order_status = excluded.order_status,
                shipping_carrier = excluded.shipping_carrier,
                payment_method = excluded.payment_method,
                goods_to_declare = excluded.goods_to_declare,
                message_to_seller = excluded.message_to_seller,
                note = excluded.note,
                note_update_time = excluded.note_update_time, 
                pay_time = excluded.pay_time,
                dropshipper = excluded.dropshipper,
                credit_card_number = excluded.credit_card_number,
                buyer_username = excluded.buyer_username,
                dropshipper_phone = excluded.dropshipper_phone,
                ship_by_date = excluded.ship_by_date,
                is_split_up = excluded.is_split_up,
                buyer_cancel_reason = excluded.buyer_cancel_reason,
                cancel_by = excluded.cancel_by,
                fm_tn = excluded.fm_tn,
                cancel_reason = excluded.cancel_reason,
                escrow_tax = excluded.escrow_tax,
                is_actual_shipping_fee_confirmed = excluded.is_actual_shipping_fee_confirmed,
                buyer_cpf_id = excluded.buyer_cpf_id,
                order_flag = excluded.order_flag,
                lm_tn = excluded.lm_tn
        """
        action.execute(query)

        if process_id:
            query = """
                UPDATE meuml.processes 
                    SET date_finished = NOW()
                    WHERE id = :process_id 
            """
            action.execute(query, {'process_id': process_id})
    except Exception as e:
        LOGGER.error(e)
    finally:
        if not conn:
            action.conn.close()


def parse_shopee_order_items(action, account_id: int, order_id: int=None):
    try:
        where_condition = f" AND soi.order_id = '{order_id}'" if order_id else ''

        query = f"""
            INSERT INTO shopee.order_items (order_id, item_id, item_name, item_sku, 
                    variation_id, variation_name, variation_sku, variation_quantity_purchased, 
                    variation_original_price, variation_discounted_price, is_wholesale, weight, 
                    is_add_on_deal, is_main_item, add_on_deal_id, promotion_type, promotion_id)
                SELECT 
                    order_id,
                    (external_data ->> 'item_id')::bigint as item_id,
                    (external_data ->> 'item_name') AS item_name,
                    (external_data ->> 'item_sku') AS item_sku,
                    (external_data ->> 'variation_id')::bigint AS variation_id,
                    (external_data ->> 'variation_name') AS variation_name,
                    (external_data ->> 'variation_sku') AS variation_sku,
                    (external_data ->> 'variation_quantity_purchased')::integer AS variation_quantity_purchased,
                    (external_data ->> 'variation_original_price')::numeric(12,2) AS variation_original_price,
                    (external_data ->> 'variation_discounted_price')::numeric(12,2) AS variation_discounted_price,
                    (external_data ->> 'is_wholesale')::boolean AS is_wholesale,
                    (external_data ->> 'weight')::numeric(12,2) AS weight,
                    (external_data ->> 'is_add_on_deal')::boolean AS is_add_on_deal,
                    (external_data ->> 'is_main_item')::boolean AS is_main_item,
                    (external_data ->> 'add_on_deal_id')::integer AS add_on_deal_id,
                    (external_data ->> 'promotion_type') AS promotion_type,
                    (external_data ->> 'promotion_id')::integer AS promotion_id
                FROM shopee_stage.order_items_{account_id} soi 
                WHERE NOT EXISTS (
                    SELECT so.id
                    FROM shopee.orders so
                    WHERE so.id = soi.order_id 
                )
                {where_condition}
        """
        action.execute(query)

    except Exception as e:
        LOGGER.error(e)
