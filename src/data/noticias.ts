export type TemaNoticia = 'ia' | 'cidade' | 'cidadao' | 'mil'

export interface Noticia {
  id: string
  tema: TemaNoticia
  titulo: string
  /** Resumo em texto nosso (não copiado da fonte). */
  resumo: string
  /** Como a notícia se relaciona com a Cidades MIL: relação, nunca afiliação. */
  conexao: string
  fonte: { nome: string; url: string }
  /** AAAA-MM-DD */
  data: string
  /** Só aparece na página depois de conferida na fonte (npm run noticias:verificar). */
  verificada: boolean
}

export const TEMAS: Record<TemaNoticia, { rotulo: string }> = {
  ia: { rotulo: 'A IA nas cidades' },
  cidade: { rotulo: 'A cidade que se organiza' },
  cidadao: { rotulo: 'O cidadão no centro' },
  mil: { rotulo: 'Os fundamentos MIL' },
}

export const NOTICIAS: Noticia[] = [
  {
    id: 'mcid-cidades-mais-inteligentes',
    tema: 'cidade',
    titulo: 'Governo seleciona 20 municípios para estratégias urbanas digitais',
    resumo: 'O projeto Cidades + Inteligentes abriu seleção para dar assessoria técnica a municípios ou consórcios.',
    conexao: 'Se relaciona com diagnóstico, planejamento e governança de informação nas cidades.',
    fonte: { nome: 'Ministério das Cidades', url: 'https://www.gov.br/cidades/pt-br/assuntos/noticias-1/noticia-mcid-n-2093/' },
    data: '2026-04-10',
    verificada: false,
  },
  {
    id: 'ms-pnisd',
    tema: 'ia',
    titulo: 'Nova política nacional de informação e saúde digital',
    resumo: 'A Portaria institui a PNISD, reforçando interoperabilidade, planejamento e participação dos municípios.',
    conexao: 'Conecta com o módulo de Saúde, o primeiro da plataforma.',
    fonte: { nome: 'Ministério da Saúde', url: 'https://www.gov.br/saude/pt-br/assuntos/noticias/2026/outubro/brasil-institui-politica-nacional-de-informacao-e-saude-digital-e-consolida-transformacao-digital-do-sus' },
    data: '2026-10-28',
    verificada: false,
  },
  {
    id: 'unesco-ramallah-mil',
    tema: 'mil',
    titulo: 'Ramallah lança iniciativa de cidade amiga da alfabetização midiática',
    resumo: 'A prefeitura lançou uma iniciativa para fortalecer pensamento crítico e uso responsável da informação.',
    conexao: 'Mostra o paradigma Cidades MIL aplicado por uma prefeitura.',
    fonte: { nome: 'UNESCO', url: 'https://www.unesco.org/en/articles/ramallah-municipality-launches-media-and-information-literacy-friendly-city-initiative-partnership' },
    data: '2026-11-06',
    verificada: false,
  },
]

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const partes = (d: string) => d.split('-').map(Number) as [number, number, number]
const utc = (a: number, m: number, d: number) => Date.UTC(a, m - 1, d)

function diasDesde(data: string, hoje: Date): number {
  const [a, m, d] = partes(data)
  return Math.round((utc(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate()) - utc(a, m, d)) / 86_400_000)
}

/** "Hoje", "Ontem", "Há N dias" (até 45) ou a data; nunca chama de recente o que não é. */
export function rotuloRecencia(data: string, hoje: Date): string {
  const dias = diasDesde(data, hoje)
  if (dias === 0) return 'Hoje'
  if (dias === 1) return 'Ontem'
  if (dias >= 2 && dias <= 45) return `Há ${dias} dias`
  const [a, m, d] = partes(data)
  return `${d} ${MESES[m - 1]} ${a}`
}

/** Só verificadas, sem datas futuras, da mais nova para a mais antiga. */
export function noticiasVisiveis(lista: Noticia[], hoje: Date): Noticia[] {
  return lista
    .filter((n) => n.verificada && diasDesde(n.data, hoje) >= 0)
    .sort((x, y) => (x.data < y.data ? 1 : x.data > y.data ? -1 : 0))
}
