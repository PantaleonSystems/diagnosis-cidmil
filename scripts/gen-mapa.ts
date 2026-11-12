/**
 * Gera src/data/mapa-paises.json: um caminho SVG por país (projeção Natural Earth,
 * caixa de 1000×500), a partir do world-atlas (Natural Earth, 110m).
 *
 *   npx tsx scripts/gen-mapa.ts
 *
 * As bibliotecas usadas aqui são só de desenvolvimento: o app carrega o JSON pronto.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import isoCountries from 'i18n-iso-countries'

const require = createRequire(import.meta.url)
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-110m.json'), 'utf8'))
const paises = feature(topo, topo.objects.countries) as unknown as {
  features: { id?: string; properties: { name: string }; geometry: unknown }[]
}

const L = 1000
const A = 500
const projecao = geoNaturalEarth1().fitExtent(
  [
    [4, 4],
    [L - 4, A - 4],
  ],
  { type: 'Sphere' },
)
const caminho = geoPath(projecao).digits(1)

const saida: [string, string][] = []
const semCodigo: string[] = []
for (const f of paises.features) {
  const alfa2 = f.id ? isoCountries.numericToAlpha2(f.id) : undefined
  const d = caminho(f as never)
  if (!alfa2 || !d) {
    semCodigo.push(f.properties.name)
    continue
  }
  saida.push([alfa2, d])
}
writeFileSync('src/data/mapa-paises.json', JSON.stringify(saida))
console.log(`${saida.length} países no mapa; sem código ISO: ${semCodigo.join(', ') || 'nenhum'}`)
