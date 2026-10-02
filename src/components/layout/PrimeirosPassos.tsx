import { useNavigate } from 'react-router-dom'
import { TOTAL_METRICAS } from '@/data/metricas'
import { useCidades } from '@/lib/cidadeAtiva'
import { useAuth } from '@/lib/auth'
import { Button, Card, Eyebrow, SeloBeta } from '@/components/ui'

/**
 * Painel de entrada.
 *
 * Seis sessões abriram o app em setembro e nenhuma cadastrou cidade. A
 * suspeita: quem cai no dashboard vê o Município Exemplo pronto e não percebe
 * que precisa criar a própria cidade para preencher algo. Este painel diz o
 * que é cada coisa e qual é o próximo passo.
 *
 * Aparece até a pessoa criar a primeira cidade dela.
 */
export function PrimeirosPassos() {
  const navigate = useNavigate()

  const PASSOS = [
    {
      n: '1',
      titulo: 'Cadastre a sua cidade',
      texto:
        'O diagnóstico é sempre de um município. A cidade de demonstração serve para você ver o resultado pronto — para avaliar de verdade, cadastre a sua.',
      acao: 'Nova cidade',
      destino: '/app/cidades',
    },
    {
      n: '2',
      titulo: 'Preencha os dados brutos',
      texto:
        `São ${TOTAL_METRICAS} métricas. Você nunca digita a nota: informa números (quantos profissionais, quantos bairros) ou escolhe o nível que descreve a realidade, e o sistema calcula.`,
      acao: 'Ver a avaliação',
      destino: '/app/avaliacao',
    },
    {
      n: '3',
      titulo: 'Leia o diagnóstico e o plano',
      texto:
        'Índice, radar por pilar e um plano que diz onde a cidade está, qual o próximo passo de cada métrica frágil e o que aquilo destrava.',
      acao: 'Ver o plano',
      destino: '/app/plano',
    },
  ]

  return (
    <Card className="mb-5 border-ciano/30 bg-[linear-gradient(135deg,#F4FAFC_0%,#E8FAFD_100%)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Eyebrow>Primeiros passos</Eyebrow>
            <SeloBeta />
          </div>
          <h2 className="mt-1.5 text-xl text-petroleo">
            Como usar a plataforma em três etapas
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] text-cinza">
            Você está vendo o <strong>Município Exemplo</strong>, uma cidade fictícia que
            existe só para demonstrar o resultado final. Os dados dela não são reais.
          </p>
        </div>
      </div>

      <ol className="grid gap-4 md:grid-cols-3">
        {PASSOS.map((p) => (
          <li
            key={p.n}
            className="flex flex-col rounded-card border border-linha bg-white p-4"
          >
            <div className="mb-2.5 grid h-8 w-8 place-items-center rounded-lg bg-ciano text-sm font-extrabold text-white">
              {p.n}
            </div>
            <h3 className="mb-1.5 text-[14.5px] text-petroleo">{p.titulo}</h3>
            <p className="mb-4 flex-1 text-[12.5px] text-cinza">{p.texto}</p>
            <Button
              variante={p.n === '1' ? 'primario' : 'ghost'}
              className="w-full px-3 py-2 text-[13px]"
              onClick={() => navigate(p.destino)}
            >
              {p.acao}
            </Button>
          </li>
        ))}
      </ol>
    </Card>
  )
}

/**
 * true quando a sessão atual ainda não criou cidade nenhuma — momento de
 * mostrar o painel de entrada.
 */
export function usePrecisaOnboarding(): boolean {
  const { session } = useAuth()
  const { cidades, carregando } = useCidades()

  if (carregando || !session) return false
  return !cidades.some((c) => c.criado_por === session.user.id)
}
