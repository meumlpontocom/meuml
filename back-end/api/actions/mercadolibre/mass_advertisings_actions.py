import logging
from sqlalchemy import text
from flask import request
from flask_jwt_simple import jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.enums.access_type import AccessType
from libs.queue.queue import app as queue
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.payments.payment_helper import verify_tool_access
from libs.schema.advertisings_schema import (
    AdvertisingListSchema,
    AlterSKUSchema,
    AdvertisingListIdsSchema,
    AdvertisingListShopeeSchema,
)
from math import ceil
from workers.helpers import get_tool
from workers.loggers import create_process, create_process_item
from workers.tasks.mercadolibre.advertising_description_header_footer_add_item import (
    advertising_description_add_header_footer_item,
)
from workers.tasks.mercadolibre.advertising_description_replace_text_item import (
    advertising_description_replace_text_item,
)
from workers.tasks.mercadolibre.advertising_description_set_text_item import (
    advertising_description_text_set_item,
)
from workers.tasks.mercadolibre.advertising_manufacturing_time_set_item import (
    advertising_manufacturing_time_set_item,
)
from workers.tasks.mercadolibre.advertising_price_set_item import (
    advertising_price_set_item,
)
from workers.tasks.mercadolibre.advertising_status_item import (
    advertising_status_set_item,
)
from workers.tasks.mercadolibre.advertising_sku_edit import advertising_sku_set_item
from workers.tasks.mercadolibre.catalog_eligibility import (
    catalog_evaluate_eligibility_set_item,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MassAdvertisingsActions(Actions):
    @jwt_required
    @prepare
    def alter_mass_advertising_description_header_footer(self):
        header = request.form.get("header", "")
        footer = request.form.get("footer", "")
        tag = None

        if len(header) == 0 and len(footer) == 0:
            self.abort_json(
                {
                    "message": f"Preencha o Cabeçalho e/ou o Rodapé",
                    "status": "error",
                },
                400,
            )

        is_single = self.is_single_advertising(request)
        if is_single:
            tool = self.get_tool("alter-header-footer-single")
        else:
            tool = self.get_tool("alter-header-footer")

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

        subscription_required = tool["access_type"] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(
            request,
            additional_conditions=" AND ad.catalog_status != 2 AND ad.status IN ('not_yet_active', 'active', 'paused', 'payment_required') ",
            subscription_required=subscription_required,
            mass_operation=True,
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
            return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success("Nenhum produto elegivel para a alteração.")

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
            advertising_description_add_header_footer = queue.signature(
                "local_priority:advertising_description_header_footer_add_many"
            )
            advertising_description_add_header_footer.delay(
                self.user["id"], filter_query, filter_values, header, footer, tag
            )
            return self.return_success(
                "Alteração em massa de cabeçalho e rodapé de descrição iniciada. Confira o andamento em Processos",
                {},
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

            tool = get_tool(self, "alter-header-footer")
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
            status_code, message = advertising_description_add_header_footer_item(
                None,
                advertising["account_id"],
                tool,
                process_item_id,
                advertising["external_id"],
                header,
                footer,
                self.conn,
            )

            if status_code != 200:
                self.abort_json(
                    {
                        "message": message,
                        "status": "error",
                    },
                    400,
                )
            return self.return_success(f"Alteração de cabeçalho e rodapé concluída")

    @jwt_required
    @prepare
    def alter_mass_advertising_description_replace_text(self):
        required_fields = ["replace_from", "replace_to"]
        filled_fields = request.form

        for field in required_fields:
            if field not in filled_fields:
                self.abort_json(
                    {
                        "message": f"Preencha todos os campos obrigatórios.",
                        "status": "error",
                    },
                    400,
                )

        replace_from = request.form["replace_from"]
        replace_to = request.form["replace_to"]
        tag = None

        is_single = self.is_single_advertising(request)
        if is_single:
            tool = self.get_tool("replace-description-single")
        else:
            tool = self.get_tool("replace_description")

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

        subscription_required = tool["access_type"] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(
            request,
            additional_conditions=" AND ad.catalog_status != 2 AND ad.status IN ('not_yet_active', 'active', 'paused', 'payment_required') ",
            subscription_required=subscription_required,
            mass_operation=True,
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
            return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success("Nenhum produto elegivel para alteração.")

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
            advertising_description_replace_text_many = queue.signature(
                "local_priority:advertising_description_replace_text_many"
            )
            advertising_description_replace_text_many.delay(
                self.user["id"],
                filter_query,
                filter_values,
                replace_from,
                replace_to,
                tag,
            )
            return self.return_success(
                "Substituição em massa de texto de descrição iniciada. Confira o andamento em Processos",
                {},
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
                        "message": f"Anúncio não encontrado",
                        "status": "error",
                    }
                )

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
            status_code, message = advertising_description_replace_text_item(
                None,
                advertising["account_id"],
                tool,
                process_item_id,
                advertising["external_id"],
                replace_from,
                replace_to,
                self.conn,
            )

            if status_code != 200:
                self.abort_json(
                    {
                        "message": message,
                        "status": "error",
                    },
                    400,
                )
            return self.return_success(f"Substituição de texto de descrição concluída.")

    @jwt_required
    @prepare
    def alter_mass_advertising_description_set_text(self):
        required_fields = ["description"]
        filled_fields = request.form

        for field in required_fields:
            if field not in filled_fields:
                self.abort_json(
                    {
                        "message": f"Preencha todos os campos obrigatórios.",
                        "status": "error",
                    },
                    400,
                )

        description = request.form["description"]
        tag = None

        is_single = self.is_single_advertising(request)
        if is_single:
            tool = self.get_tool("alter-fixed-description-single")
        else:
            tool = self.get_tool("alter-fixed-description")

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

        subscription_required = tool["access_type"] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(
            request,
            additional_conditions=" AND ad.catalog_status != 2 AND ad.status IN ('not_yet_active', 'active', 'paused', 'payment_required') ",
            subscription_required=subscription_required,
            mass_operation=True,
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
            return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success("Nenhum produto elegivel para alteração.")

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
            advertising_description_set_many = queue.signature(
                "local_priority:advertising_description_text_set_many"
            )
            advertising_description_set_many.delay(
                user_id=self.user["id"],
                filter_query=filter_query,
                filter_values=filter_values,
                description=description,
                tag=tag,
            )
            return self.return_success(
                "Alteração em massa de texto fixo iniciada. Confira o andamento em Processos",
                {},
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
                    }
                )

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
            status_code, message = advertising_description_text_set_item(
                None,
                advertising["account_id"],
                tool,
                advertising["external_id"],
                description,
                process_item_id,
                self.conn,
            )

            if status_code != 200:
                self.abort_json(
                    {
                        "message": message,
                        "status": "error",
                    }
                )
            return self.return_success(f"Alteração de texto fixo concluída.")

    @jwt_required
    @prepare
    def alter_mass_advertising_manufacturing_time(self):
        MAX_MANUFACTURING_TIME = 45

        if "days" not in request.form:
            self.abort_json(
                {
                    "message": f"Informe todos os campos obrigatórios.",
                    "status": "error",
                },
                400,
            )

        if not request.form.get("days", "").isdigit():
            self.abort_json(
                {
                    "message": f"O número de dias deve ser um inteiro.",
                    "status": "error",
                },
                400,
            )

        days = int(request.form["days"])

        if days > MAX_MANUFACTURING_TIME:
            self.abort_json(
                {
                    "message": f"O prazo máximo de envio é {MAX_MANUFACTURING_TIME} dias.",
                    "status": "error",
                },
                400,
            )

        if days < 0:
            self.abort_json(
                {
                    "message": f"O prazo de envio não pode ser negativo.",
                    "status": "error",
                },
                400,
            )

        is_single = self.is_single_advertising(request)
        if is_single:
            tool = self.get_tool("alter-manufacturing-time-single")
        else:
            tool = self.get_tool("alter-manufacturing-time")

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

        subscription_required = tool["access_type"] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(
            request,
            additional_conditions=" AND ad.status IN ('active', 'paused') ",
            subscription_required=subscription_required,
            mass_operation=True,
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
            return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success("Nenhum produto elegivel para alteração.")

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
            advertising_manufacturing_time_set_many = queue.signature(
                "local_priority:advertising_manufacturing_time_set_many"
            )
            advertising_manufacturing_time_set_many.delay(
                user_id=self.user["id"],
                filter_query=filter_query,
                filter_values=filter_values,
                days=days,
            )
            return self.return_success(
                "Alteração em massa de prazo de envio iniciada. Confira o andamento em Processos",
                {},
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
                    }
                )

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
            status_code, message = advertising_manufacturing_time_set_item(
                None,
                advertising["account_id"],
                tool,
                process_item_id,
                advertising["external_id"],
                days,
                self.conn,
            )

            if status_code != 200:
                self.abort_json(
                    {
                        "message": message,
                        "status": "error",
                    }
                )
            return self.return_success(f"Alteração de prazo de envio concluída.")

    @jwt_required
    @prepare
    def alter_mass_advertising_price(self):
        required_fields = ["price_premium", "price_classic", "price_free", "price_rate"]
        filled_fields = request.form

        for field in required_fields:
            if field not in filled_fields:
                self.abort_json(
                    {
                        "message": f"Informe todos os campos obrigatórios.",
                        "status": "error",
                    },
                    400,
                )

        price_rate = bool(int(request.form["price_rate"]))
        price_premium = float(request.form["price_premium"])
        price_classic = float(request.form["price_classic"])
        price_free = float(request.form["price_free"])

        if price_rate:
            price_premium += 100
            price_classic += 100
            price_free += 100

        is_single = self.is_single_advertising(request)
        if is_single:
            tool = self.get_tool("modify-advertising-price-single")
        else:
            tool = self.get_tool("modify-advertising-price")

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

        subscription_required = tool["access_type"] == AccessType.subscription
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(
            request,
            additional_conditions=" AND ad.status IN ('not_yet_active', 'active', 'paused', 'payment_required') ",
            subscription_required=subscription_required,
            mass_operation=True,
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
            return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success("Nenhum produto elegivel para alteração.")

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
            advertising_price_set_many = queue.signature(
                "local_priority:advertising_price_set_many"
            )
            advertising_price_set_many.delay(
                user_id=self.user["id"],
                filter_query=filter_query,
                filter_values=filter_values,
                price_premium=price_premium,
                price_classic=price_classic,
                price_free=price_free,
                price_rate=price_rate,
            )
            return self.return_success(
                "Alteração em massa de preço iniciada. Confira o andamento em Processos",
                {},
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
                    }
                )

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
            status_code, message = advertising_price_set_item(
                None,
                tool,
                advertising["account_id"],
                advertising["external_id"],
                process_item_id,
                price_premium,
                price_classic,
                price_free,
                price_rate,
                self.conn,
            )

            if status_code != 200:
                self.abort_json(
                    {
                        "message": message,
                        "status": "error",
                    }
                )
            return self.return_success(f"Alteração de preço concluída.")

    @jwt_required
    @prepare
    def alter_mass_advertising_status(self):
        required_fields = ["status"]
        filled_fields = request.form

        for field in required_fields:
            if field not in filled_fields:
                self.abort_json(
                    {
                        "message": "Informe todos os campos obrigatorios.",
                        "status": "error",
                    },
                    400,
                )

        status = request.form["status"]

        is_single = self.is_single_advertising(request)
        if is_single:
            tool = self.get_tool("alter-status-single")
        else:
            tool = self.get_tool("alter-status")

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

        subscription_required = tool["access_type"] == AccessType.subscription
        additional_query = (
            " AND ad.status IN ('active', 'paused', 'closed') "
            if status != "deleted"
            else " AND ad.status = 'closed' "
        )
        filter_values, filter_query, filter_total, accounts_id, *_ = self.apply_filter(
            request,
            additional_conditions=additional_query,
            subscription_required=subscription_required,
            mass_operation=True,
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
            return self.return_success(f"A operação não modificará nenhum anúncio")

        if filter_total == 0:
            return self.return_success("Nenhum produto elegivel para a alteração.")

        code, message = verify_tool_access(self, self.user["id"], accounts_id, tool)

        if code != 200:
            self.abort_json(
                {
                    "message": message,
                    "status": "error",
                },
                code,
            )

        elif filter_total > 1:
            advertising_status_set_many = queue.signature(
                "local_priority:advertising_status_set_many"
            )
            advertising_status_set_many.delay(
                user_id=self.user["id"],
                filter_query=filter_query,
                filter_values=filter_values,
                status=status,
            )
            return self.return_success(
                f"Alteração em massa do status de {filter_total} produtos iniciada. Confira o andamento em processos"
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
            status_code, message = advertising_status_set_item(
                None,
                advertising["account_id"],
                tool,
                process_item_id,
                advertising["external_id"],
                status,
                self.conn,
            )

            if status_code != 200:
                self.abort_json(
                    {
                        "message": message,
                        "error": "status",
                    },
                    400,
                )
            return self.return_success(f"Alteração de status concluída.")

    @jwt_required
    @prepare
    def mass_duplicate_advertising(self):
        if request.method == "GET":
            query = """
                SELECT id, access_token, access_token_expires_at, refresh_token, external_data
                FROM meuml.accounts 
                WHERE user_id=:id
                AND status = 1
                ORDER BY id DESC
            """
            
            accounts = self.fetchall(query, {"id": self.user["id"]})
            accounts_token = [
                self.refresh_token(account, platform="ML") for account in accounts
            ]
            accounts_token = [token for token in accounts_token if token]
            accounts = [account["id"] for account in accounts]

            if len(accounts_token) == 0:
                self.abort_json(
                    {
                        "message": f"É necessário possuir uma conta do Mercado Livre autenticada para continuar.",
                        "status": "error",
                    },
                    403,
                )

            ml_api = MercadoLibreApi(access_token=accounts_token[0]["access_token"])
            page = int(request.args["page"]) if request.args.get("page") else 1
            endpoint = f"/sites/MLB/search"
            limit = 50
            offset = (page - 1) * limit

            params = {
                "limit": limit,
                "offset": offset,
                "adult_content": "yes",
            }

            if "nickname" in request.args:
                params["nickname"] = request.args["nickname"]

            if "keyword" in request.args:
                params["q"] = request.args["keyword"]

            if "category" in request.args:
                params["category"] = request.args["category"]

            if not any(
                key in request.args for key in ["nickname", "keyword", "category"]
            ):
                self.abort_json(
                    {
                        "message": "Esse tipo de pesquisa não é suportado.",
                        "status": "error",
                    },
                    400,
                )

            response = ml_api.get(endpoint, params=params)
            status_code = response.status_code
            response_data = response.json()

            if status_code != 200:
                self.abort_json(
                    {
                        "message": "Erro de comunicação com o Mercado Livre.",
                        "status": "error",
                        "error": response_data,
                    },
                    502,
                )

            results = []
            sellers = {}
            for result in response_data["results"]:
                seller_id = result.get("seller", {}).get("id")
                seller_name = result.get("seller", {}).get("nickname")

                if seller_name:
                    sellers[str(seller_id)] = seller_name
                else:
                    if str(seller_id) in sellers:
                        seller_name = sellers[str(seller_id)]
                    else:
                        response = ml_api.get(f"/users/{seller_id}")
                        if response.status_code == 200:
                            seller_name = response.json().get("nickname")
                            sellers[str(seller_id)] = seller_name

                response = ml_api.get(f"/items/{result['id']}")
                if response.status_code == 200:
                    result = response.json()

                results.append(
                    {
                        "id": result["id"],
                        "permalink": result["permalink"],
                        "thumbnail": result["thumbnail"],
                        "title": result["title"],
                        "category_id": result["category_id"],
                        "site_id": result["site_id"],
                        "price": result["price"],
                        "available_quantity": result.get("available_quantity", 1),
                        "buying_mode": result["buying_mode"],
                        "condition": result["condition"],
                        "listing_type_id": result["listing_type_id"],
                        "attributes": result["attributes"],
                        "shipping": result.get("shipping"),
                        "catalog_listing": result.get("catalog_listing", False),
                        "pictures": result.get("pictures"),
                        "description": result.get("description"),
                        "sale_terms": result.get("sale_terms"),
                        "catalog_product_id": result.get("catalog_product_id"),
                        "variations": result.get("variations"),
                        "seller_id": seller_id,
                        "seller_name": seller_name,
                        "is_owner": True if seller_id in accounts else False,
                    }
                )
            total = response_data["paging"]["total"]

            total = 1000 if total > 1000 else total
            last_page = ceil(total / limit)
            meta = {
                "total": total,
                "offset": offset,
                "limit": limit,
                "pages": last_page + 1,
                "page": page,
                "next_page": page + 1,
                "previous_page": page - 1,
                "last_page": last_page,
                "first_page": 1,
            }
            return self.return_success(data=results, meta=meta)

        elif request.method == "POST":
            self.validate(AdvertisingListSchema())
            request_data = self.data

            accounts_user_product = []
            variations_combinations_count = 0
            ads_variatios_combinations = []
            regular_account = [] # accounts without User Product
            total_advertisings = len(request_data["advertisings"]) if request_data["advertisings"] else 0 # amount of advertisings
            
            try:
                accounts_ids = [str(account_id) for account_id in request_data['account_id']]
                user_products_query = f"""
                    SELECT 
                        id,
                        "name",
                        external_data
                    FROM 
                        meuml.accounts 
                    WHERE 
                        id IN ({','.join(accounts_ids)})
                """

                accounts_with_external_data = self.fetchall(
                    user_products_query
                )

                for account in accounts_with_external_data:
                    external_data = account.get('external_data', {})
                    tags = external_data.get('tags', [])

                    if 'user_product_seller' in tags: # has user_product activated
                        accounts_user_product.append({'account_name': account['name']})
                    else:
                        regular_account.append({'account_name': account['name']})
            except Exception as exc:
                print('erro lendo accounts_response', exc)

            for advertising in request_data["advertisings"]:
                if accounts_user_product == 0:
                    break

                ads_variations = 0
                override = advertising.get('override', {})
                variations = override.get('variations', [])
                ad_title = override.get('title', '')

                for variation in variations:
                    if variation.get('attribute_combinations', None):
                        variations_combinations_count += 1
                        ads_variations += 1
                
                ads_variatios_combinations.append({'ad_title': ad_title, 'variations_count': ads_variations})
                ads_variations = 0

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
                confirmed = True if request.args["confirmed"] == "1" else False

            priceActions = (
                request_data.get("mass_override", {}).get("priceActions")
                if request_data.get("mass_override")
                else None
            )
            if priceActions:
                operationType = priceActions.get("operationType")
                operation = priceActions.get("operation")
                value = priceActions.get("value")

                if (
                    not operationType
                    or operationType == "select"
                    or not operation
                    or operation == "select"
                    or not value
                ):
                    self.abort_json(
                        {
                            "message": "Preencha todos os campos de alteração de preço em massa.",
                            "status": "error",
                        },
                        400,
                    )

            if request.args["select_all"] == "1":
                endpoint = f"/sites/MLB/search"

                params = {
                    "adult_content": "yes",
                }

                if "nickname" in request.args:
                    params["nickname"] = request.args["nickname"]

                if "keyword" in request.args:
                    params["q"] = request.args["keyword"]

                if "category" in request.args:
                    params["category"] = request.args["category"]

                if not any(
                    key in request.args for key in ["nickname", "keyword", "category"]
                ):
                    self.abort_json(
                        {
                            "message": "Esse tipo de pesquisa não é suportado.",
                            "status": "error",
                        },
                        400,
                    )

                accounts_query = """
                    SELECT id, access_token, access_token_expires_at, refresh_token
                    FROM meuml.accounts
                    WHERE user_id = :user_id AND status = 1
                """
                ml_accounts = self.fetchall(
                    accounts_query, {"user_id": self.user["id"]}
                )
                accounts_token = [
                    self.refresh_token(account, platform="ML")
                    for account in ml_accounts
                ]
                accounts_token = [token for token in accounts_token if token]

                if len(accounts_token) == 0:
                    self.abort_json(
                        {
                            "message": f"É necessário possuir uma conta do Mercado Livre autenticada para continuar.",
                            "status": "error",
                        },
                        403,
                    )

                ml_api = MercadoLibreApi(access_token=accounts_token[0]["access_token"])
                response = ml_api.get(endpoint, params=params)
                status_code = response.status_code
                response_data = response.json()

                if status_code != 200:
                    self.abort_json(
                        {
                            "message": "Erro de comunicação com o Mercado Livre.",
                            "status": "error",
                            "error": response_data,
                        },
                        502,
                    )

                total = (
                    1000
                    if response_data["paging"]["total"] > 1000
                    else response_data["paging"]["total"]
                )
                total = total - len(request_data["advertisings"])

                query_string = "&".join(
                    [f"{key}={value}" for key, value in params.items()]
                )
                full_url = f"{endpoint}?{query_string}"
            else:
                endpoint = None
                total = len(request_data["advertisings"])

            total = 1000 if total > 1000 else total

            if len(accounts_user_product) > 0:
                new_total = (variations_combinations_count * len(accounts_user_product)) + (len(regular_account) * total_advertisings)
                total = new_total

            if not confirmed:
                if total > 0:
                    tool = self.get_tool("duplicate-advertisings")
                    total_price = str(
                        total * tool["price"] * len(request_data["account_id"])
                    )

                    if len(accounts_user_product) > 0:
                        total_price = str(tool['price'] * total)

                    total_price = total_price[:-3] + "," + total_price[-2:]
                    tool_price = str(tool["price"])[:-3] + "," + str(tool["price"])[-2:]

                    data = {}

                    if len(accounts_user_product) > 0:
                        data = {
                            'description': """Essa replicação inclui contas com o User Product ativo. Quando um anuncio é replicado de uma conta <b>sem o User Product</b>, 
                            para uma conta <b>com o User Product</b>, cada combinação de variação desse anuncio vira um anuncio novo, e é cobrado como tal.""",
                            'accounts': accounts_user_product,
                            'variations': ads_variatios_combinations
                        }
                        
                    return self.return_success(
                        f"A operação replicará: <b style='color: #ad0000'>{total} anúncio(s)</b>. Créditos: <b style='color: #ad0000'>{len(request_data['account_id'])} conta(s)</b> x <b style='color: #ad0000'>{total} anúncio(s)</b> x R$ {tool_price} = <b style='color: #ad0000'>R$ {total_price}</b>",
                        data=data
                    )
                else:
                    return self.return_success(f"Nenhum anúncio será replicado.")

            advertising_duplicate_many = queue.signature(
                "local_priority:advertising_duplicate_many"
            )

            print('queueing replication')

            advertising_duplicate_many.delay(
                user_id=self.user["id"],
                data=request_data,
                total=total,
                query_endpoint=(
                    full_url if request.args["select_all"] == "1" else endpoint
                ),
            )

            return self.return_success(
                f"Replicação de Anúncios iniciada. Confira o andamento em processos"
            )

    @jwt_required
    @prepare
    def mass_duplicate_own_advertising(self):
        self.validate(AdvertisingListSchema())
        request_data = self.data
        advertisings_id = [
            advertising["id"] for advertising in request_data["advertisings"]
        ]
            
        advertisings_id = ",".join(advertisings_id)

        replication_mode = request_data.get('replication_mode', 'standard')
        selected_official_store = request_data.get('selectedOfficialStore', {})

        tool = self.get_tool("duplicate-advertisings")

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
                "SELECT external_id, title FROM meuml.advertisings ad JOIN meuml.accounts ac ON ac.id = ad.account_id "
                + filter_query,
                filter_values,
            )
            return self.return_success(
                f"A operação replicará o anúncio {advertising['external_id']} - {advertising['title']}. {price_msg}"
            )
        elif not confirmed:
            return self.return_success(f"A operação não replicará nenhum anúncio.")

        if filter_total == 0:
            return self.return_success("Nenhum produto será replicado.")

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

        advertising_duplicate_many = queue.signature(
            "local_priority:advertising_duplicate_many_owned"
        )
        advertising_duplicate_many.delay(
            self.user["id"],
            filter_query,
            filter_values,
            filter_total,
            request_data,
            select_all,
            selected_official_store,
            replication_mode
        )
        return self.return_success(
            f"Replicação em massa de {filter_total} anúncios iniciada. Confira o andamento em processos"
        )

    @jwt_required
    @prepare
    def mass_replicate_advertising_shopee(self):
        self.validate(AdvertisingListShopeeSchema())
        request_data = self.data

        tool = self.get_tool("duplicate-advertisings-sp-ml")

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

        accounts_id = request_data["accounts_id"]
        filter_total = len(request_data["advertisings"])
        filter_total = request_data.get('variations_amount', filter_total)

        total_price = str(filter_total * tool["price"] * len(accounts_id))
        total_price = total_price[:-3] + "," + total_price[-2:]
        tool_price = str(tool["price"])[:-3] + "," + str(tool["price"])[-2:]
        price_msg = f"Créditos: {len(accounts_id)} conta(s) x {filter_total} anúncio(s) x R$ {tool_price} = R$ {total_price}"

        if not confirmed and filter_total > 1:
            return self.return_success(
                f"Esse anúncio possui variações, e a conta selecionada possui User Product ativo, portanto operação replicará: {filter_total} anúncios. {price_msg}. Para entender mais sobre essa cobrança, leia o anúncio no topo da página de replicação!"
            )
        elif not confirmed and filter_total == 1:
            return self.return_success(
                f"A operação replicará o anúncio {request_data['advertisings'][0]['title']}. {price_msg}"
            )
        elif not confirmed:
            return self.return_success(f"A operação não replicará nenhum anúncio.")

        if filter_total == 0:
            return self.return_success("Nenhum produto será replicado.")

        code, message = verify_tool_access(
            self, self.user["id"], accounts_id, tool, filter_total * len(accounts_id)
        )

        if code != 200:
            self.abort_json(
                {
                    "message": message,
                    "status": "error",
                },
                code,
            )

        advertising_replicate_shopee_many = queue.signature(
            "local_priority:advertising_replicate_shopee_many"
        )
        advertising_replicate_shopee_many.delay(
            self.user["id"], filter_total, request_data
        )
        return self.return_success(
            f"Replicação em massa de {filter_total} anúncios iniciada. Confira o andamento em processos"
        )

    @jwt_required
    @prepare
    def edit_sku(self):
        self.validate(AlterSKUSchema())
        request_data = self.data
        advertisings_id = ",".join(request_data["advertisings_id"])

        is_single = self.is_single_advertising(request, advertisings_id)
        if is_single:
            tool = self.get_tool("alter-sku-single")
        else:
            tool = self.get_tool("alter-sku")

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
            advertising_sku_set_many = queue.signature(
                "local_priority:advertising_sku_set_many"
            )
            advertising_sku_set_many.delay(
                user_id=self.user["id"],
                filter_query=filter_query,
                filter_values=filter_values,
                sku=request_data["sku"],
                variations_sku=request_data.get("variations_sku"),
            )
            return self.return_success(
                f"Alteração de SKU em massa de {filter_total} anúncios iniciada. Confira o andamento em processos"
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
            status_code, message = advertising_sku_set_item(
                advertising["account_id"],
                tool,
                process_item_id,
                advertising["external_id"],
                request_data["sku"],
                request_data.get("variations_sku"),
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

    @jwt_required
    @prepare
    def mass_evaluate_eligibility(self):
        self.validate(AdvertisingListIdsSchema())
        request_data = self.data
        advertisings_id = ",".join(request_data["advertisings_id"])

        is_single = self.is_single_advertising(request, advertisings_id)
        if is_single:
            tool = self.get_tool("evaluate-eligibility-single")
        else:
            tool = self.get_tool("evaluate-eligibility")

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
            advertising_sku_set_many = queue.signature(
                "local_priority:catalog_evaluate_eligibility_set_many"
            )
            advertising_sku_set_many.delay(
                user_id=self.user["id"],
                filter_query=filter_query,
                filter_values=filter_values,
            )
            return self.return_success(
                f"Marcar anúncios para avaliação de catálogo em massa de {filter_total} anúncios iniciada. Confira o andamento em processos"
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
            status_code, message = catalog_evaluate_eligibility_set_item(
                advertising["account_id"],
                tool,
                process_item_id,
                advertising["external_id"],
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
