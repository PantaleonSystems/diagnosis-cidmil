import { describe, expect, it } from 'vitest'
import {
  ESTADOS,
  buscarMunicipios,
  carregarMunicipios,
  listaPaises,
  normalizar,
} from './localidades'

describe('localidades', () => {
  it('normaliza acentos e caixa', () => {
    expect(normalizar('  São Paulo ')).toBe('sao paulo')
    expect(normalizar('Ceará-Mirim')).toBe('ceara-mirim')
  })

  it('tem os 27 estados, sem repetição', () => {
    expect(ESTADOS).toHaveLength(27)
    expect(new Set(ESTADOS.map((e) => e.sigla)).size).toBe(27)
  })

  it('lista países com o Brasil primeiro e sem repetição', () => {
    const ps = listaPaises()
    expect(ps[0]).toEqual({ codigo: 'BR', nome: 'Brasil' })
    expect(new Set(ps.map((p) => p.codigo)).size).toBe(ps.length)
    expect(ps.length).toBeGreaterThan(240)
  })

  it('carrega os municípios oficiais com código do IBGE', async () => {
    const todos = await carregarMunicipios()
    expect(todos.length).toBe(5571)
    expect(new Set(todos.map((m) => m.codigo)).size).toBe(5571)
    const santos = todos.find((m) => m.nome === 'Santos' && m.uf === 'SP')
    expect(santos?.codigo).toBe('3548500')
    expect(santos?.populacao).toBeGreaterThan(400_000)
  })

  it('busca sem acento, prioriza quem começa com o termo e respeita a UF', async () => {
    const todos = await carregarMunicipios()
    const r = buscarMunicipios(todos, 'sao paulo', '')
    expect(r.itens[0].nome).toBe('São Paulo')
    const so = buscarMunicipios(todos, 'santos', 'SP')
    expect(so.itens.every((m) => m.uf === 'SP')).toBe(true)
    expect(so.itens[0].nome).toBe('Santos')
    expect(buscarMunicipios(todos, 'zzzz', '').itens).toHaveLength(0)
  })
})
