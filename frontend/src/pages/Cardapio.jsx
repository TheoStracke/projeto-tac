// src/pages/Cardapio.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  Paper,
  IconButton
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Brand colors
const COLORS = {
  primary: '#2E5F67',
  secondary: '#FFCC00',
  surface: '#F4F4F4',
  bg: '#FFFFFF'
};

// Styled container
const Container = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.surface,
  minHeight: '100vh',
  padding: theme.spacing(4)
}));

// motion-enabled Paper
const MotionPaper = motion.create(Paper);

export default function Cardapio() {
  const theme = useTheme();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('http://localhost:8080/pizzas');
        const items = Array.isArray(res.data) ? res.data : [];
        setMenu(items);
        setCategories(['Todas', ...Array.from(new Set(items.map(i => i.category || 'Sem categoria')))]);
      } catch {
        setErrorMsg('Falha ao carregar cardápio');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return menu.filter(p =>
      p.nome.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === 'Todas' || (p.category || 'Sem categoria') === selectedCategory)
    );
  }, [menu, search, selectedCategory]);

  const handleAdd = async pizza => {
    try {
      const clienteId = localStorage.getItem('clienteId');
      if (!clienteId) throw new Error('Login necessário');
      await axios.post('http://localhost:8080/carrinho', { pizzaId: pizza.id, clienteId, quantidade: 1 });
      setSnackbar({ open: true, msg: '✅ Adicionado!', sev: 'success' });
    } catch (e) {
      setSnackbar({ open: true, msg: e.message, sev: 'error' });
    }
  };

  return (
    <Container>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ color: COLORS.primary, fontWeight: 900 }}
      >
        Nosso Cardápio
      </Typography>

      {/* Busca e Filtros */}
      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" mb={4}>
        <TextField
          placeholder="Buscar..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 240, backgroundColor: COLORS.bg, borderRadius: 1 }}
        />
        {categories.map(cat => (
          <Chip
            key={cat}
            label={cat}
            clickable
            onClick={() => setSelectedCategory(cat)}
            color={selectedCategory === cat ? 'secondary' : 'default'}
          />
        ))}
      </Box>

      {/* Conteúdo */}
      {loading ? (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={4}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={220} />
          ))}
        </Box>
      ) : errorMsg ? (
        <Alert severity="error">{errorMsg}</Alert>
      ) : (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={4}>
          <AnimatePresence>
            {filtered.map((pizza, idx) => (
              <MotionPaper
                key={pizza.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, boxShadow: theme.shadows[8] }}
                sx={{ p: 3, borderRadius: 3, background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.secondary}22 100%)`, textAlign: 'center' }}
              >
                <Typography variant="h5" fontWeight={700} mb={1}>
                  {pizza.nome}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {pizza.descricao}
                </Typography>
                <Typography variant="h6" color="secondary" mb={2}>
                  R$ {pizza.preco.toFixed(2)}
                </Typography>
                <IconButton
                  onClick={() => handleAdd(pizza)}
                  sx={{ backgroundColor: COLORS.primary, color: COLORS.bg, '&:hover': { backgroundColor: `${COLORS.primary}cc` } }}
                >
                  <ShoppingCartIcon />
                </IconButton>
              </MotionPaper>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {/* Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.sev}>{snackbar.msg}</Alert>
      </Snackbar>
    </Container>
  );
}
