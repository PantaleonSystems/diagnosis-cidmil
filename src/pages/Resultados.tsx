import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { SemCidade } from '@/components/layout/SemCidade'
import { PILARES } from '@/data/metricas'
import { useCidades } from '@/lib/cidadeAtiva'
import { useRespostas } from '@/lib/respostas'
import { maturidade, prioridade } from '@/lib/calculos'
import { mediaPilar } from '@/lib/isps'
import { NOTE_COLORS, PRIO_COLORS, fmt } from '@/lib/theme'
import { Button, Card, NotaBadge, Pill, Splash, Vazio } from '@/components/ui'

/** Detalhamento auditável: cada métrica, sua nota e a prioridade que gera. */
export function Resultados() {
  const navigate = useNavigate()
  const { cidadeAtiva, avaliacaoAtiva } = useCidades()
  const { respostas, notas, carregando } = useRespostas(avaliacaoAtiva?.id ?? null)

  if (!cidadeAtiva) return <SemCidade />
  if (carregando) return <Splash texto="Carregando os resultados…" />

  const respondidas = Object.keys(respostas).length
  if (respondidas === 0) {
    return (
      <>
        <Topbar titulo="Resultados por pilar" sub={cidadeAtiva.nome} />
        <Vazio
          titulo="Sem resultados ainda"
          descricao="Preencha as métricas na tela de avaliação para ver o detalhamento nota a nota."
          acao={<Button onClick={() => navigate('/app/avaliacao')}>Ir para a avaliação</Button>}
        />
      </>
    )
  }

  return (
    <>
      <Topbar
        titulo="Módulo Saúde · Resultados por pilar"
        sub={`${cidadeAtiva.nome} · notas, maturidade e prioridade de cada métrica`}
      />

      {PILARES.map((pilar) => {
        const respondidasDoPilar = pilar.metricas.filter(
          (m) => notas[m.numero] !== undefined,
        )
        const media = mediaPilar(pilar, notas)

        return (
          <Card key={pilar.numero} className="mb-4.5">
            <div className="mb-3 flex flex-wrap items-center gap-3.5">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[11px] text-[19px] font-extrabold text-white"
                style={{ backgroundColor: pilar.cor }}
              >
                {pilar.numero}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base text-petroleo">{pilar.nome}</h3>
                <p className="text-xs text-cinza">
                  Métrica central: {pilar.central} · peso{' '}
                  {Math.round(pilar.peso * 100)}%
                </p>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-extrabold text-petroleo">
                  {respondidasDoPilar.length ? fmt(media) : '—'}
                </div>
                <div className="text-[11px] text-cinza-cl">
                  média de {respondidasDoPilar.length}/{pilar.metricas.length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {['Nº', 'Métrica', 'Nota', 'Maturidade', 'Prioridade'].map((h) => (
                      <th
                        key={h}
                        className="border-b-2 border-linha px-2.5 py-2 text-left text-[10.5px] font-bold uppercase tracking-[0.6px] text-cinza"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pilar.metricas.map((m) => {
                    const nota = notas[m.numero]
                    const respondida = nota !== undefined

                    return (
                      <tr key={m.numero} className={respondida ? '' : 'opacity-50'}>
                        <td className="w-11 border-b border-linha p-2.5 font-extrabold text-ciano-esc">
                          {m.numero}
                        </td>
                        <td className="border-b border-linha p-2.5 text-tinta">
                          {m.titulo}
                        </td>
                        <td className="border-b border-linha p-2.5">
                          {respondida ? (
                            <NotaBadge nota={nota} cor={NOTE_COLORS[nota]} />
                          ) : (
                            <span className="text-cinza-cl">—</span>
                          )}
                        </td>
                        <td className="border-b border-linha p-2.5 text-xs text-cinza">
                          {respondida ? maturidade(nota) : 'não respondida'}
                        </td>
                        <td className="border-b border-linha p-2.5">
                          {respondida &&
                            (() => {
                              const p = prioridade(nota)
                              return (
                                <Pill
                                  style={{
                                    backgroundColor: `${PRIO_COLORS[p]}22`,
                                    color: PRIO_COLORS[p],
                                  }}
                                >
                                  {p}
                                </Pill>
                              )
                            })()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      })}
    </>
  )
}
