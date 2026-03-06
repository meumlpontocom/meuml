#!/bin/bash

cd /application/back-end/meuml-v2/

source venv/bin/activate

celery -A workers.app control cancel_consumer long_running -d celery@coxaomole1,celery@coxaomole2,celery@coxaomole3,celery@coxaomole4,celery@coxaomole5,celery@coxaomole6,celery@coxaomole7,celery@coxaomole8

celery -A workers.app control cancel_consumer short_running -d celery@coxaomole1,celery@coxaomole2,celery@coxaomole3,celery@coxaomole4,celery@coxaomole5,celery@coxaomole6,celery@coxaomole7,celery@coxaomole8

celery -A workers.app control cancel_consumer local_priority -d celery@coxaomole1,celery@coxaomole2,celery@coxaomole3,celery@coxaomole4,celery@coxaomole5,celery@coxaomole6,celery@coxaomole7,celery@coxaomole8

celery -A workers.app control cancel_consumer items_queue -d celery@coxaomole1,celery@coxaomole2,celery@coxaomole3,celery@coxaomole4,celery@coxaomole5,celery@coxaomole6,celery@coxaomole7,celery@coxaomole8

celery -A workers.app control cancel_consumer default -d celery@coxaomole1,celery@coxaomole2,celery@coxaomole3,celery@coxaomole4,celery@coxaomole5,celery@coxaomole6,celery@coxaomole7,celery@coxaomole8

