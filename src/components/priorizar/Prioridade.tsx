import { useState } from 'react'
import { cx } from '@/components/ui'
import {
  ordenarPorGUT,
  pontosGUT,
  sugerirGUT,
  type AcaoPossivel,
  type Gut,
} from '@/lib/priorizar'

const ALTURA_LINHA = 58

/** Deslocamentos (px) para bolhas que caem no mesmo ponto do mapa. */
const DESLOCAMENTOS: [number, number][] = [
  [0, 0],
  [-20, 14],
  [20, 14],
  [-20, -14],
  [20, -14],
  [0, 28],
]

interface Item extends Gut {
  acao: AcaoPossivel
}

const CONTROLES: { chave: keyof Gut; nome: string }[] = [
  { chave: 'g', nome: 'Quão grave' },
  { chave: 'u', nome: 'Quão urgente' },
  { chave: 't', nome: 'Vai piorar?' },
]

/** Terceiro passo: o que fazer primeiro (método GUT, em três perguntas). */
export function Prioridade({
  acoes,
  gut,
  mudar,
}: {
  acoes: AcaoPossivel[]
  gut: Record<number, Gut>
  mudar: (id: number, valor: Gut | null) => void
}) {
  const [sel, setSel] = useState<number | null>(acoes[0]?.id ?? null)

  if (acoes.length === 0) {
    return (
      <p className="rounded-card border border-linha bg-white p-4 text-corpo text-cinza">
        Não há ações para priorizar: todas as métricas respondidas estão na nota máxima.
      </p>
    )
  }

  const itens: Item[] = acoes.map((a) => ({ acao: a, ...(gut[a.id] ?? sugerirGUT(a)) }))
  const ordem = ordenarPorGUT(itens)
  const pos = new Map(ordem.map((it, i) => [it.acao.id, i + 1]))
  const atual = itens.find((i) => i.acao.id === sel) ?? itens[0]
  const sugestao = sugerirGUT(atual.acao)
  const mudouDaSugestao = atual.g !== sugestao.g || atual.u !== sugestao.u || atual.t !== sugestao.t

  return (
    <div>
      <p className="mb-3 text-corpo text-cinza">
        Método GUT: dê notas de 1 a 5. Quanto maior o resultado, mais cedo a ação entra.
      </p>

      {/* Mapa: urgência na horizontal, gravidade na vertical, bolha = vai piorar */}
      <div className="rounded-card border border-linha bg-white p-3 shadow-card">
        <div className="relative ml-6 mb-6 h-[200px] rounded-xl border border-linha bg-gradient-to-br from-app-bg via-marca-fundo to-[#c4dff0]">
          <div className="absolute inset-y-0 left-1/2 w-px bg-linha" aria-hidden />
          <div className="absolute inset-x-0 top-1/2 h-px bg-linha" aria-hidden />
          {itens.map((it, idx) => {
            const topo = (pos.get(it.acao.id) ?? 99) <= 3
            const ativo = it.acao.id === atual.acao.id
            const d = 16 + it.t * 5
            // ações com a mesma gravidade e urgência cairiam no mesmo ponto: abre um leque
            const irmaos = itens.filter((o, j) => j < idx && o.g === it.g && o.u === it.u).length
            const [dx, dy] = DESLOCAMENTOS[irmaos % DESLOCAMENTOS.length]
            return (
              <button
                key={it.acao.id}
                type="button"
                aria-label={`${it.acao.metrica.titulo}, ${pontosGUT(it)} pontos`}
                onClick={() => setSel(it.acao.id)}
                className={cx(
                  'absolute flex items-center justify-center rounded-full text-xs font-bold shadow-md',
                  'transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1.05)] motion-reduce:transition-none',
                  ativo ? 'z-10 border-[3px] border-noite' : 'border-2 border-white',
                  topo ? 'bg-marca text-white' : 'bg-[#86bcdc] text-noite',
                )}
                style={{
                  width: d,
                  height: d,
                  left: `calc(${((it.u - 1) / 4) * 82 + 9}%)`,
                  top: `calc(${(1 - (it.g - 1) / 4) * 78 + 11}%)`,
                  marginLeft: -d / 2 + dx,
                  marginTop: -d / 2 + dy,
                }}
              >
                {pos.get(it.acao.id)}
              </button>
            )
          })}
          <span className="absolute -bottom-5 inset-x-0 text-center text-[11px] text-cinza">Quão urgente →</span>
          <span className="absolute -left-[46px] top-1/2 w-[80px] -translate-y-1/2 -rotate-90 text-center text-[11px] text-cinza">
            Quão grave →
          </span>
        </div>
        <p className="px-1 text-[11px] text-cinza-cl">
          Começar pelo canto de cima, à direita: mais grave e mais urgente. O tamanho da bolha mostra se o problema piora com o tempo; bolha grande piora logo se nada for feito.
        </p>
      </div>

      {/* Ajuste da ação escolhida */}
      <div className="mt-3 rounded-2xl border border-marca-clara bg-white p-3.5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[14px] font-bold leading-snug text-noite">{atual.acao.metrica.titulo}</div>
          <div className="shrink-0 rounded-xl bg-marca-fundo px-2.5 py-1 text-center">
            <div className="text-[10px] text-cinza">pontos</div>
            <div className="text-xl font-bold leading-tight text-marca-escura">{pontosGUT(atual)}</div>
          </div>
        </div>
        <div className="mb-1 mt-0.5 text-legenda text-cinza-cl">
          Sugestão do diagnóstico para {atual.acao.pilar.curto}, nota {atual.acao.nota}
        </div>
        {CONTROLES.map((c) => (
          <div key={c.chave} className="flex items-center gap-3">
            <label htmlFor={`gut-${atual.acao.id}-${c.chave}`} className="w-[96px] text-[12.5px] font-semibold text-noite">
              {c.nome}
            </label>
            <input
              id={`gut-${atual.acao.id}-${c.chave}`}
              type="range"
              min={1}
              max={5}
              step={1}
              value={atual[c.chave]}
              onChange={(ev) =>
                mudar(atual.acao.id, { g: atual.g, u: atual.u, t: atual.t, [c.chave]: Number(ev.target.value) })
              }
              className="h-9 flex-1 accent-marca"
            />
            <span className="w-4 text-right font-bold text-marca-escura">{atual[c.chave]}</span>
          </div>
        ))}
        {mudouDaSugestao && (
          <button
            type="button"
            className="alvo mt-1 text-legenda font-bold text-marca-escura"
            onClick={() => mudar(atual.acao.id, null)}
          >
            ↺ Voltar à sugestão do diagnóstico
          </button>
        )}
      </div>

      {/* Ordem sugerida, com reordenação animada */}
      <h3 className="mb-2 mt-5 text-legenda font-bold uppercase tracking-wider text-cinza">Ordem sugerida</h3>
      <div className="relative" style={{ height: itens.length * ALTURA_LINHA }}>
        {itens.map((it) => {
          const p = pos.get(it.acao.id) ?? 1
          const topo = p <= 3
          const ativo = it.acao.id === atual.acao.id
          return (
            <button
              key={it.acao.id}
              type="button"
              onClick={() => setSel(it.acao.id)}
              className={cx(
                'absolute inset-x-0 flex h-[50px] items-center gap-3 rounded-2xl border bg-white px-3 text-left',
                'transition-[top] duration-500 ease-[cubic-bezier(.2,.9,.25,1.05)] motion-reduce:transition-none',
                ativo ? 'border-marca-clara shadow-card' : 'border-linha',
              )}
              style={{ top: (p - 1) * ALTURA_LINHA }}
            >
              <span
                className={cx(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold',
                  topo ? 'bg-marca text-white' : 'bg-marca-fundo text-marca-escura',
                )}
              >
                {p}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-noite">{it.acao.metrica.titulo}</span>
                <span className="mt-1 block h-1.5 rounded-full bg-marca-fundo">
                  <span
                    className="block h-1.5 rounded-full bg-marca transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${(pontosGUT(it) / 125) * 100}%` }}
                  />
                </span>
              </span>
              <span className="w-9 shrink-0 text-right text-[15px] font-bold text-marca-escura">{pontosGUT(it)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
