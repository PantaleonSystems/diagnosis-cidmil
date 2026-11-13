import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MODULOS, PILARES } from '@/data/metricas'
import { SimuladorIndice } from '@/components/landing/SimuladorIndice'
import { Button, Eyebrow, cx } from '@/components/ui'
import { Capitulo } from '@/components/landing/Capitulo'
import { TerritorioFontes } from '@/components/landing/TerritorioFontes'
import { NavLanding } from '@/components/landing/NavLanding'
import { BotaoVerCidade } from '@/components/landing/BotaoVerCidade'
import { MapaAproximacao, type FaseMapa } from '@/components/landing/MapaAproximacao'

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
  const [fase, setFase] = useState<FaseMapa>('brasil')
  const ativos = MODULOS.filter((m) => m.ativo).length

  return (
    <div className="min-h-screen bg-white">
      <NavLanding />

      <main>
      {/* ------------------------------------------------------------ hero */}
      <Capitulo id="cidade" as="header" revelar={false} className="bg-[radial-gradient(1200px_500px_at_80%_-10%,#E4F8FC_0%,transparent_60%),linear-gradient(180deg,#fff_0%,#F4FAFC_100%)] px-[6vw] pb-16 pt-[56px] md:pt-[80px]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>Plataforma de Diagnóstico · Cidades MIL</Eyebrow>
            <h1 className="my-5 text-[clamp(32px,5.4vw,52px)] leading-[1.08] tracking-[-0.5px] text-noite">
              A sua cidade, entendida <span className="text-marca">de ponta a ponta</span>
            </h1>
            <p className="mb-8 max-w-[520px] text-lg text-cinza">
              Reunimos os dados que já existem na prefeitura, conferimos e mostramos,
              em linguagem simples, onde agir primeiro.{' '}
              <strong className="font-bold text-marca-escura">Começando pela Saúde.</strong>
            </p>
            <BotaoVerCidade />
          </div>

          <div className="relative mx-auto w-full max-w-[420px]">
            <MapaAproximacao className="rounded-[28px]" onFase={setFase} />
            <span
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-marca-escura shadow-card transition-[top,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ top: fase === 'brasil' ? '66%' : '50%', opacity: fase === 'estado' ? 0 : 1 }}
            >
              Sua cidade
            </span>
          </div>
        </div>
      </Capitulo>

      {/* ------------------------------------------------------------ dados */}
      <Capitulo id="dados" className="mx-auto max-w-[1200px] px-[6vw] py-[70px]">
        <Eyebrow className="block text-center">Os dados</Eyebrow>
        <h2 className="mx-auto mb-3 mt-2.5 max-w-3xl text-center text-[clamp(26px,4vw,36px)] tracking-[-0.3px] text-noite">
          Os dados chegam de onde já estão
        </h2>
        <p className="mx-auto mb-10 max-w-[560px] text-center text-cinza">
          Nada de planilha nova: a ferramenta reúne o que a prefeitura já registra, em vários lugares, e junta tudo num só.
        </p>
        <TerritorioFontes />
      </Capitulo>

      {/* ------------------------------------------------------------ fluxo */}
      <Capitulo id="calculo" as="div"><SimuladorIndice /></Capitulo>

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
      <Capitulo id="frentes" className="mx-auto max-w-[1200px] px-[6vw] pb-[70px]">
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
      </Capitulo>

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
