import { MODULOS } from '@/data/metricas'
import { cx } from '@/components/ui'

/**
 * As 13 áreas do framework Cidades MIL. Só Saúde está ativa nesta fase —
 * as demais aparecem como "em breve" para deixar o escopo explícito.
 */
export function ModuleBar() {
  const ativos = MODULOS.filter((m) => m.ativo).length

  return (
    <div className="mb-6">
      <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px] text-cinza">
        Áreas da plataforma Cidades MIL
        <span className="rounded-[20px] bg-ciano-cl px-2.5 py-0.5 text-[10.5px] tracking-[0.5px] text-ciano-esc">
          {ativos} de {MODULOS.length} indicadores ativos
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1.5">
        {MODULOS.map((m) => (
          <div
            key={m.id}
            title={m.ativo ? 'Módulo ativo' : 'Em desenvolvimento'}
            className={cx(
              'flex shrink-0 items-center gap-2 rounded-[10px] border-[1.5px] px-[15px] py-[9px]',
              'text-[13px] font-semibold whitespace-nowrap transition-all duration-100',
              m.ativo
                ? 'border-ciano bg-ciano text-white shadow-[0_4px_14px_rgba(2,185,218,0.28)]'
                : 'border-linha bg-white text-cinza-cl opacity-75 hover:border-ciano-2 hover:opacity-100',
            )}
          >
            <span className="text-sm leading-none" aria-hidden>
              {m.icone}
            </span>
            {m.nome}
            <span
              className={cx(
                'ml-0.5 rounded-[20px] px-[7px] py-0.5 text-[9px] font-bold uppercase tracking-[0.4px]',
                m.ativo ? 'bg-white/25 text-white' : 'bg-[#F0F4F6] text-cinza-cl',
              )}
            >
              {m.ativo ? 'ativo' : 'em breve'}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-cinza-cl">
        ↳ A avaliação abaixo pertence ao{' '}
        <strong className="font-bold text-ciano-esc">módulo Saúde</strong>. Os demais
        indicadores do framework serão liberados como novos módulos.
      </p>
    </div>
  )
}
