import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { PILARES } from '@/data/metricas'
import { MINIMO_GOVERNANCA, NIVEIS } from '@/lib/isps'
import { fmt } from '@/lib/theme'
import { cx } from '@/components/ui'
import { useAnimado, useMediaQuery, useReducedMotion } from '@/lib/movimento'
import { calcular, nivelConsistencia } from './indice'
import { useScrubCalculo } from './useScrubCalculo'

const CLARO = '#2395C6'
const NOITE = '#052F4D'

const PRESETS = [
  { nome: 'Começando', valores: [0.8, 1.1, 1.0, 1.4, 0.6] },
  { nome: 'Em evolução', valores: [1.9, 2.8, 3.2, 3.5, 2.5] },
  { nome: 'Cidade MIL', valores: [3.6, 3.4, 3.5, 3.7, 3.2] },
]

const FONTES_LARGO = ['Bases públicas', 'Cadastros municipais', 'Pesquisas locais', 'Declaração do avaliador']
const FONTES_ALTO = ['Bases', 'Cadastros', 'Pesquisas', 'Avaliador']

type Pt = [number, number]

/** Partícula que percorre um caminho: representa o dado em movimento. */
function Particula({ d, dur, atraso, r, cor }: { d: string; dur: number; atraso: number; r: number; cor: string }) {
  return (
    <circle r={r} fill={cor} opacity={0}>
      <animateMotion dur={`${dur}s`} begin={`${-atraso}s`} repeatCount="indefinite" path={d} />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.15;0.85;1"
        dur={`${dur}s`}
        begin={`${-atraso}s`}
        repeatCount="indefinite"
      />
    </circle>
  )
}

