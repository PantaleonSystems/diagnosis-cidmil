import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PILARES } from '@/data/metricas'
import { notaPercent, prioridade, type Nota, type Prioridade } from '@/lib/calculos'
import { NIVEIS, MINIMO_GOVERNANCA } from '@/lib/isps'
import { fmt } from '@/lib/theme'
import { calcular } from '@/components/landing/indice'
import { GaugeIndice } from '@/components/charts/GaugeIndice'
import { BarraAbas, type ItemAba } from '@/components/mobile/BarraAbas'
import { Chip } from '@/components/mobile/Chip'
import { Folha } from '@/components/mobile/Folha'
import { SeloNota } from '@/components/mobile/SeloNota'
import {
  IcoAvaliar,
  IcoCidades,
  IcoPlano,
  IcoResultados,
  IcoVisaoGeral,
} from '@/components/mobile/icones'
import { Button, Input, Field, cx } from '@/components/ui'
import { useNoindex } from './useNoindex'

/**
 * PROTÓTIPO da jornada mobile (Fase 0). Dados de exemplo, nada é salvo.
 * Serve para a equipe sentir a navegação e os componentes no próprio celular.
 */

const ABAS: ItemAba[] = [
  { id: 'geral', rotulo: 'Geral', icone: IcoVisaoGeral },
  { id: 'avaliar', rotulo: 'Avaliar', icone: IcoAvaliar },
  { id: 'resultados', rotulo: 'Resultados', icone: IcoResultados },
  { id: 'plano', rotulo: 'Plano', icone: IcoPlano },
  { id: 'cidades', rotulo: 'Cidades', icone: IcoCidades },
]

const NOTAS_PILARES = [1.9, 2.8, 3.2, 3.5, 2.5]
const CIDADES = [
  { nome: 'Município Exemplo', isps: 2.66, demo: true },
  { nome: 'Cidade de Teste A', isps: 3.4 },
  { nome: 'Cidade de Teste B', isps: 1.4 },
]
const NOTAS_METRICAS: Nota[] = [1, 2, 2, 0, 3, 4, 2, 1, 3, 2, 2, 1]
const ACOES = [
  { t: 'Destravar o Nível 3: elevar a Governança Participativa', d: 'Maior alavancagem do diagnóstico: com a Governança acima de 2,0 a cidade deixa de ser travada pela Regra de Ouro.', p: 'Alta' as Prioridade },
  { t: 'Criar o plano anticrise para epidemias', d: 'Métrica 75 está crítica. Um plano formal e testado é o próximo passo mais barato.', p: 'Alta' as Prioridade },
  { t: 'Unificar o canal entre instituições de saúde', d: 'Métricas 76 e 85 em desenvolvimento. Padronizar o canal destrava as duas.', p: 'Média' as Prioridade },
]

type Aba = 'geral' | 'avaliar' | 'resultados' | 'plano' | 'cidades'
type Aberta =
  | { tipo: 'cidade' }
  | { tipo: 'nova' }
  | { tipo: 'metrica'; i: number }
  | { tipo: 'acao'; i: number }
  | null

const corPrioridade: Record<Prioridade, string> = { Alta: 'text-[#B3532F]', Média: 'text-[#8A5A1E]', Baixa: 'text-[#2C8465]' }

