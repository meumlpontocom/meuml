import json
import requests
import time
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.enums.marketplace import Marketplace
from libs.queue.queue import app as queue
from libs.schema.accounts_schema import UpdateAccountName
from libs.shopee_api.shopee_api import ShopeeApi
from os import getenv

class ShopeeAccountsActions(Actions):
    def get_error_message(self, error_code):
        errors = {
            "wrong sign": "Assinatura incorreta"
        }
        return errors.get(error_code, error_code)


    def add_account(self):
        sp_api = ShopeeApi()
        authorization_url = sp_api.get_authorization_url()

        return redirect(authorization_url)

    @jwt_required
    @prepare
    def callback_shopee_account(self):
        if 'code' not in request.args or 'shop_id' not in request.args or len(request.args['code']) == 0 or len(request.args['shop_id']) == 0:
            self.abort_json({
                'message': f"O código de retorno e id da loja são obrigatórios",
                'status': 'error',
            }, 400)

        sp_api = ShopeeApi()

        response = sp_api.get_access_token(int(request.args['shop_id']),  request.args['code'])
        data = json.loads(response.content)

        if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0):
            self.abort_json({
                'message': f"Erro ao recuperar token de acesso Shopee. <Shopee: {self.get_error_message(data.get('error'))}>",
                'status': 'error',
            }, 400)

        account = self.fetchone('SELECT id, user_id FROM shopee.accounts WHERE id=:id AND user_id IS NOT NULL', {'id': request.args['shop_id']})

        message = "Conta adicionada com sucesso"
        if account is not None:
            if account['user_id'] != self.user['id']:
                from_user = self.fetchone("SELECT email FROM meuml.users WHERE id=:id", {'id': account['user_id']})
                message += f". Transferida de {from_user['email']}"
            else:
                message += ". Autenticação com Shopee renovada"

        query = """
            INSERT INTO shopee.accounts (id, user_id, access_token, access_token_expires_in, refresh_token, refresh_token_expires_in)
            VALUES (:id, :user_id, :access_token, :access_token_expires_in, :refresh_token, :refresh_token_expires_in)
            ON CONFLICT (id)
            DO UPDATE SET
                user_id = excluded.user_id,
                access_token = excluded.access_token,
                access_token_expires_in = excluded.access_token_expires_in,
                refresh_token = excluded.refresh_token,
                refresh_token_expires_in = excluded.refresh_token_expires_in
        """
        now = datetime.now()
        values = {
            'id': request.args['shop_id'],
            'user_id': self.user['id'],
            'access_token': data['access_token'],
            'access_token_expires_in': (now + timedelta(seconds=int(data['expire_in']))).strftime('%Y-%m-%d %H:%M:%S'),
            'refresh_token': data['refresh_token'],
            'refresh_token_expires_in': (now + timedelta(seconds=int(data['expire_in'])) + timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S'),
            'internal_status': 0
        }
        self.execute(query, values)

        sp_api.update_auth(int(request.args['shop_id']), data['access_token'])
        response = sp_api.get(path='/api/v2/shop/get_shop_info', version='v2')
        data = response.json()

        response_profile = sp_api.get(path='/api/v2/shop/get_profile', version='v2')
        data_profile = response_profile.json()['response']

        if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0):
            self.abort_json({
                'message': f"Erro ao recuperar informações da loja no Shopee. <Shopee: f{self.get_error_message(data.get('msg'))}",
                'status': 'error',
            }, 400)

        query = """
            UPDATE shopee.accounts SET
                shop_name = :shop_name,
                country = :country,
                shop_description = :shop_description,
                --videos = :videos,
                --images = :images,
                --disable_make_offer = :disable_make_offer,
                --enable_display_unitno = :enable_display_unitno,
                --item_limit = :item_limit,
                status = :status,
                --installment_status = :installment_status,
                sip_a_shops = :sip_a_shops,
                is_cb = :is_cb,
                --non_pre_order_dts = :non_pre_order_dts,
                auth_time = :auth_time,
                expire_time = :expire_time,
                internal_status = :internal_status,
                name = :name
            WHERE id = :id
        """
        values = {
            'id': request.args['shop_id'],
            'shop_name': data.get('shop_name'),
            'country': data.get('region'),
            'shop_description': data_profile.get('description'),
            # 'videos': data.get('videos'),
            # 'images': data.get('images'),
            # 'disable_make_offer': data.get('disable_make_offer'),
            # 'enable_display_unitno': data.get('enable_display_unitno'),
            # 'item_limit': data.get('item_limit'),
            'status': data.get('status'),
            # 'installment_status': data.get('installment_status'),
            'sip_a_shops': data_profile.get('sip_affi_shops'),
            'is_cb': data.get('is_cb'),
            # 'non_pre_order_dts': data.get('non_pre_order_dts'),
            'auth_time': (datetime.fromtimestamp(data.get('auth_time'))).strftime('%Y-%m-%d %H:%M:%S'),
            'expire_time': (datetime.fromtimestamp(data.get('expire_time'))).strftime('%Y-%m-%d %H:%M:%S'),
            'internal_status': 1,
            'name': data.get('shop_name')
        }
        self.execute(query, values)

        shopee_import_item_list = queue.signature('long_running:shopee_import_item_list')
        shopee_import_item_list.delay(self.user['id'], request.args['shop_id'])

        return self.return_success(message, {"account_id" : request.args['shop_id']})


    @jwt_required
    @prepare
    def remove_account(self):
        query = "UPDATE shopee.accounts SET user_id = NULL WHERE id = :id AND user_id = :user_id"
        self.execute(query, {'id': request.args['account_id'], 'user_id': self.user['id']})

        query = f'DELETE FROM stock.account_warehouse WHERE account_id = :account_id AND marketplace_id = {Marketplace.Shopee}'
        values = {'account_id': request.args['account_id']}
        self.execute(query, values)

        sp_api = ShopeeApi()
        deauthorization_url = sp_api.get_deauthorization_url()

        return redirect(deauthorization_url)


    @jwt_required
    @prepare
    def rename_account(self, account_id : int = None):
        self.validate(UpdateAccountName())

        query = 'SELECT id, user_id FROM shopee.accounts WHERE id = :id'
        account = self.fetchone(query, {'id': account_id})

        if account is None:
            self.abort_json({
                'message': f'Conta da Shopee não localizada.',
                'status': 'error',
            }, 400)

        if account['user_id'] != self.user['id']:
            self.abort_json({
                'message': f'Conta da Shopee pertence a outro e-mail',
                'status': 'error',
            }, 400)

        try:
            query = 'UPDATE shopee.accounts SET name = :name WHERE id = :id'
            values = {
                'name':self.data['name'],
                'id': account['id']
            }
            self.execute(query, values)

            return self.return_success("Conta atualizada com sucesso", values)
        except:
            self.abort_json({
                'message': f'Erro durante atualização, tente novamente',
                'status': 'error',
            }, 500)


    @jwt_required
    @prepare
    def sync_account(self, account_id : int = None):
        query = 'select * FROM shopee.accounts where id = :id and user_id = :user_id'
        account = self.fetchone(query, {'id': account_id, 'user_id': self.user['id']})

        if account is None:
            self.abort_json({
                'message': f'Não autorizado',
                'status': 'error',
            }, 401)

        if account['internal_status'] == 0:
            self.abort_json({
                'message': f"Conta {account['name']} perdeu a autenticação com Shopee, por favor exclua e adicione novamente esta conta",
                'status': 'error',
            }, 400)

        if not self.refresh_token(account, platform="SP"):
            self.abort_json({
                'message': f"Não foi possível renovar o token de acesso da conta {account['name']}, por favor exclua e adicione novamente esta conta",
                'status': 'error',
            }, 400)

        shopee_import_item_list = queue.signature('long_running:shopee_import_item_list')
        shopee_import_item_list.delay(self.user['id'], account_id)

        # shopee_import_order_list = queue.signature('long_running:shopee_import_order_list')
        # shopee_import_order_list.delay(self.user['id'], account['id'])

        return self.return_success("Sincronização de conta iniciada com sucesso", {"account_id" : account['id'], "start" : datetime.now()})
