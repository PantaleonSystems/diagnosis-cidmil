import { NIVEIS, type NivelIndice } from '@/lib/isps'
import { useAnimado } from '@/lib/movimento'
import { fmt } from '@/lib/theme'

/**
 * Gauge do índice (0–4) em SVG. O arco e o número animam até o valor;
 * em âmbar quando a Regra de Ouro trava o nível. Informação nunca só em cor:
 * o nível e o aviso aparecem em texto.
 */
export function GaugeIndice({
  isps,
  nivel,
  travado = false,
  tamanho = 240,
  className,
}: {
  isps: number
  nivel: NivelIndice
  travado?: boolean
  tamanho?: number
  className?: string
}) {
  const [v] = useAnimado([isps], 900)
  const r = 78
  const circ = 2 * Math.PI * r
  const frac = Math.min(1, Math.max(0, v / 4))
  const cor = travado ? '#E6A93E' : '#0A5A96'

  return (
    <svg
      viewBox="0 0 200 190"
      className={className}
      style={{ width: tamanho, maxWidth: '100%' }}
      role="img"
      aria-label={`Índice ${fmt(isps, 2)} de 4. Nível ${nivel + 1}, ${NIVEIS[nivel]}${travado ? '. Nível travado pela Regra de Ouro' : ''}.`}
    >
      <g transform="rotate(135 100 100)" fill="none" strokeWidth={14} strokeLinecap="round">
        <circle cx="100" cy="100" r={r} stroke="#DFEAF2" strokeDasharray={`${0.75 * circ} ${circ}`} />
        <circle cx="100" cy="100" r={r} stroke={cor} strokeDasharray={`${0.75 * circ * frac} ${circ}`} />
      </g>
      <text x="100" y="108" textAnchor="middle" fontSize="46" fontWeight="800" fill="#052F4D" style={{ letterSpacing: '-0.03em' }}>
        {fmt(v, 2)}
      </text>
      <text x="100" y="128" textAnchor="middle" fontSize="12" fontWeight="700" fill="#8797A5">
        de 4,0
      </text>
      <text x="100" y="178" textAnchor="middle" fontSize="14" fontWeight="800" fill="#054C7C">
        Nível {nivel + 1} · {NIVEIS[nivel]}
      </text>
    </svg>
  )
}
