import json
import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from workers.loggers import update_process_item

LOGGER = get_task_logger(__name__)


def parse_order_json(account_id: int, process_id: int, single_order_id=False, data={}):
    try:
        action = QueueActions()
        action.conn = get_conn()


        parse_orders(account_id, action, single_order_id, data.get('order'))
            
        parse_order_items(account_id, action,
                          single_order_id, data.get('items'))

        parse_order_messages(account_id, action,
                             single_order_id, data.get('messages'))

        parse_order_payments(account_id, action,
                             single_order_id, data.get('payments'))

        parse_order_shipments(account_id, action,
                              single_order_id, data.get('shipment'))

        if not single_order_id:
            query = """
                UPDATE meuml.processes 
                    SET date_finished = NOW()
                    WHERE id = :process_id 
            """
            action.execute(query, {'process_id': process_id})

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def parse_orders(account_id: int, action: QueueActions, single_order_id=False, data=None):
    if not single_order_id:
        sync_orders(account_id, action)

    elif data:
        query = f"""
            INSERT INTO meuml.orders (id, account_id, status, status_detail, comments, fullfilled, pickup_id, paid_amount,
                        total_amount, total_amount_with_shipping, date_created, last_updated, date_closed, expiration_date,
                        date_last_updated, manufacturing_ending_date, buyer_id, buyer_points, buyer_nickname, buyer_first_name,
                        buyer_last_name, buyer_doc_type, buyer_doc_number, buyer_phone_area, buyer_phone_number, buyer_email,
                        feedback_sale_id, feedback_sale_rating, feedback_sale_status, feedback_sale_fulfilled,
                        feedback_sale_date, feedback_purchase_id, feedback_purchase_rating, feedback_purchase_status,
                        feedback_purchase_fulfilled, feedback_purchase_date, pack_id, taxes_currency_id, taxes_amount, mshops_order)
            VALUES (:id, :account_id, :status, :status_detail, :comments, :fullfilled, :pickup_id, :paid_amount,
                    :total_amount, :total_amount_with_shipping, :date_created, :last_updated, :date_closed, :expiration_date,
                    :date_last_updated, :manufacturing_ending_date, :buyer_id, :buyer_points, :buyer_nickname, :buyer_first_name,
                    :buyer_last_name, :buyer_doc_type, :buyer_doc_number, :buyer_phone_area, :buyer_phone_number, :buyer_email,
                    :feedback_sale_id, :feedback_sale_rating, :feedback_sale_status, :feedback_sale_fulfilled,
                    :feedback_sale_date, :feedback_purchase_id, :feedback_purchase_rating, :feedback_purchase_status,
                    :feedback_purchase_fulfilled, :feedback_purchase_date, :pack_id, :taxes_currency_id, :taxes_amount, :mshops_order)
            ON CONFLICT (id)
                DO UPDATE SET
                    status = excluded.status,
                    status_detail = excluded.status_detail,
                    comments = excluded.comments,
                    fullfilled = excluded.fullfilled,
                    pickup_id = excluded.pickup_id,
                    paid_amount = excluded.paid_amount,
                    total_amount = excluded.total_amount,
                    total_amount_with_shipping = excluded.total_amount_with_shipping,
                    last_updated = excluded.last_updated,
                    date_closed = excluded.date_closed,
                    expiration_date = excluded.expiration_date,
                    date_last_updated = excluded.date_last_updated,
                    manufacturing_ending_date = excluded.manufacturing_ending_date,
                    buyer_id = excluded.buyer_id,
                    buyer_points = excluded.buyer_points,
                    buyer_nickname = excluded.buyer_nickname,
                    buyer_first_name = excluded.buyer_first_name,
                    buyer_last_name = excluded.buyer_last_name,
                    buyer_doc_type = excluded.buyer_doc_type,
                    buyer_doc_number = excluded.buyer_doc_number,
                    buyer_phone_area = excluded.buyer_phone_area,
                    buyer_phone_number = excluded.buyer_phone_number,
                    buyer_email = excluded.buyer_email,
                    feedback_sale_id = excluded.feedback_sale_id,
                    feedback_sale_rating = excluded.feedback_sale_rating,
                    feedback_sale_status = excluded.feedback_sale_status,
                    feedback_sale_fulfilled = excluded.feedback_sale_fulfilled,
                    feedback_sale_date = excluded.feedback_sale_date,
                    feedback_purchase_id = excluded.feedback_purchase_id,
                    feedback_purchase_rating = excluded.feedback_purchase_rating,
                    feedback_purchase_status = excluded.feedback_purchase_status,
                    feedback_purchase_fulfilled = excluded.feedback_purchase_fulfilled,
                    feedback_purchase_date = excluded.feedback_purchase_date,
                    taxes_currency_id = excluded.taxes_currency_id,
                    taxes_amount = excluded.taxes_amount
        """

        buyer = {} if not data.get('buyer', {}) else data.get('buyer', {})
        buyer_billing_info = {} if not buyer else buyer.get('billing_info', {})
        buyer_phone = {} if not buyer else buyer.get('phone')
        sale = {} if not data.get('feedback', {}) else data.get(
            'feedback', {}).get('sale', {})
        purchase = {} if not data.get('feedback', {}) else data.get(
            'feedback', {}).get('purchase', {})

        values = {
            'id': data.get('id'),
            'account_id': account_id,
            'status': data.get('status'),
            'status_detail': None if not data.get('status_detail') else json.dumps(data.get('status_detail')),
            'comments': data.get('comment'),
            'fullfilled': data.get('fulfilled'),
            'pickup_id': data.get('pickup_id'),
            'paid_amount': data.get('paid_amount'),
            'total_amount': data.get('total_amount'),
            'total_amount_with_shipping': data.get('total_amount_with_shipping'),
            'date_created': data.get('date_created'),
            'last_updated': data.get('last_updated'),
            'date_closed': data.get('date_closed'),
            'expiration_date': data.get('expiration_date'),
            'date_last_updated': data.get('date_last_updated'),
            'manufacturing_ending_date': data.get('manufacturing_ending_date'),
            'buyer_id': None if not buyer else buyer.get('id'),
            'buyer_points': None if not buyer else buyer.get('buyer_points'),
            'buyer_nickname': None if not buyer else buyer.get('nickname'),
            'buyer_email': None if not buyer else buyer.get('email'),
            'buyer_first_name': None if not buyer else buyer.get('first_name'),
            'buyer_last_name': None if not buyer else buyer.get('last_name'),
            'buyer_doc_type': None if not buyer_billing_info else buyer_billing_info.get('doc_type'),
            'buyer_doc_number': None if not buyer_billing_info else buyer_billing_info.get('doc_number'),
            'buyer_phone_area': None if not buyer_phone else buyer_phone.get('area_code'),
            'buyer_phone_number': None if not buyer_phone else buyer_phone.get('number'),
            'feedback_sale_id': None if not sale else sale.get('id'),
            'feedback_sale_rating': None if not sale else sale.get('rating'),
            'feedback_sale_status': None if not sale else sale.get('status'),
            'feedback_sale_fulfilled': None if not sale else sale.get('fulfilled'),
            'feedback_sale_date': None if not sale else sale.get('date_created'),
            'feedback_purchase_id': None if not purchase else purchase.get('id'),
            'feedback_purchase_rating': None if not purchase else purchase.get('rating'),
            'feedback_purchase_status': None if not purchase else purchase.get('status'),
            'feedback_purchase_fulfilled': None if not purchase else purchase.get('fulfilled'),
            'feedback_purchase_date': None if not purchase else purchase.get('date_created'),
            'pack_id': data.get('pack_id'),
            'taxes_currency_id': None if not data.get('taxes') else data.get('taxes', {}).get('currency_id'),
            'taxes_amount': None if not data.get('taxes') else data.get('taxes', {}).get('amount'),
            'mshops_order': True if "mshops" in data.get('tags') else False
        }
        action.execute(query, values)


