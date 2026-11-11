import type { ReactNode } from 'react'

function Icone({ children, ativo }: { children: ReactNode; ativo?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ativo ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export const IcoVisaoGeral = ({ ativo }: { ativo?: boolean }) => (
  <Icone ativo={ativo}>
    <rect x="3.5" y="3.5" width="7" height="8" rx="1.8" />
    <rect x="13.5" y="3.5" width="7" height="5" rx="1.8" />
    <rect x="13.5" y="11.5" width="7" height="9" rx="1.8" />
    <rect x="3.5" y="14.5" width="7" height="6" rx="1.8" />
  </Icone>
)
export const IcoAvaliar = ({ ativo }: { ativo?: boolean }) => (
  <Icone ativo={ativo}>
    <path d="M9 11l2.2 2.2L15.5 9" />
    <rect x="4" y="3.5" width="16" height="17" rx="3" />
  </Icone>
)
export const IcoResultados = ({ ativo }: { ativo?: boolean }) => (
  <Icone ativo={ativo}>
    <path d="M5 20V12M12 20V5M19 20v-5" />
  </Icone>
)
export const IcoPlano = ({ ativo }: { ativo?: boolean }) => (
  <Icone ativo={ativo}>
    <path d="M5 4v17" />
    <path d="M5 5h11l-2 3.5 2 3.5H5" />
  </Icone>
)
export const IcoCidades = ({ ativo }: { ativo?: boolean }) => (
  <Icone ativo={ativo}>
    <path d="M4 20V9l5-3v14M9 20V4l7 3v13M16 20h4v-8l-4-2M3 20h18" />
  </Icone>
)
