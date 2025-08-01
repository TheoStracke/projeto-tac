import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Business, Email, Lock, Person } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../api';

const Cadastro = () => {
  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'DESPACHANTE' // Por padrão, novos cadastros são despachantes
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const formatCnpj = (value) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, '');
    
    // Aplica máscara: XX.XXX.XXX/XXXX-XX
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
  };

  const validateCnpj = (cnpj) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCnpj)) return false;
    
    // Validação dos dígitos verificadores
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
  };

  const handleChange = (field, value) => {
    if (field === 'cnpj') {
      value = formatCnpj(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erros quando usuário começar a digitar
    if (error) setError('');
  };

  const validateForm = () => {
    // Validar CNPJ
    if (!validateCnpj(formData.cnpj)) {
      setError('CNPJ inválido');
      return false;
    }

    // Validar campos obrigatórios
    if (!formData.razaoSocial.trim()) {
      setError('Razão Social é obrigatória');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    // Validar senha
    if (formData.senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    // Validar confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      setError('Senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/cadastro`, {
        cnpj: formData.cnpj.replace(/\D/g, ''), // Remove formatação
        razaoSocial: formData.razaoSocial,
        email: formData.email,
        senha: formData.senha,
        tipo: formData.tipo
      });

      if (response.data && response.data.success) {
        setSuccess('✅ Cadastro realizado com sucesso! Redirecionando para login...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(response.data?.message || 'Erro no cadastro');
      }

    } catch (error) {
      if (error.response?.status === 400) {
        setError(error.response.data?.message || 'CNPJ já cadastrado ou dados inválidos');
      } else if (error.response?.status === 409) {
        setError('CNPJ ou email já cadastrado no sistema');
      } else {
        setError('Erro no servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Business sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              📋 Cadastro de Empresa
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Registre sua empresa para usar o sistema de validação de documentos
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              {/* CNPJ */}
              <TextField
                margin="normal"
                required
                fullWidth
                label="CNPJ"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                inputProps={{ maxLength: 18 }}
                error={error && error.includes('CNPJ')}
                helperText={error && error.includes('CNPJ') ? error : 'Digite o CNPJ da empresa'}
                autoFocus
                InputProps={{
                  startAdornment: <Business sx={{ color: 'action.active', mr: 1 }} />
                }}
              />

              {/* Razão Social */}
              <TextField
                margin="normal"
                required
                fullWidth
                label="Razão Social"
                value={formData.razaoSocial}
                onChange={(e) => handleChange('razaoSocial', e.target.value)}
                InputProps={{
                  startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
                }}
              />

              {/* Email */}
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                InputProps={{
                  startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />
                }}
              />

              {/* Tipo de Empresa */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de Empresa</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo de Empresa"
                  onChange={(e) => handleChange('tipo', e.target.value)}
                  disabled // Por segurança, novos cadastros sempre são DESPACHANTE
                >
                  <MenuItem value="DESPACHANTE">🚛 Despachante</MenuItem>
                  <MenuItem value="ESTRADA_FACIL" disabled>🔧 Admin (Estrada Fácil)</MenuItem>
                </Select>
              </FormControl>

              {/* Senha */}
              <TextField
                margin="normal"
                required
                fullWidth
                label="Senha"
                type="password"
                value={formData.senha}
                onChange={(e) => handleChange('senha', e.target.value)}
                InputProps={{
                  startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
                }}
                helperText="Mínimo de 6 caracteres"
              />

              {/* Confirmar Senha */}
              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirmar Senha"
                type="password"
                value={formData.confirmarSenha}
                onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                InputProps={{
                  startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
                }}
              />

              {/* Botão de Cadastrar */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Cadastrando...
                  </>
                ) : (
                  '📝 Cadastrar Empresa'
                )}
              </Button>

              {/* Link para Login */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Já tem uma conta?{' '}
                  <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
                    🔐 Fazer Login
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Cadastro;
