/**
 * Cálculo cego — o avaliador nunca digita a nota.
 *
 * Toda derivação de nota 0–4 vive aqui. Nenhuma tela pode recalcular por
 * conta própria: é isso que torna o diagnóstico auditável e comparável
 * entre cidades.
 */
import type { Faixa, Metrica } from '@/data/metricas'

export type Nota = 0 | 1 | 2 | 3 | 4

/** Números informados pelo avaliador, por id de campo. */
export type DadosBrutos = Record<string, number>

/** Percentual 0–100 → nota. Limites conforme §9 do ARCHITECTURE. */
export function notaPercent(p: number): Nota {
  if (p <= 0) return 0
  if (p <= 25) return 1
  if (p <= 50) return 2
  if (p <= 75) return 3
  return 4
}

/** Densidade (unidades por 10 mil hab.) → nota. */
export function notaDens(d: number): Nota {
  if (d < 0.5) return 0
  if (d < 1) return 1
  if (d < 2) return 2
  if (d < 4) return 3
  return 4
}

/** Contagem absoluta → nota, pela primeira faixa que comporta o valor. */
export function notaFaixa(v: number, faixas: Faixa[]): Nota {
  for (const [limite, nota] of faixas) {
    if (v <= limite) return nota as Nota
  }
  return 4
}

const num = (dados: DadosBrutos, id: string) => {
  const v = dados[id]
  return Number.isFinite(v) ? v : 0
}

/** Percentual bruto de uma métrica do tipo `percentual` (0–100). */
export function percentualDe(metrica: Metrica, dados: DadosBrutos): number {
  if (metrica.tipo !== 'percentual') return 0
  const total = num(dados, metrica.campos[0].id)
  const parte = num(dados, metrica.campos[1].id)
  if (total <= 0) return 0
  return (parte / total) * 100
}

/** Densidade bruta de uma métrica do tipo `densidade`. */
export function densidadeDe(metrica: Metrica, dados: DadosBrutos): number {
  if (metrica.tipo !== 'densidade') return 0
  const base = num(dados, metrica.campos[0].id)
  const qtd = num(dados, metrica.campos[1].id)
  if (base <= 0) return 0
  return (qtd / base) * metrica.por
}

/**
 * Nota derivada de uma métrica calculada.
 *
 * Métricas do tipo `regua` não passam por aqui: a nota é o próprio nível
 * escolhido pelo avaliador (0–4), com o critério de cada nível à vista.
 */
export function calcularNota(metrica: Metrica, dados: DadosBrutos): Nota {
  switch (metrica.tipo) {
    case 'percentual':
      return notaPercent(percentualDe(metrica, dados))
    case 'densidade':
      return notaDens(densidadeDe(metrica, dados))
    case 'faixa':
      return notaFaixa(num(dados, metrica.campos[0].id), metrica.faixas)
    case 'regua':
      throw new Error(
        `Métrica ${metrica.numero} é do tipo régua — a nota vem do nível escolhido, não de cálculo.`,
      )
  }
}

/** Texto do cálculo mostrado ao lado da nota, para o avaliador conferir. */
export function memoriaDeCalculo(metrica: Metrica, dados: DadosBrutos): string {
  switch (metrica.tipo) {
    case 'percentual': {
      const total = num(dados, metrica.campos[0].id)
      const parte = num(dados, metrica.campos[1].id)
      return `${parte} de ${total} = ${percentualDe(metrica, dados).toFixed(0)}%`
    }
    case 'densidade':
      return `${densidadeDe(metrica, dados).toFixed(1)} por ${metrica.por.toLocaleString('pt-BR')} hab.`
    case 'faixa':
      return `${num(dados, metrica.campos[0].id)} → faixa objetiva`
    case 'regua':
      return ''
  }
}

/** true quando todos os campos numéricos necessários foram informados. */
export function estaPreenchida(metrica: Metrica, dados: DadosBrutos): boolean {
  if (metrica.tipo === 'regua') return false // régua se resolve pela seleção
  return metrica.campos.every((c) => Number.isFinite(dados[c.id]))
}

const MATURIDADE = [
  'Crítico',
  'Inicial',
  'Em desenvolvimento',
  'Consolidado',
  'Referência',
] as const

export function maturidade(nota: Nota): string {
  return MATURIDADE[nota]
}

export type Prioridade = 'Alta' | 'Média' | 'Baixa'

/** Nota baixa = prioridade alta de intervenção. */
export function prioridade(nota: Nota): Prioridade {
  if (nota <= 1) return 'Alta'
  if (nota === 2) return 'Média'
  return 'Baixa'
}
