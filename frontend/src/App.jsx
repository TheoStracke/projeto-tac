import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importar as novas páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EnviarDocumento from './pages/EnviarDocumento';
import PaginaAprovacao from './pages/PaginaAprovacao';
import AprovacaoLista from './pages/AprovacaoLista';

// Componente para proteger rotas
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
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
    </Router>
  );
}

export default App;
