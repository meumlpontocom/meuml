from exponent_server_sdk import PushClient, PushMessage, PushServerError, DeviceNotRegisteredError
from requests.exceptions import ConnectionError, HTTPError
from libs.actions.actions import Actions
from libs.database.database_postgres import get_conn
from flask import jsonify

def send_expo_notification(user_id, title, body):
    action = Actions()
    action.conn = get_conn()

    query = '''
        SELECT DISTINCT device_token 
        FROM meuml.users_tokens 
        WHERE user_id = :user_id
    '''
    tokens = action.fetchall(query, {'user_id': user_id})
    
    if not tokens:
        return jsonify({"status": "error", "message": "Nenhum token encontrado para este usuário"}), 404

    expo_tokens = [token['device_token'] for token in tokens]

    # Initialize the Expo push client
    push_client = PushClient()

    messages = []
    for expo_token in expo_tokens:
        messages.append(PushMessage(to=expo_token, title=title, body=body, sound="default"))

    try:
        # Send notifications
        response = push_client.publish_multiple(messages)

        # Check if there are any failed tokens
        failed_tokens = []
        for ticket in response:
            if ticket.status == "error":
                if ticket.details and 'token' in ticket.details:
                    failed_tokens.append(ticket.details['token'])

        if failed_tokens:
            # Remover ou desativar tokens inválidos no banco de dados
            action.conn.execute('''
                DELETE FROM meuml.users_tokens 
                WHERE device_token IN :tokens
            ''', {'tokens': tuple(failed_tokens)})
            
            return jsonify({
                "status": "partial_success",
                "message": f"Notificações enviadas, mas {len(failed_tokens)} falharam",
                "failed_tokens": failed_tokens
            }), 206

        return jsonify({"status": "success", "message": "Notificações enviadas com sucesso"}), 200

    except (PushServerError, ConnectionError, HTTPError, ValueError) as e:
        # Handle push notification errors
        return jsonify({"status": "error", "message": f"Erro ao enviar notificações: {str(e)}"}), 500

    except DeviceNotRegisteredError as e:
        # Handle unregistered device tokens
        return jsonify({"status": "error", "message": f"Dispositivo não registrado: {str(e)}"}), 400
