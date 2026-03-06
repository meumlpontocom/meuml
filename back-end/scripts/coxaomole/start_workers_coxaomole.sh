#!/bin/bash

cd /application/back-end/meuml-v2
pm2 start ecosystem-coxaomole.config.js --no-autorestart
