import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cidade from '@/data/mapa-cidade-demo.json'
import { useReducedMotion } from '@/lib/movimento'
import { bboxDe } from '@/lib/mapaLanding'
import { FONTES } from './fontes'
import { TRACOS_FONTE } from './iconesFontes'

const CX = 180, CY = 162, RC = 128
const BB = bboxDe(cidade.caminho)
const ESC = 92 / Math.max(BB[2], BB[3])

/** As seis fontes ligam um fio até a cidade e a informação vai e volta por ele: compartilhar. */
export function FontesCompartilham() {
  const reduzido = useReducedMotion()
  const [ligadas, setLigadas] = useState<boolean[]>(() => FONTES.map(() => false))
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const liga = useCallback((i: number) => setLigadas((l) => (l[i] ? l : l.map((v, k) => (k === i ? true : v)))), [])

  useEffect(() => {
    if (reduzido) { setLigadas(FONTES.map(() => true)); return }
    let vivo = true
    const agenda = (fn: () => void, ms: number) => { const t = setTimeout(() => vivo && fn(), ms); timers.current.push(t) }
    const ciclo = () => {
      setLigadas(FONTES.map(() => false))
      FONTES.forEach((_, i) => agenda(() => liga(i), 900 + i * 700))
      agenda(ciclo, 900 + FONTES.length * 700 + 6500)
    }
    ciclo()
    return () => { vivo = false; timers.current.forEach(clearTimeout); timers.current = [] }
  }, [reduzido, liga])

  const completo = ligadas.every(Boolean)
  const geo = useMemo(
    () => FONTES.map((_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 3 + Math.PI / 6
      const x = CX + RC * Math.cos(a), y = CY + RC * Math.sin(a)
      const ox = x - 27 * Math.cos(a), oy = y - 27 * Math.sin(a)
      const dx = CX + 50 * Math.cos(a), dy = CY + 50 * Math.sin(a)
      return { x, y, ida: `M${ox} ${oy} L${dx} ${dy}`, volta: `M${dx} ${dy} L${ox} ${oy}` }
    }),
    [],
  )

  return (
    <svg viewBox="0 0 360 324" className="mx-auto block w-full max-w-[520px] rounded-[26px] border border-linha bg-marca-fundo" role="group" aria-label="As fontes de informação se ligam à cidade e compartilham com ela">
      {geo.map((g, i) => (
        <path key={`f${i}`} d={g.ida} pathLength={1} className="rc-fio" data-on={ligadas[i]} />
      ))}
      <g transform={`translate(${CX - (BB[0] + BB[2] / 2) * ESC} ${CY - (BB[1] + BB[3] / 2) * ESC}) scale(${ESC})`}>
        <path d={cidade.caminho} className="rc-cidade" data-pulso={ligadas.filter(Boolean).length} style={{ strokeWidth: 3 / ESC }} />
      </g>
      <g className="rc-selo" data-completo={completo}>
        <circle cx={CX} cy={CY} r={20} fill="#3db18c" />
        <path d={`M${CX - 9} ${CY + 1} l6 6 l12 -13`} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {!reduzido && geo.map((g, i) => ligadas[i] && (
        <g key={`p${i}`}>
          <circle r={5.5} fill="#2395c6" opacity={0}>
            <animateMotion dur="1.6s" repeatCount="indefinite" path={g.ida} begin="0.7s" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="1.6s" repeatCount="indefinite" begin="0.7s" />
          </circle>
          <circle r={4} fill="#0a5a96" opacity={0}>
            <animateMotion dur="1.9s" repeatCount="indefinite" path={g.volta} begin="1.6s" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="1.9s" repeatCount="indefinite" begin="1.6s" />
          </circle>
        </g>
      ))}
      {FONTES.map((f, i) => (
        <g
          key={f.id}
          role="button"
          tabIndex={0}
          aria-label={f.nome}
          aria-pressed={ligadas[i]}
          className="rc-chip"
          data-on={ligadas[i]}
          transform={`translate(${geo[i].x} ${geo[i].y})`}
          onClick={() => liga(i)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); liga(i) } }}
        >
          <circle r={27} className="rc-chip__bg" />
          <g transform="translate(-13 -13) scale(1.08)" className="rc-chip__ic">{TRACOS_FONTE[f.id]}</g>
        </g>
      ))}
    </svg>
  )
}
