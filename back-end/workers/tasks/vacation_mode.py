import json
import traceback
from celery.utils.log import get_task_logger
from datetime import datetime, timedelta
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn  
from libs.enums.access_type import AccessType      
from libs.queue.queue import app as queue
from workers.helpers import get_tool, get_advertisings, get_account_advertisings_info
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits

LOGGER = get_task_logger(__name__)
PAUSADOS = 1
PRAZO_ENVIO = 2
PRAZO_MAXIMO = 45
TOOL_ID_PAUSAR=59
TOOL_ID_PRAZO=60
TOOL_ID_REMOVER_PAUSA=61
TOOL_ID_REMOVER_PRAZO=62

def vacation_bihourly_check_start_pending():
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = f"""
            SELECT vc.*, subquery.latest_account_expiration_date as expiration_date 
            FROM meuml.vacations vc
			JOIN (	
                SELECT sa.account_id, max(su.expiration_date) as latest_account_expiration_date
                FROM meuml.subscriptions su
                JOIN meuml.subscription_accounts sa on sa.subscription_id = su.id 
                WHERE su.package_id = 2 OR string_to_array(su.modules, ',') @> array['6']
                GROUP BY sa.account_id 
            ) subquery ON subquery.account_id = vc.account_id 
            WHERE has_started IS TRUE AND pending_start IS TRUE AND vacation_type = :vacation_type AND date_modified < (now() - interval '1' day) AND has_finished IS FALSE
        """
        vacations = action.fetchall(query, {'vacation_type': PAUSADOS})

        for vacation in vacations:
            if vacation['expiration_date'] > datetime.now():
                user_id = vacation['user_id']
                vacation_id = vacation['id']
                tag_id = vacation['tag_id']

                filter_query = f"""
                    WHERE ac.user_id = :user_id AND ad.status = 'active' AND EXISTS (
                        SELECT ti3.id
                        FROM meuml.tagged_items ti3
                        WHERE ti3.tag_id = {tag_id} AND ti3.item_id = ad.external_id
                    ) GROUP BY ad.id, ac.id
                """
                filter_values = {'user_id': user_id}

                update_query = "UPDATE meuml.vacations SET date_modified=NOW() WHERE id = :id"
                tool = get_tool(action, 'vacation-pause')
                advertising_status_set_many = queue.signature('local_priority:advertising_status_set_many')
                advertising_status_set_many.delay(user_id=user_id, filter_query=filter_query, filter_values=filter_values, status='paused', tool=tool, related_id=vacation_id)
                action.execute(update_query, {'id': vacation['id']})
            else:
                tool_id = TOOL_ID_PAUSAR if vacation['vacation_type'] == PAUSADOS else TOOL_ID_PRAZO
                process_id = create_process(vacation['account_id'], vacation['user_id'], tool_id, 0, 1, action)
                create_process_item(process_id, vacation['account_id'], vacation['id'], action, 'Agendamento de inicialização não realizado pois a assinatura venceu', tool_id, "ML", 0)

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def vacation_bihourly_check_end_pending():
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = f"""
            SELECT vc.*, subquery.latest_account_expiration_date as expiration_date 
            FROM meuml.vacations vc
			JOIN (	
                SELECT sa.account_id, max(su.expiration_date) as latest_account_expiration_date
                FROM meuml.subscriptions su
                JOIN meuml.subscription_accounts sa on sa.subscription_id = su.id 
                WHERE su.package_id = 2 OR string_to_array(su.modules, ',') @> array['6']
                GROUP BY sa.account_id 
            ) subquery ON subquery.account_id = vc.account_id 
            WHERE has_finished IS TRUE AND pending_finish IS TRUE AND date_modified < (now() - interval '1' day)  
        """
        vacations = action.fetchall(query)

        for vacation in vacations:
            if vacation['expiration_date'] > datetime.now():
                if vacation['vacation_type'] == PAUSADOS:
                    user_id = vacation['user_id'] 
                    vacation_id = vacation['id']
                    tag_id = vacation['tag_id']
                    
                    filter_query = f"""
                        WHERE ac.user_id = :user_id AND ad.status = 'paused' AND EXISTS (
                            SELECT ti3.id
                            FROM meuml.tagged_items ti3 
                            WHERE ti3.tag_id = {tag_id} AND ti3.item_id = ad.external_id 
                        ) GROUP BY ad.id, ac.id 
                    """
                    filter_values = {'user_id': user_id}
                    tool = get_tool(action, 'vacation-unpause')
                    advertising_status_set_many = queue.signature('local_priority:advertising_status_set_many')
                    advertising_status_set_many.delay(user_id=user_id, filter_query=filter_query, filter_values=filter_values, status='active', tool=tool, related_id=vacation_id)
                    action.execute("UPDATE meuml.vacations SET date_modified=NOW() WHERE id = :id", {'id': vacation['id']})
                else:
                    user_id = vacation['user_id'] 
                    vacation_id = vacation['id']
                    tag_id = vacation['tag_id']
                    
                    filter_query = f"""
                        WHERE ac.user_id = :user_id AND EXISTS (
                            SELECT ti3.id
                            FROM meuml.tagged_items ti3 
                            WHERE ti3.tag_id = {tag_id} AND ti3.item_id = ad.external_id 
                        ) GROUP BY ad.id, ac.id 
                    """
                    filter_values = {'user_id': user_id}
                    tool = get_tool(action, 'vacation-remove-manufacturing-time')
                    advertising_manufacturing_time_set_many = queue.signature('local_priority:advertising_manufacturing_time_set_many')
                    advertising_manufacturing_time_set_many.delay(user_id=user_id, filter_query=filter_query, filter_values=filter_values, days=0, tool=tool, related_id=vacation_id)
                    action.execute("UPDATE meuml.vacations SET date_modified=NOW() WHERE id = :id", {'id': vacation['id']})
            else:
                tool_id = TOOL_ID_REMOVER_PAUSA if vacation['vacation_type'] == PAUSADOS else TOOL_ID_REMOVER_PRAZO
                process_id = create_process(vacation['account_id'], vacation['user_id'], tool_id, 0, 1, action)
                create_process_item(process_id, vacation['account_id'], vacation['id'], action, 'Agendamento de finalização não realizado pois a assinatura venceu', tool_id, "ML", 0)
    
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def vacation_bihourly_check_start():
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = """
            SELECT vc.*, subquery.latest_account_expiration_date as expiration_date 
            FROM meuml.vacations vc
			JOIN (	
                SELECT sa.account_id, max(su.expiration_date) as latest_account_expiration_date
                FROM meuml.subscriptions su
                JOIN meuml.subscription_accounts sa on sa.subscription_id = su.id 
                WHERE su.package_id = 2 OR string_to_array(su.modules, ',') @> array['6']
                GROUP BY sa.account_id 
            ) subquery ON subquery.account_id = vc.account_id 
            WHERE starts_at < NOW() AND ends_at > NOW() AND has_started IS FALSE AND has_finished IS FALSE
        """
        vacations = action.fetchall(query)

        for vacation in vacations:
            if vacation['expiration_date'] > datetime.now():
                vacation_mode_activate(vacation['user_id'], vacation['id'], vacation['tag_id'], action.conn)
            else:
                tool_id = TOOL_ID_PAUSAR if vacation['vacation_type'] == PAUSADOS else TOOL_ID_PRAZO
                process_id = create_process(vacation['account_id'], vacation['user_id'], tool_id, 0, 1, action)
                create_process_item(process_id, vacation['account_id'], vacation['id'], action, 'Agendamento de inicialização não realizado pois a assinatura venceu', tool_id, "ML", 0)

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def vacation_bihourly_check_end():
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = """
            SELECT vc.*, subquery.latest_account_expiration_date as expiration_date 
            FROM meuml.vacations vc
			JOIN (	
                SELECT sa.account_id, max(su.expiration_date) as latest_account_expiration_date
                FROM meuml.subscriptions su
                JOIN meuml.subscription_accounts sa on sa.subscription_id = su.id 
                WHERE su.package_id = 2 OR string_to_array(su.modules, ',') @> array['6']
                GROUP BY sa.account_id 
            ) subquery ON subquery.account_id = vc.account_id 
            WHERE ends_at < NOW() AND has_started IS TRUE AND has_finished IS FALSE
        """
        vacations = action.fetchall(query)

        for vacation in vacations:
            if vacation['expiration_date'] > datetime.now():
                vacation_mode_deactivate(vacation['user_id'], vacation['id'], vacation['tag_id'])
            else:
                tool_id = TOOL_ID_REMOVER_PAUSA if vacation['vacation_type'] == PAUSADOS else TOOL_ID_REMOVER_PRAZO
                process_id = create_process(vacation['account_id'], vacation['user_id'], tool_id, 0, 1, action)
                create_process_item(process_id, vacation['account_id'], vacation['id'], action, 'Agendamento de finalização não realizado pois a assinatura venceu', tool_id, "ML", 0)
    
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def vacation_daily_check():
    try:
        action = QueueActions()
        action.conn = get_conn()

        query = f"""
            SELECT vc.*, subquery.latest_account_expiration_date as expiration_date 
            FROM meuml.vacations vc
			JOIN (	
                SELECT sa.account_id, max(su.expiration_date) as latest_account_expiration_date
                FROM meuml.subscriptions su
                JOIN meuml.subscription_accounts sa on sa.subscription_id = su.id 
                WHERE su.package_id = 2 OR string_to_array(su.modules, ',') @> array['6']
                GROUP BY sa.account_id 
            ) subquery ON subquery.account_id = vc.account_id 
            WHERE vacation_type = :vacation_type AND has_started IS TRUE AND has_finished IS FALSE
        """
        vacations = action.fetchall(query, {'vacation_type': PRAZO_ENVIO})

        tool = get_tool(action, 'vacation-manufacturing-time')
        tool_remove = get_tool(action, 'vacation-remove-manufacturing-time')
        advertising_manufacturing_time_set_many = queue.signature('local_priority:advertising_manufacturing_time_set_many')

        for vacation in vacations:
            if vacation['expiration_date'] > datetime.now():
                today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                duration = (vacation['ends_at'] - today).days

                filter_query = f"""
                    WHERE ac.user_id = :user_id AND EXISTS (
                        SELECT ti3.id
                        FROM meuml.tagged_items ti3 
                        WHERE ti3.tag_id = {vacation['tag_id']} AND ti3.item_id = ad.external_id 
                    ) GROUP BY ad.id, ac.id 
                """
                filter_values = {'user_id': vacation['user_id']}

                if duration <= PRAZO_MAXIMO and vacation['switch_types'] is True:
                    advertising_manufacturing_time_set_many.delay(user_id=vacation['user_id'], filter_query=filter_query, 
                                                            filter_values=filter_values, days=duration, tool=tool, related_id=vacation['id'])
                    action.execute("UPDATE meuml.vacations SET date_modified=NOW(), switch_types=FALSE WHERE id = :id", {'id': vacation['id']})
                elif duration <= 0:                    
                    advertising_manufacturing_time_set_many.delay(user_id=vacation['user_id'], filter_query=filter_query, 
                                                            filter_values=filter_values, days=0, tool=tool_remove, related_id=vacation['id'])
                elif duration < PRAZO_MAXIMO:
                    advertising_manufacturing_time_set_many.delay(user_id=vacation['user_id'], filter_query=filter_query, 
                                                            filter_values=filter_values, days=duration, tool=tool)
            else:
                tool_id = 60
                process_id = create_process(vacation['account_id'], vacation['user_id'], tool_id, 0, 1, action)
                create_process_item(process_id, vacation['account_id'], vacation['id'], action, 'Atualização de prazo de envio não realizado pois a assinatura venceu', tool_id, "ML", 0)
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def vacation_apply_tag(user_id: int, filter_query: str, filter_values: dict, vacation_id: int, accounts_id: list, tag_name: str, starts_at):
    try:
        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, 'vacation-apply-tag')

        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)
        
        tag_item = queue.signature('long_running:tag_item')
        taggable_relation = {
            'id': 1,
            'display_name': 'Anúncios'
        }

        tag_id = action.execute_insert("INSERT INTO meuml.tags (user_id, name) VALUES (:user_id, :tag_name) RETURNING id", {'user_id': user_id, 'tag_name': tag_name})
        action.execute("UPDATE meuml.vacations SET tag_id = :tag_id WHERE id = :vacation_id", {'tag_id': tag_id, 'vacation_id': vacation_id})
        existing_tags = {tag_name: tag_id}
        vacation_id = vacation_id if not starts_at else None

        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                tag_item.delay(user_id, int(account_id), tool['id'], account['process_id'], taggable_relation['id'], taggable_relation['display_name'], advertising, [tag_name], existing_tags, conn=None, vacation_id=vacation_id)
    
    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def vacation_mode_activate(user_id, vacation_id, tag_id, conn=None):
    try:
        action = QueueActions()
        action.conn = conn if conn else get_conn()

        vacation = action.fetchone("SELECT * FROM meuml.vacations WHERE id = :id AND has_started IS FALSE AND has_finished IS FALSE", {'id': vacation_id})
        if not vacation:
            return
        
        if vacation['vacation_type'] == PRAZO_ENVIO:
            starts_at = vacation['starts_at'].replace(hour=0, minute=0, second=0, microsecond=0) if vacation['starts_at'] else datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            duration = (vacation['ends_at'] - starts_at).days

        filter_query = f"""
            WHERE ac.user_id = :user_id AND ad.status = 'active' AND EXISTS (
                SELECT ti3.id
                FROM meuml.tagged_items ti3 
                WHERE ti3.tag_id = {tag_id} AND ti3.item_id = ad.external_id 
            ) GROUP BY ad.id, ac.id 
        """
        filter_values = {'user_id': user_id}

        update_query = "UPDATE meuml.vacations SET has_started = TRUE, date_modified=NOW() WHERE id = :id"

        if vacation['vacation_type'] == PRAZO_ENVIO and duration <= PRAZO_MAXIMO:
            tool = get_tool(action, 'vacation-manufacturing-time')
            advertising_manufacturing_time_set_many = queue.signature('local_priority:advertising_manufacturing_time_set_many')
            advertising_manufacturing_time_set_many.delay(user_id=user_id, filter_query=filter_query, 
                                                    filter_values=filter_values, days=duration, tool=tool)
        else:
            if vacation['vacation_type'] == PRAZO_ENVIO:
                update_query = "UPDATE meuml.vacations SET has_started = TRUE, date_modified=NOW(), switch_types=TRUE WHERE id = :id"
            tool = get_tool(action, 'vacation-pause')
            advertising_status_set_many = queue.signature('local_priority:advertising_status_set_many')
            advertising_status_set_many.delay(user_id=user_id, filter_query=filter_query, filter_values=filter_values, status='paused', tool=tool, related_id=vacation_id)

        action.execute(update_query, {'id': vacation['id']})

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        if conn is None:
            action.conn.close()


