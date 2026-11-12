import { useEffect } from 'react'

/** O laboratório é interno: pede aos buscadores para não indexar. */
export function useNoindex() {
  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])
}
