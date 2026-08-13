import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import { useCidades } from '@/lib/cidadeAtiva'
import { Marca } from '@/components/layout/Marca'
import { cx } from '@/components/ui'

const SECOES = [
  { to: '/app', fim: true, rotulo: 'Visão geral', icone: <IconeGrid /> },
  { to: '/app/avaliacao', rotulo: 'Avaliação', icone: <IconeCheck /> },
  { to: '/app/resultados', rotulo: 'Resultados por pilar', icone: <IconeBarras /> },
  { to: '/app/plano', rotulo: 'Plano de ação', icone: <IconePlano /> },
  { to: '/app/cidades', rotulo: 'Cidades', icone: <IconeCidade /> },
]

export function Sidebar({ aoNavegar }: { aoNavegar?: () => void }) {
  const { sair } = useAuth()
  const { cidadeAtiva, avaliacaoAtiva } = useCidades()

  return (
    <aside className="flex h-full min-h-screen w-[250px] shrink-0 flex-col bg-petroleo text-white">
      <div className="border-b border-white/10 px-[22px] py-5">
        <Marca tamanho="sm" invertido />
      </div>

      <div className="border-b border-white/10 px-[22px] py-[18px]">
        <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7FC4D2]">
          Cidade avaliada
        </div>
        <div className="mt-0.5 text-[17px] font-bold">
          {cidadeAtiva?.nome ?? 'Nenhuma cidade'}
        </div>
        <div className="mt-0.5 text-[11px] text-[#6FA9B6]">
          {cidadeAtiva
            ? `Módulo Saúde · ${avaliacaoAtiva ? `${avaliacaoAtiva.ano} · ${avaliacaoAtiva.status === 'concluida' ? 'concluída' : 'em rascunho'}` : 'sem avaliação'}`
            : 'Cadastre uma cidade para começar'}
        </div>
      </div>

      <nav className="flex-1 px-3 py-3.5">
        <div className="px-3.5 pb-1.5 pt-3.5 text-[10px] font-bold uppercase tracking-[1.5px] text-[#5F97A4]">
          Módulo Saúde · seções
        </div>
        {SECOES.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            end={s.fim}
            onClick={aoNavegar}
            className={({ isActive }) =>
              cx(
                'mb-[3px] flex w-full items-center gap-3 rounded-[9px] px-3.5 py-3',
                'text-sm font-semibold transition-colors duration-100',
                isActive
                  ? 'bg-ciano text-white'
                  : 'text-[#C4E4EC] hover:bg-white/[0.07] hover:text-white',
              )
            }
          >
            <span className="shrink-0" aria-hidden>
              {s.icone}
            </span>
            {s.rotulo}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-[22px] py-4 text-[11px] text-[#7FC4D2]">
        <div className="text-[#A9D8E2]">Powered by Pantaleon Systems</div>
        <div className="mt-0.5">Camada de verificação · em breve</div>
        <button
          onClick={() => void sair()}
          className="mt-2.5 py-2 text-left text-xs font-semibold text-[#C4E4EC] hover:text-white"
        >
          ⏻ Sair
        </button>
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------- ícones -- */

function svg(children: ReactNode) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

function IconeGrid() {
  return svg(
    <>
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </>,
  )
}

function IconeCheck() {
  return svg(
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </>,
  )
}

function IconeBarras() {
  return svg(
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>,
  )
}

function IconePlano() {
  return svg(
    <>
      <path d="M9 11H5a2 2 0 0 0-2 2v7h18v-7a2 2 0 0 0-2-2h-4" />
      <path d="M9 7a3 3 0 1 1 6 0" />
      <line x1="12" y1="3" x2="12" y2="13" />
    </>,
  )
}

function IconeCidade() {
  return svg(
    <>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
    </>,
  )
}
