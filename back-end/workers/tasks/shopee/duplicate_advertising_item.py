import copy
import json
import re
import traceback
from PIL import ImageFile
from celery.utils.log import get_task_logger
from decimal import *
from datetime import datetime
import time
from os import getenv
import requests
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.enums.access_type import AccessType
from libs.exceptions.exceptions import ShopeeConnectionException
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.shopee_api.shopee_api import ShopeeApi
from workers.helpers import get_account, refresh_token
from workers.loggers import create_process_item, update_process_item
from workers.payment_helpers import use_credits, rollback_credits_transaction
from workers.tasks.shopee.import_item import shopee_import_item
from babel.dates import format_date

LOGGER = get_task_logger(__name__)


def shopee_advertising_duplicate_item(tool: dict, processes: dict, accounts: dict, advertising: dict, mass_override: dict, account_advertisings: dict,
                                      allow_duplicated_title: bool, allow_duplicated_account: bool, owner_account_id: int = None, owner_access_token: str = None):
    try:
        action = QueueActions()
        action.conn = get_conn()
        success = True

        data_extenso = format_date(datetime.now(), "dd 'de' MMMM 'de' yyyy", locale='pt_BR')

        # Se própria conta, utiliza token de acesso
        if owner_access_token:
            sp_api = ShopeeApi(shop_id=owner_account_id,
                               access_token=owner_access_token)
        else:
            sp_api = ShopeeApi()

        # Recupera anúncio original
        response = sp_api.get(
            path='/api/v2/product/get_item_base_info',
            version='v2',
            additional_params={
                'item_id_list': int(advertising['id']),
                'need_tax_info': True
            }
        )

        result = response.json()

        if response.status_code != 200 or (result.get('error') and len(result.get('error')) > 0):
            success = False
            result_error = {
                'error': result.get('error'),
                'message': result.get('message'),
                'warning': result.get('warning'),
                'request_id': result.get('request_id'),
            }

            for account_id, account in accounts.items():
                process_item_id = create_process_item(
                    processes[str(account['id'])], account['id'], advertising['id'], action
                )
                update_process_item(
                    process_item_id, None, False, action,
                    f'Replicação de Anúncio #{advertising["id"]} - Não foi possível ler os dados do anúncio na Shopee. {result_error}'
                )
            return
        else:
            result = result['response']['item_list'][0]

            # Cria JSON base do novo anúncio (campos obrigatórios)
            new_advertising = {
                'category_id': result['category_id'],
                'item_name': result['item_name'],
                'image': {'image_id_list': result['image']['image_id_list']},
                'weight': float(result['weight']),
                'description_type': result['description_type'],
            }

        ad_has_gtin = result.get("gtin_code", None)
        variations_have_gtin = result.get("gtin_code", None)

        # Recupera 2-tier variations
        if success and not result['has_model']:
            new_advertising['original_price'] = result['price_info'][0]['original_price']
            new_advertising['seller_stock'] = [
                {
                    'stock': result['stock_info_v2']['summary_info']['total_available_stock']
                }
            ]

        # Verifica se não for pre_order, altera para novo valor padrão shopee 2 dias
        result_pre_order = result.get('pre_order', {})
        is_pre_order = result_pre_order.get('is_pre_order', None)

        # if not result['pre_order']['is_pre_order']:
        if not is_pre_order:
            # result['pre_order']['days_to_ship'] = 2
            # new_advertising['pre_order'] = result['pre_order']
            result_pre_order['days_to_ship'] = 2
            new_advertising['pre_order'] = result_pre_order


        variation_result = {}
        if success and result['has_model']:
            response = sp_api.get(
                path='/api/v2/product/get_model_list',
                version='v2',
                additional_params={'item_id': int(advertising['id'])}
            )

            variation_result = response.json()

            if response.status_code != 200 or (variation_result.get('error') and len(variation_result.get('error')) > 0):
                success = False
                result_error = {
                    'error': result.get('error'),
                    'message': result.get('message'),
                    'warning': result.get('warning'),
                    'request_id': result.get('request_id'),
                }
            else:
                variation_result = variation_result['response']

                for variation in variation_result['tier_variation']:
                    for option in variation['option_list']:
                        if option.get('image'):
                            option['image'].pop('image_url')

                original_price = []
                seller_stock = []

                for model in variation_result['model']:
                    model['seller_stock'] = [
                        {
                            'stock': model['stock_info_v2']['summary_info'].get('total_available_stock')
                        }
                    ]
                    model['original_price'] = model['price_info'][0].get('original_price')
                    if model['stock_info_v2'].get('seller_stock'):
                        model['seller_stock'] = model['stock_info_v2'].get('seller_stock')

                    if model['stock_info_v2'].get('gtin_code'):
                        model['gtin_code'] = model['stock_info_v2'].get('gtin_code')

                    original_price.append(model['price_info'][0]['original_price'])
                    seller_stock.append(model['stock_info_v2']['summary_info']['total_available_stock'])

                    model['weight'] = float(model['weight'])

                    variations_have_gtin = model.get('gtin_code', None)

                    model.pop('price_info')
                    model.pop('model_id')
                    model.pop('promotion_id')
                    model.pop('pre_order')
                    model.pop('stock_info_v2')

            new_advertising['original_price'] = max(original_price)
            new_advertising['seller_stock'] = [
                {
                    'stock': sum(seller_stock)
                }
            ]

        if variations_have_gtin:
            new_advertising['gtin_code'] = variations_have_gtin
        elif not ad_has_gtin:
            new_advertising['gtin_code'] = "00"
        else:
            new_advertising['gtin_code'] = ad_has_gtin

        # Se anúncio ou descrição falhou, interrompe replicação
        if not success:
            for account_id, account in accounts.items():
                process_item_id = create_process_item(
                    processes[str(account['id'])], account['id'], advertising['id'], action
                )
                update_process_item(
                    process_item_id, None, False, action,
                    f'Replicação de Anúncio #{advertising["id"]} - Operação cancelada (erro ao recuperar anúncio a ser duplicado). {result_error}'
                )
            return
        

        # Adicionar data e horário ao final da descrição
        if result['description_type'] == 'normal':
            result['description'] += f"\n\n{data_extenso}"
            new_advertising['description'] = result['description']
        else:
            for field_list in result['description_info']['extended_description']['field_list']:
                if field_list['field_type'] == 'text':
                    field_list['text'] += f"\n\n{data_extenso}"

            new_advertising['description_info'] = result['description_info']

        # Verifica informações opcionais
        if result.get('item_sku') is not None and len(result['item_sku']) > 0:
            new_advertising['item_sku'] = result['item_sku']

        if result.get('brand') is not None:
            new_advertising['brand'] = {
                'brand_id': result['brand']['brand_id']
            }

        # formatted_attributes = []
        # for attribute in result['attribute_list']:
        #     if attribute.get('attribute_type') == 'DATE_TYPE':
        #         attribute['attribute_value'] = str(round(datetime.timestamp(datetime.strptime(attribute['attribute_value'], '%d/%m/%Y'))))
        #     formatted_attributes.append(attribute)

        if result.get('attribute_list') is not None and len(result['attribute_list']) > 0:
            attributes = [
                {
                    k: v for k, v in attribute.items() if k in ['attribute_id', 'attribute_value_list']
                } for attribute in result['attribute_list']
            ]

            new_advertising['attribute_list'] = []

            for attribute in attributes:
                attribute_object = {}

                if attribute['attribute_id'] == 100037:
                    continue

                attribute_value_list = attribute.get('attribute_value_list', None)

                if not attribute_value_list:
                    continue

                attribute_object = {
                    'attribute_id': attribute['attribute_id'],
                    'attribute_value_list': attribute_value_list
                }

                new_advertising['attribute_list'].append(attribute_object)

            # new_advertising['attribute_list'] = [
            #     {'attribute_id': attribute['attribute_id'], 'attribute_value_list': attribute.get('attribute_value_list', None)} for attribute in attributes if attribute['attribute_id'] != 100037
            # ]

        if result.get('dimension') is not None:
            new_advertising['dimension'] = result['dimension']

        if result.get('wholesales') is not None and len(result['wholesales']) > 0:
            new_advertising['wholesale'] = [
                {
                    k: v for k, v in wholesale.items() if k in ['min_count', 'max_count', 'unit_price']
                } for wholesale in result['wholesales']
            ]

        # if result.get('size_chart') is not None and len(result['size_chart']) > 0:
        #     new_advertising['size_chart'] = result['size_chart']

        if result.get('condition') is not None and len(result['condition']) > 0:
            new_advertising['condition'] = result['condition']

        if result.get('item_status') is not None and len(result['item_status']) > 0:
            new_advertising['item_status'] = 'NORMAL' if result['item_status'].upper() == 'NORMAL' else 'UNLIST'

        if result.get('tax_info') is not None and len(result['tax_info']) > 0:
            new_advertising['tax_info'] = result['tax_info']

        # Se exitem dados alterados, edita new_advertising
        if advertising.get('override') or mass_override:
            new_advertising, variation_result = edit_values(
                new_advertising, variation_result,
                advertising.get('override'), mass_override
            )

        # Replica anúncio em cada conta selecionada
        seller_id = owner_account_id
        for account_id, account in accounts.items():
            process_item_id = create_process_item(
                processes[str(account['id'])], account['id'],
                advertising['id'], action
            )

            if (allow_duplicated_account or seller_id != account['id']) and (allow_duplicated_title or new_advertising['item_name'] not in account_advertisings[str(account['id'])]):

                sp_api_copy = ShopeeApi(
                    access_token=account['access_token'], shop_id=account['id']
                )

                response_logistics = sp_api_copy.get(
                    path='/api/v2/logistics/get_channel_list', version='v2'
                )
                result_logistics = response_logistics.json()

                if response_logistics.status_code != 200 or (result_logistics.get('error') and len(result_logistics.get('error')) > 0):
                    update_process_item(
                        process_item_id, None, False, action,
                        f'Replicação de Anúncio #{result["item_id"]}: {result["item_name"]} - Operação não realizada (falha ao recuperar modos de envio disponíveis na conta).'
                    )
                    continue
                else:
                    result_logistics = result_logistics['response']

                    new_advertising['logistic_info'] = []

                    # Verifica logistics do destino e se estiver enable adiciona ao item
                    for logistic in result_logistics['logistics_channel_list']:
                        if logistic.get('logistics_channel_id') and logistic.get('enabled'):
                            new_logistic = {}
                            for key, value in logistic.items():
                                if key in ['logistics_channel_id', 'enabled', 'shipping_fee', 'size_id', 'is_free']:
                                    if key == 'logistics_channel_id':
                                        key = 'logistic_id'
                                    new_logistic[key] = value
                            new_advertising['logistic_info'].append(new_logistic)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, account['user_id'], process_item_id, tool['price'])):
                    response = sp_api_copy.post(
                        '/api/v2/product/add_item',
                        version='v2',
                        json=new_advertising,
                    )

                    status_code = response.status_code

                    response_data = response.json()

                    if status_code not in [200, 201] or (response_data.get('error') and len(response_data.get('error')) > 0):
                        fail_duplication(
                            action, account['user_id'], process_item_id, tool,
                            result['item_id'], result['item_name'], response,
                            response_data, status_code
                        )

                    else:
                        response_data = response_data['response']

                        if result['has_model']:
                            time.sleep(5)
                            variation_result['item_id'] = response_data['item_id']
                            response = sp_api_copy.post(
                                '/api/v2/product/init_tier_variation',
                                version='v2',
                                json=variation_result,
                            )

                            status_code = response.status_code

                            response_data = response.json()

                            if status_code not in [200, 201] or (response_data.get('error') and len(response_data.get('error')) > 0):
                                fail_duplication(
                                    action, account['user_id'], process_item_id,
                                    tool, result['item_id'], result['item_name'],
                                    response, response_data, status_code
                                )
                            else:
                                response_data = response_data['response']

                        shopee_import_item(
                            tool, None, response_data['item_id'],
                            account['id'], single=True, conn=action.conn
                        )

                        shopee_url: str = getenv('SHOPEE_URL')

                        tag1 = f"$[{shopee_url}/product/{seller_id}/{result['item_id']}/]${{{result['item_id']}}}"
                        tag2 = f"$[{shopee_url}/product/{account_id}/{response_data['item_id']}/]${{{response_data['item_id']}}}"

                        update_process_item(
                            process_item_id, response, True, action,
                            f'Replicação de Anúncio {tag1} -> {tag2}: {result["item_name"]} - anúncio replicado com sucesso.'
                        )

                else:
                    update_process_item(
                        process_item_id, None, False, action,
                        f'Replicação de Anúncio #{result["item_id"]}: {result["item_name"]} - Operação não realizada (créditos insuficientes).'
                    )

            elif (not allow_duplicated_account and seller_id == account['id']) and (not allow_duplicated_title and new_advertising['item_name'] in account_advertisings[str(account['id'])]):
                update_process_item(process_item_id, None, False, action,
                                    f'Replicação de Anúncio #{result["item_id"]}: {result["item_name"]} - Operação não realizada (replicação de anúncio da própria conta e título repetido).')

            elif not allow_duplicated_account and seller_id == account['id']:
                update_process_item(process_item_id, None, False, action,
                                    f'Replicação de Anúncio #{result["item_id"]}: {result["item_name"]} - Operação não realizada (replicação de anúncio da própria conta).')

            else:
                update_process_item(process_item_id, None, False, action,
                                    f'Replicação de Anúncio #{result["item_id"]}: {result["item_name"]} - Operação não realizada (anúncio com título repetido).')

    except ShopeeConnectionException as e:
        LOGGER.error(e)
        for account_id, account in accounts.items():
            process_item_id = create_process_item(
                processes[str(account['id'])], account['id'], advertising['id'], action)
            update_process_item(process_item_id, None, False, action,
                                f'Replicação de Anúncio #{advertising["id"]} - Operação cancelada ({e}).')

    except Exception:
        LOGGER.error(traceback.format_exc())
        for account_id, account in accounts.items():
            process_item_id = create_process_item(
                processes[str(account['id'])], account['id'], advertising['id'], action)
            update_process_item(process_item_id, None, False, action,
                                f'Replicação de Anúncio #{advertising["id"]} - Operação cancelada ({traceback.format_exc()}).')

    finally:
        action.conn.close()


