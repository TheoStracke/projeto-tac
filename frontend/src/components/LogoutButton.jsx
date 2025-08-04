import React from 'react';
import { Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ variant = 'contained', size = 'small' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpar dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('empresaData');
    
    // Redirecionar para login
    navigate('/login');
  };

  return (
    <Button
      variant={variant}
      size={size}
      color="error"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
    >
      Sair
    </Button>
  );
};

export default LogoutButton;
