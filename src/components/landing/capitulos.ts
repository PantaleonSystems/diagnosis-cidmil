import { useEffect, useState } from 'react'

export const CAPITULOS = [
  { id: 'cidade', rotulo: 'O momento' },
  { id: 'demonstracao', rotulo: 'A demonstração' },
  { id: 'dados', rotulo: 'Os dados' },
  { id: 'calculo', rotulo: 'O cálculo' },
  { id: 'frentes', rotulo: 'As frentes' },
  { id: 'decisao', rotulo: 'A decisão' },
] as const

export type IdCapitulo = (typeof CAPITULOS)[number]['id']

/** Capítulo com maior parte visível; empate fica com o primeiro da história. */
export function escolherCapituloAtivo(visiveis: Partial<Record<string, number>>): IdCapitulo | null {
  let melhor: IdCapitulo | null = null
  let maior = 0
  for (const c of CAPITULOS) {
    const r = visiveis[c.id] ?? 0
    if (r > maior) { maior = r; melhor = c.id }
  }
  return melhor
}

/** Acompanha qual capítulo está na tela, para os marcadores da nav. */
export function useCapituloAtivo(): IdCapitulo | null {
  const [ativo, setAtivo] = useState<IdCapitulo | null>(null)
  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return
    const razoes: Record<string, number> = {}
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) razoes[e.target.id] = e.intersectionRatio
        setAtivo(escolherCapituloAtivo(razoes))
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] },
    )
    CAPITULOS.forEach((c) => { const el = document.getElementById(c.id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return ativo
}
