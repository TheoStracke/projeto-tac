# Configuração MySQL - Projeto TAC

## Pré-requisitos

1. **Instalar MySQL**
   - Baixe e instale o MySQL Server 8.0+ de: https://dev.mysql.com/downloads/mysql/
   - Durante a instalação, configure a senha do usuário `root` como `123456`

2. **Verificar se o MySQL está rodando**
   ```bash
   # Windows (Command Prompt ou PowerShell como Admin)
   net start mysql80
   
   # Ou verificar se o serviço MySQL está ativo nos Serviços do Windows
   ```

## Configuração do Banco

O sistema está configurado para criar automaticamente o banco `validacao_db` na primeira execução.

### Configurações atuais (application.properties):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/validacao_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=123456
```

## Dados de Teste

O sistema criará automaticamente as seguintes empresas na primeira execução:

### Administradores (ESTRADA_FACIL):
- **CNPJ:** 43.403.910/0001-28 | **Senha:** senha123
- **CNPJ:** 20.692.051/0001-39 | **Senha:** senha123

### Despachantes (DESPACHANTE):
- **CNPJ:** 11.111.111/0001-11 | **Senha:** senha123
- **CNPJ:** 22.222.222/0002-22 | **Senha:** senha123
- **CNPJ:** 33.333.333/0003-33 | **Senha:** senha123
- **CNPJ:** 60.811.733/0001-38 | **Senha:** 123456

## Como Executar

1. **Iniciar MySQL**
   ```bash
   net start mysql80
   ```

2. **Compilar e executar o backend**
   ```bash
   cd projeto-tac
   .\mvnw.cmd clean compile spring-boot:run
   ```

3. **Verificar logs**
   - O sistema mostrará as empresas criadas no console
   - Todas as senhas são automaticamente criptografadas com BCrypt

## Resolução de Problemas

### Erro de Conexão MySQL:
- Verificar se o MySQL está rodando: `net start mysql80`
- Verificar se a porta 3306 está disponível
- Confirmar usuário `root` e senha `123456`

### Erro de Dependências:
```bash
.\mvnw.cmd clean install
```

### Reset do Banco:
```sql
DROP DATABASE validacao_db;
-- O sistema recriará automaticamente na próxima execução
```

## Estrutura Limpa

✅ **Removido do sistema:**
- Todas as dependências H2
- Configurações H2 no SecurityConfig
- Arquivos data.sql específicos do H2
- Console H2

✅ **Configurado para MySQL:**
- Dependência mysql-connector-j atualizada
- Dialect MySQL configurado
- DataInitializer para dados de teste
- Configurações de produção MySQL
