
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { registerUser } from '../config/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        toast.error(result.error || 'Erro ao cadastrar', {
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
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 font-sans transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ fontFamily: 'Inter, Rubik, sans-serif' }}
    >
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 animate-fade-in"
        autoComplete="off"
        tabIndex={0}
        aria-label="Cadastro de empresa"
      >
        <h1 className="text-2xl font-bold text-center mb-2 text-[#28a745]">📋 Cadastro de Empresa</h1>
        <p className="text-center text-gray-500 mb-4">Registre sua empresa para usar o sistema de validação de documentos</p>

        {/* Nome da empresa */}
        <div>
          <label htmlFor="razaoSocial" className="block mb-1 font-medium text-gray-700">Nome da empresa</label>
          <input
            id="razaoSocial"
            type="text"
            {...register('razaoSocial')}
            className={`${inputBase} ${errors.razaoSocial ? errorBorder : watch('razaoSocial') && !errors.razaoSocial ? validBorder : borderGray}`}
            placeholder="Digite o nome da empresa"
            aria-invalid={!!errors.razaoSocial}
            aria-describedby="razaoSocial-error"
            autoFocus
          />
          {errors.razaoSocial && (
            <span id="razaoSocial-error" className="text-red-500 text-sm mt-1 block">{errors.razaoSocial.message}</span>
          )}
        </div>

        {/* CNPJ */}
        <div>
          <label htmlFor="cnpj" className="block mb-1 font-medium text-gray-700">CNPJ</label>
          <input
            id="cnpj"
            type="text"
            maxLength={18}
            {...register('cnpj')}
            value={watch('cnpj')}
            onChange={handleCnpjChange}
            className={`${inputBase} ${errors.cnpj ? errorBorder : watch('cnpj') && !errors.cnpj ? validBorder : borderGray}`}
            placeholder="00.000.000/0000-00"
            aria-invalid={!!errors.cnpj}
            aria-describedby="cnpj-error"
            inputMode="numeric"
          />
          {errors.cnpj && (
            <span id="cnpj-error" className="text-red-500 text-sm mt-1 block">{errors.cnpj.message}</span>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`${inputBase} ${errors.email ? errorBorder : watch('email') && !errors.email ? validBorder : borderGray}`}
            placeholder="Digite o email da empresa"
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
            autoComplete="username"
          />
          {errors.email && (
            <span id="email-error" className="text-red-500 text-sm mt-1 block">{errors.email.message}</span>
          )}
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="senha" className="block mb-1 font-medium text-gray-700">Senha</label>
          <div className="relative">
            <input
              id="senha"
              type={showPassword ? 'text' : 'password'}
              {...register('senha')}
              className={`${inputBase} pr-12 ${errors.senha ? errorBorder : watch('senha') && !errors.senha ? validBorder : borderGray}`}
              placeholder="Digite a senha"
              aria-invalid={!!errors.senha}
              aria-describedby="senha-error"
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#28a745] focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m2.062-2.325A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.236-.938 4.675m-2.062 2.325A9.956 9.956 0 0112 21c-2.21 0-4.267-.72-5.938-1.95" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 1112 0 6 6 0 01-12 0z" /></svg>
              )}
            </button>
          </div>
          {errors.senha && (
            <span id="senha-error" className="text-red-500 text-sm mt-1 block">{errors.senha.message}</span>
          )}
        </div>

        {/* Confirmar Senha */}
        <div>
          <label htmlFor="confirmarSenha" className="block mb-1 font-medium text-gray-700">Confirmar Senha</label>
          <div className="relative">
            <input
              id="confirmarSenha"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmarSenha')}
              className={`${inputBase} pr-12 ${errors.confirmarSenha ? errorBorder : watch('confirmarSenha') && !errors.confirmarSenha ? validBorder : borderGray}`}
              placeholder="Confirme a senha"
              aria-invalid={!!errors.confirmarSenha}
              aria-describedby="confirmarSenha-error"
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#28a745] focus:outline-none"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m2.062-2.325A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.236-.938 4.675m-2.062 2.325A9.956 9.956 0 0112 21c-2.21 0-4.267-.72-5.938-1.95" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 1112 0 6 6 0 01-12 0z" /></svg>
              )}
            </button>
          </div>
          {errors.confirmarSenha && (
            <span id="confirmarSenha-error" className="text-red-500 text-sm mt-1 block">{errors.confirmarSenha.message}</span>
          )}
        </div>

        {/* Botão de Cadastrar */}
        <button
          type="submit"
          className={`w-full py-3 mt-2 font-semibold text-white rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#28a745] focus:ring-offset-2 ${green} ${greenHover} ${!isValid || loading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'} flex items-center justify-center`}
          disabled={!isValid || loading}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          ) : (
            '📝 Cadastrar Empresa'
          )}
        </button>

        {/* Link para Login */}
        <div className="text-center mt-2">
          <span className="text-gray-600">Já tem uma conta?{' '}
            <Link to="/" className="text-[#28a745] hover:underline font-semibold transition-colors duration-150">🔐 Fazer Login</Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Cadastro;
