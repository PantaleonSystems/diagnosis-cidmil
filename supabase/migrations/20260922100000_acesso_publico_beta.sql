-- ============================================================================
-- BETA: acesso público, sem tela de login
--
-- O app passa a criar uma sessão ANÔNIMA silenciosa (supabase.auth
-- .signInAnonymously). O visitante não vê login nenhum, mas continua tendo um
-- JWT — então a RLS segue ligada e `criado_por` / `avaliador_id` continuam
-- registrando quem fez o quê.
--
-- Diferença para o modelo anterior: some a exigência de `credenciado = true`.
-- Qualquer visitante lê e escreve. Isso é deliberado para a fase de testes e
-- DEVE ser revisto antes de uso real — ver 20260922100000_..._REVERTER abaixo.
--
-- Por que não liberar o papel `anon` direto, sem sessão: sem JWT não existe
-- auth.uid(), a autoria se perde e não há como reapertar depois sem migrar
-- dados. A sessão anônima custa nada ao usuário e preserva as duas coisas.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Catálogo: leitura livre para qualquer sessão
-- ---------------------------------------------------------------------------

drop policy if exists "catálogo módulos: ler"  on public.modulos;
drop policy if exists "catálogo pilares: ler"  on public.pilares;
drop policy if exists "catálogo métricas: ler" on public.metricas;

create policy "beta: catálogo módulos legível"
  on public.modulos for select to authenticated using (true);

create policy "beta: catálogo pilares legível"
  on public.pilares for select to authenticated using (true);

create policy "beta: catálogo métricas legível"
  on public.metricas for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Cidades
--
-- Durante o BETA qualquer sessão edita qualquer cidade: a equipe testa em
-- conjunto e sessões anônimas não sobrevivem à limpeza de cookies, então
-- amarrar a edição ao criador deixaria dados órfãos e intocáveis.
-- ---------------------------------------------------------------------------

drop policy if exists "cidades: ler"                on public.cidades;
drop policy if exists "cidades: criar"              on public.cidades;
drop policy if exists "cidades: editar as próprias" on public.cidades;
drop policy if exists "cidades: apagar as próprias" on public.cidades;

create policy "beta: cidades leitura"
  on public.cidades for select to authenticated using (true);

create policy "beta: cidades criação"
  on public.cidades for insert to authenticated
  with check (criado_por = (select auth.uid()));

create policy "beta: cidades edição"
  on public.cidades for update to authenticated using (true) with check (true);

create policy "beta: cidades exclusão"
  on public.cidades for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Avaliações
-- ---------------------------------------------------------------------------

drop policy if exists "avaliações: ler"                on public.avaliacoes;
drop policy if exists "avaliações: criar"              on public.avaliacoes;
drop policy if exists "avaliações: editar as próprias" on public.avaliacoes;
drop policy if exists "avaliações: apagar as próprias" on public.avaliacoes;

create policy "beta: avaliações leitura"
  on public.avaliacoes for select to authenticated using (true);

create policy "beta: avaliações criação"
  on public.avaliacoes for insert to authenticated
  with check (avaliador_id = (select auth.uid()));

create policy "beta: avaliações edição"
  on public.avaliacoes for update to authenticated using (true) with check (true);

create policy "beta: avaliações exclusão"
  on public.avaliacoes for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Respostas
-- ---------------------------------------------------------------------------

drop policy if exists "respostas: ler"                              on public.respostas;
drop policy if exists "respostas: escrever nas próprias avaliações" on public.respostas;
drop policy if exists "respostas: editar nas próprias avaliações"   on public.respostas;
drop policy if exists "respostas: apagar nas próprias avaliações"   on public.respostas;

create policy "beta: respostas leitura"
  on public.respostas for select to authenticated using (true);

create policy "beta: respostas criação"
  on public.respostas for insert to authenticated with check (true);

create policy "beta: respostas edição"
  on public.respostas for update to authenticated using (true) with check (true);

create policy "beta: respostas exclusão"
  on public.respostas for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- profiles
--
-- O trigger handle_new_user() cria um perfil para toda sessão anônima também.
-- As policies de perfil próprio seguem valendo e não precisam mudar.
-- ---------------------------------------------------------------------------

-- ============================================================================
-- COMO REVERTER ao acesso credenciado
--
-- 1. Apagar as policies "beta: ..." acima.
-- 2. Recriar as policies originais (ver 20260813120000_schema.sql).
-- 3. Desligar Authentication -> Providers -> Anonymous no painel.
-- 4. Restaurar a tela de login (git revert do commit que a removeu).
-- ============================================================================
