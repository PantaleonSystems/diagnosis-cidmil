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
