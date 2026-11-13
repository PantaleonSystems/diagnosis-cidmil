import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NOTICIAS, TEMAS, ehRecente, noticiasVisiveis, type TemaNoticia } from '@/data/noticias'
import { CONTATO_URL } from '@/data/contato'
import { BotaoVerCidade } from './BotaoVerCidade'
import { CartaoNoticia } from './CartaoNoticia'
import { Carrossel } from './Carrossel'
import { Capitulo } from './Capitulo'

const ROTULO_CURTO: Record<TemaNoticia, string> = { ia: 'IA', cidade: 'Cidade', cidadao: 'Cidadão', mil: 'MIL' }
const ICONES: Record<TemaNoticia, React.ReactNode> = {
  ia: (<><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" /></>),
  cidade: (<><path d="M4 20V9l6-3v14M10 20V4l9 4v12M3 20h18" /><path d="M13 10h3M13 14h3" /></>),
  cidadao: (<><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="17" cy="9" r="2.3" /><path d="M16.5 14.2c2.6 0 4.5 1.6 4.5 4.3" /></>),
  mil: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z" /></>),
}

const dataBr = (d: string) => d.split('-').reverse().join('/')

/** Primeira tela: o futuro das cidades já começou, com notícias verificadas que provam que é agora. */
export function HeroNoticias({ hoje = new Date() }: { hoje?: Date }) {
  const noticias = useMemo(() => noticiasVisiveis(NOTICIAS, hoje), [hoje])
  const [indice, setIndice] = useState(0)
  const temaAtual = noticias[indice]?.tema
  const temas = (Object.keys(TEMAS) as TemaNoticia[]).filter((t) => noticias.some((n) => n.tema === t))

  return (
    <Capitulo
      id="cidade"
      as="header"
      revelar={false}
      className="bg-[radial-gradient(1200px_500px_at_80%_-10%,#E4F8FC_0%,transparent_60%),linear-gradient(180deg,#fff_0%,#F4FAFC_100%)] px-[6vw] pb-16 pt-8 md:pt-[72px]"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-marca-escura">Plataforma de Diagnóstico · Cidades MIL</p>
          <h1 className="my-5 text-[clamp(34px,5.6vw,58px)] leading-[1.05] tracking-[-0.5px] text-noite">
            O futuro das cidades <span className="text-marca">já começou.</span>
          </h1>
          <p className="mb-6 max-w-[500px] text-lg text-cinza">
            Governos, universidades e cidades já transformam informação em decisão. A Cidades MIL torna isso visível e medível.
          </p>
          {noticias.length > 0 && (
            <p className="selo-atualizado mb-6 flex items-center gap-2 text-[13px] font-bold text-marca-escura">
              {ehRecente(noticias[0].data, hoje) && <span aria-hidden="true" className="ponto-vivo" />}
              Atualizado em {dataBr(noticias[0].data)}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <BotaoVerCidade />
            <Link to="/app" className="inline-flex min-h-[64px] flex-col justify-center rounded-[18px] border-2 border-marca bg-marca px-6 text-white transition-colors hover:bg-marca-escura">
              <span className="text-[16px] font-extrabold leading-tight">Testar a beta</span>
              <span className="text-[11.5px] font-semibold text-sobre-marca-2">Sistema aberto, sem cadastro</span>
            </Link>
            {CONTATO_URL && (
              <a href={CONTATO_URL} className="inline-flex min-h-[64px] items-center rounded-[18px] border-2 border-linha bg-white px-6 text-[16px] font-bold text-marca-escura">
                Falar com a equipe
              </a>
            )}
          </div>
        </div>

        {noticias.length > 0 && (
          <div className="mx-auto w-full min-w-0 max-w-[460px]">
            <div className="mb-3 flex flex-wrap justify-center gap-2">
              {temas.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={temaAtual === t}
                  onClick={() => setIndice(noticias.findIndex((n) => n.tema === t))}
                  className="clique-escolha flex min-h-11 items-center gap-1.5 rounded-full border border-linha bg-white px-3.5 text-[12.5px] font-bold text-marca-escura aria-pressed:border-marca aria-pressed:bg-marca aria-pressed:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true" focusable="false">{ICONES[t]}</svg>
                  {ROTULO_CURTO[t]}
                </button>
              ))}
            </div>
            <Carrossel
              rotulo="Notícias sobre a transformação das cidades"
              autoavancoMs={7000}
              indice={indice}
              onMudar={setIndice}
              itens={noticias.map((n) => <CartaoNoticia key={n.id} noticia={n} hoje={hoje} />)}
            />
          </div>
        )}
      </div>
    </Capitulo>
  )
}
