import json
import math
from time import sleep
import traceback
from celery.utils.log import get_task_logger
from decimal import *
import requests
from PIL import ImageFile
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn
from libs.enums.access_type import AccessType
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from workers.helpers import get_plain_text, get_accounts
from workers.loggers import create_process_item, update_process_item
from workers.payment_helpers import use_credits, rollback_credits_transaction
from workers.tasks.mercadolibre.advertising_import_item import advertising_import_item
from flask import Response
from datetime import datetime
from libs.shopee_api.shopee_api import ShopeeApi
from api.utils.remove_ml_duplicated_attribute_combinations import remove_ml_duplicated_attribute_combinations


LOGGER = get_task_logger(__name__)

def advertising_duplicate_item(
    tool: dict,
    operation_type: str,
    processes: dict,
    accounts: dict,
    advertising: dict,
    mass_override: dict,
    account_advertisings: dict,
    allow_duplicated_title: bool,
    allow_duplicated_account: bool,
    allow_copying_warranty: bool,
    owner_account_id: int = None,
    owner_access_token: str = None,
    replication_mode: str = 'standard',
    selected_official_store = {} # {<account_id>: <official_store_id>}
):  
    try:
        action = QueueActions()
        action.conn = get_conn()

        status_code = None

        # Se própria conta, utiliza token de acesso
        if owner_access_token:
            ml_api = MercadoLibreApi(access_token=owner_access_token)
        else:
            first_account_id, first_account = list(accounts.items())[0]
            ml_api = MercadoLibreApi(access_token=first_account["access_token"])

        # Recupera anúncio original
        response = ml_api.get(
            f"/items/{advertising['id']}", params={"include_attributes": "all"}
        )
        result = response.json()

        success = True

        result_status = result.get('status', None)
        result_message = result.get('message', None)
        failed_to_read_ad = not result_status or result_message == 'user is not active'

        if (failed_to_read_ad and replication_mode == 'standard'):
            for account_id, account in accounts.items():
                process_item_id = create_process_item(
                    processes[str(account["id"])],
                    account["id"],
                    advertising["id"],
                    action,
                )
                update_process_item(
                    process_item_id,
                    None,
                    False,
                    action,
                    f'Replicação de Anúncio #{advertising["id"]} - Operação cancelada (não foi possível acessar os dados do anúncio original) - Tente novamente usando o modo de replicação Forçado',
                )
            return

        if failed_to_read_ad and replication_mode == 'forced':
            get_ad_query = "SELECT * FROM meuml.advertisings WHERE external_id = :advertising_id;"
            ad_detail_result = action.fetchall(
                get_ad_query, {"advertising_id": advertising["id"]}
            )

            result = ad_detail_result[0]
            result['id'] = result['external_id']
            result['price'] = float(result['price'])

        # ad is from external account
        if result_status == 403 and result_message == 'Access to the requested resource is forbidden':
            response = ml_api.get('/items', params={"include_attributes": "all", 'ids': advertising['id']})
            response_json = response.json()

            result = response_json[0]['body']
        
        # remove invalid fields from ad and override
        result.pop('thumbnail_id', '')
        result.pop("base_price", 0)
        result.pop("last_updated", datetime.now())
        result.pop("initial_quantity", 1)
        result.pop("date_created", '')
        result.pop("health", '')
        result.pop("international_delivery_mode", '')
        result.pop("seller_address", '')
        result.pop("stop_time", '')
        result.pop("sold_quantity", '')
        result.pop("expiration_time", '')
        result.pop("end_time", '')
        result.pop("geolocation", '')

        override = advertising.get("override", {})
        if override:
            override.pop('thumbnail_id', '')
            override.pop("base_price", 0)
            override.pop("last_updated", datetime.now())
            override.pop("initial_quantity", 1)
            override.pop("date_created", '')
            override.pop("health", '')
            override.pop("international_delivery_mode", '')
            override.pop("seller_address", '')
            override.pop("stop_time", '')
            override.pop("sold_quantity", '')
            override.pop("expiration_time", '')
            override.pop("end_time", '')
            override.pop("geolocation", '')

        account_to_check_id = list(accounts.items())[0][0]
        account_has_user_product = 'user_product_seller' in accounts[account_to_check_id]['account_tags']
        
        should_turn_item_into_user_product = False

        if account_has_user_product:
            should_turn_item_into_user_product = True

        if response.status_code != 200:
            success = False

        response_description = ml_api.get(f"/items/{advertising['id']}/description")

        if response_description.status_code not in [200, 404]:
            success = False
        else:
            result["description"] = response_description.json()

        text = (
            result.get("description", {}).get("plain_text")
            if isinstance(result.get("description"), dict)
            else ""
        )

        response_price = ml_api.get(
            f"/items/{result['id']}/sale_price?context=channel_marketplace"
        )

        if response_price.status_code not in [200, 404]:
            success = False
        else:
            response_price_data = response_price.json()
            result["price"] = response_price_data.get("amount")

        # Se anúncio, descrição ou preço falhou, interrompe replicação
        if not success:
            for account_id, account in accounts.items():
                process_item_id = create_process_item(
                    processes[str(account["id"])],
                    account["id"],
                    advertising["id"],
                    action,
                )
                update_process_item(
                    process_item_id,
                    None,
                    False,
                    action,
                    f'Replicação de Anúncio #{advertising["id"]} - Operação cancelada (erro ao recuperar anúncio a ser duplicado).',
                )
            return

        # Cria JSON base do novo anúncio
        new_advertising = {
            "site_id": result.get("site_id", 'MLB'),
            "category_id": result["category_id"],
            "price": result["price"],
            'title': result["title"],
            "currency_id": "BRL",
            "available_quantity": result.get("available_quantity", 1),
            "buying_mode": result["buying_mode"],
            "condition": result["condition"],
            "listing_type_id": result["listing_type_id"],
            "status": result["status"],
            "shipping": {
                "mode": result.get("shipping", {}).get("mode"),
                "free_shipping": result.get("shipping", {}).get("free_shipping"),
            },
            "video_id": result.get("video_id"),
        }

        # Caso token de acesso, copia SKU
        if result.get("seller_custom_field"):
            new_advertising["seller_custom_field"] = result["seller_custom_field"]

        # Se é catálogo, cria em catálogo
        if result.get("catalog_product_id") and result.get("catalog_listing"):
            new_advertising["catalog_product_id"] = result["catalog_product_id"]
            new_advertising["catalog_listing"] = True

        # Utiliza apenas ids das imagens originais
        new_advertising["pictures"] = []
        for picture in result.get("pictures", []):
            new_advertising["pictures"].append({"id": picture.get("id")})

        # Copia variações mantendo apenas campos obrigatórios. Se original é catálogo, exclui publicação em catálogo
        if len(result.get("variations", [])) > 0:
            new_advertising["variations"] = []
            for variation in result["variations"]:
                variation.pop("id", None)
                variation.pop("catalog_product_id", None)
                variation.pop("catalog_listing", None)
                variation.pop("sold_quantity", None)
                variation.pop("user_product_id", None)

                variation["available_quantity"] = variation.get("available_quantity", 1)

                if len(variation.get("attributes", [])) > 0:
                    attributes = []

                    # a maioria dos atributos não permite receber um value_id: null, exceto esses listados abaixo.
                    # Essa lista pode continuar mudando
                    attributes_that_accept_value_id_null = ['SIZE_GRID_ROW_ID', 'GTIN', 'SELLER_SKU']

                    for attribute in variation.get("attributes", []):
                        if attribute.get('value_id', None) is None and attribute['id'] not in attributes_that_accept_value_id_null:
                            continue

                        attributes.append(
                            {
                                "id": attribute.get("id"),
                                "name": attribute.get("name"),
                                "value_id": attribute.get("value_id"),
                                "value_name": attribute.get("value_name"),
                            }
                        )
                    variation["attributes"] = attributes

                if len(variation.get("attribute_combinations", [])) > 0:
                    attributes = []
                    for attribute in variation.get("attribute_combinations", []):
                        if attribute['id'] == 'VEHICLE_PARTS_POSITION' and attribute['value_id'] is None:
                            continue

                        attributes.append(
                            {
                                "id": attribute.get("id"),
                                "name": attribute.get("name"),
                                "value_id": attribute.get("value_id"),
                                "value_name": attribute.get("value_name"),
                            }
                        )
                    variation["attribute_combinations"] = attributes
                    new_advertising["variations"].append(variation)

            new_advertising.pop("catalog_product_id", None)
            new_advertising.pop("catalog_listing", None)

        # Se exitem dados alterados, edita new_advertising
        if advertising.get("override") or mass_override:
            new_advertising = edit_values(
                new_advertising, advertising.get("override"), mass_override
            )

        # Utiliza apenas campos obrigatórios dos atributos
        get_only_required_attributes(operation_type, advertising, new_advertising, result)

        # Quando ME2, envia sem modo (me2 automático pelo ML)
        if new_advertising.get("shipping", {}).get("mode") == "me2":
            new_advertising["shipping"].pop("mode", None)

        # Se é proprio anúncio, permite copiar garantia
        sale_terms = result.get('sale_terms', [])

        new_advertising["sale_terms"] = []
        has_manufacturing_time = False

        if sale_terms:
            for sale_term in sale_terms:
                if sale_term["id"] not in [
                    "WARRANTY_TYPE",
                    "WARRANTY_TIME",
                    "MANUFACTURING_TIME",
                    "INSTALLMENTS_CAMPAIGN",
                    "PURCHASE_MAX_QUANTITY",
                    "ALL_METHODS_REBATE_PRICE"
                ]:
                    new_advertising["sale_terms"].append(sale_term)

                elif sale_term["id"] == "MANUFACTURING_TIME":
                    has_manufacturing_time = True

                    if str(sale_term["value_name"]) != "0":
                        sale_terms_struct = sale_term.get('value_struct', {})
                        time_amount = sale_terms_struct.get('number', None)
                        time_unit = sale_terms_struct.get('unit', None)

                        manufacturing_time = f"{time_amount} {time_unit}"

                        if not time_amount or not time_unit:
                            manufacturing_time = sale_terms_struct.get('value_name')

                        new_advertising["sale_terms"].append(
                            {
                                "id": "MANUFACTURING_TIME",
                                "value_name": manufacturing_time,
                            }
                        )

                elif not allow_copying_warranty and sale_term['id'] not in ["INSTALLMENTS_CAMPAIGN", "PURCHASE_MAX_QUANTITY"]:
                    new_advertising["sale_terms"].append(sale_term)

        for sale_term in sale_terms:
            if allow_copying_warranty and sale_term["id"] in [
                "WARRANTY_TYPE",
                "WARRANTY_TIME",
            ]:
                new_advertising["sale_terms"].append(
                    {
                        "id": sale_term.get("id"),
                        "value_name": sale_term.get("value_name"),
                    }
                )
            
            if (
                owner_access_token is not None
                and sale_term["id"] == "MANUFACTURING_TIME"
                and not has_manufacturing_time
            ):
                sale_terms_struct = sale_term.get('value_struct', {})
                time_amount = sale_terms_struct.get('number', None)
                time_unit = sale_terms_struct.get('unit', None)

                manufacturing_time = f"{time_amount} {time_unit}"

                if not time_amount or not time_unit:
                    manufacturing_time = sale_terms_struct.get('value_name')

                new_advertising["sale_terms"].append(
                    {"id": "MANUFACTURING_TIME", "value_name": manufacturing_time}
                )

        new_ad_manufacturing_time = next((item for item in new_advertising['sale_terms'] if item['id'] == 'MANUFACTURING_TIME'), None)
        
        override_sale_terms = mass_override.get('sale_terms', [])
        override_manufacturing_time = next((item for item in override_sale_terms if item['id'] == 'MANUFACTURING_TIME'), None)

        if override_manufacturing_time:
            if new_ad_manufacturing_time:
                new_ad_manufacturing_time['value_name'] = f"{override_manufacturing_time['value_name']} dias"
            else:
                new_advertising['sale_terms'].append(
                    { "id": "MANUFACTURING_TIME", "value_name": f"{override_manufacturing_time['value_name']} dias" }
                )

        # Confirma que descrição é texto-puro
        if (
            mass_override
            and isinstance(mass_override, dict)
            and mass_override.get("description")
        ):
            text = mass_override["description"].get("plain_text")
        if (
            advertising.get("override")
            and isinstance(advertising["override"], dict)
            and advertising["override"].get("description")
        ):
            text = advertising["override"]["description"].get("plain_text")

        plain_text = get_plain_text(text) if text else None
        description = {"plain_text": plain_text}

        # validations
        query = """ 
            SELECT item_conditions, shipping_modes, minimum_price::float, maximum_price::float, max_title_length::integer,
                max_description_length::integer, max_pictures_per_item::integer, max_pictures_per_item_var::integer, fragile
            FROM meuml.ml_categories
            WHERE external_id = :id
        """
        validations = action.fetchone(query, {"id": new_advertising.get("category_id")})

        success = True
        errors = []
        if validations:
            if (
                validations["item_conditions"]
                and new_advertising["condition"] not in validations["item_conditions"]
            ):
                success = False
                errors.append(f"condição {new_advertising['condition']} não aceita")

            if (
                validations["minimum_price"]
                and new_advertising["price"] < validations["minimum_price"]
            ):
                success = False
                errors.append(
                    f"preço {new_advertising['price']} está abaixo do mínimo exigido"
                )

            if (
                validations["maximum_price"]
                and new_advertising["price"] < validations["maximum_price"]
            ):
                success = False
                errors.append(
                    f"preço {new_advertising['price']} está acima do máximo exigido"
                )

            if not success:
                for account_id, account in accounts.items():
                    process_item_id = create_process_item(
                        processes[str(account["id"])],
                        account["id"],
                        advertising["id"],
                        action,
                    )
                    message = (
                        f"Erro de validação da categoria {new_advertising.get('category_id')}: "
                        + ", ".join(errors)
                    )
                    update_process_item(
                        process_item_id,
                        None,
                        False,
                        action,
                        f'Replicação de Anúncio #{result["id"]} - Operação cancelada ({message}).',
                    )
                return

            if (
                validations["max_title_length"]
                and new_advertising.get("title", None)
                and len(new_advertising.get("title", '')) > validations["max_title_length"]
            ):
                new_advertising["title"] = new_advertising["title"][
                    : validations["max_title_length"]
                ]

            if (
                validations["max_description_length"]
                and isinstance(description, dict)
                and isinstance(description.get("plain_text"), str)
                and len(description["plain_text"])
                > validations["max_description_length"]
            ):
                description["plain_text"] = description["plain_text"][
                    : validations["max_description_length"]
                ]

            if (
                validations["max_pictures_per_item"]
                and len(new_advertising["pictures"])
                > validations["max_pictures_per_item"]
            ):
                new_advertising["pictures"] = new_advertising["pictures"][
                    : validations["max_pictures_per_item"]
                ]

            if (
                validations["max_pictures_per_item_var"]
                and new_advertising.get("variations")
                and len(new_advertising["variations"]) > 0
            ):
                for i, variation in enumerate(new_advertising["variations"]):
                    if (
                        variation["picture_ids"]
                        and len(variation["picture_ids"])
                        > validations["max_pictures_per_item_var"]
                    ):
                        new_advertising["variations"][i]["picture_ids"] = variation[
                            "picture_ids"
                        ][: validations["max_pictures_per_item_var"]]

        if not new_advertising.get("catalog_listing"):
            new_advertising.pop("catalog_product_id", None)

        # Replica anúncio em cada conta selecionada
        seller_id = result.get("seller_id")
        for account_id, account in accounts.items():
            process_item_id = create_process_item(
                processes[str(account["id"])], account["id"], advertising["id"], action
            )

            if (allow_duplicated_account or seller_id != account["id"]) and (
                allow_duplicated_title
                or new_advertising.get("title")
                not in account_advertisings[str(account["id"])]
            ):
                if (
                    tool["access_type"] == AccessType.free
                    or tool["access_type"] == AccessType.subscription
                    or (
                        tool["access_type"] == AccessType.credits
                        # and use_credits(
                        #     action, account["user_id"], process_item_id, tool["price"]
                        # )
                    )
                ):
                    # new_advertising.pop("official_store_id", None)

                    # if account.get("official_store_id"):
                    #     new_advertising["official_store_id"] = account[
                    #         "official_store_id"
                    #     ]

                    ml_api_copy = MercadoLibreApi(access_token=account["access_token"])

                    # Tabela de Medidas
                    chart_success, chart_copy_response = chart(
                        operation_type,
                        ml_api,
                        result,
                        ml_api_copy,
                        account,
                        new_advertising,
                    )

                    if not chart_success:
                        response_data = chart_copy_response.json()

                        response_status = response_data.get('status')

                        if response_status == 403:
                            fail_duplication(
                                action,
                                account["user_id"],
                                process_item_id,
                                tool,
                                result["id"],
                                result.get("title", ''),
                                chart_copy_response,
                                tool_usage_amount=1,
                                custom_message="Selecione uma guia de tamanhos e tente replicar o anuncio novamente"
                            )

                            return 

                    all_advertisings = [new_advertising]

                    if should_turn_item_into_user_product:
                        formatted_items = turn_item_into_user_product(new_advertising=new_advertising, original_ad_id=result['id'])
                        all_advertisings = formatted_items

                    current_process_id = None
                    for advertising_to_create in all_advertisings:
                        if (
                            tool["access_type"] == AccessType.credits
                            and use_credits(
                                action, account["user_id"], process_item_id, tool['price']
                            )
                        ):
                            if not current_process_id:
                                current_process_id = process_item_id
                            else:
                                current_process_id = create_process_item(
                                    processes[str(account["id"])], account["id"], advertising["id"], action
                                )

                            ignore_gtin_if_necessary(ml_api=ml_api, original_ad=result, new_advertising=advertising_to_create)

                            official_store_id = selected_official_store.get(str(account['id']), None)
                            advertising_to_create['official_store_id'] = official_store_id

                            if result['id'] == 'MLB3172054426':
                                LOGGER.error('creating add - ')
                                LOGGER.error(advertising_to_create)

                            response = ml_api_copy.post("/items", json=advertising_to_create)
                            status_code = response.status_code
                            response_data = response.json()
                            
                            if not chart_success:
                                response = chart_copy_response


                            if status_code != 201:
                                fail_duplication(
                                    action,
                                    account["user_id"],
                                    current_process_id,
                                    tool,
                                    result["id"],
                                    result.get("title", ''),
                                    response,
                                )
                            else:
                                try:
                                    replicate_compatibilities(ml_api_copy, ml_api, advertising['id'], response_data['id'], account['id'])
                                except Exception as exc:
                                    LOGGER.error('overall error on replicate_compatibilities')
                                    LOGGER.error(json.dumps(exc))

                                advertising_import_item(
                                    True,
                                    account["id"],
                                    account["user_id"],
                                    response_data["id"],
                                    current_process_id,
                                    account["access_token"],
                                    update=True,
                                )

                                permalink = response_data["permalink"]
                                original_permalink = permalink.split("-")
                                original_permalink[1] = result["id"][3:]
                                original_permalink = "-".join(original_permalink)

                                tag1 = f"$[{original_permalink}]${{{result['id']}}}"
                                tag2 = f"$[{permalink}]${{{response_data['id']}}}"

                                description_msg = ""
                                if description.get("plain_text"):
                                    response_description = ml_api_copy.post(
                                        f'/items/{response_data["id"]}/description',
                                        json=description,
                                    )

                                    if response_description.status_code not in [200, 201]:
                                        description_error_data = response_description.json()
                                        description_msg = f"Erro ao inserir descrição: <Resposta Mercado Livre: {json.dumps(description_error_data)}>"

                                if advertising_to_create["status"] == "active":
                                    update_process_item(
                                        current_process_id,
                                        response,
                                        True,
                                        action,
                                        f'Replicação de Anúncio {tag1} -> {tag2}: {result["title"]} - anúncio replicado com sucesso. {description_msg}',
                                    )

                                else:
                                    response = ml_api_copy.put(
                                        f'/items/{response_data["id"]}',
                                        json={
                                            "status": advertising_to_create["status"],
                                        },
                                    )
                                    if response.status_code == 200:
                                        status_pt = {
                                            "paused": "pausado",
                                            "closed": "finalizado",
                                            "under_review": "em revisão",
                                        }
                                        status = (
                                            status_pt[advertising_to_create["status"]]
                                            if advertising_to_create["status"] in status_pt
                                            else advertising_to_create["status"]
                                        )
                                        update_process_item(
                                            current_process_id,
                                            response,
                                            True,
                                            action,
                                            f'Replicação de Anúncio {tag1} -> {tag2}: {result["title"]} - anúncio replicado com sucesso no status {status}.  {description_msg}',
                                        )
                                    else:
                                        update_process_item(
                                            current_process_id,
                                            response,
                                            True,
                                            action,
                                            f'Replicação de Anúncio {tag1} -> {tag2}: {result["title"]} - anúncio replicado com sucesso, porém o status está como ativo, por favor revise o status do anúncio <Resposta Mercado Livre: active -> {new_advertising["status"]}, HTTP {response.status_code}>.  {description_msg}',
                                        )
                            
                            sleep(1)
                        else:
                            update_process_item(
                                process_item_id,
                                None,
                                False,
                                action,
                                f'Replicação de Anúncio #{result["id"]}: {result["title"]} - Operação não realizada (créditos insuficientes).',
                            )
                        

                else:
                    update_process_item(
                        process_item_id,
                        None,
                        False,
                        action,
                        f'Replicação de Anúncio #{result["id"]}: {result["title"]} - Operação não realizada (créditos insuficientes).',
                    )

            elif (not allow_duplicated_account and seller_id == account["id"]) and (
                not allow_duplicated_title
                and new_advertising["title"] in account_advertisings[str(account["id"])]
            ):
                update_process_item(
                    process_item_id,
                    None,
                    False,
                    action,
                    f'Replicação de Anúncio #{result["id"]}: {result["title"]} - Operação não realizada (replicação de anúncio da própria conta e título repetido).',
                )

            elif not allow_duplicated_account and seller_id == account["id"]:
                update_process_item(
                    process_item_id,
                    None,
                    False,
                    action,
                    f'Replicação de Anúncio #{result["id"]}: {result["title"]} - Operação não realizada (replicação de anúncio da própria conta).',
                )

            else:
                update_process_item(
                    process_item_id,
                    None,
                    False,
                    action,
                    f'Replicação de Anúncio #{result["id"]}: {result["title"]} - Operação não realizada (anúncio com título repetido).',
                )
    except Exception as e:
        LOGGER.error(e)
        for account_id, account in accounts.items():
            process_item_id = create_process_item(
                processes[str(account["id"])], account["id"], advertising["id"], action
            )
            update_process_item(
                process_item_id,
                None,
                False,
                action,
                f'Replicação de Anúncio #{advertising["id"]} - Operação cancelada.',
            )
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())
    finally:
        action.conn.close()