def parse_order_items(account_id: int, action: QueueActions, single_order_id=False, data=None):
    if not single_order_id:
        sync_order_items(account_id, action)

    elif data:
        query = f"""
            INSERT INTO meuml.order_items (id, order_id, order_date_created, account_id, dimensions, description,
                        title, warranty, condition, seller_sku, category_id, variation_id, seller_custom_field,
                        variation_attributes, quantity, sale_fee, unit_price, currency_id, full_unit_price,
                        listing_type_id, manufacturing_days, pack_id)
            VALUES
        """
        values_query = []
        values = {}

        for i, item in enumerate(data):
            values_query.append(f"""
                (:id{i}, :order_id{i}, :order_date_created{i}, :account_id{i}, :dimensions{i}, :description{i},
                    :title{i}, :warranty{i}, :condition{i}, :seller_sku{i}, :category_id{i}, :variation_id{i}, :seller_custom_field{i},
                    :variation_attributes{i}, :quantity{i}, :sale_fee{i}, :unit_price{i}, :currency_id{i}, :full_unit_price{i},
                    :listing_type_id{i}, :manufacturing_days{i}, :pack_id{i})
            """)

            item_object = {} if not item.get(
                'item', {}) else item.get('item', {})

            values.update({
                f'id{i}': None if not item_object else item_object.get('id'),
                f'order_id{i}': item.get('order_id'),
                f'order_date_created{i}': item.get('order_date_created'),
                f'account_id{i}': account_id,
                f'dimensions{i}': None if not item_object else item_object.get('dimensions'),
                f'description{i}': None if not item_object else item_object.get('description'),
                f'title{i}': None if not item_object else item_object.get('title'),
                f'warranty{i}': None if not item_object else item_object.get('warranty'),
                f'condition{i}': None if not item_object else item_object.get('condition'),
                f'seller_sku{i}': None if not item_object else item_object.get('seller_sku'),
                f'category_id{i}': None if not item_object else item_object.get('category_id'),
                f'variation_id{i}': None if not item_object else item_object.get('variation_id'),
                f'seller_custom_field{i}': None if not item_object else item_object.get('seller_custom_field'),
                f'variation_attributes{i}': None if not item_object and not item_object.get('variation_attributes') else json.dumps(item_object.get('variation_attributes')),
                f'quantity{i}': item.get('quantity'),
                f'sale_fee{i}': item.get('sale_fee'),
                f'unit_price{i}': item.get('unit_price'),
                f'currency_id{i}': item.get('currency_id'),
                f'full_unit_price{i}': item.get('full_unit_price'),
                f'listing_type_id{i}': item.get('listing_type_id'),
                f'manufacturing_days{i}': item.get('manufactring_days'),
                f'pack_id{i}': item.get('pack_id')
            })

        query += ','.join(values_query)
        query += """
            ON CONFLICT (id, order_id)
                DO UPDATE SET
                    dimensions = excluded.dimensions,
                    description = excluded.description,
                    title = excluded.title,
                    warranty = excluded.warranty,
                    condition = excluded.condition,
                    seller_sku = excluded.seller_sku,
                    category_id = excluded.category_id,
                    variation_id = excluded.variation_id,
                    seller_custom_field = excluded.seller_custom_field,
                    variation_attributes = excluded.variation_attributes,
                    quantity = excluded.quantity,
                    sale_fee = excluded.sale_fee,
                    unit_price = excluded.unit_price,
                    currency_id = excluded.currency_id,
                    full_unit_price = excluded.full_unit_price,
                    listing_type_id = excluded.listing_type_id,
                    manufacturing_days = excluded.manufacturing_days
        """
        action.execute(query, values)


def parse_order_messages(account_id: int, action: QueueActions, single_order_id=False, data=None):
    if not single_order_id:
        sync_order_messages(account_id, action)

    elif data:
        query = f"""
            INSERT INTO meuml.order_messages (id, order_id, order_date_created, account_id, client_id, from_user_id, from_email, from_name,
                        status, text, date_created, date_available, date_received, date_notified, date_read, moderation_status,
                        moderation_reason, moderation_date, moderation_by, message_attachments, pack_id)
            VALUES
        """
        values_query = []
        values = {}

        for i, message in enumerate(data):
            values_query.append(f"""
                (:id{i}, :order_id{i}, :order_date_created{i}, :account_id{i}, :client_id{i}, :from_user_id{i}, :from_email{i}, :from_name{i},
                    :status{i}, :text{i}, :date_created{i}, :date_available{i}, :date_received{i}, :date_notified{i}, :date_read{i}, :moderation_status{i},
                    :moderation_reason{i}, :moderation_date{i}, :moderation_by{i}, :message_attachments{i}, :pack_id{i})
            """)

            from_user = {} if not message.get(
                'from', {}) else message.get('from', {})
            message_date = {} if not message.get(
                'message_date', {}) else message.get('message_date', {})
            message_moderation = {} if not message.get(
                'message_moderation', {}) else message.get('message_moderation', {})

            values.update({
                f'id{i}': message.get('id'),
                f'order_id{i}': message.get('order_id'),
                f'order_date_created{i}': message.get('order_date_created'),
                f'account_id{i}': account_id,
                f'client_id{i}': message.get('client_id'),
                f'from_user_id{i}': None if not from_user else from_user.get('user_id'),
                f'from_email{i}': None if not from_user else from_user.get('email'),
                f'from_name{i}': None if not from_user else from_user.get('name'),
                f'status{i}': message.get('status'),
                f'text{i}': message.get('text'),
                f'date_created{i}': None if not message_date else message_date.get('created'),
                f'date_available{i}': None if not message_date else message_date.get('available'),
                f'date_received{i}': None if not message_date else message_date.get('received'),
                f'date_notified{i}': None if not message_date else message_date.get('notified'),
                f'date_read{i}': None if not message_date else message_date.get('read'),
                f'moderation_status{i}': None if not message_moderation else message_moderation.get('status'),
                f'moderation_reason{i}': None if not message_moderation else message_moderation.get('reason'),
                f'moderation_date{i}': None if not message_moderation else message_moderation.get('moderation_date'),
                f'moderation_by{i}': None if not message_moderation else message_moderation.get('by'),
                f'message_attachments{i}': None if not message.get('message_attachments') else json.dumps(message.get('message_attachments')),
                f'pack_id{i}': message.get('pack_id')
            })

        query += ','.join(values_query)
        query += """
            ON CONFLICT (id)
                DO UPDATE SET
                    from_email = excluded.from_email,
                    from_name = excluded.from_name,
                    status = excluded.status,
                    text = excluded.text,
                    date_available = excluded.date_available,
                    date_received = excluded.date_received,
                    date_notified = excluded.date_notified,
                    date_read = excluded.date_read,
                    moderation_status = excluded.moderation_status,
                    moderation_reason = excluded.moderation_reason,
                    moderation_date = excluded.moderation_date,
                    moderation_by = excluded.moderation_by,
                    message_attachments = excluded.message_attachments
        """
        action.execute(query, values)


def parse_order_payments(account_id: int, action: QueueActions, single_order_id=False, data=None):
    if not single_order_id:
        sync_order_payments(account_id, action)

    elif data:
        query = f"""
            INSERT INTO meuml.order_payments (id, order_id, order_date_created, account_id, payer_id, date_created, date_last_modified,
                        date_approved, status, status_detail, payment_type, payment_method_id, card_id, total_paid_amount,
                        shipping_cost, installments, installment_amount, transaction_amount, overpaid_amount, pack_id)
            VALUES
        """
        values_query = []
        values = {}

        for i, payment in enumerate(data):
            values_query.append(f"""
                (:id{i}, :order_id{i}, :order_date_created{i}, :account_id{i}, :payer_id{i}, :date_created{i}, :date_last_modified{i},
                    :date_approved{i}, :status{i}, :status_detail{i}, :payment_type{i}, :payment_method_id{i}, :card_id{i}, :total_paid_amount{i},
                    :shipping_cost{i}, :installments{i}, :installment_amount{i}, :transaction_amount{i}, :overpaid_amount{i}, :pack_id{i})
            """)

            values.update({
                f'id{i}': payment.get('id'),
                f'order_id{i}': payment.get('order_id'),
                f'order_date_created{i}': payment.get('order_date_created'),
                f'account_id{i}': account_id,
                f'payer_id{i}': payment.get('payer_id'),
                f'date_created{i}': payment.get('order_date_created'),
                f'date_last_modified{i}': payment.get('date_last_modified'),
                f'date_approved{i}': payment.get('date_approved'),
                f'status{i}': payment.get('status'),
                f'status_detail{i}': payment.get('status_detail'),
                f'payment_type{i}': payment.get('payment_type'),
                f'payment_method_id{i}': payment.get('payment_method_id'),
                f'card_id{i}': payment.get('card_id'),
                f'total_paid_amount{i}': payment.get('total_paid_amount'),
                f'shipping_cost{i}': payment.get('shipping_cost'),
                f'installments{i}': payment.get('installments'),
                f'installment_amount{i}': payment.get('installment_amount'),
                f'transaction_amount{i}': payment.get('transaction_amount'),
                f'overpaid_amount{i}': payment.get('overpaid_amount'),
                f'pack_id{i}': payment.get('pack_id')
            })

        query += ','.join(values_query)
        query += """
            ON CONFLICT (id)
                DO UPDATE SET
                    date_last_modified = excluded.date_last_modified,
                    date_approved = excluded.date_approved,
                    payer_id = excluded.payer_id,
                    status = excluded.status,
                    status_detail = excluded.status_detail,
                    payment_type = excluded.payment_type,
                    payment_method_id = excluded.payment_method_id,
                    total_paid_amount = excluded.total_paid_amount,
                    shipping_cost = excluded.shipping_cost,
                    installments = excluded.installments,
                    installment_amount = excluded.installment_amount,
                    transaction_amount = excluded.transaction_amount,
                    overpaid_amount = excluded.overpaid_amount
        """
        action.execute(query, values)


