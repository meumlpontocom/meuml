import settings
import os
import psycopg2
from celery.utils.log import get_task_logger
from psycopg2.pool import ThreadedConnectionPool
from psycopg2.extensions import make_dsn

LOGGER = get_task_logger(__name__)

def pooler():
    pg_pool = None

    try:
        pg_pool = psycopg2.pool.ThreadedConnectionPool(minconn=5, maxconn=5,
                                                user = os.getenv('PG_DB_USER'),
                                                password =  os.getenv('PG_DB_PASSWORD'),
                                                host = os.getenv('PG_DB_HOST'),
                                                port = os.getenv('PG_DB_PORT'),
                                                database =  os.getenv('PG_DB_NAME'))
    except (Exception, psycopg2.DatabaseError) as e:
        print(e)

    return pg_pool

def connection(pool = None, port=None, host=None):
    if not port:
        port = os.getenv('PG_DB_PORT')
    if not host:
        host = os.getenv('PG_DB_HOST')
    dsn_tns = make_dsn(user = os.getenv('PG_DB_USER'),
                        password =  os.getenv('PG_DB_PASSWORD'),
                        host = host,
                        port = port,
                        dbname =  os.getenv('PG_DB_NAME'))
    pg_conn = psycopg2.connect(dsn_tns)
    pg_conn.autocommit = True
    return pg_conn

def conn_pool(pg_pool):
    pg_conn = None
    try:
        if pg_pool:
            pg_conn = pg_pool.getconn()
            pg_conn.autocommit = True
    except (Exception, psycopg2.DatabaseError) as e:
        print(e)
    return pg_conn

def get_conn():
    pg_conn = None
    try:
        pg_conn = psycopg2.connect(user = os.getenv('PG_DB_USER'),
                            password =  os.getenv('PG_DB_PASSWORD'),
                            host = os.getenv('PG_DB_HOST'),
                            port = os.getenv('PG_DB_PORT'),
                            dbname =  os.getenv('PG_DB_NAME'))

        if pg_conn is None:
            raise ValueError('Connection is None')

        pg_conn.autocommit = True
        return pg_conn
    
    except (Exception, psycopg2.DatabaseError) as e:
        LOGGER.error(e)
        raise
    

def get_cursor(pg_conn):
    return pg_conn.cursor()
