# Plano da próxima mudança no banco (código IBGE, demonstração e origem dos dados)

> **Status: PLANO. Nada foi aplicado.** O SQL abaixo está aqui de propósito, fora de
> `supabase/migrations/`, para que nenhum `db push` o aplique por engano. Cada etapa
> tem um portão: só segue com a aprovação explícita de quem decide.

Alvo: projeto Supabase **`diagnosis-cidmil`** (`pyysaupctqatoxxgfxqm`).
A conta tem outro projeto (`PubliqueFacil`, `lsxhyllwnphphqesqzda`) que **não** deve ser tocado:
toda chamada usa o `project_id` do alvo, escrito por extenso.

## 1. Estado real do banco (levantado em 12/11/2026, só leitura)

| Item | Achado |
|---|---|
| Plano | **Free**: sem backup automático, sem branches de teste, projetos podem pausar por inatividade |
| Dados | 1 cidade (demonstração), 1 avaliação, 43 respostas, 43 métricas, 5 pilares, 13 módulos, 20 usuários (17 anônimos) |
| Tamanho / tráfego | 12 MB; última resposta gravada em 02/10/2026; 11 conexões abertas |
| Histórico de migrações | só `schema` e `seed_catalogo` (a do beta, `20260922100000`, **está ativa mas não registrada**: foi aplicada à mão) |
| Políticas (RLS) | ligadas; as do beta liberam leitura e edição a qualquer sessão (anônima inclusive) |
| Dependências | nenhuma função ou visão cita `cidades`/`respostas`; gatilhos só `set_updated_at` (BEFORE UPDATE) |
| Dados que quebrariam regras rígidas | a demonstração tem `uf = '--'` (por isso **não** se cria regra sobre UF) |
| Duplicatas | 0 (nome + UF + país) |
| Alertas (já existentes, não causados por nós) | `handle_new_user` e `is_credenciado` (SECURITY DEFINER) executáveis por `anon`; `set_updated_at` sem `search_path`; políticas abertas do beta (intencional); FKs sem índice (informativo) |

## 2. O que muda (escopo mínimo, de propósito)

1. `cidades.codigo_ibge text` **opcional**, com formato de 7 dígitos e **índice único parcial** (só onde preenchido).
   Resolve: chave da coleta e duplicata barrada no banco.
2. `cidades.demonstracao boolean not null default false`; a cidade demo é marcada pelo `id` exato.
   Resolve: deixar de reconhecer a demonstração pelo nome.
3. `respostas.origem text not null default 'declarado'`, aceitando `declarado` ou `automatico`.
   Resolve: "declarado, não verificado" de verdade (a data já existe em `updated_at`).

**Fora desta migração (e por quê):**
- `organizacao_id`: exige uma tabela de organizações e regras de acesso; sozinho seria uma coluna sem uso. É uma mudança só de adicionar coluna, barata de fazer depois, junto com o desenho de permissões. (Isto revê o que sugeri antes, de juntar tudo: menos coisas por vez = menos risco.)
- Qualquer regra sobre `uf`.
- Mudança de políticas de acesso (decisão própria, ligada à tarefa de papéis).
- Limpeza dos 17 usuários anônimos e correção dos alertas de segurança (migração separada, opcional).

## 3. Por que é seguro (compatibilidade)

- **Só adiciona.** Colunas opcionais ou com valor padrão constante: no Postgres 17 isso é só metadado, sem reescrever tabela e sem trava longa.
- **O código atual continua funcionando** depois da migração: ele não envia as colunas novas, e o banco preenche o padrão. Por isso a **ordem é: banco primeiro, código depois**. Como a versão nova do app ainda não foi publicada, não há janela de risco.
- Tabelas minúsculas (43 respostas): a criação do índice e a validação dos checks levam milissegundos.

## 4. Sequência com portões

### Etapa 0 · Snapshot (o Free não tem backup)
Gerar e guardar **fora do repositório** (ex.: `~/Documents/Work/PantaleonSystems/backups-cidmil/2026-11-12/`):
- `cidades`, `avaliacoes`, `respostas`, `profiles` em JSON (`select coalesce(json_agg(t), '[]') from public.cidades t;` etc.);
- as definições atuais (colunas, constraints, índices, políticas) em texto;
- conferência: contagem de linhas de cada arquivo = contagem no banco (1, 1, 43, 20) e um hash de cada arquivo.

**Portão A:** você vê as contagens batendo.

### Etapa 1 · Ensaio com desfazer garantido (não grava nada)
Rodar o bloco da seção 5.2: aplica o DDL **dentro de um bloco que termina com erro de propósito** (`DRYRUN_OK`), o que desfaz tudo. Ele também testa que o índice único e o formato de 7 dígitos realmente barram valores ruins.
Depois, **provar que não ficou nada**: consultar `information_schema.columns` e ver que as colunas **não** existem.

**Portão B:** resultado do ensaio e prova de que nada persistiu.

### Etapa 2 · Aplicar de verdade
Com `apply_migration` (uma transação só: ou tudo, ou nada), nome `codigo_ibge_demonstracao_origem`, SQL da seção 5.1 exatamente como mostrado.
Momento: qualquer um (sem tráfego), mas com você acompanhando.

**Portão C:** você aprova o SQL final por extenso antes de eu rodar.

### Etapa 3 · Verificar
- Consultas da seção 5.3 (colunas, índice, constraints, 43 respostas com `origem = 'declarado'`, demonstração marcada).
- `get_advisors` de segurança e desempenho, comparado com o levantamento acima: **nenhum alerta novo**.
- App local lendo o banco migrado: Início, cidade, Dados e Resultados continuam iguais.

