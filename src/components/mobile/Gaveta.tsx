import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { animarMola, elastico, projetar, useReducedMotion } from '@/lib/movimento'

/**
 * Gaveta lateral (menu). Entra pela esquerda e sai pela esquerda (mesmo caminho),
 * escurecendo o fundo junto com o movimento. Pode ser arrastada para fechar,
 * agarrada no meio da animação, e usa mola com a velocidade do dedo. Com
 * "reduzir movimento" aparece e some sem deslizar.
 */
export function Gaveta({
  aberto,
  aoFechar,
  rotulo = 'Menu',
  children,
}: {
  aberto: boolean
  aoFechar: () => void
  rotulo?: string
  children: ReactNode
}) {
  const reduzido = useReducedMotion()
  const [montado, setMontado] = useState(aberto)
  const painelRef = useRef<HTMLDivElement>(null)
  const veuRef = useRef<HTMLDivElement>(null)
  const posicao = useRef(0) // px; 0 = aberta, negativo = escondida à esquerda
  const largura = useRef(250)
  const cancelar = useRef<(() => void) | null>(null)
  const velocidadeFechar = useRef(0)
  const foco = useRef<HTMLElement | null>(null)
  const fecharRef = useRef(aoFechar)
  useLayoutEffect(() => {
    fecharRef.current = aoFechar
  })
  const arrasto = useRef<{
    id: number
    x0: number
    y0: number
    ativo: boolean
    offset: number
    pontos: { t: number; x: number }[]
  } | null>(null)

  const fechada = useCallback(() => -((painelRef.current?.offsetWidth ?? largura.current) + 24), [])

  const aplicar = useCallback((x: number) => {
    posicao.current = x
    const p = painelRef.current
    const v = veuRef.current
    if (p) p.style.transform = `translate3d(${x}px, 0, 0)`
    if (v) v.style.opacity = String(Math.max(0, Math.min(1, 1 + x / (largura.current || 1))))
  }, [])

  const mover = useCallback(
    (para: number, o: { velocidade?: number; amortecimento?: number; aoFim?: () => void } = {}) => {
      cancelar.current?.()
      if (reduzido) {
        aplicar(para)
        o.aoFim?.()
        return
      }
      cancelar.current = animarMola({
        de: posicao.current,
        para,
        velocidade: o.velocidade,
        amortecimento: o.amortecimento ?? 1,
        resposta: 0.42,
        aoFrame: aplicar,
        aoFim: o.aoFim,
      })
    },
    [aplicar, reduzido],
  )

  useEffect(() => {
    if (aberto) setMontado(true)
  }, [aberto])

  useLayoutEffect(() => {
    if (!montado) return
    const p = painelRef.current
    if (!p) return
    if (aberto) {
      largura.current = p.offsetWidth
      foco.current = document.activeElement as HTMLElement | null
      if (!p.dataset.aberta) {
        aplicar(fechada())
        p.dataset.aberta = '1'
      }
      mover(0)
      p.focus({ preventScroll: true })
    } else {
      mover(fechada(), {
        velocidade: velocidadeFechar.current,
        aoFim: () => {
          velocidadeFechar.current = 0
          setMontado(false)
          foco.current?.focus?.({ preventScroll: true })
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, montado])

  // trava a rolagem da página e fecha com Esc
  useEffect(() => {
    if (!montado) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && fecharRef.current()
    window.addEventListener('keydown', tecla)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', tecla)
    }
  }, [montado])

  useEffect(() => () => cancelar.current?.(), [])

  const aoTocar = (e: React.PointerEvent<HTMLDivElement>) => {
    largura.current = painelRef.current?.offsetWidth ?? largura.current
    arrasto.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ativo: false, offset: 0, pontos: [{ t: performance.now(), x: e.clientX }] }
  }
  const aoMover = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrasto.current
    if (!a || a.id !== e.pointerId) return
    if (!a.ativo) {
      const dx = e.clientX - a.x0
      const dy = e.clientY - a.y0
      // só vira arrasto quando o gesto é claramente horizontal (a rolagem vertical segue livre)
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return
      a.ativo = true
      cancelar.current?.() // agarra no meio da animação, sem salto
      a.offset = e.clientX - posicao.current
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    a.pontos.push({ t: performance.now(), x: e.clientX })
    if (a.pontos.length > 6) a.pontos.shift()
    const bruto = e.clientX - a.offset
    aplicar(bruto > 0 ? elastico(bruto, largura.current) : bruto)
  }
  const aoSoltar = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrasto.current
    if (!a || a.id !== e.pointerId) return
    arrasto.current = null
    if (!a.ativo) return // foi um toque comum: os links/botões tratam
    const [p0, p1] = [a.pontos[0], a.pontos[a.pontos.length - 1]]
    const velocidade = ((p1.x - p0.x) / Math.max(1, p1.t - p0.t)) * 1000
    if (posicao.current + projetar(velocidade) < -largura.current * 0.5) {
      velocidadeFechar.current = velocidade
      aoFechar()
    } else {
      mover(0, { velocidade, amortecimento: Math.abs(velocidade) > 300 ? 0.85 : 1 })
    }
  }

  if (!montado) return null

  return createPortal(
    <div className="fixed inset-0 z-40 lg:hidden">
      <div ref={veuRef} className="absolute inset-0 bg-noite/50" style={{ opacity: 0 }} onClick={aoFechar} aria-hidden />
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={rotulo}
        tabIndex={-1}
        className="absolute inset-y-0 left-0 h-full outline-none shadow-[8px_0_40px_rgb(5_47_77/0.3)]"
        style={{ transform: 'translate3d(-110%,0,0)', touchAction: 'pan-y', willChange: 'transform' }}
        onPointerDown={aoTocar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
