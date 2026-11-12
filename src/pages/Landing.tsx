import { Link } from 'react-router-dom'
import { MODULOS, PILARES } from '@/data/metricas'
import { RadarChart } from '@/components/charts/RadarChart'
import { Marca } from '@/components/layout/Marca'
import { SimuladorIndice } from '@/components/landing/SimuladorIndice'
import { useAnimado } from '@/lib/movimento'
import { Button, Eyebrow, SeloBeta, cx } from '@/components/ui'
import { fmt } from '@/lib/theme'

/** Valores ilustrativos do card do hero — exemplo, não dado de cidade real. */
const EXEMPLO = [1.9, 2.8, 3.2, 3.5, 2.5]

const COMO = [
  {
    n: '01',
    titulo: 'Dados objetivos, não opiniões',
    texto:
      'O avaliador informa números concretos — quantos hospitais, quantos profissionais capacitados. O sistema calcula a nota; ninguém "chuta" um valor.',
  },
  {
    n: '02',
    titulo: 'Cinco pilares integrados',
    texto:
      'Governança, engajamento, comunicação, infraestrutura e planejamento — ponderados para refletir o que mais importa numa cidade participativa.',
  },
  {
    n: '03',
    titulo: 'Um caminho de ação',
    texto:
      'Cada diagnóstico aponta prioridades e recomendações, transformando a avaliação em um plano concreto para o gestor municipal.',
  },
]

