/**
 * Gera src/data/municipios.json a partir das APIs públicas do IBGE:
 *  - localidades: código oficial (7 dígitos), nome e UF de cada município;
 *  - agregados 4709 (Censo 2022, variável 93): população residente.
 *
 * Saída compacta: [codigoIBGE, nome, uf, populacao | null][], ordenada por nome.
 * Rodar: npx tsx scripts/gen-municipios.ts
 */
import { writeFileSync } from 'node:fs'

const BASE = 'https://servicodados.ibge.gov.br/api'

interface Municipio {
  id: number
  nome: string
  microrregiao?: { mesorregiao: { UF: { sigla: string } } } | null
  'regiao-imediata'?: { 'regiao-intermediaria': { UF: { sigla: string } } } | null
}

async function json<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status} em ${url}`)
  return (await r.json()) as T
}

const municipios = await json<Municipio[]>(`${BASE}/v1/localidades/municipios`)

const agregado = await json<
  { resultados: { series: { localidade: { id: string }; serie: Record<string, string> }[] }[] }[]
>(`${BASE}/v3/agregados/4709/periodos/2022/variaveis/93?localidades=N6[all]`)

const populacao = new Map<number, number>()
for (const s of agregado[0].resultados[0].series) {
  const v = Number(s.serie['2022'])
  if (Number.isFinite(v)) populacao.set(Number(s.localidade.id), v)
}

const linhas = municipios
  .map((m) => {
    const uf =
      m.microrregiao?.mesorregiao.UF.sigla ??
      m['regiao-imediata']?.['regiao-intermediaria'].UF.sigla
    if (!uf) throw new Error(`Município sem UF: ${m.nome} (${m.id})`)
    return [String(m.id), m.nome, uf, populacao.get(m.id) ?? null] as const
  })
  .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))

writeFileSync('src/data/municipios.json', JSON.stringify(linhas))
console.log(
  `${linhas.length} municípios; ${linhas.filter((l) => l[3] === null).length} sem população`,
)
