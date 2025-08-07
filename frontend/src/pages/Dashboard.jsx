import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from 'react-router-dom'; // <-- ADICIONADO AQUI
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
import { 
  buscarDocumentos, 
  enviarDocumento, 
  buscarDetalhesDocumento,
  aprovarDocumento, 
  rejeitarDocumento,
  visualizarArquivoDocumento
} from '../config/api';
import LogoutButton from '../components/LogoutButton';

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('empresaData');
};

const getEmpresaData = () => {
  try {
    const empresaDataStr = localStorage.getItem('empresaData');
    if (!empresaDataStr) return null;
    
    const empresaData = JSON.parse(empresaDataStr);
    if (!empresaData.empresaId || !empresaData.tipo) {
      return null;
    }
    
    return empresaData;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [empresaData, setEmpresaData] = useState(() => getEmpresaData());
  // LOGS DE DEPURAÇÃO DE AUTENTICAÇÃO (após empresaData existir)
  window._debugDashboard = window._debugDashboard || [];
  window._debugDashboard.push({
    empresaData,
    token: localStorage.getItem('token'),
    time: new Date().toISOString()
  });
  console.log('Dashboard: empresaData', empresaData);
  console.log('Dashboard: token', localStorage.getItem('token'));
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]); // Para controlar linhas expandidas
  const [enviandoDoc, setEnviandoDoc] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    nomeMotorista: '',
    arquivos: [],
    cpf: '',
    dataNascimento: '',
    sexo: '',
    email: '',
    identidade: '',
    orgaoEmissor: '',
    ufEmissor: '',
    telefone: '',
    curso: '' // 'TAC' | 'RT' | ''
  });


  useEffect(() => {
    // Se o estado empresaData não estiver definido...
    if (!empresaData) {
      // ...tentamos buscar os dados mais recentes do localStorage.
      const freshData = getEmpresaData();

      if (freshData) {
        // Se encontrarmos, ATUALIZAMOS O ESTADO.
        // Esta é a correção crucial.
        setEmpresaData(freshData);
      } else {
        // Se ainda assim não houver dados, o usuário não está logado.
        clearAuthData(); 
        navigate('/login', { replace: true });
        return; 
      }
    }

    // Este código só será executado se 'empresaData' for válido.
    carregarDocumentos();

  // Adicionamos 'empresaData' e 'navigate' como dependências.
  // O efeito será re-executado se 'empresaData' for atualizado pelo setEmpresaData.
  }, [empresaData, navigate]);
 

  const carregarDocumentos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      if (!token || !empresaData?.empresaId) {
        setError('Sessão inválida ou dados da empresa não encontrados.');
        setLoading(false);
        return;
      }
      
      const empresaId = empresaData.tipo === 'ESTRADA_FACIL' ? null : empresaData.empresaId;
      const result = await buscarDocumentos(empresaId);
      
      if (result.success) {
        setDocumentos(result.data);
      } else {
        setError(result.error);
        setDocumentos([]);
      }
      
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };


  const handleEnviarDocumento = async () => {
    try {
      setEnviandoDoc(true);
      setError('');

      const currentEmpresaData = empresaData || getEmpresaData();
      if (!currentEmpresaData) {
        setError('Sessão expirada - refaça o login');
        return;
      }

      if (!formData.arquivos || formData.arquivos.length === 0) {
        setError('Selecione pelo menos um arquivo para enviar');
        return;
      }

      if (!formData.titulo.trim()) {
        setError('Digite um título para o documento');
        return;
      }

      let allSuccess = true;
      let lastError = '';
      for (const arquivo of formData.arquivos) {
        const formDataToSend = new FormData();
        formDataToSend.append('arquivo', arquivo);
        formDataToSend.append('titulo', formData.titulo);
        formDataToSend.append('descricao', formData.descricao || '');
        formDataToSend.append('nomeMotorista', formData.nomeMotorista || '');
        formDataToSend.append('cpf', formData.cpf);
        formDataToSend.append('dataNascimento', formData.dataNascimento);
        formDataToSend.append('sexo', formData.sexo);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('identidade', formData.identidade);
        formDataToSend.append('orgaoEmissor', formData.orgaoEmissor);
        formDataToSend.append('ufEmissor', formData.ufEmissor);
        formDataToSend.append('telefone', formData.telefone);
        formDataToSend.append('curso', formData.curso);
        formDataToSend.append('empresaId', currentEmpresaData.empresaId);

        const result = await enviarDocumento(formDataToSend);
        if (!result.success) {
          allSuccess = false;
          lastError = result.error;
        }
      }

      if (allSuccess) {
        setModalAberto(false);
        setFormData({
          titulo: '',
          descricao: '',
          nomeMotorista: '',
          arquivos: [],
          cpf: '',
          dataNascimento: '',
          sexo: '',
          email: '',
          identidade: '',
          orgaoEmissor: '',
          ufEmissor: '',
          telefone: '',
          curso: ''
        });
        carregarDocumentos();
      } else {
        setError(lastError || 'Erro ao enviar um ou mais arquivos.');
      }

    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setEnviandoDoc(false);
    }
  };

  const handleFileChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({ ...prev, arquivos: files }));
  }, []);

  const handleInputChange = useCallback((field, value, type) => {
    if (field === 'curso') {
      setFormData(prev => ({ ...prev, curso: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const visualizarArquivo = async (documentoId) => {
    try {
      const result = await visualizarArquivoDocumento(documentoId);
      if (result.success) {
        const url = URL.createObjectURL(result.data);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Erro ao visualizar arquivo');
    }
  };

  const visualizarDetalhes = async (documentoId) => {
    try {
      const result = await buscarDetalhesDocumento(documentoId);
      if (result.success) {
        setDocumentoSelecionado(result.data);
        setModalDetalhes(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Erro ao carregar detalhes do documento');
    }
  };

  const handleAprovarDocumento = async (documentoId) => {
    try {
      const result = await aprovarDocumento(documentoId);
      if (result.success) {
        carregarDocumentos();
      } else {
        setError(result.error);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
  };

  const handleRejeitarDocumento = async (documentoId) => {
    try {
      const result = await rejeitarDocumento(documentoId);
      if (result.success) {
        carregarDocumentos();
      } else {
        setError(result.error);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
  };

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'PENDENTE': return 'warning';
        formDataToSend.append('arquivo', arquivo);
      case 'REJEITADO': return 'error';
      default: return 'default';
    }
  }, []);

  const formatarData = useCallback((dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  }, []);

  const isAdmin = useMemo(() => {
    return empresaData?.tipo === 'ESTRADA_FACIL';
  }, [empresaData?.tipo]);

  const handleExpandRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            {isAdmin ? '🔧 Painel do Administrador' : `📋 Dashboard - ${empresaData?.razaoSocial || 'Despachante'}`}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {isAdmin ? 'Documentos Pendentes de Aprovação' : 'Seus Documentos Enviados'}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, fontFamily: 'monospace' }}>
            🏢 Tipo: <strong>{empresaData?.tipo}</strong> | 📄 CNPJ: <strong>{empresaData?.cnpj}</strong> | 🆔 ID: <strong>{empresaData?.empresaId}</strong>
          </Typography>
        </div>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={carregarDocumentos}
            disabled={loading}
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
          <LogoutButton />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Alert severity="info">🔄 Carregando documentos...</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Data Envio</strong></TableCell>
                {isAdmin && <TableCell><strong>Empresa</strong></TableCell>}
                {isAdmin && <TableCell><strong>Visualizar</strong></TableCell>}
                {isAdmin && <TableCell><strong>Ações</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {documentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 6} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      {isAdmin ? '📝 Nenhum documento pendente de aprovação' : '📋 Nenhum documento enviado ainda'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documentos.map((documento, index) => (
                  <React.Fragment key={documento.id || index}>
                    <TableRow>
                      <TableCell>
                        <Button size="small" onClick={() => handleExpandRow(documento.id)}>
                          {expandedRows.includes(documento.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Button>
                      </TableCell>
                      {/* Tipo removido */}
                      <TableCell>
                        <Chip 
                          label={documento.status || 'PENDENTE'} 
                          color={getStatusColor(documento.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{formatarData(documento.dataEnvio)}</TableCell>
                      {isAdmin && (
                        <TableCell>{documento.empresa?.razaoSocial || documento.empresaRemetente?.razaoSocial || 'N/A'}</TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>
                          {documento.nomeArquivoOriginal ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => visualizarArquivo(documento.id)}
                            >
                              📎 {documento.nomeArquivoOriginal}
                            </Button>
                          ) : (
                            <Typography variant="body2" color="text.secondary">N/A</Typography>
                          )}
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>
                          {documento.status === 'PENDENTE' ? (
                            <Box>
                              <Button 
                                size="small" 
                                color="success" 
                                sx={{ mr: 1 }}
                                onClick={() => handleAprovarDocumento(documento.id)}
                              >
                                ✅ Aprovar
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => handleRejeitarDocumento(documento.id)}
                              >
                                ❌ Rejeitar
                              </Button>
                            </Box>
                          ) : null}
                        </TableCell>
                      )}
                    </TableRow>
                    {expandedRows.includes(documento.id) && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 8 : 6} sx={{ background: '#f9f9f9', p: 2 }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2 }}>
                            <div><strong>Título:</strong> {documento.titulo}</div>
                            {/* Tipo removido */}
                            <div><strong>Status:</strong> {documento.status}</div>
                            <div><strong>Motorista:</strong> {documento.nomeMotorista || 'Não informado'}</div>
                            <div><strong>CPF:</strong> {documento.cpf || 'Não informado'}</div>
                            <div><strong>Data de Nascimento:</strong> {documento.dataNascimento || 'Não informado'}</div>
                            <div><strong>Sexo:</strong> {documento.sexo || 'Não informado'}</div>
                            <div><strong>E-mail:</strong> {documento.email || 'Não informado'}</div>
                            <div><strong>Identidade:</strong> {documento.identidade || 'Não informado'}</div>
                            <div><strong>Orgão Emissor:</strong> {documento.orgaoEmissor || 'Não informado'}</div>
                            <div><strong>UF Emissor:</strong> {documento.ufEmissor || 'Não informado'}</div>
                            <div><strong>Telefone:</strong> {documento.telefone || 'Não informado'}</div>
                            <div><strong>Curso:</strong> {documento.curso === 'TAC' ? 'TAC Completo' : documento.curso === 'RT' ? 'RT Completo' : 'Não informado'}</div>
                            <div><strong>Arquivo:</strong> {documento.nomeArquivoOriginal ? (
                              <Button size="small" onClick={() => visualizarArquivo(documento.id)}>
                                📎 {documento.nomeArquivoOriginal}
                              </Button>
                            ) : 'N/A'}</div>
                          </Box>
                          {documento.descricao && (
                            <Box sx={{ mt: 2 }}>
                              <strong>Descrição:</strong> {documento.descricao}
                            </Box>
                          )}
                          {documento.comentarios && (
                            <Box sx={{ mt: 2 }}>
                              <strong>Comentários da Aprovação:</strong> {documento.comentarios}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
     <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="sm" fullWidth>
       <DialogTitle>📤 Enviar Novo Documento</DialogTitle>
       <DialogContent>
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
           <TextField
             id="titulo-documento"
             name="titulo"
             label="Título do Documento"
             value={formData.titulo}
             onChange={(e) => handleInputChange('titulo', e.target.value)}
             required
             fullWidth
           />
           <TextField
             id="descricao-documento"
             name="descricao"
             label="Descrição"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              id="nome-motorista"
              name="nomeMotorista"
              label="Nome do Motorista"
              value={formData.nomeMotorista}
              onChange={(e) => handleInputChange('nomeMotorista', e.target.value)}
              fullWidth
            />
            <TextField
              id="cpf"
              name="cpf"
              label="CPF"
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              required
              fullWidth
              placeholder="000.000.000-00"
            />
            <TextField
              id="data-nascimento"
              name="dataNascimento"
              label="Data de Nascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              id="sexo"
              name="sexo"
              label="Sexo"
              select
              SelectProps={{ native: true }}
              value={formData.sexo}
              onChange={(e) => handleInputChange('sexo', e.target.value)}
              required
              fullWidth
            >
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </TextField>
            <TextField
              id="email"
              name="email"
              label="E-mail"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              type="email"
              fullWidth
            />
            <TextField
              id="identidade"
              name="identidade"
              label="Identidade"
              value={formData.identidade}
              onChange={(e) => handleInputChange('identidade', e.target.value)}
              required
              fullWidth
            />
            <TextField
              id="orgao-emissor"
              name="orgaoEmissor"
              label="Orgão Emissor"
              value={formData.orgaoEmissor}
              onChange={(e) => handleInputChange('orgaoEmissor', e.target.value)}
              required
              fullWidth
            />
            <TextField
              id="uf-emissor"
              name="ufEmissor"
              label=""
              select
              SelectProps={{ native: true }}
              value={formData.ufEmissor}
              onChange={(e) => handleInputChange('ufEmissor', e.target.value)}
              required
              fullWidth
            >
              <option value="">UF Emissor</option>
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MT">MT</option>
              <option value="MS">MS</option>
              <option value="MG">MG</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RS">RS</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="SC">SC</option>
              <option value="SP">SP</option>
              <option value="SE">SE</option>
              <option value="TO">TO</option>
            </TextField>
            <TextField
              id="telefone"
              name="telefone"
              label="Telefone com DDD"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              required
              fullWidth
              placeholder="(00) 00000-0000"
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>Curso</Typography>
              <label>
                <input
                  type="radio"
                  name="curso"
                  value="TAC"
                  checked={formData.curso === 'TAC'}
                  onChange={e => handleInputChange('curso', e.target.value)}
                /> TAC Completo
              </label>
              <label style={{ marginLeft: 16 }}>
                <input
                  type="radio"
                  name="curso"
                  value="RT"
                  checked={formData.curso === 'RT'}
                  onChange={e => handleInputChange('curso', e.target.value)}
                /> RT Completo
              </label>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }} component="label" htmlFor="arquivo-upload">
                Selecione o arquivo:
              </Typography>
              <Input
                id="arquivo-upload"
                name="arquivos"
                type="file"
                onChange={handleFileChange}
                inputProps={{ accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', multiple: true }}
                fullWidth
              />
              {formData.arquivos && formData.arquivos.length > 0 && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  {formData.arquivos.length === 1
                    ? `✅ Arquivo selecionado: ${formData.arquivos[0].name}`
                    : `✅ ${formData.arquivos.length} arquivos selecionados: ${formData.arquivos.map(f => f.name).join(', ')}`}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAberto(false)}>Cancelar</Button>
          <Button 
            onClick={handleEnviarDocumento} 
            variant="contained" 
            disabled={enviandoDoc || !formData.arquivos || formData.arquivos.length === 0 || !formData.titulo.trim()}
            startIcon={<CloudUpload />}
          >
            {enviandoDoc ? 'Enviando...' : 'Enviar Documento'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
                  <Typography variant="subtitle2" color="text.secondary">CPF</Typography>
                  <Typography variant="body1">{documentoSelecionado.cpf || 'Não informado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Data de Nascimento</Typography>
                  <Typography variant="body1">{documentoSelecionado.dataNascimento || 'Não informado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Sexo</Typography>
                  <Typography variant="body1">{documentoSelecionado.sexo || 'Não informado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">E-mail</Typography>
                  <Typography variant="body1">{documentoSelecionado.email || 'Não informado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Identidade</Typography>
                  <Typography variant="body1">{documentoSelecionado.identidade || 'Não informado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Orgão Emissor</Typography>
                  <Typography variant="body1">{documentoSelecionado.orgaoEmissor || 'Não informado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">UF Emissor</Typography>
                  <Typography variant="body1">{documentoSelecionado.ufEmissor || 'Não informado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Telefone</Typography>
                  <Typography variant="body1">{documentoSelecionado.telefone || 'Não informado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Curso</Typography>
                  <Typography variant="body1">
                    {documentoSelecionado.curso === 'TAC' ? 'TAC Completo' : documentoSelecionado.curso === 'RT' ? 'RT Completo' : 'Não informado'}
                  </Typography>
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