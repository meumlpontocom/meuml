from typing import Any, Optional

from urllib3.util import Retry

from requests.adapters import HTTPAdapter
import requests


class MercadoPagoApi:
    """HTTP requests for MercadoLibre API."""

    API_URL: str = 'https://api.mercadopago.com'
    TIMEOUT: int = 15

    def __init__(self, access_token: Optional[str] = None) -> None:
        self.access_token = access_token

        retries = Retry(total=10, backoff_factor=3, status_forcelist=[500, 510])

        self.session = requests.Session()
        self.session.mount(self.API_URL, HTTPAdapter(max_retries=retries))
        self.session.headers.update({'Accept': 'application/json'})

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

        if self.access_token is not None:
            params.update({'access_token': self.access_token})

        return self.session.request(
            method, f'{self.API_URL}{path}', params=params,
            json=json,
            timeout=self.TIMEOUT,
            **kwargs,
        )
