# import cx_Oracle
import json
import os
import hashlib
import subprocess
import sys
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import create_jwt, get_jwt_identity, jwt_required
from libs.actions.actions import Actions
from libs.database.models.users import Users
from libs.database.models.processes import Processes
from libs.decorator.prepare import prepare
from libs.mail.Mail import Mail
from libs.mail.mail_templates.alterar_senha import AlterarSenha
from libs.queue.queue import app as queue
from libs.payments.payment_helper import verify_tool_access, rollback_credits_transaction, InsufficientCredits, use_credits
from math import ceil, floor
from requests_oauthlib import OAuth2Session

from libs.schema.blacklist_schema import (
    BlacklistUnblockSchema,
    BlacklistMotivesSchema,
    BlacklistNewMotiveSchema,
    BlacklistBlockSchema
)

class BlacklistActions(Actions):

    @jwt_required
    @prepare
    def ajax_blacklist_unblock(self):

        self.validate(BlacklistUnblockSchema())

        tool = self.get_tool('unblock-user')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], tool=tool, any_account=True)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        block_id = self.data['block_id']
        bids = int(self.data['bids'])
        questions = int(self.data['questions'])

        blacklist_unblock = queue.app.signature('short_running:blacklist_unblock_customer')
        blacklist_unblock.delay(seller_id=self.user['id'], block_id=block_id, bids=bids,
                                questions=questions)

        return self.return_success('Desbloqueio sendo efetuado', {"status":"O usuário está sendo desbloqueado, conferir em Processos."})


    @jwt_required
    @prepare
    def ajax_blacklist_block(self):
        if request.method == 'GET':
            if 'account_id' not in request.args:
                return self.abort_json(
                    {
                        'errors': "Informe o argumento 'account_id' para fazer a listagem dos bloqueios",
                        'message': "Não foi possível importar a lista de bloqueio"
                    },
                    422
                )

            account_id = request.args['account_id']
            if account_id == '':
                return self.abort_json(
                    {
                        'errors': "Informe pelo menos um argumento em 'account_id' para fazer a listagem dos bloqueios",
                        'message': "Não foi possível importar a lista de bloqueio"
                    },
                    422
                )

            count_query = 'SELECT count(bb.id) FROM '
            select_query = "SELECT bb.*, (bo.account_id/bo.account_id) as bids, (bq.account_id/bq.account_id) as questions, coalesce(bc.external_name, '-') as external_name FROM "
            query = f"""
                meuml.blacklists bb 
                LEFT JOIN meuml.blacklist_orders bo 
                    ON bo.account_id = bb.account_id AND bo.customer_id = bb.customer_id 
                LEFT JOIN meuml.blacklist_questions bq 
                    ON bq.account_id = bb.account_id AND bq.customer_id = bb.customer_id 
                LEFT JOIN meuml.customers bc 
                    ON bc.id = bb.customer_id 
                WHERE bb.account_id IN ({account_id})
            """
            values = {'user_id': self.user['id']}
            args = request.args

            sortOrder = None
            sortName = None
            filter = None

            if 'filter' in request.args:
                filter = request.args['filter']

            if filter is not None:
                query += f' and external_id = :external_id'
                values['external_id'] = filter

            filterName = None
            filterValue = None

            if 'filterName' in request.args:
                filterName = request.args['filterName']

            if 'filterValue' in request.args:
                filterValue = request.args['filterValue']

            if filterValue is not None and filterName is not None:
                query += f' and bb.{filterName} = \'{filterValue}\''
                #values['external_id'] = filter

            count_query += query
            total = self.fetchone(count_query, values)['count']

            if 'page' not in args:

                if 'offset' in args:
                    offset = int(args['offset'])
                else:
                    offset = 0

                if 'limit' in args:
                    limit = int(args['limit'])
                else:
                    limit = 50
            else:
                limit = 50
                offset = (int(request.args['page']) - 1) * limit

            if 'sortOrder' in request.args:
                sortOrder = request.args['sortOrder']

            if 'sortName' in request.args:
                sortName = request.args['sortName']

            query += ' order by '
            if sortName is not None and sortOrder is not None:
                query += f' :sortName :sortOrder, '

            query += f' id DESC'

            query += f' offset :offset rows fetch next :limit rows only'

            select_query += query


            if 'sortOrder' in request.args:
                values['sortOrder'] = sortOrder

            if 'sortName' in request.args:
                values['sortName'] = sortName
            values['offset'] = offset
            values['limit'] = limit

            data = self.fetchall(select_query, values)

            actual_page = floor(offset / limit)
            if actual_page == 0:
                actual_page = 1

            next_page = actual_page + 1
            previous_page = actual_page - 1
            if previous_page < 1:
                previous_page = None

            pages = ceil(total / limit)

            first_page = 1

            meta = {
                'total': total,
                'offset': offset,
                'limit': limit,
                'pages': pages,
                'page': actual_page,
                'next_page': next_page,
                'previous_page': previous_page,
                'last_page': pages,
                'first_page': first_page
            }

            if len(data) == 0:
                return self.return_success(message='Nenhum bloqueio localizado', data=data, meta=meta)
            else:
                return self.return_success(data=data, meta=meta)

        if request.method == 'POST':

            self.validate(BlacklistBlockSchema())

            tool = self.get_tool('block-user')
            accounts_id = [block['account_id'] for block in self.data]
            code, message = verify_tool_access(action=self, user_id=self.user['id'], accounts_id=accounts_id, tool=tool)

            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            if tool is None:
                self.abort_json(
                    {
                        'errors': [
                            'Não é possível criar um bloqueio sem ferramenta'
                        ],
                        'message': "Não foi possível bloquear o usuário"
                    },
                    422
                )

            blocks = self.data

            if len(blocks) > 50:
                blacklist_mass_block = queue.signature('short_running:blacklist_block_customer_list')
                blacklist_mass_block.delay(
                    user_id=self.user['id'],
                    blocks=blocks
                )
            else:
                query = 'select id FROM meuml.accounts where USER_ID = :user_id'
                accounts = self.fetchall(query, {'user_id': self.user['id']})
                for account in accounts:
                    l = 0
                    for block in blocks:
                        if account['id'] == block['account_id']:                              
                            len_data = 1 if block['bids'] ^ block['questions'] else 2
                            len_s = len([block for block in blocks if block['account_id'] == account['id'] and len(str(block['customer_id'])) > 3 ])
                            len_data = len_s * len_data

                            if l == 0:
                                process_id = self.create_process(block['account_id'], tool['id'], tool['price'], len_data)
                            l += 1
                        
                            if len(str(block['customer_id'])) > 3:
                                blacklist_mass_block = queue.signature('short_running:blacklist_block_customer')
                                blacklist_mass_block.delay(
                                    account_id=block['account_id'],
                                    motive_id = block['motive_id'],
                                    motive_description = block['motive_description'] if 'motive_description' in block else 'Motivo não especificado',
                                    customer_id = block['customer_id'],
                                    bids = int(block['bids']),
                                    questions  = int(block['questions']),
                                    blacklist_id=0,
                                    process_id = process_id,
                                    list_block_c = False
                                )
            return self.return_success('Bloqueio em processamento', {"status":"Os usuários estão sendo bloqueados, conferir em Processos.", "process": 0 })

    @jwt_required
    @prepare
    def ajax_blacklist_motives(self):
        if request.method == 'GET':
            query = 'select * FROM meuml.blacklist_motives where id > :id'

            motives = self.fetchall(query, {"id":0})

            return self.return_success('Lista de motivos de usuários bloqueados', motives)

        if request.method == 'POST':

            self.validate(BlacklistNewMotiveSchema())
            name = self.data['name']
            description = self.data['description']

            query = 'select * FROM meuml.blacklist_motive where name = :name'
            value = {
                'name': name
            }
            motive = self.fetchone(query, value)

            if motive is not None:
                self.abort_json(
                    {
                        'errors':[
                            'Ja existe um motivo com o mesmo nome, escolha outro nome de motivo'
                        ],
                        'message': "Não foi possível salvar o motivo de bloqueio"
                    },
                    422
                )
