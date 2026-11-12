import { Link, useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { GaugeIndice } from '@/components/charts/GaugeIndice'
import { RadarChart } from '@/components/charts/RadarChart'
import { PILARES, TOTAL_METRICAS } from '@/data/metricas'
import { useCidades } from '@/lib/cidadeAtiva'
import { ehDemonstracao, nomeCurto, ufVisivel } from '@/lib/cidades'
import { useRespostas } from '@/lib/respostas'
import { NIVEIS, consolidar, MINIMO_GOVERNANCA } from '@/lib/isps'
import { fmt } from '@/lib/theme'
import { Aviso, Button, Card, CardTitulo, Splash, Vazio } from '@/components/ui'

/** Visão geral da cidade: o índice primeiro, depois os dados reunidos e os pilares. */
export function Dashboard() {
  const navigate = useNavigate()
  const { cidadeAtiva, avaliacaoAtiva, caminhoCidade } = useCidades()
  const { respostas, notas, carregando } = useRespostas(avaliacaoAtiva?.id ?? null)

  if (!cidadeAtiva) return null
  if (carregando) return <Splash texto="Carregando o diagnóstico…" />

  const respondidas = Object.keys(respostas).length
  const nome = nomeCurto(cidadeAtiva)
  const uf = ufVisivel(cidadeAtiva)
  const sub = [
    uf,
    cidadeAtiva.populacao ? `${cidadeAtiva.populacao.toLocaleString('pt-BR')} hab.` : null,
    `Módulo Saúde${avaliacaoAtiva ? ` · ${avaliacaoAtiva.ano}` : ''}`,
  ]
    .filter(Boolean)
    .join(' · ')
  const demo = ehDemonstracao(cidadeAtiva)

  if (respondidas === 0) {
    return (
      <>
        <Topbar titulo={nome} sub={sub} />
        <Vazio
          titulo="Esta cidade ainda não tem dados"
          descricao={`Quando houver dados de ${nome}, o índice, os pilares e o plano de ação aparecem aqui. Por enquanto você pode preencher à mão.`}
          acao={<Button className="alvo" onClick={() => navigate(caminhoCidade('avaliacao'))}>Preencher dados →</Button>}
        />
      </>
    )
  }

  const r = consolidar(notas)
  const concluida = avaliacaoAtiva?.status === 'concluida'
  const progresso = Math.round((respondidas / TOTAL_METRICAS) * 100)

  return (
    <>
      <Topbar
        titulo={nome}
        sub={sub}
        acao={
          <>
            {demo && (
              <span className="hidden rounded-full bg-marca-fundo px-3 py-1 text-micro font-extrabold uppercase text-marca-escura lg:inline-block">
                Demonstração
              </span>
            )}
            {!concluida && (
              <Button variante="ghost" className="alvo hidden lg:inline-flex" onClick={() => navigate(caminhoCidade('avaliacao'))}>
                Continuar avaliação
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
        {/* ------------------------------------------------------------ índice */}
        <Card className="text-center">
          <span className="text-micro font-extrabold uppercase text-cinza">Índice Cidades MIL de Saúde</span>
          <GaugeIndice isps={r.isps} nivel={r.nivelExibido} travado={r.travado} className="mx-auto mt-1" tamanho={240} />

          <div className="mt-2 flex gap-1.5" aria-hidden>
            {NIVEIS.map((n, i) => (
              <span key={n} className={`h-1.5 flex-1 rounded-full ${i <= r.nivelExibido ? 'bg-marca' : 'bg-linha'}`} />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-micro font-semibold text-cinza" aria-hidden>
            {NIVEIS.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>

          {r.travado && (
            <div className="mt-4 text-left">
              <Aviso>
                <strong>Regra de Ouro:</strong> a Governança Participativa (Pilar 1 = {fmt(r.mediaGovernanca)}) está abaixo de{' '}
                {fmt(MINIMO_GOVERNANCA)}. A cidade é mantida no Nível 2, pois participação é pré-requisito para uma Cidade MIL.
                O índice real continua sendo {fmt(r.isps, 2)} (Nível {r.nivelReal + 1}).
              </Aviso>
            </div>
          )}
          {!concluida && (
            <p className="mt-3 text-legenda text-cinza">Índice parcial: considera só as {respondidas} métricas respondidas.</p>
          )}
        </Card>

        {/* ------------------------------------------- dados + pilares + radar */}
        <div className="flex flex-col gap-4">
          <Link
            to={caminhoCidade('dados')}
            className="toque flex items-center gap-4 rounded-card border border-linha bg-white px-4 py-3.5 shadow-card hover:border-marca-clara"
          >
            <div className="min-w-0 flex-1">
              <div className="text-corpo font-bold text-noite">
                Dados reunidos: {progresso}%
              </div>
              <div className="mt-0.5 text-legenda text-cinza">
                {respondidas} de {TOTAL_METRICAS} métricas · {concluida ? 'avaliação concluída' : 'em andamento'}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-linha" aria-hidden>
                <div className="h-full rounded-full bg-marca" style={{ width: `${progresso}%`, transition: 'width 600ms cubic-bezier(0.2,0.9,0.25,1)' }} />
              </div>
            </div>
            <span className="shrink-0 text-corpo font-bold text-marca">Ver dados</span>
          </Link>

          <Card>
            <CardTitulo titulo="Pilares" sub="Nota de 0 a 4 · peso de cada pilar no índice" />
            <ul className="space-y-3.5">
              {r.pilares.map((p) => (
                <li key={p.pilar.numero}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-corpo font-bold text-noite">{p.pilar.curto}</span>
                    <span className="text-corpo font-extrabold text-noite">{p.respondidas ? fmt(p.media) : '—'}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-linha" aria-hidden>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(p.media / 4) * 100}%`, backgroundColor: p.pilar.cor, transition: 'width 700ms cubic-bezier(0.2,0.9,0.25,1)' }}
                    />
                  </div>
                  <div className="mt-1 text-legenda text-cinza">
                    peso {Math.round(p.pilar.peso * 100)}% · {p.respondidas}/{p.total} respondidas
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <CardTitulo titulo="Visão em radar" sub="Os 5 pilares lado a lado · nota de 0 a 4" />
        <div className="mx-auto max-w-[420px]">
          <RadarChart valores={r.pilares.map((p) => p.media)} rotulos={PILARES.map((p) => p.curto)} />
        </div>
      </Card>
    </>
  )
}
