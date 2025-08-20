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

    const login = async (e) => {
        if (manutencao) return;
    // Desbloqueio rápido: se digitar 'desbloquear' no CNPJ e pressionar Enter, libera o login
    const handleCnpjChange = (e) => {
        setCnpj(e.target.value);
        if (e.target.value.toLowerCase() === 'desbloquear') {
            setManutencao(false);
            setCnpj('');
            setError('');
        }
    };
        // PATCH DE DEBUG COMPLETO
        console.log('---[DEBUG LOGIN]---');
        if (e) {
            console.log('Evento recebido:', e.type);
        } else {
            console.log('Nenhum evento recebido');
        }
        // Previne recarregamento
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
            console.log('e.preventDefault() chamado');
        } else {
            console.log('e.preventDefault() NÃO chamado');
        }
        setLoading(true);
        setError('');
        console.log('Valores do formulário:', { cnpj, senha });
        try {
            console.log('Chamando loginUserApi...');
            const result = await loginUserApi({
                cnpj: cleanCnpj(cnpj),
                senha
            });
            console.log('Resposta da API recebida:', result);
            if (!result) {
                console.error('Nenhum resultado retornado da API!');
            }
            const empresaInfo = result && result.success ? result.data : null;
            console.log('empresaInfo extraído:', empresaInfo);
            if (empresaInfo && empresaInfo.token) {
                const empresaDataToSave = {
                    empresaId: empresaInfo.empresaId,
                    cnpj: empresaInfo.cnpj,
                    razaoSocial: empresaInfo.razaoSocial,
                    email: empresaInfo.email,
                    tipo: empresaInfo.tipo,
                    token: empresaInfo.token
                };
                console.log('Preparando para salvar no localStorage:', empresaDataToSave);
                try {
                    localStorage.setItem('token', empresaInfo.token);
                    localStorage.setItem('empresaData', JSON.stringify(empresaDataToSave));
                    console.log('Token salvo no localStorage:', localStorage.getItem('token'));
                    console.log('empresaData salvo:', localStorage.getItem('empresaData'));
                } catch (storageErr) {
                    console.error('Erro ao salvar no localStorage:', storageErr);
                }
                console.log('Login bem-sucedido! Redirecionando para o dashboard...');
                navigate('/dashboard', { replace: true });
            } else {
                setError(result && result.error ? result.error : 'Dados de login inválidos ou resposta inesperada do servidor.');
                console.error('empresaInfo ou token ausente:', result);
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado de conexão. Tente novamente.');
            console.error('Erro de login (catch):', err);
        } finally {
            setLoading(false);
            console.log('---[FIM DEBUG LOGIN]---');
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
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    Sistema de Validação de Documentos
                </h2>
                {manutencao ? (
                    <div style={{ textAlign: 'center', color: '#b71c1c', marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        O sistema está em manutenção e estará disponível para uso às 15h.<br/>
                        <span style={{ fontSize: '0.95rem', color: '#444' }}>
                            (Para testes: digite <b>desbloquear</b> no campo CNPJ e pressione Enter)
                        </span>
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
                                disabled={manutencao}
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
}

export default Login;