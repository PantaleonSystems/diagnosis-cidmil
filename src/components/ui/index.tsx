/** Peças visuais reutilizáveis, com a identidade CIIDCMIL do protótipo. */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(' ')

/* -------------------------------------------------------------- Button -- */

type Variante = 'primario' | 'ghost' | 'claro'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-ciano text-white hover:bg-ciano-esc',
  ghost:
    'bg-transparent text-ciano-esc border-[1.5px] border-ciano hover:bg-ciano-cl',
  claro: 'bg-white text-ciano-esc hover:bg-ciano-cl',
}

export function Button({
  variante = 'primario',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-[22px] py-[11px]',
        'text-sm font-bold transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-55',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ciano',
        VARIANTES[variante],
        className,
      )}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------- Card -- */

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cx(
        'rounded-card border border-linha bg-white p-6 shadow-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardTitulo({
  titulo,
  sub,
}: {
  titulo: string
  sub?: string
}) {
  return (
    <div className="mb-4">
      <h3 className="text-[15px] text-petroleo">{titulo}</h3>
      {sub && <p className="mt-1 text-[12.5px] text-cinza">{sub}</p>}
    </div>
  )
}

/* -------------------------------------------------------------- Inputs -- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[12.5px] font-bold text-tinta">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-cinza-cl">{hint}</span>}
    </label>
  )
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        'w-full rounded-[9px] border-[1.5px] border-linha bg-[#FBFDFE] px-3.5 py-3',
        'text-sm text-tinta transition-colors duration-150 placeholder:text-cinza-cl',
        'focus:border-ciano focus:bg-white focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------- Badge / Pill -- */

export function Pill({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={cx(
        'inline-block rounded-[20px] px-2.5 py-[3px] text-[11px] font-bold tracking-[0.3px]',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  )
}

/** Quadradinho colorido com a nota 0–4. */
export function NotaBadge({ nota, cor }: { nota: number; cor: string }) {
  return (
    <span
      className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-[13px] font-extrabold text-white"
      style={{ backgroundColor: cor }}
    >
      {nota}
    </span>
  )
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'text-[11px] font-bold uppercase tracking-[2px] text-ciano-esc',
        className,
      )}
    >
      {children}
    </span>
  )
}

/* --------------------------------------------------------------- Aviso -- */

export function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-[9px] border border-aviso-borda bg-aviso-bg px-3 py-2.5 text-xs text-aviso-txt">
      <span aria-hidden>⚠</span>
      <span>{children}</span>
    </div>
  )
}

export function Erro({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <div
      role="alert"
      className="mb-4 rounded-[9px] border border-[#F3CFC0] bg-[#FCEEE9] px-3 py-2.5 text-xs text-[#B3532F]"
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------- Estado -- */

export function Splash({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg">
      <div className="flex flex-col items-center gap-3 text-cinza">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-linha border-t-ciano" />
        <span className="text-sm">{texto}</span>
      </div>
    </div>
  )
}

export function Vazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao: string
  acao?: ReactNode
}) {
  return (
    <Card className="text-center">
      <h3 className="mb-2 text-[15px] text-petroleo">{titulo}</h3>
      <p className="mx-auto mb-5 max-w-md text-[13.5px] text-cinza">{descricao}</p>
      {acao}
    </Card>
  )
}
