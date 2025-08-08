// src/utils/cpfValidator.js

/**
 * Remove formatação do CPF (pontos e hífens)
 */
export const cleanCpf = (cpf) => {
  return cpf.replace(/[^\d]/g, '');
};

/**
 * Formata o CPF com máscara
 */
export const formatCpf = (cpf) => {
  const cleaned = cleanCpf(cpf);
  
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return cleaned.replace(/(\d{3})(\d)/, '$1.$2');
  } else if (cleaned.length <= 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
  } else {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
};

/**
 * Valida se o CPF é válido usando o algoritmo oficial
 */
export const validateCpf = (cpf) => {
  const cleaned = cleanCpf(cpf);
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  try {
    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    // Verifica se os dígitos calculados conferem
    return parseInt(cleaned[9]) === digit1 && parseInt(cleaned[10]) === digit2;
  } catch (error) {
    return false;
  }
};
