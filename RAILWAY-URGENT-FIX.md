# 🚨 SOLUÇÃO URGENTE - Railway Java Not Found

## ❌ **ERRO ATUAL**
```
/bin/bash: line 1: java: command not found
```

## 🔧 **SOLUÇÃO APLICADA**

### 1. **Railway.toml - Heroku Builder Forçado**
```toml
[build]
builder = "HEROKU"
buildpacks = ["https://github.com/heroku/heroku-buildpack-java"]
buildCommand = "./mvnw clean package -DskipTests"

[deploy]
startCommand = "java -jar target/validacao-documentos-1.0.jar"
```

### 2. **System.properties - Java + Maven**
```properties
java.runtime.version=17
maven.version=3.9.6
```

### 3. **Procfile - Comando Específico**
```
web: java $JAVA_OPTS -Dserver.port=$PORT -jar target/validacao-documentos-1.0.jar
```

### 4. **Arquivos Marker**
- ✅ `.java-version` criado
- ✅ `.buildpacks` mantido
- ✅ `nixpacks.toml` removido

## 🚀 **AÇÕES OBRIGATÓRIAS**

### **1. Commit e Push**
```bash
git add .
git commit -m "Fix: Force Heroku Java buildpack for Railway"
git push origin main
```

### **2. Railway - Redeploy Completo**
1. Dashboard Railway
2. **Settings** → **General**
3. **Redeploy** (não apenas trigger)
4. Ou **Delete** e **Reconnect** GitHub

### **3. Verificar Logs**
Logs devem mostrar:
```
✅ -----> Java app detected
✅ -----> Installing OpenJDK 17
✅ -----> Installing Maven 3.9.6
✅ -----> Executing: ./mvnw clean package -DskipTests
✅ -----> Discovering process types
✅        Procfile declares types -> web
```

## ⚠️ **SE AINDA FALHAR**

### **Opção 1: Recrear Projeto Railway**
1. **Deletar** projeto atual no Railway
2. **Criar novo** projeto
3. **Conectar** GitHub repository
4. **Configurar** variáveis de ambiente
5. **Deploy** automático

### **Opção 2: Deploy Manual via CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Criar novo projeto
railway new
railway add

# Deploy
railway up --detach
```

### **Opção 3: Verificar Detecção**
Railway deve detectar nesta ordem:
1. ✅ **railway.toml** (HEROKU builder)
2. ✅ **system.properties** (Java 17)
3. ✅ **pom.xml** (Maven project)
4. ✅ **.buildpacks** (Java buildpack)
5. ✅ **Procfile** (web process)

## 📋 **CHECKLIST URGENTE**

- [ ] railway.toml com HEROKU builder
- [ ] system.properties com Java 17 + Maven
- [ ] Procfile com comando específico
- [ ] .java-version criado
- [ ] nixpacks.toml removido
- [ ] Commit e push realizados
- [ ] Redeploy no Railway
- [ ] Logs mostram "Java app detected"
- [ ] Java instalado com sucesso

## 🎯 **LOGS CORRETOS ESPERADOS**

```
=====> Downloading Buildpack: https://github.com/heroku/heroku-buildpack-java
=====> Detected Java
=====> Installing OpenJDK 17... done
=====> Installing Maven 3.9.6... done
=====> Executing: ./mvnw clean package -DskipTests
       Frontend Maven Plugin installing Node.js...
       npm install completed
       npm run build completed
       [INFO] BUILD SUCCESS
=====> Discovering process types
       Procfile declares types -> web
=====> Starting process with command `java $JAVA_OPTS -Dserver.port=$PORT -jar target/validacao-documentos-1.0.jar`
       Spring Boot application started
```

---

**🚨 CRÍTICO: Se essa configuração não funcionar, o Railway pode ter limitações com buildpacks. Considere usar um Dockerfile específico para Java ou migrar para outro serviço de deploy.**
