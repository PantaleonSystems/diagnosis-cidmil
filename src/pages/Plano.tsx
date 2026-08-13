import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { SemCidade } from '@/components/layout/SemCidade'
import { useCidades } from '@/lib/cidadeAtiva'
import { useRespostas } from '@/lib/respostas'
import { NIVEIS, consolidar } from '@/lib/isps'
import { montarPlano } from '@/lib/plano'
import { PRIO_COLORS } from '@/lib/theme'
import { Button, Card, CardTitulo, Pill, Splash, Vazio } from '@/components/ui'

export function Plano() {
  const navigate = useNavigate()
  const { cidadeAtiva, avaliacaoAtiva } = useCidades()
  const { respostas, notas, carregando } = useRespostas(avaliacaoAtiva?.id ?? null)

  if (!cidadeAtiva) return <SemCidade />
  if (carregando) return <Splash texto="Montando o plano de ação…" />

  if (Object.keys(respostas).length === 0) {
    return (
      <>
        <Topbar titulo="Plano de ação" sub={cidadeAtiva.nome} />
        <Vazio
          titulo="Sem plano ainda"
          descricao="O plano de ação é derivado das notas reais da avaliação. Preencha as métricas para que as recomendações apareçam aqui."
          acao={<Button onClick={() => navigate('/app/avaliacao')}>Ir para a avaliação</Button>}
        />
      </>
    )
  }

  const resultado = consolidar(notas)
  const plano = montarPlano(resultado, notas, cidadeAtiva.nome)

  return (
    <>
      <Topbar
        titulo="Módulo Saúde · Plano de ação"
        sub={`${cidadeAtiva.nome} · recomendações priorizadas a partir do diagnóstico`}
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#BEE5D5] bg-[#EAF7F2] px-5 py-4.5">
          <h4 className="mb-2.5 text-[13px] text-[#2C8465]">Pontos fortes</h4>
          <ul className="text-[13px] text-tinta">
            {plano.fortes.map((f) => (
              <li key={f} className="relative py-1 pl-5">
                <span className="absolute left-0 top-1.5 text-[10px] text-nota-baixa">
                  ▲
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[#F3CFC0] bg-[#FCEEE9] px-5 py-4.5">
          <h4 className="mb-2.5 text-[13px] text-[#B3532F]">Pontos de atenção</h4>
          <ul className="text-[13px] text-tinta">
            {plano.atencao.map((a) => (
              <li key={a} className="relative py-1 pl-5">
                <span className="absolute left-0 top-1.5 text-[10px] text-nota-alta">
                  ▼
                </span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Card className="mb-4.5">
        <CardTitulo
          titulo="Diagnóstico rápido"
          sub={`${cidadeAtiva.nome} — Nível ${resultado.nivelExibido + 1} (${NIVEIS[resultado.nivelExibido]})`}
        />
        <p className="text-sm text-tinta">{plano.resumo}</p>
      </Card>

      <h3 className="mb-3.5 mt-2 text-[15px] text-petroleo">Ações priorizadas</h3>

      {plano.acoes.map((acao, i) => (
        <div
          key={i}
          className="mb-3 flex flex-wrap gap-4 rounded-xl border border-linha bg-white p-4.5"
        >
          <div className="w-[90px] shrink-0">
            <Pill
              style={{
                backgroundColor: `${PRIO_COLORS[acao.prioridade]}22`,
                color: PRIO_COLORS[acao.prioridade],
              }}
            >
              {acao.prioridade}
            </Pill>
          </div>
          <div className="min-w-[240px] flex-1">
            <h4 className="mb-1 text-[14.5px] text-petroleo">{acao.titulo}</h4>
            <p className="text-[13px] text-cinza">{acao.descricao}</p>
          </div>
          <div className="shrink-0 text-right text-[11.5px] text-cinza-cl">
            {acao.prazo}
            <br />
            <span className="text-cinza">{acao.responsavel}</span>
          </div>
        </div>
      ))}
    </>
  )
}
