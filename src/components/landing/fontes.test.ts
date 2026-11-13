import { describe, expect, it } from 'vitest'
import { FONTES } from './fontes'

describe('FONTES', () => {
  it('tem seis fontes com ids únicos', () => {
    expect(FONTES).toHaveLength(6)
    expect(new Set(FONTES.map((f) => f.id)).size).toBe(6)
  })
  it('fala de lugares e portais, não de "bases" soltas', () => {
    const textos = FONTES.map((f) => `${f.nome} ${f.frase}`).join(' ').toLowerCase()
    expect(textos).toContain('portais de transparência')
    expect(textos).toContain('cadastros públicos')
    expect(textos).toContain('projetos')
    expect(textos).toContain('valores da cidade')
    expect(textos).not.toMatch(/\bbases?\b/)
  })
  it('as frases são curtas', () => {
    for (const f of FONTES) expect(f.frase.length).toBeLessThanOrEqual(90)
  })
})
