
from functools import wraps
from flask_jwt_simple import jwt_required, get_jwt_identity

try:
    from flask import _app_ctx_stack as ctx_stack
except ImportError:
    from flask import _request_ctx_stack as ctx_stack


from flask_jwt_simple.utils import decode_jwt
from flask_jwt_simple.config import config
from flask_jwt_simple.exceptions import InvalidHeaderError, NoAuthorizationError
from flask import abort, make_response, jsonify

from libs.database.database_postgres import connection, get_cursor
from os import getenv

def prepare(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        for attempt in range(5):
            try:
                args[0].oracle_conn = ctx_stack.conn
                args[0].conn = ctx_stack.conn

                cur = args[0].conn.cursor()

                if get_jwt_identity() is None:
                    cur.close()
                    break

                query = 'select id, date_created, confirmed_at, email, name, is_admin  FROM meuml.users where id = %(id)s'
                
                cur.execute(query, {'id': get_jwt_identity()})

                user = cur.fetchone()

                if user is None:
                    body = {
                        'message': 'Erro de autorização. Faça login no sistema',
                        'status': 'error',
                    }
                    abort(make_response(jsonify(body), 401))

                column_names = list(map(lambda x: x.lower(), [
                    d[0] for d in cur.description]))
                # list of data items
                args[0].user = dict(zip(column_names, user))

                cur.close()

            except Exception as e:
                print(e)
                try:
                    print
                    ctx_stack.conn = connection(port=getenv('PG_DB_DIRECT_PORT'))
                except Exception as e:
                    print(e)

            else:
                break
            
        return fn(*args, **kwargs)

    return wrapper
