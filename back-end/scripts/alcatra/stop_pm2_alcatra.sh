#!/bin/bash

cd /application/back-end/meuml-v2
source venv/bin/activate
pm2 stop all
pm2 flush
pm2 delete all

