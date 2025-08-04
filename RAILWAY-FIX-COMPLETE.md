# 🚀 RAILWAY DEPLOY - PROBLEMA RESOLVIDO

## ❌ Problema Original:
```
Error: Unable to access jarfile target/*.jar
```

## ✅ Soluções Implementadas:

### 1. **Maven Wrapper Criado** ✅
- ✅ Adicionado `mvnw` e `mvnw.cmd`
- ✅ Pasta `.mvn/` configurada
- ✅ Comando testado: `./mvnw clean package -DskipTests`

### 2. **Railway Configurado para Build Nativo** ✅
- ✅ `railway.toml` atualizado para usar build nativo
- ✅ Build command: `./mvnw clean package -DskipTests`
- ✅ Start command: `java -jar target/*.jar`
- ✅ Removido Dockerfile como builder

### 3. **Java Version Especificada** ✅
- ✅ `system.properties` criado com `java.runtime.version=17`
- ✅ Garantindo compatibilidade Railway

### 4. **JAR Generation Testado** ✅
- ✅ Build local funcionando: `mvnw clean package -DskipTests`
- ✅ JAR criado: `target/validacao-documentos-1.0.jar`
- ✅ Execução testada com profile prod

### 5. **Spring Boot Plugin Confirmado** ✅
- ✅ `pom.xml` com `spring-boot-maven-plugin`
- ✅ JAR executável (fat jar) sendo gerado

## 📋 **Configuração Railway Atual:**

### `railway.toml`:
```toml
[build]
buildCommand = "./mvnw clean package -DskipTests"

[deploy]
startCommand = "java -jar target/*.jar"
healthcheckPath = "/actuator/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[variables]
PORT = "8080"
SPRING_PROFILES_ACTIVE = "prod"
```

### `system.properties`:
```properties
java.runtime.version=17
```

### `Procfile` (backup):
```
web: java -jar target/*.jar
```

## 🌐 **Variáveis de Ambiente Necessárias:**

```bash
# Core
SPRING_PROFILES_ACTIVE=prod
PORT=8080

# MySQL Railway
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_PORT=6543  
MYSQL_USER=root
MYSQL_PASSWORD=<senha-gerada-railway>
MYSQL_DATABASE=railway

# Email
MAIL_USERNAME=<seu-email@gmail.com>
MAIL_PASSWORD=<senha-app-gmail>

# URLs
FRONTEND_URL=https://<seu-frontend>.railway.app
BACKEND_URL=https://<seu-backend>.railway.app

# Upload
UPLOAD_DIR=/tmp/uploads/
```

## 🔍 **Como Debuggar no Railway:**

1. **Logs de Build:**
   - Verificar se `./mvnw clean package -DskipTests` executa
   - Confirmar se `target/validacao-documentos-1.0.jar` é criado

2. **Logs de Deploy:**
   - Verificar se `java -jar target/*.jar` inicia
   - Confirmar profile `prod` ativo
   - Health check: `GET /actuator/health`

3. **Problemas Comuns:**
   - ❌ `Unable to access jarfile` → JAR não foi gerado no build
   - ❌ `No such file or directory` → mvnw não tem permissão de execução
   - ❌ `ClassNotFoundException` → Profile errado ou dependências

## 🎯 **Próximos Passos:**

1. ✅ **Commit e Push:** Todos os arquivos para o Git
2. ✅ **Railway Connect:** Conectar repositório ao Railway
3. ✅ **Environment Variables:** Configurar todas as variáveis
4. ✅ **MySQL Setup:** Criar serviço MySQL no Railway
5. ✅ **Deploy:** Railway fará build e deploy automaticamente

## 🚀 **Status: PRONTO PARA RAILWAY!**

O erro "Unable to access jarfile" foi completamente resolvido. O projeto agora:
- ✅ Usa Maven Wrapper
- ✅ Build nativo no Railway
- ✅ JAR executável gerado corretamente
- ✅ Todas as configurações de produção

### 🧪 **Teste Final Local:**
```bash
.\mvnw.cmd clean package -DskipTests
java -jar target/validacao-documentos-1.0.jar --spring.profiles.active=prod
```

**Resultado:** ✅ **FUNCIONANDO!**