def vacation_mode_deactivate(user_id, vacation_id, tag_id, flask_action=None):
    try:
        if not flask_action:
            action = QueueActions()
            action.conn = get_conn()
        else:
            action = flask_action

        vacation = action.fetchone("SELECT * FROM meuml.vacations WHERE id = :id AND has_started IS TRUE AND has_finished IS FALSE", {'id': vacation_id})
        if not vacation:
            return

        additional_condition = "AND ad.status = 'paused'"
        if vacation['vacation_type'] == PRAZO_ENVIO and vacation['switch_types'] is False and flask_action:
            additional_condition = ""

        filter_query = f"""
            WHERE ac.user_id = :user_id {additional_condition} AND EXISTS (
                SELECT ti3.id
                FROM meuml.tagged_items ti3 
                WHERE ti3.tag_id = {tag_id} AND ti3.item_id = ad.external_id 
            ) GROUP BY ad.id, ac.id 
        """
        filter_values = {'user_id': user_id}

        if vacation['vacation_type'] == PRAZO_ENVIO and vacation['switch_types'] is False:
            if flask_action:
                tool = get_tool(action, 'vacation-remove-manufacturing-time')
                advertising_manufacturing_time_set_many = queue.signature('local_priority:advertising_manufacturing_time_set_many')
                advertising_manufacturing_time_set_many.delay(user_id=user_id, filter_query=filter_query, 
                                                        filter_values=filter_values, days=0, tool=tool, related_id=vacation_id)
        else:
            tool = get_tool(action, 'vacation-unpause')
            advertising_status_set_many = queue.signature('local_priority:advertising_status_set_many')
            advertising_status_set_many.delay(user_id=user_id, filter_query=filter_query, filter_values=filter_values, status='active', tool=tool, related_id=vacation_id) 
            
        action.execute("UPDATE meuml.vacations SET has_finished = TRUE, date_modified=NOW() WHERE id = :id", {'id': vacation['id']})
        return True
    except:
        LOGGER.error(traceback.format_exc())
        return False
    finally:
        if not flask_action:
            action.conn.close()   


def vacation_remove_tag(user_id, tag_id):
    try:
        action = QueueActions()
        action.conn = get_conn()

        action.execute("DELETE FROM meuml.tagged_items WHERE tag_id = :tag_id", {'tag_id': tag_id})
        action.execute("DELETE FROM meuml.tags WHERE id = :id", {'id': tag_id})

    except:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
