import re
import traceback
from flask import request, send_file
from flask_jwt_simple import get_jwt_identity, jwt_required
from io import BytesIO
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.enums.access_type import AccessType
from libs.minio_api.minio_api import minio_client
from libs.payments.payment_helper import user_subscripted_accounts, verify_tool_access
from libs.queue.queue import app as queue
from libs.schema.orders_schema import OrderListSchema
from libs.translations.mercadolibre_order_payments import MLPaymentsPTBR
from libs.translations.mercadolibre_order_shipments import MLShipmentsPTBR
from werkzeug.exceptions import HTTPException


class OrdersActions(Actions):
    @jwt_required
    @prepare
    def orders(self):
        data = []

        query = """
            SELECT id AS "account_id", id, status, access_token_expires_at, access_token, refresh_token, name 
            FROM meuml.accounts 
            WHERE user_id = :user_id and status=1 
        """
        values = {'user_id': self.user['id']}

        if 'filter_account' in request.args and len(request.args['filter_account']) > 0:
            accounts_id = request.args['filter_account'].split(',')

            for i, account_id in enumerate(accounts_id):
                values[str(i)] = int(account_id)
            query += f' and id IN (:{",:".join(values.keys())})'

        accounts = self.fetchall(query, values)

        subscripted_accounts = user_subscripted_accounts(self, self.user['id'])
        accounts = [account for account in accounts if account['id']
                    in subscripted_accounts]

        if len(accounts) == 0:
            code, message = 402, 'Essa funcionalidade é exclusiva para contas assinantes do MeuML v2. Faça já sua assinatura e obtenha acesso'
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        try:
            fields = ["od.pack_id as id", "array_agg(od.id) as order_id", "ac.id as account_id", "ac.external_name",
                      "SUM(od.paid_amount) as paid_amount", "SUM(od.total_amount) as total_amount", "SUM(od.total_amount_with_shipping) as total_amount_with_shipping",
                      "MIN(od.date_created)::varchar as date_created",  "MAX(od.date_last_updated)::varchar as date_last_updated", "MAX(od.last_updated)::varchar as last_updated",
                      "MAX(od.date_closed)::varchar as date_closed", "MIN(od.expiration_date)::varchar as expiration_date", "MIN(od.manufacturing_ending_date)::varchar as manufacturing_ending_date",
                      "MIN(od.buyer_points) as buyer_points", "MIN(od.buyer_id) as buyer_id", "MIN(od.buyer_nickname) as buyer_nickname", "MIN(od.buyer_first_name) as buyer_first_name",
                      "MIN(od.buyer_last_name) as buyer_last_name", "MIN(od.buyer_doc_type) as buyer_doc_type", "MIN(od.buyer_doc_number) as buyer_doc_number",
                      "MIN(od.buyer_phone_area) as buyer_phone_area", "MIN(od.buyer_phone_number) as buyer_phone_number", "MIN(od.buyer_email) as buyer_email"]

            query = f"""
                SELECT {', '.join(fields)}
                FROM meuml.orders od
                JOIN meuml.accounts ac ON ac.id = od.account_id 
                LEFT JOIN meuml.order_shipments os on os.pack_id = od.pack_id
            """

            mshops_filter = bool(
                int(request.args['mshops'])) if request.args.get('mshops') else False

            values, filter_query, total, * \
                _ = self.apply_filter(
                    request, mshops=mshops_filter)

            query += f"""
                {filter_query}  
                GROUP BY ac.id, od.pack_id
            """

            query = self.order(request, fields, query, default_table='od')
            params, query = self.paginate(request, query)
            orders = self.fetchall(query, values)

            orders_id = ','.join(
                [str(order_id) for order in orders for order_id in order['order_id']])

            query_items = f"""
                SELECT 
                    oi.id, oi.order_id, oi.dimensions, oi.description, oi.title, oi.warranty, oi."condition", oi.seller_sku, oi.category_id, 
                    oi.seller_custom_field, oi.variation_attributes, oi.quantity, oi.sale_fee, oi.unit_price, oi.currency_id, 
                    oi.full_unit_price, oi.listing_type_id, oi.manufacturing_days, oi.variation_id, ad.secure_thumbnail 
                FROM meuml.order_items oi 
                LEFT JOIN meuml.advertisings ad ON ad.external_id = oi.id 
                WHERE order_id IN ({orders_id}) 
            """
            query_payments = f"""
                SELECT 
                    id, order_id, date_created::varchar, date_last_modified::varchar, date_approved::varchar, status, status_detail, payment_type, 
                    payment_method_id, card_id, total_paid_amount, shipping_cost, installments, installment_amount, 
                    transaction_amount, overpaid_amount, payer_id
                FROM meuml.order_payments 
                WHERE order_id IN ({orders_id})
                ORDER BY date_approved 
            """
            query_shipments = f"""
                SELECT 
                    id, order_id, status, substatus, date_created, mode, logistic_type,
                    receiver_zip_code, receiver_street_name, receiver_street_number, 
                    receiver_address_comment, receiver_neighboorhood,receiver_city, 
                    receiver_state, receiver_country, list_cost,
                    tracking_number, tracking_method, 
                    carrier_name, carrier_url, history
                FROM meuml.order_shipments 
                WHERE order_id IN ({orders_id})
            """

            shipping_abbreviations = {
                "me1": "ME1",
                "me2": "ME2",
                "custom": "PER",
                "not_specified": "AC",
                "drop_off": "COR",
                "xd_drop_off": "MIS",
                "cross_docking": "COL",
                "fulfillment": "FULL"
            }

            if len(orders) > 0:
                items = self.fetchall(query_items)
                payments = self.fetchall(query_payments)
                shipments = self.fetchall(query_shipments)

            for order in orders:
                total_sale_fee = 0

                order_items = []
                remaining_items = []
                for item in items:
                    if item['order_id'] in order['order_id']:
                        if item['sale_fee']:
                            total_sale_fee += item['sale_fee']
                        order_items.append(item)
                    else:
                        remaining_items.append(item)

                order_payments = []
                remaining_payments = []
                for payment in payments:
                    if payment['order_id'] in order['order_id']:
                        payment['payment_type'] = MLPaymentsPTBR.translate(
                            payment['payment_type'])
                        payment['payment_method_id'] = MLPaymentsPTBR.translate(
                            payment['payment_method_id'])
                        payment['status'] = MLPaymentsPTBR.translate(
                            payment['status'])
                        order['date_approved'] = payment['date_approved']
                        order_payments.append(payment)
                    else:
                        remaining_payments.append(payment)

                order_shipments = []
                remaining_shipments = []
                for shipment in shipments:
                    if shipment['order_id'] in order['order_id']:
                        shipment['status'] = MLShipmentsPTBR.translate(
                            shipment['status'])
                        shipment['substatus'] = MLShipmentsPTBR.translate(
                            shipment['substatus'])
                        shipment['mode_name'] = MLShipmentsPTBR.translate(
                            shipment['mode'])
                        shipment['logistic_type'] = MLShipmentsPTBR.translate(
                            shipment['logistic_type'])

                        if shipment['logistic_type'] in ["drop_off", "xd_drop_off", "cross_docking", "fulfillment"]:
                            shipment['shipping_name'] = MLShipmentsPTBR.translate(
                                shipment['logistic_type'])
                            shipment['shipping_abbreviation'] = shipping_abbreviations.get(
                                shipment['logistic_type'])
                        else:
                            shipment['shipping_name'] = MLShipmentsPTBR.translate(
                                shipment['mode'])
                            shipment['shipping_abbreviation'] = shipping_abbreviations.get(
                                shipment['mode'])

                        if shipment['history']:
                            for substatus in shipment['history']:
                                substatus['status'] = MLShipmentsPTBR.translate(
                                    substatus['status'])
                                substatus['substatus'] = MLShipmentsPTBR.translate(
                                    substatus['substatus'])
                        order_shipments.append(shipment)
                    else:
                        remaining_shipments.append(shipment)

                order['total_sale_fee'] = total_sale_fee

                data.append({
                    'thumbnail': order.pop('thumbnail', None),
                    'sale': order,
                    'items': order_items,
                    'payments': order_payments,
                    'shipments': order_shipments,
                })
                items = remaining_items
                payments = remaining_payments
                shipments = remaining_shipments

        except Exception:
            print(traceback.format_exc())
            self.abort_json({
                'message': f'Erro ao localizar vendas.',
                'status': 'error',
            }, 200)

        meta = self.generate_meta(params, total)

        return self.return_success(data=data, meta=meta)

    def apply_filter(self, request, query='', values=None, orders_id=None, additional_conditions=None, subscription_required=None, module_id=None, mshops=False):
        select_all = bool(int(request.args.get('select_all', 0)))
        total = 0
        accounts = []

        k = query.find('FROM')
        if k == -1:
            count_query = """
                SELECT count(distinct od.pack_id), ac.id 
                FROM meuml.orders od 
                JOIN meuml.accounts ac ON od.account_id = ac.id AND ac.status = 1 
                LEFT JOIN meuml.order_shipments os on os.pack_id = od.pack_id
            """
        else:
            count_query = 'SELECT count(distinct od.pack_id), ac.id ' + \
                query[k:]

        if not values:
            filter_values = {
                'user_id': self.user['id'], 'mshops_order': mshops}
            filter_query = 'WHERE ac.user_id = :user_id AND od.mshops_order = :mshops_order '

        if not orders_id:
            orders_id = request.form.get('orders_id', []) if len(request.form.get(
                'orders_id', [])) > 0 else request.args.get('orders_id', [])
        if len(orders_id) > 0:
            if select_all is False:
                filter_query += ' AND od.pack_id IN ('
                d, query_list = self.string_to_dict(orders_id, 'order')
                filter_values.update(d)
                filter_query += query_list
            else:
                filter_query += ' AND od.pack_id NOT IN ('
                d, query_list = self.string_to_dict(orders_id, 'order')
                filter_values.update(d)
                filter_query += query_list

        if 'filter_account' in request.args:
            accounts = request.args["filter_account"].split(',')
            if len(accounts) > 0 and accounts[0].isdigit():
                filter_query += ' AND od.account_id IN ('
                for i, account in enumerate(accounts, 1):
                    if account.isdigit():
                        filter_values['filter_account'+str(i)] = int(account)
                        filter_query += ':filter_account'+str(i)+','
                filter_query = filter_query[:-1] + ') '

        if 'filter_status' in request.args and len(request.args['filter_status']) > 0:
            status_queries = []

            if 'manufacturing' in request.args['filter_status']:
                status_queries.append(
                    " (os.status = 'handling' AND os.substatus = 'manufacturing' AND od.expiration_date > NOW()) ")

            if 'recent_orders' in request.args['filter_status']:
                status_queries.append(
                    " ((os.status = 'ready_to_ship' OR os.status = 'shipped') AND od.expiration_date > NOW()) ")

            if 'label_ready' in request.args['filter_status']:
                status_queries.append(
                    " (os.substatus = 'ready_to_print' AND od.expiration_date > NOW()) ")

            if 'awaiting_shipment' in request.args['filter_status']:
                status_queries.append(
                    " (os.status = 'ready_to_ship' AND os.substatus != 'ready_to_print' AND od.expiration_date > NOW()) ")

            if 'delivered' in request.args['filter_status']:
                status_queries.append(
                    " (os.status = 'delivered' AND od.expiration_date > NOW()) ")

            if 'finished' in request.args['filter_status']:
                status_queries.append(" (od.expiration_date <= NOW()) ")

            if len(status_queries) > 1:
                status_query = ' OR '.join(status_queries)
                status_query = f'({status_query})'
            elif len(status_queries) == 1:
                status_query = status_queries[0]
            else:
                status_query = None

            if status_query:
                filter_query += f" AND {status_query} "

        if request.args.get('search') and len(request.args['search']) > 0:
            if request.args['search'].isdigit():
                filter_query += """ 
                    AND (
                        od.pack_id = :search
                    )  
                """
                filter_values['search'] = request.args['search']

            else:
                filter_query += """ 
                    AND (
                        UPPER(od.buyer_nickname) LIKE :search_string 
                        OR UPPER(od.buyer_first_name) LIKE :search_string 
                        OR UPPER(od.buyer_last_name) LIKE :search_string
                        OR od.pack_id IN ( 
                            SELECT oi.pack_id 
                            FROM meuml.order_items oi 
                            WHERE UPPER(oi.title) LIKE :search_string
                        ) 
                    )  
                """
                filter_values['search_string'] = f"%%{request.args['search'].upper()}%%"

        if subscription_required:
            subscripted_accounts = user_subscripted_accounts(
                self, self.user['id'], module_id)
            if len(subscripted_accounts) == 0:
                total = 0
                return filter_values, query, total, accounts
            filter_query += f' AND od.account_id IN ({",".join([str(acc) for acc in subscripted_accounts])}) '

        if additional_conditions:
            filter_query += additional_conditions

        try:
            grouped_count = self.fetchall(
                count_query + filter_query + ' GROUP BY ac.id ', filter_values)
            # filter_query += ' GROUP BY ac.id, od.pack_id '

            accounts = [account['id'] for account in grouped_count]
            total = sum([count['count'] for count in grouped_count])
        except:
            print(traceback.format_exc())

        query += filter_query

        return filter_values, query, total, accounts

    def order(self, request, fields, query, default_table='od', join_tables=[], change_default_order=None):
        fields = [field if type(re.search('"(.*)"', field)) is type(None)
                  else re.search('"(.*)"', field).group(1) for field in fields]
        fields = [field[3:] if field[2] == '.' else field for field in fields]
        values = {}

        if 'sort_order' in request.args and request.args['sort_order'] == 'asc':
            values['sort_order'] = 'asc'
        else:
            values['sort_order'] = 'desc'

        if 'sort_name' in request.args and request.args['sort_name'] in fields:
            if request.args['sort_name'] == 'date_modified' and len(join_tables) > 0:
                query += f" ORDER BY least(coalesce({default_table}.date_modified, DATE 'infinity')"
                for table in join_tables:
                    query += f",coalesce({table}.date_modified, DATE 'infinity')"
                query += f") {values['sort_order']} "
            elif values['sort_order'] == 'asc':
                query += f" ORDER BY {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
            else:
                query += f" ORDER BY ({default_table}.{request.args['sort_name']} IS NULL), {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "

        else:
            query += f" ORDER BY date_closed {values['sort_order']}, date_created {values['sort_order']} "

        return query

    @jwt_required
    @prepare
    def print_label(self):
        self.validate(OrderListSchema())

        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message': 'Preencha o parâmetro de confirmação.',
                'status': 'error',
            }, 400)
        else:
            confirmed = True if request.args.get(
                'confirmed', '0') == '1' else False

        if self.data['file_type'] not in ['pdf', 'zpl2']:
            self.abort_json({
                'message': 'Arquivo deve ser tipo pdf ou zpl2.',
                'status': 'error',
            }, 400)

        query = """
            FROM meuml.orders od 
            JOIN meuml.order_shipments os ON os.pack_id = od.pack_id AND os.mode = 'me2' 
            JOIN meuml.accounts ac ON ac.id = od.account_id  
        """

        tool = self.get_tool('print-label')
        subscription_required = tool['access_type'] == AccessType.subscription
        additional_conditions = " AND (os.substatus = 'ready_to_print' AND od.expiration_date > NOW()) "
        filter_values, filter_query, filter_total, accounts_id = self.apply_filter(
            request, query, orders_id=self.data['orders_id'],  additional_conditions=additional_conditions, subscription_required=subscription_required)

        if not confirmed and filter_total > 1:
            return self.return_success(f"Vendas selecionadas com etiqueta disponível: {filter_total} ")
        elif not confirmed and filter_total == 1:
            order = self.fetchone(f"""
                SELECT od.pack_id as id, min(od.buyer_nickname) as buyer_nickname, ac.name 
                {filter_query}
                GROUP BY ac.id, od.pack_id
            """, filter_values)
            return self.return_success(f"Venda selecionada: #{order['id']} - Vendedor {order['name']} - Comprador {order['buyer_nickname']}")
        elif not confirmed:
            return self.return_success(f"Nenhuma venda elegível selecionada.")

        if filter_total == 0:
            return self.return_success("Nenhuma venda elegivel para a operação.")

        code, message = verify_tool_access(
            self, self.user['id'], accounts_id, tool, filter_total)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        print_label = queue.signature('local_priority:print_label_many')
        print_label.delay(self.user['id'], filter_query,
                          filter_values, accounts_id, self.data['file_type'])

        return self.return_success("Geração de etiqueta iniciada. Confira o andamento em Processos", {})

    @jwt_required
    @prepare
    def labels(self):
        query = f"""
            SELECT 
                mf.id, mf.date_created, mf.date_modified, mf.platform, mf.user_id, mf.name, mf."size", mf.url 
            FROM meuml.marketplace_files mf 
            WHERE mf.user_id = :user_id
        """
        label_files = self.fetchall(query, {'user_id': self.user['id']})

        return self.return_success(data=label_files)

    @jwt_required
    @prepare
    def download_labels(self, labels_file_id):
        response = None

        try:
            file_data = self.fetchone(
                "SELECT * FROM meuml.marketplace_files WHERE id=:id", {'id': labels_file_id})

            if file_data is None:
                self.abort_json({
                    'message': f'Arquivo não encontrado',
                    'status': 'error',
                }, 404)

            bucket_name = 'marketplace-files'
            response = minio_client.get_object(
                bucket_name=bucket_name, object_name=file_data['path'])

            data = response.read()
            content_type = response.getheader('Content-Type')

            return send_file(
                BytesIO(data),
                mimetype=content_type,
                as_attachment=True,
                attachment_filename=file_data['name'])

        except HTTPException:
            raise
        except:
            print(traceback.format_exc())

            self.abort_json({
                'message': f'Erro ao exportar arquivo',
                'status': 'error',
            }, 500)

        finally:
            if response:
                response.close()
                response.release_conn()
