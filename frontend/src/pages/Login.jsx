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
    const [manutencao, setManutencao] = useState(true);
    const navigate = useNavigate();

    // Desbloqueio rápido: se digitar 'desbloquear' no CNPJ, libera o login
    const handleCnpjChange = (e) => {
            setCnpj(e.target.value);
            if (e.target.value.toLowerCase() === 'desbloquear') {
                setManutencao(false);
                setCnpj('');
                setError('');
            }
        };
    
        const login = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');
            try {
                const cleanedCnpj = cleanCnpj(cnpj);
                await loginUserApi(cleanedCnpj, senha);
                navigate('/dashboard');
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao fazer login.');
            } finally {
                setLoading(false);
            }
        };
    
        return (
            <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <div className="login-container" style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login</h2>
                    {manutencao ? (
                        <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
                            O sistema está em manutenção.
                        </div>
                    ) : null}
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
                                    disabled={manutencao}
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
                            disabled={loading || manutencao}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                cursor: loading || manutencao ? 'not-allowed' : 'pointer',
                                opacity: loading || manutencao ? 0.6 : 1
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