def advertising_replicate_mercadolibre_item(
    tool: dict, processes: dict, shopee_account_id: dict, ml_account_id: int, advertising: dict
):
    process_item_id = None

    try:
        action = QueueActions()
        action.conn = get_conn()
        success = True

        sp_account = get_account(action, shopee_account_id, platform="SP")
        sp_access_token = refresh_token(action=action, account=sp_account, platform="SP")
        
        ml_account = get_account(action, ml_account_id, platform="ML")
        ml_access_token = refresh_token(action=action, account=ml_account, platform="ML")

        sp_api = ShopeeApi(
            shop_id=shopee_account_id,
            access_token=sp_access_token["access_token"],
        )
        
        ml_api = MercadoLibreApi(access_token=ml_access_token["access_token"])
        
        advertising_id = advertising["id"]
        response = ml_api.get(f"/items/{advertising_id}", params={"include_attributes": "all", "include_descriptions": "all"})
        result = response.json()
        
        process_item_id = create_process_item(processes[str(shopee_account_id)], shopee_account_id, advertising_id, action)
        
        if response.status_code != 200:
            success = False

        # Limita a quantidade de imagens em 9.
        advertising_images = result.get('pictures', [])
        # images_within_limit = advertising_images[0:9] if len(advertising_images) > 9 else advertising_images
            
        image_info, updated_ml_variations = _build_images(advertising_images, result.get('variations', []), sp_api, process_item_id, action)

        new_ad_condition = None
        new_ad_condition = get_advertising_condition(result)

        original_ad_gtin = get_ml_advertising_gtin(advertising=result, sp_api=sp_api, category_id=advertising.get('category_id'))

        shopee_required_attributes = advertising.get('shopee_required_attributes', [])

        new_advertising = {
            'original_price': result.get('price'),
            'category_id': advertising.get('category_id'),
            'item_name': result.get('title'), 
            'image': image_info,
            'weight': advertising.get('weight'),  
            'dimension': advertising.get('dimension'), 
            'description': _build_description(ml_api, advertising_id, result, process_item_id, action), 
            'logistic_info': _build_logistic_info(sp_api),
            'item_status': "NORMAL",
            'brand': _build_brand(result, sp_api,  advertising.get('category_id')),
            'seller_stock': _build_seller_stock(result),
            'attribute_list': shopee_required_attributes
        }

        original_ad_has_variations = len(result.get('variations', [])) > 0

        if not original_ad_has_variations:
            attributes = result.get('attributes', [])

            original_item_sku = next((attribute['value_name'] for attribute in attributes if attribute['id'] == 'SELLER_SKU'), None)

            if original_item_sku:
                new_advertising['item_sku'] = original_item_sku

        if advertising_id == 'MLB4142212049':
            # required_attributes = get_category_required_attributes(
            #     sp_api=sp_api,
            #     category_id=advertising.get('category_id'),
            #     ml_ad_attributes=result.get('attributes')
            # )
            # new_advertising['attribute_list'] = required_attributes

            required_attributes = [
                {
                    "attribute_id": 101197, # Nr. Anatel
                    "attribute_value_list": [
                        { 
                            "value_id": 0,
                            "original_value_name": "217522314550",
                            "value_unit": ""
                        } 
                    ]
                    # "attribute_value_list": [
                    #     { "value_id": 0, "original_value_name": "217522314550" }
                    # ]
                },
                {
                    "attribute_id": 101040, # Model Name
                    "attribute_value_list": [
                        { 
                            "value_id": 0,
                            "original_value_name": "Smartphone Xiaomi POCO X7 Pro",
                            "value_unit": ""
                        } 
                    ]
                    # "attribute_value_list": [
                    #     { "value_id": 0, "original_value_name": "Poco X7 Pro 5G" }
                    # ]
                },
                {
                    "attribute_id": 101237, # Manufacturer
                    "attribute_value_list": [
                        { 
                            "value_id": 8169,
                            "original_value_name": "Xiaomi Communications Co.",
                            "value_unit": ""
                        } 
                    ]
                    # "attribute_value_list": [
                    #     { "value_id": 8169 } # Xiaomi
                    # ]
                }
            ]

            new_advertising['attribute_list'] = required_attributes

        if original_ad_gtin is not None:    
            new_advertising['gtin_code'] = original_ad_gtin

        if new_ad_condition:
            new_advertising['condition'] = new_ad_condition

        if not success:
            update_process_item(
                process_item_id, None, False, action,
                f'Replicação de Anúncio #{advertising_id} - Operação cancelada (erro ao recuperar anúncio no Mercado Livre).'
            )
            return
                    
        if (
            tool["access_type"] == AccessType.free
            or tool["access_type"] == AccessType.subscription
            or (
                tool["access_type"] == AccessType.credits
                and use_credits(
                    action, sp_account["user_id"], process_item_id, tool["price"]
                )
            )
        ):
            # if advertising_id == 'MLB5929315908':
            #     LOGGER.error('creating ad - ')
            #     LOGGER.error(new_advertising)
                
            response = sp_api.post('/api/v2/product/add_item', version='v2', json=new_advertising)
            response_json = response.json() 
            
            if response.status_code in [200, 201] and not response_json.get('error'):
                shopee_item_id = response_json.get("response", {}).get("item_id")
                
                has_model = False
                if len(updated_ml_variations) > 0:
                    has_model = True
                    with_models = _build_model_list(sp_api, updated_ml_variations, shopee_item_id)
                
                shopee_url: str = getenv('SHOPEE_URL') 
                
                tag1 = f"$[{result.get('permalink')}/]${{{advertising_id}}}"
                tag2 = f"$[{shopee_url}/product/{shopee_account_id}/{shopee_item_id}/]${{{shopee_item_id}}}"
                
                if has_model and with_models:
                    message = f"Replicação de Anúncio {tag1} -> {tag2}: {result['title']}. Anúncio replicado com sucesso. Variações inseridas com sucesso."
                elif has_model and not with_models:
                    message = f"Replicação de Anúncio {tag1} -> {tag2}: {result['title']}. Anúncio replicado com sucesso. Ocorreu um erro ao inserir variações."
                elif not has_model:
                    message = f"Replicação de Anúncio {tag1} -> {tag2}: {result['title']}. Anúncio replicado com sucesso."
                    
                shopee_import_item(
                    tool, None, shopee_item_id, 
                    shopee_account_id, sp_access_token["access_token"], single=True, conn=action.conn,
                )
                
                update_process_item(
                    process_item_id, response, True, action,
                    message
                )
            else:
                response_data = response.json()
                status_code = response.status_code
                fail_duplication(               
                    action, sp_account["user_id"], process_item_id, tool,
                    advertising_id, result.get('title'), response,
                    response_data, status_code
                )
        else:
            update_process_item(
                process_item_id, None, False, action,
                f"Replicação de anúncio não realizada: créditos insuficientes ou acesso não permitido."
            )

    except Exception as e:
        LOGGER.error(e)
        if process_item_id:
            update_process_item(
                process_item_id, None, False, action,
                f"Erro ao replicar anúncio #{advertising_id}. Detalhes: {traceback.format_exc()}"
            )
    finally:
        action.conn.close()


