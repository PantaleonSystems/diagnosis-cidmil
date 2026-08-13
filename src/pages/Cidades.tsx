import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { useCidades } from '@/lib/cidadeAtiva'
import { Modal } from '@/components/ui/Modal'
import { Button, Card, Erro, Field, Input, Pill, Vazio, cx } from '@/components/ui'
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

      <ModalNovaCidade
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoCriar={async (dados) => {
          await criarCidade(dados)
          setModalAberto(false)
          navigate('/app/avaliacao')
        }}
      />
    </>
  )
}

function ModalNovaCidade({
  aberto,
  aoFechar,
  aoCriar,
}: {
  aberto: boolean
  aoFechar: () => void
  aoCriar: (dados: {
    nome: string
    uf: string
    pais: string
    populacao: number | null
  }) => Promise<void>
}) {
  const [nome, setNome] = useState('')
  const [uf, setUf] = useState('')
  const [pais, setPais] = useState('Brasil')
  const [populacao, setPopulacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await aoCriar({
        nome: nome.trim(),
        uf: uf.trim().toUpperCase(),
        pais: pais.trim(),
        populacao: populacao ? Number(populacao) : null,
      })
      setNome('')
      setUf('')
      setPopulacao('')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível cadastrar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Nova cidade"
      descricao="Ao cadastrar, uma avaliação do módulo Saúde é aberta em rascunho."
    >
      <form onSubmit={enviar}>
        <Erro>{erro}</Erro>

        <Field label="Nome da cidade">
          <Input
            required
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Município de Aurora"
          />
        </Field>

        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field label="UF">
            <Input
              value={uf}
              maxLength={2}
              onChange={(e) => setUf(e.target.value)}
              placeholder="SP"
            />
          </Field>
          <Field label="País">
            <Input value={pais} onChange={(e) => setPais(e.target.value)} />
          </Field>
        </div>

        <Field
          label="População"
          hint="Usada nas métricas de densidade (ex.: espaços por 10 mil hab.)."
        >
          <Input
            type="number"
            min={0}
            value={populacao}
            onChange={(e) => setPopulacao(e.target.value)}
            placeholder="100000"
          />
        </Field>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variante="ghost" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Cadastrando…' : 'Cadastrar e avaliar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
