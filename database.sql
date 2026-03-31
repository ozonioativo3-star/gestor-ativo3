-- ─────────────────────────────────────────────────────────
-- COLE ESTE SQL NO SUPABASE → SQL EDITOR → RUN
-- ─────────────────────────────────────────────────────────

-- TABELA: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  ultima_visita DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  data DATE NOT NULL,
  hora TIME NOT NULL,
  servico TEXT NOT NULL,
  valor DECIMAL(10,2),
  status TEXT DEFAULT 'pendente', -- pendente | confirmado | concluido | cancelado
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: servicos (catálogo)
CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  duracao_minutos INTEGER DEFAULT 60,
  valor DECIMAL(10,2),
  ativo BOOLEAN DEFAULT TRUE
);

-- ─── DADOS DE EXEMPLO PARA TESTAR ────────────────────────
INSERT INTO clientes (nome, telefone, ultima_visita) VALUES
  ('Ana Paula Silva', '(17) 99999-0001', CURRENT_DATE),
  ('Maria Fernanda Costa', '(17) 99999-0002', CURRENT_DATE - INTERVAL '35 days'),
  ('Juliana Rocha', '(17) 99999-0003', CURRENT_DATE - INTERVAL '15 days'),
  ('Camila Souza', '(17) 99999-0004', CURRENT_DATE),
  ('Patricia Lima', '(17) 99999-0005', CURRENT_DATE - INTERVAL '45 days');

INSERT INTO agendamentos (cliente_id, data, hora, servico, valor, status)
SELECT id, CURRENT_DATE, '09:00', 'Manicure', 45.00, 'confirmado'
FROM clientes WHERE nome = 'Ana Paula Silva';

INSERT INTO agendamentos (cliente_id, data, hora, servico, valor, status)
SELECT id, CURRENT_DATE, '11:00', 'Pedicure', 55.00, 'confirmado'
FROM clientes WHERE nome = 'Camila Souza';

INSERT INTO agendamentos (cliente_id, data, hora, servico, valor, status)
SELECT id, CURRENT_DATE, '14:00', 'Unhas em gel', 120.00, 'pendente'
FROM clientes WHERE nome = 'Juliana Rocha';