def advertising_replicate_shopee_item(
    tool: dict, processes: dict, accounts: dict, advertising: dict
):
    try:
        action = QueueActions()
        action.conn = get_conn()

        has_variations = (
            True
            if advertising.get("variations") and len(advertising["variations"]) > 0
            else False
        )

        # Das duas uma: ou coloca um " BR" no final do Tamanho preenchido pelo usuário,
        # ou então ignora o tamanho informado pelo usuário e pega o tamanho provindo da tabela de medidas escolhida por ele
        ad_attributes = advertising.get('attributes', [])
        ad_has_size_grid = next((attribute for attribute in ad_attributes if attribute['id'] == 'SIZE_GRID_ID'), None)

        correct_size = None
 
        for attribute in ad_attributes:
            if attribute['id'] == 'SIZE':
                correct_size = f"{attribute['value_name']} BR"

        size = {'id': 'SIZE', 'value_name': correct_size} if correct_size is not None else None

        if size:
            attributes_without_size = [attribute for attribute in ad_attributes if attribute['id'] != 'SIZE']
            ad_attributes = [*attributes_without_size, size]

        variations = None
        picture_ids = None

        ml_account_id = list(accounts.items())[0][0]
        ml_accounts = get_accounts(action, [ml_account_id], platform='ML')
        ml_account = ml_accounts[str(ml_account_id)]

        shopee_accounts = get_accounts(action, [advertising['shopee_account_id']], platform='SP')
        shopee_account = shopee_accounts[str(advertising['shopee_account_id'])]

        sp_api = ShopeeApi(shop_id=advertising['shopee_account_id'], access_token=shopee_account.get('access_token'))

        ml_api = MercadoLibreApi(access_token=ml_account["access_token"])

        detail_response = sp_api.get(
            path='/api/v2/product/get_item_base_info',
            version='v2',
            additional_params={
                'item_id_list': advertising['shopee_item_id'],
                'need_tax_info': True
            }
        )

        gtin_behavior = next((attribute for attribute in ad_attributes if attribute['id'] == 'gtin_behavior'), None)
        gtin_behavior = gtin_behavior.get('value_name') if gtin_behavior else None

        if gtin_behavior:
            ad_attributes = [attribute for attribute in ad_attributes if attribute['id'] != 'gtin_behavior']

        new_gtin = next((attribute for attribute in ad_attributes if attribute['id'] == 'GTIN'), None)
        new_gtin_value = new_gtin.get('value_name') if new_gtin else None

        ad_json = detail_response.json()
        ad_detail = ad_json['response']['item_list'][0]

        has_variations = ad_detail['has_model']
        is_variation_valid = False
        category_id = advertising['category_id']

        if has_variations:
            [variations, attributes_without_duplicates] = format_shopee_ad_variations(
                sp_api=sp_api, ml_api=ml_api, shopee_advertising_from_request=advertising, shopee_advertising_from_api=ad_detail,
                gtin_behavior=gtin_behavior, new_gtin=new_gtin_value
            )

            variations = remove_ml_duplicated_attribute_combinations(variations)


            ml_category_id = advertising['category_id']
            ml_category_is_mugs = ml_category_id == "MLB9206" # canecas
            material_attribute = next((attribute for attribute in ad_attributes if attribute['id'] == 'MATERIAL'), None)

            
            ad_attributes = attributes_without_duplicates

            if material_attribute and ml_category_is_mugs:
                ad_attributes.append(material_attribute)

            empty_attributes_combinations = next((variation for variation in variations if len(variation.get('attribute_combinations', [])) == 0), None)

            if empty_attributes_combinations:
                is_variation_valid = False
            else:
                is_variation_valid = True

        if not has_variations or not is_variation_valid:
            gtin = ad_detail.get('gtin_code', None)
            sku = ad_detail.get('item_sku', None)

            if ad_has_size_grid and size:
                size_grid_row_id = find_ml_size_grid_row_based_on_size_value(
                    ml_api=ml_api, size_grid_id=ad_has_size_grid['value_name'], size_value=size['value_name']
                )

                if size_grid_row_id is not None:
                    ad_attributes.append({
                        'id': 'SIZE_GRID_ROW_ID',
                        'value_name': size_grid_row_id
                    })
                else:
                    for account_id, account in accounts.items():
                        process_item_id = create_process_item(
                            processes[str(account_id)],
                            account_id,
                            advertising["shopee_item_id"],
                            action,
                        )

                        fail_duplication(
                            action,
                            account["user_id"],
                            process_item_id,
                            tool,
                            advertising["shopee_item_id"],
                            advertising["title"],
                            response=None,
                            custom_message=f"Replicação de Anúncio {advertising['shopee_item_id']} - {advertising['title']} falhou: O tamanho informado ({size['value_name']}) é inválido para essa Guia de Tamanhos: {ad_has_size_grid}",
                        )
                    return

            if gtin_behavior == 'keep-original-gtin':
                ad_attributes = [attribute for attribute in ad_attributes if attribute['id'] != 'GTIN']
                if gtin != "00":
                    ad_attributes.append({
                        'id': 'GTIN',
                        'value_name': gtin
                    })
                else:
                    ad_attributes.append({
                    "id": "EMPTY_GTIN_REASON",
                    "name": "Motivo de GTIN vazio",
                    "value_id": "17055161",
                    "value_name": "Outro motivo"
                })
            elif gtin_behavior == 'no-gtin':
                ad_attributes = [attribute for attribute in ad_attributes if attribute['id'] != 'GTIN']
                ad_attributes.append({
                    "id": "EMPTY_GTIN_REASON",
                    "name": "Motivo de GTIN vazio",
                    "value_id": "17055161",
                    "value_name": "Outro motivo"
                })

            if sku:
                ad_attributes.append({
                    'id': 'SELLER_SKU',
                    'value_name': sku
                })

        account_to_check_id = list(accounts.items())[0][0]
        account_has_user_product = 'user_product_seller' in accounts[account_to_check_id]['account_tags']
        
        should_turn_item_into_user_product = False

        if account_has_user_product:
            should_turn_item_into_user_product = True

        advertising_dimension = ad_detail.get("dimension", None)
        advertising_weight = ad_detail.get("weight", None)

        if advertising_dimension:
            ad_width = {
                'id': 'SELLER_PACKAGE_WIDTH',
                "value_name": f"{advertising_dimension['package_width']} cm"
            }

            ad_length = {
                'id': 'SELLER_PACKAGE_LENGTH',
                "value_name": f"{advertising_dimension['package_length']} cm"
            }

            ad_height = {
                'id': 'SELLER_PACKAGE_HEIGHT',
                "value_name": f"{advertising_dimension['package_height']} cm"
            }

            ad_attributes.extend([ad_width, ad_length, ad_height])

        if advertising_weight:
            ad_weight = {
                'id': 'SELLER_PACKAGE_WEIGHT',
                "value_name": f"{float(advertising_weight) * 1000} g"
            }

            ad_attributes.append(ad_weight)

        new_advertising = {
            "site_id": "MLB",
            "category_id": advertising["category_id"],
            "price": advertising["price"],
            "currency_id": "BRL",
            "available_quantity": advertising["available_quantity"],
            "buying_mode": "buy_it_now",
            "condition": advertising["condition"],
            "listing_type_id": advertising["listing_type_id"],
            "attributes": ad_attributes,
            "official_store_id": advertising.get("official_store_id", None)
        }

        if variations and len(variations) > 0 and is_variation_valid:
            new_advertising['variations'] = variations

        if picture_ids and len(picture_ids) > 0:
            new_advertising['pictures'] = picture_ids

        if should_turn_item_into_user_product:
            new_advertising['family_name'] = advertising["title"]
        else:
            new_advertising['title'] = advertising["title"]

        if advertising.get("immediate_payment"):
            advertising["tags"] = ["immediate_payment"]

        if advertising.get("sale_terms"):
            advertising["sale_terms"] = advertising["sale_terms"]

        if advertising.get("shipping"):
            advertising["shipping"] = advertising["shipping"]

        if has_variations:
            advertising["variations"] = []
            for variation in advertising["variations"]:
                variation["price"] = advertising["price"]
                advertising["variations"].append(variation)
        elif (
            advertising["create_catalog_advertising"]
            and not advertising["create_classic_advertising"]
        ):
            advertising["catalog_product_id"] = advertising["catalog_id"]
            advertising["catalog_listing"] = True

        for account_id, account in accounts.items():
            ml_api = MercadoLibreApi(access_token=account["access_token"])

            pictures = []
            pictures_dimensions_error = None

            uploaded_pictures = advertising.get('pictures', [])
            shopee_pictures = advertising.get('pictures_shopee', [])
            
            if len(uploaded_pictures) > 0:
                for picture_id in uploaded_pictures:
                    pictures.append({"id": picture_id})
            else:
                for url in shopee_pictures:
                    image = requests.get(url, stream=True)

                    parser_image = ImageFile.Parser()
                    parser_image.feed(image.content)

                    if (
                        parser_image.image.size[0] >= 500
                        and parser_image.image.size[1] >= 500
                    ):
                        filename = url.split("/")[-1]

                        imagefile = {
                            "file": (
                                f"{filename}.jpg",
                                image.content,
                                image.headers.get("Content-Type"),
                            )
                        }

                        response = ml_api.post(
                            "/pictures/items/upload", files=imagefile
                        )

                        if response.status_code in [200, 201]:
                            response_picture = response.json()

                            picture_id = response_picture["id"]
                            pictures.append({"id": picture_id})
                        else:
                            response_picture = response.json()

                            process_item_id = create_process_item(
                                processes[str(account["id"])],
                                account["id"],
                                advertising["shopee_item_id"],
                                action,
                            )
                            update_process_item(
                                process_item_id,
                                response,
                                False,
                                action,
                                f'Replicação de Anúncio #{advertising["shopee_item_id"]} - Operação cancelada (erro ao recuperar images da Shopee). {json.dumps(response_picture)}',
                            )
                            return
                    else:
                        if advertising['listing_type_id'] == 'gold_special' and not pictures_dimensions_error:
                            pictures_dimensions_error = 'Para esse anuncio, as imagens são obrigatórias e precisam ter pelo menos 500px de largura e 500px de altura. Certifique-se de que ao menos uma delas satisfaça esse requisito, e tente novamente'
                            

            if advertising['listing_type_id'] == 'gold_special' and len(pictures) == 0 and pictures_dimensions_error:
                process_item_id = create_process_item(
                    processes[str(account["id"])],
                    account["id"],
                    advertising["shopee_item_id"],
                    action,
                )

                update_process_item(
                        process_item_id,
                        None,
                        False,
                        action,
                        f'Replicação de Anúncio #{advertising["shopee_item_id"]} - {pictures_dimensions_error}',
                    )
                return

            new_advertising["pictures"] = pictures

            all_advertisings = [new_advertising]

            if should_turn_item_into_user_product:
                all_advertisings = turn_shopee_item_into_user_product(original_ad=new_advertising)
            
            for ad_to_create in all_advertisings:
                process_item_id = create_process_item(
                    processes[str(account["id"])],
                    account["id"],
                    advertising["shopee_item_id"],
                    action,
                )

                if (
                    tool["access_type"] == AccessType.free
                    or tool["access_type"] == AccessType.subscription
                    or (
                        tool["access_type"] == AccessType.credits
                        and use_credits(
                            action, account["user_id"], process_item_id, tool["price"]
                        )
                    )
                ):
                    # if advertising['shopee_item_id'] == 22098932755:
                    #     LOGGER.error('creating ad - ')
                    #     LOGGER.error(ad_to_create)

                    response = ml_api.post("/items", json=ad_to_create)
                    status_code = response.status_code
                    response_data = response.json()

                    if status_code not in [200, 201]:
                        fail_duplication(
                            action,
                            account["user_id"],
                            process_item_id,
                            tool,
                            advertising["shopee_item_id"],
                            advertising["title"],
                            response,
                        )
                    else:
                        permalink = response_data["permalink"]

                        tag = f"$[{permalink}]${{{response_data['id']}}}"

                        message = f'Replicação de Anúncio {advertising["shopee_item_id"]} -> {tag}: {advertising["title"]} - anúncio replicado com sucesso '
                        message = (
                            message + "na lista geral."
                            if advertising["create_classic_advertising"]
                            else message + "em Catálogo."
                        )

                        description_msg = ""
                        description = {"plain_text": advertising.get("description")}
                        if description.get("plain_text"):
                            response_description = ml_api.post(
                                f'/items/{response_data["id"]}/description',
                                json=description,
                            )

                            if response_description.status_code not in [200, 201]:
                                description_error_data = response_description.json()
                                description_msg = (
                                    "Erro ao inserir descrição: "
                                    + json.dumps(description_error_data)
                                )

                        eligibility_msg = ""
                        if advertising["evaluate_eligibility"]:
                            response_eligibility = ml_api.post(
                                f"/catalog_listing_eligibility/moderation_buybox/evaluate",
                                json={"item_id": response_data["id"]},
                            )

                            if response_eligibility.status_code not in [200, 201]:
                                eligibility_error_data = response_eligibility.json()
                                eligibility_msg = (
                                    "\tErro ao marcar anúncio para avaliação de catálogo: "
                                    + json.dumps(eligibility_error_data)
                                )

                        if (
                            not has_variations
                            and advertising["create_catalog_advertising"]
                            and advertising["create_classic_advertising"]
                        ):
                            update_process_item(
                                process_item_id,
                                response,
                                True,
                                action,
                                f'Replicação de Anúncio {advertising["shopee_item_id"]} -> {tag}: {advertising["title"]} - anúncio replicado com sucesso na lista geral. Publicando em catálogo, por favor, aguarde. {description_msg}',
                            )
                            create_and_publish_advertising = queue.signature(
                                "short_running:catalog_publish_new_advertising"
                            )
                            create_and_publish_advertising.apply_async(
                                (
                                    account["id"],
                                    advertising["id"],
                                    advertising["catalog_id"],
                                    process_item_id,
                                ),
                                countdown=60,
                            )
                        else:
                            update_process_item(
                                process_item_id,
                                response,
                                True,
                                action,
                                message + description_msg + eligibility_msg,
                            )

                            advertising_import_item(
                                True,
                                account["id"],
                                account["user_id"],
                                response_data["id"],
                                process_item_id,
                                account["access_token"],
                                update=True,
                            )
                else:
                    update_process_item(
                        process_item_id,
                        None,
                        False,
                        action,
                        f'Replicação de Anúncio #{advertising["shopee_item_id"]}: {advertising["title"]} - Operação não realizada (créditos insuficientes).',
                    )
    except Exception as e:
        LOGGER.error(e)
        for account_id, account in accounts.items():
            process_item_id = create_process_item(
                processes[str(account["id"])],
                account["id"],
                advertising["shopee_item_id"],
                action,
            )
            update_process_item(
                process_item_id,
                None,
                False,
                action,
                f'Replicação de Anúncio #{advertising["shopee_item_id"]} - Operação cancelada. {traceback.format_exc()}',
            )
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())
    finally:
        action.conn.close()

