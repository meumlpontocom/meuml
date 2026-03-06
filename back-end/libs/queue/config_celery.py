import settings
import os
import libs.queue.task_router
from celery.schedules import crontab


class Celery:

    broker_url = f"redis://:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_URL')}:{os.getenv('REDIS_PORT')}/"
    accept_content = [os.getenv('accept_content')]
    task_serializer = os.getenv('task_serializer')
    result_serializer = os.getenv('result_serializer')
    enable_utc = os.getenv('enable_utc')
    include = [os.getenv('tasks_folder')]
    task_routes = ('libs.queue.task_router.TaskRouter',)
    
    use_tz = False
    timezone = 'UTC'
    worker_prefetch_multiplier=1
