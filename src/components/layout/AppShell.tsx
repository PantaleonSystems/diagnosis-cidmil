import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { ModuleBar } from '@/components/layout/ModuleBar'
import { CidadesProvider, useCidades } from '@/lib/cidadeAtiva'
import { Gaveta } from '@/components/mobile/Gaveta'
import { CatalogoProvider, useCatalogo } from '@/lib/catalogo'
import { Erro, Splash, cx } from '@/components/ui'

/** Layout protegido: sidebar fixa de 250px + área principal fluida. */
export function AppShell() {
  return (
    <CatalogoProvider>
      <CidadesProvider>
        <Conteudo />
      </CidadesProvider>
    </CatalogoProvider>
  )
}

function Conteudo() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { carregando: carregandoCidades, erro: erroCidades } = useCidades()
  const { erro: erroCatalogo } = useCatalogo()

  if (carregandoCidades) return <Splash texto="Carregando o diagnóstico…" />

  return (
    <div className="min-h-screen bg-app-bg lg:grid lg:grid-cols-[250px_1fr]">
      {/* Sidebar fixa no desktop */}
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>

      {/* Gaveta no mobile: desliza da esquerda, com mola */}
      <Gaveta aberto={menuAberto} aoFechar={() => setMenuAberto(false)}>
        <Sidebar aoNavegar={() => setMenuAberto(false)} />
      </Gaveta>

      <main className="min-w-0 px-6 pb-16 pt-6 lg:h-screen lg:overflow-y-auto lg:px-10 lg:pt-[34px]">
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-haspopup="dialog"
          aria-expanded={menuAberto}
          className="alvo toque mb-4 inline-flex items-center gap-2 rounded-lg border border-linha bg-white px-3.5 text-sm font-semibold text-petroleo shadow-sm lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
          Menu
        </button>

        {(erroCidades ?? erroCatalogo) && (
          <Erro>
            {erroCidades ?? erroCatalogo}
            {' — verifique se as migrations foram aplicadas no Supabase.'}
          </Erro>
        )}

        <ModuleBar />
        <Outlet />

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-linha pt-4.5 text-[11.5px] text-cinza-cl">
          <span>Plataforma de Diagnóstico Cidades MIL · CIIDCMIL</span>
          <span>Powered by Pantaleon Systems</span>
        </footer>
      </main>
    </div>
  )
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
        <h1 className="text-[26px] tracking-[-0.3px] text-petroleo">{titulo}</h1>
        <p className="mt-0.5 text-sm text-cinza">{sub}</p>
      </div>
      <div className="flex items-center gap-3">{acao}</div>
    </div>
  )
}
