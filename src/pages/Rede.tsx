import { useMemo } from 'react'
import { RedeReal, type ItemRede } from '@/components/cidades/RedeReal'
import { PILARES } from '@/data/metricas'
import { useCidades } from '@/lib/cidadeAtiva'
import { NIVEIS } from '@/lib/isps'
import { NIVEL_COLORS, fmt } from '@/lib/theme'

/**
 * Análise geral das cidades: como se distribuem por nível, onde a rede está mais
 * fraca e quais cidades se parecem. Só entram cidades que já têm dados.
 */
export function Rede() {
  const { cidades, resumos } = useCidades()

  const dados = useMemo(() => {
    const itens: ItemRede[] = []
    for (const cidade of cidades) {
      const resumo = resumos.get(cidade.id)
      if (resumo && resumo.isps !== null) itens.push({ cidade, resumo })
    }
    const porNivel = [0, 0, 0, 0]
    for (const { resumo } of itens) porNivel[resumo.nivelExibido] += 1

    // média de cada pilar entre as cidades que têm dado nele
    const mediasPilares = PILARES.map((_, p) => {
      const v = itens.map((x) => x.resumo.mediasPilares[p]).filter((m): m is number => typeof m === 'number' && m > 0)
      return v.length ? v.reduce((s, m) => s + m, 0) / v.length : null
    })
    let fraco = -1
    mediasPilares.forEach((m, i) => {
      if (m !== null && (fraco < 0 || m < (mediasPilares[fraco] as number))) fraco = i
    })

    const media = itens.length ? itens.reduce((s, x) => s + (x.resumo.isps ?? 0), 0) / itens.length : null
    return {
      itens,
      porNivel,
      media,
      travadas: itens.filter((x) => x.resumo.travado).length,
      fraco: fraco >= 0 ? { nome: PILARES[fraco].nome, media: mediasPilares[fraco] as number } : null,
    }
  }, [cidades, resumos])

  const total = dados.itens.length

  return (
    <div>
      <header className="mb-5 max-w-2xl">
        <p className="text-micro font-extrabold uppercase text-cinza">Análise geral</p>
        <h1 className="mt-1 text-titulo font-extrabold text-petroleo">Rede Cidades MIL</h1>
        <p className="mt-2 text-corpo text-cinza">
          Como as cidades se distribuem e quais se parecem. Cidades em estágios próximos se conectam mais forte.
        </p>
      </header>

      {total === 0 ? (
        <p className="rounded-xl border border-dashed border-linha bg-white p-6 text-center text-corpo text-cinza">
          Ainda não há cidades com dados. Assim que uma cidade tiver respostas, ela aparece aqui.
        </p>
      ) : (
        <>
          <section className="mb-5 grid grid-cols-3 gap-3" aria-label="Resumo da rede">
            {[
              { v: String(total), r: total === 1 ? 'cidade com dados' : 'cidades com dados' },
              { v: dados.media === null ? '—' : fmt(dados.media, 2), r: 'índice médio' },
              { v: String(dados.travadas), r: 'travadas pela Regra de Ouro' },
            ].map((k) => (
              <div key={k.r} className="rounded-xl border border-linha bg-white p-3.5">
                <div className="text-[1.625rem] font-extrabold leading-none tracking-[-0.02em] text-petroleo">{k.v}</div>
                <div className="mt-1.5 text-legenda text-cinza">{k.r}</div>
              </div>
            ))}
          </section>

          <section className="mb-5 rounded-[16px] border border-linha bg-white p-4 shadow-card" aria-label="Cidades por nível">
            <h2 className="mb-3 text-micro font-extrabold uppercase text-cinza">Cidades por nível</h2>
            <ul className="space-y-2.5">
              {NIVEIS.map((n, i) => (
                <li key={n} className="flex items-center gap-3 text-corpo">
                  <span className="w-[8.5rem] shrink-0 font-bold text-petroleo">
                    {i + 1} · {n}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-linha" aria-hidden>
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(dados.porNivel[i] / total) * 100}%`, backgroundColor: NIVEL_COLORS[i], transition: 'width 600ms cubic-bezier(0.2,0.9,0.25,1)' }}
                    />
                  </span>
                  <span className="w-6 text-right font-extrabold text-petroleo">{dados.porNivel[i]}</span>
                </li>
              ))}
            </ul>
          </section>

          {dados.fraco && (
            <section className="mb-5 rounded-[16px] border border-linha bg-white p-4 shadow-card">
              <h2 className="mb-1.5 text-micro font-extrabold uppercase text-cinza">O que a rede mostra</h2>
              <p className="text-corpo text-tinta">
                <strong className="text-petroleo">{dados.fraco.nome}</strong> é o pilar mais fraco: média {fmt(dados.fraco.media, 1)} nas cidades com dados.
              </p>
              {dados.travadas > 0 && (
                <p className="mt-1 text-legenda text-cinza">
                  {dados.travadas} {dados.travadas === 1 ? 'cidade está travada' : 'cidades estão travadas'} pela Regra de Ouro (Governança abaixo de 2,0).
                </p>
              )}
            </section>
          )}

          {total >= 3 ? (
            <section aria-label="Conexões entre as cidades">
              <h2 className="mb-2 text-subtitulo font-bold text-petroleo">Conexões</h2>
              <RedeReal itens={dados.itens} />
            </section>
          ) : (
            <p className="rounded-xl border border-dashed border-linha bg-white p-5 text-center text-corpo text-cinza">
              A rede de conexões ganha forma com 3 ou mais cidades com dados. Hoje há {total}.
            </p>
          )}
        </>
      )}
    </div>
  )
}