export function Jornada() {
  useNoindex()
  const [aba, setAba] = useState<Aba>('geral')
  const [aberta, setAberta] = useState<Aberta>(null)
  const fechar = () => setAberta(null)
  const res = calcular(NOTAS_PILARES)

  return (
    <div className="fixed inset-0 bg-app-bg md:static md:relative md:mx-auto md:my-6 md:h-[780px] md:w-[390px] md:overflow-hidden md:rounded-[36px] md:border md:border-linha md:shadow-card">
      <div className="absolute inset-0 overflow-y-auto overscroll-contain pb-[104px]">
        <header className="vidro sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-linha px-5 pb-3 pt-seguro" style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}>
          <button type="button" onClick={() => setAberta({ tipo: 'cidade' })} className="alvo toque -ml-2 flex items-center gap-1.5 rounded-full px-2 text-left">
            <span>
              <span className="block text-micro font-bold uppercase text-cinza-cl">Cidade</span>
              <span className="block text-corpo font-bold leading-tight text-petroleo">Município Exemplo ▾</span>
            </span>
          </button>
          <span className="rounded-full bg-ciano-cl px-3 py-1 text-legenda font-bold text-ciano-esc">Saúde</span>
        </header>

        <div key={aba} className="entrar px-5 pt-5">
          {aba === 'geral' && <Geral res={res} />}
          {aba === 'avaliar' && <Avaliar />}
          {aba === 'resultados' && <Resultados abrir={(i) => setAberta({ tipo: 'metrica', i })} />}
          {aba === 'plano' && <Plano abrir={(i) => setAberta({ tipo: 'acao', i })} />}
          {aba === 'cidades' && <Cidades nova={() => setAberta({ tipo: 'nova' })} />}
          <Link to="/lab" className="alvo mt-8 flex items-center justify-center text-legenda font-semibold text-cinza-cl">
            ← Voltar à galeria de componentes
          </Link>
        </div>
      </div>

      <BarraAbas contida itens={ABAS} ativoId={aba} aoEscolher={(id) => setAba(id as Aba)} />

      <Folha aberto={aberta?.tipo === 'cidade'} aoFechar={fechar} titulo="Trocar de cidade">
        <ul className="space-y-2 pb-3">
          {CIDADES.map((c) => (
            <li key={c.nome}>
              <button type="button" onClick={fechar} className="alvo toque flex w-full items-center justify-between rounded-xl border border-linha px-4 py-3 text-left">
                <span className="font-bold text-petroleo">{c.nome}</span>
                <span className="text-legenda text-cinza">ISPS {fmt(c.isps, 2)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Folha>

      <Folha aberto={aberta?.tipo === 'nova'} aoFechar={fechar} titulo="Nova cidade">
        <div className="pb-3">
          <Field label="País"><Input placeholder="Digite para buscar…" inputMode="search" /></Field>
          <Field label="Estado"><Input placeholder="Digite para buscar…" inputMode="search" /></Field>
          <Field label="Município" hint="Os campos mudam conforme o país escolhido."><Input placeholder="Digite para buscar…" inputMode="search" /></Field>
          <Button className="alvo w-full" onClick={fechar}>Vincular cidade</Button>
        </div>
      </Folha>

      <Folha aberto={aberta?.tipo === 'metrica'} aoFechar={fechar} titulo={aberta?.tipo === 'metrica' ? `Métrica ${PILARES[0].metricas[aberta.i].numero}` : 'Métrica'}>
        {aberta?.tipo === 'metrica' && <DetalheMetrica i={aberta.i} />}
      </Folha>

      <Folha aberto={aberta?.tipo === 'acao'} aoFechar={fechar} titulo="Ação do plano">
        {aberta?.tipo === 'acao' && (
          <div className="pb-3">
            <h3 className="text-subtitulo font-bold text-petroleo">{ACOES[aberta.i].t}</h3>
            <p className="mt-2 text-corpo text-cinza">{ACOES[aberta.i].d}</p>
            <p className={cx('mt-3 text-legenda font-bold', corPrioridade[ACOES[aberta.i].p])}>Prioridade {ACOES[aberta.i].p}</p>
          </div>
        )}
      </Folha>
    </div>
  )
}

/* ------------------------------------------------------------------ telas -- */

function Titulo({ children, sub }: { children: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-titulo font-extrabold text-petroleo">{children}</h1>
      {sub && <p className="mt-1 text-corpo text-cinza">{sub}</p>}
    </div>
  )
}

function Geral({ res }: { res: ReturnType<typeof calcular> }) {
  return (
    <>
      <div className="rounded-card border border-linha bg-white p-5 text-center shadow-card">
        <p className="text-micro font-bold uppercase text-cinza-cl">Índice Cidades MIL de Saúde</p>
        <GaugeIndice isps={res.isps} nivel={res.nivel as 0 | 1 | 2 | 3} travado={res.travado} className="mx-auto mt-1" />
        <div className="mt-2 flex gap-1.5" aria-hidden>
          {NIVEIS.map((n, i) => (
            <span key={n} className={cx('h-1.5 flex-1 rounded-full', i <= res.nivel ? 'bg-ciano' : 'bg-linha')} />
          ))}
        </div>
      </div>

      {res.travado && (
        <div className="mt-3 rounded-xl border border-aviso-borda bg-aviso-bg p-4 text-legenda text-aviso-txt">
          <strong>Regra de Ouro:</strong> o índice renderia o Nível {res.nivelReal + 1}, mas a Governança está abaixo de {fmt(MINIMO_GOVERNANCA, 1)}.
        </div>
      )}

      <h2 className="mb-2 mt-6 text-subtitulo font-bold text-petroleo">Pilares</h2>
      <ul className="space-y-2.5">
        {PILARES.map((p, i) => (
          <li key={p.numero} className="rounded-xl border border-linha bg-white p-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-corpo font-bold text-petroleo">{p.curto}</span>
              <span className="text-corpo font-extrabold text-petroleo">{fmt(NOTAS_PILARES[i], 1)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-linha">
              <div className="h-full rounded-full" style={{ width: `${(NOTAS_PILARES[i] / 4) * 100}%`, backgroundColor: p.cor, transition: 'width 700ms cubic-bezier(0.2,0.9,0.25,1)' }} />
            </div>
            <p className="mt-1.5 text-micro text-cinza-cl">peso {Math.round(p.peso * 100)}%</p>
          </li>
        ))}
      </ul>

      <details className="mt-5 rounded-xl border border-linha bg-white p-4">
        <summary className="alvo cursor-pointer list-none text-corpo font-bold text-petroleo">Primeiros passos · 1 de 3 ▾</summary>
        <ol className="mt-2 space-y-2 text-corpo text-cinza">
          <li>✓ Cadastre a sua cidade</li>
          <li>2. Preencha os dados</li>
          <li>3. Leia o diagnóstico e o plano</li>
        </ol>
      </details>
    </>
  )
}

function Avaliar() {
  const exemplos = PILARES[0].metricas.slice(0, 3)
  const [i, setI] = useState(0)
  const [a, setA] = useState('12')
  const [b, setB] = useState('2')
  const pct = Number(a) > 0 ? (Number(b) / Number(a)) * 100 : 0
  const nota = notaPercent(pct)
  return (
    <>
      <Titulo sub="Uma métrica por vez, com o polegar.">Avaliação</Titulo>
      <div className="mb-3 flex items-center justify-between text-legenda font-bold text-cinza">
        <span>Pilar 1 · Governança</span>
        <span>{i + 1} de {exemplos.length}</span>
      </div>
      <div className="mb-4 h-1.5 rounded-full bg-linha" aria-hidden>
        <div className="h-full rounded-full bg-ciano" style={{ width: `${((i + 1) / exemplos.length) * 100}%`, transition: 'width 400ms cubic-bezier(0.2,0.9,0.25,1)' }} />
      </div>
      <div className="rounded-card border border-linha bg-white p-5 shadow-card">
        <p className="text-micro font-extrabold uppercase text-ciano">Métrica {exemplos[i].numero}</p>
        <h2 className="mt-1 text-subtitulo font-bold text-petroleo">{exemplos[i].titulo}</h2>
        <div className="mt-4">
          <Field label="Total no ano"><Input inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} /></Field>
          <Field label="Do total, quantos atendem"><Input inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} /></Field>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-app-bg p-3">
          <span className="text-legenda text-cinza">{b || 0} de {a || 0} = {Math.round(pct)}%</span>
          <SeloNota nota={nota} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variante="ghost" className="alvo" disabled={i === 0} onClick={() => setI(i - 1)}>← Anterior</Button>
        <Button className="alvo" disabled={i === exemplos.length - 1} onClick={() => setI(i + 1)}>Próxima →</Button>
      </div>
      <p className="mt-4 text-legenda text-cinza-cl">Exemplo: a nota usa a mesma regra de percentual do sistema.</p>
    </>
  )
}

function Resultados({ abrir }: { abrir: (i: number) => void }) {
  const [filtro, setFiltro] = useState<Prioridade | 'Todas'>('Todas')
  const itens = PILARES[0].metricas.map((m, i) => ({ m, i, nota: NOTAS_METRICAS[i % NOTAS_METRICAS.length] }))
  const vis = itens.filter((x) => filtro === 'Todas' || prioridade(x.nota) === filtro)
  return (
    <>
      <Titulo sub="Governança Participativa (dados de exemplo)">Resultados</Titulo>
      <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1" role="group" aria-label="Filtrar por prioridade">
        {(['Todas', 'Alta', 'Média', 'Baixa'] as const).map((f) => (
          <Chip key={f} ativo={filtro === f} onClick={() => setFiltro(f)}>{f}</Chip>
        ))}
      </div>
      <ul className="space-y-2.5">
        {vis.map(({ m, i, nota }) => (
          <li key={m.numero}>
            <button type="button" onClick={() => abrir(i)} className="toque w-full rounded-xl border border-linha bg-white p-4 text-left">
              <div className="flex items-start justify-between gap-3">
                <span className="text-micro font-extrabold uppercase text-ciano">M{m.numero}</span>
                <SeloNota nota={nota} />
              </div>
              <p className="mt-1.5 line-clamp-2 text-corpo font-bold text-petroleo">{m.titulo}</p>
              <p className={cx('mt-1 text-legenda font-bold', corPrioridade[prioridade(nota)])}>Prioridade {prioridade(nota)}</p>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

function DetalheMetrica({ i }: { i: number }) {
  const m = PILARES[0].metricas[i]
  const nota = NOTAS_METRICAS[i % NOTAS_METRICAS.length]
  return (
    <div className="pb-3">
      <h3 className="text-subtitulo font-bold text-petroleo">{m.titulo}</h3>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <SeloNota nota={nota} />
        <span className={cx('text-legenda font-bold', corPrioridade[prioridade(nota)])}>Prioridade {prioridade(nota)}</span>
      </div>
      <p className="mt-3 text-corpo text-cinza">Aqui entram a memória de cálculo e o próximo passo desta métrica.</p>
    </div>
  )
}

function Plano({ abrir }: { abrir: (i: number) => void }) {
  return (
    <>
      <Titulo sub="O que fazer primeiro (exemplo).">Plano de ação</Titulo>
      <ol className="space-y-3">
        {ACOES.map((a, i) => (
          <li key={a.t}>
            <button type="button" onClick={() => abrir(i)} className="toque flex w-full gap-3 rounded-card border border-linha bg-white p-4 text-left shadow-card">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ciano text-corpo font-extrabold text-white">{i + 1}</span>
              <span>
                <span className="block text-corpo font-bold text-petroleo">{a.t}</span>
                <span className={cx('mt-1 block text-legenda font-bold', corPrioridade[a.p])}>Prioridade {a.p}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </>
  )
}

function Cidades({ nova }: { nova: () => void }) {
  return (
    <>
      <Titulo sub="Onde as avaliações acontecem.">Cidades</Titulo>
      <ul className="space-y-2.5">
        {CIDADES.map((c) => (
          <li key={c.nome} className="flex items-center justify-between rounded-card border border-linha bg-white p-4">
            <span>
              <span className="block text-corpo font-bold text-petroleo">{c.nome}</span>
              {c.demo && <span className="text-legenda text-cinza-cl">demonstração</span>}
            </span>
            <span className="text-corpo font-extrabold text-petroleo">{fmt(c.isps, 2)}</span>
          </li>
        ))}
      </ul>
      <Button className="alvo mt-4 w-full" onClick={nova}>+ Nova cidade</Button>
    </>
  )
}
