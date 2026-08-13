import { describe, expect, it } from 'vitest'
import { PILARES } from '@/data/metricas'
import type { Nota } from '@/lib/calculos'
import {
  calcularISPS,
  avaliarPilares,
  consolidar,
  mediaPilar,
  nivelMaturidade,
  type NotasPorMetrica,
} from '@/lib/isps'

/** Atribui a mesma nota a todas as métricas de um pilar. */
function notasUniformes(medias: [number, number, number, number, number]): NotasPorMetrica {
  const notas: NotasPorMetrica = {}
  PILARES.forEach((p, i) => {
    for (const m of p.metricas) notas[m.numero] = medias[i] as Nota
  })
  return notas
}

describe('mediaPilar', () => {
  it('é a média simples das métricas respondidas', () => {
    const p1 = PILARES[0]
    const notas: NotasPorMetrica = {
      [p1.metricas[0].numero]: 4,
      [p1.metricas[1].numero]: 2,
    }
    expect(mediaPilar(p1, notas)).toBe(3)
  })

  it('pilar sem nenhuma resposta vale 0', () => {
    expect(mediaPilar(PILARES[0], {})).toBe(0)
  })
})

describe('calcularISPS', () => {
  it('é a soma ponderada pelos pesos dos pilares', () => {
    // todos os pilares com média 4 → ISPS 4 (os pesos somam 1)
    expect(calcularISPS(avaliarPilares(notasUniformes([4, 4, 4, 4, 4])))).toBe(4)
  })

  it('respeita o peso de cada pilar', () => {
    // só o Pilar 1 (peso 0.35) pontua 4 → 4 * 0.35 = 1.4
    expect(calcularISPS(avaliarPilares(notasUniformes([4, 0, 0, 0, 0])))).toBe(1.4)
  })

  it('reproduz o cenário do protótipo (Aurora)', () => {
    // médias 1.9 / 2.8 / 3.2 / 3.5 / 2.5 → 2.655, arredondado para 2.66
    const avaliados = PILARES.map((pilar, i) => ({
      pilar,
      media: [1.9, 2.8, 3.2, 3.5, 2.5][i],
      respondidas: pilar.metricas.length,
      total: pilar.metricas.length,
    }))
    expect(calcularISPS(avaliados)).toBe(2.66)
  })
})

describe('nivelMaturidade', () => {
  it.each([
    [0, 0],
    [1.5, 0],
    [1.51, 1],
    [2.5, 1],
    [2.51, 2],
    [3.4, 2],
    [3.41, 3],
    [4, 3],
  ])('ISPS %d → nível índice %d', (isps, esperado) => {
    expect(nivelMaturidade(isps)).toBe(esperado)
  })
})

describe('Regra de Ouro', () => {
  it('trava no Nível 2 quando a Governança fica abaixo de 2,0', () => {
    // Pilar 1 com nota 1 e os demais com 4 → ISPS alto, mas governança fraca
    const r = consolidar(notasUniformes([1, 4, 4, 4, 4]))
    expect(r.mediaGovernanca).toBe(1)
    expect(r.nivelReal).toBeGreaterThan(1)
    expect(r.nivelExibido).toBe(1)
    expect(r.travado).toBe(true)
  })

  it('não trava quando a Governança alcança 2,0', () => {
    const r = consolidar(notasUniformes([2, 4, 4, 4, 4]))
    expect(r.travado).toBe(false)
    expect(r.nivelExibido).toBe(r.nivelReal)
  })

  it('mantém o ISPS real visível mesmo travado', () => {
    const r = consolidar(notasUniformes([1, 4, 4, 4, 4]))
    expect(r.isps).toBeCloseTo(1 * 0.35 + 4 * 0.65, 2)
  })

  it('não rebaixa uma cidade que já estaria no Nível 2 ou abaixo', () => {
    const r = consolidar(notasUniformes([1, 1, 1, 1, 1]))
    expect(r.travado).toBe(false)
    expect(r.nivelExibido).toBe(0)
  })

  it('avaliação vazia não dispara a regra (não há dado de governança ainda)', () => {
    const r = consolidar({})
    expect(r.travado).toBe(false)
    expect(r.isps).toBe(0)
  })
})

describe('avaliarPilares', () => {
  it('reporta o progresso de preenchimento por pilar', () => {
    const p1 = PILARES[0]
    const [primeiro] = avaliarPilares({ [p1.metricas[0].numero]: 3 })
    expect(primeiro.respondidas).toBe(1)
    expect(primeiro.total).toBe(p1.metricas.length)
  })
})
