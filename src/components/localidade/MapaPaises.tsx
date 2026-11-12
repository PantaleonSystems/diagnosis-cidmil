import { useEffect, useMemo, useState } from 'react'
import { listaPaises } from '@/lib/localidades'
import { Button, cx } from '@/components/ui'

type Linha = [codigo: string, caminho: string]

let cache: Promise<Linha[]> | null = null
/** Carrega o mapa só quando alguém abre a escolha de país (arquivo separado). */
const carregarMapa = (): Promise<Linha[]> => (cache ??= import('@/data/mapa-paises.json').then((m) => m.default as Linha[]))

/**
 * Mapa-múndi para escolher o país. Toque (ou passe o mouse) mostra o nome; confirmar
 * é um botão, para não escolher o país errado num toque impreciso. Países muito
 * pequenos não aparecem no mapa: a busca por nome logo abaixo cobre todos.
 */
export function MapaPaises({
  selecionado,
  aoEscolher,
}: {
  selecionado: string | null
  aoEscolher: (codigo: string) => void
}) {
  const [caminhos, setCaminhos] = useState<Linha[] | null>(null)
  const [alvo, setAlvo] = useState<string | null>(null)
  const nomes = useMemo(() => new Map(listaPaises().map((p) => [p.codigo, p.nome])), [])

  useEffect(() => {
    let vivo = true
    carregarMapa().then((l) => vivo && setCaminhos(l))
    return () => {
      vivo = false
    }
  }, [])

  const nomeAlvo = alvo ? (nomes.get(alvo) ?? alvo) : null

  return (
    <div className="mb-3">
      <div className="overflow-hidden rounded-xl border border-linha bg-marca-fundo/50">
        {caminhos ? (
          <svg viewBox="0 0 1000 500" className="block h-auto w-full" aria-hidden>
            {caminhos.map(([codigo, d]) => (
              <path
                key={codigo}
                d={d}
                onClick={() => setAlvo(codigo)}
                onMouseEnter={() => setAlvo((a) => a ?? codigo)}
                className={cx(
                  'cursor-pointer stroke-white transition-colors duration-100',
                  codigo === alvo
                    ? 'fill-marca-clara'
                    : codigo === selecionado
                      ? 'fill-marca'
                      : 'fill-[#BFD9EC] hover:fill-marca-clara',
                )}
                strokeWidth={0.7}
              />
            ))}
          </svg>
        ) : (
          <div className="grid aspect-[2/1] place-items-center text-legenda text-cinza">Carregando o mapa…</div>
        )}
      </div>

      <div className="mt-2.5 flex min-h-12 items-center justify-between gap-3" aria-live="polite">
        {alvo ? (
          <>
            <span className="min-w-0 truncate text-corpo font-bold text-noite">{nomeAlvo}</span>
            <Button type="button" className="alvo shrink-0" onClick={() => aoEscolher(alvo)}>
              Escolher
            </Button>
          </>
        ) : (
          <span className="text-legenda text-cinza">Toque num país no mapa ou busque pelo nome abaixo.</span>
        )}
      </div>
    </div>
  )
}
