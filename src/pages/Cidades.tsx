import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { useCidades } from '@/lib/cidadeAtiva'
import { Folha } from '@/components/mobile/Folha'
import { SeletorLocalidade, type Localidade } from '@/components/localidade/SeletorLocalidade'
import { Button, Card, Erro, Field, Input, Pill, Vazio, cx } from '@/components/ui'
import { normalizar } from '@/lib/localidades'
import type { Cidade } from '@/types/db'
import { NIVEIS, nivelMaturidade } from '@/lib/isps'
import { fmt } from '@/lib/theme'

export function Cidades() {
  const navigate = useNavigate()
  const { cidades, avaliacoes, cidadeAtiva, selecionar, criarCidade } = useCidades()
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <>
      <Topbar
        titulo="Cidades avaliadas"
        sub="Cadastro de cidades e escolha da cidade ativa no diagnóstico"
        acao={<Button onClick={() => setModalAberto(true)}>+ Nova cidade</Button>}
      />

      {cidades.length === 0 ? (
        <Vazio
          titulo="Nenhuma cidade cadastrada"
          descricao="Cadastre a primeira cidade para abrir uma avaliação do módulo Saúde. A coleta de dados começa logo em seguida."
          acao={<Button onClick={() => setModalAberto(true)}>Cadastrar cidade</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cidades.map((c) => {
            const av = avaliacoes.get(c.id)
            const ativa = cidadeAtiva?.id === c.id
            const concluida = av?.status === 'concluida' && av.isps !== null

            return (
              <Card
                key={c.id}
                className={cx(
                  'transition-shadow',
                  ativa && 'ring-2 ring-ciano ring-offset-2',
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base text-petroleo">{c.nome}</h3>
                    <p className="text-[12.5px] text-cinza">
                      {[c.uf, c.pais].filter(Boolean).join(' · ')}
                      {c.populacao
                        ? ` · ${c.populacao.toLocaleString('pt-BR')} hab.`
                        : ''}
                    </p>
                  </div>
                  {ativa && (
                    <Pill className="bg-ciano-cl text-ciano-esc">ativa</Pill>
                  )}
                </div>

                <div className="mb-4 flex items-end justify-between gap-3 border-t border-linha pt-3">
                  <div>
                    <div className="text-[10.5px] font-bold uppercase tracking-[1px] text-cinza-cl">
                      ISPS · módulo Saúde
                    </div>
                    <div className="text-[28px] font-extrabold leading-tight text-petroleo">
                      {concluida ? fmt(av.isps as number, 2) : '—'}
                      {concluida && (
                        <span className="ml-1 text-sm font-semibold text-cinza-cl">
                          /4
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-[11.5px] text-cinza">
                    {av ? (
                      <>
                        <div>{av.ano}</div>
                        <div className="font-semibold">
                          {concluida
                            ? NIVEIS[nivelMaturidade(av.isps as number)]
                            : 'Em rascunho'}
                        </div>
                      </>
                    ) : (
                      <span className="text-cinza-cl">sem avaliação</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variante={ativa ? 'ghost' : 'primario'}
                    className="flex-1 px-3 py-2 text-[13px]"
                    onClick={() => selecionar(c.id)}
                    disabled={ativa}
                  >
                    {ativa ? 'Cidade ativa' : 'Selecionar'}
                  </Button>
                  <Button
                    variante="ghost"
                    className="px-3 py-2 text-[13px]"
                    onClick={() => {
                      selecionar(c.id)
                      navigate('/app/avaliacao')
                    }}
                  >
                    Avaliar →
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <NovaCidadeFolha
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        existentes={cidades}
        aoUsarExistente={(c) => {
          selecionar(c.id)
          setModalAberto(false)
          navigate('/app/avaliacao')
        }}
        aoCriar={async (dados) => {
          await criarCidade(dados)
          setModalAberto(false)
          navigate('/app/avaliacao')
        }}
      />
    </>
  )
}

type DadosCidade = { nome: string; uf: string; pais: string; populacao: number | null }

function NovaCidadeFolha({
  aberto,
  aoFechar,
  aoCriar,
  aoUsarExistente,
  existentes,
}: {
  aberto: boolean
  aoFechar: () => void
  aoCriar: (dados: DadosCidade) => Promise<void>
  aoUsarExistente: (c: Cidade) => void
  existentes: Cidade[]
}) {
  // o formulário fica dentro da folha: ao fechar, o estado dele zera sozinho
  return (
    <Folha aberto={aberto} aoFechar={aoFechar} titulo="Nova cidade">
      <FormularioNovaCidade aoCriar={aoCriar} aoUsarExistente={aoUsarExistente} existentes={existentes} />
    </Folha>
  )
}

function FormularioNovaCidade({
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
        Escolha o município numa lista oficial. Ao cadastrar, abrimos a avaliação do módulo Saúde.
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
            Usar esta cidade
          </Button>
        </div>
      ) : (
        <Button type="submit" className="alvo w-full" disabled={!loc || enviando}>
          {enviando ? 'Cadastrando…' : 'Cadastrar e avaliar'}
        </Button>
      )}
    </form>
  )
}
