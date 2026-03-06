import json
import traceback
from celery.utils.log import get_task_logger
from decimal import *
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.enums.access_type import AccessType
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from workers.helpers import get_plain_text, get_tool
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits, rollback_credits_transaction
from workers.tasks.mercadolibre.advertising_import_item import advertising_import_item

LOGGER = get_task_logger(__name__)


def advertising_restore_item(
    user_id: int = None,
    account_id: int = None,
    access_token: str = None
):
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = """
            select * from meli_stage.bkp_bsone
            where inserted_at < '2022-07-29' and item_id in (select item_external_id from meuml.process_items where process_id in (3243878) and status = 0)
            order by item_id
        """
        ads_deleted = action.fetchall(query)

        tool = get_tool(action, 'duplicate-advertisings')

        # subscription_required = tool['access_type'] == AccessType.subscription

        processes_id = create_process(
            account_id=account_id, user_id=user_id, tool_id=tool['id'],
            tool_price=tool.get('price'), items_total=len(ads_deleted),
            action=action
        )

        # print(f"\nads_deleted: {ads_deleted}\n")

        for result in ads_deleted:
            result = result['external_data']

            # print(f"\nresult: {result}\n")

            # Cria JSON base do novo anúncio
            new_advertising = {
                'site_id': result['site_id'],
                'title': result['title'],
                'category_id': result['category_id'],
                'price': result['price'],
                'currency_id': 'BRL',
                'available_quantity': result['available_quantity'],
                'buying_mode': result['buying_mode'],
                'condition': result['condition'],
                'listing_type_id': result['listing_type_id'],
                'status': result['status'],
                'shipping': {'mode': result.get('shipping',{}).get('mode'), 'free_shipping': result.get('shipping',{}).get('free_shipping')},
                'video_id': result.get('video_id')
            }

            # print(f"\nnew_advertising 1: {new_advertising}\n")

            # Caso token de acesso, copia SKU
            if result.get('seller_custom_field'):
                new_advertising['seller_custom_field'] = result['seller_custom_field']

            # Se é catálogo, cria em catálogo
            if result.get('catalog_product_id') and result.get('catalog_listing'):
                new_advertising['catalog_product_id'] = result['catalog_product_id']
                new_advertising['catalog_listing'] = True

            # Utiliza apenas ids das imagens originais
            new_advertising['pictures'] = []
            for picture in result.get('pictures', []):
                new_advertising['pictures'].append({'id': picture.get('id')})

            # Copia variações mantendo apenas campos obrigatórios. Se original é catálogo, exclui publicação em catálogo
            if len(result.get('variations', [])) > 0:
                new_advertising['variations'] = []
                for variation in result['variations']:
                    variation.pop('id', None)
                    variation.pop('catalog_product_id', None)
                    variation.pop('catalog_listing', None)
                    variation.pop('sold_quantity', None)

                    attributes = []
                    for attribute in variation.get('attributes', []):
                        attributes.append({
                            'id': attribute.get('id'),
                            'name': attribute.get('name'),
                            'value_id': attribute.get('value_id'),
                            'value_name': attribute.get('value_name'),
                        })
                    variation['attributes'] = attributes

                    attributes = []
                    for attribute in variation.get('attribute_combinations', []):
                        attributes.append({
                            'id': attribute.get('id'),
                            'name': attribute.get('name'),
                            'value_id': attribute.get('value_id'),
                            'value_name': attribute.get('value_name'),
                        })
                    variation['attribute_combinations'] = attributes

                    new_advertising['variations'].append(variation)
                new_advertising.pop('catalog_product_id', None)
                new_advertising.pop('catalog_listing', None)

            # Utiliza apenas campos obrigatórios dos atributos
            new_advertising['attributes'] = []
            for attribute in result.get('attributes', []):
                new_advertising['attributes'].append({
                    'id': attribute.get('id'),
                    'name': attribute.get('name'),
                    'value_id': attribute.get('value_id'),
                    'value_name': attribute.get('value_name'),
                })

            # Cria em ME2 por default
            #if not new_advertising.get('shipping') or result['shipping'].get('mode','') != 'me2':
            #    new_advertising['shipping'] = {
            #        'mode': 'me2'
            #    }

            # Frete grátis obrigatório acima de R$120
            #if new_advertising['price'] > 120 and new_advertising.get('shipping',{}).get('mode') == 'me2':
            #    new_advertising['shipping']['free_shipping'] = True

            # Quando ME2, envia sem modo (me2 automático pelo ML)
            if new_advertising.get('shipping', {}).get('mode') == 'me2':
                new_advertising['shipping'].pop('mode', None)

            # Se é proprio anúncio, permite copiar garantia
            sale_terms = new_advertising.get('sale_terms')
            new_advertising['sale_terms'] = []
            has_manufacturing_time = False

            if sale_terms:
                for sale_term in sale_terms:
                    if sale_term['id'] not in ['WARRANTY_TYPE', 'WARRANTY_TIME', 'MANUFACTURING_TIME']:
                        new_advertising['sale_terms'].append(sale_term)

                    elif sale_term['id'] == 'MANUFACTURING_TIME':
                        has_manufacturing_time = True

                        if str(sale_term['value_name']) != '0':
                            new_advertising['sale_terms'].append({
                                "id": "MANUFACTURING_TIME",
                                "value_name": f"{sale_term['value_name']} dias"
                            })

                    else:
                        new_advertising['sale_terms'].append(sale_term)

            for sale_term in result['sale_terms']:
                if sale_term['id'] in ['WARRANTY_TYPE', 'WARRANTY_TIME']:
                    new_advertising['sale_terms'].append({
                        'id': sale_term.get('id'),
                        'value_name': sale_term.get('value_name')
                    })
                elif access_token is not None and sale_term['id'] == 'MANUFACTURING_TIME' and not has_manufacturing_time:
                    new_advertising['sale_terms'].append({
                        "id": "MANUFACTURING_TIME",
                        "value_name": sale_term['value_name']
                    })

            # Confirma que descrição é texto-puro
            # if mass_override and isinstance(mass_override, dict) and mass_override.get('description'):
            #     text = mass_override['description'].get('plain_text')

            # if advertising.get('override') and isinstance(advertising['override'], dict) and advertising['override'].get('description'):
            #     text = advertising['override']['description'].get('plain_text')

            plain_text = get_plain_text(result.get('description')) if result.get('description') else None
            description = {'plain_text': plain_text}

            # validations
            query = """
                SELECT item_conditions, shipping_modes, minimum_price::float, maximum_price::float, max_title_length::integer,
                    max_description_length::integer, max_pictures_per_item::integer, max_pictures_per_item_var::integer, fragile
                FROM meuml.ml_categories
                WHERE external_id = :id
            """
            validations = action.fetchone(
                query, {'id': new_advertising.get('category_id')}
            )

            success = True
            errors = []
            if validations:
                if validations['item_conditions'] and new_advertising['condition'] not in validations['item_conditions']:
                    success = False
                    errors.append(f"condição {new_advertising['condition']} não aceita")

                #if validations['shipping_modes'] and new_advertising.get('shipping',{}).get('mode') and new_advertising['shipping']['mode'] not in validations['shipping_modes']:
                #    success = False
                #    errors.append(f"modo de frete {new_advertising.get('shipping',{}).get('mode')} não aceito")

                if  validations['minimum_price'] and new_advertising['price'] < validations['minimum_price']:
                    success = False
                    errors.append(f"preço {new_advertising['price']} está abaixo do mínimo exigido")

                if validations['maximum_price'] and new_advertising['price'] < validations['maximum_price']:
                    success = False
                    errors.append(f"preço {new_advertising['price']} está acima do máximo exigido")

                if not success:
                    process_item_id = create_process_item(
                        processes_id, account_id,
                        result['id'], action
                    )
                    message = f"Erro de validação da categoria {new_advertising.get('category_id')}: " + ', '.join(errors)
                    update_process_item(
                        process_item_id, None, False, action,
                        f'Restauração de Anúncio #{result["id"]} - Operação cancelada ({message}).'
                    )
                    return

                if validations['max_title_length'] and new_advertising['title'] and len(new_advertising['title']) > validations['max_title_length']:
                    new_advertising['title'] = new_advertising['title'][:validations['max_title_length']]

                if validations['max_description_length'] and isinstance(description, dict) and isinstance(description.get('plain_text'), str) and len(description['plain_text']) > validations['max_description_length']:
                    description['plain_text'] = description['plain_text'][:validations['max_description_length']]

                if validations['max_pictures_per_item'] and len(new_advertising['pictures']) > validations['max_pictures_per_item']:
                    new_advertising['pictures'] = new_advertising['pictures'][:validations['max_pictures_per_item']]

                if validations['max_pictures_per_item_var'] and new_advertising.get('variations') and len(new_advertising['variations']) > 0:
                    for i, variation in enumerate(new_advertising['variations']):
                        if variation['picture_ids'] and len(variation['picture_ids']) > validations['max_pictures_per_item_var']:
                            new_advertising['variations'][i]['picture_ids'] = variation['picture_ids'][:validations['max_pictures_per_item_var']]

            if not new_advertising.get('catalog_listing'):
                new_advertising.pop('catalog_product_id', None)

            # Replica anúncio
            process_item_id = create_process_item(
                processes_id, account_id,
                result['id'], action
            )

            if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                new_advertising.pop('official_store_id', None)

                if result.get('official_store_id'):
                    new_advertising['official_store_id'] = result['official_store_id']

                ml_api = MercadoLibreApi(
                    access_token=access_token
                )

                # print(f"\n\nnew_advertising 2: {new_advertising}\n\n")

                response = ml_api.post('/items', json=new_advertising)

                status_code = response.status_code
                response_data = response.json()

                print(f"\nresponse_data: {response_data}\n")

                if status_code != 201:
                    fail_duplication(
                        action, user_id, process_item_id,
                        tool, result['id'], result['title'], response
                    )
                else:
                    advertising_import_item(
                        True, account_id, user_id,
                        response_data['id'], process_item_id,
                        access_token, update=True
                    )

                    permalink = response_data['permalink']
                    original_permalink = permalink.split('-')
                    original_permalink[1] = result['id'][3:]
                    original_permalink = '-'.join(original_permalink)

                    tag1 = f"$[{original_permalink}]${{{result['id']}}}"
                    tag2 = f"$[{permalink}]${{{response_data['id']}}}"

                    description_msg = ''
                    if description.get('plain_text'):
                        response_description = ml_api.post(
                            f'/items/{response_data["id"]}/description',
                            json=description
                        )

                        if response_description.status_code not in [200, 201]:
                            description_error_data = response_description.json()
                            LOGGER.error(description_error_data)
                            description_msg = f'Erro ao inserir descrição: <Resposta Mercado Livre: {json.dumps(description_error_data)}>'

                    response = ml_api.put(
                        f'/items/{response_data["id"]}',
                        json={
                            'status': 'paused',
                        }
                    )

                    if response.status_code == 200:
                        update_process_item(
                            process_item_id, response, True, action,
                            f'Restauração de Anúncio {tag1} -> {tag2}: {result["title"]} - anúncio restaurado com sucesso no status PAUSADO.  {description_msg}'
                        )
                    else:
                        update_process_item(
                            process_item_id, response, False, action,
                            f'Restauração de Anúncio {tag1} -> {tag2}: {result["title"]} - anúncio restaurado com sucesso, porém o status está como ativo, por favor revise o status do anúncio <Resposta Mercado Livre: active -> {new_advertising["status"]}, HTTP {response.status_code}>.  {description_msg}'
                        )
            else:
                update_process_item(
                    process_item_id, None, False, action,
                    f'Restauração de Anúncio #{result["id"]}: {result["title"]} - Operação não realizada (créditos insuficientes).'
                )

    except Exception as e:
        LOGGER.error(e)
        process_item_id = create_process_item(
            processes_id, account_id,
            result['id'], action
        )
        update_process_item(
            process_item_id, None, False, action,
            f'Restauração de Anúncio #{result["id"]} - Operação cancelada. \n {traceback.format_exc()}'
        )
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())
    finally:
        action.conn.close()


def fail_duplication(
    action, user_id, process_item_id, tool, advertising_id, title, response
):
    credits_msg = ''

    if tool['access_type'] == AccessType.credits:
        rollback_credits_transaction(
            action, process_item_id, user_id, tool['price']
        )

        credits_msg = '(crédito restituído)'

    if response.status_code == 401:
        message = f'Restauração de Anúncio #{advertising_id}: {title} - Operação não realizada, a conta perdeu a autenticação com o Mercado Livre {credits_msg}'
    else:
        error = response.json()
        LOGGER.error(error)
        LOGGER.error(response.status_code)
        #causes = error.get('cause',[])
        #error['cause'] = [cause for cause in causes if  cause.get('type')=='error']
        message = f'Restauração de Anúncio #{advertising_id}: {title} - Operação não realizada {credits_msg} <Resposta Mercado Livre: {json.dumps(error)}>'

    update_process_item(process_item_id, response, False, action, message)

