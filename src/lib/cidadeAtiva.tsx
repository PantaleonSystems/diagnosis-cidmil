import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { MODULO_SAUDE } from '@/data/metricas'
import type { Avaliacao, Cidade } from '@/types/db'

const CHAVE = 'cidadesmil:cidade-ativa'

export interface NovaCidade {
  nome: string
  uf: string
  pais: string
  populacao: number | null
}

interface CidadesContextValue {
  cidades: Cidade[]
  /** avaliação do módulo Saúde do ano corrente, por cidade */
  avaliacoes: Map<string, Avaliacao>
  cidadeAtiva: Cidade | null
  avaliacaoAtiva: Avaliacao | null
  carregando: boolean
  erro: string | null
  selecionar: (cidadeId: string) => void
  /** cria a cidade e já abre a avaliação em rascunho */
  criarCidade: (dados: NovaCidade) => Promise<Cidade>
  recarregar: () => Promise<void>
}

const CidadesContext = createContext<CidadesContextValue | null>(null)

const anoCorrente = () => new Date().getFullYear()

export function CidadesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Map<string, Avaliacao>>(new Map())
  const [ativaId, setAtivaId] = useState<string | null>(
    () => localStorage.getItem(CHAVE) ?? null,
  )
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const recarregar = useCallback(async () => {
    setErro(null)
    const [cid, av] = await Promise.all([
      supabase.from('cidades').select('*').order('nome'),
      supabase.from('avaliacoes').select('*').eq('modulo_id', MODULO_SAUDE),
    ])

    if (cid.error || av.error) {
      setErro(cid.error?.message ?? av.error?.message ?? 'Erro ao carregar cidades.')
      setCarregando(false)
      return
    }

    const lista = (cid.data ?? []) as Cidade[]
    setCidades(lista)

    // uma avaliação por cidade: a mais recente do módulo Saúde
    const mapa = new Map<string, Avaliacao>()
    for (const a of (av.data ?? []) as Avaliacao[]) {
      const atual = mapa.get(a.cidade_id)
      if (!atual || a.ano > atual.ano) mapa.set(a.cidade_id, a)
    }
    setAvaliacoes(mapa)

    // se a cidade guardada sumiu (ou é o primeiro acesso), cai na primeira
    setAtivaId((id) => (id && lista.some((c) => c.id === id) ? id : (lista[0]?.id ?? null)))
    setCarregando(false)
  }, [])

  useEffect(() => {
    if (!session) {
      setCidades([])
      setAvaliacoes(new Map())
      setCarregando(false)
      return
    }
    setCarregando(true)
    void recarregar()
  }, [session, recarregar])

  useEffect(() => {
    if (ativaId) localStorage.setItem(CHAVE, ativaId)
    else localStorage.removeItem(CHAVE)
  }, [ativaId])

  const criarCidade = useCallback(
    async (dados: NovaCidade): Promise<Cidade> => {
      const userId = session?.user.id
      if (!userId) throw new Error('Sessão expirada. Entre novamente.')

      const { data: cidade, error } = await supabase
        .from('cidades')
        .insert({ ...dados, criado_por: userId })
        .select()
        .single()
      if (error) throw new Error(error.message)

      // toda cidade nasce com uma avaliação do módulo Saúde em rascunho
      const { error: erroAval } = await supabase.from('avaliacoes').insert({
        cidade_id: (cidade as Cidade).id,
        modulo_id: MODULO_SAUDE,
        ano: anoCorrente(),
        status: 'rascunho',
        avaliador_id: userId,
      })
      if (erroAval) throw new Error(erroAval.message)

      await recarregar()
      setAtivaId((cidade as Cidade).id)
      return cidade as Cidade
    },
    [session, recarregar],
  )

  const value = useMemo<CidadesContextValue>(() => {
    const cidadeAtiva = cidades.find((c) => c.id === ativaId) ?? null
    return {
      cidades,
      avaliacoes,
      cidadeAtiva,
      avaliacaoAtiva: cidadeAtiva ? (avaliacoes.get(cidadeAtiva.id) ?? null) : null,
      carregando,
      erro,
      selecionar: setAtivaId,
      criarCidade,
      recarregar,
    }
  }, [cidades, avaliacoes, ativaId, carregando, erro, criarCidade, recarregar])

  return <CidadesContext value={value}>{children}</CidadesContext>
}

export function useCidades(): CidadesContextValue {
  const ctx = use(CidadesContext)
  if (!ctx) throw new Error('useCidades precisa estar dentro de <CidadesProvider>')
  return ctx
}
