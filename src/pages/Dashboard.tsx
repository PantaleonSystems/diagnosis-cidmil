import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { SemCidade } from '@/components/layout/SemCidade'
import { RadarChart } from '@/components/charts/RadarChart'
import { PILARES, TOTAL_METRICAS } from '@/data/metricas'
import { useCidades } from '@/lib/cidadeAtiva'
import { useRespostas } from '@/lib/respostas'
import { NIVEIS, consolidar, MINIMO_GOVERNANCA } from '@/lib/isps'
import { fmt } from '@/lib/theme'
import { Aviso, Button, Card, CardTitulo, Splash, Vazio, cx } from '@/components/ui'

export function Dashboard() {
  const navigate = useNavigate()
  const { cidadeAtiva, avaliacaoAtiva } = useCidades()
  const { respostas, notas, carregando } = useRespostas(avaliacaoAtiva?.id ?? null)

  if (!cidadeAtiva) return <SemCidade />
  if (carregando) return <Splash texto="Carregando o diagnóstico…" />

  const respondidas = Object.keys(respostas).length

  if (respondidas === 0) {
    return (
      <>
        <Topbar titulo="Módulo Saúde · Visão geral" sub={cidadeAtiva.nome} />
        <Vazio
          titulo="Nenhum dado coletado ainda"
          descricao={`A avaliação de ${cidadeAtiva.nome} está em branco. Preencha as métricas para que o índice, o radar e o plano de ação apareçam aqui.`}
          acao={
            <Button onClick={() => navigate('/app/avaliacao')}>Iniciar avaliação →</Button>
          }
        />
      </>
    )
  }

  const r = consolidar(notas)
  const concluida = avaliacaoAtiva?.status === 'concluida'

  return (
    <>
      <Topbar
        titulo="Módulo Saúde · Visão geral"
        sub={`${cidadeAtiva.nome} · ${respondidas} de ${TOTAL_METRICAS} métricas respondidas${
          concluida ? ' · avaliação concluída' : ' · rascunho'
        }`}
        acao={
          !concluida ? (
            <Button variante="ghost" onClick={() => navigate('/app/avaliacao')}>
              Continuar avaliação
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5 grid gap-5 xl:grid-cols-[1.1fr_1.4fr]">
        {/* ------------------------------------------------------------ ISPS */}
        <Card className="flex flex-col justify-center">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-ciano-esc">
            Índice Cidades MIL de Saúde (ISPS)
          </span>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[66px] font-extrabold leading-none text-petroleo">
              {fmt(r.isps, 2)}
            </span>
            <span className="text-xl font-semibold text-cinza-cl">/ 4,0</span>
          </div>

          <div className="mt-2.5">
            <span className="inline-block rounded-[20px] bg-ciano-cl px-2.5 py-[3px] text-[11px] font-bold tracking-[0.3px] text-ciano-esc">
              Nível {r.nivelExibido + 1} · {NIVEIS[r.nivelExibido]}
            </span>
          </div>

          <div className="mt-4.5 flex gap-1.5">
            {NIVEIS.map((_, i) => (
              <div
                key={i}
                className={cx(
                  'h-2 flex-1 rounded-[5px]',
                  i <= r.nivelExibido ? 'bg-ciano' : 'bg-linha',
                )}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10.5px] font-semibold text-cinza-cl">
            {NIVEIS.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>

          {r.travado && (
            <div className="mt-4">
              <Aviso>
                <strong>Regra de Ouro aplicada:</strong> a Governança Participativa
                (Pilar 1 = {fmt(r.mediaGovernanca)}) está abaixo de{' '}
                {fmt(MINIMO_GOVERNANCA)}. A cidade é mantida no Nível 2, pois
                participação é pré-requisito para uma Cidade MIL. O ISPS real continua
                sendo {fmt(r.isps, 2)} (Nível {r.nivelReal + 1}).
              </Aviso>
            </div>
          )}

          {!concluida && (
            <p className="mt-4 text-[11.5px] text-cinza-cl">
              Índice parcial — considera apenas as {respondidas} métricas já
              respondidas.
            </p>
          )}
        </Card>

        {/* ----------------------------------------------------------- radar */}
        <Card>
          <CardTitulo
            titulo="Desempenho por pilar do módulo Saúde"
            sub="Os 5 pilares que estruturam a avaliação · nota de 0 a 4"
          />
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex-1 min-w-[260px]">
              <RadarChart
                valores={r.pilares.map((p) => p.media)}
                rotulos={PILARES.map((p) => p.curto)}
              />
            </div>
            <ul className="text-[12.5px]">
              {r.pilares.map((p) => (
                <li key={p.pilar.numero} className="mb-2.5 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: p.pilar.cor }}
                  />
                  <span className="text-cinza">Pilar {p.pilar.numero}</span>
                  <span className="ml-auto pl-4 font-bold text-petroleo">
                    {p.respondidas ? fmt(p.media) : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* --------------------------------------------------------- mini-cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-5">
        {r.pilares.map((p) => (
          <div
            key={p.pilar.numero}
            className="rounded-xl border border-linha border-t-[3px] bg-white p-4"
            style={{ borderTopColor: p.pilar.cor }}
          >
            <div className="min-h-8 text-[11px] font-semibold text-cinza">
              Pilar {p.pilar.numero} · {p.pilar.nome}
            </div>
            <div className="my-1.5 text-3xl font-extrabold text-petroleo">
              {p.respondidas ? fmt(p.media) : '—'}
            </div>
            <div className="text-[11px] text-cinza-cl">
              peso {Math.round(p.pilar.peso * 100)}% · {p.respondidas}/{p.total}{' '}
              respondidas
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded bg-linha">
              <div
                className="h-full rounded"
                style={{
                  width: `${(p.media / 4) * 100}%`,
                  backgroundColor: p.pilar.cor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
