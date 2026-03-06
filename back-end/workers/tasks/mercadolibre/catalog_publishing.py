import datetime
import json
from celery.utils.log import get_task_logger
from fuzzywuzzy import fuzz, process
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import get_account, refresh_token, invalid_access_token, get_tool
from workers.loggers import create_process, create_process_item, update_process_item
from workers.tasks.mercadolibre import advertising_import_item

LOGGER = get_task_logger(__name__)
TOOL_KEY = 12
ALTER_CATALOG_TOOL_KEY = 12

def get_advertising(advertising_id, action):
    query = 'SELECT * FROM meuml.advertisings WHERE id = :advertising_id'
    advertising = action.fetchall(query, {'advertising_id': advertising_id})
    if len(advertising) > 0:
        return advertising[0]
    else:
        return None


def update_advertising(advertising, action):
    query = 'update meuml.advertisings SET variations = :variations, catalog_status = :catalog_status, eligible=:eligible WHERE id = :advertising_id'
    values = {
        'advertising_id': advertising['id'],
        'variations': json.dumps(advertising['variations']),
        'catalog_status': advertising['catalog_status'],
        'eligible': advertising['eligible']
    }
    action.execute(query, values)


def search_catalog_product_id(ml_api: MercadoLibreApi, advertising: dict, variation: dict={}):
    catalog_product_id = None
    catalog_product_name = None

    params = {
        'status': 'active',
        'site_id': advertising.get('site_id', 'MLB'),
    }
    if advertising.get('domain_id'):
        params['domain_id'] = advertising.get('domain_id')

    # Verifica se anúncio/variação possui um identificador global
    if len(variation) > 0:
        attributes = variation.get('attributes', [])
    else:
        attributes = advertising.get('attributes', [])
    
    gtin = None
    for attribute in attributes:
        if attribute.get('id') == 'GTIN':
            gtin = attribute.get('value_name')

    # Realiza a busca usando id global, se existente. Caso contrário, usa titúlo para pesquisa e atributos das variações
    if gtin:
        params['product_identifier'] = gtin
    else:
        params['q'] = advertising.get('title')
        
        for attribute in variation.get('attribute_combinations', []):
            params['q'] += f" {attribute.get('name', '')} {attribute.get('value_name', '')}"

    response = ml_api.get(f'/products/search', params=params).json()
    results = response.get('results', [])

    if len(results) > 0:
        if gtin:
            index = 0
        else:
            result_names = [result.get('name') for result in results]
            best_match = process.extractOne(params['q'], result_names, scorer=fuzz.token_sort_ratio)
            index = result_names.index(best_match[0])
        
        catalog_product_id = results[index].get('id')
        catalog_product_name = results[index].get('name')

    return catalog_product_id, catalog_product_name


def verify_eligibility(pool, ml_api: MercadoLibreApi, advertising: dict):
    advertising['eligible'] = 1 if 'catalog_listing_eligible' in advertising.get('tags',[]) else 0
    advertising_catalog_product_id = advertising.get('catalog_product_id', False)
    variations = advertising.get('variations', [])
    
    if advertising.get('catalog_listing', False):
        link_catalog_to_advertising(pool, advertising['id'], advertising.get('item_relations', []), advertising['seller_id'])

    elif advertising['eligible']:
        if len(variations) == 0:
            if advertising_catalog_product_id:
                response = ml_api.get(f'/products/{advertising_catalog_product_id}')
                if response.status_code == 200:
                    response = response.json()
                    advertising['catalog_product_name'] = response.get('name')

            else:
                advertising['catalog_product_id'], advertising['catalog_product_name'] = search_catalog_product_id(ml_api, advertising)

        else:
            for i, variation in enumerate(variations):
                if not variation.get('catalog_listing', False):
                    variation_catalog_product_id = variation.get('catalog_product_id')
                    if variation_catalog_product_id is None:
                        variation['catalog_product_id'], variation['catalog_product_name'] = search_catalog_product_id(ml_api, advertising, variation)
                        variation_catalog_product_id = variation['catalog_product_id']
                    else:
                        response = ml_api.get(f'/products/{variation_catalog_product_id}')
                        if response.status_code == 200:
                            response = response.json()
                            variation['catalog_product_name'] = response.get('name')

                    params = {'variation_id': variation.get('id')}
                    if not advertising_catalog_product_id:
                        params['catalog_product_id'] = variation_catalog_product_id

                    response = ml_api.get(f'/items/{advertising.get("id")}/catalog_listing_eligibility', params=params)

                    if response.status_code == 403:
                        response = ml_api.get(f'/items/{advertising.get("id")}/catalog_listing_eligibility', params=params).json()

                    response = response.json()
                    response_variations = response.get('variations', [])
                    
                    variation['eligible'] = 0
                    variation['catalog_listing'] = False

                    for response_variation in response_variations:
                        if response_variation['id'] == variation['id']:
                            if response_variation.get('status') == 'READY_FOR_OPTIN':
                                variation['eligible'] = 1
                            elif response_variation.get('status') == 'ALREADY_OPTED_IN':
                                variation['catalog_listing'] = True
                else:
                    variation['eligible'] = 0
                    link_catalog_to_advertising(pool, advertising['id'], advertising.get('item_relations', []), advertising['seller_id'])
                
                advertising['variations'][i] = variation

    return advertising


