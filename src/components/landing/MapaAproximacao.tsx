import { useEffect, useMemo, useRef } from 'react'
import ufs from '@/data/mapa-ufs.json'
import cidade from '@/data/mapa-cidade-demo.json'
import { useReducedMotion } from '@/lib/movimento'
import { CURVAS } from '@/lib/tokensMovimento'
import { pausarEmAndamento } from '@/lib/pausaAnimacoes'
import { bboxDe, calcularZoom, enquadrar, type Vista } from '@/lib/mapaLanding'

export type FaseMapa = 'brasil' | 'estado' | 'municipio'
const ASPECTO = 1540 / 1620
const V0: Vista = [0, 30, 1540, 1620]
const DURACAO = 2200

interface Props {
  className?: string
  onFase?: (fase: FaseMapa) => void
  /** Repete o ciclo Brasil → estado → município. */
  ciclo?: boolean
}

/** Três camadas já desenhadas; só `transform` e `opacity` se movem (GPU). */
export function MapaAproximacao({ className, onFase, ciclo = true }: Props) {
  const reduzido = useReducedMotion()
  const caixa = useRef<HTMLDivElement>(null)
  const refs = useRef<(SVGSVGElement | null)[]>([])
  const fase = useRef(onFase)
  fase.current = onFase

  const { V1, V2 } = useMemo(
    () => ({ V1: enquadrar(bboxDe((ufs as Record<string, string>)[cidade.uf]), ASPECTO), V2: enquadrar(bboxDe(cidade.caminho), ASPECTO) }),
    [],
  )

  useEffect(() => {
    const el = caixa.current
    const [L1, L2, L3] = refs.current
    if (!el || !L1 || !L2 || !L3) return
    const dest2 = L2.querySelector<SVGPathElement>('.uf.dest')
    const todos = [L1, L2, L3, dest2].filter(Boolean) as Element[]
    const id = 'translate(0px,0px) scale(1)'
    const estatico = () => {
      L1.style.cssText = 'opacity:1;transform:none'
      L2.style.cssText = 'opacity:0'
      L3.style.cssText = 'opacity:0'
    }
    if (reduzido || !ciclo || typeof L1.animate !== 'function') { estatico(); return }

    let gen = 0
    let tam = [el.clientWidth, el.clientHeight]
    const cancelar = () => todos.forEach((e) => e.getAnimations?.().forEach((a) => a.cancel()))

    const iniciar = () => {
      cancelar()
      const g = ++gen
      const [W, H] = [el.clientWidth, el.clientHeight]
      const z12 = calcularZoom(V0, V1, W, H)
      const z23 = calcularZoom(V1, V2, W, H)
      const T = (z: typeof z12) => `translate(${z.tx}px,${z.ty}px) scale(${z.s})`
      const Ti = (z: typeof z12) => `translate(${-z.tx / z.s}px,${-z.ty / z.s}px) scale(${1 / z.s})`
      const pos = (s: SVGSVGElement, o: number, t: string) => { s.style.opacity = String(o); s.style.transform = t }
      const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
      const anima = (e: Element, k: Keyframe[], dur = DURACAO) =>
        e.animate(k, { duration: dur, easing: CURVAS.zoom, fill: 'forwards' }).finished
      const vivo = () => g === gen

      ;(async () => {
        try {
          while (vivo()) {
            pos(L1, 1, id); pos(L2, 0, Ti(z12)); pos(L3, 0, Ti(z23))
            fase.current?.('brasil')
            await espera(1600); if (!vivo()) return
            fase.current?.('estado')
            await Promise.all([
              anima(L1, [{ transform: id, opacity: 1 }, { opacity: 1, offset: 0.4 }, { transform: T(z12), opacity: 0 }]),
              anima(L2, [{ transform: Ti(z12), opacity: 0 }, { opacity: 0, offset: 0.3 }, { transform: id, opacity: 1 }]),
            ]); if (!vivo()) return
            fase.current?.('municipio')
            await Promise.all([
              anima(L2, [{ transform: id, opacity: 1 }, { opacity: 0.9, offset: 0.35 }, { transform: T(z23), opacity: 0 }]),
              ...(dest2 ? [anima(dest2, [{ opacity: 1 }, { opacity: 0.3, offset: 0.3 }, { opacity: 0.3 }])] : []),
              anima(L3, [{ transform: Ti(z23), opacity: 0 }, { opacity: 0, offset: 0.2 }, { transform: id, opacity: 1 }]),
            ]); if (!vivo()) return
            await espera(2400); if (!vivo()) return
            await Promise.all([
              anima(L3, [{ opacity: 1 }, { opacity: 0 }], 700),
              anima(L1, [{ transform: id, opacity: 0 }, { transform: id, opacity: 1 }], 700),
            ]); if (!vivo()) return
            cancelar()
          }
        } catch { /* animação cancelada: um novo ciclo assume */ }
      })()
    }

    iniciar()
    const ro = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          const n = [el.clientWidth, el.clientHeight]
          if (n[0] !== tam[0] || n[1] !== tam[1]) { tam = n; iniciar() }
        })
      : null
    ro?.observe(el)
    let retomar: (() => void) | null = null
    const visib = () => {
      if (document.hidden) retomar = pausarEmAndamento(todos.flatMap((e) => e.getAnimations?.() ?? []))
      else { retomar?.(); retomar = null }
    }
    document.addEventListener('visibilitychange', visib)
    return () => {
      gen++
      cancelar()
      ro?.disconnect()
      document.removeEventListener('visibilitychange', visib)
    }
  }, [reduzido, ciclo, V1, V2])

  const estados = Object.entries(ufs as Record<string, string>)
  const camada = (i: number, vista: Vista, conteudo: React.ReactNode) => (
    <svg ref={(e) => { refs.current[i] = e }} viewBox={vista.join(' ')} className="camada" preserveAspectRatio="xMidYMid meet">
      {conteudo}
    </svg>
  )
  const ufsPaths = estados.map(([c, d]) => <path key={c} d={d} className={c === cidade.uf ? 'uf dest' : 'uf'} />)

  return (
    <div
      ref={caixa}
      role="img"
      aria-label={`Mapa do Brasil aproximando de ${cidade.nome}`}
      className={`mapa-aprox ${className ?? ''}`}
    >
      <div aria-hidden="true" className="mapa-aprox__camadas">
        {camada(0, V0, ufsPaths)}
        {camada(1, V1, ufsPaths)}
        {camada(2, V2, <path d={cidade.caminho} className="cidade" style={{ strokeWidth: V2[2] * 0.012 }} />)}
      </div>
    </div>
  )
}
