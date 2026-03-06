from datetime import datetime
import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.access_type import AccessType      
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from workers.helpers import refresh_token, get_account, invalid_access_token, format_ml_date
from workers.loggers import update_process_item
from workers.payment_helpers import rollback_credits_transaction

LOGGER = get_task_logger(__name__)

def discount_apply_item(pool, account_id: int, tool: dict, process_item_id: int, ml_item_id: str, start_date: str, finish_date: str, buyers_discount: float, best_buyers_discount: float, conn=None):
    action = QueueActions()
    action.conn = get_conn() if not conn else conn

    account = get_account(action=action, account_id=account_id)
    status_code = None
    response = None
    error = 'Erro ao aplicar desconto'

    try:
        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)
        
        response = ml_api.put(f'/promo/item/{ml_item_id}', json={
            'best_buyers_discount_percentage': best_buyers_discount,
            'buyers_discount_percentage': buyers_discount,
            'start_date': start_date,
            'finish_date': finish_date,
            'discount_type': 'PRICE_DISCOUNT'
        })
        status_code = response.status_code
        response_data = response.json()
        additional = ''

        if status_code in [200, 201] or (status_code == 400 and response_data.get('key','') == 'error_credibility_price'):
            if status_code == 200:
                original_price = response_data.get('original_price')
                original_price_str = f"{response_data.get('original_price', 0):,.2f}".replace(',','.')
                original_price_str = original_price_str[:-3]+','+original_price_str[-2:]

                price = response_data.get('price')
                price_str = f"{response_data.get('price', 0):,.2f}".replace(',','.')
                price_str = price_str[:-3]+','+price_str[-2:]
            else:
                response = ml_api.get(f'/promo/item/{ml_item_id}')
                status_code = response.status_code
                response_data = response.json()

                if status_code == 200:
                    additional = ' (Aviso: Mercado Livre não considerou o desconto suficiente para exibir o anúncio na lista de promoções)'

                    original_price = response_data.get('list_price')
                    original_price_str = f"{response_data.get('list_price', 0):,.2f}".replace(',','.')
                    original_price_str = original_price_str[:-3]+','+original_price_str[-2:]

                    price = response_data.get('price')
                    price_str = f"{response_data.get('price', 0):,.2f}".replace(',','.')
                    price_str = price_str[:-3]+','+price_str[-2:]

        if status_code in [200, 201]:
            message = f'Anúncio #{ml_item_id} de R$ {original_price_str} por R$ {price_str} com desconto - Desconto aplicado com sucesso{additional}.'
            update_process_item(process_item_id, response_data, True, action, message)
            start_date_dt = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S")
            finish_date_dt = datetime.strptime(finish_date, "%Y-%m-%dT%H:%M:%S")
            update_advertising_price(action, ml_item_id, original_price, price, start_date_dt, finish_date_dt)
        
        else:
            errors_dict = {
                'EnabledSiteRule': 'A funcionalidade de descontos não está disponível neste país',
                'PricePercentageDeltaRule': 'O desconto para bons compradores deve ser maior que o desconto para compradores comuns',
                'ItemPriceVsMaxSalesPriceRule': 'O anúncio deve ter um mínimo de 3 vendas nos últimos 3- dias e devem estar num limiar de preço',
                'ItemMoreEqThanXSalesRule': 'O anúncio deve ter um mínimo de 3 vendas nos últimos 3- dias e devem estar num limiar de preço',
                'UserReputationRule': 'Funcionalidade disponível apenas para vendedores com reputação verde e verde claro',
                'MaximumDiscountPercentageRule': 'O desconto máximo deve ser menor que 80%',
                'ItemValidDiscountRule': 'O desconto mínimo é 5%',
                'ItemConditionRule': 'O anúncio deve ser de condição Novo',
                'ItemNotInDealRule': 'O anúncio não pode estar em "Deal/Negociação"',
                'ItemRatingRule': 'O anúncio deve ter, no mínimo, 5 reviews e a média deles deve ser >= 3',
                'ItemMinPriceRuleTask': 'O desconto só será aplicado para itens com preço maior ou igual ao estabelecido pelo Mercado Livre',
                'item_always_on_rejected': 'Anúncio rejeitado para descontos',
                'error_credibility_price': 'Desconto aplicado com sucesso (Aviso: Mercado Livre não considerou o desconto suficiente para exibir o anúncio na lista de promoções)'
            }
            error = errors_dict.get(response_data.get('error'), 'Erro ao aplicar desconto')
            error = errors_dict.get(response_data.get('key'), error)
            
            message = f'Anúncio #{ml_item_id} - {error}.'
            
    except Exception as e:
        LOGGER.error(e)
        print(e)
        return 500, "Erro interno, tente novamente"
    finally:
        if status_code != 200:
            credits_msg=''
            if tool['access_type'] == AccessType.credits:
                rollback_credits_transaction(action, process_item_id, account['user_id'], tool['price'])
                credits_msg = ' (crédito restituído)'
            update_process_item(process_item_id, response, False, action, f'Anúncio #{ml_item_id} - {error} {credits_msg}')
        if pool is not None:
            action.conn.close()
    
    return status_code, message