def catalog_publish_advertising(conn, advertising_id, process_id=None, process_item_id=None):
    action = QueueActions()
    action.conn = get_conn()

    try:
        tool = get_tool(action, 'publish-catalog')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        advertising = get_advertising(advertising_id, action)
        account_id = advertising['account_id']
        account = get_account(action=action, account_id=account_id)

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        advertising_variations  = advertising.get('variations', [])

        if process_id is None:
            total = [variation['eligible'] for variation in advertising_variations].count(1)
            total = total if total > 0 else 1
            process_id = create_process(account_id=account['id'], user_id=account['user_id'], tool_id=TOOL_KEY, tool_price=None, items_total=total, action=action) 
        
        if len(advertising_variations) == 0:
            if not process_item_id:
                process_item_id = create_process_item(process_id, account_id, advertising["external_id"], action)
            data = {
                'item_id': advertising.get('external_id'),
                'catalog_product_id': advertising.get('catalog_product_id')
            }
            response = ml_api.post(f'/items/catalog_listings', json=data)

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
                response = ml_api.post(f'/items/catalog_listings', json=data)

            if response.status_code == 200 or response.status_code == 201:
                advertising['eligible'] = 0
                advertising['catalog_status'] = 0
                update_process_item(process_item_id, response, True, action, f'Anúncio #{advertising["external_id"]} enviado ao Catálogo - publicado com sucesso')

                response_data = response.json()
                advertising_import_item.get_or_create_advertising(conn, account_id=account['id'], external_id=response_data['id'], advertising=response_data, ml_api=ml_api, action=action, single=True)
            else:
                error_cause = response.json().get('cause', [])
                ml_error_msg = ''
                if len(error_cause) > 0:
                    ml_error_msg = f"(Mercado Livre: {error_cause[0].get('message', '')})"
                update_process_item(process_item_id, response, False, action, f'Anúncio #{advertising["external_id"]} enviado ao Catálogo - falhou na publicação {ml_error_msg}')
                LOGGER.warning(response.json())

        else:
            advertising['eligible'] = 0
            advertising['catalog_status'] = 0

            for i, variation in enumerate(advertising_variations):
                if variation['eligible'] == 1:
                    process_item_id = create_process_item(process_id, account_id, str(variation['id']), action)

                    catalog_product_id = variation.get('catalog_product_id')
                    if catalog_product_id is None:
                        catalog_product_id = advertising.get('catalog_product_id')
                    
                    data = {
                        'item_id': advertising.get('external_id'),
                        'variation_id': variation.get('id'),
                        'catalog_product_id': catalog_product_id
                    }
                    response = ml_api.post(f'/items/catalog_listings', json=data)

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
                        response = ml_api.post(f'/items/catalog_listings', json=data)

                    if response.status_code == 200 or response.status_code == 201:
                        variation['catalog_listing'] = True
                        variation['eligible'] = 0
                        advertising['variations'][i] = variation
                        update_process_item(process_item_id, response, True, action, f'Anúncio #{advertising["external_id"]} enviado ao Catálogo - Variação #{str(variation["id"])} publicada com sucesso')
                    
                        response_data = response.json()
                        advertising_import_item.get_or_create_advertising(conn, account_id=account['id'], external_id=response_data['id'], advertising=response_data, ml_api=ml_api, action=action, single=True) 
                    else:
                        advertising['eligible'] = 1
                        advertising['catalog_status'] = 1

                        error_cause = response.json().get('cause', [])
                        ml_error_msg = ''
                        if len(error_cause) > 0:
                            ml_error_msg = f"(Mercado Livre: {error_cause[0].get('message', '')})"
                        update_process_item(process_item_id, response, False, action, f'Anúncio #{advertising["external_id"]} enviado ao Catálogo - Variação #{str(variation["id"])} falhou na publicação {ml_error_msg}')
                        LOGGER.warning(response.json())
        update_advertising(advertising, action)
    
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def catalog_publish_variations(conn, advertising_id, variation_ids, process_item_id=None):
    action = QueueActions()
    action.conn = get_conn()

    try:
        advertising = get_advertising(advertising_id, action)
        account_id = advertising['account_id']
        account = get_account(action=action, account_id=account_id)

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        advertising_variations  = advertising.get('variations', [])
        total = [variation['eligible'] for variation in advertising_variations if variation['id'] in variation_ids].count(1)

        if not process_item_id:
            process_id = create_process(account_id=account['id'], user_id=account['user_id'], tool_id=TOOL_KEY, tool_price=None, items_total=len(variation_ids), action=action)

        for i, variation in enumerate(advertising_variations):
            if variation['id'] in variation_ids:
                if not process_item_id:
                    process_item_id = create_process_item(process_id, account_id, str(variation['id']), action)
                
                catalog_product_id = variation.get('catalog_product_id')
                if catalog_product_id is None:
                    catalog_product_id = advertising.get('catalog_product_id')

                data = {
                    'item_id': advertising.get('external_id'),
                    'variation_id': variation.get('id'),
                    'catalog_product_id': catalog_product_id
                }
                response = ml_api.post(f'/items/catalog_listings', json=data)
                
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
                    response = ml_api.post(f'/items/catalog_listings', json=data)

                if response.status_code == 200 or response.status_code == 201:
                    variation_ids.remove(variation['id'])
                    variation['catalog_listing'] = True
                    variation['eligible'] = 0
                    advertising['variations'][i] = variation
                    update_process_item(process_item_id, response, True, action, f'Anúncio #{advertising["external_id"]} enviado ao Catálogo - Variação #{str(variation["id"])} publicada com sucesso')

                    response_data = response.json()
                    advertising_import_item.get_or_create_advertising(conn, account_id=account['id'], external_id=response_data['id'], advertising=response_data, ml_api=ml_api, action=action, single=True)
                else:
                    total -= 1
                    error_cause = response.json().get('cause', [])
                    ml_error_msg = ''
                    if len(error_cause) > 0:
                        ml_error_msg = f"(Mercado Livre: {error_cause[0].get('message', '')})"
                    update_process_item(process_item_id, response, False, action, f'Anúncio #{advertising["external_id"]} enviado ao Catálogo - Variação #{str(variation["id"])} falhou na publicação {ml_error_msg}')
                    LOGGER.warning(response.json())
                process_item_id = None

        if total == len(advertising_variations):
            advertising['eligible'] = 0
            advertising['catalog_status'] = 0
            #advertising['catalog_listing'] = True 
        update_advertising(advertising, action)
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()

