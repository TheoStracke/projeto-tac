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
  Input,
  Autocomplete
} from '@mui/material';
import { Add, Refresh, CloudUpload } from '@mui/icons-material';
import { 
  buscarDocumentos, 
  enviarDocumento, 
  buscarDetalhesDocumento,
  aprovarDocumento, 
  rejeitarDocumento,
  visualizarArquivoDocumento,
  buscarPedidos
} from '../services/api';
import LogoutButton from '../components/LogoutButton';
import EnviarCertificadoModal from '../components/EnviarCertificadoModal';
import CadastroMotoristaModal from '../components/CadastroMotoristaModal';

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
  const [pedidos, setPedidos] = useState([]); // para ambos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalCertificadoAberto, setModalCertificadoAberto] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]); // Para controlar linhas expandidas
  const [enviandoDoc, setEnviandoDoc] = useState(false);
  const [formData, setFormData] = useState({
      titulo: '',
      descricao: '',
      arquivos: [],
    });
  const [modalCadastroMotorista, setModalCadastroMotorista] = useState(false);
  const [motoristaBusca, setMotoristaBusca] = useState('');
  const [motoristasSugeridos, setMotoristasSugeridos] = useState([]);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [loadingMotoristas, setLoadingMotoristas] = useState(false);


  useEffect(() => {
    if (!empresaData) {
      const freshData = getEmpresaData();
      if (freshData) {
        setEmpresaData(freshData);
      } else {
        clearAuthData(); 
        navigate('/login', { replace: true });
        return; 
      }
    }
    carregarPedidos();
  }, [empresaData, navigate]);
  const carregarPedidos = async () => {
    try {
      setLoading(true);
      setError('');
      let result;
      // Agora tanto admin quanto despachante veem documentos
      let empresaId = null;
      if (empresaData?.tipo !== 'ESTRADA_FACIL') {
        empresaId = empresaData?.empresaId;
      }
      result = await buscarDocumentos(empresaId);
      console.log('Resultado buscarDocumentos:', result);
      if (result.success) {
        setPedidos(result.data);
      } else {
        setError(result.error);
        setPedidos([]);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };
 

  // função carregarDocumentos removida


    // Busca motoristas cadastrados por CPF ou nome
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
        setMotoristasSugeridos([]);
      } finally {
        setLoadingMotoristas(false);
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

      // Motorista obrigatório
      if (!motoristaSelecionado || !motoristaSelecionado.id) {
        setError('Selecione um motorista cadastrado.');
        return;
      }
      // Log dos dados inseridos antes do envio
      console.log('[ENVIAR DOCUMENTO] Dados do formulário:', {
        ...formData,
        motoristaId: motoristaSelecionado.id,
        empresaId: currentEmpresaData.empresaId
      });

      let allSuccess = true;
      let lastError = '';
      for (const arquivo of formData.arquivos) {
        if (!arquivo) continue;
        const formDataToSend = new FormData();
        formDataToSend.append('arquivo', arquivo);
        formDataToSend.append('titulo', formData.titulo);
        formDataToSend.append('descricao', formData.descricao || '');
        formDataToSend.append('motoristaId', motoristaSelecionado.id);
        formDataToSend.append('empresaId', currentEmpresaData.empresaId);
        // Log do envio de cada arquivo
        console.log('[ENVIAR DOCUMENTO] Enviando arquivo:', arquivo.name, 'com dados:', Object.fromEntries(formDataToSend.entries()));
        const result = await enviarDocumento(formDataToSend);
        if (!result.success) {
          allSuccess = false;
          lastError = result.error;
          console.error('[ENVIAR DOCUMENTO] Erro:', result.error);
        }
      }
      if (allSuccess) {
        setModalAberto(false);
        setFormData({
          titulo: '',
          descricao: '',
          arquivos: [],
        });
        setMotoristaSelecionado(null);
        setMotoristaBusca('');
        carregarPedidos();
      } else {
        setError(lastError || 'Erro ao enviar um ou mais arquivos.');
      }

    } catch (e) {
      setError('Erro de conexão. Tente novamente.');
      console.error('[ENVIAR DOCUMENTO] Erro:', e);
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
      console.log('[CURSO] Opção selecionada:', value);
      setFormData(prev => ({ ...prev, curso: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const visualizarArquivo = async (documentoId) => {
    console.log('Visualizar arquivo documentoId:', documentoId);
    try {
      const result = await visualizarArquivoDocumento(documentoId);
      if (result.success) {
        const url = URL.createObjectURL(result.data);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else {
        if (result.error && result.error.toLowerCase().includes('404')) {
          setError('Arquivo não encontrado para este documento.');
        } else {
          setError(result.error || 'Erro ao visualizar arquivo');
        }
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setError('Arquivo não encontrado para este documento.');
      } else {
        setError('Erro ao visualizar arquivo');
      }
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
        carregarPedidos();
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
        carregarPedidos();
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
    setExpandedRows((prev) => {
      const isExpanding = !prev.includes(id);
      if (isExpanding) {
        const pedido = pedidos.find(p => p.id === id);
        console.log('[EXPANDIR DETALHES] Pedido:', pedido);
      }
      return prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id];
    });
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
            onClick={carregarPedidos}
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
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              color="secondary"
              onClick={() => setModalCertificadoAberto(true)}
              sx={{ mr: 1 }}
            >
              Enviar Certificado
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
        <Alert severity="info">🔄 Carregando pedidos...</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Data Envio</strong></TableCell>
                <TableCell><strong>Empresa</strong></TableCell>
                <TableCell><strong>Motorista</strong></TableCell>
                {/* <TableCell><strong>Ações</strong></TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      📝 Nenhum pedido encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pedidos.map((pedido, index) => (
                  <React.Fragment key={pedido.id || index}>
                    <TableRow>
                      <TableCell>
                        <Button size="small" onClick={() => handleExpandRow(pedido.id)}>
                          {expandedRows.includes(pedido.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={pedido.status || 'PENDENTE'} 
                          color={getStatusColor(pedido.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{formatarData(pedido.dataEnvio)}</TableCell>
                      <TableCell>{pedido.empresaRemetente?.razaoSocial || 'N/A'}</TableCell>
                      <TableCell>{pedido.nomeMotorista || 'Não informado'}</TableCell>
                      {/* <TableCell>
                        Ações futuras: Aprovar/Rejeitar pedido inteiro
                      </TableCell> */}
                    </TableRow>
                    {expandedRows.includes(pedido.id) && (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ background: '#f9f9f9', p: 2 }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                            <div><strong>Título:</strong> {pedido.titulo}</div>
                            <div><strong>Descrição:</strong> {pedido.descricao}</div>
                            <div><strong>Nome do Motorista:</strong> {pedido.nomeMotorista || 'Não informado'}</div>
                            <div><strong>CPF:</strong> {pedido.cpf || 'Não informado'}</div>
                            <div><strong>Data de Nascimento:</strong> {pedido.dataNascimento || 'Não informado'}</div>
                            <div><strong>Sexo:</strong> {pedido.sexo || 'Não informado'}</div>
                            <div><strong>E-mail:</strong> {pedido.email || 'Não informado'}</div>
                            <div><strong>Identidade:</strong> {pedido.identidade || 'Não informado'}</div>
                            <div><strong>Orgão Emissor:</strong> {pedido.orgaoEmissor || 'Não informado'}</div>
                            <div><strong>UF Emissor:</strong> {pedido.ufEmissor || 'Não informado'}</div>
                            <div><strong>Telefone:</strong> {pedido.telefone || 'Não informado'}</div>
                            <div><strong>Curso:</strong> {
                              pedido.curso === 'TAC' ? 'TAC Completo'
                              : pedido.curso === 'RT' ? 'RT Completo'
                              : pedido.curso === 'Não informado' && pedido.cursoTACCompleto ? 'TAC Completo'
                              : pedido.curso === 'Não informado' && pedido.cursoRTCompleto ? 'RT Completo'
                              : (!pedido.curso || pedido.curso === 'Não informado') ? 'Não informado'
                              : pedido.curso
                            }</div>
                            <div><strong>Data de Envio:</strong> {formatarData(pedido.dataEnvio)}</div>
                            <div><strong>Status:</strong> <Chip label={pedido.status || 'PENDENTE'} color={getStatusColor(pedido.status)} size="small" /></div>
                            <div><strong>Nome do Arquivo:</strong> {pedido.nomeArquivoOriginal || 'Não informado'}</div>
                          </Box>
                          <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => visualizarArquivo(pedido.id)}
                              disabled={!pedido.nomeArquivoOriginal}
                            >
                              📎 Visualizar Arquivo
                            </Button>
                            {!pedido.nomeArquivoOriginal && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                Nenhum arquivo enviado para este documento.
                              </Typography>
                            )}
                            {/* Aprovar/Rejeitar para admin e status PENDENTE */}
                            {isAdmin && pedido.status === 'PENDENTE' && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleAprovarDocumento(pedido.id)}
                                  sx={{ ml: 2 }}
                                >
                                  Aprovar
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleRejeitarDocumento(pedido.id)}
                                  sx={{ ml: 1 }}
                                >
                                  Rejeitar
                                </Button>
                              </>
                            )}
                          </Box>
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
      {/* Botões principais */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setModalAberto(true)}>
          Enviar Documento
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => setModalCadastroMotorista(true)}>
          Cadastro de Motorista
        </Button>
      </Box>

      {/* Modal de Enviar Documento */}
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
            {/* Busca e seleção de motorista */}
            <Autocomplete
              freeSolo
              options={motoristasSugeridos}
              getOptionLabel={(option) => typeof option === 'string' ? option : `${option.nome} - CPF: ${option.cpf}`}
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
              onInputChange={(e, newValue) => {
                setMotoristaBusca(newValue);
                buscarMotoristas(newValue);
              }}
              onChange={(event, newValue) => {
                if (typeof newValue === 'object' && newValue !== null) {
                  setMotoristaSelecionado(newValue);
                }
              }}
              loading={loadingMotoristas}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Motorista"
                  placeholder="Digite o CPF ou nome do motorista..."
                  InputProps={{
                    ...params.InputProps,
                  }}
                  fullWidth
                />
              )}
            />
            {motoristaSelecionado && (
              <Box sx={{ mt: 1 }}>
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
            {/* Upload de arquivos */}
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

      {/* Modal de Cadastro de Motorista */}
      <CadastroMotoristaModal
        open={modalCadastroMotorista}
        onClose={() => setModalCadastroMotorista(false)}
        onSuccess={() => {
          setModalCadastroMotorista(false);
        }}
      />
      
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
                    {
                      documentoSelecionado.curso === 'TAC' ? 'TAC Completo'
                      : documentoSelecionado.curso === 'RT' ? 'RT Completo'
                      : documentoSelecionado.curso === 'Não informado' && documentoSelecionado.cursoTACCompleto ? 'TAC Completo'
                      : documentoSelecionado.curso === 'Não informado' && documentoSelecionado.cursoRTCompleto ? 'RT Completo'
                      : (!documentoSelecionado.curso || documentoSelecionado.curso === 'Não informado') ? 'Não informado'
                      : documentoSelecionado.curso
                    }
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

      {/* Modal para Enviar Certificado (Admin) */}
      <EnviarCertificadoModal
        open={modalCertificadoAberto}
        onClose={() => setModalCertificadoAberto(false)}
        onSuccess={() => {
          setError('');
          // Você pode adicionar uma notificação de sucesso aqui
          console.log('Certificado enviado com sucesso!');
        }}
      />
    </Container>
  );
}