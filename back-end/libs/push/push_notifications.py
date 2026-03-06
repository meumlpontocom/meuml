import json
import traceback
from datetime import datetime, timedelta
from os import getenv
from pywebpush import webpush, WebPushException
from redis import Redis


def unsubscribe_user(action, user_id: str, redis_client = None):
    try:
        if not redis_client:
            redis_client = Redis(host=getenv('REDIS_URL'), port=getenv('REDIS_PORT'), db=getenv('REDIS_API_DB'), password=getenv('REDIS_PASSWORD'))

        redis_client.delete(user_id)

        return True
    except:
        print(traceback.format_exc()) 
        return False


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


def send_notification(user_id: str, notification: dict, redis_client = None):
    if not redis_client:
        redis_client = Redis(host=getenv('REDIS_URL'), port=getenv('REDIS_PORT'), db=getenv('REDIS_API_DB'), password=getenv('REDIS_PASSWORD'))

    user_subscriptions = get_user_subscriptions(user_id, redis_client)
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
