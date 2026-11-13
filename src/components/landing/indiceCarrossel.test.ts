import { describe, expect, it } from 'vitest'
import { proximoIndice } from './indiceCarrossel'

describe('proximoIndice', () => {
  it('é circular nos dois sentidos', () => {
    expect(proximoIndice(0, 3, -1)).toBe(2)
    expect(proximoIndice(2, 3, 1)).toBe(0)
    expect(proximoIndice(1, 3, 1)).toBe(2)
  })
  it('sem itens devolve 0', () => {
    expect(proximoIndice(0, 0, 1)).toBe(0)
  })
})
