#!/usr/bin/env bash
# Concatena as migrations num arquivo único para colar no SQL Editor do
# Supabase — plano B quando a porta do Postgres está bloqueada na rede.
set -euo pipefail

cd "$(dirname "$0")/.."
destino=supabase/aplicar-no-sql-editor.sql

{
  cat <<'CABECALHO'
-- =============================================================================
-- Plataforma Cidades MIL — aplicação manual pelo SQL Editor do Supabase
--
-- Use este arquivo quando `supabase db push` não conectar (porta 5432/6543
-- bloqueada na rede). Cole TUDO no SQL Editor e clique em Run.
--
-- Gerado por scripts/bundle-sql.sh — não edite à mão.
-- =============================================================================

CABECALHO

  for f in supabase/migrations/*.sql; do
    printf '\n-- >>>>> %s\n\n' "$(basename "$f")"
    cat "$f"
  done
} > "$destino"

echo "gerado: $destino ($(wc -l < "$destino" | tr -d ' ') linhas)"
