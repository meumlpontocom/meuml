import json
# import cx_Oracle
import psycopg2
import datetime
import inspect
import re
import traceback
from typing import Any
from marshmallow.schema import Schema
from marshmallow import ValidationError
from flask import request, abort, make_response, jsonify
from libs.context import ctx_stack

from libs.actions.actions import Actions

from libs.exceptions.exceptions import ActionsException
from libs.database.types import Type

from celery.utils.log import get_task_logger

LOGGER = get_task_logger(__name__)


class QueueActions(Actions):

    def execute(self, query: str, values = {}, commit = True, use_Oracle=False, raise_exception=False):
        if use_Oracle:
            cursor = self.oracle_conn.cursor()
            conn = self.oracle_conn
        else:
            query = self.parse_query_dictionary(query, values)
            cursor = self.conn.cursor()

        try:
            if not values:
                cursor.execute(query)
            else:
                cursor.execute(query, values)

        except Exception as e:
            self.conn.rollback()

            LOGGER.error('database query error')
            LOGGER.error(e)
            
            print(traceback.format_exc())
            print(query)
            print(values)
            if raise_exception:
                raise e              

        finally:
            cursor.close()


    def execute_returning(self, query: str, values: dict = {}, returning_type='number', commit = True, use_Oracle=False):
        if use_Oracle:
            conn = self.oracle_conn
            cursor = self.oracle_conn.cursor()
            types = {}
            # types={
            #     'number': cx_Oracle.NUMBER,
            #     'string': cx_Oracle.STRING,
            #     'datetime': cx_Oracle.DATETIME
            # }
            id_wrapper = cursor.var(types[returning_type])
        else:
            query = self.parse_query_dictionary(query, values)
            conn = self.conn
            cursor = self.conn.cursor()
            types={
                'number': str,
                'string': str,
                'datetime': str
            }

        try:
            if not values:
                cursor.execute(query)
            else:
                if use_Oracle:
                    if ':returned_value' not in query:
                        raise Exception('Insira o recebedor para o id \' returning id into :inserted_id\' na sua query.')
                    values['returned_value'] = id_wrapper
                cursor.execute(query, values)

            returned_value = None
            if use_Oracle and len(id_wrapper.getvalue()) > 0:
                returned_value = id_wrapper.getvalue()[0]
            elif use_Oracle is False:
                fetched_value = cursor.fetchone()
                if fetched_value and len(fetched_value) > 0: 
                    returned_value = fetched_value[0]
                else:
                    returned_value = None

        except Exception as e:
            print(e)
            print(query)
            print(values)
            conn.rollback()
            
        finally:
            cursor.close()

        return returned_value


    def execute_insert(self, query: str, values: dict = {}, commit = True, use_Oracle=False):
        if use_Oracle:
            cursor = self.oracle_conn.cursor()
            conn = self.oracle_conn
            id_wrapper = None #cursor.var(cx_Oracle.NUMBER)
        else:
            query = self.parse_query_dictionary(query, values)
            cursor = self.conn.cursor()
            conn = self.conn

        returned_value = None
        try:
            if not values:
                cursor.execute(query)
            else:
                if use_Oracle:
                    if ':inserted_id' not in query:
                        raise Exception('Insira o recebedor para o id \' returning id into :inserted_id\' na sua query.')
                    values['inserted_id'] = id_wrapper
                cursor.execute(query, values)

            if use_Oracle:
                returned_value = id_wrapper.getvalue()
                if len(returned_value) > 0:
                    returned_value = int(returned_value[0])
                else:
                    returned_value = None
            else:
                fetched_value = cursor.fetchone()
                if fetched_value and len(fetched_value) > 0: 
                    returned_value = fetched_value[0]
                else:
                    returned_value = None
        
        except Exception as e:
            conn.rollback()
            print(traceback.format_exc())
            print(query)
            print(values)
        
        finally:
            cursor.close()

        return returned_value


    def execute_insert_many(self, query: str, values: list= [], commit = True, use_Oracle=False):
        if use_Oracle:
            cursor = self.oracle_conn.cursor()
            id_wrapper = cursor.var(int, arraysize=len(values))
            conn = self.oracle_conn
        else:
            query = self.parse_query_dictionary(query, values)
            cursor = self.conn.cursor()
            conn = self.conn
        
        previous_state = conn.autocommit
        conn.autocommit = False

        cursor = conn.cursor()
        ids = []

        try:
            if not values:
                cursor.executemany(query)
                conn.commit()
                if use_Oracle:
                    ids = [id_wrapper.getvalue(i)[0] for i in range(len(values))] 
                else:
                    ids = []

            else:
                if use_Oracle and  ':inserted_id' not in query:
                    raise Exception('Insira o recebedor para o id \' returning id into :inserted_id\' na sua query.')
                
                for row_values in values:
                    row_values['inserted_id'] = id_wrapper
                cursor.executemany(query, values)
                conn.commit()
                if use_Oracle:
                    ids = [id_wrapper.getvalue(i)[0] for i in range(len(values))] 
                else:
                    ids = []

        except Exception as e:
            print(e)
            print(query)
            print(values)
            conn.rollback()
        
        finally:
            cursor.close()
            conn.autocommit = previous_state

        return ids


    def execute_many(self, query: str, values: list = [], commit = True, use_Oracle=False):
        if use_Oracle:
            cursor = self.oracle_conn.cursor()
            conn = self.oracle_conn
        else:
            query = self.parse_query_dictionary(query, values)
            cursor = self.conn.cursor()
            conn = self.conn

        previous_state = conn.autocommit
        conn.autocommit = False

        try: 
            if not values:
                cursor.executemany(query)
                conn.commit()

            else:
                cursor.executemany(query, values)
                conn.commit()
        except Exception as e:
            print(e)
            print(query)
            print(values)
            conn.rollback()
        finally:
            cursor.close()
            conn.autocommit = previous_state


    def fetchone(self, query: str, values = {}, use_Oracle=False):
        if use_Oracle:
            cursor = self.oracle_conn.cursor()
        else:
            query = self.parse_query_dictionary(query, values)
            cursor = self.conn.cursor()
        cursor.execute(query, values)

        try:
            data =  cursor.fetchone()
        except Exception as e:
            print(e)
            print(query)
            print(values)
            return None

        if data is None:
            return None

        column_names = list(map(lambda x: x.lower(), [
            d[0] for d in cursor.description]))

        new_dict = {}
        for i, field in enumerate(data):
            # if isinstance(field, cx_Oracle.LOB):
            #     new_dict[column_names[i].lower()] = json.loads(field.read())
            # else:
            new_dict[column_names[i].lower()] = field

        data = new_dict

        cursor.close()

        return data


    def fetchall(self, query: str, values = {}, use_Oracle=False):
        if use_Oracle:
            cursor = self.oracle_conn.cursor()
        else:
            query = self.parse_query_dictionary(query, values)
            cursor = self.conn.cursor()

        try:
            cursor.execute(query, values)
        except Exception as e:
            print(e)
            print(query)
            print(values)

        data = cursor.fetchall()

        columns = [i[0] for i in cursor.description]

        results = []

        for row in data:
            new_dict = {}
            c = 0
            for field in row:
                # if isinstance(field, cx_Oracle.LOB):
                #     new_dict[columns[c].lower()] = json.loads(field.read())
                # else:
                new_dict[columns[c].lower()] = field
                c += 1
            results.append(new_dict)

        cursor.close()

        return results

    def schema_decode(self, object):

        if type(object) == list:
            rs = []
            for item in object:
                rs.append(self.decode_object(item))
            return rs
        else:
            return self.decode_object(object)

    def isDevMode(self):
        self.logger.error(request.headers.get('DevMode'))
        return request.headers.get('DevMode') == '9fc6fc17ee99b8b94eb477094062fb91b8062ca1c460' and os.getenv(
            'ENV') == 'Development'

    def decode_object(self, object : Type):
        dict_attr: dict = {}
        attributes = inspect.getmembers(object, lambda a:not(inspect.isroutine(a)))
        attrs: list = [a for a in attributes if not(a[0].startswith('__') and a[0].endswith('__'))]
        del attrs[0]

        for item in attrs:
            name = item[0]
            val = item[1]
            if isinstance(val, Type):
                val = val.value if val.value != '' else val.default
                if val == '__FALSE__|!':
                    val = None

            dict_attr[name] = val

        return dict_attr


    def parse_query_dictionary(self, query: str, values):
        if not values or isinstance(values, tuple):
            return query
        for key in values.keys():
            query = re.sub(rf':{key}(\b)', rf'%({key})s', query)
        return query


    def validate(self, schema: Schema):
        try:
            if schema is None:
                raise ActionsException('É necessário informar um Schema para validar a requisição.')

            if not request.is_json:
                return self.abort_json({
                    'message': f'Requisição post precisa conter o formato JSON',
                    'status': 'error'
                }, 422)

            try:
                json_data = request.get_json()

            except:
                return self.abort_json({
                    'message': f'Requisição post sem corpo json',
                    'status': 'error'
                }, 400)

            if isinstance(json_data, dict):
                data = schema.load(json_data)
            else:
                data = []
                for obj in json_data:
                    objs = schema.load(obj)
                    data.append(objs)

            self.data = data
        except ValidationError as err:
            self.abort_json({'status':'error','message':'Não foi possível fazer o login','data': err.messages})

    def return_success(self, message : str = 'NM', data : Any = {}, code :int = 200):

        if 'data' in data:
            data = data['data']
        return make_response(
            jsonify({
                'status': 'success',
                'message': message,
                'data': data
            }),
            code
        )



    '''
        Aborta a requisição com a mensagem presente em body
    '''
    def abort_json(self, body : str = None, code: int = 422):
        if body is None:
            abort(make_response('{"erro": "Não foi possível identificar o erro"}', 500))
        body_json = jsonify(body)
        abort(make_response(body_json, code))
