# Sistema de Validação de Documentos

Este projeto foi adaptado do sistema de pizzaria para ser um **Sistema de Validação de Documentos** para despachantes e Estrada Fácil.

## Funcionalidades

### Fluxo do Sistema:
1. **Despachante** recebe documento do motorista
2. **Despachante** faz upload no sistema 
3. **Sistema** envia email automático para Estrada Fácil
4. **Estrada Fácil** acessa link do email e aprova/rejeita
5. **Despachante** recebe notificação por email do resultado
6. **Despachante** pode acompanhar status no dashboard

### Tipos de Usuário:
- **Despachante**: Pode enviar documentos e acompanhar status
- **Estrada Fácil**: Pode aprovar/rejeitar documentos (admin)

## Tecnologias Utilizadas

### Backend:
- Spring Boot 3.4.8
- Spring Security
- Spring Mail
- MySQL/H2
- JPA/Hibernate

### Frontend:
- React 19
- Material-UI
- React Router
- Axios
- Framer Motion

## Instalação e Configuração

### 1. Backend (Spring Boot)

1. **Configurar Email** em `src/main/resources/application.properties`:
   ```properties
   # Configuração de Email (configure com suas credenciais)
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=seu-email@gmail.com
   spring.mail.password=sua-senha-de-app
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   ```

2. **Executar o backend**:
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Inserir empresas admin** (execute após primeira inicialização):
   ```sql
   -- No MySQL ou H2 Console
   INSERT INTO empresa (cnpj, razao_social, email, senha, tipo) VALUES 
   ('11.111.111/0001-11', 'Estrada Fácil Admin 1', 'admin1@estradafacil.com', 'senha123', 'ESTRADA_FACIL'),
   ('22.222.222/0002-22', 'Estrada Fácil Admin 2', 'admin2@estradafacil.com', 'senha123', 'ESTRADA_FACIL'),
   ('33.333.333/0003-33', 'Despachante Teste', 'despachante@teste.com', 'senha123', 'DESPACHANTE');
   ```

### 2. Frontend (React)

1. **Instalar dependências**:
   ```bash
   cd frontend
   npm install
   ```

2. **Executar o frontend**:
   ```bash
   npm run dev
   ```

3. **Acessar**: http://localhost:5173

## Como Usar

### Login
- Acesse http://localhost:5173
- Use CNPJ e senha para login
- **Despachantes** vão para o dashboard
- **Estrada Fácil** vão para lista de aprovações

### Para Despachantes:
1. Faça login com CNPJ de despachante
2. Clique em "Enviar Documento"
3. Preencha dados do motorista e faça upload
4. Acompanhe status no dashboard

### Para Estrada Fácil:
1. Receba email com link de aprovação
2. Clique no link (funciona sem login)
3. Visualize dados do documento
4. Aprove ou rejeite com comentários
5. Despachante recebe email automático

## Endpoints da API

### Autenticação:
- `POST /auth/login` - Login com CNPJ e senha
- `POST /auth/cadastro` - Cadastro de nova empresa

### Documentos:
- `POST /documentos/enviar` - Upload de documento (multipart)
- `GET /documentos/empresa/{id}` - Listar documentos por empresa
- `GET /documentos/pendentes` - Listar pendentes (admin)

### Aprovação:
- `GET /aprovacao/{token}` - Buscar documento por token
- `POST /aprovacao/{token}` - Aprovar/rejeitar documento

## Estrutura de Arquivos

### Backend:
```
src/main/java/com/pizzaria/
├── model/
│   ├── Empresa.java          # Empresas (despachantes/admin)
│   ├── Documento.java        # Documentos enviados
│   ├── TipoEmpresa.java      # DESPACHANTE | ESTRADA_FACIL
│   └── StatusDocumento.java  # PENDENTE | APROVADO | REJEITADO
├── repository/
│   ├── EmpresaRepository.java
│   └── DocumentoRepository.java
├── service/
│   ├── EmpresaService.java
│   ├── DocumentoService.java
│   └── EmailService.java
└── controller/
    ├── AuthController.java
    ├── DocumentoController.java
    └── AprovacaoController.java
```

### Frontend:
```
src/pages/
├── Login.jsx              # Tela de login
├── Dashboard.jsx          # Dashboard do despachante
├── EnviarDocumento.jsx    # Upload de documentos
└── PaginaAprovacao.jsx    # Página de aprovação (link email)
```

## Contas para Teste

### Estrada Fácil (Admin):
- CNPJ: `11.111.111/0001-11`
- Senha: `senha123`

### Despachante:
- CNPJ: `33.333.333/0003-33`
- Senha: `senha123`

## Configuração de Email

Para funcionar em produção, configure um email válido no `application.properties`:

1. **Gmail**: Use senha de app (não sua senha normal)
2. **Outlook**: Configure SMTP do Outlook
3. **SendGrid/AWS SES**: Para produção profissional

## Arquivos Removidos

Os seguintes arquivos da pizzaria foram removidos/não são mais necessários:
- Todos os models relacionados a Pizza, Cardápio, Carrinho
- Controllers de Pizza, Cardápio, Ingredientes
- Pages do frontend relacionadas à pizzaria
- Sistema de carrinho e pedidos

## Próximos Passos

1. Implementar autenticação JWT mais robusta
2. Adicionar validação de arquivos por tipo
3. Implementar download de arquivos
4. Adicionar relatórios e estatísticas
5. Melhorar interface do usuário
6. Implementar notificações em tempo real

---

**Desenvolvido por**: Thiago, Theo, Vinicius
**Tecnologia**: Spring Boot + React + Material-UI
