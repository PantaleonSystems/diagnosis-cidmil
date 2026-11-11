import { useState } from 'react'
import { NIVEIS, nivelMaturidade } from '@/lib/isps'
import { fmt } from '@/lib/theme'
import { useMediaQuery, useReducedMotion } from '@/lib/movimento'

/** Cores por nível de maturidade (do mais claro ao mais escuro). */
const COR_NIVEL = ['#9CCBEA', '#2395C6', '#0A5A96', '#052F4D']

/** Cidades fictícias de exemplo, só para ilustrar a rede. */
const OUTRAS = [
  { nome: 'Cidade A', isps: 1.3 },
  { nome: 'Cidade B', isps: 1.9 },
  { nome: 'Cidade C', isps: 2.3 },
  { nome: 'Cidade D', isps: 3.6 },
  { nome: 'Cidade E', isps: 2.7 },
  { nome: 'Cidade F', isps: 3.1 },
  { nome: 'Cidade G', isps: 1.6 },
  { nome: 'Cidade H', isps: 3.3 },
  { nome: 'Cidade I', isps: 2.1 },
]

type Pt = [number, number]
const POS_LARGO: Pt[] = [[150, 90], [340, 50], [720, 60], [870, 140], [130, 260], [320, 350], [700, 355], [880, 290], [520, 385]]
const POS_ALTO: Pt[] = [[60, 70], [190, 40], [310, 90], [320, 200], [50, 210], [70, 330], [310, 330], [190, 400], [190, 500]]
const LIGACOES = [[0, 1], [1, 2], [2, 3], [3, 7], [7, 6], [6, 8], [8, 5], [5, 4], [4, 0]]

export function RedeCidades({ isps }: { isps: number }) {
  const alto = useMediaQuery('(max-width: 767px)')
  const movimento = !useReducedMotion()
  const [sel, setSel] = useState<number | null>(null)

  const W = alto ? 360 : 1000
  const H = alto ? 560 : 430
  const centro: Pt = alto ? [180, 255] : [500, 205]
  const pos = alto ? POS_ALTO : POS_LARGO
  const nivelCentro = nivelMaturidade(isps)

  const semelhanca = (v: number) => Math.max(0, 1 - Math.abs(v - isps) / 1.2)
  const raio = (v: number) => 11 + v * 3.2

  const selecionada = sel === null ? null : OUTRAS[sel]

  return (
    <div className="mt-12">
      <div className="mb-6 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[2px] text-ciano-esc">Cidades conectadas</span>
        <h3 className="mb-2 mt-2 text-2xl tracking-[-0.3px] text-petroleo">A nota coloca a cidade na rede</h3>
        <p className="mx-auto max-w-[620px] text-cinza">
          Cidades em estágios parecidos se conectam mais forte. Mude os pilares acima e veja a sua
          cidade se aproximar de outras. <span className="text-cinza-cl">Cidades de exemplo, sem dados reais.</span>
        </p>
      </div>

      <div className="rounded-[18px] border border-linha bg-white p-3 shadow-card sm:p-6">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mx-auto block h-auto w-full"
          style={{ maxWidth: alto ? 420 : 1000 }}
          role="img"
          aria-label={`Rede de dez cidades de exemplo; a sua tem índice ${fmt(isps, 2)}.`}
        >
          {/* ligações entre cidades vizinhas */}
          {LIGACOES.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]} stroke="#DFEAF2" strokeWidth={1.5} />
          ))}

          {/* ligações com a sua cidade: mais forte quanto mais parecidas */}
          {OUTRAS.map((c, i) => {
            const s = semelhanca(c.isps)
            const d = `M${centro[0]},${centro[1]} L${pos[i][0]},${pos[i][1]}`
            const destaque = sel === i
            return (
              <g key={c.nome}>
                <path
                  d={d}
                  stroke="#2395C6"
                  strokeOpacity={destaque ? 0.9 : 0.12 + s * 0.6}
                  strokeWidth={destaque ? 4 : 1 + s * 3}
                  style={{ transition: 'stroke-opacity .4s, stroke-width .4s' }}
                />
                {movimento && s > 0.35 && (
                  <circle r={2 + s * 2.5} fill="#2395C6" opacity={0}>
                    <animateMotion dur={`${3.8 - s * 1.6}s`} begin={`${-i * 0.7}s`} repeatCount="indefinite" path={d} />
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur={`${3.8 - s * 1.6}s`} begin={`${-i * 0.7}s`} repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            )
          })}

          {/* outras cidades */}
          {OUTRAS.map((c, i) => {
            const nivel = nivelMaturidade(c.isps)
            const [x, y] = pos[i]
            const marcado = sel === i
            return (
              <g
                key={c.nome}
                tabIndex={0}
                role="button"
                aria-label={`${c.nome}: índice ${fmt(c.isps, 1)}, ${NIVEIS[nivel]}`}
                aria-pressed={marcado}
                onClick={() => setSel(marcado ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSel(marcado ? null : i)
                  }
                }}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                <circle cx={x} cy={y} r={raio(c.isps) + 6} fill="transparent" />
                <circle cx={x} cy={y} r={raio(c.isps)} fill={COR_NIVEL[nivel]} stroke="#fff" strokeWidth={3} />
                {marcado && <circle cx={x} cy={y} r={raio(c.isps) + 6} fill="none" stroke={COR_NIVEL[nivel]} strokeWidth={2} />}
                {!alto && (
                  <text x={x} y={y + raio(c.isps) + 17} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#5A6B78">
                    {c.nome} · {fmt(c.isps, 1)}
                  </text>
                )}
              </g>
            )
          })}

          {/* a sua cidade */}
          <g>
            <circle cx={centro[0]} cy={centro[1]} r={46} fill={COR_NIVEL[nivelCentro]} fillOpacity={0.18}>
              {movimento && (
                <>
                  <animate attributeName="r" values="40;54;40" dur="3.4s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.22;0.05;0.22" dur="3.4s" repeatCount="indefinite" />
                </>
              )}
            </circle>
            <circle cx={centro[0]} cy={centro[1]} r={38} fill={COR_NIVEL[nivelCentro]} stroke="#fff" strokeWidth={4} style={{ transition: 'fill .4s' }} />
            <text x={centro[0]} y={centro[1] - 3} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#fff" opacity={0.9}>
              Sua cidade
            </text>
            <text x={centro[0]} y={centro[1] + 14} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff">
              {fmt(isps, 2)}
            </text>
          </g>
        </svg>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-cinza">
          {NIVEIS.map((n, i) => (
            <span key={n} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ background: COR_NIVEL[i] }} />
              Nível {i + 1} · {n}
            </span>
          ))}
        </div>
        <p className="mt-3 min-h-[1.5em] text-center text-[13px] text-cinza" aria-live="polite">
          {selecionada
            ? `${selecionada.nome}: índice ${fmt(selecionada.isps, 1)}, nível ${nivelMaturidade(selecionada.isps) + 1} · ${NIVEIS[nivelMaturidade(selecionada.isps)]}. ${
                semelhanca(selecionada.isps) > 0.5
                  ? 'Perto da sua cidade: bom par para comparar e aprender junto.'
                  : 'Mais distante da sua cidade em maturidade.'
              }`
            : 'Toque em uma cidade para ver os detalhes.'}
        </p>
      </div>
    </div>
  )
}