def replicate_compatibilities(ml_api_destiny, ml_api_origin, original_ad_id, replicated_ad_id, destiny_account_id):
    response = ml_api_origin.get(f'/items/{original_ad_id}/compatibilities', params={'extended': True})
    response_data = response.json()

    original_ad_compatibilities = response_data.get('products', [])

    # must add 200 compatibilities at a time
    compatibilities_batch_amount = math.ceil(len(original_ad_compatibilities) / 200)

    for i in range(compatibilities_batch_amount):
        batch_first_index = 200 * i 
        batch_last_index = 200 * (i + 1)

        batch = original_ad_compatibilities[batch_first_index:batch_last_index]
        formatted_batch = [{**item, 'id': item['catalog_product_id'], 'source': 'DEFAULT'} for item in batch]

        try:
            response = ml_api_destiny.post(f'/items/{replicated_ad_id}/compatibilities', json={'products': formatted_batch})
        except Exception as exc:
            LOGGER.error('error adding compatibility')
            LOGGER.error(exc)

def edit_values(new_advertising, advertising_override, mass_override):
    attributes = {}
    for attribute in new_advertising.get("attributes", []):
        attributes[attribute["id"]] = attribute

    if advertising_override:
        advertising_override.pop("seller_id", None)
        advertising_override.pop("seller_name", None)

        # Copia todos os campos alterados, menos attributes/variations/priceActions
        for key, value in advertising_override.items():
            if key not in ["attributes", "variations", "priceActions", "shipping"]:
                new_advertising[key] = value

        # Trata shipping
        if "shipping" in advertising_override:
            if "mode" in advertising_override["shipping"]:
                new_advertising["shipping"]["mode"] = advertising_override["shipping"][
                    "mode"
                ]
            if "free_shipping" in advertising_override["shipping"]:
                new_advertising["shipping"]["free_shipping"] = advertising_override[
                    "shipping"
                ]["free_shipping"]

        # Trata priceActions
        if advertising_override.get("priceActions"):
            getcontext().prec = 28
            price_factor = float(advertising_override["priceActions"]["value"])

            if advertising_override["priceActions"]["operationType"] == "percentage":
                price_factor = (
                    100 + price_factor
                    if advertising_override["priceActions"]["operation"] == "increase"
                    else 100 - price_factor
                )
                new_price = Decimal(
                    float(new_advertising["price"]) * (price_factor / 100.0)
                )
            else:
                price_factor = (
                    price_factor
                    if advertising_override["priceActions"]["operation"] == "increase"
                    else (-1) * price_factor
                )
                new_price = Decimal(float(new_advertising["price"]) + price_factor)
            new_advertising["price"] = float(
                str(new_price.quantize(Decimal("1.000"), rounding=ROUND_UP))[:-1]
            )

        # Sobrescreve atributo
        for attribute in advertising_override.get("attributes", []):
            attributes[attribute["id"]] = attribute

        if (
            advertising_override.get("variations") is None
            or len(advertising_override.get("variations", [])) == 0
        ):
            new_advertising.pop("variations", None)
        elif len(advertising_override.get("variations", [])) > 0:
            new_advertising.pop("catalog_product_id", None)
            new_advertising.pop("catalog_listing", None)

            new_advertising["variations"] = []
            for variation in advertising_override["variations"]:
                variation.pop("id", None)
                variation.pop("catalog_product_id", None)
                variation.pop("catalog_listing", None)
                variation.pop("sold_quantity", None)
                variation.pop("user_product_id", None)

                variation['available_quantity'] = variation.get('available_quantity', 1)

                variation_attributes = []
                for attribute in variation.get("attributes", []):
                    if attribute.get("value_id") is None:
                        continue

                    variation_attributes.append(
                        {
                            "id": attribute.get("id"),
                            "name": attribute.get("name"),
                            "value_id": attribute.get("value_id"),
                            "value_name": attribute.get("value_name"),
                        }
                    )
                variation["attributes"] = variation_attributes

                variation_attributes = []
                for attribute in variation.get("attribute_combinations", []):
                    variation_attributes.append(
                        {
                            "id": attribute.get("id"),
                            "name": attribute.get("name"),
                            "value_id": attribute.get("value_id"),
                            "value_name": attribute.get("value_name"),
                        }
                    )
                variation["attribute_combinations"] = variation_attributes

                new_advertising["variations"].append(variation)

    if mass_override:
        # Copia todos os campos alterados, menos attributes/variations/priceActions
        for key, value in mass_override.items():
            if key not in ["attributes", "variations", "priceActions", "shipping"]:
                new_advertising[key] = value

        # Trata shipping
        if "shipping" in mass_override:
            if "mode" in mass_override["shipping"]:
                new_advertising["shipping"]["mode"] = mass_override["shipping"]["mode"]
            if "free_shipping" in mass_override["shipping"]:
                new_advertising["shipping"]["free_shipping"] = mass_override[
                    "shipping"
                ]["free_shipping"]

        # Trata priceActions
        if mass_override.get("priceActions"):
            getcontext().prec = 28
            # Quando o usuário seleciona pra alterar o preço, mas não coloca nada, esse campo chega como string vazia
            price_factor = mass_override["priceActions"]["value"]

            if price_factor == "":
                price_factor = 0

            price_factor = float(price_factor)

            if mass_override["priceActions"]["operationType"] == "percentage":
                price_factor = (
                    100 + price_factor
                    if mass_override["priceActions"]["operation"] == "increase"
                    else 100 - price_factor
                )
                new_price = Decimal(
                    float(new_advertising["price"]) * (price_factor / 100.0)
                )
            else:
                price_factor = (
                    price_factor
                    if mass_override["priceActions"]["operation"] == "increase"
                    else (-1) * price_factor
                )
                new_price = Decimal(float(new_advertising["price"]) + price_factor)
            new_advertising["price"] = float(
                str(new_price.quantize(Decimal("1.000"), rounding=ROUND_UP))[:-1]
            )

        # Sobrescreve atributo
        for attribute in mass_override.get("attributes", []):
            attributes[attribute["id"]] = attribute

        manufacturing_time_override = mass_override.get('sale_terms', [])

    # Certifica que preço de variações seguem anúncio
    for i in range(len(new_advertising.get("variations", []))):
        new_advertising["variations"][i].pop("catalog_listing", None)
        new_advertising["variations"][i].pop("catalog_product_id", None)
        new_advertising["variations"][i]["price"] = new_advertising["price"]
        new_advertising.pop("catalog_listing", None)
        new_advertising.pop("catalog_product_id", None)

        if isinstance(advertising_override, dict) and advertising_override.get(
            "available_quantity"
        ):
            new_advertising["variations"][i]["available_quantity"] = (
                advertising_override.get("available_quantity", 1)
            )

        if isinstance(mass_override, dict) and mass_override.get("available_quantity"):
            new_advertising["variations"][i]["available_quantity"] = mass_override.get(
                'available_quantity', 1
            )

    # Remove atributo criado pós-publicação
    attributes.pop("ITEM_CONDITION", None)
    new_advertising["attributes"] = list(attributes.values())

    # Remove campos não permitidos na publicação
    new_advertising.pop("id", None)
    new_advertising.pop("thumbnail", None)
    new_advertising.pop("is_owner", None)
    new_advertising.pop("seller_id", None)
    new_advertising.pop("seller_name", None)
    new_advertising.pop("permalink", None)
    new_advertising.pop("priceActions", None)
    new_advertising.pop("account_id", None)

    return new_advertising


