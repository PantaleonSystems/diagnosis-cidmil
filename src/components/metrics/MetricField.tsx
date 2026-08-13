import type { Metrica } from '@/data/metricas'
import type { DadosBrutos, Nota } from '@/lib/calculos'
import { calcularNota, maturidade, memoriaDeCalculo } from '@/lib/calculos'
import { NOTE_COLORS } from '@/lib/theme'
import { Card, Input, Pill, cx } from '@/components/ui'
import type { RespostaLocal } from '@/lib/respostas'

interface Props {
  metrica: Metrica
  resposta?: RespostaLocal
  aoResponder: (valor: RespostaLocal, imediato?: boolean) => void
}

/**
 * Um card de coleta. Despacha para o cálculo cego (números → nota derivada)
 * ou para a régua 0–4 (nível descritivo). Em nenhum dos dois o avaliador
 * digita a nota.
 */
export function MetricField({ metrica, resposta, aoResponder }: Props) {
  const respondida = resposta !== undefined

  return (
    <Card className={cx('mb-4', respondida && 'border-l-4 border-l-ciano')}>
      <div className="mb-1 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.5px] text-ciano">
            MÉTRICA {metrica.numero}
          </div>
          <h4 className="text-base text-petroleo">{metrica.titulo}</h4>
        </div>
        <Pill
          className={cx(
            'shrink-0',
            metrica.tipo === 'regua'
              ? 'bg-[#F1EEF9] text-[#6B4E9E]'
              : 'bg-ciano-cl text-ciano-esc',
          )}
        >
          {metrica.tipo === 'regua' ? '📐 régua 0–4 · critério' : '🧮 cálculo cego'}
        </Pill>
      </div>

      <p className="mb-4 flex items-start gap-2 text-[12.5px] text-cinza">
        <span aria-hidden>💡</span>
        <span>{metrica.dica}</span>
      </p>

      {metrica.tipo === 'regua' ? (
        <RubricScale
          metrica={metrica}
          nota={resposta?.nota}
          aoEscolher={(nota) => aoResponder({ dadosBrutos: {}, nota }, true)}
        />
      ) : (
        <BlindCalc
          metrica={metrica}
          dados={resposta?.dadosBrutos ?? {}}
          aoMudar={(dados) =>
            aoResponder({ dadosBrutos: dados, nota: calcularNota(metrica, dados) })
          }
        />
      )}
    </Card>
  )
}

/* -------------------------------------------------------- cálculo cego -- */

function BlindCalc({
  metrica,
  dados,
  aoMudar,
}: {
  metrica: Exclude<Metrica, { tipo: 'regua' }>
  dados: DadosBrutos
  aoMudar: (dados: DadosBrutos) => void
}) {
  const preenchida = metrica.campos.every((c) => Number.isFinite(dados[c.id]))
  const nota = preenchida ? calcularNota(metrica, dados) : null

  return (
    <div className="grid items-center gap-6 md:grid-cols-[1fr_200px]">
      <div>
        {metrica.campos.map((campo) => (
          <label key={campo.id} className="mb-3 block last:mb-0">
            <span className="mb-1.5 block text-[12.5px] font-semibold text-tinta">
              {campo.label}
            </span>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={dados[campo.id] ?? ''}
              onChange={(e) => {
                const bruto = e.target.value
                const proximo = { ...dados }
                if (bruto === '') delete proximo[campo.id]
                else proximo[campo.id] = Number(bruto)
                aoMudar(proximo)
              }}
              placeholder="0"
            />
          </label>
        ))}

        {metrica.tipo === 'faixa' && (
          <p className="mt-1 text-[11.5px] font-semibold text-cinza-cl">
            Faixas: {metrica.faixaTxt}
          </p>
        )}
      </div>

      <div className="rounded-card border border-linha bg-app-bg p-4.5 text-center">
        <div className="min-h-8 text-xs text-cinza">
          {preenchida ? memoriaDeCalculo(metrica, dados) : 'Informe os números'}
        </div>
        <div
          className="my-1.5 text-[44px] font-extrabold leading-none"
          style={{ color: nota === null ? '#8A9AA1' : NOTE_COLORS[nota] }}
        >
          {nota ?? '–'}
        </div>
        <div className="text-[11px] font-bold uppercase tracking-[1px] text-cinza-cl">
          nota calculada
        </div>
        {nota !== null && (
          <div className="mt-2 text-[11.5px] text-cinza">{maturidade(nota)}</div>
        )}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- régua -- */

function RubricScale({
  metrica,
  nota,
  aoEscolher,
}: {
  metrica: Extract<Metrica, { tipo: 'regua' }>
  nota?: Nota
  aoEscolher: (nota: Nota) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label={`Nível da métrica ${metrica.numero}`}
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
    >
      {metrica.niveis.map((texto, i) => {
        const nivel = i as Nota
        const escolhido = nota === nivel
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={escolhido}
            onClick={() => aoEscolher(nivel)}
            className={cx(
              'flex min-h-24 flex-col items-start gap-1.5 rounded-[10px] border-[1.5px] p-2.5 text-left transition-all duration-100',
              escolhido
                ? 'bg-white shadow-[0_3px_12px_rgba(2,185,218,0.18)]'
                : 'border-linha bg-white hover:border-ciano-2 hover:bg-[#FBFEFF]',
            )}
            style={escolhido ? { borderColor: NOTE_COLORS[nivel] } : undefined}
          >
            <span
              className={cx(
                'grid h-[22px] w-[22px] place-items-center rounded-md text-xs font-extrabold',
                escolhido ? 'text-white' : 'bg-[#F0F4F6] text-cinza',
              )}
              style={escolhido ? { backgroundColor: NOTE_COLORS[nivel] } : undefined}
            >
              {i}
            </span>
            <span
              className={cx(
                'text-[11.5px] leading-[1.35]',
                escolhido ? 'text-tinta' : 'text-cinza',
              )}
            >
              {texto}
            </span>
          </button>
        )
      })}
    </div>
  )
}
