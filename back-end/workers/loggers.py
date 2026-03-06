import json
import datetime
import os
import re
import traceback
from celery.utils.log import get_task_logger
from flask import Flask
from libs.enums.marketplace import Marketplace
from libs.enums.advertising_status import AdvertisingStatus
from libs.mail.Mail import Mail
from libs.queue.queue import app as queue
from requests import Response

LOGGER = get_task_logger(__name__)
LOG_TOOL_NOT_FOUND = "Tool not found"
ADVERTISING_IMPORT_KEY = 1
ORDER_BLACKLIST_IMPORT_KEY = 3
ORDER_IMPORT_KEY = 4
QUESTION_BLACKLIST_IMPORT_KEY = 5
SHOPEE_IMPORT_ITEM_LIST_KEY = 48
RECENT_ORDER_IMPORT_KEY = 49
VACATION_PAUSE = 59
VACATION_MANUFACTURING_TIME = 60
VACATION_UNPAUSE = 61
VACATION_REMOVE_MANUFACTURING_TIME = 62


class FlaskConfig:
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = os.getenv("MAIL_PORT")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_USE_TLS = False if os.getenv("MAIL_USE_TLS") == "False" else True
    MAIL_USE_SSL = False if os.getenv("MAIL_USE_SSL") == "False" else True


def create_process(
    account_id,
    user_id,
    tool_id,
    tool_price,
    items_total,
    action,
    platform="ML",
    related_id=None,
):
    query = (
        "insert into meuml.processes ("
        "account_id, "
        "user_id,"
        "tool_id,"
        "tool_price,"
        "items_total,"
        "platform,"
        "related_id"
        ") values ("
        ":account_id,"
        ":user_id,"
        ":tool_id,"
        ":tool_price,"
        ":items_total,"
        ":platform,"
        ":related_id"
        ") returning id"
    )
    values = {
        "account_id": account_id,
        "user_id": user_id,
        "tool_id": tool_id,
        "tool_price": tool_price,
        "items_total": items_total,
        "platform": platform,
        "related_id": related_id,
    }
    return action.execute_insert(query, values)


def create_process_item(
    process_id: int,
    account_id: int,
    ml_item_id: int,
    action,
    message="",
    tool_id: int = -1,
    platform=Marketplace.MercadoLibre,
    status=2,
):
    insert_process_item = "insert into meuml.process_items (process_id, account_id, item_external_id, status, message) values (:process_id, :account_id, :item_external_id, :status, :message) returning id"
    values = {
        "process_id": process_id,
        "account_id": account_id,
        "item_external_id": str(ml_item_id),
        "status": status,
        "message": message,
    }

    process_item_id = action.execute_insert(insert_process_item, values)

    return process_item_id


