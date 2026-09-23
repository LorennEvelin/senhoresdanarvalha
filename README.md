# Barbearia Senhores da Navalha

Site de agendamento online para barbearia, com banco de dados na nuvem. O cliente cria a conta, escolhe serviço, barbeiro, data e horário, e acompanha ou cancela seus agendamentos. O administrador vê todos os agendamentos, muda o status, edita preços e cadastra barbeiros.

🔗 **Site no ar:** _(adicione aqui o link do GitHub Pages)_

## Funcionalidades

- Cadastro, login e recuperação de senha por e-mail
- Agendamento que mostra só os horários livres de cada barbeiro
- Bloqueio de horário duplicado e de datas que já passaram (feito no próprio banco)
- Painel do cliente: próximos agendamentos, histórico e cancelamento
- Painel do admin: todos os agendamentos, mudança de status, edição de serviços e cadastro de barbeiros
- Serviços, preços e equipe do site carregados do banco
- Layout responsivo (computador e celular)

## Tecnologias

- **Frontend:** HTML, CSS e JavaScript puro
- **Banco de dados e login:** [Supabase](https://supabase.com) (PostgreSQL + Auth)
- **Segurança:** Row Level Security (RLS). Cada cliente só acessa os próprios dados, e só o admin altera preços e barbeiros
- **Hospedagem:** GitHub Pages

## Estrutura

```
├── index.html, sobre.html, servicos.html, equipe.html, contato.html   # páginas públicas
├── login.html, cadastro.html, esqueci-senha.html, nova-senha.html     # conta
├── agendar.html, cliente.html                                         # área do cliente
├── admin.html                                                         # área do administrador
├── assets/css/styles.css
├── assets/js/
│   ├── config.js     # URL e chave pública do Supabase
│   ├── app.js        # conexão, sessão, menu e utilitários
│   ├── publico.js    # serviços e equipe nas páginas públicas
│   ├── auth.js       # login, cadastro e senha
│   ├── agendar.js    # agendamento
│   ├── cliente.js    # painel do cliente
│   └── admin.js      # painel do admin
└── supabase/schema.sql   # tabelas, regras de segurança e dados iniciais
```

## Banco de dados

| Tabela         | Conteúdo                                                  |
|----------------|-----------------------------------------------------------|
| `perfis`       | nome, telefone e tipo (CLIENTE/ADMIN) de cada usuário      |
| `servicos`     | nome, descrição, valor e duração                          |
| `barbeiros`    | nome e especialidade                                      |
| `agendamentos` | cliente, barbeiro, serviço, data, horário e status        |

Funções no banco: `horarios_ocupados` (consulta a disponibilidade sem expor quem agendou) e `cancelar_agendamento` (o cliente só cancela os próprios agendamentos).

## Como rodar o seu

1. Crie um projeto grátis no [Supabase](https://supabase.com/dashboard).
2. Em **SQL Editor**, cole e execute o arquivo `supabase/schema.sql`.
3. Em **Project Settings → API**, copie a *Project URL* e a chave *anon public* para `assets/js/config.js`.
4. Em **Authentication → URL Configuration**, coloque o endereço do site em *Site URL*.
5. Publique no GitHub Pages (**Settings → Pages → Deploy from a branch → main / root**).
6. Para ter um administrador, cadastre-se pelo site e rode no SQL Editor:
   ```sql
   update public.perfis set tipo = 'ADMIN'
    where id = (select id from auth.users where email = 'seu-email@exemplo.com');
   ```

> A chave *anon* é pública por definição e pode ficar no código: quem protege os dados são as regras de segurança (RLS) do `schema.sql`.
