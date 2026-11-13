import { useState, type ReactNode } from 'react'
import cidade from '@/data/mapa-cidade-demo.json'
import { bboxDe, enquadrar } from '@/lib/mapaLanding'
import { FONTES } from './fontes'

const VISTA = enquadrar(bboxDe(cidade.caminho), 1, 1.2)

const ICONES: Record<string, ReactNode> = {
  portais: (<><path d="M3 10 12 4l9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 20h18" /></>),
  cadastros: (<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM8.5 12h7M8.5 16h5" /></>),
  projetos: (<><path d="M6 21V4" /><path d="M6 5h11l-2.5 3.5L17 12H6" /></>),
  plataformas: (<><circle cx="12" cy="12" r="2.5" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="12" cy="20" r="2" /><path d="m6.5 7.5 3.5 3M17.5 7.5l-3.5 3M12 14.5V18" /></>),
  abertos: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z" /></>),
  valores: (<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />),
}

function Icone({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true" focusable="false">
      {ICONES[id]}
    </svg>
  )
}

const Etapa = ({ n, children }: { n: string; children: ReactNode }) => (
  <p className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-marca-escura">{n} · {children}</p>
)

/** Do que a cidade já tem até o que ela recebe: fontes → cidade → diagnóstico. */
export function TerritorioFontes() {
  const [foco, setFoco] = useState<number | null>(null)
  const n = FONTES.length

  return (
    <div
      role="group"
      aria-label="As fontes de informação da cidade, como portais de transparência e cadastros públicos, chegam à cidade e viram um diagnóstico."
      className="relative mx-auto grid max-w-[1040px] gap-6 md:grid-cols-[1.25fr_0.8fr_1fr] md:gap-0"
    >
      {/* 1 · fontes */}
      <div className="relative md:pr-14">
        <Etapa n="1">De onde vem</Etapa>
        <div className="relative">
        <ul className="grid gap-2.5">
          {FONTES.map((f, i) => (
            <li
              key={f.id}
              onMouseEnter={() => setFoco(i)}
              onMouseLeave={() => setFoco(null)}
              className={`flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 transition-colors duration-300 ${foco === i ? 'border-marca' : 'border-linha'}`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-marca-fundo text-marca"><Icone id={f.id} /></span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold leading-tight text-noite">{f.nome}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-cinza">{f.frase}</span>
              </span>
            </li>
          ))}
        </ul>
        {/* linhas que levam a informação até a cidade */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-y-0 -right-14 hidden h-full w-14 md:block" aria-hidden="true" focusable="false">
        {FONTES.map((f, i) => {
          const y = ((i + 0.5) / n) * 100
          return <path key={f.id} d={`M0 ${y} C60 ${y}, 40 50, 100 50`} className="fluxo-linha" data-ativa={foco === i} vectorEffect="non-scaling-stroke" />
        })}
      </svg>
        </div>
      </div>

      <p className="md:hidden flex justify-center text-marca" aria-hidden="true"><span className="seta-fluxo">↓</span></p>

      {/* 2 · cidade */}
      <div className="relative flex flex-col md:px-2">
        <Etapa n="2">Reunimos e conferimos</Etapa>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-marca-fundo px-4 py-6">
          <svg viewBox={VISTA.join(' ')} className="h-36 w-36" aria-hidden="true" focusable="false">
            <path d={cidade.caminho} className="fill-white stroke-marca" style={{ strokeWidth: VISTA[2] * 0.014, strokeLinejoin: 'round' }} />
            <circle cx={VISTA[0] + VISTA[2] / 2} cy={VISTA[1] + VISTA[3] / 2} r={VISTA[2] * 0.05} className="fill-marca pulso-cidade" />
          </svg>
          <p className="text-center text-sm font-bold text-noite">Sua cidade</p>
          <p className="text-center text-[12px] leading-snug text-cinza">Tudo é juntado num só lugar e conferido antes de virar nota.</p>
        </div>
        <svg viewBox="0 0 40 24" className="absolute -right-12 top-[56%] hidden h-6 w-10 -translate-y-1/2 text-marca md:block" aria-hidden="true" focusable="false"><path d="M2 12h30M26 5l8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <p className="md:hidden flex justify-center text-marca" aria-hidden="true"><span className="seta-fluxo">↓</span></p>

      {/* 3 · o que recebe */}
      <div className="flex flex-col md:pl-14">
        <Etapa n="3">O que a cidade recebe</Etapa>
        <ul className="space-y-2.5 md:my-auto">
          {[['Diagnóstico', 'Um retrato claro de cada frente'], ['Nota', 'Um índice com consistência'], ['Prioridades', 'O que fazer primeiro, e por quê']].map(([t, d]) => (
            <li key={t} className="rounded-2xl border border-linha bg-white px-4 py-3">
              <span className="block text-[14px] font-bold text-noite">{t}</span>
              <span className="text-[12px] text-cinza">{d}</span>
            </li>
          ))}
        </ul>

      </div>
    </div>
  )
}
