// src/components/FilterPanel.jsx
import React from 'react';
import { Paper, Box, Typography, IconButton, Slider } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export default function FilterPanel({ open, onClose, priceRange, onPriceChange }) {
  if (!open) return null;
  return (
    <Paper
      sx={{
        position: 'fixed', top: 80, left: 16, width: 300, p: 2,
        zIndex: 1300, boxShadow: 4, borderRadius: 2
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>Filtro de Preço</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Slider
        value={priceRange}
        onChange={onPriceChange}
        valueLabelDisplay="auto"
        min={0}
        max={200}
      />
    </Paper>
  );
}
