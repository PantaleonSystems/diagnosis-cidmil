/**
 * Gera os contornos do mapa da landing a partir das malhas públicas do IBGE.
 * Uso: npm run mapa:gen   (precisa de internet; a saída é versionada)
 */
import { writeFileSync } from 'node:fs'
import { caminhoSvg, projetar, simplificar } from '../src/lib/mapaLanding'

const BASE = 'https://servicodados.ibge.gov.br/api/v3/malhas'
const Q = 'formato=application/vnd.geo+json&qualidade=minima'
const CIDADE = { codigo: '3551405', nome: 'Serra Azul', uf: '35' }

type Geo = { type: string; coordinates: number[][][] | number[][][][] }
const aneisDe = (g: Geo) =>
  ((g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]) as number[][][][]).map((p) => p[0])

const caminho = (g: Geo, tol: number) =>
  caminhoSvg(aneisDe(g).map((a) => simplificar(a.map(([x, y]) => projetar(x, y)), tol)))

const json = async (url: string) => (await fetch(url)).json() as Promise<{ features: { properties?: { codarea: string }; geometry: Geo }[] }>

const ufs = await json(`${BASE}/paises/BR?intrarregiao=UF&${Q}`)
const mapaUfs: Record<string, string> = {}
for (const f of ufs.features) mapaUfs[f.properties!.codarea] = caminho(f.geometry, 2.2)
writeFileSync('src/data/mapa-ufs.json', JSON.stringify(mapaUfs))

const cid = await json(`${BASE}/municipios/${CIDADE.codigo}?${Q}`)
writeFileSync('src/data/mapa-cidade-demo.json', JSON.stringify({ ...CIDADE, caminho: caminho(cid.features[0].geometry, 0.01) }))
console.log('ok')
