/** Cores semânticas da paleta CIIDCMIL usadas em SVG e estilos inline. */
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

export const CIANO = '#02B9DA'
export const PETROLEO = '#0B3D4A'
export const LINHA = '#E1EEF2'

export const fmt = (n: number, casas = 1) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
