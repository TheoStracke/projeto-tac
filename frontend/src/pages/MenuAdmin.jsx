import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/system';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import MenuForm from './MenuForm';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

// Brand colors
const BRAND = {
  primary: '#2E5F67',   // teal/nav color
  secondary: '#FFCC00', // golden highlight
  background: '#FFFFFF',
  surface: '#F4F4F4',
  error: '#D32F2F'
};

// Card container with motion
const CardMotion = motion(Box);

export default function MenuAdmin() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch pizzas
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/pizzas');
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
          ? data.items
          : [];
      setMenu(arr);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar o menu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // Filtered and sorted list
  const filteredMenu = useMemo(() => {
    let result = menu;
    if (search) {
      result = result.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));
    }
    if (filter === 'low') result = [...result].sort((a, b) => a.preco - b.preco);
    else if (filter === 'high') result = [...result].sort((a, b) => b.preco - a.preco);
    return result;
  }, [menu, search, filter]);

  const handleEdit = useCallback(item => { setEditItem(item); setFormOpen(true); }, []);
  const promptDelete = useCallback(id => { setToDeleteId(id); setConfirmOpen(true); }, []);

  const handleConfirmDelete = useCallback(async () => {
    setConfirmOpen(false);
    try {
      await axios.delete(`/pizzas/${toDeleteId}`);
      setSuccessMsg('Pizza removida com sucesso!');
      fetchMenu();
    } catch (err) {
      console.error(err);
      setError('Falha ao remover pizza.');
    }
  }, [toDeleteId, fetchMenu]);

  const handleFormSuccess = useCallback(() => {
    setFormOpen(false);
    setSuccessMsg(editItem ? 'Pizza atualizada!' : 'Pizza adicionada!');
    setEditItem(null);
    fetchMenu();
  }, [editItem, fetchMenu]);

  const handleCloseSnackbar = useCallback(() => { setError(''); setSuccessMsg(''); }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: BRAND.surface, p: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" sx={{ color: BRAND.primary, fontWeight: 800 }}>
          VTT Pizza • Admin
        </Typography>
        {/* Controls */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            variant="outlined"
            placeholder="Buscar pizza..."
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment>
            }}
            sx={{ bgcolor: BRAND.background, borderRadius: 1 }}
          />
          <FormControl size="small" sx={{ bgcolor: BRAND.background, borderRadius: 1 }}>
            <Select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              displayEmpty
              sx={{ px: 1 }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="low">Preço Crescente</MenuItem>
              <MenuItem value="high">Preço Decrescente</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            sx={{
              backgroundColor: BRAND.secondary,
              '&:hover': { backgroundColor: '#e6b800' },
              color: BRAND.primary,
            }}
            onClick={() => { setEditItem(null); setFormOpen(true); }}
          >
            Adicionar Nova Pizza
          </Button>
        </Box>
      </Box>

      {/* Error Banner */}
      {error && <Alert severity="error" sx={{ mb: 2, backgroundColor: '#fee2e2', color: BRAND.error }}>{error}</Alert>}

      {/* Pizza Cards Grid */}
      <Grid container spacing={4}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={220} />
              </Grid>
            ))
          : filteredMenu.map(pizza => (
              <Grid item xs={12} sm={6} md={4} key={pizza.id}>
                <CardMotion
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ p: 3, borderRadius: 2, backgroundColor: BRAND.background, boxShadow: 3 }}>
                    <Typography variant="h5" sx={{ color: BRAND.primary, fontWeight: 700 }}>
                      {pizza.nome}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#5A5A5A' }}>
                      {pizza.descricao}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2, color: BRAND.secondary }}>
                      R$ {pizza.preco?.toFixed(2)}
                    </Typography>
                    <Box mt={2} display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        sx={{
                          borderColor: BRAND.primary,
                          color: BRAND.primary,
                        }}
                        onClick={() => handleEdit(pizza)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          borderColor: BRAND.error,
                          color: BRAND.error,
                        }}
                        onClick={() => promptDelete(pizza.id)}
                      >
                        Remover
                      </Button>
                    </Box>
                  </Box>
                </CardMotion>
              </Grid>
            ))}
      </Grid>

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: BRAND.primary, color: '#fff' }}>
          {editItem ? 'Editar Pizza' : 'Nova Pizza'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: BRAND.surface }}>
          <MenuForm editItem={editItem} onSuccess={handleFormSuccess} />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: BRAND.surface }}>
          <Button onClick={() => setFormOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Remover Pizza</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja remover esta pizza?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button sx={{ color: BRAND.error }} onClick={handleConfirmDelete}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}