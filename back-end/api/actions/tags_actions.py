import json
import re
from api.actions.storage_actions import StorageActions
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.enums.access_type import AccessType
from libs.enums.tags import TagType
from libs.payments.payment_helper import verify_tool_access
from libs.queue.queue import app as queue
from libs.schema.tags_schema import CreateTagSchema, TagAdvertisingsSchema, UntagAdvertisingsSchema, TagFilesSchema, UntagFilesSchema
from workers.helpers import get_tool
from workers.loggers import create_process, create_process_item
from workers.tasks.tag_items import tag_item, untag_item


class TagsActions(Actions):
    @jwt_required
    @prepare
    def index(self):
        join_condition = ''
        type_condition = ''
        if request.args.get('type_id') and request.args['type_id'].isdigit():
            type_condition = f" AND ti.type_id = :type_id"

            if request.args['type_id'] == str(TagType.MercadoLibre.value):
                join_condition = ' JOIN meuml.advertisings ad ON ti.item_id = ad.external_id '
            elif request.args['type_id'] == str(TagType.Shopee.value):
                join_condition = ' JOIN shopee.advertisings ad ON ti.item_id = ad.external_id '
            elif request.args['type_id'] == str(TagType.Files.value):
                join_condition = ' JOIN meuml.files fi ON ti.item_id = fi.id::varchar '

        fields = ['tg.id', 'tg.name']
        query = f"""
            SELECT {','.join(fields)} 
            FROM meuml.tags tg 
            WHERE user_id = :user_id AND EXISTS 
            (select tag_id from meuml.tagged_items ti {join_condition} where ti.tag_id = tg.id {type_condition}) 
        """

        values = {'user_id': self.user['id'], 'type_id': request.args.get('type_id')}
        #values, query, total, *_ = self.apply_filter_tags(request, query)
        query = self.order(request, fields, query, default_table='tg')
        # params, query = self.paginate(request, query)

        tags = self.fetchall(query, values)
        meta = {} #self.generate_meta(params, total)

        return self.return_success(data=tags, meta=meta)


    @jwt_required
    @prepare
    def types(self):
        query = """
            SELECT id, display_name 
            FROM meuml.taggable_relations
        """
        types = self.fetchall(query)

        return self.return_success(data=types)


    @jwt_required
    @prepare
    def delete_tag(self, tag_id):
        try:
            tag = self.fetchone("SELECT * FROM meuml.tags WHERE id=:id", {'id': tag_id})

            if not tag or tag['user_id'] != self.user['id']:
                self.abort_json({
                    'message': f"Usuário não possui tag com ID {tag_id}",
                    'status':'error',
                })
            
            query = """
                DELETE FROM meuml.tagged_items 
                WHERE tag_id = :tag_id
            """
            self.execute(query, {'tag_id': tag_id})

            query = """
                DELETE FROM meuml.tags 
                WHERE id = :tag_id
            """
            self.execute(query, {'tag_id': tag_id})

            return self.return_success("Tag excluída com sucesso")
        except:
            self.abort_json({
                'message': "Erro durante exclusão da tag, tente novamente",
                'status':'error',
            })


    def apply_filter_tags(self, request, query='', values=None, additional_conditions=None):
        total = 0

        k = query.find('FROM')
        if k == -1:
            count_query = """
                SELECT count(*) 
                FROM meuml.tags tg 
            """
        else:
            count_query = 'SELECT count(*) ' + query[k:]

        if not values:
            filter_values = {'user_id': self.user['id']}
            filter_query = ''

        if additional_conditions:
            filter_query += additional_conditions

        try:
            count = self.fetchone(count_query + filter_query, filter_values)
            total = count['count']

        except Exception as e:
            print(e)

        query += filter_query
        
        return filter_values, query, total


    def order(self, request, fields, query, default_table='od', join_tables=[], change_default_order=None):
        fields = [field if type(re.search('"(.*)"',field)) is type(None) else re.search('"(.*)"',field).group(1) for field in fields]
        fields = [field[3:] if field[2]=='.' else field for field in fields]
        values = {}

        if 'sort_order' in request.args and request.args['sort_order'] == 'asc':
            values['sort_order'] = 'asc'
        else:
            values['sort_order'] = 'desc'

        if 'sort_name' in request.args and request.args['sort_name'] in fields:
            if values['sort_order'] == 'asc':
                query += f" ORDER BY {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
            else:
                query += f" ORDER BY ({default_table}.{request.args['sort_name']} IS NULL), {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
                
        else:
            query += f" ORDER BY tg.name {values['sort_order']} "           

        return query


    @jwt_required
    @prepare
    def tag_advertisings(self):   
        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message':'Preencha o parâmetro de confirmação.',
                'status':'error',
            }, 400)
        else:
            confirmed = True if request.args.get('confirmed','0') == '1' else False

        self.validate(TagAdvertisingsSchema())
        tags = self.data['tags']

        advertisings_id = ','.join(self.data['advertisings_id'])
        
        tool = self.get_tool('tag-items')
        subscription_required = tool['access_type'] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(request, subscription_required=subscription_required, mass_operation=True, advertisings_id=advertisings_id)

        if not confirmed:
            if filter_total>1:
                return self.return_success(f"A operação modificará: {filter_total} anúncios")
            elif filter_total==1:
                advertising = self.fetchone("SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
                return self.return_success(f"A operação modificará o anúncio {advertising['external_id']} - {advertising['title']}")
            else:
                return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success("Nenhum produto elegível para alteração.")

        code, message = verify_tool_access(self, self.user['id'], accounts_id, tool, filter_total)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        if filter_total > 1:
            tag_advertisings_many = queue.signature('local_priority:tag_advertisings')
            tag_advertisings_many.delay(user_id=self.user['id'], filter_query=filter_query, filter_values=filter_values, tags=tags)
            return self.return_success("Aplicação de tag(s) em massa iniciada. Confira o andamento em Processos", {})
        
        else:
            advertising = self.fetchone("SELECT external_id, title, account_id FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)

            if not advertising:
                self.abort_json({
                    'message':'Anúncio não encontrado',
                    'status':'error',
                })

            process_id = create_process(account_id=advertising['account_id'], user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self)

            status_code, message = tag_item(
                user_id=self.user['id'], 
                account_id=advertising['account_id'],
                tool_id=tool['id'],
                process_id=process_id, 
                type_id=1, 
                type_name='Anúncios', 
                item_id=advertising['external_id'], 
                tags=tags, 
                existing_tags=None,
                conn=self.conn)

            if status_code != 200:
                self.abort_json({
                    'message':message,
                    'status':'error',
                })
            
            return self.return_success(f"Anúncio {advertising['title']} - Tag{'s' if len(tags) > 1 else ''} aplicada{'s' if len(tags) > 1 else ''} com sucesso.")


    @jwt_required
    @prepare
    def untag_advertisings(self):   
        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message':'Preencha o parâmetro de confirmação.',
                'status':'error',
            }, 400)
        else:
            confirmed = True if request.args.get('confirmed','0') == '1' else False

        self.validate(UntagAdvertisingsSchema())
        tags = self.data['tags']
        tags = [str(tag) for tag in tags]

        advertisings_id = ','.join(self.data['advertisings_id'])
        
        tool = self.get_tool('untag-items')
        subscription_required = tool['access_type'] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(request, subscription_required=subscription_required, mass_operation=True, advertisings_id=advertisings_id)

        if not confirmed:
            if filter_total>1:
                return self.return_success(f"A operação modificará: {filter_total} anúncios")
            elif filter_total==1:
                advertising = self.fetchone("SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)
                return self.return_success(f"A operação modificará o anúncio {advertising['external_id']} - {advertising['title']}")
            else:
                return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success("Nenhum produto elegível para alteração.")

        code, message = verify_tool_access(self, self.user['id'], accounts_id, tool, filter_total)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        if filter_total > 1:
            tag_advertisings_many = queue.signature('local_priority:untag_advertisings')
            tag_advertisings_many.delay(user_id=self.user['id'], filter_query=filter_query, filter_values=filter_values, tags=tags)
            return self.return_success("Remoção de tag(s) em massa iniciada. Confira o andamento em Processos", {})
        
        else:
            advertising = self.fetchone("SELECT external_id, title, account_id FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "+filter_query, filter_values)

            if not advertising:
                self.abort_json({
                    'message':'Anúncio não encontrado',
                    'status':'error',
                })

            process_id = create_process(account_id=advertising['account_id'], user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self)

            tags_query = f"SELECT tg.name FROM meuml.tags tg WHERE tg.id IN ({','.join(tags)})"
            tags_names = self.fetchall(tags_query)
            tags_names = [tag['name'] for tag in tags_names]

            status_code, message = untag_item(
                user_id=self.user['id'], 
                account_id=advertising['account_id'],
                tool_id=tool['id'],
                process_id=process_id, 
                type_id=1, 
                type_name='Anúncios', 
                item_id=advertising['external_id'], 
                tags=tags, 
                tags_names = tags_names,
                conn=self.conn)

            if status_code != 200:
                self.abort_json({
                    'message':message,
                    'status':'error',
                })
            
            return self.return_success(f"Anúncio {advertising['title']} - Tag{'s' if len(tags) > 1 else ''} removida{'s' if len(tags) > 1 else ''} com sucesso.")


    @jwt_required
    @prepare
    def advertising_tags(self, advertising_id):
        query = """
            SELECT tg.name as tag 
            FROM meuml.tags tg 
            JOIN meuml.tagged_items ti ON ti.tag_id = tg.id 
            WHERE ti.type_id =1 AND tg.user_id = :user_id AND ti.item_id = :id
        """
        tags = self.fetchall(query, {'user_id': self.user['id'], 'id': advertising_id})

        return self.return_success(data=tags)


    @jwt_required
    @prepare
    def tag_files(self):   
        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message':'Preencha o parâmetro de confirmação.',
                'status':'error',
            }, 400)
        else:
            confirmed = True if request.args.get('confirmed','0') == '1' else False

        self.validate(TagFilesSchema())
        
        tags = self.data['tags']
        ids =  ','.join(map(str, self.data['files_id']))
        tool = self.get_tool('tag-items')

        filter_values, filter_query, filter_total = StorageActions.apply_filter(self, request, ids=ids)

        if not confirmed:
            if filter_total>1:
                return self.return_success(f"A operação modificará: {filter_total} arquivos")
            elif filter_total==1:
                item = self.fetchone("SELECT id, name FROM meuml.files fi "+filter_query, filter_values)
                return self.return_success(f"A operação modificará o arquivo {item['name']}")
            else:
                return self.return_success(f"A operação não modificará nenhum arquivo")

        if filter_total == 0:
            return self.return_success("Nenhum arquivo elegível para alteração.")

        if filter_total > 1:
            tag_files_many = queue.signature('local_priority:tag_files')
            tag_files_many.delay(user_id=self.user['id'], filter_query=filter_query, filter_values=filter_values, tags=tags)
            return self.return_success("Aplicação de tag(s) em massa iniciada. Confira o andamento em Processos", {})
        
        else:
            item = self.fetchone("SELECT id, name FROM meuml.files fi "+filter_query, filter_values)

            if not item:
                self.abort_json({
                    'message':'Arquivo não encontrado',
                    'status':'error',
                })

            process_id = create_process(account_id=None, user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self, platform=None)

            status_code, message = tag_item(
                user_id=self.user['id'], 
                account_id='NULL',
                tool_id=tool['id'],
                process_id=process_id, 
                type_id=3, 
                type_name='Arquivos', 
                item_id=item['id'], 
                tags=tags, 
                existing_tags=None,
                conn=self.conn)

            if status_code != 200:
                self.abort_json({
                    'message':message,
                    'status':'error',
                })
            
            return self.return_success(f"Arquivo {item['name']} - Tag{'s' if len(tags) > 1 else ''} aplicada{'s' if len(tags) > 1 else ''} com sucesso.")


    @jwt_required
    @prepare
    def untag_files(self):   
        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message':'Preencha o parâmetro de confirmação.',
                'status':'error',
            }, 400)
        else:
            confirmed = True if request.args.get('confirmed','0') == '1' else False

        self.validate(UntagFilesSchema())
       
        tags = [str(tag) for tag in self.data['tags']]
        ids =  ','.join(map(str, self.data['files_id']))
        tool = self.get_tool('untag-items')

        filter_values, filter_query, filter_total = StorageActions.apply_filter(self, request, ids=ids)
        
        if not confirmed:
            if filter_total>1:
                return self.return_success(f"A operação modificará: {filter_total} arquivos")
            elif filter_total==1:
                item = self.fetchone("SELECT id, name FROM meuml.files fi "+filter_query, filter_values)
                return self.return_success(f"A operação modificará o arquivo {item['name']}")
            else:
                return self.return_success(f"A operação não modificará nenhum arquivo")

        if filter_total == 0:
            return self.return_success("Nenhum arquivo elegível para alteração.")

        if filter_total > 1:
            tag_files_many = queue.signature('local_priority:untag_files')
            tag_files_many.delay(user_id=self.user['id'], filter_query=filter_query, filter_values=filter_values, tags=tags)
            return self.return_success("Remoção de tag(s) em massa iniciada. Confira o andamento em Processos", {})
        
        else:
            item = self.fetchone("SELECT id, name FROM meuml.files fi "+filter_query, filter_values)

            if not item:
                self.abort_json({
                    'message':'Arquivo não encontrado',
                    'status':'error',
                })

            process_id = create_process(account_id=None, user_id=self.user['id'], tool_id=tool['id'], tool_price=tool.get('price'), items_total=1, action=self, platform=None)

            tags_query = f"SELECT tg.name FROM meuml.tags tg WHERE tg.id IN ({','.join(tags)})"
            tags_names = self.fetchall(tags_query)
            tags_names = [tag['name'] for tag in tags_names]

            status_code, message = untag_item(
                user_id=self.user['id'], 
                account_id='NULL',
                tool_id=tool['id'],
                process_id=process_id, 
                type_id=3, 
                type_name='Arquivos', 
                item_id=item['id'], 
                tags=tags, 
                tags_names = tags_names,
                conn=self.conn)

            if status_code != 200:
                self.abort_json({
                    'message':message,
                    'status':'error',
                })
            
            return self.return_success(f"Arquivo {item['name']} - Tag{'s' if len(tags) > 1 else ''} removida{'s' if len(tags) > 1 else ''} com sucesso.")


    @jwt_required
    @prepare
    def file_tags(self, file_id):
        query = """
            SELECT tg.name as tag 
            FROM meuml.tags tg 
            JOIN meuml.tagged_items ti ON ti.tag_id = tg.id 
            WHERE ti.type_id = 3 AND tg.user_id = :user_id AND ti.item_id = :id
        """
        tags = self.fetchall(query, {'user_id': self.user['id'], 'id': file_id})

        return self.return_success(data=tags)
