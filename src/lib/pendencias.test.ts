import { describe, expect, it } from 'vitest'
import { PILARES } from '@/data/metricas'
import { impactoDoPilar, impactoPendente, listarPendencias, resumoPorPilar, TOTAL_METRICAS } from './pendencias'

describe('pendências por impacto', () => {
  it('sem respostas, todas as 43 estão pendentes e somam 100% do índice', () => {
    const p = listarPendencias({})
    expect(p).toHaveLength(TOTAL_METRICAS)
    expect(impactoPendente(p)).toBeCloseTo(1, 6)
  })

  it('ordena das que mais pesam para as que menos pesam', () => {
    const p = listarPendencias({})
    for (let i = 1; i < p.length; i++) expect(p[i - 1].impacto).toBeGreaterThanOrEqual(p[i].impacto)
    // Governança (35% em 12 métricas) pesa mais por métrica que Planejamento (5% em 4)
    expect(p[0].pilar.numero).toBe(1)
    expect(p[p.length - 1].pilar.numero).toBe(5)
  })

  it('tira as respondidas e reduz o peso pendente', () => {
    const pilar1 = PILARES[0]
    const respostas = Object.fromEntries(pilar1.metricas.map((m) => [m.numero, { nota: 2 }]))
    const p = listarPendencias(respostas)
    expect(p).toHaveLength(TOTAL_METRICAS - pilar1.metricas.length)
    expect(p.some((x) => x.pilar.numero === 1)).toBe(false)
    expect(impactoPendente(p)).toBeCloseTo(1 - pilar1.peso, 6)
  })

  it('cada métrica vale o peso do pilar dividido pelo número de métricas', () => {
    expect(impactoDoPilar(PILARES[0])).toBeCloseTo(0.35 / 12, 6)
  })

  it('resume o andamento por pilar', () => {
    const r = resumoPorPilar({ [PILARES[1].metricas[0].numero]: {} })
    expect(r[1].feitas).toBe(1)
    expect(r[1].total).toBe(PILARES[1].metricas.length)
    expect(r[0].feitas).toBe(0)
  })
})
