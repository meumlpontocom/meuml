pkill celery
pm2 restart "celery_workers" && reload "celery_workers"
pm2 flush "celery_workers"
