/**
 * Da leitura dos resultados à decisão: conclusões, ações possíveis, simulação
 * do "e se" e sugestão de prioridade (GUT).
 *
 * Tudo aqui é derivado das notas reais e do cálculo do índice. O que é opinião
 * (o GUT) é sempre uma SUGESTÃO que o consultor ajusta, e o ganho no índice é
 * uma estimativa: supõe que cada ação suba a métrica uma nota.
 */
import { PILARES, type Metrica, type Pilar } from '@/data/metricas'
import type { Nota } from '@/lib/calculos'
import {
  MINIMO_GOVERNANCA,
  consolidar,
  type NotasPorMetrica,
  type ResultadoIndice,
} from '@/lib/isps'
import {
  alavancagem,
  descreverProximoPasso,
  descreverSituacao,
  type RespostasPlano,
} from '@/lib/plano'

/** Quantas ações possíveis oferecer, e quantas no máximo por pilar. */
export const MAX_ACOES = 6
const MAX_POR_PILAR = 2

const n = (v: number, casas = 1) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

export const notasDe = (respostas: RespostasPlano): NotasPorMetrica =>
  Object.fromEntries(Object.entries(respostas).map(([k, v]) => [Number(k), v.nota]))

/** Soma ponderada sem arredondar: o ganho de uma ação pequena não some. */
function ispsExato(r: ResultadoIndice): number {
  return r.pilares.reduce((soma, p) => soma + p.media * p.pilar.peso, 0)
}

/* -------------------------------------------------------------------------- */
/*  Ações possíveis                                                           */
/* -------------------------------------------------------------------------- */

export interface AcaoPossivel {
  /** número da métrica */
  id: number
  metrica: Metrica
  pilar: Pilar
  nota: Nota
  /** a nota que a ação leva a métrica: a atual mais um */
  notaNova: Nota
  situacao: string
  passo: string
  /** quanto a nota geral sobe se só esta ação acontecer (estimativa) */
  ganho: number
  /** ajuda a tirar Governança do mínimo, quando a Regra de Ouro segura a cidade */
  ajudaDestravar: boolean
}

export function acoesPossiveis(respostas: RespostasPlano, limite = MAX_ACOES): AcaoPossivel[] {
  const notas = notasDe(respostas)
  if (Object.keys(notas).length === 0) return []
  const antes = consolidar(notas)
  const base = ispsExato(antes)

  const todas: AcaoPossivel[] = []
  for (const pilar of PILARES) {
    for (const metrica of pilar.metricas) {
      const r = respostas[metrica.numero]
      if (!r || r.nota >= 4) continue
      const nota = r.nota
      const depois = consolidar({ ...notas, [metrica.numero]: (nota + 1) as Nota })
      todas.push({
        id: metrica.numero,
        metrica,
        pilar,
        nota,
        notaNova: (nota + 1) as Nota,
        situacao: descreverSituacao(metrica, nota, r.dadosBrutos ?? {}),
        passo: descreverProximoPasso(metrica, nota, r.dadosBrutos ?? {}),
        ganho: ispsExato(depois) - base,
        ajudaDestravar: antes.travado && pilar.numero === 1,
      })
    }
  }

  todas.sort(
    (a, b) =>
      Number(b.ajudaDestravar) - Number(a.ajudaDestravar) ||
      b.ganho - a.ganho ||
      a.nota - b.nota ||
      a.id - b.id,
  )

  // Um pilar não toma conta da lista: um plano precisa cobrir frentes. A exceção
  // é Governança quando a Regra de Ouro segura a cidade: a lista precisa ter
  // ações suficientes para tirá-la do mínimo, senão o simulador nunca mostra isso.
  const gov = antes.pilares.find((p) => p.pilar.numero === 1)
  const faltamEmGovernanca =
    antes.travado && gov
      ? Math.max(1, Math.ceil(MINIMO_GOVERNANCA * gov.respondidas - gov.media * gov.respondidas - 1e-9))
      : 0
  const tetoDoPilar = (numero: number) =>
    numero === 1 ? Math.max(MAX_POR_PILAR, faltamEmGovernanca) : MAX_POR_PILAR

  const escolhidas: AcaoPossivel[] = []
  const porPilar = new Map<number, number>()
  for (const a of todas) {
    if (escolhidas.length >= limite) break
    const usados = porPilar.get(a.pilar.numero) ?? 0
    if (usados >= tetoDoPilar(a.pilar.numero)) continue
    porPilar.set(a.pilar.numero, usados + 1)
    escolhidas.push(a)
  }
  return escolhidas
}

/* -------------------------------------------------------------------------- */
/*  Simulador                                                                 */
/* -------------------------------------------------------------------------- */

export interface Simulacao {
  antes: ResultadoIndice
  depois: ResultadoIndice
  /** quanto a nota geral sobe com as ações marcadas */
  ganho: number
  /** a Regra de Ouro segurava a cidade e deixou de segurar */
  liberouRegraDeOuro: boolean
}

export function simular(respostas: RespostasPlano, ids: number[]): Simulacao {
  const notas = notasDe(respostas)
  const novas: NotasPorMetrica = { ...notas }
  for (const id of ids) {
    const atual = notas[id]
    if (atual !== undefined) novas[id] = Math.min(4, atual + 1) as Nota
  }
  const antes = consolidar(notas)
  const depois = consolidar(novas)
  return {
    antes,
    depois,
    ganho: ispsExato(depois) - ispsExato(antes),
    liberouRegraDeOuro: antes.travado && !depois.travado,
  }
}

/* -------------------------------------------------------------------------- */
/*  Conclusões                                                                */
/* -------------------------------------------------------------------------- */

