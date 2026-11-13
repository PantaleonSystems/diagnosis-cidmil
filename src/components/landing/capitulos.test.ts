import { describe, expect, it } from 'vitest'
import { CAPITULOS, escolherCapituloAtivo } from './capitulos'

describe('escolherCapituloAtivo', () => {
  it('escolhe o capítulo mais visível', () => {
    expect(escolherCapituloAtivo({ cidade: 0.2, dados: 0.7 })).toBe('dados')
  })
  it('devolve null quando nada está visível', () => {
    expect(escolherCapituloAtivo({})).toBeNull()
    expect(escolherCapituloAtivo({ cidade: 0 })).toBeNull()
  })
  it('em empate fica com o primeiro da lista', () => {
    expect(escolherCapituloAtivo({ dados: 0.5, cidade: 0.5 })).toBe('cidade')
  })
  it('tem os cinco capítulos da história', () => {
    expect(CAPITULOS.map((c) => c.id)).toEqual(['cidade', 'dados', 'calculo', 'frentes', 'decisao'])
  })
})
