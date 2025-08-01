@echo off
REM Script de build para Railway (Windows)
echo 🚀 Iniciando build para Railway...

REM 1. Build do frontend
echo 📦 Fazendo build do frontend...
cd frontend
call npm install
call npm run build

REM 2. Copiar arquivos do frontend para o backend
echo 📁 Copiando arquivos do frontend para o backend...
cd ..
if exist "src\main\resources\static" rmdir /s /q "src\main\resources\static"
mkdir "src\main\resources\static"
xcopy "frontend\dist\*" "src\main\resources\static\" /s /e /y

REM 3. Build do backend
echo 🔧 Fazendo build do backend...
call mvn clean package -DskipTests

echo ✅ Build concluído!
echo 🎯 Pronto para deploy no Railway!
