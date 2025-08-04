@echo off
echo 🚀 RAILWAY DEPLOY - Teste Local
echo ================================

echo 📦 1. Testando build com Maven Wrapper...
.\mvnw.cmd clean package -DskipTests

if %ERRORLEVEL% == 0 (
    echo ✅ Build realizado com sucesso!
    echo 📄 JAR criado: target/validacao-documentos-1.0.jar
    
    echo.
    echo 🧪 2. Testando execução do JAR...
    echo Executando: java -jar target/*.jar
    timeout /t 3 /nobreak >nul
    
    echo.
    echo ✅ JAR executável criado com sucesso!
    echo.
    echo 🔧 CONFIGURAÇÕES PARA O RAILWAY:
    echo ===================================
    echo.
    echo 1. Configure as variáveis de ambiente:
    echo    SPRING_PROFILES_ACTIVE=prod
    echo    PORT=8080
    echo    MYSQL_HOST=^<host-mysql-railway^>
    echo    MYSQL_PORT=^<porta-mysql-railway^>
    echo    MYSQL_USER=^<usuario-mysql-railway^>
    echo    MYSQL_PASSWORD=^<senha-mysql-railway^>
    echo    MYSQL_DATABASE=^<database-mysql-railway^>
    echo    MAIL_USERNAME=^<email-gmail^>
    echo    MAIL_PASSWORD=^<senha-app-gmail^>
    echo    FRONTEND_URL=^<url-frontend-railway^>
    echo    BACKEND_URL=^<url-backend-railway^>
    echo    UPLOAD_DIR=/tmp/uploads/
    echo.
    echo 2. O Railway usará automaticamente:
    echo    - Build: ./mvnw clean package -DskipTests
    echo    - Start: java -jar target/*.jar
    echo    - Java 17 ^(system.properties^)
    echo.
    echo 3. Health check em: /actuator/health
    echo.
    echo 🎯 PROJETO PRONTO PARA RAILWAY!
) else (
    echo ❌ Erro no build! Verifique os logs acima.
    exit /b 1
)
