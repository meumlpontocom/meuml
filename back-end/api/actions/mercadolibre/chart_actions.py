from flask import request
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.enums.access_type import AccessType
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access
from libs.queue.queue import app as queue
from libs.schema.chart_schema import (
    ChartModificationTemplateSchema,
    ChartRowTemplateSchema,
    ChartSearchSchema,
    ChartTemplateSchema,
    ChartAdvertisingSelectionSchema,
)
from workers.helpers import get_tool
from workers.loggers import create_process, create_process_item
from workers.tasks.mercadolibre.chart_advertisings import chart_advertisings_set_item


class ChartActions(Actions):
    @jwt_required
    @prepare
    def chart_add_row(self, chart_id):
        self.validate(ChartRowTemplateSchema())
        request_data = self.data

        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
        """
        ml_account = self.fetchone(
            account_query,
            {"user_id": self.user["id"], "account_id": request_data["account_id"]},
        )

        account_token = self.refresh_token(ml_account, platform="ML")

        if not account_token:
            self.abort_json(
                {
                    "message": f"""
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                """,
                    "status": "error",
                },
                403,
            )

        ml_api = MercadoLibreApi(access_token=account_token["access_token"])

        json_body = {"attributes": request_data["attributes"]}
        if request_data["type"] in ["STANDARD", "BRAND"]:
            json_body["sites"] = ["MLB"]

        response = ml_api.post(f"/catalog/charts/{chart_id}/rows", json=json_body)
        data = response.json()

        if response.status_code not in [200, 201]:
            self.abort_json(
                {
                    "message": f"Erro de comunicação com o Mercado Livre",
                    "status": "error",
                    "details": data,
                },
                response.status_code,
            )
        return self.return_success(data={})

    @jwt_required
    @prepare
    def chart_update_row(self, chart_id, row_id):
        self.validate(ChartRowTemplateSchema())
        request_data = self.data

        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
        """
        ml_account = self.fetchone(
            account_query,
            {"user_id": self.user["id"], "account_id": request_data["account_id"]},
        )

        account_token = self.refresh_token(ml_account, platform="ML")

        if not account_token:
            self.abort_json(
                {
                    "message": f"""
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                """,
                    "status": "error",
                },
                403,
            )

        ml_api = MercadoLibreApi(access_token=account_token["access_token"])

        json_body = {"attributes": request_data["attributes"]}
        if request_data["type"] in ["STANDARD", "BRAND"]:
            json_body["sites"] = ["MLB"]

        response = ml_api.put(
            f"/catalog/charts/{chart_id}/rows/{row_id}", json=json_body
        )
        data = response.json()

        if response.status_code not in [200, 201]:
            self.abort_json(
                {
                    "message": f"Erro de comunicação com o Mercado Livre",
                    "status": "error",
                    "details": data,
                },
                response.status_code,
            )
        return self.return_success(data={})

    @jwt_required
    @prepare
    def chart_update(self, chart_id):
        self.validate(ChartModificationTemplateSchema())
        request_data = self.data

        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
        """
        ml_account = self.fetchone(
            account_query,
            {"user_id": self.user["id"], "account_id": request_data["account_id"]},
        )

        account_token = self.refresh_token(ml_account, platform="ML")

        if not account_token:
            self.abort_json(
                {
                    "message": f"""
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                """,
                    "status": "error",
                },
                403,
            )

        ml_api = MercadoLibreApi(access_token=account_token["access_token"])

        if request_data["chart"].get("name"):
            request_data["chart"]["names"] = {"MLB": request_data["chart"].pop("name")}

        response = ml_api.put(f"/catalog/charts/{chart_id}", json=request_data["chart"])
        data = response.json()

        if response.status_code not in [200, 201]:
            self.abort_json(
                {
                    "message": f"Erro de comunicação com o Mercado Livre",
                    "status": "error",
                    "details": data,
                },
                response.status_code,
            )

        return self.return_success(data={})

    @jwt_required
    @prepare
    def create_chart(self):
        self.validate(ChartTemplateSchema())
        request_data = self.data

        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
        """
        ml_account = self.fetchone(
            account_query,
            {"user_id": self.user["id"], "account_id": request_data["account_id"]},
        )

        account_token = self.refresh_token(ml_account, platform="ML")

        if not account_token:
            self.abort_json(
                {
                    "message": f"""
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                """,
                    "status": "error",
                },
                403,
            )

        ml_api = MercadoLibreApi(access_token=account_token["access_token"])

        response = ml_api.post(
            f"/catalog/charts",
            json={
                "names": {"MLB": request_data["name"]},
                "domain_id": request_data["domain_id"],
                "site_id": "MLB",
                "attributes": request_data["attributes"],
                "main_attribute": request_data["main_attribute"],
                "rows": request_data["rows"],
            },
        )
        data = response.json()

        if response.status_code not in [200, 201]:
            self.abort_json(
                {
                    "message": f"Erro de comunicação com o Mercado Livre",
                    "status": "error",
                    "details": data,
                },
                response.status_code,
            )

        return self.return_success(data=data)

    @jwt_required
    @prepare
    def charts_search(self):
        self.validate(ChartSearchSchema())
        request_data = self.data

        # print('request data - ', request_data)

        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
        """
        ml_account = self.fetchone(
            account_query,
            {"user_id": self.user["id"], "account_id": request_data["account_id"]},
        )

        # print('found account - ', ml_account)

        account_token = self.refresh_token(ml_account, platform="ML")

        # print('account token - ', account_token)

        if not account_token:
            self.abort_json(
                {
                    "message": f"""
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                """,
                    "status": "error",
                },
                403,
            )

        ml_api = MercadoLibreApi(access_token=account_token["access_token"])

        data = {}

        for filter_type in ["SPECIFIC", "STANDARD", "BRAND"]:
            attributes = request_data["attributes"]

            if filter_type == 'SPECIFIC':
                gender_attribute = next((attribute for attribute in attributes if attribute['id'] == 'GENDER'), None)

                if gender_attribute:
                    attributes = [gender_attribute]

            chart_filter = {
                "seller_id": ml_account["id"],
                "site_id": "MLB",
                "domain_id": request_data["domain_id"],
                "type": filter_type,
                "attributes": attributes,
            }
            response = ml_api.post(f"/catalog/charts/search", json=chart_filter)
            data[filter_type] = response.json()

            if response.status_code != 200:
                self.abort_json(
                    {
                        "message": f"Erro de comunicação com o Mercado Livre",
                        "status": "error",
                        "details": data,
                    },
                    response.status_code,
                )

        # response = ml_api.post(
        #     f"/domains/MLB-{request_data['domain_id']}/technical_specs/?sections=grid",
        #     json={"attributes": request_data["attributes"]},
        # )

        # if response.status_code != 200:
        #     self.abort_json(
        #         {
        #             "message": f"Erro de comunicação com o Mercado Livre",
        #             "status": "error",
        #             "details": data,
        #         },
        #         response.status_code,
        #     )

        # response_data = response.json()
        # data["CREATE"] = []

        # for attribute in response_data["input"]["groups"][0]["components"][0][
        #     "components"
        # ]:
        #     data["CREATE"].append(attribute["attributes"][0])

        return self.return_success(data=data)

    @jwt_required
    @prepare
    def get_chart(self, chart_id, account_id):
        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
            LIMIT 1
        """
        ml_account = self.fetchone(
            account_query, {"user_id": self.user["id"], "account_id": account_id}
        )

        account_token = self.refresh_token(ml_account, platform="ML")

        if not account_token:
            self.abort_json(
                {
                    "message": f"""
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                """,
                    "status": "error",
                },
                403,
            )

        ml_api = MercadoLibreApi(access_token=account_token["access_token"])

        response = ml_api.get(f"/catalog/charts/{chart_id}")
        data = response.json()

        return self.return_success(data=data)

    @jwt_required
    @prepare
    def technical_specs(self):
        data = {}
        domain = request.args.get("domain")
        account_id = request.args.get("account_id")

        print('arg account id - ', account_id)

        account_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND id = :account_id AND status = 1
            LIMIT 1
        """

        ml_account = self.fetchone(
            account_query, {"user_id": self.user["id"], "account_id": account_id}
        )

        print('found accounts - ', ml_account)

        if not domain or len(domain) == 0:
            self.abort_json({"message": f"Preencha o domínio", "status": "error"}, 400)

        ml_api = MercadoLibreApi(access_token=ml_account["access_token"])

        response = ml_api.get(f"/domains/{domain}/technical_specs")

        if response.status_code != 200:
            self.abort_json(
                {
                    "message": f"Erro de comunicação com o Mercado Livre",
                    "status": "error",
                    "details": data,
                },
                response.status_code,
            )

        data = response.json()
        attributes = []

        for group in data["input"]["groups"]:
            for components in group["components"]:
                for attribute in components["attributes"]:
                    if "grid_template_required" in attribute["tags"]:
                        attributes.append(
                            {
                                "id": attribute["id"],
                                "name": attribute["name"],
                                "values": attribute.get("values"),
                                "value_type": attribute.get("value_type"),
                                "value_max_length": attribute.get("value_max_length"),
                            }
                        )
                    elif "BRAND" == attribute["id"]:
                        attributes.append(
                            {
                                "id": attribute["id"],
                                "name": attribute["name"],
                                "values": attribute.get("values"),
                                "value_type": attribute.get("value_type"),
                                "value_max_length": attribute.get("value_max_length"),
                            }
                        )
                    elif "MODEL" == attribute["id"]:
                        attributes.append(
                            {
                                "id": attribute["id"],
                                "name": attribute["name"],
                                "values": attribute.get("values"),
                                "value_type": attribute.get("value_type"),
                                "value_max_length": attribute.get("value_max_length"),
                            }
                        )
                    elif "grid_filter" in attribute["tags"]:
                        attributes.append(
                            {
                                "id": attribute["id"],
                                "name": attribute["name"],
                                "values": attribute.get("values"),
                                "value_type": attribute.get("value_type"),
                                "value_max_length": attribute.get("value_max_length"),
                            }
                        )

        return self.return_success(data=attributes)

    @jwt_required
    @prepare
    def domains_search(self):
        accounts_query = """
            SELECT id, access_token, access_token_expires_at, refresh_token
            FROM meuml.accounts
            WHERE user_id = :user_id AND status = 1
        """
        ml_accounts = self.fetchall(accounts_query, {"user_id": self.user["id"]})
        accounts_token = [
            self.refresh_token(account, platform="ML") for account in ml_accounts
        ]
        accounts_token = [token for token in accounts_token if token]

        if len(accounts_token) == 0:
            self.abort_json(
                {
                    "message": f"""
                    É necessário possuir uma conta do Mercado Livre
                    autenticada para continuar.
                """,
                    "status": "error",
                },
                403,
            )

        ml_api = MercadoLibreApi(access_token=accounts_token[0]["access_token"])

        data = {}

        _type = request.args.get("type")

        if not _type or len(_type) == 0:
            self.abort_json(
                {"message": f"Preencha o tipo de busca", "status": "error"}, 400
            )

        response = ml_api.post(
            f"/catalog/charts/domains/search", json={"site_id": "MLB", "type": _type}
        )

        if response.status_code == 200:
            data = response.json()

        return self.return_success(data=data)

    @jwt_required
    @prepare
    def chart_advertisings(self):
        self.validate(ChartAdvertisingSelectionSchema())
        request_data = self.data
        advertisings_id = ",".join(request_data["advertisings_id"])

        is_single = self.is_single_advertising(request, advertisings_id)
        if is_single:
            tool = self.get_tool("link-chart-advertisings-single")
        else:
            tool = self.get_tool("link-chart-advertisings")

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
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(
            request,
            subscription_required=subscription_required,
            mass_operation=True,
            advertisings_id=advertisings_id,
        )

        if not confirmed and filter_total > 1:
            return self.return_success(
                f"A operação modificará: {filter_total} anúncios"
            )
        elif not confirmed and filter_total == 1:
            advertising = self.fetchone(
                "SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "
                + filter_query,
                filter_values,
            )
            return self.return_success(
                f"A operação modificará o anúncio {advertising['external_id']} - {advertising['title']}"
            )
        elif not confirmed:
            return self.return_success(f"A operação não modificará nenhum anúncio.")

        if filter_total == 0:
            return self.return_success("Nenhum produto será modificado.")

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

        elif filter_total > 1:
            chart_advertisings_many = queue.signature(
                "local_priority:chart_advertisings_many"
            )
            chart_advertisings_many.delay(
                user_id=self.user["id"],
                filter_query=filter_query,
                filter_values=filter_values,
                chart_id=request_data["chart_id"],
                row_id=request_data["row_id"],
            )
            return self.return_success(
                f"Associação de medidas em massa de {filter_total} anúncios iniciada. Confira o andamento em processos"
            )
        else:
            advertising = self.fetchone(
                "SELECT external_id, title, account_id FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "
                + filter_query,
                filter_values,
            )

            if not advertising:
                self.abort_json(
                    {
                        "message": "Anúncio não encontrado",
                        "status": "error",
                    },
                    400,
                )

            code, message = verify_tool_access(self, self.user["id"], accounts_id, tool)
            process_id = create_process(
                account_id=advertising["account_id"],
                user_id=self.user["id"],
                tool_id=tool["id"],
                tool_price=tool.get("price"),
                items_total=1,
                action=self,
            )
            process_item_id = create_process_item(
                process_id, advertising["account_id"], advertising["external_id"], self
            )
            status_code, message = chart_advertisings_set_item(
                advertising["account_id"],
                tool,
                process_item_id,
                advertising["external_id"],
                request_data["chart_id"],
                request_data["row_id"],
                self.conn,
            )

            if status_code != 200:
                self.abort_json(
                    {
                        "message": message,
                        "error": "status",
                    },
                    status_code,
                )

            return self.return_success(message)