function Fluxo({ notas, foco, setFoco }: { notas: number[]; foco: number | null; setFoco: (i: number | null) => void }) {
  const alto = useMediaQuery('(max-width: 767px)')
  const movimento = !useReducedMotion()
  const animadas = useAnimado(notas, 600)
  const { isps, nivel, travado } = calcular(notas)
  const ispsAnim = Math.round(PILARES.reduce((s, p, i) => s + animadas[i] * p.peso, 0) * 100) / 100

  const g = alto
    ? { W: 360, H: 640, core: [180, 190] as Pt, coreR: 44, gauge: [180, 512] as Pt, gR: 50 }
    : { W: 1000, H: 360, core: [400, 175] as Pt, coreR: 50, gauge: [895, 175] as Pt, gR: 60 }

  const fontes = alto ? FONTES_ALTO : FONTES_LARGO
  const fontePos = (i: number): Pt => (alto ? [45 + i * 90, 30] : [95, 60 + i * 80])
  const pilarPos = (i: number): Pt => (alto ? [36 + i * 72, 352] : [620, 40 + i * 70])

  const caminhoFonte = (i: number) => {
    const [x, y] = fontePos(i)
    return alto
      ? `M${x},${y + 18} C${x},110 180,100 180,${g.core[1] - g.coreR}`
      : `M${x + 75},${y} C270,${y} 260,${g.core[1]} ${g.core[0] - g.coreR},${g.core[1]}`
  }
  const caminhoPilar = (i: number) => {
    const [x, y] = pilarPos(i)
    return alto
      ? `M180,${g.core[1] + g.coreR} C180,290 ${x},270 ${x},${y - 25}`
      : `M${g.core[0] + g.coreR},${g.core[1]} C520,${g.core[1]} 530,${y} ${x - 25},${y}`
  }
  const caminhoGauge = (i: number) => {
    const [x, y] = pilarPos(i)
    return alto
      ? `M${x},${y + 52} C${x},430 180,420 180,${g.gauge[1] - g.gR - 8}`
      : `M752,${y} C790,${y} 780,${g.gauge[1]} ${g.gauge[0] - g.gR - 10},${g.gauge[1]}`
  }

  const circ = 2 * Math.PI * g.gR
  const frac = Math.min(1, Math.max(0, ispsAnim / 4))

  return (
    <svg
      viewBox={`0 0 ${g.W} ${g.H}`}
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: alto ? 420 : 1000 }}
      role="img"
      aria-label={`Fluxo: quatro fontes de dados entram no cálculo, geram cinco pilares e um índice de ${fmt(isps, 2)} de 4, nível ${nivel + 1}, ${NIVEIS[nivel]}.`}
    >
      {/* fontes -> cálculo */}
      {fontes.map((nome, i) => {
        const d = caminhoFonte(i)
        const [x, y] = fontePos(i)
        return (
          <g key={nome}>
            <path d={d} fill="none" stroke={CLARO} strokeOpacity={0.35} strokeWidth={2} />
            {movimento && (
              <>
                <Particula d={d} dur={3.4} atraso={i * 0.8} r={3.5} cor={CLARO} />
                <Particula d={d} dur={3.4} atraso={i * 0.8 + 1.7} r={3} cor={CLARO} />
              </>
            )}
            <rect
              x={alto ? x - 41 : x - 75}
              y={y - 18}
              width={alto ? 82 : 150}
              height={36}
              rx={10}
              fill="#E6F2FA"
              stroke="#BBD9EE"
            />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={alto ? 10.5 : 12.5} fontWeight={700} fill="#054C7C">
              {nome}
            </text>
          </g>
        )
      })}

      {/* cálculo -> pilares */}
      {PILARES.map((p, i) => {
        const d = caminhoPilar(i)
        const ativo = foco === null || foco === i
        const v = animadas[i]
        return (
          <g key={p.numero}>
            <path d={d} fill="none" stroke={p.cor} strokeOpacity={ativo ? 0.55 : 0.12} strokeWidth={1 + v * 0.6} />
            {movimento && ativo && (
              <>
                <Particula d={d} dur={2.2} atraso={i * 0.45} r={2 + v * 0.7} cor={p.cor} />
                <Particula d={d} dur={2.2} atraso={i * 0.45 + 1.1} r={2 + v * 0.7} cor={p.cor} />
              </>
            )}
          </g>
        )
      })}

      {/* pilares -> índice */}
      {PILARES.map((p, i) => {
        const d = caminhoGauge(i)
        const ativo = foco === null || foco === i
        return (
          <g key={p.numero}>
            <path d={d} fill="none" stroke={p.cor} strokeOpacity={ativo ? 0.45 : 0.1} strokeWidth={1 + p.peso * 5} />
            {movimento && ativo && <Particula d={d} dur={2.6} atraso={i * 0.5} r={2.5 + p.peso * 3} cor={p.cor} />}
          </g>
        )
      })}

      {/* núcleo de cálculo */}
      <g>
        <circle cx={g.core[0]} cy={g.core[1]} r={g.coreR + 14} fill="none" stroke={CLARO} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="4 9">
          {movimento && (
            <animateTransform attributeName="transform" type="rotate" from={`0 ${g.core[0]} ${g.core[1]}`} to={`360 ${g.core[0]} ${g.core[1]}`} dur="24s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx={g.core[0]} cy={g.core[1]} r={g.coreR} fill={NOITE} />
        <text x={g.core[0]} y={g.core[1] - 2} textAnchor="middle" fontSize={alto ? 13 : 15} fontWeight={800} fill="#fff">
          Cálculo
        </text>
        <text x={g.core[0]} y={g.core[1] + 16} textAnchor="middle" fontSize={alto ? 11 : 12.5} fontWeight={700} fill="#8FC3E3">
          MIL
        </text>
      </g>

      {/* pilares */}
      {PILARES.map((p, i) => {
        const [x, y] = pilarPos(i)
        const v = animadas[i]
        const r = 22
        const c = 2 * Math.PI * (r + 5)
        return (
          <g
            key={p.numero}
            tabIndex={0}
            role="img"
            aria-label={`${p.curto}: ${fmt(notas[i], 1)} de 4, peso ${Math.round(p.peso * 100)}%`}
            onMouseEnter={() => setFoco(i)}
            onMouseLeave={() => setFoco(null)}
            onFocus={() => setFoco(i)}
            onBlur={() => setFoco(null)}
            style={{ cursor: 'default', outline: 'none' }}
          >
            <circle cx={x} cy={y} r={r + 5} fill="none" stroke="#DFEAF2" strokeWidth={3} />
            <circle
              cx={x}
              cy={y}
              r={r + 5}
              fill="none"
              stroke={p.cor}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={`${(c * v) / 4} ${c}`}
              transform={`rotate(-90 ${x} ${y})`}
            />
            <circle cx={x} cy={y} r={r} fill={p.cor} />
            <text x={x} y={y + 4.5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">
              {fmt(v, 1)}
            </text>
            <text
              x={alto ? x : x + 36}
              y={alto ? y + 44 : y + 4.5}
              textAnchor={alto ? 'middle' : 'start'}
              fontSize={alto ? 9.5 : 12.5}
              fontWeight={700}
              fill="#5A6B78"
            >
              {p.curto}
            </text>
            {!alto && (
              <text x={x + 36} y={y + 19} fontSize={10.5} fill="#8797A5">
                peso {Math.round(p.peso * 100)}%
              </text>
            )}
          </g>
        )
      })}

      {/* índice */}
      <g>
        <circle cx={g.gauge[0]} cy={g.gauge[1]} r={g.gR} fill="none" stroke="#DFEAF2" strokeWidth={13} strokeLinecap="round" strokeDasharray={`${0.75 * circ} ${circ}`} transform={`rotate(135 ${g.gauge[0]} ${g.gauge[1]})`} />
        <circle
          cx={g.gauge[0]}
          cy={g.gauge[1]}
          r={g.gR}
          fill="none"
          stroke={travado ? '#E6A93E' : CLARO}
          strokeWidth={13}
          strokeLinecap="round"
          strokeDasharray={`${0.75 * circ * frac} ${circ}`}
          transform={`rotate(135 ${g.gauge[0]} ${g.gauge[1]})`}
        />
        <text x={g.gauge[0]} y={g.gauge[1] + 6} textAnchor="middle" fontSize={alto ? 30 : 34} fontWeight={800} fill={NOITE}>
          {fmt(ispsAnim, 2)}
        </text>
        <text x={g.gauge[0]} y={g.gauge[1] + 26} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#8797A5">
          de 4,0
        </text>
        <text x={g.gauge[0]} y={g.gauge[1] + g.gR + 30} textAnchor="middle" fontSize={alto ? 13 : 14.5} fontWeight={800} fill="#054C7C">
          Nível {nivel + 1} · {NIVEIS[nivel]}
        </text>
        {travado && (
          <text x={g.gauge[0]} y={g.gauge[1] + g.gR + 48} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#8A5A1E">
            Regra de Ouro ativa
          </text>
        )}
      </g>
    </svg>
  )
}

export function SimuladorIndice() {
  const [notas, setNotas] = useState<number[]>(PRESETS[1].valores)
  const [foco, setFoco] = useState<number | null>(null)
  const [ajustando, setAjustando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const raiz = useRef<HTMLDivElement>(null)
  useScrubCalculo(raiz, setProgresso)
  const res = useMemo(() => calcular(notas), [notas])
  const conferidas = Math.round(progresso * FONTES_LARGO.length)
  const consistencia = nivelConsistencia(conferidas, FONTES_LARGO.length)
  const SELO = {
    inicial: 'Reunindo os dados',
    parcial: 'Conferindo os dados',
    completa: 'Dados conferidos',
  }[consistencia]

  return (
    <div ref={raiz} className="mx-auto max-w-[1200px] px-[6vw] py-[70px]">
      <span className="block text-center text-[11px] font-bold uppercase tracking-[2px] text-marca-escura">
        Dados em movimento
      </span>
      <h2 className="mx-auto mb-3 mt-2.5 max-w-3xl text-center text-[clamp(26px,4vw,32px)] tracking-[-0.3px] text-noite">
        Do dado à nota, com consistência
      </h2>
      <p className="mx-auto mb-6 max-w-[660px] text-center text-cinza">
        Os dados passam por uma conferência antes de virar nota. Role para ver a conferência
        acontecer; depois ajuste os pilares e veja o índice reagir.{' '}
        <span className="text-cinza-cl">
          Ilustração do fluxo; a coleta automática das fontes está em desenvolvimento.
        </span>
      </p>

      <div className="mb-4 flex justify-center">
        <span
          role="status"
          data-nivel={consistencia}
          className={cx(
            'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-bold transition-colors duration-500',
            consistencia === 'completa' ? 'border-ok-borda bg-ok-bg text-ok-txt' : 'border-linha bg-white text-marca-escura',
          )}
        >
          <span aria-hidden="true">{consistencia === 'completa' ? '✓' : '…'}</span>
          {SELO} · {conferidas} de {FONTES_LARGO.length} fontes
        </span>
      </div>

      <div className="rounded-[18px] border border-linha bg-white p-4 shadow-card sm:p-7">
        <Fluxo notas={notas} foco={foco} setFoco={setFoco} />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-[1.5px] text-cinza-cl">Cenários</span>
          {PRESETS.map((p) => {
            const ativo = p.valores.every((v, i) => v === notas[i])
            return (
              <button
                key={p.nome}
                type="button"
                onClick={() => setNotas(p.valores)}
                className={cx(
                  'min-h-11 rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-bold transition-colors',
                  ativo ? 'border-marca bg-marca text-white' : 'border-linha bg-white text-marca-escura hover:border-marca-clara',
                )}
              >
                {p.nome}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            aria-expanded={ajustando}
            aria-controls="ajuste-pilares"
            onClick={() => setAjustando((a) => !a)}
            className="clique-escolha min-h-11 rounded-full border-[1.5px] border-linha bg-white px-4 py-1.5 text-[13px] font-bold text-marca-escura"
          >
            {ajustando ? 'Fechar ajuste dos pilares' : 'Ajustar os cinco pilares'}
          </button>
        </div>
        <div id="ajuste-pilares" className="clique-detalhe" data-aberto={ajustando ? 'true' : 'false'}>
         <div>
          <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILARES.map((p, i) => (
            <label
              key={p.numero}
              className="block"
              onMouseEnter={() => setFoco(i)}
              onMouseLeave={() => setFoco(null)}
            >
              <span className="flex items-baseline justify-between text-[13px] font-bold text-noite">
                {p.curto}
                <span className="mono text-marca-escura">{fmt(notas[i], 1)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={4}
                step={0.1}
                value={notas[i]}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setNotas((n) => n.map((x, k) => (k === i ? v : x)))
                }}
                aria-label={`Nota do pilar ${p.nome}`}
                className="faixa mt-2 w-full cursor-pointer"
                style={
                  {
                    '--cor': p.cor,
                    '--pct': `${(notas[i] / 4) * 100}%`,
                  } as CSSProperties
                }
              />
              <span className="text-[11px] text-cinza-cl">peso {Math.round(p.peso * 100)}%</span>
            </label>
          ))}
          </div>
         </div>
        </div>

        <p
          className={cx(
            'mt-5 rounded-lg px-4 py-3 text-[13px]',
            res.travado ? 'border border-aviso-borda bg-aviso-bg text-aviso-txt' : 'bg-marca-fundo text-marca-escura',
          )}
        >
          {res.travado ? (
            <>
              <strong>Regra de Ouro:</strong> o índice renderia o Nível {res.nivelReal + 1} (
              {NIVEIS[res.nivelReal]}), mas a Governança está abaixo de {fmt(MINIMO_GOVERNANCA, 1)}. Sem participação
              não há Cidade MIL: suba a Governança para destravar.
            </>
          ) : (
            <>
              O índice é a média dos pilares ponderada pelos pesos. A Governança pesa{' '}
              {Math.round(PILARES[0].peso * 100)}% e, abaixo de {fmt(MINIMO_GOVERNANCA, 1)}, trava a cidade no Nível 2.
            </>
          )}
        </p>
      </div>

    </div>
  )
}
