import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Input,
  LinearProgress
} from '@mui/material';
import {
  Upload,
  Send,
  Search,
  Business,
  Person,
  AttachFile
} from '@mui/icons-material';
import { buscarEmpresasPorCnpj, buscarMotoristasPorCpfOuNome, enviarCertificado } from '../services/api';

const EnviarCertificadoModal = ({ open, onClose, onSuccess }) => {
  // Estados do formulário
  const [despachantesSugeridos, setDespachantesSugeridos] = useState([]);
  const [despachanteSelecionado, setDespachanteSelecionado] = useState(null);
  const [cnpjBusca, setCnpjBusca] = useState('');
  
  const [motoristasSugeridos, setMotoristasSugeridos] = useState([]);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [motoristaBusca, setMotoristaBusca] = useState('');
  
  const [arquivo, setArquivo] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  
  // Estados de controle
  const [loadingDespachantes, setLoadingDespachantes] = useState(false);
  const [loadingMotoristas, setLoadingMotoristas] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [progresso, setProgresso] = useState(0);

  // Limpar formulário ao fechar
  useEffect(() => {
    if (!open) {
      setDespachantesSugeridos([]);
      setDespachanteSelecionado(null);
      setCnpjBusca('');
      setMotoristasSugeridos([]);
      setMotoristaSelecionado(null);
      setMotoristaBusca('');
      setArquivo(null);
      setObservacoes('');
      setErro('');
      setProgresso(0);
    }
  }, [open]);

  // Buscar despachantes por CNPJ
  const buscarDespachantes = async (cnpj) => {
    if (!cnpj || cnpj.length < 8) {
      setDespachantesSugeridos([]);
      return;
    }

    setLoadingDespachantes(true);
    try {
      const resposta = await buscarEmpresasPorCnpj(cnpj);
      setDespachantesSugeridos(resposta.data || []);
    } catch (error) {
      console.error('Erro ao buscar despachantes:', error);
      setErro('Erro ao buscar despachantes. Tente novamente.');
      setDespachantesSugeridos([]);
    } finally {
      setLoadingDespachantes(false);
    }
  };

  // Buscar motoristas por CPF ou nome
  const buscarMotoristas = async (termo) => {
    if (!termo || termo.length < 3) {
      setMotoristasSugeridos([]);
      return;
    }

    setLoadingMotoristas(true);
    try {
      const resposta = await buscarMotoristasPorCpfOuNome(termo);
      setMotoristasSugeridos(resposta.data || []);
    } catch (error) {
      console.error('Erro ao buscar motoristas:', error);
      setErro('Erro ao buscar motoristas. Tente novamente.');
      setMotoristasSugeridos([]);
    } finally {
      setLoadingMotoristas(false);
    }
  };

  // Manipular mudança no campo de CNPJ
  const handleCnpjChange = (event, newValue) => {
    setCnpjBusca(newValue);
    if (newValue !== cnpjBusca) {
      buscarDespachantes(newValue);
    }
  };

  // Manipular mudança no campo de motorista
  const handleMotoristaChange = (event, newValue) => {
    setMotoristaBusca(newValue);
    if (newValue !== motoristaBusca) {
      buscarMotoristas(newValue);
    }
  };

  // Manipular seleção de arquivo
  const handleArquivoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo (certificados geralmente são PDF)
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!tiposPermitidos.includes(file.type)) {
        setErro('Tipo de arquivo não permitido. Use PDF, JPG ou PNG.');
        return;
      }
      
      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErro('Arquivo muito grande. Máximo permitido: 10MB.');
        return;
      }
      
      setArquivo(file);
      setErro('');
    }
  };

  // Enviar certificado
  const handleEnviar = async () => {
    // Validações
    if (!despachanteSelecionado) {
      setErro('Selecione um despachante.');
      return;
    }
    
    if (!motoristaSelecionado) {
      setErro('Selecione um motorista.');
      return;
    }
    
    if (!arquivo) {
      setErro('Selecione um arquivo para enviar.');
      return;
    }

    setEnviando(true);
    setErro('');
    setProgresso(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgresso(prev => Math.min(prev + 10, 90));
      }, 200);

      await enviarCertificado({
        despachanteId: despachanteSelecionado.id,
        motoristaId: motoristaSelecionado.id || null,
        motorista: motoristaSelecionado, // envia objeto completo
        arquivo: arquivo,
        observacoes: observacoes
      });

      clearInterval(progressInterval);
      setProgresso(100);

      // Sucesso
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);

    } catch (error) {
      console.error('Erro ao enviar certificado:', error);
      setErro(error.response?.data?.message || 'Erro ao enviar certificado. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send color="primary" />
          <Typography variant="h6">Enviar Certificado</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Selecione o despachante e motorista para enviar o certificado por e-mail
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {erro && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {erro}
          </Alert>
        )}

        {enviando && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Enviando certificado... {progresso}%
            </Typography>
            <LinearProgress variant="determinate" value={progresso} />
          </Box>
        )}

        {/* Seção Despachante */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business />
            Despachante
          </Typography>
          
          <Autocomplete
            freeSolo
            options={despachantesSugeridos}
            getOptionLabel={(option) => 
              typeof option === 'string' 
                ? option 
                : `${option.razaoSocial} - CNPJ: ${option.cnpj}`
            }
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body1">{option.razaoSocial}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    CNPJ: {option.cnpj} | E-mail: {option.email}
                  </Typography>
                </Box>
              </Box>
            )}
            inputValue={cnpjBusca}
            onInputChange={handleCnpjChange}
            onChange={(event, newValue) => {
              if (typeof newValue === 'object' && newValue !== null) {
                setDespachanteSelecionado(newValue);
              }
            }}
            loading={loadingDespachantes}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar por CNPJ"
                placeholder="Digite o CNPJ do despachante..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: (
                    <>
                      {loadingDespachantes && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                fullWidth
              />
            )}
          />
          
          {despachanteSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`✓ ${despachanteSelecionado.razaoSocial} - ${despachanteSelecionado.cnpj}`}
                color="success"
                variant="outlined"
                onDelete={() => {
                  setDespachanteSelecionado(null);
                  setCnpjBusca('');
                }}
              />
            </Box>
          )}
        </Box>

        {/* Seção Motorista */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person />
            Motorista
          </Typography>
          
          <Autocomplete
            freeSolo
            options={motoristasSugeridos}
            getOptionLabel={(option) => 
              typeof option === 'string' 
                ? option 
                : `${option.nome} - CPF: ${option.cpf}`
            }
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body1">{option.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    CPF: {option.cpf} | CNH: {option.cnh || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            )}
            inputValue={motoristaBusca}
            onInputChange={handleMotoristaChange}
            onChange={(event, newValue) => {
              if (typeof newValue === 'object' && newValue !== null) {
                setMotoristaSelecionado(newValue);
              }
            }}
            loading={loadingMotoristas}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar por CPF ou Nome"
                placeholder="Digite o CPF ou nome do motorista..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: (
                    <>
                      {loadingMotoristas && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                fullWidth
              />
            )}
          />
          
          {motoristaSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`✓ ${motoristaSelecionado.nome} - ${motoristaSelecionado.cpf}`}
                color="success"
                variant="outlined"
                onDelete={() => {
                  setMotoristaSelecionado(null);
                  setMotoristaBusca('');
                }}
              />
            </Box>
          )}
        </Box>

        {/* Seção Upload do Arquivo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachFile />
            Certificado
          </Typography>
          
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' },
              ...(arquivo && { borderColor: 'success.main', bgcolor: 'success.50' })
            }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Upload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              {arquivo ? arquivo.name : 'Clique para selecionar o arquivo'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
            </Typography>
            
            <Input
              id="file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleArquivoChange}
              sx={{ display: 'none' }}
            />
          </Box>
        </Box>

        {/* Observações */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Observações (opcional)"
            multiline
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Adicione observações sobre o certificado..."
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleEnviar}
          disabled={!despachanteSelecionado || !motoristaSelecionado || !arquivo || enviando}
          startIcon={enviando ? <CircularProgress size={20} /> : <Send />}
        >
          {enviando ? 'Enviando...' : 'Enviar Certificado'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnviarCertificadoModal;
