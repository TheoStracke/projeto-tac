# 📡 API Service - Guia de Uso

Este arquivo centraliza todas as chamadas HTTP da aplicação React usando axios.

## 🚀 Importação

```javascript
import { 
  loginUser, 
  registerUser, 
  enviarDocumento, 
  buscarDocumentos,
  aprovarDocumento,
  rejeitarDocumento,
  buscarListaAprovacoes 
} from '../config/api';
```

## 🔐 Autenticação

### Login
```javascript
const handleLogin = async (cnpj, senha) => {
  const result = await loginUser({ cnpj, senha });
  
  if (result.success) {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('empresaData', JSON.stringify(result.data.empresa));
    // Redirecionar para dashboard
  } else {
    setError(result.error);
  }
};
```

### Cadastro
```javascript
const handleCadastro = async (userData) => {
  const result = await registerUser(userData);
  
  if (result.success) {
    // Cadastro realizado com sucesso
    navigate('/login');
  } else {
    setError(result.error);
  }
};
```

## 📄 Documentos

### Enviar Documento
```javascript
const handleEnviarDocumento = async (formData) => {
  const result = await enviarDocumento(formData);
  
  if (result.success) {
    setSuccess('Documento enviado com sucesso!');
    // Recarregar lista de documentos
  } else {
    setError(result.error);
  }
};
```

### Buscar Documentos
```javascript
const carregarDocumentos = async () => {
  setLoading(true);
  
  // Para admin: buscar todos os pendentes
  // Para empresa: buscar por ID da empresa
  const empresaId = isAdmin ? null : empresaData.empresaId;
  const result = await buscarDocumentos(empresaId);
  
  if (result.success) {
    setDocumentos(result.data);
  } else {
    setError(result.error);
  }
  
  setLoading(false);
};
```

### Aprovar/Rejeitar Documento
```javascript
const handleAprovar = async (documentoId) => {
  const result = await aprovarDocumento(documentoId);
  
  if (result.success) {
    setSuccess('Documento aprovado!');
    carregarDocumentos(); // Recarregar lista
  } else {
    setError(result.error);
  }
};

const handleRejeitar = async (documentoId) => {
  const result = await rejeitarDocumento(documentoId);
  
  if (result.success) {
    setSuccess('Documento rejeitado!');
    carregarDocumentos(); // Recarregar lista
  } else {
    setError(result.error);
  }
};
```

## 📋 Lista de Aprovações

```javascript
const carregarAprovacoes = async () => {
  const result = await buscarListaAprovacoes();
  
  if (result.success) {
    setAprovacoes(result.data);
  } else {
    setError(result.error);
  }
};
```

## 🔧 Funcionalidades Automáticas

### Token JWT
- **Automático**: Token é adicionado automaticamente em todas as requisições
- **Interceptor**: Se token expirar (401), usuário é redirecionado para login

### Tratamento de Erros
- **Padronizado**: Todas as funções retornam `{ success: boolean, data?: any, error?: string }`
- **Timeout**: Requisições têm timeout de 10 segundos
- **Mensagens**: Erros específicos do backend são capturados

### Configuração de Ambiente
- **Desenvolvimento**: `http://localhost:8080/api`
- **Produção**: URLs relativas `/api`
- **Customização**: Via variável `VITE_API_URL` no `.env`

## 📦 Exemplo Completo de Uso

```javascript
import React, { useState, useEffect } from 'react';
import { buscarDocumentos, aprovarDocumento } from '../config/api';

const DocumentosList = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarDocumentos();
  }, []);

  const carregarDocumentos = async () => {
    setLoading(true);
    setError('');

    const result = await buscarDocumentos();

    if (result.success) {
      setDocumentos(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleAprovar = async (id) => {
    const result = await aprovarDocumento(id);

    if (result.success) {
      carregarDocumentos(); // Recarregar lista
    } else {
      setError(result.error);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {documentos.map(doc => (
        <div key={doc.id}>
          <h3>{doc.titulo}</h3>
          <button onClick={() => handleAprovar(doc.id)}>
            Aprovar
          </button>
        </div>
      ))}
    </div>
  );
};
```

## ✅ Vantagens desta Implementação

- **Centralizado**: Todas as chamadas API em um lugar
- **Consistente**: Padrão uniforme de resposta
- **Reutilizável**: Funções podem ser usadas em qualquer componente
- **Seguro**: Token JWT automaticamente incluído
- **Robusto**: Tratamento de erros e timeouts
- **Flexível**: Suporte a desenvolvimento e produção
