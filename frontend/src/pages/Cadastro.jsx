
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { registerUser } from '../services/api';

const schema = yup.object().shape({
  razaoSocial: yup.string().required('Nome da empresa é obrigatório'),
  cnpj: yup
    .string()
    .required('CNPJ é obrigatório')
    .test('valid-cnpj', 'CNPJ inválido', value => validateCnpj(value || '')),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  senha: yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
  confirmarSenha: yup
    .string()
    .oneOf([yup.ref('senha'), null], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
});

// Função de validação de CNPJ (mesma lógica do código antigo)
function validateCnpj(cnpj) {
  const cleanCnpj = (cnpj || '').replace(/\D/g, '');
  if (cleanCnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCnpj)) return false;
  let tamanho = cleanCnpj.length - 2;
  let numeros = cleanCnpj.substring(0, tamanho);
  let digitos = cleanCnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  tamanho = tamanho + 1;
  numeros = cleanCnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  return resultado === parseInt(digitos.charAt(1));
}

// Função para aplicar máscara de CNPJ
function formatCnpj(value) {
  const cleanValue = (value || '').replace(/\D/g, '');
  if (cleanValue.length <= 2) {
    return cleanValue;
  } else if (cleanValue.length <= 5) {
    return cleanValue.replace(/(\d{2})(\d{0,3})/, '$1.$2');
  } else if (cleanValue.length <= 8) {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else if (cleanValue.length <= 12) {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
  } else {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  }
}

const Cadastro = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    watch,
    trigger,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      razaoSocial: '',
      cnpj: '',
      email: '',
      senha: '',
      confirmarSenha: ''
    }
  });

  // Máscara de CNPJ em tempo real
  const handleCnpjChange = (e) => {
    const masked = formatCnpj(e.target.value);
    setValue('cnpj', masked);
    trigger('cnpj');
  };

  // Animação de entrada
  const [animate, setAnimate] = useState(false);
  React.useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  // Envio do formulário
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await registerUser({
        cnpj: data.cnpj.replace(/\D/g, ''),
        razaoSocial: data.razaoSocial,
        email: data.email,
        senha: data.senha,
        tipo: 'DESPACHANTE'
      });
      console.log('Resultado do cadastro:', result);
      if (result.success) {
        toast.success('✅ Cadastro realizado com sucesso! Redirecionando para login...', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: 'colored',
        });
        setTimeout(() => {
          setAnimate(false);
          setTimeout(() => navigate('/'), 400);
        }, 2000);
        reset();
      } else {
        // Garante que a mensagem de erro seja exibida corretamente
        const errorMsg = result.error || result.message || 'Erro ao cadastrar';
        toast.error(errorMsg, {
          position: 'top-center',
          autoClose: 3000,
          theme: 'colored',
        });
      }
    } catch (error) {
      toast.error('Erro de conexão. Tente novamente.', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cores
  const green = 'bg-[#28a745]';
  const greenHover = 'hover:bg-[#218838]';
  const yellow = 'bg-[#ffc107]';
  const yellowText = 'text-[#ffc107]';
  const borderGray = 'border-gray-200';
  const errorBorder = 'border-red-500';
  const validBorder = 'border-[#28a745]';
  const inputBase = 'block w-full px-4 py-2 rounded-lg border outline-none transition-colors duration-200 text-gray-900 placeholder-gray-400 bg-white focus:shadow-md';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Inter, Rubik, sans-serif'
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
          📋 Cadastro de Empresa
        </h2>
        <div style={{ textAlign: 'center', color: '#666', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
          Registre sua empresa para usar o sistema de validação de documentos
        </div>
  {/* Alerta de Manutenção removido */}
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="razaoSocial" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
              Nome da empresa:
              <input
                id="razaoSocial"
                name="razaoSocial"
                type="text"
                {...register('razaoSocial')}
                placeholder="Digite o nome da empresa"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.razaoSocial ? '#ff4d4f' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  marginTop: '0.3rem'
                }}
                aria-invalid={!!errors.razaoSocial}
                aria-describedby="razaoSocial-error"
              />
            </label>
            {errors.razaoSocial && (
              <span id="razaoSocial-error" style={{ color: 'red', fontSize: '0.95rem', marginTop: '0.3rem', display: 'block' }}>{errors.razaoSocial.message}</span>
            )}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="cnpj" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
              CNPJ:
              <input
                id="cnpj"
                name="cnpj"
                type="text"
                maxLength={18}
                {...register('cnpj')}
                value={watch('cnpj')}
                onChange={handleCnpjChange}
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.cnpj ? '#ff4d4f' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  marginTop: '0.3rem'
                }}
                aria-invalid={!!errors.cnpj}
                aria-describedby="cnpj-error"
              />
            </label>
            {errors.cnpj && (
              <span id="cnpj-error" style={{ color: 'red', fontSize: '0.95rem', marginTop: '0.3rem', display: 'block' }}>{errors.cnpj.message}</span>
            )}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
              Email:
              <input
                id="email"
                name="email"
                type="email"
                {...register('email')}
                placeholder="Digite o email da empresa"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.email ? '#ff4d4f' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  marginTop: '0.3rem'
                }}
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
            </label>
            {errors.email && (
              <span id="email-error" style={{ color: 'red', fontSize: '0.95rem', marginTop: '0.3rem', display: 'block' }}>{errors.email.message}</span>
            )}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="senha" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
              Senha:
              <input
                id="senha"
                name="senha"
                type={showPassword ? 'text' : 'password'}
                {...register('senha')}
                placeholder="Digite a senha"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.senha ? '#ff4d4f' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  marginTop: '0.3rem'
                }}
                aria-invalid={!!errors.senha}
                aria-describedby="senha-error"
              />
              <button
                type="button"
                tabIndex={0}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '2.5rem',
                  top: '2.7rem',
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </label>
            {errors.senha && (
              <span id="senha-error" style={{ color: 'red', fontSize: '0.95rem', marginTop: '0.3rem', display: 'block' }}>{errors.senha.message}</span>
            )}
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirmarSenha" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
              Confirmar Senha:
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmarSenha')}
                placeholder="Confirme a senha"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.confirmarSenha ? '#ff4d4f' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  marginTop: '0.3rem'
                }}
                aria-invalid={!!errors.confirmarSenha}
                aria-describedby="confirmarSenha-error"
              />
              <button
                type="button"
                tabIndex={0}
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '2.5rem',
                  top: '2.7rem',
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </label>
            {errors.confirmarSenha && (
              <span id="confirmarSenha-error" style={{ color: 'red', fontSize: '0.95rem', marginTop: '0.3rem', display: 'block' }}>{errors.confirmarSenha.message}</span>
            )}
          </div>
          <button
            type="submit"
            disabled={!isValid || loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: !isValid || loading ? 'not-allowed' : 'pointer',
              opacity: !isValid || loading ? 0.6 : 1,
              fontWeight: 'bold',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Cadastrando...' : '📝 Cadastrar Empresa'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Já tem uma conta?
          </p>
          <Link
            to="/"
            style={{
              color: '#1976d2',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            🔐 Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
