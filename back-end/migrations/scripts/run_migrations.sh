#!/bin/bash

# Carregar variáveis do arquivo .env
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Erro: Arquivo .env não encontrado."
  exit 1
fi

# Diretório de migrações (pode ajustar conforme necessário)
MIGRATIONS_DIR="./migrations"

# Verificar se o diretório de migrações existe
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Erro: O diretório de migrações não existe: $MIGRATIONS_DIR"
  exit 1
fi

export PGPASSWORD=$PG_DB_PASSWORD

# Obter a última migração registrada no banco de dados
last_migration=$(psql -h $PG_DB_HOST -p $PG_DB_PORT -U $PG_DB_USER -d $PG_DB_NAME -t -c "SELECT migration_name FROM meuml.migrations ORDER BY migration_name DESC LIMIT 1;" | xargs)

# Iterar sobre os arquivos de migração no diretório
for migration in "$MIGRATIONS_DIR"/*.sql; do
    migration_name=$(basename "$migration")

    # Verificar se a migração é posterior à última registrada
    if [[ "$migration_name" > "$last_migration" ]]; then
        # Executar a migração
        echo "Executando migração: $migration_name"
        psql -h $PG_DB_HOST -p $PG_DB_PORT -U $PG_DB_USER -d $PG_DB_NAME -f "$migration"

        # Verificar se a execução foi bem-sucedida
        if [ $? -eq 0 ]; then
            echo "Registrando migração: $migration_name"
            psql -h $PG_DB_HOST -p $PG_DB_PORT -U $PG_DB_USER -d $PG_DB_NAME -c "INSERT INTO meuml.migrations (migration_name, description) VALUES ('$migration_name', 'Migração executada via script');"
        else
            echo "Erro ao executar a migração: $migration_name"
            exit 1
        fi
    fi
done

# Limpar variáveis de senha
unset PGPASSWORD

echo "Todas as migrações pendentes foram executadas."
