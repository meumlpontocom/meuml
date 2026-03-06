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

# Definir a senha do banco de dados via PGPASSWORD para evitar prompt de senha
export PGPASSWORD=$PG_DB_PASSWORD

# Função para verificar se uma migração já está registrada
function migration_registered {
    local migration_name="$1"
    result=$(psql -h $PG_DB_HOST -p $PG_DB_PORT -U $PG_DB_USER -d $PG_DB_NAME -t -c "SELECT COUNT(*) FROM meuml.migrations WHERE migration_name = '$migration_name';")
    if [[ $result -eq 0 ]]; then
        return 1  # Migração não registrada
    else
        return 0  # Migração já registrada
    fi
}

# Iterar sobre os arquivos de migração no diretório
for migration in "$MIGRATIONS_DIR"/*.sql; do
    migration_name=$(basename "$migration")

    # Verificar se a migração já está registrada
    if migration_registered "$migration_name"; then
        echo "Migração já registrada: $migration_name"
    else
        # Registrar a migração sem executar
        echo "Registrando migração: $migration_name"
        psql -h $PG_DB_HOST -p $PG_DB_PORT -U $PG_DB_USER -d $PG_DB_NAME -c "INSERT INTO meuml.migrations (migration_name, description) VALUES ('$migration_name', 'Migração registrada via script sem execução');"
        
        # Verificar se a inserção foi bem-sucedida
        if [ $? -eq 0 ]; then
            echo "Migração registrada com sucesso: $migration_name"
        else
            echo "Erro ao registrar a migração: $migration_name"
            exit 1
        fi
    fi
done

# Limpar variável de senha após o uso
unset PGPASSWORD

echo "Todas as migrações não executadas foram registradas."
