#!/bin/bash

# Verificar se a descrição foi fornecida
if [ -z "$1" ]; then
  echo "Erro: Você deve fornecer uma descrição."
  echo "Uso: ./create_migration.sh \"Descrição da migração\""
  exit 1
fi

# Diretório de migrações (você pode ajustar conforme necessário)
MIGRATIONS_DIR="./migrations"

# Verificar se o diretório de migrações existe, caso contrário, criar
if [ ! -d "$MIGRATIONS_DIR" ]; then
  mkdir -p "$MIGRATIONS_DIR"
fi

# Gerar o timestamp atual no formato desejado
TIMESTAMP=$(date +"%Y_%m_%d_%H%M%S")

# Criar o nome do arquivo com o timestamp e a descrição fornecida
FILENAME="${TIMESTAMP}-$1.sql"

# Remover espaços extras e substituir por sublinhados
FILENAME=$(echo $FILENAME | sed 's/ /_/g')

# Criar o arquivo na pasta de migrações
touch "${MIGRATIONS_DIR}/${FILENAME}"

# Exibir uma mensagem de sucesso
echo "Arquivo de migração criado: ${MIGRATIONS_DIR}/${FILENAME}"
