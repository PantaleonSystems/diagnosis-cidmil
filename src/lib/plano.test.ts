import { describe, expect, it } from 'vitest'
import { PILARES } from '@/data/metricas'
import type { DadosBrutos, Nota } from '@/lib/calculos'
import { consolidar, type NotasPorMetrica } from '@/lib/isps'
import { alavancagem, montarPlano, type RespostasPlano } from '@/lib/plano'

/** Mesma nota em todas as métricas de cada pilar. */
function uniformes(medias: [number, number, number, number, number]): RespostasPlano {
  const r: RespostasPlano = {}
  PILARES.forEach((p, i) => {
    for (const m of p.metricas)
      r[m.numero] = { nota: medias[i] as Nota, dadosBrutos: {} }
  })
  return r
}

const notasDe = (r: RespostasPlano): NotasPorMetrica =>
  Object.fromEntries(Object.entries(r).map(([k, v]) => [Number(k), v.nota]))

const plano = (r: RespostasPlano, nome = 'Município Exemplo') =>
  montarPlano(consolidar(notasDe(r)), r, nome)

describe('alavancagem', () => {
  it('é o peso do pilar dividido pelo número de métricas', () => {
    const p1 = PILARES[0] // 35% em 12 métricas
    expect(alavancagem(p1)).toBeCloseTo(0.35 / 12, 6)
  })

  it('revela que o peso do pilar sozinho engana', () => {
    // P1 pesa 35% e P3 pesa 20%, mas o impacto por métrica é quase igual
    const porMetrica = PILARES.map(alavancagem)
    expect(porMetrica[0]).toBeCloseTo(porMetrica[2], 2)
    // já o P4 vale menos da metade, apesar de pesar 15% contra os 5% do P5
    expect(porMetrica[3]).toBeLessThan(porMetrica[0] / 2)
  })
})

describe('próximo passo — régua', () => {
  it('usa o texto do nível seguinte como instrução', () => {
    const r: RespostasPlano = { 75: { nota: 2, dadosBrutos: {} } }
    const acao = plano(r).acoes.find((a) => a.metrica?.numero === 75)
    expect(acao?.situacaoAtual).toContain('Plano atualizado, com fluxos, mas sem simulações')
    expect(acao?.proximoPasso).toContain('Plano detalhado por cenário, com recursos e testes')
  })

  it('não propõe passo para quem já está no topo', () => {
    const r: RespostasPlano = { 75: { nota: 4, dadosBrutos: {} } }
    expect(plano(r).acoes.find((a) => a.metrica?.numero === 75)).toBeUndefined()
  })
})

describe('próximo passo — métricas de cálculo', () => {
  it('calcula quantas unidades faltam para subir de nota', () => {
    // M70: 120 de 500 = 24% (nota 1). Passar de 25% exige 126.
    const dados: DadosBrutos = { prof_total: 500, prof_mil: 120 }
    const r: RespostasPlano = { 70: { nota: 1, dadosBrutos: dados } }
    const acao = plano(r).acoes.find((a) => a.metrica?.numero === 70)
    expect(acao?.proximoPasso).toContain('de 120 para 126')
    expect(acao?.proximoPasso).toContain('mais 6')
    expect(acao?.proximoPasso).toContain('nota 2')
  })

  it('mostra o percentual atual na situação', () => {
    const r: RespostasPlano = {
      70: { nota: 1, dadosBrutos: { prof_total: 500, prof_mil: 120 } },
    }
    const acao = plano(r).acoes.find((a) => a.metrica?.numero === 70)
    expect(acao?.situacaoAtual).toContain('120 de 500')
    expect(acao?.situacaoAtual).toContain('24%')
  })

  it('resolve faixas pelo limite da faixa atual', () => {
    // M68 startups: faixa 4–10 é nota 2; passar exige 11.
    const r: RespostasPlano = { 68: { nota: 2, dadosBrutos: { startups: 8 } } }
    const acao = plano(r).acoes.find((a) => a.metrica?.numero === 68)
    expect(acao?.proximoPasso).toContain('para 11')
  })

  it('resolve densidade convertendo a meta em unidades', () => {
    // M65: 30 espaços / 120 mil = 2,5 por 10 mil (nota 3). Nota 4 exige 4/10 mil = 48.
    const r: RespostasPlano = {
      65: { nota: 3, dadosBrutos: { populacao: 120000, espacos: 30 } },
    }
    const acao = plano(r).acoes.find((a) => a.metrica?.numero === 65)
    expect(acao?.proximoPasso).toContain('para 48')
  })
})

