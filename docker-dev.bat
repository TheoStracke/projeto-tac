@echo off
REM Script para desenvolvimento Docker no Windows
setlocal

echo 🐳 Iniciando ambiente Docker de desenvolvimento...

REM Parar containers se existirem
echo 🛑 Parando containers existentes...
docker-compose down

REM Limpar volumes se necessário
set /p REPLY="🗑️  Limpar dados do banco? (y/N): "
if /I "%REPLY%"=="y" (
    echo 🗑️  Removendo volumes...
    docker-compose down -v
)

REM Build e start
echo 🏗️  Fazendo build das imagens...
docker-compose build --no-cache

echo 🚀 Iniciando containers...
docker-compose up -d

echo 📊 Status dos containers:
docker-compose ps

echo.
echo ✅ Ambiente iniciado com sucesso!
echo 🌐 Aplicação: http://localhost:8080
echo 🗄️  MySQL: localhost:3306
echo.
echo 📝 Para ver logs: docker-compose logs -f
echo 🛑 Para parar: docker-compose down

pause