def catalog_publish_all(conn, user_id, account_ids):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account_ids = account_ids.split(',')

        for account_id in account_ids:
            query = 'SELECT id, variations FROM meuml.advertisings WHERE account_id = :account_id'
            advertisings = action.fetchall(query, {'account_id': account_id})

            total = 0
            for advertising in advertisings:
                if advertising.get('eligible') == 1:
                    if len(advertising['variations']) > 0:
                        total += [variation.get('eligible') for variation in advertising['variations']].count(1)
                    else:
                        total += 1
            
            process_id = create_process(account_id=account_id, user_id=user_id, tool_id=TOOL_KEY, tool_price=None, items_total=total, action=action)

            for advertising in advertisings:
                if advertising.get('eligible') == 1:
                    catalog_publish_advertising(conn, advertising['id'], process_id)
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()

def catalog_publish_multiple_advertisings(conn, user_id, advertising_ids):
    action = QueueActions()
    action.conn = get_conn()

    try:
        advertising_ids = advertising_ids.split(',')
        
        values = {}
        for i, advertising_id in enumerate(advertising_ids):
            values['id'+str(i)] = advertising_id
        
        query = f'SELECT id, variations, account_id FROM meuml.advertisings WHERE external_id IN (:{",:".join(values.keys())})'
        values['user_id'] = user_id
        advertisings = action.fetchall(query, values)

        total_by_account = {}
        for advertising in advertisings:
            if advertising.get('eligible') == 1:
                account_id = str(advertising['account_id'])
                if len(advertising['variations']) > 0:
                    total_by_account[account_id] = total_by_account.get(account_id, 0) + [variation.get('eligible') for variation in advertising['variations']].count(1)
                else:
                    total_by_account[account_id] = total_by_account.get(account_id, 0) + 1
        
        process_ids = {}
        for key, value in total_by_account.items():
            process_ids[key] = create_process(account_id=key, user_id=user_id, tool_id=TOOL_KEY, tool_price=None, items_total=value, action=action)

        for advertising in advertisings:
            catalog_publish_advertising(conn, advertising['id'], process_ids[str(advertising['account_id'])])
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()

