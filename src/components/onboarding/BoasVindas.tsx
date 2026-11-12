import { useState, type ReactNode } from 'react'
import { Folha } from '@/components/mobile/Folha'
import { Button, cx } from '@/components/ui'
import { useReducedMotion } from '@/lib/movimento'

const CHAVE = 'cidadesmil:boas-vindas-vistas'

/** true na primeira visita neste aparelho. */
export function primeiraVisita(): boolean {
  try {
    return localStorage.getItem(CHAVE) === null
  } catch {
    return false
  }
}

function marcarVista() {
  try {
    localStorage.setItem(CHAVE, '1')
  } catch {
    // sem armazenamento: só vai reaparecer na próxima visita
  }
}

/* ---------------------------------------------------------------- cenas -- */

function Cena({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 300 150" className="mx-auto block h-auto w-full max-w-[340px]" aria-hidden>
      {children}
    </svg>
  )
}

/** 1 · escolher a cidade numa lista */
function CenaEscolher({ anima }: { anima: boolean }) {
  return (
    <Cena>
      <rect x="40" y="14" width="220" height="30" rx="8" fill="#fff" stroke="#DFEAF2" />
      <circle cx="58" cy="29" r="6" fill="none" stroke="#617487" strokeWidth="2" />
      <path d="M63 34l4 4" stroke="#617487" strokeWidth="2" strokeLinecap="round" />
      <rect x="76" y="25" width="70" height="8" rx="4" fill="#DFEAF2" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="40" y={54 + i * 30} width="220" height="24" rx="8" fill={i === 1 ? '#E6F2FA' : '#fff'} stroke={i === 1 ? '#2395C6' : '#DFEAF2'} strokeWidth={i === 1 ? 2 : 1} />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={i} x="54" y={62 + i * 30} width={90 - i * 14} height="8" rx="4" fill={i === 1 ? '#0A5A96' : '#DFEAF2'} />
      ))}
      <g opacity={anima ? 0 : 1}>
        <circle cx="240" cy="96" r="9" fill="#0A5A96" />
        <path d="M235 96l3.5 3.5L245 92" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {anima && <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.35;0.5;1" dur="3s" repeatCount="indefinite" />}
      </g>
    </Cena>
  )
}

/** 2 · os dados chegam e são organizados */
function CenaDados({ anima }: { anima: boolean }) {
  const ys = [24, 56, 94, 126]
  return (
    <Cena>
      {ys.map((y, i) => {
        const d = `M48,${y} C110,${y} 110,75 160,75`
        return (
          <g key={y}>
            <path d={d} fill="none" stroke="#2395C6" strokeOpacity="0.4" strokeWidth="2" />
            <rect x="22" y={y - 9} width="26" height="18" rx="5" fill="#E6F2FA" stroke="#BBD9EE" />
            {anima && (
              <circle r="3.5" fill="#2395C6">
                <animateMotion dur="2.6s" begin={`${-i * 0.6}s`} repeatCount="indefinite" path={d} />
              </circle>
            )}
          </g>
        )
      })}
      <circle cx="176" cy="75" r="30" fill="#052F4D" />
      <text x="176" y="73" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">Cálculo</text>
      <text x="176" y="87" textAnchor="middle" fontSize="10" fontWeight="700" fill="#8FC3E3">MIL</text>
      <path d="M206 75 L262 75" stroke="#2395C6" strokeOpacity="0.4" strokeWidth="2" />
      <rect x="262" y="63" width="22" height="24" rx="5" fill="#0A5A96" />
      {anima && (
        <circle r="3.5" fill="#0A5A96">
          <animateMotion dur="1.6s" repeatCount="indefinite" path="M206,75 L262,75" />
        </circle>
      )}
    </Cena>
  )
}

/** 3 · os indicadores viram um índice de 0 a 4 */
function CenaIndice({ anima }: { anima: boolean }) {
  const circ = 2 * Math.PI * 52
  const cheio = 0.75 * circ * 0.66
  return (
    <Cena>
      <g transform="rotate(135 150 82)" fill="none" strokeWidth="11" strokeLinecap="round">
        <circle cx="150" cy="82" r="52" stroke="#DFEAF2" strokeDasharray={`${0.75 * circ} ${circ}`} />
        <circle cx="150" cy="82" r="52" stroke="#0A5A96" strokeDasharray={`${cheio} ${circ}`}>
          {anima && <animate attributeName="stroke-dasharray" values={`0 ${circ};${cheio} ${circ};${cheio} ${circ}`} keyTimes="0;0.6;1" dur="3s" repeatCount="indefinite" />}
        </circle>
      </g>
      <text x="150" y="88" textAnchor="middle" fontSize="30" fontWeight="800" fill="#052F4D">2,7</text>
      <text x="150" y="146" textAnchor="middle" fontSize="11" fontWeight="800" fill="#054C7C">Nível 3 · Participativa</text>
    </Cena>
  )
}

