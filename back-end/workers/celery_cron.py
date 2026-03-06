import calendar
import random
import traceback
from celery.utils.log import get_task_logger
from datetime import datetime, timedelta
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.gateway import Gateway
from libs.gateways.pjbank import PJBankApi
from libs.mail.mail_templates.lembrete_assinatura import NotificarVencimento
from libs.minio_api.minio_api import deactivate_bucket, minio_client
from libs.queue.queue import app as queue
from os import getenv
from workers.loggers import log_daily_routine, log_daily_routine_timestamp
from workers.tasks.mercadolibre.advertising_import_all import advertising_import_all, mshops_advertising_import_all
from workers.tasks.mercadolibre.order_import_all import order_import_all

LOGGER = get_task_logger(__name__)


def create_next_month_partititions(pool):
    action = QueueActions()
    action.conn = get_conn()

    try:
        date = datetime.utcnow() + timedelta(days=30)
        next_date = date + timedelta(days=30)

        LOGGER.warning(
            f'Creating new month partitions: _{date.year}_{date.month:02d}')

        query = f"""
                CREATE TABLE IF NOT EXISTS meuml.advertising_positions_{date.year}_{date.month:02d}
                partition OF meuml.advertising_positions
                FOR VALUES FROM ('{date.year}-{date.month}-01') TO ('{next_date.year}-{next_date.month:02d}-01')
            """
        action.execute(query)

        # query = f"""
        #         CREATE TABLE IF NOT EXISTS meuml.orders_{date.year}_{date.month:02d}
        #         partition OF meuml.orders
        #         FOR VALUES FROM ('{date.year}-{date.month}-01') TO ('{next_date.year}-{next_date.month:02d}-01')
        #     """
        # action.execute(query)

        # query = f"""
        #         CREATE TABLE IF NOT EXISTS meuml.order_items_{date.year}_{date.month:02d}
        #         partition OF meuml.order_items
        #         FOR VALUES FROM ('{date.year}-{date.month}-01') TO ('{next_date.year}-{next_date.month:02d}-01')
        #     """
        # action.execute(query)

        # query = f"""
        #         CREATE TABLE IF NOT EXISTS meuml.order_messages_{date.year}_{date.month:02d}
        #         partition OF meuml.order_messages
        #         FOR VALUES FROM ('{date.year}-{date.month}-01') TO ('{next_date.year}-{next_date.month:02d}-01')
        #     """
        # action.execute(query)

        # query = f"""
        #         CREATE TABLE IF NOT EXISTS meuml.order_payments_{date.year}_{date.month:02d}
        #         partition OF meuml.order_payments
        #         FOR VALUES FROM ('{date.year}-{date.month}-01') TO ('{next_date.year}-{next_date.month:02d}-01')
        #     """
        # action.execute(query)

        # query = f"""
        #         CREATE TABLE IF NOT EXISTS meuml.order_shipments_{date.year}_{date.month:02d}
        #         partition OF meuml.order_shipments
        #         FOR VALUES FROM ('{date.year}-{date.month}-01') TO ('{next_date.year}-{next_date.month:02d}-01')
        #     """
        # action.execute(query)

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def deactivate_expired_subscriptions_bucket():
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = """
            SELECT user_id, latest_module_expiration_date
            FROM (
                SELECT su.user_id, max(su.expiration_date) as latest_module_expiration_date
                FROM meuml.subscriptions su
                WHERE string_to_array(su.modules, ',') @> array['13']
                GROUP BY su.user_id
            ) subquery
            WHERE latest_module_expiration_date BETWEEN (now() - interval '1' day) AND now()
        """

        expired_subscriptions = action.fetchall(query)

        for subscription in expired_subscriptions:
            deactivate_bucket(subscription['user_id'])

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def lookup_paid_boletos(pool):
    action = QueueActions()
    action.conn = get_conn()

    try:
        log_daily_routine_timestamp(task='Lookup PJBank boletos', start=True)

        api = PJBankApi()
        endpoint = f'/recebimentos/{api.boleto_credentials}/transacoes'

        last_week = (datetime.today() - timedelta(days=7)).strftime("%m/%d/%Y")
        today = datetime.today().strftime("%m/%d/%Y")
        page = 1

        while True:
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CHAVE': api.boleto_key
            }
            params = {
                'pago': 1,
                'data_inicio': last_week,
                'data_fim': today,
                'pagina': page
            }
            response = api.get(endpoint, headers=headers, params=params)

            if response.status_code != 200:
                details = f"HTTP: {response.status_code}; Endpoint: {endpoint}; headers: {str(headers)}; parâmetros: {params}"
                log_daily_routine({
                    'task': 'Lookup PJBank boletos',
                    'status': 'failed',
                    'details': details,
                })
                break

            else:
                boleto_notifications = response.json()

                for notification in boleto_notifications:
                    query = "SELECT id, internal_order_id FROM meuml.boleto_transactions WHERE external_id = :external_id AND finalized IS FALSE AND gateway_id = :gateway_id"
                    transaction = action.fetchone(
                        query, {'external_id': notification['id_unico'], 'gateway_id': Gateway.PJBANK})

                    if transaction and len(notification.get('data_pagamento', '')) > 0:
                        query = """
                            UPDATE meuml.boleto_transactions
                                SET status = :status, message = :message, finalized = TRUE, date_modified = NOW()
                                WHERE id = :id
                        """
                        values = {
                            'status': notification.get('registro_sistema_bancario'),
                            'message': notification.get('registro_rejeicao_motivo'),
                            'id': transaction['id']
                        }
                        action.execute(query, values)

                        notification['tipo'] = 'recebimento_boleto'
                        process_payment = queue.signature(
                            'local_priority:notification_process_payment_pjbank')
                        process_payment.delay(
                            transaction['internal_order_id'], notification)

                    elif transaction:
                        query = """
                            UPDATE meuml.boleto_transactions
                                SET status = :status, message = :message, date_modified = NOW()
                                WHERE id = :id
                        """
                        values = {
                            'status': notification.get('registro_sistema_bancario'),
                            'message': notification.get('registro_rejeicao_motivo'),
                            'id': transaction['id']
                        }
                        action.execute(query, values)

                if len(boleto_notifications) < 50:
                    break
            page += 1

        log_daily_routine_timestamp(task='Lookup PJBank boletos')

    except Exception as e:
        LOGGER.error(e)
        log_daily_routine({
            'task': 'Lookup PJBank boletos',
            'status': 'failed',
            'details': f'exception raised during boleto lookup - error message: {str(e)}',
        })
    finally:
        action.conn.close()


