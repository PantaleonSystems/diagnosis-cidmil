import { describe, expect, it } from 'vitest'
import { PRIORIDADES, ordenar } from './prioridades'

describe('ordenar', () => {
  it('por urgência, a mais urgente vem primeiro', () => {
    expect(ordenar(PRIORIDADES, 'urgencia').map((p) => p.id)).toEqual(['escuta', 'capacitar', 'dados'])
  })
  it('por rapidez, o mais rápido vem primeiro', () => {
    expect(ordenar(PRIORIDADES, 'rapidez').map((p) => p.id)).toEqual(['capacitar', 'dados', 'escuta'])
  })
  it('não altera a lista original', () => {
    const copia = [...PRIORIDADES]
    ordenar(PRIORIDADES, 'rapidez')
    expect(PRIORIDADES).toEqual(copia)
  })
})
