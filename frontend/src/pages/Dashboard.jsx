import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Input
} from '@mui/material';
import { Add, Refresh, CloudUpload } from '@mui/icons-material';
import axios from 'axios';

export default function Dashboard() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [enviandoDoc, setEnviandoDoc] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    nomeMotorista: '',
    arquivo: null
  });

  useEffect(() => {
    carregarDocumentos();
  }, []);

  const carregarDocumentos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const empresaData = JSON.parse(localStorage.getItem('empresa') || '{}');
      
      if (!token) {
        setError('Token não encontrado - redirecionando para login');
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!empresaData.empresaId || !empresaData.tipo) {
        setError('Dados da empresa não encontrados - refaça o login');
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      const endpoint = empresaData.tipo === 'ESTRADA_FACIL' 
        ? 'http://localhost:8080/documentos/pendentes'
        : `http://localhost:8080/documentos/empresa/${empresaData.empresaId}`;
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Verificar se a resposta é um array ou ApiResponse
      const docs = Array.isArray(response.data) 
        ? response.data
        : response.data?.data || [];
      
      setDocumentos(docs);
      setError('');
      
    } catch (error) {
      
      if (error.response?.status === 401) {
        setError('Sessão expirada. Redirecionando para login...');
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.status === 403) {
        setError('Acesso negado. Verifique suas permissões.');
      } else if (error.response?.status === 500) {
        setError('Erro interno do servidor. Tente novamente em alguns minutos.');
      } else {
        setError('Erro ao carregar documentos: ' + (error.response?.data?.message || error.message));
      }
      
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  const enviarDocumento = async () => {
    try {
      setEnviandoDoc(true);
      setError('');

      const token = localStorage.getItem('token');
      const empresaData = JSON.parse(localStorage.getItem('empresa') || '{}');

      if (!formData.arquivo) {
        setError('Selecione um arquivo para enviar');
        return;
      }

      if (!formData.titulo.trim()) {
        setError('Digite um título para o documento');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('arquivo', formData.arquivo);
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descricao', formData.descricao || '');
      formDataToSend.append('nomeMotorista', formData.nomeMotorista || '');
      formDataToSend.append('empresaId', empresaData.empresaId);

      const response = await axios.post('http://localhost:8080/documentos/enviar', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Fechar modal e limpar form
      setModalAberto(false);
      setFormData({
        titulo: '',
        descricao: '',
        nomeMotorista: '',
        arquivo: null
      });

      // Recarregar documentos
      carregarDocumentos();

    } catch (error) {
      setError('Erro ao enviar documento: ' + (error.response?.data?.message || error.message));
    } finally {
      setEnviandoDoc(false);
    }
  };

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    setFormData(prev => ({ ...prev, arquivo: file }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const visualizarArquivo = async (documentoId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fazer requisição com autorização
      const response = await fetch(`http://localhost:8080/documentos/${documentoId}/arquivo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Você não tem permissão para visualizar este arquivo');
        } else {
          setError('Erro ao carregar arquivo: ' + response.status);
        }
        return;
      }
      
      // Obter o blob do arquivo e criar URL para abrir
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Limpar URL depois de um tempo para liberar memória
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      
    } catch (error) {
      setError('Erro ao visualizar arquivo');
    }
  };

  const visualizarDetalhes = async (documentoId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:8080/documentos/${documentoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDocumentoSelecionado(response.data);
      setModalDetalhes(true);
      
    } catch (error) {
      setError('Erro ao carregar detalhes do documento');
    }
  };

  const aprovarDocumento = async (documentoId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`http://localhost:8080/documentos/${documentoId}/aprovar`, '', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Recarregar documentos
      carregarDocumentos();
      
    } catch (error) {
      setError('Erro ao aprovar documento: ' + (error.response?.data?.message || error.message));
    }
  };

  const rejeitarDocumento = async (documentoId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`http://localhost:8080/documentos/${documentoId}/rejeitar`, '', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Recarregar documentos
      carregarDocumentos();
      
    } catch (error) {
      setError('Erro ao rejeitar documento: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = useCallback((status) => {
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
  }, []);

  const formatarData = useCallback((dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  }, []);

  const empresaData = useMemo(() => {
    return JSON.parse(localStorage.getItem('empresa') || '{}');
  }, []);
  
  const isAdmin = useMemo(() => {
    return empresaData.tipo === 'ESTRADA_FACIL';
  }, [empresaData.tipo]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            {isAdmin ? '🔧 Painel do Administrador' : `📋 Dashboard - ${empresaData.razaoSocial || 'Despachante'}`}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {isAdmin ? 'Documentos Pendentes de Aprovação' : 'Seus Documentos Enviados'}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, fontFamily: 'monospace' }}>
            🏢 Tipo: <strong>{empresaData.tipo}</strong> | 📄 CNPJ: <strong>{empresaData.cnpj}</strong> | 🆔 ID: <strong>{empresaData.empresaId}</strong>
          </Typography>
        </div>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={carregarDocumentos}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </Button>
          {!isAdmin && (
            <Button
              variant="contained"
              startIcon={<Add />}
              color="primary"
              onClick={() => setModalAberto(true)}
            >
              Enviar Documento
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Alert severity="info">
          <Typography>🔄 Carregando documentos...</Typography>
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Data Envio</strong></TableCell>
                {isAdmin && <TableCell><strong>Empresa</strong></TableCell>}
                {isAdmin && <TableCell><strong>Visualizar</strong></TableCell>}
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 5} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      {isAdmin ? 
                        '📝 Nenhum documento pendente de aprovação' : 
                        '📋 Nenhum documento enviado ainda'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documentos.map((documento, index) => (
                  <TableRow key={documento.id || index}>
                    <TableCell>{documento.id || 'N/A'}</TableCell>
                    <TableCell>{documento.tipo || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={documento.status || 'PENDENTE'} 
                        color={getStatusColor(documento.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatarData(documento.dataEnvio)}</TableCell>
                    {isAdmin && (
                      <TableCell>{documento.empresa?.razaoSocial || 'N/A'}</TableCell>
                    )}
                    {isAdmin && (
                      <TableCell>
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={() => visualizarArquivo(documento.id)}
                        >
                          📎 Ver Arquivo
                        </Button>
                      </TableCell>
                    )}
                    <TableCell>
                      {isAdmin && documento.status === 'PENDENTE' ? (
                        <Box>
                          <Button 
                            size="small" 
                            color="success" 
                            sx={{ mr: 1 }}
                            onClick={() => aprovarDocumento(documento.id)}
                          >
                            ✅ Aprovar
                          </Button>
                          <Button 
                            size="small" 
                            color="error"
                            onClick={() => rejeitarDocumento(documento.id)}
                          >
                            ❌ Rejeitar
                          </Button>
                        </Box>
                      ) : (
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => visualizarDetalhes(documento.id)}
                        >
                          👁️ Ver Detalhes
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Modal para enviar documento */}
      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>📤 Enviar Novo Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Título do Documento"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              required
              fullWidth
            />
            
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            
            <TextField
              label="Nome do Motorista"
              value={formData.nomeMotorista}
              onChange={(e) => handleInputChange('nomeMotorista', e.target.value)}
              fullWidth
            />
            
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Selecione o arquivo:
              </Typography>
              <Input
                type="file"
                onChange={handleFileChange}
                inputProps={{ accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx' }}
                fullWidth
              />
              {formData.arquivo && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  ✅ Arquivo selecionado: {formData.arquivo.name}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAberto(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={enviarDocumento} 
            variant="contained" 
            disabled={enviandoDoc || !formData.arquivo || !formData.titulo.trim()}
            startIcon={<CloudUpload />}
          >
            {enviandoDoc ? 'Enviando...' : 'Enviar Documento'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal para ver detalhes do documento */}
      <Dialog open={modalDetalhes} onClose={() => setModalDetalhes(false)} maxWidth="md" fullWidth>
        <DialogTitle>📄 Detalhes do Documento</DialogTitle>
        <DialogContent>
          {documentoSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Título</Typography>
                  <Typography variant="body1">{documentoSelecionado.titulo}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={documentoSelecionado.status} 
                    color={getStatusColor(documentoSelecionado.status)}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Motorista</Typography>
                  <Typography variant="body1">{documentoSelecionado.nomeMotorista || 'Não informado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Data de Envio</Typography>
                  <Typography variant="body1">
                    {new Date(documentoSelecionado.dataEnvio).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Empresa Remetente</Typography>
                  <Typography variant="body1">{documentoSelecionado.empresaRemetente?.razaoSocial}</Typography>
                </Box>
                {documentoSelecionado.dataAprovacao && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Data de Aprovação</Typography>
                    <Typography variant="body1">
                      {new Date(documentoSelecionado.dataAprovacao).toLocaleString('pt-BR')}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {documentoSelecionado.descricao && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
                  <Typography variant="body1">{documentoSelecionado.descricao}</Typography>
                </Box>
              )}
              
              {documentoSelecionado.comentarios && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">Comentários da Aprovação</Typography>
                  <Typography variant="body1">{documentoSelecionado.comentarios}</Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Arquivo</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  📎 {documentoSelecionado.nomeArquivoOriginal}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => visualizarArquivo(documentoSelecionado.id)}
                  sx={{ mr: 1 }}
                >
                  📥 Abrir/Download Arquivo
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDetalhes(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
