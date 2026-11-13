import { useState } from 'react'
import { PILARES } from '@/data/metricas'
import { IconeFrente } from './iconesFrentes'

/** As cinco frentes do diagnóstico: ícones que se escolhem e abrem um painel de cada vez. */
export function Frentes() {
  const [escolha, setEscolha] = useState<number | null | undefined>(undefined)
  // undefined = o usuário ainda não mexeu: a primeira já vem aberta
  const aberta = escolha === undefined ? PILARES[0].numero : escolha
  const atual = PILARES.find((p) => p.numero === aberta)

  return (
    <div className="mx-auto max-w-[900px]">
      <ul className="grid grid-cols-5 gap-2 sm:gap-4">
        {PILARES.map((p) => (
          <li key={p.numero}>
            <button
              type="button"
              aria-expanded={aberta === p.numero}
              aria-controls="painel-frente"
              onClick={() => setEscolha(aberta === p.numero ? null : p.numero)}
              className="clique-escolha flex min-h-[88px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-linha bg-white px-1 py-3 text-marca-escura"
              style={aberta === p.numero ? { color: p.cor } : undefined}
            >
              <IconeFrente numero={p.numero} className="h-7 w-7" />
              <span className="sr-only text-[13px] font-bold leading-tight text-noite sm:not-sr-only">{p.curto}</span>
            </button>
          </li>
        ))}
      </ul>

      <div id="painel-frente" aria-live="polite" className="clique-detalhe mt-5" data-aberto={atual ? 'true' : 'false'}>
        <div>
          <div className="rounded-2xl bg-marca-fundo px-6 py-5">
            <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-marca">
              Frente {atual?.numero} · peso {atual ? Math.round(atual.peso * 100) : 0}%
            </p>
            <h3 className="mt-1 text-lg text-noite">{atual?.nome}</h3>
            <p className="mt-1.5 text-[15px] text-cinza">{atual?.descricao}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
