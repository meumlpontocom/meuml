import os
import requests
import json
import asyncio
import gzip
import io
import pathlib
import traceback
from typing import List

from aiohttp import ClientSession
from datetime import datetime, timedelta
from urllib.request import Request, urlopen
from libs.database.database_postgres import connection, get_cursor


def conn():
    stack = type('stack', (object,), {})()
    stack.conn = connection()
    stack.cursor = get_cursor(stack.conn)
    return stack


async def fetch(stack, category, session):
    url = f"https://api.mercadolibre.com/categories/{category[0]}/shipping_preferences"
    validation_url = f"https://api.mercadolibre.com/categories/{category[0]}"
    
    async with session.get(url) as response:

        body = await response.read()

        try:
            json_body = json.loads(body)
        except Exception as e:
            print(e)
            return

        has_shipping_data = False

        if isinstance(json_body.get('dimensions'), dict):
            has_shipping_data = True
            shipping_length = json_body['dimensions']['length']
            shipping_height = json_body['dimensions']['height']
            shipping_weight = json_body['dimensions']['weight']
            shipping_width = json_body['dimensions']['width']
            dimensions = [shipping_length, shipping_width, shipping_height]
            cubage = sum(dimensions)
            highest_dimension = max([shipping_length, shipping_width, shipping_height])
        else:
            shipping_height = shipping_length = shipping_weight = shipping_width = cubage = highest_dimension = None

        async with session.get(validation_url) as response:

            validation_body = await response.read()

            try:
                validation_json_body = json.loads(validation_body)
                validation_json_body = validation_json_body.get('settings', {})
            except Exception as e:
                print(e)
                return

            query_insert = """
                INSERT INTO meuml.ml_categories 
                    (path, name, external_id, external_data, has_shipping_data, length, height, weight, 
                    width, cubage, highest_dimension, batch, has_children, date_created, date_modified, 
                    item_conditions, shipping_modes, minimum_price, maximum_price,  max_title_length,
                    max_description_length, max_pictures_per_item, max_pictures_per_item_var, fragile)
                VALUES 
                    (%(path)s, %(name)s, %(external_id)s, %(external_data)s, %(has_shipping_data)s, %(length)s, %(height)s, %(weight)s, 
                    %(width)s, %(cubage)s, %(highest_dimension)s, %(batch)s, %(has_children)s, %(date_created)s, %(date_modified)s,
                    %(item_conditions)s, %(shipping_modes)s, %(minimum_price)s, %(maximum_price)s,  %(max_title_length)s,
                    %(max_description_length)s, %(max_pictures_per_item)s, %(max_pictures_per_item_var)s, %(fragile)s)
            """

            values = {
                'path': category[2],
                'name': category[1],
                'external_id': category[0],
                'external_data': json.dumps(json_body),
                'has_shipping_data': int(has_shipping_data),
                'length': shipping_length,
                'height': shipping_height,
                'weight': shipping_weight,
                'width': shipping_width,
                'cubage': cubage,
                'highest_dimension': highest_dimension,
                'batch': 0,
                'has_children': int(category[3]),
                'date_created': datetime.now(),
                'date_modified': datetime.now(),
                'item_conditions': json.dumps(validation_json_body.get('item_conditions')), 
                'shipping_modes': json.dumps(validation_json_body.get('shipping_modes')), 
                'minimum_price': validation_json_body.get('minimum_price'), 
                'maximum_price': validation_json_body.get('maximum_price'), 
                'max_description_length': validation_json_body.get('max_description_length'), 
                'max_pictures_per_item': validation_json_body.get('max_pictures_per_item'), 
                'max_pictures_per_item_var': validation_json_body.get('max_pictures_per_item_var'),
                'max_title_length': validation_json_body.get('max_title_length'), 
                'fragile': validation_json_body.get('fragile', False)
            }

            try:
                stack.cursor.execute(query_insert, values)

                stack.conn.commit()
            except Exception as e:
                print(e)
                stack.conn.rollback()

            return await response.read()


async def bound_fetch(stack, sem, category, session):
    async with sem:
        await fetch(stack, category, session)


