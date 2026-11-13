import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import type { IdCapitulo } from './capitulos'

interface Props {
  id: IdCapitulo
  children: ReactNode
  className?: string
  as?: ElementType
  /** Entrada suave ao rolar. Desligue no primeiro capítulo (já está na tela). */
  revelar?: boolean
}

/** Seção da história: guarda o id do capítulo e entra suave na rolagem. */
export function Capitulo({ id, children, className = '', as: Tag = 'section', revelar = true }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [visivel, setVisivel] = useState(!revelar)
  useEffect(() => {
    const el = ref.current
    if (!el || visivel) return
    if (typeof IntersectionObserver !== 'function') { setVisivel(true); return }
    const io = new IntersectionObserver(
      (es) => { if (es.some((e) => e.isIntersecting)) { setVisivel(true); io.disconnect() } },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visivel])
  return (
    <Tag ref={ref} id={id} className={`scroll-mt-20 ${revelar ? 'reveal' : ''} ${visivel ? 'visivel' : ''} ${className}`}>
      {children}
    </Tag>
  )
}