def fail_duplication(
    action, user_id, process_item_id, tool, advertising_id, title, response=None, tool_usage_amount=1, custom_message=None
):
    credits_msg = ""
    if tool["access_type"] == AccessType.credits:
        tool_price = tool['price']

        # Desde que implementamos a alteração de servidor, em alguns casos o tool_price tem vindo como um 
        # dicionário do tipo {'__type__': 'decimal', '__value__': 0.25}. Em outros casos, ele vem só o valor mesmo, como esperado.
        # Então vamos verificar o tipo dele antes de aplicar o float no value.
        dict_type = type({})
        if type(tool_price) == dict_type:
            tool_price = tool_price.get('__value__')

        tool_price = float(tool_price) if tool_price else 0

        total_price = tool_price*tool_usage_amount
        rollback_credits_transaction(action, process_item_id, user_id, total_price)
        credits_msg = "(crédito restituído)"
    
    message = ''

    if response is not None and response.status_code == 401:
        message = f"Replicação de Anúncio #{advertising_id}: {title} - Operação não realizada, a conta perdeu a autenticação com o Mercado Livre {credits_msg}"
    elif response is not None:
        error = response.json()
        message = f"Replicação de Anúncio #{advertising_id}: {title} - Operação não realizada {credits_msg} <Resposta Mercado Livre: {json.dumps(error)}>"

    if custom_message:
        message += f"\n\n{custom_message}"

    update_process_item(process_item_id, response, False, action, message)

