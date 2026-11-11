import { describe, expect, it } from 'vitest'
import { ehDemonstracao, nomeCurto, similaridade, textoBusca, ufVisivel } from './cidades'

describe('helpers de cidade', () => {
  it('reconhece a cidade de demonstração e tira o sufixo do nome', () => {
    expect(ehDemonstracao({ nome: 'Município Exemplo (demonstração)' })).toBe(true)
    expect(ehDemonstracao({ nome: 'Santos' })).toBe(false)
    expect(nomeCurto({ nome: 'Município Exemplo (demonstração)' })).toBe('Município Exemplo')
    expect(nomeCurto({ nome: 'Santos' })).toBe('Santos')
  })

  it('só mostra a UF quando é uma sigla de verdade', () => {
    expect(ufVisivel({ uf: 'sp' })).toBe('SP')
    expect(ufVisivel({ uf: '--' })).toBe('')
    expect(ufVisivel({ uf: '' })).toBe('')
  })

  it('semelhança vai de 1 (iguais) a 0 (1,2 pontos ou mais de distância)', () => {
    expect(similaridade(2.5, 2.5)).toBe(1)
    expect(similaridade(2.5, 3.1)).toBeCloseTo(0.5, 5)
    expect(similaridade(0.5, 3.5)).toBe(0)
  })

  it('busca por nome e UF sem acento', () => {
    expect(textoBusca({ nome: 'São Paulo', uf: 'SP' })).toBe('sao paulo sp')
  })
})
