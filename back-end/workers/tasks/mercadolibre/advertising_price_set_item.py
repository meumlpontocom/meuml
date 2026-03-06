import traceback
from celery.utils.log import get_task_logger
from decimal import *
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn  
from libs.enums.access_type import AccessType      
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import refresh_token, invalid_access_token, get_account
from workers.loggers import  update_process_item
from workers.tasks.mercadolibre.advertising_import_item import advertising_import_item
from workers.payment_helpers import rollback_credits_transaction

LOG_PLAIN_TEXT_NOT_CHANGED = ''

LOG_ACCOUNT_NOT_FOUND = '[account_id="%s"] Account not found.'
LOG_TOOL_NOT_FOUND = '[tool_id="%s"] Tool not found.'
LOG_ADVERTISING_NOT_FOUND = '[ml_item_id="%s"] Advertising not found.'
LOG_BALANCE_NOT_FOUND = '[ml_item_id="%s"] Balance not found.'
LOG_NOT_ENOUGH_BALANCE = '[seller_id="%s"] Not enough balance.'

LOGGER = get_task_logger(__name__)
TOOL_KEY = 2

def advertising_price_set_item(pool, tool: dict, account_id: int, ml_item_id: str, process_item_id: int, price_premium: float, price_classic: float, price_free: float, price_rate: bool, conn=None):
    action = QueueActions()
    action.conn = get_conn() if not conn else conn

    account = get_account(action=action, account_id=account_id)
    status_code = None
    response = None
    message = ''
    
    try:
        if account is None:
            LOGGER.error(LOG_ACCOUNT_NOT_FOUND, account_id)
            return

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        update = True
        advertising_import_item(None, account_id, account['user_id'], ml_item_id, process_item_id, access_token, update, action.conn)

        ml_api = MercadoLibreApi(access_token=access_token)

        query = 'SELECT external_id, title, listing_type_id, price, variations FROM meuml.advertisings WHERE external_id = :id AND account_id = :ml_user_id'
        advertising = action.fetchall(query, {'id': ml_item_id, 'ml_user_id': account_id})

        if len(advertising) == 0:
            LOGGER.error(LOG_ADVERTISING_NOT_FOUND, ml_item_id)
            return
        advertising = advertising[0]
            
        price = price_free
        if advertising['listing_type_id'] == 'gold_pro':
            price = price_premium
        elif advertising['listing_type_id'] == 'gold_special':
            price = price_classic
    
        getcontext().prec = 28

        if not advertising.get('variations'):
            if price_rate:
                new_price = Decimal(float(advertising['price']) * (price / 100.0))
            else:
                new_price = Decimal(float(advertising['price']) + price)
            new_price = str(new_price.quantize(Decimal('1.000'), rounding=ROUND_UP))[:-1]

            LOGGER.warning('[%s - PRICE: %f ->  NEW PRICE: %f  (change: %f)]', ml_item_id, float(advertising['price']), float(new_price), price)

            response = ml_api.put(f'/items/{ml_item_id}', json={
                'price': float(new_price)
            })

            if response.status_code == 403:
                access_token = action.refresh_token(account=account)
                if access_token == False:
                    action.abort_json({
                        'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                        'status': 'error',
                    }, 400)
                else:
                    access_token = access_token['access_token']
                ml_api = MercadoLibreApi(access_token=access_token)
                response = ml_api.put(f'/items/{ml_item_id}', json={
                    'price': float(new_price)
                })
            
            status_code = response.status_code

            if response.status_code in [200,201]:
                message = f'Alteração de preço Anúncio #{ml_item_id} - Sucesso: As alterações podem demorar para aparecer no Mercado Livre'
                update_process_item(process_item_id, response, True, action, message)
            
        else:
            for i in range(len(advertising['variations'])):
                if price_rate:
                    new_price = Decimal(float(advertising['variations'][i]['price']) * (price / 100.0))
                else:
                    new_price = Decimal(float(advertising['variations'][i]['price']) + price)
                new_price = str(new_price.quantize(Decimal('1.000'), rounding=ROUND_UP))[:-1]

                LOGGER.warning('[%s - (var)PRICE: %f ->  NEW PRICE: %f  (change: %f)]', ml_item_id, float(advertising['variations'][i]['price']), float(new_price), price)

                #advertising['variations'][i] = {}
                advertising['variations'][i]['price'] = float(new_price)
                advertising['variations'][i].pop('catalog_listing',None)
                advertising['variations'][i].pop('eligible', None)
                advertising['variations'][i].pop('catalog_product_id', None)

            response = ml_api.put(f'/items/{ml_item_id}', json={
                'variations': advertising['variations']
            })
            if response.status_code == 403:
                access_token = action.refresh_token(account=account)
                if access_token == False:
                    action.abort_json({
                        'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                        'status': 'error',
                    }, 400)
                else:
                    access_token = access_token['access_token']
                ml_api = MercadoLibreApi(access_token=access_token)
                response = ml_api.put(f'/items/{ml_item_id}', json={
                    'variations': advertising['variations']
                })
            
            status_code = response.status_code

            if response.status_code in [200,201]:
                message = f'Alteração de preço Anúncio #{ml_item_id} - Sucesso: As alterações podem demorar para aparecer no Mercado Livre'
                update_process_item(process_item_id, response, True, action, message)
                
    except Exception as e:
        LOGGER.error(e)
        LOGGER.error(traceback.format_exc())
        #message = f'Alteração de preço Anúncio #{ml_item_id} - Sucesso: As alterações podem demorar para aparecer no Mercado Livre'
        #update_process_item(process_item_id, False, False, action, message)
    finally:
        if status_code not in [200,201]:
            credits_msg = ''
            if tool['access_type'] == AccessType.credits:
                rollback_credits_transaction(action, process_item_id, account['user_id'], tool['price'])
                credits_msg = '(crédito restituído)'
            message = f'Alteração de preço Anúncio #{ml_item_id} - Erro ao alterar preço {credits_msg}'
            update_process_item(process_item_id, response, False, action, message)
        if pool is not None:
            action.conn.close()
    return (status_code, message)