export function Landing() {
  const ativos = MODULOS.filter((m) => m.ativo).length
  const valores = useAnimado(EXEMPLO, 1400)
  const isps = valores.reduce((s, v, i) => s + v * PILARES[i].peso, 0)

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-linha bg-white/95 px-[5vw] py-3 backdrop-blur md:px-[6vw]">
        <div className="flex min-w-0 items-center gap-2">
          <Marca />
          <SeloBeta className="max-[460px]:hidden" />
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm font-semibold text-cinza md:gap-6">
          <a href="#fluxo" className="hidden hover:text-marca-escura md:inline">
            Como funciona
          </a>
          <a href="#conceito" className="hidden hover:text-marca-escura md:inline">
            O conceito
          </a>
          <a href="#pilares" className="hidden hover:text-marca-escura md:inline">
            Pilares
          </a>
          <Link to="/app">
            <Button variante="ghost" className="alvo whitespace-nowrap !px-4 !py-2 text-[13px] sm:!px-[22px] sm:!py-[11px] sm:text-sm">
              Acessar
              <span className="hidden sm:inline">o sistema</span>
            </Button>
          </Link>
        </div>
      </nav>

      <main>
      {/* ------------------------------------------------------------ hero */}
      <header className="bg-[radial-gradient(1200px_500px_at_80%_-10%,#E4F8FC_0%,transparent_60%),linear-gradient(180deg,#fff_0%,#F4FAFC_100%)] px-[6vw] pb-20 pt-[90px]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-[60px] lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Eyebrow>Plataforma de Diagnóstico · Cidades MIL</Eyebrow>
            <h1 className="my-5 text-[clamp(32px,5vw,46px)] tracking-[-0.5px] text-noite">
              Medir o impacto social de uma cidade com{' '}
              <span className="text-marca">rigor e transparência</span>
            </h1>
            <p className="mb-7 max-w-[520px] text-lg text-cinza">
              A plataforma do CIIDCMIL que transforma o framework das Cidades MIL em
              diagnósticos objetivos: dados entram, notas são calculadas, e a cidade
              enxerga exatamente onde evoluir.{' '}
              <strong className="font-bold text-marca-escura">
                Começando pelo módulo Saúde.
              </strong>
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <Link to="/app">
                <Button>Abrir o diagnóstico →</Button>
              </Link>
              <a href="#fluxo">
                <Button variante="ghost">Ver como funciona</Button>
              </a>
            </div>
          </div>

          <div className="rounded-[18px] border border-linha bg-white p-[26px] shadow-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-cinza">
                  Índice · Módulo Saúde
                </div>
                <div className="mt-0.5 text-[13px] text-cinza">Exemplo ilustrativo</div>
              </div>
              <span className="rounded-lg bg-marca-fundo px-3 py-1.5 text-[13px] font-bold text-marca-escura">
                Nível 2 · Concessiva
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[52px] font-extrabold leading-none text-noite">
                {fmt(isps, 2)}
              </span>
              <span className="font-bold text-cinza-cl">/ 4,0</span>
            </div>
            <div className="mt-1.5 flex justify-center">
              <RadarChart
                valores={valores}
                rotulos={PILARES.map((p) => p.curto.slice(0, 6) + '.')}
                tamanho={300}
                padding={58}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------ fluxo */}
      <SimuladorIndice />

      {/* --------------------------------------------------------- conceito */}
      <section id="conceito" className="mx-auto max-w-[1200px] px-[6vw] py-[70px]">
        <Eyebrow className="block text-center">O que é uma Cidade MIL</Eyebrow>
        <h2 className="mx-auto mb-3 mt-2.5 max-w-3xl text-center text-[32px] tracking-[-0.3px] text-noite">
          Um espaço urbano que usa a informação com ética e senso crítico
        </h2>
        <p className="mx-auto mb-11 max-w-[640px] text-center text-cinza">
          O conceito de Cidades MIL, desenvolvido no âmbito da UNESCO, avalia como um
          município integra mídia, informação e tecnologia com respeito às diversidades,
          participação cidadã e combate à desinformação.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {COMO.map((c) => (
            <div key={c.n} className="rounded-card border border-linha bg-white p-[26px]">
              <div className="mb-3.5 grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-marca-fundo text-[17px] font-extrabold text-marca-escura">
                {c.n}
              </div>
              <h3 className="mb-1.5 text-base text-noite">{c.titulo}</h3>
              <p className="text-[13.5px] text-cinza">{c.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- pilares */}
      <section id="pilares" className="mx-auto max-w-[1200px] px-[6vw] pb-[70px]">
        <Eyebrow className="block text-center">
          Módulo Saúde · a estrutura da avaliação
        </Eyebrow>
        <h2 className="mb-3 mt-2.5 text-center text-[32px] tracking-[-0.3px] text-noite">
          Os cinco pilares do diagnóstico de saúde
        </h2>
        <p className="mx-auto mb-11 max-w-[640px] text-center text-cinza">
          As métricas de saúde (63 a 105) se organizam em cinco pilares, cada um com um
          peso na nota final da cidade.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILARES.map((p) => (
            <div
              key={p.numero}
              className="rounded-card border border-linha border-t-4 bg-white px-[18px] py-[22px] transition-transform duration-150 hover:-translate-y-[3px] hover:shadow-card"
              style={{ borderTopColor: p.cor }}
            >
              <div className="text-xs font-extrabold tracking-[1px] text-marca">
                PILAR {p.numero} · PESO {Math.round(p.peso * 100)}%
              </div>
              <h3 className="my-2 text-[15px] text-noite">{p.nome}</h3>
              <p className="text-[12.5px] text-cinza">{p.descricao}</p>
              <p className="mt-2 text-[11.5px] font-semibold text-cinza-cl">
                {p.metricas.length} métricas
              </p>
            </div>
          ))}
        </div>

        {/* -------------------------------------------------------- módulos */}
        <div className="mt-11 text-center">
          <Eyebrow>Uma plataforma, treze áreas</Eyebrow>
          <h2 className="mb-3 mt-2 text-2xl text-noite">
            Saúde é o primeiro de treze módulos do framework
          </h2>
          <p className="mx-auto mb-6 max-w-[640px] text-cinza">
            O framework das Cidades MIL abrange treze áreas da vida urbana. A plataforma
            nasce pelo módulo Saúde e crescerá para as demais.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {MODULOS.map((m) => (
            <div
              key={m.id}
              className={cx(
                'flex items-center gap-2 rounded-[10px] border-[1.5px] px-[15px] py-[9px] text-[13px] font-semibold',
                m.ativo
                  ? 'border-marca bg-marca text-white'
                  : 'border-linha bg-white text-cinza-cl opacity-75',
              )}
            >
              <span aria-hidden>{m.icone}</span>
              {m.nome}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-cinza-cl">
          ↳ {ativos} de {MODULOS.length} indicadores ativos nesta fase.
        </p>
      </section>

      {/* --------------------------------------------------- acesso restrito */}
      <section className="mx-auto max-w-[1200px] px-[6vw] pb-[70px]">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[18px] bg-[linear-gradient(120deg,#052F4D,#0A5A96)] px-12 py-11 text-white">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-sobre-marca">
              Versão beta · acesso aberto
            </span>
            <h3 className="mb-2 mt-1 text-2xl">
              A plataforma está aberta para testes
            </h3>
            <p className="max-w-[520px] text-[14.5px] text-sobre-marca-2">
              Nesta fase não há cadastro nem senha: entre, cadastre uma cidade e percorra
              o diagnóstico. Os dados são de teste e podem ser reiniciados a qualquer
              momento enquanto o instrumento está sendo validado.
            </p>
          </div>
          <Link to="/app">
            <Button variante="claro">Abrir o diagnóstico →</Button>
          </Link>
        </div>
      </section>

      </main>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-linha px-[6vw] py-[34px] text-[12.5px] text-cinza-cl">
        <span>
          Centro Internacional de Inovação e Desenvolvimento de Cidades MIL — CIIDCMIL
        </span>
        <span>
          Tecnologia por <strong className="text-cinza">Pantaleon Systems</strong>
        </span>
      </footer>
    </div>
  )
}
