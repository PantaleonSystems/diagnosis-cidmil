/**
 * Localidades para o cadastro de cidade: países (ISO 3166), estados do Brasil e
 * os 5.571 municípios com código oficial do IBGE e população do Censo 2022
 * (gerado por `npx tsx scripts/gen-municipios.ts`).
 */

export interface Estado {
  sigla: string
  nome: string
}

export const ESTADOS: Estado[] = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
]

/** Sem acento e em minúsculas: "São Paulo" casa com "sao paulo". */
export const normalizar = (s: string): string =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

/* ---------------------------------------------------------------- países -- */

export interface Pais {
  codigo: string
  nome: string
}

const CODIGOS_PAISES =
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO ' +
  'JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR ' +
  'MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO ' +
  'RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV ' +
  'TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'

let paises: Pais[] | null = null

/** Países em português (nomes vêm do navegador), com o Brasil primeiro. */
export function listaPaises(): Pais[] {
  if (paises) return paises
  let nomeDe: (c: string) => string = (c) => c
  try {
    const dn = new Intl.DisplayNames(['pt-BR'], { type: 'region', fallback: 'code' })
    nomeDe = (c) => dn.of(c) ?? c
  } catch {
    // navegador sem Intl.DisplayNames: cai no código ISO
  }
  const todos = CODIGOS_PAISES.split(' ').map((codigo) => ({ codigo, nome: nomeDe(codigo) }))
  todos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  paises = [...todos.filter((p) => p.codigo === 'BR'), ...todos.filter((p) => p.codigo !== 'BR')]
  return paises
}

/* ------------------------------------------------------------ municípios -- */

export interface Municipio {
  /** código oficial do IBGE (7 dígitos) */
  codigo: string
  nome: string
  uf: string
  /** Censo 2022; pode faltar */
  populacao: number | null
  /** nome normalizado, para busca */
  chave: string
}

type Linha = [string, string, string, number | null]

let municipios: Promise<Municipio[]> | null = null

/** Carrega a lista só na primeira vez (arquivo separado do pacote principal). */
export function carregarMunicipios(): Promise<Municipio[]> {
  municipios ??= import('@/data/municipios.json').then((m) =>
    (m.default as Linha[]).map(([codigo, nome, uf, populacao]) => ({
      codigo,
      nome,
      uf,
      populacao,
      chave: normalizar(nome),
    })),
  )
  return municipios
}

/**
 * Busca por nome (sem acento), opcionalmente dentro de uma UF.
 * Quem começa com o termo vem antes de quem apenas contém.
 */
export function buscarMunicipios(
  todos: Municipio[],
  termo: string,
  uf: string,
  limite = 60,
): { itens: Municipio[]; total: number } {
  const t = normalizar(termo)
  const base = uf ? todos.filter((m) => m.uf === uf) : todos
  if (!t) return { itens: base.slice(0, limite), total: base.length }
  const comeca: Municipio[] = []
  const contem: Municipio[] = []
  for (const m of base) {
    if (m.chave.startsWith(t)) comeca.push(m)
    else if (m.chave.includes(t)) contem.push(m)
  }
  const achados = comeca.concat(contem)
  return { itens: achados.slice(0, limite), total: achados.length }
}
