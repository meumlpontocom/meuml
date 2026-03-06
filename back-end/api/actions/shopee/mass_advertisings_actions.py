from flask import request
from flask_jwt_simple import jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.enums.access_type import AccessType
from libs.queue.queue import app as queue
from libs.payments.payment_helper import verify_tool_access
from libs.schema.shopee_advertisings_schema import (
    AdvertisingListSchema,
    AdvertisingReplicateSchema,
    MassAlterDescription,
    MassAlterPriceSchema,
)
from workers.loggers import create_process
from workers.tasks.shopee.price_update import shopee_alter_price_batch

class ShopeeMassAdvertisingsActions(Actions):
    @jwt_required
    @prepare
    def mass_alter_price(self):
        self.validate(MassAlterPriceSchema())
        advertisings_id = [
            str(advertising_id)
            for advertising_id in self.data.pop("advertisings_id", [])
        ]
        advertisings_id = ",".join(advertisings_id)

        tool = self.get_tool("alter-price-shopee")

        if "confirmed" not in request.args or request.args["confirmed"] not in [
            "0",
            "1",
        ]:
            self.abort_json(
                {
                    "message": "Preencha o parâmetro de confirmação.",
                    "status": "error",
                },
                400,
            )
        else:
            confirmed = True if request.args.get("confirmed", "0") == "1" else False
            select_all = True if request.args.get("select_all", "0") == "1" else False

        subscription_required = tool["access_type"] == AccessType.subscription
        additional_conditions = " AND ad.status NOT IN ('BANNED', 'DELETED') "
        filter_values, filter_query, filter_total, accounts_id = self.apply_filter(
            request,
            additional_conditions=additional_conditions,
            subscription_required=subscription_required,
            mass_operation=True,
            advertisings_id=advertisings_id,
            platform="SP",
        )

        if not confirmed and filter_total > 1:
            return self.return_success(
                f"A operação modificará: {filter_total} anúncios"
            )
        elif not confirmed and filter_total == 1:
            advertising = self.fetchone(
                "SELECT ad.id, ad.name FROM shopee.advertisings ad JOIN shopee.accounts ac ON ac.id = ad.account_id "
                + filter_query,
                filter_values,
            )
            return self.return_success(
                f"A operação modificará o anúncio #{advertising['id']} - {advertising['name']}"
            )
        elif not confirmed:
            return self.return_success(f"A operação não modificará nenhum anúncio.")

        if filter_total == 0:
            return self.return_success("Nenhum anúncio será modificado")

        code, message = verify_tool_access(
            self, self.user["id"], accounts_id, tool, filter_total
        )

        if code != 200:
            self.abort_json(
                {
                    "message": message,
                    "status": "error",
                },
                code,
            )

        if filter_total > 1:
            advertising_duplicate_many = queue.signature(
                "local_priority:shopee_alter_price_many"
            )
            advertising_duplicate_many.delay(
                self.user["id"],
                filter_query,
                filter_values,
                filter_total,
                self.data,
                select_all,
            )

            return self.return_success(
                f"Alteração de preço em massa de {filter_total} anúncios iniciada. Confira o andamento em processos"
            )

        else:
            advertising = self.fetchone(
                "SELECT ad.id, ad.name, ad.account_id FROM shopee.advertisings ad JOIN shopee.accounts ac ON ac.id = ad.account_id "
                + filter_query,
                filter_values,
            )
            process_id = create_process(
                account_id=advertising["account_id"],
                user_id=self.user["id"],
                tool_id=tool["id"],
                tool_price=tool.get("price"),
                items_total=1,
                action=self,
                platform="SP",
            )
            status_code, message = shopee_alter_price_batch(
                tool,
                advertising["account_id"],
                process_id,
                [advertising["id"]],
                self.data,
                conn=self.conn,
            )

            if status_code != 200:
                self.abort_json(
                    {
                        "message": message,
                        "status": "error",
                    },
                    status_code,
                )

            return self.return_success(f"Alteração de preço realizada com sucesso")

    @jwt_required
    @prepare
    def mass_alter_description(self):
        self.validate(MassAlterDescription())
        data = self.data

        advertisings_ids = self.fetchall(
            "SELECT sa.id FROM shopee.advertisings sa WHERE sa.account_id = :id",
            {"id": data["account_id"]},
        )

        advertisings_ids_array = (
            data["adverts_ids"]
            if "adverts_ids" in data and data["adverts_ids"]
            else [ad["id"] for ad in advertisings_ids]
        )

        advertising_alter_decription_many = queue.signature(
            "local_priority:shopee_alter_description_many"
        )
        advertising_alter_decription_many.delay(
            data["user_id"], data["account_id"], advertisings_ids_array
        )

        return self.return_success(
            f"Alteração de descrição em massa de {len(advertisings_ids_array)} anúncios iniciada. Confira o andamento em processos"
        )

    @jwt_required
    @prepare
    def mass_duplicate_own_advertising(self):
        self.validate(AdvertisingListSchema())
        request_data = self.data
        advertisings_id = [
            str(advertising["id"]) for advertising in request_data["advertisings"]
        ]
        advertisings_id = ",".join(advertisings_id)

        tool = self.get_tool("duplicate-advertisings-shopee")

        if "confirmed" not in request.args or request.args["confirmed"] not in [
            "0",
            "1",
        ]:
            self.abort_json(
                {
                    "message": "Preencha o parâmetro de confirmação.",
                    "status": "error",
                },
                400,
            )
        else:
            confirmed = True if request.args.get("confirmed", "0") == "1" else False
            select_all = True if request.args.get("select_all", "0") == "1" else False

        subscription_required = tool["access_type"] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id = self.apply_filter(
            request,
            subscription_required=subscription_required,
            mass_operation=True,
            advertisings_id=advertisings_id,
            platform="SP",
        )

        total_price = str(
            filter_total * tool["price"] * len(request_data["account_id"])
        )
        total_price = total_price[:-3] + "," + total_price[-2:]
        tool_price = str(tool["price"])[:-3] + "," + str(tool["price"])[-2:]
        price_msg = f"Créditos: {len(request_data['account_id'])} conta(s) x {filter_total} anúncio(s) x R$ {tool_price} = R$ {total_price}"

        if not confirmed and filter_total > 1:
            return self.return_success(
                f"A operação replicará: {filter_total} anúncios. {price_msg}"
            )
        elif not confirmed and filter_total == 1:
            advertising = self.fetchone(
                "SELECT ad.id, ad.name FROM shopee.advertisings ad JOIN shopee.accounts ac ON ac.id = ad.account_id "
                + filter_query,
                filter_values,
            )
            return self.return_success(
                f"A operação replicará o anúncio #{advertising['id']} - {advertising['name']}. {price_msg}"
            )
        elif not confirmed:
            return self.return_success(f"A operação não replicará nenhum anúncio.")

        if filter_total == 0:
            return self.return_success("Nenhum anúncio será replicado.")

        code, message = verify_tool_access(
            self,
            self.user["id"],
            accounts_id,
            tool,
            filter_total * len(request_data["account_id"]),
        )

        if code != 200:
            self.abort_json(
                {
                    "message": message,
                    "status": "error",
                },
                code,
            )

        advertising_duplicate_many = queue.signature('local_priority:shopee_advertising_duplicate_many_owned')
        advertising_duplicate_many.delay(self.user['id'], filter_query, filter_values, filter_total, request_data, select_all)
        return self.return_success(f"Replicação em massa de {filter_total} anúncios iniciada. Confira o andamento em processos")

    @jwt_required
    @prepare
    def mass_replicate_advertising_mercadolibre(self):
        self.validate(AdvertisingReplicateSchema())
        request_data = self.data
        
        advertisings = request_data.get('attributes', {}).get('advertisings', [])
        accounts_id = request_data.get('attributes', {}).get('account_id', [])
        
        tool = self.get_tool('duplicate-advertisings-ml-sp')

        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message': 'Preencha o parâmetro de confirmação.',
                'status': 'error',
            }, 400)
        else:
            confirmed = True if request.args.get('confirmed','0') == '1' else False

        filter_total = len(advertisings)
        total_price = str(filter_total * tool['price'] * len(accounts_id))
        total_price = total_price[:-3] + ',' + total_price[-2:]
        tool_price = str(tool['price'])[:-3] + ',' + str(tool['price'])[-2:]
        price_msg = f"Créditos: {len(accounts_id)} conta(s) x {filter_total} anúncio(s) x R$ {tool_price} = R$ {total_price}"

        if not confirmed and filter_total > 1:
            return self.return_success(f"A operação replicará: {filter_total} anúncios. {price_msg}")
        elif not confirmed and filter_total == 1:
            return self.return_success(f"A operação replicará o anúncio #{advertisings[0]['title']}. {price_msg}")
        elif not confirmed:
            return self.return_success(f"A operação não replicará nenhum anúncio.")

        if filter_total == 0:
            return self.return_success("Nenhum anúncio será replicado.")

        code, message = verify_tool_access(self, self.user['id'], accounts_id, tool, filter_total * len(accounts_id))

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        advertising_replicate_mercadolibre_many = queue.signature('local_priority:advertising_replicate_mercadolibre_many')
        advertising_replicate_mercadolibre_many.delay(self.user['id'], filter_total, request_data)
        return self.return_success(f"Replicação em massa de {filter_total} anúncios iniciada. Confira o andamento em processos")
       
