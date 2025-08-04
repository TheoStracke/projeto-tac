#!/bin/bash

# Railway Deployment Script para Projeto TAC
echo "🚀 Iniciando deploy para Railway..."

# Verificar se Maven está funcionando
echo "📦 Compilando projeto..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "✅ Compilação concluída com sucesso!"
    echo "📄 JAR criado: target/validacao-documentos-1.0.jar"
    
    echo ""
    echo "🔧 Configurações necessárias no Railway:"
    echo "=================================="
    echo "Variáveis de ambiente obrigatórias:"
    echo ""
    echo "SPRING_PROFILES_ACTIVE=prod"
    echo "PORT=8080"
    echo ""
    echo "# MySQL Railway (obtenha no painel MySQL do Railway):"
    echo "MYSQL_HOST=<host-do-railway>"
    echo "MYSQL_PORT=<porta-do-railway>"
    echo "MYSQL_USER=<usuario-do-railway>"
    echo "MYSQL_PASSWORD=<senha-do-railway>"
    echo "MYSQL_DATABASE=<nome-do-banco-railway>"
    echo ""
    echo "# Email (configurar com suas credenciais):"
    echo "MAIL_USERNAME=<seu-email@gmail.com>"
    echo "MAIL_PASSWORD=<senha-do-app-gmail>"
    echo ""
    echo "# URLs (ajustar conforme seu domínio Railway):"
    echo "FRONTEND_URL=https://<seu-frontend>.railway.app"
    echo "BACKEND_URL=https://<seu-backend>.railway.app"
    echo ""
    echo "# Upload (usar diretório temporário Railway):"
    echo "UPLOAD_DIR=/tmp/uploads/"
    echo ""
    echo "🔍 Endpoints importantes para healthcheck:"
    echo "GET /actuator/health - Status da aplicação"
    echo "GET / - Página principal (frontend)"
    echo "POST /api/auth/login - Login"
    echo ""
    echo "✅ Projeto pronto para deploy no Railway!"
else
    echo "❌ Erro na compilação!"
    exit 1
fi
