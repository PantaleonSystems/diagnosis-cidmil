import { useState } from 'react'
import cidade from '@/data/mapa-cidade-demo.json'
import { bboxDe, enquadrar } from '@/lib/mapaLanding'
import { FONTES } from './fontes'

const VISTA = enquadrar(bboxDe(cidade.caminho), 1, 1.18)

/** A cidade e as fontes de dado que chegam a ela; cada ponto abre uma frase. */
export function TerritorioFontes() {
  const [aberta, setAberta] = useState<string | null>(null)
  const atual = FONTES.find((f) => f.id === aberta)

  return (
    <div className="mx-auto grid max-w-[920px] items-center gap-8 md:grid-cols-[1fr_0.9fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[440px]">
        <svg viewBox={VISTA.join(' ')} className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          <path d={cidade.caminho} className="fill-marca-fundo stroke-marca" style={{ strokeWidth: VISTA[2] * 0.01, strokeLinejoin: 'round' }} />
        </svg>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          {FONTES.map((f) => (
            <line
              key={f.id}
              x1={f.x} y1={f.y} x2={50} y2={50}
              pathLength={1}
              className="linha-fonte"
              data-ativa={aberta === f.id}
            />
          ))}
        </svg>
        <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-noite ring-4 ring-white" />
        {FONTES.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-label={f.nome}
            aria-expanded={aberta === f.id}
            aria-controls="painel-fonte"
            onClick={() => setAberta(aberta === f.id ? null : f.id)}
            className="clique-escolha ponto-fonte"
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          >
            <span aria-hidden="true" className="ponto-fonte__miolo" />
          </button>
        ))}
      </div>

      <div id="painel-fonte" aria-live="polite" className="clique-detalhe" data-aberto={atual ? 'true' : 'false'}>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-marca">{atual?.nome ?? ''}</p>
          <p className="mt-1.5 text-[17px] leading-snug text-noite">{atual?.frase ?? ''}</p>
        </div>
      </div>
      {!atual && <p className="text-center text-sm text-cinza md:col-start-2 md:row-start-1 md:text-left">Toque num ponto para ver de onde vem cada dado.</p>}
    </div>
  )
}
