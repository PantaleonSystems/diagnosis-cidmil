import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { useCatalogo } from '@/lib/catalogo'
import { MODULO_SAUDE, TOTAL_METRICAS } from '@/data/metricas'
import { consolidar, type NivelIndice, type NotasPorMetrica } from '@/lib/isps'
import type { Nota } from '@/lib/calculos'
import type { Avaliacao, Cidade } from '@/types/db'

/** Última cidade aberta (só para o "continuar de onde parou"; a cidade em uso vem da rota). */
const CHAVE = 'cidadesmil:ultima-cidade'

export interface NovaCidade {
  nome: string
  uf: string
  pais: string
  populacao: number | null
}

/** Retrato de uma cidade calculado a partir das respostas já registradas. */
export interface ResumoCidade {
  respondidas: number
  total: number
  /** índice 0–4 (parcial se a avaliação não foi concluída); null sem nenhuma resposta */
  isps: number | null
  nivelExibido: NivelIndice
  nivelReal: NivelIndice
  /** Regra de Ouro: a Governança trava o nível */
  travado: boolean
  /** média de cada pilar, na ordem dos pilares */
  mediasPilares: number[]
  concluida: boolean
}

interface RespostaLinha {
  avaliacao_id: string
  metrica_id: string
  nota: number
}

interface CidadesContextValue {
  cidades: Cidade[]
  /** avaliação do módulo Saúde do ano corrente, por cidade */
  avaliacoes: Map<string, Avaliacao>
  /** índice, nível e progresso de cada cidade que já tem resposta */
  resumos: Map<string, ResumoCidade>
  /** cidade aberta na rota atual (/app/cidades/:id/...); null fora do ambiente de uma cidade */
  cidadeAtiva: Cidade | null
  avaliacaoAtiva: Avaliacao | null
  /** última cidade aberta neste aparelho, para "continuar de onde parou" */
  ultimaVisitada: Cidade | null
  carregando: boolean
  erro: string | null
  /** abre o ambiente da cidade (opcionalmente numa subpágina) */
  abrirCidade: (cidadeId: string, sub?: string) => void
  /** caminho de uma subpágina da cidade aberta (ex.: 'resultados') */
  caminhoCidade: (sub?: string) => string
  /** cria a cidade e já abre a avaliação em rascunho */
  criarCidade: (dados: NovaCidade) => Promise<Cidade>
  recarregar: () => Promise<void>
}

const CidadesContext = createContext<CidadesContextValue | null>(null)

const anoCorrente = () => new Date().getFullYear()

export const caminhoDaCidade = (cidadeId: string, sub?: string): string =>
  `/app/cidades/${cidadeId}${sub ? `/${sub}` : ''}`

/** Busca todas as respostas das avaliações, em páginas (o servidor limita 1000 linhas por consulta). */
async function todasRespostas(avaliacaoIds: string[]): Promise<RespostaLinha[]> {
  if (avaliacaoIds.length === 0) return []
  const linhas: RespostaLinha[] = []
  const TAM = 1000
  for (let de = 0; ; de += TAM) {
    const { data, error } = await supabase
      .from('respostas')
      .select('avaliacao_id, metrica_id, nota')
      .in('avaliacao_id', avaliacaoIds)
      .range(de, de + TAM - 1)
    if (error) throw new Error(error.message)
    linhas.push(...((data ?? []) as RespostaLinha[]))
    if (!data || data.length < TAM) break
  }
  return linhas
}

