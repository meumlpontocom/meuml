import json
import re
import traceback
from flask import request, redirect, send_file
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.queue.queue import app as queue
from libs.schema.faq_schema import FaqSchema
from os import getenv
from psycopg2.errors import ForeignKeyViolation
from werkzeug.exceptions import HTTPException


class FaqActions(Actions):
    @jwt_required
    @prepare
    def index(self):
        try:
            query = """
                SELECT id, position, date_created, date_modified, question, answer, videol_url, tag 
                FROM meuml.faq 
                WHERE hide_question IS FALSE
            """

            values = {}
            if 'tag' in request.args and len(request.args['tag']) > 0:
                query += " AND UPPER(tag) = UPPER(:tag)"
                values['tag'] = request.args['tag']

            query += " ORDER BY position ASC"

            data = self.fetchall(query, values)

            return self.return_success(data=data)

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
        self.validate(FaqSchema())

        try:
            if self.user['is_admin'] is False:
                self.abort_json({
                    'message': f'Usuário não possui permissão para realizar esta operação!',
                    'status': 'error',
                }, 403)

            if self.data['position']:
                self.execute("""
                    UPDATE meuml.faq SET 
                        position = position + 1 
                    WHERE position >= :position
                """, {'position': self.data['position']})
            else:
                subquery = "(SELECT coalesce(max(position),0)+1 FROM meuml.faq)"

            query = f"""
                INSERT INTO meuml.faq 
                    (hide_question, position, question, answer, videol_url, tag) 
                VALUES (:hide_question, {self.data['position'] if self.data['position'] else subquery}, :question, :answer, :video_url, :tag) 
                RETURNING id
            """
            values = {
                'hide_question': self.data['hide_question'],
                'question': self.data['question'],
                'answer': self.data['answer'],
                'video_url': self.data['video_url'],
                'tag': self.data['tag']
            }

            if not self.execute_insert(query, values):
                if self.data['position']:
                    self.execute("""
                        UPDATE meuml.faq SET 
                            position = position - 1 
                        WHERE position >= :position
                    """, {'position': self.data['position']+1})
                raise Exception

            return self.return_success("Pergunta criada com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc())

            self.abort_json({
                'message': f'Erro ao criar novo registro',
                'status': 'error',
            }, 500)

    @jwt_required
    @prepare
    def update(self, id):
        self.validate(FaqSchema())

        try:
            if self.user['is_admin'] is False:
                self.abort_json({
                    'message': f'Usuário não possui permissão para realizar esta operação!',
                    'status': 'error',
                }, 403)

            question = self.fetchone(
                "SELECT * FROM meuml.faq WHERE id = :id", {'id': id})
            if question is None:
                self.abort_json({
                    'message': f'Pergunta não encontrada',
                    'status': 'error',
                }, 404)

            if self.data['position'] and self.data['position'] != question['position']:
                if self.data['position'] < question['position']:
                    self.execute("""
                        UPDATE meuml.faq SET 
                            position = position + 1 
                        WHERE position >= :position AND position < :old_position
                    """, {'position': self.data['position'], 'old_position': question['position']})
                else:
                    self.execute("""
                        UPDATE meuml.faq SET 
                            position = position - 1 
                        WHERE position <= :position AND position > :old_position
                    """, {'position': self.data['position'], 'old_position': question['position']})
            else:
                self.data['position'] = question['position']

            query = f"""
                UPDATE meuml.faq SET
                    date_modified = now(),
                    hide_question = :hide_question,
                    position = :position,
                    question = :question,
                    answer = :answer,
                    videol_url = :video_url,
                    tag = :tag
                WHERE id = :id
                RETURNING id
            """
            values = {
                'hide_question': self.data['hide_question'],
                'position': self.data['position'],
                'question': self.data['question'],
                'answer': self.data['answer'],
                'video_url': self.data['video_url'],
                'tag': self.data['tag']
            }

            values['id'] = id
            if not self.execute_returning(query, values, raise_exception=True):
                if self.data['position'] < question['position']:
                    self.execute("""
                        UPDATE meuml.faq SET
                            position = position + 1
                        WHERE position >= :position AND position < :old_position
                    """, {'position': self.data['position'], 'old_position': question['position']})
                else:
                    self.execute("""
                        UPDATE meuml.faq SET
                            position = position - 1
                        WHERE position <= :position AND position > :old_position
                    """, {'position': self.data['position'], 'old_position': question['position']})
                raise Exception

            return self.return_success("Pergunta atualizada com sucesso")

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
            if self.user['is_admin'] is False:
                self.abort_json({
                    'message': f'Usuário não possui permissão para realizar esta operação!',
                    'status': 'error',
                }, 403)

            query = """
                DELETE FROM meuml.faq
                WHERE id = :id
                RETURNING position
            """

            position = self.execute_returning(query, {'id': id}, raise_exception=True)

            if not position:
                raise Exception

            self.execute("""
                UPDATE meuml.faq SET 
                    position = position - 1 
                WHERE position >= :position
            """, {'position': position})

            return self.return_success("Produto excluído com sucesso")

        except HTTPException:
            raise
        except:
            print(traceback.format_exc())

            self.abort_json({
                'message': f'Erro ao excluir registro',
                'status': 'error',
            }, 500)
