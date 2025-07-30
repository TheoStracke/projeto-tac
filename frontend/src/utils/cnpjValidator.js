// src/utils/cnpjValidator.js

/**
 * Remove formatação do CNPJ (pontos, barras e hífens)
 */
export const cleanCnpj = (cnpj) => {
  return cnpj.replace(/[^\d]/g, '');
};

/**
 * Formata o CNPJ com máscara
 */
export const formatCnpj = (cnpj) => {
  const cleaned = cleanCnpj(cnpj);
  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

/**
 * Valida se o CNPJ é válido usando o algoritmo oficial
 */
export const validateCnpj = (cnpj) => {
  const cleaned = cleanCnpj(cnpj);
  
  // Verifica se tem 14 dígitos
  if (cleaned.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  // Calcula o segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  // Verifica se os dígitos calculados conferem
  return digit1 === parseInt(cleaned[12]) && digit2 === parseInt(cleaned[13]);
};
