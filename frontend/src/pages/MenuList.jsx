import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Snackbar, Alert, CircularProgress, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MenuList({ onAddToCart }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('/pizzas')
      .then(res => {
        setMenu(res.data);
        setError('');
      })
      .catch(() => setError('Erro ao carregar o menu!'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (item) => {
    onAddToCart(item);
    setSuccess('Adicionado ao carrinho!');
  };

  if (loading) return <Box textAlign="center" mt={6}><CircularProgress color="secondary" /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h2" color="primary" gutterBottom sx={{ fontWeight: 900 }}>
        Cardápio
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {menu.map(item => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <Paper elevation={6} sx={{ p: 3, minWidth: 260, borderRadius: 6, background: 'linear-gradient(135deg, #FFF6B7 60%, #F9C74F 100%)', color: '#232946', boxShadow: '0 8px 32px #F9C74F44', mb: 2, }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{item.nome}</Typography>
              <Typography variant="body1">Descrição: <b>{item.descricao}</b></Typography>
              <Typography variant="h6" color="secondary">R$ {item.preco?.toFixed(2)}</Typography>
              <Box mt={2} display="flex" gap={1}>
                <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => handleAdd(item)}>
                  Adicionar
                </Button>
                <Button variant="outlined" color="info" onClick={() => navigate(`/menu/${item.id}`)}>
                  Detalhes
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Snackbar open={!!success} autoHideDuration={2000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
