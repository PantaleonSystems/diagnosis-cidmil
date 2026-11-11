import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { Folha } from '@/components/mobile/Folha'
import { SeletorLocalidade, type Localidade } from '@/components/localidade/SeletorLocalidade'
import { Button, Erro, Field, Input } from '@/components/ui'
import { useCidades } from '@/lib/cidadeAtiva'
import { normalizar } from '@/lib/localidades'
import type { Cidade } from '@/types/db'

interface NovaCidadeContextValue {
  /** abre a folha de solicitação de nova cidade (uma só, para o app inteiro) */
  abrirNovaCidade: () => void
}

const NovaCidadeContext = createContext<NovaCidadeContextValue | null>(null)

export function useNovaCidade(): NovaCidadeContextValue {
  const ctx = use(NovaCidadeContext)
  if (!ctx) throw new Error('useNovaCidade precisa estar dentro de <NovaCidadeProvider>')
  return ctx
}

/** Mantém a folha de nova cidade no topo do app, aberta de qualquer tela. */
export function NovaCidadeProvider({ children }: { children: ReactNode }) {
  const { cidades, criarCidade, abrirCidade } = useCidades()
  const [aberto, setAberto] = useState(false)
  const fechar = useCallback(() => setAberto(false), [])
  const abrirNovaCidade = useCallback(() => setAberto(true), [])
  const value = useMemo(() => ({ abrirNovaCidade }), [abrirNovaCidade])

  return (
    <NovaCidadeContext value={value}>
      {children}
      <Folha aberto={aberto} aoFechar={fechar} titulo="Solicitar nova cidade">
        <Formulario
          existentes={cidades}
          aoUsarExistente={(c) => {
            setAberto(false)
            abrirCidade(c.id)
          }}
          aoCriar={async (dados) => {
            const nova = await criarCidade(dados)
            setAberto(false)
            abrirCidade(nova.id)
          }}
        />
      </Folha>
    </NovaCidadeContext>
  )
}

type DadosCidade = { nome: string; uf: string; pais: string; populacao: number | null }

// O formulário fica dentro da folha: ao fechar, o estado dele zera sozinho.
function Formulario({
  aoCriar,
  aoUsarExistente,
  existentes,
}: {
  aoCriar: (dados: DadosCidade) => Promise<void>
  aoUsarExistente: (c: Cidade) => void
  existentes: Cidade[]
}) {
  const [loc, setLoc] = useState<Localidade | null>(null)
  const [populacao, setPopulacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const existente = useMemo(
    () =>
      loc
        ? existentes.find(
            (c) => c.pais === loc.pais && c.uf === loc.uf && normalizar(c.nome) === normalizar(loc.nome),
          )
        : undefined,
    [loc, existentes],
  )

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!loc) return
    setErro(null)
    setEnviando(true)
    try {
      await aoCriar({
        nome: loc.nome,
        uf: loc.uf,
        pais: loc.pais,
        populacao: loc.populacao ?? (populacao ? Number(populacao) : null),
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível cadastrar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="pb-3">
      <p className="mb-4 text-legenda text-cinza">
        Escolha o município numa lista oficial. Ao solicitar, abrimos o ambiente da cidade com a avaliação do módulo Saúde.
      </p>
      <Erro>{erro}</Erro>

      <SeletorLocalidade aoMudar={setLoc} />

      {loc?.codigoIbge && (
        <div className="mb-4 rounded-xl border border-linha bg-app-bg px-4 py-3 text-legenda text-cinza">
          <div className="font-bold text-petroleo">
            {loc.nome} · {loc.uf}
          </div>
          <div className="mt-0.5">
            {loc.populacao ? `${loc.populacao.toLocaleString('pt-BR')} habitantes (Censo 2022) · ` : ''}
            Código IBGE {loc.codigoIbge}
          </div>
        </div>
      )}

      {loc && !loc.populacao && (
        <Field label="População (opcional)" hint="Usada nas métricas de densidade (ex.: espaços por 10 mil hab.).">
          <Input type="number" inputMode="numeric" min={0} value={populacao} onChange={(e) => setPopulacao(e.target.value)} placeholder="100000" />
        </Field>
      )}

      {existente ? (
        <div className="rounded-xl border border-aviso-borda bg-aviso-bg p-4">
          <p className="text-corpo text-aviso-txt">
            <strong>{existente.nome}</strong> já está cadastrada.
          </p>
          <Button type="button" className="alvo mt-3 w-full" onClick={() => aoUsarExistente(existente)}>
            Abrir esta cidade
          </Button>
        </div>
      ) : (
        <Button type="submit" className="alvo w-full" disabled={!loc || enviando}>
          {enviando ? 'Solicitando…' : 'Solicitar cidade'}
        </Button>
      )}
    </form>
  )
}