def edit_values(new_advertising, variation_result, advertising_override, mass_override):
    existing_keys = list(new_advertising.keys())

    if advertising_override:
        advertising_override.pop('seller_id', None)
        advertising_override.pop('seller_name', None)

        # Copia todos os campos alterados, menos attributes/variations/priceActions
        for key, value in advertising_override.items():
            if key not in ['attributes', 'priceActions', 'title']:
                new_advertising[key] = value

        # Trata priceActions
        if advertising_override.get('priceActions'):
            if new_advertising.get('original_price'):
                new_advertising['original_price'] = apply_math_operation(
                    new_advertising['original_price'], advertising_override['priceActions']
                )

            if new_advertising.get('wholesale'):
                for i in range(len(new_advertising['wholesale'])):
                    new_advertising['wholesale'][i]['unit_price'] = apply_math_operation(
                        new_advertising['wholesale'][i]['unit_price'],
                        advertising_override['priceActions']
                    )

            if variation_result.get('model'):
                for i in range(len(variation_result['model'])):
                    variation_result['model'][i]['original_price'] = apply_math_operation(
                        variation_result['model'][i]['original_price'],
                        advertising_override['priceActions']
                    )

        if advertising_override.get('title') and len(new_advertising['item_name']) < 250:
            limit = 255               
            new_advertising['item_name'] = new_advertising['item_name'] + ' ' + \
                advertising_override['title'][:limit -
                                              len(new_advertising['item_name'])-1]

    if mass_override:
        # Copia todos os campos alterados, menos attributes/variations/priceActions
        for key, value in mass_override.items():
            if key not in ['attributes', 'priceActions', 'title']:
                new_advertising[key] = value

        # Trata priceActions
        if mass_override.get('priceActions'):
            if new_advertising.get('original_price'):
                new_advertising['original_price'] = apply_math_operation(
                    new_advertising['original_price'], mass_override['priceActions']
                )

            if new_advertising.get('wholesale'):
                for i in range(len(new_advertising['wholesale'])):
                    new_advertising['wholesale'][i]['unit_price'] = apply_math_operation(
                        new_advertising['wholesale'][i]['unit_price'],
                        mass_override['priceActions']
                    )

            if variation_result.get('model'):
                for i in range(len(variation_result['model'])):
                    variation_result['model'][i]['original_price'] = apply_math_operation(
                        variation_result['model'][i]['original_price'],
                        mass_override['priceActions']
                    )

        if mass_override.get('title') and len(new_advertising['item_name']) < 250:
            limit = 255
            new_advertising['item_name'] = new_advertising['item_name'] + ' ' + \
                mass_override['title'][:limit - len(new_advertising['item_name']) - 1]

    # Remove campos não permitidos na publicação
    new_advertising = {
        key: value for key, value in new_advertising.items() if key in existing_keys
    }

    return new_advertising, variation_result

