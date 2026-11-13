import { MODULOS } from '@/data/metricas'
import { SimuladorIndice } from '@/components/landing/SimuladorIndice'
import { Eyebrow } from '@/components/ui'
import { Capitulo } from '@/components/landing/Capitulo'
import { Areas } from '@/components/landing/Areas'
import { Demonstracao } from '@/components/landing/Demonstracao'
import { Decisao } from '@/components/landing/Decisao'
import { Frentes } from '@/components/landing/Frentes'
import { FontesCompartilham } from '@/components/landing/FontesCompartilham'
import { RecebeCena } from '@/components/landing/RecebeCena'
import { NavLanding } from '@/components/landing/NavLanding'
import { CONTATO_DESENVOLVIMENTO } from '@/data/contato'
import { HeroNoticias } from '@/components/landing/HeroNoticias'

export function Landing() {

  return (
    <div className="min-h-screen bg-white">
      <NavLanding />

      <main>
      {/* ------------------------------------------------------------ hero */}
      <HeroNoticias />

      {/* ------------------------------------------------------- demonstração */}
      <Capitulo id="demonstracao" className="mx-auto max-w-[1200px] px-[6vw] py-[70px]">
        <Demonstracao />
      </Capitulo>

      {/* ------------------------------------------------------------ dados */}
      <Capitulo id="dados" className="mx-auto max-w-[1200px] px-[6vw] py-[70px]">
        <Eyebrow className="block text-center">Os lugares da informação</Eyebrow>
        <h2 className="mx-auto mb-10 mt-2.5 max-w-3xl text-center text-[clamp(26px,4vw,36px)] tracking-[-0.3px] text-noite">
          A informação chega de onde já está
        </h2>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[1.5px] text-marca-escura">1 · Reunimos e conferimos</p>
            <FontesCompartilham />
          </div>
          <div className="min-w-0">
            <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[1.5px] text-marca-escura">2 · A cidade recebe</p>
            <RecebeCena />
          </div>
        </div>
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
          {' · '}
          <a href={CONTATO_DESENVOLVIMENTO} className="font-semibold text-marca underline underline-offset-2">
            Fale com quem desenvolve
          </a>
        </span>
      </footer>
    </div>
  )
}
