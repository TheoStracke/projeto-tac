// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e264b',    // azul escuro
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#fbbc04',    // amarelo vibrante
      contrastText: '#1e264b',
    },
    background: {
      default: '#f7f7f7',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 900 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    button: { textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '8px 24px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export default theme;
