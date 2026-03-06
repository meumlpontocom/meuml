import json
from celery.utils.log import get_task_logger
from datetime import datetime
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import refresh_token, invalid_access_token, format_ml_date
from workers.tasks.mercadolibre.order_stage_parsing import parse_order_messages

LOGGER = get_task_logger(__name__)


def extract_messages(ml_api, pack_id, ml_user_id):

    response = ml_api.get(
        f"/messages/packs/{pack_id}/sellers/{ml_user_id}", params={'mark_as_read': False})

    if response.status_code != 200:
        return []

    response_data = response.json()

    messages = response_data.get('messages', [])
    total = response.json().get('paging', {}).get('total', 0)
    limit = 50
    offset = 50

    while offset < total:
        response_data, response = fetch_pack(
            ml_api, pack_id, ml_user_id, limit, offset)
        offset += limit

        if response.status_code == 200:
            messages += response_data.get('messages', [])

    return messages


def fetch_pack(ml_api, pack_id, ml_user_id, limit, offset):
    response = ml_api.get(f"/messages/packs/{pack_id}/sellers/{ml_user_id}",
                          params={'limit': limit, 'offset': offset, 'mark_as_read': False})
    return response.json(), response


def order_messages_import(account_id, access_token, order_id, order_date_created, pack_id, action, single_order=False):
    ml_api = MercadoLibreApi(access_token=access_token)

    pack_id = pack_id if pack_id is not None else order_id
    messages = extract_messages(ml_api, pack_id, account_id)

    for message in messages:
        message['order_id'] = int(order_id)
        message['order_date_created'] = order_date_created
        message['pack_id'] = pack_id

        if not single_order:
            query = f"""
                INSERT INTO meli_stage.order_messages (id_message, account_id, order_id, external_data, stage_status) 
                    VALUES (:id_message, :account_id, :order_id, :external_data, 0) 
                ON CONFLICT (id_message, account_id)
                    DO UPDATE SET external_data = excluded.external_data, stage_status = excluded.stage_status
            """
            values = {
                'id_message': message['id'],
                'account_id': account_id,
                'order_id': order_id,
                'external_data': json.dumps(message)
            }
            action.execute(query, values)

    return messages


def order_single_message_import(account, order_id, order_date_created, pack_id, data, action):
    query = "SELECT id, date_created, account_id FROM meuml.orders WHERE id = :id"
    order = action.fetchone(query, {'id': order_id})

    if not order or order['account_id'] != account['id']:
        return None

    message = {
        'id': data.get('_id'),
        'order_id': order_id,
        'order_date_created': order_date_created,
        'client_id': data.get('client_id'),
        'from': {
            'user_id': None if not data.get('from') else data['from'].get('user_id'),
            'email': None if not data.get('from') else data['from'].get('email'),
            'name': None if not data.get('from') else data['from'].get('name'),
        },
        'status': data.get('status'),
        'text': None if not data.get('text') else data['text'].get('plain'),
        'message_date': {
            'created': data.get('date'),
            'available': data.get('date_available'),
            'received': data.get('date_received'),
            'notified': data.get('date_notified'),
            'read': data.get('date_read'),
        },
        'message_moderation': {
            'status': None if not data.get('moderation') else data['moderation'].get('status'),
            'reason': None if not data.get('moderation') else data['moderation'].get('reason'),
            'moderation_date': None if not data.get('moderation') else data['moderation'].get('date_moderated'),
            'by': None if not data.get('moderation') else data['moderation'].get('source'),
        },
        'message_attachments': data.get('attachments'),
        'pack_id': pack_id
    }

    return message
