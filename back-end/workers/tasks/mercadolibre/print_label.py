import io
import json
import re
import traceback
import zipfile
from celery.utils.log import get_task_logger
from datetime import datetime
from libs.actions.queue_actions import QueueActions
from libs.database.database_postgres import get_conn  
from libs.enums.access_type import AccessType      
from libs.mercadolibre_api.mercadolibre_api import MercadoLibreApi
from libs.minio_api.minio_api import minio_client
from libs.queue.queue import app as queue
from math import ceil
from os import getenv
from PyPDF2 import PdfFileMerger
from workers.helpers import refresh_token, get_account, get_access_token, invalid_access_token, get_tool, chunk_list
from workers.loggers import create_process, create_process_item, update_process_item

LOGGER = get_task_logger(__name__)


def print_label_many(user_id: int, filter_query: str, filter_values: dict, accounts_id: list, file_type: str):
    try:
        action = QueueActions()
        action.conn = get_conn()

        tool = get_tool(action, 'print-label')        
        files = []
        file_index = 0
        chunk_size = 50

        for account_id in accounts_id:
            i = 0

            query = """
                SELECT os.id, od.pack_id
            """
            orders = action.fetchall(query + filter_query + f" AND ac.id = {account_id} GROUP BY od.pack_id, os.id ", filter_values)

            if len(orders) > 0:
                process_id = create_process(account_id=account_id, user_id=user_id, tool_id=tool['id'], tool_price=tool['price'], items_total=ceil(len(orders)/chunk_size), action=action)

            for chunk in chunk_list(orders, chunk_size):
                i += 1
                process_item_id = create_process_item(process_id, account_id, str(i), action)

                labels_file = print_label_batch(action, account_id, chunk, file_type)

                if not labels_file:
                    update_process_item(process_item_id, False, False, action, f"Impressão de Etiqueta - conta #{account_id} - falha ao gerar arquivo de etiquetas {(i-1)*chunk_size+1} - {(i-1)*chunk_size+len(chunk)}")

                else:
                    file_index += 1
                    update_process_item(process_item_id, False, True, action, f"Impressão de Etiqueta - conta #{account_id} - arquivo de etiquetas {(i-1)*chunk_size+1} - {(i-1)*chunk_size+len(chunk)} gerado com sucesso")
                    files.append({'account_id': account_id, 'file_index': file_index, 'response':labels_file})

        if len(files) == 0:
            return

        if file_type == 'pdf':
            extension = 'pdf'
            label_file = merge_pdf_response_files(files)
        else:
            extension = 'zip'
            label_file = zip_response_files(files)

        store_file(action, user_id, label_file, extension)

    except Exception as e:
        LOGGER.error(traceback.format_exc())
    finally:
        action.conn.close()


def print_label_batch(action, account_id, chunk, file_type):      
    try:
        account = get_account(action=action, account_id=account_id)

        access_token = refresh_token(action=action, account=account)
        if access_token == False:
            invalid_access_token(action, account_id, account['user_id'], account['name'])
            return
        else:
            access_token = access_token['access_token']

        ml_api = MercadoLibreApi(access_token=access_token)

        orders_id = [str(order_id['id']) for order_id in chunk]

        response = ml_api.get(f"/shipment_labels", params={
            "shipment_ids": ",".join(orders_id),
            "response_type": file_type
        })
        
        if response.status_code != 200:
            return None

        return response
    except:
        LOGGER.error(traceback.format_exc()) 


def merge_pdf_response_files(files):
    try:
        merge_buffer = io.BytesIO()
        merger = PdfFileMerger()

        for data in files:
            merger.append(io.BytesIO(data['response'].content))

        merger.write(merge_buffer) 
        merger.close()
        
        return merge_buffer.getvalue()
    except:
        LOGGER.error(traceback.format_exc()) 


def zip_response_files(files):
    try:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for data in files:
                filename = re.findall("filename=(.+)", data['response'].headers['content-disposition'])[0]
                filename = ''.join([character for character in filename if character not in ['"', ";"]]).split('.')
                filename = f"{filename[0]}_{data['file_index']}_{data['account_id']}.{filename[1]}"

                zip_file.writestr(filename, data['response'].content)
        
        return zip_buffer.getvalue()
    except:
        LOGGER.error(traceback.format_exc()) 


def store_file(action, user_id, filedata, extension):
    try: 
        bucket_name = 'marketplace-files'
        content_type = f'application/{extension}'
        filename = f'etiquetas_{user_id}_{datetime.now().strftime("%H%M%S_%d%m%Y")}.{extension}'
        filedata = io.BytesIO(filedata)
        length = len(filedata.read())
        path = filename
        
        filedata.seek(0)
        minio_client.put_object(
            bucket_name=bucket_name, 
            object_name=path, 
            data=filedata,
            length=length,
            content_type=content_type
        )

        query = """
            INSERT INTO meuml.marketplace_files (user_id, platform, name, content_type, size, path, url) 
            VALUES (:user_id, :platform, :name, :content_type, :size, :path, :url)
        """
        values = {
            'user_id': user_id,
            'platform': 'ML',
            'name': filename,
            'content_type': content_type,
            'size': length,
            'path': path,
            'url': getenv('IMAGES_URL') + bucket_name + '/' + path
        }
        action.execute(query, values)
    except:
        LOGGER.error(traceback.format_exc()) 
