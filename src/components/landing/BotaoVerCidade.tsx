import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Botão principal: o mapa se aproxima e o pino cai (ver `.btn-cidade` em movimento.css). */
export function BotaoVerCidade({ to = '/app', children = 'Ver a minha cidade' }: { to?: string; children?: ReactNode }) {
  return (
    <Link to={to} className="btn-cidade">
      <svg className="btn-cidade__mapa" viewBox="0 0 150 110" aria-hidden="true" focusable="false">
        <path d="M20 62 L30 38 L52 30 L64 14 L86 22 L96 40 L120 46 L128 66 L110 84 L84 80 L70 98 L46 90 L30 78 Z" />
      </svg>
      <svg className="btn-cidade__pino" viewBox="0 0 26 34" aria-hidden="true" focusable="false">
        <path d="M13 0C5.8 0 0 5.6 0 12.6 0 22 13 34 13 34s13-12 13-21.4C26 5.6 20.2 0 13 0zm0 17.5a5 5 0 110-10 5 5 0 010 10z" />
      </svg>
      <span className="btn-cidade__texto">{children}</span>
    </Link>
  )
}
