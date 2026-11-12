import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { useCidades } from '@/lib/cidadeAtiva'
import { nomeCurto } from '@/lib/cidades'
import { impactoPendente, listarPendencias, resumoPorPilar, TOTAL_METRICAS } from '@/lib/pendencias'
import { useRespostas } from '@/lib/respostas'
import { fmt } from '@/lib/theme'
import { Button, Card, CardTitulo, Splash } from '@/components/ui'

const POR_VEZ = 6
const FONTES_PREVISTAS = ['IBGE', 'DATASUS', 'INEP', 'SNIS', 'Tesouro']

/**
 * Painel de dados da cidade: o que já temos, de onde veio e o que falta, com as
 * pendências na ordem em que mais pesam no índice. É o ponto de acompanhamento
 * do passo 1 do produto (hoje os dados são declarados; a coleta automática
 * entra no mesmo lugar quando o padrão estiver definido).
 */
export function Dados() {
  const { cidadeAtiva, avaliacaoAtiva, caminhoCidade } = useCidades()
  const { respostas, carregando } = useRespostas(avaliacaoAtiva?.id ?? null)

  if (!cidadeAtiva) return null
  if (carregando) return <Splash texto="Carregando os dados…" />

  return (
    <PainelDados
      nome={nomeCurto(cidadeAtiva)}
      respostas={respostas}
      concluida={avaliacaoAtiva?.status === 'concluida'}
      linkMetrica={(numero) => `${caminhoCidade('avaliacao')}?m=${numero}`}
      linkLista={caminhoCidade('avaliacao')}
    />
  )
}

/** Parte visual do painel: recebe tudo por parâmetro (por isso aparece também na galeria /lab). */
export function PainelDados({
  nome,
  respostas,
  concluida,
  linkMetrica,
  linkLista,
}: {
  nome: string
  respostas: Record<number, unknown>
  concluida: boolean
  linkMetrica: (numero: number) => string
  linkLista: string
}) {
  const [verTodas, setVerTodas] = useState(false)

  const feitas = Object.keys(respostas).length
  const progresso = Math.round((feitas / TOTAL_METRICAS) * 100)
  const pendencias = listarPendencias(respostas)
  const faltaDoIndice = impactoPendente(pendencias)
  const mostradas = verTodas ? pendencias : pendencias.slice(0, POR_VEZ)
  const primeira = pendencias[0]

  return (
    <>
      <Topbar titulo="Dados" sub={`${nome} · o que já temos e o que falta`} />

      {/* ------------------------------------------------------------ andamento */}
      <Card className="mb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-micro font-extrabold uppercase text-cinza">Dados reunidos</div>
            <div className="mt-1 text-display font-extrabold text-noite">{progresso}%</div>
          </div>
          <div className="text-right text-legenda text-cinza">
            {feitas} de {TOTAL_METRICAS} métricas
            <br />
            {concluida ? 'avaliação concluída' : 'em andamento'}
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-linha" aria-hidden>
          <div className="h-full rounded-full bg-marca" style={{ width: `${progresso}%`, transition: 'width 600ms cubic-bezier(0.2,0.9,0.25,1)' }} />
        </div>
        {pendencias.length > 0 ? (
          <>
            <p className="mt-3 text-corpo text-cinza">
              Faltam {pendencias.length} métricas, que valem <strong className="text-noite">{fmt(faltaDoIndice * 100, 0)}% do índice</strong>.
            </p>
            <Link to={linkMetrica(primeira.metrica.numero)} className="mt-3 block">
              <Button className="alvo w-full sm:w-auto">Continuar de onde parou →</Button>
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-corpo text-cinza">Todas as métricas foram preenchidas.</p>
            <Link to={linkLista} className="mt-3 block">
              <Button variante="ghost" className="alvo w-full sm:w-auto">Revisar os dados</Button>
            </Link>
          </>
        )}
      </Card>

      {/* --------------------------------------------------------------- origem */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="text-micro font-extrabold uppercase text-cinza">Declarados</div>
          <div className="mt-1 text-[1.75rem] font-extrabold leading-none text-noite">{feitas}</div>
          <p className="mt-2 text-legenda text-cinza">
            Informados à mão por quem avalia. Ainda <strong>não verificados</strong> por uma fonte oficial.
          </p>
        </Card>
        <Card>
          <div className="text-micro font-extrabold uppercase text-cinza">Coleta automática</div>
          <div className="mt-1 text-[1.75rem] font-extrabold leading-none text-noite">0</div>
          <p className="mt-2 text-legenda text-cinza">
            Ainda não ativa. Os dados oficiais entrarão aqui sozinhos quando o padrão de coleta estiver definido.
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Fontes previstas">
            {FONTES_PREVISTAS.map((f) => (
              <li key={f} className="rounded-full border border-dashed border-linha px-2.5 py-0.5 text-micro font-bold text-cinza">
                {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ------------------------------------------------------------ pendências */}
      {pendencias.length > 0 && (
        <Card className="mb-4">
          <CardTitulo titulo="O que falta preencher" sub="Na ordem em que mais pesam no índice" />
          <ul className="-mx-1">
            {mostradas.map(({ metrica, pilar, impacto }) => (
              <li key={metrica.numero}>
                <Link
                  to={linkMetrica(metrica.numero)}
                  className="toque flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 hover:bg-marca-fundo"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-micro font-extrabold uppercase text-marca">
                      M{metrica.numero} · {pilar.curto}
                    </span>
                    <span className="block text-corpo font-semibold text-noite">{metrica.titulo}</span>
                  </span>
                  <span className="shrink-0 text-right text-legenda font-bold text-cinza">
                    {fmt(impacto * 100, 1)}%
                    <span className="block text-micro font-normal">do índice</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {pendencias.length > POR_VEZ && (
            <button
              type="button"
              onClick={() => setVerTodas((v) => !v)}
              className="alvo mt-1 w-full rounded-xl text-corpo font-bold text-marca hover:bg-marca-fundo"
            >
              {verTodas ? 'Mostrar menos' : `Ver todas as ${pendencias.length} pendências`}
            </button>
          )}
        </Card>
      )}

      {/* ---------------------------------------------------------------- pilares */}
      <Card className="mb-4">
        <CardTitulo titulo="Por pilar" sub="Métricas preenchidas em cada pilar" />
        <ul className="space-y-3.5">
          {resumoPorPilar(respostas).map(({ pilar, feitas: f, total }) => (
            <li key={pilar.numero}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-corpo font-bold text-noite">{pilar.curto}</span>
                <span className="text-legenda font-bold text-cinza">
                  {f}/{total}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-linha" aria-hidden>
                <div className="h-full rounded-full" style={{ width: `${(f / total) * 100}%`, backgroundColor: pilar.cor, transition: 'width 600ms cubic-bezier(0.2,0.9,0.25,1)' }} />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Link to={linkLista} className="alvo mb-2 flex items-center justify-center rounded-xl text-corpo font-bold text-marca hover:bg-marca-fundo">
        Abrir a lista completa de métricas
      </Link>
    </>
  )
}
