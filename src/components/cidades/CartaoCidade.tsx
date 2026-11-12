import { Link } from 'react-router-dom'
import { NIVEIS } from '@/lib/isps'
import { caminhoDaCidade, type ResumoCidade } from '@/lib/cidadeAtiva'
import { ehDemonstracao, nomeCurto, ufVisivel } from '@/lib/cidades'
import { NIVEL_COLORS, fmt } from '@/lib/theme'
import { cx } from '@/components/ui'
import type { Cidade } from '@/types/db'

/** Situação em palavras (nunca só cor). */
export function situacaoDe(r: ResumoCidade | undefined): string {
  if (!r || r.respondidas === 0) return 'Sem dados ainda'
  return r.concluida ? 'Avaliação concluída' : 'Em andamento'
}

/** Cartão de uma cidade na lista do Início: índice, nível e quanto dos dados já foi reunido. */
export function CartaoCidade({ cidade, resumo }: { cidade: Cidade; resumo?: ResumoCidade }) {
  const temIndice = !!resumo && resumo.isps !== null
  const progresso = resumo ? Math.round((resumo.respondidas / resumo.total) * 100) : 0
  const demo = ehDemonstracao(cidade)

  return (
    <Link
      to={caminhoDaCidade(cidade.id)}
      className="toque block rounded-[16px] border border-linha bg-white p-4 shadow-card transition-colors hover:border-marca-clara focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 break-words text-subtitulo font-extrabold text-noite">{nomeCurto(cidade)}</h3>
          <p className="mt-0.5 text-legenda text-cinza">
            {[ufVisivel(cidade), situacaoDe(resumo)].filter(Boolean).join(' · ')}
          </p>
          {demo && (
            <span className="mt-1.5 inline-block rounded-full bg-marca-fundo px-2 py-0.5 text-micro font-extrabold uppercase text-marca-escura">
              Demonstração
            </span>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[1.625rem] font-extrabold leading-none tracking-[-0.02em] text-noite">
            {temIndice ? fmt(resumo.isps as number, 2) : '—'}
          </div>
          {temIndice && (
            <div className="mt-1 flex items-center justify-end gap-1.5 text-legenda font-bold text-marca-escura">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: NIVEL_COLORS[resumo.nivelExibido] }}
                aria-hidden
              />
              Nível {resumo.nivelExibido + 1} · {NIVEIS[resumo.nivelExibido]}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-linha" aria-hidden>
        <div className={cx('h-full rounded-full bg-marca')} style={{ width: `${progresso}%`, transition: 'width 600ms cubic-bezier(0.2,0.9,0.25,1)' }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-legenda text-cinza">
        <span>Dados reunidos: {progresso}%</span>
        {resumo?.travado && <span className="font-bold text-aviso-txt">Regra de Ouro</span>}
      </div>
    </Link>
  )
}
