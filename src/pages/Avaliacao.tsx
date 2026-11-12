import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { AvaliacaoGuiada } from '@/components/metrics/AvaliacaoGuiada'
import { MetricField } from '@/components/metrics/MetricField'
import { Chip } from '@/components/mobile/Chip'
import { useMediaQuery } from '@/lib/movimento'
import { PILARES, TOTAL_METRICAS } from '@/data/metricas'
import { useCidades } from '@/lib/cidadeAtiva'
import { useRespostas, type EstadoSalvamento } from '@/lib/respostas'
import { consolidar, mediaPilar } from '@/lib/isps'
import { supabase } from '@/lib/supabase'
import { fmt, textoSobre } from '@/lib/theme'
import { Button, Card, Erro, Splash, Vazio, cx } from '@/components/ui'

export function Avaliacao() {
  const navigate = useNavigate()
  const { cidadeAtiva, avaliacaoAtiva, recarregar, caminhoCidade } = useCidades()
  const { respostas, notas, registrar, carregando, estado, erro } = useRespostas(
    avaliacaoAtiva?.id ?? null,
  )
  const [concluindo, setConcluindo] = useState(false)
  const [erroConclusao, setErroConclusao] = useState<string | null>(null)
  // celular: uma métrica por vez; computador: lista completa (a pessoa pode trocar)
  const noComputador = useMediaQuery('(min-width: 1024px)')
  const [escolhaModo, setEscolhaModo] = useState<'guiado' | 'lista' | null>(null)
  const modo = escolhaModo ?? (noComputador ? 'lista' : 'guiado')

  if (!cidadeAtiva) return null
  if (!avaliacaoAtiva) {
    return (
      <>
        <Topbar titulo="Avaliação" sub={cidadeAtiva.nome} />
        <Vazio
          titulo="Sem avaliação aberta"
          descricao="Esta cidade ainda não tem uma avaliação do módulo Saúde. Solicite a cidade novamente para abrir um rascunho."
          acao={<Button onClick={() => navigate('/app')}>Ver todas as cidades</Button>}
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
    navigate(caminhoCidade())
  }

  const cartaoConcluir = (
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] text-noite">Concluir avaliação</h3>
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
              <div className="text-2xl font-extrabold text-noite">
                {fmt(resultado.isps, 2)}
              </div>
            </div>
            <Button onClick={() => void concluir()} disabled={concluindo || !respondidas}>
              {concluindo ? 'Concluindo…' : 'Concluir avaliação'}
            </Button>
          </div>
        </div>
      </Card>
  )

  return (
    <>
      <Topbar
        titulo="Módulo Saúde · Avaliação"
        sub={`${cidadeAtiva.nome} · coleta de dados brutos, a nota é calculada pelo sistema`}
        acao={<IndicadorSalvamento estado={estado} />}
      />

      <Erro>{erro ?? erroConclusao}</Erro>

      {/* ------------------------------------------------- barra de progresso */}
      {modo === 'lista' && (
      <Card className="mb-5 border-dashed bg-app-bg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-[22px]" aria-hidden>
              🧮
            </span>
            <div>
              <h3 className="text-[15px] text-noite">Coleta de dados brutos</h3>
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
            <div className="text-2xl font-extrabold text-noite">
              {respondidas}
              <span className="text-sm font-semibold text-cinza-cl">
                /{TOTAL_METRICAS}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded bg-linha">
          <div
            className="h-full rounded bg-marca transition-[width] duration-300"
            style={{ width: `${(respondidas / TOTAL_METRICAS) * 100}%` }}
          />
        </div>
      </Card>
      )}

      <div className="mb-4 flex gap-2" role="group" aria-label="Modo de preenchimento">
        <Chip ativo={modo === 'guiado'} onClick={() => setEscolhaModo('guiado')}>Uma por vez</Chip>
        <Chip ativo={modo === 'lista'} onClick={() => setEscolhaModo('lista')}>Lista completa</Chip>
      </div>

      {modo === 'guiado' && (
        <AvaliacaoGuiada respostas={respostas} aoResponder={(metrica, valor, imediato) => registrar(metrica, valor, imediato)} concluir={cartaoConcluir} />
      )}

      {/* ---------------------------------------------------- grupos por pilar */}
      {modo === 'lista' && PILARES.map((pilar) => {
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
                className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] text-[17px] font-extrabold"
                style={{ backgroundColor: pilar.cor, color: textoSobre(pilar.cor) }}
              >
                {pilar.numero}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] font-bold uppercase tracking-[1px] text-cinza">
                  Pilar {pilar.numero} · peso {Math.round(pilar.peso * 100)}% ·{' '}
                  {feitas}/{pilar.metricas.length} preenchidas
                </div>
                <h3 className="text-base text-noite">{pilar.nome}</h3>
              </div>
              <div className="text-right leading-tight">
                <span
                  className="block text-[22px] font-extrabold text-noite"
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

      {modo === 'lista' && cartaoConcluir}
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
          ? 'bg-erro-bg text-erro-txt'
          : estado === 'salvo'
            ? 'bg-ok-bg text-ok-txt'
            : 'bg-marca-fundo text-marca-escura',
      )}
      aria-live="polite"
    >
      {texto}
    </span>
  )
}
