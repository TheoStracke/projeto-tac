// src/pages/AprovacaoLista.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  Alert
} from '@mui/material';
import { buscarListaAprovacoes, downloadArquivo } from '../config/api';

export default function AprovacaoLista() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarDocumentos();
  }, []);

  const carregarDocumentos = async () => {
    try {
      const result = await buscarListaAprovacoes();
      
      if (result.success) {
        setDocumentos(result.data);
        setError('');
      } else {
        setError(result.error);
        setDocumentos([]);
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APROVADO':
        return 'success';
      case 'REJEITADO':
        return 'error';
      case 'PENDENTE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APROVADO':
        return 'Aprovado';
      case 'REJEITADO':
        return 'Rejeitado';
      case 'PENDENTE':
        return 'Pendente';
      default:
        return status;
    }
  };

  const abrirAprovacao = (token) => {
    window.open(`/aprovacao/${token}`, '_blank');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Carregando...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Lista de Documentos para Aprovação
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Documentos enviados pelos despachantes aguardando aprovação
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Motorista</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Data Envio</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Arquivo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                      Nenhum documento encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documentos.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.id}</TableCell>
                    <TableCell>{doc.nomeMotorista}</TableCell>
                    <TableCell>{doc.empresa?.razaoSocial || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(doc.dataEnvio).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(doc.status)} 
                        color={getStatusColor(doc.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="text"
                        size="small"
                        onClick={async () => {
                          const result = await downloadArquivo(doc.id);
                          if (result.success) {
                            const url = window.URL.createObjectURL(result.data);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `documento-${doc.id}`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          }
                        }}
                        color="primary"
                      >
                        📎 Baixar Arquivo
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => abrirAprovacao(doc.tokenAprovacao)}
                        disabled={doc.status !== 'PENDENTE'}
                      >
                        {doc.status === 'PENDENTE' ? 'Revisar' : 'Visualizar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Button 
          variant="outlined" 
          onClick={carregarDocumentos}
          disabled={loading}
        >
          Atualizar Lista
        </Button>
      </Box>
    </Container>
  );
}
