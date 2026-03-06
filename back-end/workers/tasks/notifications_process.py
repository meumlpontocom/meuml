import json
import os
from re import sub
from libs.payments.payment_helper import user_subscripted_accounts
from libs.push.push_expo_notification import send_expo_notification
from workers.tasks.mercadolibre.advertising_item_price import update_mshops_item_price
import pytz
import traceback
from celery.utils.log import get_task_logger
from datetime import datetime, timedelta
import time
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.access_type import AccessType
from libs.enums.gateway import Gateway
from libs.minio_api.minio_api import activate_bucket
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.plugnotas_api.plugnotas_api import PlugNotasApi
from libs.plugnotas_api.focusnfe_api import FocusnfeApi
from libs.push.push_notifications import send_notification
from libs.whatsapp_api.whatapp_api import WhatsappApi
from workers.helpers import refresh_token, get_account, get_tool, invalid_access_token, format_ml_date
from workers.loggers import create_process, create_process_item, update_process_item
from workers.tasks.mercadolibre.advertising_import_all import create_table_items, create_table_mshops_items
from workers.tasks.mercadolibre.advertising_import_item import get_or_create_advertising, upsert_catalog_competition
from workers.tasks.mercadolibre.order_import_item import order_import_item
from workers.tasks.mercadolibre.order_messages_import import order_single_message_import
from workers.tasks.mercadolibre.order_messages_import import order_messages_import
from workers.tasks.mercadolibre.order_payments_import import order_payments_import
from workers.tasks.mercadolibre.order_shipment_import import order_shipment_import
from workers.tasks.mercadolibre.order_stage_parsing import parse_order_json

LOGGER = get_task_logger(__name__)


