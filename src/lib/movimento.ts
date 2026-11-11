import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

/** Segue uma media query do navegador (ex.: largura da tela). */
export function useMediaQuery(query: string): boolean {
  const assinar = useCallback(
    (aviso: () => void) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', aviso)
      return () => m.removeEventListener('change', aviso)
    },
    [query],
  )
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Respeita a preferência do sistema por menos movimento. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Anima uma lista de números até o alvo (easing suave). Na primeira renderização
 * parte de zero, o que dá o efeito de "entrada" dos valores.
 */
export function useAnimado(alvo: number[], ms = 900): number[] {
  const reduzido = useReducedMotion()
  const [valores, setValores] = useState<number[]>(() => alvo.map(() => 0))
  const atual = useRef(valores)
  const chave = alvo.join(',')

  useEffect(() => {
    if (reduzido) return
    const destino = chave.split(',').map(Number)
    const de = [...atual.current]
    const t0 = performance.now()
    let raf = 0
    const passo = (t: number) => {
      const k = Math.min(1, (t - t0) / ms)
      const e = 1 - Math.pow(1 - k, 3)
      const proximo = destino.map((a, i) => (de[i] ?? 0) + (a - (de[i] ?? 0)) * e)
      atual.current = proximo
      setValores(proximo)
      if (k < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [chave, ms, reduzido])

  return reduzido ? alvo : valores
}

/* ------------------------------------------------------------------ mola -- */

/**
 * Mola crítica/subamortecida para movimento que o usuário pode tocar.
 * Parte do valor ATUAL e da velocidade atual (px/s), então uma interrupção
 * não dá salto. `resposta` é o tempo (s) para chegar perto do alvo; não é duração.
 * `amortecimento` 1 = sem balanço; ~0.8 = leve balanço (use só após um gesto com inércia).
 */
export interface OpcoesMola {
  de: number
  para: number
  velocidade?: number
  resposta?: number
  amortecimento?: number
  aoFrame: (valor: number) => void
  aoFim?: () => void
}

export function animarMola(o: OpcoesMola): () => void {
  const resposta = o.resposta ?? 0.35
  const zeta = o.amortecimento ?? 1
  const w = (2 * Math.PI) / resposta
  const k = w * w
  const c = 2 * zeta * w
  let x = o.de
  let v = o.velocidade ?? 0
  let ultimo = performance.now()
  let raf = 0
  let ativo = true

  const passo = (agora: number) => {
    if (!ativo) return
    const dt = Math.min((agora - ultimo) / 1000, 1 / 30)
    ultimo = agora
    const n = Math.max(1, Math.ceil(dt * 240))
    const h = dt / n
    for (let i = 0; i < n; i++) {
      v += (-k * (x - o.para) - c * v) * h
      x += v * h
    }
    if (Math.abs(x - o.para) < 0.4 && Math.abs(v) < 8) {
      o.aoFrame(o.para)
      ativo = false
      o.aoFim?.()
      return
    }
    o.aoFrame(x)
    raf = requestAnimationFrame(passo)
  }
  raf = requestAnimationFrame(passo)
  return () => {
    ativo = false
    cancelAnimationFrame(raf)
  }
}

/** Onde o gesto vai parar se soltar agora (decaimento exponencial, como a rolagem do iOS). */
export function projetar(velocidade: number, desaceleracao = 0.998): number {
  return ((velocidade / 1000) * desaceleracao) / (1 - desaceleracao)
}

/** Resistência progressiva além do limite (rubber-band). */
export function elastico(excesso: number, dimensao: number, constante = 0.55): number {
  return (excesso * dimensao * constante) / (dimensao + constante * Math.abs(excesso))
}