def fail_user_product_duplication(
    action, process_item_id, response
):
    update_process_item(process_item_id, response, False, action, response)


def chart(operation_type, ml_api, result, ml_api_copy, account, new_advertising):
    if operation_type == "owned":
        return chart_owned(ml_api, result, ml_api_copy, account, new_advertising)
    else:
        return chart_external(ml_api, result, ml_api_copy, account, new_advertising)

def chart_external(ml_api, result, ml_api_copy, account, new_advertising):
    action = QueueActions()
    action.conn = get_conn()

    chart_id_destiny = None

    try:
        success = True
        chart_copy_response = ""
        account_id_origin = new_advertising.get("seller_id")
        account_id_destiny = account["id"]

        for attribute in new_advertising.get("attributes", []):
            if attribute.get("id") == "AGE_GROUP":
                new_advertising.get("attributes").remove(attribute)

            if attribute.get("id") == "SIZE_GRID_ID":
                chart_id_origin = attribute["value_name"]

                chart_response = ml_api.get(f"/catalog/charts/{chart_id_origin}")
                chart_data = chart_response.json()

                if chart_data.get('status') == 403:
                    return False, chart_response

                chart_type = chart_data.get('type', None)
                seller_id = chart_data.get('seller_id', None)

                if (
                    chart_type == "SPECIFIC"
                    and seller_id and seller_id != account["id"]
                ):
                    for row in chart_data.get("rows", []):
                        row.pop("id", None)
                        for attribute in row.get("attributes"):
                            if chart_data["domain_id"] == "SNEAKERS" or 'BOOT' in chart_data['domain_id'] or 'SANDAL' in chart_data['domain_id'] or 'FOOTWEAR' in chart_data['domain_id']:
                                if attribute.get("id") == "SIZE":
                                    row.get("attributes").remove(attribute)
                                elif attribute.get("id") == "RECOMMENDED_SPORTS":
                                    row.get("attributes").remove(attribute)

                    query = """
                        SELECT chart_id_destiny
                        FROM meuml.charts
                        WHERE
                            chart_id_origin = :chart_id_origin
                            AND account_id_origin = :account_id_origin
                            AND account_id_destiny = :account_id_destiny
                    """
                    validate_chart = action.fetchone(
                        query,
                        {
                            "chart_id_origin": chart_id_origin,
                            "account_id_origin": account_id_origin,
                            "account_id_destiny": account_id_destiny,
                        },
                    )

                    if not validate_chart:
                        [success, chart_id_destiny, error_code, chart_copy_response] = create_chart(
                            ml_api_copy,
                            chart_data,
                            chart_id_origin,
                            account_id_origin,
                            account_id_destiny,
                            action,
                            )

                        if not success:
                            # Caso o nome seja duplicado
                            has_name_error = error_code == 'chart_name_unavailable'
                            if has_name_error:
                                [success, chart_id_destiny, _, chart_copy_response] = create_chart(
                                    ml_api_copy,
                                    chart_data,
                                    chart_id_origin,
                                    account_id_origin,
                                    account_id_destiny,
                                    action,
                                    avoid_duplicated_name=True,
                                )
                    else:
                        # Retorna ID da Tabela de Medidas se já está cadastrada
                        chart_id_destiny = validate_chart["chart_id_destiny"]

                    for attribute in new_advertising.get("attributes", []):
                        if attribute.get("id") == "SIZE_GRID_ID":
                            attribute["value_name"] = chart_id_destiny

                if len(result.get("variations", [])) > 0:
                    variations = []  # Lista para armazenar variações processadas
                    for variation in result.get("variations", []):
                        size_attr = None
                        chart_row_id = None
                        variation_processed = (
                            False  # Flag para verificar se a variação foi processada
                        )

                        # Faz uma cópia profunda da variação original
                        new_variation = variation.copy()

                        # Copia todos os atributos da variação original
                        new_variation_attributes = new_variation.get(
                            "attributes", []
                        ).copy()

                        for attribute in new_variation_attributes:
                            if attribute.get("id") == "SIZE_GRID_ROW_ID":
                                for attr_comb in variation.get(
                                    "attribute_combinations", []
                                ):
                                    if attr_comb.get("id") == "SIZE":
                                        size_attr = attr_comb.get("value_name")

                                if size_attr is None:
                                    continue  # Se não encontrou o tamanho, vai para a próxima variação

                                for row in chart_data.get("rows", []):
                                    for attr in row.get("attributes", []):
                                        if attr.get("id") == "SIZE":
                                            for value in attr.get("values", []):
                                                if value.get("name") == size_attr:
                                                    chart_row_id = row.get("id")
                                                    break

                                if chart_row_id is None:
                                    continue  # Se não encontrou a linha da tabela, vai para a próxima variação

                                # Substitui o valor do atributo SIZE_GRID_ROW_ID
                                attribute["value_name"] = chart_row_id

                                variation_processed = True  # Marca que a variação foi processada corretamente

                        if variation_processed:
                            # Substitui os atributos da nova variação pelos atributos modificados
                            new_variation["attributes"] = new_variation_attributes
                            # Adiciona a nova variação completa à lista de variações processadas
                            variations.append(new_variation)

                    # No final, atribuímos as variações processadas ao new_advertising
                    new_advertising["variations"] = variations
                
                if len(new_advertising["variations"]) == 0:
                    # Verifica se o atributo SIZE_GRID_ROW_ID já existe
                    attribute_exists = False
                    main_color_found = False
                    for attribute in new_advertising.get("attributes", []):
                        if attribute.get("id") == "MAIN_COLOR":
                            new_advertising["attributes"].append(
                                {
                                    "id": "COLOR",
                                    "value_name": attribute.get("value_name"),
                                }
                            )
                            main_color_found = True

                        if attribute.get("id") == "SIZE_GRID_ROW_ID":
                            attribute['value_name'] = f"{chart_id_destiny}:{attribute['value_name'].split(':')[1]}"
                            attribute_exists = True
                            break

                    # Se o MAIN_COLOR não foi encontrado, busca o atributo COLOR nas variations
                    if not main_color_found:
                        variations = result.get("variations", [])
                        if variations:  # Verifica se há variações
                            attribute_combinations = variations[0].get("attribute_combinations", [])
                            for attribute_combination in attribute_combinations:
                                if attribute_combination.get("id") == "COLOR":
                                    # Adiciona o atributo COLOR a new_advertising
                                    new_advertising.setdefault("attributes", []).append(attribute_combination)
                                    break  # Adiciona apenas o primeiro encontrado

                    # Se o atributo não existir, insere um novo
                    if not attribute_exists:
                        chart_size_first_row = None

                        # Obtém os atributos da primeira linha
                        chart_rows = chart_data.get("rows", [])
                        first_row_attributes = chart_rows[0] if len(chart_rows) > 0 else []

                        # Encontra o primeiro SIZE na primeira linha
                        for attr in first_row_attributes:
                            if attr.get("id") == "SIZE":
                                # Acessa o primeiro valor do atributo SIZE
                                if attr.get("values"):
                                    chart_size_first_row = attr.get("values", [])[
                                        0
                                    ].get("name")
                                break  # Sai do loop após encontrar o primeiro SIZE

                        # Adiciona os novos atributos em new_advertising
                        new_advertising.setdefault("attributes", []).append(
                            {
                                "id": "SIZE",
                                "value_name": chart_size_first_row,
                            }
                        )

                        chart_id = chart_data.get('id', None)

                        if chart_id:
                            new_advertising["attributes"].append(
                                {
                                    "id": "SIZE_GRID_ROW_ID",
                                    "value_name": f"{chart_id}:1",
                                }
                            )

    except Exception as e:
        LOGGER.error(e)
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())
    finally:
        action.conn.close()

    return success, chart_copy_response

