from json import dumps
from typing import Any, Optional

from urllib3.util import Retry

from requests.adapters import HTTPAdapter
import requests


class MercadoLibreApi:
    """HTTP requests for MercadoLibre API."""

    API_URL: str = 'https://api.mercadolibre.com'
    TIMEOUT: int = 25

    def __init__(self, access_token: Optional[str] = None, forcelist=[500, 510], retries_total=3, backoff_factor=0.5, custom_adapter=False) -> None:
        self.access_token = access_token

        self.session = requests.Session()
        retries = Retry(
            total=retries_total,
            read=retries_total,
            connect=retries_total,
            backoff_factor=backoff_factor,
            status_forcelist=forcelist,
        )

        if custom_adapter:
            adapter = HTTPAdapter(max_retries=retries,
                                  pool_connections=600, pool_maxsize=1000)
        else:
            adapter = HTTPAdapter(max_retries=retries)

        self.session.mount(self.API_URL, adapter)
        self.session.headers.update({'Accept': 'application/json'})

        if access_token is not None:
            self.session.headers.update(
                {'Authorization': f'Bearer {access_token}'})

    def get(self, path: str, headers: Optional[Any] = None, **kwargs) -> requests.Response:
        return self.request('get', path, headers=headers, **kwargs)

    def post(self, path: str, json: Optional[Any] = None, headers: Optional[Any] = None, **kwargs) -> requests.Response:
        return self.request('post', path, json=json, headers=headers, **kwargs)

    def put(self, path: str, json: Optional[Any] = None, **kwargs) -> requests.Response:
        req = self.request('put', path, json=json, **kwargs)
        if req.status_code != 200:
            print(req)
            print(req.text)
            print(path)
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
                headers: Optional[Any] = None,
                **kwargs) -> requests.Response:
        """
        Returns a request for endpoint `path` on MercadoLibre API.
        """
        if params is None:
            params = {}

        # if self.access_token is not None:
        #     params.update({'access_token': self.access_token})

        if headers:
            headers.update(self.session.headers)
        else:
            headers = self.session.headers

        return self.session.request(
            method, f'{self.API_URL}{path}', params=params,
            json=json,
            headers=headers,
            timeout=self.TIMEOUT,
            **kwargs,
        )
