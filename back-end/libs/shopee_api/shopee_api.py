
import hashlib, hmac
import json as json_lib
import requests
import time
from datetime import datetime, timedelta
from libs.exceptions.exceptions import ShopeeConnectionException
from libs.push.push_notifications import send_notification
from libs.whatsapp_api.whatapp_api import WhatsappApi
from os import getenv
from requests.adapters import HTTPAdapter
from typing import Any, Optional
from urllib3.util import Retry

from celery.utils.log import get_task_logger
LOGGER = get_task_logger(__name__)

class ShopeeApi:
    """HTTP requests for Shopee API."""

    API_URL: str = getenv('SHOPEE_API_URL')
    AUTHORIZE_URL: str = getenv('SHOPEE_AUTHORIZE_URL')
    DEAUTHORIZE_URL: str = getenv('SHOPEE_DEAUTHORIZE_URL')
    REDIRECT_URL: str = getenv('SHOPEE_REDIRECT_URL')
    REMOVE_REDIRECT_URL: str = getenv('SHOPEE_REMOVE_REDIRECT_URL')
    TIMEOUT: int = 30
    SHOPEE_PARTNER_ID: int = int(getenv('SHOPEE_PARTNER_ID'))
    SHOPEE_PARTNER_KEY: str = getenv('SHOPEE_PARTNER_KEY')

    def __init__(self, access_token: Optional[str] = None, expires_in = None, shop_id: Optional[str] = None, refresh_expires_in=None) -> None:
        self.access_token = access_token
        self.expires_in = expires_in
        self.shop_id = shop_id
        self.refresh_expires_in = refresh_expires_in

        retries = Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 510])

        self.session = requests.Session()
        self.session.mount(self.API_URL, HTTPAdapter(max_retries=retries))
        self.session.headers.update({'Accept': 'application/json'})

    def update_auth(self, shop_id=None, access_token=None, expires_in=None, refresh_expires_in=None):
        if access_token:
            self.access_token = access_token

        if expires_in:
            self.expires_in = expires_in

        if refresh_expires_in:
            self.refresh_expires_in = refresh_expires_in

        if shop_id:
            self.shop_id = shop_id

    def validate_token(self, action):
        if self.expires_in >= (datetime.now() - timedelta(minutes=5)):
            token = action.fetchone('SELECT refresh_token, refresh_token_expires_in FROM shopee.accounts WHERE id=:id', {'id'})
            if token and self.get_refresh_token(self.shop_id, token['refresh_token'], token['refresh_token_expires_in']):
                return True
        return False


    # Requests
    def get(self, path: str, version: str = 'v1',  json: Optional[Any] = None, **kwargs) -> requests.Response:
        return self.request('get', path, version, **kwargs)

    def post(self, path: str, version: str = 'v1', json: Optional[Any] = None, **kwargs) -> requests.Response:
        return self.request('post', path, version, json=json, **kwargs)

    def request(self, method: str, path: str, version: str = 'v1', json: Optional[Any] = None,  additional_params: Optional[Any] = None, **kwargs) -> requests.Response:
        timestamp = int(time.time())
        headers = None
        params = {
            'partner_id': self.SHOPEE_PARTNER_ID,
            'shopid': self.shop_id,
            'timestamp': timestamp
        }
        
        if additional_params:
            params.update(additional_params)

        if version == 'v2':
            if self.access_token:
                params['access_token'] = self.access_token
            params['sign'] = self.get_signature(timestamp, path)
            params.pop('shopid')
            params['shop_id'] = self.shop_id

        if version == 'v1':
            if json is None:
                json = params
            else:
                json.update(params)
            params = {}
            sign = self.get_signature_v1(path, json)
            headers = {'Authorization': sign, 'Content-Type':'application/json'}

        try:
            return self.session.request(
                method, f'{self.API_URL}{path}', params=params,
                json=json,
                headers=headers,
                timeout=self.TIMEOUT,
                **kwargs,
            )
        except:
            raise ShopeeConnectionException


    # Hashes v2
    def get_auth_signature(self, timestamp):
        base_string = "%s%s%s" % (self.SHOPEE_PARTNER_ID, self.AUTHORIZE_URL, timestamp)
        partner_key_bytes = bytes(self.SHOPEE_PARTNER_KEY , 'utf-8')
        base_string_bytes = base_string.encode('utf-8')
        sign = hmac.new(key=partner_key_bytes, msg=base_string_bytes, digestmod=hashlib.sha256).hexdigest()
        return sign

    def get_authorization_url(self):
        timestamp = int(time.time())
        params = f'partner_id={self.SHOPEE_PARTNER_ID}&timestamp={timestamp}&sign={self.get_auth_signature(timestamp)}&redirect={self.REDIRECT_URL}'
        return f'{self.API_URL}{self.AUTHORIZE_URL}?{params}'

    def get_signature(self, timestamp, path):
        base_string = "%s%s%s%s%s" % (self.SHOPEE_PARTNER_ID, path, timestamp, self.access_token, self.shop_id)
        sign = hmac.new(bytes(self.SHOPEE_PARTNER_KEY , 'utf-8'), base_string.encode('utf-8'), hashlib.sha256).hexdigest()
        return sign

    def get_deauthorization_url(self):
        timestamp = int(time.time())
        params = f'partner_id={self.SHOPEE_PARTNER_ID}&timestamp={timestamp}&sign={self.get_auth_signature(timestamp)}&redirect={self.REMOVE_REDIRECT_URL}'
        return f'{self.API_URL}{self.DEAUTHORIZE_URL}?{params}'

    # Hashes v1
    def get_auth_signature_v1(self, timestamp):
        base_string = self.SHOPEE_PARTNER_KEY + self.REDIRECT_URL
        token = hashlib.sha256(base_string.encode()).hexdigest()
        return token

    def get_authorization_url_v1(self):
        params = f'id={self.SHOPEE_PARTNER_ID}&token={self.get_auth_signature_v1()}&redirect={self.REDIRECT_URL}'
        return f'{self.API_URL}{self.AUTHORIZE_URL}?{params}'

    def get_signature_v1(self, path, body):
        partner_key_bytes = bytes(self.SHOPEE_PARTNER_KEY , 'utf-8')
        base_string = self.API_URL + path + '|' + json_lib.dumps(body)
        base_string_bytes = base_string.encode('utf-8')
        sign = hmac.new(key=partner_key_bytes, msg=base_string_bytes, digestmod=hashlib.sha256).hexdigest()
        return sign


    # Access/Refresh Token
    def get_access_token(self, shop_id, code):
        path = '/api/v2/auth/token/get'
        timestamp = int(time.time())

        base_string = "%s%s%s%s" % (self.SHOPEE_PARTNER_ID, path, timestamp, shop_id)
        sign = hmac.new(bytes(self.SHOPEE_PARTNER_KEY , 'utf-8'), base_string.encode('utf-8'), hashlib.sha256).hexdigest()

        params = f'partner_id={self.SHOPEE_PARTNER_ID}&shop_id={shop_id}&timestamp={timestamp}&sign={sign}'
        body = {'code': code, 'shop_id': shop_id, 'partner_id': self.SHOPEE_PARTNER_ID}
        print(params)
        print(body)
        print(base_string)
        return self.session.request('post', f'{self.API_URL}{path}?{params}', json=body, timeout=self.TIMEOUT)


    def get_refresh_token(self, shop_id, refresh_token, refresh_token_expires_in, action):
        if refresh_token_expires_in < datetime.now():
            query = "UPDATE shopee.accounts SET internal_status=0 WHERE id = :id"
            action.execute(query, {'id': shop_id})

            account = action.fetchone("SELECT id, user_id, name FROM shopee.accounts WHERE id = :id", {'id': shop_id})

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

            return None

        path = '/api/v2/auth/access_token/get'
        timestamp = int(time.time())

        base_string = "%s%s%s" % (self.SHOPEE_PARTNER_ID, path, timestamp)
        sign = hmac.new(bytes(self.SHOPEE_PARTNER_KEY , 'utf-8'), base_string.encode('utf-8'), hashlib.sha256).hexdigest()

        params = f'partner_id={self.SHOPEE_PARTNER_ID}&timestamp={timestamp}&sign={sign}'
        body = {'shop_id': shop_id, 'refresh_token': refresh_token, 'partner_id': self.SHOPEE_PARTNER_ID}
        headers = {'Content-Type':'application/json'}

        response = self.session.request('post', f'{self.API_URL}{path}?{params}', json=body, headers=headers, timeout=self.TIMEOUT)
        data = json_lib.loads(response.content)

        if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0):
            query = "UPDATE shopee.accounts SET internal_status=0 WHERE id = :id"
            action.execute(query, {'id': shop_id})

            account = action.fetchone("SELECT id, user_id, name FROM shopee.accounts WHERE id = :id", {'id': shop_id})

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

            return None

        query = """
            UPDATE shopee.accounts SET
                access_token = :access_token,
                access_token_expires_in = :access_token_expires_in,
                refresh_token = :refresh_token,
                refresh_token_expires_in = :refresh_token_expires_in,
                internal_status = :internal_status
            WHERE id = :id
        """
        now = datetime.now()
        expires_in = (now + timedelta(seconds=int(data['expire_in'])))
        refresh_expires_in = (now + timedelta(seconds=int(data['expire_in'])) + timedelta(days=30))
        values = {
            'id': shop_id,
            'access_token': data['access_token'],
            'access_token_expires_in': expires_in.strftime('%Y-%m-%d %H:%M:%S'),
            'refresh_token': data['refresh_token'],
            'refresh_token_expires_in': refresh_expires_in.strftime('%Y-%m-%d %H:%M:%S'),
            'internal_status': 1
        }
        action.execute(query, values)

        self.expires_in = expires_in
        self.refresh_expires_in = refresh_expires_in
        self.access_token = data['access_token']

        values['access_token_expires_in'] = expires_in
        values['refresh_token_expires_in'] = refresh_expires_in

        return values


    # Webhook
    @classmethod
    def is_webhook_trustful(cls, request):
        base_string = request.url + '|' + json_lib.dumps(request.json)
        base_string_bytes = base_string.encode('utf-8')
        partner_key_bytes = bytes(cls.SHOPEE_PARTNER_KEY , 'utf-8')

        sign = hmac.new(key=partner_key_bytes, msg=base_string_bytes, digestmod=hashlib.sha256).hexdigest()
        if sign != request.headers.get('Authorization',''):
            return False
        else:
            return True
