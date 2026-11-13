/** Peças visuais reutilizáveis, com a identidade CIIDCMIL do protótipo. */
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import mapaUfs from '@/data/mapa-ufs.json'

const MAPA_UFS = mapaUfs as Record<string, string>

export const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(' ')

/* -------------------------------------------------------------- Button -- */

type Variante = 'primario' | 'ghost' | 'claro'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-marca text-white hover:bg-marca-escura',
  ghost:
    'bg-transparent text-marca-escura border-[1.5px] border-marca hover:bg-marca-fundo',
  claro: 'bg-white text-marca-escura hover:bg-marca-fundo',
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
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca',
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
      <h3 className="text-[15px] text-noite">{titulo}</h3>
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
}: ComponentProps<'input'>) {
  return (
    <input
      className={cx(
        'w-full rounded-[9px] border-[1.5px] border-linha bg-campo px-3.5 py-3',
        'text-sm text-tinta transition-colors duration-150 placeholder:text-cinza-cl',
        'focus:border-marca focus:bg-white focus:outline-none',
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

/** Quadradinho com a nota 0–4: fundo na cor da nota (suave), borda forte e número em tinta escura. */
export function NotaBadge({ nota, cor }: { nota: number; cor: string }) {
  return (
    <span
      className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-[13px] font-extrabold text-noite"
      style={{ backgroundColor: `${cor}40`, boxShadow: `inset 0 0 0 1.5px ${cor}` }}
    >
      {nota}
    </span>
  )
}

/** Selo de fase. A ferramenta está em testes e isso precisa estar à vista. */
export function SeloBeta({ className }: { className?: string }) {
  return (
    <span
      title="Versão em testes — dados e cálculos podem mudar"
      className={cx(
        'inline-flex items-center rounded-[20px] border border-marca/40 bg-marca/15',
        'px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[1.2px] text-marca',
        className,
      )}
    >
      Beta
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
        'text-[11px] font-bold uppercase tracking-[2px] text-marca-escura',
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
      className="mb-4 rounded-[9px] border border-erro-borda bg-erro-bg px-3 py-2.5 text-xs text-erro-txt"
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------- Estado -- */

export function Splash({ texto = 'Preparando a sua cidade…' }: { texto?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg">
      <div role="status" className="flex flex-col items-center gap-4 text-cinza">
        <svg viewBox="0 30 1540 1620" className="splash-mapa h-[150px] w-auto" aria-hidden="true" focusable="false">
          {Object.entries(MAPA_UFS).map(([codigo, d], i) => (
            <path key={codigo} d={d} pathLength={1} className="splash-uf" style={{ animationDelay: `${(i % 9) * 90}ms` }} />
          ))}
        </svg>
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
      <h3 className="mb-2 text-[15px] text-noite">{titulo}</h3>
      <p className="mx-auto mb-5 max-w-md text-[13.5px] text-cinza">{descricao}</p>
      {acao}
    </Card>
  )
}
