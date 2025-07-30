import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Pagination,
  Chip,
  Badge,
  LinearProgress,
  useScrollTrigger,
  Zoom,
  Fab
} from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  ShoppingCart as ShoppingCartIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Close as CloseIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Fastfood as FastfoodIcon,
  FiberNew as FiberNewIcon,
  Favorite as FavoriteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';

const BRAND = {
  primary: '#2E5F67',
  secondary: '#FFCC00',
  surface: '#F4F4F4',
  background: '#FFFFFF',
  error: '#D32F2F'
};

const theme = createTheme({
  palette: {
    primary: { main: BRAND.primary },
    secondary: { main: BRAND.secondary },
    background: { default: BRAND.surface }
  }
});

const Container = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: BRAND.surface,
  padding: theme.spacing(4)
}));

// Use motion.create to avoid deprecation warning
const MotionPaper = motion.create(Paper);

// Scroll-to-top helper
function ScrollTop() {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 100 });
  return (
    <Zoom in={trigger}>
      <Box
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Fab color="secondary" size="small">
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Zoom>
  );
}

export default function CardapioFancy() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortOrder, setSortOrder] = useState('none');
  const [filterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogPizza, setDialogPizza] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const baseUrl = 'http://localhost:8080';

  // Fetch paginated menu items
  const fetchMenu = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${baseUrl}/pizzas?page=${pageNum}&limit=${perPage}`);
      setMenu(res.data.items);
      setTotalPages(res.data.totalPages);
      setCategories([...new Set(res.data.items.map(i => i.category || 'Uncategorized'))]);
    } catch {
      setError('Erro ao carregar o cardápio.');
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  useEffect(() => { fetchMenu(page); }, [fetchMenu, page]);

  // Compute statistics
  const stats = useMemo(() => {
    const avg = menu.reduce((sum, p) => sum + p.preco, 0) / (menu.length || 1);
    const max = menu.reduce((prev, curr) => (curr.preco > prev.preco ? curr : prev), { preco: 0 });
    return { avg, max };
  }, [menu]);

  // Handlers
  const handleSearch = e => setSearch(e.target.value);
  const handleCategory = cat => setCategory(cat);
  const handlePrice = (_, val) => setPriceRange(val);
  const toggleFilter = () => setFilterOpen(o => !o);
  const handleSort = () => setSortOrder(o => (o === 'none' ? 'asc' : o === 'asc' ? 'desc' : 'none'));
  const handleAdd = async pizza => {
    try {
      const client = localStorage.getItem('clienteId');
      if (!client) throw new Error('Login necessário');
      await axios.post(`${baseUrl}/carrinho`, { pizzaId: pizza.id, clienteId: client, quantidade: 1 });
      setSuccess('Adicionado ao carrinho!');
    } catch (e) {
      setError(e.message);
    }
  };
  const toggleFavorite = id => favoriteIds.includes(id) ? setFavoriteIds(f => f.filter(x => x !== id)) : setFavoriteIds(f => [...f, id]);
  const closeMsg = () => { setError(''); setSuccess(''); };
  const handlePage = (_, v) => setPage(v);

  // Filter, category, price, sort
  const filtered = useMemo(() => {
    let list = menu;
    if (search) list = list.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'all') list = list.filter(p => p.category === category);
    list = list.filter(p => p.preco >= priceRange[0] && p.preco <= priceRange[1]);
    if (sortOrder === 'asc') list = [...list].sort((a,b) => a.preco - b.preco);
    if (sortOrder === 'desc') list = [...list].sort((a,b) => b.preco - a.preco);
    return list;
  }, [menu, search, category, priceRange, sortOrder]);

  return (
    <ThemeProvider theme={theme}>
      <Container>
        {/* Navbar component */}
        <Navbar />
        {/* Filter panel */}
        <FilterPanel
          open={filterOpen}
          onClose={toggleFilter}
          priceRange={priceRange}
          onPriceChange={handlePrice}
        />

        {/* Controls */}
        <Box mb={2} display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <TextField
            value={search}
            onChange={handleSearch}
            placeholder="Buscar pizza..."
            size="small"
            InputProps={{ endAdornment: <FastfoodIcon /> }}
            sx={{ bgcolor: BRAND.background, borderRadius: 1 }}
          />
          <Chip
            label="Todos"
            clickable
            onClick={() => handleCategory('all')}
            color={category === 'all' ? 'secondary' : 'default'}
          />
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              clickable
              onClick={() => handleCategory(cat)}
              color={category === cat ? 'secondary' : 'default'}
            />
          ))}
          <IconButton onClick={toggleFilter}><FilterListIcon /></IconButton>
          <IconButton onClick={handleSort}><SortIcon /></IconButton>
        </Box>

        {/* Stats panel */}
        <Box mb={3} p={2} bgcolor={BRAND.background} borderRadius={1}>
          <Typography variant="subtitle1">Estatísticas</Typography>
          <Typography>Média de preço: R$ {stats.avg.toFixed(2)}</Typography>
          <Typography>Mais cara: {stats.max.nome} (R$ {stats.max.preco.toFixed(2)})</Typography>
          <LinearProgress variant="determinate" value={(page/totalPages)*100} sx={{ mt: 1 }} />
        </Box>

        {/* Loading / Empty / Grid */}
        {loading ? (
          <CircularProgress />
        ) : filtered.length === 0 ? (
          <Alert severity="info">Nenhuma pizza encontrada.</Alert>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((pizza, idx) => (
              <Grid item xs={12} sm={6} md={4} key={pizza.id}>
                <MotionPaper
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  sx={{ p: 2, textAlign: 'center' }}
                >
                  <Badge
                    overlap="circular"
                    badgeContent={pizza.isNew ? <FiberNewIcon color="secondary" /> : null}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <Typography variant="h6" fontWeight={700}> {pizza.nome} </Typography>
                  </Badge>
                  <Typography variant="body2">{pizza.descricao}</Typography>
                  <Typography color="secondary">R$ {pizza.preco.toFixed(2)}</Typography>
                  <Box mt={1} display="flex" justifyContent="center" gap={1}>
                    <IconButton onClick={() => handleAdd(pizza)}><ShoppingCartIcon /></IconButton>
                    <IconButton onClick={() => toggleFavorite(pizza.id)}>
                      <FavoriteIcon color={favoriteIds.includes(pizza.id) ? 'secondary' : 'error'} />
                    </IconButton>
                    <IconButton onClick={() => {}}><InfoIcon /></IconButton>
                  </Box>
                </MotionPaper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePage}
            color="secondary"
          />
        </Box>

        {/* Feedback */}
        <Snackbar
          open={!!error || !!success}
          autoHideDuration={3000}
          onClose={closeMsg}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={error ? 'error' : 'success'}>{error || success}</Alert>
        </Snackbar>

        {/* Scroll to top */}
        <ScrollTop />
      </Container>
    </ThemeProvider>
  );
}
