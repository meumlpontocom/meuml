#!/usr/bin/env python3

import os
import datetime
import redis
from itertools import chain
from flask import Flask, make_response, g, jsonify
from flask_cors import CORS
from flask_jwt_simple import JWTManager
from flask_jwt_simple.exceptions import NoAuthorizationError
from flask_rest_jsonapi import Api
from flask_mail import Mail

try:
    from flask import _app_ctx_stack as ctx_stack
except ImportError:
    from flask import _request_ctx_stack as ctx_stack

from datetime import datetime, timedelta
from api.routes import ROUTES
from libs.database.database_postgres import connection

ctx_stack.conn = connection(port=os.getenv(
    'PG_DB_DIRECT_PORT'), host=os.getenv('PG_DB_DIRECT_HOST'))
# ctx_stack.oracle_conn = oracle_connection()

ctx_stack.redis_client = redis.Redis(host=os.getenv('REDIS_URL'), port=os.getenv(
    'REDIS_PORT'), db=os.getenv('REDIS_API_DB'), password=os.getenv('REDIS_PASSWORD'))


class FlaskConfig:
    SITE_URL = os.getenv('SITE_URL')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_EXPIRES = timedelta(minutes=int(os.getenv('JWT_EXPIRES')))
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = os.getenv('MAIL_PORT')
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_USE_TLS = False if os.getenv('MAIL_USE_TLS') == 'False' else True
    MAIL_USE_SSL = False if os.getenv('MAIL_USE_SSL') == 'False' else True


# flask app
app = Flask(__name__)
app.config.from_object(FlaskConfig)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')


CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)
api = Api(app)
mail = Mail(app)


# @app.after_request
# def after_request(response):
#    response.headers.add('Access-Control-Allow-Origin', '*')
#    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
#    return response

@jwt.invalid_token_loader
def invalid_token_loader(self):
    return jsonify(
        'Token invalido'
    )


@jwt.jwt_data_loader
def add_claims_to_access_token(user):
    now = datetime.utcnow()
    return {
        'exp': now + timedelta(days=5),
        'iat': now,
        'nbf': now,
        'sub': user.id,
        'name': user.name
    }


@app.errorhandler(NoAuthorizationError)
def handle_auth_error(e):
    return make_response(jsonify({'message': 'Header \'Authorization: Bearer {jwt}\' ausente'}), 400)


# app routes
for view_func, endpoint, rule, methods in chain(ROUTES):
    app.add_url_rule(rule, endpoint, view_func, methods=methods)

if __name__ == "__main__":
    app.run(host=os.getenv('IP', '0.0.0.0'),
            port=int(os.getenv('PORT', 8000)))
