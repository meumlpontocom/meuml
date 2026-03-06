import requests
import os
from requests.adapters import HTTPAdapter
from typing import Any, Optional
from urllib3.util import Retry

class PJBankApi:
    """
        HTTP requests for PJBank API.

        Retornos em JSON codificados com Unicode
        Datas em formato MM/DD/AAAA
        Números com “.” como separadores decimais, sem separadores milhares e com o sinal “-” representando valores negativos
    """

    API_URL: str = os.getenv('PJBANK_URL')
    TIMEOUT: int = 30
    API_CREDENTIALS: str = os.getenv('PJBANK_CREDENTIALS')
    API_BOLETO_CREDENTIALS: str = os.getenv('PJBANK_BOLETO_CREDENTIALS')
    API_KEY: str = os.getenv('PJBANK_KEY')
    API_BOLETO_KEY: str = os.getenv('PJBANK_BOLETO_KEY')


    def __init__(self) -> None:
        self.credentials = self.API_CREDENTIALS
        self.key = self.API_KEY

        self.boleto_credentials = self.API_BOLETO_CREDENTIALS
        self.boleto_key = self.API_BOLETO_KEY

        retries = Retry(total=10, backoff_factor=3, status_forcelist=[500, 510])

        self.session = requests.Session()
        self.session.mount(self.API_URL, HTTPAdapter(max_retries=retries))
        #self.session.headers.update({'Accept': 'application/json'})


    def get(self, path: str, **kwargs) -> requests.Response:
        return self.request('get', path, **kwargs)


    def post(self, path: str, json: Optional[Any] = None, data: Optional[Any] = None, **kwargs) -> requests.Response:
        return self.request('post', path, json=json, data=data, **kwargs)


    def put(self, path: str, json: Optional[Any] = None, data: Optional[Any] = None, **kwargs) -> requests.Response:
        return self.request('put', path, json=json, data=data, **kwargs)


    def delete(self, path: str, **kwargs) -> requests.Response:
        return self.request('delete', path, **kwargs)


    def options(self, path: str, **kwargs) -> requests.Response:
        return self.request('options', path, **kwargs)


    def head(self, path: str, **kwargs) -> requests.Response:
        return self.request('head', path, **kwargs)


    def request(self, method: str, path: str,
                data: Optional[Any] = None,
                json: Optional[Any] = None,
                params: Optional[Any] = None,
                headers: Optional[Any] = None,
                **kwargs) -> requests.Response:
        """
        Returns a request for endpoint `path` on PJBank API.
        """
        if params is None:
            params = {}

        if headers is None:
            headers = {'X-CHAVE': self.key}

            if data is not None:
                headers['Content-Type']= 'application/x-www-form-urlencoded'
            else:
                headers['Content-Type']= 'application/json'

        return self.session.request(
            method, f'{self.API_URL}{path}', 
            params=params,
            json=json,
            data=data,
            headers=headers,
            timeout=self.TIMEOUT,
            **kwargs,
        )
