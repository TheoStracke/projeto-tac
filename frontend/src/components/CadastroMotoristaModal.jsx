import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Alert } from '@mui/material';
import { cadastrarMotorista } from '../services/api';

const CadastroMotoristaModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    sexo: '',
    email: '',
    identidade: '',
    orgaoEmissor: '',
    ufEmissor: '',
    telefone: '',
    cnh: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    // Limpeza de máscara e validação
    const cpfLimpo = form.cpf.replace(/\D/g, '');
    const telefoneLimpo = form.telefone.replace(/\D/g, '');
    const dataOk = /^\d{4}-\d{2}-\d{2}$/.test(form.dataNascimento);
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
    if (cpfLimpo.length !== 11) {
      setError('CPF deve conter 11 dígitos numéricos.'); setLoading(false); return;
    }
    if (!dataOk) {
      setError('Data de nascimento deve estar no formato AAAA-MM-DD.'); setLoading(false); return;
    }
    if (!emailOk) {
      setError('E-mail inválido.'); setLoading(false); return;
    }
    if (telefoneLimpo.length < 10) {
      setError('Telefone deve conter DDD e número (mínimo 10 dígitos).'); setLoading(false); return;
    }
    const dados = { ...form, cpf: cpfLimpo, telefone: telefoneLimpo };
    try {
      const result = await cadastrarMotorista(dados);
      if (result.success) {
        setSuccess('Motorista cadastrado com sucesso!');
        setForm({ nome: '', cpf: '', dataNascimento: '', sexo: '', email: '', identidade: '', orgaoEmissor: '', ufEmissor: '', telefone: '', cnh: '' });
        if (onSuccess) onSuccess(result.data);
      } else {
        setError(result.error || 'Erro ao cadastrar motorista');
      }
    } catch (err) {
      setError('Erro ao cadastrar motorista');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cadastrar Motorista</DialogTitle>
      <DialogContent>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Nome" name="nome" value={form.nome} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="CPF" name="cpf" value={form.cpf} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Data de Nascimento" name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="E-mail" name="email" value={form.email} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Identidade" name="identidade" value={form.identidade} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Orgão Emissor" name="orgaoEmissor" value={form.orgaoEmissor} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="UF Emissor" name="ufEmissor" value={form.ufEmissor} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="CNH" name="cnh" value={form.cnh} onChange={handleChange} fullWidth />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>Cadastrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CadastroMotoristaModal;
