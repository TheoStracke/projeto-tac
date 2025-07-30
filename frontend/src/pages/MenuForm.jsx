import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

const baseUrl = 'http://localhost:8080';

export default function MenuForm({ editItem, onSuccess }) {
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setForm({
        nome: editItem.nome || '',
        descricao: editItem.descricao || '',
        preco: editItem.preco != null ? editItem.preco : ''
      });
    } else {
      setForm({ nome: '', descricao: '', preco: '' });
    }
  }, [editItem]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editItem) {
        await axios.put(`${baseUrl}/pizzas/${editItem.id}`, form);
      } else {
        await axios.post(`${baseUrl}/pizzas`, form);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar pizza.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 2, width: 400, maxWidth: '100%' }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        label="Nome"
        name="nome"
        value={form.nome}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Descrição"
        name="descricao"
        value={form.descricao}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Preço"
        name="preco"
        type="number"
        inputProps={{ step: '0.01' }}
        value={form.preco}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : (editItem ? 'Atualizar' : 'Adicionar')}
      </Button>
    </Box>
  );
}
