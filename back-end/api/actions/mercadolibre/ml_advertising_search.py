import logging
from flask import request, jsonify
from flask_jwt_simple import jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLAdvertisingSearch(Actions):
    @jwt_required
    @prepare
    def test_search_ml_ad_by_code(self):
        try:
            advertising_id =  request.args.get('advertising_id')

            user_id = self.user["id"]

            query = """
                    SELECT id, access_token, access_token_expires_at, refresh_token, external_data
                    FROM meuml.accounts 
                    WHERE user_id=:id
                    AND status = 1
                    ORDER BY access_token_expires_at DESC
                """
                
            accounts = self.fetchall(query, {"id": user_id})

            most_recent_token = accounts[0]['access_token']

            ml_api = MercadoLibreApi(access_token=most_recent_token)
            response = ml_api.get('/items', params={'ids': advertising_id})
            response_json = response.json()

            if response_json[0]['code'] == 404:
                return jsonify({
                    'message': f'Anúncio não encontrado',
                    'status': 'error',
                }), 404
            
            if response_json[0]['code'] != 200:
                return jsonify({
                    'message': 'Erro buscando anúncio',
                }), 502

            return self.return_success(data=response_json[0]['body'])

        except Exception as exc:
            return jsonify({
                "message": "Erro ao buscar anuncio.",
                "status": "error",
            }), 500