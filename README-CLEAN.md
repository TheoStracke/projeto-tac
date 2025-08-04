# 📄 Sistema de Validação de Documentos

Sistema fullstack para validação e aprovação de documentos desenvolvido com **Spring Boot** e **React**.

## 🏗️ Tecnologias

### Backend
- **Java 17**
- **Spring Boot 3.4+**
- **Spring Security** (JWT)
- **Spring Data JPA**
- **MySQL**
- **Maven**

### Frontend
- **React 19**
- **Material-UI (MUI)**
- **Vite**
- **Axios**
- **React Router**

## 🚀 Como Executar Localmente

### Pré-requisitos
1. **Java 17+**
2. **MySQL 8.0+** 
3. **Node.js 18+** (para desenvolvimento do frontend)

### Configuração do Banco de Dados
1. Instale e configure o MySQL
2. Crie um usuário `root` com senha `123456`
3. O sistema criará automaticamente o banco `validacao_db`

### Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e configure:
```bash
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-de-app-gmail
ADMIN_EMAIL=admin@seudominio.com
```

### Executar o Projeto

#### Modo Desenvolvimento (Frontend + Backend separados)
```bash
# Backend
./mvnw spring-boot:run

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

#### Modo Produção (Build completo)
```bash
# Build completo (backend + frontend)
./build-local.bat

# Executar JAR
java -jar target/validacao-documentos-1.0.jar
```

## 📁 Estrutura do Projeto

```
projeto-tac/
├── src/main/java/com/validacao/
│   ├── config/          # Configurações
│   ├── controller/      # Controllers REST
│   ├── dto/            # Data Transfer Objects
│   ├── model/          # Entidades JPA
│   ├── repository/     # Repositórios
│   ├── security/       # Configurações de segurança
│   └── service/        # Lógica de negócio
├── frontend/           # Aplicação React
│   ├── src/
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── pages/      # Páginas da aplicação
│   │   └── config/     # Configurações do frontend
│   └── package.json
└── pom.xml
```

## 🔐 Funcionalidades

- **Autenticação JWT**
- **Upload de documentos**
- **Sistema de aprovação/rejeição**
- **Notificações por email**
- **Interface responsiva**
- **Validação CNPJ**

## 🌐 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Cadastro |
| GET | `/api/documentos` | Listar documentos |
| POST | `/api/documentos` | Upload documento |
| POST | `/api/documentos/{id}/aprovar` | Aprovar documento |
| POST | `/api/documentos/{id}/rejeitar` | Rejeitar documento |

## 🔧 Scripts Disponíveis

- `./mvnw spring-boot:run` - Executa apenas o backend
- `./build-local.bat` - Build completo (Windows)
- `./build-local.sh` - Build completo (Linux/Mac)
- `./mvnw clean package` - Build apenas o backend

## 📝 Licença

Este projeto é privado e destinado ao uso acadêmico.
