/**
 * Consolidação: notas por métrica → média por pilar → ISPS → nível de
 * maturidade, com a Regra de Ouro do framework.
 */
import type { Pilar } from '@/data/metricas'
import { PILARES } from '@/data/metricas'
import type { Nota } from '@/lib/calculos'

/** Notas respondidas, indexadas pelo número da métrica. */
export type NotasPorMetrica = Record<number, Nota>

export interface PilarAvaliado {
  pilar: Pilar
  /** média simples das métricas respondidas do pilar (0 se nenhuma) */
  media: number
  respondidas: number
  total: number
}

/** Média simples das métricas respondidas de um pilar. */
export function mediaPilar(pilar: Pilar, notas: NotasPorMetrica): number {
  const valores = pilar.metricas
    .map((m) => notas[m.numero])
    .filter((n): n is Nota => n !== undefined)
  if (valores.length === 0) return 0
  return valores.reduce<number>((a, b) => a + b, 0) / valores.length
}

export function avaliarPilares(
  notas: NotasPorMetrica,
  pilares: Pilar[] = PILARES,
): PilarAvaliado[] {
  return pilares.map((pilar) => ({
    pilar,
    media: mediaPilar(pilar, notas),
    respondidas: pilar.metricas.filter((m) => notas[m.numero] !== undefined).length,
    total: pilar.metricas.length,
  }))
}

/**
 * Arredonda para 2 casas com meia-unidade para cima.
 *
 * `toFixed(2)` erra casos como 2.655 → "2.65", porque o binário mais próximo
 * fica logo abaixo. Deslocar o expoente em string faz o arredondamento em
 * decimal, como um auditor esperaria.
 */
function arredonda2(x: number): number {
  return Number(`${Math.round(Number(`${x}e+2`))}e-2`)
}

/** ISPS = soma das médias dos pilares ponderada pelos pesos. */
export function calcularISPS(avaliados: PilarAvaliado[]): number {
  const soma = avaliados.reduce((acc, a) => acc + a.media * a.pilar.peso, 0)
  return arredonda2(soma)
}

export const NIVEIS = [
  'Reativa',
  'Concessiva',
  'Participativa',
  'Cogestiva',
] as const

export type NivelIndice = 0 | 1 | 2 | 3

/** ≤1.5 Reativa · ≤2.5 Concessiva · ≤3.4 Participativa · >3.4 Cogestiva */
export function nivelMaturidade(isps: number): NivelIndice {
  if (isps <= 1.5) return 0
  if (isps <= 2.5) return 1
  if (isps <= 3.4) return 2
  return 3
}

/** Piso do Pilar 1 (Governança Participativa) para destravar o Nível 3. */
export const MINIMO_GOVERNANCA = 2.0

/** Teto imposto pela Regra de Ouro: Nível 2 (índice 1). */
const TETO_REGRA_DE_OURO: NivelIndice = 1

export interface ResultadoIndice {
  isps: number
  /** nível que o ISPS renderia por si só */
  nivelReal: NivelIndice
  /** nível efetivamente atribuído à cidade, já com a Regra de Ouro */
  nivelExibido: NivelIndice
  /** true quando a Regra de Ouro rebaixou o nível */
  travado: boolean
  mediaGovernanca: number
  pilares: PilarAvaliado[]
}

/**
 * Regra de Ouro: se o Pilar 1 (Governança Participativa) tem média abaixo de
 * 2,0, a cidade fica travada no Nível 2 independentemente do ISPS —
 * participação é pré-requisito de uma Cidade MIL. A nota real continua sendo
 * exibida, junto do aviso.
 */
export function consolidar(
  notas: NotasPorMetrica,
  pilares: Pilar[] = PILARES,
): ResultadoIndice {
  const avaliados = avaliarPilares(notas, pilares)
  const isps = calcularISPS(avaliados)
  const nivelReal = nivelMaturidade(isps)

  const governanca = avaliados.find((a) => a.pilar.numero === 1)
  const mediaGovernanca = governanca?.media ?? 0
  const respondeuGovernanca = (governanca?.respondidas ?? 0) > 0

  const travado =
    respondeuGovernanca &&
    mediaGovernanca < MINIMO_GOVERNANCA &&
    nivelReal > TETO_REGRA_DE_OURO

  return {
    isps,
    nivelReal,
    nivelExibido: travado ? TETO_REGRA_DE_OURO : nivelReal,
    travado,
    mediaGovernanca,
    pilares: avaliados,
  }
}
