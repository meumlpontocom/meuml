import requests
from os import getenv
from requests.adapters import HTTPAdapter
from typing import Any, Optional
from urllib3.util import Retry


class FocusnfeApi:
    """HTTP requests for MercadoLibre API."""

    TIMEOUT: int = 15
    API_URL: str = getenv('FOCUSNFE_API_URL')
    API_SERVICE = {
        "iss_retido": "false",
        "item_lista_servico": "10501",
        "codigo_tributario_municipio": "01.05",
        "codigo_cnae": "6203100",
        "aliquota": 3,
        "desconto_condicionado": 0,
        "desconto_incondicionado": 0
    }
    API_PROVIDER = {
        "cnpj": "20317052000101",
        "inscricao_municipal": "32227",
        "codigo_municipio": "4104204",
    }

    def __init__(self, forcelist=[510]) -> None:
        retries = Retry(total=3, backoff_factor=1, status_forcelist=forcelist)

        self.session = requests.Session()
        self.session.mount(self.API_URL, HTTPAdapter(max_retries=retries))
        self.session.headers.update({'Accept': 'application/json'})
        # self.session.headers.update({'token': getenv('FOCUSNFE_TOKEN')})

    def get(self, path: str, **kwargs) -> requests.Response:
        return self.request('get', path, **kwargs)

    def post(self, path: str, json: Optional[Any] = None, **kwargs) -> requests.Response:
        return self.request('post', path, json=json, **kwargs)

    def put(self, path: str, json: Optional[Any] = None, **kwargs) -> requests.Response:
        req = self.request('put', path, json=json, **kwargs)
        if req.status_code != 200:
            print (req)
            print (req.text)
            print (path)
        return self.request('put', path, json=json, **kwargs)

    def delete(self, path: str, **kwargs) -> requests.Response:
        return self.request('delete', path, **kwargs)

    def options(self, path: str, **kwargs) -> requests.Response:
        return self.request('options', path, **kwargs)

    def head(self, path: str, **kwargs) -> requests.Response:
        return self.request('head', path, **kwargs)

    def request(self, method: str, path: str,
                json: Optional[Any] = None,
                params: Optional[Any] = None,
                **kwargs) -> requests.Response:
        """
        Returns a request for endpoint `path` on MercadoLibre API.
        """
        if params is None:
            params = {}

        return self.session.request(
            method, f'{self.API_URL}{path}', params=params,
            json=json,
            timeout=self.TIMEOUT,
            **kwargs,
            auth=(getenv('FOCUSNFE_TOKEN'), '')
        )