def fail_duplication(action, user_id, process_item_id, tool, advertising_id, title, response, response_data, status_code):
    credits_msg = ''
    if tool['access_type'] == AccessType.credits:
        rollback_credits_transaction(
            action, process_item_id, user_id, tool['price'])
        credits_msg = '(crédito restituído)'

    if status_code == 401:
        message = f'Replicação de Anúncio #{advertising_id}: {title} - Operação não realizada, a conta perdeu a autenticação com a Shopee{credits_msg}'
    else:
        error = response_data

        #causes = error.get('cause',[])
        #error['cause'] = [cause for cause in causes if  cause.get('type')=='error']
        message = f'Replicação de Anúncio #{advertising_id}: {title} - Operação não realizada {credits_msg} <Resposta Shopee: {json.dumps(error)}>'

    update_process_item(process_item_id, response, False, action, message)

def apply_math_operation(price, price_actions):
    getcontext().prec = 28

    price_factor = float(price_actions['value'])

    if price_actions['operationType'] == 'percentage':
        price_factor = 100 + \
            price_factor if price_actions['operation'] == 'increase' else 100 - price_factor
        new_price = Decimal(float(price) * (price_factor / 100.0))

    else:
        price_factor = price_factor if price_actions['operation'] == 'increase' else (
            -1) * price_factor
        new_price = Decimal(float(price) + price_factor)

    return float(str(new_price.quantize(Decimal('1.000'), rounding=ROUND_UP))[:-1])

