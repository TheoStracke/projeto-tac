// src/pages/Carrinho.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Modal,
  Fade
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Brand Colors
const COLORS = {
  primary: '#2E5F67',
  secondary: '#FFCC00',
  bg: '#FFFFFF'
};

export default function Carrinho() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completed, setCompleted] = useState(false);
  const clienteId = localStorage.getItem('clienteId');
  const baseUrl = 'http://localhost:8080';

  useEffect(() => { fetchCarrinho(); }, []);

  const fetchCarrinho = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${baseUrl}/carrinho/cliente/${clienteId}`);
      setItens(data);
      setError('');
    } catch {
      setError('Não foi possível carregar o carrinho.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async id => {
    try {
      await axios.delete(`${baseUrl}/carrinho/${id}`);
      setSuccess('Item removido!');
      fetchCarrinho();
    } catch {
      setError('Erro ao remover item.');
    }
  };

  const alterarQuantidade = async (id, qtd) => {
    try {
      if (qtd < 1) {
        await axios.delete(`${baseUrl}/carrinho/${id}`);
        setSuccess('Item removido!');
      } else {
        await axios.put(`${baseUrl}/carrinho`, { itemCarrinhoId: id, quantidade: qtd });
        setSuccess('Quantidade atualizada!');
      }
      fetchCarrinho();
    } catch {
      setError('Erro ao alterar quantidade.');
    }
  };

  const handleFinalize = async () => {
    if (!itens.length) return;
    setLoading(true);
    try {
      await Promise.all(itens.map(i => axios.delete(`${baseUrl}/carrinho/${i.id}`)));
      setSuccess('Compra finalizada!');
      setItens([]);
      setCompleted(true);
    } catch {
      setError('Erro ao finalizar.');
    } finally {
      setLoading(false);
    }
  };

  const total = itens.reduce((sum, it) => sum + (it.pizzaPreco ?? 0) * (it.quantidade ?? 0), 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
      
      <Typography variant="h4" gutterBottom>Seu Carrinho</Typography>

      {loading && (
        <Box mt={8}><CircularProgress size={48} /></Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      <AnimatePresence>
        {!loading && itens.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Alert severity="info" sx={{ mt: 4 }}>Seu carrinho está vazio.</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, my: 4 }}>
        <AnimatePresence>
          {itens.map((item, idx) => {
            const preco = item.pizzaPreco ?? 0;
            const qtd = item.quantidade ?? 0;
            const subtotal = preco * qtd;
            return (
              <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: idx * 0.1 }}>
                <Card elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{item.pizzaNome}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.pizzaDescricao}</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 1, justifyContent: 'center' }}>
                      <Typography sx={{ fontWeight: 700 }}>R$ {preco.toFixed(2)}</Typography>
                      <Divider orientation="vertical" flexItem />
                      <IconButton size="small" onClick={() => alterarQuantidade(item.id, qtd - 1)}><Remove /></IconButton>
                      <Typography>{qtd}</Typography>
                      <IconButton size="small" onClick={() => alterarQuantidade(item.id, qtd + 1)}><Add /></IconButton>
                    </Stack>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Subtotal: R$ {subtotal.toFixed(2)}</Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center' }}>
                    <IconButton color="error" onClick={() => handleRemove(item.id)}><Delete /></IconButton>
                  </CardActions>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Box>

      {itens.length > 0 && (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box sx={{ bgcolor: COLORS.bg, p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
              <Typography variant="h5">Total: R$ {total.toFixed(2)}</Typography>
              <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
                <Button variant="contained" size="large" onClick={handleFinalize} disabled={loading} sx={{ borderRadius: 5, px: 4, backgroundColor: COLORS.primary }}>
                  Finalizar Compra
                </Button>
              </motion.div>
            </Stack>
          </Box>
        </motion.div>
      )}

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>

      <Modal open={completed} closeAfterTransition>
        <Fade in={completed} timeout={500}>
          <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: COLORS.bg, p: 4, borderRadius: 2, textAlign: 'center', boxShadow: 24 }}>
            <Typography variant="h4" gutterBottom>Pedido Confirmado!</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>Obrigado pela sua compra 🎉</Typography>
            <Box sx={{ mt: 2 }}>
              <iframe src="https://embed.lottiefiles.com/animation/79933" style={{ width: 200, height: 200, border: 'none' }} title="confetti" />
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setCompleted(false)}>Fechar</Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
}