def parse_order_shipments(account_id: int, action: QueueActions, single_order_id=False, data=None):
    if not single_order_id:
        sync_order_shipments(account_id, action)

    elif data:
        query = f"""
            INSERT INTO meuml.order_shipments
                (id, id_stage, order_id, order_date_created, account_id, pack_id, status, substatus, date_created,
                last_updated, declared_value, height, width, length, weight, "type", "mode", logistic_type, source_site_id,
                source_market_place, source_application_id, tracking_method, tracking_number, origin_type, sender_id,
                sender_address_id, sender_zip_code, sender_street_name, sender_street_number, sender_address_comment,
                sender_neighboorhood, sender_city, sender_state, sender_country, sender_latitude, sender_longitude,
                destination_type, receiver_id, receiver_name, receiver_phone, destination_comments, receiver_address_id,
                receiver_zip_code, receiver_street_name, receiver_street_number, receiver_address_comment, receiver_neighboorhood,
                receiver_city, receiver_state, receiver_country, receiver_latitude, receiver_longitude, delivery_preference,
                shipping_option_id, shipping_method_id, shipping_method_name, shipping_method_type, shipping_method_deliver_to,
                lead_time_currency_id, "cost", list_cost, cost_type, lead_time_service_id, delivery_type, estimated_delivery_time_type,
                estimated_delivery_time_from, estimated_delivery_time_unit, estimated_delivery_time_to,
                estimated_delivery_time_to_shipping, pay_before, estimated_delivery_time_from_shipping,
                estimated_delivery_time_from_handling, carrier_name, carrier_url, history)
            VALUES
                (:id, :id_stage, :order_id, :order_date_created, :account_id, :pack_id, :status, :substatus, :date_created,
                :last_updated, :declared_value, :height, :width, :length, :weight, :type, :mode, :logistic_type, :source_site_id,
                :source_market_place, :source_application_id, :tracking_method, :tracking_number, :origin_type, :sender_id,
                :sender_address_id, :sender_zip_code, :sender_street_name, :sender_street_number, :sender_address_comment,
                :sender_neighboorhood, :sender_city, :sender_state, :sender_country, :sender_latitude, :sender_longitude,
                :destination_type, :receiver_id, :receiver_name, :receiver_phone, :destination_comments, :receiver_address_id,
                :receiver_zip_code, :receiver_street_name, :receiver_street_number, :receiver_address_comment, :receiver_neighboorhood,
                :receiver_city, :receiver_state, :receiver_country, :receiver_latitude, :receiver_longitude, :delivery_preference,
                :shipping_option_id, :shipping_method_id, :shipping_method_name, :shipping_method_type, :shipping_method_deliver_to,
                :lead_time_currency_id, :cost, :list_cost, :cost_type, :lead_time_service_id, :delivery_type, :estimated_delivery_time_type,
                :estimated_delivery_time_from, :estimated_delivery_time_unit, :estimated_delivery_time_to,
                :estimated_delivery_time_to_shipping, :pay_before, :estimated_delivery_time_from_shipping,
                :estimated_delivery_time_from_handling, :carrier_name, :carrier_url, :history)
            ON CONFLICT (id)
                DO UPDATE SET
                    status = excluded.status,
                    substatus = excluded.substatus,
                    last_updated = excluded.last_updated,
                    declared_value = excluded.declared_value,
                    height = excluded.height,
                    width = excluded.width,
                    length = excluded.length,
                    weight = excluded.weight,
                    type = excluded.type,
                    mode = excluded.mode,
                    logistic_type = excluded.logistic_type,
                    source_site_id = excluded.source_site_id,
                    source_market_place = excluded.source_market_place,
                    source_application_id = excluded.source_application_id,
                    tracking_method = excluded.tracking_method,
                    tracking_number = excluded.tracking_number,
                    origin_type = excluded.origin_type,
                    sender_id = excluded.sender_id,
                    sender_address_id = excluded.sender_address_id,
                    sender_zip_code = excluded.sender_zip_code,
                    sender_street_name = excluded.sender_street_name,
                    sender_street_number = excluded.sender_street_number,
                    sender_address_comment = excluded.sender_address_comment,
                    sender_neighboorhood = excluded.sender_neighboorhood,
                    sender_city = excluded.sender_city,
                    sender_state = excluded.sender_state,
                    sender_country = excluded.sender_country,
                    sender_latitude = excluded.sender_latitude,
                    sender_longitude = excluded.sender_longitude,
                    destination_type = excluded.destination_type,
                    receiver_id = excluded.receiver_id,
                    receiver_name = excluded.receiver_name,
                    receiver_phone = excluded.receiver_phone,
                    destination_comments = excluded.destination_comments,
                    receiver_address_id = excluded.receiver_address_id,
                    receiver_zip_code = excluded.receiver_zip_code,
                    receiver_street_name = excluded.receiver_street_name,
                    receiver_street_number = excluded.receiver_street_number,
                    receiver_address_comment = excluded.receiver_address_comment,
                    receiver_neighboorhood = excluded.receiver_neighboorhood,
                    receiver_city = excluded.receiver_city,
                    receiver_state = excluded.receiver_state,
                    receiver_country = excluded.receiver_country,
                    receiver_latitude = excluded.receiver_latitude,
                    receiver_longitude = excluded.receiver_longitude,
                    delivery_preference = excluded.delivery_preference,
                    shipping_option_id = excluded.shipping_option_id,
                    shipping_method_id = excluded.shipping_method_id,
                    shipping_method_name = excluded.shipping_method_name,
                    shipping_method_type = excluded.shipping_method_type,
                    shipping_method_deliver_to = excluded.shipping_method_deliver_to,
                    lead_time_currency_id = excluded.lead_time_currency_id,
                    cost = excluded.cost,
                    list_cost = excluded.list_cost,
                    cost_type = excluded.cost_type,
                    lead_time_service_id = excluded.lead_time_service_id,
                    delivery_type = excluded.delivery_type,
                    estimated_delivery_time_type = excluded.estimated_delivery_time_type,
                    estimated_delivery_time_unit = excluded.estimated_delivery_time_unit,
                    estimated_delivery_time_to = excluded.estimated_delivery_time_to,
                    estimated_delivery_time_to_shipping = excluded.estimated_delivery_time_to_shipping,
                    pay_before = excluded.pay_before,
                    estimated_delivery_time_from_shipping = excluded.estimated_delivery_time_from_shipping,
                    estimated_delivery_time_from_handling = excluded.estimated_delivery_time_from_handling,
                    carrier_name = excluded.carrier_name,
                    carrier_url = excluded.carrier_url,
                    history = excluded.history
        """

        dimensions = None if not data.get(
            'dimensions') else data.get('dimensions')
        logistic = None if not data.get('logistic') else data.get('logistic')
        source = None if not data.get('source') else data.get('source')
        origin = None if not data.get('origin') else data.get('origin')
        origin_address = None if not origin or not origin.get(
            'shipping_address') else origin.get('shipping_address')
        destination = None if not data.get(
            'destination') else data.get('destination')
        destination_address = None if not destination or not destination.get(
            'shipping_address') else destination.get('shipping_address')
        lead_time = None if not data.get(
            'lead_time') else data.get('lead_time')
        shipping_method = None if not lead_time or not lead_time.get(
            'shipping_method') else lead_time.get('shipping_method')
        estimated_delivery_time = None if not lead_time or not lead_time.get(
            'estimated_delivery_time') else lead_time.get('estimated_delivery_time')

        values = {
            'id': data.get('id'),
            'id_stage': None,
            'order_id': data.get('order_id'),
            'order_date_created': data.get('order_date_created'),
            'account_id': account_id,
            'pack_id': data.get('pack_id'),
            'status': data.get('status'),
            'substatus': data.get('substatus'),
            'date_created': data.get('date_created'),
            'last_updated': data.get('last_updated'),
            'declared_value': data.get('declared_value'),
            'height': None if not dimensions else dimensions.get('height'),
            'width': None if not dimensions else dimensions.get('width'),
            'length': None if not dimensions else dimensions.get('length'),
            'weight': None if not dimensions else dimensions.get('weight'),
            'type': None if not logistic else logistic.get('direction'),
            'mode': None if not logistic else logistic.get('mode'),
            'logistic_type': None if not logistic else logistic.get('logistic_type'),
            'source_site_id': None if not source else source.get('site_id'),
            'source_market_place': None if not source else source.get('market_place'),
            'source_application_id': None if not source else source.get('application_id'),
            'tracking_method': data.get('tracking_method'),
            'tracking_number': data.get('tracking_number'),
            'origin_type': None if not origin else origin.get('type'),
            'sender_id': None if not origin else origin.get('sender_id'),
            'sender_address_id': None if not origin_address else origin_address.get('id'),
            'sender_zip_code': None if not origin_address else origin_address.get('zip_code'),
            'sender_street_name': None if not origin_address else origin_address.get('street_name'),
            'sender_street_number': None if not origin_address else origin_address.get('street_number'),
            'sender_address_comment': None if not origin_address else origin_address.get('comment'),
            'sender_neighboorhood': None if not origin_address or not origin_address.get('neighboorhood') else origin_address.get('neighboorhood').get('name'),
            'sender_city': None if not origin_address or not origin_address.get('city') else origin_address.get('city').get('name'),
            'sender_state': None if not origin_address or not origin_address.get('state') else origin_address.get('state').get('name'),
            'sender_country': None if not origin_address or not origin_address.get('country') else origin_address.get('country').get('name'),
            'sender_latitude': None if not origin_address else origin_address.get('latitude'),
            'sender_longitude': None if not origin_address else origin_address.get('longitude'),
            'destination_type': None if not destination else destination.get('type'),
            'receiver_id': None if not destination else destination.get('receiver_id'),
            'receiver_name': None if not destination else destination.get('receiver_name'),
            'receiver_phone': None if not destination else destination.get('receiver_phone'),
            'destination_comments': None if not destination else destination.get('comments'),
            'receiver_address_id': None if not destination_address else destination_address.get('id'),
            'receiver_zip_code': None if not destination_address else destination_address.get('zip_code'),
            'receiver_street_name': None if not destination_address else destination_address.get('street_name'),
            'receiver_street_number': None if not destination_address else destination_address.get('street_number'),
            'receiver_address_comment': None if not destination_address else destination_address.get('comment'),
            'receiver_neighboorhood': None if not destination_address or not destination_address.get('neighboorhood') else destination_address.get('neighboorhood').get('name'),
            'receiver_city': None if not destination_address or not destination_address.get('city') else destination_address.get('city').get('name'),
            'receiver_state': None if not destination_address or not destination_address.get('state') else destination_address.get('state').get('name'),
            'receiver_country': None if not destination_address or not destination_address.get('country') else destination_address.get('country').get('name'),
            'receiver_latitude': None if not destination_address else destination_address.get('latitude'),
            'receiver_longitude': None if not destination_address else destination_address.get('longitude'),
            'delivery_preference': None if not destination_address else destination_address.get('delivery_preference'),
            'shipping_option_id': None if not lead_time else lead_time.get('option_id'),
            'shipping_method_id': None if not shipping_method else shipping_method.get('id'),
            'shipping_method_name': None if not shipping_method else shipping_method.get('name'),
            'shipping_method_type': None if not shipping_method else shipping_method.get('type'),
            'shipping_method_deliver_to': None if not shipping_method else shipping_method.get('deliver_to'),
            'lead_time_currency_id': None if not lead_time else lead_time.get('currency_id'),
            'cost': None if not lead_time else lead_time.get('cost'),
            'list_cost': None if not lead_time else lead_time.get('list_cost'),
            'cost_type': None if not lead_time else lead_time.get('cost_type'),
            'lead_time_service_id': None if not lead_time else lead_time.get('service_id'),
            'delivery_type': None if not lead_time else lead_time.get('delivery_type'),
            'estimated_delivery_time_type': None if not estimated_delivery_time else estimated_delivery_time.get('type'),
            'estimated_delivery_time_from': None if not estimated_delivery_time else estimated_delivery_time.get('date'),
            'estimated_delivery_time_unit': None if not estimated_delivery_time else estimated_delivery_time.get('unit'),
            'estimated_delivery_time_to': None if not estimated_delivery_time or not estimated_delivery_time.get('offset') else estimated_delivery_time.get('offset').get('date'),
            'estimated_delivery_time_to_shipping': None if not estimated_delivery_time or not estimated_delivery_time.get('offset') else estimated_delivery_time.get('offset').get('shipping'),
            'pay_before': None if not estimated_delivery_time else estimated_delivery_time.get('pay_before'),
            'estimated_delivery_time_from_shipping': None if not estimated_delivery_time else estimated_delivery_time.get('shipping'),
            'estimated_delivery_time_from_handling': None if not estimated_delivery_time else estimated_delivery_time.get('handling'),
            'carrier_name': data.get('carrier_name'),
            'carrier_url': data.get('carrier_url'),
            'history': None if not data.get('history') else json.dumps(data['history'])
        }
        action.execute(query, values)


