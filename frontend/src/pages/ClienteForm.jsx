import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Snackbar, Alert, Grid } from '@mui/material';
import { motion } from 'framer-motion';

// Brand colors
const BRAND = {
  primary: '#2E5F67',   // teal/nav color
  secondary: '#FFCC00', // golden highlight
  surface: '#F4F4F4',
  background: '#FFFFFF',
  error: '#D32F2F'
};

// Motion-enabled Paper wrapper
const CardMotion = motion(Paper);

export default function ClienteFormFancy() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(false);
    setMensagem('');
    try {
      const res = await fetch('http://localhost:8080/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('clienteId', data.id);
        setMensagem(`Cliente cadastrado com sucesso! ID: ${data.id}`);
      } else {
        throw new Error('Status ' + res.status);
      }
    } catch (err) {
      console.error(err);
      setErro(true);
      setMensagem('Erro ao cadastrar cliente.');
    } finally {
      setSnackbarOpen(true);
      setNome('');
      setEmail('');
      setTelefone('');
    }
  };

  return (
    <Box sx={{ backgroundColor: BRAND.surface, py: 8, px: 2, minHeight: '60vh' }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <CardMotion
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            sx={{
              p: 4,
              borderRadius: 4,
              backgroundColor: BRAND.background,
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h5"
              align="center"
              sx={{ color: BRAND.primary, fontWeight: 700, mb: 3 }}
            >
              Cadastro de Cliente
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nome *"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                fullWidth
                sx={{ backgroundColor: BRAND.surface, borderRadius: 1 }}
              />
              <TextField
                label="Email *"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                sx={{ backgroundColor: BRAND.surface, borderRadius: 1 }}
              />
              <TextField
                label="Telefone *"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                required
                fullWidth
                sx={{ backgroundColor: BRAND.surface, borderRadius: 1 }}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: BRAND.secondary,
                  color: BRAND.primary,
                  '&:hover': { backgroundColor: '#e6b800' },
                  py: 1.5,
                }}
              >
                Cadastrar
              </Button>
            </Box>
          </CardMotion>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={erro ? 'error' : 'success'}
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: '100%', bgcolor: erro ? '#fddede' : '#eaf6e9', color: erro ? BRAND.error : BRAND.primary }}
        >
          {mensagem}
        </Alert>
      </Snackbar>
    </Box>
  );
}
