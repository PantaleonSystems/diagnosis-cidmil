import { Link, NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useCidades } from '@/lib/cidadeAtiva'
import { ehDemonstracao, nomeCurto, ufVisivel } from '@/lib/cidades'
import { Marca } from '@/components/layout/Marca'
import { cx, SeloBeta } from '@/components/ui'

interface Secao {
  to: string
  fim?: boolean
  rotulo: string
  icone: ReactNode
  /** subpágina que também deixa este item ativo */
  tambem?: string
}

function Cabecalho() {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 px-[22px] py-5">
      <Marca tamanho="sm" invertido />
      <SeloBeta />
    </div>
  )
}

function Rodape() {
  return (
    <div className="border-t border-white/10 px-[22px] py-4 text-[11px] text-lateral-3">
      <div className="text-lateral-2">Powered by Pantaleon Systems</div>
      <div className="mt-0.5">Versão beta · dados de teste</div>
    </div>
  )
}

function Lista({ titulo, secoes }: { titulo: string; secoes: Secao[] }) {
  const { pathname } = useLocation()
  return (
    <nav className="flex-1 px-3 py-3.5" aria-label={titulo}>
      <div className="px-3.5 pb-1.5 pt-3.5 text-[10px] font-bold uppercase tracking-[1.5px] text-lateral-5">
        {titulo}
      </div>
      {secoes.map((s) => (
        <NavLink
          key={s.to}
          to={s.to}
          end={s.fim}
          className={({ isActive }) => {
            const ativo = isActive || (!!s.tambem && pathname.endsWith(`/${s.tambem}`))
            return cx(
              'mb-[3px] flex w-full items-center gap-3 rounded-[9px] px-3.5 py-3',
              'text-sm font-semibold transition-colors duration-100',
              ativo ? 'bg-marca text-white' : 'text-lateral-1 hover:bg-white/[0.07] hover:text-white',
            )
          }}
        >
          <span className="shrink-0" aria-hidden>
            {s.icone}
          </span>
          {s.rotulo}
        </NavLink>
      ))}
    </nav>
  )
}

/** Barra lateral do Início: nenhuma cidade aberta. */
export function SidebarInicio() {
  const secoes: Secao[] = [
    { to: '/app', fim: true, rotulo: 'Cidades', icone: <IconeCidade /> },
    { to: '/app/rede', rotulo: 'Rede Cidades MIL', icone: <IconeRede /> },
  ]
  return (
    <aside className="flex h-full min-h-screen w-[250px] shrink-0 flex-col bg-noite text-white">
      <Cabecalho />
      <Lista titulo="Cidades MIL" secoes={secoes} />
      <Rodape />
    </aside>
  )
}

/** Barra lateral do ambiente de uma cidade: navegação própria e caminho de volta. */
export function SidebarCidade() {
  const { cidadeAtiva, avaliacaoAtiva, caminhoCidade } = useCidades()
  const secoes: Secao[] = [
    { to: caminhoCidade(), fim: true, rotulo: 'Visão geral', icone: <IconeGrid /> },
    { to: caminhoCidade('dados'), rotulo: 'Dados', icone: <IconeCheck />, tambem: 'avaliacao' },
    { to: caminhoCidade('resultados'), rotulo: 'Resultados por pilar', icone: <IconeBarras /> },
    { to: caminhoCidade('plano'), rotulo: 'O que fazer primeiro', icone: <IconePlano /> },
    { to: caminhoCidade('conexoes'), rotulo: 'Conexões', icone: <IconeRede /> },
  ]
  return (
    <aside className="flex h-full min-h-screen w-[250px] shrink-0 flex-col bg-noite text-white">
      <Cabecalho />

      <Link
        to="/app"
        className="mx-3 mt-3 flex items-center gap-2 rounded-[9px] px-3.5 py-2.5 text-sm font-semibold text-lateral-3 transition-colors hover:bg-white/[0.07] hover:text-white"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 5l-7 7 7 7" />
        </svg>
        Todas as cidades
      </Link>

      <div className="border-b border-white/10 px-[22px] py-[18px]">
        <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-lateral-3">Cidade</div>
        <div className="mt-0.5 text-[17px] font-bold leading-tight">{cidadeAtiva ? nomeCurto(cidadeAtiva) : '—'}</div>
        <div className="mt-1 text-[11px] text-lateral-4">
          {cidadeAtiva && ufVisivel(cidadeAtiva) ? `${ufVisivel(cidadeAtiva)} · ` : ''}
          Módulo Saúde
          {avaliacaoAtiva ? ` · ${avaliacaoAtiva.ano} · ${avaliacaoAtiva.status === 'concluida' ? 'concluída' : 'em andamento'}` : ''}
        </div>
        {cidadeAtiva && ehDemonstracao(cidadeAtiva) && (
          <span className="mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[1px] text-lateral-1">
            Demonstração
          </span>
        )}
      </div>

      <Lista titulo="Nesta cidade" secoes={secoes} />
      <Rodape />
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

function IconeRede() {
  return svg(
    <>
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8 8.5l3 7M16.5 8l-3.5 8M8.5 7h7" />
    </>,
  )
}
