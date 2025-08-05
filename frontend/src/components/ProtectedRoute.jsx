import React from 'react';
import { Navigate } from 'react-router-dom';

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('empresaData');
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const empresaDataStr = localStorage.getItem('empresaData');
  
  // Verificar se há token
  if (!token) {
    clearAuthData();
    return <Navigate to="/login" replace />;
  }
  
  // Verificar se há dados da empresa
  if (!empresaDataStr) {
    clearAuthData();
    return <Navigate to="/login" replace />;
  }
  
  try {
    // Verificar se os dados da empresa são válidos
    const empresaData = JSON.parse(empresaDataStr);
    
    // Validação robusta: empresaId e tipo são obrigatórios
    // Note: removida validação de 'id' pois pode estar undefined em casos específicos
    if (!empresaData.empresaId || !empresaData.tipo) {
      clearAuthData();
      return <Navigate to="/login" replace />;
    }
    
    // Verificar se o token nos dados da empresa corresponde ao token armazenado
    if (empresaData.token && empresaData.token !== token) {
      clearAuthData();
      return <Navigate to="/login" replace />;
    }
    
  } catch (error) {
    // Se não conseguir fazer parse dos dados, limpar e redirecionar
    clearAuthData();
    return <Navigate to="/login" replace />;
  }
  
  // Se tudo estiver ok, renderizar o componente protegido
  return children;
};

export default ProtectedRoute;
