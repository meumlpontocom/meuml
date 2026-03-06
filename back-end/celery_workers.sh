#!/usr/bin/env bash

read_var() {
    VAR=$(grep $1 $2 | xargs)
    IFS="=" read -ra VAR <<< "$VAR"
    echo ${VAR[1]}
}


REDIS_PASSWORD=$(read_var REDIS_PASSWORD .env)
USER1=$(read_var WEBMONITOR_USER1 .env)
PASSWORD1=$(read_var WEBMONITOR_PASSWORD1 .env)
CLEAN_URL=$(read_var CLEAN_URL .env)
ENV=$(read_var ENV .env)


if [ ${ENV} == "Production" ]; then

celery --app=workers.app worker -E -l error --concurrency=7 -n worker1  -O fair --queues local_priority,default & 
celery --app=workers.app worker -E -l error --concurrency=7 -n worker2  -O fair --queues local_priority,long_running &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker3  -O fair --queues short_running &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker4  -O fair --queues local_priority,short_running,long_running &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker5  -O fair --queues local_priority,short_running,long_running &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker6  -O fair --queues local_priority,short_running,long_running &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker7  -O fair --queues local_priority,short_running,items_queue &

celery -A workers.app beat &


elif [ ${ENV} == "Homolog" ]; then

celery --app=workers.app worker -E -l error --concurrency=7 -n worker1  -O fair --queues local_priority,default & 
celery --app=workers.app worker -E -l error --concurrency=7 -n worker2  -O fair --queues local_priority &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker3  -O fair --queues short_running &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker4  -O fair --queues local_priority,short_running,long_running &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker5  -O fair --queues local_priority,short_running,long_running &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker6  -O fair --queues local_priority,short_running,long_running &
celery --app=workers.app worker -E -l error --concurrency=7 -n worker7  -O fair --queues local_priority,short_running,items_queue &

celery -A workers.app beat &


else

celery --app=workers.app worker -E -l warning --concurrency=2 -n worker1 -O fair --queues default,short_running,local_priority,long_running & 
celery --app=workers.app worker -E -l warning --concurrency=2 -n worker2 -O fair --queues local_priority,long_running &

fi
