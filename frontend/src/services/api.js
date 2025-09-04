// Cadastro manual de motorista
export const cadastrarMotorista = async (motorista) => {
  try {
    const response = await apiClient.post('/motoristas/cadastrar', motorista);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Erro ao cadastrar motorista' };
  }
};
import axios from 'axios';

// Configuração centralizada da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

console.log('🔗 API Base URL configurada:', API_BASE_URL);

// Criar instância do Axios com configurações padrão
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  withCredentials: false, // Simplifica CORS, usamos Bearer token
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para adicionar token JWT automaticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Só adiciona token se não for endpoint público
    const isPublicEndpoint = 
      config.url?.includes('/auth/') || 
      config.url?.includes('/aprovacao/') ||
      config.url?.includes('/health');
    
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log da requisição em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas e erros
apiClient.interceptors.response.use(
  (response) => {
    // Log da resposta em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`✅ Resposta ${response.status}:`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ Erro na requisição:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Se token expirado ou inválido, limpar dados e redirecionar
    if (error.response?.status === 401) {
      console.warn('🔒 Token inválido ou expirado. Redirecionando para login...');
      localStorage.removeItem('token');
      localStorage.removeItem('empresaData');
      
      // Só redireciona se não estivermos em páginas públicas
      const currentPath = window.location.pathname;
      const isPublicPath = 
        currentPath.includes('/login') || 
        currentPath.includes('/cadastro') ||
        currentPath.includes('/aprovacao/');
      
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// === FUNÇÕES DE AUTENTICAÇÃO ===

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    if (response.data?.data) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
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
    const response = await apiClient.post('/auth/cadastro', userData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || 'Erro ao fazer cadastro'
    };
  }
};

// === FUNÇÕES DE DOCUMENTOS ===

export const enviarDocumento = async (formData) => {
  try {
    const response = await apiClient.post('/documentos/enviar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Erro ao enviar documento'
    };
  }
};

export const buscarDocumentos = async (empresaId = null) => {
  try {
    const url = empresaId 
      ? `/documentos/empresa/${empresaId}`
      : '/documentos/pendentes';
    
    const response = await apiClient.get(url);
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
    const response = await apiClient.get(`/documentos/${documentoId}`);
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


export const aprovarDocumento = async (documentoId, comentarios = '') => {
  try {
    const response = await apiClient.post(
      `/documentos/${documentoId}/aprovar`,
      { comentarios }
    );
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


export const rejeitarDocumento = async (documentoId, comentarios = '') => {
  try {
    const response = await apiClient.post(
      `/documentos/${documentoId}/rejeitar`,
      { comentarios }
    );
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
    const response = await apiClient.get(`/documentos/${documentoId}/arquivo`, {
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

// === FUNÇÕES DE APROVAÇÃO (via link/token) ===

export const buscarAprovacao = async (token) => {
  try {
    const response = await apiClient.get(`/aprovacao/${token}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Documento não encontrado ou token inválido'
    };
  }
};

export const processarAprovacao = async (token, aprovado, comentarios = '') => {
  try {
    const response = await apiClient.post(`/aprovacao/${token}`, {
      aprovado,
      comentarios
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

// === FUNÇÕES DE PEDIDOS ===

export const buscarPedidos = async () => {
  try {
    const empresaDataStr = localStorage.getItem('empresaData');
    let url = '/pedidos';
    
    if (empresaDataStr) {
      const empresaData = JSON.parse(empresaDataStr);
      if (empresaData.tipo !== 'ESTRADA_FACIL' && empresaData.empresaId) {
        url = `/pedidos/empresa/${empresaData.empresaId}`;
      }
    }
    
    const response = await apiClient.get(url);
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

export const enviarPedidoDocumentos = async (formData) => {
  try {
    const response = await apiClient.post('/pedidos/enviar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Erro ao enviar pedido de documentos'
    };
  }
};

// === FUNÇÕES UTILITÁRIAS ===

export const buscarDetalhesDocumento = async (documentoId) => {
  return buscarDocumento(documentoId);
};

export const visualizarArquivoDocumento = async (documentoId) => {
  return downloadArquivo(documentoId);
};

export const buscarListaAprovacoes = async () => {
  return buscarDocumentos();
};

// ==========================================
// FUNÇÕES PARA ENVIO DE CERTIFICADO
// ==========================================

// Buscar empresas/despachantes por CNPJ
export const buscarEmpresasPorCnpj = async (cnpj) => {
  try {
    console.log('🔍 Buscando empresas por CNPJ:', cnpj);
    const response = await apiClient.get(`/empresas/buscar`, {
      params: { cnpj: cnpj }
    });
    console.log('✅ Empresas encontradas:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Erro ao buscar empresas:', error);
    throw error;
  }
};

// Buscar motoristas por CPF ou nome
export const buscarMotoristasPorCpfOuNome = async (termo) => {
  try {
    console.log('🔍 Buscando motoristas por termo:', termo);
    const response = await apiClient.get(`/motoristas/buscar`, {
      params: { termo: termo }
    });
    console.log('✅ Motoristas encontrados:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Erro ao buscar motoristas:', error);
    throw error;
  }
};

// Enviar certificado para despachante
/**
 * Envia um certificado para o backend (assíncrono, 30s timeout).
 * Retorna { success: true } mesmo em timeout, pois o backend processa em background.
 * @param {Object} dados - { despachanteId, motoristaId, arquivo, observacoes }
 */
export const enviarCertificado = async (dados) => {
  try {
    const formData = new FormData();
    formData.append('despachanteId', dados.despachanteId);
    formData.append('motoristaId', dados.motoristaId);
    formData.append('arquivo', dados.arquivo);
    formData.append('observacoes', dados.observacoes || '');

    const response = await apiClient.post('/certificados/enviar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      // Timeout: considera sucesso em background
      return { success: true, timeout: true };
    }
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Erro ao enviar certificado'
    };
  }
};

// Exportar URL base para compatibilidade
export { API_BASE_URL };

export default apiClient;