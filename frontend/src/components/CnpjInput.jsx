// src/components/CnpjInput.jsx
import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { validateCnpj, cleanCnpj } from '../utils/cnpjValidator';

const CnpjInput = ({ value, onChange, error: externalError, helperText: externalHelperText, ...props }) => {
  const [internalError, setInternalError] = useState(false);
  const [internalHelperText, setInternalHelperText] = useState('');

  // Função para aplicar a máscara do CNPJ
  const formatCnpjMask = (value) => {
    const cleaned = cleanCnpj(value);
    
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  };

  useEffect(() => {
    if (value && cleanCnpj(value).length === 14) {
      const isValid = validateCnpj(value);
      setInternalError(!isValid);
      setInternalHelperText(isValid ? '' : 'CNPJ inválido');
    } else if (value && cleanCnpj(value).length > 0) {
      setInternalError(false);
      setInternalHelperText('');
    } else {
      setInternalError(false);
      setInternalHelperText('');
    }
  }, [value]);

  const handleChange = (event) => {
    const inputValue = event.target.value;
    const cleaned = cleanCnpj(inputValue);
    
    // Limita a 14 dígitos
    if (cleaned.length <= 14) {
      const formatted = formatCnpjMask(inputValue);
      
      // Cria um novo evento com o valor formatado
      const syntheticEvent = {
        ...event,
        target: {
          ...event.target,
          value: formatted
        }
      };
      
      onChange(syntheticEvent);
    }
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      error={externalError || internalError}
      helperText={externalHelperText || internalHelperText}
      label="CNPJ"
      placeholder="00.000.000/0000-00"
      fullWidth
      variant="outlined"
      inputProps={{
        maxLength: 18, // Tamanho máximo com máscara
      }}
    />
  );
};

export default CnpjInput;
