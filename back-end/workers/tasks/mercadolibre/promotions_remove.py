import traceback
from celery.utils.log import get_task_logger
from json import dumps

from fuzzywuzzy import process
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn  
from libs.enums.access_type import AccessType      
from libs.enums.promotions import Promotions
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import get_tool, get_account, refresh_token
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits, rollback_credits_transaction


LOGGER = get_task_logger(__name__)


def promotion_remove_many(user_id: int, filter_query: str, filter_values: dict, promotion_id: int):
    action = QueueActions()
    action.conn = get_conn()

    try:
        promotion_remove_item = queue.signature('long_running:promotion_remove_item') 

        tool = get_tool(action, 'promotion-remove-item')

        query = """
            SELECT pr.external_id as id, pr.account_id, pt.key as promotion_type 
            FROM meuml.promotions pr 
            JOIN meuml.promotion_types pt ON pt.id = pr.promotion_type_id 
            JOIN meuml.accounts ac ON ac.id = pr.account_id 
            WHERE pr.id = :promotion_id 
        """
        promotion = action.fetchall(query, {'promotion_id': promotion_id})

        query = f"""
            SELECT pa.advertising_id as id, pa.promotion_id as deal_id, pa.offer_id, pa.price, pa.original_price, pa.stock_min, pa.stock_max 
            FROM meuml.advertisings ad 
            JOIN meuml.promotion_advertisings pa 
            JOIN meuml.promotions ON pr.id = pa.promotion_id
            JOIN meuml.accounts ac ON ad.account_id = ac.id 
            LEFT JOIN meuml.tagged_items ti ON ti.item_id = ad.external_id AND ti.type_id = 1 
            LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id
            {filter_query}  
            AND pr.id = :promotion_id AND ac.id = :promotion_account_id
        """
        filter_values['promotion_id'] = promotion_id
        filter_values['promotion_account_id'] = promotion['account_id']
        advertisings = action.fetchall(query, filter_values)

        if promotion and len(advertisings) > 0:
            account = get_account(action, promotion['account_id'])
            process_id = create_process(account['id'], account['user_id'], tool['id'], tool['tool_price'], len(advertisings), action)

            for advertising in advertisings:
                process_item_id = create_process_item(process_id, account['id'], advertising['id'], action)

                if tool['access_type'] == AccessType.free or tool['access_type'] == AccessType.subscription or (tool['access_type'] == AccessType.credits and use_credits(action, user_id, process_item_id, tool['price'])):
                    promotion_remove_item.delay(
                        account=account,
                        tool=tool,
                        process_item_id=process_item_id,
                        advertising_id=advertising,
                        promotion=promotion
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f"Remover Promoção #{promotion['id']}, Anúncio #{advertising['id']} - Operação não realizada (créditos insuficientes).")
    
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def promotion_remove_item(account: dict, tool: dict, process_item_id: int, advertising: dict, promotion: dict, conn = None):
    action = QueueActions()
    action.conn = get_conn() if not conn else conn

    status_code = 500
    message = ''

    try:
        if not account:
            account = get_account(action, promotion['account_id'])
        
        access_token = refresh_token(action=action, account=account)
        
        if not access_token:
            message = f"Remover Promoção #{promotion['id']}, Anúncio #{advertising['id']} - erro ao renovar token de acesso "
            status_code = 403
            update_process_item(process_item_id, None, False, action, message)
            return status_code, message
        
        params = {'promotion_type': promotion['promotion_type']}

        if promotion['promotion_type'] in ['DEAL','MARKETPLACE_CAMPAIGN','VOLUME','PRE_NEGOTIATED']:
            params['deal_id'] = advertising['deal_id']

        if promotion['promotion_type'] in ['MARKETPLACE_CAMPAIGN','VOLUME','PRE_NEGOTIATED']:
            params['offer_id'] = advertising['offer_id']

        ml_api = MercadoLibreApi(access_token=access_token['access_token'])
        response = ml_api.delete(f"/seller-promotions/items/{advertising['id']}", params=params)
        status_code = response.status_code 

        if response.status_code == 200:
            query = "DELETE FROM meuml.promotion_advertisings pa WHERE pa.promotion_id = :promotion_id AND pa.advertising_id = :advertising_id"
            action.execute(query, {'promotion_id': promotion['id'], 'advertising_id': advertising['id']})

            message = f"Remover Promoção #{promotion['id']}, Anúncio #{advertising['id']} - anúncio removido da promocão com sucesso "
            update_process_item(process_item_id, response, True, action, message)
        else:
            message = f"Remover Promoção #{promotion['id']}, Anúncio #{advertising['id']} - erro ao remover anúncio da promoção "
            update_process_item(process_item_id, response, False, action, message)

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        if status_code not in [200,201]:
            credits_msg = ''
            if tool['access_type'] == AccessType.credits:
                rollback_credits_transaction(action, process_item_id, account['user_id'], tool['price'])
                credits_msg = '(crédito restituído)'
            
            message = f"Remover Promoção #{promotion['id']}, Anúncio #{advertising['id']} - erro ao remover anúncio da promoção {credits_msg}" 
            update_process_item(process_item_id, response, False, action, message)
        
        if not conn:
            action.conn.close()

    return status_code, message