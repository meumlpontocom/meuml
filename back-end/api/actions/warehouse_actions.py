import json
import traceback
from flask import request, redirect, send_file
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.payments.payment_helper import verify_tool_access
from libs.queue.queue import app as queue
from libs.schema.warehouse_schema import WarehouseSchema, AccountWarehouseSchema
from os import getenv
from psycopg2.errors import ForeignKeyViolation
from werkzeug.exceptions import HTTPException


class WarehouseActions(Actions):
    @jwt_required 
    @prepare
    def index(self):
        try:
            WarehouseActions.check_module_permission(self)

            query = f"""
                SELECT id, code, name, is_default 
                FROM stock.warehouses 
                WHERE user_id = {self.user['id']}
            """
            
            data = self.fetchall(query)

            return self.return_success("Armazéns listados com sucesso", data=data)

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
    def store(self):
        self.validate(WarehouseSchema())

        try:
            WarehouseActions.check_module_permission(self)

            query = """
                INSERT INTO stock.warehouses (user_id, name, code, is_default) 
                VALUES (:user_id, :name, :code, :is_default)
                RETURNING id
            """
            values = {
                'user_id': self.user['id'],
                'name': self.data['name'], 
                'code': self.data['code'],
                'is_default': self.data['is_default']
            }
            inserted_id = self.execute_returning(query, values)

            if inserted_id and self.data['is_default']:
                query = """
                    UPDATE stock.warehouses
                    SET is_default = FALSE 
                    WHERE user_id = :user_id AND is_default = TRUE AND id != :id
                """
                values = {
                    'user_id': self.user['id'],
                    'id': inserted_id
                }
                self.execute(query, values)

            return self.return_success("Armazém criado com sucesso")

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
        self.validate(WarehouseSchema())

        try:
            WarehouseActions.check_module_permission(self)

            query = f"""
                UPDATE stock.warehouses 
                SET date_modified = NOW(), name = :name, code = :code  
                WHERE id = {id} AND user_id = {self.user['id']}
            """
            values = {
                'name': self.data['name'], 
                'code': self.data['code']
            }
            
            self.execute(query, values)

            return self.return_success("Armazém atualizado com sucesso")

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
            WarehouseActions.check_module_permission(self)

            query = f"""
                DELETE FROM stock.warehouses   
                WHERE id = {id} AND user_id = {self.user['id']} AND is_default IS NOT TRUE
                RETURNING id 
            """
            
            if self.execute_returning(query, raise_exception=True):
                return self.return_success("Armazém excluído com sucesso")
            else:
                raise Exception
            
        except HTTPException:
            raise
        except ForeignKeyViolation:
            self.abort_json({
                'message': f'Não foi possível excluir o armazém pois ele ainda está em uso',
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
    def make_warehouse_default(self, id):
        self.validate(AccountWarehouseSchema())

        try:
            WarehouseActions.check_module_permission(self)

            query = f"""
                SELECT * 
                FROM stock.account_warehouse aw 
                WHERE aw.user_id = {self.user['id']}
            """
            accounts_warehouse = self.fetchall(query)

            for account_warehouse in accounts_warehouse:
                if self.data['marketplace_id'] == account_warehouse['marketplace_id'] and self.data['account_id'] == account_warehouse['account_id']:
                    query = """
                        UPDATE stock.account_warehouse SET
                            date_modified = NOW(), marketplace_id =  :marketplace_id, account_id = :account_id, warehouse_id = :warehouse_id
                        WHERE id = :id
                        RETURNING id
                    """
                    values = {
                        'marketplace_id': self.data['marketplace_id'], 
                        'account_id': self.data['account_id'],
                        'warehouse_id': id,
                        'id': account_warehouse['id'],
                    }
                    if self.execute_returning(query, values):
                        return self.return_success("Armazém padrão atualizado com sucesso")
                    else:
                        raise Exception
                    break
            else:
                query = """
                    INSERT INTO stock.account_warehouse (user_id, marketplace_id, account_id, warehouse_id) 
                    VALUES (:user_id, :marketplace_id, :account_id, :warehouse_id) 
                    RETURNING id
                """
                values = {
                    'user_id': self.user['id'],
                    'marketplace_id': self.data['marketplace_id'], 
                    'account_id': self.data['account_id'],
                    'warehouse_id': id,
                }
                if self.execute_returning(query, values):
                    return self.return_success("Armazém padrão definido com sucesso")
                else:
                    raise Exception
        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao definir armazém como padrão',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def make_warehouse_user_default(self, id):
        try: 
            WarehouseActions.check_module_permission(self)

            query = """
                UPDATE stock.warehouses
                SET is_default = TRUE
                WHERE user_id = :user_id AND id = :id
                RETURNING id
            """
            values = {
                'user_id': self.user['id'],
                'id': id
            }
            updated_id = self.execute_returning(query, values)
            
            if updated_id:
                query = """
                    UPDATE stock.warehouses
                    SET is_default = FALSE 
                    WHERE user_id = :user_id AND is_default = TRUE AND id != :id
                """
                values = {
                    'user_id': self.user['id'],
                    'id': updated_id
                }
                self.execute(query, values)

                return self.return_success("Armazém padrão do usuário definido com sucesso")
            else:
                raise Exception
        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao definir armazém como padrão do usuário',
                'status': 'error',
            }, 500)


    @staticmethod
    def check_module_permission(action):
        tool = action.get_tool('article-operations')
        code, message = verify_tool_access(action, action.user['id'], tool=tool, any_account=True) 

        if code != 200:
            action.abort_json({
                'message': message,
                'status': 'error',
            }, code)
