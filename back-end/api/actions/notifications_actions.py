import json
import requests
import traceback
from flask import request, make_response, jsonify
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.enums.gateway import Gateway
from libs.queue.queue import app as queue
from libs.shopee_api.shopee_api import ShopeeApi
from os import getenv
from werkzeug.exceptions import HTTPException


class NotificationsActions(Actions):
    @prepare
    def mercadolivre_notification(self):
        if request.content_type == 'application/json':
            notification = request.json

            webhook_notification = queue.signature(
                'short_running:webhook_notification')
            webhook_notification.delay(notification)

            if notification.get('topic') == 'items':
                update_advertising_item = queue.signature(
                    'short_running:notification_process_advertising')
                update_advertising_item.delay(
                    notification['resource'], notification['user_id'])

            elif notification.get('topic') in ['orders_v2']:
                update_order_item = queue.signature(
                    'short_running:notification_process_order')
                update_order_item.delay(
                    notification['resource'], notification['user_id'])
                pass

            elif notification.get('topic') == 'messages':
                sync_message = queue.signature(
                    'short_running:notification_process_order_message')
                sync_message.delay(
                    notification['resource'], notification['user_id'])
                pass

            elif notification.get('topic') == 'payments':
                sync_payment = queue.signature(
                    'short_running:notification_process_order_payment')
                sync_payment.delay(
                    notification['resource'], notification['user_id'])
                pass

            elif notification.get('topic') == 'questions':
                notification_process_question = queue.signature(
                    'short_running:notification_process_question')
                notification_process_question.delay(
                    notification['resource'], notification['user_id'])

            elif notification.get('topic') == 'pictures':
                pass

            elif notification.get('topic') == 'shipments':
                sync_shipment = queue.signature(
                    'short_running:notification_process_order_shipment')
                sync_shipment.delay(
                    notification['resource'], notification['user_id'])
                pass

            elif notification.get('topic') == 'catalog_item_competition_status':
                sync_catalog_competition = queue.signature(
                    'short_running:notification_process_catalog_competition')
                sync_catalog_competition.delay(
                    notification['resource'], notification['user_id'])
                pass

            # elif notification.get('topic') is None:
            #     update_item_price = queue.signature(
            #         'short_running:notification_process_mshops_item_price')

            #     update_item_price.delay(
            #         notification['resource'], notification['user_id'])
            #     pass

        return make_response("Ok", 200)

    @prepare
    def pjbank_boleto_notification(self):
        try:
            notification = request.json

            if notification.get('credencial', '') == getenv('PJBANK_BOLETO_CREDENTIALS') and notification.get("operacao") == "PUT":
                query = """
                    INSERT INTO meli_stage.webhooks_pjbank (internal_order_id, type, data)
                    VALUES (:internal_order_id, :type, :data)
                """
                values = {
                    'internal_order_id': notification.get('pedido_numero') if isinstance(notification, dict) else None,
                    'type': 'boleto',
                    'data': json.dumps(notification),
                }
                self.execute(query, values)

                query = "SELECT id FROM meuml.boleto_transactions WHERE external_id = :external_id AND finalized IS FALSE AND gateway_id = :gateway_id"
                transaction = self.fetchone(
                    query, {'external_id': notification['id_unico'], 'gateway_id': Gateway.PJBANK})

                if transaction and len(notification.get('data_pagamento', '')) > 0:
                    query = """
                        UPDATE meuml.boleto_transactions
                            SET status = :status, message = :message, finalized = TRUE, date_modified = NOW()
                            WHERE external_id = :external_id AND gateway_id = :gateway_id
                            RETURNING internal_order_id
                    """
                    values = {
                        'external_id': notification['id_unico'],
                        'status': notification.get('registro_sistema_bancario'),
                        'message': notification.get('registro_rejeicao_motivo'),
                        'gateway_id': Gateway.PJBANK
                    }
                    internal_order_id = self.execute_returning(query, values)
                    process_payment = queue.signature(
                        'local_priority:notification_process_payment_pjbank')
                    process_payment.delay(internal_order_id, notification)
                elif transaction:
                    query = """
                        UPDATE meuml.boleto_transactions
                            SET status = :status, message = :message, date_modified = NOW()
                            WHERE external_id = :external_id AND gateway_id = :gateway_id
                            RETURNING internal_order_id
                    """
                    values = {
                        'external_id': notification['id_unico'],
                        'status': notification.get('registro_sistema_bancario'),
                        'message': notification.get('registro_rejeicao_motivo'),
                        'gateway_id': Gateway.PJBANK
                    }
                    internal_order_id = self.execute_returning(query, values)

            return make_response(
                jsonify({"status": "200"}),
                200
            )
        except HTTPException:
            raise
        except Exception as e:
            print(traceback.format_exc())

            message = str(e)
            email_list = getenv('MAIL_LIST').split(',')
            env = getenv('ENV')

            if env == "Production":
                send_email = queue.signature('local_priority:send_email', args=(
                    email_list, f'MeuML v2 - {env} - Falha ao receber webhook de pagamento', f"<div><p>{message}</p><br/></div>"))
                send_email.delay()

            self.abort_json({
                'message': f'Erro ao processar webhook',
                'status': 'error',
            }, 500)

    @prepare
    def efi_pix_notification(self):
        try:
            notification = request.json

            notification_pix = notification['pix'][0]

            notification_pix['valor_pago'] = ''
            notification_pix['tipo'] = ''

            txid = notification_pix.get('txid')
            endtoendid = notification_pix.get('endToEndId')

            query = """
                INSERT INTO meli_stage.webhooks_efi (
                    txid, endtoendid, type, data
                )
                VALUES (
                    :txid, :endtoendid, :type, :data
                )
            """

            values = {
                'txid': txid,
                'endtoendid': endtoendid,
                'type': 'pix',
                'data': json.dumps(notification),
            }
            self.execute(query, values)

            query = """
                SELECT id FROM meuml.efi_transactions
                WHERE
                    external_id = :external_id AND
                    finalized IS FALSE AND gateway_id = :gateway_id
            """

            transaction = self.fetchone(
                query,
                {
                    'external_id': txid,
                    'gateway_id': Gateway.EFI
                }
            )

            if transaction:
                query = """
                    UPDATE meuml.efi_transactions
                        SET finalized = TRUE, date_modified = NOW()
                        WHERE external_id = :external_id AND gateway_id = :gateway_id
                        RETURNING internal_order_id
                """
                values = {
                    'external_id': txid,
                    'gateway_id': Gateway.EFI
                }
                internal_order_id = self.execute_returning(query, values)
                process_payment = queue.signature(
                    'local_priority:notification_process_payment_pjbank')
                process_payment.delay(internal_order_id, notification_pix)
            elif not transaction:
                query = """
                    UPDATE meuml.efi_transactions
                        SET date_modified = NOW()
                        WHERE external_id = :external_id AND gateway_id = :gateway_id
                        RETURNING internal_order_id
                """
                values = {
                    'external_id': txid,
                    'gateway_id': Gateway.EFI
                }
                internal_order_id = self.execute_returning(query, values)

            return make_response(
                jsonify({"status": "200"}),
                200
            )
        except HTTPException:
            raise
        except Exception as e:
            print(traceback.format_exc())

            message = str(e)
            email_list = getenv('MAIL_LIST').split(',')
            env = getenv('ENV')

            if env == "Production":
                send_email = queue.signature('local_priority:send_email', args=(
                    email_list, f'MeuML v2 - {env} - Falha ao receber webhook de pagamento', f"<div><p>{message}</p><br/></div>"))
                send_email.delay()

            self.abort_json({
                'message': f'Erro ao processar webhook',
                'status': 'error',
            }, 500)

    @prepare
    def pjbank_creditcard_notification(self):
        try:
            notification = request.json

            message = ''
            if notification.get('msg_erro'):
                message += notification.get('msg_erro') + ' '
            if notification.get('msg_erro_estorno'):
                message += notification.get('msg_erro_estorno')

            internal_order_id = None

            if notification.get('credencial', '') == getenv('PJBANK_CREDENTIALS'):
                query = """
                    INSERT INTO meli_stage.webhooks_pjbank (internal_order_id, type, data)
                    VALUES (:internal_order_id, :type, :data)
                """
                values = {
                    'internal_order_id': notification.get('pedido_numero') if isinstance(notification, dict) else None,
                    'type': 'credit_card',
                    'data': json.dumps(notification),
                }
                self.execute(query, values)

                query = """
                    SELECT io.id, io.user_id, io.total_price, ct.id as creditcard_transaction_id, ct.authorized, ct.canceled
                    FROM meuml.internal_orders io
                    LEFT JOIN meuml.creditcard_transactions ct ON io.id = ct.internal_order_id AND ct.gateway_id = :gateway_id
                    WHERE io.id = :internal_order_id
                """
                values = {
                    'internal_order_id': int(notification['pedido_numero']),
                    'gateway_id': Gateway.PJBANK
                }
                internal_order = self.fetchone(query, values)

                if internal_order and internal_order['creditcard_transaction_id']:
                    # Não houveram mudanças, webhook já tratada anteriormente
                    if internal_order['authorized'] == str(notification.get('autorizada', '0')).strip() \
                            and internal_order['canceled'] == str(notification.get('cancelada', '0')).strip():
                        return make_response(
                            jsonify({"status": "200"}),
                            200
                        )

                    query = """
                        UPDATE meuml.creditcard_transactions
                            SET authorized = :authorized, canceled = :canceled, message = :message, date_modified = NOW()
                            WHERE internal_order_id = :internal_order_id AND gateway_id = :gateway_id AND (authorized != :authorized OR canceled != :canceled)
                            RETURNING internal_order_id
                    """
                    values = {
                        'internal_order_id': int(notification['pedido_numero']),
                        'authorized': str(notification.get('autorizada', '0')),
                        'canceled': str(notification.get('cancelada', '0')),
                        'message': message if message and len(message) > 0 else None,
                        'gateway_id': Gateway.PJBANK
                    }
                    internal_order_id = self.execute_returning(query, values)

                    if not internal_order_id:
                        message = f"Erro ao atualizar Transação de cartão #{internal_order['creditcard_transaction_id']} do pedido #{notification['pedido_numero']} e pagamento de tid #{notification['tid']}"
                        raise Exception(message)

                elif internal_order:
                    query = """
                        INSERT INTO meuml.creditcard_transactions (user_id, internal_order_id, gateway_id, external_id, amount, authorized, canceled, message)
                        VALUES (:user_id, :internal_order_id, :gateway_id, :external_id, :amount, :authorized, :canceled, :message)
                        RETURNING internal_order_id
                    """
                    values = {
                        'user_id': internal_order['user_id'],
                        'internal_order_id': internal_order['id'],
                        'gateway_id': Gateway.PJBANK,
                        'external_id': int(notification['tid']),
                        'amount': internal_order['total_price'],
                        'authorized': notification.get('autorizada', '0'),
                        'canceled': notification.get('cancelada', '0'),
                        'message': message if message and len(message) > 0 else None
                    }
                    internal_order_id = self.execute_insert(query, values)

                    if not internal_order_id:
                        message = f"Erro ao inserir Nova transação de cartão para o pedido #{notification['pedido_numero']} e pagamento de tid #{notification['tid']}"
                        raise Exception(message)
                    else:
                        message = f"Transação de cartão não inserida previamete para o pedido #{notification['pedido_numero']} e pagamento de tid #{notification['tid']}. Pagamento inserido com sucesso, porém sem informações do cartão (brand, número, token)"
                        email_list = getenv('MAIL_LIST').split(',')
                        env = getenv('ENV')

                        if env == "Production":
                            send_email = queue.signature('local_priority:send_email', args=(
                                email_list, f'MeuML v2 - {env} - Falha ao receber webhook de pagamento', f"<div><p>{message}</p><br/></div>"))
                            send_email.delay()

                if internal_order_id:
                    if values['canceled'] != '1' and values['authorized'] == '1':
                        process_payment = queue.signature(
                            'local_priority:notification_process_payment_pjbank')
                        process_payment.delay(internal_order_id, notification)
                    elif values['canceled'] == '1':
                        process_cancel_payment = queue.signature(
                            'local_priority:notification_process_cancel_payment_pjbank')
                        process_cancel_payment.delay(
                            internal_order_id, notification)
                else:
                    message = f"Pedido #{notification['pedido_numero']} não encontrado para pagamento de tid #{notification['tid']}"
                    raise Exception(message)

            return make_response(
                jsonify({"status": "200"}),
                200
            )
        except HTTPException:
            raise
        except Exception as e:
            print(traceback.format_exc())

            message = str(e)
            email_list = getenv('MAIL_LIST').split(',')
            env = getenv('ENV')

            if env == "Production":
                send_email = queue.signature('local_priority:send_email', args=(
                    email_list, f'MeuML v2 - {env} - Falha ao receber webhook de pagamento', f"<div><p>{message}</p><br/></div>"))
                send_email.delay()

            self.abort_json({
                'message': f'Erro ao processar webhook',
                'status': 'error',
            }, 500)

    def plugnotas_notification(self):
        notification = request.data

        if notification:
            process_payment = queue.signature(
                'local_priority:notification_process_nfse')
            process_payment.delay(notification.decode('utf-8'))

        return make_response("", 200)

    def focusnfe_notification(self):
        notification = request.data

        if notification:
            process_payment = queue.signature(
                'local_priority:notification_process_nfse')
            process_payment.delay(notification.decode('utf-8'))

        return make_response("", 200)

    def shopee_notification(self):
        if True:  # ShopeeApi.is_webhook_trustful(request):
            process_data = queue.signature(
                'short_running:notification_process_shopee')
            process_data.delay(request.json)

        return make_response("", 200)
