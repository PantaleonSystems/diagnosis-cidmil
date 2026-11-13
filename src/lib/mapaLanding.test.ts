import { describe, expect, it } from 'vitest'
import { bboxDe, calcularZoom, caminhoSvg, enquadrar, projetar, simplificar, type Vista } from './mapaLanding'

const ASPECTO = 1540 / 1620

describe('simplificar', () => {
  it('remove ponto colinear de um anel fechado e mantém o fechamento', () => {
    const anel: [number, number][] = [[0, 0], [5, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
    const r = simplificar(anel, 0.1)
    expect(r).toHaveLength(5)
    expect(r[0]).toEqual(r[r.length - 1])
  })
  it('nunca devolve vazio', () => {
    expect(simplificar([[0, 0], [1, 1], [0, 0]], 100).length).toBeGreaterThan(0)
  })
})

describe('caminhoSvg e projetar', () => {
  it('gera um subcaminho fechado por anel', () => {
    expect(caminhoSvg([[[0, 0], [1, 0], [1, 1]]])).toBe('M0 0 1 0 1 1Z')
  })
  it('projeta a origem do Brasil em (0, 0)', () => {
    const [x, y] = projetar(-74, 6)
    expect(x).toBeCloseTo(0)
    expect(y).toBeCloseTo(0)
  })
})

describe('enquadrar', () => {
  it('mantém a razão de aspecto e contém o bbox com folga', () => {
    const v = enquadrar([0, 0, 100, 50], ASPECTO)
    expect(v[2] / v[3]).toBeCloseTo(ASPECTO, 4)
    expect(v[0]).toBeLessThanOrEqual(-12.5 + 1e-9)
    expect(v[0] + v[2]).toBeGreaterThanOrEqual(112.5 - 1e-9)
  })
})

describe('calcularZoom', () => {
  const V0: Vista = [0, 30, 1540, 1620]
  it('mesma vista não move nada', () => {
    const z = calcularZoom(V0, V0, 400, 420)
    expect(z.s).toBeCloseTo(1)
    expect(z.tx).toBeCloseTo(0)
    expect(z.ty).toBeCloseTo(0)
  })
  it('leva o canto da vista de destino ao canto da tela', () => {
    const W = 400, H = 420, V1: Vista = [400, 500, 385, 405]
    const z = calcularZoom(V0, V1, W, H)
    const px = ((V1[0] - V0[0]) / V0[2]) * W
    const py = ((V1[1] - V0[1]) / V0[3]) * H
    expect(W / 2 + z.s * (px - W / 2) + z.tx).toBeCloseTo(0)
    expect(H / 2 + z.s * (py - H / 2) + z.ty).toBeCloseTo(0)
  })
  it('a escala não depende do tamanho da tela', () => {
    const V1: Vista = [400, 500, 385, 405]
    expect(calcularZoom(V0, V1, 320, 336).s).toBeCloseTo(calcularZoom(V0, V1, 1000, 1052).s)
  })
})

describe('bboxDe', () => {
  it('lê o retângulo de um caminho SVG', () => {
    expect(bboxDe('M10 20 30 5 15 40Z')).toEqual([10, 5, 20, 35])
  })
})
