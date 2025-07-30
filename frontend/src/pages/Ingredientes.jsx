import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';

// Brand colors
const BRAND = {
  primary: '#2E5F67',   // teal/nav color
  secondary: '#FFCC00', // golden highlight
  surface: '#F4F4F4',
  background: '#FFFFFF',
};

// Motion-enabled Paper
const CardMotion = motion(Paper);

export default function Ingredientes() {
  // Lista de ingredientes (pode vir do backend)
  const ingredientes = [
    { nome: 'Queijo', quantidade: '200g' },
    { nome: 'Presunto', quantidade: '150g' },
    { nome: 'Tomate', quantidade: '100g' },
  ];

  return (
    <Box sx={{ backgroundColor: BRAND.surface, py: 6, px: 2 }}>
      {/* Título */}
      <Typography
        variant="h4"
        sx={{
          color: BRAND.primary,
          fontWeight: 900,
          textAlign: 'center',
          mb: 4,
        }}
      >
        Ingredientes
      </Typography>

      {/* Grid de cartões */}
      <Grid container spacing={4} justifyContent="center">
        {ingredientes.map((ing, idx) => (
          <Grid item xs={12} sm={6} md={4} key={ing.nome}>
            <CardMotion
              component="div"
              whileHover={{ scale: 1.03, boxShadow: '0px 10px 30px rgba(0,0,0,0.12)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
              sx={{
                p: 3,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #FFF6B7 60%, #F9C74F 100%)',
                border: `2px solid ${BRAND.secondary}`,
                color: BRAND.primary,
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                {ing.nome}
              </Typography>
              <Typography variant="body1">
                Quantidade: <Box component="span" sx={{ fontWeight: 700 }}>{ing.quantidade}</Box>
              </Typography>
            </CardMotion>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
