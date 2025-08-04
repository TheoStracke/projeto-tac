// URL base da API - Para produção usa URLs relativas
// Em desenvolvimento usa a variável de ambiente
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // URLs relativas em produção (mesmo domínio)
  : (import.meta.env.VITE_API_URL || 'http://localhost:8080/api');

export default API_BASE_URL;