describe('Regra de Ouro', () => {
  it('vira a primeira ação e informa quantos pontos faltam', () => {
    const r = uniformes([1, 4, 4, 4, 4])
    const p = plano(r)
    expect(p.acoes[0].titulo).toMatch(/Destravar o N[íi]vel/)
    expect(p.deficitGovernanca).toBeGreaterThan(0)
    expect(p.acoes[0].ganho).toMatch(/maior alavancagem/i)
  })

  it('calcula o déficit exato: 12 métricas em 1,92 precisam de 1 ponto', () => {
    const r = uniformes([2, 3, 3, 3, 3])
    // baixa uma única métrica do P1 para 1 → soma 23, média 1,9167
    r[PILARES[0].metricas[0].numero] = { nota: 1, dadosBrutos: {} }
    const p = plano(r)
    expect(p.deficitGovernanca).toBe(1)
    expect(p.resumo).toContain('Falta 1 ponto') // singular, não "Faltam 1"
  })

  /** Quantas ações de métrica cada pilar recebeu. */
  const contarPorPilar = (r: RespostasPlano) => {
    const contagem = new Map<number, number>()
    for (const a of plano(r).acoes) {
      if (!a.metrica) continue
      const pilar = PILARES.find((p) =>
        p.metricas.some((m) => m.numero === a.metrica!.numero),
      )!
      contagem.set(pilar.numero, (contagem.get(pilar.numero) ?? 0) + 1)
    }
    return contagem
  }

  it('limita as ações de um mesmo pilar mesmo com o P1 inteiro travado', () => {
    // aqui só o P1 tem margem (os demais estão em 4) — um pilar só é correto,
    // mas o plano não pode despejar as 12 métricas dele
    const contagem = contarPorPilar(uniformes([1, 4, 4, 4, 4]))
    for (const [, qtd] of contagem) expect(qtd).toBeLessThanOrEqual(3)
  })

  it('cobre mais de uma frente quando há margem em vários pilares', () => {
    // cidade uniformemente fraca: P1 (0,0292) e P3 (0,0286) empatam tecnicamente
    // em alavancagem, e sem teto por pilar o plano sairia todo do P1
    const contagem = contarPorPilar(uniformes([1, 1, 1, 1, 1]))
    expect(contagem.size).toBeGreaterThan(1)
    for (const [, qtd] of contagem) expect(qtd).toBeLessThanOrEqual(3)
  })

  it('usa vírgula decimal, não ponto', () => {
    const p = plano(uniformes([1, 4, 4, 4, 4]))
    expect(p.resumo).toMatch(/\d,\d/)
    expect(p.acoes[0].situacaoAtual).not.toMatch(/\d\.\d/)
  })

  it('métricas do Pilar 1 sobem na ordem por destravarem nível', () => {
    const r = uniformes([1, 4, 4, 4, 4])
    const acoesDeMetrica = plano(r).acoes.filter((a) => a.metrica)
    expect(acoesDeMetrica[0].metrica && PILARES[0].metricas).toBeTruthy()
    expect(
      PILARES[0].metricas.some((m) => m.numero === acoesDeMetrica[0].metrica!.numero),
    ).toBe(true)
    expect(acoesDeMetrica[0].ganho).toMatch(/destravar/i)
  })

  it('não trava nem reporta déficit quando a governança alcança 2,0', () => {
    const p = plano(uniformes([2, 4, 4, 4, 4]))
    expect(p.deficitGovernanca).toBe(0)
    expect(p.acoes[0].titulo).not.toMatch(/Destravar/)
  })
})

describe('ordenação por alavancagem', () => {
  it('prefere a métrica de maior impacto por ponto quando as notas empatam', () => {
    // M63 (P3, 0,0286/ponto) contra M88 (P5, 0,0125/ponto), ambas nota 2
    const r: RespostasPlano = {
      88: { nota: 2, dadosBrutos: {} },
      63: { nota: 2, dadosBrutos: { instituicoes_total: 10, instituicoes_campanhas: 4 } },
    }
    const acoes = plano(r).acoes.filter((a) => a.metrica)
    expect(acoes[0].metrica?.numero).toBe(63)
  })
})

describe('plano geral', () => {
  it('cidade forte não gera alarme falso', () => {
    const p = plano(uniformes([4, 4, 4, 4, 4]))
    expect(p.atencao).toEqual([
      'Nenhuma métrica em situação crítica entre as respondidas.',
    ])
    expect(p.acoes.every((a) => a.prioridade === 'Baixa')).toBe(true)
  })

  it('não inventa recomendação sem dados', () => {
    const p = plano({})
    expect(p.acoes).toHaveLength(0)
    expect(p.fortes[0]).toMatch(/Nenhuma métrica alcançou/)
  })

  it('toda ação de métrica traz situação, próximo passo e ganho', () => {
    for (const a of plano(uniformes([1, 2, 2, 2, 2])).acoes) {
      expect(a.situacaoAtual.length).toBeGreaterThan(0)
      expect(a.proximoPasso.length).toBeGreaterThan(0)
      expect(a.ganho.length).toBeGreaterThan(0)
    }
  })
})
