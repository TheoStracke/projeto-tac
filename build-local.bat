@echo off

echo === BUILD FULLSTACK INTEGRADO ===
echo 1. Limpando builds anteriores...

REM Limpa builds anteriores
call .\mvnw.cmd clean

echo 2. Construindo projeto completo (Frontend + Backend)...

REM Constrói o projeto completo
call .\mvnw.cmd package -DskipTests

echo 3. Build concluído!
echo Arquivo JAR gerado em: target\validacao-documentos-1.0.jar
echo.
echo Para executar localmente:
echo java -jar target\validacao-documentos-1.0.jar
echo.
echo Frontend será servido em: http://localhost:8080
echo API disponível em: http://localhost:8080/api
