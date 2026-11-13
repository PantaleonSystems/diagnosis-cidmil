import type { ReactNode } from 'react'

const TRACOS: Record<string, ReactNode> = {
  saude: (<><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /><path d="M7.5 12.2h2.3l1.4-3 1.8 5.4 1.4-2.4H17" /></>),
  educacao: (<><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" /></>),
  gov: (<><path d="M3 10 12 4l9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 20h18" /></>),
  bibliotecas: (<><path d="M5 4v16M10 4v16M15 6.5l4 13.5" /><path d="M3 20h18" /></>),
  mobilidade: (<><path d="M9 21 11 3M15 21 13 3" /><path d="M12 6v3M12 12v3M12 18v2" /></>),
  cultura: (<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />),
  associacoes: (<><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="17" cy="9" r="2.3" /><path d="M16.5 14.2c2.6 0 4.5 1.6 4.5 4.3" /></>),
  midias: (<><circle cx="12" cy="12" r="2" /><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" /></>),
  ia: (<><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" /></>),
  seguranca: (<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />),
  ambiente: (<><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" /><path d="M5 19c2-4 5-7 9-9" /></>),
  vulneraveis: (<><path d="M3 12a9 9 0 0 1 18 0z" /><path d="M12 12v6a2 2 0 0 0 4 0" /></>),
  integracao: (<><circle cx="12" cy="12" r="2.5" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="12" cy="20" r="2" /><path d="m6.5 7.5 3.5 3M17.5 7.5l-3.5 3M12 14.5V18" /></>),
}

/** Símbolo de linha (24×24) de cada área do framework. */
export function IconeArea({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {TRACOS[id]}
    </svg>
  )
}
