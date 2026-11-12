import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Folha } from '@/components/mobile/Folha'
import { Input, cx } from '@/components/ui'

export interface Opcao {
  id: string
  rotulo: string
  detalhe?: string
}

export interface ResultadoBusca {
  itens: Opcao[]
  /** total de resultados (pode ser maior que o mostrado) */
  total: number
  carregando?: boolean
}

/**
 * Seletor com busca, em folha deslizante. Digite para filtrar (sem acento);
 * toque numa linha ou use setas + Enter. Linhas de 52 px.
 */
export function FolhaBusca({
  aberto,
  aoFechar,
  titulo,
  placeholder,
  buscar,
  aoEscolher,
  selecionadoId,
  topo,
}: {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  placeholder: string
  buscar: (termo: string) => ResultadoBusca
  aoEscolher: (id: string) => void
  selecionadoId?: string | null
  /** conteúdo opcional acima da busca (ex.: o mapa de países) */
  topo?: ReactNode
}) {
  return (
    <Folha aberto={aberto} aoFechar={aoFechar} titulo={titulo} alta>
      <Conteudo placeholder={placeholder} buscar={buscar} aoEscolher={aoEscolher} selecionadoId={selecionadoId} topo={topo} />
    </Folha>
  )
}

function Conteudo({
  placeholder,
  buscar,
  aoEscolher,
  selecionadoId,
  topo,
}: {
  placeholder: string
  buscar: (termo: string) => ResultadoBusca
  aoEscolher: (id: string) => void
  selecionadoId?: string | null
  topo?: ReactNode
}) {
  const [termo, setTermo] = useState('')
  const entrada = useRef<HTMLInputElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const { itens, total, carregando } = buscar(termo)

  // foca a busca ao abrir (depois da folha tomar o foco)
  useEffect(() => {
    const t = window.setTimeout(() => entrada.current?.focus({ preventScroll: true }), 60)
    return () => window.clearTimeout(t)
  }, [])

  const teclas = (e: KeyboardEvent) => {
    const botoes = Array.from(lista.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
    const i = botoes.findIndex((b) => b === document.activeElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      botoes[Math.min(i + 1, botoes.length - 1)]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (i <= 0) entrada.current?.focus()
      else botoes[i - 1]?.focus()
    } else if (e.key === 'Enter' && document.activeElement === entrada.current && itens[0]) {
      e.preventDefault()
      aoEscolher(itens[0].id)
    }
  }

  return (
    <div onKeyDown={teclas} className="flex h-full flex-col">
      {topo}
      <div className="sticky top-0 z-10 -mx-5 bg-white px-5 pb-3 pt-1">
        <Input
          ref={entrada}
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={placeholder}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          aria-label={placeholder}
          className="!py-3 text-base"
        />
      </div>

      <ul ref={lista} className="-mx-1 pb-4" role="listbox" aria-label="Resultados">
        {carregando && <li className="px-3 py-6 text-center text-corpo text-cinza">Carregando a lista…</li>}
        {!carregando && itens.length === 0 && (
          <li className="px-3 py-6 text-center text-corpo text-cinza">Nada encontrado para “{termo}”.</li>
        )}
        {itens.map((o) => {
          const sel = o.id === selecionadoId
          return (
            <li key={o.id} role="option" aria-selected={sel}>
              <button
                type="button"
                onClick={() => aoEscolher(o.id)}
                className={cx(
                  'toque flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left',
                  'hover:bg-marca-fundo focus-visible:bg-marca-fundo focus-visible:outline-none',
                  sel && 'bg-marca-fundo',
                )}
              >
                <span className="text-corpo font-semibold text-noite">{o.rotulo}</span>
                {o.detalhe && <span className="shrink-0 text-legenda text-cinza">{o.detalhe}</span>}
              </button>
            </li>
          )
        })}
        {!carregando && total > itens.length && (
          <li className="px-3 py-3 text-center text-legenda text-cinza-cl">
            Mostrando {itens.length} de {total.toLocaleString('pt-BR')}. Digite mais letras para refinar.
          </li>
        )}
      </ul>
    </div>
  )
}
