import { useState } from 'react'
import { useMediaQuery } from '@/lib/movimento'
import { BotaoVerCidade } from './BotaoVerCidade'
import { PRIORIDADES, motivo, ordenar, rotulo, type Criterio, type Prioridade } from './prioridades'

const COR_URGENCIA = { 1: '#3db18c', 2: '#e6a93e', 3: '#e0603e' } as const
const CRITERIOS: { id: Criterio; texto: string }[] = [
  { id: 'urgencia', texto: 'Mais urgente primeiro' },
  { id: 'facil', texto: 'Mais fácil primeiro' },
]

/** Três barrinhas: quantas estão cheias diz o nível. */
function Medidor({ nivel, cor }: { nivel: number; cor: string }) {
  return (
    <span aria-hidden="true" className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <span key={i} className="h-2 w-6 rounded-full" style={{ background: i <= nivel ? cor : '#e3edf4' }} />
      ))}
    </span>
  )
}

function Tarefa({ p, pos, criterio, altura }: { p: Prioridade; pos: number; criterio: Criterio; altura: number }) {
  const cor = COR_URGENCIA[p.urgencia]
  return (
    <li
      data-posicao={pos + 1}
      className="lista-prior absolute inset-x-0 overflow-hidden rounded-2xl border border-linha bg-white shadow-card"
      style={{ height: altura - 12, transform: `translateY(${pos * altura}px)` }}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5" style={{ background: cor }} />
      <div className="flex h-full flex-col justify-between gap-2 pb-14 pl-5 pr-4 pt-3 md:flex-row md:items-center md:gap-5 md:pb-9">
        <div className="flex min-w-0 items-start gap-3 md:flex-1">
          <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-noite text-sm font-extrabold text-white">{pos + 1}</span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-snug text-noite">
              <span className="sr-only">Posição {pos + 1}: </span>
              {p.titulo}
            </p>
            <span className="mt-1 inline-block rounded-md bg-marca-fundo px-2 py-0.5 text-[11px] font-bold text-marca-escura">{p.frente}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-cinza md:shrink-0">
          <span className="flex flex-col gap-1">
            <span>Urgência {rotulo('urgencia', p.urgencia)}</span>
            <Medidor nivel={p.urgencia} cor={cor} />
          </span>
          <span className="flex flex-col gap-1">
            <span>Complexidade {rotulo('complexidade', p.complexidade)}</span>
            <Medidor nivel={p.complexidade} cor="#0a5a96" />
          </span>
          <span className="rounded-full border border-linha px-2.5 py-1 font-bold text-noite">{p.prazo}</span>
        </div>
      </div>
      <p key={criterio} className="motivo absolute inset-x-0 bottom-0 bg-marca-fundo px-5 py-1.5 text-[12px] font-semibold text-marca-escura">
        <span aria-hidden="true">↳ </span>{motivo(p, criterio, pos)}
      </p>
    </li>
  )
}

/** Fecha a história: um quadro de tarefas que mostra por que cada coisa vem na ordem em que vem. */
export function Decisao() {
  const [criterio, setCriterio] = useState<Criterio>('urgencia')
  const largo = useMediaQuery('(min-width: 768px)')
  const altura = largo ? 132 : 236
  const ordem = ordenar(PRIORIDADES, criterio)
  const posicao = new Map(ordem.map((p, i) => [p.id, i]))

  return (
    <div className="mx-auto max-w-[820px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-marca-fundo px-3 py-1 text-xs font-bold text-marca-escura">Exemplo ilustrativo</span>
        <div role="group" aria-label="Critério da ordem" className="flex rounded-full border border-linha bg-white p-1">
          {CRITERIOS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={criterio === c.id}
              onClick={() => setCriterio(c.id)}
              className="min-h-10 rounded-full px-4 text-[13px] font-bold text-marca-escura transition-colors duration-300 aria-pressed:bg-marca aria-pressed:text-white"
            >
              {c.texto}
            </button>
          ))}
        </div>
      </div>

      <p role="status" className="sr-only">Agora em primeiro lugar: {ordem[0].titulo}</p>

      <ol className="relative" style={{ height: altura * PRIORIDADES.length }}>
        {PRIORIDADES.map((p) => (
          <Tarefa key={p.id} p={p} pos={posicao.get(p.id) ?? 0} criterio={criterio} altura={altura} />
        ))}
      </ol>

      <div className="mt-8 flex justify-center">
        <BotaoVerCidade />
      </div>
    </div>
  )
}