/** 4 · plano de ação e rede de cidades parecidas */
function CenaRede({ anima }: { anima: boolean }) {
  const nos: [number, number, number, string][] = [
    [70, 45, 13, '#9CCBEA'],
    [150, 30, 16, '#2395C6'],
    [232, 50, 15, '#0A5A96'],
    [92, 108, 15, '#0A5A96'],
    [198, 112, 18, '#052F4D'],
  ]
  const lig: [number, number][] = [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [1, 4]]
  return (
    <Cena>
      {lig.map(([a, b]) => (
        <line key={`${a}${b}`} x1={nos[a][0]} y1={nos[a][1]} x2={nos[b][0]} y2={nos[b][1]} stroke="#2395C6" strokeOpacity={a === 1 || b === 1 ? 0.55 : 0.25} strokeWidth={a === 1 || b === 1 ? 3 : 2} strokeLinecap="round" />
      ))}
      {nos.map(([x, y, r, cor], i) => (
        <g key={i}>
          {i === 1 && <circle cx={x} cy={y} r={r + 8} fill="#2395C6" fillOpacity="0.18">{anima && <animate attributeName="r" values={`${r + 5};${r + 12};${r + 5}`} dur="2.8s" repeatCount="indefinite" />}</circle>}
          <circle cx={x} cy={y} r={r} fill={cor} stroke="#fff" strokeWidth="3" />
        </g>
      ))}
      <path d="M262 112v22M262 114h18l-4 6 4 6h-18" stroke="#0A5A96" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Cena>
  )
}

const PASSOS = [
  { cena: CenaEscolher, titulo: 'Escolha uma cidade', texto: 'Selecione o município numa lista oficial. Nada de digitar nome à mão.' },
  { cena: CenaDados, titulo: 'Os dados são organizados', texto: 'A plataforma reúne os dados da cidade. Por enquanto parte deles você declara; a coleta automática está a caminho.' },
  { cena: CenaIndice, titulo: 'Eles viram um índice', texto: 'Os indicadores formam um índice de 0 a 4, com nível e os pontos de atenção da cidade.' },
  { cena: CenaRede, titulo: 'Plano e rede de cidades', texto: 'O plano de ação diz por onde começar, e a Rede mostra cidades em estágio parecido para comparar.' },
]

/**
 * Introdução curta e animada. Aparece sozinha na primeira visita (a pessoa pode pular
 * a qualquer momento) e pode ser reaberta por "Como funciona". Respeita "reduzir movimento".
 */
export function BoasVindas({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const fechar = () => {
    marcarVista()
    aoFechar()
  }
  return (
    <Folha aberto={aberto} aoFechar={fechar} titulo="Como funciona">
      <Passos aoTerminar={fechar} />
    </Folha>
  )
}

// Fica dentro da folha: ao fechar, o passo volta ao início sozinho.
function Passos({ aoTerminar }: { aoTerminar: () => void }) {
  const [passo, setPasso] = useState(0)
  const anima = !useReducedMotion()
  const ultimo = passo === PASSOS.length - 1
  const { cena: Cenario, titulo, texto } = PASSOS[passo]

  return (
    <div className="pb-3">
      <div key={passo} className="entrar">
        <div className="rounded-xl border border-linha bg-marca-fundo/50 px-3 py-4">
          <Cenario anima={anima} />
        </div>
        <h3 className="mt-4 text-subtitulo font-extrabold text-noite">{titulo}</h3>
        <p className="mt-1.5 text-corpo text-cinza">{texto}</p>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2" role="group" aria-label={`Passo ${passo + 1} de ${PASSOS.length}`}>
        {PASSOS.map((_, i) => (
          <span key={i} className={cx('h-2 rounded-full transition-all duration-300', i === passo ? 'w-6 bg-marca' : 'w-2 bg-linha')} aria-hidden />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
        <Button type="button" variante="ghost" className="alvo" onClick={aoTerminar}>
          {ultimo ? 'Fechar' : 'Pular'}
        </Button>
        <Button type="button" className="alvo" onClick={() => (ultimo ? aoTerminar() : setPasso(passo + 1))}>
          {ultimo ? 'Começar' : 'Próximo'}
        </Button>
      </div>
    </div>
  )
}
