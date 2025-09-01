import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { enviarPedidoDocumentos, buscarMotoristasPorCpfOuNome } from '../services/api';
import CadastroMotoristaModal from '../components/CadastroMotoristaModal';

export default function EnviarDocumento() {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    arquivos: [null, null, null],
    motorista: null,
  });
  const [arquivosEnviados, setArquivosEnviados] = useState([null, null, null]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [motoristas, setMotoristas] = useState([]);
  const [motoristaBusca, setMotoristaBusca] = useState('');
  const [modalCadastroOpen, setModalCadastroOpen] = useState(false);

  const empresaData = JSON.parse(localStorage.getItem('empresaData') || '{}');

  // Verificar se é despachante
  if (empresaData.tipo !== 'DESPACHANTE') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Apenas despachantes podem enviar documentos.
        </Alert>
      </Container>
    );
  }


  // Busca motoristas cadastrados conforme digitação
  useEffect(() => {
    const buscar = async () => {
      if (motoristaBusca.length < 3) {
        setMotoristas([]);
        return;
      }
      try {
        const res = await buscarMotoristasPorCpfOuNome(motoristaBusca);
        setMotoristas(res.data || []);
      } catch {
        setMotoristas([]);
      }
    };
    buscar();
  }, [motoristaBusca, modalCadastroOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (idx, e) => {
    const file = e.target.files[0] || null;
    setFormData(prev => {
      const novos = [...prev.arquivos];
      novos[idx] = file;
      return { ...prev, arquivos: novos };
    });
  };

  const handleEnviarArquivo = (idx) => async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const file = formData.arquivos[idx];
    if (!file) {
      setError(`Selecione um arquivo para o campo ${idx + 1}.`);
      return;
    }
    setArquivosEnviados(prev => {
      const novos = [...prev];
      novos[idx] = file;
      return novos;
    });
    setSuccess(`Arquivo ${file.name} pronto para envio.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validação: pelo menos 2 arquivos enviados
    const arquivosParaEnviar = arquivosEnviados.filter(Boolean);
    if (arquivosParaEnviar.length < 2) {
      setError('Envie pelo menos 2 arquivos antes de enviar o pedido.');
      setLoading(false);
      return;
    }
    if (!formData.motorista || !formData.motorista.id) {
      setError('Selecione um motorista cadastrado para enviar o documento.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('descricao', formData.descricao);
      data.append('motoristaId', formData.motorista.id);
      data.append('empresaId', empresaData.id);
      arquivosParaEnviar.forEach((file) => {
        data.append('arquivos', file);
      });

      const result = await enviarPedidoDocumentos(data);

      if (result.success) {
        setSuccess('Pedido de aprovação enviado com sucesso! A Estrada Fácil foi notificada por email.');
        setFormData({ titulo: '', descricao: '', arquivos: [null, null, null], motorista: null });
        setArquivosEnviados([null, null, null]);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao enviar pedido de documentos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Enviar Documento para Validação
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}


        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título do Documento"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Buscar Motorista (nome ou CPF)"
                value={motoristaBusca}
                onChange={e => setMotoristaBusca(e.target.value)}
                placeholder="Digite ao menos 3 letras ou números"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" fullWidth sx={{ height: '100%' }} onClick={() => setModalCadastroOpen(true)}>
                Cadastrar novo motorista
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Selecione um motorista cadastrado"
                value={formData.motorista ? formData.motorista.id : ''}
                onChange={e => {
                  const selected = motoristas.find(m => String(m.id) === e.target.value);
                  setFormData(prev => ({ ...prev, motorista: selected || null }));
                }}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Selecione...</option>
                {motoristas.map(m => (
                  <option key={m.id} value={m.id}>{m.nome} - CPF: {m.cpf}</option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Envie até 3 arquivos (mínimo 2)
                  </Typography>
                  {[0,1,2].map(idx => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={e => handleFileChange(idx, e)}
                        style={{ marginRight: 8 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleEnviarArquivo(idx)}
                        disabled={!formData.arquivos[idx] || arquivosEnviados[idx]}
                      >
                        {arquivosEnviados[idx] ? 'Arquivo pronto' : 'Enviar arquivo'}
                      </Button>
                      {formData.arquivos[idx] && (
                        <span style={{ marginLeft: 8 }}>{formData.arquivos[idx].name}</span>
                      )}
                    </Box>
                  ))}
                  <Typography variant="caption" display="block" color="text.secondary">
                    Só será possível enviar o pedido após pelo menos 2 arquivos enviados.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || arquivosEnviados.filter(Boolean).length < 2}
                startIcon={<CloudUpload />}
                sx={{ py: 2 }}
              >
                {loading ? 'Enviando...' : 'Enviar Pedido'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
