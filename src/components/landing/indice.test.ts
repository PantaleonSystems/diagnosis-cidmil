import { describe, expect, it } from 'vitest'
import { calcular } from './indice'

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
