import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { Chip } from '@/components/mobile/Chip'
import { Folha } from '@/components/mobile/Folha'
import { SeloNota } from '@/components/mobile/SeloNota'
import { PILARES, type Metrica } from '@/data/metricas'
import { useCidades } from '@/lib/cidadeAtiva'
import { useRespostas, type RespostasPorMetrica } from '@/lib/respostas'
import { maturidade, memoriaDeCalculo, prioridade, type Nota, type Prioridade } from '@/lib/calculos'
import { mediaPilar } from '@/lib/isps'
import { NOTE_COLORS, PRIO_COLORS, PRIO_TEXT, fmt, textoSobre } from '@/lib/theme'
import { Button, Card, NotaBadge, Pill, Splash, Vazio } from '@/components/ui'

/** Detalhamento auditável: cada métrica, sua nota e a prioridade que gera. */
export function Resultados() {
  const navigate = useNavigate()
  const { cidadeAtiva, avaliacaoAtiva, caminhoCidade } = useCidades()
  const { respostas, notas, carregando } = useRespostas(avaliacaoAtiva?.id ?? null)
  const [filtro, setFiltro] = useState<Prioridade | 'Todas'>('Todas')
  const [aberta, setAberta] = useState<Metrica | null>(null)

  if (!cidadeAtiva) return null
  if (carregando) return <Splash texto="Carregando os resultados…" />

  const respondidas = Object.keys(respostas).length
  if (respondidas === 0) {
    return (
      <>
        <Topbar titulo="Resultados por pilar" sub={cidadeAtiva.nome} />
        <Vazio
          titulo="Sem resultados ainda"
          descricao="Preencha as métricas na tela de avaliação para ver o detalhamento nota a nota."
          acao={<Button onClick={() => navigate(caminhoCidade('avaliacao'))}>Ir para a avaliação</Button>}
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

      <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0" role="group" aria-label="Filtrar por prioridade">
        {(['Todas', 'Alta', 'Média', 'Baixa'] as const).map((f) => (
          <Chip key={f} ativo={filtro === f} onClick={() => setFiltro(f)}>
            {f === 'Todas' ? 'Todas as métricas' : `Prioridade ${f}`}
          </Chip>
        ))}
      </div>

      {PILARES.map((pilar) => {
        const respondidasDoPilar = pilar.metricas.filter(
          (m) => notas[m.numero] !== undefined,
        )
        const media = mediaPilar(pilar, notas)

        return (
          <Card key={pilar.numero} className="mb-4.5">
            <div className="mb-3 flex flex-wrap items-center gap-3.5">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[11px] text-[19px] font-extrabold"
                style={{ backgroundColor: pilar.cor, color: textoSobre(pilar.cor) }}
              >
                {pilar.numero}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base text-noite">{pilar.nome}</h3>
                <p className="text-xs text-cinza">
                  Métrica central: {pilar.central} · peso{' '}
                  {Math.round(pilar.peso * 100)}%
                </p>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-extrabold text-noite">
                  {respondidasDoPilar.length ? fmt(media) : '—'}
                </div>
                <div className="text-[11px] text-cinza-cl">
                  média de {respondidasDoPilar.length}/{pilar.metricas.length}
                </div>
              </div>
            </div>

            {/* celular: lista de cartões; toque abre o detalhe */}
            <ul className="space-y-2.5 lg:hidden">
              {pilar.metricas
                .filter((m) => filtro === 'Todas' || (notas[m.numero] !== undefined && prioridade(notas[m.numero]) === filtro))
                .map((m) => {
                  const nota = notas[m.numero]
                  return (
                    <li key={m.numero}>
                      <button
                        type="button"
                        onClick={() => setAberta(m)}
                        className="toque w-full rounded-xl border border-linha bg-white p-3.5 text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-micro font-extrabold uppercase text-marca">M{m.numero}</span>
                          {nota !== undefined ? <SeloNota nota={nota} /> : <span className="text-legenda text-cinza">não respondida</span>}
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-corpo font-bold text-noite">{m.titulo}</p>
                        {nota !== undefined && (
                          <p className="mt-1 text-legenda font-bold" style={{ color: PRIO_TEXT[prioridade(nota)] }}>
                            Prioridade {prioridade(nota)}
                          </p>
                        )}
                      </button>
                    </li>
                  )
                })}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
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
                  {pilar.metricas
                    .filter((m) => filtro === 'Todas' || (notas[m.numero] !== undefined && prioridade(notas[m.numero]) === filtro))
                    .map((m) => {
                    const nota = notas[m.numero]
                    const respondida = nota !== undefined

                    return (
                      <tr key={m.numero} className={respondida ? '' : 'opacity-50'}>
                        <td className="w-11 border-b border-linha p-2.5 font-extrabold text-marca-escura">
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
                                    color: PRIO_TEXT[p],
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

      <Folha aberto={aberta !== null} aoFechar={() => setAberta(null)} titulo={aberta ? `Métrica ${aberta.numero}` : 'Métrica'}>
        {aberta && <DetalheMetrica metrica={aberta} resposta={respostas[aberta.numero]} />}
      </Folha>
    </>
  )
}

/** Detalhe de uma métrica: nota, prioridade, como foi calculada e como buscar o dado. */
function DetalheMetrica({ metrica, resposta }: { metrica: Metrica; resposta: RespostasPorMetrica[number] | undefined }) {
  const nota = resposta?.nota as Nota | undefined
  const calculo =
    resposta === undefined
      ? null
      : metrica.tipo === 'regua'
        ? `Nível ${resposta.nota}: “${metrica.niveis[resposta.nota]}”`
        : memoriaDeCalculo(metrica, resposta.dadosBrutos)

  return (
    <div className="pb-3">
      <h3 className="text-subtitulo font-bold text-noite">{metrica.titulo}</h3>
      {nota !== undefined ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <SeloNota nota={nota} />
          <span className="text-legenda font-bold" style={{ color: PRIO_TEXT[prioridade(nota)] }}>
            Prioridade {prioridade(nota)}
          </span>
        </div>
      ) : (
        <p className="mt-3 text-corpo text-cinza">Esta métrica ainda não foi respondida.</p>
      )}

      {calculo && (
        <>
          <div className="mt-4 text-micro font-extrabold uppercase text-cinza">Como foi calculada</div>
          <p className="mt-1 text-corpo text-tinta">{calculo}</p>
        </>
      )}
      {nota !== undefined && (
        <p className="mt-1 text-legenda text-cinza">Maturidade: {maturidade(nota)}</p>
      )}

      <div className="mt-4 text-micro font-extrabold uppercase text-cinza">Como buscar o dado</div>
      <p className="mt-1 text-corpo text-cinza">{metrica.dica}</p>
    </div>
  )
}
