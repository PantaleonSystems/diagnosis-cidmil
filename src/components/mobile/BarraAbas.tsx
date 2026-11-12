import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { cx } from '@/components/ui'

export interface ItemAba {
  id: string
  rotulo: string
  icone: (p: { ativo?: boolean }) => ReactNode
  /** rota (usa <NavLink>); sem `to` vira botão e usa `aoEscolher` */
  to?: string
  fim?: boolean
  /** botão redondo em evidência (ação principal, ex.: nova cidade) */
  destaque?: boolean
}

/**
 * Barra de abas inferior, translúcida (o conteúdo rola por baixo).
 * Ao alcance do polegar; alvo de 56 px de altura; respeita a área segura.
 * `contida` posiciona dentro do pai (protótipos); sem ela, fixa na tela.
 */
export function BarraAbas({
  itens,
  ativoId,
  aoEscolher,
  contida = false,
  className,
}: {
  itens: ItemAba[]
  ativoId: string | null
  aoEscolher?: (id: string) => void
  contida?: boolean
  className?: string
}) {
  const indice = itens.findIndex((i) => i.id === ativoId)
  const largura = 100 / itens.length

  return (
    <nav
      aria-label="Navegação principal"
      className={cx(
        'vidro inset-x-0 bottom-0 z-30 border-t border-linha pb-seguro',
        contida ? 'absolute' : 'fixed',
        className,
      )}
    >
      <div className="relative mx-auto grid max-w-[520px]" style={{ gridTemplateColumns: `repeat(${itens.length}, 1fr)` }}>
        {indice >= 0 && (
          <span
            aria-hidden
            className="absolute left-0 top-0 h-[3px] rounded-b-full bg-marca"
            style={{
              width: `${largura}%`,
              transform: `translateX(${indice * 100}%) scaleX(0.5)`,
              transition: 'transform 380ms cubic-bezier(0.2, 0.9, 0.25, 1)',
            }}
          />
        )}
        {itens.map((item) => {
          const ativo = item.id === ativoId
          if (item.destaque) {
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.rotulo}
                onClick={() => aoEscolher?.(item.id)}
                className="toque mx-auto -mt-5 grid h-[52px] w-[52px] place-items-center self-start rounded-full bg-marca text-white shadow-[0_6px_16px_rgb(10_90_150/0.35)]"
              >
                {item.icone({ ativo })}
              </button>
            )
          }
          const classe = cx(
            'toque relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-micro font-bold tracking-[0.02em] transition-colors',
            ativo ? 'text-marca' : 'text-cinza',
          )
          const conteudo = (
            <>
              {item.icone({ ativo })}
              <span>{item.rotulo}</span>
            </>
          )
          return item.to ? (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.fim}
              className={classe}
              aria-current={ativo ? 'page' : undefined}
              onClick={() => aoEscolher?.(item.id)}
            >
              {conteudo}
            </NavLink>
          ) : (
            <button
              key={item.id}
              type="button"
              className={classe}
              aria-current={ativo ? 'page' : undefined}
              onClick={() => aoEscolher?.(item.id)}
            >
              {conteudo}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
