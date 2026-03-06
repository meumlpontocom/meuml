import hashlib
import os
import subprocess
import sys

from datetime import datetime, timedelta

from flask import request, redirect
from flask_jwt_simple import create_jwt, get_jwt_identity, jwt_required
from math import ceil, floor
from libs.actions.actions import Actions
from libs.database.models.users import Users
from libs.database.models.blacklist_lists import BlacklistLists
from libs.decorator.prepare import prepare
from libs.enums.access_type import AccessType   
from libs.mail.Mail import Mail
from libs.mail.mail_templates.alterar_senha import AlterarSenha
from libs.queue.queue import app as queue
from libs.payments.payment_helper import verify_tool_access, rollback_credits_transaction, InsufficientCredits, use_credits
from requests_oauthlib import OAuth2Session

from libs.schema.blacklist_schema  import (
    BlacklistListFromBlockSchema,
    BlacklistBlockSchema,
    BlacklistListBlockSchema,
    BlacklistAddCustomerSchema,
    BlacklistListShareSchema
)

class BlacklistListActions(Actions):

    @jwt_required
    @prepare
    def ajax_blacklist_new_list_from_blocks(self):

        self.validate(BlacklistListFromBlockSchema())

        tool = self.get_tool('crud-blacklist-list')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], tool=tool, any_account=False)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        if len(self.data) == 0:
            self.abort_json(
                {
                    'errors': ['Informe pelo menos uma lista.'],
                    'message': "Não foi possível bloquear pela lista"
                },
                422
            )

        query = 'select * FROM meuml.blacklist_list where name = :name'
        values = {
            'name': self.data[0]['list_name']
        }

        blacklist_list = self.fetchone(query, values)
        if blacklist_list is not None:
            self.abort_json(
                {
                    'errors': ['A nome da lista informada ja existe, use um nome diferente.'],
                    'message': "Não foi possível bloquear pela lista"
                },
                422
            )

        # save list
        blacklist_list: BlacklistLists = self.db_session(BlacklistLists())
        blacklist_list.name = self.data[0]['list_name']
        blacklist_list.description = self.data[0]['list_description']
        blacklist_list.user_id = self.user['id']
        blacklist_list.bids = int(self.data[0]['bids'])
        blacklist_list.questions = int(self.data[0]['questions'])
        blacklist_list.account_id = self.data[0]['account_id']

        blacklist_list = blacklist_list.save()
        if blacklist_list is None:
            self.abort_json({
                'message': 'Erro ao salvar blacklist' ,
                'status': 'error',
            }, 404)

        blacklist_mass_update_list = queue.app.signature(
            'long_running:blacklist_mass_update_customers_list')
        blacklist_mass_update_list.delay(seller_id=self.user['id'], blocks=self.data, blacklist_id=blacklist_list['id'])

        return self.return_success('Lista de bloqueio adicionada e iniciada com sucesso', {"status":"Os usuários estão sendo bloqueados, conferir em Processos."})



    @jwt_required
    def ajax_blacklist_list_account_id(self):
        result = list()
        if request.method == 'GET':
            account_id = request.args['account_id']

            count_query = 'select count(*) '
            select_query = 'select * from '
            query = 'meuml.blacklist_lists where account_id in (:account_id) and user_id = :user_id '

            values = {
                'user_id': self.user['id'],
                'account_id': account_id,
            }

            args = request.args

            sortOrder = None
            sortName = None
            filter = None

            count_query += query
            total = self.fetchone(count_query, values)['(*)']

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
                offset = int(request.args['page']) * limit

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
            values['sortOrder'] = sortOrder
            values['sortName'] = sortName
            values['offset'] = offset
            values['limit'] = limit

            data = self.fetchall(select_query, values)


            actual_page = ceil(offset / limit)
            if actual_page == 0:
                actual_page = 1

            next_page = actual_page + 1
            previous_page = actual_page - 1
            if previous_page < 1:
                previous_page = None

            pages = floor(total / limit)

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

            return self.return_paginate(data, meta)

    @jwt_required
    @prepare
    def ajax_blacklist_new_list(self):

        if request.method == 'GET':
            count_query = 'select count(*) FROM '
            select_query = 'select * FROM '
            query = 'meuml.blacklist_lists where user_id = :user_id '

            values = {
                'user_id': self.user['id'],
            }

            args = request.args

            sortOrder = None
            sortName = None

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
                offset = int(request.args['page']) * limit

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

            actual_page = ceil(offset / limit)
            if actual_page == 0:
                actual_page = 1

            next_page = actual_page + 1
            previous_page = actual_page - 1
            if previous_page < 1:
                previous_page = None

            pages = floor(total / limit)

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

            return self.return_success(data=data,meta=meta)

        if request.method == 'POST':

            self.validate(BlacklistListBlockSchema())

            tool = self.get_tool('crud-blacklist-list')
            code, message = verify_tool_access(action=self, user_id=self.user['id'], tool=tool, any_account=False)

            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            query = 'select * FROM meuml.blacklist_lists where name = :name'
            values = {
                'name': self.data['list_name']
            }

            blacklist_list = self.fetchone(query, values)
            if blacklist_list is not None:
                self.abort_json(
                    {
                        'errors': ['O nome da lista informada já existe, tente um nome diferente.'],
                        'message': "O nome da lista informada já existe, tente um nome diferente."
                    },
                    422
                )

            query_insert_blacklist = 'insert into meuml.blacklist_lists (name, description, user_id) values (:name, :description, :user_id) returning id'
            values = {
                'name': self.data['list_name'],
                'description': self.data['list_description'],
                'user_id': self.user['id']
            }

            blacklist_list = self.execute_insert(query_insert_blacklist, values)

            if blacklist_list is None:
                self.abort_json({
                    'message': 'Erro ao add blacklist list',
                    'status': 'error',
                }, 404)

        return self.return_success('Lista adicionada com sucesso', {"lista":self.data['list_name']})


    @jwt_required
    @prepare
    def ajax_blacklist_list_add_customer(self):
        if request.method == 'POST':
            self.validate(BlacklistAddCustomerSchema())
            list_import = self.data['list_import']

            tool = self.get_tool('crud-blacklist-list')
            code, message = verify_tool_access(action=self, user_id=self.user['id'], tool=tool, any_account=True)

            if code != 200:
                self.abort_json({
                    'message': message,
                    'status': 'error',
                }, code)

            customers = self.data['customers']

            blacklist_add_customer_list = queue.signature(
                'short_running:blacklist_add_customer_list')

            if list_import is False:
                blacklist_add_customer_list.delay(
                    customers=customers,
                    seller_id = self.user['id'],
                    list_name = self.data['list_name']
                )
                return self.return_success('Usuários sendo adicionados a lista', {"status":"Os usuários estão sendo processados em sua lista."})
            else:
                blacklist_add_customer_list.delay(
                    customers=customers,
                    accounts=self.data['accounts'],
                    seller_id = self.user['id'],
                    list_name = self.data['list_name'],
                    list_import=list_import,
                    bids=self.data['bids'],
                    questions=self.data['questions']
                )
                return self.return_success('Lista de bloqueio importada com sucesso', {"status":"Os usuários estão sendo bloqueados, conferir em Processos."})


    @jwt_required
    @prepare
    def ajax_blacklist_list_import(self):
        self.validate(BlacklistListShareSchema())

        tool = self.get_tool('crud-blacklist-list')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], tool=tool, any_account=True)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        query = 'select * FROM meuml.blacklist_lists where name = :name'
        values = {
            'name': self.data['blacklist_name']
        }

        blacklist_list = self.fetchone(query, values)

        if blacklist_list is None:
            self.abort_json(
                {
                    'errors': "Blacklist não encontrada",
                    'message': "Não foi possível importar a lista de bloqueio"
                },
                404
            )

        query = 'select * FROM meuml.blacklist_list_blocks where blacklist_id = :blacklist_id'
        values = {
            'blacklist_id': blacklist_list['id']
        }
        blocks = self.fetchall(query, values)

        if blocks is None:
            self.abort_json(
                {
                    'errors': 'Bloqueio nao encontrado.',
                    'message': "Não foi possível importar a lista de bloqueio"
                },
                404
            )

        accounts_str = ','.join([str(acc) for acc in self.data['accounts']])

        query = f'select id FROM meuml.accounts where id in({accounts_str}) and user_id = :user_id and status=1'
        accounts = self.fetchall(query, {'user_id': self.user['id']})
        accounts = [account['id'] for account in accounts]

        if len(accounts) == 0:
            self.abort_json(
                {
                    'errors': 'Não autorizado o bloqueio para a conta  de usuário (MeuML.com).',
                    'message': "Não foi possível importar a lista de bloqueio"
                },
                404
            )       

        blacklist_mass_block = queue.signature('long_running:blacklist_mass_block_customers')
        blacklist_mass_block.delay(seller_id=self.user['id'], accounts=accounts, blacklist_id=blacklist_list['id'], bids=self.data['bids'], questions=self.data['questions'])

        return self.return_success('Lista de bloqueio importada com sucesso', {"status":"Os usuários estão sendo bloqueados, conferir em Processos."})

    @jwt_required
    @prepare
    def ajax_blacklist_list_delete(self,blacklist_id : int = None):
        tool = self.get_tool('crud-blacklist-list')
        code, message = verify_tool_access(action=self, user_id=self.user['id'], tool=tool, any_account=False)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        query = 'select * FROM meuml.blacklist_lists where id = :id and user_id = :user_id'
        values = {
            'id': blacklist_id,
            'user_id': self.user['id']
        }

        blacklist_list = self.fetchone(query, values)

        if blacklist_list is None:
            self.abort_json(
                {
                    'errors': ["Não foi possível localizar uma lista de bloqueio com o id informado"],
                    'message': "Não foi possível deletar a lista de bloqueio"
                },
                404
            )

        delete_childs = 'delete FROM meuml.blacklist_list_blocks where blacklist_id = :blacklist_id and user_id = :user_id'
        delete_query = 'delete FROM meuml.blacklist_lists where user_id = :user_id and id = :id'
        values = {
            'id': blacklist_id,
            'user_id': self.user['id']
        }
        values_childs = {
            'user_id': self.user['id'],
            'blacklist_id': blacklist_id
        }

        try:
            self.execute(delete_childs, values_childs)

            self.execute(delete_query, values)
        except:
            self.abort_json({
                'message': 'Erro ao deletar lista de bloqueio' ,
                'status': 'error',
            }, 404)

        return self.return_success('Lista de bloqueio deletada com sucesso', {"status":"Ação concluida."})

