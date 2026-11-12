import { useState, type ReactNode } from 'react'
import { MetricField } from '@/components/metrics/MetricField'
import { Folha } from '@/components/mobile/Folha'
import { PILARES, TOTAL_METRICAS, type Metrica } from '@/data/metricas'
import type { RespostaLocal, RespostasPorMetrica } from '@/lib/respostas'
import { Button, cx } from '@/components/ui'

const TODAS = PILARES.flatMap((pilar) => pilar.metricas.map((metrica) => ({ metrica, pilar })))

/** Primeira métrica ainda sem resposta (ou a última, se tudo estiver respondido). */
function primeiraPendente(respostas: RespostasPorMetrica): number {
  const i = TODAS.findIndex((t) => respostas[t.metrica.numero] === undefined)
  return i === -1 ? TODAS.length - 1 : i
}

/**
 * Preenchimento uma métrica por vez, feito para o polegar: progresso no topo,
 * "Anterior/Próxima" sempre à vista e um índice para pular para qualquer métrica.
 * Começa na primeira que falta responder.
 */
export function AvaliacaoGuiada({
  respostas,
  aoResponder,
  concluir,
}: {
  respostas: RespostasPorMetrica
  aoResponder: (metrica: Metrica, valor: RespostaLocal, imediato?: boolean) => void
  /** cartão de concluir, mostrado na última métrica */
  concluir: ReactNode
}) {
  const [indice, setIndice] = useState(() => primeiraPendente(respostas))
  const [indiceAberto, setIndiceAberto] = useState(false)
  const { metrica, pilar } = TODAS[indice]
  const respondidas = Object.keys(respostas).length
  const ultimo = indice === TODAS.length - 1

  const ir = (i: number) => {
    setIndice(Math.min(TODAS.length - 1, Math.max(0, i)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-micro font-extrabold uppercase text-cinza">
            Pilar {pilar.numero} · {pilar.curto}
          </div>
          <button
            type="button"
            onClick={() => setIndiceAberto(true)}
            className="toque alvo -ml-1 inline-flex items-center gap-1.5 rounded-lg px-1 text-corpo font-bold text-noite"
          >
            Métrica {indice + 1} de {TODAS.length}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
        <span className="shrink-0 text-legenda font-bold text-cinza">{respondidas}/{TOTAL_METRICAS} preenchidas</span>
      </div>

      <div className="mb-4 flex gap-[3px]" aria-hidden>
        {TODAS.map((t, i) => (
          <span
            key={t.metrica.numero}
            className={cx('h-1.5 flex-1 rounded-full transition-colors', respostas[t.metrica.numero] !== undefined ? 'bg-marca' : 'bg-linha', i === indice && 'ring-2 ring-marca-clara ring-offset-1')}
          />
        ))}
      </div>

      <MetricField key={metrica.numero} metrica={metrica} resposta={respostas[metrica.numero]} aoResponder={(valor, imediato) => aoResponder(metrica, valor, imediato)} />

      {ultimo && <div className="mt-2">{concluir}</div>}

      <div className="vidro sticky bottom-24 z-10 mt-2 grid grid-cols-2 gap-3 rounded-2xl border border-linha p-3 shadow-card">
        <Button type="button" variante="ghost" className="alvo" disabled={indice === 0} onClick={() => ir(indice - 1)}>
          ← Anterior
        </Button>
        <Button type="button" className="alvo" disabled={ultimo} onClick={() => ir(indice + 1)}>
          {ultimo ? 'Última métrica' : 'Próxima →'}
        </Button>
      </div>

      <Folha aberto={indiceAberto} aoFechar={() => setIndiceAberto(false)} titulo="Ir para uma métrica" alta>
        <div className="pb-4">
          {PILARES.map((p) => (
            <section key={p.numero} className="mb-4">
              <h3 className="sticky top-0 bg-white py-1.5 text-micro font-extrabold uppercase text-cinza">
                Pilar {p.numero} · {p.curto}
              </h3>
              <ul>
                {p.metricas.map((m) => {
                  const i = TODAS.findIndex((t) => t.metrica.numero === m.numero)
                  const feita = respostas[m.numero] !== undefined
                  return (
                    <li key={m.numero}>
                      <button
                        type="button"
                        onClick={() => {
                          setIndiceAberto(false)
                          ir(i)
                        }}
                        className={cx('toque flex min-h-12 w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-marca-fundo', i === indice && 'bg-marca-fundo')}
                      >
                        <span
                          className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full text-micro font-extrabold', feita ? 'bg-marca text-white' : 'bg-neutro text-cinza')}
                          aria-label={feita ? 'respondida' : 'pendente'}
                        >
                          {feita ? '✓' : ''}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-micro font-extrabold text-marca">M{m.numero}</span>
                          <span className="block truncate text-corpo font-semibold text-noite">{m.titulo}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </Folha>
    </div>
  )
}
