
import json
import traceback
from celery.utils.log import get_task_logger
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import conn_pool, get_conn
from libs.enums.access_type import AccessType
from libs.enums.marketplace import Marketplace
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.queue.queue import app as queue
from libs.shopee_api.shopee_api import ShopeeApi
from workers.helpers import get_tool
from workers.loggers import create_process, create_process_item, update_process_item

LOGGER = get_task_logger(__name__)


def shopee_import_categories():
    action = QueueActions()
    action.conn = get_conn()

    try:
        admin_account = action.fetchone(
            "SELECT * FROM shopee.accounts WHERE is_admin IS TRUE AND internal_status=1 LIMIT 1")

        if not admin_account:
            LOGGER.error("No authenticated admin account has been found")
            return

        sp_api = ShopeeApi(shop_id=admin_account['id'])

        response = sp_api.post(
            path='/api/v1/item/categories/get', version='v1')
        data = json.loads(response.content)
        error = data.get('error', '')

        if response.status_code != 200 or len(error) > 0:
            LOGGER.error("Error in response : /api/v1/items/get")
            return

        query = """
            INSERT INTO shopee.categories 
                (id, parent_id, name, has_children, days_to_ship_min, days_to_ship_max, is_supp_sizechart) 
            VALUES 
        """
        values = []

        for category in data.get('categories', []):
            values.append(f" ({category['category_id']}, {category['parent_id']}, '{category['category_name']}', {category['has_children']}, {category['days_to_ship_limits']['min_limit']}, {category['days_to_ship_limits']['max_limit']}, '{category['is_supp_sizechart']}') ")

        if len(values) > 0:
            action.execute("TRUNCATE TABLE shopee.categories")
            query += ', '.join(values)
            action.execute(query)

    except Exception:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()
