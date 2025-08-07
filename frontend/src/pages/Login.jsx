import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser as loginUserApi } from '../config/api';
import CnpjInput from '../components/CnpjInput';
import { cleanCnpj } from '../utils/cnpjValidator';

const Login = () => {
    const [cnpj, setCnpj] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const login = async (e) => {
        // Previne o comportamento padrão do formulário de recarregar a página
        if (e) e.preventDefault();
        
        setLoading(true);
        setError('');
        console.log('Iniciando o processo de login...');

        try {
            const result = await loginUserApi({
                cnpj: cleanCnpj(cnpj),
                senha
            });
            console.log('Resposta da API recebida:', result);

            // CORREÇÃO: Acessa o objeto 'data' que contém as informações da empresa.
            // A API retorna uma estrutura aninhada: { success: true, data: { ...empresaInfo } }
            const empresaInfo = result.success ? result.data : null;

            // Validação robusta para garantir que 'empresaInfo' e o 'token' existem
            if (empresaInfo && empresaInfo.token) {
                const empresaDataToSave = {
                    empresaId: empresaInfo.empresaId,
                    cnpj: empresaInfo.cnpj,
                    razaoSocial: empresaInfo.razaoSocial,
                    email: empresaInfo.email,
                    tipo: empresaInfo.tipo,
                    token: empresaInfo.token
                };
                
                // Salva os dados corretos no localStorage
                localStorage.setItem('token', empresaInfo.token);
                localStorage.setItem('empresaData', JSON.stringify(empresaDataToSave));
                
                console.log('Login bem-sucedido! Redirecionando para o dashboard...');
                // Redireciona o usuário para o dashboard
                navigate('/dashboard', { replace: true });

            } else {
                // Mensagem de erro caso a resposta não venha no formato esperado
                setError(result.error || 'Dados de login inválidos ou resposta inesperada do servidor.');
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado de conexão. Tente novamente.');
            console.error('Erro de login:', err);
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
                <form autoComplete="on" onSubmit={login}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="cnpj-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            CNPJ:
                            <CnpjInput
                                id="cnpj-input"
                                name="cnpj"
                                value={cnpj}
                                onChange={(e) => setCnpj(e.target.value)}
                                variant="outlined"
                                size="medium"
                                required
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="senha-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Senha:
                            <input
                                id="senha-input"
                                name="senha"
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                autoComplete="current-password"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            />
                        </label>
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
                        id="login-submit"
                        name="login-submit"
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
}

export default Login;