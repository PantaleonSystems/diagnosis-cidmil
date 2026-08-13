import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { MetricField } from '@/components/metrics/MetricField'
import { PILARES, TOTAL_METRICAS } from '@/data/metricas'
import { useCidades } from '@/lib/cidadeAtiva'
import { useRespostas, type EstadoSalvamento } from '@/lib/respostas'
import { consolidar, mediaPilar } from '@/lib/isps'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/theme'
import { Button, Card, Erro, Splash, Vazio, cx } from '@/components/ui'
import { SemCidade } from '@/components/layout/SemCidade'

export function Avaliacao() {
  const navigate = useNavigate()
  const { cidadeAtiva, avaliacaoAtiva, recarregar } = useCidades()
  const { respostas, notas, registrar, carregando, estado, erro } = useRespostas(
    avaliacaoAtiva?.id ?? null,
  )
  const [concluindo, setConcluindo] = useState(false)
  const [erroConclusao, setErroConclusao] = useState<string | null>(null)

  if (!cidadeAtiva) return <SemCidade />
  if (!avaliacaoAtiva) {
    return (
      <>
        <Topbar titulo="Avaliação" sub={cidadeAtiva.nome} />
        <Vazio
          titulo="Sem avaliação aberta"
          descricao="Esta cidade ainda não tem uma avaliação do módulo Saúde. Cadastre-a novamente pela tela de Cidades para abrir um rascunho."
          acao={<Button onClick={() => navigate('/app/cidades')}>Ir para Cidades</Button>}
        />
      </>
    )
  }
  if (carregando) return <Splash texto="Carregando as respostas…" />

  const respondidas = Object.keys(respostas).length
  const completo = respondidas === TOTAL_METRICAS
  const resultado = consolidar(notas)

  async function concluir() {
    if (!avaliacaoAtiva) return
    setErroConclusao(null)
    setConcluindo(true)

    const { error } = await supabase
      .from('avaliacoes')
      .update({
        isps: resultado.isps,
        status: 'concluida',
        concluida_em: new Date().toISOString(),
      })
      .eq('id', avaliacaoAtiva.id)

    setConcluindo(false)
    if (error) {
      setErroConclusao(error.message)
      return
    }
    await recarregar()
    navigate('/app')
  }

  return (
    <>
      <Topbar
        titulo="Módulo Saúde · Avaliação"
        sub={`${cidadeAtiva.nome} · coleta de dados brutos, a nota é calculada pelo sistema`}
        acao={<IndicadorSalvamento estado={estado} />}
      />

      <Erro>{erro ?? erroConclusao}</Erro>

      {/* ------------------------------------------------- barra de progresso */}
      <Card className="mb-5 border-dashed bg-app-bg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-[22px]" aria-hidden>
              🧮
            </span>
            <div>
              <h3 className="text-[15px] text-petroleo">Coleta de dados brutos</h3>
              <p className="max-w-2xl text-[12.5px] text-cinza">
                As <strong>{TOTAL_METRICAS} métricas</strong> de saúde (63–105)
                organizadas pelos 5 pilares. Onde o framework define fórmula objetiva, a
                nota é <strong>calculada</strong> a partir dos números. Nas métricas
                qualitativas, ela vem de uma <strong>régua 0–4</strong> por critério.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10.5px] font-bold uppercase tracking-[1px] text-cinza-cl">
              preenchimento
            </div>
            <div className="text-2xl font-extrabold text-petroleo">
              {respondidas}
              <span className="text-sm font-semibold text-cinza-cl">
                /{TOTAL_METRICAS}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded bg-linha">
          <div
            className="h-full rounded bg-ciano transition-[width] duration-300"
            style={{ width: `${(respondidas / TOTAL_METRICAS) * 100}%` }}
          />
        </div>
      </Card>

      {/* ---------------------------------------------------- grupos por pilar */}
      {PILARES.map((pilar) => {
        const media = mediaPilar(pilar, notas)
        const feitas = pilar.metricas.filter(
          (m) => respostas[m.numero] !== undefined,
        ).length

        return (
          <section key={pilar.numero} className="mb-8">
            <div
              className="mb-3.5 flex flex-wrap items-center gap-3.5 rounded-card border border-linha border-l-[5px] bg-white px-4.5 py-3.5"
              style={{ borderLeftColor: pilar.cor }}
            >
              <div
                className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] text-[17px] font-extrabold text-white"
                style={{ backgroundColor: pilar.cor }}
              >
                {pilar.numero}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] font-bold uppercase tracking-[1px] text-cinza">
                  Pilar {pilar.numero} · peso {Math.round(pilar.peso * 100)}% ·{' '}
                  {feitas}/{pilar.metricas.length} preenchidas
                </div>
                <h3 className="text-base text-petroleo">{pilar.nome}</h3>
              </div>
              <div className="text-right leading-tight">
                <span
                  className="block text-[22px] font-extrabold"
                  style={{ color: pilar.cor }}
                >
                  {feitas ? fmt(media) : '—'}
                </span>
                <span className="block text-[10.5px] font-semibold text-cinza-cl">
                  média do pilar
                </span>
              </div>
            </div>

            {pilar.metricas.map((metrica) => (
              <MetricField
                key={metrica.numero}
                metrica={metrica}
                resposta={respostas[metrica.numero]}
                aoResponder={(valor, imediato) => registrar(metrica, valor, imediato)}
              />
            ))}
          </section>
        )
      })}

      {/* ------------------------------------------------------------ concluir */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] text-petroleo">Concluir avaliação</h3>
            <p className="max-w-xl text-[12.5px] text-cinza">
              {completo
                ? 'Todas as métricas foram preenchidas. Ao concluir, o ISPS é calculado e o diagnóstico passa a aparecer na visão geral.'
                : `Faltam ${TOTAL_METRICAS - respondidas} métricas. Você pode concluir mesmo assim — o índice considera apenas o que foi respondido.`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10.5px] font-bold uppercase tracking-[1px] text-cinza-cl">
                ISPS parcial
              </div>
              <div className="text-2xl font-extrabold text-petroleo">
                {fmt(resultado.isps, 2)}
              </div>
            </div>
            <Button onClick={() => void concluir()} disabled={concluindo || !respondidas}>
              {concluindo ? 'Concluindo…' : 'Concluir avaliação'}
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}

function IndicadorSalvamento({ estado }: { estado: EstadoSalvamento }) {
  if (estado === 'ocioso') return null
  const texto = {
    salvando: 'Salvando…',
    salvo: 'Salvo',
    erro: 'Falha ao salvar',
  }[estado]

  return (
    <span
      className={cx(
        'rounded-[20px] px-3 py-1 text-[11.5px] font-semibold',
        estado === 'erro'
          ? 'bg-[#FCEEE9] text-[#B3532F]'
          : estado === 'salvo'
            ? 'bg-[#EAF7F2] text-[#2C8465]'
            : 'bg-ciano-cl text-ciano-esc',
      )}
      aria-live="polite"
    >
      {texto}
    </span>
  )
}
