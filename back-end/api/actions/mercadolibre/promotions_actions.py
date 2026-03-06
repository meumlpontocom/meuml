import re
import traceback
from flask import request
from flask_jwt_simple import jwt_required
import requests
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.enums.access_type import AccessType   
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from libs.payments.payment_helper import verify_tool_access
from libs.schema.promotions_schema import PromotionItemSchema
from math import ceil
from werkzeug.exceptions import HTTPException
from workers.loggers import create_process, create_process_item
from workers.tasks.mercadolibre.promotions_apply import promotion_apply_item
from workers.tasks.mercadolibre.promotions_remove import promotion_remove_item

class PromotionsActions(Actions):
    @jwt_required 
    @prepare
    def all_promotions(self):
        try:
            sortable_fields = [
                'pr.id', 'pr.external_id', 'promotion_type', 'pr.status', 
                'pr.name', 'pr.start_date', 'pr.finish_date', 'pr.deadline_date'
            ]

            query = f"""
                SELECT 
                    pr.id, pr.external_id, pr.account_id, 
                    ac.name as account_name, pr.promotion_type_id, 
                    pt.key as promotion_key, pt.name as promotion_type, 
                    pr.status, pr.name, pr.start_date, pr.finish_date, 
                    pr.deadline_date, pr.benefits, pr.offers
                FROM meuml.promotions pr
                JOIN meuml.promotion_types pt ON pt.id = pr.promotion_type_id
                JOIN meuml.accounts ac ON ac.id = pr.account_id
                WHERE ac.status = 1 AND ac.user_id = :user_id 
            """
            
            values, query, total = PromotionsActions.apply_filter_promotions(self, request, query)
            query = PromotionsActions.order(request, sortable_fields, query)

            promotions = self.fetchall(query, values)

            return self.return_success(data=promotions)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro carregar promoções disponíveis ao vendedor',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def promotions(self):
        try:
            sortable_fields = [
                'pr.id', 'pr.external_id', 'promotion_type', 'pr.status', 
                'pr.name', 'pr.start_date', 'pr.finish_date', 'pr.deadline_date'
            ]

            query = f"""
                SELECT 
                    pr.id, pr.external_id, pr.account_id, 
                    ac.name as account_name, pr.promotion_type_id, 
                    pt.key as promotion_key, pt.name as promotion_type, 
                    pr.status, pr.name, pr.start_date, pr.finish_date, 
                    pr.deadline_date, pr.benefits, pr.offers
                FROM meuml.promotions pr
                JOIN meuml.promotion_types pt ON pt.id = pr.promotion_type_id
                JOIN meuml.accounts ac ON ac.id = pr.account_id
                WHERE ac.status = 1 AND ac.user_id = :user_id 
            """
            
            values, query, total = PromotionsActions.apply_filter_promotions(self, request, query)
            query = PromotionsActions.order(request, sortable_fields, query)
            params, query = self.paginate(request, query)

            promotions = self.fetchall(query, values)
            meta = self.generate_meta(params, total)

            return self.return_success(data=promotions, meta=meta)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro carregar promoções disponíveis ao vendedor',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def apply_promotion(self):
        try:
            self.validate(PromotionItemSchema())

            if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
                self.abort_json({
                    'message':'Preencha o parâmetro de confirmação.',
                    'status':'error',
                }, 400)
            else:
                confirmed = True if request.args.get('confirmed','0') == '1' else False

            promotion = self.fetchone("""
                SELECT pr.external_id as id, pr.id as internal_id, pr.account_id, pt.key as promotion_type 
                FROM meuml.promotions pr 
                JOIN meuml.promotion_types pt ON pt.id = pr.promotion_type_id 
                JOIN meuml.accounts ac ON ac.id = pr.account_id 
                WHERE pr.id = :promotion_id AND ac.user_id = :user_id AND ac.status = 1
            """, {'promotion_id': self.data['promotion_id'], 'user_id': self.user['id']})

            if not promotion:
                self.abort_json({
                    'message':'Promoção não encontrada.',
                    'status':'error',
                }, 404)

            if promotion['promotion_type'] in ['DEAL', 'DOD', 'LIGHTNING'] and \
            (not self.data.get('options') or self.data['options'].get('discount_value') is None or self.data['options'].get('is_discount_value_percentage') is None):
                self.abort_json({
                    'message':f'Promoção tipo {promotion["name"]} exige que seja informado o valor de desconto.',
                    'status':'error',
                }, 400)

            is_single = self.is_single_advertising(request)
            if is_single:
                tool = self.get_tool('promotion-apply-item-single')
            else:
                tool = self.get_tool('promotion-apply-item')
        
            subscription_required = tool['access_type'] == AccessType.subscription
            advertisings_id = ','.join([advertising_id for advertising_id in self.data['advertisings_id']])
            additional_conditions = f""" 
                AND ac.id = {promotion['account_id']} 
                AND EXISTS (SELECT 1 FROM meuml.promotion_advertisings pa_apply WHERE pa_apply.advertising_id = ad.external_id AND pa_apply.promotion_id = {promotion['internal_id']}) 
            """ 
            filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(request, additional_conditions=additional_conditions, subscription_required=subscription_required, mass_operation=True, advertisings_id=advertisings_id)

            if not confirmed and filter_total>1:
                return self.return_success(f"A operação modificará: {filter_total} anúncios")
            elif not confirmed and filter_total==1:
                advertising = self.fetchone("SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
                return self.return_success(f"A operação modificará o anúncio {advertising['external_id']} - {advertising['title']}")
            elif not confirmed:
                return self.return_success(f"A operação não modificará nenhum anúncio")

            if filter_total == 0:
                return self.return_success("Nenhum produto elegivel para alteração.")

            code, message = verify_tool_access(self, self.user['id'], accounts_id, tool, filter_total)

            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            elif filter_total > 1:
                promotion_apply_many = queue.signature('local_priority:promotion_apply_many')
                promotion_apply_many.delay(self.user['id'], filter_query, filter_values, self.data['promotion_id'], self.data['options'])
                return self.return_success("Aplicação de promoção em massa iniciada. Confira o andamento em Processos", {})

            else:
                advertising = self.fetchone("SELECT external_id, title, account_id FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
                
                if not advertising:
                    self.abort_json({
                        'message': f'Anúncio não encontrado',
                        'status': 'error',
                    })

                process_id = create_process(account_id=advertising['account_id'], user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self)
                process_item_id = create_process_item(process_id, advertising['account_id'], advertising['external_id'], self)
                status_code, message = promotion_apply_item(account=None, process_item_id=process_item_id, advertising=advertising, promotion=promotion, options=self.data['options'], conn=self.conn)

                if status_code != 200:
                    self.abort_json({
                        'message': message,
                        'status': 'error',
                    }, 400) 
                 
                return self.return_success(f"Aplicação de promoção concluída.")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro iniciar aplicação de promoção',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def remove_promotion(self):
        try:
            self.validate(PromotionItemSchema())

            if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
                self.abort_json({
                    'message':'Preencha o parâmetro de confirmação.',
                    'status':'error',
                }, 400)
            else:
                confirmed = True if request.args.get('confirmed','0') == '1' else False

            promotion = self.fetchone("""
                SELECT pr.external_id as id, pr.id as internal_id, pr.account_id, pt.key as promotion_type 
                FROM meuml.promotions pr 
                JOIN meuml.promotion_types pt ON pt.id = pr.promotion_type_id 
                JOIN meuml.accounts ac ON ac.id = pr.account_id 
                WHERE pr.id = :promotion_id AND ac.user_id = :user_id
            """, {'promotion_id': self.data['promotion_id'], 'user_id': self.user['id']})

            if not promotion:
                self.abort_json({
                    'message':'Promoção não encontrada.',
                    'status':'error',
                }, 404)

            is_single = self.is_single_advertising(request)
            if is_single:
                tool = self.get_tool('promotion-remove-item-single')
            else:
                tool = self.get_tool('promotion-remove-item')

            subscription_required = tool['access_type'] == AccessType.subscription
            advertisings_id = ','.join([advertising_id for advertising_id in self.data['advertisings_id']])
            additional_conditions = f""" 
                AND ac.id = {promotion['account_id']} 
                AND EXISTS (SELECT 1 FROM meuml.promotion_advertisings pa_remove WHERE pa_remove.advertising_id = ad.external_id AND pa_remove.promotion_id = {promotion['internal_id']}) 
            """ 
            filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(request, additional_conditions=additional_conditions, subscription_required=subscription_required, mass_operation=True, advertisings_id=advertisings_id)

            if not confirmed and filter_total>1:
                return self.return_success(f"A operação modificará: {filter_total} anúncios")
            elif not confirmed and filter_total==1:
                advertising = self.fetchone("SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
                return self.return_success(f"A operação modificará o anúncio {advertising['external_id']} - {advertising['title']}")
            elif not confirmed:
                return self.return_success(f"A operação não modificará nenhum anúncio")

            if filter_total == 0:
                return self.return_success("Nenhum produto elegivel para alteração.")

            code, message = verify_tool_access(self, self.user['id'], accounts_id, tool, filter_total)

            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            elif filter_total > 1:
                promotion_apply_many = queue.signature('local_priority:promotion_apply_many')
                promotion_apply_many.delay(self.user['id'], filter_query, filter_values, self.data['promotion_id'], self.data['options'])
                return self.return_success("Remoção de promoção em massa iniciada. Confira o andamento em Processos", {})

            else:
                advertising = self.fetchone("SELECT external_id, title, account_id FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
                
                if not advertising:
                    self.abort_json({
                        'message': f'Anúncio não encontrado',
                        'status': 'error',
                    })

                process_id = create_process(account_id=advertising['account_id'], user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self)
                process_item_id = create_process_item(process_id, advertising['account_id'], advertising['external_id'], self)
                status_code, message = promotion_apply_item(account=None, process_item_id=process_item_id, advertising=advertising, promotion=promotion, options=self.data['options'], conn=self.conn)

                if status_code != 200:
                    self.abort_json({
                        'message': message,
                        'status': 'error',
                    }, 400) 
                 
                return self.return_success(f"Remoção de promoção concluída.")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro iniciar remoção de promoção',
                'status': 'error',
            }, 500)


    @staticmethod
    def apply_filter_promotions(action, request, query='', filter_query = '', values={}, additional_conditions=None):
        total = 0

        count_query = """
            SELECT count(pr.id) as count
            FROM meuml.promotions pr
            JOIN meuml.promotion_types pt ON pt.id = pr.promotion_type_id
            JOIN meuml.accounts ac ON ac.id = pr.account_id
            WHERE ac.status = 1 AND ac.user_id = :user_id 
        """

        if not values:
            filter_values = {'user_id': action.user['id']}

        if 'filter_account' in request.args and len(request.args['filter_account']) > 0:
            filter_query += ' AND pr.account_id IN ('
            d, query_list = action.string_to_dict(request.args['filter_account'], 'account')
            filter_values.update(d)
            filter_query += query_list

        if 'filter_promotion_type' in request.args and len(request.args['filter_promotion_type']) > 0:
            filter_query += ' AND pt.key IN ('
            d, query_list = action.string_to_dict(request.args['filter_promotion_type'], 'promotion_type')
            filter_values.update(d)
            filter_query += query_list
        
        if 'filter_status' in request.args and len(request.args['filter_status']) > 0:
            filter_query += ' AND pr.status IN ('
            d, query_list = action.string_to_dict(request.args['filter_status'], 'status')
            filter_values.update(d)
            filter_query += query_list

        if 'filter_string' in request.args and len(request.args['filter_string']) > 0:
            filter_query += ' AND (UPPER(pr.name) LIKE :filter_string_name '
            filter_values['filter_string_name'] = f'%%{request.args["filter_string"].upper()}%%'

            filter_query += ' OR UPPER(pr.external_id) LIKE :filter_string_id) '
            filter_values['filter_string_id'] = f'%%{request.args["filter_string"].upper()}%%'

        if additional_conditions:
            filter_query += additional_conditions

        try:
            count = action.fetchone(count_query + filter_query, filter_values)
            total = count['count']

        except Exception as e:
            print(e)

        query += filter_query 
        
        return filter_values, query, total


    @staticmethod
    def order(request, sortable_fields, query, default_table='pr', join_tables=[]):
        fields = [field if type(re.search('"(.*)"',field)) is type(None) else re.search('"(.*)"',field).group(1) for field in sortable_fields]
        fields = [field[3:] if field[2]=='.' else field for field in fields]
        values = {}

        if 'sort_order' in request.args and request.args['sort_order'] == 'desc':
            values['sort_order'] = 'desc'
        else:
            values['sort_order'] = 'asc'

        if 'sort_name' in request.args and request.args['sort_name'] in fields:
            if values['sort_order'] == 'asc':
                query += f" ORDER BY {default_table}.{request.args['sort_name']} {values['sort_order']}, pr.start_date ASC "
            else:
                query += f" ORDER BY ({default_table}.{request.args['sort_name']} IS NULL), {default_table}.{request.args['sort_name']} {values['sort_order']}, pr.start_date ASC "
                
        else:
            query += f" ORDER BY pr.start_date ASC "           

        return query
