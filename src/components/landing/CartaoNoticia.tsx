import { useState } from 'react'
import { TEMAS, ehRecente, rotuloRecencia, type Noticia } from '@/data/noticias'
import { CenaTema } from './CenasTema'

/** Cartão de notícia: foto (ou ilustração), tema, recência, fonte e título; o cartão inteiro abre a notícia em nova aba. */
export function CartaoNoticia({ noticia: n, hoje = new Date() }: { noticia: Noticia; hoje?: Date }) {
  const [aberto, setAberto] = useState(false)
  const recencia = rotuloRecencia(n.data, hoje)
  const recente = ehRecente(n.data, hoje)
  const id = `cartao-${n.id}`
  return (
    <article className="cartao-noticia group relative overflow-hidden rounded-3xl border border-linha bg-white shadow-card">
      {n.imagem ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-marca-fundo">
          <img
            src={n.imagem.src}
            alt={n.imagem.alt}
            loading="lazy"
            decoding="async"
            className="cartao-noticia__foto h-full w-full object-cover"
          />
          <span className="absolute bottom-2 left-2 rounded-md bg-noite/75 px-2 py-0.5 text-[10.5px] font-semibold text-white">{n.imagem.credito}</span>
        </div>
      ) : (
        <div className="bg-marca-fundo px-4 pt-4">
          <CenaTema tema={n.tema} className="mx-auto block h-[170px] w-full max-w-[360px]" />
        </div>
      )}
      <div className="px-5 pb-5 pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] font-bold">
          <span className="rounded-full bg-marca-fundo px-2.5 py-1 text-marca-escura">{TEMAS[n.tema].rotulo}</span>
          <span className="flex items-center gap-1.5 text-cinza">
            {recente && <span aria-hidden="true" className="ponto-vivo" />}
            <time dateTime={n.data}>{recencia}</time>
          </span>
        </div>
        <h3 className="text-[19px] font-extrabold leading-snug text-noite">
          <a href={n.fonte.url} target="_blank" rel="noopener noreferrer" className="cartao-noticia__link">
            {n.titulo}
            <span className="sr-only"> (abre em nova aba)</span>
            <span aria-hidden="true" className="ml-1 inline-block text-marca transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
          </a>
        </h3>
        <p className="mt-1 text-[12.5px] text-cinza">Fonte: {n.fonte.nome}</p>

        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={id}
          onClick={() => setAberto((a) => !a)}
          className="clique-escolha relative z-10 mt-3 min-h-11 rounded-full border-[1.5px] border-linha bg-white px-4 text-[13px] font-bold text-marca-escura"
        >
          {aberto ? 'Fechar' : 'Ver conexão'}
        </button>

        <div id={id} className="clique-detalhe relative z-10" data-aberto={aberto ? 'true' : 'false'} inert={!aberto}>
          <div>
            <p className="mt-3 text-[13.5px] text-noite">{n.resumo}</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[1.2px] text-marca">Conexão com Cidades MIL</p>
            <p className="text-[13.5px] text-cinza">{n.conexao}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
