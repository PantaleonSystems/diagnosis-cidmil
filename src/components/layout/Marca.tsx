import { cx } from '@/components/ui'

/**
 * Assinatura Cidades MIL: logo (SVG em `public/logo-cidades-mil.svg`) + nome.
 * A logo atual é temporária; para trocar, substitua o arquivo SVG.
 * Alturas: ~36px no header, ~28px na sidebar.
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
          'shrink-0',
          // Sobre fundo escuro a logo (azul-escuro) precisa de um cartão claro.
          invertido && 'grid place-items-center rounded-lg bg-white p-0.5',
        )}
      >
        <img
          src="/logo-cidades-mil.svg"
          alt=""
          aria-hidden
          className={cx(sm ? 'h-9 w-9' : 'h-11 w-11 sm:h-12 sm:w-12')}
        />
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
            invertido ? 'text-[#8FC3E3]' : 'text-cinza-cl',
          )}
        >
          Cidades MIL
        </span>
      </span>
    </span>
  )
}