def sync_orders(account_id, action):
    limit = 100

    unmodified_delete_query = f"""
        DELETE FROM
            meli_stage.orders sto
        WHERE
            EXISTS (
                SELECT mo.id
                FROM meuml.orders mo
                WHERE
                    sto.account_id = {account_id}
                    AND sto.order_id = mo.id
                    AND (sto.external_data ->> 'date_last_updated')::timestamp = mo.date_last_updated
                    AND (sto.external_data ->> 'last_updated')::timestamp = mo.last_updated
                    AND sto.stage_status = 0
            )
    """
    action.execute(unmodified_delete_query)

    new_count_query = f"""
        SELECT
            count(*) as total
        FROM
            meli_stage.orders sto
        WHERE
            sto.account_id = {account_id}
            AND sto.stage_status = 0
            AND NOT EXISTS (
                SELECT 1
                FROM meuml.orders mo
                WHERE mo.id = sto.order_id
            )
    """
    new_count = action.fetchone(new_count_query)

    if new_count and new_count['total'] > 0:
        new_insert_query = f"""
            WITH ids(id_stage) AS (
                INSERT INTO meuml.orders
                    (id, account_id, status, status_detail, comments, fullfilled, pickup_id, paid_amount, total_amount, total_amount_with_shipping, date_created,
                    last_updated, date_closed, expiration_date, date_last_updated, manufacturing_ending_date, buyer_id, buyer_points, buyer_nickname, buyer_first_name,
                    buyer_last_name, buyer_doc_type, buyer_doc_number, buyer_phone_area, buyer_phone_number, buyer_email, feedback_sale_id, feedback_sale_rating,
                    feedback_sale_status, feedback_sale_fulfilled, feedback_sale_date, feedback_purchase_id, feedback_purchase_rating, feedback_purchase_status,
                    feedback_purchase_fulfilled, feedback_purchase_date, id_stage, pack_id, taxes_currency_id, taxes_amount, mshops_order)
                SELECT
                    (external_data ->> 'id')::bigint as id,
                    account_id as account_id,
                    external_data ->> 'status' as status,
                    nullif((external_data -> 'status_detail')::jsonb,'null') as status_detail,
                    external_data ->> 'comments' as comments,
                    (external_data ->> 'fullfilled')::boolean as fullfilled,
                    (external_data ->> 'pickup_id')::bigint as pickup_id,
                    (external_data ->> 'paid_amount')::numeric as paid_amount,
                    (external_data ->> 'total_amount')::numeric as total_amount,
                    (external_data ->> 'total_amount_with_shipping')::numeric as total_amount_with_shipping,
                    (external_data ->> 'date_created')::timestamp as date_created,
                    (external_data ->> 'last_updated')::timestamp as last_updated,
                    (external_data ->> 'date_closed')::timestamp as date_closed,
                    (external_data ->> 'expiration_date')::timestamp as expiration_date,
                    (external_data ->> 'date_last_updated')::timestamp as date_last_updated,
                    (external_data ->> 'manufacturing_ending_date')::timestamp as manufacturing_ending_date,
                    (external_data -> 'buyer' ->> 'id')::bigint as buyer_id,
                    (external_data -> 'buyer' ->> 'buyer_points')::integer as buyer_points,
                    external_data -> 'buyer' ->> 'nickname' as buyer_nickname,
                    external_data -> 'buyer' ->> 'first_name' as buyer_first_name,
                    external_data -> 'buyer' ->> 'last_name' as buyer_last_name,
                    external_data -> 'buyer' -> 'billing_info' ->> 'doc_type' as buyer_doc_type,
                    external_data -> 'buyer' -> 'billing_info' ->> 'doc_number' as buyer_doc_number,
                    external_data -> 'buyer' -> 'phone' ->> 'area_code' as buyer_phone_area,
                    external_data -> 'buyer' -> 'phone' ->> 'number' as buyer_phone_number,
                    external_data -> 'buyer' ->> 'email' as buyer_email,
                    (external_data -> 'feedback' -> 'sale' ->> 'id')::bigint as feedback_sale_id,
                    external_data -> 'feedback' -> 'sale' ->> 'rating' as feedback_sale_rating,
                    external_data -> 'feedback' -> 'sale' ->> 'status' as feedback_sale_status,
                    (external_data -> 'feedback' -> 'sale' ->> 'fulfilled')::boolean as feedback_sale_fulfilled,
                    (external_data -> 'feedback' -> 'sale' ->> 'date_created')::timestamp as feedback_sale_date,
                    (external_data -> 'feedback' -> 'purchase' ->> 'id')::bigint as feedback_purchase_id,
                    external_data -> 'feedback' -> 'purchase' ->> 'rating' as feedback_purchase_rating,
                    external_data -> 'feedback' -> 'purchase' ->> 'status' as feedback_purchase_status,
                    (external_data -> 'feedback' -> 'purchase' ->> 'fulfilled')::boolean as feedback_purchase_fulfilled,
                    (external_data -> 'feedback' -> 'purchase' ->> 'date_created')::timestamp as feedback_purchase_date_created,
                    sto.id,
                    (external_data ->> 'pack_id')::bigint as pack_id,
                    external_data -> 'taxes' ->> 'currency_id' as taxes_currency_id,
                    (external_data -> 'taxes' ->> 'amount')::numeric as taxes_amount,
                    (CASE WHEN ((external_data -> 'tags')::jsonb ? 'mshops') THEN TRUE ELSE FALSE END) as mshops_order
                FROM
                    meli_stage.orders sto
                WHERE
                    sto.account_id = {account_id}
                    AND sto.stage_status = 0
                    AND NOT EXISTS (
                        SELECT id
                        FROM meuml.orders mo
                        WHERE
                            mo.id = sto.order_id::bigint
                            AND mo.account_id = {account_id}
                    )
                LIMIT {limit}
                RETURNING id_stage
            )
            UPDATE meli_stage.orders sto5
            SET stage_status = 1
            FROM ids
            WHERE
                sto5.account_id = {account_id}
                AND sto5.id = ids.id_stage
        """

        while new_count['total'] > 0:
            action.execute(new_insert_query)
            new_count['total'] -= limit

    modified_count_query = f"""
        SELECT
            count(*) as total
        FROM
            meli_stage.orders sto, meuml.orders mo
        WHERE
            sto.account_id = {account_id}
            AND sto.order_id = mo.id
            AND ((sto.external_data ->> 'date_last_updated')::timestamp > mo.date_last_updated OR (sto.external_data ->> 'last_updated')::timestamp > mo.last_updated)
            AND sto.stage_status = 0
    """
    modified_count = action.fetchone(modified_count_query)

    if modified_count and modified_count['total'] > 0:
        modified_update_query = f"""
            WITH modified_orders AS (
                SELECT
                    sto.external_data
                FROM
                    meli_stage.orders sto, meuml.orders mo
                WHERE
                    sto.account_id = {account_id}
                    AND sto.order_id = mo.id
                    AND sto.stage_status = 0
                    AND ((sto.external_data ->> 'date_last_updated')::timestamp > mo.date_last_updated OR (sto.external_data ->> 'last_updated')::timestamp > mo.last_updated)
                LIMIT {limit}
            )
            UPDATE
                meuml.orders
            SET
                status = modified_orders.external_data ->> 'status',
                status_detail = nullif((modified_orders.external_data ->> 'status_detail')::jsonb,'null'),
                "comments" = modified_orders.external_data ->> 'comments',
                fullfilled = (modified_orders.external_data ->> 'fullfilled')::boolean,
                pickup_id = (modified_orders.external_data ->> 'pickup_id')::bigint,
                paid_amount = (modified_orders.external_data ->> 'paid_amount')::numeric,
                total_amount = (modified_orders.external_data ->> 'total_amount')::numeric,
                total_amount_with_shipping = (modified_orders.external_data ->> 'total_amount_with_shipping')::numeric,
                last_updated = (modified_orders.external_data ->> 'last_updated')::timestamp,
                date_closed = (modified_orders.external_data ->> 'date_closed')::timestamp,
                expiration_date = (modified_orders.external_data ->> 'expiration_date')::timestamp,
                date_last_updated = (modified_orders.external_data ->> 'date_last_updated')::timestamp,
                manufacturing_ending_date = (modified_orders.external_data ->> 'manufacturing_ending_date')::timestamp,
                buyer_id = (modified_orders.external_data -> 'buyer' ->> 'id')::bigint,
                buyer_nickname = modified_orders.external_data -> 'buyer' ->> 'nickname',
                buyer_first_name = modified_orders.external_data -> 'buyer' ->> 'first_name',
                buyer_last_name = modified_orders.external_data -> 'buyer' ->> 'last_name',
                feedback_sale_id = (modified_orders.external_data -> 'feedback' -> 'sale' ->> 'id')::bigint,
                feedback_sale_rating = modified_orders.external_data -> 'feedback' -> 'sale' ->> 'rating',
                feedback_sale_status = modified_orders.external_data -> 'feedback' -> 'sale' ->> 'status',
                feedback_sale_fulfilled = (modified_orders.external_data -> 'feedback' -> 'sale' ->> 'fulfilled')::boolean,
                feedback_sale_date = (modified_orders.external_data -> 'feedback' -> 'sale' ->> 'date_created')::timestamp,
                feedback_purchase_id = (modified_orders.external_data -> 'feedback' -> 'purchase' ->> 'id')::bigint,
                feedback_purchase_rating = modified_orders.external_data -> 'feedback' -> 'purchase' ->> 'rating',
                feedback_purchase_status = modified_orders.external_data -> 'feedback' -> 'purchase' ->> 'status',
                feedback_purchase_fulfilled = (modified_orders.external_data -> 'feedback' -> 'purchase' ->> 'fulfilled')::boolean,
                taxes_currency_id = modified_orders.external_data -> 'taxes' ->> 'currency_id',
                taxes_amount = (modified_orders.external_data -> 'taxes' ->> 'amount')::numeric
            FROM
                modified_orders
            WHERE
                id = (modified_orders.external_data ->> 'id')::bigint
        """

        while modified_count['total'] > 0:
            action.execute(modified_update_query)
            modified_count['total'] -= limit

        update_stage_status = f"""
            UPDATE meli_stage.orders sto
            SET stage_status = 1
            WHERE
                EXISTS (
                    SELECT mo.id
                    FROM meuml.orders mo
                    WHERE
                        sto.account_id = {account_id}
                        AND sto.order_id = mo.id
                        AND (sto.external_data ->> 'date_last_updated')::timestamp = mo.date_last_updated
                        AND (sto.external_data ->> 'last_updated')::timestamp = mo.last_updated
                        AND sto.stage_status = 0
                )
        """
        action.execute(update_stage_status)


