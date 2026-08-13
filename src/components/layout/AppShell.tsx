import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { ModuleBar } from '@/components/layout/ModuleBar'
import { useAuth } from '@/lib/auth'
import { CidadesProvider, useCidades } from '@/lib/cidadeAtiva'
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

      {/* Gaveta no mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-petroleo/50"
            onClick={() => setMenuAberto(false)}
          />
          <div className="relative h-full w-[250px]">
            <Sidebar aoNavegar={() => setMenuAberto(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0 px-6 pb-16 pt-6 lg:h-screen lg:overflow-y-auto lg:px-10 lg:pt-[34px]">
        <button
          onClick={() => setMenuAberto(true)}
          className="mb-4 rounded-lg border border-linha bg-white px-3 py-2 text-sm font-semibold text-petroleo lg:hidden"
        >
          ☰ Menu
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
  const { profile } = useAuth()
  const iniciais = (profile?.nome ?? 'Avaliador')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div className={cx('mb-6 flex flex-wrap items-start justify-between gap-4')}>
      <div>
        <h1 className="text-[26px] tracking-[-0.3px] text-petroleo">{titulo}</h1>
        <p className="mt-0.5 text-sm text-cinza">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        {acao}
        <div className="flex items-center gap-2.5 text-[13px] text-cinza">
          <span className="hidden sm:inline">{profile?.nome || 'Avaliador'}</span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ciano text-sm font-bold text-white">
            {iniciais || 'AV'}
          </span>
        </div>
      </div>
    </div>
  )
}
