import { useEffect, useState, type ReactNode } from 'react'
import { useReducedMotion } from '@/lib/movimento'
import { Carrossel } from './Carrossel'

const Moldura = ({ rotulo, children }: { rotulo: string; children: ReactNode }) => (
  <div className="relative mx-auto aspect-[1/.9] w-full max-w-[520px] overflow-hidden rounded-[26px] border border-linha bg-marca-fundo">
    <svg viewBox="0 0 360 324" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">{children}</svg>
    <p className="rc-rotulo absolute inset-x-0 bottom-4 text-center text-[clamp(20px,4vw,26px)] font-extrabold tracking-[-0.02em] text-noite">{rotulo}</p>
  </div>
)

/* 1 · A avaliação gera projetos */
function Avaliacao() {
  const destinos: [number, number, string, string][] = [
    [290, 92, '#e0603e', 'M6 21V4M6 5h11l-2.5 3.5L17 12H6'],
    [310, 162, '#e6a93e', 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'],
    [286, 232, '#3db18c', 'M5 5v14M5 6h6l1 2h7v8h-7l-1-2H5'],
  ]
  return (
    <Moldura rotulo="Avaliação">
      <rect x={24} y={70} width={104} height={134} rx={14} fill="#fff" stroke="#0a5a96" strokeWidth={3} />
      <rect x={56} y={60} width={40} height={20} rx={7} fill="#0a5a96" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M42 ${104 + i * 32} l7 7 l13 -14`} pathLength={1} className="rc-tick" style={{ animationDelay: `${0.2 + i * 0.25}s` }} />
          <rect x={72} y={101 + i * 32} width={42} height={7} rx={3.5} fill="#cfe1ee" />
        </g>
      ))}
      {destinos.map(([x, y, c, ic], i) => (
        <g key={i}>
          <path d={`M128 138 C190 138 ${x - 60} ${y} ${x - 30} ${y}`} className="rc-trilha" style={{ animationDelay: `${0.9 + i * 0.3}s` }} />
          <g className="rc-proj" style={{ ['--dx' as string]: `${128 - x}px`, ['--dy' as string]: `${138 - y}px`, animationDelay: `${1.1 + i * 0.35}s` }}>
            <circle cx={x} cy={y} r={28} fill="#fff" stroke={c} strokeWidth={3} />
            <g transform={`translate(${x - 13} ${y - 13}) scale(1.08)`} fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={ic} /></g>
          </g>
        </g>
      ))}
    </Moldura>
  )
}

/* 2 · Pessoas no centro, tecnologia em volta, ética no anel */
const TECNOLOGIAS: ReactNode[] = [
  <g key="chip"><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" /></g>,
  <path key="nuvem" d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1 .5 9.5z" />,
  <path key="sinal" d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0M12 19h.01" />,
  <g key="banco"><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></g>,
  <path key="ia" d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  <g key="rede"><circle cx="12" cy="12" r="2.5" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="12" cy="20" r="2" /><path d="m6.5 7.5 3.5 3M17.5 7.5l-3.5 3M12 14.5V18" /></g>,
]

function Pessoas() {
  const C: [number, number] = [180, 150]
  const meta = (() => {
    const p = (t: number) => [C[0] + 118 * Math.cos((t * Math.PI) / 180), C[1] + 118 * Math.sin((t * Math.PI) / 180)]
    const [x0, y0] = p(-90), [x1, y1] = p(200)
    return `M${x0} ${y0}A118 118 0 1 1 ${x1} ${y1}`
  })()
  const pessoa = (x: number, y: number, k: number, c: string) => (
    <g key={x}>
      <circle cx={x} cy={y - 12 * k} r={8 * k} fill={c} />
      <path d={`M${x - 15 * k} ${y + 18 * k} a${15 * k} ${16 * k} 0 0 1 ${30 * k} 0z`} fill={c} />
    </g>
  )
  return (
    <Moldura rotulo="Pessoas no centro">
      <circle cx={C[0]} cy={C[1]} r={118} fill="none" stroke="#cfe1ee" strokeWidth={3} />
      <path d={meta} pathLength={1} className="rc-meta" />
      <circle cx={C[0]} cy={C[1]} r={84} fill="none" stroke="#cfe1ee" strokeWidth={2} strokeDasharray="3 7" />
      <g className="rc-orbita">
        {TECNOLOGIAS.map((ic, i) => {
          const a = -Math.PI / 2 + (i * Math.PI) / 3
          const x = C[0] + 84 * Math.cos(a), y = C[1] + 84 * Math.sin(a)
          return (
            <g key={i}>
              <path d={`M${x - 20 * Math.cos(a)} ${y - 20 * Math.sin(a)} L${C[0] + 54 * Math.cos(a)} ${C[1] + 54 * Math.sin(a)}`} className="rc-raio" style={{ animationDelay: `${i * 0.35}s` }} />
              <g transform={`translate(${x} ${y})`}>
                <g className="rc-tec rc-contra">
                  <circle r={20} fill="#fff" stroke="#0a5a96" strokeWidth={2} />
                  <g transform="translate(-10 -10) scale(.84)" fill="none" stroke="#0a5a96" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{ic}</g>
                </g>
              </g>
            </g>
          )
        })}
      </g>
      <circle cx={C[0]} cy={C[1] + 6} r={50} fill="#fff" />
      {pessoa(C[0] - 26, C[1] + 10, 0.8, '#2395c6')}{pessoa(C[0] + 26, C[1] + 10, 0.8, '#2395c6')}{pessoa(C[0], C[1] + 6, 1.05, '#0a5a96')}
      <path d={`M${C[0]} ${C[1] - 32} c-9 -7 -9 -15 -4 -16 c2 0 3 1 4 3 c1 -2 2 -3 4 -3 c5 1 5 9 -4 16z`} fill="#e0603e" className="rc-batida" />
      <g className="rc-etica">
        <circle cx={C[0]} cy={32} r={22} fill="#fff" stroke="#0a5a96" strokeWidth={2.5} />
        <g transform={`translate(${C[0] - 13} ${32 - 13}) scale(1.08)`}>
          <g className="rc-bal" fill="none" stroke="#0a5a96" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16M8 20h8M5 8h14M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z" />
          </g>
        </g>
      </g>
    </Moldura>
  )
}

/* 3 · Atividades que trocam de lugar */
const TAREFAS: [string, number][] = [['#e0603e', 3], ['#e6a93e', 2], ['#3db18c', 1]]

function Atividades({ ativa }: { ativa: boolean }) {
  const reduzido = useReducedMotion()
  const [ordem, setOrdem] = useState([0, 1, 2])
  useEffect(() => {
    if (!ativa || reduzido) { setOrdem([0, 1, 2]); return }
    const t = setInterval(() => setOrdem(([a, b, c]) => [b, c, a]), 1500)
    return () => clearInterval(t)
  }, [ativa, reduzido])
  return (
    <Moldura rotulo="Atividades">
      {TAREFAS.map(([cor, n], i) => {
        const pos = ordem.indexOf(i)
        return (
          <g key={i} className="rc-tarefa" style={{ transform: `translateY(${pos * 62}px)` }}>
            <rect x={46} y={56} width={268} height={50} rx={14} fill="#fff" stroke="#dfeaf2" />
            <rect x={46} y={56} width={8} height={50} rx={4} fill={cor} />
            <circle cx={84} cy={81} r={15} fill="#052f4d" />
            <text x={84} y={87} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff">{pos + 1}</text>
            {[0, 1, 2].map((k) => <rect key={k} x={116 + k * 30} y={76} width={24} height={10} rx={5} fill={k < n ? cor : '#e3edf4'} />)}
          </g>
        )
      })}
    </Moldura>
  )
}

/** O que a cidade recebe, em três cenas que giram: avaliação, pessoas no centro e atividades. */
export function RecebeCena() {
  const [atual, setAtual] = useState(0)
  return (
    <Carrossel
      rotulo="O que a cidade recebe"
      autoavancoMs={6200}
      onMudar={setAtual}
      itens={[<Avaliacao key="a" />, <Pessoas key="p" />, <Atividades key="t" ativa={atual === 2} />]}
    />
  )
}
