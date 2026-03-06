import traceback
from celery.utils.log import get_task_logger
from datetime import datetime
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.push.push_notifications import send_notification
from libs.whatsapp_api.whatapp_api import WhatsappApi
from workers.helpers import get_account
from workers.tasks.shopee.import_order_details import shopee_import_order
from workers.tasks.shopee.import_order_list import create_table_orders

LOGGER = get_task_logger(__name__)

def notification_process_shopee(data={}):
    code = data.get('code')

    if code == 1:
        pass

    elif code == 2:
        process_deauthorization(data)

    elif code == 3:
        process_order_status(data)

    elif code == 4:
        process_tracking_number(data)

    elif code == 5:
        pass

    else:
        pass


def process_deauthorization(data):
    action = QueueActions()
    action.conn = get_conn()

    try:
        query = """
            UPDATE shopee.accounts SET internal_status = 0 WHERE id = :id
        """
        action.execute(query, {'id': data['shop_id']})

        account = action.fetchone("SELECT id, user_id, name FROM shopee.accounts WHERE id = :id", {'id': data['shop_id']})

        send_notification(str(account['user_id']), {'title': 'MeuML - conta Shopee perdeu autenticação', 'url': '/contas', 'body': f'A conta {account["name"]} da Shopee perdeu autenticação. Por favor, faça login e autorize novamente a integração com o MeuML'})

        WhatsappApi.send_text_message_to_user(
            action,
            account['user_id'],
            account['id'],
            'SP',
            'whatsapp-auth',
            'lost_authentication_sp',
            account_name=account['name']
        )

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def process_order_status(data):
    action = QueueActions()
    action.conn = get_conn()

    try:
        is_new_order = False

        if not action.fetchone("SELECT id FROM shopee.orders WHERE account_id = :id LIMIT 1", {'id': data['shop_id']}):
            create_table_orders(data['shop_id'], action)

        if not action.fetchone("SELECT id FROM shopee.orders WHERE id = :id", {'id': data['data']['ordersn']}):
            is_new_order = True

        order = shopee_import_order(data['shop_id'], data['data']['ordersn'], action, is_new_order)

        if is_new_order and order:
            account = get_account(action, data['shop_id'], platform='SP') 

            if not account:
                return

            items = []
            for item in order['items']:
                items.append(f"{item['item_name']} - R$ {item['variation_discounted_price']}{' ('+item['variation_quantity_purchased']+' unidades)' if item['variation_quantity_purchased'] > 1 else ''}")
            items = ', '.join(items)
            formatted_date = datetime.fromtimestamp(order['order']['create_time']).strftime("%H:%M:%S, %m/%d/%Y")

            push_notification = {
                'title': f"Parabéns, você vendeu no Shopee, conta {account['name']}!",
                'url': '/vendas',
                'body': f"""Parabéns, você vendeu no Shopee, conta {account['name']}!\n\nVenda #{order['order']['ordersn']}\nProduto(s): {items}\nData/hora da compra: {formatted_date}\n\nPara mais informações, entre no app2.meuml.com"""
            }

            send_notification(str(account['user_id']), push_notification)

            WhatsappApi.send_text_message_to_user(
                action,
                account['user_id'],
                account['id'],
                'SP',
                'whatsapp-orders',
                'marketplace_order_created',
                account_name=account['name'],
                qtd=(items),
                product_name=items,
                value=0
            )

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def process_tracking_number(data):
    action = QueueActions()
    action.conn = get_conn()

    try:
        if not action.fetchone("SELECT id FROM shopee.orders WHERE account_id = :id LIMIT 1", {'id': data['shop_id']}):
            create_table_orders(data['shop_id'], action)

        if not action.fetchone("SELECT id FROM shopee.orders WHERE id = :id", {'id': data['data']['ordersn']}):
            order = shopee_import_order(data['shop_id'], data['data']['ordersn'], action, is_new_order=True)

            if order:
                account = get_account(action, data['shop_id'], platform='SP')

                if not account:
                    return

                items = []
                for item in order['items']:
                    items.append(f"{item['item_name']} - R$ {item['variation_discounted_price']}{' ('+item['variation_quantity_purchased']+' unidades)' if item['variation_quantity_purchased'] > 1 else ''}")
                items = ', '.join(items)
                formatted_date = datetime.fromtimestamp(order['order']['create_time']).strftime("%H:%M:%S, %m/%d/%Y")

                push_notification = {
                    'title': f"Parabéns, você vendeu no Shopee, conta {account['name']}!",
                    'url': '/vendas',
                    'body': f"""Parabéns, você vendeu no Shopee, conta {account['name']}!\n\nVenda #{order['order']['ordersn']}\nProduto(s): {items}\nData/hora da compra: {formatted_date}\n\nPara mais informações, entre no app2.meuml.com"""
                }

                send_notification(str(account['user_id']), push_notification)

                WhatsappApi.send_text_message_to_user(
                    action,
                    account['user_id'],
                    account['id'],
                    'SP',
                    'whatsapp-orders',
                    'marketplace_order_created',
                    account_name=account['name'],
                    qtd=(items),
                    product_name=items,
                    value=0
                )

        else:
            action.execute(
                "UPDATE shopee.orders SET tracking_no = :trackingno WHERE id = :id",
                {'id': data['data']['ordersn'], 'trackingno': data['data']['trackingno']}
            )

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
