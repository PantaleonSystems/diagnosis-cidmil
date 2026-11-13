const TRACOS: Record<number, React.ReactNode> = {
  // 1 Governança: prédio público
  1: (<><path d="M3 10 12 4l9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 20h18" /></>),
  // 2 Engajamento: pessoas
  2: (<><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="17" cy="9" r="2.3" /><path d="M16.5 14.2c2.6 0 4.5 1.6 4.5 4.3" /></>),
  // 3 Comunicação: balão de fala
  3: (<><path d="M4 5h16v11H11l-4 4v-4H4z" /><path d="M8 9.5h8M8 12.5h5" /></>),
  // 4 Infraestrutura: cruz da saúde sobre base
  4: (<><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" /></>),
  // 5 Planejamento: gráfico que sobe
  5: (<><path d="M4 4v16h16" /><path d="m7 15 4-4 3 3 5-6" /><path d="M16 8h3v3" /></>),
}

/** Ícone de linha (24×24) de cada frente; herda a cor do texto. */
export function IconeFrente({ numero, className }: { numero: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {TRACOS[numero]}
    </svg>
  )
}
