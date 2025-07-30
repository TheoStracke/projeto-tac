import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [cnpj, setCnpj] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const login = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cnpj, senha })
            });

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const data = await response.json();
            console.log("Resposta completa do backend:", data);
            
            // Ajustar para o formato ApiResponse
            if (data.success === true || (data.data && data.data.token)) {
                // Salvar token no localStorage
                const tokenData = data.data || data;
                localStorage.setItem('token', tokenData.token);
                localStorage.setItem('empresa', JSON.stringify(tokenData));
                
                console.log("Login realizado com sucesso:", tokenData);
                
                // Redirecionar para dashboard
                navigate('/dashboard');
            } else {
                setError(data.message || 'Erro no login');
            }
            
        } catch (error) {
            console.error("Erro no login:", error);
            setError('Erro de conexão com o servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    Sistema de Validação de Documentos
                </h2>
                
                <form onSubmit={login}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            CNPJ:
                        </label>
                        <input
                            type="text"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            placeholder="00.000.000/0000-00"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Senha:
                        </label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    
                    {error && (
                        <div style={{
                            color: 'red',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        <strong>CNPJs ADMIN (podem aprovar):</strong><br/>
                        43.403.910/0001-28<br/>
                        20.692.051/0001-39<br/>
                        Senha: senha123
                    </p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        <strong>CNPJs DESPACHANTE (apenas enviam):</strong><br/>
                        Qualquer outro CNPJ cadastrado<br/>
                        Senha: senha123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
