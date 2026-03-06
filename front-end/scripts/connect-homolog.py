import os

server_ip = os.environ.get('HOMOLOG_IP')

server_pwd = os.environ.get('HOMOLOG_PWD')

os.system('sshpass -p '+ server_pwd +' ssh -o StrictHostKeyChecking=no root@' + server_ip)
