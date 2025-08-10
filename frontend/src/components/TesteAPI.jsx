import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../services/api';

export default function TesteAPI() {
  const [info, setInfo] = useState({});

  useEffect(() => {
    // Capturar todas as informações relevantes
    const infoAPI = {
      API_BASE_URL_SERVICES: API_BASE_URL,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      ALL_ENV: import.meta.env
    };
    
    setInfo(infoAPI);
    console.log('🔧 DEBUG - Configurações da API:', infoAPI);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔧 Debug - Configuração da API</h2>
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h3>Variáveis de Ambiente:</h3>
        <pre>{JSON.stringify(info, null, 2)}</pre>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Teste de Requisição:</h3>
        <button 
          onClick={async () => {
            try {
              console.log('🚀 Testando requisição para:', API_BASE_URL + '/health');
              const response = await fetch(API_BASE_URL + '/health');
              const data = await response.json();
              console.log('✅ Resposta:', data);
              alert('Sucesso! Veja o console para detalhes.');
            } catch (error) {
              console.error('❌ Erro:', error);
              alert('Erro! Veja o console para detalhes.');
            }
          }}
        >
          Testar API
        </button>
      </div>
    </div>
  );
}
