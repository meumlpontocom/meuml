
from flask.json import jsonify
import requests
from json import dumps
from libs.exceptions.exceptions import WaApiConnectionException
from libs.payments.payment_helper import verify_tool_access
from os import getenv
from requests.adapters import HTTPAdapter
from typing import Any, List, Optional
from urllib3.util import Retry

from celery.utils.log import get_task_logger
LOGGER = get_task_logger(__name__)


class WhatsappApi:
    """HTTP requests for WhatsApp Business API."""

    API_URL: str = getenv('WHATSAPP_API_URL')
    ACCESS_TOKEN: str = getenv('WHATSAPP_API_ACCESS_TOKEN')
    PHONE_NUMBER_ID: str = getenv('WHATSAPP_API_PHONE_NUMBER_ID')
    TIMEOUT: int = 15

    # Requests
    @staticmethod
    def get(path: str, additional_params: Optional[Any] = None, **kwargs) -> requests.Response:
        return WhatsappApi.request('get', path, additional_params, **kwargs)

    @staticmethod
    def post(path: str, json: Optional[Any] = None, additional_params: Optional[Any] = None, **kwargs) -> requests.Response:
        return WhatsappApi.request('post', path, json=json, additional_params=additional_params, **kwargs)

    @staticmethod
    def request(method: str, path: str, json: Optional[Any] = None, additional_params: Optional[Any] = None, headers: Optional[Any] = None, **kwargs) -> requests.Response:

        retries = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=[500, 510]
        )
        session = requests.Session()
        session.mount(WhatsappApi.API_URL, HTTPAdapter(max_retries=retries))
        session.headers.update({'Accept': 'application/json'})
        session.headers.update(
            {'Authorization': f'Bearer {WhatsappApi.ACCESS_TOKEN}'}
        )

        try:
            return session.request(
                method, f'{WhatsappApi.API_URL}/v13.0/{WhatsappApi.PHONE_NUMBER_ID}/{path}',
                json=json,
                headers=headers,
                timeout=WhatsappApi.TIMEOUT,
                **kwargs,
            )
        except:
            raise WaApiConnectionException

    @staticmethod
    def send_text_message_to_phone(country_code, area_code, phone_number, template, params: Any) -> requests.Response:

        full_phone_number = f"{country_code}{area_code}{phone_number}"

        def build_parameters(p, use_names=True):
            parameters = []
            if isinstance(p, dict):
                for key, value in p.items():
                    param = {'type': 'text', 'text': str(value)}
                    if use_names:
                        param['parameter_name'] = key
                    parameters.append(param)
            elif isinstance(p, (tuple, list)):
                for item in p:
                    parameters.append({'type': 'text', 'text': str(item)})
            else:
                parameters.append({'type': 'text', 'text': str(p)})
            return parameters

        components = []
        
        # Route parameters to their components
        components_map = {
            'header': None,
            'body': {},
            'button': None,
            'footer': None
        }

        if isinstance(params, dict):
            # Special keys route to specific components
            if '_header' in params:
                components_map['header'] = params['_header']
            if '_button' in params:
                components_map['button'] = params['_button']
            if '_footer' in params:
                components_map['footer'] = params['_footer']
            
            # Identify body parameters: 
            # if '_body' is present, use it exclusively as body source
            # otherwise, all non-special keys are considered named body params
            if '_body' in params:
                components_map['body'] = params['_body']
            else:
                body_dict = {k: v for k, v in params.items() if k not in ['_header', '_body', '_button', '_footer']}
                if body_dict:
                    components_map['body'] = body_dict
        else:
            # Positional fallback for the whole thing (Legacy)
            components_map['body'] = params

        # Build final components array for Meta API
        for component_type, content in components_map.items():
            if content is None or (isinstance(content, dict) and not content) or (isinstance(content, (list, tuple)) and not content):
                continue
            
            # CRITICAL: Always check if the content itself is a dict to determine if we use names
            use_names = isinstance(content, dict)
            
            comp_payload = {
                'type': component_type,
                'parameters': build_parameters(content, use_names=use_names)
            }
            
            if component_type == 'button':
                comp_payload['sub_type'] = 'url'
                comp_payload['index'] = '0'
                # Buttons usually don't support parameter_name for dynamic URLs on Meta
                # but we'll follow build_parameters logic for consistency if someone passes a dict
                comp_payload['parameters'] = build_parameters(content, use_names=False)

            components.append(comp_payload)

        return WhatsappApi.post(
            path='messages',
            json={
                'messaging_product': 'whatsapp',
                'to': full_phone_number,
                'type': 'template',
                'template': {
                    'name': template,
                    'language': {
                        'code': 'pt_BR'
                    },
                    'components': components
                }
            }
        )

    @staticmethod
    def send_text_message_to_user(action, user_id, account_id, platform, topic, template, **params) -> None:
        query = """
            SELECT ph.id, ph.country_code, ph.area_code, ph.phone_number, ph.topics
            FROM meuml.phones ph
            WHERE ph.user_id = :user_id AND ph.is_confirmed IS TRUE
        """
        phones = action.fetchall(query, {'user_id': user_id})
        phones = [phone for phone in phones if topic in phone['topics']]

        tool = action.get_tool(topic)
        code, *_ = verify_tool_access(action, user_id, [account_id], tool)

        if code != 200:
            return False

        if phones:
            query = f"""
                INSERT INTO meuml.processes (user_id, account_id, tool_id, tool_price, items_total, platform)
                VALUES ({user_id}, {account_id}, {tool['id']}, {tool['price']}, {len(phones) if phones is not None else 0}, '{platform}')
                RETURNING id
            """
            process_id = action.execute_insert(query)

            query = """
                INSERT INTO meuml.process_items (account_id, tool_id, process_id, item_external_id, status, message, http_status, http_body)
                VALUES (:account_id, :tool_id, :process_id, :item_external_id, :status, :message, :http_status, :http_body);
            """
            values = {
                'account_id': account_id,
                'tool_id': tool['id'],
                'process_id': process_id,
            }

            for phone in phones:
                try:
                    response = WhatsappApi.send_text_message_to_phone(
                        phone['country_code'],
                        phone['area_code'],
                        phone['phone_number'],
                        template,
                        params
                    )

                    response_data = response.json()

                    full_user_number = f"{phone['area_code']}{phone['country_code']}{phone['phone_number']}"

                    if response.status_code == 200:
                        values['item_external_id'] = phone['id']
                        values['status'] = 1
                        values['message'] = f"Notificação enviada para {phone['phone_number']} com sucesso"
                        values['http_status'] = 200
                        values['http_body'] = dumps(response_data)
                        action.execute(query, values)
                    else:
                        LOGGER.error(
                            f"Failed to send message about {topic} to user_id {user_id} at {full_user_number}. Template: {template}")

                        values['item_external_id'] = phone['id']
                        values['status'] = 0
                        values['message'] = f"Erro ao enviar notificação para {phone['phone_number']}"
                        values['http_status'] = response.status_code
                        values['http_body'] = dumps(response_data)
                        action.execute(query, values)
                except WaApiConnectionException:
                    values['item_external_id'] = phone['id']
                    values['status'] = 0
                    values['message'] = f"Erro ao enviar notificação para {phone['phone_number']} (timeout ao conectar-se com serviço de envio de mensagens)"
                    values['http_status'] = 502
                    values['http_body'] = None
                    action.execute(query, values)

            action.execute(
                f"UPDATE meuml.processes SET date_finished = NOW() WHERE id = {process_id}")
