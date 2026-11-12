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

/** Cor do TEXTO de cada prioridade (sobre o fundo claro da etiqueta): 4,5:1 ou mais. */
export const PRIO_TEXT: Record<Prioridade, string> = {
  Alta: '#9C4423',
  Média: '#8A5A1E',
  Baixa: '#236B52',
}

export const PRIO_COLORS: Record<Prioridade, string> = {
  Alta: '#E0603E',
  Média: '#E6A93E',
  Baixa: '#3DB18C',
}

/** Cor de cada nível de maturidade (do mais claro ao mais escuro). */
export const NIVEL_COLORS = ['#9CCBEA', '#2395C6', '#0A5A96', '#052F4D'] as const

export const MARCA = '#0A5A96'
export const NOITE = '#052F4D'
export const LINHA = '#DFEAF2'

const luminancia = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Cor de texto (branco ou azul-noite) com melhor contraste sobre um fundo. */
export const textoSobre = (fundo: string): string => {
  const l = luminancia(fundo)
  const comBranco = 1.05 / (l + 0.05)
  const comNoite = (l + 0.05) / (luminancia('#052F4D') + 0.05)
  return comBranco >= comNoite ? '#FFFFFF' : '#052F4D'
}

export const fmt = (n: number, casas = 1) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