def catalog_create_advertising(conn, advertising):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account_id = advertising.pop('account_id')
        account = get_account(action=action, account_id=account_id)

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        catalog_product_id, advertising = search_catalog_product_id(ml_api, advertising)
        
        if catalog_product_id:
            LOGGER.warning('[Creating catalog advertising by id %s]',catalog_product_id)
            
            advertising['catalog_product_id'] = catalog_product_id
            advertising['catalog_listing'] = True
            response = ml_api.post(f'/items', json=advertising)

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
                response = ml_api.post(f'/items', json=advertising)

            if response.status_code == 200 or response.status_code == 201:
                response_data = response.json()
                advertising['id'] = advertising_import_item.get_or_create_advertising(conn, account['id'], response_data['id'], response_data, ml_api, action, single=True)
                LOGGER.warning('[Catalog ad created with id %d]', advertising['id'])
            else:
                LOGGER.error(response.json())
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()

def delete_catalog_product(pool, account_id, product_id, process_item_id=None):
    action = QueueActions()
    action.conn = get_conn()

    try:
        account = get_account(action=action, account_id=account_id)

        if process_item_id is None:
            process_id = create_process(account_id=account_id, user_id=account['user_id'], tool_id=ALTER_CATALOG_TOOL_KEY, tool_price=None, items_total=1, action=action)
            process_item_id = create_process_item(process_id, account_id, product_id, action) 

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        is_deleted = False

        status_response = ml_api.put(f'/items/{product_id}', json={
            "status": "paused"
        })

        if status_response.status_code == 403:
            access_token = action.refresh_token(account=account)
            if access_token == False:
                action.abort_json({
                    'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                    'status': 'error',
                }, 400)
            else:
                access_token = access_token['access_token']
            ml_api = MercadoLibreApi(access_token=access_token)
            status_response = ml_api.put(f'/items/{product_id}', json={
                "status": "paused"
            })

        if status_response.status_code == 200:
            delete_response = ml_api.put(f'/items/{product_id}', json={
                "deleted": "true"
            })

            if delete_response.status_code == 403:
                access_token = action.refresh_token(account=account)
                if access_token == False:
                    action.abort_json({
                        'message': f"Não foi possível renovar token de autorização do Mercado Livre.",
                        'status': 'error',
                    }, 400)
                else:
                    access_token = access_token['access_token']
                ml_api = MercadoLibreApi(access_token=access_token)
                delete_response = ml_api.put(f'/items/{product_id}', json={
                    "deleted": "true"
                })
                
            if delete_response.status_code == 200:
                is_deleted = True
                
                query = 'DELETE FROM meuml.advertisings WHERE external_id = :product_id AND account_id = :account_id'
                action.execute(query, {'product_id': product_id, 'account_id': account_id})

                update_process_item(process_item_id, delete_response, True, action,
                                f'Anúncio de Catálogo #{product_id} - Desativado e excluído com sucesso')
                
            else:
                update_process_item(process_item_id, delete_response, False, action,
                                f'Anúncio de Catálogo #{product_id} - Erro ao excluir')
        
        else:
            update_process_item(process_item_id, status_response, False, action,
                                f'Anúncio de Catálogo #{product_id} - Erro ao desativar')
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()

    return is_deleted


