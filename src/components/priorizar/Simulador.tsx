import { NIVEIS } from '@/lib/isps'
import { cx } from '@/components/ui'
import type { RespostasPlano } from '@/lib/plano'
import { simular, type AcaoPossivel } from '@/lib/priorizar'

const n = (v: number, casas = 2) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

/** Faixas da régua: nível 1 até 1,5; nível 2 até 2,5; nível 3 até 3,4; nível 4 acima (escala 0–4). */
const FAIXAS = [37.5, 25, 22.5, 15]
const CORES_FAIXA = ['bg-[#dbeaf5]', 'bg-[#c4dff0]', 'bg-[#a6cfe8]', 'bg-[#86bcdc]']

/** Segundo passo: o "e se". Liga e desliga ações e vê onde a cidade chega. */
export function Simulador({
  respostas,
  acoes,
  marcadas,
  alternar,
}: {
  respostas: RespostasPlano
  acoes: AcaoPossivel[]
  marcadas: number[]
  alternar: (id: number) => void
}) {
  const s = simular(respostas, marcadas)
  const { antes, depois } = s
  const mudou = marcadas.length > 0

  let aviso: { classe: string; texto: string } | null = null
  if (s.liberouRegraDeOuro) {
    aviso = {
      classe: 'border-ok-borda bg-ok-bg text-ok-txt',
      texto: `A nota de Governança chega a ${n(depois.mediaGovernanca)}, o que atinge o mínimo de 2,0. A cidade já pode passar do Nível 2 (Regra de Ouro liberada).`,
    }
  } else if (depois.travado) {
    aviso = {
      classe: 'border-aviso-borda bg-aviso-bg text-aviso-txt',
      texto: `A nota de Governança fica em ${n(depois.mediaGovernanca)} e precisa chegar a 2,0. Por isso a cidade continua no Nível 2 (Concessiva)${
        depois.nivelReal > 1 ? `, mesmo com nota geral para ser ${NIVEIS[depois.nivelReal]}` : ''
      }.`,
    }
  }

  return (
    <div>
      <p className="mb-3 text-corpo text-cinza">Marque as ações e veja onde a cidade chega.</p>

      <section
        aria-live="polite"
        className="rounded-card border border-linha bg-white p-4 shadow-card"
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-legenda text-cinza">Hoje</div>
            <div className="text-[26px] font-bold leading-none tracking-tight text-cinza-cl">{n(antes.isps)}</div>
          </div>
          <span aria-hidden className="pb-1 text-cinza-cl">→</span>
          <div className="text-right">
            <div className="text-legenda text-cinza">Com as ações marcadas</div>
            <div className="text-[40px] font-bold leading-none tracking-tight text-noite">{n(depois.isps)}</div>
          </div>
        </div>

        <div className="relative mt-5">
          <div className="flex h-3.5 overflow-hidden rounded-lg" aria-hidden>
            {FAIXAS.map((w, i) => (
              <div key={i} className={CORES_FAIXA[i]} style={{ width: `${w}%` }} />
            ))}
          </div>
          <div
            aria-hidden
            className="absolute -top-1.5 h-6 w-[3px] -translate-x-1/2 rounded-sm bg-cinza-cl/70"
            style={{ left: `${(antes.isps / 4) * 100}%` }}
          />
          <div
            aria-hidden
            className="absolute -top-2 h-7 w-[5px] -translate-x-1/2 rounded-sm bg-noite transition-[left] duration-700 ease-[cubic-bezier(.2,.9,.25,1.05)] motion-reduce:transition-none"
            style={{ left: `${(depois.isps / 4) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex text-[10.5px] text-cinza" aria-hidden>
          {FAIXAS.map((w, i) => (
            <div key={i} style={{ width: `${w}%` }}>
              {NIVEIS[i]}
            </div>
          ))}
        </div>

        <div className="mt-3 text-legenda text-cinza">
          Nível:{' '}
          <b className="text-noite">
            {depois.nivelExibido + 1} ({NIVEIS[depois.nivelExibido]})
          </b>
          {mudou && s.ganho > 0 && (
            <span className="ml-2 font-bold text-marca-escura">+{n(s.ganho)} na nota geral</span>
          )}
        </div>

        {aviso && (
          <div className={cx('mt-3 rounded-xl border px-3 py-2.5 text-[12.5px] leading-snug', aviso.classe)}>
            {aviso.texto}
          </div>
        )}
      </section>

      <div className="mb-2 mt-5 flex items-baseline justify-between">
        <h3 className="text-legenda font-bold uppercase tracking-wider text-cinza">Ações possíveis</h3>
        <span className="text-legenda text-cinza-cl">{marcadas.length} de {acoes.length} marcadas</span>
      </div>

      {acoes.length === 0 ? (
        <p className="rounded-card border border-linha bg-white p-4 text-corpo text-cinza">
          Todas as métricas respondidas já estão na nota máxima. Nada a simular.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {acoes.map((a) => {
            const ligada = marcadas.includes(a.id)
            return (
              <li
                key={a.id}
                className={cx(
                  'flex items-center gap-3 rounded-2xl border bg-white px-3.5 py-3 transition-all duration-300 motion-reduce:transition-none',
                  ligada ? 'border-marca-clara shadow-card' : 'border-linha',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-corpo font-semibold leading-snug text-noite">{a.metrica.titulo}</div>
                  <div className="mt-0.5 text-legenda text-cinza-cl">
                    {a.pilar.curto} · nota {a.nota} para {a.notaNova} ·{' '}
                    <b className="text-marca-escura">+{n(a.ganho)}</b> na nota geral
                  </div>
                  <div className="mt-1 text-legenda text-cinza">{a.passo}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ligada}
                  aria-label={`Incluir: ${a.metrica.titulo}`}
                  onClick={() => alternar(a.id)}
                  className={cx(
                    'relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-300 motion-reduce:transition-none',
                    'before:absolute before:-inset-2 before:content-[""]',
                    ligada ? 'bg-marca' : 'bg-[#c7d6e2]',
                  )}
                >
                  <span
                    className={cx(
                      'absolute top-[3px] size-[26px] rounded-full bg-white shadow transition-[left] duration-300 motion-reduce:transition-none',
                      ligada ? 'left-[23px]' : 'left-[3px]',
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-4 rounded-xl border border-aviso-borda bg-aviso-bg px-3 py-2.5 text-[12px] leading-snug text-aviso-txt">
        <b>É uma estimativa, não uma promessa.</b> O cálculo supõe que cada ação suba a métrica uma nota. Dados digitados à mão são menos seguros que os coletados.
      </p>
    </div>
  )
}