async def run(stack, categories, access_token):
    tasks = []
    sem = asyncio.Semaphore(1000)

    async with ClientSession(headers={'Authorization': f'Bearer {access_token}'}) as session:
        for category in categories:
            task = asyncio.ensure_future(bound_fetch(stack, sem, category, session))
            tasks.append(task)

        responses = asyncio.gather(*tasks)
        await responses


def load_json(filename: str) -> List:
    categories = []

    with open(filename) as f:
        data = json.load(f)

    for obj in data:
        category_path = ''
        for path in data[obj]['path_from_root']:
            category_path += path['name'] + ' - '

        id = data[obj]['id']
        name = data[obj]['name']
        path = category_path[:-3]

        if 'children_categories' in data[obj]:
            if len(data[obj]['children_categories']) > 0:
                has_children = True
            else:
                has_children = False
        else:
            has_children = False

        category = [id, name, path, has_children]

        categories.append(category)

    return categories


def download(access_token):
    req = Request('https://api.mercadolibre.com/sites/MLB/categories/all')
    req.add_header('Authorization', f'Bearer {access_token}')
    response = urlopen(req)
    compressed_file = io.BytesIO(response.read())
    decompressed_file = gzip.GzipFile(fileobj=compressed_file)
    categories_file = pathlib.Path("categoriesMLB")
    if categories_file.exists():
        os.remove("categoriesMLB")

    with open('categoriesMLB', 'wb') as outfile:
        outfile.write(decompressed_file.read())


def refresh_token(stack, account):
    try:
        req = requests.post(os.getenv('TOKEN_URL') + '?grant_type=refresh_token&client_id=' + os.getenv('CLIENT_ID') + '&client_secret=' + os.getenv('CLIENT_SECRET') + '&&refresh_token=' + account['refresh_token'])
        new_token = req.json()

        if req.status_code != 200:
            return False
    except:
        return False

    now = datetime.now()
    values = {
        'access_token': new_token['access_token'],
        'access_token_created_at': now,
        'access_token_expires_at': now + timedelta(seconds=new_token['expires_in']),
        'refresh_token': new_token['refresh_token'],
        'id': account['id']
    }
    return values


def fetchall(stack, query):
    cursor = stack.cursor
    data = []

    for attempt in range(3):
        try:
            cursor.execute(query)
            data = cursor.fetchall()
        except:
            data = []
        else:
            break

    if data is None or len(data) == 0:
        return []

    try:
        columns = [i[0] for i in cursor.description]
        results = []

        for row in data:
            new_dict = {}
            c = 0
            for field in row:
                new_dict[columns[c].lower()] = field
                c += 1
            results.append(new_dict)
    except:
        print(traceback.format_exc())

    return results


def main():
    try:
        stack = conn()

        admin_accounts = fetchall(stack, """
            SELECT ac.id, ac.access_token, ac.access_token_expires_at, ac.refresh_token, ac.user_id  
            FROM meuml.accounts ac 
            JOIN meuml.users us ON us.id = ac.user_id 
            WHERE ac.status = 1 AND us.is_admin IS TRUE
        """)

        for account in admin_accounts:
            access_token = refresh_token(stack, account)
            if access_token:
                access_token = access_token['access_token']
                break

        if not access_token:
            return

        head_req = requests.head('https://api.mercadolibre.com/sites/MLB/categories/all?withAttributes=true', headers={'Authorization': f'Bearer {access_token}'})

        with open('./cron/dumps_md5.json', 'r') as hash_file:
            dumps_hashs = json.load(hash_file)

        md5 = head_req.headers['X-Content-MD5']

        if md5 == dumps_hashs['hash']:
            print('A hash ja está atualizada')
        else:
            dumps_hashs['hash'] = md5
            with open('./cron/dumps_md5.json', 'w') as hash_file:
                hash_file.write(json.dumps(dumps_hashs))

            download(access_token)
            categories = load_json('./categoriesMLB')

            stack.cursor.execute("TRUNCATE TABLE meuml.ml_categories")
            stack.conn.commit()

            loop = asyncio.get_event_loop()
            future = asyncio.ensure_future(run(stack, categories, access_token))
            loop.run_until_complete(future)
    except:
        print(traceback.format_exc())
    finally:
        stack.conn.close()


if __name__ == '__main__':
    main()