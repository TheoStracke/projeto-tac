#!/bin/bash

# Script para desenvolvimento Docker
set -e

echo "🐳 Iniciando ambiente Docker de desenvolvimento..."

# Parar containers se existirem
echo "🛑 Parando containers existentes..."
docker-compose down

# Limpar volumes se necessário (opcional)
read -p "🗑️  Limpar dados do banco? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removendo volumes..."
    docker-compose down -v
fi

# Build e start
echo "🏗️  Fazendo build das imagens..."
docker-compose build --no-cache

echo "🚀 Iniciando containers..."
docker-compose up -d

echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "✅ Ambiente iniciado com sucesso!"
echo "🌐 Aplicação: http://localhost:8080"
echo "🗄️  MySQL: localhost:3306"
echo ""
echo "📝 Para ver logs: docker-compose logs -f"
echo "🛑 Para parar: docker-compose down"
