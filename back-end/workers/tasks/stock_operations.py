import traceback
from celery.utils.log import get_task_logger
from datetime import datetime, timedelta
from json import dumps, loads
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.enums.marketplace import Marketplace
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access, user_subscripted_accounts
from libs.queue.queue import app as queue
from libs.shopee_api.shopee_api import ShopeeApi
from workers.helpers import get_tool, refresh_token
from workers.loggers import create_process, create_process_item, update_process_item

LOGGER = get_task_logger(__name__)

STOCK_MANAGEMENT_ML = 14
STOCK_MANAGEMENT_SP = 15

def decrease_stock(user_id, account_id, marketplace_id, details, article=None, warehouse=None, stock_items=None, conn=None):
    action = QueueActions()
    action.conn = conn if conn else get_conn()

    try:
        tool = get_tool(action, 'article-operations')
        code, *_ = verify_tool_access(action, user_id, tool=tool) 

        if code != 200:
            return

        order_message = f"Venda de código #{str(details['sell_id'])} com {details['quantity']} itens de SKU \"{details['sku']}\", {'Conta #'+str(account_id)+', ' if account_id else ''}Plataforma {Marketplace.getNameByValue(marketplace_id)}"
        decrease_stock_mercadolibre = queue.signature('long_running:decrease_stock_mercadolibre')
        decrease_stock_mercadolibre.delay(sku=details['sku'], quantity=details['quantity'], order_message=order_message, user_id=user_id, exclude_advertising_id=(details['advertising_id'] if marketplace_id == Marketplace.MercadoLibre else None), exclude_variation_id=(details['variation_id'] if marketplace_id == Marketplace.MercadoLibre else None))
        decrease_stock_shopee = queue.signature('long_running:decrease_stock_shopee')
        decrease_stock_shopee.delay(sku=details['sku'], quantity=details['quantity'], order_message=order_message, user_id=user_id, exclude_advertising_id=(details['advertising_id'] if marketplace_id == Marketplace.Shopee else None), exclude_variation_id=(details['variation_id'] if marketplace_id == Marketplace.Shopee else None))

        if not article:       
            query = """
                SELECT ar.id, st.id as stock_id 
                FROM stock.article ar 
                JOIN stock.stock st ON st.article_id = ar.id 
                WHERE ar.user_id = :user_id AND ar.sku = :sku 
            """
            article = action.fetchone(query, {'user_id': user_id, 'sku': details['sku']})

            if not article:
                return ("Produto não encontrado", 400)

        if not warehouse:
            query = f"""
                SELECT wh.id 
                FROM stock.warehouses wh 
                LEFT JOIN stock.account_warehouse aw ON aw.warehouse_id = wh.id AND aw.account_id = :account_id AND aw.marketplace_id = :marketplace_id 
                WHERE wh.is_default OR aw.warehouse_id IS NOT NULL 
                ORDER BY wh.is_default 
                LIMIT 1
            """
            warehouse = action.fetchone(query, {'account_id': account_id, 'marketplace_id': marketplace_id})

            if not warehouse:
                return ("Armazém não encontrado", 400)
        
        if not stock_items:
            query = f"""
                SELECT si.id, si.qtd_available, si.expiration_date 
                FROM stock.stock_item si 
                WHERE si.qtd_available > 0 AND si.stock_id = :stock_id AND si.warehouse_id = :warehouse_id 
                ORDER BY si.expiration_date ASC, si.date_created ASC  
            """
            stock_items = action.fetchall(query, {'stock_id': article['stock_id'], 'warehouse_id': warehouse['id']})
            
            if not stock_items:
                return ("Produto não possui estoque disponível", 400)

        values = details
        values['article_id'] = article['id']
        values['warehouse_id'] = warehouse['id']
        values['marketplace_id'] = marketplace_id
        values['account_id'] = account_id
        values['total_available_quantity'] = sum([item['qtd_available'] for item in stock_items])

        query = """
            SELECT so.id, so.order_status
            FROM stock.stock_out so 
            WHERE so.article_id = :article_id AND so.marketplace_id = :marketplace_id AND so.sell_id = :sell_id 
        """
        stock_out = action.fetchone(query, {'article_id': article['id'], 'marketplace_id': marketplace_id, 'sell_id': details['sell_id']})
        
        has_reserved_stock = False

        if stock_out:
            stock_out_id = stock_out['id']

            if stock_out['order_status'] == 'MANUAL':
                return ("Venda já registrada manualmente no controle de estoque", 400)

            if marketplace_id != Marketplace.Shopee or stock_out['order_status'] == details['order_status']:
                return ("Venda já registrada no controle de estoque", 400)
            
            action.execute("UPDATE stock.stock_out SET date_modified = NOW(), order_status = :order_status WHERE id = :id", {'id': stock_out['id'], 'order_status': details['order_status']})
            if marketplace_id == Marketplace.Shopee and stock_out['order_status'] == 'UNPAID':
                has_reserved_stock = True
        else:
            query = """
                INSERT INTO stock.stock_out (article_id, warehouse_id, quantity, price_sell, sell_id, marketplace_id, account_id, order_status) 
                VALUES (:article_id, :warehouse_id, :quantity, :price_sell, :sell_id, :marketplace_id, :account_id, :order_status)
                RETURNING id 
            """
            stock_out_id = action.execute_insert(query, values)

        if not stock_out_id:
            return ("Erro ao registrar saída de estoque", 400)
        
        if marketplace_id == Marketplace.MercadoLibre:
            query = f"""
                UPDATE stock.stock SET 
                    date_modified = NOW(),
                    qtd_total = qtd_total - :quantity, 
                    qtd_available = qtd_available - :quantity 
                WHERE 
                    article_id = :article_id
            """
            action.execute(query, values)

            query = f"""
                UPDATE stock.stock_item SET 
                    date_modified = NOW(),
                    qtd_total = qtd_total - :quantity, 
                    qtd_available = qtd_available - :quantity
                WHERE 
                    id = :id
            """

        elif marketplace_id == Marketplace.Shopee:
            if details['order_status'] == 'UNPAID':
                query = f"""
                    UPDATE stock.stock SET 
                        date_modified = NOW(),
                        qtd_available = qtd_available - :quantity, 
                        qtd_reserved = qtd_reserved + :quantity  
                    WHERE 
                        article_id = :article_id
                """
                action.execute(query, values)

                query = f"""
                    UPDATE stock.stock_item SET 
                        date_modified = NOW(),
                        qtd_available = qtd_available - :quantity, 
                        qtd_reserved = qtd_reserved + :quantity  
                    WHERE 
                        id = :id
                """
            elif has_reserved_stock:
                query = f"""
                    UPDATE stock.stock SET 
                        date_modified = NOW(),
                        qtd_total = qtd_total - :quantity, 
                        qtd_reserved = qtd_reserved - :quantity  
                    WHERE 
                        article_id = :article_id
                """     
                action.execute(query, values)

                query = f"""
                    UPDATE stock.stock_item SET 
                        date_modified = NOW(),
                        qtd_total = qtd_total - :quantity, 
                        qtd_reserved = qtd_reserved - :quantity  
                    WHERE 
                        id = :id
                """
            else:
                query = f"""
                    UPDATE stock.stock SET 
                        date_modified = NOW(),
                        qtd_total = qtd_total - :quantity, 
                        qtd_available = qtd_available - :quantity 
                    WHERE 
                        article_id = :article_id
                """
                action.execute(query, values)

                query = f"""
                    UPDATE stock.stock_item SET 
                        date_modified = NOW(),
                        qtd_total = qtd_total - :quantity, 
                        qtd_available = qtd_available - :quantity
                    WHERE 
                        id = :id
                """

        stock_out_item_query = """
            INSERT INTO stock.stock_out_item (stock_out_id, stock_item_id, quantity)
            VALUES(:stock_out_id, :stock_item_id, :quantity)
        """ 
        quantity = details['quantity']
        for item in stock_items:
            if details['quantity'] == 0:
                break
            
            quantity = details['quantity'] if item['qtd_available'] >= details['quantity'] else item['qtd_available']
            details['quantity'] -= quantity

            action.execute(query, {'quantity': quantity, 'id': item['id']}) 
            if not has_reserved_stock:
                action.execute(stock_out_item_query, {'stock_out_id': stock_out_id, 'stock_item_id': item['id'], 'quantity': quantity}) 
        
        return (f"Saída de Estoque #{details['sell_id']} registrada com sucesso", 200)
    except:
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())
        return ("Erro ao atualizar estoque", 500)
    finally:
        if not conn:
            action.conn.close()


