import traceback
from flask import request
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.enums.access_type import AccessType
from libs.decorator.prepare import prepare
from libs.payments.payment_helper import verify_tool_access
from libs.queue.queue import app as queue
from libs.schema.advertisings_schema import AdvertisingListSchema as MercadoLibreList
from libs.schema.shopee_advertisings_schema import AdvertisingListSchema as ShopeeList
from werkzeug.exceptions import HTTPException


class ArticleImportingActions(Actions):
    @jwt_required
    @prepare
    def import_from_mercadolibre(self): 
        try:
            ArticleImportingActions.check_module_permission(self)

            # self.validate(MercadoLibreList())
            # request_data = self.data
            # advertisings_id = [advertising['id'] for advertising in request_data['advertisings']]
            # advertisings_id = ','.join(advertisings_id)
                
            tool = self.get_tool('article-import-mercadolibre')

            if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
                self.abort_json({
                    'message':'Preencha o parâmetro de confirmação.',
                    'status':'error',
                }, 400)
            else:
                confirmed = True if request.args.get('confirmed','0') == '1' else False
                select_all = True if request.args.get('select_all','0') == '1' else False

            subscription_required = tool['access_type'] == AccessType.subscription
            additional_conditions = ' AND (ad.sku IS NOT NULL OR jsonb_array_length(variations) > 0) '
            filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(request, additional_conditions=None, subscription_required=subscription_required, mass_operation=True)

            if not confirmed and filter_total>1:
                return self.return_success(f"A operação importará: {filter_total} anúncios.")
            elif not confirmed and filter_total==1:
                advertising = self.fetchone("SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
                return self.return_success(f"A operação importará o anúncio {advertising['external_id']} - {advertising['title']}.")
            elif not confirmed:
                return self.return_success(f"A operação não importará nenhum anúncio.")

            if filter_total == 0:
                return self.return_success("Nenhum produto será importado.")

            code, message = verify_tool_access(self, self.user['id'], tool=tool)

            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            article_import_many = queue.signature('local_priority:article_import_mercadolibre_many')
            article_import_many.delay(self.user['id'], filter_query, filter_values)
            return self.return_success(f"Operação em massa de {filter_total} anúncios iniciada. Confira o andamento em processos")
        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao importar anúncios',
                'status': 'error',
            }, 500)


    @jwt_required
    @prepare
    def import_from_shopee(self): 
        try:
            ArticleImportingActions.check_module_permission(self)
            
            # self.validate(ShopeeList())
            # request_data = self.data
            # advertisings_id = [str(advertising['id']) for advertising in request_data['advertisings']]
            # advertisings_id = ','.join(advertisings_id)
                
            tool = self.get_tool('article-import-shopee')

            if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
                self.abort_json({
                    'message':'Preencha o parâmetro de confirmação.',
                    'status':'error',
                }, 400)
            else:
                confirmed = True if request.args.get('confirmed','0') == '1' else False
                select_all = True if request.args.get('select_all','0') == '1' else False

            subscription_required = tool['access_type'] == AccessType.subscription
            additional_conditions = ' AND (ad.item_sku IS NOT NULL OR ad.has_variation) '
            filter_values, filter_query, filter_total, accounts_id = self.apply_filter(request, additional_conditions=None, subscription_required=subscription_required, mass_operation=True, platform="SP")

            if not confirmed and filter_total>1:
                return self.return_success(f"A operação importará: {filter_total} anúncios.")
            elif not confirmed and filter_total==1:
                advertising = self.fetchone("SELECT ad.id, ad.name FROM shopee.advertisings ad JOIN shopee.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
                return self.return_success(f"A operação importará o anúncio #{advertising['id']} - {advertising['name']}.")
            elif not confirmed:
                return self.return_success(f"A operação não importará nenhum anúncio.")

            if filter_total == 0:
                return self.return_success("Nenhum anúncio será importado.")

            code, message = verify_tool_access(self, self.user['id'], tool=tool)

            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            article_import_many = queue.signature('local_priority:article_import_shopee_many')
            article_import_many.delay(self.user['id'], filter_query, filter_values)
            return self.return_success(f"Operação em massa de {filter_total} anúncios iniciada. Confira o andamento em processos")
        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao importar anúncios',
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
