# 🚀 Guia de Deploy Railway - Projeto Fullstack Integrado

## ✅ Configuração Atual

### Backend + Frontend Integrado
- ✅ Frontend React será buildado automaticamente pelo Maven
- ✅ Arquivos estáticos serão servidos pelo Spring Boot
- ✅ Uma única aplicação no Railway
- ✅ Uma única URL para frontend e API

## 📋 Variáveis de Ambiente Necessárias no Railway

Configure estas variáveis no seu projeto Railway:

### 🗄️ Database (Automaticamente configuradas quando adicionar MySQL)
```
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_PORT=6543
MYSQL_USER=root
MYSQL_PASSWORD=xxxxxxxxxxxxx
MYSQL_DATABASE=railway
```

### 📧 Email (Gmail)
```
MAIL_USERNAME=docu.floww.br@gmail.com
MAIL_PASSWORD=wfmpcsgtbwqlxrsf
ADMIN_EMAIL=admin@docufloww.com
```

### 🌐 URLs (Opcionais - Railway define automaticamente)
```
BACKEND_URL=https://docufloww.railway.app
FRONTEND_URL=https://docufloww.railway.app
```

### 📁 Upload (Opcional)
```
UPLOAD_DIR=/tmp/uploads/
```

## 🚀 Processo de Deploy

### 1. Preparação Local
```bash
# Teste o build local primeiro
./build-local.bat  # Windows
# ou
./build-local.sh   # Linux/Mac

# Execute para testar
java -jar target/validacao-documentos-1.0.jar
```

### 2. Deploy no Railway

#### Opção A: Deploy via GitHub
1. Conecte seu repositório GitHub ao Railway
2. Railway detectará automaticamente o `Procfile`
3. Configure as variáveis de ambiente
4. Deploy automático!

#### Opção B: Deploy via CLI
```bash
# Instale Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicialize o projeto
railway link

# Configure variáveis de ambiente
railway variables set MAIL_USERNAME=docu.floww.br@gmail.com
railway variables set MAIL_PASSWORD=wfmpcsgtbwqlxrsf

# Deploy
railway up
```

## 🔧 Como Funciona o Build

### Processo Automático no Railway:
1. 🏗️ **Maven Frontend Plugin** instala Node.js e NPM
2. 📦 **npm install** instala dependências do React
3. ⚡ **npm run build** constrói o frontend (pasta `dist`)
4. 📂 **Maven Resources** copia `frontend/dist` para `src/main/resources/static`
5. ☕ **Spring Boot** compila backend e inclui arquivos estáticos
6. 📦 **JAR Final** contém backend + frontend em um arquivo

### URLs após Deploy:
- **Frontend**: `https://seuapp.railway.app/`
- **API**: `https://seuapp.railway.app/api/`
- **Health Check**: `https://seuapp.railway.app/actuator/health`

## 🐛 Troubleshooting

### ❌ Erro: "The executable `java` could not be found"
**Causa**: Railway detectando Node.js em vez de Java Spring Boot
**Solução DEFINITIVA**: 
- ✅ **package.json removido** da raiz (principal causa!)
- ✅ **Todos Dockerfiles removidos** 
- ✅ **node_modules/ removido** da raiz
- ✅ **frontend/Dockerfile removido**
- ✅ **railway.toml** força buildpack Java
- ✅ **nixpacks.toml** especifica Java 17
- ✅ **.buildpacks** força Java buildpack
- ✅ **system.properties** define Java version
- Commit, push e redeploy no Railway

### ❌ Erro: "Failed to execute goal frontend-maven-plugin"
**Causa**: Node.js não instalado ou versão incompatível
**Solução**: 
- Verifique se o Railway tem Node.js disponível
- Confirme versões no `pom.xml`

### ❌ Erro: "No main manifest attribute"
**Causa**: Spring Boot plugin não configurado corretamente
**Solução**: 
```bash
./mvnw clean package -DskipTests
```

### ❌ Frontend não carrega (404)
**Causa**: Arquivos não copiados para `/static`
**Solução**:
1. Verifique se `frontend/dist` foi criado
2. Confirme se arquivos estão em `target/classes/static`

### ❌ CORS Error
**Causa**: Configuração CORS incorreta
**Solução**: 
- Confirme `app.cors.allowed-origins` no `application-prod.properties`
- Use URLs relativas no frontend (`/api` em vez de `http://...`)

### ❌ Database Connection Failed
**Causa**: Variáveis de ambiente MySQL incorretas
**Solução**:
1. Verifique todas as variáveis `MYSQL_*`
2. Teste conexão com: `/actuator/health`

### ❌ Email não funciona
**Causa**: Credenciais Gmail incorretas
**Solução**:
1. Use "Senha de App" do Gmail (não senha normal)
2. Ative autenticação 2FA
3. Configure `MAIL_USERNAME` e `MAIL_PASSWORD`

## ✅ Checklist Final

- [ ] Build local funciona: `./build-local.bat`
- [ ] JAR executa: `java -jar target/*.jar`
- [ ] Frontend carrega em `http://localhost:8080`
- [ ] API responde em `http://localhost:8080/api`
- [ ] Health check OK: `http://localhost:8080/actuator/health`
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Banco MySQL adicionado no Railway
- [ ] Deploy realizado com sucesso

## 🎯 Vantagens desta Configuração

✅ **Um único serviço** no Railway (econômico)  
✅ **Build automático** do frontend  
✅ **URLs relativas** (sem CORS issues)  
✅ **Cache otimizado** para arquivos estáticos  
✅ **Health check** funcional  
✅ **Fácil manutenção** e debug  

## 📞 Comandos Úteis

```bash
# Build local completo
./mvnw clean package -DskipTests

# Executar local
java -jar target/validacao-documentos-1.0.jar

# Ver logs Railway
railway logs

# Conectar ao banco Railway
railway connect mysql

# Status do projeto
railway status
```
