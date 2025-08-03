# 🐳 Guia Completo - Dockerização e Deploy

## 📋 Pré-requisitos

### 1. Instalar Docker Desktop
1. Baixe Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
2. Execute o instalador como administrador
3. Reinicie o computador quando solicitado
4. Abra Docker Desktop e faça login (conta gratuita)

### 2. Verificar Instalação
```powershell
docker --version
docker-compose --version
```

## 🏗️ Build e Teste Local

### Opção A: Desenvolvimento Completo
```powershell
# Executar script de desenvolvimento
.\docker-dev.bat

# OU manualmente:
docker-compose build
docker-compose up -d
```

### Opção B: Teste Rápido (só aplicação)
```powershell
# Build da imagem de produção
docker build -f Dockerfile.prod -t validacao-app .

# Rodar apenas a aplicação (requer MySQL externo)
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod validacao-app
```

## 🌐 Deploy em Produção

### 🥇 Railway (RECOMENDADO)

#### 1. Preparar Repositório
- Commit todos os arquivos Docker
- Push para GitHub

#### 2. Deploy Railway
1. Acesse: https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Selecione seu repositório `projeto-tac`
4. Railway detectará automaticamente o `railway.toml`

#### 3. Configurar MySQL
1. No projeto Railway: "Add Service" → "Database" → "MySQL"
2. Anote as credenciais geradas

#### 4. Configurar Variáveis de Ambiente
```
SPRING_PROFILES_ACTIVE=prod
MYSQL_HOST=<railway-mysql-host>
MYSQL_PORT=3306
MYSQL_DATABASE=<railway-database-name>
MYSQL_USER=<railway-user>
MYSQL_PASSWORD=<railway-password>
MAIL_USERNAME=docu.floww.br@gmail.com
MAIL_PASSWORD=tvclqonkdhitlwmd
FRONTEND_URL=https://seu-app.up.railway.app
UPLOAD_DIR=/app/uploads/
PORT=8080
```

#### 5. Deploy Automático
- Railway fará build usando `Dockerfile.prod`
- Deploy automático em ~5-10 minutos
- URL: `https://seu-app.up.railway.app`

### 🥈 Render.com (Alternativa)

#### 1. Criar Conta
- Acesse: https://render.com
- Conecte GitHub

#### 2. Novo Web Service
- Repository: `projeto-tac`
- Runtime: Docker
- Dockerfile: `Dockerfile.prod`

#### 3. Configurar PostgreSQL
- Add Database → PostgreSQL (gratuito)
- Anote connection string

#### 4. Variáveis de Ambiente (similar ao Railway)
```
SPRING_PROFILES_ACTIVE=prod
MYSQL_HOST=<render-postgres-host>
MYSQL_PORT=5432
MYSQL_DATABASE=<render-database>
MYSQL_USER=<render-user>
MYSQL_PASSWORD=<render-password>
# ... outras variáveis
```

## 🔧 Comandos Úteis

### Desenvolvimento Local
```powershell
# Iniciar ambiente completo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar ambiente
docker-compose down

# Rebuild após mudanças
docker-compose build --no-cache
docker-compose up -d
```

### Produção
```powershell
# Build imagem de produção
docker build -f Dockerfile.prod -t validacao-prod .

# Teste local da imagem de produção
docker run -p 8080:8080 validacao-prod
```

### Debug
```powershell
# Entrar no container
docker exec -it validacao-app sh

# Ver logs do container específico
docker logs validacao-app

# Status dos containers
docker-compose ps
```

## 🎯 URLs de Acesso

### Local (Docker)
- **Aplicação**: http://localhost:8080
- **MySQL**: localhost:3306

### Produção
- **Railway**: https://seu-app.up.railway.app
- **Render**: https://seu-app.onrender.com

## 🚨 Solução de Problemas

### Erro de Build
```powershell
# Limpar cache Docker
docker system prune -a

# Rebuild sem cache
docker-compose build --no-cache
```

### Erro de Conexão MySQL
- Verificar se MySQL container está rodando
- Verificar variáveis de ambiente
- Verificar network docker

### Erro de CORS
- Verificar FRONTEND_URL nas variáveis
- Verificar configuração CORS no código

## 💰 Custos Estimados

- **Railway**: $5/mês (aplicação) + $5/mês (MySQL) = $10/mês
- **Render**: $7/mês (aplicação) + $0 (PostgreSQL free) = $7/mês
- **Local**: $0 (só desenvolvimento)

## ✅ Checklist Final

- [ ] Docker Desktop instalado
- [ ] Build local funcionando
- [ ] Arquivos Docker commitados
- [ ] Repository pushed para GitHub
- [ ] Plataforma escolhida (Railway/Render)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Aplicação acessível via URL