def _build_brand(result, sp_api, category_id):
    original_add_attr = result.get('attributes', [])
    original_ad_brand = next((brand_att for brand_att in original_add_attr if brand_att['id'] == 'BRAND'), None)
    original_brand_name=original_ad_brand.get('value_name', None).lower() if original_ad_brand else None

    if not original_brand_name:
        return {
            'brand_id': 0,
            'original_brand_name': 'No Brand'
        } 

    offset = 0
    has_next_page=True

    while has_next_page:
        brands_page_response = get_brand_list(sp_api, category_id, offset)
        brands_page = brands_page_response.get('response', {}).get('brand_list', [])

        for brand in brands_page:
            if brand['display_brand_name'].lower() == original_brand_name:
                return {
                    'brand_id': brand.get('brand_id', 0),
                    'original_brand_name': brand.get('display_brand_name', 'No Brand')
                }
        
        has_next_page = brands_page_response.get('response', {}).get('has_next_page', False)
        offset = brands_page_response.get('response', {}).get('next_offset', 0)
    
    return {
        'brand_id': 0,
        'original_brand_name': 'No Brand'
    }
    
def get_brand_list(sp_api, category_id, offset=0):
    params = {
        "page_size": 100,
        "category_id": category_id,
        "status": 1,
        "offset": offset
    }

    response = sp_api.get('/api/v2/product/get_brand_list', version='v2', additional_params=params)
    response_json = response.json()
    
    return response_json
    
