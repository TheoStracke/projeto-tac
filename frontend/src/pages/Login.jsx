import React, { useState } from 'react';
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

    const login = async (e) => {
        e.preventDefault();
        console.log("🔹 Iniciando login...");
        setLoading(true);
        setError('');
        try {
            const result = await loginUser({
                cnpj: cleanCnpj(cnpj),
                senha
            });
            if (result.success) {
                console.log("📦 Salvando token:", result.data.token);
                console.log("🏢 Salvando empresa:", result.data);
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('empresa', JSON.stringify(result.data)); // usar mesma chave que Dashboard

                console.log("➡️ Navegando para dashboard...");
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 0);
            } else {
                console.log("❌ Login falhou:", result.error);
                setError(result.error || 'Falha no login. Verifique seu CNPJ e senha.');
            }
        } catch (err) {
            console.log("❌ Erro no login:", err);
            setError('Falha no login. Verifique seu CNPJ e senha.');
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
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            variant="outlined"
                            size="medium"
                            required
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
