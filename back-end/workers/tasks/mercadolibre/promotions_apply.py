import traceback
from celery.utils.log import get_task_logger
from decimal import *
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


def promotion_apply_many(user_id: int, filter_query: str, filter_values: dict, promotion_id: int, options: dict):
    action = QueueActions()
    action.conn = get_conn()

    try:
        promotion_apply_item = queue.signature('long_running:promotion_apply_item') 

        tool = get_tool(action, 'promotion-apply-item')

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
                    promotion_apply_item.delay(
                        account=account,
                        tool=tool,
                        process_item_id=process_item_id,
                        advertising=advertising,
                        promotion=promotion
                    )
                else:
                    update_process_item(process_item_id, None, False, action, f"Aplicar Promoção #{promotion['id']}, Anúncio #{advertising['id']} - Operação não realizada (créditos insuficientes).")

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def promotion_apply_item(account: dict, tool: dict, process_item_id: int, advertising: dict, promotion: dict, options: dict, conn = None):
    action = QueueActions()
    action.conn = get_conn() if not conn else conn
    
    status_code = 500
    message = ''

    try:
        if not account:
            account = get_account(action, promotion['account_id'])

        access_token = refresh_token(action=action, account=account)
        
        if not access_token:
            message =  f"Aplicar Promoção #{promotion['id']}, Anúncio #{advertising['id']} - erro ao renovar token de acesso"
            status_code = 403
            update_process_item(process_item_id, None, False, action, message)
            return status_code, message

        params = {
            'promotion_type': promotion['promotion_type'],
            'deal_id': advertising['deal_id']
        }

        if promotion['promotion_type'] in ['PRE_NEGOTIATED']:
            params['offer_id'] = advertising['offer_id']

        if promotion['promotion_type'] in ['DEAL']:
            params['regular_price'] = advertising['original_price']

        if promotion['promotion_type'] in ['DOD', 'LIGHTNING']:
            params['original_price'] = advertising['original_price']

        if promotion['promotion_type'] in ['DEAL', 'DOD', 'LIGHTNING']:
            getcontext().prec = 28

            if options["is_discount_value_percentage"]:
                new_price = Decimal(float(advertising['original_price']) * (options['discount_value'] / 100.0))
            else:
                new_price = Decimal(float(advertising['original_price']) + options['discount_value'])

            new_price = str(new_price.quantize(Decimal('1.000'), rounding=ROUND_UP))[:-1]
            params['deal_price'] = float(new_price)

        if promotion['promotion_type'] in ['LIGHTNING']:
            if options.get('stock_range'):
                params['stock'] = advertising['stock_max'] if options['stock_range'] == 'max' else advertising['stock_min']
            else: 
                params['stock'] = options.get('stock')

        ml_api = MercadoLibreApi(access_token=access_token['access_token'])
        response = ml_api.post(f"/seller-promotions/items/{advertising['id']}", params=params)
        status_code = response.status_code

        if response.status_code in [200, 201]:
            message = f"Aplicar Promoção #{promotion['id']}, Anúncio #{advertising['id']} - promocão aplicada ao anúncio com sucesso "
            update_process_item(process_item_id, response, True, action, message)
        else:
            message = f"Aplicar Promoção #{promotion['id']}, Anúncio #{advertising['id']} - erro ao aplicar promoção ao anúncio "
            update_process_item(process_item_id, response, False, action, message)
  
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        if status_code not in [200,201]:
            credits_msg = ''
            if tool['access_type'] == AccessType.credits:
                rollback_credits_transaction(action, process_item_id, account['user_id'], tool['price'])
                credits_msg = '(crédito restituído)'
            
            message = f"Aplicar Promoção #{promotion['id']}, Anúncio #{advertising['id']} - erro ao aplicar promoção ao anúncio {credits_msg}" 
            update_process_item(process_item_id, response, False, action, message)
        
        if not conn:
            action.conn.close()

    return status_code, message
