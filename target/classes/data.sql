-- Script para inserir dados de teste
-- Este arquivo será executado automaticamente pelo Spring Boot

-- CNPJs ADMIN (ESTRADA_FACIL) - podem aprovar documentos
INSERT INTO empresa (cnpj, razao_social, email, senha, tipo) VALUES 
('43.403.910/0001-28', 'Estrada Fácil - Admin 1', 'admin1@estradafacil.com.br', 'senha123', 'ESTRADA_FACIL'),
('20.692.051/0001-39', 'Estrada Fácil - Admin 2', 'admin2@estradafacil.com.br', 'senha123', 'ESTRADA_FACIL');

-- CNPJs de teste para DESPACHANTES (apenas enviam documentos)
INSERT INTO empresa (cnpj, razao_social, email, senha, tipo) VALUES 
('11.111.111/0001-11', 'Despachante Teste 1', 'despachante1@example.com', 'senha123', 'DESPACHANTE'),
('22.222.222/0002-22', 'Despachante Teste 2', 'despachante2@example.com', 'senha123', 'DESPACHANTE'),
('33.333.333/0003-33', 'Despachante Teste 3', 'despachante3@example.com', 'senha123', 'DESPACHANTE');
