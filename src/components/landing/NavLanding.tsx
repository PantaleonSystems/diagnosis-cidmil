import { Marca } from '@/components/layout/Marca'
import { SeloBeta } from '@/components/ui'
import { useReducedMotion } from '@/lib/movimento'
import { BotaoVerCidade } from './BotaoVerCidade'
import { CAPITULOS, useCapituloAtivo } from './capitulos'

/** Nav de vidro: marca, marcadores dos capítulos e o botão principal. */
export function NavLanding() {
  const ativo = useCapituloAtivo()
  const reduzido = useReducedMotion()
  const ir = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }
  return (
    <nav aria-label="Principal" className="nav-landing sticky top-0 z-20 flex items-center justify-between gap-3 px-[5vw] py-2.5 md:px-[6vw]">
      <div className="flex min-w-0 items-center gap-2">
        <Marca />
        <SeloBeta className="max-[460px]:hidden" />
      </div>
      <ul className="hidden items-center gap-3 md:flex">
        {CAPITULOS.map((c) => (
          <li key={c.id}>
            <a href={`#${c.id}`} onClick={ir(c.id)} className="marcador" aria-current={ativo === c.id ? 'true' : undefined}>
              <span className="marcador__ponto" aria-hidden="true" />
              <span className="marcador__rotulo">{c.rotulo}</span>
            </a>
          </li>
        ))}
      </ul>
      <BotaoVerCidade compacto to="/app">Testar a beta</BotaoVerCidade>
    </nav>
  )
}
