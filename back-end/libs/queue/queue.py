import settings
import os
from celery import Celery
from libs.queue.config_celery import Celery as CONFIG
import libs.queue.task_router

BROKER_URL = f"redis://:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_URL')}:{os.getenv('REDIS_PORT')}/0"
app = Celery('workers.tasks', broker=BROKER_URL)

app.config_from_object(CONFIG)
app.conf.update(
    worker_pool_restarts=True,
)