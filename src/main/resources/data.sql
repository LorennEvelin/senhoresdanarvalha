INSERT INTO servicos (nome, descricao, valor, duracao)
SELECT 'Corte Masculino', 'Estilo sob medida com acabamento premium.', 55.00, 45
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Corte Masculino');

INSERT INTO servicos (nome, descricao, valor, duracao)
SELECT 'Barba', 'Modelagem e hidratação para barba impecável.', 40.00, 30
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Barba');

INSERT INTO servicos (nome, descricao, valor, duracao)
SELECT 'Corte + Barba', 'Combo completo para visual refinado.', 85.00, 60
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Corte + Barba');

INSERT INTO servicos (nome, descricao, valor, duracao)
SELECT 'Sobrancelha', 'Design e alinhamento com precisão.', 25.00, 20
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Sobrancelha');

INSERT INTO servicos (nome, descricao, valor, duracao)
SELECT 'Pigmentação', 'Detalhes personalizados para realçar sua presença.', 60.00, 40
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Pigmentação');

INSERT INTO barbeiros (nome, especialidade, foto)
SELECT 'Rafael', 'Corte clássico e barba', 'rafael.jpg'
WHERE NOT EXISTS (SELECT 1 FROM barbeiros WHERE nome = 'Rafael');

INSERT INTO barbeiros (nome, especialidade, foto)
SELECT 'Mateus', 'Estilo moderno e acabamento premium', 'mateus.jpg'
WHERE NOT EXISTS (SELECT 1 FROM barbeiros WHERE nome = 'Mateus');

INSERT INTO barbeiros (nome, especialidade, foto)
SELECT 'Thiago', 'Ajustes e estética facial', 'thiago.jpg'
WHERE NOT EXISTS (SELECT 1 FROM barbeiros WHERE nome = 'Thiago');
