# Refatoração da API - Frontend

## ✅ Mudanças Implementadas

### 1. Centralização da Configuração da API
- **Arquivo criado**: `frontend/src/services/api.js`
- **Substitui**: `frontend/src/config/api.js` (mantido temporariamente para compatibilidade)
- **Nova instância**: `apiClient` configurada com Axios

### 2. Variáveis de Ambiente Atualizadas
```bash
# .env.production
VITE_API_URL=https://projeto-tac-ja9q.up.railway.app/api

# .env.development  
VITE_API_URL=http://localhost:8080/api
```

### 3. Melhorias na Instância do Axios

#### 🔒 Interceptador de Request
- ✅ Adiciona token JWT automaticamente
- ✅ Exclui endpoints públicos (`/auth/`, `/aprovacao/`, `/health`)
- ✅ Logs detalhados em desenvolvimento
- ✅ Timeout de 15 segundos

#### 🛡️ Interceptador de Response
- ✅ Tratamento automático de token expirado (401)
- ✅ Redirecionamento inteligente para login
- ✅ Logs de erro detalhados
- ✅ Não redireciona em páginas públicas

### 4. Componentes Refatorados
- ✅ `PaginaAprovacao.jsx` - URL de arquivo corrigida
- ✅ `Login.jsx` - Import atualizado
- ✅ `Dashboard.jsx` - Import atualizado  
- ✅ `AprovacaoLista.jsx` - Import atualizado
- ✅ `EnviarDocumento.jsx` - Import atualizado
- ✅ `Cadastro.jsx` - Import atualizado

### 5. Funções da API Padronizadas
Todas as funções agora seguem o padrão:
```javascript
return {
  success: boolean,
  data?: any,
  error?: string
}
```

## 🚀 Como Usar

### Importar as funções:
```javascript
import { loginUser, buscarDocumentos, enviarDocumento } from '../services/api';
```

### Usar a instância diretamente:
```javascript
import { apiClient } from '../services/api';

const response = await apiClient.get('/endpoint-customizado');
```

### URLs de arquivos:
```javascript
import { getArquivoUrl } from '../services/api';

const url = getArquivoUrl(token); // Retorna URL completa
```

## 🔧 Configuração Automática

### Token JWT
- ✅ Adicionado automaticamente em requisições autenticadas
- ✅ Excluído em endpoints públicos
- ✅ Removido automaticamente quando expirado

### Tratamento de Erros
- ✅ 401: Logout automático + redirecionamento
- ✅ Outros erros: Logs detalhados
- ✅ Timeout: 15 segundos com mensagem clara

### Ambiente
- ✅ Desenvolvimento: `http://localhost:8080/api`
- ✅ Produção: `https://projeto-tac-ja9q.up.railway.app/api`
- ✅ Logs apenas em desenvolvimento

## 🧪 Próximos Passos

1. **Testar em desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Fazer build de produção**:
   ```bash
   npm run build
   ```

3. **Deploy no Vercel**:
   - As variáveis de ambiente já estão configuradas
   - A URL da API será automaticamente a correta

4. **Remover arquivos antigos** (após confirmação que tudo funciona):
   - `frontend/src/config/api.js`
   - `frontend/src/apiConfig.js`

## 🆚 Antes vs Depois

### Antes:
```javascript
// Múltiplas configurações espalhadas
import axios from 'axios';
const API_BASE_URL = 'https://url-antiga.up.railway.app';

// URLs hardcoded
axios.post('https://url-antiga.up.railway.app/api/auth/login')

// Token manual
const config = {
  headers: { Authorization: `Bearer ${token}` }
};
```

### Depois:
```javascript
// Configuração centralizada
import { loginUser } from '../services/api';

// URLs relativas
const result = await loginUser(credentials);

// Token automático
// Nada a fazer! ✨
```

## 🐛 Debugging

Se algo não funcionar:

1. **Verifique as variáveis de ambiente**:
   ```javascript
   console.log('API URL:', import.meta.env.VITE_API_URL);
   ```

2. **Veja os logs no console**:
   - Requisições saindo
   - Respostas chegando
   - Erros detalhados

3. **Verifique o token**:
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   ```
