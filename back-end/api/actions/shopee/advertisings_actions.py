
import re
from libs.shopee_api.shopee_api import ShopeeApi
from flask import request
from flask_jwt_simple import jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from api.utils.check_shopee_attributes_that_are_valid_in_ml import check_shopee_attributes_that_are_valid_in_ml
from math import ceil

class ShopeeAdvertisingsActions(Actions):
    @jwt_required
    @prepare
    def advertisings(self):
        fields = ['ad.id', 'ad.account_id', 'ad.item_sku', 'ad.gtin_code', 'ad.status', 'ad.name', 'ad.description', '(ad.images)::json as images', 
            'ad.currency', 'ad.has_variation', 'ad.price', 'ad.stock', 'ad.create_time', 'ad.update_time', 'ad.weight',
            'ad.category_id', 'ad.original_price', 'ad.rating_star', 'ad.cmt_count', 'ad.sales', 'ad."views"', 'ad.likes',
            'ad.package_length', 'ad.package_width', 'ad.package_height', 'ad.days_to_ship', 'ad.size_chart', 'ad."condition"',
            'ad.discount_id', 'ad.is_2tier_item', '(ad.tenures)::json as tenures', 'ad.reserved_stock', 'ad.is_pre_order', 'ad.inflated_price', 
            'ad.inflated_original_price', 'ad.sip_item_price', 'ad.price_source', 'ad.min_variation_price', 'ad.max_variation_price', 
            'ad.min_variation_original_price', 'ad.max_variation_original_price', 'ad.tier1', 'ad.tier2', 'ad.attributes',
            'array_agg(tg.name ORDER BY tg.name) as meuml_tags', 'ad.logistics']

        query = f"""
            SELECT {",".join(fields)} 
            FROM shopee.advertisings ad 
            LEFT JOIN shopee.accounts ac ON ad.account_id = ac.id 
            LEFT JOIN meuml.tagged_items ti ON ti.item_id = ad.id::VARCHAR AND ti.type_id = 2 
            LEFT JOIN meuml.tags tg ON tg.id = ti.tag_id 
        """
        values = {'user_id': self.user['id']}

        values, query, total, *_ = self.apply_filter(request, query, group_by=" ad.id, ac.id ", platform="SP")
        query = self.order(request, fields, query)
        params, query = self.paginate(request, query)

        try:
            advertisings = self.fetchall(query, values)

        except Exception as e:
            print(query)
            print(values)
            print(e)
            self.abort_json({
                'message': f'Erro ao localizar anúncios.',
                'status': 'error',
            }, 400)

        if total == 0:
            return self.return_success('Nenhum anúncio localizado.', {})
        
        meta = self.generate_meta(params, total)

        return self.return_success(data=advertisings, meta=meta)


    def order(self, request, fields, query, default_table='ad', join_tables=[], change_default_order=None):
        fields = [field if type(re.search('"(.*)"',field)) is type(None) else re.search('"(.*)"',field).group(1) for field in fields]
        fields = [field[3:] if field[2]=='.' else field for field in fields]
        values = {}

        if 'sort_order' in request.args and request.args['sort_order'] == 'asc':
            values['sort_order'] = 'asc'
        else:
            values['sort_order'] = 'desc'

        if 'sort_name' in request.args and request.args['sort_name'] in fields:
            if values['sort_order'] == 'asc':
                query += f" ORDER BY {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
            else:
                query += f" ORDER BY ({default_table}.{request.args['sort_name']} IS NULL), {default_table}.{request.args['sort_name']} {values['sort_order']}, {default_table}.id DESC "
                
        else:
            query += f" ORDER BY ad.update_time DESC "           

        return query

    def get_advertising_detail(self):
        advertising_id = request.args.get('advertising_id', None)
        account_id = request.args.get('account_id', None)
        account_token = request.args.get('account_token', None)

        if not advertising_id:
            return self.return_success('missing arg advertising_id')

        if not account_id:
            return self.return_success('missing arg account_id')

        if not account_token:
            return self.return_success('missing arg account_token')

        sp_api = ShopeeApi(shop_id=account_id,
                               access_token=account_token)

        response = sp_api.get(
            path='/api/v2/product/get_item_base_info',
            version='v2',
            additional_params={
                'item_id_list': int(advertising_id),
                'need_tax_info': True
            }
        )

        result = response.json()

        return self.return_success(data=result)

    @prepare
    @jwt_required
    def get_advertising_variations(self):
        advertising_id = request.args.get('advertising_id', None)

        get_account_query = """
            SELECT 
                acc.*
            FROM 
                shopee.advertisings ad 
            JOIN shopee.accounts acc 
                ON acc.id = ad.account_id 
            WHERE 
                ad.id=:advertising_id
        """

        account = self.fetchone(get_account_query, {'advertising_id': advertising_id})
        access_token = account.get('access_token', None)
        account_id = account.get('id', None)

        if not advertising_id:
            return self.return_success('missing arg advertising_id')

        sp_api = ShopeeApi(shop_id=account_id, access_token=access_token)

        response = sp_api.get(
            path='/api/v2/product/get_model_list',
            version='v2',
            additional_params={'item_id': advertising_id}
        )

        result = response.json()

        return self.return_success(data=result)

    @prepare
    @jwt_required
    def calculate_replication_estimated_cost(self):
        advertising_id = request.args.get('advertising_id', None)
        ml_account_id = request.args.get('ml_account_id', None)
        ml_category_id = request.args.get('ml_category_id', None)

        if not advertising_id:
            return self.return_success('missing arg advertising_id')

        if not ml_account_id:
            return self.return_success('missing arg ml_account_id')

        if not ml_category_id:
            return self.return_success('missing arg ml_category_id')

        get_shopee_account_query = """
            SELECT 
                acc.*
            FROM 
                shopee.advertisings ad 
            JOIN shopee.accounts acc 
                ON acc.id = ad.account_id 
            WHERE 
                ad.id=:advertising_id
        """

        shopee_account = self.fetchone(get_shopee_account_query, {'advertising_id': advertising_id})
        shopee_access_token = shopee_account.get('access_token', None)
        shopee_account_id = shopee_account.get('id', None)

        sp_api = ShopeeApi(shop_id=shopee_account_id, access_token=shopee_access_token)

        variations_response = sp_api.get(
            path='/api/v2/product/get_model_list',
            version='v2',
            additional_params={'item_id': advertising_id}
        )

        variations_response = variations_response.json()
        variations_response = variations_response['response']

        tier_variations = variations_response.get('tier_variation', [])

        get_ml_account_query = """
            SELECT 
                * 
            FROM 
                meuml.accounts 
            WHERE id = :account_id;
        """

        ml_account = self.fetchone(get_ml_account_query, {'account_id': ml_account_id})
        ml_access_token = ml_account.get('access_token', None)

        ml_api = MercadoLibreApi(access_token=ml_access_token)

        total_variations = check_shopee_attributes_that_are_valid_in_ml(
            tier_variations=tier_variations, ml_api=ml_api, ml_category_id=ml_category_id
        )

        return self.return_success(data={'total_variations': total_variations})

    def get_category_variations(self):
        category_id = request.args.get('category_id', None)
        account_id = request.args.get('account_id', None)
        account_token = request.args.get('account_token', None)

        if not category_id:
            return self.return_success('missing arg category_id')

        if not account_id:
            return self.return_success('missing arg account_id')

        if not account_token:
            return self.return_success('missing arg account_token')

        sp_api = ShopeeApi(shop_id=account_id,
                               access_token=account_token)

        response = sp_api.get(
            path='/api/v2/product/get_variation_tree',
            version='v2',
            additional_params={'category_id': category_id}
        )

        result = response.json()

        return self.return_success(data=result)

    def get_category_attributes(self):
        category_id = request.args.get('category_id', None)
        account_id = request.args.get('account_id', None)
        account_token = request.args.get('account_token', None)

        if not category_id:
            return self.return_success('missing arg category_id')

        if not account_id:
            return self.return_success('missing arg account_id')

        if not account_token:
            return self.return_success('missing arg account_token')

        sp_api = ShopeeApi(shop_id=account_id,
                               access_token=account_token)

        response = sp_api.get(
            path='/api/v2/product/get_attribute_tree',
            version='v2',
            additional_params={
                'category_id_list': [category_id],
                'language': 'pt-BR'
            }
        )

        result = response.json()

        return self.return_success(data=result)

    @jwt_required
    @prepare
    def get_category_required_attributes(self):
        categories_ids = request.args.get('categories_ids', None)
        
        user_id = self.user['id']

        if not categories_ids:
            return self.return_success('missing arg categories_ids')

        fetch_all_shopee_accounts_query = """
            SELECT 
                *
            FROM 
                shopee.accounts a 
            WHERE 
                a.user_id=:user_id
            ORDER BY refresh_token_expires_in DESC;
        """

        shopee_accounts = self.fetchall(fetch_all_shopee_accounts_query, {'user_id': user_id})

        if len(shopee_accounts) == 0:
            return self.return_error("Nenhuma conta da Shopee autenticada.")

        shopee_account = shopee_accounts[0]

        account_id = shopee_account.get('id', None)
        account_token = shopee_account.get('access_token', None)

        sp_api = ShopeeApi(shop_id=account_id,
                               access_token=account_token)
        
        categories_ids = [int(category_id) for category_id in categories_ids.split(',')]
        categories_ids = list(set(categories_ids)) # uniques categories ids

        categories_ids_batch = []
        required_attributes_by_category = {}

        batches_amount = ceil(len(categories_ids) / 20)

        for i in range(batches_amount):
            categories_ids_batch = categories_ids[i * 20 : (i + 1) * 20]

            response = sp_api.get(
                path='/api/v2/product/get_attribute_tree',
                version='v2',
                additional_params={
                    'category_id_list': categories_ids_batch,
                    'language': 'pt-BR'
                }
            )

            response = response.json()
            attributes_trees_list = response.get('response', {}).get('list', [])

            for attributes_tree in attributes_trees_list:
                category_id = attributes_tree['category_id']

                attributes = attributes_tree.get('attribute_tree', [])
                required_attributes = [attr for attr in attributes if attr.get('mandatory', False)]

                required_attributes_by_category[category_id] = required_attributes

        return self.return_success(data=required_attributes_by_category)

    def get_product_certification_rule(self):
        category_id = request.args.get('category_id', None)
        account_id = request.args.get('account_id', None)
        account_token = request.args.get('account_token', None)

        if not category_id:
            return self.return_success('missing arg category_id')

        if not account_id:
            return self.return_success('missing arg account_id')

        if not account_token:
            return self.return_success('missing arg account_token')

        sp_api = ShopeeApi(shop_id=account_id,
                               access_token=account_token)

        response = sp_api.get(
            path='/api/v2/product/get_product_certification_rule',
            version='v2',
            json={
                'attribute_list': [{'attribute_id': 101040}],
            }
        )

        result = response.json()

        return self.return_success(data=result)

    def delete_shopee_item(self):
        advertising_id = request.args.get('advertising_id', None)
        account_id = request.args.get('account_id', None)
        account_token = request.args.get('account_token', None)

        if not account_id:
            return self.return_success('missing arg account_id')

        if not account_token:
            return self.return_success('missing arg account_token')

        if not advertising_id:
            return self.return_success('missing arg advertising_id')

        sp_api = ShopeeApi(shop_id=account_id,
                               access_token=account_token)

        response = sp_api.post(
            path='/api/v2/product/delete_item',
            version='v2',
            additional_params={
                'item_id': advertising_id,
            }
        )

        return self.return_success('ok')

    def get_shopee_category(self):
        language = request.args.get('language', None)
        account_id = request.args.get('account_id', None)
        account_token = request.args.get('account_token', None)

        if not account_id:
            return self.return_success('missing arg account_id')

        if not account_token:
            return self.return_success('missing arg account_token')

        if not language:
            return self.return_success('missing arg language')

        sp_api = ShopeeApi(shop_id=account_id,
                               access_token=account_token)

        response = sp_api.get(
            path='/api/v2/product/get_category',
            version='v2',
            additional_params={
                'language': language,
            }
        )

        result = response.json()

        return self.return_success(data=result)

    def get_item_list(self):
        account_id = request.args.get('account_id', None)
        account_token = request.args.get('account_token', None)
        page_size = request.args.get('page_size', 100)
        page = request.args.get('page', 1)

        if not account_id:
            return self.return_success('missing arg account_id')

        if not account_token:
            return self.return_success('missing arg account_token')

        if not page_size:
            return self.return_success('missing arg page_size')
        
        if not page:
            return self.return_success('missing arg page')

        sp_api = ShopeeApi(shop_id=account_id,
                               access_token=account_token)

        responses = []
        pagination_data = {}

        for status in ['NORMAL', 'BANNED', 'UNLIST', 'REVIEWING', 'SELLER_DELETE', 'SHOPEE_DELETE']:
            response = sp_api.get(
                path='/api/v2/product/get_item_list', version='v2',
                additional_params={
                    'offset': (page - 1) * page_size,
                    'page_size': page_size,
                    'item_status': status,
                }
            )


            result = response.json()
            response_data = result.get('response', {})
            
            data = response_data.get('item', [])
            total_count = response_data.get('total_count')
            print(f"counted {total_count} for status {status}")

            responses.extend(data)

        return self.return_success(data=responses)

    @jwt_required
    @prepare
    def get_advertisement_variations(self, advertising_id):
        query = f"SELECT * FROM shopee.variations WHERE variations.advertising_id = :advertising_id"
        values = {'advertising_id': advertising_id}
        datum = self.fetchall(query, values)

        result = {}
        for data in datum:
            tiers = data['name'].split(",")
            tier1 = tiers[0]
            tier2 = tiers[1] if len(tiers) == 2 else None
            
            if tier2:
                if tier1 not in result:
                    result[tier1] = {tier2: data}
                else:
                    result[tier1][tier2] = data
            else:
                result[tier1] = data

        return self.return_success(data=result)

    def update_shopee_advertising(self):
        advertising_id = request.args.get('advertising_id', None)
        account_id = request.args.get('account_id', None)
        account_token = request.args.get('account_token', None)

        body = request.json
        print('body - ', body)

        item_id = body['item_id']
        item_sku = body['item_sku']

        if not advertising_id:
            return self.return_success('missing arg advertising_id')

        if not account_id:
            return self.return_success('missing arg account_id')

        if not account_token:
            return self.return_success('missing arg account_token')

        sp_api = ShopeeApi(shop_id=account_id,
                               access_token=account_token)

        response = sp_api.post(
            path='/api/v2/product/update_item',
            version='v2',
            additional_params={
                'item_sku': item_sku,
                'item_id': item_id
            }
        )

        result = response.json()

        return self.return_success(data=result)
