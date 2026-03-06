#!/bin/bash

cd /application/back-end/meuml-v2/

source venv/bin/activate

celery -A workers.app control cancel_consumer long_running -d celery@xixo1,celery@xixo2,celery@xixo3,celery@xixo4,celery@xixo5,celery@xixo6,celery@xixo7,celery@xixo8,celery@xixo9,celery@xixo10,celery@xixo11,celery@xixo12,celery@xixo13,celery@xixo14,celery@xixo15

celery -A workers.app control cancel_consumer short_running -d celery@xixo1,celery@xixo2,celery@xixo3,celery@xixo4,celery@xixo5,celery@xixo6,celery@xixo7,celery@xixo8,celery@xixo8,celery@xixo9,celery@xixo10,celery@xixo11,celery@xixo12,celery@xixo13,celery@xixo14,celery@xixo15

celery -A workers.app control cancel_consumer local_priority -d celery@xixo1,celery@xixo2,celery@xixo3,celery@xixo4,celery@xixo5,celery@xixo6,celery@xixo7,celery@xixo8,celery@xixo8,celery@xixo9,celery@xixo10,celery@xixo11,celery@xixo12,celery@xixo13,celery@xixo14,celery@xixo15

celery -A workers.app control cancel_consumer items_queue -d celery@xixo1,celery@xixo2,celery@xixo3,celery@xixo4,celery@xixo5,celery@xixo6,celery@xixo7,celery@xixo8,celery@xixo8,celery@xixo9,celery@xixo10,celery@xixo11,celery@xixo12,celery@xixo13,celery@xixo14,celery@xixo15

celery -A workers.app control cancel_consumer default -d celery@xixo1,celery@xixo2,celery@xixo3,celery@xixo4,celery@xixo5,celery@xixo6,celery@xixo7,celery@xixo8,celery@xixo8,celery@xixo9,celery@xixo10,celery@xixo11,celery@xixo12,celery@xixo13,celery@xixo14,celery@xixo15