def sync_order_items(account_id, action):
    limit = 100

    unmodified_update_query = f"""
        UPDATE meli_stage.order_items stoi
        SET stage_status = 1
        WHERE
            stoi.account_id = {account_id}
            AND stoi.stage_status = 0
            AND EXISTS (
            	SELECT 1
                FROM meuml.order_items moi
                WHERE
                    stoi.account_id = moi.account_id
                    AND stoi.id_item = moi.id
                    AND stoi.order_id = moi.order_id
            )
    """
    action.execute(unmodified_update_query)

    new_count_query = f"""
        SELECT
            count(*) as total
        FROM
            meli_stage.order_items stoi
        WHERE
            stoi.account_id = {account_id}
            AND stoi.stage_status = 0
            AND NOT EXISTS (
                SELECT 1
                FROM meuml.order_items moi
                WHERE
                    stoi.account_id = moi.account_id
                    AND stoi.id_item = moi.id
                    AND stoi.order_id = moi.order_id
            )
    """
    new_count = action.fetchone(new_count_query)

    if new_count and new_count['total'] > 0:
        new_insert_query = f"""
            WITH ids(id_stage) as (
		        INSERT INTO meuml.order_items
                    (id, order_id, order_date_created, account_id, dimensions, description,
                    title, warranty, condition, seller_sku, category_id, variation_id, seller_custom_field,
                    variation_attributes, quantity, sale_fee, unit_price, currency_id, full_unit_price,
                    listing_type_id, manufacturing_days, id_stage, pack_id)
                SELECT
                    external_data -> 'item' ->> 'id' as id,
                    (external_data ->> 'order_id')::bigint as order_id,
                    (external_data ->> 'order_date_created')::timestamp as order_date_created,
                    account_id as account_id,
                    external_data -> 'item' ->> 'dimensions' as dimensions,
                    external_data -> 'item' ->> 'description' as description,
                    external_data -> 'item' ->> 'title' as title,
                    external_data -> 'item' ->> 'warranty' as warranty,
                    external_data -> 'item' ->> 'condition' as condition,
                    external_data -> 'item' ->> 'seller_sku' as seller_sku,
                    external_data -> 'item' ->> 'category_id' as category_id,
                    (external_data -> 'item' ->> 'variation_id')::bigint as variation_id,
                    external_data -> 'item' ->> 'seller_custom_field' as seller_custom_field,
                    external_data -> 'item' -> 'variation_attributes' as variation_attributes,
                    (external_data ->> 'quantity')::integer as quantity,
                    (external_data ->> 'sale_fee')::numeric as sale_fee,
                    (external_data ->> 'unit_price')::numeric as unit_price,
                    external_data ->> 'currency_id' as currency_id,
                    (external_data ->> 'full_unit_price')::numeric as full_unit_price,
                    external_data ->> 'listing_type_id' as listing_type_id,
                    external_data ->> 'manufacturing_days' as manufacturing_days,
                    id,
                    (external_data ->> 'pack_id')::bigint as pack_id
                FROM meli_stage.order_items stoi
			    WHERE
                    stoi.account_id = {account_id}
			        AND stoi.stage_status = 0
		 		    AND NOT EXISTS (
                            SELECT 1
                            FROM meuml.order_items moi
                            WHERE
                                moi.account_id = {account_id}
                                AND stoi.id_item = moi.id
								AND stoi.order_id = moi.order_id
                    )
                LIMIT {limit}
                RETURNING id_stage
            )
            UPDATE meli_stage.order_items stoi5
            SET stage_status = 1
            FROM ids
            WHERE
                stoi5.account_id = {account_id}
                AND stoi5.id = ids.id_stage
        """

        while new_count['total'] > 0:
            action.execute(new_insert_query)
            new_count['total'] -= limit


