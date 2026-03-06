import json
import math
import re
from api.actions.mercadolibre.advertisings_actions import AdvertisingsActions
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.enums.access_type import AccessType      
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access
from marshmallow import ValidationError
from workers.loggers import create_process, create_process_item
from workers.tasks.mercadolibre.advertising_discount_item import discount_apply_item, discount_remove_item

class DiscountActions(Actions):
    @jwt_required
    @prepare
    def apply_discount(self):
        required_fields = ['start_date', 'finish_date', 'buyers_discount_percentage']
        if request.json:
            request.form = request.json
        filled_fields = request.form

        for field in required_fields:
            if field not in filled_fields:
                self.abort_json({
                    'message': f'Preencha todos os campos obrigatórios.',
                    'status': 'error',
                }, 400)
        
        start_date_dt = datetime.strptime(request.form['start_date'], "%d/%m/%Y %H:%M")
        finish_date_dt = datetime.strptime(request.form['finish_date'], "%d/%m/%Y %H:%M")
        buyers_discount = float(request.form['buyers_discount_percentage'])
        try:
            best_buyers_discount = float(request.form.get('best_buyers_discount_percentage')) if request.form.get('best_buyers_discount_percentage') else None 
        except Exception:
            best_buyers_discount = request.form.get('best_buyers_discount_percentage') if request.form.get('best_buyers_discount_percentage') else None 
            only_numbers = re.compile('([0-9]+)')
            best_buyers_discount = only_numbers.findall(best_buyers_discount)
            best_buyers_discount = list(map(float,best_buyers_discount))

        if start_date_dt.date() < datetime.today().date():
            self.abort_json({
                    'message': f'A data inicial não pode ser anterior a data atual.',
                    'status': 'error',
                }, 400)
        elif finish_date_dt < datetime.now():
            self.abort_json({
                    'message': f'A data final não pode ser anterior a data atual.',
                    'status': 'error',
                }, 400)

        elif (finish_date_dt - start_date_dt).days > 60:
            self.abort_json({
                    'message': f'A diferença entre a data inicial e final deve ser no máximo 60 dias.',
                    'status': 'error',
                }, 400)
        else:
            start_date = start_date_dt.strftime("%Y-%m-%dT%H:%M:%S")
            finish_date = finish_date_dt.strftime("%Y-%m-%dT%H:%M:%S")

        if best_buyers_discount:
            if buyers_discount <= 35 and (best_buyers_discount-buyers_discount) < 5:
                self.abort_json({
                    'message': f'Para descontos de até 35%, bons compradores devem receber, no mínimo, desconto 5% maior que os compradores comuns.',
                    'status': 'error',
                }, 400)
            elif buyers_discount > 35 and (best_buyers_discount-buyers_discount) < 10:
                self.abort_json({
                    'message': f'Para descontos maiores que 35%, bons compradores devem receber, no mínimo, desconto 10% maior que os compradores comuns.',
                    'status': 'error',
                }, 400)
        if buyers_discount < 5 or buyers_discount > 80 or (best_buyers_discount and best_buyers_discount > 80):    
            self.abort_json({
                    'message': f'O desconto deve ser de no mínimo 5% e no máximo 80%.',
                    'status': 'error',
                }, 400)  

        select_all = bool(int(request.args.get('select_all', 0)))
        
        is_single = self.is_single_advertising(request)
        if is_single:
            tool = self.get_tool('apply-discount-single')
        else:
            tool = self.get_tool('apply-discount')

        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message':'Preencha o parâmetro de confirmação.',
                'status':'error',
            }, 400)
        else:
            confirmed = True if request.args.get('confirmed','0') == '1' else False

        subscription_required = tool['access_type'] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(request=request, additional_conditions=" AND (ad.tags LIKE '%%loyalty_discount_eligible%%' AND ad.original_price is NULL) ", subscription_required=subscription_required, mass_operation=True)
        
        if not confirmed and filter_total>1:
            return self.return_success(f"A operação modificará: {filter_total} anúncios")
        elif not confirmed and filter_total==1:
            advertising = self.fetchone("SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
            return self.return_success(f"A operação modificará o anúncio {advertising['external_id']} - {advertising['title']}")
        elif not confirmed:
            return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success(f"Nenhum produto elegivel para descontos", {})

        total = filter_total
        code, message = verify_tool_access(self, self.user['id'], accounts_id, tool, total)

        if code != 200:
            self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

        elif filter_total > 1:
            discount_apply = queue.signature('local_priority:discount_apply_many')
            discount_apply.delay(self.user['id'], filter_query, filter_values, start_date, finish_date, buyers_discount, best_buyers_discount)
            message = "Aplicação de descontos iniciada. Confira o andamento em Processos"
            return self.return_success(f"Desconto aplicado em {filter_total} produtos. Confira o andamento em processos", {})
        
        else:
            advertising = self.fetchone("SELECT external_id, title, account_id FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)

            if not advertising:
                self.abort_json({
                    'message': "Anúncio não encontrado",
                    'status': 'error',
                }, 400)  

            process_id = create_process(account_id=advertising['account_id'], user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self)
            process_item_id = create_process_item(process_id, advertising['account_id'], advertising['external_id'], self)
            status_code, message = discount_apply_item(None, advertising['account_id'], tool, process_item_id, advertising['external_id'], start_date, finish_date, buyers_discount, best_buyers_discount, self.conn)

            if status_code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, 400)  
            return self.return_success(message)

    
    @jwt_required
    @prepare
    def show_discounts(self):
        account = self.fetchone("SELECT * FROM meuml.accounts WHERE id = :id", {'id': request.args['account_id']})

        token = self.refresh_token(account, account['refresh_token'])
        ml_api = MercadoLibreApi(access_token=token['access_token'])

        response = ml_api.get(f"/promo/item/{request.args['advertising_id']}")
        if response.status_code == 200:
            data = response.json()
            return self.return_success("", data)
        else:
            self.abort_json({
                    'message': f'Descontos não encontrados.',
                    'status': 'error',
                }, 400)


    @jwt_required
    @prepare
    def remove_discount(self):
        if request.json and not request.form:
            request.form = request.json
        if request.args and not request.form:
            request.form = request.args

        select_all = bool(int(request.args.get('select_all', 0)))

        is_single = self.is_single_advertising(request)
        if is_single:
            tool = self.get_tool('remove-discount-single')
        else:
            tool = self.get_tool('remove-discount')

        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message':'Preencha o parâmetro de confirmação.',
                'status':'error',
            }, 400)
        else:
            confirmed = True if request.args.get('confirmed','0') == '1' else False

        subscription_required = tool['access_type'] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(request=request, additional_conditions=" AND ad.original_price IS NOT NULL ", subscription_required=subscription_required, mass_operation=True)

        if not confirmed and filter_total>1:
            return self.return_success(f"A operação modificará: {filter_total} anúncios")
        elif not confirmed and filter_total==1:
            advertising = self.fetchone("SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
            return self.return_success(f"A operação modificará o anúncio {advertising['external_id']} - {advertising['title']}")
        elif not confirmed:
            return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success(f"Nenhum produto elegivel para remoção de descontos", {})

        total = filter_total
        code, message = verify_tool_access(self, self.user['id'], accounts_id, tool, total)

        if code != 200:
            self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

        if filter_total > 1:
            discount_remove = queue.signature('local_priority:discount_remove_many')
            discount_remove.delay(self.user['id'], filter_query, filter_values)
            message = "Remoção de descontos iniciada. Confira o andamento em Processos"
        
        else:
            advertising = self.fetchone("SELECT external_id, title, account_id FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)

            if not advertising:
                self.abort_json({
                    'message': "Anúncio não encontrado",
                    'status': 'error',
                }, 400)  

            process_id = create_process(account_id=advertising['account_id'], user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self)
            process_item_id = create_process_item(process_id, advertising['account_id'], advertising['external_id'], self)
            status_code, message = discount_remove_item(None, advertising['account_id'], tool, process_item_id, advertising['external_id'], self.conn)

            if status_code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, 400)  
        return self.return_success(message, {})
