import json
import random
import re
import string
import traceback
from flask import request, redirect, send_file
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.payments.payment_helper import verify_tool_access
from libs.queue.queue import app as queue
from libs.schema.stock_schema import StockSchema, StockInSchema, StockOutSchema
from os import getenv
from werkzeug.exceptions import HTTPException
from workers.tasks.stock_operations import decrease_stock

class StockActions(Actions):
    @jwt_required 
    @prepare
    def get(self, article_id):
        try:
            StockActions.check_module_permission(self)

            query = f"""
                SELECT 
                    wh.id as warehouse_id, 
                    wh.code as warehouse_code, 
                    wh."name" as warehouse_name, 
                    wh.is_default as warehouse_is_default,
                    json_agg(
                        json_build_object(
                            'id', si.id,
                            'price_buy', si.price_buy,
                            'qtd_total', si.qtd_total,
                            'qtd_reserved', si.qtd_reserved,
                            'qtd_available', si.qtd_available, 
                            'expiration_date', si.expiration_date
                        )
                    ) as warehouse_items,
                    ar.id as article_id
                FROM stock.article ar 
                JOIN stock.stock st on st.article_id = ar.id
                JOIN stock.stock_item si on si.stock_id = st.id AND si.qtd_total > 0
                JOIN stock.warehouses wh on wh.id = si.warehouse_id 
                WHERE ((ar.id = :id AND ar.is_parent IS FALSE) OR ar.parent_id = :id) AND ar.user_id = :user_id
                GROUP BY ar.id, wh.id
                ORDER BY ar.id, wh.id
            """

            warehouses = self.fetchall(query, {'id': article_id, 'user_id': self.user['id']})
            
            if not warehouses:
                self.abort_json({
                    'message': f'Este produto não possui estoque',
                    'status': 'error',
                }, 404)

            for warehouse in warehouses:
                warehouse['qtd_available'] = 0
                warehouse['qtd_reserved'] = 0
                warehouse['qtd_total'] = 0

                for item in warehouse['warehouse_items']:
                    warehouse['qtd_available'] += item['qtd_available'] 
                    warehouse['qtd_reserved'] += item['qtd_reserved']
                    warehouse['qtd_total'] += item['qtd_total']

            return self.return_success(data=warehouses)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao carregar registro',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def increase(self, article_id):
        self.validate(StockInSchema())

        try:
            StockActions.check_module_permission(self)

            query = """
                SELECT id, is_parent, sku
                FROM stock.article
                WHERE id = :id
            """
            article = self.fetchone(query, {'id': article_id})

            if not article or article['is_parent']:
                self.abort_json({
                    'message': f'Produto não permite operações de estoque',
                    'status': 'error',
                }, 400)

            query = f"""
                INSERT INTO stock.stock_in (article_id, warehouse_id, quantity, price_buy, expiration_date, buy_id) 
                VALUES (:article_id, :warehouse_id, :quantity, :price_buy, :expiration_date, :buy_id) 
                RETURNING id
            """
            buy_id = self.data['buy_id'] if self.data['buy_id'] else ''.join(random.choices(string.ascii_uppercase + string.digits, k=20))
            values = {
                'article_id': article_id,
                'warehouse_id': self.data['warehouse_id'],
                'quantity': self.data['quantity'],
                'price_buy': self.data['price_buy'],
                'expiration_date': self.data['expiration_date'],
                'buy_id': buy_id, 
            }
            stock_in =  self.execute_insert(query, values)
 
            if not stock_in:
                raise Exception

            query = """
                UPDATE stock.stock SET
                    date_modified = NOW(),
                    qtd_total = qtd_total + :quantity,
                    qtd_available = qtd_available + :quantity
                WHERE article_id = :article_id
                RETURNING id
            """
            stock_id = self.execute_returning(query, {'quantity': self.data['quantity'], 'article_id': article_id})

            if not stock_id:
                self.conn.rollback()
                raise Exception

            query = """
                INSERT INTO stock.stock_item (stock_id, warehouse_id, expiration_date, price_buy, qtd_total, qtd_reserved, qtd_available)
                VALUES (:stock_id, :warehouse_id, :expiration_date, :price_buy, :qtd_total, :qtd_reserved, :qtd_available)
                RETURNING id
            """    
            values = {
                'stock_id': stock_id,
                'warehouse_id': self.data['warehouse_id'],
                'expiration_date': self.data['expiration_date'],
                'price_buy': self.data['price_buy'],
                'qtd_total': self.data['quantity'],
                'qtd_reserved': 0,
                'qtd_available': self.data['quantity'],
            }

            if not self.execute_insert(query, values):
                self.conn.rollback()
                raise Exception

            increase_message = f"Compra de código #{buy_id} com {self.data['quantity']} itens de SKU \"{article['sku']}\""
            increase_stock_mercadolibre = queue.signature('long_running:increase_stock_mercadolibre')
            increase_stock_mercadolibre.delay(sku=article['sku'], quantity=self.data['quantity'], increase_message=increase_message, user_id=self.user['id'])
            increase_stock_shopee = queue.signature('long_running:increase_stock_shopee')
            increase_stock_shopee.delay(sku=article['sku'], quantity=self.data['quantity'], increase_message=increase_message, user_id=self.user['id'])
            
            return self.return_success(f"Entrade de Estoque #{buy_id} registrada com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao atualizar Estoque',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def decrease(self, article_id):
        self.validate(StockOutSchema())

        try:
            StockActions.check_module_permission(self)
            
            query = """
                SELECT ar.id, st.id as stock_id, ar.has_expiration_date, ar.is_parent, ar.sku 
                FROM stock.article ar 
                JOIN stock.stock st ON st.article_id = ar.id 
                WHERE ar.id = :id 
            """
            article = self.fetchone(query, {'id': article_id})

            if not article:
                self.abort_json({
                    'message': "Produto não encontrado",
                    'status': 'error',
                }, 404)

            if article['is_parent']:
                self.abort_json({
                    'message': f'Produto não permite operações de estoque',
                    'status': 'error',
                }, 400)

            query = f"""
                SELECT wh.id 
                FROM stock.warehouses wh 
                WHERE wh.id = :id
            """
            warehouse = self.fetchone(query, {'id': self.data['warehouse_id']})

            if not warehouse:
                self.abort_json({
                    'message': "Estoque não encontrado",
                    'status': 'error',
                }, 404)

            stock_items = None
            if article['has_expiration_date'] and not self.data['stock_item_id']:
                self.abort_json({
                    'message': "Produtos com validade devem ser selecionados manualmente",
                    'status': 'error',
                }, 400)
            elif article['has_expiration_date']:
                query = f"""
                    SELECT si.id, si.qtd_available, si.expiration_date 
                    FROM stock.stock_item si 
                    WHERE si.qtd_available > {self.data['quantity']} AND si.id = :id 
                    ORDER BY si.expiration_date ASC, si.date_created ASC  
                """
                stock_items = self.fetchall(query, {'id': self.data['stock_item_id']})

                if not stock_items or len(stock_items) == 0:
                    self.abort_json({
                        'message': "Estoque disponível não suficiente",
                        'status': 'error',
                    }, 400)

            sell_id = self.data['sell_id'] if self.data['sell_id'] else ''.join(random.choices(string.ascii_uppercase + string.digits, k=20))
            details = {
                'sku': article['sku'],
                'quantity': self.data['quantity'],
                'price_sell': float(self.data['price_sell']),
                'sell_id': sell_id,
                'order_status': 'MANUAL',
                'advertising_id': None,
                'variation_id': None,
            }

            message, status_code = decrease_stock(self.user['id'], self.data['account_id'], self.data['marketplace_id'], details, article, warehouse, stock_items, self.conn)         

            if status_code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, status_code)

            return self.return_success(message)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao atualizar Estoque',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def operations(self):
        try:
            StockActions.check_module_permission(self)
            
            query = """
                SELECT ar.name, ar.sku, mp.name as marketplace_name, wh.code as warehouse_code, wh.name as warehouse_name, op.*
                FROM (
                    SELECT 
                        'IN' as operation_type,
                        si.id, 
                        si.date_created, 
                        si.date_modified,
                        si.article_id, 
                        si.warehouse_id, 
                        si.quantity, 
                        si.price_buy as price, 
                        si.buy_id as buy_sell_id,
                        si.expiration_date, 
                        null as marketplace_id, 
                        null as account_id, 
                        null as order_status
                    FROM stock.stock_in si
                    UNION
                    SELECT 
                        'OUT' as operation_type,
                        so.id, 
                        so.date_created, 
                        so.date_modified, 
                        so.article_id, 
                        so.warehouse_id, 
                        so.quantity, 
                        so.price_sell as price,
                        so.sell_id as buy_sell_id, 
                        null as expiration_date, 
                        so.marketplace_id, 
                        so.account_id, 
                        so.order_status
                    FROM stock.stock_out so
                ) as op
                JOIN stock.article ar ON ar.id = op.article_id AND ar.is_parent IS FALSE
                JOIN stock.warehouses wh ON wh.id = op.warehouse_id
                LEFT JOIN stock.marketplaces mp ON mp.id = op.marketplace_id
                WHERE ar.user_id = :user_id
            """

            values, query, total = self.apply_filter(request, query)
            query += ' ORDER BY op.date_modified DESC '
            params, query = self.paginate(request, query)

            data = self.fetchall(query, values)
            meta = self.generate_meta(params, total)

            return self.return_success(data=data, meta=meta)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao atualizar Estoque',
                'status': 'error',
            }, 500)


    def apply_filter(self, request, query='', values={}, additional_conditions=None):
        total = 0

        count_query = """
            SELECT count(op.id) as count
                FROM (
                    SELECT 
                        'IN' as operation_type,
                        si.id, 
                        si.date_created, 
                        si.date_modified,
                        si.article_id, 
                        si.warehouse_id, 
                        si.quantity, 
                        si.price_buy as price, 
                        si.buy_id as buy_sell_id,
                        si.expiration_date, 
                        null as marketplace_id, 
                        null as account_id, 
                        null as order_status
                    FROM stock.stock_in si
                    UNION
                    SELECT 
                        'OUT' as operation_type,
                        so.id, 
                        so.date_created, 
                        so.date_modified, 
                        so.article_id, 
                        so.warehouse_id, 
                        so.quantity, 
                        so.price_sell as price,
                        so.sell_id as buy_sell_id, 
                        null as expiration_date, 
                        so.marketplace_id, 
                        so.account_id, 
                        so.order_status
                    FROM stock.stock_out so
                ) as op
                JOIN stock.article ar ON ar.id = op.article_id
                WHERE ar.user_id = :user_id
        """

        if not values:
            filter_values = {'user_id': self.user['id']}
            filter_query = ''

        if 'filter_article_id' in request.args and request.args['filter_article_id']:
            filter_query += ' AND ar.id = :filter_article_id '
            filter_values['filter_article_id'] = request.args["filter_article_id"]

        if 'filter_string' in request.args and request.args['filter_string']:
            filter_query += ' AND (UPPER(ar.name) LIKE :filter_string '
            filter_values['filter_string'] = f'%%{request.args["filter_string"].upper()}%%'

            filter_query += ' OR UPPER(ar.sku) LIKE :filter_string_sku) '
            filter_values['filter_string_sku'] = f'%%{request.args["filter_string"].upper()}%%'

        if additional_conditions:
            filter_query += additional_conditions

        try:
            count = self.fetchone(count_query + filter_query, filter_values)
            total = count['count']

        except Exception as e:
            print(e)

        query += filter_query
        
        return filter_values, query, total


    @staticmethod
    def check_module_permission(action):
        tool = action.get_tool('article-operations')
        code, message = verify_tool_access(action, action.user['id'], tool=tool, any_account=True) 

        if code != 200:
            action.abort_json({
                'message': message,
                'status': 'error',
            }, code)
