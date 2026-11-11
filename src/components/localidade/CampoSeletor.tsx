import { cx } from '@/components/ui'

/**
 * Campo que abre um seletor (não aceita digitação direta): mostra o valor
 * escolhido ou o texto de ajuda. Altura de 48 px, fácil de tocar.
 */
export function CampoSeletor({
  rotulo,
  valor,
  placeholder,
  detalhe,
  desabilitado,
  aoAbrir,
  dica,
}: {
  rotulo: string
  valor: string | null
  placeholder: string
  detalhe?: string | null
  desabilitado?: boolean
  aoAbrir: () => void
  dica?: string
}) {
  return (
    <div className="mb-4">
      <span className="mb-1.5 block text-[12.5px] font-bold text-tinta">{rotulo}</span>
      <button
        type="button"
        disabled={desabilitado}
        onClick={aoAbrir}
        aria-haspopup="dialog"
        className={cx(
          'toque flex min-h-12 w-full items-center justify-between gap-3 rounded-[9px] border-[1.5px] px-3.5 py-2.5 text-left',
          'text-corpo transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ciano',
          valor ? 'border-ciano-2 bg-white text-petroleo' : 'border-linha bg-[#FBFDFE] text-cinza-cl',
          desabilitado && 'cursor-not-allowed opacity-55',
        )}
      >
        <span className="min-w-0">
          <span className={cx('block truncate', valor && 'font-bold')}>{valor ?? placeholder}</span>
          {valor && detalhe && <span className="block truncate text-legenda text-cinza">{detalhe}</span>}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-cinza-cl" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {dica && <span className="mt-1 block text-[11.5px] text-cinza-cl">{dica}</span>}
    </div>
  )
}