def _build_seller_stock(result):
    stock = result.get('available_quantity', 0)

    seller_stock = [{
        "stock": stock
    }]
        
    return seller_stock

def _build_logistic_info(sp_api):
    response_logistics = sp_api.get('/api/v2/logistics/get_channel_list', version='v2')
    result_logistics = response_logistics.json()

    logistic_data = []
    if response_logistics.status_code == 200 and not result_logistics.get('error'):
        for logistic in result_logistics['response']['logistics_channel_list']:
            logistic_info = None

            if logistic.get('enabled'):
                logistic_info = {
                    'logistic_id': logistic['logistics_channel_id'],
                    'is_free': logistic.get('is_free', False),
                    'enabled': logistic.get('enabled', True)
                }
                
            if logistic.get('fee_type') == 'SIZE_SELECTION':
                size_list = logistic.get('size_list', [])
                if size_list:
                    logistic_info['size_id'] = int(size_list[0].get('size_id'))
                else:
                    LOGGER.error(f"Logistic channel {logistic['logistics_channel_name']} requer um size_id, mas nenhum foi encontrado.")

            if logistic_info:
                logistic_data.append(logistic_info)
    
    return logistic_data

def _build_description(ml_api, advertising_id, result, process_item_id, action):
    response_description = ml_api.get(f"/items/{advertising_id}/description")

    if response_description.status_code not in [200, 404]:
        update_process_item(
            process_item_id,
            response_description,
            False,
            action,
            f"Erro ao buscar descrição do anúncio. {response_description}"
        )
    else:
        result["description"] = response_description.json()

    text = (
        result.get("description", {}).get("plain_text")
        if isinstance(result.get("description"), dict)
        else ""
    )

    adjusted_text = text

    # limita a descrição entre 10 e 5000 caractéres (exigencia API)
    if not text or len(text) == 0 or len(text) < 10:
        adjusted_text = "Produto sem descrição"
    elif len(text) > 5000:
        adjusted_text = f"{text[0:4997]}..."
    
    return adjusted_text
    
