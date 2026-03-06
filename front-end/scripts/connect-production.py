import os

server_ip = os.environ.get('PRODUCTION_IP')

server_pwd = os.environ.get('PRODUCTION_PWD')

os.system('sshpass -p '+ server_pwd +' ssh -o StrictHostKeyChecking=no root@' + server_ip)