export function CidadesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const { numeroPorId } = useCatalogo()
  const navigate = useNavigate()
  const rota = useMatch('/app/cidades/:cidadeId/*')
  const rotaId = rota?.params.cidadeId ?? null

  const [cidades, setCidades] = useState<Cidade[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Map<string, Avaliacao>>(new Map())
  const [respostas, setRespostas] = useState<RespostaLinha[]>([])
  const [ultimaId, setUltimaId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CHAVE)
    } catch {
      return null
    }
  })
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

    setCidades((cid.data ?? []) as Cidade[])

    // uma avaliação por cidade: a mais recente do módulo Saúde
    const mapa = new Map<string, Avaliacao>()
    for (const a of (av.data ?? []) as Avaliacao[]) {
      const atual = mapa.get(a.cidade_id)
      if (!atual || a.ano > atual.ano) mapa.set(a.cidade_id, a)
    }
    setAvaliacoes(mapa)

    try {
      setRespostas(await todasRespostas([...mapa.values()].map((a) => a.id)))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar respostas.')
    }
    setCarregando(false)
  }, [])

  useEffect(() => {
    if (!session) {
      setCidades([])
      setAvaliacoes(new Map())
      setRespostas([])
      setCarregando(false)
      return
    }
    setCarregando(true)
    void recarregar()
  }, [session, recarregar])

  // lembra a última cidade aberta
  useEffect(() => {
    if (!rotaId || !cidades.some((c) => c.id === rotaId)) return
    setUltimaId(rotaId)
    try {
      localStorage.setItem(CHAVE, rotaId)
    } catch {
      // sem armazenamento: só não lembra
    }
  }, [rotaId, cidades])

  const abrirCidade = useCallback(
    (cidadeId: string, sub?: string) => navigate(caminhoDaCidade(cidadeId, sub)),
    [navigate],
  )

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
      return cidade as Cidade
    },
    [session, recarregar],
  )

  /** Índice, nível e progresso por cidade, a partir das respostas. */
  const resumos = useMemo(() => {
    const porAvaliacao = new Map<string, NotasPorMetrica>()
    for (const r of respostas) {
      const numero = numeroPorId.get(r.metrica_id)
      if (numero === undefined) continue
      const notas = porAvaliacao.get(r.avaliacao_id) ?? {}
      notas[numero] = r.nota as Nota
      porAvaliacao.set(r.avaliacao_id, notas)
    }

    const mapa = new Map<string, ResumoCidade>()
    for (const [cidadeId, av] of avaliacoes) {
      const notas = porAvaliacao.get(av.id) ?? {}
      const respondidas = Object.keys(notas).length
      if (respondidas === 0) {
        mapa.set(cidadeId, {
          respondidas: 0,
          total: TOTAL_METRICAS,
          isps: null,
          nivelExibido: 0,
          nivelReal: 0,
          travado: false,
          mediasPilares: [],
          concluida: av.status === 'concluida',
        })
        continue
      }
      const r = consolidar(notas)
      mapa.set(cidadeId, {
        respondidas,
        total: TOTAL_METRICAS,
        isps: r.isps,
        nivelExibido: r.nivelExibido,
        nivelReal: r.nivelReal,
        travado: r.travado,
        mediasPilares: r.pilares.map((p) => p.media),
        concluida: av.status === 'concluida',
      })
    }
    return mapa
  }, [respostas, avaliacoes, numeroPorId])

  const value = useMemo<CidadesContextValue>(() => {
    const cidadeAtiva = rotaId ? (cidades.find((c) => c.id === rotaId) ?? null) : null
    const ultimaVisitada = ultimaId ? (cidades.find((c) => c.id === ultimaId) ?? null) : null
    return {
      cidades,
      avaliacoes,
      resumos,
      cidadeAtiva,
      avaliacaoAtiva: cidadeAtiva ? (avaliacoes.get(cidadeAtiva.id) ?? null) : null,
      ultimaVisitada,
      carregando,
      erro,
      abrirCidade,
      caminhoCidade: (sub) => (rotaId ? caminhoDaCidade(rotaId, sub) : '/app'),
      criarCidade,
      recarregar,
    }
  }, [cidades, avaliacoes, resumos, rotaId, ultimaId, carregando, erro, abrirCidade, criarCidade, recarregar])

  return <CidadesContext value={value}>{children}</CidadesContext>
}

export function useCidades(): CidadesContextValue {
  const ctx = use(CidadesContext)
  if (!ctx) throw new Error('useCidades precisa estar dentro de <CidadesProvider>')
  return ctx
}
