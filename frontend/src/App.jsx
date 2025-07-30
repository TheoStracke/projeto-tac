import { useState } from 'react';
import React from 'react';
import { Button } from '@mui/material'; 
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Container,
  useScrollTrigger,
  useTheme,
  useMediaQuery,
  styled
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AnimatePresence, motion } from 'framer-motion';
import theme from './theme';
import Home from './pages/Home';
import Cardapio from './pages/Cardapio';
import MenuDetail from './pages/MenuDetail';
import MenuAdmin from './pages/MenuAdmin';
import Ingredientes from './pages/Ingredientes';
import Carrinho from './pages/Carrinho';
import ClienteForm from './pages/ClienteForm';

// Rotas de navegação
const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Cardápio', path: '/cardapio' },
  { label: 'Carrinho', path: '/carrinho' },
  { label: 'Cadastro', path: '/cadastro' },
  { label: 'Admin', path: '/cardapio/admin' },
  { label: 'Ingredientes', path: '/ingredientes' },
];

// AppBar que encolhe ao scroll
function ElevationScroll({ children }) {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0 });
  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    sx: { backgroundColor: trigger ? 'rgba(33,37,65,0.95)' : 'transparent' }
  });
}

// Componente de animação de rota
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const themeMUI = useTheme();
  const isMobile = useMediaQuery(themeMUI.breakpoints.down('md'));

  const toggleDrawer = () => {
    setDrawerOpen(open => !open);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ElevationScroll>
          <StyledAppBar position="sticky">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 1, md: 4 } }}>
              {isMobile && (
                <IconButton color="inherit" onClick={toggleDrawer} sx={{ mr: 1 }}>
                  <MenuIcon />
                </IconButton>
              )}
              <Typography
                variant="h4"
                component={Link}
                to="/"
                sx={{
                  flexGrow: 1,
                  textDecoration: 'none',
                  color: 'common.white',
                  fontWeight: 900,
                  letterSpacing: 2,
                  '&:hover': { opacity: 0.8 }
                }}
              >
                VTT Pizza
              </Typography>

              {!isMobile && (
                <Box component="nav" sx={{ display: 'flex', gap: 2 }}>
                  {navItems.map(({ label, path }) => (
                    <NavButton key={path} to={path} label={label} />
                  ))}
                </Box>
              )}
            </Toolbar>
          </StyledAppBar>
        </ElevationScroll>

        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
          <Box sx={{ width: 240 }} role="presentation">
            <List>
              {navItems.map(({ label, path }) => (
                <ListItemButton key={path} component={Link} to={path} onClick={toggleDrawer}>
                  <ListItemText primary={label} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Drawer>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
          <AnimatePresence exitBeforeEnter>
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/cardapio" element={<PageWrapper><Cardapio /></PageWrapper>} />
              <Route path="/cardapio/:id" element={<PageWrapper><MenuDetail /></PageWrapper>} />
              <Route path="/cardapio/admin" element={<PageWrapper><MenuAdmin /></PageWrapper>} />
              <Route path="/ingredientes" element={<PageWrapper><Ingredientes /></PageWrapper>} />
              <Route path="/carrinho" element={<PageWrapper><Carrinho /></PageWrapper>} />
              <Route path="/cadastro" element={<PageWrapper><ClienteForm /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

// Botão de navegação com animação e rota ativa
function NavButton({ to, label }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Button
        component={Link}
        to={to}
        color={active ? 'secondary' : 'inherit'}
        sx={{
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: active ? '100%' : '0%',
            height: 3,
            bgcolor: 'secondary.main',
            bottom: -4,
            left: 0,
            transition: 'width 0.3s'
          },
          '&:hover::after': { width: '100%' }
        }}
      >
        {label}
      </Button>
    </motion.div>
  );
}

// Estilização do AppBar para cantos preenchidos
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderRadius: 0,
  background: 'linear-gradient(90deg, #2C3E50 0%, #4CA1AF 100%)',
}));