def chart_owned(ml_api, result, ml_api_copy, account, new_advertising):
    action = QueueActions()
    action.conn = get_conn()

    try:
        success = True
        chart_copy_response = ''
        account_id_origin = result.get('seller_id')
        account_id_destiny = account['id']
        chart_id_destiny=None

        for attribute in result.get('attributes', []):
            if attribute.get('id') == 'SIZE_GRID_ID':
                chart_id_origin = attribute['value_name']

                chart_response = ml_api.get(f"/catalog/charts/{chart_id_origin}")
                chart_data = chart_response.json()

                for row in chart_data.get('rows', []):
                    row.pop('id', None)
                    for attribute in row.get('attributes'):
                        if chart_data['domain_id'] == 'SNEAKERS' or 'BOOT' in chart_data['domain_id'] or 'SANDAL' in chart_data['domain_id'] or 'FOOTWEAR' in chart_data['domain_id']:
                            if attribute.get('id') == 'SIZE':
                                row.get('attributes').remove(attribute)
                                
                LOGGER.error("CHART ID ORIGIN")
                LOGGER.error(chart_id_origin)
                LOGGER.error("ACCOUNT ID ORIGIN")
                LOGGER.error(account_id_origin)
                LOGGER.error("ACCOUNT ID DESTINY")
                LOGGER.error(account_id_destiny)

                if chart_data['type'] == 'SPECIFIC':
                    LOGGER.error("É SPECIFIC")
                    
                    query = """
                        SELECT chart_id_destiny
                        FROM meuml.charts
                        WHERE
                            chart_id_origin = :chart_id_origin
                            AND account_id_origin = :account_id_origin
                            AND account_id_destiny = :account_id_destiny
                    """
                    validate_chart = action.fetchone(
                        query, {
                            'chart_id_origin': chart_id_origin,
                            'account_id_origin': account_id_origin,
                            'account_id_destiny': account_id_destiny
                        }
                    )
                    
                    LOGGER.error("VALIDOU O CHART ??")
                    LOGGER.error(validate_chart)

                    if not validate_chart:
                        [success, chart_id_destiny, error_code, chart_copy_response] = create_chart(
                            ml_api_copy,
                            chart_data,
                            chart_id_origin,
                            account_id_origin,
                            account_id_destiny,
                            action,
                        )

                        if not success:
                            # Caso o nome seja duplicado
                            has_name_error = error_code == 'chart_name_unavailable'
                            if has_name_error:
                                [success, chart_id_destiny, _, chart_copy_response] = create_chart(
                                    ml_api_copy,
                                    chart_data,
                                    chart_id_origin,
                                    account_id_origin,
                                    account_id_destiny,
                                    action,
                                    avoid_duplicated_name=True,
                                )

                    else:
                        # Retorna ID da Tabela de Medidas se já está cadastrada
                        chart_id_destiny = validate_chart['chart_id_destiny']

                    for attribute in new_advertising.get('attributes', []):
                        if attribute.get('id') == 'SIZE_GRID_ID':
                            attribute['value_name'] = chart_id_destiny
                    if len(result.get('variations', [])) > 0:
                        for variation in new_advertising['variations']:
                            for attribute in variation.get('attributes', []):
                                if attribute.get('id') == 'SIZE_GRID_ROW_ID':
                                    attribute['value_name'] = f"{chart_id_destiny}:{attribute['value_name'].split(':')[1]}"
                    else:
                        for attribute in new_advertising.get('attributes', []):
                            if attribute.get('id') == 'SIZE_GRID_ROW_ID':
                                attribute['value_name'] = f"{chart_id_destiny}:{attribute['value_name'].split(':')[1]}"

    except Exception as e:
        LOGGER.error(e)
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())
    finally:
        action.conn.close()

    return success, chart_copy_response


