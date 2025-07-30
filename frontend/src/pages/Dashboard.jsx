import React, { useState, useEffect } from 'react';
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
      
      console.log('=== DEBUG DASHBOARD ===');
      console.log('Token:', token ? 'EXISTE' : 'NULO');
      console.log('EmpresaData:', empresaData);
      
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
      
      let endpoint;
      if (empresaData.tipo === 'ESTRADA_FACIL') {
        // ADMIN vê todos os documentos pendentes
        endpoint = 'http://localhost:8080/documentos/pendentes';
        console.log('🔧 ADMIN - buscando documentos pendentes');
      } else {
        // DESPACHANTE vê apenas seus documentos
        endpoint = `http://localhost:8080/documentos/empresa/${empresaData.empresaId}`;
        console.log('👤 DESPACHANTE - buscando documentos da empresa:', empresaData.empresaId);
      }
      
      console.log('📡 Fazendo requisição para:', endpoint);
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Resposta recebida:', response.data);
      
      // Verificar se a resposta é um array ou ApiResponse
      let docs = [];
      if (Array.isArray(response.data)) {
        docs = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        docs = response.data.data;
      } else if (response.data && response.data.success) {
        docs = response.data.data || [];
      } else {
        console.warn('⚠️ Formato inesperado da resposta:', response.data);
        docs = [];
      }
      
      setDocumentos(docs);
      setError('');
      
    } catch (error) {
      console.error('❌ Erro ao carregar documentos:', error);
      
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

      console.log('📤 Enviando documento...');
      console.log('Titulo:', formData.titulo);
      console.log('EmpresaId:', empresaData.empresaId);
      console.log('Arquivo:', formData.arquivo.name);

      const response = await axios.post('http://localhost:8080/documentos/enviar', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Documento enviado:', response.data);
      
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
      console.error('❌ Erro ao enviar documento:', error);
      setError('Erro ao enviar documento: ' + (error.response?.data?.message || error.message));
    } finally {
      setEnviandoDoc(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData({ ...formData, arquivo: file });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const aprovarDocumento = async (documentoId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('✅ Aprovando documento:', documentoId);
      
      const response = await axios.post(`http://localhost:8080/documentos/${documentoId}/aprovar`, '', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Documento aprovado:', response.data);
      
      // Recarregar documentos
      carregarDocumentos();
      
    } catch (error) {
      console.error('❌ Erro ao aprovar documento:', error);
      setError('Erro ao aprovar documento: ' + (error.response?.data?.message || error.message));
    }
  };

  const rejeitarDocumento = async (documentoId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('❌ Rejeitando documento:', documentoId);
      
      const response = await axios.post(`http://localhost:8080/documentos/${documentoId}/rejeitar`, '', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('❌ Documento rejeitado:', response.data);
      
      // Recarregar documentos
      carregarDocumentos();
      
    } catch (error) {
      console.error('❌ Erro ao rejeitar documento:', error);
      setError('Erro ao rejeitar documento: ' + (error.response?.data?.message || error.message));
    }
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

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  const empresaData = JSON.parse(localStorage.getItem('empresa') || '{}');
  const isAdmin = empresaData.tipo === 'ESTRADA_FACIL';

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
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center">
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
                        <Button size="small" variant="outlined">
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
      
      {/* Debug info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace' }}>
        <Typography variant="caption" display="block">
          <strong>DEBUG INFO:</strong><br/>
          📊 Total documentos: {documentos.length}<br/>
          🔐 Token existe: {localStorage.getItem('token') ? 'SIM' : 'NÃO'}<br/>
          👤 Dados empresa: {JSON.stringify(empresaData, null, 2)}
        </Typography>
      </Box>
    </Container>
  );
}