def change_pic_id_variation(old_ml_id, new_sp_id, ml_variations):
    updated_ml_variations = copy.deepcopy(ml_variations)
    
    for variation in updated_ml_variations:
        if 'picture_ids' in variation:
            if old_ml_id in variation['picture_ids']:
                variation['picture_ids'] = [new_sp_id]  
                break
    return updated_ml_variations

def _build_images(new_advertising, ml_variations, sp_api, process_item_id, action):
    pictures_ids, pictures_urls, new_ml_variations = upload_images_to_shopee(new_advertising, ml_variations, sp_api, process_item_id, action)
    
    return {
        'image_url_list': pictures_urls[:9] if pictures_urls else [], 
        "image_id_list": pictures_ids[:9] if pictures_ids else []   
    }, new_ml_variations 

def upload_images_to_shopee(ml_pictures, ml_variations, sp_api, process_item_id, action):
    image_id_list = ml_pictures
    
    if not image_id_list:
        return None, None
    
    pictures = []
    uploaded_image_ids = []

    # Vai pegar somente uma imagem para cada variação
    variations_pictures = []

    for variation in ml_variations:
        variation_first_image_id = variation.get('picture_ids', [None])[0]

        first_image_data = next((picture for picture in ml_pictures if picture['id'] == variation_first_image_id), None)

        if first_image_data:
            variations_pictures.append(first_image_data)

    variations_pictures = variations_pictures if len(variations_pictures) > 0 else ml_pictures

    new_ml_variations = ml_variations
    
    for image_info in variations_pictures:
        url = image_info.get('secure_url') or image_info.get('url')
        ml_pic_id = image_info.get("id")
        
        if not url:
            LOGGER.error(f"URL inválida para a imagem: {image_info}")
            continue

        try:
            image = requests.get(url, stream=True)
            
            parser_image = ImageFile.Parser()
            parser_image.feed(image.content)
            
            image_size = len(image.content) / (1024 * 1024) 
            if image_size > 10: 
                continue 

            filename = url.split("/")[-1]
            content_type = image.headers.get("Content-Type", "image/jpeg")
            
            imagefile = {
                "image": (
                    filename,
                    image.content,
                    content_type,
                )
            }
            
            response = sp_api.post(
                        "/api/v2/media_space/upload_image", 
                        files=imagefile, 
                        version="v2"
                    )
            response_picture = response.json()
            
            if response.status_code in [200, 201] and not response_picture.get('error'):
                image_info = response_picture['response']['image_info']
                image_url_list = image_info.get('image_url_list', [])
                
                br_image_url = None
                for image_url_info in image_url_list:
                    if image_url_info.get('image_url_region') == 'BR':
                        br_image_url = image_url_info.get('image_url')
                        break
                
                if br_image_url:
                    shopee_image_id = response_picture['response']['image_info']['image_id']
                    new_ml_variations = change_pic_id_variation(ml_pic_id, shopee_image_id, new_ml_variations)

                    pictures.append(br_image_url)
                    uploaded_image_ids.append(shopee_image_id) 
            else:
                update_process_item(
                    process_item_id,
                    response,
                    False,
                    action,
                    f"Erro ao fazer upload das imagens para Shopee. {response.text}"
                )
                LOGGER.error(f"Erro ao fazer upload das imagens para Shopee. {response.text}")
                return None, None, None
        except requests.exceptions.RequestException as e:
            LOGGER.error(f"Erro ao baixar a imagem de {url}: {str(e)}")
            continue

    return uploaded_image_ids, pictures, new_ml_variations

def init_tier_variation(sp_api, shopee_item_id, tier_variations, models):
    response = sp_api.post(
        "/api/v2/product/init_tier_variation",
        json={
            "item_id": shopee_item_id,
            "tier_variation": tier_variations,
            "model": models  
        },
        version="v2"
    )
    
    response_data = response.json()

    if response.status_code in [200, 201] and not response_data.get('error'):
        return True
    else:
        LOGGER.error("Erro ao inicializar tier_variation")
        LOGGER.error(response_data)
        return False
        
