import { cx } from '@/components/ui'

/**
 * Assinatura CIIDCMIL.
 *
 * Placeholder tipográfico — para usar o logotipo oficial, coloque o arquivo em
 * `src/assets/ciidcmil.svg` e troque o conteúdo por um <img>. As medidas aqui
 * (altura ~34px no header, ~26px na sidebar) seguem o protótipo.
 */
export function Marca({
  tamanho = 'md',
  invertido = false,
  className,
}: {
  tamanho?: 'sm' | 'md'
  invertido?: boolean
  className?: string
}) {
  const sm = tamanho === 'sm'
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <span
        className={cx(
          'grid place-items-center rounded-lg bg-ciano font-extrabold text-white',
          sm ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-base',
        )}
        aria-hidden
      >
        C
      </span>
      <span className="leading-none">
        <span
          className={cx(
            'block font-extrabold tracking-[0.5px]',
            sm ? 'text-[13px]' : 'text-[15px]',
            invertido ? 'text-white' : 'text-petroleo',
          )}
        >
          CIIDCMIL
        </span>
        <span
          className={cx(
            'mt-0.5 block text-[9px] uppercase tracking-[1.2px]',
            invertido ? 'text-[#7FC4D2]' : 'text-cinza-cl',
          )}
        >
          Cidades MIL
        </span>
      </span>
    </span>
  )
}
