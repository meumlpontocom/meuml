import json
import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn  
from libs.enums.access_type import AccessType      
from libs.queue.queue import app as queue
from workers.helpers import get_tool, get_advertisings, get_account_advertisings_info, get_files
from workers.loggers import create_process, create_process_item, update_process_item
from workers.payment_helpers import use_credits

LOGGER = get_task_logger(__name__)

def get_or_create_tags(action, user_id, tags):
    select_query = """
        SELECT id, name
        FROM meuml.tags
        WHERE user_id = :user_id
    """
    existing_tags = action.fetchall(select_query, {'user_id': user_id})
    existing_tags = {tag['name']: tag['id'] for tag in existing_tags}

    new_tags = [tag for tag in tags if tag not in existing_tags]

    if len(new_tags) > 0:
        for tag in new_tags:
            insert_query = """
                INSERT INTO meuml.tags (user_id, name)
                VALUES (:user_id, :name)
            """
            action.execute(insert_query, {'user_id': user_id, 'name': tag})

        existing_tags = action.fetchall(select_query, {'user_id': user_id})
        existing_tags = {tag['name']: tag['id'] for tag in existing_tags}

    return existing_tags


def tag_advertisings(user_id: int, filter_query: str, filter_values: dict, tags: list):
    try:
        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, 'tag-items')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)
        
        tag_item = queue.signature('long_running:tag_item')
        taggable_relation = {
            'id': 1,
            'display_name': 'Anúncios'
        }
        existing_tags = get_or_create_tags(action, user_id, tags)

        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                tag_item.delay(user_id, int(account_id), tool['id'], account['process_id'], taggable_relation['id'], taggable_relation['display_name'], advertising, tags, existing_tags)
    
    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def untag_advertisings(user_id: int, filter_query: str, filter_values: dict, tags: list):
    try:
        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, 'untag-items')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        advertisings = get_advertisings(action, user_id, filter_query, filter_values)
        accounts = get_account_advertisings_info(advertisings, action, tool)
        
        untag_item = queue.signature('long_running:untag_item')
        taggable_relation = {
            'id': 1,
            'display_name': 'Anúncios'
        }

        tags_query = "SELECT tg.name FROM meuml.tags tg WHERE tg.id = ANY(:tags)"
        tags_names = action.fetchall(tags_query, {'tags': [int(t) for t in tags]})
        tags_names = [tag['name'] for tag in tags_names]

        for account_id, account in accounts.items():
            advertisings = account['advertisings']

            for advertising in advertisings:
                untag_item.delay(user_id, int(account_id), tool['id'], account['process_id'], taggable_relation['id'], taggable_relation['display_name'], advertising, tags, tags_names)

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def tag_files(user_id: int, filter_query: str, filter_values: dict, tags: list):
    try:
        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, 'tag-items')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        files = get_files(action, user_id, filter_query, filter_values)
        process_id = create_process(account_id=None, user_id=user_id, tool_id=tool['id'], tool_price=tool.get('price'), items_total=len(files), action=action, platform=None)

        tag_item = queue.signature('long_running:tag_item')
        taggable_relation = {
            'id': 3,
            'display_name': 'Arquivos'
        }
        existing_tags = get_or_create_tags(action, user_id, tags)

        for item in files:
            tag_item.delay(user_id, 'NULL', tool['id'], process_id, taggable_relation['id'], taggable_relation['display_name'], item['id'], tags, existing_tags)

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def untag_files(user_id: int, filter_query: str, filter_values: dict, tags: list):
    try:
        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, 'untag-items')
        if tool is None:
            LOGGER.error('Tool not found')
            return

        files = get_files(action, user_id, filter_query, filter_values)
        process_id = create_process(account_id=None, user_id=user_id, tool_id=tool['id'], tool_price=tool.get('price'), items_total=len(files), action=action, platform=None)
        
        untag_item = queue.signature('long_running:untag_item')
        taggable_relation = {
            'id': 3,
            'display_name': 'Arquivos'
        }

        tags_query = "SELECT tg.name FROM meuml.tags tg WHERE tg.id = ANY(:tags)"
        tags_names = action.fetchall(tags_query, {'tags': [int(t) for t in tags]})
        tags_names = [tag['name'] for tag in tags_names]

        for item in files:
            untag_item.delay(user_id, 'NULL', tool['id'], process_id, taggable_relation['id'], taggable_relation['display_name'], item['id'], tags, tags_names)
    
    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def tag_item(user_id, account_id, tool_id, process_id, type_id, type_name, item_id, tags, existing_tags, conn=None, vacation_id=None):
    try:
        action = QueueActions()
        if conn:
            action.conn = conn
            existing_tags = get_or_create_tags(action, user_id, tags)
        else:
            action.conn = get_conn()
            
        success = True
        errors = []

        select_query = f"""
            SELECT tag_id 
            FROM meuml.tagged_items 
            WHERE type_id = {type_id} AND item_id = '{item_id}' 
        """
        item_tags = action.fetchall(select_query)
        item_tags = [tag['tag_id'] for tag in item_tags]

        insert_query = """
            INSERT INTO meuml.tagged_items 
                (tag_id, type_id, item_id) 
            VALUES 
        """
        values = []

        for tag in tags:
            if tag in existing_tags and existing_tags[tag] not in item_tags:
                values.append(f" ({existing_tags[tag]}, {type_id}, '{item_id}') ")

            else:
                success = False
                errors.append(tag)
    
        if len(values) > 0:
            insert_query += ','.join(values)
            action.execute(insert_query)

        if success:
            code = 200
            message = f'Aplicar Tag {type_name} #{item_id} - Tag{"s" if len(tags) > 1 else ""} ({", ".join(tags)}) aplicada{"s" if len(tags) > 1 else ""} com sucesso.'
        else:
            code = 500
            message = f'Aplicar Tag {type_name} #{item_id} - Erro ao aplicar tag{"s" if len(tags) > 1 else ""}: {", ".join(errors)}.'
            
        process_query = f"""
            INSERT INTO meuml.process_items
                (user_id, account_id, process_id, item_external_id, status, message, http_status)
            VALUES ({user_id}, {account_id}, {process_id}, '{item_id}', {1 if success else 0}, '{message}', {code})
        """
        action.execute(process_query)

        if vacation_id:
            query = """
                SELECT p.id, items_total, p.tool_id, p.account_id, p.date_finished,
                        sum(CASE WHEN pit.status = 2 THEN 0 ELSE 1 end) as items_finished 
                    FROM meuml.processes p, meuml.process_items pit 
                    WHERE pit.process_id = p.id AND 
                        p.id = :process_id 
                    GROUP BY p.id 
                    LIMIT 1
            """
            process_data = action.fetchone(query, {'process_id': process_id})

            if process_data and process_data['items_total'] == process_data['items_finished']:
                query = """
                    UPDATE meuml.processes 
                    SET flag = TRUE 
                    WHERE id = :id AND flag IS FALSE
                    RETURNING id 
                """
                row = action.execute_returning(query, {'id': process_data['id']})

                if row:
                    vacation_mode_activate = queue.signature('local_priority:vacation_mode_activate')
                    vacation_mode_activate.delay(user_id, vacation_id, existing_tags[tag])
    
        return code, message

    except Exception as e:
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())

        message =  f'Aplicar Tag #{type_name} - Erro interno ao aplicar tag{"s" if len(tags) > 1 else ""}.' 

        process_query = f"""
            INSERT INTO meuml.process_items
                (user_id, account_id, process_id, item_external_id, status, message, http_status)
            VALUES ({user_id}, {account_id}, {process_id}, '{item_id}', 0, '{message}', 500)
        """
        action.execute(process_query)

        return 500, message
    
    finally:
        process_query = f"""
            UPDATE meuml.processes SET date_finished = now() WHERE id = {process_id} AND items_total = (
               SELECT
                    sum(CASE WHEN pit.status = 2 THEN 0 ELSE 1 end) as item_finished
               FROM meuml.process_items pit
               WHERE pit.process_id = {process_id}
            )
        """
        action.execute(process_query)
        if not conn:
            action.conn.close()


