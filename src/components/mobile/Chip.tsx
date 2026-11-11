import type { ButtonHTMLAttributes } from 'react'
import { cx } from '@/components/ui'

/** Chip de filtro. Visual de 36 px, área de toque de 44 px (a margem é invisível). */
export function Chip({
  ativo = false,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { ativo?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      className={cx(
        'toque relative inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-3.5',
        'text-legenda font-bold transition-colors duration-150',
        "before:absolute before:-inset-1 before:content-['']",
        ativo
          ? 'border-ciano bg-ciano text-white'
          : 'border-linha bg-white text-ciano-esc hover:border-ciano-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