def notification_process_advertising(pool, resource, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action, account_id)

        if account is None:
            return

        access_token = refresh_token(action=action, account=account)

        if access_token == False:
            invalid_access_token(action, account_id,
                                 account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.get(resource, params={'include_attributes': 'all'})

        if response.status_code == 200:
            response_data = response.json()
            external_id = response_data['id']

            if response_data.get('status') and response_data['status'] == 'closed' and response_data.get('sub_status') and 'deleted' in response_data['sub_status']:
                action.execute('DELETE FROM meuml.advertisings WHERE external_id=:id', {
                               'id': external_id})
                return

            response_description = ml_api.get(
                f"/items/{external_id}/description")

            if response_description.status_code == 200:
                response_description_data = response_description.json()
                response_data['description'] = response_description_data.get(
                    'plain_text')

            if response_data.get('tags') and 'catalog_forewarning' in response_data['tags']:
                moderation = ml_api.get(
                    f'/items/{external_id}/catalog_forewarning/date')
                if moderation.status_code == 200:
                    response_data['moderation_date'] = moderation.json().get(
                        'moderation_date')

            if response_data.get('tags') and 'catalog_product_candidate' in response_data['tags']:
                validation_fields = {
                    "site_id": response_data.get('site_id'),
                    "domain_id": response_data.get('domain_id'),
                    "attributes": response_data.get('attributes')
                }

                validation = ml_api.get(
                    f'/catalog_product_candidate/validate', json=validation_fields)
                if validation.status_code == 400:
                    response_data['validation'] = validation.json()
                    response_data['tags'].append('meuml_poor_quality')
                elif validation.status_code == 204:
                    response_data['tags'].append('meuml_high_quality')

            if 'marketplace' in response_data['channels']:
                # create_table_items(account, action)
                advertising = get_or_create_advertising(
                    pool, account['id'], external_id, response_data, ml_api, action, update=True)
                advertising.pop('external_id', None)
            # if 'mshops' in response_data['channels']:
            #     create_table_mshops_items(account, action)
            #     advertising = get_or_create_advertising(
            #         pool, account['id'], external_id, response_data, ml_api, action, update=True, ml=False)

            #     advertising.pop('external_id', None)

    except Exception as e:
        LOGGER.error(traceback.format_exc())
        LOGGER.error(e)
    finally:
        action.conn.close()


def notification_process_mshops_item_price(resource, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action, account_id)

        if account is None:
            return

        access_token = refresh_token(action=action, account=account)
        if not access_token:
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.get(
            f"{resource}/types/standard/channels/mshops")

        if response.status_code == 200:
            update_mshops_item_price(action, account_id, response.json())

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def notification_process_catalog_competition(resource, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action, account_id)

        if account is None:
            return

        access_token = refresh_token(action=action, account=account)
        if not access_token:
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.get(resource)

        if response.status_code == 200:
            upsert_catalog_competition(action, account_id, response.json())

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def notification_process_order_message(resource, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action, account_id)

        if account is None:
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id,
                                 account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.get(f'/messages/{resource}')

        if response.status_code == 200:
            data = response.json()

            for item in data['messages'][0]['message_resources']:
                if item['name'] == 'packs':
                    order_id = int(item['id'])

            order = action.fetchone("SELECT id, pack_id, date_created, account_id FROM meuml.orders WHERE id = :id AND account_id = :account_id", {
                                    'id': order_id, 'account_id': account['id']})

            if order:
                message = action.fetchone("SELECT id FROM meuml.order_messages WHERE id = :id AND order_id = :order_id AND account_id = :account_id", {
                                          'id': resource, 'order_id': order_id, 'account_id': account['id']})

                if not message:
                    message = order_single_message_import(
                        account, order['id'], order['date_created'], order['pack_id'], data, action)

                    if message:
                        parse_order_json(account_id=account['id'], process_id=None, single_order_id=True, data={
                                         'messages': [message]})

                        items = action.fetchall("SELECT id, title, quantity, unit_price FROM meuml.order_items WHERE pack_id = :id AND account_id = :account_id", {
                                                'id': message['pack_id'], 'account_id': account['id']})
                        items_title = "Produto(s): " + ", ".join(
                            [item['title'] for item in items]) if items else '*'
                        pack_text = f"(Pacote carrinho #{message['pack_id']})" if message[
                            'order_id'] != message['pack_id'] else '*'

                        push_notification = {
                            'title': f"MeuML.com informa: nova mensagem pós-venda na conta {account['name']} do Mercado Livre!",
                            'url': '/vendas',
                            'body': f"""MeuML.com informa: nova mensagem pós-venda na conta {account['name']} do Mercado Livre!\n\nVenda #{message['order_id']} {pack_text} {items_title}\nMensagem: {data['messages'][0]['text']}\n\nPara mais informações, entre no app2.meuml.com"""
                        }
                        send_notification(
                            str(account['user_id']), push_notification)
                        WhatsappApi.send_text_message_to_user(
                            action,
                            account['user_id'],
                            account['id'],
                            'ML',
                            'whatsapp-order-messages',
                            'marketplace_after_sales_message_received',
                            account_name=account['name'],
                            order_id=message['order_id'],
                            # pack_text=pack_text,
                            item_name=items_title,
                            # message=data['messages'][0]['text']
                        )
            # else:
            #     order_import_item(account['id'], {'id': order_id}, single_order=True, is_new_order=True)

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def notification_process_order(resource, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action, account_id)

        if account is None:
            return

        subscripted_accounts = user_subscripted_accounts(
            action, account['user_id'])

        if account['id'] not in subscripted_accounts:
            return

        order_id = ''.join(
            [character for character in resource if character.isdigit()])

        if len(order_id) == 0:
            return
        
        data = {'id': int(order_id)}
        
        ml_api = MercadoLibreApi(access_token=account['access_token'])

        endpoint = '/orders/search/recent'
        params = {'seller': account_id}
        response = ml_api.get(endpoint, params=params)
        response_data = response.json()
        orders = response_data.get('results', [])

        notified_order = next((order for order in orders if order['id'] == order_id), None)

        if notified_order:
            data['expiration_date'] = notified_order['expiration_date']

        order = action.fetchone("SELECT id, pack_id, date_created, account_id FROM meuml.orders WHERE id = :id AND account_id = :account_id", {
                                'id': int(order_id), 'account_id': account['id']})

        if order:
            order_import_item(account['id'], data,
                              single_order=True, is_new_order=False)

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def notification_process_order_payment(resource, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action, account_id)

        if account is None:
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id,
                                 account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.get(resource)

        if response.status_code == 200:
            data = response.json()

            if data['order_id'] is not None and data['order_id'].isnumeric():

                order_id = int(data['order_id'])

                order = action.fetchone("SELECT id, pack_id, date_created FROM meuml.orders WHERE id = :id AND account_id = :account_id", {
                                        'id': order_id, 'account_id': account['id']})

                if order:
                    payments = [{
                        'id': data.get('id'),
                        'order_id': order['id'],
                        'order_date_created': order['date_created'],
                        'pack_id': order['pack_id'],
                        'payer_id': None if not data.get('payer') else data['payer'].get('id'),
                        'date_last_modified': data.get('last_modified'),
                        'date_approved': data.get('date_approved'),
                        'status': data.get('status'),
                        'status_detail': data.get('status_detail'),
                        'payment_type': data.get('payment_type'),
                        'payment_method_id': data.get('payment_method_id'),
                        'total_paid_amount': data.get('total_paid_amount'),
                        'shipping_cost': data.get('shipping_cost'),
                        'installments': data.get('installments'),
                        'installment_amount': data.get('installment_amount'),
                        'transaction_amount': data.get('transaction_amount'),
                        'overpaid_amount': data.get('overpaid_amount'),
                    }]

                    parse_order_json(account_id=account['id'], process_id=None, single_order_id=True, data={
                                     'payments': payments})
                # else:
                #     order_import_item(account['id'], {'id': order_id}, single_order=True, is_new_order=True)

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def notification_process_order_shipment(resource, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action, account_id)

        if account is None:
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id,
                                 account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.get(resource)

        if response.status_code == 200:
            data = response.json()
            order_id = int(data['order_id'])

            order = action.fetchone("SELECT id, pack_id, date_created, TO_CHAR(date_closed, 'HH:mm:ss, DD/MM/YYYY') as date_closed FROM meuml.orders WHERE id = :id AND account_id = :account_id", {
                                    'id': order_id, 'account_id': account['id']})

            if order:
                shipment = order_shipment_import(
                    account['id'], access_token, order['id'], order['date_created'], order['pack_id'], data['id'], action, single_order=True)
                parse_order_json(account_id=account['id'], process_id=None, single_order_id=True, data={
                                 'shipment': shipment})
            else:
                # attempt_to_create_order_tables(account['id'], action)
                data = order_import_item(
                    account['id'], {'id': order_id}, single_order=True, is_new_order=True)

                if not data or not data['items']:
                    return

                item = data['items'][0]
                order = data['order']

                order['date_closed'] = datetime.strptime(
                    order['date_closed'][:-10], "%Y-%m-%dT%H:%M:%S").strftime("%H:%M:%S, %m/%d/%Y") if order['date_closed'] is not None else ''

                price = f"{item['unit_price']:.2f}".replace('.', ',')

                pack_text = f"(Pacote carrinho #{order['pack_id']})" if order['id'] != order['pack_id'] else '*'

                push_notification = {
                    'title': f"Parabéns, você vendeu no Mercado Livre, conta {account['name']}!",
                    'url': '/vendas',
                    'body': f"""Parabéns, você vendeu no Mercado Livre, conta {account['name']}!\n\nVenda #{order['id']} {pack_text}\nProduto: {item['item']['title']} - R$ {price} {'('+str(item['quantity'])+' unidades)' if item['quantity'] > 1 else ''}\nData/hora da compra: {data['order']['date_closed']}\n\nPara mais informações, entre no app2.meuml.com"""
                }

                send_notification(str(account['user_id']), push_notification)

                quantity = '('+str(item['quantity'])+' unidades)' if item['quantity'] > 1 else '*'

                WhatsappApi.send_text_message_to_user(
                    action,
                    account['user_id'],
                    account['id'],
                    'ML',
                    'whatsapp-orders',
                    'marketplace_order_created',
                    account_name=account['name'],
                    qtd=str(item['quantity']),
                    product_name=item['item']['title'],
                    value=price
                )

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def notification_process_question(resource, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action, account_id)

        if account is None:
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id,
                                 account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        # Aguardar 5 sec para requisitar a pergunta
        time.sleep(5)

        response = ml_api.get(f'/my/received_questions/search', params={
            'status': 'unanswered',
        })

        if response.status_code == 200:
            data = response.json()
            question_id = int(resource.split('/questions/')[1])
            index = None

            for i in range(len(data['questions'])):
                if data['questions'][i]['id'] == question_id:
                    index = i
                    break
            else:
                return

            response_advertising = ml_api.get(
                f"/items/{data['questions'][index]['item_id']}")
            title = ''
            if response_advertising.status_code == 200:
                response_advertising = response_advertising.json()
                title = response_advertising['title']

            push_notification = {
                'title': f"MeuML.com informa: nova pergunta na conta {account['name']} do Mercado Livre!",
                'url': '/perguntas',
                'body': f"""MeuML.com informa: nova pergunta na conta {account['name']} do Mercado Livre!\n\nAnúncio: {data['questions'][index]['item_id']} - {title}\nPergunta: {data['questions'][index]['text']}\n\nPara ler e responder entre no app2.meuml.com"""
            }

            send_notification(str(account['user_id']), push_notification)
            
            subscripted_accounts = user_subscripted_accounts(action, account['user_id'])
            if account['id'] in subscripted_accounts:
                send_expo_notification(account['user_id'], "Nova Pergunta", data['questions'][index]['text'])
                
            WhatsappApi.send_text_message_to_user(
                action,
                account['user_id'],
                account['id'],
                'ML',
                'whatsapp-questions',
                'notificacao_pergunta_recebida',
                _header={'marketplace_name': 'ML'},
                item_name=title,
                question_text=data['questions'][index]['text']
            )

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def notification_process_nfse(notification_json):
    action = QueueActions()
    action.conn = get_conn()

    try:
        notification = json.loads(notification_json)

        reference = notification['ref']

        if 'organization_id' in reference: # This means that the NF was generated from Systennis
            action.conn.close()
            return

        if not notification.get('cnpj_prestador'):

            if notification.get('idIntegracao') and notification.get('situacao'):
                query = """
                    UPDATE meuml.invoices
                        SET status = :status
                        WHERE internal_order_id = :id
                """
                action.execute(query, {'id': int(
                    notification['idIntegracao']), 'status': notification['situacao']})

            if notification.get('situacao') != 'CONCLUIDO':
                generate_failed_nfse_email(notification_json, notification)
        else:
            query = """
                UPDATE meuml.invoices
                    SET status = :status
                    WHERE internal_order_id = :id
            """
            action.execute(
                query,
                {
                    'id': notification['ref'],
                    'status': notification['status']
                }
            )

            if notification.get('status') != 'autorizado':
                generate_failed_nfse_email(notification_json, notification)

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def notification_process_payment_pjbank(pool, internal_order_id, notification):
    action = QueueActions()
    action.conn = get_conn()

    try:
        query = """
            SELECT *
                FROM meuml.internal_orders
                WHERE id = :internal_order_id
        """
        internal_order = action.fetchone(
            query, {'internal_order_id': internal_order_id})

        if internal_order is None:
            generate_subscription_email(action, internal_order_id, error=True)

        if internal_order['package_id'] is None and internal_order['modules_id'] is None:
            query = """
                INSERT INTO meuml.credits
                                    (user_id, amount)
                            VALUES (:user_id, :amount)
                ON CONFLICT (user_id)
                            DO UPDATE SET amount = meuml.credits.amount + :amount2
            """
            values = {
                'user_id': internal_order['user_id'],
                'amount': float(notification['valor_pago']) if notification['tipo'] == 'recebimento_boleto' else float(notification['valor']),
                'amount2': float(notification['valor_pago']) if notification['tipo'] == 'recebimento_boleto' else float(notification['valor'])
            }
            action.execute(query, values)

            query = """
                INSERT INTO meuml.credit_transactions
                                    (user_id, amount, deposit, internal_order_id)
                            VALUES (:user_id, :amount, TRUE, :internal_order_id)
            """
            values['internal_order_id'] = internal_order_id
            action.execute(query, values)

            generate_nfse(action, internal_order_id)

        else:
            if internal_order['renewed_subscription_id']:
                query = """
                    UPDATE meuml.subscriptions
                    SET expiration_date = expiration_date + interval '1' month, internal_order_id = :internal_order_id
                    WHERE id = :subscription_id
                """
                action.execute(query, {
                               'internal_order_id': internal_order['id'], 'subscription_id': internal_order['renewed_subscription_id']})
            else:
                query = """
                    INSERT INTO meuml.subscriptions (user_id, price, package_id, modules, expiration_date, internal_order_id)
                    VALUES (:user_id, :price, :package_id, :modules, now()+interval '1' month, :internal_order_id)
                    RETURNING id
                """
                values = {
                    'user_id': internal_order['user_id'],
                    'price': float(notification['valor_pago']) if notification['tipo'] == 'recebimento_boleto' else float(notification['valor']),
                    'package_id': internal_order['package_id'],
                    'modules': internal_order['modules_id'],
                    'internal_order_id': internal_order_id
                }
                subscription_id = action.execute_insert(query, values)

                query = """
                    INSERT INTO meuml.subscription_accounts (subscription_id, account_id)
                    VALUES (:subscription_id, :account_id)
                """
                accounts = internal_order['accounts_id'].split(',')

                for account in accounts:
                    action.execute(
                        query, {'subscription_id': subscription_id, 'account_id': int(account)})

                modules = internal_order['modules_id'].split(
                    ',') if internal_order['modules_id'] else []
                if (internal_order['package_id'] and internal_order['package_id'] == 2) or '7' in modules:
                    for account in accounts:
                        visits_history_lookup = queue.signature(
                            'long_running:visits_complete_history_lookup', args=(int(account),))
                        visits_history_lookup.delay()

                # ID módulo de armazenamento de imagens
                if '13' in modules:
                    activate_bucket(internal_order['user_id'])

            generate_subscription_email(action, internal_order_id)
            generate_nfse(action, internal_order_id)

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def notification_process_cancel_payment(pool, internal_order_id, gateway_id, notification):
    action = QueueActions()
    action.conn = get_conn()

    try:
        if gateway_id == Gateway.PJBANK:
            query = """
                SELECT io.id,
                FROM meuml.creditcard_transactions ct
                JOIN meuml.internal_orders io ON ct.internal_order_id = io.id
                WHERE ct.external_id = :external_id AND gateway_id = :gateway_id
            """
            internal_order = action.fetchone(
                query, {'external_id': notification['id_unico'], 'gateway_id': Gateway.PJBANK})

            if internal_order is None:
                return

            if internal_order['access_type'] == AccessType.subscription:
                query = 'SELECT id FROM meuml.subscriptions WHERE internal_order_id=:internal_order_id'
                subscription_id = action.fetchone(
                    query, {'internal_order_id': internal_order['id']})

                query = """
                    DELETE FROM meuml.subcription_accounts
                    WHERE subcription_id = :subscription_id
                """
                action.execute(query, {'subscription_id': subscription_id})

                query = """
                    DELETE FROM meuml.subcriptions
                    WHERE id = :subscription_id
                """
                action.execute(query, {'subscription_id': subscription_id})

            elif internal_order['access_type'] == AccessType.credits:
                query = 'SELECT * FROM meuml.credit_transactions WHERE internal_order_id=:internal_order_id'
                credit_transaction = action.fetchone(
                    query, {'internal_order_id': internal_order['id']})

                query = """
                    UPDATE meuml.credits
                        SET amount = amount - :amount
                        WHERE user_id = :user_id
                """
                action.execute(query, {
                               'amount': credit_transaction['amount'], 'user_id': credit_transaction['user_id']})

                query = """
                    DELETE FROM meuml.credit_transactions
                    WHERE id = :credit_transaction_id
                """
                action.execute(
                    query, {'credit_transaction_id': credit_transaction['id']})

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def generate_subscription_email(action, internal_order_id, error=False):
    if error:
        message = f"Olá, o pedido #{internal_order_id} confirmado pelo EFI não foi encontrado na base de dados!"

    else:
        query = """
            SELECT io.id, io.total_price::varchar, io.user_id, io.accounts_id,
                    COALESCE(pa.title,'Personalizado') as package_name, string_agg(pm.module_id::varchar,', ' ORDER BY pm.module_id ) as package_modules, io.modules_id,
                    ct.id as creditcard_transaction_id, bt.id as boleto_transaction_id
                FROM meuml.internal_orders io
                LEFT JOIN meuml.creditcard_transactions ct ON ct.internal_order_id = io.id
                LEFT JOIN meuml.boleto_transactions bt ON bt.internal_order_id = io.id
                LEFT JOIN meuml.efi_transactions ef ON ef.internal_order_id = io.id
                LEFT JOIN meuml.packages pa ON io.package_id = pa.id
                LEFT JOIN meuml.package_modules pm on io.package_id = pm.package_id
                WHERE io.id = :internal_order_id
                GROUP BY io.id, package_name, ct.id, bt.id
        """
        internal_order = action.fetchone(
            query, {'internal_order_id': internal_order_id})
        internal_order = json.dumps(
            internal_order, indent=2) if internal_order else ""

        query = """
            SELECT su.id, su.expiration_date::varchar, su.price::varchar, su.user_id,
                    COALESCE(pa.title,'Personalizado') as package_name,
                    string_agg(su.modules::varchar,', ' ORDER BY su.modules) as modules,
                    string_agg(sa.account_id::varchar, ', ' ORDER BY sa.account_id) as accounts
                FROM meuml.subscriptions su
                JOIN meuml.subscription_accounts sa ON sa.subscription_id = su.id
                LEFT JOIN meuml.packages pa ON su.package_id = pa.id
                WHERE su.internal_order_id = :internal_order_id
                GROUP BY su.id, package_name
        """
        subscription = action.fetchone(
            query, {'internal_order_id': internal_order_id})
        subscription = json.dumps(
            subscription, indent=2) if subscription else ""

        message = "<div>"
        message = f"<p>Olá, o pedido #{internal_order_id} foi confirmado pelo EFI!</p><br/><br/>"
        message += "<p>Pedido:</p><br/>"
        message += "<p>" + internal_order + "</p><br/><br/>"
        message += "<p>Assinatura:</p><br/>"
        message += "<p>" + subscription + "</p>"
        message += "</div>"

    email_list = os.getenv('MAIL_LIST').split(',')
    env = os.getenv('ENV')
    if env == "Production":
        send_email = queue.signature('local_priority:send_email', args=(
            email_list, 'MeuML v2 - Assinatura Confirmada', message))
        send_email.delay()


def generate_nfse(action, internal_order_id):
    try:
        new_action = False
        if action is None:
            action = QueueActions()
            action.conn = get_conn()
            new_action = True

        query = """
            SELECT
                io.id, io.total_price, io.package_id, io.modules_id,
                io.access_type, io.accounts_id, pa.title, io.client_id
            FROM meuml.internal_orders io
            LEFT JOIN meuml.creditcard_transactions cc
                ON io.id = cc.internal_order_id
            LEFT JOIN meuml.boleto_transactions bo
                ON io.id = bo.internal_order_id
            LEFT JOIN meuml.efi_transactions ef
                ON io.id = ef.internal_order_id
            LEFT JOIN meuml.packages pa
                ON io.package_id = pa.id
            LEFT JOIN meuml.package_modules pm
                ON pm.package_id = pa.id
            WHERE io.id = :id and (bo.finalized = true or cc.authorized = '1' or ef.finalized = true)
            GROUP BY io.id, io.package_id, pa.title
        """
        internal_order = action.fetchone(query, {'id': internal_order_id})

        if internal_order is None:
            return

        query = """
            SELECT *
            FROM meuml.invoices
            WHERE internal_order_id = :id
        """
        invoice = action.fetchone(query, {'id': internal_order_id})

        if invoice is not None:
            return

        text = "Prestação de serviço de licenciamento de programa de computador não-customizável"

        # Alterar EMISSOR NFSe # 1 - Plug Notas | 2 Focusnfe
        nfse = 2

        if nfse == 1:
            pn_api = PlugNotasApi()
            service = pn_api.API_SERVICE
            service['discriminacao'] = text
            service['valor']['servico'] = internal_order['total_price']

            request_data = action.fetchone(
                "SELECT * FROM meuml.clients WHERE id=:id", {'id': internal_order['client_id']})
            if request_data is None:
                return

            invoice_json = [{
                "idIntegracao": str(internal_order_id),
                "enviarEmail": True,
                "prestador": pn_api.API_PROVIDER,
                "tomador": {
                    "cpfCnpj": ''.join([char for char in request_data['cpf_cnpj'] if char.isdigit()]),
                    "razaoSocial": request_data['razao_social'],
                    "email": request_data['email'],
                    "endereco": {
                        "descricaoCidade": request_data['descricao_cidade'],
                        "cep": ''.join([char for char in request_data['cep'] if char.isdigit()]),
                        "tipoLogradouro": request_data['tipo_logradouro'],
                        "logradouro": request_data['logradouro'],
                        "tipoBairro": request_data['tipo_bairro'],
                        "codigoCidade": ''.join([char for char in request_data['codigo_cidade'] if char.isdigit()]),
                        "estado": request_data['estado'],
                        "numero": ''.join([char for char in request_data['numero'] if char.isdigit()]),
                        "bairro": request_data['bairro']
                    }
                },
                "servico": [service]
            }]

            if request_data['inscricao_municipal'] is not None:
                invoice_json[0]['tomador']['inscricaoMunicipal'] = ''.join(
                    [char for char in request_data['inscricao_municipal'] if char.isdigit()])

            if request_data['complemento'] is not None:
                invoice_json[0]['tomador']['endereco']['complemento'] = request_data['complemento']

        else:
            nota_facil_api = FocusnfeApi()

            service = nota_facil_api.API_SERVICE
            service['discriminacao'] = text
            service['valor_servicos'] = float(internal_order['total_price'])

            request_data = action.fetchone(
                "SELECT * FROM meuml.clients WHERE id=:id", {'id': internal_order['client_id']})
            if request_data is None:
                return

            invoice_json = {
                "data_emissao": datetime.now().isoformat(),
                "regime_especial_tributacao": 5,
                "optante_simples_nacional": True,
                "natureza_operacao": 1,
                "prestador": nota_facil_api.API_PROVIDER,
                "tomador": {
                    "razao_social": request_data['razao_social'],
                    "email": request_data['email'],
                    "endereco": {
                        "logradouro": request_data['logradouro'],
                        "numero": ''.join([char for char in request_data['numero'] if char.isdigit()]),
                        "bairro": request_data['bairro'],
                        "codigo_municipio": ''.join([char for char in request_data['codigo_cidade'] if char.isdigit()]),
                        "uf": request_data['estado'],
                        "cep": ''.join([char for char in request_data['cep'] if char.isdigit()])
                    }
                },
                "servico": service
            }

            cpf_cnpj = ''.join(
                [char for char in request_data['cpf_cnpj'] if char.isdigit()]
            )

            if len(cpf_cnpj) == 11:
                invoice_json['tomador']['cpf'] = cpf_cnpj
            else:
                invoice_json['tomador']['cnpj'] = cpf_cnpj

            # if request_data['inscricao_municipal'] is not None and request_data['descricao_cidade'] == 'Curitiba':
            #     invoice_json['tomador']['inscricao_municipal'] = ''.join(
            #         [char for char in request_data['inscricao_municipal'] if char.isdigit()]
            #     )

            if request_data['complemento'] is not None:
                invoice_json['tomador']['endereco']['complemento'] = request_data['complemento']

    except Exception as e:
        LOGGER.error(traceback.format_exc())
        if new_action:
            action.conn.close()
        return

    try:
        if nfse == 1:
            response = pn_api.post('/nfse', json=invoice_json)
            response_data = response.json()
            status_code = response.status_code

            if status_code != 200:
                LOGGER.error(status_code)
                LOGGER.error(response_data)

            query = """
                INSERT INTO meuml.invoices (client_id, internal_order_id, status, external_id)
                VALUES (:client_id, :internal_order_id, :status, :external_id)
            """
            values = {
                'client_id': internal_order['client_id'],
                'internal_order_id': internal_order_id,
                'external_id': response_data['documents'][0]['id'],
                'status': 'PROCESSANDO'
            }
            action.execute(query, values)
        else:
            # Cadastrar NFSe
            response = nota_facil_api.post(
                f'/v2/nfse?ref={internal_order_id}', json=invoice_json
            )
            response_data = response.json()
            status_code = response.status_code

            query = """
                INSERT INTO meuml.invoices (client_id, internal_order_id, status, external_id)
                VALUES (:client_id, :internal_order_id, :status, :external_id)
            """
            values = {
                'client_id': internal_order['client_id'],
                'internal_order_id': internal_order_id,
                'external_id': response_data['ref'],
                'status': 'PROCESSANDO'
            }
            action.execute(query, values)

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        if new_action:
            action.conn.close()


def generate_failed_nfse_email(notification_json, notification):
    if not notification.get('cnpj_prestador'):
        message = "<div>"
        message = f"<p>Olá, a NFSe teve status de retorno {notification.get('situacao')}!</p><br/><br/>"
        message += "<p>ID Pedido:</p><br/>"
        message += "<p>" + notification.get('idIntegracao') + "</p>"
        message += "<p>ID Plugnotas:</p><br/>"
        message += "<p>" + notification.get('id') + "</p><br/><br/>"
        message += "<p>Detalhes:</p>"
        message += "<p>" + notification_json + "</p>"
        message += "</div>"

        email_list = os.getenv('MAIL_LIST').split(',')
        env = os.getenv('ENV')

        send_email = queue.signature('local_priority:send_email', args=(
            email_list, f'MeuML v2 - {env} - Falha ao emitir NFSe', message))
        send_email.delay()
    else:
        message = "<div>"
        message = f"<p>Olá, a NFSe teve status de retorno {notification.get('status')}!</p><br/><br/>"
        message += "<p>ID Pedido:</p><br/>"
        message += "<p>" + notification.get('ref') + "</p>"
        message += "<p>ID FocusNFe:</p><br/>"
        message += "<p>" + notification.get('ref') + "</p><br/><br/>"
        message += "<p>Detalhes:</p>"
        message += "<p>" + notification_json + "</p>"
        message += "</div>"

        email_list = os.getenv('MAIL_LIST').split(',')
        env = os.getenv('ENV')

        send_email = queue.signature('local_priority:send_email', args=(
            email_list, f'MeuML v2 - {env} - Falha ao emitir NFSe', message))
        send_email.delay()


def webhook_notification(notification):
    action = QueueActions()
    action.conn = get_conn()

    try:
        query = """
                INSERT INTO meli_stage.webhooks
                        (account_id, topic, resource, attempts, sent_at, received_at)
                    VALUES (:account_id, :topic, :resource, :attempts, :sent_at, :received_at)
            """

        values = {
            'account_id': notification.get('user_id'),
            'topic': notification.get('topic'),
            'resource': notification.get('resource'),
            'sent_at': notification.get('sent'),
            'received_at': notification.get('received'),
            'attempts': notification.get('attempts')
        }

        action.execute(query, values)
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
