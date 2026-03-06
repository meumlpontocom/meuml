#!/bin/bash

cd /application/back-end/meuml-v2/

source venv/bin/activate

celery -A workers.app control cancel_consumer long_running -d celery@alcatra1,celery@alcatra2,celery@alcatra3,celery@alcatra4,celery@alcatra5,celery@alcatra6,celery@alcatra7,celery@alcatra8,celery@alcatra9,celery@alcatra10,celery@alcatra11,celery@alcatra12,celery@alcatra13,celery@alcatra14,celery@alcatra15,celery@alcatra16

celery -A workers.app control cancel_consumer short_running -d celery@alcatra1,celery@alcatra2,celery@alcatra3,celery@alcatra4,celery@alcatra5,celery@alcatra6,celery@alcatra7,celery@alcatra8,celery@alcatra9,celery@alcatra10,celery@alcatra11,celery@alcatra12,celery@alcatra13,celery@alcatra14,celery@alcatra15,celery@alcatra16

celery -A workers.app control cancel_consumer local_priority -d celery@alcatra1,celery@alcatra2,celery@alcatra3,celery@alcatra4,celery@alcatra5,celery@alcatra6,celery@alcatra7,celery@alcatra8,celery@alcatra9,celery@alcatra10,celery@alcatra11,celery@alcatra12,celery@alcatra13,celery@alcatra14,celery@alcatra15,celery@alcatra16

celery -A workers.app control cancel_consumer items_queue -d celery@alcatra1,celery@alcatra2,celery@alcatra3,celery@alcatra4,celery@alcatra5,celery@alcatra6,celery@alcatra7,celery@alcatra8,celery@alcatra9,celery@alcatra10,celery@alcatra11,celery@alcatra12,celery@alcatra13,celery@alcatra14,celery@alcatra15,celery@alcatra16

celery -A workers.app control cancel_consumer default -d celery@alcatra1,celery@alcatra2,celery@alcatra3,celery@alcatra4,celery@alcatra5,celery@alcatra6,celery@alcatra7,celery@alcatra8,celery@alcatra9,celery@alcatra10,celery@alcatra11,celery@alcatra12,celery@alcatra13,celery@alcatra14,celery@alcatra15,celery@alcatra16
