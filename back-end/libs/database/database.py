import settings
import os
# import cx_Oracle

def oracle_pooler():
    dsn_tns = None #cx_Oracle.makedsn(os.getenv('DB_HOST'), os.getenv('DB_PORT'), service_name=os.getenv('DB_SERVICE_NAME'))
    return None #cx_Oracle.SessionPool(user=os.getenv('DB_USER'), password=os.getenv('DB_PASWORD'), dsn=dsn_tns, connectiontype=cx_Oracle.Connection, min=2, max=20, threaded=True, increment=1, timeout=0)

def oracle_conn_pool(pool):
    #dsn_tns = cx_Oracle.makedsn(os.getenv('DB_HOST'), os.getenv('DB_PORT'), service_name=os.getenv('DB_SERVICE_NAME'))
    dbconn = pool.acquire()
    dbconn.autocommit = True
    return dbconn

def oracle_connection(pool = None):
    dsn_tns = None #cx_Oracle.makedsn(os.getenv('DB_HOST'), os.getenv('DB_PORT'), service_name=os.getenv('DB_SERVICE_NAME'))
    dbconn = None #cx_Oracle.connect(os.getenv('DB_USER'), os.getenv('DB_PASWORD'), dsn_tns, threaded=True)
    dbconn.autocommit = True
    return dbconn
    #return pool.acquire()

def oracle_get_cursor(conn):
    return conn.cursor()

errors = {
    'ORA-00942: table or view does not exist',
    'ORA-00001: unique constraint (SYSTEM.SYS_C007313) violated'
}


def oracle_cursor():
    return get_cursor(connection())


def oracle_column_names(cursor) -> list:
    return list(map(lambda x: x.lower(), [
            d[0] for d in cursor.description]))


def oracle_fetch_data(cursor) -> dict:
    return dict(zip(column_names(cursor=cursor), list(cursor.fetchall())))


def oracle_fetch_one(cursor) -> dict:

    data = cursor.fetchone()
    if data is None:
        return {}

    return dict(zip(column_names(cursor=cursor), list(cursor.fetchone())))
