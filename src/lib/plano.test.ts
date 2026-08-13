import { describe, expect, it } from 'vitest'
import { PILARES } from '@/data/metricas'
import type { Nota } from '@/lib/calculos'
import { consolidar, type NotasPorMetrica } from '@/lib/isps'
import { montarPlano } from '@/lib/plano'

function notasUniformes(medias: [number, number, number, number, number]) {
  const notas: NotasPorMetrica = {}
  PILARES.forEach((p, i) => {
    for (const m of p.metricas) notas[m.numero] = medias[i] as Nota
  })
  return notas
}

const plano = (notas: NotasPorMetrica) =>
  montarPlano(consolidar(notas), notas, 'Município de Aurora')

describe('montarPlano', () => {
  it('a Regra de Ouro vira a ação de maior prioridade', () => {
    const p = plano(notasUniformes([1, 4, 4, 4, 4]))
    expect(p.acoes[0].prioridade).toBe('Alta')
    expect(p.acoes[0].titulo).toMatch(/governança participativa/i)
    expect(p.atencao[0]).toMatch(/trava o índice/i)
    expect(p.resumo).toMatch(/Regra de Ouro/)
  })

  it('métricas de nota baixa viram ações concretas com o número da métrica', () => {
    const notas: NotasPorMetrica = { 70: 0, 101: 4 }
    const p = plano(notas)
    const acao = p.acoes.find((a) => a.titulo.includes('métrica 70'))
    expect(acao).toBeDefined()
    expect(acao?.prioridade).toBe('Alta')
    expect(acao?.prazo).toBe('Curto prazo')
  })

  it('cidade forte gera pontos fortes e ação de sustentação, sem alarme falso', () => {
    const p = plano(notasUniformes([4, 4, 4, 4, 4]))
    expect(p.fortes.length).toBeGreaterThan(0)
    expect(p.atencao).toEqual(['Nenhuma métrica em situação crítica entre as respondidas.'])
    expect(p.acoes.every((a) => a.prioridade === 'Baixa')).toBe(true)
  })

  it('não inventa recomendação quando nada foi respondido', () => {
    const p = plano({})
    expect(p.acoes).toHaveLength(0)
    expect(p.fortes[0]).toMatch(/Nenhuma métrica alcançou/)
  })

  it('prioriza pilares de maior peso no desempate entre notas iguais', () => {
    // métrica 101 (Pilar 1, peso 0.35) e 88 (Pilar 5, peso 0.05), ambas nota 1
    const p = plano({ 101: 1, 88: 1 })
    expect(p.acoes[0].titulo).toContain('métrica 101')
  })

  it('limita as ações para o plano continuar acionável', () => {
    const p = plano(notasUniformes([0, 0, 0, 0, 0]))
    expect(p.acoes.length).toBeLessThanOrEqual(6)
  })
})
