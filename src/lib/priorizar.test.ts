import { describe, expect, it } from 'vitest'
import { PILARES } from '@/data/metricas'
import type { Nota } from '@/lib/calculos'
import type { RespostasPlano } from '@/lib/plano'
import {
  acoesPossiveis,
  conclusoes,
  ordenarPorGUT,
  simular,
  sugerirGUT,
} from '@/lib/priorizar'

/** Mesma nota em todas as métricas de cada pilar. */
function uniformes(medias: [number, number, number, number, number]): RespostasPlano {
  const r: RespostasPlano = {}
  PILARES.forEach((p, i) => {
    for (const m of p.metricas) r[m.numero] = { nota: medias[i] as Nota, dadosBrutos: {} }
  })
  return r
}

// Governança em 1 e o resto alto: o índice renderia Nível 3, mas a Regra de Ouro segura no 2.
const travada = uniformes([1, 4, 4, 4, 4])

describe('simular', () => {
  it('sem ações, não muda nada', () => {
    const s = simular(travada, [])
    expect(s.depois.isps).toBe(s.antes.isps)
    expect(s.ganho).toBe(0)
  })

  it('sobe uma nota em cada métrica escolhida e recalcula o índice', () => {
    const ids = PILARES[0].metricas.slice(0, 2).map((m) => m.numero)
    const s = simular(travada, ids)
    expect(s.depois.isps).toBeGreaterThan(s.antes.isps)
    expect(s.ganho).toBeGreaterThan(0)
  })

  it('libera a Regra de Ouro quando a média de Governança chega a 2,0', () => {
    const p1 = PILARES[0].metricas.map((m) => m.numero)
    expect(simular(travada, []).antes.travado).toBe(true)
    // todas as métricas de Governança de 1 para 2: a média vira 2,0
    const s = simular(travada, p1)
    expect(s.depois.mediaGovernanca).toBeCloseTo(2, 5)
    expect(s.depois.travado).toBe(false)
    expect(s.liberouRegraDeOuro).toBe(true)
    expect(s.depois.nivelExibido).toBeGreaterThan(s.antes.nivelExibido)
  })

  it('não passa de nota 4', () => {
    const r = uniformes([4, 4, 4, 4, 4])
    const s = simular(r, [PILARES[0].metricas[0].numero])
    expect(s.depois.isps).toBe(s.antes.isps)
  })
})

describe('acoesPossiveis', () => {
  it('só traz métricas que ainda podem subir', () => {
    const acoes = acoesPossiveis(uniformes([4, 4, 4, 4, 1]))
    expect(acoes.length).toBeGreaterThan(0)
    expect(acoes.every((a) => a.nota < 4)).toBe(true)
  })

  it('põe primeiro as de Governança quando a Regra de Ouro está segurando', () => {
    const acoes = acoesPossiveis(travada)
    expect(acoes[0].pilar.numero).toBe(1)
    expect(acoes[0].ajudaDestravar).toBe(true)
  })

  it('limita o total e não deixa um pilar tomar conta', () => {
    const acoes = acoesPossiveis(uniformes([1, 1, 1, 1, 1]))
    expect(acoes.length).toBeLessThanOrEqual(6)
    const porPilar = new Map<number, number>()
    for (const a of acoes) porPilar.set(a.pilar.numero, (porPilar.get(a.pilar.numero) ?? 0) + 1)
    expect(Math.max(...porPilar.values())).toBeLessThanOrEqual(2)
  })

  it('oferece ações de Governança suficientes para liberar a Regra de Ouro', () => {
    // Governança: 9 métricas em 2 e 3 em 1 (média 1,75). Faltam 3 pontos para chegar a 2,0.
    const r = uniformes([2, 4, 4, 4, 4])
    PILARES[0].metricas.slice(0, 3).forEach((m) => {
      r[m.numero] = { nota: 1, dadosBrutos: {} }
    })
    const acoes = acoesPossiveis(r)
    const deGovernanca = acoes.filter((a) => a.pilar.numero === 1)
    expect(deGovernanca.length).toBeGreaterThanOrEqual(3)
    const s = simular(r, deGovernanca.map((a) => a.id))
    expect(s.antes.travado).toBe(true)
    expect(s.liberouRegraDeOuro).toBe(true)
  })

  it('a nota nova é a atual mais um', () => {
    for (const a of acoesPossiveis(uniformes([1, 2, 3, 0, 1]))) expect(a.notaNova).toBe(a.nota + 1)
  })
})

describe('conclusões', () => {
  it('avisa sobre Governança quando está abaixo do mínimo', () => {
    const c = conclusoes(travada)
    expect(c[0].tipo).toBe('fraqueza')
    expect(c[0].dado).toContain('Governança')
    expect(c[0].dado).toContain('2,0')
  })

  it('aponta como força um pilar com nota alta', () => {
    const c = conclusoes(travada)
    expect(c.some((x) => x.tipo === 'forca')).toBe(true)
  })

  it('não repete o mesmo achado e cada um tem id próprio', () => {
    const c = conclusoes(uniformes([1, 3, 1, 2, 4]))
    expect(new Set(c.map((x) => x.id)).size).toBe(c.length)
  })

  it('nunca devolve lista vazia quando há respostas', () => {
    expect(conclusoes(uniformes([3, 3, 3, 3, 3])).length).toBeGreaterThan(0)
  })

  it('liga cada conclusão às ações que ela libera', () => {
    const r = travada
    const c = conclusoes(r)
    const governanca = c.find((x) => x.id === 'governanca')!
    expect(governanca.acoes.length).toBeGreaterThan(0)
    // as ações citadas existem de verdade e ainda podem subir
    for (const id of c.flatMap((x) => x.acoes)) expect((r[id]?.nota ?? 4) < 4).toBe(true)
    // uma força não libera ação
    expect(c.find((x) => x.tipo === 'forca')?.acoes).toEqual([])
  })

  it('sem teto por pilar, traz todas as métricas que ainda sobem', () => {
    const r = uniformes([1, 1, 1, 1, 1])
    const total = Object.values(r).filter((x) => x.nota < 4).length
    expect(acoesPossiveis(r, 500, { semTeto: true })).toHaveLength(total)
  })

  it('devolve vazio sem respostas', () => {
    expect(conclusoes({})).toEqual([])
  })
})

describe('GUT', () => {
  it('sugere notas de 1 a 5', () => {
    for (const a of acoesPossiveis(uniformes([0, 1, 2, 3, 0]))) {
      const g = sugerirGUT(a)
      for (const v of [g.g, g.u, g.t]) {
        expect(v).toBeGreaterThanOrEqual(1)
        expect(v).toBeLessThanOrEqual(5)
      }
    }
  })

  it('nota mais baixa pede mais gravidade', () => {
    const [a0] = acoesPossiveis(uniformes([4, 4, 4, 4, 0]))
    const [a3] = acoesPossiveis(uniformes([4, 4, 4, 4, 3]))
    expect(sugerirGUT(a0).g).toBeGreaterThan(sugerirGUT(a3).g)
  })

  it('ordena do maior produto para o menor e desempata pela ordem original', () => {
    const itens = [
      { id: 1, g: 2, u: 2, t: 2 },
      { id: 2, g: 5, u: 4, t: 3 },
      { id: 3, g: 2, u: 2, t: 2 },
    ]
    expect(ordenarPorGUT(itens).map((i) => i.id)).toEqual([2, 1, 3])
  })
})
