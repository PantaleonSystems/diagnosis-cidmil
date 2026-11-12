import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { animarMola, elastico, projetar, useReducedMotion } from '@/lib/movimento'

/** Folhas abertas, da mais antiga para a mais nova: Esc fecha só a do topo. */
const pilha: symbol[] = []

/**
 * Folha deslizante (bottom sheet).
 *
 * Comportamento (apple-design):
 * - acompanha o dedo 1:1 e respeita o ponto onde foi agarrada;
 * - ao soltar, projeta onde o gesto pararia e escolhe fechar/abrir por aí,
 *   entregando a velocidade do dedo para a mola (sem emenda entre arrastar e animar);
 * - pode ser agarrada de novo no meio da animação (a mola parte do valor atual);
 * - além do topo, resiste de forma progressiva (elástico);
 * - sai pelo mesmo caminho por onde entrou (de baixo);
 * - com "reduzir movimento", aparece e some sem deslizar.
 */
export function Folha({
  aberto,
  aoFechar,
  titulo,
  alta = false,
  children,
}: {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  /** altura fixa de 90% da tela (seletores com lista que filtra) */
  alta?: boolean
  children: ReactNode
}) {
  const reduzido = useReducedMotion()
  const [montado, setMontado] = useState(aberto)
  const folhaRef = useRef<HTMLDivElement>(null)
  const veuRef = useRef<HTMLDivElement>(null)
  const posicao = useRef(0) // px, 0 = aberta
  const altura = useRef(0)
  const cancelar = useRef<(() => void) | null>(null)
  const velocidadeFechar = useRef(0)
  const arrasto = useRef<{ id: number; offset: number; pontos: { t: number; y: number }[] } | null>(null)
  const foco = useRef<HTMLElement | null>(null)
  // aoFechar costuma ser uma função nova a cada render do pai; guardamos a última
  // para os efeitos não se refazerem (o que bagunçava a pilha do Esc e a rolagem).
  const fecharRef = useRef(aoFechar)
  useLayoutEffect(() => {
    fecharRef.current = aoFechar
  })
  // Durante o fechamento o pai pode já ter tirado o conteúdo: mantemos o último
  // visto para a folha não encolher enquanto desce.
  const ultimo = useRef({ titulo, children })
  if (aberto) ultimo.current = { titulo, children }

  /** Posição "fechada": a altura ATUAL da folha (o conteúdo pode ter crescido) + folga da sombra. */
  const fechada = useCallback(() => (folhaRef.current?.offsetHeight ?? altura.current) + 56, [])

  const aplicar = useCallback((y: number) => {
    posicao.current = y
    const f = folhaRef.current
    const v = veuRef.current
    if (f) f.style.transform = `translate3d(0, ${y}px, 0)`
    if (v) v.style.opacity = String(Math.max(0, Math.min(1, 1 - y / (altura.current || 1))))
  }, [])

  const mover = useCallback(
    (para: number, opcoes: { velocidade?: number; amortecimento?: number; aoFim?: () => void } = {}) => {
      cancelar.current?.()
      if (reduzido) {
        aplicar(para)
        opcoes.aoFim?.()
        return
      }
      cancelar.current = animarMola({
        de: posicao.current,
        para,
        velocidade: opcoes.velocidade,
        amortecimento: opcoes.amortecimento ?? 1,
        resposta: 0.38,
        aoFrame: aplicar,
        aoFim: opcoes.aoFim,
      })
    },
    [aplicar, reduzido],
  )

  // abre: monta, mede e anima de baixo para a posição 0
  useEffect(() => {
    if (aberto) setMontado(true)
  }, [aberto])

  useLayoutEffect(() => {
    if (!montado) return
    const f = folhaRef.current
    if (!f) return
    if (aberto) {
      altura.current = f.offsetHeight
      foco.current = document.activeElement as HTMLElement | null
      // elemento novo: sempre entra de baixo. Reabrir no meio do fechamento
      // (elemento já aberto) segue de onde está, sem salto.
      if (!f.dataset.aberta) {
        aplicar(fechada())
        f.dataset.aberta = '1'
      }
      mover(0)
      f.focus({ preventScroll: true })
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
    const id = Symbol('folha')
    pilha.push(id)
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pilha[pilha.length - 1] === id) fecharRef.current()
    }
    window.addEventListener('keydown', tecla)
    return () => {
      document.body.style.overflow = anterior
      pilha.splice(pilha.indexOf(id), 1)
      window.removeEventListener('keydown', tecla)
    }
  }, [montado])

  // acompanha o crescimento do conteúdo (ex.: o formulário ganha campos)
  useEffect(() => {
    const f = folhaRef.current
    if (!montado || !f || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      altura.current = f.offsetHeight
    })
    ro.observe(f)
    return () => ro.disconnect()
  }, [montado])

  useEffect(() => () => cancelar.current?.(), [])

  const aoAgarrar = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    altura.current = folhaRef.current?.offsetHeight ?? altura.current
    cancelar.current?.() // interrompe qualquer animação em curso
    e.currentTarget.setPointerCapture(e.pointerId)
    arrasto.current = {
      id: e.pointerId,
      offset: e.clientY - posicao.current,
      pontos: [{ t: performance.now(), y: e.clientY }],
    }
  }
  const aoArrastar = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrasto.current
    if (!a || a.id !== e.pointerId) return
    a.pontos.push({ t: performance.now(), y: e.clientY })
    if (a.pontos.length > 6) a.pontos.shift()
    const bruto = e.clientY - a.offset
    aplicar(bruto < 0 ? -elastico(-bruto, altura.current) : bruto)
  }
  const aoSoltar = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrasto.current
    if (!a || a.id !== e.pointerId) return
    arrasto.current = null
    const [p0, p1] = [a.pontos[0], a.pontos[a.pontos.length - 1]]
    const dt = Math.max(1, p1.t - p0.t)
    const velocidade = ((p1.y - p0.y) / dt) * 1000
    const destino = posicao.current + projetar(velocidade)
    if (destino > altura.current * 0.5) {
      velocidadeFechar.current = velocidade
      aoFechar()
    } else {
      mover(0, { velocidade, amortecimento: Math.abs(velocidade) > 300 ? 0.82 : 1 })
    }
  }

  if (!montado) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div ref={veuRef} className="absolute inset-0 bg-noite/50" style={{ opacity: 0 }} onClick={aoFechar} aria-hidden />
      <div
        ref={folhaRef}
        role="dialog"
        aria-modal="true"
        aria-label={ultimo.current.titulo}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[520px] flex-col ${alta ? 'h-[90dvh]' : 'max-h-[90dvh]'} rounded-t-[var(--radius-folha)] bg-white shadow-[0_-8px_40px_rgb(5_47_77/0.25)] outline-none`}
        style={{ transform: 'translate3d(0,100%,0)', willChange: 'transform' }}
      >
        <div
          className="touch-none select-none"
          style={{ cursor: 'grab' }}
          onPointerDown={aoAgarrar}
          onPointerMove={aoArrastar}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
        >
          <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-linha" aria-hidden />
          <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-2">
            <h2 className="text-subtitulo font-bold text-noite">{ultimo.current.titulo}</h2>
            <button
              type="button"
              onClick={aoFechar}
              className="alvo toque -mr-2 grid place-items-center rounded-full text-cinza hover:bg-marca-fundo"
              aria-label="Fechar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-seguro pt-1">{ultimo.current.children}</div>
      </div>
    </div>,
    document.body,
  )
}
