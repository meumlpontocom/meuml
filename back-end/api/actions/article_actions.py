import json
import re
import traceback
from flask import request, redirect, send_file
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.payments.payment_helper import verify_tool_access
from libs.queue.queue import app as queue
from libs.schema.article_schema import NewArticleSchema, ArticleSchema, EditArticleSkuSchema
from os import getenv
from psycopg2.errors import ForeignKeyViolation
from werkzeug.exceptions import HTTPException


class ArticleActions(Actions):
    @jwt_required 
    @prepare
    def index(self):
        try:
            ArticleActions.check_module_permission(self)

            sortable_fields = [
                'ar.id', 'ar.name', 'ar.sku', 'st.qtd_total', 'st.qtd_reserved', 'st.qtd_available', 'ar.is_parent'
            ]

            query = f"""
                SELECT 
                    ar.id,
                    ar.name, 
                    ar.sku,
                    COALESCE(st.qtd_total,0) + COALESCE(sum(vst.qtd_total),0) as qtd_total,
                    COALESCE(st.qtd_reserved,0) + COALESCE(sum(vst.qtd_reserved),0) as qtd_reserved,
                    COALESCE(st.qtd_available,0) + COALESCE(sum(vst.qtd_available),0) as qtd_available,
                    ar.is_parent,
                    ar.has_expiration_date
                FROM stock.article ar
                LEFT JOIN stock.stock st ON st.article_id = ar.id
                LEFT join stock.article var ON var.parent_id = ar.id
                LEFT JOIN stock.stock vst ON vst.article_id = var.id 
                WHERE ar.user_id = :user_id 
            """
            
            additional_condition = ' AND ar.parent_id IS NULL '
            values, query, total = ArticleActions.apply_filter_articles(self, request, query, additional_conditions=additional_condition)
            query = ArticleActions.order(request, sortable_fields, query)
            params, query = self.paginate(request, query)

            articles = self.fetchall(query, values)
            meta = self.generate_meta(params, total)

            return self.return_success(data=articles, meta=meta)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao listar registros',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def get(self, id):
        try:
            ArticleActions.check_module_permission(self)

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
                WHERE ((ar.id = :id AND ar.is_parent IS FALSE) OR ar.parent_id = :id) AND ar.user_id = {self.user['id']} 
                GROUP BY ar.id, wh.id
                ORDER BY ar.id, wh.id
            """
            warehouses = self.fetchall(query, {'id': id})

            query = f"""
                SELECT 
                    ar.id, ar.user_id, ar.parent_id, ar."name", ar.sku, ar.description, ar.date_created, ar.date_modified, ar.has_expiration_date, ar.is_parent,
                    (
                        SELECT json_agg(attr_subquery) 
                        FROM (
                            SELECT aa.field, aa.value 
                            FROM stock.article_attr aa 
                            WHERE aa.article_id = ar.id
                        ) attr_subquery
                    ) as attributes,
                    (
                        SELECT json_agg(img_subquery) 
                        FROM (
                            SELECT 
                                ai.id as article_image_id, ai.is_main_image, 
                                fi.id, fi.date_created, fi.date_modified, 
                                fi."name", fi.content_type, fi."size", 
                                fi.url, fi.thumbnail_url
                            FROM stock.article_images ai 
                            JOIN meuml.files fi ON fi.id = ai.image_id
                            WHERE ai.article_id = ar.id AND fi.is_directory IS FALSE
                        ) img_subquery
                    ) as images
                FROM stock.article ar
                WHERE ar.id = :id AND ar.user_id = {self.user['id']} 
                GROUP BY ar.id
                ORDER BY ar.id
            """
            article = self.fetchone(query, {'id': id})

            if not article:
                self.abort_json({
                    'message': f'Produto não encontrado',
                    'status': 'error',
                }, 404)

            article['qtd_available'] = 0
            article['qtd_reserved'] = 0
            article['qtd_total'] = 0

            query = f"""
                SELECT 
                    ar.id, ar.user_id, ar.parent_id, ar."name", ar.sku, ar.description, ar.date_created, ar.date_modified, ar.has_expiration_date, ar.is_parent,
                    (
                        SELECT json_agg(attr_subquery) 
                        FROM (
                            SELECT aa.field, aa.value 
                            FROM stock.article_attr aa 
                            WHERE aa.article_id = ar.id
                        ) attr_subquery
                    ) as attributes,
                    (
                        SELECT json_agg(img_subquery) 
                        FROM (
                            SELECT 
                                ai.id as article_image_id, ai.is_main_image, 
                                fi.id, fi.date_created, fi.date_modified, 
                                fi."name", fi.content_type, fi."size", 
                                fi.url, fi.thumbnail_url
                            FROM stock.article_images ai 
                            JOIN meuml.files fi ON fi.id = ai.image_id
                            WHERE ai.article_id = ar.id AND fi.is_directory IS FALSE
                        ) img_subquery
                    ) as images
                FROM stock.article ar
                WHERE ar.parent_id = :id AND ar.user_id = {self.user['id']} 
                GROUP BY ar.id
                ORDER BY ar.id
            """
            variations = self.fetchall(query, {'id': id})

            for variation in variations:
                variation['warehouses'] = [warehouse for warehouse in warehouses if warehouse['article_id'] == variation['id']]
            
            article['variations'] = variations
            for variation in article['variations']:
                variation['qtd_available'] = 0
                variation['qtd_reserved'] = 0
                variation['qtd_total'] = 0
                for warehouse in variation['warehouses']:
                    warehouse['qtd_available'] = 0
                    warehouse['qtd_reserved'] = 0
                    warehouse['qtd_total'] = 0
                    for item in warehouse['warehouse_items']:
                        warehouse['qtd_available'] += item['qtd_available'] 
                        warehouse['qtd_reserved'] += item['qtd_reserved']
                        warehouse['qtd_total'] += item['qtd_total']
                    variation['qtd_available'] += warehouse['qtd_available']
                    variation['qtd_reserved'] += warehouse['qtd_reserved']
                    variation['qtd_total'] += warehouse['qtd_total']
                article['qtd_available'] += variation['qtd_available']
                article['qtd_reserved'] += variation['qtd_reserved']
                article['qtd_total'] += variation['qtd_total']

            article['warehouses'] = [warehouse for warehouse in warehouses if warehouse['article_id'] == article['id']]
            for warehouse in article['warehouses']:
                warehouse['qtd_available'] = 0
                warehouse['qtd_reserved'] = 0
                warehouse['qtd_total'] = 0
                for item in warehouse['warehouse_items']:
                    warehouse['qtd_available'] += item['qtd_available'] 
                    warehouse['qtd_reserved'] += item['qtd_reserved']
                    warehouse['qtd_total'] += item['qtd_total']
                article['qtd_available'] += warehouse['qtd_available']
                article['qtd_reserved'] += warehouse['qtd_reserved']
                article['qtd_total'] += warehouse['qtd_total']
            
            return self.return_success(data=article)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao carregar registro',
                'status': 'error',
                'error': traceback.format_exc()
            }, 500)


    @jwt_required 
    @prepare
    def store(self):
        self.validate(NewArticleSchema())

        try:
            ArticleActions.check_module_permission(self)

            sku_list = [article['sku'] for article in self.data['new_article']]
            query = """
                SELECT id
                FROM stock.article ar
                WHERE ar.user_id = :user_id AND ar.sku = ANY(:skus)
            """
            if self.fetchone(query, {'user_id': self.user['id'], 'skus': sku_list}):
                self.abort_json({
                    'message': f'SKU já existente!',
                    'status': 'error',
                }, 400)

            if self.data['article_variation_parent'] and self.data['article_variation_parent']['parent_id']:
                query = """
                    UPDATE stock.article SET is_parent = TRUE
                    WHERE user_id = :user_id AND id = :parent_id AND parent_id IS NULL
                    RETURNING id
                """
                parent_id = self.execute_insert(query, {
                    'user_id': self.user['id'], 
                    'parent_id': self.data['article_variation_parent']['parent_id']
                })

                if not parent_id:
                    self.abort_json({
                        'message': f'Este produto não permite a criação de variações',
                        'status': 'error',
                    }, 400)
            else:
                parent_id = None
            
            query = """
                INSERT INTO stock.article (user_id, parent_id, name, sku, description, has_expiration_date, is_parent) 
                VALUES (:user_id, :parent_id, :name, :sku, :description, :has_expiration_date, :is_parent) 
                RETURNING id
            """
            attribute_query = """
                INSERT INTO stock.article_attr (article_id, field, value) 
                VALUES 
            """
            image_query = """
                INSERT INTO stock.article_images (article_id, image_id, is_main_image) 
                VALUES 
            """

            for new_article in self.data['new_article']:
                values = {
                    'user_id': self.user['id'],
                    'parent_id': parent_id,
                    'name': new_article['name'], 
                    'sku': new_article['sku'],
                    'description': new_article['description'],
                    'has_expiration_date': new_article['has_expiration_date'],
                    'is_parent': False
                }
                article_id = self.execute_insert(query, values)

                attribute_values = []
                for attribute in new_article['attributes']:
                    attribute_values.append(f" ({article_id}, '{attribute['field']}', '{attribute['value']}') ")

                self.execute(attribute_query + ','.join(attribute_values))

                image_values = []
                for image in new_article['images']:
                    image_values.append(f" ({article_id}, {image['id']}, {image['is_main_image']}) ")

                if len(image_values) > 0:
                    self.execute(image_query + ','.join(image_values))

                self.execute(f"""
                    INSERT INTO stock.stock
                    (article_id, qtd_total, qtd_available, qtd_reserved)
                    VALUES({article_id}, 0, 0, 0)
                """)

            return self.return_success("Produto criado com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao criar novo registro',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def update(self, id):
        self.validate(ArticleSchema())

        try:
            ArticleActions.check_module_permission(self)

            query = f"""
                SELECT id 
                FROM stock.article ar
                WHERE ar.user_id = {self.user['id']} AND ar.sku = ('{self.data['sku']}') AND ar.id != {id} 
            """
            if self.fetchone(query):
                self.abort_json({
                    'message': f'SKU já existente!',
                    'status': 'error',
                }, 400)

            query = f"""
                UPDATE stock.article 
                SET date_modified = NOW(), name = :name, description = :description, has_expiration_date = :has_expiration_date 
                WHERE id = {id} AND user_id = {self.user['id']} 
                RETURNING id
            """
            values = {
                'name': self.data['name'], 
                'description': self.data['description'],
                'has_expiration_date': self.data['has_expiration_date'],
            }

            if not self.execute_returning(query, values, raise_exception=True):
                raise Exception

            # Remove atributos não reenviados
            attributes_id = [int(attribute['id']) for attribute in self.data['attributes'] if attribute['id'] is not None]
            if len(attributes_id) > 0:
                attribute_query = """
                    DELETE FROM stock.article_attr
                    WHERE article_id = :article_id AND id != ALL(:attributes_id)
                """
                self.execute(attribute_query, {'article_id': id, 'attributes_id': attributes_id})
            else:
                attribute_query = """
                    DELETE FROM stock.article_attr
                    WHERE article_id = :article_id
                """
                self.execute(attribute_query, {'article_id': id})

            # Atualiza atributos
            for attribute in self.data['attributes']:
                if attribute['id'] is not None:
                    attribute_query = """
                        UPDATE stock.article_attr AS aa SET
                            field = :field,
                            value = :value
                        WHERE aa.id = :attr_id AND aa.article_id = :article_id
                    """
                    self.execute(attribute_query, {
                        'attr_id': attribute['id'],
                        'field': attribute['field'],
                        'value': attribute['value'],
                        'article_id': id
                    })

            # Insere novos atributos
            for attribute in self.data['attributes']:
                if attribute['id'] is None:
                    attribute_query = """
                        INSERT INTO stock.article_attr (article_id, field, value)
                        VALUES (:article_id, :field, :value)
                    """
                    self.execute(attribute_query, {
                        'article_id': id,
                        'field': attribute['field'],
                        'value': attribute['value']
                    })

            # Remove imagens não reenviadas
            images_id = [int(image['id']) for image in self.data['images']]
            if len(images_id) > 0:
                delete_image_query = """
                    DELETE FROM stock.article_images
                    WHERE article_id = :article_id AND image_id != ALL(:images_id)
                """
                self.execute(delete_image_query, {'article_id': id, 'images_id': images_id})
            else:
                delete_image_query = """
                    DELETE FROM stock.article_images
                    WHERE article_id = :article_id
                """
                self.execute(delete_image_query, {'article_id': id})

            # Upsert de imagens da requisição
            image_query = """
                INSERT INTO stock.article_images (article_id, image_id, is_main_image) 
                VALUES 
            """
            for image in self.data['images']:
                image_query_single = """
                    INSERT INTO stock.article_images (article_id, image_id, is_main_image)
                    VALUES (:article_id, :image_id, :is_main_image)
                    ON CONFLICT (article_id, image_id) DO UPDATE SET is_main_image = excluded.is_main_image
                """
                self.execute(image_query_single, {
                    'article_id': id,
                    'image_id': image['id'],
                    'is_main_image': image['is_main_image']
                })

            return self.return_success("Produto atualizado com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao atualizar registro',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def delete(self, id):
        try:
            ArticleActions.check_module_permission(self)

            query = f"""
                DELETE FROM stock.article 
                WHERE id = {id} AND user_id = {self.user['id']} 
                RETURNING id 
            """
            
            if self.execute_returning(query, raise_exception=True):
                return self.return_success("Produto excluído com sucesso")
            else:
                raise Exception
            
        except HTTPException:
            raise
        except ForeignKeyViolation:
            self.abort_json({
                'message': f'Não foi possível excluir o produto pois ele ainda está em uso',
                'status': 'error',
            }, 406)
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao excluir registro',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def stock_by_warehouse(self, id, warehouse_id):
        try:
            ArticleActions.check_module_permission(self)

            query = f"""
                SELECT 
                    sum(sti.qtd_total) as qtd_total, sum(sti.qtd_available) as qtd_available, sum(sti.qtd_reserved) as qtd_reserved
                FROM stock.warehouses wh 
                JOIN stock.stock_item sti ON sti.warehouse_id = wh.id 
                JOIN stock.stock st ON st.id = sti.stock_id
                WHERE wh.id = {warehouse_id} AND st.article_id = {id} AND wh.user_id = {self.user['id']}
            """

            data = self.fetchone(query)

            return self.return_success(data=data)

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
    def edit_sku(self):
        try:
            ArticleActions.check_module_permission(self)
            
            self.validate(EditArticleSkuSchema())

            existing_article = self.fetchone("SELECT id, name FROM stock.article WHERE sku = :new_sku AND user_id = :user_id", {'new_sku': self.data['new_sku'], 'user_id': self.user['id']})
            if existing_article:
                self.abort_json({
                    'message': f'Você já possui um produto com o novo SKU informado! (#{existing_article["id"]} - {existing_article["name"]})',
                    'status': 'error',
                }, 400)
            
            article = self.fetchone("SELECT id, name, is_parent FROM stock.article WHERE id = :id AND user_id = :user_id", {'id': self.data['id'], 'user_id': self.user['id']})            
            if not article:
                self.abort_json({
                    'message': f'Produto não encontrado',
                    'status': 'error',
                }, 404)

            if article['is_parent']:
                query = "UPDATE stock.article SET sku = :sku WHERE id = :id RETURNING id"
                if self.execute_returning(query, {'sku': self.data['new_sku'], 'id': self.data['id']}):
                    return self.return_success(f"SKU interno de produto com variações atualizado com sucesso")
                else:
                    self.abort_json({
                        'message': f'Erro ao atualizar SKU interno de produto com variações',
                        'status': 'error',
                    }, 404)

            tool = self.get_tool('article-sku-edit')
            code, message = verify_tool_access(self, self.user['id'], tool=tool)
            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            article_edit_sku = queue.signature('long_running:article_sku_edit_item')
            article_edit_sku.delay(user_id=self.user['id'], tool=tool, article_id=self.data['id'], new_sku=self.data['new_sku'])
            
            return self.return_success(f"Alteração de SKU do produto iniciada. Confira o andamento em processos")
        

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao listar registros',
                'status': 'error',
            }, 500)
    

    @staticmethod
    def apply_filter_articles(action, request, query='', values={}, additional_conditions=None):
        select_all = bool(int(request.args.get('select_all', 0)))
        total = 0

        if not values:
            filter_values = {'user_id': action.user['id']}
            filter_query = ''

        if 'filter_string' in request.args:
            filter_query += ' AND (UPPER(ar.name) LIKE :filter_string '
            filter_values['filter_string'] = f'%%{request.args["filter_string"].upper()}%%'

            filter_query += ' OR UPPER(ar.sku) LIKE :filter_string_sku) '
            filter_values['filter_string_sku'] = f'%%{request.args["filter_string"].upper()}%%'

        if additional_conditions:
            filter_query += additional_conditions

        count_query = f"""
            SELECT 
                count(ar.id) as count
            FROM stock.article ar
            JOIN stock.stock st on st.article_id = ar.id
            WHERE ar.user_id = :user_id {filter_query}
        """

        try:
            count = action.fetchone(count_query, filter_values)
            total = count['count']

        except Exception as e:
            print(e)

        query += filter_query + 'GROUP BY ar.id, st.id '
        
        return filter_values, query, total


    @staticmethod
    def order(request, fields, query, default_table='ar', join_tables=[], change_default_order=None):
        fields = [field if type(re.search('"(.*)"',field)) is type(None) else re.search('"(.*)"',field).group(1) for field in fields]
        fields = [field[3:] if field[2]=='.' else field for field in fields]
        values = {}

        if 'sort_order' in request.args and request.args['sort_order'] == 'asc':
            values['sort_order'] = 'asc'
        else:
            values['sort_order'] = 'desc'

        if 'sort_name' in request.args and request.args['sort_name'] in fields:
            if values['sort_order'] == 'asc':
                query += f" ORDER BY {request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
            else:
                query += f" ORDER BY {request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
                
        else:
            query += f" ORDER BY {default_table}.id DESC "           

        return query


    @staticmethod
    def check_module_permission(action):
        tool = action.get_tool('article-operations')
        code, message = verify_tool_access(action, action.user['id'], tool=tool, any_account=True) 

        if code != 200:
            action.abort_json({
                'message': message,
                'status': 'error',
            }, code)
