import { useState } from 'react'
import { Button, Vazio, cx } from '@/components/ui'
import type { EstadoPriorizar, SituacaoConclusao } from '@/lib/estadoPriorizar'
import { NIVEIS } from '@/lib/isps'
import type { Conclusao, Simulacao, TipoConclusao } from '@/lib/priorizar'

const TIPO: Record<TipoConclusao, { rotulo: string; plural: string; classe: string; ponto: string }> = {
  forca: { rotulo: 'FORÇA', plural: 'Forças', classe: 'bg-ok-bg text-ok-txt', ponto: 'bg-nota-baixa' },
  fraqueza: { rotulo: 'FRAQUEZA', plural: 'Fraquezas', classe: 'bg-erro-bg text-erro-txt', ponto: 'bg-nota-alta' },
  oportunidade: { rotulo: 'OPORTUNIDADE', plural: 'Oportunidades', classe: 'bg-marca-fundo text-marca-escura', ponto: 'bg-marca-clara' },
}
const ORDEM_TIPOS: TipoConclusao[] = ['forca', 'fraqueza', 'oportunidade']

const n = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const plural = (q: number, um: string, varios: string) => `${q} ${q === 1 ? um : varios}`

/**
 * Primeiro passo: o que os números dizem. Cada conclusão confirmada entra no
 * quadro do plano e libera as ações que os passos seguintes vão usar.
 */
export function Conclusoes({
  conclusoes,
  estado,
  atualizar,
  idsLiberados,
  projecao,
}: {
  conclusoes: Conclusao[]
  estado: EstadoPriorizar
  atualizar: (mudar: (e: EstadoPriorizar) => EstadoPriorizar) => void
  /** ações liberadas pelas conclusões confirmadas */
  idsLiberados: number[]
  /** onde a cidade chega se todas essas ações acontecerem */
  projecao: Simulacao | null
}) {
  const [editando, setEditando] = useState<string | null>(null)
  const [rascunho, setRascunho] = useState('')

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
  const textoDe = (c: Conclusao) => estado.textos[c.id] ?? c.texto
  const confirmadas = conclusoes.filter((c) => situacao(c.id) === 'confirmada')

  function comecarEdicao(c: Conclusao) {
    setRascunho(textoDe(c))
    setEditando(c.id)
  }
  function salvar(c: Conclusao) {
    const novo = rascunho.trim()
    atualizar((e) => {
      const textos = { ...e.textos }
      if (novo === '' || novo === c.texto) delete textos[c.id]
      else textos[c.id] = novo
      return { ...e, textos }
    })
    setEditando(null)
  }

  return (
    <div>
      <p className="mb-3 text-corpo text-cinza">
        Conclusões que o diagnóstico sugere. Cada uma que você confirma entra no quadro abaixo e libera ações para os próximos passos.
      </p>

      {/* O quadro do plano, que se monta conforme você confirma */}
      <section aria-live="polite" className="mb-5 rounded-card border border-linha bg-white p-4 shadow-card">
        <h3 className="text-legenda font-bold uppercase tracking-wider text-cinza">Seu plano está tomando forma</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {ORDEM_TIPOS.map((tipo) => {
            const itens = confirmadas.filter((c) => c.tipo === tipo)
            return (
              <div key={tipo} className={cx('rounded-2xl px-3 py-2.5', TIPO[tipo].classe)}>
                <div className="text-[10.5px] font-bold uppercase tracking-wide">{TIPO[tipo].plural}</div>
                <div key={itens.length} className="entrar text-2xl font-bold leading-tight">
                  {itens.length}
                </div>
              </div>
            )
          })}
        </div>

        {confirmadas.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {confirmadas.map((c) => (
              <li
                key={c.id}
                className="entrar inline-flex items-center gap-1.5 rounded-full border border-linha bg-app-bg px-2.5 py-1 text-[11.5px] font-semibold text-noite"
              >
                <span className={cx('size-2 rounded-full', TIPO[c.tipo].ponto)} aria-hidden />
                {c.area}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 rounded-xl bg-marca-fundo px-3 py-2.5 text-[12.5px] leading-snug text-noite">
          {idsLiberados.length === 0 || !projecao ? (
            'Confirme uma conclusão para ver quantas ações ela libera e onde a cidade pode chegar.'
          ) : (
            <span key={idsLiberados.length} className="entrar block">
              Essas conclusões liberam <b>{plural(idsLiberados.length, 'ação', 'ações')}</b>. Se todas acontecerem, a
              nota vai de <b>{n(projecao.antes.isps)}</b> para <b>{n(projecao.depois.isps)}</b>
              {projecao.depois.nivelExibido > projecao.antes.nivelExibido ? (
                <>
                  , e a cidade sobe para o <b>Nível {projecao.depois.nivelExibido + 1} ({NIVEIS[projecao.depois.nivelExibido]})</b>.
                </>
              ) : (
                '.'
              )}
              {projecao.liberouRegraDeOuro && ' A Regra de Ouro deixa de segurar a cidade.'}
            </span>
          )}
        </div>
      </section>

      <ul className="flex flex-col gap-3">
        {conclusoes.map((c) => {
          const s = situacao(c.id)
          const confirmada = s === 'confirmada'
          const editada = estado.textos[c.id] !== undefined
          return (
            <li
              key={c.id}
              className={cx(
                'rounded-card border bg-white p-4 transition-all duration-300 motion-reduce:transition-none',
                confirmada ? 'border-nota-baixa shadow-card' : 'border-linha',
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
                    value={rascunho}
                    onChange={(ev) => setRascunho(ev.target.value)}
                    className="mt-3 w-full rounded-xl border border-linha bg-campo p-3 text-corpo text-tinta outline-none focus:border-marca-clara focus:ring-2 focus:ring-marca-clara/30"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button type="button" className="alvo flex-1" onClick={() => salvar(c)}>
                      Salvar
                    </Button>
                    <Button type="button" variante="ghost" className="alvo flex-1" onClick={() => setEditando(null)}>
                      Cancelar
                    </Button>
                  </div>
                  {(editada || rascunho !== c.texto) && (
                    <button
                      type="button"
                      className="alvo mt-1 text-legenda font-bold text-marca-escura"
                      onClick={() => setRascunho(c.texto)}
                    >
                      ↺ Voltar ao texto original
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="mt-3 text-[15px] font-bold leading-snug text-noite">{c.dado}</p>
                  <p className="mt-1.5 text-corpo text-tinta">
                    {textoDe(c)}
                    {editada && <span className="ml-1.5 text-legenda text-cinza-cl">(editado)</span>}
                  </p>

                  {c.acoes.length > 0 ? (
                    <p
                      className={cx(
                        'mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors duration-300 motion-reduce:transition-none',
                        confirmada ? 'bg-ok-bg text-ok-txt' : 'bg-app-bg text-cinza',
                      )}
                    >
                      {confirmada ? '✓ ' : ''}
                      {confirmada ? 'Libera' : 'Liberaria'} {plural(c.acoes.length, 'ação', 'ações')}
                    </p>
                  ) : (
                    <p className="mt-2 inline-flex rounded-full bg-app-bg px-2.5 py-1 text-[11.5px] font-semibold text-cinza">
                      Não libera ação: é um argumento para a conversa
                    </p>
                  )}

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
                    <Button type="button" variante="ghost" className="alvo" onClick={() => comecarEdicao(c)}>
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
