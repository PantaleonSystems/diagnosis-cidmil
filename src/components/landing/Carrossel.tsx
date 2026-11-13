import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '@/lib/movimento'
import { proximoIndice } from './indiceCarrossel'

interface Props {
  rotulo: string
  itens: ReactNode[]
  /** Avanço automático em ms; sem valor, só avança por clique, bolinha ou arrasto. */
  autoavancoMs?: number
  indiceInicial?: number
  /** Controle externo: quando muda, o carrossel vai para esse item. */
  indice?: number
  onMudar?: (indice: number) => void
  className?: string
}

/** Carrossel acessível: slides com rótulo, só o atual alcançável pelo teclado, pausa por foco, mouse, aba oculta e botão. */
export function Carrossel({ rotulo, itens, autoavancoMs, indiceInicial = 0, indice, onMudar, className = '' }: Props) {
  const reduzido = useReducedMotion()
  const [atual, setAtual] = useState(indiceInicial)
  const [rodando, setRodando] = useState(true)
  const [pausaTemporaria, setPausaTemporaria] = useState(false)
  const [oculta, setOculta] = useState(typeof document !== 'undefined' && document.hidden)
  const x0 = useRef<number | null>(null)
  const arrastou = useRef(false)
  const total = itens.length

  const ir = useCallback(
    (i: number) => {
      const novo = proximoIndice(0, total, i)
      setAtual(novo)
      onMudar?.(novo)
    },
    [total, onMudar],
  )
  const passo = useCallback((d: number) => ir(proximoIndice(atual, total, d)), [atual, total, ir])

  useEffect(() => {
    if (indice !== undefined) setAtual(indice)
  }, [indice])

  const automatico = !!autoavancoMs && !reduzido
  const andando = automatico && rodando && !pausaTemporaria && !oculta && total > 1

  useEffect(() => {
    if (!andando) return
    const t = setTimeout(() => passo(1), autoavancoMs)
    return () => clearTimeout(t)
  }, [andando, atual, autoavancoMs, passo])

  useEffect(() => {
    const v = () => setOculta(document.hidden)
    document.addEventListener('visibilitychange', v)
    return () => document.removeEventListener('visibilitychange', v)
  }, [])

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={rotulo}
      className={`carrossel ${className}`}
      onMouseEnter={() => setPausaTemporaria(true)}
      onMouseLeave={() => setPausaTemporaria(false)}
      onFocusCapture={() => setPausaTemporaria(true)}
      onBlurCapture={() => setPausaTemporaria(false)}
      onPointerDown={(e) => { x0.current = e.clientX; arrastou.current = false }}
      onClickCapture={(e) => {
        if (arrastou.current) { e.preventDefault(); e.stopPropagation(); arrastou.current = false }
      }}
      onPointerCancel={() => { x0.current = null }}
      onPointerUp={(e) => {
        if (x0.current !== null && Math.abs(e.clientX - x0.current) > 40) {
          arrastou.current = true
          passo(e.clientX < x0.current ? 1 : -1)
        }
        x0.current = null
      }}
    >
      <div className="carrossel__janela" aria-live={andando ? 'off' : 'polite'}>
        <div className="carrossel__trilho" style={{ transform: `translateX(${-100 * atual}%)` }}>
          {itens.map((item, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${total}`}
              className={`carrossel__item${i === atual ? ' is-ativo' : ''}`}
              inert={i !== atual}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className="carrossel__controles">
          <button type="button" aria-label="Anterior" className="carrossel__seta" onClick={() => passo(-1)}>‹</button>
          <div className="carrossel__bolinhas">
            {itens.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para ${i + 1}`}
                aria-current={i === atual ? 'true' : undefined}
                className="carrossel__bolinha"
                onClick={() => ir(i)}
              />
            ))}
          </div>
          <button type="button" aria-label="Próximo" className="carrossel__seta" onClick={() => passo(1)}>›</button>
          {automatico && (
            <button type="button" aria-label={rodando ? 'Pausar rotação' : 'Retomar rotação'} className="carrossel__seta" onClick={() => setRodando((r) => !r)}>
              {rodando ? '❚❚' : '▶'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
