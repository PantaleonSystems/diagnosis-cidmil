/**
 * Gera a migration de seed do catálogo a partir de src/data/metricas.ts.
 *
 *   npm run seed:gen
 *
 * Assim o banco e o front nunca divergem: mexeu no catálogo, roda de novo e
 * aplica com `npx supabase db push`.
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MODULOS, MODULO_SAUDE, PILARES, TOTAL_METRICAS } from '../src/data/metricas.ts'

const q = (s: string) => `'${s.replace(/'/g, "''")}'`
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`

const linhas: string[] = [
  '-- ============================================================================',
  '-- Seed do catálogo — GERADO por scripts/gen-seed.ts. Não edite à mão.',
  `-- Módulo Saúde: ${PILARES.length} pilares, ${TOTAL_METRICAS} métricas (63–105).`,
  '-- Idempotente: pode ser reaplicado sem duplicar.',
  '-- ============================================================================',
  '',
  '-- Módulos do framework',
  'insert into public.modulos (id, nome, icone, ativo, ordem) values',
  MODULOS.map(
    (m, i) => `  (${q(m.id)}, ${q(m.nome)}, ${q(m.icone)}, ${m.ativo}, ${i})`,
  ).join(',\n') +
    '\non conflict (id) do update set\n' +
    '  nome = excluded.nome, icone = excluded.icone,\n' +
    '  ativo = excluded.ativo, ordem = excluded.ordem;',
  '',
  '-- Pilares do módulo Saúde',
  'insert into public.pilares (modulo_id, numero, nome, descricao, peso, cor, central) values',
  PILARES.map(
    (p) =>
      `  (${q(MODULO_SAUDE)}, ${p.numero}, ${q(p.nome)}, ${q(p.descricao)}, ` +
      `${p.peso}, ${q(p.cor)}, ${q(p.central)})`,
  ).join(',\n') +
    '\non conflict (modulo_id, numero) do update set\n' +
    '  nome = excluded.nome, descricao = excluded.descricao,\n' +
    '  peso = excluded.peso, cor = excluded.cor, central = excluded.central;',
  '',
  '-- Métricas',
]

for (const pilar of PILARES) {
  linhas.push(`-- Pilar ${pilar.numero} — ${pilar.nome} (${pilar.metricas.length})`)
  linhas.push(
    'insert into public.metricas (pilar_id, numero, titulo, tipo, config, dica, ordem)',
    'select p.id, v.numero, v.titulo, v.tipo, v.config, v.dica, v.ordem',
    'from public.pilares p, (values',
  )

  const valores = pilar.metricas.map((m, i) => {
    const { numero, titulo, tipo, dica, ...config } = m
    return (
      `  (${numero}, ${q(titulo)}, ${q(tipo)}, ${j(config)}, ${q(dica)}, ${i})`
    )
  })

  linhas.push(
    valores.join(',\n'),
    ') as v(numero, titulo, tipo, config, dica, ordem)',
    `where p.modulo_id = ${q(MODULO_SAUDE)} and p.numero = ${pilar.numero}`,
    'on conflict (numero) do update set',
    '  pilar_id = excluded.pilar_id, titulo = excluded.titulo,',
    '  tipo = excluded.tipo, config = excluded.config,',
    '  dica = excluded.dica, ordem = excluded.ordem;',
    '',
  )
}

const destino = resolve(
  import.meta.dirname,
  '../supabase/migrations/20260813120100_seed_catalogo.sql',
)
writeFileSync(destino, linhas.join('\n') + '\n')
console.log(
  `seed gerado: ${destino}\n${PILARES.length} pilares · ${TOTAL_METRICAS} métricas · ${MODULOS.length} módulos`,
)
