import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import axios from 'axios';

export default function PaginaAprovacao() {
  const { token } = useParams();
  const [documento, setDocumento] = useState(null);
  const [comentarios, setComentarios] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    carregarDocumento();
  }, [token]);

  const carregarDocumento = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/aprovacao/${token}`);
      setDocumento(response.data);
    } catch (error) {
      setError('Documento não encontrado ou token inválido');
    } finally {
      setLoading(false);
    }
  };

  const processarAprovacao = async (aprovado) => {
    setProcessing(true);
    setError('');

    try {
      await axios.post(`http://localhost:8080/aprovacao/${token}`, {
        aprovado,
        comentarios
      });

      setSuccess(`Documento ${aprovado ? 'aprovado' : 'rejeitado'} com sucesso! O despachante foi notificado por email.`);
      
      // Recarregar documento para mostrar status atualizado
      setTimeout(() => {
        carregarDocumento();
      }, 2000);

    } catch (error) {
      setError(error.response?.data || 'Erro ao processar aprovação');
    } finally {
      setProcessing(false);
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDENTE':
        return 'warning';
      case 'APROVADO':
        return 'success';
      case 'REJEITADO':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography align="center">Carregando...</Typography>
      </Container>
    );
  }

  if (error && !documento) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Validação de Documento
        </Typography>
        
        <Typography variant="h6" gutterBottom align="center" color="text.secondary">
          Estrada Fácil - Sistema de Aprovação
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

        {documento && (
          <>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {documento.titulo}
                    </Typography>
                    <Chip
                      label={documento.status}
                      color={getStatusColor(documento.status)}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Motorista
                    </Typography>
                    <Typography variant="body1">
                      {documento.nomeMotorista}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Despachante
                    </Typography>
                    <Typography variant="body1">
                      {documento.empresaRemetente?.razaoSocial}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Data de Envio
                    </Typography>
                    <Typography variant="body1">
                      {formatarData(documento.dataEnvio)}
                    </Typography>
                  </Grid>

                  {documento.descricao && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Descrição
                      </Typography>
                      <Typography variant="body1">
                        {documento.descricao}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Arquivo
                    </Typography>
                    <Typography variant="body1">
                      {documento.nomeArquivoOriginal}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {documento.status === 'PENDENTE' ? (
              <Box>
                <TextField
                  fullWidth
                  label="Comentários (opcional)"
                  multiline
                  rows={3}
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  sx={{ mb: 3 }}
                  placeholder="Adicione comentários sobre a decisão..."
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<CheckCircle />}
                    onClick={() => processarAprovacao(true)}
                    disabled={processing}
                    sx={{ minWidth: 150 }}
                  >
                    {processing ? 'Processando...' : 'Aprovar'}
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<Cancel />}
                    onClick={() => processarAprovacao(false)}
                    disabled={processing}
                    sx={{ minWidth: 150 }}
                  >
                    {processing ? 'Processando...' : 'Rejeitar'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Este documento já foi processado
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Status: <strong>{documento.status}</strong>
                </Typography>
                {documento.comentarios && (
                  <Typography variant="body2" color="text.secondary">
                    Comentários: {documento.comentarios}
                  </Typography>
                )}
                {documento.dataAprovacao && (
                  <Typography variant="body2" color="text.secondary">
                    Processado em: {formatarData(documento.dataAprovacao)}
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
}