def get_only_required_attributes(type, advertising, new_advertising, result):    
    if type == "external":
        new_advertising["attributes"] = []
        if not advertising.get("override"):
            for attribute in result.get("attributes"):
                if attribute['id'] == 'VEHICLE_PARTS_POSITION' and attribute['value_id'] is None:
                    continue

                new_advertising["attributes"].append(
                    {
                        "id": attribute.get("id"),
                        "name": attribute.get("name"),
                        "value_id": attribute.get("value_id"),
                        "value_name": attribute.get("value_name"),
                    }
                )
        else:
            for attribute in advertising.get("override").get("attributes"):
                new_advertising["attributes"].append(
                    {
                        "id": attribute.get("id"),
                        "name": attribute.get("name"),
                        "value_id": attribute.get("value_id"),
                        "value_name": attribute.get("value_name"),
                    }
                )
    else:
        new_advertising['attributes'] = []
        for attribute in result.get('attributes', []):
            if attribute['id'] == 'VEHICLE_PARTS_POSITION' and attribute['value_id'] is None:
                continue
 
            new_advertising['attributes'].append({
                'id': attribute.get('id'),
                'name': attribute.get('name'),
                'value_id': attribute.get('value_id'),
                'value_name': attribute.get('value_name'),
            })


# Se o anuncio original não tem o GTIN, e a sua categoria tem a tag "conditional_required",
# então podemos deixar o campo GTIN vazio, mas precisamos informar o motivo dele estar vazio.
# Se a categoria tiver as tags "required" ou "required_new", o GTIN precisa ser enviado e ponto final.
def ignore_gtin_if_necessary(ml_api, original_ad, new_advertising):
    original_ad_has_gtin = next((attribute for attribute in original_ad.get('attributes', []) if attribute['id'] == 'GTIN'), None)

    if original_ad_has_gtin:
        return

    category_response = ml_api.get(f"/categories/{original_ad['category_id']}/attributes")
    category_attributes = category_response.json()

    category_has_gtin = next((attribute for attribute in category_attributes if attribute['id'] == 'GTIN'), None)

    if not category_has_gtin:
        return

    gtin_tags_in_category = category_has_gtin.get('tags', None)

    if not gtin_tags_in_category:
        return

    is_conditional_required = gtin_tags_in_category.get('conditional_required', None)

    if not is_conditional_required:
        return

    new_ad_attributes = new_advertising.get('attributes', [])
    new_ad_variations = new_advertising.get('variations', [])

    attributes_have_empty_gtin_reason = next((attribute for attribute in new_ad_attributes if attribute['id'] == 'EMPTY_GTIN_REASON'), None)
    variation_have_empty_gin_reason = None

    for variation in new_ad_variations:
        variation_attributes = variation.get('attributes', [])
        variation_have_empty_gin_reason = next((attribute for attribute in variation_attributes if attribute['id'] == 'EMPTY_GTIN_REASON'), None)

        if variation_have_empty_gin_reason is not None:
            break

    if attributes_have_empty_gtin_reason or variation_have_empty_gin_reason:
        return
    
    new_ad_attributes.append({
        "id": "EMPTY_GTIN_REASON",
        "name": "Motivo de GTIN vazio",
        "value_id": "17055161",
        "value_name": "Outro motivo"
    })

def create_chart (ml_api_copy, chart_data, chart_id_origin, account_id_origin, account_id_destiny, action, avoid_duplicated_name=False):
    chart_name = chart_data["names"]

    if avoid_duplicated_name:
        for key, value in chart_name.items():
            chart_name[key] = f"{value} MeuML"
                
    chart_json = {
            "names": chart_name,
            "domain_id": chart_data["domain_id"],
            "site_id": chart_data["site_id"],
            "measure_type": chart_data["measure_type"],
            "attributes": chart_data["attributes"],
            "main_attribute": {
                "attributes": [
                    {
                        "site_id": chart_data["site_id"],
                        "id": chart_data["main_attribute_id"],
                    }
                ]
            },
            "rows": chart_data["rows"],
        }
    
    # Cria a Tabela de Medidas, Insere no banco e retorna ID
    chart_copy_response = ml_api_copy.post(
        f"/catalog/charts",
        json=chart_json,
    )
    chart_copy_data = chart_copy_response.json()

    if chart_copy_response.status_code in [200, 201]:
        chart_copy_data = chart_copy_response.json()

        chart_id_destiny = chart_copy_data["id"]

        query_origin = """
            INSERT INTO meuml.charts (account_id_origin, chart_id_origin, account_id_destiny, chart_id_destiny)
            VALUES (:account_id_origin, :chart_id_origin, :account_id_destiny, :chart_id_destiny)
        """
        values_origin = {
            "account_id_origin": account_id_origin,
            "chart_id_origin": chart_id_origin,
            "account_id_destiny": account_id_destiny,
            "chart_id_destiny": chart_id_destiny,
        }
        action.execute(query_origin, values_origin)

        # Inverter origem -> destino | destino -> origem porque as duas contas vão ter a tabela cadastrada
        query_destiny = """
            INSERT INTO meuml.charts (account_id_origin, chart_id_origin, account_id_destiny, chart_id_destiny)
            VALUES (:account_id_origin, :chart_id_origin, :account_id_destiny, :chart_id_destiny)
        """
        values_destiny = {
            "account_id_origin": account_id_destiny,
            "chart_id_origin": chart_id_destiny,
            "account_id_destiny": account_id_origin,
            "chart_id_destiny": chart_id_origin,
        }
        action.execute(query_destiny, values_destiny)

        return [True, chart_id_destiny, None, chart_copy_response]
    else:
        chart_error = chart_copy_data.get('errors', [])
        error_code = None

        if len(chart_error) > 0:
            error_code = chart_error[0].get('code', None)

        return [False, None, error_code, chart_copy_response]

def turn_item_into_user_product(new_advertising, original_ad_id=None):
    converted_items = []

    #remove original variations and attributes and title 
    original_variations = new_advertising.pop('variations', [])
    original_attributes = new_advertising.pop('attributes', [])
    original_title = new_advertising.pop('title', None)
    original_family_name = new_advertising.pop('family_name', None)

    if original_ad_id == 'MLB3172054426':
        LOGGER.error('original_title')
        LOGGER.error(original_title)

        LOGGER.error('original_family_name')
        LOGGER.error(original_family_name)

    for variation in original_variations:
        if len(variation['attribute_combinations']) > 0:
            formatted_attributes = [*original_attributes, *variation['attribute_combinations']]

            formatted_item = {
                **new_advertising,
                'family_name': original_family_name if original_family_name else original_title,
            }

            variation_has_pictures = len(variation.get('pictures', [])) > 0
            variation_has_sale_terms = len(variation.get('sale_terms', [])) > 0

            if variation_has_pictures:
                formatted_item['pictures'] = variation['pictures']

            if variation_has_sale_terms:
                formatted_item['pictures'] = variation['sale_terms']

            if original_ad_id is not None:
                # a maioria dos atributos não permite receber um value_id: null, exceto esses listados abaixo.
                # Essa lista pode continuar mudando
                attributes_that_accept_value_id_null = ['SIZE_GRID_ROW_ID', 'GTIN', 'SELLER_SKU']

                for attribute in variation.get("attributes", []):
                    if attribute.get('value_id', None) is None and attribute['id'] not in attributes_that_accept_value_id_null:
                        continue

                    formatted_attributes.append(
                        {
                            "id": attribute.get("id"),
                            # "name": attribute.get("name"),
                            # "value_id": attribute.get("value_id"),
                            "value_name": attribute.get("value_name"),
                        }
                    )


            formatted_item["attributes"] = formatted_attributes
            converted_items.append(formatted_item)

    # anuncio não tem variações
    if len(original_variations) == 0:
        converted_item = new_advertising
        converted_item['family_name'] = original_family_name if original_family_name else original_title
        converted_item['attributes'] = original_attributes
        converted_items.append(converted_item)
    
    return converted_items

