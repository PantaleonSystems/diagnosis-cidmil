/** Próximo índice, circular nos dois sentidos. */
export function proximoIndice(atual: number, total: number, delta: number): number {
  if (total <= 0) return 0
  return (((atual + delta) % total) + total) % total
}
