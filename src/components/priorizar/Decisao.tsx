import { Chip } from '@/components/mobile/Chip'
import { cx } from '@/components/ui'
import type { Decisao as TipoDecisao, DecisaoDaAcao, Prazo } from '@/lib/estadoPriorizar'
import { ordenarPorGUT, pontosGUT, sugerirGUT, type AcaoPossivel, type Gut } from '@/lib/priorizar'

const n = (v: number, casas = 2) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

const OPCOES: { valor: TipoDecisao; nome: string; ativa: string }[] = [
  { valor: 'aceita', nome: 'Aceitar', ativa: 'border-nota-baixa bg-ok-bg text-ok-txt' },
  { valor: 'adiada', nome: 'Adiar', ativa: 'border-nota-media bg-aviso-bg text-aviso-txt' },
  { valor: 'descartada', nome: 'Descartar', ativa: 'border-cinza-cl bg-neutro text-cinza' },
]

const PRAZOS: Prazo[] = ['Curto', 'Médio', 'Longo']

/** Quarto passo: cada escolha fica registrada com o motivo. */
export function Decisao({
  acoes,
  gut,
  decisoes,
  mudar,
}: {
  acoes: AcaoPossivel[]
  gut: Record<number, Gut>
  decisoes: Record<number, DecisaoDaAcao>
  mudar: (id: number, parcial: Partial<DecisaoDaAcao>, base: DecisaoDaAcao) => void
}) {
  const itens = ordenarPorGUT(acoes.map((a) => ({ acao: a, ...(gut[a.id] ?? sugerirGUT(a)) })))

  const contar = (d: TipoDecisao | null) =>
    itens.filter((i) => (decisoes[i.acao.id]?.decisao ?? null) === d).length
  const resumo: { rotulo: string; valor: number; classe: string }[] = [
    { rotulo: 'Aceitas', valor: contar('aceita'), classe: 'bg-ok-bg text-ok-txt' },
    { rotulo: 'Adiadas', valor: contar('adiada'), classe: 'bg-aviso-bg text-aviso-txt' },
    { rotulo: 'Descartadas', valor: contar('descartada'), classe: 'bg-neutro text-cinza' },
  ]

  if (itens.length === 0) {
    return (
      <p className="rounded-card border border-linha bg-white p-4 text-corpo text-cinza">
        Não há ações para decidir: todas as métricas respondidas estão na nota máxima.
      </p>
    )
  }

  return (
    <div>
      <p className="mb-3 text-corpo text-cinza">Cada escolha fica com o motivo.</p>
      <div className="grid grid-cols-3 gap-2">
        {resumo.map((r) => (
          <div key={r.rotulo} className={cx('rounded-2xl px-3 py-2.5', r.classe)}>
            <div className="text-[10.5px] font-bold uppercase tracking-wide">{r.rotulo}</div>
            <div className="text-2xl font-bold leading-tight">{r.valor}</div>
          </div>
        ))}
      </div>
      <p className="mb-4 mt-2 text-legenda text-cinza-cl">
        Melhor poucas e bem feitas: de 5 a 7 ações por vez. {contar(null) > 0 && `${contar(null)} ainda sem decisão.`}
      </p>

      <ul className="flex flex-col gap-3">
        {itens.map((it) => {
          const a = it.acao
          const base: DecisaoDaAcao = {
            decisao: null,
            prazo: it.u >= 4 ? 'Curto' : 'Médio',
            motivo: '',
          }
          const d = decisoes[a.id] ?? base
          const sugestaoMotivo = a.ajudaDestravar
            ? 'Ajuda Governança a chegar a 2,0, o mínimo para passar do Nível 2.'
            : `Soma ${n(a.ganho)} na nota geral e é uma das mais urgentes.`
          return (
            <li
              key={a.id}
              className={cx(
                'rounded-card border bg-white p-4',
                d.decisao === 'aceita' ? 'border-ok-borda' : 'border-linha',
                d.decisao === 'descartada' && 'opacity-70',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-[14px] font-bold leading-snug text-noite">{a.metrica.titulo}</div>
                <div className="shrink-0 text-right text-legenda leading-snug text-cinza-cl">
                  <b className="text-marca-escura">{pontosGUT(it)}</b> pontos
                  <br />+{n(a.ganho)} na nota geral
                </div>
              </div>

              <div role="group" aria-label={`Decisão sobre ${a.metrica.titulo}`} className="mt-3 flex gap-2">
                {OPCOES.map((o) => (
                  <button
                    key={o.valor}
                    type="button"
                    aria-pressed={d.decisao === o.valor}
                    onClick={() => mudar(a.id, { decisao: d.decisao === o.valor ? null : o.valor }, base)}
                    className={cx(
                      'alvo flex-1 rounded-xl border-2 text-[13px] font-semibold transition-colors duration-200 motion-reduce:transition-none',
                      d.decisao === o.valor ? o.ativa : 'border-linha bg-white text-cinza',
                    )}
                  >
                    {o.nome}
                  </button>
                ))}
              </div>

              {d.decisao === 'aceita' && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-legenda text-cinza">Prazo</span>
                  {PRAZOS.map((p) => (
                    <Chip key={p} ativo={d.prazo === p} onClick={() => mudar(a.id, { prazo: p }, base)}>
                      {p}
                    </Chip>
                  ))}
                </div>
              )}

              <label htmlFor={`motivo-${a.id}`} className="mt-3 block text-[11px] font-bold uppercase tracking-wider text-cinza">
                Motivo
              </label>
              <textarea
                id={`motivo-${a.id}`}
                rows={2}
                value={d.motivo}
                placeholder="Por que esta decisão?"
                onChange={(ev) => mudar(a.id, { motivo: ev.target.value }, base)}
                className="mt-1 w-full rounded-xl border border-linha bg-campo p-2.5 text-[13px] leading-snug text-tinta outline-none focus:border-marca-clara focus:ring-2 focus:ring-marca-clara/30"
              />
              {d.motivo === '' && (
                <button
                  type="button"
                  className="alvo text-left text-legenda font-semibold text-marca-escura"
                  onClick={() => mudar(a.id, { motivo: sugestaoMotivo }, base)}
                >
                  Usar a sugestão: “{sugestaoMotivo}”
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
