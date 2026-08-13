-- ============================================================================
-- Plataforma de Diagnóstico Cidades MIL — schema do MVP (módulo Saúde)
--
-- Modelo: modulos -> pilares -> metricas  (catálogo, só leitura para o app)
--         profiles -> cidades -> avaliacoes -> respostas  (dados do avaliador)
--
-- Quem protege os dados é a Row Level Security abaixo, não o segredo da chave
-- anon. Acesso a qualquer coisa exige profiles.credenciado = true.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — 1:1 com auth.users. Nasce sempre com credenciado = false.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null default '',
  organizacao text not null default '',
  papel       text not null default 'avaliador'
              check (papel in ('avaliador', 'admin')),
  credenciado boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o perfil no momento do signUp, lendo o metadata enviado pelo front.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, organizacao)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    coalesce(new.raw_user_meta_data ->> 'organizacao', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Checagem de credenciamento usada por todas as policies.
-- SECURITY DEFINER para não disparar a RLS de profiles dentro da própria
-- policy (evita recursão infinita).
create or replace function public.is_credenciado()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and credenciado
  );
$$;

-- ---------------------------------------------------------------------------
-- Catálogo: modulos / pilares / metricas
-- ---------------------------------------------------------------------------

create table public.modulos (
  id     text primary key,
  nome   text not null,
  icone  text not null default '',
  ativo  boolean not null default false,
  ordem  integer not null default 0
);

create table public.pilares (
  id        uuid primary key default gen_random_uuid(),
  modulo_id text not null references public.modulos (id) on delete cascade,
  numero    integer not null check (numero between 1 and 20),
  nome      text not null,
  descricao text not null default '',
  -- peso na soma ponderada do ISPS; os pesos de um módulo somam 1.0
  peso      numeric(4, 3) not null check (peso > 0 and peso <= 1),
  cor       text not null default '#02B9DA',
  central   text not null default '',
  unique (modulo_id, numero)
);

create table public.metricas (
  id       uuid primary key default gen_random_uuid(),
  pilar_id uuid not null references public.pilares (id) on delete cascade,
  -- numeração do framework (63..105 no módulo Saúde)
  numero   integer not null unique,
  titulo   text not null,
  tipo     text not null
           check (tipo in ('percentual', 'densidade', 'faixa', 'regua')),
  -- campos/formula/faixas/niveis conforme o tipo. Ver src/data/metricas.ts.
  config   jsonb not null default '{}'::jsonb,
  fonte    text not null default '',
  dica     text not null default '',
  ordem    integer not null default 0
);

create index metricas_pilar_id_idx on public.metricas (pilar_id);

-- ---------------------------------------------------------------------------
-- Dados do avaliador: cidades / avaliacoes / respostas
-- ---------------------------------------------------------------------------

create table public.cidades (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  uf         text not null default '',
  pais       text not null default 'Brasil',
  populacao  integer check (populacao is null or populacao >= 0),
  criado_por uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cidades_criado_por_idx on public.cidades (criado_por);

create trigger cidades_set_updated_at
  before update on public.cidades
  for each row execute function public.set_updated_at();

create table public.avaliacoes (
  id           uuid primary key default gen_random_uuid(),
  cidade_id    uuid not null references public.cidades (id) on delete cascade,
  modulo_id    text not null references public.modulos (id) on delete restrict,
  ano          integer not null default extract(year from now())::integer,
  status       text not null default 'rascunho'
               check (status in ('rascunho', 'concluida')),
  -- índice final 0..4, preenchido ao concluir
  isps         numeric(4, 2) check (isps is null or (isps >= 0 and isps <= 4)),
  avaliador_id uuid not null references public.profiles (id) on delete restrict,
  concluida_em timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- uma avaliação por cidade/módulo/ano
  unique (cidade_id, modulo_id, ano)
);

create index avaliacoes_cidade_id_idx on public.avaliacoes (cidade_id);

create trigger avaliacoes_set_updated_at
  before update on public.avaliacoes
  for each row execute function public.set_updated_at();

create table public.respostas (
  id           uuid primary key default gen_random_uuid(),
  avaliacao_id uuid not null references public.avaliacoes (id) on delete cascade,
  metrica_id   uuid not null references public.metricas (id) on delete cascade,
  -- números informados pelo avaliador; vazio nas métricas de régua
  dados_brutos jsonb not null default '{}'::jsonb,
  -- SEMPRE derivada por src/lib/calculos.ts — nunca digitada
  nota         integer not null check (nota between 0 and 4),
  observacao   text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (avaliacao_id, metrica_id)
);

create index respostas_avaliacao_id_idx on public.respostas (avaliacao_id);

create trigger respostas_set_updated_at
  before update on public.respostas
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles   enable row level security;
alter table public.modulos    enable row level security;
alter table public.pilares    enable row level security;
alter table public.metricas   enable row level security;
alter table public.cidades    enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.respostas  enable row level security;

-- profiles: cada um lê e edita o próprio. Credenciar é ato de admin, feito
-- pelo painel do Supabase (service_role ignora RLS).
create policy "perfil próprio: ler"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "perfil próprio: editar"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Catálogo: leitura para quem é credenciado. Escrita só via service_role.
create policy "catálogo módulos: ler"
  on public.modulos for select using (public.is_credenciado());

create policy "catálogo pilares: ler"
  on public.pilares for select using (public.is_credenciado());

create policy "catálogo métricas: ler"
  on public.metricas for select using (public.is_credenciado());

-- Cidades: todo credenciado enxerga o acervo; só o autor altera/apaga.
create policy "cidades: ler"
  on public.cidades for select using (public.is_credenciado());

create policy "cidades: criar"
  on public.cidades for insert
  with check (public.is_credenciado() and criado_por = (select auth.uid()));

create policy "cidades: editar as próprias"
  on public.cidades for update
  using (criado_por = (select auth.uid()))
  with check (criado_por = (select auth.uid()));

create policy "cidades: apagar as próprias"
  on public.cidades for delete
  using (criado_por = (select auth.uid()));

-- Avaliações: mesma regra — leitura ampla, escrita do autor.
create policy "avaliações: ler"
  on public.avaliacoes for select using (public.is_credenciado());

create policy "avaliações: criar"
  on public.avaliacoes for insert
  with check (public.is_credenciado() and avaliador_id = (select auth.uid()));

create policy "avaliações: editar as próprias"
  on public.avaliacoes for update
  using (avaliador_id = (select auth.uid()))
  with check (avaliador_id = (select auth.uid()));

create policy "avaliações: apagar as próprias"
  on public.avaliacoes for delete
  using (avaliador_id = (select auth.uid()));

-- Respostas: herdam o dono da avaliação a que pertencem.
create policy "respostas: ler"
  on public.respostas for select using (public.is_credenciado());

create policy "respostas: escrever nas próprias avaliações"
  on public.respostas for insert
  with check (
    public.is_credenciado()
    and exists (
      select 1 from public.avaliacoes a
      where a.id = avaliacao_id and a.avaliador_id = (select auth.uid())
    )
  );

create policy "respostas: editar nas próprias avaliações"
  on public.respostas for update
  using (
    exists (
      select 1 from public.avaliacoes a
      where a.id = avaliacao_id and a.avaliador_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.avaliacoes a
      where a.id = avaliacao_id and a.avaliador_id = (select auth.uid())
    )
  );

create policy "respostas: apagar nas próprias avaliações"
  on public.respostas for delete
  using (
    exists (
      select 1 from public.avaliacoes a
      where a.id = avaliacao_id and a.avaliador_id = (select auth.uid())
    )
  );
