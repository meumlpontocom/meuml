#!/usr/bin/env bash

read_var() {
    VAR=$(grep $1 $2 | xargs)
    IFS="=" read -ra VAR <<< "$VAR"
    echo ${VAR[1]}
}

API_DEBUG=$(read_var API_DEBUG .env)
API_HOST=$(read_var API_HOST .env)
API_PORT=$(read_var API_PORT .env)
#HTTPS_CERT=$(read_var HTTPS_CERT .env)
#HTTPS_KEY=$(read_var HTTPS_KEY .env)

# if [ -z "$HTTPS_CERT" ]; then
  FLASK_APP=api.app:app  FLASK_DEBUG=${API_DEBUG} flask run --host=${API_HOST} --port=${API_PORT}
# else
#   FLASK_APP=api.app:app  FLASK_DEBUG=${API_DEBUG} flask run --host=${API_HOST} --port=${API_PORT}  --cert=${HTTPS_CERT} --key=${HTTPS_KEY}
# fi

