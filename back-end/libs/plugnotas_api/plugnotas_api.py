import requests
from os import getenv
from requests.adapters import HTTPAdapter
from typing import Any, Optional
from urllib3.util import Retry


class PlugNotasApi:
    """HTTP requests for MercadoLibre API."""

    TIMEOUT: int = 15
    API_URL: str = getenv('PLUGNOTAS_API_URL')
    API_CNPJ: str = getenv('PLUGNOTAS_API_CNPJ')
    API_SERVICE = {
        "codigo": "01.01",
        "codigoTributacao": "01.01",
        "cnae": "6203100",
        "iss": {
            "tipoTributacao": 6,
            "exigibilidade": 1,
            "aliquota": 2.01
        },
        "valor": {
            "descontoCondicionado": 0,
            "descontoIncondicionado": 0
        }
    }
    API_PROVIDER = {
        "cpfCnpj": "20317052000101",
        "razaoSocial": "BITFLIX DESENVOLVIMENTO DE SISTEMAS LTDA",
        "inscricaoMunicipal": "010106946190",
        "endereco": {
            "tipoLogradouro": "Rua",
            "logradouro": "Francisco Maravalhas",
            "numero": "251",
            "bairro": "Jardim das Américas",
            "codigoCidade": "4106902",
            "descricaoCidade": "Curitiba",
            "estado": "PR",
            "cep": "82590300",
        } ,
        "telefone": {
            "ddd": "41",
            "numero": "30818180",
        },
        "email": "miltonbastos@gmail.com",
    }

    def __init__(self, forcelist=[510]) -> None:
        retries = Retry(total=3, backoff_factor=1, status_forcelist=forcelist)

        self.session = requests.Session()
        self.session.mount(self.API_URL, HTTPAdapter(max_retries=retries))
        self.session.headers.update({'Accept': 'application/json'})
        self.session.headers.update({'x-api-key': getenv('PLUGNOTAS_API_KEY')})

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
        )
