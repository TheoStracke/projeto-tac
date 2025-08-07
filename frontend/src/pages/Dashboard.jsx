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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  Alert,
  Input
} from '@mui/material';
import { Add, Refresh, CloudUpload } from '@mui/icons-material';
import LogoutButton from '../components/LogoutButton';

const Dashboard = (props) => {
  // ...existing code (hooks, state, handlers, etc)...
  // Certifique-se de que todo o código de hooks e funções auxiliares esteja aqui antes do return
  // ...
  // O return JSX começa aqui:
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
                  documentos.map((documento, index) => [
                    <TableRow key={documento.id || index}>
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
                    </TableRow>,
                    expandedRows.includes(documento.id) && (
                      <TableRow key={documento.id + '-details'}>
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
                            <div><strong>Curso TAC Completo:</strong> {documento.cursoTAC ? 'Sim' : 'Não'}</div>
                            <div><strong>Curso RT Completo:</strong> {documento.cursoRT ? 'Sim' : 'Não'}</div>
                            <div><strong>Empresa:</strong> {documento.empresa?.razaoSocial || documento.empresaRemetente?.razaoSocial || 'N/A'}</div>
                            <div><strong>Data de Envio:</strong> {formatarData(documento.dataEnvio)}</div>
                            <div><strong>Arquivo:</strong> {documento.nomeArquivoOriginal || 'N/A'} <Button size="small" onClick={() => visualizarArquivo(documento.id)}>Abrir</Button></div>
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
                    )
                  ])
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="sm" fullWidth>
          <DialogTitle>📤 Enviar Novo Documento</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {/* Campo Título removido, pois agora são dois tipos fixos */}
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
                    type="checkbox"
                    name="cursoTAC"
                    checked={formData.cursoTAC}
                    onChange={e => handleInputChange('cursoTAC', e.target.checked, 'checkbox')}
                  /> TAC Completo
                </label>
                <label style={{ marginLeft: 16 }}>
                  <input
                    type="checkbox"
                    name="cursoRT"
                    checked={formData.cursoRT}
                    onChange={e => handleInputChange('cursoRT', e.target.checked, 'checkbox')}
                  /> RT Completo
                </label>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }} component="label" htmlFor="arquivo-cnh-upload">
                  Selecione o arquivo CNH:
                </Typography>
                <Input
                  id="arquivo-cnh-upload"
                  name="arquivoCNH"
                  type="file"
                  onChange={e => handleInputChange('arquivoCNH', e.target.files[0], 'file')}
                  inputProps={{ accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx' }}
                  fullWidth
                />
                {formData.arquivoCNH && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                    ✅ Arquivo CNH selecionado: {formData.arquivoCNH.name}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }} component="label" htmlFor="arquivo-presenca-upload">
                  Selecione o arquivo Controle de Presença:
                </Typography>
                <Input
                  id="arquivo-presenca-upload"
                  name="arquivoPresenca"
                  type="file"
                  onChange={e => handleInputChange('arquivoPresenca', e.target.files[0], 'file')}
                  inputProps={{ accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx' }}
                  fullWidth
                />
                {formData.arquivoPresenca && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                    ✅ Arquivo Controle de Presença selecionado: {formData.arquivoPresenca.name}
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
              disabled={enviandoDoc || (!formData.arquivoCNH && !formData.arquivoPresenca)}
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
                    <Typography variant="subtitle2" color="text.secondary">Curso TAC Completo</Typography>
                    <Typography variant="body1">{documentoSelecionado.cursoTAC ? 'Sim' : 'Não'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Curso RT Completo</Typography>
                    <Typography variant="body1">{documentoSelecionado.cursoRT ? 'Sim' : 'Não'}</Typography>
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
};

export default Dashboard;