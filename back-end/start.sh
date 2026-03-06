pkill celery
pm2 delete 0
pm2 start celery_workers.sh --name "celery_workers" --no-autorestart
pm2 flush "celery_workers"
