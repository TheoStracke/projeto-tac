# VTT Pizza - Aplicativo Web de Gerenciamento de Cardápio

Este projeto é um sistema completo para gerenciamento de itens de menu de pizza, com backend em Spring Boot e frontend em React + Vite, utilizando Material-UI e integração total via API REST.

# Equipe
Thiago
Theo
Vinicius

## Funcionalidades
- Listar itens do menu (GET /menu ou /cardapio)
- Visualizar detalhes do item (GET /menu/{id})
- Adicionar novos itens (POST /menu)
- Editar itens (PUT/PATCH /menu/{id})
- Remover itens (DELETE /menu/{id})
- Feedback visual (loading, sucesso, erro)
- Interface moderna e responsiva

## Instalação e Uso

### Backend (Spring Boot)
1. **No Codespaces:**
   - Edite `src/main/resources/application.properties` para usar H2 (já configurado para facilitar):
     ```properties
     spring.datasource.url=jdbc:h2:mem:testdb
     spring.datasource.driver-class-name=org.h2.Driver
     spring.datasource.username=sa
     spring.datasource.password=
     spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
     spring.h2.console.enabled=true
     spring.jpa.hibernate.ddl-auto=update
     spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
     ```
   - No terminal:
     ```sh
     mvn spring-boot:run
     ```
   - Acesse a API em http://localhost:8080/

### Frontend (React + Vite)
1. Abra outro terminal e rode:
   ```sh
   cd frontend
   npm install
   npm run dev
   ```
2. Acesse o endereço mostrado (ex: http://localhost:5173/)

## Endpoints principais
- GET    `/menu`         → Lista todos os itens
- GET    `/menu/{id}`    → Detalhes de um item
- POST   `/menu`         → Adiciona novo item
- PUT    `/menu/{id}`    → Edita item
- DELETE `/menu/{id}`    → Remove item

## Prompts do GitHub Copilot utilizados
- "desenvolva o frontend a partir do backend do projeto completo com react, quero animações fluidas e cores em amarelo e tons de amarelo, vermelho e vermelho escuro, design super megar hiper moderno"
- "as cores estão feias, deixa com cores mais modernas, tem que ser clicável com opção de adicionar no carrinho"
- "Continue: 'Continue to iterate?'"
- "Failed to load resource: the server responded with a status of 404 (Not Found) ..."
- "ERR_CONNECTION_REFUSED\nNão é possível acessar esse site\nA conexão com localhost foi recusada. ..."
- "npm ERR! code ENOENT\nnpm ERR! syscall open\nnpm ERR! path ...\nnpm ERR! enoent Could not read package.json: Error: ENOENT: no such file or directory, open ..."
- "[ERROR] Failed to execute goal org.apache.maven.plugins:maven-surefire-plugin:3.5.3:test (default-test) on project pizzademo: ..."
- "[ERROR] Failed to execute goal org.springframework.boot:spring-boot-maven-plugin:3.4.5:run (default-cli) on project pizzademo: Process terminated with exit code: 1 ..."

## Demonstração CRUD
- Todas as operações podem ser testadas na interface web.
- O backend pode ser testado via Postman/Insomnia ou pelo frontend.

## Organização
- Código React em `frontend/`
- Código Java em `src/main/java/com/pizzaria/`
- Controllers, DTOs, Models e Services organizados por domínio

## Participação
- Projeto desenvolvido em equipe, com apoio do GitHub Copilot para acelerar e aprimorar o desenvolvimento.

---

Se tiver dúvidas, abra uma issue ou consulte os comentários no código!
