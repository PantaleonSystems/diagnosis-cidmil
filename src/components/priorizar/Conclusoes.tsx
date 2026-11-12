import { useState } from 'react'
import { Button, Vazio, cx } from '@/components/ui'
import type { EstadoPriorizar, SituacaoConclusao } from '@/lib/estadoPriorizar'
import type { Conclusao, TipoConclusao } from '@/lib/priorizar'

const TIPO: Record<TipoConclusao, { rotulo: string; classe: string }> = {
  fraqueza: { rotulo: 'FRAQUEZA', classe: 'bg-erro-bg text-erro-txt' },
  forca: { rotulo: 'FORÇA', classe: 'bg-ok-bg text-ok-txt' },
  oportunidade: { rotulo: 'OPORTUNIDADE', classe: 'bg-marca-fundo text-marca-escura' },
}

/** Primeiro passo: o que os números dizem. O consultor confirma, edita ou descarta. */
export function Conclusoes({
  conclusoes,
  estado,
  atualizar,
}: {
  conclusoes: Conclusao[]
  estado: EstadoPriorizar
  atualizar: (mudar: (e: EstadoPriorizar) => EstadoPriorizar) => void
}) {
  const [editando, setEditando] = useState<string | null>(null)

  if (conclusoes.length === 0) {
    return (
      <Vazio
        titulo="Ainda não há o que concluir"
        descricao="Preencha as métricas da avaliação. Com as notas, o sistema sugere as conclusões aqui."
      />
    )
  }

  const situacao = (id: string): SituacaoConclusao => estado.conclusoes[id] ?? 'pendente'
  const definir = (id: string, s: SituacaoConclusao) =>
    atualizar((e) => ({ ...e, conclusoes: { ...e.conclusoes, [id]: s } }))
  const confirmadas = conclusoes.filter((c) => situacao(c.id) === 'confirmada').length

  return (
    <div>
      <p className="mb-3 text-corpo text-cinza">
        Conclusões que o diagnóstico sugere. Você decide quais valem.
      </p>
      <div className="mb-4 flex items-center justify-between text-legenda text-cinza">
        <span>Confirmadas</span>
        <b className="text-marca-escura">
          {confirmadas} de {conclusoes.length}
        </b>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-marca-fundo">
        <div
          className="h-2 rounded-full bg-marca transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${(confirmadas / conclusoes.length) * 100}%` }}
        />
      </div>

      <ul className="flex flex-col gap-3">
        {conclusoes.map((c) => {
          const s = situacao(c.id)
          const texto = estado.textos[c.id] ?? c.texto
          const confirmada = s === 'confirmada'
          return (
            <li
              key={c.id}
              className={cx(
                'rounded-card border bg-white p-4 transition-all duration-300 motion-reduce:transition-none',
                confirmada ? 'border-ok-borda shadow-card' : 'border-linha',
                s === 'descartada' && 'opacity-55',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cx('rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide', TIPO[c.tipo].classe)}>
                  {TIPO[c.tipo].rotulo}
                </span>
                <span className="text-legenda text-cinza-cl">{c.area}</span>
              </div>

              {editando === c.id ? (
                <>
                  <label htmlFor={`conclusao-${c.id}`} className="sr-only">
                    Editar a conclusão
                  </label>
                  <textarea
                    id={`conclusao-${c.id}`}
                    rows={4}
                    value={texto}
                    onChange={(ev) =>
                      atualizar((e) => ({ ...e, textos: { ...e.textos, [c.id]: ev.target.value } }))
                    }
                    className="mt-3 w-full rounded-xl border border-linha bg-campo p-3 text-corpo text-tinta outline-none focus:border-marca-clara focus:ring-2 focus:ring-marca-clara/30"
                  />
                  <Button type="button" className="alvo mt-2" onClick={() => setEditando(null)}>
                    Salvar
                  </Button>
                </>
              ) : (
                <>
                  <p className="mt-3 text-[15px] font-bold leading-snug text-noite">{c.dado}</p>
                  <p className="mt-1.5 text-corpo text-tinta">{texto}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variante={confirmada ? 'claro' : 'primario'}
                      aria-pressed={confirmada}
                      className={cx('alvo flex-1', confirmada && 'border-2 border-nota-baixa text-ok-txt')}
                      onClick={() => definir(c.id, confirmada ? 'pendente' : 'confirmada')}
                    >
                      {confirmada ? '✓ Confirmada' : 'Confirmar'}
                    </Button>
                    <Button type="button" variante="ghost" className="alvo" onClick={() => setEditando(c.id)}>
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variante="ghost"
                      className="alvo border-linha text-cinza"
                      onClick={() => definir(c.id, s === 'descartada' ? 'pendente' : 'descartada')}
                    >
                      {s === 'descartada' ? 'Restaurar' : 'Descartar'}
                    </Button>
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
