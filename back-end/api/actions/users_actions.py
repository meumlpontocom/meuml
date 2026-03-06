import os
import hashlib
import datetime

from datetime import datetime, timedelta
from flask import request

from flask_jwt_simple import jwt_required, get_jwt_identity, create_jwt

from libs.actions.actions import Actions

from libs.helpers.password import hash_password

from libs.database.models.users import Users

from libs.schema.user_schemas import (
    UpdatePasswordSchema,
    UserRegisterSchema,
    UpdateUserNameSchema,
    UsersSchema,
    ConfirmEmailSchema,
    ResendEmailSchema
)

from libs.exceptions.exceptions import UsersActionsException

from libs.decorator.prepare import prepare
from libs.mail.Mail import Mail
from libs.mail.mail_templates.confirmar_cadastro import ConfirmarCadastro
from libs.minio_api.minio_api import minio_client
from libs.queue.queue import app as queue


class UserActions(Actions):

    '''
        Faz o registro do usuário
    '''
    @prepare
    def register_user(self):

        self.validate(UserRegisterSchema())

        email = self.data['email']
        name = self.data['name']
        password = hash_password(self.data['password'])

        select_user = 'select id, email, confirmed_at FROM meuml.users where email = :email'
        values_user = {
            'email': email
        }

        user = self.fetchone(select_user, values_user)

        if name == "":
            self.abort_json({'status':'error','message':"O campo 'nome' é obrigatório."})

        if user is not None:
            errors = {'email': [f'O email \'{email}\' ja existe em nosso sistema.']}
            self.abort_json({'status': 'error', 'message': 'Não foi possível cadastrar a conta com o e-mail informado.',
                            'data': errors}, 409)

        try:
            insert_user = 'insert into meuml.users ' \
                        '(name, email, password) ' \
                        'VALUES (' \
                        ':name, :email, :password' \
                        ')  returning id'
            values_insert_user = {
                'name': name,
                'email': email,
                'password': password
            }

            user_id = self.execute_insert(insert_user, values_insert_user)

        except Exception as e:
            errors = {'error': e}
            self.abort_json({'status': 'error', 'message': 'Não foi possível cadastrar seu usuário.',
                            'data': errors}, 404)

        try:
            hash_code = self.send_confirmation_email(user_id, email, name)

        except Exception as e:
            print(e)
            return self.abort_json({
                'message': f"Sua conta foi cadastrada com sucesso, porém o e-mail de confirmação não foi enviado, entre em contato pelo número: (00) 41 0000-0000 ou envie um e-mail solicitando o acesso para emai@emai.com.",
                'status': 'error',
            },207)

        query = 'select email, name FROM meuml.users where id = :id'

        values = {
            'id': user_id
        }

        user = self.fetchone(query, values)
        user['hash'] = hash_code

        message = f"""
            Sua conta foi cadastrada, mas precisa ser ativada.
            Enviamos um email para {user['email']}, abra seu e-mail e copie o código de confirmação que será utilizado durante seu primeiro login"
        """

        try:
            bucket_name = str(user_id)
            bucket_name_length = len(bucket_name)
            bucket_name = bucket_name if bucket_name_length >= 4 else ((4-bucket_name_length) * '0') + bucket_name
            minio_client.make_bucket(bucket_name=bucket_name)
        except:
            self.abort_json({
                'message': f'Erro ao criar repositório de arquivos',
                'status': 'error',
            }, 500)

        return self.return_success(message, user)


    @prepare
    def user(self, user_id : int = 0):

        try:
            query = 'select id FROM meuml.users where id = :id or id = :jwt_id'
            values = {
                'id': user_id,
                'jwt_id': get_jwt_identity()
            }
            self.user_action = self.fetchone(query, values)

        except NoResultFound:
            self.abort_json({
                'message': f'Usuário não localizado.',
                'status': 'error',
            }, 400)

        method = request.method
        if method == 'DELETE':
            return self.user_delete()
        elif method == 'POST':
            return self.register_user()
        elif method == 'GET':
            return self.return_success('Usuário localizado com sucesso', self.user_action)

    @prepare
    def confirm(self):

        self.validate(ConfirmEmailSchema())

        email = self.data['email']
        hash_param = self.data['hash']

        query = 'SELECT id, email, name, confirmed_at, password FROM meuml.users WHERE email = :email'
        user = self.fetchone(query, {'email': email})

        if user is None:
            self.abort_json(
                {
                    'errors': ['Não foi possível encontrar usuário com email informado.'],
                    'message': 'Email inválido.'
                },
                404
            )

        if user['confirmed_at'] is not None:
            self.abort_json(
                {
                    'errors': ['O email informado já foi confirmado.'],
                    'message': 'Email inválido.'
                },
                409
            )    

        hash_final = self.hash_mail(user['id'], email)

        if hash_final != hash_param:
            errors = {'hash': [f'Hash de validação inválido']}
            self.abort_json(
                {
                    'errors': errors,
                    "message": "Não foi possível confirmar a conta"
                },
                422
            )


        user['confirmed_at'] = self.confirm_user(user)
        return self.return_success(
            "Conta confirmada com sucesso",
            self.create_login_data(user)
        )

    @prepare
    def update_password(self):
        self.validate(UpdatePasswordSchema())

        password = hash_password(self.data['password'])
        email = self.data['email']
        hash_param = self.data['hash']

        query = 'select id, password, confirmed_at, email, name FROM meuml.users where email = :email'
        values = {
            'email': email
        }
        user = self.fetchone(query, values)

        hash = self.hash_mail(user['id'], email)

        if hash != hash_param:
            errors = {'hash': [f'Hash de validação inválido']}
            self.abort_json(
                {
                    'errors': errors,
                    "message": "Não foi possível atualizar a senha"
                },
                422
            )

        try:
            query = 'UPDATE meuml.users set password = :password where id = :id'
            values = {
                'password': password,
                'id': user['id']
            }
            self.execute(query, values)

            jwt_user = Users
            jwt_user.id = user['id']
            jwt_user.password = user['password']
            jwt_user.confirmed_at = user['confirmed_at']
            jwt_user.email = user['email']
            jwt_user.name = user['name']

            return self.return_success(
                "Senha modificada com sucesso",
                {"jwt" : create_jwt(jwt_user)}
            )

        except Exception as err:
            print(err)
            errors = {'email': [f'ID do usuário informado não foi encontrado.']}
            self.abort_json(
                {
                    'errors': errors,
                    'message': 'Não foi possível localizar o usuário para recuperar a senha.'
                },
                400
            )


    def confirm_user(self, user : Users = None):
        if user is None:
            raise UsersActionsException('O usuário informado para confirmação é nulo')

        try:
            confirmed_at = datetime.now()
            query = 'UPDATE meuml.users set confirmed_at = :confirmed_at where email = :email'
            values = {
                'confirmed_at': confirmed_at,
                'email': user['email']
            }

            self.execute(query, values)

            return confirmed_at

        except Exception as err:
            self.abort_json(
                {
                    'errors': ['Não foi possível salvar a confirmação no banco de dados'],
                    'message': 'Não foi possível confirmar a conta.'
                },
                500
            )

    def hash_mail(self, id, email):
        hash_object = hashlib.md5(str(id).encode())
        hash_id = hash_object.hexdigest()

        hash_object = hashlib.md5(hash_id.encode() + str(email).encode())
        return hash_object.hexdigest()


    def create_login_data(self, user):
        try:
            jwt_user = Users
            jwt_user.id = user['id']
            jwt_user.password = user['password']
            jwt_user.confirmed_at = user['confirmed_at']
            jwt_user.email = user['email']
            jwt_user.name = user['name']
            jwt_data = create_jwt(jwt_user)

            expires_in = datetime.utcnow() + timedelta(hours=3)
            
            return {
                'jwt': jwt_data,
                'expires_in': expires_in,
                'user' : user
            }
        except Exception:
            self.abort_json({
                'message': "Não foi possível realizar login neste momento. Tente novamente...",
                'status': 'error',
            }, 500)


    def send_confirmation_email(self, user_id, email, name):
        hash_code = self.hash_mail(user_id, email)
        # self.send_confirmar_cadastro_mail(email, hash_code)
        email_message = f"""
        Olá, {name}!

        Você se cadastrou no MeuML.com, para poder acessar sua conta é necessário confirmar seu cadastro, usando o código abaixo.
        Ao confirmar seu cadastro você poderá realizar o acesso ao sistema com as informações de email e senha que informou no seu cadastro.

        Copie o código abaixo cole no tela do sistema que irá aparecer no seu primeiro login:
        
        {hash_code}


        Qualquer dúvida, me chame no Whatsapp: (41) 99123-0100
        """
        send_email = queue.signature('local_priority:send_email')
        send_email.delay([email], 'MeuML v2 - Confirmação de Cadastro', email_message, plain_text_only=True)

        return hash_code


    @prepare
    def resend_confirmation_code(self):
        self.validate(ResendEmailSchema())

        query = """
            SELECT id, email, name, confirmed_at FROM meuml.users WHERE email = :email  
        """
        user = self.fetchone(query, {'email': self.data['email']})

        if user is None:
            self.abort_json(
                {
                    'errors': ['Não foi possível encontrar usuário com email informado.'],
                    'message': 'Email inválido.'
                },
                404
            )

        if user['confirmed_at'] is not None:
                   self.abort_json(
                {
                    'errors': ['O email informado já foi confirmado.'],
                    'message': 'Email inválido.'
                },
                409
            )     

        self.send_confirmation_email(user['id'], user['email'], user['name'])

        return self.return_success("Em breve você receberá um novo email informando seu código de confirmação")
