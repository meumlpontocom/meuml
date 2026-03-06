import json
from redis import Redis
import traceback
from datetime import timedelta
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.push.push_expo_notification import send_expo_notification
from libs.schema.push_subscription_schema import SendExpoNotificationSchema, SubscribeSchema
from os import getenv
from pywebpush import webpush, WebPushException
from werkzeug.exceptions import HTTPException

from libs.context import ctx_stack

class PushNotificationsActions(Actions):
    @jwt_required 
    @prepare
    def subscribe(self):
        self.validate(SubscribeSchema())

        try:
            user_id = str(self.user['id'])

            if PushNotificationsActions.subscribe_user(self, user_id, self.data):
                return self.return_success("Dispositivo registrado com sucesso")
            else:
                raise Exception

        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao criar registrar dispositivo para notificações',
                'status': 'error',
            }, 500)


    @jwt_required 
    @prepare
    def unsubscribe(self):
        try:
            user_id = str(self.user['id'])

            if PushNotificationsActions.unsubscribe_user(self, user_id):
                return self.return_success("Dispositivo removido de notificações com sucesso")
            else:
                raise Exception
            
        except HTTPException:
            raise
        except:
            print(traceback.format_exc()) 
            
            self.abort_json({
                'message': f'Erro ao remover dispositivo do recebimento de notificações',
                'status': 'error',
            }, 500)
    
    
    @staticmethod
    def subscribe_user(action, user_id: str, subscription):
        try:
            redis_client = ctx_stack.redis_client
            
            subscription_string = json.dumps(subscription)
            user_subscriptions = PushNotificationsActions.get_user_subscriptions(user_id, redis_client)
            
            is_duplicated = False
            for user_subscription in user_subscriptions:
                if subscription['endpoint'] in user_subscription:
                    is_duplicated = True
                    break
            
            if not is_duplicated:
                user_subscriptions.append(subscription_string)
                max_subscriptions = 5
                stringified_list = json.dumps(user_subscriptions[-max_subscriptions:])
                
                redis_client.setex(user_id, timedelta(hours=8), str.encode(stringified_list))

            return True
        except:
            print(traceback.format_exc()) 
            return False
    

    @staticmethod
    def unsubscribe_user(action, user_id: str):
        try:
            redis_client = ctx_stack.redis_client
            redis_client.delete(user_id)

            return True
        except:
            print(traceback.format_exc()) 
            return False


    @staticmethod
    def get_user_subscriptions(user_id: str, redis_client):
        try:
            user_subscriptions_bytes = redis_client.get(user_id)

            if user_subscriptions_bytes:
                stringified_list = user_subscriptions_bytes.decode('utf-8')
                user_subscriptions = json.loads(stringified_list)
            else:
                user_subscriptions = []

            return user_subscriptions
        except:
            print(traceback.format_exc()) 


    @staticmethod
    def send_notification(user_id: str, notification: dict, redis_client = None):
        if not redis_client:
            redis_client = Redis(host=getenv('REDIS_URL'), port=getenv('REDIS_PORT'), db=getenv('REDIS_API_DB'), password=getenv('REDIS_PASSWORD'))

        user_subscriptions = PushNotificationsActions.get_user_subscriptions(user_id, redis_client)
        notification = json.dumps(notification)

        for subscription in user_subscriptions:
            subscription = json.loads(subscription)

            try:
                webpush(
                    subscription_info=subscription,
                    data=notification,
                    vapid_private_key=getenv('VAPID_PRIV_KEY'),
                    vapid_claims={"sub": "mailto:miltonbastos@gmail.com"}
                )

            except WebPushException as ex:
                print(repr(ex))
                if ex.response and ex.response.json():
                    extra = ex.response.json()
                    print("Remote service replied with a {}:{}, {}",
                        extra.code,
                        extra.errno,
                        extra.message
                    )
            except:
                print(traceback.format_exc()) 

    @jwt_required 
    @prepare
    def send_expo_notification(self):
        self.validate(SendExpoNotificationSchema())
        
        user_id = self.data["user_id"]
        title = self.data['title']
        body = self.data['body']
        
        result = send_expo_notification(user_id, title, body)
        
        return result
    
