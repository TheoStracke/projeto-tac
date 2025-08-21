import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser as loginUserApi } from '../services/api';
import CnpjInput from '../components/CnpjInput';
import { cleanCnpj } from '../utils/cnpjValidator';


const Login = () => {
    const [cnpj, setCnpj] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Permitir apenas números no campo CNPJ
    const handleCnpjChange = (e) => {
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        setCnpj(onlyNumbers);
    };
    
    const login = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const cleanedCnpj = cleanCnpj(cnpj);
            // Garante que o CNPJ vai como string
            const result = await loginUserApi({ cnpj: String(cleanedCnpj), senha });
            if (result.success && result.data) {
                // Salva token e dados da empresa no localStorage
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('empresaData', JSON.stringify({
                    empresaId: result.data.empresaId,
                    cnpj: result.data.cnpj,
                    razaoSocial: result.data.razaoSocial,
                    email: result.data.email,
                    tipo: result.data.tipo,
                    token: result.data.token
                }));
                navigate('/dashboard');
            } else {
                setError(result.error || 'Erro ao fazer login.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erro ao fazer login.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
            <div className="login-container" style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <div style={{
                    background: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffeeba',
                    borderRadius: '6px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                }}>
                    Atenção: O sistema está em manutenção.<br/>
                    Podem ocorrer erros e <b>não deve ser enviado nenhum tipo de arquivo</b> neste momento.
                </div>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login</h2>
                <form autoComplete="on" onSubmit={login}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="cnpj-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            CNPJ:
                            <CnpjInput
                                id="cnpj-input"
                                name="cnpj"
                                value={cnpj}
                                onChange={handleCnpjChange}
                                variant="outlined"
                                size="medium"
                                required
                            />
                        </label>
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
};

export default Login;