-- =====================================================================
-- Barbearia Senhores da Navalha — banco de dados (Supabase / PostgreSQL)
-- Cole este arquivo inteiro em: Supabase → SQL Editor → New query → Run
-- Pode ser executado mais de uma vez sem duplicar nada.
-- =====================================================================

-- ---------- Tabelas ----------

-- Perfil de cada usuário (o login/senha fica em auth.users, gerenciado pelo Supabase)
create table if not exists public.perfis (
    id          uuid primary key references auth.users (id) on delete cascade,
    nome        text not null,
    telefone    text not null default '',
    tipo        text not null default 'CLIENTE' check (tipo in ('CLIENTE', 'ADMIN')),
    criado_em   timestamptz not null default now()
);

create table if not exists public.servicos (
    id          bigint generated always as identity primary key,
    nome        text not null,
    descricao   text not null default '',
    valor       numeric(10, 2) not null check (valor >= 0),
    duracao     integer not null check (duracao > 0)
);

create table if not exists public.barbeiros (
    id              bigint generated always as identity primary key,
    nome            text not null,
    especialidade   text not null default ''
);

create table if not exists public.agendamentos (
    id              bigint generated always as identity primary key,
    usuario_id      uuid not null references public.perfis (id) on delete cascade,
    barbeiro_id     bigint not null references public.barbeiros (id),
    servico_id      bigint not null references public.servicos (id),
    data            date not null,
    horario         time not null,
    status          text not null default 'PENDENTE'
                    check (status in ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO')),
    criado_em       timestamptz not null default now()
);

-- O mesmo barbeiro não pode ter dois agendamentos ativos no mesmo dia e horário
create unique index if not exists agendamentos_horario_unico
    on public.agendamentos (barbeiro_id, data, horario)
    where status <> 'CANCELADO';

-- ---------- Funções auxiliares ----------

-- Diz se o usuário logado é administrador
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
    select exists (select 1 from perfis where id = auth.uid() and tipo = 'ADMIN');
$$;

-- Cria o perfil automaticamente quando alguém se cadastra (sempre como CLIENTE)
create or replace function public.criar_perfil()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
    insert into perfis (id, nome, telefone)
    values (
        new.id,
        coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data ->> 'telefone', '')
    );
    return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
    after insert on auth.users
    for each row execute function public.criar_perfil();

-- Impede agendar em data/horário que já passou (horário de Brasília)
create or replace function public.validar_agendamento()
returns trigger
language plpgsql
as $$
begin
    if (new.data + new.horario) < (now() at time zone 'America/Sao_Paulo') then
        raise exception 'Não é possível agendar em uma data ou horário que já passou.';
    end if;
    return new;
end;
$$;

drop trigger if exists antes_de_agendar on public.agendamentos;
create trigger antes_de_agendar
    before insert on public.agendamentos
    for each row execute function public.validar_agendamento();

-- Horários ocupados de um barbeiro num dia (sem revelar quem agendou)
create or replace function public.horarios_ocupados(p_barbeiro_id bigint, p_data date)
returns setof time
language sql stable security definer set search_path = public
as $$
    select horario from agendamentos
    where barbeiro_id = p_barbeiro_id and data = p_data and status <> 'CANCELADO'
    order by horario;
$$;

-- Cliente cancela o próprio agendamento
create or replace function public.cancelar_agendamento(p_id bigint)
returns void
language plpgsql security definer set search_path = public
as $$
begin
    update agendamentos
       set status = 'CANCELADO'
     where id = p_id
       and (usuario_id = auth.uid() or is_admin());

    if not found then
        raise exception 'Agendamento não encontrado ou sem permissão para cancelar.';
    end if;
end;
$$;

-- ---------- Segurança (Row Level Security) ----------

alter table public.perfis        enable row level security;
alter table public.servicos      enable row level security;
alter table public.barbeiros     enable row level security;
alter table public.agendamentos  enable row level security;

-- Perfis: cada um vê o seu; admin vê todos. Ninguém altera o próprio "tipo".
drop policy if exists "perfil_ver" on public.perfis;
create policy "perfil_ver" on public.perfis
    for select using (id = auth.uid() or public.is_admin());

-- Serviços e barbeiros: todos podem ver; só admin altera
drop policy if exists "servicos_ver" on public.servicos;
create policy "servicos_ver" on public.servicos for select using (true);
drop policy if exists "servicos_admin" on public.servicos;
create policy "servicos_admin" on public.servicos
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "barbeiros_ver" on public.barbeiros;
create policy "barbeiros_ver" on public.barbeiros for select using (true);
drop policy if exists "barbeiros_admin" on public.barbeiros;
create policy "barbeiros_admin" on public.barbeiros
    for all using (public.is_admin()) with check (public.is_admin());

-- Agendamentos: cliente vê e cria os seus; admin vê e altera todos
drop policy if exists "agendamentos_ver" on public.agendamentos;
create policy "agendamentos_ver" on public.agendamentos
    for select using (usuario_id = auth.uid() or public.is_admin());

drop policy if exists "agendamentos_criar" on public.agendamentos;
create policy "agendamentos_criar" on public.agendamentos
    for insert with check (usuario_id = auth.uid() and status = 'PENDENTE');

drop policy if exists "agendamentos_admin" on public.agendamentos;
create policy "agendamentos_admin" on public.agendamentos
    for update using (public.is_admin()) with check (public.is_admin());

grant execute on function public.horarios_ocupados(bigint, date) to anon, authenticated;
grant execute on function public.cancelar_agendamento(bigint) to authenticated;
revoke execute on function public.cancelar_agendamento(bigint) from anon;

-- ---------- Dados iniciais ----------

insert into public.servicos (nome, descricao, valor, duracao)
select * from (values
    ('Corte Masculino', 'Corte sob medida com acabamento premium.',         55.00, 45),
    ('Barba',           'Modelagem, hidratação e definição de contorno.',   40.00, 30),
    ('Corte + Barba',   'Combo completo para visual refinado e elegante.',  85.00, 60),
    ('Sobrancelha',     'Design e alinhamento com precisão.',               25.00, 20),
    ('Pigmentação',     'Detalhes personalizados para realçar sua presença.', 60.00, 40)
) as v (nome, descricao, valor, duracao)
where not exists (select 1 from public.servicos);

insert into public.barbeiros (nome, especialidade)
select * from (values
    ('Rafael', 'Corte clássico e barba'),
    ('Mateus', 'Estilo moderno e acabamento premium'),
    ('Thiago', 'Ajustes e estética facial')
) as v (nome, especialidade)
where not exists (select 1 from public.barbeiros);

-- ---------- Tornar um usuário administrador ----------
-- 1) Cadastre-se normalmente pelo site com o e-mail que será o admin.
-- 2) Rode o comando abaixo trocando o e-mail:
--
-- update public.perfis set tipo = 'ADMIN'
--  where id = (select id from auth.users where email = 'seu-email@exemplo.com');