def discount_remove_item(pool, account_id: int, tool: dict, process_item_id: int, ml_item_id: str, conn=None):
    action = QueueActions()
    action.conn = get_conn() if not conn else conn

    account = get_account(action=action, account_id=account_id)
    status_code = None
    response = None
    error = 'Erro ao remover desconto'

    try:
        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)
        
        response = ml_api.delete(f'/promo/item/{ml_item_id}')
        status_code = response.status_code

        if response.status_code == 200:
            message = f'Anúncio #{ml_item_id} - Desconto removido com sucesso.'
            update_process_item(process_item_id, True, True, action, message)
            delete_advertising_discount(action, ml_item_id, None)
        else:
            data = response.json()
            errors_dict = {
                'promo_item_not_found': 'Esse anúncio não possui descontos registrados no Mercado Livre'
            }
            error = errors_dict.get(data.get('key'), 'Erro ao remover desconto')           
            message = f'Anúncio #{ml_item_id} - {error}.'

    except Exception as e:
        LOGGER.error(e)
        return 500, 'Erro interno, tente novamente'
    finally:
        if status_code != 200:
            credits_msg=''
            if tool['access_type'] == AccessType.credits:
                rollback_credits_transaction(action, process_item_id, account['user_id'], tool['price'])
                credits_msg = '(crédito restituído)'
            update_process_item(process_item_id, response, False, action, f'Anúncio #{ml_item_id} - {error} {credits_msg}')
        if pool is not None:
            action.conn.close()

    return status_code, message


def update_advertising_price(action, advertising_id, original_price, price, start_date, finish_date):
    query = 'insert into meuml.advertising_discounts(external_id, start_date, finish_date, original_price, price) values (:advertising_id, :start_date, :finish_date, :original_price, :price)'
    values = {
        'advertising_id': advertising_id,
        'original_price': original_price,
        'price': price,
        'start_date': start_date,
        'finish_date': finish_date,
    }
    action.execute(query, values)
    query = 'UPDATE meuml.advertisings SET original_price = :original_price, price = :price WHERE external_id = :advertising_id'
    values = {
        'advertising_id': advertising_id,
        'original_price': original_price,
        'price': price,
    }
    action.execute(query, values)

def delete_advertising_discount(action, advertising_id, original_price):
    price = action.fetchone('SELECT original_price FROM meuml.advertising_discounts WHERE external_id = :advertising_id', {'advertising_id': advertising_id})
    query = 'DELETE FROM meuml.advertising_discounts where external_id = :advertising_id'
    values = {
        'advertising_id':advertising_id,
    }
    action.execute(query, values)
    query = 'UPDATE meuml.advertisings SET original_price = :original_price, price = :price  WHERE external_id = :advertising_id'
    values = {
        'advertising_id':advertising_id,
        'original_price':original_price,
        'price':price['original_price']
    }
    action.execute(query, values)
