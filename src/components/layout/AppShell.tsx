import { Suspense, type ReactNode } from 'react'
import { Link, Outlet, useLocation, useMatch } from 'react-router-dom'
import { SidebarCidade, SidebarInicio } from '@/components/layout/Sidebar'
import { Marca } from '@/components/layout/Marca'
import { NovaCidadeProvider, useNovaCidade } from '@/components/cidades/NovaCidade'
import { BarraAbas, type ItemAba } from '@/components/mobile/BarraAbas'
import { IcoAvaliar, IcoCidades, IcoMais, IcoPlano, IcoRede, IcoResultados, IcoVisaoGeral } from '@/components/mobile/icones'
import { CidadesProvider, useCidades } from '@/lib/cidadeAtiva'
import { ehDemonstracao } from '@/lib/cidades'
import { CatalogoProvider, useCatalogo } from '@/lib/catalogo'
import { Erro, SeloBeta, Splash, cx } from '@/components/ui'

/**
 * Casca do app. Dois contextos com navegação própria:
 *  - Início (/app, /app/rede): nenhuma cidade aberta;
 *  - Ambiente da cidade (/app/cidades/:id/...): barra lateral/abas da cidade e caminho de volta.
 * Desktop: barra lateral. Celular: cabeçalho compacto + barra de abas inferior.
 */
export function AppShell() {
  return (
    <CatalogoProvider>
      <CidadesProvider>
        <NovaCidadeProvider>
          <Conteudo />
        </NovaCidadeProvider>
      </CidadesProvider>
    </CatalogoProvider>
  )
}

function Conteudo() {
  const { carregando: carregandoCidades, erro: erroCidades } = useCidades()
  const { erro: erroCatalogo } = useCatalogo()
  const naCidade = useMatch('/app/cidades/:cidadeId/*') !== null

  if (carregandoCidades) return <Splash texto="Carregando o diagnóstico…" />

  return (
    <div className="min-h-tela bg-app-bg lg:grid lg:grid-cols-[250px_1fr]">
      <div className="sticky top-0 hidden h-screen lg:block">{naCidade ? <SidebarCidade /> : <SidebarInicio />}</div>

      <main className="min-w-0 px-5 pb-28 lg:h-screen lg:overflow-y-auto lg:px-10 lg:pb-16 lg:pt-[34px]">
        <CabecalhoMobile naCidade={naCidade} />

        {(erroCidades ?? erroCatalogo) && (
          <Erro>
            {erroCidades ?? erroCatalogo}
            {' — verifique se as migrations foram aplicadas no Supabase.'}
          </Erro>
        )}

        <div className="pt-5 lg:pt-0">
          <Suspense fallback={<p className="py-16 text-center text-corpo text-cinza">Carregando…</p>}>
            <Outlet />
          </Suspense>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-linha pt-4.5 text-[11.5px] text-cinza">
          <span>Plataforma de Diagnóstico Cidades MIL · CIIDCMIL</span>
          <span>Powered by Pantaleon Systems</span>
        </footer>
      </main>

      <AbasMobile naCidade={naCidade} />
    </div>
  )
}

/** Cabeçalho do celular: marca no Início; voltar + nome da cidade dentro dela. */
function CabecalhoMobile({ naCidade }: { naCidade: boolean }) {
  const { cidadeAtiva } = useCidades()
  return (
    <header
      className="vidro sticky top-0 z-20 -mx-5 mb-1 flex items-center justify-between gap-3 border-b border-linha px-5 pb-2.5 lg:hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0.625rem)' }}
    >
      {naCidade ? (
        <>
          <Link to="/app" className="alvo toque -ml-2 flex items-center gap-1 rounded-lg px-2 text-corpo font-bold text-marca">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 5l-7 7 7 7" />
            </svg>
            Todas as cidades
          </Link>
          {cidadeAtiva && ehDemonstracao(cidadeAtiva) && (
            <span className="rounded-full bg-marca-fundo px-2.5 py-1 text-micro font-extrabold uppercase text-marca-escura">Demonstração</span>
          )}
        </>
      ) : (
        <>
          <Marca tamanho="sm" />
          <SeloBeta />
        </>
      )}
    </header>
  )
}

/** Barra de abas do celular, que muda conforme o contexto (Início ou cidade). */
function AbasMobile({ naCidade }: { naCidade: boolean }) {
  const { pathname } = useLocation()
  const { caminhoCidade } = useCidades()
  const { abrirNovaCidade } = useNovaCidade()

  if (!naCidade) {
    const itens: ItemAba[] = [
      { id: 'cidades', rotulo: 'Cidades', icone: IcoCidades, to: '/app', fim: true },
      { id: 'nova', rotulo: 'Solicitar nova cidade', icone: IcoMais, destaque: true },
      { id: 'rede', rotulo: 'Rede', icone: IcoRede, to: '/app/rede' },
    ]
    return (
      <BarraAbas
        itens={itens}
        ativoId={pathname.startsWith('/app/rede') ? 'rede' : 'cidades'}
        aoEscolher={(id) => id === 'nova' && abrirNovaCidade()}
        className="lg:hidden"
      />
    )
  }

  const itens: ItemAba[] = [
    { id: 'geral', rotulo: 'Geral', icone: IcoVisaoGeral, to: caminhoCidade(), fim: true },
    { id: 'dados', rotulo: 'Dados', icone: IcoAvaliar, to: caminhoCidade('dados') },
    { id: 'resultados', rotulo: 'Resultados', icone: IcoResultados, to: caminhoCidade('resultados') },
    { id: 'plano', rotulo: 'Plano', icone: IcoPlano, to: caminhoCidade('plano') },
    { id: 'conexoes', rotulo: 'Conexões', icone: IcoRede, to: caminhoCidade('conexoes') },
  ]
  const ultimo = pathname.split('/').filter(Boolean).pop() ?? ''
  const ativo = ultimo === 'avaliacao' ? 'dados' : itens.some((i) => i.id === ultimo) ? ultimo : 'geral'
  return <BarraAbas itens={itens} ativoId={ativo} className="lg:hidden" />
}

/** Cabeçalho padrão das telas internas. */
export function Topbar({
  titulo,
  sub,
  acao,
}: {
  titulo: string
  sub: string
  acao?: ReactNode
}) {
  return (
    <div className={cx('mb-6 flex flex-wrap items-start justify-between gap-4')}>
      <div>
        <h1 className="text-[26px] tracking-[-0.3px] text-noite">{titulo}</h1>
        <p className="mt-0.5 text-sm text-cinza">{sub}</p>
      </div>
      <div className="flex items-center gap-3">{acao}</div>
    </div>
  )
}