def catalog_replace_listing(pool, user_id, new_product_name, new_product_id, current_product_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        query = 'SELECT variations, item_relations FROM meuml.advertisings WHERE external_id=:advertising_id'
        catalog_advertising = action.fetchall(query, {'advertising_id': current_product_id})

        if len(catalog_advertising) > 0:
            catalog_advertising = catalog_advertising[0]
            advertising_id = None
            original_advertising = catalog_advertising.get('item_relations', [])

            if len(original_advertising) > 0:
                advertising_id = original_advertising[0].get('id')
                variation_id = original_advertising[0].get('variation_id')

            query = 'SELECT * FROM meuml.advertisings WHERE external_id=:advertising_id'
            advertising = action.fetchall(query, {'advertising_id': advertising_id})

            if len(advertising) > 0:
                advertising = advertising[0]
                account_id = advertising['account_id']

                process_id = create_process(account_id=account_id, user_id=user_id, tool_id=ALTER_CATALOG_TOOL_KEY, tool_price=None, items_total=1, action=action)
                process_item_id = create_process_item(process_id, account_id, current_product_id, action) 

                is_deleted = delete_catalog_product(pool, account_id, current_product_id, process_item_id)
                
                if is_deleted:
                    if variation_id:
                        variations = advertising['variations']
                        for i, variation in enumerate(variations):
                            if variation_id == variation['id']:
                                variation['catalog_product_id'] = new_product_id
                                variation['catalog_product_name'] = new_product_name
                                variations[i] = variation
                                break

                        variations = json.dumps(variations)
                        update_query = 'update meuml.advertisings SET variarions = :new_variations WHERE id=:id'
                        action.execute(update_query, {'id': advertising['id'], 'new_variations': variations})

                        catalog_publish_variations(pool, advertising['id'], [variation_id], process_item_id)

                    else:                   
                        update_query = 'update meuml.advertisings SET catalog_product_id=:product_id, catalog_product_name=:product_name WHERE id=:id'
                        action.execute(update_query, {'id': advertising['id'], 'product_id': new_product_id, 'product_name': new_product_name})

                        catalog_publish_advertising(pool, advertising['id'], process_id=process_id, process_item_id=process_item_id)    
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()

def link_catalog_to_advertising(pool, external_id, item_relations, account_id):
    action = QueueActions()
    action.conn = get_conn()

    try:
        if len(item_relations) > 0:
            catalog_advertising_id = external_id
            advertising_id = item_relations[0]['id']
            variation_id = item_relations[0]['variation_id'] if item_relations[0]['variation_id'] else 1

            query = '''
                        INSERT INTO meuml.catalog_advertisings (catalog_advertising_id, advertising_id, variation_id, account_id)
                        VALUES (:catalog, :advertising, :variation, :account)
                        ON CONFLICT (catalog_advertising_id, advertising_id, variation_id)
                            DO UPDATE SET
                                catalog_advertising_id = excluded.catalog_advertising_id,
                                advertising_id = excluded.advertising_id,
                                variation_id = excluded.variation_id
                    '''
            values = {
                'catalog': catalog_advertising_id,
                'advertising': advertising_id,
                'variation': variation_id,
                'account': account_id
            }
            action.execute(query, values)
    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()


def catalog_publish_new_advertising(account_id, advertising_id, catalog_product_id, process_item_id):
    try:
        action = QueueActions()
        action.conn = get_conn()
        
        account = get_account(action=action, account_id=account_id)
        
        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']
        ml_api = MercadoLibreApi(access_token=access_token)

        advertising = advertising_import_item.advertising_import_item(True, account_id, account['user_id'], advertising_id, process_item_id, access_token, update=True)
       
        data = {
            'item_id': advertising_id,
            'catalog_product_id': catalog_product_id
        }
        response = ml_api.post(f'/items/catalog_listings', json=data)

        if response.status_code in [200, 201]:
            advertising['eligible'] = 0
            advertising['catalog_status'] = 2
            advertising['catalog_listing'] = True
            update_process_item(process_item_id, response, True, action, f'Novo Anúncio - Anúncio #{advertising_id} publicado com sucesso em Catálogo e na lista geral.')

            response_data = response.json()
            advertising_import_item.get_or_create_advertising(True, account_id=account['id'], external_id=response_data['id'], advertising=response_data, ml_api=ml_api, action=action, single=True)
        else:
            advertising['eligible'] = 1
            advertising['catalog_status'] = 1
            update_process_item(process_item_id, response, False, action, f'Novo Anúncio - Anúncio #{advertising_id} de lista geral não publicado em Catálogo.')

        query = """
            UPDATE meuml.advertisings 
            SET catalog_status = :catalog_status, eligible=:eligible 
            WHERE external_id = :advertising_id
        """
        values = {
            'advertising_id': advertising_id,
            'catalog_status': advertising['catalog_status'],
            'eligible': advertising['eligible']
        }
        action.execute(query, values)

    except Exception as e:
        LOGGER.error(e)
    finally:
        action.conn.close()
        
