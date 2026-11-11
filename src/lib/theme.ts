/** Cores semânticas da paleta Cidades MIL usadas em SVG e estilos inline. */
import type { Nota, Prioridade } from '@/lib/calculos'

/** índice = nota (0–4) */
export const NOTE_COLORS: Record<Nota, string> = {
  0: '#E0603E',
  1: '#E0603E',
  2: '#E6A93E',
  3: '#3DB18C',
  4: '#2C8465',
}

export const PRIO_COLORS: Record<Prioridade, string> = {
  Alta: '#E0603E',
  Média: '#E6A93E',
  Baixa: '#3DB18C',
}

/** Cor de cada nível de maturidade (do mais claro ao mais escuro). */
export const NIVEL_COLORS = ['#9CCBEA', '#2395C6', '#0A5A96', '#052F4D'] as const

export const CIANO = '#0A5A96'
export const PETROLEO = '#052F4D'
export const LINHA = '#DFEAF2'

export const fmt = (n: number, casas = 1) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