### Etapa 4 · Código (só depois da Etapa 3 passar)
- Tipos (`Cidade.codigo_ibge`, `Cidade.demonstracao`, `Resposta.origem`).
- Cadastro envia `codigo_ibge`; erro `23505` (duplicata) vira mensagem clara com atalho "Abrir esta cidade"; duplicata detectada primeiro pelo código.
- `ehDemonstracao` passa a usar o campo (o nome fica só como reserva).
- Painel de Dados conta declarados × automáticos pela coluna `origem`.
- Gravação das respostas envia `origem: 'declarado'` explicitamente.
- Testes novos; `npm test`, lint e build.
- **Teste de escrita opcional** (com sua aprovação): criar uma cidade de teste pelo app, conferir o código gravado e a barreira de duplicata, e **apagar em seguida** pelo SQL.

### Etapa 5 · Conciliar o histórico
- Renomear o arquivo da migração no repositório para a versão exata que o `apply_migration` registrar, e atualizar `supabase/aplicar-no-sql-editor.sql` (`npm run sql:bundle`).
- **Antes de qualquer `supabase db push`:** `supabase migration repair --status applied 20260922100000` (a do beta foi aplicada à mão; sem isso o `push` a trataria como pendente).

## 5. SQL

### 5.1 Migração (a aplicar na Etapa 2)

```sql
-- codigo_ibge_demonstracao_origem
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
```

### 5.2 Ensaio (Etapa 1): tudo é desfeito no final

```sql
do $ensaio$
declare
  dono uuid := (select criado_por from public.cidades limit 1);
begin
  -- 1) o mesmo DDL da migração
  alter table public.cidades
    add column codigo_ibge text,
    add column demonstracao boolean not null default false;
  alter table public.respostas add column origem text not null default 'declarado';
  alter table public.cidades add constraint cidades_codigo_ibge_formato
    check (codigo_ibge is null or codigo_ibge ~ '^[0-9]{7}$');
  alter table public.respostas add constraint respostas_origem_valida
    check (origem in ('declarado', 'automatico'));
  create unique index cidades_codigo_ibge_uniq
    on public.cidades (codigo_ibge) where codigo_ibge is not null;
  update public.cidades set demonstracao = true
   where id = '1c58f5f1-1283-416f-b669-cfea6e176811' and nome ilike '%demonstra%';

  -- 2) o que deveria valer
  assert (select count(*) from public.respostas where origem = 'declarado') = 43, 'backfill de origem';
  assert (select count(*) from public.cidades where demonstracao) = 1, 'demonstração marcada';

  -- 3) o que deveria ser barrado
  insert into public.cidades (nome, uf, pais, criado_por, codigo_ibge) values ('T1', 'SP', 'Brasil', dono, '3548500');
  begin
    insert into public.cidades (nome, uf, pais, criado_por, codigo_ibge) values ('T2', 'SP', 'Brasil', dono, '3548500');
    raise exception 'FALHA: o índice único não barrou a duplicata';
  exception when unique_violation then null; end;
  begin
    insert into public.cidades (nome, uf, pais, criado_por, codigo_ibge) values ('T3', 'SP', 'Brasil', dono, '123');
    raise exception 'FALHA: o formato de 7 dígitos não barrou';
  exception when check_violation then null; end;

  -- 4) desfaz tudo de propósito
  raise exception 'DRYRUN_OK';
end
$ensaio$;
```
Sucesso = a única mensagem de erro é `DRYRUN_OK`. Qualquer outra mensagem (ou `FALHA: ...`) = parar e investigar.

### 5.3 Verificação (Etapa 3)

```sql
select column_name, data_type, is_nullable, column_default
  from information_schema.columns
 where table_schema = 'public'
   and ((table_name = 'cidades'   and column_name in ('codigo_ibge', 'demonstracao'))
     or (table_name = 'respostas' and column_name = 'origem'));

select indexdef from pg_indexes where indexname = 'cidades_codigo_ibge_uniq';

select conname, pg_get_constraintdef(oid) from pg_constraint
 where conname in ('cidades_codigo_ibge_formato', 'respostas_origem_valida');

select (select count(*) from public.respostas where origem = 'declarado') as declaradas,   -- esperado 43
       (select count(*) from public.cidades where demonstracao)            as demonstracoes, -- esperado 1
       (select count(*) from public.cidades)                                as cidades;      -- esperado 1
```

### 5.4 Desfazer (só se a verificação falhar; perde apenas dados das colunas novas)

```sql
drop index if exists public.cidades_codigo_ibge_uniq;
alter table public.cidades
  drop constraint if exists cidades_codigo_ibge_formato,
  drop column if exists codigo_ibge,
  drop column if exists demonstracao;
alter table public.respostas
  drop constraint if exists respostas_origem_valida,
  drop column if exists origem;
```
Se o código novo já tiver sido publicado, reverter o código **primeiro** (`git revert`).

## 6. Quando parar
- Contagens do snapshot não batem com o banco.
- O ensaio mostra qualquer mensagem diferente de `DRYRUN_OK`, ou as colunas aparecem depois dele.
- A verificação mostra algo diferente do esperado, ou o `get_advisors` traz alerta novo.
- Qualquer chamada que não tenha o `project_id` `pyysaupctqatoxxgfxqm`.

## 7. Riscos que continuam (fora desta mudança)
- **Free sem backup:** vale migrar para o plano pago antes de entrar dado real de prefeitura.
- **Beta aberto:** qualquer pessoa com o link pode editar ou apagar qualquer cidade (decisão do beta; ver tarefa de papéis).
- **Funções `SECURITY DEFINER` chamáveis por `anon`** (`handle_new_user`, `is_credenciado`): corrigir com `revoke execute`, numa migração pequena e separada.
- **17 usuários anônimos** acumulados (a maioria de visitas à landing, antes da correção que só abre sessão dentro de `/app`).
