import json
import re
import traceback
from datetime import datetime, timedelta
from flask import request, redirect, send_file
from flask_jwt_simple import jwt_required
from io import BytesIO
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.minio_api.minio_api import minio_client
from libs.queue.queue import app as queue
from libs.payments.payment_helper import verify_tool_access
from os import getenv
from PIL import Image
from werkzeug.exceptions import HTTPException

class StorageActions(Actions):
    def get_bucket_name(self, user_id=None):
        bucket_name = str(user_id) if user_id else str(self.user['id'])
        bucket_name_length = len(bucket_name)
        bucket_name = bucket_name if bucket_name_length >= 4 else ((4-bucket_name_length) * '0') + bucket_name
        return bucket_name


    def get_parent(self, parent_id):
        if len(parent_id) == 0:
            return None
        parent = self.fetchone("SELECT id, path FROM meuml.files WHERE id=:id AND is_directory IS TRUE", {'id': int(parent_id)})
        return parent


    def generate_path(self, parent, name):
        if parent:
            return parent['path'] + name
        else:
            return name


    @jwt_required 
    @prepare
    def create_bucket(self):
        try:
            StorageActions.check_module_permission(self)

            if len(request.form.get('bucket_name', '')) == 0:
                self.abort_json({
                    'message': f'Nome inválido',
                    'status': 'error',
                }, 400)

            minio_client.make_bucket(bucket_name=request.form['bucket_name'])
            return self.return_success("Repositório criado com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao criar repositório de arquivos',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def create_directory(self):
        try:
            StorageActions.check_module_permission(self)

            if len(request.form.get('directory_name', '')) == 0:
                self.abort_json({
                    'message': f'Nome inválido',
                    'status': 'error',
                }, 400)
            else:
                directory_name = request.form['directory_name'].replace('/','') + '/'

            bucket_name = self.get_bucket_name()

            if not minio_client.bucket_exists(bucket_name=bucket_name):
                minio_client.make_bucket(bucket_name=bucket_name)
            
            parent = self.get_parent(request.form.get('parent_id', ''))
            path = self.generate_path(parent, directory_name)
            parent_id = parent['id'] if parent else None

            if self.fetchone(
                "SELECT id FROM meuml.files WHERE user_id = :user_id AND name = :name AND parent_id" + (f" = {parent_id}" if parent_id else " is null"),
                {'user_id': self.user['id'], 'name': directory_name[:-1]}
            ):
                self.abort_json({
                    'message': f'Essa pasta já contém um arquivo de mesmo nome',
                    'status': 'error',
                }, 400)

            with open('.empty_file', 'rb') as tmp:
                minio_client.put_object(
                    bucket_name=bucket_name, 
                    object_name=path, 
                    data=tmp,
                    length=0
                )

            query = """
                INSERT INTO meuml.files (user_id, parent_id, name, is_directory, path) 
                VALUES (:user_id, :parent_id, :name, :is_directory, :path)
            """
            values = {
                'user_id': self.user['id'],
                'parent_id': parent['id'] if parent else None,
                'name': directory_name[:-1],
                'is_directory': True,
                'path': path
            }
            self.execute(query, values)

            return self.return_success("Pasta criada com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao criar repositório de arquivos',
                'status': 'error',
            }, 500)


    @prepare
    def download_file(self, file_id):
        response = None

        try:
            file_data = self.fetchone("SELECT * FROM meuml.files WHERE id=:id", {'id': file_id})

            if file_data is None:
                self.abort_json({
                    'message': f'Arquivo não encontrado',
                    'status': 'error',
                }, 404)

            if file_data['is_directory']:
                self.abort_json({
                    'message': f'O id informado é uma pasta, não um arquivo único',
                    'status': 'error',
                }, 404)

            bucket_name = self.get_bucket_name(file_data['user_id'])

            if not minio_client.bucket_exists(bucket_name=bucket_name):
                self.abort_json({
                    'message': f'Repositório de arquivos não encontrado',
                    'status': 'error',
                }, 404)

            response = minio_client.get_object(bucket_name=bucket_name, object_name=file_data['path'])

            data = response.read()
            content_type = response.getheader('Content-Type')

            return send_file(
                BytesIO(data),
                mimetype=content_type,
                as_attachment=True,
                attachment_filename=file_data['name'])

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao exportar arquivo',
                'status': 'error',
            }, 500)

        finally:
            if response:
                response.close()
                response.release_conn()


    @jwt_required 
    @prepare
    def remove_file(self, file_id):
        try:
            StorageActions.check_module_permission(self)

            bucket_name = self.get_bucket_name()

            if not minio_client.bucket_exists(bucket_name=bucket_name):
                self.abort_json({
                    'message': f'Repositório de arquivos não encontrado',
                    'status': 'error',
                }, 404)

            articles = self.fetchall(f"""
                SELECT ar.id, ar.name 
                FROM stock.article ar
                JOIN stock.article_images ai ON ar.id = ai.article_id AND ai.is_main_image IS TRUE
                WHERE ai.image_id = {file_id}
            """)

            if len(articles) > 0:
                message = [f"#{article['id']} - {article['name']}" for article in articles]
                self.abort_json({
                    'message': f"Não foi possível concluir a exclusão! Arquivo é imagem principal no(s) produto(s): {', '.join(message)}",
                    'status': 'error',
                }, 406)

            file_data = self.fetchone("SELECT * FROM meuml.files WHERE id=:id AND user_id=:user_id", {'id': file_id, 'user_id': self.user['id']})

            if file_data is None:
                self.abort_json({
                    'message': f'Arquivo não encontrado',
                    'status': 'error',
                }, 404)

            minio_client.remove_object(bucket_name=bucket_name, object_name=file_data['path'])
            
            if file_data['content_type'] and 'image' in file_data['content_type']: 
                thumbnail_path = file_data['thumbnail_url'].split('/')
                thumbnail_path = '/'.join(thumbnail_path[2:])
                minio_client.remove_object(bucket_name=bucket_name, object_name=thumbnail_path)

            query = "DELETE FROM meuml.files WHERE id=:id"
            self.execute(query, {'id': file_id})

            query = "DELETE FROM meuml.tagged_items WHERE item_id = :item_id"
            self.execute(query, {'item_id': str(file_id)})

            return self.return_success("Arquivo removido com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao remover arquivo',
                'status': 'error',
                'error': traceback.format_exc()
            }, 500)

    
    @jwt_required 
    @prepare
    def remove_multiple_files(self):
        try:
            StorageActions.check_module_permission(self)

            if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
                self.abort_json({
                    'message':'Preencha o parâmetro de confirmação.',
                    'status':'error',
                }, 400)
            else:
                confirmed = True if request.args.get('confirmed','0') == '1' else False
                select_all = True if request.args.get('select_all','0') == '1' else False

            bucket_name = self.get_bucket_name()

            if not minio_client.bucket_exists(bucket_name=bucket_name):
                self.abort_json({
                    'message': f'Repositório de arquivos não encontrado',
                    'status': 'error',
                }, 404)

            query = f"""
                SELECT fi.id, fi.name, fi.path, fi.content_type, fi.thumbnail_url 
                FROM meuml.files fi 
                LEFT JOIN meuml.tagged_items ti ON ti.item_id = fi.id::varchar AND ti.type_id = 3 
                LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id 
            """

            not_main_image_condition = """
                AND NOT EXISTS (
                    SELECT ai.id
                    FROM stock.article_images ai 
                    WHERE ai.is_main_image IS TRUE AND ai.image_id = fi.id
                )
            """

            filter_values, filter_query, filter_total = StorageActions.apply_filter(self, request, query, additional_conditions=not_main_image_condition)

            if not confirmed and filter_total>1:
                return self.return_success(f"A operação removerá: {filter_total} arquivos")
            elif not confirmed and filter_total==1:
                file_data = self.fetchone(filter_query, filter_values)
                return self.return_success(f"A operação removerá o arquivo #{file_data['id']} - {file_data['name']}")
            elif not confirmed:
                return self.return_success(f"A operação não removerá nenhum arquivo.")

            if filter_total == 0:
                return self.return_success("Nenhum arquivo será removido")

            files = self.fetchall(filter_query, filter_values)
            ids = []

            for file_data in files:
                ids.append(str(file_data['id']))
                minio_client.remove_object(bucket_name=bucket_name, object_name=file_data['path'])
                
                if file_data['content_type'] and 'image' in file_data['content_type']: 
                    thumbnail_path = file_data['thumbnail_url'].split('/')
                    thumbnail_path = '/'.join(thumbnail_path[2:])
                    minio_client.remove_object(bucket_name=bucket_name, object_name=thumbnail_path)

            ids_int = [int(i) for i in ids]
            query = "DELETE FROM meuml.files WHERE id = ANY(:ids)"
            self.execute(query, {'ids': ids_int})

            query = "DELETE FROM meuml.tagged_items WHERE item_id = ANY(:ids)"
            self.execute(query, {'ids': ids})

            return self.return_success(f"Arquivo(s) removido(s) com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao remover arquivo',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def upload_file(self):
        try:
            StorageActions.check_module_permission(self)

            bucket_name = self.get_bucket_name()

            if not minio_client.bucket_exists(bucket_name=bucket_name):
                minio_client.make_bucket(bucket_name=bucket_name)
                # self.abort_json({
                #     'message': f'Repositório de arquivos não encontrado',
                #     'status': 'error',
                # }, 404)

            uploaded_file = request.files.get('file')
            filename = uploaded_file.filename
            content_type = uploaded_file.headers.get('Content-Type', '')
            length = len(uploaded_file.read())

            parent = self.get_parent(request.form.get('parent_id', ''))
            path = self.generate_path(parent, filename)

            query = """
                SELECT id 
                FROM meuml.files 
                WHERE user_id = :user_id AND path = :path 
            """
            values = {'user_id': self.user['id'], 'path': path}
            if parent:
                query += 'AND parent_id = :parent_id'
                values['parent_id'] = parent['id']
            
            if self.fetchone(query, values):
                self.abort_json({
                    'message': f'Essa pasta já contém um arquivo de mesmo nome',
                    'status': 'error',
                }, 400)

            if 'image' in content_type: 
                uploaded_file.seek(0)
                im = Image.open(uploaded_file)

                if im.width > 242 or im.height > 242:
                    im.thumbnail((242,242))

                    extension = content_type.split('/')
                    if len(extension) < 2:
                        self.abort_json({
                            'message': f'Extensão não reconhecida',
                            'status': 'error',
                        }, 404)
                    
                    thumbnail_file = BytesIO()
                    im.save(thumbnail_file, format=extension[1])
                    
                    thumbnail_file.seek(0)
                    thumbnail_length = len(thumbnail_file.read())
                    thumbnail_file.seek(0)

                    thumbnail_path = self.generate_path(parent, '.thumbnail_' + filename)

                    minio_client.put_object(
                        bucket_name=bucket_name, 
                        object_name=thumbnail_path, 
                        data=thumbnail_file,
                        length=thumbnail_length,
                        content_type=content_type
                    )
                else:
                    thumbnail_path = path
            else:
                thumbnail_path = None

            uploaded_file.seek(0)
            minio_client.put_object(
                bucket_name=bucket_name, 
                object_name=path, 
                data=uploaded_file,
                length=length,
                content_type=content_type
            )

            query = """
                INSERT INTO meuml.files (user_id, parent_id, name, content_type, size, path, url, thumbnail_url) 
                VALUES (:user_id, :parent_id, :name, :content_type, :size, :path, :url, :thumbnail_url)
            """
            values = {
                'user_id': self.user['id'],
                'parent_id': parent['id'] if parent else None,
                'name': uploaded_file.filename,
                'content_type': content_type,
                'size': length,
                'path': path,
                'url': getenv('IMAGES_URL') + bucket_name + '/' + path,
                'thumbnail_url': getenv('IMAGES_URL') + bucket_name + '/' + thumbnail_path if thumbnail_path else None,
            }
            self.execute(query, values)

            return self.return_success("Arquivo importado com sucesso")
        
        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao importar arquivo',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def replace_file(self, file_id):
        try:
            StorageActions.check_module_permission(self)

            bucket_name = self.get_bucket_name()

            if not minio_client.bucket_exists(bucket_name=bucket_name):
                self.abort_json({
                    'message': f'Repositório de arquivos não encontrado',
                    'status': 'error',
                }, 404)

            file_data = self.fetchone("SELECT * FROM meuml.files WHERE id=:id", {'id': file_id})

            if file_data is None:
                self.abort_json({
                    'message': f'Arquivo não encontrado',
                    'status': 'error',
                }, 404)

            if file_data['user_id'] != self.user['id']:
                self.abort_json({
                    'message': f'Arquivo pertence a outro usuário',
                    'status': 'error',
                }, 403)  

            uploaded_file = request.files.get('file')
            filename = uploaded_file.filename
            content_type = uploaded_file.headers.get('Content-Type', '')
            length = len(uploaded_file.read())

            path = file_data['url'].split('/')
            path = '/'.join(path[2:])

            if 'image' in content_type: 
                uploaded_file.seek(0)
                im = Image.open(uploaded_file)

                if im.width > 242 or im.height > 242:
                    im.thumbnail((242,242))

                    extension = content_type.split('/')
                    if len(extension) < 2:
                        self.abort_json({
                            'message': f'Extensão não reconhecida',
                            'status': 'error',
                        }, 404)
                    
                    thumbnail_file = BytesIO()
                    im.save(thumbnail_file, format=extension[1])
                    
                    thumbnail_file.seek(0)
                    thumbnail_length = len(thumbnail_file.read())
                    thumbnail_file.seek(0)

                    thumbnail_path = file_data['thumbnail_url'].split('/')
                    thumbnail_path = '/'.join(thumbnail_path[2:])

                    minio_client.put_object(
                        bucket_name=bucket_name, 
                        object_name=thumbnail_path, 
                        data=thumbnail_file,
                        length=thumbnail_length,
                        content_type=content_type
                    )
                else:
                    thumbnail_path = path
            else:
                thumbnail_path = None

            uploaded_file.seek(0)
            minio_client.put_object(
                bucket_name=bucket_name, 
                object_name=path, 
                data=uploaded_file,
                length=length,
                content_type=content_type
            )

            query = """
                UPDATE meuml.files SET
                    name= :name, 
                    content_type= :content_type, 
                    size= :size,
                    date_modified= NOW() 
                WHERE id = :id
            """
            values = {
                'name': uploaded_file.filename,
                'content_type': content_type,
                'size': length,
                'id': file_id
            }
            self.execute(query, values)

            return self.return_success("Arquivo substituído com sucesso")
        
        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao importar arquivo',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def list_directories(self):
        try:
            StorageActions.check_module_permission(self)

            bucket_name = self.get_bucket_name()

            if not minio_client.bucket_exists(bucket_name=bucket_name):
                minio_client.make_bucket(bucket_name=bucket_name)

            fields = ["fi.id", "fi.date_created", "fi.date_modified", "fi.user_id", "fi.parent_id", 
                "fi.name", "fi.is_directory", "fi.path"]
            
            parent_id = request.args['parent_id'] if request.args.get('parent_id') and len(request.args.get('parent_id')) > 0 else None

            query = f"""
                SELECT {','.join(fields)} 
                FROM meuml.files fi 
                WHERE fi.user_id = {self.user['id']} AND fi.is_directory IS TRUE AND fi.parent_id {'='+parent_id if parent_id else 'IS NULL'}
            """
            values = {'user_id': self.user['id']}
            
            directories = self.fetchall(query, values)

            return self.return_success(data=directories)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao recuperar lista de arquivos',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def list_files(self):
        try:
            StorageActions.check_module_permission(self)

            bucket_name = self.get_bucket_name()

            if not minio_client.bucket_exists(bucket_name=bucket_name):
                minio_client.make_bucket(bucket_name=bucket_name)
                # self.abort_json({
                #     'message': f'Repositório de arquivos não encontrado',
                #     'status': 'error',
                # }, 404)

            fields = ["fi.id", "fi.date_created", "fi.date_modified", "fi.user_id", "fi.parent_id", 
                "fi.name", "fi.is_directory", "fi.content_type", "fi.size", "fi.path", "fi.url", "fi.thumbnail_url", 
                "array_agg(tg.id ORDER BY tg.name) as meuml_tags_ids", "array_agg(tg.name ORDER BY tg.name) as meuml_tags_names"]
            
            query = f"""
                SELECT {','.join(fields)} 
                FROM meuml.files fi 
                LEFT JOIN meuml.tagged_items ti ON ti.item_id = fi.id::varchar AND ti.type_id = 3 
                LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id 
            """
            
            values, query, total = StorageActions.apply_filter(self, request, query)
            query = self.order(request, fields, query)
            params, query = self.paginate(request, query)

            files = self.fetchall(query, values)
            meta = self.generate_meta(params, total)

            for file_row in files:
                file_row['meuml_tags'] = []
                ids = file_row.pop('meuml_tags_ids')
                names = file_row.pop('meuml_tags_names')

                if ids and not ids[0]:
                    continue

                for i in range(len(ids)):
                    file_row['meuml_tags'].append({
                        'id': ids[i],
                        'name': names[i]
                    })
            
            return self.return_success(data=files, meta=meta)

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao recuperar lista de arquivos',
                'status': 'error',
            }, 500)


    @staticmethod
    def apply_filter(action, request, query='', values=None, additional_conditions=None, ids=None):
        select_all = bool(int(request.args.get('select_all', 0)))
        total = 0
        filter_query = ' WHERE fi.user_id=:user_id '
        filter_values = values if values else {'user_id': action.user['id']}

        k = query.find('FROM')
        if k == -1:
            count_query = """
                SELECT count(distinct fi.id) 
                FROM meuml.files fi 
                LEFT JOIN meuml.tagged_items ti ON ti.item_id = fi.id::varchar AND ti.type_id = 3 
                LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id 
            """
        else:
            count_query = 'SELECT count(distinct fi.id) ' + query[k:]

        if not ids:
            ids = request.form.get('ids',[]) if len(request.form.get('ids',[])) > 0 else request.args.get('ids',[])
        
        if ids and len(ids) > 0:
            ids_list = [int(i.strip()) for i in ids.split(',')] if isinstance(ids, str) else [int(i) for i in ids]
            filter_values['ids_list'] = ids_list
            if select_all is False:
                filter_query += ' AND fi.id = ANY(:ids_list) '
            else:
                filter_query += ' AND fi.id != ALL(:ids_list) '

        if len(request.args.get('filter_string', '')) > 0:
            filter_query += " AND UPPER(fi.name) LIKE :filter_string "
            filter_values['filter_string'] = f"%%{request.args['filter_string'].upper()}%%"
        
        else:
            if len(request.args.get('parent_id', '')) > 0:
                filter_query += ' AND parent_id = :parent_id '
                filter_values['parent_id'] = int(request.args['parent_id'])
            elif ids and len(ids) == 0:
                filter_query += ' AND parent_id IS NULL '

        if len(request.args.get('meuml_tags', '')) > 0:
            meuml_tags_list = [int(t.strip()) for t in request.args["meuml_tags"].split(',')]
            filter_values['meuml_tags'] = meuml_tags_list
            filter_values['meuml_tags_count'] = len(meuml_tags_list)
            filter_query += """ AND :meuml_tags_count = (
                    SELECT COUNT(distinct ti2.tag_id)
                    FROM meuml.tagged_items ti2
                    WHERE ti2.tag_id = ANY(:meuml_tags) AND ti2.item_id = fi.id::varchar AND ti2.type_id = 3
                    GROUP BY ti2.item_id
                )
            """

        if additional_conditions:
            filter_query += additional_conditions

        try:
            count = action.fetchone(count_query + filter_query + ' GROUP BY fi.user_id ', filter_values)
            filter_query += ' GROUP BY fi.id '
            total = count['count']

        except:
            print(traceback.format_exc()) 

        query += filter_query

        return filter_values, query, total


    def order(self, request, fields, query, default_table='fi', join_tables=[]):
        fields = [field if type(re.search('"(.*)"',field)) is type(None) else re.search('"(.*)"',field).group(1) for field in fields]
        fields = [field[3:] if field[2]=='.' else field for field in fields]
        values = {}

        if 'sort_order' in request.args and request.args['sort_order'] == 'desc':
            values['sort_order'] = 'desc'
        else:
            values['sort_order'] = 'asc'

        if 'sort_name' in request.args and request.args['sort_name'] in fields:
            if values['sort_order'] == 'asc':
                query += f" ORDER BY {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
            else:
                query += f" ORDER BY ({default_table}.{request.args['sort_name']} IS NULL), {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
                
        else:
            query += f" ORDER BY fi.name ASC "           

        return query


    @staticmethod
    def check_module_permission(action):
        tool = action.get_tool('manage-images')
        code, message = verify_tool_access(action, action.user['id'], tool=tool) 

        if code != 200:
            action.abort_json({
                'message': message,
                'status': 'error',
            }, code)
