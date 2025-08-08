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
import { buscarAprovacao, processarAprovacao } from '../config/api';

// Importar a URL base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://projeto-tac-production-8a69.up.railway.app/api';

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
      const result = await buscarAprovacao(token);
      if (result.success) {
        setDocumento(result.data);
        setError('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Documento não encontrado ou token inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessarAprovacao = async (aprovado) => {
    setProcessing(true);
    setError('');

    try {
      const result = await processarAprovacao(token, aprovado, comentarios);
      
      if (result.success) {
        setSuccess(`Documento ${aprovado ? 'aprovado' : 'rejeitado'} com sucesso! O despachante foi notificado por email.`);
        
        // Recarregar documento para mostrar status atualizado
        setTimeout(() => {
          carregarDocumento();
        }, 2000);
      } else {
        setError(result.error);
      }

    } catch (error) {
      setError('Erro ao processar aprovação');
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
                      size="medium"
                      sx={{
                        fontWeight: 'bold',
                        ...(documento.status === 'APROVADO' && {
                          backgroundColor: '#4caf50',
                          color: 'white',
                          '& .MuiChip-label': {
                            color: 'white'
                          }
                        }),
                        ...(documento.status === 'REJEITADO' && {
                          backgroundColor: '#f44336',
                          color: 'white',
                          '& .MuiChip-label': {
                            color: 'white'
                          }
                        }),
                        ...(documento.status === 'PENDENTE' && {
                          backgroundColor: '#ff9800',
                          color: 'white',
                          '& .MuiChip-label': {
                            color: 'white'
                          }
                        })
                      }}
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
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      📎 {documento.nomeArquivoOriginal}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        window.open(
                          `${API_BASE_URL}/aprovacao/${token}/arquivo`,
                          '_blank'
                        );
                      }}
                      size="small"
                    >
                      📥 Visualizar/Baixar Arquivo
                    </Button>
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
                    onClick={() => handleProcessarAprovacao(true)}
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
                    onClick={() => handleProcessarAprovacao(false)}
                    disabled={processing}
                    sx={{ minWidth: 150 }}
                  >
                    {processing ? 'Processando...' : 'Rejeitar'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Este documento já foi processado
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>Status:</Typography>
                  <Chip
                    label={documento.status}
                    size="large"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      ...(documento.status === 'APROVADO' && {
                        backgroundColor: '#4caf50',
                        color: 'white',
                        '& .MuiChip-label': {
                          color: 'white'
                        }
                      }),
                      ...(documento.status === 'REJEITADO' && {
                        backgroundColor: '#f44336',
                        color: 'white',
                        '& .MuiChip-label': {
                          color: 'white'
                        }
                      })
                    }}
                  />
                </Box>
                {documento.comentarios && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>Comentários:</strong> {documento.comentarios}
                  </Typography>
                )}
                {documento.dataAprovacao && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Processado em:</strong> {formatarData(documento.dataAprovacao)}
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
