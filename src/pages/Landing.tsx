import { useState } from 'react'
import { MODULOS } from '@/data/metricas'
import { SimuladorIndice } from '@/components/landing/SimuladorIndice'
import { Eyebrow } from '@/components/ui'
import { Capitulo } from '@/components/landing/Capitulo'
import { Areas } from '@/components/landing/Areas'
import { Decisao } from '@/components/landing/Decisao'
import { Frentes } from '@/components/landing/Frentes'
import { TerritorioFontes } from '@/components/landing/TerritorioFontes'
import { NavLanding } from '@/components/landing/NavLanding'
import { BotaoVerCidade } from '@/components/landing/BotaoVerCidade'
import { MapaAproximacao, type FaseMapa } from '@/components/landing/MapaAproximacao'

export function Landing() {
  const [fase, setFase] = useState<FaseMapa>('brasil')

  return (
    <div className="min-h-screen bg-white">
      <NavLanding />

      <main>
      {/* ------------------------------------------------------------ hero */}
      <Capitulo id="cidade" as="header" revelar={false} className="bg-[radial-gradient(1200px_500px_at_80%_-10%,#E4F8FC_0%,transparent_60%),linear-gradient(180deg,#fff_0%,#F4FAFC_100%)] px-[6vw] pb-16 pt-6 md:pt-[80px]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>Plataforma de Diagnóstico · Cidades MIL</Eyebrow>
            <h1 className="my-5 text-[clamp(32px,5.4vw,52px)] leading-[1.08] tracking-[-0.5px] text-noite">
              A sua cidade, entendida <span className="text-marca">de ponta a ponta</span>
            </h1>
            <p className="mb-5 max-w-[540px] text-lg text-cinza">
              Reunimos dados da rede, de plataformas e de portais de transparência e os
              processamos para ajudar a sua cidade.{' '}
              <strong className="font-bold text-marca-escura">Começando pela Saúde.</strong>
            </p>
            <ul className="mb-8 flex flex-wrap gap-2" aria-label="O que fazemos com as informações">
              {['Analisar', 'Diagnosticar', 'Medir', 'Propor', 'Ajudar'].map((v) => (
                <li key={v} className="rounded-full border border-linha bg-white/80 px-3.5 py-1.5 text-[13px] font-bold text-marca-escura">
                  {v}
                </li>
              ))}
            </ul>
            <BotaoVerCidade />
          </div>

          <div className="relative order-first mx-auto w-full max-w-[250px] sm:max-w-[420px] lg:order-none">
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
        <Eyebrow className="block text-center">Os lugares da informação</Eyebrow>
        <h2 className="mx-auto mb-3 mt-2.5 max-w-3xl text-center text-[clamp(26px,4vw,36px)] tracking-[-0.3px] text-noite">
          A informação chega de onde já está
        </h2>
        <p className="mx-auto mb-10 max-w-[560px] text-center text-cinza">
          Nada de planilha nova: reunimos o que já existe nos portais, nos cadastros e nos projetos da própria cidade, e juntamos tudo num só lugar.
        </p>
        <TerritorioFontes />
      </Capitulo>

      {/* ------------------------------------------------------------ fluxo */}
      <Capitulo id="calculo" as="div"><SimuladorIndice /></Capitulo>

      {/* ----------------------------------------------------------- frentes */}
      <Capitulo id="frentes" className="mx-auto max-w-[1200px] px-[6vw] py-[70px]">
        <Eyebrow className="block text-center">As frentes · módulo Saúde</Eyebrow>
        <h2 className="mx-auto mb-3 mt-2.5 max-w-3xl text-center text-[clamp(26px,4vw,36px)] tracking-[-0.3px] text-noite">
          Cinco frentes para entender a cidade
        </h2>
        <p className="mx-auto mb-10 max-w-[560px] text-center text-cinza">
          Cada frente reúne um conjunto de perguntas e tem um peso na nota. Toque numa delas para ver o que ela olha.
        </p>
        <Frentes />

        <h3 className="mx-auto mb-2 mt-16 max-w-[560px] text-center text-xl text-noite">
          E essa é só a primeira das {MODULOS.length} áreas
        </h3>
        <p className="mx-auto mb-4 max-w-[480px] text-center text-sm text-cinza">
          Passe o mouse ou toque num cartão para ver a área.
        </p>
        <Areas />
      </Capitulo>

      {/* ----------------------------------------------------------- decisão */}
      <Capitulo id="decisao" className="mx-auto max-w-[1200px] px-[6vw] pb-[90px] pt-[30px]">
        <Eyebrow className="block text-center">A decisão</Eyebrow>
        <h2 className="mx-auto mb-3 mt-2.5 max-w-3xl text-center text-[clamp(26px,4vw,36px)] tracking-[-0.3px] text-noite">
          E então: o que fazer primeiro?
        </h2>
        <p className="mx-auto mb-10 max-w-[560px] text-center text-cinza">
          No fim do diagnóstico a cidade recebe uma ordem de prioridades. Mude o critério e veja a lista se reorganizar.
        </p>
        <Decisao />
        <p className="mx-auto mt-10 max-w-[520px] text-center text-xs text-cinza-cl">
          Versão beta, de acesso aberto: não há cadastro nem senha, e os dados são de teste e podem ser reiniciados.
        </p>
      </Capitulo>

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
