import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MenuDetail({ onAddToCart }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`/pizzas/${id}`)
      .then(res => {
        setItem(res.data);
        setError('');
      })
      .catch(() => setError('Erro ao carregar detalhes!'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box textAlign="center" mt={6}><CircularProgress color="secondary" /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!item) return null;

  return (
    <Box>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 6, maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 900 }}>{item.nome}</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>Descrição: <b>{item.descricao}</b></Typography>
        <Typography variant="h6" color="secondary" sx={{ mt: 1 }}>R$ {item.preco?.toFixed(2)}</Typography>
        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" color="secondary" onClick={() => { setSuccess('Adicionado ao cardápio!'); navigate('/cardapio'); }}>
            Adicionar ao Cardápio
          </Button>
          <Button variant="outlined" color="info" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </Box>
      </Paper>
      <Snackbar open={!!success} autoHideDuration={2000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
