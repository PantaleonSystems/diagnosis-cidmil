-- ============================================================================
-- Código IBGE, cidade de demonstração e origem das respostas
--
-- Só adiciona: colunas opcionais ou com padrão, então o app anterior continua
-- funcionando. Já aplicada no banco de produção em 2026-11-12 (versão
-- 20261112024930, via apply_migration); este arquivo registra o mesmo SQL.
-- ============================================================================

-- Só adiciona: opcional / com padrão. O app atual continua funcionando.

alter table public.cidades
  add column if not exists codigo_ibge text,
  add column if not exists demonstracao boolean not null default false;

alter table public.respostas
  add column if not exists origem text not null default 'declarado';

alter table public.cidades
  add constraint cidades_codigo_ibge_formato
  check (codigo_ibge is null or codigo_ibge ~ '^[0-9]{7}$');

alter table public.respostas
  add constraint respostas_origem_valida
  check (origem in ('declarado', 'automatico'));

-- um município do IBGE só pode existir uma vez (só onde o código está preenchido)
create unique index if not exists cidades_codigo_ibge_uniq
  on public.cidades (codigo_ibge)
  where codigo_ibge is not null;

-- a demonstração, pelo id exato e conferindo o nome
update public.cidades
   set demonstracao = true
 where id = '1c58f5f1-1283-416f-b669-cfea6e176811'
   and nome ilike '%demonstra%';

comment on column public.cidades.codigo_ibge is 'Código oficial do município no IBGE (7 dígitos). Chave da coleta de dados.';
comment on column public.cidades.demonstracao is 'Cidade fictícia usada para demonstrar o produto.';
comment on column public.respostas.origem is 'declarado = informado à mão (não verificado); automatico = veio da coleta.';
