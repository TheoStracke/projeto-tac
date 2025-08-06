import React from 'react';
import { Navigate } from 'react-router-dom';

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('empresaData');
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const empresaDataStr = localStorage.getItem('empresaData');
  console.log('ProtectedRoute: token', token);
  console.log('ProtectedRoute: empresaDataStr', empresaDataStr);

  if (!token) {
    console.log('ProtectedRoute: sem token');
    clearAuthData();
    return <Navigate to="/login" replace />;
  }

  if (!empresaDataStr) {
    console.log('ProtectedRoute: sem empresaData');
    clearAuthData();
    return <Navigate to="/login" replace />;
  }

  try {
    const empresaData = JSON.parse(empresaDataStr);
    console.log('ProtectedRoute: empresaData', empresaData);
    if (!empresaData.empresaId || !empresaData.tipo) {
      console.log('ProtectedRoute: empresaData incompleto');
      clearAuthData();
      return <Navigate to="/login" replace />;
    }
    if (empresaData.token && empresaData.token !== token) {
      console.log('ProtectedRoute: token divergente');
      clearAuthData();
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.log('ProtectedRoute: erro no parse', error);
    clearAuthData();
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
