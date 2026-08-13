import { useEffect, useRef, type ReactNode } from 'react'

/** Modal acessível via <dialog> nativo: foco preso e Esc fecham de graça. */
export function Modal({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
}: {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  descricao?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (aberto && !dialog.open) dialog.showModal()
    if (!aberto && dialog.open) dialog.close()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onClick={(e) => {
        // clique no backdrop (fora do conteúdo) fecha
        if (e.target === ref.current) aoFechar()
      }}
      className="m-auto w-[min(92vw,480px)] rounded-card border border-linha p-0 shadow-card backdrop:bg-petroleo/40"
    >
      <div className="p-6">
        <h2 className="text-lg text-petroleo">{titulo}</h2>
        {descricao && <p className="mt-1 mb-4 text-[13px] text-cinza">{descricao}</p>}
        <div className={descricao ? '' : 'mt-4'}>{children}</div>
      </div>
    </dialog>
  )
}
