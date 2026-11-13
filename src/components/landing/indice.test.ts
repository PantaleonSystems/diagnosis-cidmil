import { describe, expect, it } from 'vitest'
import { calcular, nivelConsistencia } from './indice'

describe('índice da landing', () => {
  it('cenário padrão: ISPS 2,66 travado no Nível 2 pela Regra de Ouro', () => {
    const r = calcular([1.9, 2.8, 3.2, 3.5, 2.5])
    expect(r.isps).toBe(2.66)
    expect(r.nivelReal).toBe(2)
    expect(r.travado).toBe(true)
    expect(r.nivel).toBe(1)
  })

  it('governança alta destrava o nível real', () => {
    const r = calcular([3.6, 3.4, 3.5, 3.7, 3.2])
    expect(r.travado).toBe(false)
    expect(r.nivel).toBe(r.nivelReal)
    expect(r.nivel).toBe(3)
  })

  it('não rebaixa quem já está no Nível 2 ou abaixo', () => {
    const r = calcular([0.8, 1.1, 1.0, 1.4, 0.6])
    expect(r.travado).toBe(false)
    expect(r.nivel).toBe(0)
  })
})

describe('nivelConsistencia', () => {
  it.each([
    [0, 10, 'inicial'], [4, 10, 'inicial'], [5, 10, 'parcial'], [9, 10, 'parcial'],
    [10, 10, 'completa'], [12, 10, 'completa'], [-3, 10, 'inicial'], [0, 0, 'inicial'],
  ] as const)('%i de %i → %s', (pre, total, esperado) => {
    expect(nivelConsistencia(pre, total)).toBe(esperado)
  })
})
