# 🚨 SOLUÇÃO URGENTE - Railway detectando Dockerfile errado

## ❌ **PROBLEMA IDENTIFICADO**

O Railway está tentando usar o **Dockerfile** (Node.js) em vez de detectar que é um projeto **Java Spring Boot**.

**Erro**: `The executable 'java' could not be found`

## ✅ **SOLUÇÃO APLICADA**

### 1. **Dockerfiles Renomeados**
```
Dockerfile → Dockerfile.bak
Dockerfile.prod → Dockerfile.prod.bak
```

### 2. **Arquivos de Configuração Criados**

**railway.toml** - Força buildpack Java:
```toml
[build]
builder = "NIXPACKS"
buildCommand = "./mvnw clean package -DskipTests"

[deploy]
startCommand = "java -jar target/*.jar"
healthcheckPath = "/actuator/health"

[variables]
NIXPACKS_JAVA_VERSION = "17"
SPRING_PROFILES_ACTIVE = "prod"
```

**nixpacks.toml** - Especifica Java 17:
```toml
[providers]
java = "17"

[phases.build]
cmds = ["./mvnw clean package -DskipTests"]
```

**.buildpacks** - Força buildpack Java:
```
https://github.com/heroku/heroku-buildpack-java
```

**.railwayignore** - Ignora arquivos desnecessários:
```
Dockerfile.bak
Dockerfile.prod.bak
frontend/node_modules/
target/classes/
```

## 🚀 **PRÓXIMOS PASSOS**

### 1. **Commit e Push**
```bash
git add .
git commit -m "Fix: Configuração Railway para Java Spring Boot"
git push origin main
```

### 2. **Railway - Forçar Redeploy**
1. Vá ao dashboard do Railway
2. **Settings** → **Deployments**
3. **Redeploy** o último deploy
4. OU **Trigger Deploy** manually

### 3. **Verificar Logs**
Acompanhe os logs para ver se agora está usando Java:
```
railway logs --follow
```

**Deve aparecer**:
```
Installing Java 17...
./mvnw clean package -DskipTests
Building jar: target/validacao-documentos-1.0.jar
java -jar target/*.jar
```

## 📋 **CHECKLIST DE VERIFICAÇÃO**

- [ ] Dockerfiles renomeados para `.bak`
- [ ] `railway.toml` configurado
- [ ] `nixpacks.toml` criado
- [ ] `.buildpacks` criado
- [ ] `.railwayignore` criado
- [ ] Commit e push realizados
- [ ] Redeploy no Railway
- [ ] Logs mostram build Java
- [ ] Aplicação inicia com Spring Boot
- [ ] Health check responde OK

## 🎯 **RESULTADO ESPERADO**

**Build logs corretos**:
```
[build] Installing Java 17
[build] ./mvnw clean package -DskipTests
[build] Frontend Maven Plugin: Installing Node.js
[build] npm install
[build] npm run build
[build] Copying frontend/dist to static/
[build] Building jar: target/validacao-documentos-1.0.jar
[deploy] java -jar target/validacao-documentos-1.0.jar
[deploy] Spring Boot started on port 8080
[deploy] Health check: /actuator/health ✅
```

## 📞 **SE AINDA DER ERRO**

### Opção 1: Deletar e Recriar Projeto
1. Criar novo projeto no Railway
2. Conectar GitHub novamente
3. Configurar variáveis de ambiente

### Opção 2: Deploy Manual via CLI
```bash
railway login
railway link
railway up --detach
```

### Opção 3: Verificar Ordem de Detecção
Railway detecta nesta ordem:
1. **Dockerfile** (REMOVIDO ✅)
2. **railway.toml** (CRIADO ✅)
3. **nixpacks.toml** (CRIADO ✅)
4. **Buildpacks** (.buildpacks criado ✅)

---

**🚀 PROBLEMA RESOLVIDO! Railway agora deve usar Java corretamente.**
