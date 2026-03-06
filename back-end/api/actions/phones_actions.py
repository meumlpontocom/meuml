import traceback
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.schema.phone_schema import PhoneSchema
from libs.whatsapp_api.whatapp_api import WhatsappApi
from psycopg2.errors import ForeignKeyViolation
from random import choice
from string import digits
from werkzeug.exceptions import HTTPException


class PhonesActions(Actions):
    @jwt_required
    @prepare
    def index(self):
        try:
            query = f"""
                SELECT
                    ph.id,
                    ph.date_created,
                    ph.date_modified,
                    ph.is_confirmed,
                    ph.country_code,
                    ph.area_code,
                    ph.phone_number,
                    ph.topics
                FROM meuml.phones ph
                WHERE ph.user_id = :user_id
            """
            phones = self.fetchall(query, {'user_id': self.user['id']})

            return self.return_success(data=phones)

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
        self.validate(PhoneSchema())

        try:
            if self.data['country_code'] == '55' and len(self.data['phone_number']) != 8 and len(self.data['phone_number']) != 9:
                self.abort_json({
                    'message': f'Números de telefone com DDI do Brasil devem conter 8 ou 9 dígitos',
                    'status': 'error',
                }, 400)

            query = f"""
                SELECT
                    ph.id, ph.date_created, ph.date_modified, ph.is_confirmed,
                    ph.country_code, ph.area_code, ph.phone_number, ph.topics
                FROM meuml.phones ph
                WHERE ph.country_code = :country_code AND ph.area_code = :area_code AND ph.phone_number = :phone_number AND ph.user_id = :user_id
            """
            phone = self.fetchone(query, {
                'country_code': self.data['country_code'],
                'area_code': self.data['area_code'],
                'phone_number': self.data['phone_number'],
                'user_id': self.user['id'],
            })

            if phone:
                self.abort_json({
                    'message': f'Esse número de telefone já foi cadastrado para este usuário',
                    'status': 'error',
                }, 400)

            confirmation_code = ''.join(choice(digits) for _ in range(4))
            response = WhatsappApi.send_text_message_to_phone(
                self.data['country_code'],
                self.data['area_code'],
                self.data['phone_number'],
                'verification_code',
                {'code': confirmation_code, '_button': confirmation_code}
            )
            response_data = response.json()

            if response.status_code != 200 or response_data.get('error'):
                self.abort_json({
                    'message': f'Erro ao enviar código de confirmação, tente novamente mais tarde',
                    'status': 'error',
                }, 502)

            query = """
                INSERT INTO meuml.phones (user_id, country_code, area_code, phone_number, topics, confirmation_code)
                VALUES (:user_id, :country_code, :area_code, :phone_number, :topics, :confirmation_code)
                RETURNING id
            """
            values = {
                'user_id': self.user['id'],
                'country_code': self.data['country_code'],
                'area_code': self.data['area_code'],
                'phone_number': self.data['phone_number'],
                'topics': self.data['topics'],
                'confirmation_code': confirmation_code
            }
            id = self.execute_insert(query, values)

            if not id:
                self.abort_json({
                    'message': f'Erro ao salvar dados',
                    'status': 'error',
                }, 500)

            query = """
                SELECT
                    ph.id, ph.date_created, ph.date_modified, ph.is_confirmed,
                    ph.country_code, ph.area_code, ph.phone_number, ph.topics
                FROM meuml.phones ph
                WHERE ph.id = :id
            """
            phone = self.fetchone(query, {'id': id})

            return self.return_success("Configurações notificações por WhatsApp salvas com sucesso", data=phone)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc())

            self.abort_json({
                'message': f'Erro ao criar novo registro',
                'status': 'error',
                'error': traceback.format_exc(),
            }, 500)


    @jwt_required
    @prepare
    def update(self, id):
        self.validate(PhoneSchema())

        try:
            query = """
                SELECT ph.id, ph.country_code, ph.area_code, ph.phone_number
                FROM meuml.phones ph
                WHERE ph.id = :id AND user_id = :user_id
            """
            phone = self.fetchone(query, {'id': id, 'user_id': self.user['id']})

            if not phone:
                self.abort_json({
                    'message': f'Configuração não encontrada para o ID informado',
                    'status': 'error',
                }, 404)

            modified_phone = None
            if phone['country_code'] != self.data['country_code'] \
            or phone['area_code']    != self.data['area_code'] \
            or phone['phone_number'] != self.data['phone_number']:
                confirmation_code = ''.join(choice(digits) for _ in range(4))
                modified_phone = ', is_confirmed=FALSE, confirmation_code='+confirmation_code
                response = WhatsappApi.send_text_message_to_phone(
                    self.data['country_code'],
                    self.data['area_code'],
                    self.data['phone_number'],
                    'verification_code',
                    {'code': confirmation_code, '_button': confirmation_code}
                )
                response_data = response.json()

                if response.status_code != 200 or response_data.get('error'):
                    self.abort_json({
                        'message': f'Erro ao enviar código de confirmação, tente novamente mais tarde',
                        'status': 'error',
                    }, 502)

            query = f"""
                UPDATE meuml.phones SET
                    date_modified = NOW(),
                    country_code = :country_code,
                    area_code = :area_code,
                    phone_number = :phone_number,
                    topics = :topics {modified_phone if modified_phone else ''}
                WHERE id = :id AND user_id = :user_id
                RETURNING id
            """
            values = {
                'country_code': self.data['country_code'],
                'area_code': self.data['area_code'],
                'phone_number': self.data['phone_number'],
                'topics': self.data['topics'],
                'id': id,
                'user_id': self.user['id'],
            }

            if not self.execute_returning(query, values, raise_exception=True):
                raise Exception

            query = """
                SELECT
                    ph.id, ph.date_created, ph.date_modified, ph.is_confirmed,
                    ph.country_code, ph.area_code, ph.phone_number, ph.topics
                FROM meuml.phones ph
                WHERE ph.id = :id
            """
            phone = self.fetchone(query, {'id': id})

            return self.return_success("Configurações notificações por WhatsApp atualizadas com sucesso", data=phone)

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
            query = """
                DELETE FROM meuml.phones
                WHERE id = :id AND user_id = :user_id
                RETURNING id
            """

            if self.execute_returning(query, {'id': id, 'user_id': self.user['id']}, raise_exception=True):
                return self.return_success("Celular excluído com sucesso")
            else:
                self.abort_json({
                    'message': f'Celular não encontrado',
                    'status': 'error',
                }, 404)

        except HTTPException:
            raise
        except ForeignKeyViolation:
            self.abort_json({
                'message': f'Não foi possível excluir o celular pois ele ainda está em uso',
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
    def resend_code(self, id):
        try:
            query = """
                SELECT ph.id, ph.country_code, ph.area_code, ph.phone_number, ph.is_confirmed, ph.confirmation_code
                FROM meuml.phones ph
                WHERE ph.id = :id AND user_id = :user_id
            """
            phone = self.fetchone(query, {'id': id, 'user_id': self.user['id']})

            if not phone:
                self.abort_json({
                    'message': f'Configuração não encontrada para o ID informado',
                    'status': 'error',
                }, 404)

            if phone['is_confirmed']:
                return self.return_success("Este número de celular já foi confirmado")

            response = WhatsappApi.send_text_message_to_phone(
                phone['country_code'],
                phone['area_code'],
                phone['phone_number'],
                'verification_code',
                {'code': phone['confirmation_code'], '_button': phone['confirmation_code']}
            )
            response_data = response.json()

            if response.status_code != 200 or response_data.get('error'):
                self.abort_json({
                    'message': f'Erro ao enviar código de confirmação, tente novamente mais tarde',
                    'status': 'error',
                }, 502)

            return self.return_success("Código de Confirmação reenviado com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc())

            self.abort_json({
                'message': f'Erro ao confirmar número',
                'status': 'error',
            }, 500)


    @jwt_required
    @prepare
    def confirm_number(self, id, code):
        try:
            query = """
                SELECT ph.id, ph.is_confirmed, ph.confirmation_code
                FROM meuml.phones ph
                WHERE ph.id = :id AND user_id = :user_id
            """
            phone = self.fetchone(query, {'id': id, 'user_id': self.user['id']})

            if not phone:
                self.abort_json({
                    'message': f'Configuração não encontrada para o ID informado',
                    'status': 'error',
                }, 404)

            if phone['confirmation_code'] != code:
                self.abort_json({
                    'message': f'Código de confirmação incorreto!',
                    'status': 'error',
                }, 403)

            query = """
                UPDATE meuml.phones
                SET date_modified = NOW(), is_confirmed = True
                WHERE id = :id AND user_id = :user_id
                RETURNING id
            """

            if not self.execute_returning(query, {'id': id, 'user_id': self.user['id']}, raise_exception=True):
                raise Exception

            return self.return_success("Número confirmado com sucesso")

        except HTTPException:
            print(HTTPException)
            raise
        except:
            print(traceback.format_exc())

            self.abort_json({
                'message': f'Erro ao confirmar número',
                'status': 'error',
            }, 500)


    @jwt_required
    @prepare
    def allowed_topics(self):
        try:
            query = f"""
                SELECT tl.name, tl.key
                FROM meuml.tools tl
                JOIN meuml.module_tasks mt ON mt.tool_id = tl.id
                JOIN meuml.modules mo ON mo.id = mt.module_id
                JOIN meuml.access_types ac ON ac.id = mt.access_type
                WHERE
                    tl.key IN ('whatsapp-auth','whatsapp-orders','whatsapp-order-messages','whatsapp-questions')
                    AND (
                        ac.title = 'Free' OR
                        (ac.title = 'Subscription' AND mo.id IN (
                            SELECT unnest(regexp_split_to_array(
                                    concat_ws(
                                        ',',
                                        string_agg(distinct su.modules::varchar,','),
                                        string_agg(distinct pm.module_id::varchar,',')
                                    ),
                                    ','
                                ))::integer
                            FROM meuml.subscriptions su
                            LEFT JOIN meuml.package_modules pm ON pm.package_id = su.package_id
                            WHERE
                                su.user_id = {self.user['id']}
                                AND su.expiration_date > now()
                            GROUP BY su.user_id
                        ))
                    )
            """
            allowed_topics = self.fetchall(query)

            return self.return_success(data=allowed_topics)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc())

            self.abort_json({
                'message': f'Erro ao carregar lista de tópicos com assinatura ativada',
                'status': 'error',
            }, 500)