def decrease_stock_mercadolibre(sku: str, quantity: int, order_message: str, user_id: int, exclude_advertising_id: str = None, exclude_variation_id: int = None):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'article-operations')
        code, *_ = verify_tool_access(action, user_id, tool=tool) 

        if code != 200:
            return

        subscripted_accounts = user_subscripted_accounts(action=action, user_id=user_id, module_id=STOCK_MANAGEMENT_ML, include_professional_package=False)

        if not subscripted_accounts:
            return

        tool = get_tool(action, 'article-decrease-stock-ml')
        exclude_advertising_condition = f" AND ad.external_id != '{exclude_advertising_id}' " if exclude_advertising_id else ''
        exclude_variation_condition = f' AND va.id != {exclude_variation_id} ' if exclude_variation_id else ''
        subscripted_accounts_condition = 'AND ac.id IN (' + ','.join(str(subscripted_account_id) for subscripted_account_id in subscripted_accounts) + ')'

        query = f"""
            SELECT 
                ac.id, ac.name, ac.access_token, ac.access_token_expires_at, ac.refresh_token, ac.user_id, 
                json_agg(json_build_object(
                    'advertising_id', ad.external_id,
                    'variation_id', va.id
                )) as advertisings
            FROM meuml.accounts ac 
            JOIN meuml.advertisings ad ON ad.account_id = ac.id 
            LEFT JOIN meuml.variations va ON va.advertising_id = ad.external_id 
            WHERE 
                ac.user_id = :user_id 
                AND ac.status = 1 
                AND (ad.sku = :sku OR va.sku = :sku) 
                {exclude_advertising_condition}
                {exclude_variation_condition}
                {subscripted_accounts_condition}
                GROUP BY ac.id
        """
        advertisings_by_account = action.fetchall(query, {'user_id': user_id, 'sku': sku})

        for account in advertisings_by_account:
            advertisings = account.pop('advertisings')
            process_id = create_process(account_id=account['id'], user_id=user_id, tool_id=tool['id'], tool_price=tool['price'], items_total=len(advertisings), action=action, platform='ML')
            access_token = refresh_token(action=action, account=account)

            for advertising in advertisings:
                process_item_id = create_process_item(process_id=process_id, account_id=account['id'], ml_item_id=advertising['advertising_id'], action=action, tool_id=tool['id'], platform='ML')

                if not access_token:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Não foi possível renovar o token de acesso) [{order_message}]")
                    continue
                
                ml_api = MercadoLibreApi(access_token=access_token['access_token'])
                response = ml_api.get(f"/items/{advertising['advertising_id']}")

                if response.status_code != 200:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Erro ao recuperar estoque atual do anúncio) [{order_message}]")
                    continue
                
                current_advertising = response.json()

                if current_advertising['available_quantity'] == 0:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Anúncio já não possui estoque) [{order_message}]")
                    continue
                    
                if current_advertising['status'] != 'active':
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Anúncio não está ativo) [{order_message}]")
                    continue

                if advertising['variation_id']:
                    current_variation = None
                    variations = []
                    for variation in current_advertising['variations']:
                        if variation['id'] == advertising['variation_id']:
                            current_variation = variation
                            initial_quantity = current_variation['available_quantity']
                            final_quantity = max(0, current_variation['available_quantity']-quantity)
                            variations.append({
                                'id': current_variation['id'],
                                'available_quantity': final_quantity
                            })
                        else:
                            variations.append({'id': variation['id']})
                    
                    if current_variation is None:
                        update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Variação não encontrada) [{order_message}]")
                        continue

                    if current_variation['available_quantity'] == 0:
                        update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Anúncio já não possui estoque) [{order_message}]")
                        continue

                    response = ml_api.put(f"/items/{advertising['advertising_id']}", json={
                        'variations': variations
                    })
                else:
                    initial_quantity = current_advertising['available_quantity']
                    final_quantity = max(0, current_advertising['available_quantity']-quantity)
                    response = ml_api.put(f"/items/{advertising['advertising_id']}", json={
                        'available_quantity': final_quantity
                    })

                if response.status_code != 200:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível [{order_message}]. <Resposta MercadoLivre: {dumps(response.json())}")
                    continue

                update_process_item(process_item_id, response, True, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Estoque atualizado com sucesso de {initial_quantity} para {final_quantity} [{order_message}]")
        
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def decrease_stock_shopee(sku: str, quantity: int, order_message: str, user_id: int, exclude_advertising_id: int = None, exclude_variation_id: int = None):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'article-operations')
        code, *_ = verify_tool_access(action, user_id, tool=tool) 

        if code != 200:
            return

        subscripted_accounts = user_subscripted_accounts(action=action, user_id=user_id, module_id=STOCK_MANAGEMENT_SP, include_professional_package=False)

        if not subscripted_accounts:
            return

        tool = get_tool(action, 'article-decrease-stock-sp')
        exclude_advertising_condition = f'AND ad.id != {exclude_advertising_id}' if exclude_advertising_id else ''
        exclude_variation_condition = f'AND va.variation_id != {exclude_variation_id}' if exclude_variation_id else ''
        subscripted_accounts_condition = 'AND ac.id IN (' + ','.join(str(subscripted_account_id) for subscripted_account_id in subscripted_accounts) + ')'

        query = f"""
            SELECT 
                ac.id, ac.name, ac.access_token, ac.access_token_expires_in, ac.refresh_token, ac.refresh_token, ac.user_id, 
                json_agg(json_build_object(
                    'advertising_id', ad.id,
                    'variation_id', va.variation_id
                )) as advertisings
            FROM shopee.accounts ac 
            JOIN shopee.advertisings ad ON ad.account_id = ac.id 
            LEFT JOIN shopee.variations va ON va.advertising_id = ad.id
            WHERE 
                ac.user_id = :user_id 
                AND ac.internal_status = 1 
                AND (ad.item_sku = :sku OR va.variation_sku = :sku)
                {exclude_advertising_condition}
                {exclude_variation_condition}
                {subscripted_accounts_condition}
                GROUP BY ac.id
        """
        advertisings_by_account = action.fetchall(query, {'user_id': user_id, 'sku': sku})

        for account in advertisings_by_account:
            advertisings = account.pop('advertisings')
            process_id = create_process(account_id=account['id'], user_id=user_id, tool_id=tool['id'], tool_price=tool['price'], items_total=len(advertisings), action=action, platform='SP')
            access_token = access_token = refresh_token(action=action, account=account, platform="SP")

            for advertising in advertisings:
                process_item_id = create_process_item(process_id=process_id, account_id=account['id'], ml_item_id=advertising['advertising_id'], action=action, tool_id=tool['id'], platform='SP')

                if not access_token:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Não foi possível renovar o token de acesso) [{order_message}]")
                    continue
                
                sp_api = ShopeeApi(shop_id=account['id'])
                response = sp_api.post(path='/api/v1/item/get', version='v1', additional_params={'item_id': advertising['advertising_id']})
                response_data = loads(response.content)
            
                if response.status_code != 200 or (response_data.get('error') and len(response_data.get('error')) > 0):
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Erro ao recuperar estoque atual do anúncio) [{order_message}]")
                    continue
                
                current_advertising = response_data['item']

                if current_advertising['stock'] == 0:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Anúncio já não possui estoque) [{order_message}]")
                    continue
                    
                if current_advertising['status'] != 'NORMAL' and current_advertising['status'] != 'UNLIST':
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Anúncio não está ativo/pausado) [{order_message}]")
                    continue

                if advertising['variation_id']:
                    current_variation = None
                    for variation in current_advertising['variations']:
                        if variation['variation_id'] == advertising['variation_id']:
                            current_variation = variation
                            initial_quantity = current_variation['stock']
                            final_quantity = max(0, current_variation['stock']-quantity)
                            break
                    else:
                        update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Variação não encontrada) [{order_message}]")
                        continue

                    if current_variation['stock'] == 0:
                        update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Anúncio já não possui estoque) [{order_message}]")
                        continue

                    response = sp_api.post(path='/api/v1/items/update_variation_stock', version='v1', additional_params={
                        'item_id': advertising['advertising_id'], 
                        'variation_id': advertising['variation_id'],
                        'stock': final_quantity
                    })
                else:
                    initial_quantity = current_advertising['stock']
                    final_quantity = max(0, current_advertising['stock']-quantity)
                    response = sp_api.post(path='/api/v1/items/update_stock', version='v1', additional_params={
                        'item_id': advertising['advertising_id'],
                        'stock': final_quantity
                    })
                    
                response_data = loads(response.content)
                if response.status_code != 200 or (response_data.get('error') and len(response_data.get('error')) > 0):
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível [{order_message}]. <Resposta Shopee: {dumps(response_data)}")
                    continue

                update_process_item(process_item_id, response, True, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Estoque atualizado com sucesso de {initial_quantity} para {final_quantity} [{order_message}]")

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def increase_stock_mercadolibre(sku: str, quantity: int, increase_message: str, user_id: int):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'article-operations')
        code, *_ = verify_tool_access(action, user_id, tool=tool) 

        if code != 200:
            return

        subscripted_accounts = user_subscripted_accounts(action=action, user_id=user_id, module_id=STOCK_MANAGEMENT_ML, include_professional_package=False)

        if not subscripted_accounts:
            return

        tool = get_tool(action, 'article-increase-stock-ml')   
        subscripted_accounts_condition = 'AND ac.id IN (' + ','.join(str(subscripted_account_id) for subscripted_account_id in subscripted_accounts) + ')'

        query = f"""
            SELECT 
                ac.id, ac.name, ac.access_token, ac.access_token_expires_at, ac.refresh_token, ac.user_id, 
                json_agg(json_build_object(
                    'advertising_id', ad.external_id,
                    'variation_id', va.id
                )) as advertisings
            FROM meuml.accounts ac 
            JOIN meuml.advertisings ad ON ad.account_id = ac.id 
            LEFT JOIN meuml.variations va ON va.advertising_id = ad.external_id 
            WHERE 
                ac.user_id = :user_id
                AND ac.status = 1 
                AND (ad.sku = :sku OR va.sku = :sku) 
                {subscripted_accounts_condition} 
                GROUP BY ac.id
        """
        advertisings_by_account = action.fetchall(query, {'user_id': user_id, 'sku': sku})

        for account in advertisings_by_account:
            advertisings = account.pop('advertisings')
            process_id = create_process(account_id=account['id'], user_id=user_id, tool_id=tool['id'], tool_price=tool['price'], items_total=len(advertisings), action=action, platform='ML')
            access_token = refresh_token(action=action, account=account)

            for advertising in advertisings:
                process_item_id = create_process_item(process_id=process_id, account_id=account['id'], ml_item_id=advertising['advertising_id'], action=action, tool_id=tool['id'], platform='ML')

                if not access_token:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Não foi possível renovar o token de acesso) [{increase_message}]")
                    continue
                
                ml_api = MercadoLibreApi(access_token=access_token['access_token'])
                response = ml_api.get(f"/items/{advertising['advertising_id']}")

                if response.status_code != 200:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Erro ao recuperar estoque atual do anúncio) [{increase_message}]")
                    continue
                
                current_advertising = response.json()
                   
                if current_advertising['status'] != 'active':
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Anúncio não está ativo) [{increase_message}]")
                    continue

                if advertising['variation_id']:
                    current_variation = None
                    variations = []
                    for variation in current_advertising['variations']:
                        if variation['id'] == advertising['variation_id']:
                            current_variation = variation
                            initial_quantity = current_variation['available_quantity']
                            final_quantity = current_variation['available_quantity'] + quantity
                            variations.append({
                                'id': current_variation['id'],
                                'available_quantity': final_quantity
                            })
                        else:
                            variations.append({'id': variation['id']})
                    
                    if current_variation is None:
                        update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Variação não encontrada) [{increase_message}]")
                        continue

                    response = ml_api.put(f"/items/{advertising['advertising_id']}", json={
                        'variations': variations
                    })
                else:
                    initial_quantity = current_advertising['available_quantity']
                    final_quantity = current_advertising['available_quantity'] + quantity
                    response = ml_api.put(f"/items/{advertising['advertising_id']}", json={
                        'available_quantity': final_quantity
                    })

                if response.status_code != 200:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível [{increase_message}]. <Resposta MercadoLivre: {dumps(response.json())}")
                    continue

                update_process_item(process_item_id, response, True, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Estoque atualizado com sucesso de {initial_quantity} para {final_quantity} [{increase_message}]")
        
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def increase_stock_shopee(sku: str, quantity: int, increase_message: str, user_id: int):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'article-operations')
        code, *_ = verify_tool_access(action, user_id, tool=tool) 

        if code != 200:
            return

        subscripted_accounts = user_subscripted_accounts(action=action, user_id=user_id, module_id=STOCK_MANAGEMENT_SP, include_professional_package=False)

        if not subscripted_accounts:
            return
        
        tool = get_tool(action, 'article-increase-stock-sp')
        subscripted_accounts_condition = 'AND ac.id IN (' + ','.join(str(subscripted_account_id) for subscripted_account_id in subscripted_accounts) + ')'

        query = f"""
            SELECT 
                ac.id, ac.name, ac.access_token, ac.access_token_expires_in, ac.refresh_token, ac.refresh_token, ac.user_id, 
                json_agg(json_build_object(
                    'advertising_id', ad.id,
                    'variation_id', va.variation_id
                )) as advertisings
            FROM shopee.accounts ac 
            JOIN shopee.advertisings ad ON ad.account_id = ac.id 
            LEFT JOIN shopee.variations va ON va.advertising_id = ad.id
            WHERE 
                ac.user_id = :user_id
                AND ac.internal_status = 1 
                AND (ad.item_sku = :sku OR va.variation_sku = :sku) 
                {subscripted_accounts_condition} 
                GROUP BY ac.id
        """
        advertisings_by_account = action.fetchall(query, {'user_id': user_id, 'sku': sku})

        for account in advertisings_by_account:
            advertisings = account.pop('advertisings')
            process_id = create_process(account_id=account['id'], user_id=user_id, tool_id=tool['id'], tool_price=tool['price'], items_total=len(advertisings), action=action, platform='SP')
            access_token = access_token = refresh_token(action=action, account=account, platform="SP")

            for advertising in advertisings:
                process_item_id = create_process_item(process_id=process_id, account_id=account['id'], ml_item_id=advertising['advertising_id'], action=action, tool_id=tool['id'], platform='SP')

                if not access_token:
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Não foi possível renovar o token de acesso) [{increase_message}]")
                    continue
                
                sp_api = ShopeeApi(shop_id=account['id'])
                response = sp_api.post(path='/api/v1/item/get', version='v1', additional_params={'item_id': advertising['advertising_id']})
                response_data = loads(response.content)
            
                if response.status_code != 200 or (response_data.get('error') and len(response_data.get('error')) > 0):
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Erro ao recuperar estoque atual do anúncio) [{increase_message}]")
                    continue
                
                current_advertising = response_data['item']
                    
                if current_advertising['status'] != 'NORMAL':
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Anúncio não está ativo) [{increase_message}]")
                    continue

                if advertising['variation_id']:
                    current_variation = None
                    for variation in current_advertising['variations']:
                        if variation['variation_id'] == advertising['variation_id']:
                            current_variation = variation
                            initial_quantity = current_variation['stock']
                            final_quantity = current_variation['stock'] + quantity
                            break
                    else:
                        update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível (Variação não encontrada) [{increase_message}]")
                        continue

                    response = sp_api.post(path='/api/v1/items/update_variation_stock', version='v1', additional_params={
                        'item_id': advertising['advertising_id'], 
                        'variation_id': advertising['variation_id'],
                        'stock': final_quantity
                    })
                else:
                    initial_quantity = current_advertising['stock']
                    final_quantity = current_advertising['stock'] + quantity

                    response = sp_api.post(path='/api/v1/items/update_stock', version='v1', additional_params={
                        'item_id': advertising['advertising_id'],
                        'stock': final_quantity
                    })
                    
                response_data = loads(response.content)
                if response.status_code != 200 or (response_data.get('error') and len(response_data.get('error')) > 0):
                    update_process_item(process_item_id, response, False, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Erro ao atualizar estoque disponível [{increase_message}]. <Resposta Shopee: {dumps(response_data)}")
                    continue

                update_process_item(process_item_id, response, True, action, f"Controle de Estoque Conta #{account['id']}, Anúncio #{advertising['advertising_id']}{' Variação #'+str(advertising['variation_id']) if advertising['variation_id'] else ''} - Estoque atualizado com sucesso de {initial_quantity} para {final_quantity} [{increase_message}]")

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
