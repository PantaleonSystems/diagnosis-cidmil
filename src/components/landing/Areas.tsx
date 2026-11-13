import { useState } from 'react'
import { MODULOS } from '@/data/metricas'
import { IconeArea } from './iconesAreas'

// Inclinação e altura de cada cartão: espalhados, mas sempre os mesmos (nada aleatório a cada visita).
const GIRO = [-6, 4, -3, 7, -5, 3, -7, 5, -2, 6, -4, 2, -6]
const DESCE = [0, 14, -6, 10, -10, 6, 12, -4, 8, -8, 14, 0, -6]

/** As 13 áreas como cartões inclinados; o nome aparece ao passar o mouse, focar ou tocar. */
export function Areas() {
  const [aberta, setAberta] = useState<string | null>(null)
  return (
    <div className="mx-auto flex max-w-[860px] flex-wrap justify-center gap-x-5 gap-y-9 pb-6 pt-3">
      {MODULOS.map((m, i) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={aberta === m.id}
          aria-label={`${m.nome}, ${m.ativo ? 'ativa agora' : 'em breve'}`}
          onClick={() => setAberta(aberta === m.id ? null : m.id)}
          onBlur={() => setAberta((a) => (a === m.id ? null : a))}
          className="area-card"
          data-ativa={m.ativo}
          style={{ ['--giro' as string]: `${GIRO[i % GIRO.length]}deg`, ['--desce' as string]: `${DESCE[i % DESCE.length]}px` }}
        >
          <IconeArea id={m.id} className="h-8 w-8" />
          <span className="area-card__nome" aria-hidden="true">
            {m.nome}
            {m.ativo && <em> · ativa</em>}
          </span>
        </button>
      ))}
    </div>
  )
}