def untag_item(user_id, account_id, tool_id, process_id, type_id, type_name, item_id, tags, tags_names, conn=None):
    try:
        action = QueueActions()
        action.conn = conn if conn else get_conn()
            
        query = f"""
            DELETE FROM meuml.tagged_items 
            WHERE type_id = {type_id} AND item_id = '{item_id}' AND tag_id IN ({','.join(tags)})
        """
        action.execute(query)

        message = f'Remover Tag {type_name} #{item_id} - Tag{"s" if len(tags) > 1 else ""} ({", ".join(tags_names)}) removida{"s" if len(tags) > 1 else ""} com sucesso.'
        process_query = f"""
            INSERT INTO meuml.process_items
                (user_id, account_id, process_id, item_external_id, status, message, http_status)
            VALUES ({user_id}, {account_id}, {process_id}, '{item_id}', 1, '{message}', 200)
        """
        action.execute(process_query)
        
        return 200, message

    except Exception as e:
        LOGGER.error(traceback.format_exc())
        print(traceback.format_exc())

        message =  f'Remover Tag {type_name} #{item_id} - Erro interno ao remover tag{"s" if len(tags) > 1 else ""} ({", ".join(tags_names)}).'
        process_query = f"""
            INSERT INTO meuml.process_items
                (user_id, account_id, process_id, item_external_id, status, message, http_status)
            VALUES ({user_id}, {account_id}, {process_id}, '{item_id}', 0, '{message}', 500)
        """
        action.execute(process_query)

        return 500, message
    
    finally:
        process_query = f"""
            UPDATE meuml.processes SET date_finished = now() WHERE id = {process_id} AND items_total = (
                SELECT
                    sum(CASE WHEN pit.status = 2 THEN 0 ELSE 1 end) as item_finished
                FROM meuml.process_items pit
                WHERE pit.process_id = {process_id}
            )
        """
        action.execute(process_query)
        if not conn:
            action.conn.close()
