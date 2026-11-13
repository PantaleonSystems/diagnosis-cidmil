export interface Prioridade { id: string; titulo: string; urgencia: number; rapidez: number }
export type Criterio = 'urgencia' | 'rapidez'

/** Exemplo ilustrativo (3 = mais urgente / mais rápido de fazer). */
export const PRIORIDADES: Prioridade[] = [
  { id: 'escuta', titulo: 'Abrir um canal de escuta com a população', urgencia: 3, rapidez: 1 },
  { id: 'capacitar', titulo: 'Capacitar as equipes em letramento MIL', urgencia: 2, rapidez: 3 },
  { id: 'dados', titulo: 'Publicar os dados de saúde em formato aberto', urgencia: 1, rapidez: 2 },
]

export function ordenar(itens: Prioridade[], criterio: Criterio): Prioridade[] {
  return [...itens].sort((a, b) => b[criterio] - a[criterio])
}
