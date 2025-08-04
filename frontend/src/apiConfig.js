// Configuração da API Base URL
// Em desenvolvimento: usa VITE_API_URL do .env ou fallback para localhost
// Em produção: usa VITE_API_URL do .env.production (Railway)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default API_BASE_URL;
