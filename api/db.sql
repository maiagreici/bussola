-- Bússola — esquema do banco de dados
--
-- Como usar: no cPanel, abra "phpMyAdmin", selecione o banco de dados que
-- você criou em "MySQL Databases", vá na aba "SQL" e cole o conteúdo deste
-- arquivo, depois clique em "Executar" (Go).
--
-- Guardamos o ResearchProject inteiro como JSON na coluna `dados` — é a
-- mesma estrutura que já vive no localStorage do navegador do aluno, então
-- o backend não precisa conhecer cada campo individualmente; ele só
-- persiste o que o app já validou no cliente.

CREATE TABLE IF NOT EXISTS bussola_projetos (
  id VARCHAR(40) NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  curso VARCHAR(255) NOT NULL,
  titulo VARCHAR(500) NOT NULL,
  nivel VARCHAR(50) NOT NULL,
  dados LONGTEXT NOT NULL,
  criado_em DATETIME NOT NULL,
  atualizado_em DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
