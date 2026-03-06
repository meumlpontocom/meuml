import re
import traceback
from flask import request, make_response, jsonify, Response
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.schema.order_messages_schema import NewMessageOrderSchema
from libs.translations.mercadolibre_order_payments import MLPaymentsPTBR
from libs.translations.mercadolibre_order_shipments import MLShipmentsPTBR

class OrderMessagesActions(Actions):
    @jwt_required
    @prepare
    def messages(self, order_id):
        data = []

        try:
            query = """
                SELECT 
                    id, order_id, pack_id,
                    from_user_id, from_email, from_name, status, "text", 
                    moderation_status, moderation_reason, moderation_by, 
                    TO_CHAR(date_created, \'HH24:MI:SS DD/MM/YYYY\') as date_created,
                    TO_CHAR(date_available, \'HH24:MI:SS DD/MM/YYYY\') as date_available, 
                    TO_CHAR(date_received, \'HH24:MI:SS DD/MM/YYYY\') as date_received, 
                    TO_CHAR(date_notified, \'HH24:MI:SS DD/MM/YYYY\') as date_notified, 
                    TO_CHAR(date_read, \'HH24:MI:SS DD/MM/YYYY\') as date_read, 
                    TO_CHAR(moderation_date, \'HH24:MI:SS DD/MM/YYYY\') as moderation_date, 
                    message_attachments 
                FROM meuml.order_messages 
                WHERE order_id = :order_id 
                ORDER BY date_created
            """
            values = {'order_id': order_id}
            data = self.fetchall(query, values)

        except Exception:
            print(traceback.format_exc())
            self.abort_json({
                'message': f'Erro ao localizar mensagens.',
                'status': 'error',
            }, 500)

        return self.return_success(data=data)

    @jwt_required
    @prepare
    def reply(self, order_id, pack_id):
        self.validate(NewMessageOrderSchema())
        request_data = self.data

        query = """
            SELECT od.account_id, od.buyer_id, ac.external_data ->> 'email' as email, ac.*  
            FROM meuml.orders od 
            JOIN meuml.accounts ac ON ac.id = od.account_id 
            WHERE od.id = :order_id AND ac.status = 1 AND ac.user_id = :user_id 
        """
        db_data = self.fetchone(query, {'user_id': self.user['id'], 'order_id': order_id})

        if db_data is None:
            self.abort_json({
                'message': f"Conta ativa associada a venda não encontrada",
                'status': 'error',
            }, 400)

        new_message = {
            "from" : {
                "user_id": db_data['account_id'],
                "email" : db_data['email']
            },
            "to": {
                "user_id" : db_data['buyer_id']
            },
            "text": request_data['text']
        }
        
        if request_data.get('attachments'):
            new_message["attachments"] = request_data["attachments"]     

        access_token = self.refresh_token(account=db_data)
        if access_token is None or access_token is False:
            self.abort_json({
                'message': f"Token não renovado",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.post(f'/messages/packs/{pack_id}/sellers/{db_data["account_id"]}', json=new_message)
        response_data = response.json()

        if response.status_code != 201:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre",
                'status': 'error',
                'error': response_data
            }, 502)
        
        return self.return_success(data=response_data)


    @jwt_required
    @prepare
    def save_attachment(self, order_id, pack_id):
        allowed_types = [
            'text/plain',
            'image/png',
            'image/jpeg',
            'image/heif',
            'image/heic',
            'application/pdf',
            'application/msword',
            'application/vnd.ms-excel',
            'text/xml,application/xml',
            'application/octet-stream'
        ]

        new_file = request.files.get('file')
        content_type = new_file.headers.get('Content-Type','')

        if content_type not in allowed_types:
            self.abort_json({
                'message': f"Este formato de arquivo não é aceito pelo Mercado Livre.",
                'status': 'error',
            }, 400)

        new_file = {"file": (new_file.filename, new_file.read(), content_type)}

        query = """
            SELECT ac.*  
            FROM meuml.orders od 
            JOIN meuml.accounts ac ON ac.id = od.account_id 
            WHERE od.id = :order_id AND ac.status = 1 AND ac.user_id = :user_id
        """
        account = self.fetchone(query, {'user_id': self.user['id'], 'order_id': order_id})

        if account is None:
            self.abort_json({
                'message': f"Conta ativa do Mercado Livre não encontrada.",
                'status': 'error',
            }, 400)

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']
        
        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.post('/messages/attachments?tag=post_sale&site_id=MLB', files=new_file)
        response_data = response.json()

        if response.status_code not in [200,201]:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error',
            }, 502)
        
        return self.return_success(data=response_data)


    @jwt_required
    @prepare
    def load_attachment(self, order_id, pack_id, attachment_id):
        query = """
            SELECT ac.*  
            FROM meuml.orders od 
            JOIN meuml.accounts ac ON ac.id = od.account_id 
            WHERE od.id = :order_id AND ac.status = 1 AND ac.user_id = :user_id
        """
        account = self.fetchone(query, {'user_id': self.user['id'], 'order_id': order_id})
        
        if account is None:
            self.abort_json({
                'message': f"Conta ativa associada a venda não encontrada",
                'status': 'error',
            }, 400)
        
        access_token = self.refresh_token(account=account)
        if access_token is None or access_token is False:
            self.abort_json({
                'message': f"Token não renovado",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.get(f'/messages/attachments/{attachment_id}?tag=post_sale&site_id=MLB')

        if response.status_code != 200:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre",
                'status': 'error',
                'error': response.json()
            }, 502)
        
        return Response(response.iter_content(chunk_size=10*1024),
                    content_type=response.headers['Content-Type'])