def format_shopee_ad_variations(sp_api, shopee_advertising_from_request, ml_api, shopee_advertising_from_api, gtin_behavior, new_gtin):
    variations_response = sp_api.get(
            path='/api/v2/product/get_model_list',
            version='v2',
            additional_params={'item_id': shopee_advertising_from_request['shopee_item_id']}
        )

    variations_response = variations_response.json()
    variations_response = variations_response['response']

    tier_variations = variations_response.get('tier_variation', [])
    variations_models = variations_response['model']

    # Extrai, das variações, a relação dos tiers (attributes_combinations), preço e quantidade
    attributes_combinations_data = [] # Esses indices dizem quais propriedades estão sendo combinadas [[1,2], [3,4]] -> [{'indexes': [1,2], 'price': 10, 'available_quantity': 20}]
    for model in variations_models:
        tier_index = model['tier_index']
        price = model['price_info'][0]['current_price']
        available_quantity = model['stock_info_v2']['summary_info']['total_available_stock']

        variation_data = {
            'indexes': tier_index,
            'price': price,
            'available_quantity': available_quantity,
        }

        # atributos específicos:
        gtin = model.get('gtin_code', None)
        sku = model.get('model_sku', None)

        if gtin_behavior == 'no-gtin':
            gtin = None
        elif gtin_behavior == 'overwrite-gtin':
            gtin = new_gtin

        if gtin:
            variation_data['gtin_code'] = gtin

        if sku:
            variation_data['model_sku'] = sku

        attributes_combinations_data.append(variation_data)

    # Extrai os atributos da categoria do ML (destino do anuncio)
    ml_category_id = shopee_advertising_from_request['category_id']

    category_attributes = ml_api.get(f"/categories/{ml_category_id}/attributes")
    category_attributes = category_attributes.json()

    ml_attributes_translation = {}

    for attribute in category_attributes:
        attribute_id = attribute['id']
        attribute_name = (attribute['name']).lower()

        ml_attributes_translation[attribute_name] = attribute_id

    # Verifica se o anuncio tem uma tabela de medidas selecionada (SIZE_GRID_ID) e, se sim, pega as linhas dela (os tamanhos)
    sp_ad_attributes = shopee_advertising_from_request['attributes']
    size_grid_id = None
    size_chart_rows = []
    for attribute in sp_ad_attributes:
        if attribute['id'] == 'SIZE_GRID_ID':
            size_grid_id = attribute['value_name']

    if size_grid_id:
        size_chart = ml_api.get(f'/catalog/charts/{size_grid_id}')
        size_chart = size_chart.json()
        size_chart_rows = size_chart['rows']
        
    grid_rows_relations = {}

    # Relaciona os tamanhos das variações com os tamanhos nas linhas da tabela de medida
    for row in size_chart_rows:
        row_attributes = row['attributes']

        row_size = None
        for attribute in row_attributes:
            if attribute['id'] == 'BR_SIZE':
                row_size = attribute['values'][0]['name']

        if row_size:
            grid_rows_relations[row_size] = row['id'] # cria relação {tamanho: id_da_linha_da_tabela_de_medida} -> {'38 BR': '291102:9'}

    # Monta o objeto das variações para o ML
    attributes_grouped = []
    uploaded_variation_images = {}

    # Caso a variação não tenha imagem, coloca uma imagem do anuncio original mesmo
    ad_fail_over_image_url = shopee_advertising_from_api.get('image', {})
    ad_fail_over_image_url = ad_fail_over_image_url.get('image_url_list', [])
    ad_fail_over_image_url = ad_fail_over_image_url[0] if len(ad_fail_over_image_url) > 0 else None

    for combination_data in attributes_combinations_data:
        attributes = []
        ml_picture_id = None
        has_size = False
        ml_size_id = None
        for i, tier_index in enumerate(combination_data['indexes']):
            # combina os atributos
            attribute_name = tier_variations[i]['name']
            attribute_value = tier_variations[i]['option_list'][tier_index]['option']

            # faz upload das imagens e pega os ids, se a variação tiver imagem
            image_url = None

            variation_image = tier_variations[i]['option_list'][tier_index].get('image', None)

            if variation_image:
                image_url = variation_image['image_url']
            else:
                image_url = ad_fail_over_image_url

            if image_url:
                variation_image_in_ml = uploaded_variation_images.get(image_url, None)

                if not variation_image_in_ml:
                    ml_picture_id = upload_sp_image_to_ml(ml_api=ml_api, image_url=image_url)
                    uploaded_variation_images[image_url] = ml_picture_id
                else:
                    ml_picture_id = variation_image_in_ml

            ml_attribute_id = ml_attributes_translation.get(attribute_name.lower(), None)

            if ml_attribute_id:

                if ml_attribute_id == "MATERIAL" and ml_category_id == "MLB9206": # canecas
                    continue

                attributes.append({
                    'value_name': attribute_value,
                    'id': ml_attribute_id,
                })

                if ml_attribute_id == 'SIZE':
                    has_size= True
                    ml_size_id = grid_rows_relations.get(attribute_value, None) # recupera o id da linha da tabela de medida através do tamanho

        attribute_to_append = {
            'attribute_combinations': attributes,
            'available_quantity': combination_data['available_quantity'],
            'price': combination_data['price'],
            'attributes': []
        }

        if has_size and ml_size_id:
            attribute_to_append['attributes'].append({
                "id": "SIZE_GRID_ROW_ID",
                "value_name": ml_size_id
            })

        variation_gtin = combination_data.get('gtin_code', None)
        if variation_gtin is not None:
            attribute_to_append['attributes'].append({
                'id': 'GTIN',
                'value_name': variation_gtin
            })

        variation_sku = combination_data.get('model_sku', None)
        if variation_sku is not None:
            attribute_to_append['attributes'].append({
                'id': 'SELLER_SKU',
                'value_name': variation_sku
            })

        if ml_picture_id:
            attribute_to_append['picture_ids'] = [ml_picture_id]
            ml_picture_id = None

        if has_size and not ml_size_id:
            has_size = False
            ml_size_id = None
            continue

        attributes_grouped.append(attribute_to_append)
        has_size = False
        ml_size_id = None

    # Não pode ter o mesmo atributo dentro dos atributos do item, e na variação (dentro de atributos ou combinação de atributos), então remove os atributos dentro do item:
    item_attributes_ids = [] # atributos que foram enviados na requisição
    request_ad_attributes = shopee_advertising_from_request.get('attributes', [])

    for request_attribute in request_ad_attributes:
        attribute_id = request_attribute['id']

        if attribute_id not in item_attributes_ids:
            item_attributes_ids.append(attribute_id)

    ml_variation_attributes_ids = [] # são os atributos dentro das variações do ML
    ml_variation_attributes_combinations_ids = [] # são as combinações de atributos dentro das variações do ML

    for variation in attributes_grouped:
        for attribute in variation.get('attributes', []):
            if attribute['id'] not in ml_variation_attributes_ids:
                ml_variation_attributes_ids.append(attribute['id'])

        for attribute_combination in variation.get('attribute_combinations', []):
            if attribute_combination['id'] not in ml_variation_attributes_combinations_ids:
                ml_variation_attributes_combinations_ids.append(attribute_combination['id'])

    attributes_to_remove_from_item = [] # os atributos que serão removidos do anuncio (pois já estão nas variações)
    for attribute_id in item_attributes_ids:
        if attribute_id in ml_variation_attributes_ids or attribute_id in ml_variation_attributes_combinations_ids:
            attributes_to_remove_from_item.append(attribute_id)

    item_correct_attributes = [attribute for attribute in request_ad_attributes if attribute['id'] not in attributes_to_remove_from_item]
    shopee_advertising_from_request['attributes'] = item_correct_attributes

    return [attributes_grouped, item_correct_attributes]


def upload_sp_image_to_ml(ml_api, image_url):
    image = requests.get(image_url, stream=True)

    parser_image = ImageFile.Parser()
    parser_image.feed(image.content)

    if (
        parser_image.image.size[0] >= 500
        and parser_image.image.size[1] >= 500
    ):
        filename = image_url.split("/")[-1]

        imagefile = {
            "file": (
                f"{filename}.jpg",
                image.content,
                image.headers.get("Content-Type"),
            )
        }

        response = ml_api.post(
            "/pictures/items/upload", files=imagefile
        )

        if response.status_code in [200, 201]:
            response_picture = response.json()

            picture_id = response_picture["id"]
            # pictures.append({"id": picture_id})
            return picture_id
        else:
            response_picture = response.json()

            # process_item_id = create_process_item(
            #     processes[str(account["id"])],
            #     account["id"],
            #     advertising["shopee_item_id"],
            #     action,
            # )
            # update_process_item(
            #     process_item_id,
            #     response,
            #     False,
            #     action,
            #     f'Replicação de Anúncio #{advertising["shopee_item_id"]} - Operação cancelada (erro ao recuperar images da Shopee). {json.dumps(response_picture)}',
            # )
            # return

def find_ml_size_grid_row_based_on_size_value(ml_api, size_grid_id, size_value):
    size_chart = ml_api.get(f'/catalog/charts/{size_grid_id}')
    size_chart = size_chart.json()

    size_chart_rows = size_chart['rows']

    for row in size_chart_rows:
        row_attributes = row['attributes']
        row_br_size = next((attribute for attribute in row_attributes if attribute['id'] == 'BR_SIZE'), None)

        if row_br_size is None:
            continue

        row_br_value = row_br_size['values'][0]['name']

        if row_br_value == size_value:
            return row['id']
        
    return None
    
def turn_shopee_item_into_user_product(original_ad):
    LOGGER.error('on turn_shopee_item_into_user_product - ')
    LOGGER.error(original_ad)

    original_ad_variations = original_ad.get('variations', [])

    if len(original_ad_variations) == 0:
        return [original_ad]
    
    ads_as_user_products = []
    ad_variations = original_ad.pop('variations', [])
    ad_attributes = original_ad.get('attributes', [])

    for variation in ad_variations:
        attribute_combinations = variation.pop('attribute_combinations', [])
        all_attributes = [*ad_attributes, *attribute_combinations]

        # Remove o picture_ids (só serve pra variação)
        variation.pop('picture_ids', [])

        # Sobrescreve os atributos do anuncio original com o da variação (preço, quantidade disponível, etc) sem o attribute_combinations
        user_product_ad = {**original_ad, **variation}
        user_product_ad['attributes'] = all_attributes

        ads_as_user_products.append(user_product_ad)
        
    return ads_as_user_products