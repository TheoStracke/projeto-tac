#!/bin/bash

# Script de build para Railway
echo "🚀 Iniciando build para Railway..."

# 1. Build do frontend
echo "📦 Fazendo build do frontend..."
cd frontend
npm install
npm run build

# 2. Copiar arquivos do frontend para o backend
echo "📁 Copiando arquivos do frontend para o backend..."
cd ..
rm -rf src/main/resources/static/*
cp -r frontend/dist/* src/main/resources/static/

# 3. Build do backend
echo "🔧 Fazendo build do backend..."
./mvnw clean package -DskipTests

echo "✅ Build concluído!"
echo "🎯 Pronto para deploy no Railway!"
