import { useState } from 'react'
import { TEMAS, rotuloRecencia, type Noticia } from '@/data/noticias'
import { CenaTema } from './CenasTema'

/** Cartão de notícia: ilustração, tema, recência, fonte e título; a conexão e o link abrem ao clicar. */
export function CartaoNoticia({ noticia: n, hoje = new Date() }: { noticia: Noticia; hoje?: Date }) {
  const [aberto, setAberto] = useState(false)
  const recencia = rotuloRecencia(n.data, hoje)
  const recente = recencia === 'Hoje' || recencia === 'Ontem' || recencia.startsWith('Há')
  const id = `cartao-${n.id}`
  return (
    <article className="overflow-hidden rounded-3xl border border-linha bg-white shadow-card">
      <div className="bg-marca-fundo px-4 pt-4">
        <CenaTema tema={n.tema} className="mx-auto block h-[150px] w-full max-w-[340px]" />
      </div>
      <div className="px-5 pb-5 pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] font-bold">
          <span className="rounded-full bg-marca-fundo px-2.5 py-1 text-marca-escura">{TEMAS[n.tema].rotulo}</span>
          <span className="flex items-center gap-1.5 text-cinza">
            {recente && <span aria-hidden="true" className="ponto-vivo" />}
            <time dateTime={n.data}>{recencia}</time>
          </span>
        </div>
        <h3 className="text-[19px] font-extrabold leading-snug text-noite">{n.titulo}</h3>
        <p className="mt-1 text-[12.5px] text-cinza">Fonte: {n.fonte.nome}</p>

        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={id}
          onClick={() => setAberto((a) => !a)}
          className="clique-escolha mt-3 min-h-11 rounded-full border-[1.5px] border-linha bg-white px-4 text-[13px] font-bold text-marca-escura"
        >
          {aberto ? 'Fechar' : 'Ver conexão'}
        </button>

        <div id={id} className="clique-detalhe" data-aberto={aberto ? 'true' : 'false'} inert={!aberto}>
          <div>
            <p className="mt-3 text-[13.5px] text-noite">{n.resumo}</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[1.2px] text-marca">Conexão com Cidades MIL</p>
            <p className="text-[13.5px] text-cinza">{n.conexao}</p>
            <a href={n.fonte.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[13px] font-bold text-marca underline underline-offset-2">
              Ler na fonte ↗
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
