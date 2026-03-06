import json
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.translations.mercadolibre_images import MLImagesPTBR
from marshmallow import ValidationError
from workers.helpers import get_tool


class ImagesActions(Actions):
    @jwt_required
    @prepare
    def get_quality_meli_images(self):
        advertising_id = request.args.get('advertising_id')
        account_id = request.args.get('account_id')

        query = 'SELECT id, access_token_expires_at, access_token, refresh_token FROM meuml.accounts WHERE id = :account_id'
        account = self.fetchone(query, {'account_id': account_id})

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']
        
        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.get(f'/quality/pictures/{advertising_id}')
        response_data = response.json()
        status_code = response.status_code

        if status_code not in [200, 404]:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error',
                'errors': response_data
            }, 502)

        if status_code == 404:
            response_data = {
                'itemId': advertising_id,
                'tagged': False
            }
        else:
            response_data['tagged'] = True

        return self.return_success(data=response_data)


    @jwt_required
    @prepare
    def get_quality_meli_image(self):
        advertising_id = request.args.get('advertising_id')
        picture_id = request.args.get('picture_id')

        query = """
            SELECT ac.id, ac.access_token_expires_at, ac.access_token, ac.refresh_token 
            FROM meuml.accounts ac 
            JOIN meuml.advertisings ad ON ad.account_id = ac.id 
            WHERE ad.external_id = :id
        """
        account = self.fetchone(query, {'id': advertising_id})

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']
        
        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.get(f'/pictures/{picture_id}/errors')
        response_data = response.json()
        status_code = response.status_code

        if status_code not in [200, 404]:
            self.abort_json({
                'message': f"Erro de comunicação com o Mercado Livre.",
                'status': 'error',
                'errors': response_data
            }, 502)

        if status_code == 404:
            response_data = {
                "id": picture_id,
                "source": None,
                "error": None,
                "tagged": False
            }
        else:
            response_data['tagged'] = True

        return self.return_success(data=response_data)


    @jwt_required
    @prepare
    def upload_meli_image(self):
        title = request.form.get('title','')
        
        if len(title) == 0:
            self.abort_json({
                'message': f"Forneça o título da imagem.",
                'status': 'error',
            }, 400)

        image = request.files.get('image')
        content_type = image.headers.get('Content-Type','')

        if content_type not in ['image/jpeg', 'image/jpg', 'image/png']:
            self.abort_json({
                'message': f"O arquivo de imagem deve estar no formato jpeg, jpg ou png.",
                'status': 'error',
            }, 400)

        imagefile = {"file": (image.filename, image.read(), content_type)}

        query = 'SELECT id, access_token_expires_at, access_token, refresh_token FROM meuml.accounts WHERE id = :account_id'
        account = self.fetchone(query, {'account_id': request.form['account_id']})

        if account is None:
            self.abort_json({
                'message': f"Conta do Mercado Livre não encontrada.",
                'status': 'error',
            }, 400)

        access_token = self.refresh_token(account=account)
        if access_token == False:
            self.abort_json({
                'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                'status': 'error',
            }, 400)
        else:
            access_token = access_token['access_token']
        
        ml_api = MercadoLibreApi(access_token=access_token)
        response = ml_api.post('/pictures/items/upload', files=imagefile)
        response_data = response.json()
        

        if response.status_code == 400:
            message = response_data['message']
            messages = message.split('. ')
            error_message = []
            for message in messages:
                if "tiene un tamaño de" in message:
                    splits = message.split('de ')
                    for split in splits:
                        translated_message = MLImagesPTBR.translate(split)
                        error_message.append(translated_message)
                else:
                    translated_message = MLImagesPTBR.translate(message)
                    error_message.append(translated_message)
                    error_message.append(". ")
            error_message.append(".")
            listToStr = ''.join([str(elem) for elem in error_message])
            self.abort_json({
                'message': listToStr,
                'status': 'error',
                'errors': response_data,
            }, 400)
        elif response.status_code == 429:
            self.abort_json({
                'message': f'O servidor está ocupado no momento, por favor tente novamente em 5 minutos.',
                'status': 'error',
                'errors': response_data,
            }, 429)
        elif response.status_code in [200,201]:
            secure_thumbnail = None
            for variation in response_data.get('variations', []):
                if variation.get('size','') == response_data.get('max_size'):
                    secure_thumbnail = variation['secure_url']
                    break

            query = """
                INSERT INTO meuml.images (id, account_id, title, image_url) 
                VALUES (:id, :account_id, :title, :secure_thumbnail)
            """
            values = {
                'id': response_data['id'],
                'account_id': request.form['account_id'],
                'title': title,
                'secure_thumbnail': secure_thumbnail
            }
            self.execute(query, values)

            return self.return_success('Imagem carregada com sucesso', {'id': response_data['id']})
        else:
            self.abort_json({
                'message': f'Algo deu errado durante o carregamento da imagem enviada.',
                'status': 'error',
                'errors': response_data
            }, 500)


    @jwt_required
    @prepare
    def adveritising_images(self):
        advertising_id = request.args.get('advertising_id')

        query = """
            SELECT 
                item_id as id,
                external_data ->> 'title' as title,
                external_data ->> 'permalink' as permalink,
                external_data ->> 'category_id' as category_id,
                external_data ->> 'price' as price,
                external_data ->> 'status' as status,
                CAST(external_data ->> 'available_quantity' as integer) as available_quantity,
                CAST(external_data ->> 'sold_quantity' as integer) as sold_quantity,
                external_data ->> 'listing_type_id' as listing_type_id,
                CAST(external_data ->  'shipping' ->> 'free_shipping' as boolean)::int as free_shipping,
                external_data ->  'shipping' ->> 'mode' as shipping_mode,
                external_data -> 'pictures' as pictures, 
                external_data -> 'variations' as variations
            FROM meli_stage.items it
            WHERE it.item_id = :id
        """
        advertising = self.fetchone(query, {'id': advertising_id})

        if advertising is None:
            self.abort_json({
                'message': f'Anúncio não encontrado.',
                'status': 'error'
            }, 500)

        pictures = {}
        for picture in advertising['pictures']:
            pictures[picture['id']] = picture['secure_url']
        
        variations = []
        for variation in advertising['variations']:
            variation_pictures = []
            for variation_picture in variation.get('picture_ids', []):
                variation_pictures.append({
                    'id': variation_picture,
                    'secure_url': pictures.get(variation_picture)
                })
        
            variations.append({
                'id': variation['id'],
                'pictures': variation_pictures
            })
        advertising['variations'] = variations
        
        return self.return_success(data=advertising)
