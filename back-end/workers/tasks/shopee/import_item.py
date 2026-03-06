
import json
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.enums.marketplace import Marketplace
from libs.exceptions.exceptions import ShopeeConnectionException
from libs.shopee_api.shopee_api import ShopeeApi
from workers.loggers import  create_process_item, update_process_item
from workers.tasks.shopee.items_parsing import parse_shopee_item
from datetime import datetime

LOGGER = get_task_logger(__name__)

def shopee_import_item(tool, process_id, item_id, account_id, access_token=None, access_token_expires_at=None, single=False, conn=None):

    action = QueueActions()
    action.conn = conn if conn else get_conn()
    log_process = False if conn else True
    process_item_id = None

    try:
        if log_process:
            process_item_id = create_process_item(process_id, account_id, item_id, action, platform=Marketplace.Shopee)

        sp_api = ShopeeApi(access_token, shop_id=account_id)

        response = sp_api.get(
            path='/api/v2/product/get_item_base_info', version='v2',
            additional_params={'item_id_list': [item_id]}
        )

        data = response.json()

        if item_id == 58254202758:
            LOGGER.error('got item base info')

        if response.status_code != 200 or (data.get('error') and len(data.get('error')) > 0):
            if log_process:
                update_process_item(
                    process_item_id, False, False, action,
                    f'Anúncio #{item_id} não importado -  Erro ao sincronizar (falha ao comunicar-se com Shopee)'
                )
            return

        data = data['response']['item_list'][0]

        if data['description_type'] == 'normal':
            data['description'] = data['description']
        else:
            data['description'] = data['description_info']['extended_description']['field_list'][0]['text']

        data['shopid'] = account_id

        response_extra = sp_api.get(
            path='/api/v2/product/get_item_extra_info', version='v2',
            additional_params={'item_id_list': [item_id]}
        )

        data_extra = response_extra.json()

        if response_extra.status_code not in [200, 404] or (data_extra.get('error') and len(data_extra.get('error')) > 0):
            if log_process:
                update_process_item(
                    process_item_id, False, False, action,
                    f'Anúncio #{item_id} não importado -  Erro ao sincronizar (falha ao comunicar-se com Shopee)'
                )
            return

        data_extra = data_extra['response']['item_list'][0]
        data['rating_star'] = data_extra.get('rating_star')
        data['cmt_count'] = data_extra.get('comment_count')
        data['sales'] = data_extra.get('sale')
        data['views'] = data_extra.get('views')
        data['likes'] = data_extra.get('likes')

        data['tier1'] = None
        data['tier2'] = None
        data['price'] = None
        data['original_price'] = None
        data['stock'] = None
        data['reserved_stock'] = None
        data['currency'] = None

        if data['has_model']:
            response_variation = sp_api.get(
                path='/api/v2/product/get_model_list', version='v2',
                additional_params={'item_id': item_id}
            )

            variation_data = response_variation.json()
            
            if response_variation.status_code != 200 or (variation_data.get('error') and len(variation_data.get('error')) > 0):
                if log_process:
                    update_process_item(
                        process_item_id, False, False, action,
                        f'Anúncio #{item_id} não importado -  Erro ao sincronizar (falha ao comunicar-se com Shopee)'
                    )
                return

            variation_data = variation_data['response']

            if len(variation_data['tier_variation']) >= 1:
                data['tier1'] = variation_data['tier_variation'][0]['name']
                if len(variation_data['tier_variation']) >= 2:
                    data['tier2'] = variation_data['tier_variation'][1]['name']

            original_price = []
            seller_stock = []
            reserved_stock = []
            currency = ''
            for model in variation_data['model']:
                original_price.append(model['price_info'][0]['original_price'])
                seller_stock.append(model['stock_info_v2']['summary_info']['total_available_stock'])
                reserved_stock.append(model['stock_info_v2']['summary_info']['total_reserved_stock'])
                currency = model['price_info'][0].get('currency', 'BRL')

            data['price'] = max(original_price)
            data['original_price'] = max(original_price)
            data['stock'] = sum(seller_stock)
            data['reserved_stock'] = sum(reserved_stock)
            data['currency'] = currency
        else:
            data['price'] = data['price_info'][0]['original_price']
            data['original_price'] = data['price_info'][0]['original_price']
            data['currency'] = data['price_info'][0]['currency']
            data['stock'] = data['stock_info_v2']['summary_info']['total_available_stock']
            data['reserved_stock'] = data['stock_info_v2']['summary_info']['total_reserved_stock']

        # query_insert = f"""
        #     INSERT INTO shopee_stage.item_variations_{account_id}
        #         (account_id, item_id, external_data)
        #     VALUES (:account_id, :item_id, :external_data)
        #     ON CONFLICT (account_id, item_id)
        #         DO UPDATE SET
        #             external_data=excluded.external_data
        # """
        # values = {'account_id': account_id}

        # for variation in data.get('item',{}).get('variations', []):
        #     variation['item_id'] = item_id
        #     values['external_data'] = json.dumps(variation)
        #     values['item_id'] = variation['variation_id']
        #     action.execute(query_insert, values)

        #     if not data['min_variation_price'] or data['min_variation_price'] > variation['price']:
        #         data['min_variation_price'] = variation['price']

        #     if not data['min_variation_original_price'] or data['min_variation_original_price'] > variation['original_price']:
        #         data['min_variation_original_price'] = variation['original_price']

        #     if not data['max_variation_price'] or data['max_variation_price'] < variation['price']:
        #         data['max_variation_price'] = variation['price']

        #     if not data['max_variation_original_price'] or data['max_variation_original_price'] < variation['original_price']:
        #         data['max_variation_original_price'] = variation['original_price']

        query_insert = f"""
            INSERT INTO shopee_stage.items_{account_id}
                (account_id, item_id, external_data)
            VALUES (:account_id, :item_id, :external_data)
            ON CONFLICT (account_id, item_id)
                DO UPDATE SET
                    external_data=excluded.external_data,
                    date_created=NOW()
        """
        values = {
            'account_id': account_id,
            'item_id': item_id,
            'external_data': json.dumps(data)
        }
        action.execute(query_insert, values)

        # LOGGER.error("inserted in database")
        # LOGGER.error(datetime.now())

        # query_insert = f"""
        #     INSERT INTO shopee_stage.item_attributes_{account_id}
        #         (account_id, item_id, external_data)
        #     VALUES (:account_id, :item_id, :external_data)
        #     ON CONFLICT (account_id, item_id)
        #         DO UPDATE SET
        #             external_data=excluded.external_data
        # """
        # for attribute in data.get('item',{}).get('attributes', []):
        #     values['external_data'] = json.dumps(attribute)
        #     action.execute(query_insert, values)

        # query_insert = f"""
        #     INSERT INTO shopee_stage.item_logistics_{account_id}
        #         (account_id, item_id, external_data)
        #     VALUES (:account_id, :item_id, :external_data)
        #     ON CONFLICT (account_id, item_id)
        #         DO UPDATE SET
        #             external_data=excluded.external_data
        # """
        # for logistic in data.get('item',{}).get('logistics', []):
        #     values['external_data'] = json.dumps(logistic)
        #     action.execute(query_insert, values)

        if single:
            parse_shopee_item(account_id, item_id, action.conn)

        if log_process:
            update_process_item(process_item_id, response, True, action, f'Anúncio #{item_id} importado -  Sincronizado com sucesso')

    except ShopeeConnectionException as e:
        # LOGGER.error(e)
        LOGGER.error('error1 - importing ad from shopee')
        LOGGER.error(e)

        if log_process:
            process_item_id = create_process_item(process_id, account_id, item_id, action) if not process_item_id else process_item_id
            update_process_item(process_item_id, False, False, action, f'Anúncio #{item_id} importado -  Erro ao sincronizar ({e}).')

    except Exception as e:
        LOGGER.error('error2 - error importing ad from shopee')
        LOGGER.error(e)

    finally:
        if not conn:
            action.conn.close()
