/** Pausa só o que está rodando e devolve a função que retoma exatamente essas. Animações já terminadas (fill: forwards) não reiniciam. */
export function pausarEmAndamento(animacoes: Animation[]): () => void {
  const rodando = animacoes.filter((a) => a.playState === 'running')
  rodando.forEach((a) => a.pause())
  return () => rodando.forEach((a) => a.play())
}