def update_process_item(
    process_item_id: int, response: Response, status: bool, action, message: str
) -> None:
    if process_item_id is None:
        LOGGER.error("Processo não localizado")
        return

    try:
        http_status = response.status_code
    except:
        if response == True:
            http_status = 200
        else:
            http_status = 500

    try:
        if type(response) != bool and http_status >= 300:
            http_body = json.dumps(response.json())
        else:
            http_body = None
    except:
        http_body = None
        pass

    status = int(status) if status is not None else None

    query_update = (
        "update meuml.process_items set "
        "http_status = :http_status, "
        "http_body = :http_body, "
        "status  = :status, "
        "message = :message "
        "where id = :id"
    )
    values = {
        "http_body": http_body,
        "http_status": http_status,
        "status": status,
        "id": process_item_id,
        "message": message,
    }
    action.execute(query_update, values)

    query = """
        SELECT p.id, items_total, p.tool_id, p.account_id, p.date_finished, p.related_id, 
                sum(CASE WHEN pit.status = 2 THEN 0 ELSE 1 end) as items_finished 
            FROM meuml.processes p, meuml.process_items pit 
            WHERE pit.process_id = p.id AND 
                p.id = (SELECT process_id FROM meuml.process_items pi2 WHERE id = :process_item_id) 
            GROUP BY p.id 
            LIMIT 1
    """
    process_data = action.fetchone(query, {"process_item_id": process_item_id})

    if (
        process_data
        and not process_data["date_finished"]
        and process_data["items_total"] == process_data["items_finished"]
    ):
        query = """
            UPDATE meuml.processes 
            SET flag = TRUE 
            WHERE id = :id AND flag IS FALSE
            RETURNING id 
        """
        row = action.execute_returning(query, {"id": process_data["id"]})

        if not row:
            return

        if process_data["tool_id"] in AdvertisingStatus.status.values():
            task = queue.signature(
                "long_running:advertising_stage_parsing",
                args=(
                    process_data["account_id"],
                    process_data["id"],
                    process_data["tool_id"],
                ),
            )
            task.delay()
        elif (
            process_data["tool_id"] == ORDER_IMPORT_KEY
            or process_data["tool_id"] == RECENT_ORDER_IMPORT_KEY
        ):
            task = queue.signature(
                "long_running:order_stage_parsing",
                args=(process_data["account_id"], process_data["id"]),
            )
            task.delay()
        elif process_data["tool_id"] == SHOPEE_IMPORT_ITEM_LIST_KEY:
            task = queue.signature(
                "long_running:shopee_parse_items",
                args=(process_data["account_id"], process_data["id"]),
            )
            task.delay()
        elif (
            process_data["tool_id"] != ORDER_BLACKLIST_IMPORT_KEY
            and process_data["tool_id"] != QUESTION_BLACKLIST_IMPORT_KEY
        ):
            query = """
                UPDATE meuml.processes 
                    SET date_finished = NOW()
                    WHERE id = :process_id 
            """
            action.execute(query, {"process_id": process_data["id"]})

            if (
                process_data["related_id"] is not None
                and process_data["tool_id"] == VACATION_MANUFACTURING_TIME
            ):
                advertising_status_set_many = queue.signature(
                    "local_priority:advertising_status_set_many"
                )

                query = """
                    SELECT tl.*, mt.module_id, COALESCE(mt.access_type, 0) as access_type  
                    FROM meuml.tools tl
                    LEFT JOIN meuml.module_tasks mt ON mt.tool_id = tl.id 
                    WHERE key = 'vacation-unpause'
                """
                tool = action.fetchone(query)

                vacation = action.fetchone(
                    "SELECT * FROM meuml.vacations WHERE id = :id", {'id': process_data['related_id']}
                )
                filter_query = f"""
                    WHERE ac.user_id = :user_id AND EXISTS (
                        SELECT ti3.id
                        FROM meuml.tagged_items ti3 
                        WHERE ti3.tag_id = {vacation['tag_id']} AND ti3.item_id = ad.external_id 
                    ) GROUP BY ad.id, ac.id 
                """
                filter_values = {"user_id": vacation["user_id"]}

                advertising_status_set_many.delay(
                    user_id=vacation["user_id"],
                    filter_query=filter_query,
                    filter_values=filter_values,
                    status="active",
                    tool=tool,
                )

            elif process_data["related_id"] is not None and (
                process_data["tool_id"] == VACATION_PAUSE
                or process_data["tool_id"] == VACATION_UNPAUSE
                or process_data["tool_id"] == VACATION_REMOVE_MANUFACTURING_TIME
            ):
                query = "SELECT count(*) FROM meuml.process_items WHERE process_id = :process_id AND http_status=429"
                count = action.fetchone(query, {'process_id': process_data['id']})
                if count and count["count"] > 0:
                    if process_data["tool_id"] == VACATION_PAUSE:
                        action.execute(
                            "UPDATE meuml.vacations SET pending_start=TRUE WHERE id = :id", {'id': process_data['related_id']}
                        )
                    else:
                        action.execute(
                            "UPDATE meuml.vacations SET pending_finish=TRUE WHERE id = :id", {'id': process_data['related_id']}
                        )
                else:
                    if process_data["tool_id"] == VACATION_PAUSE:
                        action.execute(
                            "UPDATE meuml.vacations SET pending_start=FALSE WHERE id = :id", {'id': process_data['related_id']}
                        )
                    else:
                        action.execute(
                            "UPDATE meuml.vacations SET pending_finish=FALSE, has_finished = TRUE WHERE id = :id", {'id': process_data['related_id']}
                        )
                        vacation = action.fetchone(
                            "SELECT id, user_id, tag_id FROM meuml.vacations WHERE id = :id", {'id': process_data['related_id']}
                        )
                        vacation_remove_tag = queue.signature(
                            "local_priority:vacation_remove_tag"
                        )
                        vacation_remove_tag.delay(
                            vacation["user_id"], vacation["tag_id"]
                        )