def send_subscription_reminder(pool):
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = """
            SELECT id, title
            FROM meuml.modules
        """
        modules_list = action.fetchall(query)
        modules = {}
        for module in modules_list:
            modules[str(module['id'])] = module

        query = """
            SELECT pa.id, pa.title, string_agg(mo.title, ', ' ORDER BY mo.id) as modules
            FROM meuml.packages pa
            JOIN meuml.package_modules pm ON pm.package_id = pa.id
            JOIN meuml.modules mo ON mo.id=pm.module_id
            GROUP BY pa.id
        """
        packages_list = action.fetchall(query)
        packages = {}
        for package in packages_list:
            packages[str(package['id'])] = package

        query = """
            SELECT distinct us.email, su.id, su.price, su.package_id, su.modules, su.expiration_date,
                string_agg(coalesce (ac.name,sc.name), ', '  order by coalesce(ac.name, sc.name)) as accounts
            FROM meuml.users us
            JOIN meuml.subscriptions su ON su.user_id = us.id
            JOIN meuml.subscription_accounts sa ON sa.subscription_id = su.id
            LEFT JOIN meuml.accounts ac ON sa.account_id = ac.id
            LEFT JOIN shopee.accounts sc ON sa.account_id = sc.id
            WHERE su.expiration_date BETWEEN current_date AND (current_date + interval '3' day)
            GROUP BY us.email,su.id
        """
        subscriptions = action.fetchall(query)

        title = 'MeuML v2 - Lembrete: Assinatura perto do vencimento'

        for subscription in subscriptions:
            expiration_date = subscription['expiration_date'].strftime(
                "%d/%m/%Y %H:%M")
            url = getenv('SITE_URL') + '/#/assinaturas/planos'
            price = "{:.2f}".format(subscription['price']).replace('.', ',')
            message = f'Sua assinatura vence em {expiration_date}, com isso você perderá o acesso as funcionalidades exclusivas à assinantes do MeuML. Acesse {url} e renove sua Assinatura'

            if subscription['modules']:
                package_str = 'Personalizado'
                modules_str = ''
                for module_id in subscription['modules'].split(','):
                    modules_str += modules[str(module_id)]['title'] + ', '
                modules_str = modules_str[:-2]

            else:
                package_str = packages[str(
                    subscription['package_id'])]['title']
                modules_str = packages[str(
                    subscription['package_id'])]['modules']

            template = NotificarVencimento(
                accounts=subscription['accounts'],
                package=package_str,
                modules=modules_str,
                price=price,
                expiration_date=expiration_date
            )


            send_email = queue.signature('local_priority:send_email', args=(
                [subscription['email']], title, message, template))
            send_email.delay()

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def synchronize_advertisings_routine():
    try:
        log_daily_routine_timestamp(
            task='Synchronize advertisings routine', start=True)

        action = QueueActions()
        action.conn = get_conn()

        query = """
            SELECT ac.id
            FROM meuml.accounts ac
            JOIN meuml.subscription_accounts sa ON sa.account_id = ac.id
            JOIN meuml.subscriptions su ON sa.subscription_id = su.id
            WHERE su.expiration_date > NOW() AND
                ac.status = 1 AND
                (su.package_id > 1 OR string_to_array(su.modules, ',') @> array['6']) AND
                ac.id%%2 = EXTRACT(doy FROM CURRENT_DATE)::int%%2
        """
        accounts = action.fetchall(query)

        # advertising_import_all = queue.signature('long_running:advertising_import_all')

        for account in accounts:
            # Synchronize accounts in parallel
            # advertising_import_all.delay(account_id=account['id'], new_account=False, routine=True)

            # Synchronize accounts sequentially
            advertising_import_all(
                pool=True, account_id=account['id'], new_account=False, routine=True)
            # mshops_advertising_import_all(
            #     pool=True, account_id=account['id'], new_account=False, routine=True)

        log_daily_routine_timestamp(task='Synchronize advertisings routine')

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def synchronize_orders_routine():
    try:
        log_daily_routine_timestamp(
            task='Synchronize orders routine', start=True)

        action = QueueActions()
        action.conn = get_conn()

        query = """
            SELECT ac.id, now() AS oldest_order, ac.total_orders,
            	(CASE WHEN string_agg(su.package_id::varchar, ',') is not null THEN 1  when  string_agg(su.modules, ',') is not null then 2 else 3 end) as priority
            FROM meuml.accounts ac
            LEFT JOIN meuml.subscription_accounts sa
            	ON sa.account_id = ac.id
            LEFT JOIN meuml.subscriptions su
            	ON su.id = sa.subscription_id AND su.expiration_date > now()
            WHERE
                ac.status = 1 AND
                ac.user_id IS NOT NULL AND
                ac.has_historical_orders IS FALSE AND
                ac.access_token_expires_at  > (now() - interval '6' month)
            GROUP BY ac.id
            ORDER BY priority
        """
        accounts = action.fetchall(query)
        total_orders = 0

        # order_import_all = queue.signature('long_running:order_import_all')

        for account in accounts:
            # if total_orders + account['total_orders'] > 150000 and total_orders != 0:
            #     break

            # timestamp = datetime.strptime(account['oldest_order'], '%Y-%m-%d %H:%M:%S')
            oldest_order = f"{account['oldest_order'].strftime('%Y-%m-%dT%H:%M:%S')}.000-00:00"

            # Synchronize accounts in parallel
            # order_import_all.delay(account_id=account['id'], only_recent_orders=False, routine=True)

            # Synchronize accounts sequentially
            order_import_all(
                pool=True, account_id=account['id'], only_recent_orders=False, routine=True, oldest_order=oldest_order)
            total_orders += account['total_orders']

        log_daily_routine_timestamp(task='Synchronize orders routine')

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def remove_old_files():
    try:
        action = QueueActions()
        action.conn = get_conn()

        bucket_name = 'marketplace-files'

        query = """
            SELECT mf.path
            FROM meuml.marketplace_files mf
            WHERE mf.date_created < now()-interval '2' day
        """
        files = action.fetchall(query)

        for file_data in files:
            minio_client.remove_object(
                bucket_name=bucket_name, object_name=file_data['path'])

        query = "DELETE FROM meuml.marketplace_files WHERE date_created < now()-interval '2' day"
        action.execute(query)

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def transfer_old_data():
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = "SELECT historic.move_advertising_visits_to_hist()"
        action.execute(query)

        query = "SELECT historic.move_process_to_hist()"
        action.execute(query)

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
