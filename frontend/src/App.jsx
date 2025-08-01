import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Importar páginas com lazy loading
const Login = lazy(() => import('./pages/Login'));
const Cadastro = lazy(() => import('./pages/Cadastro'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EnviarDocumento = lazy(() => import('./pages/EnviarDocumento'));
const PaginaAprovacao = lazy(() => import('./pages/PaginaAprovacao'));
const AprovacaoLista = lazy(() => import('./pages/AprovacaoLista'));

// Loading component
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Componente para proteger rotas
const ProtectedRoute = React.memo(({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
});

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/aprovacao/:token" element={<PaginaAprovacao />} />
          <Route 
            path="/aprovacao-lista" 
            element={
              <ProtectedRoute>
                <AprovacaoLista />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/enviar-documento" 
            element={
              <ProtectedRoute>
                <EnviarDocumento />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
