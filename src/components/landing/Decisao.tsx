import { useState } from 'react'
import { BotaoVerCidade } from './BotaoVerCidade'
import { PRIORIDADES, ordenar, type Criterio } from './prioridades'

const ALTURA = 76

/** Fecha a história: o que fazer primeiro, com uma chave que reordena a lista. */
export function Decisao() {
  const [criterio, setCriterio] = useState<Criterio>('urgencia')
  const posicao = new Map(ordenar(PRIORIDADES, criterio).map((p, i) => [p.id, i]))

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="rounded-full bg-marca-fundo px-3 py-1 text-xs font-bold text-marca-escura">Exemplo ilustrativo</span>
        <button
          type="button"
          aria-pressed={criterio === 'rapidez'}
          onClick={() => setCriterio((c) => (c === 'urgencia' ? 'rapidez' : 'urgencia'))}
          className="clique-controle flex min-h-11 items-center gap-3 text-[13px] font-bold text-marca-escura"
        >
          <span>Começar pelo mais rápido</span>
          <span aria-hidden="true" className="relative inline-block h-6 w-11 rounded-full bg-[#b7cbd9] transition-colors duration-300 [[aria-pressed=true]_&]:bg-marca" style={{ ['--curso' as string]: '20px' }}>
            <span className="pino-chave absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
          </span>
        </button>
      </div>

      <p role="status" className="sr-only">
        Agora em primeiro lugar: {ordenar(PRIORIDADES, criterio)[0].titulo}
      </p>

      <ol className="relative" style={{ height: ALTURA * PRIORIDADES.length }}>
        {PRIORIDADES.map((p) => {
          const pos = posicao.get(p.id) ?? 0
          return (
            <li
              key={p.id}
              data-posicao={pos + 1}
              className="lista-prior absolute inset-x-0 flex items-center gap-4 rounded-2xl border border-linha bg-white px-5"
              style={{ height: ALTURA - 10, transform: `translateY(${pos * ALTURA}px)` }}
            >
              <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-marca text-base font-extrabold text-white">{pos + 1}</span>
              <span className="text-[15px] font-semibold text-noite">
                <span className="sr-only">Posição {pos + 1}: </span>
                {p.titulo}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-10 flex justify-center">
        <BotaoVerCidade />
      </div>
    </div>
  )
}
