import json
import math
import re
import traceback
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.queue.queue import app as queue
from marshmallow import ValidationError
from workers.helpers import get_tool


class ShopeeOrdersActions(Actions):
    @jwt_required
    @prepare
    def index(self):
        """
        SELECT od.id, od.account_id, od.create_time, od.update_time, od.country, od.currency, od.cod, od.tracking_no, od.days_to_ship, od.recipient_address_name, od.recipient_address_phone, od.recipient_address_town, od.recipient_address_district, od.recipient_address_city, od.recipient_address_state, od.recipient_address_country, od.recipient_address_zipcode, od.recipient_address_full_address, od.estimated_shipping_fee, od.actual_shipping_cost, od.total_amount, od.escrow_amount, od.order_status, od.shipping_carrier, od.payment_method, od.goods_to_declare, od.message_to_seller, od.note, od.note_update_time, od.pay_time, od.dropshipper, od.credit_card_number, od.buyer_username, od.dropshipper_phone, od.ship_by_date, od.is_split_up, od.buyer_cancel_reason, od.cancel_by, od.fm_tn, od.cancel_reason, od.escrow_tax, od.is_actual_shipping_fee_confirmed, od.buyer_cpf_id, od.order_flag, od.lm_tn
FROM shopee.orders od;


SELECT oi.id, oi.order_id, oi.item_id, oi.item_name, oi.item_sku, oi.variation_id, oi.variation_name, oi.variation_sku, oi.variation_quantity_purchased, oi.variation_original_price, oi.variation_discounted_price, oi.is_wholesale, oi.weight, oi.is_add_on_deal, oi.is_main_item, oi.add_on_deal_id, oi.promotion_type, oi.promotion_id
FROM shopee.order_items oi;

        """


        fields = [
            'od.id', 'od.account_id', 'od.create_time', 'od.update_time', 'od.country', 'od.currency', 
            'od.cod', 'od.tracking_no', 'od.days_to_ship', 'od.recipient_address_name', 'od.recipient_address_phone', 
            'od.recipient_address_town', 'od.recipient_address_district', 'od.recipient_address_city', 
            'od.recipient_address_state', 'od.recipient_address_country', 'od.recipient_address_zipcode', 
            'od.recipient_address_full_address', 'od.estimated_shipping_fee', 'od.actual_shipping_cost', 
            'od.total_amount', 'od.escrow_amount', 'od.order_status', 'od.shipping_carrier', 'od.payment_method',
            'od.goods_to_declare', 'od.message_to_seller', 'od.note', 'od.note_update_time', 'od.pay_time', 
            'od.dropshipper', 'od.credit_card_number', 'od.buyer_username', 'od.dropshipper_phone', 'od.ship_by_date', 
            'od.is_split_up', 'od.buyer_cancel_reason', 'od.cancel_by', 'od.fm_tn', 'od.cancel_reason', 
            'od.escrow_tax', 'od.is_actual_shipping_fee_confirmed', 'od.buyer_cpf_id', 'od.order_flag', 'od.lm_tn'
        ]

        query = f"""
            SELECT {",".join(fields)}, jsonb_agg(items.*) AS items 
            FROM shopee.orders od
            JOIN shopee.accounts ac ON ac.id = od.account_id
            JOIN
                (
                    SELECT oi.*, ad.images::json
                    FROM shopee.order_items oi 
                    LEFT JOIN shopee.advertisings ad ON ad.id = oi.item_id 
                ) items ON items.order_id = od.id
        """
        values = {'user_id': self.user['id']}

        values, query, total, *_ = ShopeeOrdersActions.apply_filter(self, request, query)
        query = ShopeeOrdersActions.order(request, fields, query)
        params, query = self.paginate(request, query)

        try:
            data = self.fetchall(query, values)

        except Exception:
            print(traceback.format_exc())
            self.abort_json({
                'message': f'Erro ao localizar registros.',
                'status': 'error',
            }, 400)

        if total == 0:
            return self.return_success('Nenhuma venda localizada.', {})
        
        meta = self.generate_meta(params, total)

        return self.return_success(data=data, meta=meta)


    @staticmethod
    def apply_filter(action, request, query='', values=None, additional_conditions=None, ids=None):
        select_all = bool(int(request.args.get('select_all', 0)))
        total = 0
        filter_query = ' WHERE ac.internal_status = 1 AND ac.user_id=:user_id '
        filter_values = values if values else {'user_id': action.user['id']}

        k = query.find('FROM')
        if k == -1:
            count_query = """
                SELECT count(distinct od.id)
                FROM shopee.orders od
                JOIN shopee.accounts ac ON ac.id = od.account_id
                JOIN
                    (
                        SELECT oi.*, ad.images::json
                        FROM shopee.order_items oi 
                        LEFT JOIN shopee.advertisings ad ON ad.id = oi.item_id 
                    ) items ON items.order_id = od.id
            """
        else:
            count_query = 'SELECT count(distinct od.id) ' + query[k:]

        if not ids:
            ids = request.form.get('ids',[]) if len(request.form.get('ids',[])) > 0 else request.args.get('ids',[])
        
        if ids and len(ids) > 0:
            if select_all is False:   
                filter_query += f' AND od.id IN ({ids}) '
            else:
                filter_query += f' AND od.id NOT IN ({ids}) '

        if 'filter_status' in request.args:
            selected_status = request.args["filter_status"].split(',')
            if len(selected_status) > 0: 
                filter_query += ' AND od.order_status IN ('
                for i, status in enumerate(selected_status, 1):
                    filter_values['filter_status'+str(i)] = status
                    filter_query += ':filter_status'+str(i)+','
                filter_query = filter_query[:-1] + ') '
            
        if 'filter_account' in request.args:            
            accounts = request.args["filter_account"].split(',')
            if len(accounts) > 0 and accounts[0].isdigit(): 
                filter_query += ' AND od.account_id IN ('
                for i, account in enumerate(accounts,1):
                    if account.isdigit():
                        filter_values['filter_account'+str(i)] = int(account)
                        filter_query += ':filter_account'+str(i)+','
                filter_query = filter_query[:-1] + ') '

        if 'filter_string' in request.args and len(request.args['filter_string']) > 0:
            filter_query += """ 
                AND (
                    od.id LIKE :search_string 
                    OR UPPER(od.buyer_username) LIKE :search_string 
                    OR UPPER(od.recipient_address_name) LIKE :search_string 
                    OR od.id IN ( 
                        SELECT oi2.order_id 
                        FROM shopee.order_items oi2 
                        WHERE oi2.order_id = od.id AND UPPER(oi2.item_name) LIKE :search_string
                    ) 
                )  
            """
            filter_values['search_string'] = f"%%{request.args['filter_string'].upper()}%%"

        if additional_conditions:
            filter_query += additional_conditions

        try:
            count = action.fetchall(count_query + filter_query + ' GROUP BY od.id ', filter_values)
            filter_query += ' GROUP BY od.id '
            total = len(count)

        except Exception as e:
            print(e)

        query += filter_query

        return filter_values, query, total


    @staticmethod
    def order(request, fields, query, default_table='od', join_tables=[], change_default_order=None):
        fields = [field if type(re.search('"(.*)"',field)) is type(None) else re.search('"(.*)"',field).group(1) for field in fields]
        fields = [field[3:] if field[2]=='.' else field for field in fields]
        values = {}

        if 'sort_order' in request.args and request.args['sort_order'] == 'asc':
            values['sort_order'] = 'asc'
        else:
            values['sort_order'] = 'desc'

        if 'sort_name' in request.args and request.args['sort_name'] in fields:
            if values['sort_order'] == 'asc':
                query += f" ORDER BY {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
            else:
                query += f" ORDER BY ({default_table}.{request.args['sort_name']} IS NULL), {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
                
        else:
            query += f" ORDER BY {default_table}.update_time DESC "           

        return query
