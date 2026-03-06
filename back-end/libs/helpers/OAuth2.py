import os
import json
import urllib
import requests
from libs.exceptions.exceptions import OAuth2Exception


class OAuth2(object):

    token = ''

    refresh_token = ''

    uri = ''

    params = {}

    def __init__(self):

        self.uri = "https://api.mercadolibre.com/oauth/token?"

        self.params = {
            "grant_type": "authorization_code",
            "client_id": os.getenv('CLIENT_ID'),
            "client_secret": os.getenv('CLIENT_SECRET'),
            "redirect_uri": os.getenv('CALLBACK_URL'),
            "code": ''
        }

    def generate_token(self, code: str = ''):
        if code == '':
            return self.refresh_token
        else:
            self.set_code(code)

            try:
                response = requests.post(self.uri + urllib.parse.urlencode(self.params))
                if response.status_code == 400 and response.json().get('error', '') in ['invalid_operator_user_id', 'invalid_grant']:
                    raise OAuth2Exception('Contas de Colaborador não podem ser utilizadas na platorma')
                if response.status_code == 400:
                    raise OAuth2Exception(
                        'Houve um erro ou requerir a chave de autenticação: ' + json.dumps(response.json()))
                elif response.status_code != 400 and response.status_code != 200:
                    raise OAuth2Exception('Houve um erro inesperado ao requerir a chave de autenticação.')
            except:
                raise

            try:
                self.token_response = response.json()

                self.token = self.token_response['access_token']
                self.refresh_token = self.token_response['refresh_token']
                self.expires_in = self.token_response['expires_in']
                return self.token_response['access_token']
            except:
                raise OAuth2Exception('Houve um erro finalizar a chave de autenticação.')

    def get_refresh_token(self, code : str = None):
        if code is None:
            return self.refresh_token
        else:
            self.set_code(code)

            self.token_response = self.curl_get_token()
            self.token = self.token_response['access_token']
            self.refresh_token = self.token_response['refresh_token']
            self.expires_in = self.token_response['expires_in']
            return self.token_response['access_token']


    def curl_get_token(self):


        url = 'https://api.mercadolibre.com/oauth/token?grant_type=refresh_token'
        url += '&client_id=' + self.params['client_id']
        url += '&client_secret=' + os.getenv('CLIENT_SECRET')
        url += '&refresh_token=' + self.code

        response = requests.post(url)

        if response.status_code == 400:
            raise Exception('Houve um erro ou requerir a chave de autenticação: ' + json.dumps(response.json()) )
        elif response.status_code != 400 and response.status_code != 200:
            raise Exception('Houve um erro inesperado ao requerir a chave de autenticação.')

        return response.json()

    def get_auth_token(self):
        return self.token

    def get_expires_in(self):
        return self.expires_in

    def set_code(self,code : str = ''):
        self.code = code

        if self.code == '':
            raise OAuth2Exception('Informe um valor de código para renovar o token.')

        self.params['code'] = self.code
