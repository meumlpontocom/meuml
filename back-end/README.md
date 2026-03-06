# MeuML v2

[Drive de Documentação](https://drive.google.com/drive/u/0/folders/1G7zCmQTQ0WPlD4qkZsowRsLtbQ9XqxfY)

## 1. Monitoramento

Zabbix
>http://homolog.app2.meuml.com:8081/

Flower 
>http://api2.app2.meuml.com:9500/ (produção)

>http://api.app2.meuml.com:9500/ (homolog)

Minio
>https://images2.meuml.com/minio/ (produção)

>https://images2.homolog.meuml.com/minio/ (homolog)

PgBadger
>http://homolog.app2.meuml.com:9600/

API (no servidor)
>journalctl -u gunicorn -n 10

Workers (no servidor)
>pm2 log


## 2. Servidores

**Entrecote**: homolog
```bash=
cd scripts/
./homolog.sh
# ou
ssh root@homolog.app2.meuml.com
```

**Chorizo**: banco de dados
```bash=
ssh -i chorizo.pem ubuntu@chorizo.meuml.com
```

**Tbone**: API / Flower / Front / Minio / Redis 
```bash=
ssh -i tbone_priv.pem ubuntu@tbone.meuml.com
```

**Lagarto**: workers principais + backup banco de dados
```bash=
ssh -i lagarto.pem ubuntu@lagarto.meuml.com
```

**Acem**: workers adicionais
```bash=
ssh -i acem.pem ubuntu@acem.meuml.com
```
## 3. Executar/Atualizar

### 3.1 Ambiente DEV
Instalar dependências
```bash=
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Subir Docker-composose (Flower + Redis)
```bash=
docker-compose pull
docker-compose up -d
```

Executar API
```bash=
./application.sh
```

Executar Workers
```bash=
./celery_workers.sh
```

Parar Workers
```bash=
pkill celery
```

### 3.2 Ambiente Homolog
Atualizar API [Em **Entrecote**]
```bash=
service gunicorn restart
```

Atualizar Workers
```bash=
cd /application/back-end/meuml-v2/
pm2 stop all
pm2 flush
pm2 delete all
pm2 start ecosystem-homolog.config.js --no-autorestart
```
>*Bug Flower*: Para as filas serem reconhecidas e aparecerem na aba Monitor é necessário entrar em workers / aba queue

### 3.3 Ambiente Produção
Atualizar API [Em **Tbone**]
```bash=
sudo service gunicorn restart
```

Atualizar Workers [Em **Lagarto**]
>Acessar Flower

>Clicar em cada worker, ex: celery@lagarto1

>Clicar em aba Queues (p. ex: http://api2.app2.meuml.com:9500/worker/celery@lagarto1#tab-queues)

>Clicar em Cancel Consumer

>Repetir cancelamento de filas para todos os workers

>Esperar número de tarefas ativas zerar

>Executar comandos abaixo

```bash=
cd /application/back-end/meuml-v2/
pm2 stop all
pm2 flush
pm2 delete all
pm2 start ecosystem.config.js --no-autorestart
```
>Em **Acem** substituir por `pm2 start ecosystem-acem.config.js --no-autorestart`

## 4. Estrutura

### 4.1 Diretórios
```bash=
.
├── api *(API flask síncrona)*
│   ├── actions 
│   │   ├── mercadolibre
│   │   ├── shopee
│   │   └── \*.py  *(ações comuns entre plataformas / ações internas)*
│   ├── app.py  *(configurações API flask)*
│   └── routes.py  *(rotas)*
├── application.sh *(executor API modo dev)* 
├── celery_workers.sh *(executor workers modo dev)*
├── cron *(coletor de categorias)*
├── libs
│   ├── actions
│   │   ├── actions.py *(classe pai actions API)*
│   │   └── queue_actions.py *(actions usadas pelos workers)*
│   ├── database
│   │   └── database_postgres.py *(configurações abertura de conexãos)*
│   ├── decorator
│   │   └── prepare.py *(leitura do token jwt)*
│   ├── enums
│   ├── exceptions
│   ├── gateways
│   ├── logs
│   ├── mail
│   │   └── mail_templates
│   ├── mercadolibre_api
│   ├── minio_api
│   ├── payments
│   ├── plugnotas_api
│   ├── push
│   ├── queue
│   │   └── worker_action
│   ├── schema
│   ├── shopee_api
│   ├── translations
│   └── whatsapp_api
├── MeuML V2.postman_collection.json 
├── migrations
├── redis
├── scripts
│   └── homolog.sh
└── workers *(tarefas assíncronas pelos workers celery)*
	     ├── app.py *(definições de tarefas / horários cron celery)*
        ├── celery_cron.py
        ├── helpers.py
        ├── loggers.py
        ├── payment_helpers.py
        └── tasks
           ├── mercadolibre
           └── shopee
```

## 4.2 Código

### 4.2.1 API
```python=
from  libs.actions.actions  import  Actions
from  libs.decorator.prepare  import  prepare
from  libs.queue.queue  import  app  as  queue

class  NameActions(Actions):
  @jwt_required
  @prepare
  def route_action_name(self):
    try:
      # Ler 1 item do banco
      self.fetchone("SELECT id FROM meuml.table tb WHERE tb.id = :id_busca", {"id_busca": self.user['id']})
    
      # Ler vários itens do banco
      self.fetchall("SELECT id FROM meuml.table tb WHERE tb.id = :id_busca", {"id_busca": 1})
    
      # Realizar insert/update/delete
      self.execute("DELETE FROM meuml.table tb WHERE tb.id = :id_busca", {"id_busca": 1})
	
      # Enviar tarefa para fila assíncrona
      account_update_external_data = queue.signature('short_running:account_update_external_data')
      account_update_external_data.delay(account_id=account['id'])
	
      return  self.return_success("Sucesso")
    except  HTTPException:
      raise
    except:
      print(traceback.format_exc())
      self.abort_json({
        'message': f'Erro',
        'status': 'error',
      }, 500)
```

### 4.2.2 Workers
```python=
import  traceback
from  libs.actions.queue_actions  import  QueueActions
from  libs.database.database_postgres  import  get_conn
from  celery.utils.log  import  get_task_logger
LOGGER = get_task_logger(__name__)

def task(user_id: int):
  try:
    action = QueueActions()
    action.conn = get_conn()

    # Ler 1 item do banco
    action.fetchone("SELECT id FROM meuml.table tb WHERE tb.id = :id_busca", {"id_busca": user_id})
    
    # Ler vários itens do banco
    action.fetchall("SELECT id FROM meuml.table tb WHERE tb.id = :id_busca", {"id_busca": 1})
    
    # Realizar insert/update/delete
    action.execute("DELETE FROM meuml.table tb WHERE tb.id = :id_busca", {"id_busca": 1})
  except  Exception  as  e:
    LOGGER.error(traceback.format_exc())
  finally:
    action.conn.close()
```

# 5. Outros

Adicionar tarefa diretamente através do terminal:
```bash=
cd /application/back-end/meuml-v2
source venv/bin/activate
celery -A workers.app call long_running:order_import_all --kwargs='{"account_id":195164569,"only_recent_orders":true,"routine":false}'
```

Para editar o daemon da API:
```bash=
sudo vim /etc/systemd/system/gunicorn.service
sudo systemctl daemon-reload
```

Liberar porta Oracle Cloud:
```bash=
firewall-cmd --permanent --zone=public --add-port=6379/tcp
firewall-cmd --reload
```
