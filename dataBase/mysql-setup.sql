-- Script SQL para configurar o banco de dados MySQL

-- Criar o banco de dados se não existir
CREATE DATABASE IF NOT EXISTS validacao_db;
USE validacao_db;

-- Configurações do MySQL
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Tabela empresa (será criada automaticamente pelo Hibernate, mas deixando aqui para referência)
-- CREATE TABLE IF NOT EXISTS empresa (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     cnpj VARCHAR(18) NOT NULL UNIQUE,
--     razao_social VARCHAR(255) NOT NULL,
--     email VARCHAR(255) NOT NULL,
--     senha VARCHAR(255) NOT NULL,
--     tipo VARCHAR(50) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- Dados de teste (serão inseridos automaticamente pelo DataInitializer)
-- INSERT IGNORE INTO empresa (cnpj, razao_social, email, senha, tipo) VALUES
-- ('11111111000111', 'Empresa Teste LTDA', 'teste@empresa.com', '$2a$10$hash...', 'ADMIN');

-- Resetar configurações
SET FOREIGN_KEY_CHECKS = 1;