def log_daily_routine(task_info):
    duplicate_key_error = "duplicate key value violates unique constraint"

    if duplicate_key_error not in task_info.get("details", ""):
        with open("libs/logs/daily_tasks.log", mode="a+") as log_file:
            task_info["date"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            json_string = json.dumps(task_info)
            log_file.write(json_string + "\n")


def log_daily_routine_timestamp(task, start=False):
    filename = "started_timestamps" if start else task
    mode = "a+" if start else "w"
    with open(f"libs/logs/{filename}.log", mode=mode) as log_file:
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        string = task + "," + timestamp + "\n" if start else timestamp
        log_file.write(string)


def send_daily_log_email():
    LOGGER.error('sending daily email!!')

    try:
        daily_log = {
            "Database backup": {
                "status": "success",
                "details": [],
                "started_timestamp": "",
                "finished_timestamp": "",
            },
            "Lookup advertising visits": {
                "status": "success",
                "details": [],
                "started_timestamp": "",
                "finished_timestamp": "",
            },
            "Find advertising position": {
                "status": "success",
                "details": [],
                "started_timestamp": "",
                "finished_timestamp": "",
            },
            "Lookup PJBank boletos": {
                "status": "success",
                "details": [],
                "started_timestamp": "",
                "finished_timestamp": "",
            },
            "Synchronize advertisings routine": {
                "status": "success",
                "details": [],
                "started_timestamp": "",
                "finished_timestamp": "",
            },
            "Synchronize orders routine": {
                "status": "success",
                "details": [],
                "started_timestamp": "",
                "finished_timestamp": "",
            },
        }

        # Read started timestamp
        with open("libs/logs/started_timestamps.log") as log_file:
            for line in log_file:
                task, timestamp = line.split(",")
                daily_log[task]["started_timestamp"] = timestamp

        # Read finished timestamp
        for task in daily_log.keys():
            with open(f"libs/logs/{task}.log") as log_file:
                daily_log[task]["finished_timestamp"] = log_file.read()

        # Read celery errors
        with open("libs/logs/daily_tasks.log") as log_file:
            for line in log_file:
                entry = json.loads(line)

                daily_log[entry["task"]]["status"] = "failed"
                daily_log[entry["task"]]["details"].append(
                    f'[{entry["date"]}] {entry["details"]}'
                )

        # Read database errors
        if not daily_log["Database backup"]["finished_timestamp"]:
            daily_log["Database backup"]["status"] = "failed"
            daily_log["Database backup"]["details"].append(
                {
                    "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "message": "Finished timestamp has not been found",
                }
            )

        # Create stylized message
        colors = {"success": "#006622", "failed": "#e60000", "not found": "#cc9900"}
        message = ""
        general_status = "Sucesso"
        for task_name, info in daily_log.items():
            message += f'<div> \
                <p style="font-size:20px;margin-bottom:10px;">{task_name}</p> \
                <p style="color:{colors[info["status"]]};margin: 0px 0px 10px 15px;">Started at: {info["started_timestamp"]}</p> \
                <p style="color:{colors[info["status"]]};margin: 0px 0px 10px 15px;">Finished at: {info["finished_timestamp"]}</p> \
                <p style="color:{colors[info["status"]]};margin: 0px 0px 10px 15px;">Status: {info["status"]}</p> \
                <p style="color:{colors[info["status"]]};margin: 0px 0px 10px 15px;">Details: </p>'

            for detail in info["details"]:
                message += f'<br /><span style="color:{colors[info["status"]]};margin: 0px 0px 10px 30px;">{detail}</span>'

            message += "</div><br />"

            if info["status"] == "failed":
                general_status = "Erro"

        app = Flask(__name__)
        app.config.from_object(FlaskConfig)
        mail = Mail(app)
        today = datetime.datetime.today().strftime("%Y-%m-%d")
        email_list = os.getenv("MAIL_LIST").split(",")
        env = os.getenv("ENV")

        # Send email
        with app.app_context():
            email_text = re.sub("    ", "\t", json.dumps(daily_log, indent=4))
            mail.set_subject(
                f"Rotina MeuMLv2 {env} - {today} - {general_status}"
            ).set_recipients(email_list).set_body(message).send()

        open("libs/logs/daily_tasks.log", "w").close()
        open("libs/logs/started_timestamps.log", "w").close()
        open("libs/logs/Database backup.log", "w").close()
        open("libs/logs/Find advertising position.log", "w").close()
        open("libs/logs/Lookup advertising visits.log", "w").close()
        open("libs/logs/Lookup PJBank boletos.log", "w").close()
        open("libs/logs/Synchronize advertisings routine.log", "w").close()
        open("libs/logs/Synchronize orders routine.log", "w").close()
    except:
        open("libs/logs/daily_tasks.log", "w").close()
        open("libs/logs/started_timestamps.log", "w").close()
        open("libs/logs/Database backup.log", "w").close()
        open("libs/logs/Find advertising position.log", "w").close()
        open("libs/logs/Lookup advertising visits.log", "w").close()
        open("libs/logs/Lookup PJBank boletos.log", "w").close()
        open("libs/logs/Synchronize advertisings routine.log", "w").close()
        open("libs/logs/Synchronize orders routine.log", "w").close()

        LOGGER.error(traceback.format_exc())


def send_email(
    email_list, subject_title, body_message, template=None, plain_text_only=False
):
    app = Flask(__name__)
    app.config.from_object(FlaskConfig)
    mail = Mail(app)

    with app.app_context():
        if template is None:
            if not plain_text_only:
                mail.set_subject(subject_title).set_recipients(email_list).set_body(
                    body_message
                ).send()
            else:
                mail.set_subject(subject_title).set_recipients(email_list).send(
                    plain_text=body_message, plain_text_only=True
                )
        else:
            mail.set_subject(subject_title).set_recipients(email_list).set_body(
                template
            ).send(plain_text=body_message)
