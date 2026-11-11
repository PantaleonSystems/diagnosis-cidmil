import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { caminhoDaCidade, useCidades } from '@/lib/cidadeAtiva'
import { ehDemonstracao, nomeCurto, similaridade, ufVisivel } from '@/lib/cidades'
import { NIVEIS } from '@/lib/isps'
import { NIVEL_COLORS, fmt } from '@/lib/theme'

/** Cidades de estágio parecido com a cidade aberta: base para comparar e aprender junto. */
export function Conexoes() {
  const { cidadeAtiva, cidades, resumos } = useCidades()
  const meu = cidadeAtiva ? resumos.get(cidadeAtiva.id) : undefined

  const parecidas = useMemo(() => {
    if (!cidadeAtiva || !meu || meu.isps === null) return []
    return cidades
      .filter((c) => c.id !== cidadeAtiva.id)
      .map((c) => ({ c, r: resumos.get(c.id) }))
      .filter((x): x is { c: typeof x.c; r: NonNullable<typeof x.r> } => !!x.r && x.r.isps !== null)
      .map(({ c, r }) => ({ c, r, s: similaridade(meu.isps as number, r.isps as number) }))
      .sort((a, b) => b.s - a.s)
  }, [cidadeAtiva, cidades, resumos, meu])

  if (!cidadeAtiva) return null

  return (
    <div>
      <Topbar
        titulo="Conexões"
        sub={`${nomeCurto(cidadeAtiva)} · cidades em estágio parecido`}
        acao={
          <Link to="/app/rede" className="text-legenda font-bold text-ciano hover:underline">
            Ver a rede toda
          </Link>
        }
      />

      {!meu || meu.isps === null ? (
        <p className="rounded-xl border border-dashed border-linha bg-white p-6 text-center text-corpo text-cinza">
          Esta cidade ainda não tem dados. Quando tiver, mostramos aqui as cidades parecidas.
        </p>
      ) : parecidas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-linha bg-white p-6 text-center text-corpo text-cinza">
          Ainda não há outras cidades com dados para comparar. Solicite mais cidades para formar a rede.
        </p>
      ) : (
        <>
          <p className="mb-4 max-w-xl text-corpo text-cinza">
            A semelhança compara o índice das cidades. Quanto maior a barra, mais parecido o estágio. É um bom ponto de partida para comparar e aprender junto.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {parecidas.map(({ c, r, s }) => (
              <li key={c.id}>
                <Link
                  to={caminhoDaCidade(c.id)}
                  className="toque block rounded-[16px] border border-linha bg-white p-4 shadow-card transition-colors hover:border-ciano-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-subtitulo font-extrabold text-petroleo">{nomeCurto(c)}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-legenda text-cinza">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: NIVEL_COLORS[r.nivelExibido] }} aria-hidden />
                        {ufVisivel(c) && `${ufVisivel(c)} · `}Nível {r.nivelExibido + 1} · {NIVEIS[r.nivelExibido]}
                        {ehDemonstracao(c) && ' · demonstração'}
                      </div>
                    </div>
                    <div className="text-[1.625rem] font-extrabold leading-none tracking-[-0.02em] text-petroleo">{fmt(r.isps as number, 2)}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-linha" aria-hidden>
                      <span className="block h-full rounded-full bg-ciano-2" style={{ width: `${Math.round(s * 100)}%` }} />
                    </span>
                    <span className="text-legenda font-bold text-cinza">{Math.round(s * 100)}% parecida</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
