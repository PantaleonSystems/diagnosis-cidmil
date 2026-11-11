import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NIVEIS } from '@/lib/isps'
import { caminhoDaCidade, type ResumoCidade } from '@/lib/cidadeAtiva'
import { nomeCurto, similaridade, ufVisivel } from '@/lib/cidades'
import { useReducedMotion } from '@/lib/movimento'
import { NIVEL_COLORS, fmt } from '@/lib/theme'
import type { Cidade } from '@/types/db'

export interface ItemRede {
  cidade: Cidade
  resumo: ResumoCidade
}

const W = 350
const H = 300
const C: [number, number] = [W / 2, H / 2 - 4]

/**
 * Rede das cidades com dados: cada cidade é um ponto (cor = nível, tamanho = índice);
 * as ligações são mais fortes entre cidades de índice parecido.
 */
export function RedeReal({ itens }: { itens: ItemRede[] }) {
  const movimento = !useReducedMotion()
  const ordenadas = useMemo(
    () => [...itens].sort((a, b) => (a.resumo.isps ?? 0) - (b.resumo.isps ?? 0)),
    [itens],
  )
  const [selId, setSelId] = useState<string | null>(null)
  const selecionada = ordenadas.find((x) => x.cidade.id === selId) ?? ordenadas[ordenadas.length - 1]

  const pos = useMemo(() => {
    const n = ordenadas.length
    const raio = n <= 4 ? 80 : 104
    return ordenadas.map((_, i) => {
      const a = (i * 2 * Math.PI) / n - Math.PI / 2
      return [C[0] + raio * Math.cos(a), C[1] + raio * Math.sin(a) * 0.92] as [number, number]
    })
  }, [ordenadas])

  const ligacoes = useMemo(() => {
    const l: { a: number; b: number; s: number }[] = []
    for (let a = 0; a < ordenadas.length; a++)
      for (let b = a + 1; b < ordenadas.length; b++) {
        const s = similaridade(ordenadas[a].resumo.isps ?? 0, ordenadas[b].resumo.isps ?? 0)
        if (s > 0.35) l.push({ a, b, s })
      }
    return l
  }, [ordenadas])

  const parecidas = ordenadas
    .filter((x) => x.cidade.id !== selecionada.cidade.id)
    .map((x) => ({ x, s: similaridade(selecionada.resumo.isps ?? 0, x.resumo.isps ?? 0) }))
    .sort((p, q) => q.s - p.s)
    .slice(0, 3)

  const idxSel = ordenadas.findIndex((x) => x.cidade.id === selecionada.cidade.id)
  const rotulos = ordenadas.length <= 8

  return (
    <div className="rounded-[16px] border border-linha bg-white p-3 shadow-card sm:p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block h-auto w-full max-w-[520px]"
        role="group"
        aria-label={`Rede de ${ordenadas.length} cidades. Toque numa cidade para ver as parecidas.`}
      >
        {ligacoes.map(({ a, b, s }) => {
          const destaque = a === idxSel || b === idxSel
          return (
            <line
              key={`${a}-${b}`}
              x1={pos[a][0]}
              y1={pos[a][1]}
              x2={pos[b][0]}
              y2={pos[b][1]}
              stroke="#2395C6"
              strokeLinecap="round"
              strokeOpacity={destaque ? 0.35 + s * 0.55 : 0.1 + s * 0.2}
              strokeWidth={destaque ? 1.5 + s * 4 : 1 + s * 1.5}
              style={{ transition: 'stroke-opacity .3s, stroke-width .3s' }}
            />
          )
        })}

        {ordenadas.map(({ cidade, resumo }, i) => {
          const [x, y] = pos[i]
          const marcado = i === idxSel
          const r = 11 + (resumo.isps ?? 0) * 3.2
          return (
            <g
              key={cidade.id}
              role="button"
              tabIndex={0}
              aria-label={`${nomeCurto(cidade)}: índice ${fmt(resumo.isps ?? 0, 2)}, ${NIVEIS[resumo.nivelExibido]}`}
              aria-pressed={marcado}
              onClick={() => setSelId(cidade.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelId(cidade.id)
                }
              }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <circle cx={x} cy={y} r={r + 9} fill="transparent" />
              {marcado && (
                <circle cx={x} cy={y} r={r + 8} fill={NIVEL_COLORS[resumo.nivelExibido]} fillOpacity={0.16}>
                  {movimento && <animate attributeName="r" values={`${r + 6};${r + 12};${r + 6}`} dur="3.2s" repeatCount="indefinite" />}
                </circle>
              )}
              <circle cx={x} cy={y} r={r} fill={NIVEL_COLORS[resumo.nivelExibido]} stroke="#fff" strokeWidth={3} />
              {(rotulos || marcado) && (
                <text x={x} y={y + r + 14} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#10283A">
                  {nomeCurto(cidade).length > 15 ? `${nomeCurto(cidade).slice(0, 14)}…` : nomeCurto(cidade)}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-legenda text-cinza">
        {NIVEIS.map((n, i) => (
          <span key={n} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NIVEL_COLORS[i] }} aria-hidden />
            Nível {i + 1} · {n}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-linha bg-app-bg p-4" aria-live="polite">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-subtitulo font-extrabold text-petroleo">{nomeCurto(selecionada.cidade)}</div>
            <div className="text-legenda text-cinza">
              {[ufVisivel(selecionada.cidade), `Nível ${selecionada.resumo.nivelExibido + 1}`, NIVEIS[selecionada.resumo.nivelExibido]].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div className="text-[1.625rem] font-extrabold leading-none tracking-[-0.02em] text-petroleo">{fmt(selecionada.resumo.isps ?? 0, 2)}</div>
        </div>

        <div className="mt-3 text-micro font-extrabold uppercase text-cinza">Cidades parecidas</div>
        <ul className="mt-2 space-y-2">
          {parecidas.map(({ x, s }) => (
            <li key={x.cidade.id} className="flex items-center gap-3 text-corpo">
              <button type="button" onClick={() => setSelId(x.cidade.id)} className="flex-1 truncate text-left font-bold text-petroleo hover:underline">
                {nomeCurto(x.cidade)}
              </button>
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-linha" aria-hidden>
                <span className="block h-full rounded-full bg-ciano-2" style={{ width: `${Math.round(s * 100)}%` }} />
              </span>
              <span className="w-10 text-right text-legenda text-cinza">{Math.round(s * 100)}%</span>
            </li>
          ))}
        </ul>
        <Link
          to={caminhoDaCidade(selecionada.cidade.id)}
          className="toque alvo mt-3 flex items-center justify-center rounded-xl bg-ciano text-corpo font-bold text-white"
        >
          Abrir cidade
        </Link>
      </div>
    </div>
  )
}