def sync_order_messages(account_id, action):
    limit = 100

    unmodified_delete_query = f"""
        DELETE FROM
            meli_stage.order_messages stom
        WHERE
            stom.account_id = {account_id}
            AND stom.stage_status = 0
            AND EXISTS (
                SELECT 1
                FROM meuml.order_messages mom
                WHERE
                    mom.id = stom.id_message
                    AND mom.account_id = {account_id}
                    AND mom.order_id = stom.order_id
            )
    """
    action.execute(unmodified_delete_query)

    new_count_query = f"""
        SELECT
            count(*) as total
        FROM
            meli_stage.order_messages stom
        WHERE
            stom.account_id = {account_id}
            AND stom.stage_status = 0
            AND NOT EXISTS (
                SELECT 1
                FROM meuml.order_messages mom
                WHERE
                    mom.account_id = {account_id}
                    AND mom.order_id = stom.order_id
                    AND mom.id = stom.id_message
            )
    """
    new_count = action.fetchone(new_count_query)

    if new_count and new_count['total'] > 0:
        new_insert_query = f"""
            WITH ids(id_stage) as (
                INSERT INTO meuml.order_messages
                    (id, order_id, order_date_created, account_id, client_id, from_user_id, from_email, from_name,
                    status, text, date_created, date_available, date_received, date_notified, date_read, moderation_status,
                    moderation_reason, moderation_date, moderation_by, message_attachments, id_stage, pack_id)
                SELECT
                    external_data ->> 'id' as id,
                    (external_data ->> 'order_id')::bigint as order_id,
                    (external_data ->> 'order_date_created')::timestamp as order_date_created,
                    account_id as account_id,
                    (external_data ->> 'client_id')::bigint as client_id,
                    (external_data -> 'from' ->> 'user_id')::bigint as from_user_id,
                    external_data -> 'from' ->> 'email' as from_email,
                    external_data -> 'from' ->> 'name' as from_name,
                    external_data ->> 'status' as status,
                    external_data ->> 'text' as text,
                    (external_data -> 'message_date' ->> 'created')::timestamp as date_created,
                    (external_data -> 'message_date' ->> 'available')::timestamp as date_available,
                    (external_data -> 'message_date' ->> 'received')::timestamp as date_received,
                    (external_data -> 'message_date' ->> 'notified')::timestamp as date_notified,
                    (external_data -> 'message_date' ->> 'read')::timestamp as date_read,
                    external_data -> 'message_moderation' ->> 'status' as moderation_status,
                    external_data -> 'message_moderation' ->> 'reason' as moderation_reason,
                    (external_data -> 'message_moderation' ->> 'moderation_date')::timestamp as moderation_date,
                    external_data -> 'message_moderation' ->> 'by' as moderation_by,
                    nullif((external_data -> 'message_attachments')::jsonb,'null') as message_attachments,
                    id,
                    (external_data ->> 'pack_id')::bigint as pack_id
                FROM meli_stage.order_messages stom
                WHERE
                    stom.account_id = {account_id}
                    AND stom.stage_status = 0
                    AND NOT EXISTS (
                        SELECT id
                        FROM meuml.order_messages mom
                        WHERE
                            mom.account_id = {account_id}
                            AND mom.id = stom.id_message
                    )
                LIMIT {limit}
                RETURNING id_stage
            )
            UPDATE meli_stage.order_messages stom5
            SET stage_status = 1
            FROM ids
            WHERE
                stom5.account_id = {account_id}
                AND stom5.id  = ids.id_stage
        """

        while new_count['total'] > 0:
            action.execute(new_insert_query)
            new_count['total'] -= limit

    # modified_count_query = f"""
    #     SELECT count(*) as total
    #     FROM
    #         meli_stage.order_messages stom, meuml.order_messages mom
    #     WHERE
    #         stom.account_id = {account_id}
    #         AND stom.id_message = mom.id
    #         AND stom.stage_status = 0
    # """
    # modified_count = action.fetchone(modified_count_query)

    # if modified_count and modified_count['total'] > 0:
    #     modified_update_query = f"""
    #         WITH modified_order_messages AS (
    #             SELECT
    #                 stom.external_data
    #             FROM
    #                 meli_stage.order_messages stom, meuml.order_messages mom
    #             WHERE
    #                 stom.account_id = {account_id}
    #                 AND stom.id_message = mom.id
    #                 AND stom.stage_status = 0
    #                 AND (stom.external_data ->> 'date_last_updated')::timestamp > mom.date_last_updated
    #             LIMIT {limit}
    #         )
    #         UPDATE
    #             meuml.order_messages
    #         SET
    #             status = modified_order_messages.external_data ->> 'status',
    #             text = modified_order_messages.external_data ->> 'text',
    #             date_created = (modified_order_messages.external_data -> 'message_date' ->> 'created')::timestamp,
    #             date_available = (modified_order_messages.external_data -> 'message_date' ->> 'available')::timestamp,
    #             date_received = (modified_order_messages.external_data -> 'message_date' ->> 'received')::timestamp,
    #             date_notified = (modified_order_messages.external_data -> 'message_date' ->> 'notified')::timestamp,
    #             date_read = (modified_order_messages.external_data -> 'message_date' ->> 'read')::timestamp,
    #             moderation_status = modified_order_messages.external_data -> 'message_moderation' ->> 'status',
    #             moderation_reason = modified_order_messages.external_data -> 'message_moderation' ->> 'reason',
    #             moderation_date = (modified_order_messages.external_data -> 'message_moderation' ->> 'moderation_date')::timestamp,
    #             moderation_by = modified_order_messages.external_data -> 'message_moderation' ->> 'by',
    #             message_attachments = (modified_order_messages.external_data -> 'message_attachments')::jsonb
    #         WHERE
    #             id = modified_order_messages.external_data ->> 'id'
    #     """

    #     while modified_count['total'] > 0:
    #         action.execute(modified_update_query)
    #         modified_count['total'] -= limit

    #     update_stage_status = f"""
    #         UPDATE meli_stage.order_messages stom
    #         SET stage_status = 1
    #         WHERE
    #             stom.account_id = {account_id}
    #             AND stom.stage_status = 0
    #             AND EXISTS (
    #                 SELECT 1
    #                 FROM meuml.order_messages mom
    #                 WHERE
    #                     mom.id = stom.id_message
    #                     AND mom.account_id = {account_id}
    #                     AND mom.order_id = stom.order_id
    #             )
    #     """
    #     action.execute(update_stage_status)


def sync_order_payments(account_id, action):
    limit = 100

    unmodified_delete_query = f"""
        DELETE FROM meli_stage.order_payments stop
        WHERE
            stop.account_id = {account_id}
            AND stop.stage_status = 0
            AND EXISTS (
                SELECT 1
                FROM meuml.order_payments mop
                WHERE
                    mop.account_id = {account_id}
                    AND mop.order_id = stop.order_id
                    AND mop.id = stop.id_payment
                    AND mop.date_last_modified = (stop.external_data ->> 'date_last_modified')::timestamp
            )
    """
    action.execute(unmodified_delete_query)

    new_count_query = f"""
        SELECT
            count(*) as total
        FROM
            meli_stage.order_payments stop
        WHERE
            stop.account_id = {account_id}
            AND stop.stage_status = 0
            AND NOT EXISTS (
                SELECT 1
                FROM meuml.order_payments mop
                WHERE
                    mop.account_id = {account_id}
                    AND mop.order_id = stop.order_id
                    AND mop.id = stop.id_payment
            )
    """
    new_count = action.fetchone(new_count_query)

    if new_count and new_count['total'] > 0:

        new_insert_query = f"""
            WITH ids(id_stage) as (
                INSERT INTO meuml.order_payments
                    (id, order_id, order_date_created, account_id, payer_id, date_created, date_last_modified,
                    date_approved, status, status_detail, payment_type, payment_method_id, card_id, total_paid_amount,
                    shipping_cost, installments, installment_amount, transaction_amount, overpaid_amount, id_stage, pack_id)
                SELECT
                    (external_data ->> 'id')::bigint as id,
                    (external_data ->> 'order_id')::bigint as order_id,
                    (external_data ->> 'order_date_created')::timestamp as order_date_created,
                    account_id as account_id,
                    (external_data ->> 'payer_id')::bigint as payer_id,
                    (external_data ->> 'order_date_created')::timestamp as date_created,
                    (external_data ->> 'date_last_modified')::timestamp as date_last_modified,
                    (external_data ->> 'date_approved')::timestamp as date_approved,
                    external_data ->> 'status' as status,
                    external_data ->> 'status_detail' as status_detail,
                    external_data ->> 'payment_type' as payment_type,
                    external_data ->> 'payment_method_id' as payment_method_id,
                    (external_data ->> 'card_id')::bigint as card_id,
                    (external_data ->> 'total_paid_amount')::numeric as total_paid_amount,
                    (external_data ->> 'shipping_cost')::numeric as shipping_cost,
                    (external_data ->> 'installments')::integer as installments,
                    (external_data ->> 'installment_amount')::numeric as installment_amount,
                    (external_data ->> 'transaction_amount')::numeric as transaction_amount,
                    (external_data ->> 'overpaid_amount')::numeric as overpaid_amount,
                    id,
                    (external_data ->> 'pack_id')::bigint as pack_id
                FROM
                    meli_stage.order_payments stop
                WHERE
                    stop.account_id = {account_id}
                    AND stop.stage_status = 0
                    AND NOT EXISTS (
                        SELECT 1
                        FROM meuml.order_payments mop
                        WHERE
                            mop.order_id = stop.order_id
                            AND mop.account_id = {account_id}
                            AND mop.id = stop.id_payment
                    )
                LIMIT {limit}
                RETURNING id_stage
            )
            UPDATE meli_stage.order_payments stop5
            SET stage_status = 1
            FROM ids
            WHERE
                stop5.account_id = {account_id}
                AND stop5.id = ids.id_stage
        """

        while new_count['total'] > 0:
            action.execute(new_insert_query)
            new_count['total'] -= limit

    modified_count_query = f"""
        SELECT
            count(*) as total
        FROM
            meli_stage.order_payments stop, meuml.order_payments mop
        WHERE
            stop.account_id = {account_id}
            AND stop.id_payment = mop.id
            AND stop.order_id = mop.order_id
            AND stop.stage_status = 0
            AND (stop.external_data ->> 'date_last_modified')::timestamp > mop.date_last_modified
    """
    modified_count = action.fetchone(modified_count_query)

    if modified_count and modified_count['total'] > 0:
        modified_update_query = f"""
            WITH modified_order_payments AS (
                SELECT
                    stop.id_payment,
                    stop.external_data
                FROM
                    meli_stage.order_payments stop, meuml.order_payments mop
                WHERE
                    stop.account_id = {account_id}
                    AND stop.id_payment = mop.id
                    AND stop.stage_status = 0
                    AND (stop.external_data ->> 'date_last_modified')::timestamp > mop.date_last_modified
                LIMIT {limit}
            )
            UPDATE meuml.order_payments
                SET
                    payer_id = (modified_order_payments.external_data ->> 'payer_id')::bigint,
                    date_last_modified = (modified_order_payments.external_data ->> 'date_last_modified')::timestamp,
                    date_approved =  (modified_order_payments.external_data ->> 'date_approved')::timestamp,
                    status = (modified_order_payments.external_data ->> 'status'),
                    status_detail = (modified_order_payments.external_data ->>  'status_detail'),
                    payment_type = (modified_order_payments.external_data ->> 'payment_type'),
                    payment_method_id = (modified_order_payments.external_data ->> 'payment_method_id'),
                    card_id = (modified_order_payments.external_data ->>  'card_id')::bigint,
                    total_paid_amount = (modified_order_payments.external_data ->> 'total_paid_amount')::numeric,
                    shipping_cost = (modified_order_payments.external_data ->> 'shipping_cost')::numeric,
                    installments = (modified_order_payments.external_data ->> 'installments')::integer,
                    installment_amount = (modified_order_payments.external_data ->> 'installment_amount')::numeric,
                    transaction_amount = (modified_order_payments.external_data ->>'transaction_amount')::numeric,
                    overpaid_amount = (modified_order_payments.external_data ->> 'overpaid_amount')::numeric
            FROM modified_order_payments
            WHERE
                account_id = {account_id}
                AND id = modified_order_payments.id_payment
        """

        while modified_count['total'] > 0:
            action.execute(modified_update_query)
            modified_count['total'] -= limit

        update_stage_status = f"""
            UPDATE meli_stage.order_payments stop
            SET stage_status = 1
            WHERE
                stop.account_id = {account_id}
                AND stop.stage_status = 0
                AND EXISTS (
                    SELECT 1
                    FROM meuml.order_payments mop
                    WHERE
                        stop.id_payment = mop.id
                        AND stop.order_id = mop.order_id
                        AND (stop.external_data ->> 'date_last_modified')::timestamp = mop.date_last_modified
                )
        """
        action.execute(update_stage_status)


