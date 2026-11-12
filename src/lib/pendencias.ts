import { PILARES, TOTAL_METRICAS, type Metrica, type Pilar } from '@/data/metricas'

export interface Pendencia {
  metrica: Metrica
  pilar: Pilar
  /** quanto esta métrica vale no índice quando preenchida (0–1: peso do pilar ÷ nº de métricas dele) */
  impacto: number
}

/** Quanto cada métrica de um pilar vale no índice (todas valem igual dentro do pilar). */
export const impactoDoPilar = (pilar: Pilar): number => pilar.peso / pilar.metricas.length

/** Métricas ainda sem resposta, das que mais pesam no índice para as que menos pesam. */
export function listarPendencias(respostas: Record<number, unknown>): Pendencia[] {
  const todas: Pendencia[] = PILARES.flatMap((pilar) =>
    pilar.metricas
      .filter((m) => respostas[m.numero] === undefined)
      .map((metrica) => ({ metrica, pilar, impacto: impactoDoPilar(pilar) })),
  )
  // sort estável: dentro do mesmo impacto mantém a ordem do catálogo
  return todas.sort((a, b) => b.impacto - a.impacto)
}

/** Parte do índice que ainda não foi coberta (0–1), somando o peso das métricas pendentes. */
export const impactoPendente = (pendencias: Pendencia[]): number =>
  pendencias.reduce((s, p) => s + p.impacto, 0)

export interface ResumoPilar {
  pilar: Pilar
  feitas: number
  total: number
}

export function resumoPorPilar(respostas: Record<number, unknown>): ResumoPilar[] {
  return PILARES.map((pilar) => ({
    pilar,
    feitas: pilar.metricas.filter((m) => respostas[m.numero] !== undefined).length,
    total: pilar.metricas.length,
  }))
}

export { TOTAL_METRICAS }
