import { describe, expect, it } from 'vitest'
import {
  calcularNota,
  notaDens,
  notaFaixa,
  notaPercent,
  prioridade,
} from '@/lib/calculos'
import { METRICAS, PILARES, TOTAL_METRICAS } from '@/data/metricas'
import type { Metrica } from '@/data/metricas'

const porNumero = (n: number) => METRICAS.find((m) => m.numero === n) as Metrica

describe('notaPercent — limites de faixa', () => {
  it.each([
    [0, 0],
    [-5, 0],
    [0.1, 1],
    [25, 1],
    [25.1, 2],
    [50, 2],
    [50.1, 3],
    [75, 3],
    [75.1, 4],
    [100, 4],
  ])('%d%% → nota %d', (pct, esperado) => {
    expect(notaPercent(pct)).toBe(esperado)
  })
})

describe('notaDens — limites de faixa', () => {
  it.each([
    [0, 0],
    [0.49, 0],
    [0.5, 1],
    [0.99, 1],
    [1, 2],
    [1.99, 2],
    [2, 3],
    [3.99, 3],
    [4, 4],
    [12, 4],
  ])('%d por 10 mil → nota %d', (d, esperado) => {
    expect(notaDens(d)).toBe(esperado)
  })
})

describe('notaFaixa', () => {
  const faixas: [number, number][] = [
    [0, 0],
    [3, 1],
    [10, 2],
    [25, 3],
  ]

  it.each([
    [0, 0],
    [1, 1],
    [3, 1],
    [4, 2],
    [10, 2],
    [11, 3],
    [25, 3],
    [26, 4],
  ])('%d unidades → nota %d', (v, esperado) => {
    expect(notaFaixa(v, faixas)).toBe(esperado)
  })
})

describe('calcularNota por tipo de métrica', () => {
  it('percentual: 120 de 500 profissionais capacitados em MIL → nota 1', () => {
    // métrica 70, o exemplo do ARCHITECTURE: 24% → faixa 0–25%
    expect(calcularNota(porNumero(70), { prof_total: 500, prof_mil: 120 })).toBe(1)
  })

  it('percentual: total zero não divide por zero — vira nota 0', () => {
    expect(calcularNota(porNumero(70), { prof_total: 0, prof_mil: 0 })).toBe(0)
  })

  it('densidade: 120 espaços para 100 mil hab. = 12 por 10 mil → nota 4', () => {
    expect(calcularNota(porNumero(65), { populacao: 100000, espacos: 120 })).toBe(4)
  })

  it('faixa: 8 startups de saúde cai na faixa 4–10 → nota 2', () => {
    expect(calcularNota(porNumero(68), { startups: 8 })).toBe(2)
  })

  it('campo ausente é tratado como zero, não como NaN', () => {
    expect(calcularNota(porNumero(68), {})).toBe(0)
  })

  it('régua não pode ser calculada — a nota é o nível escolhido', () => {
    expect(() => calcularNota(porNumero(100), {})).toThrow(/régua/)
  })
})

describe('prioridade', () => {
  it('nota baixa gera prioridade alta de intervenção', () => {
    expect(prioridade(0)).toBe('Alta')
    expect(prioridade(1)).toBe('Alta')
    expect(prioridade(2)).toBe('Média')
    expect(prioridade(3)).toBe('Baixa')
    expect(prioridade(4)).toBe('Baixa')
  })
})

describe('integridade do catálogo', () => {
  it('tem 43 métricas', () => {
    expect(TOTAL_METRICAS).toBe(43)
  })

  it('não repete número de métrica entre pilares', () => {
    const numeros = METRICAS.map((m) => m.numero)
    expect(new Set(numeros).size).toBe(numeros.length)
  })

  it('todas as métricas estão na faixa 63–105 do módulo Saúde', () => {
    for (const m of METRICAS) {
      expect(m.numero).toBeGreaterThanOrEqual(63)
      expect(m.numero).toBeLessThanOrEqual(105)
    }
  })

  it('os pesos dos pilares somam 1', () => {
    const soma = PILARES.reduce((a, p) => a + p.peso, 0)
    expect(soma).toBeCloseTo(1, 10)
  })

  it('toda régua tem exatamente 5 níveis', () => {
    for (const m of METRICAS) {
      if (m.tipo === 'regua') expect(m.niveis).toHaveLength(5)
    }
  })

  it('faixas são crescentes e param na nota 3 (o resto é 4)', () => {
    for (const m of METRICAS) {
      if (m.tipo !== 'faixa') continue
      const limites = m.faixas.map(([l]) => l)
      expect([...limites].sort((a, b) => a - b)).toEqual(limites)
      expect(m.faixas.at(-1)?.[1]).toBe(3)
    }
  })
})
