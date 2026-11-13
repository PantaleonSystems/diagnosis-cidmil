import { PILARES } from '@/data/metricas'
import { MINIMO_GOVERNANCA, nivelMaturidade } from '@/lib/isps'

/**
 * Índice dos cinco pilares, com a mesma regra do produto (`consolidar` em
 * `@/lib/isps`): média ponderada pelos pesos + Regra de Ouro (Governança
 * abaixo do mínimo trava a cidade no Nível 2). Usado só na ilustração da landing.
 */
export function calcular(notas: number[]) {
  const isps = Math.round(PILARES.reduce((s, p, i) => s + notas[i] * p.peso, 0) * 100) / 100
  const nivelReal = nivelMaturidade(isps)
  const travado = notas[0] < MINIMO_GOVERNANCA && nivelReal > 1
  return { isps, nivel: travado ? 1 : nivelReal, nivelReal, travado }
}

export type NivelConsistencia = 'inicial' | 'parcial' | 'completa'

/** Quão completa está a conferência dos dados: metade ou mais é parcial; tudo é completa. */
export function nivelConsistencia(preenchidas: number, total: number): NivelConsistencia {
  if (total <= 0) return 'inicial'
  const r = Math.max(0, Math.min(preenchidas, total)) / total
  if (r >= 1) return 'completa'
  return r >= 0.5 ? 'parcial' : 'inicial'
}
