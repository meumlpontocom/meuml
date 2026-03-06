#!/bin/bash
DATE=`date --date="1 days ago" +%Y-%m-%d`

rm -Rf /var/lib/postgresql/12/main/log/*$DATE*
rm -Rf /var/lib/postgresql/logs/pg_log_prd/*$DATE*
