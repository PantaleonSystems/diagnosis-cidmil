import { useEffect, useMemo, useState } from 'react'
import { ESTADOS, buscarMunicipios, carregarMunicipios, listaPaises, normalizar, type Municipio } from '@/lib/localidades'
import { Input } from '@/components/ui'
import { CampoSeletor } from './CampoSeletor'
import { FolhaBusca, type ResultadoBusca } from './FolhaBusca'
import { MapaPaises } from './MapaPaises'

/** Localidade escolhida, pronta para virar uma cidade cadastrada. */
export interface Localidade {
  paisCodigo: string
  pais: string
  uf: string
  nome: string
  /** código oficial do IBGE (só para o Brasil) */
  codigoIbge: string | null
  populacao: number | null
}

type Aberta = 'pais' | 'estado' | 'municipio' | null

const LIMITE = 60

/**
 * Escolha de país → estado → município, sem digitar nome à mão.
 * Brasil: listas oficiais do IBGE (5.571 municípios) com busca sem acento; o
 * estado é opcional (buscar o município direto já preenche o estado).
 * Outros países: ainda sem lista oficial, aceita estado/região e cidade em texto.
 */
export function SeletorLocalidade({ aoMudar }: { aoMudar: (l: Localidade | null) => void }) {
  const [paisCodigo, setPaisCodigo] = useState('BR')
  const [uf, setUf] = useState('')
  const [municipio, setMunicipio] = useState<Municipio | null>(null)
  const [regiao, setRegiao] = useState('')
  const [cidade, setCidade] = useState('')
  const [aberta, setAberta] = useState<Aberta>(null)
  const [todos, setTodos] = useState<Municipio[] | null>(null)

  const brasil = paisCodigo === 'BR'
  const paises = useMemo(() => listaPaises(), [])
  const pais = paises.find((p) => p.codigo === paisCodigo) ?? paises[0]
  const estado = ESTADOS.find((e) => e.sigla === uf)

  // já carrega a lista de municípios em segundo plano (arquivo separado)
  useEffect(() => {
    if (!brasil || todos) return
    let vivo = true
    carregarMunicipios().then((l) => vivo && setTodos(l))
    return () => {
      vivo = false
    }
  }, [brasil, todos])

  const localidade = useMemo<Localidade | null>(() => {
    if (brasil) {
      return municipio
        ? { paisCodigo, pais: 'Brasil', uf: municipio.uf, nome: municipio.nome, codigoIbge: municipio.codigo, populacao: municipio.populacao }
        : null
    }
    return cidade.trim()
      ? { paisCodigo, pais: pais.nome, uf: regiao.trim(), nome: cidade.trim(), codigoIbge: null, populacao: null }
      : null
  }, [brasil, municipio, paisCodigo, pais.nome, regiao, cidade])

  useEffect(() => aoMudar(localidade), [localidade, aoMudar])

  const buscarPais = (termo: string): ResultadoBusca => {
    const t = normalizar(termo)
    const achados = t ? paises.filter((p) => normalizar(p.nome).includes(t) || p.codigo.toLowerCase() === t) : paises
    return { itens: achados.slice(0, LIMITE).map((p) => ({ id: p.codigo, rotulo: p.nome })), total: achados.length }
  }
  const buscarEstado = (termo: string): ResultadoBusca => {
    const t = normalizar(termo)
    const achados = t ? ESTADOS.filter((e) => normalizar(e.nome).includes(t) || e.sigla.toLowerCase() === t) : ESTADOS
    return { itens: achados.map((e) => ({ id: e.sigla, rotulo: e.nome, detalhe: e.sigla })), total: achados.length }
  }
  const buscarMun = (termo: string): ResultadoBusca => {
    if (!todos) return { itens: [], total: 0, carregando: true }
    const { itens, total } = buscarMunicipios(todos, termo, uf, LIMITE)
    return {
      total,
      itens: itens.map((m) => ({
        id: m.codigo,
        rotulo: m.nome,
        detalhe: uf ? (m.populacao ? `${m.populacao.toLocaleString('pt-BR')} hab.` : undefined) : m.uf,
      })),
    }
  }

  const escolherPais = (codigo: string) => {
    setPaisCodigo(codigo)
    setUf('')
    setMunicipio(null)
    setRegiao('')
    setCidade('')
    setAberta(null)
  }
  const escolherEstado = (sigla: string) => {
    setUf(sigla)
    if (municipio && municipio.uf !== sigla) setMunicipio(null)
    setAberta(null)
  }
  const escolherMunicipio = (codigo: string) => {
    const m = todos?.find((x) => x.codigo === codigo)
    if (m) {
      setMunicipio(m)
      setUf(m.uf)
    }
    setAberta(null)
  }

  return (
    <div>
      <CampoSeletor rotulo="País" valor={pais.nome} placeholder="Escolha o país" aoAbrir={() => setAberta('pais')} />

      {brasil ? (
        <>
          <CampoSeletor
            rotulo="Estado"
            valor={estado ? estado.nome : null}
            detalhe={estado?.sigla}
            placeholder="Escolha o estado (opcional)"
            aoAbrir={() => setAberta('estado')}
          />
          <CampoSeletor
            rotulo="Município"
            valor={municipio?.nome ?? null}
            detalhe={municipio ? municipio.uf : null}
            placeholder="Busque pelo nome do município"
            dica={municipio ? undefined : 'Dica: dá para buscar o município direto, sem escolher o estado antes.'}
            aoAbrir={() => setAberta('municipio')}
          />
        </>
      ) : (
        <>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-tinta">Estado ou região (opcional)</span>
            <Input value={regiao} onChange={(e) => setRegiao(e.target.value)} autoComplete="off" />
          </label>
          <label className="mb-2 block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-tinta">Cidade</span>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} autoComplete="off" />
          </label>
          <p className="mb-4 rounded-lg bg-marca-fundo px-3 py-2 text-legenda text-marca-escura">
            Para este país ainda não há lista oficial nem coleta automática de dados. Por enquanto, só o Brasil tem seleção
            guiada.
          </p>
        </>
      )}

      <FolhaBusca
        aberto={aberta === 'pais'}
        aoFechar={() => setAberta(null)}
        titulo="País"
        placeholder="Buscar país…"
        buscar={buscarPais}
        aoEscolher={escolherPais}
        selecionadoId={paisCodigo}
        topo={<MapaPaises selecionado={paisCodigo} aoEscolher={escolherPais} />}
      />
      <FolhaBusca
        aberto={aberta === 'estado'}
        aoFechar={() => setAberta(null)}
        titulo="Estado"
        placeholder="Buscar estado…"
        buscar={buscarEstado}
        aoEscolher={escolherEstado}
        selecionadoId={uf}
      />
      <FolhaBusca
        aberto={aberta === 'municipio'}
        aoFechar={() => setAberta(null)}
        titulo={estado ? `Município · ${estado.sigla}` : 'Município'}
        placeholder="Buscar município…"
        buscar={buscarMun}
        aoEscolher={escolherMunicipio}
        selecionadoId={municipio?.codigo}
      />
    </div>
  )
}
