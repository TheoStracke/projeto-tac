// src/components/Navbar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon, Sort as SortIcon, ShoppingCart as ShoppingCartIcon, FilterList as FilterListIcon } from '@mui/icons-material';

export default function Navbar({ onMobileMenu }) {
  const [anchor, setAnchor] = React.useState(null);
  const open = Boolean(anchor);
  const handleOpen = e => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>VTT Pizza</Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button color="inherit">Home</Button>
            <Button color="inherit">Cardápio</Button>
            <Button color="inherit">Carrinho</Button>
          </Box>
          <IconButton color="inherit" sx={{ display: { xs: 'block', sm: 'none' } }} onClick={handleOpen}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Menu anchorEl={anchor} open={open} onClose={handleClose}>
        <MenuItem onClick={handleClose}><HomeIcon fontSize="small" sx={{ mr: 1 }}/> Home</MenuItem>
        <MenuItem onClick={handleClose}><SortIcon fontSize="small" sx={{ mr: 1 }}/> Cardápio</MenuItem>
        <MenuItem onClick={handleClose}><ShoppingCartIcon fontSize="small" sx={{ mr: 1 }}/> Carrinho</MenuItem>
        <Divider/>
        <MenuItem onClick={handleClose}><FilterListIcon fontSize="small" sx={{ mr: 1 }}/> Filtros</MenuItem>
      </Menu>
    </>
  );
}
