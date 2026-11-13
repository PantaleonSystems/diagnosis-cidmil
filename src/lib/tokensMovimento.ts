/** Tempos e curvas de movimento da marca (espelham src/styles/movimento.css). */
export const DURACOES = {
  micro: 40,
  rapida: 80,
  curta: 150,
  media: 250,
  longa: 350,
  lenta: 400,
  enorme: 500,
} as const

export const CURVAS = {
  suave: 'cubic-bezier(.22,1,.36,1)',
  mola: 'cubic-bezier(.34,1.36,.64,1)',
  zoom: 'cubic-bezier(.65,0,.35,1)',
} as const
