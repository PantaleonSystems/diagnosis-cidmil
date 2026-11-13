import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAnimado } from '@/lib/movimento'
import { MapaAproximacao } from './MapaAproximacao'

export const NUMEROS_DEMO = [
  { id: 'fontes', valor: 24, rotulo: 'fontes analisadas' },
  { id: 'indicadores', valor: 18, rotulo: 'indicadores avaliados' },
  { id: 'lacunas', valor: 7, rotulo: 'lacunas identificadas' },
  { id: 'acoes', valor: 12, rotulo: 'ações propostas' },
] as const

const ICONES: Record<string, ReactNode> = {
  fontes: (<><circle cx="12" cy="12" r="2.5" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="12" cy="20" r="2" /><path d="m6.5 7.5 3.5 3M17.5 7.5l-3.5 3M12 14.5V18" /></>),
  indicadores: (<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>),
  lacunas: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></>),
  acoes: (<><path d="M6 21V4M6 5h11l-2.5 3.5L17 12H6" /></>),
  objetivo: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>),
  meta: (<><path d="M5 20V5M5 6h13l-3 4 3 4H5" /></>),
  responsavel: (<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></>),
  prazo: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
}

const Icone = ({ id, className = 'h-6 w-6' }: { id: string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">{ICONES[id]}</svg>
)

const PLANO = [['objetivo', 'Objetivo'], ['meta', 'Meta'], ['responsavel', 'Responsável'], ['prazo', 'Prazo']] as const

/** Uma cidade de demonstração: o mapa se aproxima e os números contam quando o capítulo entra na tela. */
export function Demonstracao() {
  const raiz = useRef<HTMLDivElement>(null)
  const [dentro, setDentro] = useState(false)
  useEffect(() => {
    const el = raiz.current
    if (!el || typeof IntersectionObserver !== 'function') { setDentro(true); return }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setDentro(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const valores = useAnimado(dentro ? NUMEROS_DEMO.map((n) => n.valor) : NUMEROS_DEMO.map(() => 0), 1400)

  return (
    <div ref={raiz} className="mx-auto max-w-[1000px]">
      <h2 className="mx-auto mb-10 max-w-3xl text-center text-[clamp(26px,4vw,38px)] leading-tight tracking-[-0.3px] text-noite">
        E se fosse possível entender uma cidade antes de planejar?
      </h2>

      <div className="grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="mx-auto w-full max-w-[340px]">
          <MapaAproximacao className="rounded-[28px]" />
          <p className="mt-3 text-center text-[12px] font-bold text-marca-escura">Cidade de demonstração</p>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-3">
            {NUMEROS_DEMO.map((n, i) => (
              <div key={n.id} className="rounded-2xl border border-linha bg-white p-4">
                <span className="text-marca"><Icone id={n.id} /></span>
                <p className="mt-1 text-[40px] font-extrabold leading-none text-noite">{Math.round(valores[i])}</p>
                <p className="mt-1 text-[12.5px] text-cinza">{n.rotulo}</p>
              </div>
            ))}
          </div>
          <span className="mt-3 inline-block rounded-full bg-marca-fundo px-3 py-1 text-xs font-bold text-marca-escura">Exemplo ilustrativo</span>
        </div>
      </div>

      <ul className="mt-10 flex flex-wrap justify-center gap-3" aria-label="O plano de ação reúne">
        {PLANO.map(([id, rotulo]) => (
          <li key={id} className="flex items-center gap-2 rounded-full border border-linha bg-white px-4 py-2 text-[13px] font-bold text-marca-escura">
            <Icone id={id} className="h-5 w-5" />
            {rotulo}
          </li>
        ))}
      </ul>
    </div>
  )
}