def build_tier_variation_and_models(ml_variations):
    tier_variation_dict = {}
    models = []
    
    ml_image_pattern = re.compile(r'\d+-MLB\d+_\d+')

    for variation in ml_variations:
        for attribute in variation['attribute_combinations']:
            attr_name = attribute['name']

            if attr_name not in tier_variation_dict:
                tier_variation_dict[attr_name] = []

            if attribute['value_name'] not in tier_variation_dict[attr_name]:
                tier_variation_dict[attr_name].append(attribute['value_name'])

    tier_variations = []
    for name, options in tier_variation_dict.items():
        option_list = []
        for option in options:
            variation_image = None
            for variation in ml_variations:
                picture_ids = variation.get('picture_ids', [])
                if any(ml_image_pattern.match(picture_id) for picture_id in picture_ids):
                    continue

                if option == variation['attribute_combinations'][0]['value_name']:
                    variation_image = variation.get('picture_ids', [None])[0]
                
            option_list.append({
                "option": option,
                "image": {"image_id": variation_image} if variation_image else None
                # "image": None
            })
        
        tier_variations.append({
            "name": name, 
            "option_list": option_list
        })

    for variation in ml_variations:
        picture_ids = variation.get('picture_ids', [])

        tier_index = []
        for attribute in variation['attribute_combinations']:
            attr_name = attribute['name']
            value_name = attribute['value_name']
            tier_index.append(tier_variation_dict[attr_name].index(value_name))

        stock = max(variation["available_quantity"], 10)


        variation_sku = None

        for variation_attribute in variation['attributes']:
            if variation_attribute['id'] == 'SELLER_SKU':
                variation_sku = variation_attribute['value_name']

        model = {
            # "model_sku": variation["attributes"][0]["value_name"] if len(variation["attributes"]) > 0 else None, 
            "model_sku": variation_sku, 
            "normal_stock": stock, 
            "original_price": variation["price"], 
            "tier_index": tier_index,
            "seller_stock": [
                {
                    "stock": stock 
                }
            ]
        }
        models.append(model)

    return tier_variations, models

def _build_model_list(sp_api, ml_variations, shopee_item_id):
    tier_variations, models = build_tier_variation_and_models(ml_variations)
    
    if init_tier_variation(sp_api, shopee_item_id, tier_variations, models):
        return True 
    else:
        LOGGER.error("Falha na inicialização de tier_variation")
        return False

def get_advertising_condition(advertising):
    advertising_attributes = advertising.get('attributes')
    original_ad_condition = None

    for attribute in advertising_attributes:
        if attribute['id'] == 'ITEM_CONDITION':
            original_ad_condition = attribute
            break

    new_ad_condition = 'USED' if original_ad_condition.get('value_name', None) == 'Usado' else 'NEW'
    return new_ad_condition

def get_ml_advertising_gtin(advertising, sp_api, category_id):
    response = sp_api.get('/api/v2/product/get_item_limit', version='v2', additional_params={'category_id': category_id})
    response = response.json()

    response = response.get('response', {})
    gtin_limit = response.get('gtin_limit', {})
    gtin_rule = gtin_limit.get('gtin_validation_rule', 'Optional')

    gtin_code = "00"

    advertising_attributes = advertising.get('attributes')
    advertising_variations = advertising.get('variations')

    for attribute in advertising_attributes:
        if attribute['id'] == 'GTIN':
            gtin_code = attribute['value_name']

    if gtin_code != "00" or gtin_rule != "Mandatory":
        return gtin_code

    for variation in advertising_variations:
        variation_attributes = variation.get('attributes', [])

        for attribute in variation_attributes:
            if attribute['id'] == 'GTIN':
                gtin_code = attribute['value_name']
                
                return gtin_code
 
    return gtin_code

def get_category_required_attributes(sp_api, category_id, ml_ad_attributes):
    formatted_attributes = []

    attributes_conversion = {
        'Model Name': 'MODEL',
        'Registration ID': 'CELLPHONES_ANATEL_HOMOLOGATION_NUMBER',
        'Manufacturer': 'MANUFACTURER'
    }

    response = sp_api.get('/api/v2/product/get_attribute_tree', version='v2',
        additional_params={
            'category_id_list': [category_id],
            'language': 'pt-BR'
        }
    )
    response = response.json()

    response = response.get('response', {})

    attributes_list = response.get('list', [])
    attributes = attributes_list[0].get('attribute_tree') if len(attributes_list) > 0 else []

    required_attributes = [attribute for attribute in attributes if attribute.get('mandatory', False) is True]

    LOGGER.error('required_attributes')
    LOGGER.error(required_attributes)

    for sp_attribute in required_attributes:
        sp_attribute_name = sp_attribute['name']
        ml_attribute_id = attributes_conversion.get(sp_attribute_name, None)

        if ml_attribute_id is None:
            continue

        ml_attribute = next((ml_attribute for ml_attribute in ml_ad_attributes if ml_attribute['id'] == ml_attribute_id), None)

        if ml_attribute is None:
            continue

        formatted_attributes.append({
            'attribute_id': sp_attribute['attribute_id'],
            'attribute_value_list': [
                {
                    'value_id': 0,
                    'original_value_name': ml_attribute['value_name']
                }
            ]
        })

    return formatted_attributes