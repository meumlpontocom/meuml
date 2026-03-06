cd /application/back-end/meuml-v2/
pm2 stop all
pm2 flush
pm2 delete all
pm2 start ecosystem-homolog.config.js --no-autorestart
