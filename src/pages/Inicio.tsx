import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CartaoCidade } from '@/components/cidades/CartaoCidade'
import { useNovaCidade } from '@/components/cidades/NovaCidade'
import { Chip } from '@/components/mobile/Chip'
import { Button, Input, cx } from '@/components/ui'
import { caminhoDaCidade, useCidades } from '@/lib/cidadeAtiva'
import { ehDemonstracao, nomeCurto, textoBusca } from '@/lib/cidades'
import { NIVEIS } from '@/lib/isps'
import { normalizar } from '@/lib/localidades'
import { NIVEL_COLORS, fmt } from '@/lib/theme'

type Filtro = 'todas' | 'atencao' | 'andamento' | 'concluidas'

/**
 * Ponto de partida: nenhuma cidade aberta. Mostra o panorama das cidades e a
 * lista para escolher onde trabalhar. Ao tocar numa cidade, entra o ambiente dela.
 */
export function Inicio() {
  const { cidades, resumos, ultimaVisitada } = useCidades()
  const { abrirNovaCidade } = useNovaCidade()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const panorama = useMemo(() => {
    const comDados = cidades.map((c) => resumos.get(c.id)).filter((r) => r && r.isps !== null)
    const concluidas = comDados.filter((r) => r?.concluida)
    const media = concluidas.length
      ? concluidas.reduce((s, r) => s + (r?.isps ?? 0), 0) / concluidas.length
      : null
    const porNivel = [0, 0, 0, 0]
    for (const r of comDados) if (r) porNivel[r.nivelExibido] += 1
    return {
      total: cidades.length,
      media,
      andamento: cidades.filter((c) => {
        const r = resumos.get(c.id)
        return !r?.concluida
      }).length,
      atencao: comDados.filter((r) => r?.travado || r?.nivelExibido === 0).length,
      porNivel,
      comDados: comDados.length,
    }
  }, [cidades, resumos])

  const lista = useMemo(() => {
    const t = normalizar(busca)
    return cidades
      .filter((c) => {
        const r = resumos.get(c.id)
        if (t && !textoBusca(c).includes(t)) return false
        if (filtro === 'atencao') return !!r && r.isps !== null && (r.travado || r.nivelExibido === 0)
        if (filtro === 'andamento') return !r?.concluida
        if (filtro === 'concluidas') return !!r?.concluida
        return true
      })
      .sort((a, b) => Number(ehDemonstracao(a)) - Number(ehDemonstracao(b)) || nomeCurto(a).localeCompare(nomeCurto(b), 'pt-BR'))
  }, [cidades, resumos, busca, filtro])

  const soDemonstracao = cidades.length > 0 && cidades.every(ehDemonstracao)

  if (cidades.length === 0) return <PrimeiroAcesso aoSolicitar={abrirNovaCidade} />

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="text-titulo font-extrabold text-petroleo">Qual cidade você quer acompanhar?</h1>
          <p className="mt-2 text-corpo text-cinza">Escolha uma cidade para abrir o diagnóstico ou solicite uma nova.</p>
        </div>
        <div className="hidden lg:block">
          <Button className="alvo" onClick={abrirNovaCidade}>
            + Solicitar nova cidade
          </Button>
        </div>
      </header>

      {ultimaVisitada && !soDemonstracao && (
        <Link
          to={caminhoDaCidade(ultimaVisitada.id)}
          className="toque mb-4 flex items-center justify-between gap-3 rounded-xl border border-ciano/30 bg-ciano-cl px-4 py-3"
        >
          <span className="min-w-0">
            <span className="block text-micro font-bold uppercase text-ciano-esc">Continuar de onde parou</span>
            <span className="block truncate text-corpo font-bold text-petroleo">{nomeCurto(ultimaVisitada)}</span>
          </span>
          <span className="text-corpo font-bold text-ciano" aria-hidden>→</span>
        </Link>
      )}

      {soDemonstracao && (
        <div className="mb-4 rounded-xl border border-ciano/30 bg-ciano-cl p-4">
          <p className="text-corpo font-bold text-petroleo">Você ainda não solicitou uma cidade.</p>
          <p className="mt-1 text-legenda text-cinza">
            O Município Exemplo é uma demonstração com dados fictícios. Solicite o seu município para começar de verdade.
          </p>
          <Button className="alvo mt-3 w-full sm:w-auto" onClick={abrirNovaCidade}>Solicitar minha cidade</Button>
        </div>
      )}

      <section className="mb-5 rounded-[16px] border border-linha bg-white p-4 shadow-card" aria-label="Panorama das cidades">
        <div className="flex items-baseline justify-between">
          <h2 className="text-micro font-extrabold uppercase text-cinza">Panorama da rede</h2>
          <Link to="/app/rede" className="text-legenda font-bold text-ciano hover:underline">Ver rede</Link>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {[
            { v: String(panorama.total), r: panorama.total === 1 ? 'cidade' : 'cidades' },
            { v: panorama.media === null ? '—' : fmt(panorama.media, 2), r: 'índice médio' },
            { v: String(panorama.andamento), r: 'em andamento' },
            { v: String(panorama.atencao), r: 'precisam de atenção' },
          ].map((k) => (
            <div key={k.r}>
              <dd className="text-[1.625rem] font-extrabold leading-none tracking-[-0.02em] text-petroleo">{k.v}</dd>
              <dt className="mt-1 text-legenda text-cinza">{k.r}</dt>
            </div>
          ))}
        </dl>
        {panorama.comDados > 0 && (
          <>
            <div className="mt-4 flex gap-[3px]" role="img" aria-label={`Cidades por nível: ${NIVEIS.map((n, i) => `${n} ${panorama.porNivel[i]}`).join(', ')}`}>
              {panorama.porNivel.map((n, i) => (
                <div key={i} className="h-2 rounded-full" style={{ flex: Math.max(n, 0.15), backgroundColor: NIVEL_COLORS[i], opacity: n === 0 ? 0.25 : 1 }} />
              ))}
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-legenda text-cinza">
              {NIVEIS.map((n, i) => (
                <li key={n} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: NIVEL_COLORS[i] }} aria-hidden />
                  {n} <strong className="text-petroleo">{panorama.porNivel[i]}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="mb-3 flex items-center gap-2.5 rounded-xl border-[1.5px] border-linha bg-white px-3.5 focus-within:border-ciano">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0 text-cinza" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <Input
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Buscar cidade ou estado"
          aria-label="Buscar cidade ou estado"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="!border-0 !bg-transparent !px-0 !py-3 text-base focus:!bg-transparent"
        />
      </div>

      <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0" role="group" aria-label="Filtrar cidades">
        {(
          [
            ['todas', 'Todas'],
            ['atencao', `Precisa de atenção · ${panorama.atencao}`],
            ['andamento', `Em andamento · ${panorama.andamento}`],
            ['concluidas', 'Concluídas'],
          ] as [Filtro, string][]
        ).map(([id, rotulo]) => (
          <Chip key={id} ativo={filtro === id} onClick={() => setFiltro(id)}>
            {rotulo}
          </Chip>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-linha bg-white p-6 text-center text-corpo text-cinza">
          Nenhuma cidade encontrada com esses filtros.
        </p>
      ) : (
        <div className={cx('grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3')}>
          {lista.map((c) => (
            <CartaoCidade key={c.id} cidade={c} resumo={resumos.get(c.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function PrimeiroAcesso({ aoSolicitar }: { aoSolicitar: () => void }) {
  const passos = [
    ['1', 'Escolha a cidade', 'País, estado e município numa lista oficial.'],
    ['2', 'Acompanhe os dados', 'Veja o que já foi reunido e o que falta.'],
    ['3', 'Leia o diagnóstico', 'Índice, pontos de atenção e o plano de ação.'],
  ]
  return (
    <div className="mx-auto max-w-lg pt-8 text-center lg:pt-16">
      <svg viewBox="0 0 342 160" className="mx-auto mb-6 h-auto w-full max-w-[340px]" aria-hidden>
        <g stroke="#2395C6" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round">
          <line x1="171" y1="80" x2="60" y2="35" /><line x1="171" y1="80" x2="285" y2="32" /><line x1="171" y1="80" x2="70" y2="130" /><line x1="171" y1="80" x2="280" y2="128" />
        </g>
        <circle cx="171" cy="80" r="40" fill="#2395C6" fillOpacity="0.14" />
        <circle cx="171" cy="80" r="28" fill="#0A5A96" stroke="#fff" strokeWidth="4" />
        <circle cx="60" cy="35" r="15" fill="#9CCBEA" stroke="#fff" strokeWidth="3" /><circle cx="285" cy="32" r="17" fill="#2395C6" stroke="#fff" strokeWidth="3" /><circle cx="70" cy="130" r="13" fill="#0A5A96" stroke="#fff" strokeWidth="3" /><circle cx="280" cy="128" r="16" fill="#052F4D" stroke="#fff" strokeWidth="3" />
      </svg>
      <h1 className="text-titulo font-extrabold text-petroleo">Comece pela sua primeira cidade</h1>
      <p className="mt-2 text-corpo text-cinza">
        Escolha o município e acompanhe o diagnóstico. Sem formulários longos.
      </p>
      <ol className="mx-auto mt-6 max-w-sm space-y-3 text-left">
        {passos.map(([n, t, d]) => (
          <li key={n} className="flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ciano-cl text-corpo font-extrabold text-ciano-esc">{n}</span>
            <span>
              <span className="block text-corpo font-bold text-petroleo">{t}</span>
              <span className="block text-legenda text-cinza">{d}</span>
            </span>
          </li>
        ))}
      </ol>
      <Button className="alvo mt-8 w-full" onClick={aoSolicitar}>Solicitar minha cidade</Button>
    </div>
  )
}
