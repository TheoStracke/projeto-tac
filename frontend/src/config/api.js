// === FUNÇÃO PARA BUSCAR TODOS OS PEDIDOS (ADMIN) ===
export const buscarPedidos = async () => {
  try {
    const empresaDataStr = localStorage.getItem('empresaData');
    let url = '/api/pedidos';
    if (empresaDataStr) {
      const empresaData = JSON.parse(empresaDataStr);
      if (empresaData.tipo !== 'ESTRADA_FACIL' && empresaData.empresaId) {
        url = `/api/pedidos/empresa/${empresaData.empresaId}`;
      }
    }
    const response = await api.get(url);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar pedidos'
    };
  }
};
// === FUNÇÃO PARA ENVIAR PEDIDO DE DOCUMENTOS (MÚLTIPLOS) ===
export const enviarPedidoDocumentos = async (formData) => {
  try {
    const response = await api.post('/api/pedidos/enviar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (error.response) {
      console.error('[ENVIAR PEDIDO DOCUMENTOS] Erro ao enviar pedido:', error.response);
    } else {
      console.error('[ENVIAR PEDIDO DOCUMENTOS] Erro desconhecido:', error);
    }
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Erro ao enviar pedido de documentos'
    };
  }
};
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

// Debug info about environment and API target
try {
  // These logs appear in the browser console
  // Useful to verify front/back origins and axios settings
  // eslint-disable-next-line no-console
  console.info('[API][DEBUG] window.origin:', window.location.origin);
  // eslint-disable-next-line no-console
  console.info('[API][DEBUG] API_BASE_URL:', API_BASE_URL);
} catch (e) {
  // ignore
}

// Configuração do axios com interceptor para token
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Necessário para CORS com credenciais
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Log axios base config
try {
  // eslint-disable-next-line no-console
  console.info('[API][DEBUG] axios base config:', {
    baseURL: api.defaults.baseURL,
    withCredentials: api.defaults.withCredentials,
    headers: api.defaults.headers
  });
} catch {}

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Detailed request log
    try {
      const fullUrl = (() => {
        try { return new URL(config.url, config.baseURL).toString(); } catch { return `${config.baseURL || ''}${config.url || ''}`; }
      })();
      // eslint-disable-next-line no-console
      console.info('[API][REQUEST]', {
        method: (config.method || 'GET').toUpperCase(),
        url: fullUrl,
        withCredentials: config.withCredentials,
        headers: config.headers,
      });
    } catch {}

    return config;
  },
  (error) => {
    // eslint-disable-next-line no-console
    console.error('[API][REQUEST][ERROR]', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response) => {
    try {
      // eslint-disable-next-line no-console
      console.info('[API][RESPONSE]', {
        status: response.status,
        url: response.config && (new URL(response.config.url, response.config.baseURL).toString()),
        headers: response.headers,
      });
    } catch {}
    return response;
  },
  (error) => {
    try {
      if (error.response) {
        // eslint-disable-next-line no-console
        console.error('[API][RESPONSE][ERROR]', {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.config && (new URL(error.config.url, error.config.baseURL).toString()),
          headers: error.response.headers,
          data: error.response.data,
        });
      } else if (error.request) {
        // eslint-disable-next-line no-console
        console.error('[API][NETWORK][NO_RESPONSE]', {
          url: error.config && (new URL(error.config.url, error.config.baseURL).toString()),
          withCredentials: error.config?.withCredentials,
          message: error.message,
          code: error.code,
        });
      } else {
        // eslint-disable-next-line no-console
        console.error('[API][GENERAL][ERROR]', error.message || error);
      }
    } catch (logErr) {
      // eslint-disable-next-line no-console
      console.error('[API][ERROR][LOGGING_FAILURE]', logErr);
    }
    return Promise.reject(error);
  }
);

// === FUNÇÕES DE AUTENTICAÇÃO ===

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
  
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data // Return the nested data object
      };
    }
    
    // Fallback in case the response structure is different
    return {
      success: true,
      data: response.data
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || 'Erro ao fazer login'
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/auth/cadastro', userData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao fazer cadastro'
    };
  }
};

// === FUNÇÕES DE DOCUMENTOS ===

export const enviarDocumento = async (formData) => {
  try {
    const response = await api.post('/api/documentos/enviar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    // Log detalhado no console do navegador
    if (error.response) {
      console.error('[ENVIAR DOCUMENTO] Erro ao enviar documento:');
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error('[ENVIAR DOCUMENTO] Erro desconhecido:', error);
    }
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Erro ao enviar documento'
    };
  }
};

export const buscarDocumentos = async (empresaId = null) => {
  try {
    const url = empresaId 
      ? `/api/documentos/empresa/${empresaId}`  // <-- Corrija aqui
      : '/api/documentos/pendentes';           // <-- E aqui
    const response = await api.get(url);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar documentos'
    };
  }
};

export const buscarDocumento = async (documentoId) => {
  try {
    const response = await api.get(`/api/documentos/${documentoId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar documento'
    };
  }
};

export const aprovarDocumento = async (documentoId) => {
  try {
    const response = await api.post(`/api/documentos/${documentoId}/aprovar`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao aprovar documento'
    };
  }
};

export const rejeitarDocumento = async (documentoId) => {
  try {
    const response = await api.post(`/api/documentos/${documentoId}/rejeitar`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao rejeitar documento'
    };
  }
};

export const downloadArquivo = async (documentoId) => {
  try {
    const response = await api.get(`/api/documentos/${documentoId}/arquivo`, {
      responseType: 'blob',
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao baixar arquivo'
    };
  }
};

// === FUNÇÕES DE APROVAÇÃO (via link) ===

export const buscarAprovacao = async (token) => {
  try {
    const response = await api.get(`/api/aprovacao/${token}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar aprovação'
    };
  }
};

export const processarAprovacao = async (token, decisao, comentario = '') => {
  try {
    const response = await api.post(`/api/aprovacao/${token}`, {
      decisao,
      comentario
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao processar aprovação'
    };
  }
};

export const downloadArquivoAprovacao = async (token) => {
  try {
    const response = await api.get(`/api/aprovacao/${token}/arquivo`, {
      responseType: 'blob',
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao baixar arquivo'
    };
  }
};

// === FUNÇÕES UTILITÁRIAS ===

export const buscarListaAprovacoes = async () => {
  try {
    const response = await api.get('/api/documentos/pendentes');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar lista de aprovações'
    };
  }
};

export const buscarDetalhesDocumento = async (documentoId) => {
  try {
    const response = await api.get(`/api/documentos/${documentoId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar detalhes do documento'
    };
  }
};

export const visualizarArquivoDocumento = async (documentoId) => {
  try {
    const response = await api.get(`/api/documentos/${documentoId}/arquivo`, {
      responseType: 'blob',
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao visualizar arquivo'
    };
  }
};

// Exportar também a instância do axios configurada para usos customizados
export { api };

// Exportar API_BASE_URL para compatibilidade com código existente
export { API_BASE_URL };
