import React, { useState } from 'react';
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
import axios from 'axios';
import API_BASE_URL from '../api';

export default function EnviarDocumento() {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    nomeMotorista: '',
    arquivo: null
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const empresaId = localStorage.getItem('empresaId');
  const empresaTipo = localStorage.getItem('empresaTipo');

  // Verificar se é despachante
  if (empresaTipo !== 'DESPACHANTE') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Apenas despachantes podem enviar documentos.
        </Alert>
      </Container>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      arquivo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('arquivo', formData.arquivo);
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('nomeMotorista', formData.nomeMotorista);
      formDataToSend.append('empresaId', empresaId);

      const response = await axios.post(`${API_BASE_URL}/documentos/enviar`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Documento enviado com sucesso! A Estrada Fácil foi notificada por email.');
      
      // Limpar formulário
      setFormData({
        titulo: '',
        descricao: '',
        nomeMotorista: '',
        arquivo: null
      });
      
      // Limpar input de arquivo
      document.getElementById('arquivo-input').value = '';

    } catch (err) {
      setError(err.response?.data || 'Erro ao enviar documento');
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Motorista"
                name="nomeMotorista"
                value={formData.nomeMotorista}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                onChange={handleInputChange}
                required
                placeholder="000.000.000-00"
              />
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Arquivo do Documento
                  </Typography>
                  <input
                    id="arquivo-input"
                    type="file"
                    onChange={handleFileChange}
                    required
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{ marginBottom: '10px' }}
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
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
                disabled={loading}
                startIcon={<CloudUpload />}
                sx={{ py: 2 }}
              >
                {loading ? 'Enviando...' : 'Enviar Documento'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
