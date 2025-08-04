import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const empresaData = localStorage.getItem('empresaData');
  
  // Se não há token ou dados da empresa, redirecionar para login
  if (!token || !empresaData) {
    // Limpar localStorage se dados estão incompletos
    localStorage.removeItem('token');
    localStorage.removeItem('empresaData');
    return <Navigate to="/login" replace />;
  }
  
  try {
    // Verificar se os dados da empresa são válidos
    const empresa = JSON.parse(empresaData);
    if (!empresa.id || !empresa.tipo) {
      localStorage.removeItem('token');
      localStorage.removeItem('empresaData');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // Se não conseguir fazer parse dos dados, limpar e redirecionar
    localStorage.removeItem('token');
    localStorage.removeItem('empresaData');
    return <Navigate to="/login" replace />;
  }
  
  // Se tudo estiver ok, renderizar o componente protegido
  return children;
};

export default ProtectedRoute;
