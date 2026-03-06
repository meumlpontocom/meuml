import json
import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn  
from libs.enums.access_type import AccessType      
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import get_tool, get_advertisings, get_account_advertisings_info, refresh_token, get_account, invalid_access_token
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits, rollback_credits_transaction


LOGGER = get_task_logger(__name__)


def advertising_sku_set_many(user_id: int, filter_query: str, filter_values: dict, sku: str, variations_sku: dict):
    advertising_sku_set_item = queue.signature('long_running:advertising_sku_set_item')

    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'alter-sku')
        
        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)

        # Atualiza anúncios por batch e altera preço quando finalizado
        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                process_item_id = create_process_item(account['process_id'], int(account_id), advertising, action)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    advertising_sku_set_item.delay(
                        account_id=int(account_id),
                        tool=tool,
                        process_item_id=process_item_id,
                        ml_item_id=advertising,
                        sku=sku,
                        variations_sku=variations_sku
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f'Alteração SKU Anúncio #{advertising} - Operação não realizada (créditos insuficientes).')
    
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def advertising_sku_set_item(account_id: int, tool: dict, process_item_id: int, ml_item_id: str, sku: str, variations_sku: dict, conn=None):
    action = QueueActions()
    action.conn = conn if conn else get_conn()

    account = get_account(action=action, account_id=account_id) 
    status_code = 500
    response = None
    message = None

    try:
        if account is None:
            status_code = 403
            message = f'Alteração SKU Anúncio #{ml_item_id} - Erro ao alterar SKU (verifique se a conta está ativa e autenticada).'
            return (status_code, message)

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            status_code = 403
            message = f'Alteração SKU Anúncio #{ml_item_id} - Erro ao alterar SKU (não foi possível renovar o token de acesso).'
            return (status_code, message)        
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        response = ml_api.get(f'/items/{ml_item_id}', params={'include_attributes':'all'})
        
        if response.status_code != 200:
            status_code = 502
            message = f'Alteração SKU Anúncio #{ml_item_id} - Erro de comunicação com o Mercado Livre (falha ao sincronizar anúncio).'
            return (status_code, message) 
        
        advertising = response.json()
        data = {}

        if advertising.get('variations'):
            variations = [] if not advertising.get('variations') else advertising['variations']

            for variation in variations:
                variation['attributes'] = [] if not variation.get('attributes') else variation['attributes']
                has_attribute = False
                
                variation_sku = variations_sku[str(variation['id'])] if variations_sku and str(variation['id']) in variations_sku else sku

                for attribute in variation['attributes']:
                    if attribute['id'] == 'SELLER_SKU': 
                        attribute['value_name'] = variation_sku
                        has_attribute = True
                        break

                if not has_attribute:
                    variation['attributes'].append({
                        'id': 'SELLER_SKU',
                        'value_name': variation_sku
                    })
                
                variation.pop('catalog_product_id', None)

            data['variations'] = variations

        else:
            attributes = [] if not advertising.get('attributes') else advertising['attributes']
            has_attribute = False

            for attribute in attributes:
                if attribute['id'] == 'SELLER_SKU': 
                    attribute['value_name'] = sku
                    has_attribute = True
                    break

            if not has_attribute:
                attributes.append({
                    'id': 'SELLER_SKU',
                    'value_name': sku
                })

            data['attributes'] = attributes
                
        response = ml_api.put(f'/items/{ml_item_id}', json=data)
        status_code = response.status_code

        if response.status_code == 200:
            message = f'Alteração SKU Anúncio #{ml_item_id} - SKU modificado com sucesso.'
            update_process_item(process_item_id, response, True, action, message) 
            action.execute("UPDATE meuml.advertisings SET sku = :sku WHERE external_id = :external_id", {'sku': sku, 'external_id': ml_item_id})    
            
    except:
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())
    finally:
        if status_code != 200:
            if not message:
                message = f'Alteração SKU Anúncio #{ml_item_id} - Erro ao alterar SKU'
            update_process_item(process_item_id, response, False, action, message)
        
        if not conn:
            action.conn.close()

    return (status_code, message)
