import json
import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.enums.marketplace import Marketplace
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from workers.helpers import refresh_token
from workers.loggers import create_process, create_process_item, update_process_item


LOGGER = get_task_logger(__name__)


def article_sku_edit_item(user_id: int, tool: dict, article_id: str, new_sku: str, conn = None):
    action = QueueActions()
    action.conn = conn if conn else get_conn()
    successes = 0

    try:
        query = """
            SELECT ar.id, ar.sku, ar.is_parent, ar.parent_id, from_marketplace_id, from_advertising_id, from_variation_id
            FROM stock.article ar
            WHERE ar.id = :id
        """
        article = action.fetchone(query, {'id': article_id})

        if not article:
            process_id = create_process(user_id, user_id=user_id, tool_id=tool['id'], tool_price=tool['price'], items_total=1, action=action, platform=None)                   
            process_item_id = create_process_item(process_id, user_id, article_id, action)
            message = f'Alteração SKU Produto #{article_id} - Produto não encontrado'
            update_process_item(process_item_id, False, False, action, message)
            return

        if article['is_parent']:
            process_id = create_process(user_id, user_id=user_id, tool_id=tool['id'], tool_price=tool['price'], items_total=1, action=action, platform=None)                   
            process_item_id = create_process_item(process_id, user_id, article_id, action)
            message = f'Alteração SKU Produto #{article_id} - Não é possível editar SKU do produto pai'
            update_process_item(process_item_id, False, False, action, message)
            return

        if article['sku']:
            # query = """
            #     SELECT ad.id, ad.item_sku as sku, va.id as variation_id, va.variation_sku, ad.account_id 
            #     FROM shopee.advertisings ad
            #     JOIN shopee.accounts ac ON ac.id = ad.account_id
            #     LEFT JOIN shopee.variations va ON va.article_id = ad.id
            #     WHERE ac.user_id = :user_id AND (ad.item_sku = :sku OR va.variation_sku = :sku)
            # """
            # shopee_advertisings = action.fetchall(query, {'user_id': user_id, 'sku': article['sku']})

            # for advertising in shopee_advertisings:
            #     shopee_edit_sku(action, process_item_id, advertising, new_sku)

            query = """
                SELECT ac.id, ac.user_id, ac.access_token, ac.refresh_token, ac.name, ac.external_name, ac.access_token_expires_at
                FROM meuml.accounts ac
                WHERE ac.user_id = :user_id AND ac.status = 1
            """
            accounts = action.fetchall(query, {'user_id': user_id})

            for account in accounts:
                mercadolibre_advertisings = mercadolibre_search_sku(action, account, article['sku'])
                if len(mercadolibre_advertisings) > 0:
                    process_id = create_process(account_id=account['id'], user_id=account['user_id'], tool_id=tool['id'], tool_price=tool['price'], items_total=len(mercadolibre_advertisings), action=action)                   

                for advertising_id in mercadolibre_advertisings:
                    message, has_edited = mercadolibre_edit_sku(action, account, article['id'], advertising_id, None, article['sku'], new_sku)
                    process_item_id = create_process_item(process_id, account['id'], advertising_id, action)
                    update_process_item(process_item_id, has_edited, has_edited, action, message)

                    if has_edited:
                        successes += 1
        
        elif article['from_marketplace_id'] == Marketplace.MercadoLibre.value:
            query = """
                SELECT ad.external_id, ac.id, ac.user_id, ac.access_token, ac.refresh_token, ac.name, ac.external_name, ac.access_token_expires_at
                FROM meuml.advertisings ad
                JOIN meuml.accounts ac ON ac.id = ad.account_id
                WHERE ad.external_id = :id 
            """
            account_advertising = action.fetchone(query, {'id': article['from_advertising_id']})

            if not account_advertising:
                process_id = create_process(user_id, user_id=user_id, tool_id=tool['id'], tool_price=tool['price'], items_total=1, action=action, platform=None)                   
                process_item_id = create_process_item(process_id, user_id, article_id, action)
                message = f'Alteração SKU Produto #{article_id} - Conta'
                update_process_item(process_item_id, False, False, action, message)
                return
            
            process_id = create_process(account_id=account_advertising['id'], user_id=account_advertising['user_id'], tool_id=tool['id'], tool_price=tool['price'], items_total=1, action=action)                   
            message, has_edited = mercadolibre_edit_sku(action, account_advertising, article['id'], account_advertising['external_id'], article['from_variation_id'], article['sku'], new_sku)
            
            process_item_id = create_process_item(process_id, account_advertising['id'], account_advertising['external_id'], action)
            update_process_item(process_item_id, has_edited, has_edited, action, message)

            if has_edited:
                successes += 1

        if successes > 0:
            process_id = create_process(user_id, user_id=user_id, tool_id=tool['id'], tool_price=tool['price'], items_total=1, action=action, platform=None)                   
            process_item_id = create_process_item(process_id, user_id, article_id, action)
            query = "UPDATE stock.article SET sku = :sku WHERE id = :id RETURNING id"

            if action.execute_insert(query, {'sku': new_sku, 'id': article_id}):
                update_process_item(process_item_id, True, True, action, f"Alteração SKU Produto #{article_id} - SKU interno atualizado com sucesso")
            else:
                update_process_item(process_item_id, False, False, action, f"Alteração SKU Produto #{article_id} - Erro ao atualizar SKU interno")

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        if conn is None:
            action.conn.close()


