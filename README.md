# meuml

Gerenciador de Marketplaces

# Como executar o projeto localmente

## Back-end

- Nevagar para o root do back-end:

```
cd back-end
```

- Criar `venv`:

```
python3 -m venv venv
```

- Entrar na venv:

```
source venv/bin/activate
```

- Instalar dependências:

```
pip install -r requirements.txt
```

<!-- - Executar migrations (Tem que estar no venv)

```
flask db upgrade
``` -->

- Executar a aplicação:

```
./application.sh
```

## Front-end

- Nevagar para o root do front-end:

```
cd front-end
```

- Trocar versão do node

```
nvm use 16
```

- Instalar as dependências

```
npm i
```

- Instalar as dependências (com warning mesmo)

```
npm i --legacy-peer-deps
```

- Executar a aplicação

```
npm start
```

<!-- ## Subir banco de dados local

```
docker compose up -d
``` -->
