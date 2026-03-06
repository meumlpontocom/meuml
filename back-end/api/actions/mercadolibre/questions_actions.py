import datetime
import json
from flask import jsonify, request
from flask_jwt_simple import jwt_required, get_jwt_identity
from flask_rest_jsonapi.exceptions import ObjectNotFound
from libs.actions.actions import Actions
from workers.helpers import search_customer_account
from workers.loggers import create_process, create_process_item, update_process_item
from libs.decorator.prepare import prepare
from libs.enums.access_type import AccessType   
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access, rollback_credits_transaction, InsufficientCredits, use_credits, user_subscripted_accounts
from libs.queue.queue import app as queue
from marshmallow.fields import String
from sqlalchemy.orm.exc import NoResultFound
from webargs.flaskparser import use_args
from workers.loggers import create_process, create_process_item, update_process_item

from libs.schema.questions_schema import (
    QuestionAnswerSchema,
    BlockUserSchema
)

class QuestionsActions(Actions):


    @jwt_required
    @prepare
    def get_all_questions_from_account(self, account):
        self.account_id = account['account_id']
        self.account = account
        self.get_questions(account)

        self.get_advertisings_from_questions(self.questions, account)

        response = []
        c_questions = 0
        for advertising in self.advertisings:
            if 'id' not in advertising:
                continue

            advertising_id = advertising['id']
            advertising_rs = {}
            advertising_rs['questions'] = []

            advertising_rs['title'] = advertising['title']
            # advertising_rs['id'] = advertising['id']
            advertising_rs['price'] = self.parse_price(advertising['price'])
            advertising_rs['quantity_available'] = str(advertising['available_quantity'])
            advertising_rs['listing_type'] = self.get_listing_type_value(advertising['listing_type_id'])
            advertising_rs['expires_at'] = str(advertising['expiration_time'])
            advertising_rs['thumbnail'] = str(advertising.get('secure_thumbnail')) if len(advertising.get('secure_thumbnail',''))>0  else str(advertising['thumbnail'])
            advertising_rs['accountName'] = self.account['name']
            advertising_rs['account_id'] = self.account_id
            advertising_rs['shipping_mode'] = advertising.get('shipping', {}).get('mode')
            advertising_rs['free_shipping'] = advertising.get('shipping', {}).get('free_shipping')

            for question in self.questions:
                if question['item_id'] == advertising_id:
                    c_questions += 1
                    question['lapsed_time'] = self.calculate_elapsed_time(question['date_created'][:-6])
                    advertising_rs['questions'].append(question)

            response.append(advertising_rs)

        rs = {}
        rs['advertisings'] = response
        rs['total_questions'] = c_questions
        rs['total_advertisings'] = len(response)

        return rs

    @jwt_required
    @prepare
    def get_all_questions(self):
        query = """
            SELECT id AS "account_id", id, status, access_token_expires_at, access_token, refresh_token, name 
            FROM meuml.accounts 
            WHERE user_id = :user_id and status=1 
        """
        values = {'user_id': self.user['id']}
        
        if 'account_id' in request.args and len(request.args['account_id']) > 0:
            accounts_id = request.args['account_id'].split(',')

            for i, account_id in enumerate(accounts_id):
                values[str(i)] = int(account_id)
            query += f' and id IN (:{",:".join(values.keys())})'
        
        accounts = self.fetchall(query, values)

        if len(accounts) == 0:
           code, message = 402, 'Não foram encontradas contas ou perderam autenticação, favor verificar!'
           self.abort_json({
               'message': message,
               'status': 'error',
           }, code)
        
        subscripted_accounts = user_subscripted_accounts(self, self.user['id'])
        accounts = [account for account in accounts if account['id'] in subscripted_accounts]

        if len(accounts) == 0:
           code, message = 402, 'Essa funcionalidade é exclusiva para contas assinantes do MeuML v2. Faça já sua assinatura e obtenha acesso'
           self.abort_json({
               'message': message,
               'status': 'error',
           }, code)

        accounts_id = [account['id'] for account in accounts]
        tool = self.get_tool('import-questions')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=accounts_id, tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        try:
            process_item_ids = []
            response = {}
            questions = []
            failed_accounts = []
            
            for account in accounts:
                process_id = create_process(account['account_id'], self.user['id'], tool['id'], tool['price'], 1, self)
                process_item_id = create_process_item(process_id, account['account_id'], account['account_id'], self, f'Sincronizando perguntas #{account["account_id"]} - Em Andamento.', tool['id'])
                process_item_ids.append(process_item_id)
                
                if self.validate_account(account) and use_credits(self, self.user['id'], process_item_id, tool['price'], tool):
                    response[str(account['account_id'])] = self.get_all_questions_from_account(account)
                    questions += self.questions
                    update_process_item(process_item_id, True, True, self, f'Sincronizando perguntas #{account["account_id"]} - Sincronizado com sucesso.')
                else:
                    failed_accounts.append(account['name'])
                    update_process_item(process_item_id, False, False, self, f'Sincronizando perguntas #{account["account_id"]} - Créditos Insuficientes.')

            if len(failed_accounts) > 0:
                error_message = f"não foi possível renovar o token de acesso da(s) conta(s): {', '.join(failed_accounts)}, por favor exclua e adicione novamente esta(s) conta(s)"
                return self.return_success(f"Foram encontradas {str(len(response))} questões das contas ativas. No entanto, {error_message}", response)

            self.questions = questions
            return self.return_success('Foram encontradas ' + str(len(self.questions)) + ' questões', response)

        except Exception as e:
            print(e)
            if tool['access_type'] == AccessType.credits:
                for process_item_id in process_item_ids:
                    rollback_credits_transaction(self, process_item_id, self.user['id'], tool['price'])
                    update_process_item(process_item_id, False, False, self, f'Sincronizando perguntas - Erro ao sincronizar.')

            self.abort_json({
                'message': f'Aconteceu algo inesperado ({str(e)})',
                'status': 'error',
            }, 500)
            

    @jwt_required
    @use_args({'account_id': String()})
    @prepare
    def get_questions_grouping_by_advertising(self,args):

        if 'account_id' in args:
            self.account_id = args['account_id']
        else:
            return self.abort_json({
            'message': 'Infome um account_id na url para localizar perguntas de conta informada',
            'status': 'error',
        }, 404)

        query = 'select id as "account_id", status, access_token_expires_at, access_token, refresh_token, name FROM meuml.accounts where user_id = :user_id and id = :account_id'
        values = {
            'user_id': self.user['id'],
            'account_id': args['account_id']
        }
        account = self.fetchone(query, values)
        self.account = account

        self.validate_account_or_abort(account)

        self.get_questions(account)

        self.get_advertisings_from_questions(self.questions, account)


        response = []
        c_questions = 0
        for advertising in self.advertisings:
            advertising_id = advertising['id']

            advertising_rs = {}
            advertising_rs['questions'] = []

            advertising_rs['title'] = advertising['title']
            advertising_rs['id'] = advertising['id']
            advertising_rs['price'] = self.parse_price(advertising['price'])
            advertising_rs['quantity_available'] = str(advertising['available_quantity'])
            advertising_rs['listing_type'] = self.get_listing_type_value(advertising['listing_type_id'])
            advertising_rs['expires_at'] = str(advertising['expiration_time'])
            advertising_rs['thumbnail'] = str(advertising.get('secure_thumbnail')) if len(advertising.get('secure_thumbnail',''))>0  else str(advertising['thumbnail'])
            advertising_rs['accountName'] = self.account['name']
            advertising_rs['account_id'] = self.account_id

            for question in self.questions:
                if question['item_id'] == advertising_id:
                    c_questions += 1
                    question['lapsed_time'] = self.calculate_elapsed_time(question['date_created'][:-6])
                    advertising_rs['questions'].append(question)

            response.append(advertising_rs)

        rs = {}
        rs['data'] = {}
        rs['data']['advertisings'] = response
        rs['data']['total_questions'] = c_questions
        rs['data']['total_advertisings'] = len(response)
        return self.return_success('Foram encontrados ' + str(len(response)) + ' anúncios com questões', rs)
        #return jsonify({'meta':{'msg':'Foram encontrados ' + str(len(response)) + ' anuncios com questões'}, 'data': response})

    @jwt_required
    @prepare
    def answer_question(self):
        self.validate(QuestionAnswerSchema())

        if 'account_id' in self.data:
            self.account_id = self.data['account_id']

        response = self.send_answer(self.data)

        return jsonify({'meta':{'msg':'Pergunta respondida com sucesso'},'data': response})

    @jwt_required
    @prepare
    def block_user_to_questions(self,question_id: str):
        self.validate(BlockUserSchema())

        accounts_id = [self.data['account_id']]
        tool = self.get_tool('block-user')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=accounts_id, tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        process_id = create_process(self.data['account_id'], self.user['id'], tool['id'], tool['price'], 1, self)
        process_item_id = create_process_item(process_id, self.data['account_id'], self.data['user_id'], self, f'Bloqueando comprador #{self.data["user_id"]} - Em Andamento.', tool['id'])
        
        if not use_credits(self, self.user['id'], process_item_id, tool['price'], tool):
            update_process_item(process_item_id, False, False, self, f'Bloqueando comprador #{self.data["user_id"]} - Créditos insuficientes')
            self.abort_json({
                'message': 'Créditos insuficientes',
                'status': 'error',
            }, 402)

        code = None
        try:
            bids = int(request.args.get('bids', 0))
            questions = int(request.args.get('questions', 0))
            
            if 'account_id' in self.data:
                self.account_id = self.data['account_id']

            query = 'select * from meuml.ACCOUNTS where id = :account_id and user_id = :user_id'
            values = {
                'account_id': self.account_id,
                'user_id': self.user['id']
            }

            self.account = self.fetchone(query, values)

            if self.account is None:
                self.abort_json({
                    'message': 'Erro ao localizar account' ,
                    'status': 'error',
                }, 404)

            self.refresh_token(self.account, self.account['refresh_token'])
            
            ml_api = MercadoLibreApi(access_token=self.account['access_token'])

            data = {'user_id':self.data['user_id']}
            seller_id = self.account['id']
            user_id = self.data['user_id']
            status_code = 0
            status_code_bids = 0

            if bids == 1:
                response_bids = ml_api.post(f'/users/{seller_id}/order_blacklist', json={
                    'user_id':self.data['user_id']
                })
                status_code_bids = response_bids.status_code

            if questions == 1:
                response = ml_api.post(f'/users/{seller_id}/questions_blacklist',json=data)
                status_code = response.status_code
                #if status_code in [200, 201]:
                #    fetch_account_question_number = queue.signature('short_running:fetch_account_question_number')
                #    fetch_account_question_number.delay(account_id=self.account['id'])

            if (status_code == 200 or status_code == 201) and (status_code_bids == 200 or status_code_bids == 201):
                code = 200
                search_customer_account(None, user_id, self, self.account['access_token'])
                query_insert = 'insert into meuml.blacklist_blocks (user_id, account_id, customer_id, bids, questions) values (:user_id, :account_id, :customer_id, :bids, :questions) returning id'
                values = {
                    'user_id': self.account['user_id'],
                    'account_id': self.account['id'],
                    'customer_id': user_id,
                    'bids': bids,
                    'questions': questions,
                    }
                self.execute_insert(query_insert, values)
                responses = {
                    'bids': response_bids.json(),
                    'questions': response.json()
                }
                update_process_item(process_item_id, responses, True, self, f'Bloqueando comprador  #{self.data["user_id"]} - Bloqueio para compras e perguntas realizado com sucesso')
                return self.return_success('Usuário bloqueado para compras e perguntas com sucesso')

            elif status_code == 200 or status_code == 201:
                code = status_code_bids
                search_customer_account(None, user_id, self, self.account['access_token'])
                query_insert = 'insert into meuml.blacklist_blocks (user_id, account_id, customer_id, bids, questions) values (:user_id, :account_id, :customer_id, :bids, :questions) returning id'
                values = {
                    'user_id':self.account['user_id'],
                    'account_id':self.account['id'],
                    'customer_id':user_id,
                    'bids': 0,
                    'questions': questions,
                }
                self.execute_insert(query_insert, values)
                update_process_item(process_item_id, response.json(), True, self, f'Bloqueando comprador  #{self.data["user_id"]} -  Bloqueio para perguntas realizado com sucesso')
                return self.return_success('Usuário bloqueado para perguntas com sucesso')

            elif status_code_bids == 200 or status_code_bids == 201:
                code = status_code
                search_customer_account(None, user_id, self, self.account['access_token'])
                query_insert = 'insert into meuml.blacklist_blocks (user_id, account_id, customer_id, bids, questions) values (:user_id, :account_id, :customer_id, :bids, :questions) returning id'
                values = {
                    'user_id':self.account['user_id'],
                    'account_id':self.account['id'],
                    'customer_id':user_id,
                    'bids': bids,
                    'questions': 0,
                }
                self.execute_insert(query_insert,values)
                update_process_item(process_item_id, response_bids.json(), True, self, f'Bloqueando comprador  #{self.data["user_id"]} -  Bloqueio para compras realizado com sucesso')
                return self.return_success('Usuário bloqueado para compras com sucesso')

            else:
                code = status_code
                self.abort_json({
                    'message':'Não foi possivel concluir a requisição',
                    'status':'error',
                })
        except Exception as e:
            print(e)
            self.abort_json({
                'message': 'Aconteceu algo inesperado',
                'status': 'error',
            }, 500)
        finally:
            if code != 200:
                credits_msg=''
                if tool['access_type'] == AccessType.credits:
                    rollback_credits_transaction(self, process_item_id, self.user['id'], tool['price'])
                    credits_msg = ' (crédito restituído)'
                update_process_item(process_item_id, False, False, self, f'Bloqueando comprador #{data["user_id"]} para perguntas - Erro ao bloquear usuário {credits_msg}')


    @jwt_required
    @prepare
    def delete_question(self,question_id : str):
        #question_id = question_id['question_id']
        
        if 'account_id' in request.args:
            self.account_id = request.args['account_id']

        query = 'select * from meuml.ACCOUNTS where id = :account_id and user_id = :user_id'
        values = {
            'account_id': self.account_id,
            'user_id': self.user['id']
        }

        self.account = self.fetchone(query, values)

        if self.account is None:
            self.abort_json({
                'message': 'Erro ao localizar account' ,
                'status': 'error',
            }, 404)

        self.refresh_token(self.account, self.account['refresh_token'])

        ml_api = MercadoLibreApi(access_token=self.account['access_token'])

        accounts_id = [self.account['id']]
        tool = self.get_tool('delete-question')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=accounts_id, tool=tool, total_items=1)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        process_id = create_process(self.account['id'], self.user['id'], tool['id'], tool['price'], 1, self)
        process_item_id = create_process_item(process_id, self.account['id'], question_id, self, f'Pergunta #{question_id} - Exclusão em andamento.', tool['id'])

        if not use_credits(self, self.user['id'], process_item_id, tool['price'], tool):
            update_process_item(process_item_id, False, False, self, f'Pergunta #{question_id} - Créditos insuficientes')
            self.abort_json({
                'message': 'Créditos insuficientes',
                'status': 'error',
            }, 402)

        code = None
        try:
            response = ml_api.delete(f'/questions/{question_id}')
            code = response.status_code

            if response.status_code == 200:
                update_process_item(process_item_id, response.json(), True, self, f'Pergunta #{question_id} - Excluída com sucesso.')
                #fetch_account_question_number = queue.signature('short_running:fetch_account_question_number')
                #fetch_account_question_number.delay(account_id=self.account['id'])
                return self.return_success('Pergunta deletada com sucesso.', response.json())

            self.abort_json({
                'message': 'Erro ao comunicar com o Mercado Livre: ' + response.text,
                'status': 'error',
            }, response.status_code)
        except Exception as e:
            print(e)
            self.abort_json({
                'message': 'Aconteceu algo inesperado',
                'status': 'error',
            }, 500)
        finally:
            if code != 200:
                credits_msg=''
                if tool['access_type'] == AccessType.credits:
                    rollback_credits_transaction(self, process_item_id, self.user['id'], tool['price'])
                    credits_msg = ' (crédito restituído)'
                update_process_item(process_item_id, False, False, self, f'Pergunta #{question_id} - Excluída com sucesso {credits_msg}')
                

    def get_user_nickname(self,ml_api, user_id):

        response = ml_api.get(f'/users/{user_id}')

        user_data = response.json()

        if response.status_code == 200:
            return user_data.get('nickname'), user_data.get('points'), user_data.get('buyer_reputation', {})

        return "Nickname não localizado", 0, 0
    """
        Faz a busca das perguntas na API do mercado livre
        Url: https://api.mercadolibre.com/questions/{question_id}
        Doc: https://developers.mercadolivre.com.br/pt-br/perguntas-e-respostas#modal4
    """
    def fetch_questions_answers(self, ml_api: MercadoLibreApi, question_id: str):
        # XXX: token could expire here, validate, and refresh if need
        # could raise a exception, and the upper loop could handle it
        response = ml_api.get(f'/questions/{question_id}')
        return response.json()

    """
        Envia a reposta da pergunta para a API do mercado livre
        Url: https://api.mercadolibre.com/answers
        Doc: https://developers.mercadolivre.com.br/pt-br/perguntas-e-respostas#modal1
    """
    def send_answer(self,data : []):

        query = 'select * from meuml.ACCOUNTS where id = :account_id and user_id = :user_id'
        values = {
            'account_id': self.account_id,
            'user_id': self.user['id']
        }
        account = self.fetchone(query, values)
        self.account = account

        if self.account is None:
            self.abort_json({
                'message': 'Erro ao localizar account' ,
                'status': 'error',
            }, 404)

        #self.refresh_token(account)

        ml_api = MercadoLibreApi(access_token=account['access_token'])

        # XXX: token could expire here, validate, and refresh if need
        # could raise a exception, and the upper loop could handle it
        answer_data = {}
        answer_data['question_id'] = str(data['question_id'])
        answer_data['text'] = data['text']

        tool = self.get_tool('answer-question')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=[account['id']], tool=tool)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        question_id = str(data['question_id'])
        process_id = create_process(self.account['id'], self.user['id'], tool['id'], tool['price'], 1, self)
        process_item_id = create_process_item(process_id, self.account['id'], question_id, self, f'Responder Pergunta #{question_id} - Em Andamento.', tool['id'])

        if not use_credits(self, self.user['id'], process_item_id, tool['price'], tool):
            update_process_item(process_item_id, False, False, self, f'Responder Pergunta #{question_id} - Créditos insuficientes')
            self.abort_json({
                'message': 'Créditos insuficientes',
                'status': 'error',
            }, 402)

        code = None
        try:
            response = ml_api.post(f'/answers', json=answer_data)
            code = response.status_code

            if code == 200:
                self.decrease_unanswered_questions(self.account['id'])

            return response.json() if response.status_code == 200 else self.abort_json({
                    'message': 'Não foi possível salvar a resposta da pergunta',
                    'status': 'error',
                }, 400)
        except Exception as e:
            print(e)
        finally:
            if code != 200:
                credits_msg=''
                if tool['access_type'] == AccessType.credits:
                    rollback_credits_transaction(self, process_item_id, self.user['id'], tool['price'])
                    credits_msg = ' (crédito restituído)'
                update_process_item(process_item_id, False, False, self, f'Responder Pergunta #{question_id} - Erro ao responder pergunta {credits_msg}')


    """
        Faz a busca das questões armazenadas no banco de dados
    """
    def get_questions(self, account):
        ml_api = MercadoLibreApi(access_token=self.account['access_token'])

        questions_data = []

        questions = self.fetch_questions(ml_api)
        if len(questions) > 0:
            for item in questions:
                for question in item['questions']:
                    nickname, score, buyer_reputation = self.get_user_nickname(ml_api,question['from']['id'])
                    question['nickname'] = nickname
                    question['score'] = score
                    question['buyer_reputation'] = buyer_reputation
                    question['from'] = question['from']['id']
                    question['deleted_from_listing'] = int(question['deleted_from_listing'])
                    questions_data.append(question)

        self.questions = questions_data


    def count_questions(self, account= None):

        #self.refresh_token(account, account['refresh_token'])

        ml_api = MercadoLibreApi(access_token=self.account['access_token'])

        rs = self.fetch_questions(ml_api)

        if 'total' in rs:
            return rs['total']

        return 0

    def fetch_questions(self, ml_api, status: str = 'UNANSWERED'):

        # could raise a exception, and the upper loop could handle it
        limit = 50
        offset = 0
        response_data_all = []
        while True:
            response = ml_api.get(
                f'/my/received_questions/search',
                params={
                    'status': status,
                    'limit': limit,
                    'offset': offset,
                }
            )

            if response.status_code != 200:
                break

            offset += limit

            response_data = response.json()

            if 'questions' not in response_data:
                return []

            total = response_data['total']

            response_data_all.append(response_data)

            if offset >= total:
                break

        return response_data_all


    def calculate_elapsed_time(self,date):
        # Normalize microseconds to 6 digits (handle nanoseconds)
        # Python's %f only supports up to 6 digits, but some APIs return nanoseconds (9 digits)
        if '.' in date and 'T' in date:
            # Split on the decimal point in the time portion
            parts = date.split('.')
            if len(parts) == 2:
                # Extract only the first 6 digits after the decimal, discard the rest
                microseconds_part = parts[1]
                # Take only first 6 digits, pad with zeros if needed
                normalized_microseconds = microseconds_part[:6].ljust(6, '0')
                # Reconstruct the date string with normalized microseconds
                date = f"{parts[0]}.{normalized_microseconds}"
        
        elapsed = str(
            datetime.datetime.now() - datetime.datetime.strptime(date, '%Y-%m-%dT%H:%M:%S.%f'))
        elapsed_exp = elapsed.split('days')

        if len(elapsed_exp) > 1:
            days = elapsed_exp[0]
            if int(days) >= 31:
                elapsed_text = 'Um mês atrás'
            elif int(days) > 62:
                elapsed_text = 'A ' + str((days / 30)) + ' meses atrás'
            elif int(days) < 31:
                elapsed_text = 'A ' + str(days) + ' dias atrás'
        else:
            elapsed_exp = elapsed.split(':')
            if elapsed_exp[0] == '00':
                elapsed_text = 'A ' + str(elapsed_exp[1]) + ' minutos atrás'
            if elapsed_exp[0] != '00':
                elapsed_text = 'A ' + str(elapsed_exp[0]) + ' horas atrás'
        return elapsed_text


    def get_advertisings_from_questions(self,questions, account):
        #try:
        #    self.advertisings: Advertising = db_session.query(Advertising).filter(
        #        Advertising.external_id.in_(questions_ids)
        #    ).all()
        #except NoResultFound:
        #    raise ObjectNotFound(f'Impossível localizar anúncios')

        ml_api = MercadoLibreApi(access_token=self.account['access_token'])

        advertising_response_data = []

        used_ids = []

        for question in questions:

            if question['item_id'] not in used_ids:

                advertising_response = ml_api.get(f'/items/' + question['item_id'])

                if advertising_response.status_code == 403:
                    access_token = self.refresh_token(account=account)
                    if access_token == False:
                        self.abort_json({
                            'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                            'status': 'error',
                        }, 400)
                    else:
                        access_token = access_token['access_token']

                    advertising_response = ml_api.get(f'/items/' + question['item_id'])

                advertising_response_data.append(advertising_response.json())

                used_ids.append(question['item_id'])

        self.advertisings = advertising_response_data

    def get_listing_type_value(self,listing_type_id):

        if listing_type_id == 'gold_special':
            return 'Anúncio Clássico'
        elif listing_type_id == 'gold_pro':
            return 'Anúncio Premium'
        else:
            return 'Anúncio Gratuíto'

    def parse_price(self,price):
        price = str(price)
        if '.' in price:
            spl = price.split('.')
            if len(spl[1]) == 1:
                rs_value = str(spl[0])
                spl = str(spl[1]) + '0'
                price = rs_value + ',' + str(spl)
            else:
                price = price.replace('.', ',')
        else:
            price = price + ',00'
        return 'R$ ' + price


    def decrease_unanswered_questions(self, account_id):
        query = """
            UPDATE meuml.questions 
                SET unanswered_questions = unanswered_questions - 1 
                WHERE account_id = :account_id
        """
        self.execute(query, {'account_id': account_id})