def mercadolibre_search_sku(action, account, current_sku):
    access_token = refresh_token(action=action, account=account)
    if not access_token:
        return []        
    else:
        access_token = access_token['access_token']

    ml_api = MercadoLibreApi(access_token=access_token)
    response = ml_api.get(f'/users/{account["id"]}/items/search?seller_sku={current_sku}')

    if response.status_code != 200:
        return []
    advertisings_id = response.json().get('results')

    return advertisings_id


def mercadolibre_edit_sku(action, account, article_id, advertising_id, variation_id, current_sku, new_sku):
    access_token = refresh_token(action=action, account=account)
    if not access_token:
        message = f'Alteração SKU Produto #{article_id} - Conta ML #{account["id"]}) - Erro ao alterar SKU (não foi possível renovar o token de acesso)'
        return message, False        
    else:
        access_token = access_token['access_token']

    ml_api = MercadoLibreApi(access_token=access_token)
    response = ml_api.get(f'/items/{advertising_id}', params={'include_attributes':'all'})
    
    if response.status_code != 200:
        message = f'Alteração SKU Produto #{article_id} - Conta ML #{account["id"]}) - Erro ao carregar anúncio do Mercado Livre'
        return message, False
        
    advertising = response.json()
    has_found_sku = False  

    if advertising['variations']:
        for variation in advertising['variations']:
            attributes = []
            for attribute in variation['attributes']:
                if attribute['id'] == 'SELLER_SKU' and attribute['value_name'] == current_sku:
                    attributes.append({
                        'id': 'SELLER_SKU',
                        'name': 'SKU', 
                        'value_name': new_sku
                    })
                    has_found_sku = True
                elif attribute['id'] != 'SELLER_SKU':
                    attributes.append({
                        'id': attribute['id'],
                        'name': attribute['name'], 
                        'value_name': attribute['value_name']
                    })        

            if has_found_sku or variation['id'] == variation_id:
                if not has_found_sku:
                    attributes.append({
                        'id': 'SELLER_SKU',
                        'name': 'SKU', 
                        'value_name': new_sku
                    })

                response = ml_api.put(f'/items/{advertising_id}/variations/{variation["id"]}', json={'attributes': attributes})
                if response.status_code == 200:
                    message = f'Alteração SKU Produto #{article_id} - Anúncio #{advertising_id}, Variação #{variation["id"]} - SKU atualizado com sucesso'
                    return message, True
                else:
                    error_data = response.json()
                    message = f'Alteração SKU Produto #{article_id} - Anúncio #{advertising_id}, Variação #{variation["id"]} - Erro ao alterar SKU ({json.dumps(error_data)})'
                    return message, False
    else:
        attributes = []
        for attribute in advertising['attributes']:
            if attribute['id'] == 'SELLER_SKU' and attribute['value_name'] == current_sku:
                attributes.append({
                    'id': 'SELLER_SKU',
                    'name': 'SKU', 
                    'value_name': new_sku
                })
                has_found_sku = True
            elif attribute['id'] != 'SELLER_SKU':
                attributes.append({
                    'id': attribute['id'],
                    'name': attribute['name'], 
                    'value_name': attribute['value_name']
                })

        if not has_found_sku:
            attributes.append({
                'id': 'SELLER_SKU',
                'name': 'SKU', 
                'value_name': new_sku
            })

        response = ml_api.put(f'/items/{advertising_id}', json={'attributes': attributes})
        if response.status_code == 200:
            message = f'Alteração SKU Produto #{article_id} - Anúncio #{advertising_id} - SKU atualizado com sucesso'
            return message, True
        else:
            error_data = response.json()
            message = f'Alteração SKU Produto #{article_id} - Anúncio #{advertising_id} - Erro ao alterar SKU ({json.dumps(error_data)})'
            return message, False

    message = f'Alteração SKU Produto #{article_id} - Anúncio #{advertising_id}) - SKU não encontrado'
    return message, False


def shopee_edit_sku(action, process_item_id, account_id, advertising_id, new_sku):
    return None