def sync_order_shipments(account_id, action):
    limit = 100

    unmodified_delete_query = f"""
        DELETE FROM meli_stage.order_shipments stos
        WHERE
            stos.account_id = {account_id}
            AND stos.stage_status = 0
            AND EXISTS (
                SELECT 1
                FROM meuml.order_shipments mos
                WHERE
                    mos.account_id = {account_id}
                    AND mos.id = stos.id_shipment
                    AND (stos.external_data ->> 'last_updated')::timestamp = mos.last_updated
            )
    """
    action.execute(unmodified_delete_query)

    new_count_query = f"""
        SELECT
            count(*) as total
        FROM
            meli_stage.order_shipments stos
        WHERE
            stos.account_id = {account_id}
            AND stos.stage_status = 0
            AND NOT EXISTS (
                SELECT 1
                FROM meuml.order_shipments mos
                WHERE
                    mos.account_id = {account_id}
                    AND mos.id = stos.id_shipment
            )
    """
    new_count = action.fetchone(new_count_query)

    if new_count and new_count['total'] > 0:

        new_insert_query = f"""
            WITH ids(id_stage) as (
                INSERT INTO meuml.order_shipments
                    (id, id_stage, order_id, order_date_created, account_id, pack_id, status, substatus, date_created,
                    last_updated, declared_value, height, width, length, weight, "type", "mode", logistic_type, source_site_id,
                    source_market_place, source_application_id, tracking_method, tracking_number, origin_type, sender_id,
                    sender_address_id, sender_zip_code, sender_street_name, sender_street_number, sender_address_comment,
                    sender_neighboorhood, sender_city, sender_state, sender_country, sender_latitude, sender_longitude,
                    destination_type, receiver_id, receiver_name, receiver_phone, destination_comments, receiver_address_id,
                    receiver_zip_code, receiver_street_name, receiver_street_number, receiver_address_comment, receiver_neighboorhood,
                    receiver_city, receiver_state, receiver_country, receiver_latitude, receiver_longitude, delivery_preference,
                    shipping_option_id, shipping_method_id, shipping_method_name, shipping_method_type, shipping_method_deliver_to,
                    lead_time_currency_id, "cost", list_cost, cost_type, lead_time_service_id, delivery_type, estimated_delivery_time_type,
                    estimated_delivery_time_from, estimated_delivery_time_unit, estimated_delivery_time_to,
                    estimated_delivery_time_to_shipping, pay_before, estimated_delivery_time_from_shipping,
                    estimated_delivery_time_from_handling, carrier_name, carrier_url, history)
                SELECT
                    (external_data ->> 'id')::bigint as id,
                    id as id_stage,
                    (external_data ->> 'order_id')::bigint as order_id,
                    (external_data ->> 'order_date_created')::timestamp as order_date_created,
                    account_id,
                    (external_data ->> 'pack_id')::bigint as pack_id,
                    external_data ->> 'status' as status,
                    external_data ->> 'substatus' as substatus,
                    (external_data ->> 'date_created')::timestamp as date_created,
                    (external_data ->> 'last_updated')::timestamp as last_updated,
                    (external_data ->> 'declared_value')::numeric as declared_value,
                    (external_data -> 'dimensions' ->> 'height')::integer as height,
                    (external_data -> 'dimensions' ->> 'width')::integer as width,
                    (external_data -> 'dimensions' ->> 'length')::integer as length,
                    (external_data -> 'dimensions' ->> 'weight')::integer as weight,
                    external_data -> 'logistic' ->> 'direction' as type,
                    external_data -> 'logistic' ->> 'mode' as mode,
                    external_data -> 'logistic' ->> 'type' as logistic_type,
                    external_data -> 'source' ->> 'site_id' as source_site_id,
                    external_data -> 'source' ->> 'market_place' as source_market_place,
                    external_data -> 'source' ->> 'application_id' as source_application_id,
                    external_data ->> 'tracking_method' as tracking_method,
                    external_data ->> 'tracking_number' as tracking_number,
                    external_data -> 'origin' ->> 'type' as origin_type,
                    (external_data -> 'origin' ->> 'sender_id')::bigint as sender_id,
                    (external_data -> 'origin' -> 'shipping_address' ->> 'id')::bigint as sender_address_id,
                    external_data -> 'origin' -> 'shipping_address' ->> 'zip_code' as sender_zip_code,
                    external_data -> 'origin' -> 'shipping_address' ->> 'street_name' as sender_street_name,
                    external_data -> 'origin' -> 'shipping_address' ->> 'street_number' as sender_street_number,
                    external_data -> 'origin' -> 'shipping_address' ->> 'comment' as sender_address_comment,
                    external_data -> 'origin' -> 'shipping_address' -> 'neighboorhood' ->> 'name' as sender_neighboorhood,
                    external_data -> 'origin' -> 'shipping_address' -> 'city' ->> 'name' as sender_city,
                    external_data -> 'origin' -> 'shipping_address' -> 'state' ->> 'name' as sender_state,
                    external_data -> 'origin' -> 'shipping_address' -> 'country' ->> 'name' as sender_country,
                    (external_data -> 'origin' -> 'shipping_address' ->> 'latitude')::decimal(10,6) as sender_latitude,
                    (external_data -> 'origin' -> 'shipping_address' ->> 'longitude')::decimal(10,6) as sender_longitude,
                    external_data -> 'destination' ->> 'type' as destination_type,
                    (external_data -> 'destination' ->> 'receiver_id')::bigint as receiver_id,
                    external_data -> 'destination' ->> 'receiver_name' as receiver_name,
                    external_data -> 'destination' ->> 'receiver_phone' as receiver_phone,
                    external_data -> 'destination' ->> 'comments' as destination_comments,
                    (external_data -> 'destination' -> 'shipping_address' ->> 'id')::bigint as receiver_address_id,
                    external_data -> 'destination' -> 'shipping_address' ->> 'zip_code' as receiver_zip_code,
                    external_data -> 'destination' -> 'shipping_address' ->> 'street_name' as receiver_street_name,
                    external_data -> 'destination' -> 'shipping_address' ->> 'street_number' as receiver_street_number,
                    external_data -> 'destination' -> 'shipping_address' ->> 'comment' as receiver_address_comment,
                    external_data -> 'destination' -> 'shipping_address' -> 'neighboorhood' ->> 'name' as receiver_neighboorhood,
                    external_data -> 'destination' -> 'shipping_address' -> 'city' ->> 'name' as receiver_city,
                    external_data -> 'destination' -> 'shipping_address' -> 'state' ->> 'name' as receiver_state,
                    external_data -> 'destination' -> 'shipping_address' -> 'country' ->> 'name' as receiver_country,
                    (external_data -> 'destination' -> 'shipping_address' ->> 'latitude')::decimal(10,6) as receiver_latitude,
                    (external_data -> 'destination' -> 'shipping_address' ->> 'longitude')::decimal(10,6) as receiver_longitude,
                    external_data -> 'destination' -> 'shipping_address' ->> 'delivery_preference' as delivery_preference,
                    external_data -> 'lead_time' ->> 'option_id' as shipping_option_id,
                    (external_data -> 'lead_time' -> 'shipping_method' ->> 'id')::integer as shipping_method_id,
                    external_data -> 'lead_time' -> 'shipping_method' ->> 'name' as shipping_method_name,
                    external_data -> 'lead_time' -> 'shipping_method' ->> 'type' as shipping_method_type,
                    external_data -> 'lead_time' -> 'shipping_method' ->> 'deliver_to' as shipping_method_deliver_to,
                    external_data -> 'lead_time' ->> 'currency_id' as lead_time_currency_id,
                    (external_data -> 'lead_time' ->> 'cost')::numeric as cost,
                    (external_data -> 'lead_time' ->> 'list_cost')::numeric as list_cost,
                    external_data -> 'lead_time' ->> 'cost_type' as cost_type,
                    (external_data -> 'lead_time' ->> 'service_id')::integer as lead_time_service_id,
                    external_data -> 'lead_time' ->> 'delivery_type' as delivery_type,
                    external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'type' as estimated_delivery_time_type,
                    (external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'date')::timestamp as estimated_delivery_time_from,
                    external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'unit' as estimated_delivery_time_unit,
                    (external_data -> 'lead_time' -> 'estimated_delivery_time' -> 'offset' ->> 'date')::timestamp as estimated_delivery_time_to,
                    (external_data -> 'lead_time' -> 'estimated_delivery_time' -> 'offset' ->> 'shipping')::integer as estimated_delivery_time_to_shipping,
                    (external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'pay_before')::timestamp as pay_before,
                    (external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'shipping')::integer as estimated_delivery_time_from_shipping,
                    (external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'handling')::integer as estimated_delivery_time_from_handling,
                    external_data ->> 'carrier_name' as carrier_name,
                    external_data ->> 'carrier_url' as carrier_url,
                    (external_data ->> 'history')::jsonb as history
                FROM
                    meli_stage.order_shipments stos
                WHERE
                    stos.account_id = {account_id}
                    AND stos.stage_status = 0
                    AND NOT EXISTS (
                        SELECT id
                        FROM meuml.order_shipments mos
                        WHERE
                            mos.id = stos.id_shipment
                            AND mos.account_id = {account_id}
                    )
                    LIMIT {limit}
                    RETURNING id_stage
                )
                UPDATE meli_stage.order_shipments stos5
                SET stage_status = 1
                FROM ids
                WHERE
                    stos5.account_id = {account_id}
                    AND stos5.id = ids.id_stage
        """

        while new_count['total'] > 0:
            action.execute(new_insert_query)
            new_count['total'] -= limit

    modified_count_query = f"""
        SELECT count(*) as total
        FROM
            meli_stage.order_shipments stos, meuml.order_shipments mos
        WHERE
            stos.account_id = {account_id}
            AND stos.id_shipment = mos.id
            AND stos.stage_status = 0
            AND (stos.external_data ->> 'last_updated')::timestamp > mos.last_updated
    """
    modified_count = action.fetchone(modified_count_query)

    if modified_count and modified_count['total'] > 0:
        modified_update_query = f"""
            WITH modified_order_shipments AS (
                SELECT
                    stos.id_shipment,
                    stos.external_data
                FROM
                    meli_stage.order_shipments stos, meuml.order_shipments mos
                WHERE
                    stos.account_id = {account_id}
                    AND stos.id_shipment = mos.id
                    AND stos.stage_status = 0
                    AND (stos.external_data ->> 'last_updated')::timestamp > mos.last_updated
                LIMIT {limit}
            )
            UPDATE
                meuml.order_shipments
            SET
                status = modified_order_shipments.external_data ->> 'status',
                substatus = modified_order_shipments.external_data ->> 'substatus',
                last_updated = (modified_order_shipments.external_data ->> 'last_updated')::timestamp,
                declared_value = (modified_order_shipments.external_data ->> 'declared_value')::numeric,
                height = (modified_order_shipments.external_data -> 'dimensions' ->> 'height')::integer,
                width = (modified_order_shipments.external_data -> 'dimensions' ->> 'width')::integer,
                length = (modified_order_shipments.external_data -> 'dimensions' ->> 'length')::integer,
                weight = (modified_order_shipments.external_data -> 'dimensions' ->> 'weight')::integer,
                type = modified_order_shipments.external_data -> 'logistic' ->> 'direction',
                mode = modified_order_shipments.external_data -> 'logistic' ->> 'mode',
                logistic_type = modified_order_shipments.external_data -> 'logistic' ->> 'type',
                source_site_id = modified_order_shipments.external_data -> 'source' ->> 'site_id',
                source_market_place = modified_order_shipments.external_data -> 'source' ->> 'market_place',
                source_application_id = modified_order_shipments.external_data -> 'source' ->> 'application_id',
                tracking_method = modified_order_shipments.external_data ->> 'tracking_method',
                tracking_number = modified_order_shipments.external_data ->> 'tracking_number',
                origin_type = modified_order_shipments.external_data -> 'origin' ->> 'type',
                sender_id = (modified_order_shipments.external_data -> 'origin' ->> 'sender_id')::bigint,
                sender_address_id = (modified_order_shipments.external_data  -> 'origin' -> 'shipping_address' ->> 'id')::bigint,
                sender_zip_code = modified_order_shipments.external_data -> 'origin'-> 'shipping_address' ->> 'zip_code',
                sender_street_name = modified_order_shipments.external_data -> 'origin'-> 'shipping_address' ->> 'street_name',
                sender_street_number = modified_order_shipments.external_data -> 'origin'-> 'shipping_address' ->> 'street_number',
                sender_address_comment = modified_order_shipments.external_data -> 'origin'-> 'shipping_address' ->> 'comment',
                sender_neighboorhood = modified_order_shipments.external_data -> 'origin'-> 'shipping_address' -> 'neighboorhood' ->> 'name',
                sender_city = modified_order_shipments.external_data -> 'origin'-> 'shipping_address' -> 'city' ->> 'name',
                sender_state = modified_order_shipments.external_data -> 'origin'-> 'shipping_address' -> 'state' ->> 'name',
                sender_country = modified_order_shipments.external_data -> 'origin'-> 'shipping_address' -> 'country' ->> 'name',
                sender_latitude = (modified_order_shipments.external_data -> 'origin'-> 'shipping_address' ->> 'latitude')::decimal(10,6),
                sender_longitude = (modified_order_shipments.external_data -> 'origin'-> 'shipping_address' ->> 'longitude')::decimal(10,6),
                destination_type = modified_order_shipments.external_data -> 'destination' ->> 'type',
                receiver_id = (modified_order_shipments.external_data -> 'destination' ->> 'receiver_id')::bigint,
                receiver_name = modified_order_shipments.external_data -> 'destination' ->> 'receiver_name',
                receiver_phone = modified_order_shipments.external_data -> 'destination' ->> 'receiver_phone',
                destination_comments = modified_order_shipments.external_data -> 'destination' ->> 'comments',
                receiver_address_id = (modified_order_shipments.external_data  -> 'destination' -> 'shipping_address' ->> 'id')::bigint,
                receiver_zip_code = modified_order_shipments.external_data -> 'destination'-> 'shipping_address' ->> 'zip_code',
                receiver_street_name = modified_order_shipments.external_data -> 'destination'-> 'shipping_address' ->> 'street_name',
                receiver_street_number = modified_order_shipments.external_data -> 'destination'-> 'shipping_address' ->> 'street_number',
                receiver_address_comment = modified_order_shipments.external_data -> 'destination'-> 'shipping_address' ->> 'comment',
                receiver_neighboorhood = modified_order_shipments.external_data -> 'destination'-> 'shipping_address' -> 'neighboorhood' ->> 'name',
                receiver_city = modified_order_shipments.external_data -> 'destination'-> 'shipping_address' -> 'city' ->> 'name',
                receiver_state = modified_order_shipments.external_data -> 'destination'-> 'shipping_address' -> 'state' ->> 'name',
                receiver_country = modified_order_shipments.external_data -> 'destination'-> 'shipping_address' -> 'country' ->> 'name',
                receiver_latitude = (modified_order_shipments.external_data -> 'destination'-> 'shipping_address' ->> 'latitude')::decimal(10,6),
                receiver_longitude = (modified_order_shipments.external_data -> 'destination'-> 'shipping_address' ->> 'longitude')::decimal(10,6),
                delivery_preference = modified_order_shipments.external_data -> 'destination'-> 'shipping_address' ->> 'delivery_preference',
                shipping_option_id = modified_order_shipments.external_data -> 'lead_time' ->> 'option_id',
                shipping_method_id = (modified_order_shipments.external_data -> 'lead_time' -> 'shipping_method' ->> 'id')::integer,
                shipping_method_name = modified_order_shipments.external_data -> 'lead_time' -> 'shipping_method' ->> 'name',
                shipping_method_type = modified_order_shipments.external_data -> 'lead_time' -> 'shipping_method' ->> 'type',
                shipping_method_deliver_to = modified_order_shipments.external_data -> 'lead_time' -> 'shipping_method' ->> 'deliver_to',
                lead_time_currency_id = modified_order_shipments.external_data -> 'lead_time' ->> 'currency_id',
                cost = (modified_order_shipments.external_data -> 'lead_time' ->> 'cost')::numeric,
                list_cost = (modified_order_shipments.external_data -> 'lead_time' ->> 'list_cost')::numeric,
                cost_type = modified_order_shipments.external_data -> 'lead_time' ->> 'cost_type',
                lead_time_service_id = (modified_order_shipments.external_data -> 'lead_time' ->> 'service_id')::integer,
                delivery_type = modified_order_shipments.external_data -> 'lead_time' ->> 'delivery_type',
                estimated_delivery_time_type = modified_order_shipments.external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'type',
                estimated_delivery_time_from = (modified_order_shipments.external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'date')::timestamp,
                estimated_delivery_time_unit = modified_order_shipments.external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'unit',
                estimated_delivery_time_to = (modified_order_shipments.external_data -> 'lead_time' -> 'estimated_delivery_time' -> 'offset' ->> 'date')::timestamp,
                estimated_delivery_time_to_shipping = (modified_order_shipments.external_data -> 'lead_time' -> 'estimated_delivery_time' -> 'offset' ->> 'shipping')::integer,
                pay_before = (modified_order_shipments.external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'pay_before')::timestamp,
                estimated_delivery_time_from_shipping = (modified_order_shipments.external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'shipping')::integer,
                estimated_delivery_time_from_handling = (modified_order_shipments.external_data -> 'lead_time' -> 'estimated_delivery_time' ->> 'handling')::integer,
                carrier_name = modified_order_shipments.external_data ->> 'carrier_name',
                carrier_url = modified_order_shipments.external_data ->> 'carrier_url',
                history = (modified_order_shipments.external_data ->> 'history')::jsonb
            FROM modified_order_shipments
            WHERE
                id = modified_order_shipments.id_shipment
        """

        while modified_count['total'] > 0:
            action.execute(modified_update_query)
            modified_count['total'] -= limit

        update_stage_status = f"""
            UPDATE meli_stage.order_shipments stos
            SET stage_status = 1
            WHERE
                stos.account_id = {account_id}
                AND stos.stage_status = 0
                AND EXISTS (
                    SELECT id
                    FROM meuml.order_shipments mos
                    WHERE
                        stos.id_shipment = mos.id
                        AND (stos.external_data ->> 'last_updated')::timestamp = mos.last_updated
                )
        """
        action.execute(update_stage_status)
