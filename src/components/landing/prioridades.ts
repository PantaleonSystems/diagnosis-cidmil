export interface Prioridade {
  id: string
  titulo: string
  frente: string
  /** 1 baixa · 2 média · 3 alta */
  urgencia: 1 | 2 | 3
  /** 1 simples · 2 moderada · 3 complexa */
  complexidade: 1 | 2 | 3
  prazo: string
}
export type Criterio = 'urgencia' | 'facil'

/** Exemplo ilustrativo de um plano para a cidade. */
export const PRIORIDADES: Prioridade[] = [
  { id: 'escuta', titulo: 'Abrir um canal de escuta com a população', frente: 'Engajamento', urgencia: 3, complexidade: 2, prazo: '60 dias' },
  { id: 'capacitar', titulo: 'Capacitar as equipes em letramento MIL', frente: 'Comunicação', urgencia: 2, complexidade: 1, prazo: '30 dias' },
  { id: 'plano', titulo: 'Criar um plano anual de monitoramento', frente: 'Planejamento', urgencia: 2, complexidade: 3, prazo: '90 dias' },
  { id: 'dados', titulo: 'Publicar os dados de saúde em formato aberto', frente: 'Governança', urgencia: 1, complexidade: 3, prazo: '120 dias' },
]

export function ordenar(itens: Prioridade[], criterio: Criterio): Prioridade[] {
  const [a, b] = criterio === 'urgencia' ? (['urgencia', 'complexidade'] as const) : (['complexidade', 'urgencia'] as const)
  return [...itens].sort((x, y) => (criterio === 'urgencia' ? y[a] - x[a] || x[b] - y[b] : x[a] - y[a] || y[b] - x[b]))
}

export function rotulo(tipo: 'urgencia' | 'complexidade', nivel: number): string {
  const nomes = tipo === 'urgencia' ? ['baixa', 'média', 'alta'] : ['simples', 'moderada', 'complexa']
  return nomes[nivel - 1]
}

/** O porquê da posição, em uma frase. */
export function motivo(p: Prioridade, criterio: Criterio, posicao: number): string {
  const u = rotulo('urgencia', p.urgencia), c = rotulo('complexidade', p.complexidade)
  if (criterio === 'urgencia') {
    return posicao === 0
      ? `Primeiro porque a urgência é ${u}: é o que mais pesa agora.`
      : `Urgência ${u} e complexidade ${c}: vem depois do que pesa mais.`
  }
  return posicao === 0
    ? `Primeiro porque é ${c} de fazer e já dá resultado em ${p.prazo}.`
    : `${c[0].toUpperCase()}${c.slice(1)}, leva ${p.prazo}: vem depois do que é mais simples.`
}
