import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../config/api';
import CnpjInput from '../components/CnpjInput';
import { cleanCnpj } from '../utils/cnpjValidator';

const Login = () => {
    const [cnpj, setCnpj] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Limpar localStorage ao carregar a página de login
        localStorage.removeItem('token');
        localStorage.removeItem('empresaData');
    }, []);

    const login = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Chamamos a API e guardamos a resposta completa
            const response = await loginUser({
                cnpj: cleanCnpj(cnpj),
                senha
            });
            
            // ==================================================================
            // AQUI ESTÁ A MUDANÇA PRINCIPAL
            // Verificamos a condição correta baseada na resposta da sua API
            // ==================================================================
            if (response && response.status === 'success') {
                // Os dados do usuário estão diretamente dentro de 'response.data'
                const responseData = response.data;
                
                const empresaData = {
                    id: responseData.empresaId,
                    empresaId: responseData.empresaId,
                    cnpj: responseData.cnpj,
                    razaoSocial: responseData.razaoSocial,
                    email: responseData.email,
                    tipo: responseData.tipo,
                    token: responseData.token
                };

                localStorage.setItem('token', responseData.token);
                localStorage.setItem('empresaData', JSON.stringify(empresaData));

                // Redirecionamento direto, sem a necessidade de setTimeout
                navigate('/dashboard', { replace: true });

            } else {
                // Mostra a mensagem de erro que vem da API, se houver
                setError(response.message || 'Falha no login. Verifique seu CNPJ e senha.');
            }
        } catch (err) {
            // Captura erros de rede ou falhas na chamada da API
            const errorMessage = err.response?.data?.message || 'Erro de conexão. Tente novamente.';
            setError(errorMessage);
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
                        <CnpjInput
                            id="cnpj-input"
                            name="cnpj"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            variant="outlined"
                            size="medium"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="senha-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Senha:
                        </label>
                        <input
                            id="senha-input"
                            name="senha"
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
                <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Não tem uma conta?
                    </p>
                    <Link 
                        to="/cadastro" 
                        style={{ 
                            color: '#1976d2', 
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        📝 Cadastrar Nova Empresa
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;