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
import { enviarDocumento } from '../config/api';

export default function EnviarDocumento() {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    nomeMotorista: '',
    arquivo: null,
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
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('descricao', formData.descricao);
      data.append('nomeMotorista', formData.nomeMotorista);
      data.append('cpf', formData.cpf);
      data.append('dataNascimento', formData.dataNascimento);
      data.append('sexo', formData.sexo);
      data.append('email', formData.email);
      data.append('identidade', formData.identidade);
      data.append('orgaoEmissor', formData.orgaoEmissor);
      data.append('ufEmissor', formData.ufEmissor);
      data.append('telefone', formData.telefone);
      data.append('cursoTAC', formData.cursoTAC);
      data.append('cursoRT', formData.cursoRT);
      data.append('empresaId', empresaData.id);
      if (formData.arquivo) data.append('arquivo', formData.arquivo);

      const result = await enviarDocumento(data);

      if (result.success) {
        setSuccess('Documento enviado com sucesso! A Estrada Fácil foi notificada por email.');
        // Limpar formulário
        setFormData({
          titulo: '',
          descricao: '',
          nomeMotorista: '',
          arquivo: null,
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
        document.getElementById('arquivo-input').value = '';
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao enviar documento');
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
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                required
                placeholder="000.000.000-00"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data de Nascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sexo"
                name="sexo"
                select
                SelectProps={{ native: true }}
                value={formData.sexo}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                type="email"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Identidade"
                name="identidade"
                value={formData.identidade}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Orgão Emissor"
                name="orgaoEmissor"
                value={formData.orgaoEmissor}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UF Emissor"
                name="ufEmissor"
                select
                SelectProps={{ native: true }}
                value={formData.ufEmissor}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione</option>
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone com DDD"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                required
                placeholder="(00) 00000-0000"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
  id="curso"
  name="curso"
  label="Curso"
  select
  SelectProps={{ native: true }}
  value={formData.curso}
  onChange={e => handleInputChange('curso', e.target.value)}
  required
  fullWidth
>
  <option value="">Nenhum</option>
  <option value="TAC">TAC Completo</option>
  <option value="RT">RT Completo</option>
</TextField>
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
