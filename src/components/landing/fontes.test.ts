import { describe, expect, it } from 'vitest'
import { FONTES } from './fontes'

describe('FONTES', () => {
  it('tem cinco fontes com ids únicos', () => {
    expect(FONTES).toHaveLength(5)
    expect(new Set(FONTES.map((f) => f.id)).size).toBe(5)
  })
  it('posições ficam dentro do mapa (0 a 100)', () => {
    for (const f of FONTES) {
      expect(f.x).toBeGreaterThanOrEqual(0); expect(f.x).toBeLessThanOrEqual(100)
      expect(f.y).toBeGreaterThanOrEqual(0); expect(f.y).toBeLessThanOrEqual(100)
    }
  })
  it('as frases são curtas', () => {
    for (const f of FONTES) expect(f.frase.length).toBeLessThanOrEqual(140)
  })
})
