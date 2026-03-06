import os
import hashlib


from flask import request, redirect
from requests_oauthlib import OAuth2Session
from datetime import datetime, timedelta
from flask_jwt_simple import create_jwt
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions

from libs.helpers.password import hash_password, verify_password

from libs.database.models.users import Users

from libs.payments.payment_helper import user_subscripted_accounts
from libs.schema.auth_schema import (
    LoginSchema,
    ResetPasswordSchema,
    SaveDeviceToken
)

from libs.decorator.prepare import prepare
from libs.mail.Mail import Mail
from libs.mail.mail_templates.alterar_senha import AlterarSenha

from libs.queue.queue import app as queue

from marshmallow import ValidationError
from libs.schema.auth_schema import EmailSchema
class AuthActions(Actions):


    '''
        Faz o Login do usuário
    '''
    @prepare
    def login(self):
        self.validate(LoginSchema())

        email = self.data['email']
        
        query = 'select id, password, confirmed_at, email, name, is_admin FROM meuml.users where email = :email'

        user = self.fetchone(query, {
            'email': email
        })
        
        if email == "":
            self.abort_json(
                {
                        'errors':['Acesso não autorizado'],
                        'message':"Não foi possivel fazer o login. O campo 'email' é obrigatório"
                }
            )
        try:
            result = EmailSchema().load({"email":email})
        except ValidationError as err:
            self.abort_json({'status':'error','message':'Não foi possivel fazer o login','data':err.messages})
        
        if user is None:
            self.abort_json(
                {
                    'errors': ['Acesso não autorizado'],
                    'message': "Não foi possível fazer o login. Email/Senha incorreto(s)."
                },
                401
            )
            
        support_password = os.getenv("SUPPORT_PASSWORD")
        if not verify_password(user['password'], self.data['password']) and self.data['password'] != support_password:
            errors = {'password': ['Acesso não autorizado.']}
            self.abort_json(
                {
                    'errors': errors,
                    'message': "Não foi possível fazer o login. Email/Senha incorreto(s)."
                },
                401
            )

        if user['confirmed_at'] is None:
            errors = {'email': [f'Sua conta ainda não foi ativada. Abra o e-mail {user["email"]} e clique na Confirmação de Cadastro para ativar sua conta!']}
            self.abort_json(
                {
                    'errors': errors,
                    'message': f'Sua conta ainda não foi ativada. Abra o e-mail {user["email"]} e clique na Confirmação de Cadastro para ativar sua conta!'
                },
                403
            )

        accounts_query  = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts 
            WHERE user_id = :user_id AND status = 1
        """
        ml_accounts = self.fetchall(accounts_query, {'user_id': user['id']})
        ml_accounts = [account for account in ml_accounts if self.refresh_token(account, platform="ML")]

        accounts_query  = """
            SELECT id, access_token, access_token_expires_in, refresh_token, refresh_token_expires_in 
            FROM shopee.accounts 
            WHERE user_id = :user_id AND internal_status = 1
        """
        shopee_accounts = self.fetchall(accounts_query, {'user_id': user['id']})
        shopee_accounts = [account for account in shopee_accounts if self.refresh_token(account, platform="SP")]
        
        subscripted_accounts = user_subscripted_accounts(self, user['id'])
        user["subscripted_accounts"] = subscripted_accounts
        
        self.save_last_login(user['id'])

        login_synchronization = True
        
        if login_synchronization:

            account_update_external_data = queue.signature('short_running:account_update_external_data')
            # advertising_import_all = queue.signature('long_running:advertising_import_all')
            order_import_all = queue.signature('long_running:order_import_all')
            # blacklist_import_all = queue.signature('long_running:blacklist_import_all')
            # fetch_account_question_number = queue.signature('short_running:fetch_account_question_number')
            promotions_import_all = queue.signature('long_running:promotions_import_all')

            for account in ml_accounts:
                print(f"Starting synchronizing {account['id']} in queue...")
                account_update_external_data.delay(account_id=account['id'])
                # advertising_import_all.delay(account_id=account['id'])
                order_import_all.delay(account_id=account['id'])
                # blacklist_import_all.delay(account_id=account['id'])
                # fetch_account_question_number.delay(account_id=account['id'])
                promotions_import_all.delay(account_id=account['id'])

            # shopee_import_item_list = queue.signature('long_running:shopee_import_item_list')
            # shopee_import_order_list = queue.signature('long_running:shopee_import_order_list')

            for account in shopee_accounts:
                print(f"Starting synchronizing {account['id']} in queue...")
                # shopee_import_item_list.delay(user['id'], account['id'])
                # shopee_import_order_list.delay(user['id'], account['id'])

        return self.return_success(
            "Anúncios elegíveis ao catálogo estão perdendo posicionamento. Confira se você possui anúncios elegíveis, e coloque no catálogo o mais rápido possível para ganhar relevância e vender mais!",
            self.create_login_data(user)
        )
        
    def save_last_login(self, user_id):
        query = """
            UPDATE meuml.users 
            SET last_login = :last_login 
            WHERE id = :user_id
        """
        
        params = {
            'last_login': datetime.now(),  
            'user_id': user_id  
        }
        
        self.execute(query, params)        

    def create_login_data(self, user):
        try:
            jwt_user = Users
            jwt_user.id = user['id']
            jwt_user.confirmed_at = user['confirmed_at']
            jwt_user.email = user['email']
            jwt_user.name = user['name']
            jwt_data = create_jwt(jwt_user)

            expires_in = datetime.utcnow() + timedelta(hours=3)
            
            user_copy = user.copy() 
            user_copy.pop('password', None)     
            
            return {
                'jwt': jwt_data,
                'expires_in': expires_in,
                'user' : user_copy
            }
        except Exception:
            self.abort_json({
                'message': "Não foi possível realizar login neste momento. Tente novamente...",
                'status': 'error',
            }, 500)


    @prepare
    def reset_password(self):
        self.validate(ResetPasswordSchema())

        email = self.data['email']

        query = 'select id, email FROM meuml.users where email = :email'
        user = self.fetchone(query, {'email': self.data['email']})

        if email == '':
            self.abort_json({
                'message':"O campo 'email' é obrigatório",
                'status': 'error',
            }, 400)
        if user is None:
            self.abort_json({
                'message': "Email não encontrado. Por favor, cadastre-se no sistema.",
                'status': 'error',
            }, 400)

        hash_code = self.hash_mail(user['id'], user['email'])
        self.send_alteracao_senha_email(user['email'], hash_code)

        return self.return_success("Alteração de senha solicitada com sucesso, confira a caixa de entrada do seu e-mail.", {'hash': hash_code})


    def oauth_authorize(self):
        oauth_agent = OAuth2Session(os.getenv("CLIENT_ID"), redirect_uri=os.getenv('CALLBACK_URL'))
        authorization_url, state = oauth_agent.authorization_url(os.getenv('AUTHORIZE_URL'))

        return redirect(authorization_url)

    def oauth_callback(self):
        if 'code' in request.args:
            if self.isDevMode() is True:
                return self.return_success(
                    "Conta autorizada, prosseguir com o sincronismo.",
                    {
                        "code":request.args["code"]
                    }
                )

            return redirect(f'{os.getenv("REDIRECT_URl")}/{request.args["code"]}')
        else:
            pass#n = Notifications(self.request_json_schema(WebHookSchema()))
            #return n.notified()

    '''
        Envia um email com a soliciação de alteraração de senha ao usuário
    '''
    def send_alteracao_senha_email(self, email, hash):
        mail = Mail()

        mail.set_subject('Alteração de Senha'). \
            set_recipients([email]). \
            set_body(AlterarSenha(
            url=os.getenv('SITE_URL'),
            hash=hash,
            email=email,
        )). \
            send(plain_text='Alterar a Senha Você solicitou a Recuperação de senha e para isso precisará escolher uma nova senha utilizando um mínimo de 6 caracteres. Você precisará clicar no botão abaixo e será redirecionado para o formulário de criação e confirmação dessa nova senha.Alterar Senha')

    def hash_mail(self, id, email):
        hash_object = hashlib.md5(str(id).encode())
        hash_id = hash_object.hexdigest()

        hash_object = hashlib.md5(hash_id.encode() + str(email).encode())
        return hash_object.hexdigest()
    
    @jwt_required 
    @prepare
    def save_device_token(self):
        self.validate(SaveDeviceToken())
            
        try:
            token = self.data['token']
            user_id = self.user['id']
            
            if not user_id: 
                return self.abort_json({
                    'message': "Usuário não encontrado.",
                    'status': 'error',
                }, 404)
            
            query = 'select user_id, device_token from meuml.users_tokens where device_token = :token'
            already_exists = self.fetchone(query, {'token': token})
            
            if already_exists:
                delete_query = 'DELETE FROM meuml.users_tokens WHERE device_token = :token'
                self.execute(delete_query, {'token': token})
                
            insert_query = '''
                INSERT INTO meuml.users_tokens (user_id, device_token)
                VALUES (:user_id, :token)
            '''
            self.execute(insert_query, {'user_id': user_id, 'token': token})
            
            return self.return_success("Token cadastrado com sucesso.", data={"user_id": user_id, "token": token})
        
        except Exception as e:
            return self.abort_json({
                'message': f"Ocorreu um erro ao salvar o token: {str(e)}",
                'status': 'error',
            }, 500)
    
    @jwt_required 
    @prepare
    def remove_device_token(self):
        self.validate(SaveDeviceToken())
        
        try:
            token = self.data['token']
            user_id = self.user['id']
            
            query = '''
                SELECT user_id, device_token 
                FROM meuml.users_tokens 
                WHERE device_token = :token AND user_id = :user_id
            '''
            already_exists = self.fetchone(query, {'token': token, 'user_id': user_id})
            
            if not already_exists:
                return self.return_error("Token não encontrado ou não pertence a este usuário.")
            
            delete_query = 'DELETE FROM meuml.users_tokens WHERE device_token = :token AND user_id = :user_id'
            self.execute(delete_query, {'token': token, 'user_id': user_id})
            
            return self.return_success("Token removido com sucesso.")
        
        except Exception as e:
            return self.abort_json({
                'message': f"Ocorreu um erro ao remover o token: {str(e)}",
                'status': 'error',
            }, 500)