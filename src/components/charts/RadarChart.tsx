import { CIANO, LINHA } from '@/lib/theme'

/**
 * Radar dos pilares em SVG puro — portado do protótipo, sem biblioteca de
 * gráfico. Escala fixa 0–4, um eixo por pilar.
 */
export function RadarChart({
  valores,
  rotulos,
  tamanho = 340,
  padding = 52,
  className,
}: {
  valores: number[]
  rotulos?: string[]
  tamanho?: number
  padding?: number
  className?: string
}) {
  const MAX = 4
  const n = valores.length
  if (n < 3) return null

  const cx = tamanho / 2
  const cy = tamanho / 2
  const r = tamanho / 2 - padding
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const ponto = (i: number, raio: number) =>
    [cx + Math.cos(ang(i)) * raio, cy + Math.sin(ang(i)) * raio] as const

  const anel = (k: number) =>
    Array.from({ length: n }, (_, i) => ponto(i, (r * k) / 4).map((v) => v.toFixed(1)).join(','))
      .join(' ')

  const area = Array.from({ length: n }, (_, i) =>
    ponto(i, (r * Math.min(Math.max(valores[i], 0), MAX)) / MAX)
      .map((v) => v.toFixed(1))
      .join(','),
  )

  return (
    <svg
      viewBox={`0 0 ${tamanho} ${tamanho}`}
      className={className}
      style={{ maxWidth: tamanho, width: '100%' }}
      role="img"
      aria-label={`Radar dos pilares: ${
        rotulos?.map((l, i) => `${l} ${valores[i].toFixed(1)}`).join(', ') ?? ''
      }`}
    >
      {/* anéis da escala 1 a 4 */}
      {[1, 2, 3, 4].map((k) => (
        <polygon key={k} points={anel(k)} fill="none" stroke={LINHA} strokeWidth={1} />
      ))}

      {/* eixos e rótulos */}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = ponto(i, r)
        const [lx, ly] = ponto(i, r + 16)
        const cos = Math.cos(ang(i))
        const anchor = Math.abs(cos) < 0.3 ? 'middle' : cos > 0 ? 'start' : 'end'
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={LINHA} strokeWidth={1} />
            {rotulos?.[i] && (
              <text
                x={lx}
                y={ly}
                fontSize={11}
                fontWeight={700}
                fill="#5B6B72"
                textAnchor={anchor}
                dominantBaseline="middle"
              >
                {rotulos[i]}
              </text>
            )}
          </g>
        )
      })}

      {/* área dos valores */}
      <polygon
        points={area.join(' ')}
        fill="rgba(2,185,218,.18)"
        stroke={CIANO}
        strokeWidth={2.5}
      />
      {area.map((p, i) => {
        const [x, y] = p.split(',')
        return <circle key={i} cx={x} cy={y} r={3.5} fill="#0A7C93" />
      })}
    </svg>
  )
}
