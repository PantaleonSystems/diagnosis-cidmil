import { useEffect, type RefObject } from 'react'
import { useReducedMotion } from '@/lib/movimento'

/** Liga a rolagem do capítulo (0 a 1) ao `onProgresso`. GSAP só carrega quando precisa. */
export function useScrubCalculo(ref: RefObject<HTMLElement | null>, onProgresso: (p: number) => void) {
  const reduzido = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduzido) { onProgresso(1); return }
    let matar = () => {}
    let vivo = true
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (!vivo) return
      gsap.registerPlugin(ScrollTrigger)
      const st = ScrollTrigger.create({
        trigger: el, start: 'top 75%', end: 'center 55%', scrub: 0.6,
        onUpdate: (self) => onProgresso(self.progress),
      })
      onProgresso(st.progress)
      matar = () => st.kill()
    })
    return () => { vivo = false; matar() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, reduzido])
}
