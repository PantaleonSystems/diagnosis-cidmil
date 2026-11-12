import { maturidade, type Nota } from '@/lib/calculos'
import { NOTE_COLORS } from '@/lib/theme'
import { cx } from '@/components/ui'

/**
 * Nota 0–4 com três sinais ao mesmo tempo: cor, número e rótulo de maturidade.
 * A cor sozinha não carrega o significado (daltonismo, sol na tela, impressão).
 * Texto sempre em tinta escura sobre fundo claro: contraste alto em qualquer nota.
 */
export function SeloNota({
  nota,
  rotulo = true,
  className,
}: {
  nota: Nota
  rotulo?: boolean
  className?: string
}) {
  const cor = NOTE_COLORS[nota]
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-full py-1 pl-1.5 pr-3 text-legenda font-bold text-tinta',
        className,
      )}
      style={{ backgroundColor: `${cor}1f`, boxShadow: `inset 0 0 0 1.5px ${cor}66` }}
      aria-label={`Nota ${nota}, ${maturidade(nota)}`}
    >
      <span
        className="grid h-6 w-6 place-items-center rounded-full text-[12px] font-extrabold text-tinta"
        style={{ backgroundColor: `${cor}59` }}
        aria-hidden
      >
        {nota}
      </span>
      {rotulo && <span aria-hidden>{maturidade(nota)}</span>}
    </span>
  )
}
