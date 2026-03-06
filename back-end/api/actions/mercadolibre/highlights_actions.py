import json
from workers.tasks.mercadolibre.advertising_import_item import FailedRequest, fetch_advertising
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from flask import request
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare


class HighlightsActions(Actions):

    @jwt_required
    @prepare
    def highlights(self):
        query = 'SELECT * FROM meuml.accounts WHERE user_id = :user_id'
        accounts = self.fetchall(query, {'user_id': self.user['id']})

        if len(accounts) == 0:
            self.abort_json({
                'message': 'Nenhuma conta do Mercado Livre encontrada.',
                'status': 'error',
            }, 400)

        for account in accounts:
            access_token = self.refresh_token(account=account)
            if access_token:
                access_token = access_token['access_token']
                break

        if not access_token:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 403)

        ml_api = MercadoLibreApi(access_token=access_token)

        if 'category_id' not in request.args:
            self.abort_json({
                'message': "É necessário informar o atributo 'category_id'",
                'status': 'error',
            }, 400)

        if 'brand_id' not in request.args:
            error, status_code, brands = getCategoryBrands(
                ml_api, request.args.get('category_id'))

            if error:
                self.abort_json({
                    'message': 'Erro ao tentar recuperar detalhes da categoria',
                    'status': 'error',
                }, status_code)

        if 'category_id' in request.args and 'brand_id' not in request.args:
            response = ml_api.get(
                f"/highlights/MLB/category/{request.args.get('category_id')}")

        if 'category_id' in request.args and 'brand_id' in request.args:
            response = ml_api.get(
                f"/highlights/MLB/category/{request.args.get('category_id')}?attribute=BRAND&attributeValue={request.args.get('brand_id')}")

        response_data = response.json()

        if response.status_code != 200:
            self.abort_json({
                'message': response_data.get('message', 'Erro ao tentar recuperar os items mais vendidos'),
                'status': 'error',
            }, response.status_code)

        items = getItems(ml_api, response_data['content'])

        return self.return_success(
            message="Mais vendidos",
            data={"items": items, "brands": brands if "brands" in locals()
                  else []}
        )


def getItems(ml_api: MercadoLibreApi, items):
    highlights = []

    for item in items:
        if item['type'] == 'ITEM':
            response_data, response = fetch_advertising(
                ml_api, item['id'], all_attributes=False)

            if response.status_code == 200:
                highlights.append({
                    "position": item['position'],
                    "title": response_data['title'],
                    "price": response_data['price'],
                    "shipping": response_data['shipping'],
                    "thumbnail": response_data['thumbnail'],
                    "permalink": response_data['permalink'],
                    "original_price": response_data['original_price'],
                    "differential_pricing": response_data['differential_pricing'],
                })

        elif item['type'] == 'PRODUCT':
            # Verificar se vai ser necessário retornar infos quando for produto
            pass

    return highlights


def getCategoryBrands(ml_api: MercadoLibreApi, category_id: int):
    brands = []

    response = ml_api.get(
        f"/categories/{category_id}/attributes")

    if response.status_code == 200:
        response_data = response.json()
        brands = [x['values']
                  for x in response_data if x['id'] == 'BRAND' and 'values' in x]

    return response.status_code != 200, response.status_code, brands
