-- Script para inserir as empresas administradoras (Estrada Fácil)
-- Execute este script após a primeira inicialização do sistema

INSERT INTO empresa (cnpj, razao_social, email, senha, tipo) VALUES 
('11.111.111/0001-11', 'Estrada Fácil Admin 1', 'admin1@estradafacil.com', 'senha123', 'ESTRADA_FACIL'),
('22.222.222/0002-22', 'Estrada Fácil Admin 2', 'admin2@estradafacil.com', 'senha123', 'ESTRADA_FACIL');

-- Exemplo de empresa despachante para testes
INSERT INTO empresa (cnpj, razao_social, email, senha, tipo) VALUES 
('33.333.333/0003-33', 'Despachante Teste', 'despachante@teste.com', 'senha123', 'DESPACHANTE');
