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
        // Limpar qualquer dado de sessão anterior ao carregar a página de login
        localStorage.removeItem('token');
        localStorage.removeItem('empresaData');
    }, []);

    const login = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // A função loginUser retorna { success: true, data: { ... } }
            const result = await loginUser({
                cnpj: cleanCnpj(cnpj),
                senha
            });

            // A verificação é feita em 'result.success', conforme o padrão do seu api.js
            if (result.success) {

                // O objeto da API (com status, message) está em 'result.data'
                const apiResponse = result.data;

                // E os dados da empresa (token, cnpj) estão um nível mais adentro, em 'apiResponse.data'
                const empresaInfo = apiResponse.data;

                // Montamos o objeto para salvar, pegando os dados do lugar certo
                const empresaDataToSave = {
                    id: empresaInfo.empresaId,
                    empresaId: empresaInfo.empresaId,
                    cnpj: empresaInfo.cnpj,
                    razaoSocial: empresaInfo.razaoSocial,
                    email: empresaInfo.email,
                    tipo: empresaInfo.tipo,
                    token: empresaInfo.token
                };

                // Salvamos o token e os dados da empresa no localStorage
                localStorage.setItem('token', empresaInfo.token);
                localStorage.setItem('empresaData', JSON.stringify(empresaDataToSave));

                // Navegamos para o dashboard com sucesso
                navigate('/dashboard', { replace: true });

            } else {
                // O objeto de erro já vem formatado pelo seu api.js
                setError(result.error);
            }
        } catch (err) {
            // Este catch agora é para segurança, caso algo muito inesperado aconteça
            setError('Ocorreu um erro inesperado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // O restante do seu JSX continua aqui...
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