export type TipoConclusao = 'fraqueza' | 'forca' | 'oportunidade'

export interface Conclusao {
  id: string
  tipo: TipoConclusao
  /** nome curto da área a que se refere */
  area: string
  /** o dado, em uma frase com número e escala */
  dado: string
  /** o que isso significa, em palavras simples */
  texto: string
}

/** As conclusões que o diagnóstico sugere. O consultor confirma, edita ou descarta. */
export function conclusoes(respostas: RespostasPlano): Conclusao[] {
  const notas = notasDe(respostas)
  if (Object.keys(notas).length === 0) return []
  const r = consolidar(notas)
  const lista: Conclusao[] = []

  /* Governança abaixo do mínimo */
  const gov = r.pilares.find((p) => p.pilar.numero === 1)
  if (gov && gov.respondidas > 0 && gov.media < MINIMO_GOVERNANCA) {
    lista.push({
      id: 'governanca',
      tipo: 'fraqueza',
      area: gov.pilar.curto,
      dado: `Governança tem nota ${n(gov.media)}. O mínimo é ${n(MINIMO_GOVERNANCA)}`,
      texto: r.travado
        ? `Se Governança não subir, a cidade não passa do Nível 2, mesmo que as outras áreas melhorem. É a área que mais pesa na nota: ${Math.round(gov.pilar.peso * 100)}%.`
        : `Abaixo de ${n(MINIMO_GOVERNANCA)}, a cidade não passa do Nível 2 (Regra de Ouro). Por enquanto a nota geral nem chegaria lá, mas vale cuidar desde já.`,
    })
  }

  /* Métricas com a nota mais baixa */
  const fracas = Object.entries(respostas)
    .map(([k, v]) => ({ numero: Number(k), nota: v.nota }))
    .filter((x) => x.nota <= 1)
    .map((x) => {
      const pilar = PILARES.find((p) => p.metricas.some((m) => m.numero === x.numero))!
      return { ...x, pilar, metrica: pilar.metricas.find((m) => m.numero === x.numero)! }
    })
    .sort((a, b) => a.nota - b.nota || alavancagem(b.pilar) - alavancagem(a.pilar) || a.numero - b.numero)
    .slice(0, 2)
  for (const f of fracas) {
    lista.push({
      id: `fraca-${f.numero}`,
      tipo: 'fraqueza',
      area: f.pilar.curto,
      dado: `${f.metrica.titulo}: nota ${f.nota} de 4`,
      texto:
        `É uma das notas mais baixas do diagnóstico, na área ${f.pilar.curto}.` +
        (f.pilar.numero === 1 && r.mediaGovernanca < MINIMO_GOVERNANCA
          ? ' Melhorar aqui ajuda Governança a chegar a 2,0.'
          : ''),
    })
  }

  /* Ponto forte: a área com a melhor nota, se for boa de verdade */
  const melhor = [...r.pilares]
    .filter((p) => p.respondidas > 0)
    .sort((a, b) => b.media - a.media)[0]
  if (melhor && melhor.media >= 3) {
    lista.push({
      id: `forca-${melhor.pilar.numero}`,
      tipo: 'forca',
      area: melhor.pilar.curto,
      dado: `${melhor.pilar.curto} tem nota ${n(melhor.media)} de 4`,
      texto: 'É um ponto forte. Vale usar como argumento nas conversas com o gestor.',
    })
  }

  /* Oportunidade: a ação que mais move a nota geral, fora o que já apareceu */
  const jaCitadas = new Set(fracas.map((f) => f.numero))
  const oportunidade = acoesPossiveis(respostas, MAX_ACOES * 3).find(
    (a) => !jaCitadas.has(a.id) && !a.ajudaDestravar && a.ganho > 0,
  )
  if (oportunidade) {
    lista.push({
      id: `oportunidade-${oportunidade.id}`,
      tipo: 'oportunidade',
      area: oportunidade.pilar.curto,
      dado: `${oportunidade.metrica.titulo}: nota ${oportunidade.nota} de 4`,
      texto: `Subir uma nota aqui soma ${n(oportunidade.ganho, 2)} na nota geral. ${oportunidade.passo}`,
    })
  }

  return lista
}

/* -------------------------------------------------------------------------- */
/*  GUT                                                                       */
/* -------------------------------------------------------------------------- */

export interface Gut {
  /** quão grave, de 1 a 5 */
  g: number
  /** quão urgente, de 1 a 5 */
  u: number
  /** vai piorar se esperarmos, de 1 a 5 */
  t: number
}

const limita = (v: number) => Math.max(1, Math.min(5, Math.round(v)))

/**
 * Sugestão inicial para o consultor ajustar. Gravidade vem da nota (quanto mais
 * baixa, mais grave); urgência e tendência sobem quando a ação ajuda a tirar a
 * cidade da Regra de Ouro ou quando a nota está no fundo.
 */
export function sugerirGUT(a: AcaoPossivel): Gut {
  const fundo = a.nota <= 1
  return {
    g: limita(5 - a.nota),
    u: a.ajudaDestravar ? 5 : fundo ? 4 : 3,
    t: a.ajudaDestravar || a.nota === 0 ? 4 : 3,
  }
}

export const pontosGUT = (g: Gut): number => g.g * g.u * g.t

/** Do maior produto para o menor; empate mantém a ordem recebida. */
export function ordenarPorGUT<T extends Gut>(itens: T[]): T[] {
  return itens
    .map((item, i) => ({ item, i }))
    .sort((a, b) => pontosGUT(b.item) - pontosGUT(a.item) || a.i - b.i)
    .map((x) => x.item)
}
