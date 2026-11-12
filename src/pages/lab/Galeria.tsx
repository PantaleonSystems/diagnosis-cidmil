import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Nota } from '@/lib/calculos'
import { GaugeIndice } from '@/components/charts/GaugeIndice'
import { BarraAbas } from '@/components/mobile/BarraAbas'
import { Chip } from '@/components/mobile/Chip'
import { Folha } from '@/components/mobile/Folha'
import { SeloNota } from '@/components/mobile/SeloNota'
import { IcoAvaliar, IcoCidades, IcoPlano, IcoResultados, IcoVisaoGeral } from '@/components/mobile/icones'
import { CartaoCidade } from '@/components/cidades/CartaoCidade'
import { RedeReal, type ItemRede } from '@/components/cidades/RedeReal'
import type { ResumoCidade } from '@/lib/cidadeAtiva'
import type { Cidade } from '@/types/db'
import { PainelDados } from '@/pages/Dados'
import { PILARES } from '@/data/metricas'
import { Button } from '@/components/ui'
import { useNoindex } from './useNoindex'

const ABAS = [
  { id: 'geral', rotulo: 'Geral', icone: IcoVisaoGeral },
  { id: 'avaliar', rotulo: 'Avaliar', icone: IcoAvaliar },
  { id: 'resultados', rotulo: 'Resultados', icone: IcoResultados },
  { id: 'plano', rotulo: 'Plano', icone: IcoPlano },
  { id: 'cidades', rotulo: 'Cidades', icone: IcoCidades },
]

const cid = (id: string, nome: string, uf: string): Cidade => ({
  id,
  nome,
  uf,
  pais: 'Brasil',
  populacao: null,
  codigo_ibge: null,
  demonstracao: false,
  criado_por: 'x',
  created_at: '',
  updated_at: '',
})
const res = (isps: number | null, nivel: 0 | 1 | 2 | 3, o: Partial<ResumoCidade> = {}): ResumoCidade => ({
  respondidas: isps === null ? 0 : 43,
  total: 43,
  isps,
  nivelExibido: nivel,
  nivelReal: nivel,
  travado: false,
  mediasPilares: [],
  concluida: isps !== null,
  ...o,
})
const EXEMPLOS: ItemRede[] = [
  { cidade: cid('1', 'Vila Modelo', 'MG'), resumo: res(3.41, 3) },
  { cidade: cid('2', 'Baía Exemplo', 'BA'), resumo: res(3.1, 2) },
  { cidade: cid('3', 'Campo Piloto', 'MT'), resumo: res(2.9, 2) },
  { cidade: cid('4', 'Município Exemplo', 'SP'), resumo: res(2.66, 1, { travado: true }) },
  { cidade: cid('5', 'Serra de Teste', 'RS'), resumo: res(1.3, 0) },
  { cidade: cid('6', 'Porto Teste', 'RN'), resumo: res(1.9, 1) },
]

const RESPONDIDAS_EXEMPLO: Record<number, unknown> = Object.fromEntries(
  [...PILARES[0].metricas.slice(0, 7), ...PILARES[1].metricas.slice(0, 5), ...PILARES[3].metricas.slice(0, 5)].map((m) => [m.numero, { nota: 2 }]),
)

function Bloco({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-subtitulo font-bold text-noite">{titulo}</h2>
      {nota && <p className="mb-3 mt-1 text-legenda text-cinza">{nota}</p>}
      {children}
    </section>
  )
}

/** Galeria dos componentes da Fase 0 (interna). Abra no celular. */
export function Galeria() {
  useNoindex()
  const [folha, setFolha] = useState(false)
  const [aba, setAba] = useState('geral')
  const [chip, setChip] = useState('Todas')
  const [isps, setIsps] = useState(2.66)
  const nivel = (isps <= 1.5 ? 0 : isps <= 2.5 ? 1 : isps <= 3.4 ? 2 : 3) as 0 | 1 | 2 | 3

  return (
    <div className="min-h-tela bg-app-bg px-5 pb-16 pt-8">
      <div className="mx-auto max-w-[520px]">
        <p className="text-micro font-bold uppercase text-marca-escura">Laboratório · interno</p>
        <h1 className="mt-1 text-titulo font-extrabold text-noite">Componentes mobile</h1>
        <p className="mb-6 mt-2 text-corpo text-cinza">Fase 0 do redesign. Abra no celular e teste os gestos.</p>
        <Link to="/lab/jornada" className="alvo toque mb-8 flex items-center justify-center rounded-xl bg-marca px-5 text-corpo font-bold text-white">
          Abrir o protótipo da jornada →
        </Link>

        <Bloco titulo="Tipografia fluida" nota="Títulos com tracking negativo; texto pequeno com tracking leve.">
          <div className="rounded-card border border-linha bg-white p-5">
            <p className="text-display font-extrabold text-noite">2,66</p>
            <p className="mt-2 text-titulo font-extrabold text-noite">Título da tela</p>
            <p className="mt-2 text-subtitulo font-bold text-noite">Subtítulo de seção</p>
            <p className="mt-2 text-corpo text-cinza">Corpo de texto com entrelinha confortável para leitura no celular.</p>
            <p className="mt-2 text-legenda text-cinza">Legenda e apoio</p>
            <p className="mt-2 text-micro font-bold uppercase text-cinza-cl">Rótulo micro</p>
          </div>
        </Bloco>

        <Bloco titulo="Selo de nota" nota="Cor + número + rótulo: a cor nunca é o único sinal.">
          <div className="flex flex-wrap gap-2">
            {([0, 1, 2, 3, 4] as Nota[]).map((n) => <SeloNota key={n} nota={n} />)}
          </div>
        </Bloco>

        <Bloco titulo="Chips" nota="Visual de 36 px, área de toque de 44 px.">
          <div className="flex flex-wrap gap-2">
            {['Todas', 'Alta', 'Média', 'Baixa'].map((c) => <Chip key={c} ativo={chip === c} onClick={() => setChip(c)}>{c}</Chip>)}
          </div>
        </Bloco>

        <Bloco titulo="Gauge do índice" nota="Mexa no controle: o arco e o número animam.">
          <div className="rounded-card border border-linha bg-white p-5 text-center">
            <GaugeIndice isps={isps} nivel={nivel} travado={isps > 2.5 && isps < 3} className="mx-auto" />
            <input type="range" min={0} max={4} step={0.05} value={isps} onChange={(e) => setIsps(Number(e.target.value))} aria-label="Valor do índice" className="faixa mt-3 w-full" style={{ ['--cor' as string]: '#0A5A96', ['--pct' as string]: `${(isps / 4) * 100}%` }} />
          </div>
        </Bloco>

        <Bloco titulo="Painel de dados da cidade" nota="Andamento, origem dos dados e pendências por impacto no índice (17 de 43 respondidas, exemplo).">
          <PainelDados nome="Cidade Exemplo" respostas={RESPONDIDAS_EXEMPLO} concluida={false} linkMetrica={(n) => `/app?m=${n}`} linkLista="/app" />
        </Bloco>

        <Bloco titulo="Cartões de cidade" nota="Estados: concluída, travada pela Regra de Ouro, em andamento e sem dados. Cidades fictícias.">
          <div className="grid gap-3">
            <CartaoCidade cidade={EXEMPLOS[0].cidade} resumo={EXEMPLOS[0].resumo} />
            <CartaoCidade cidade={EXEMPLOS[3].cidade} resumo={EXEMPLOS[3].resumo} />
            <CartaoCidade cidade={cid('7', 'Serra Nova', 'PR')} resumo={res(1.1, 0, { respondidas: 17, concluida: false })} />
            <CartaoCidade cidade={cid('8', 'Lago Azul', 'GO')} resumo={res(null, 0, { concluida: false })} />
          </div>
        </Bloco>

        <Bloco titulo="Rede de cidades" nota="Cor = nível, tamanho = índice, ligação mais forte = índices parecidos. Toque numa cidade.">
          <RedeReal itens={EXEMPLOS} />
        </Bloco>

        <Bloco titulo="Folha deslizante" nota="Arraste para baixo (com velocidade ou até a metade) para fechar. Agarre no meio da animação. Esc ou toque fora também fecham.">
          <Button className="alvo" onClick={() => setFolha(true)}>Abrir folha</Button>
          <Folha aberto={folha} aoFechar={() => setFolha(false)} titulo="Exemplo de folha">
            <p className="pb-3 text-corpo text-cinza">Conteúdo que rola por dentro. A folha acompanha o dedo, projeta onde o gesto pararia e entrega a velocidade para a mola.</p>
            {Array.from({ length: 8 }, (_, i) => <p key={i} className="border-t border-linha py-3 text-corpo text-tinta">Linha {i + 1}</p>)}
          </Folha>
        </Bloco>

        <Bloco titulo="Barra de abas" nota="Translúcida; o indicador desliza entre as abas.">
          <div className="relative h-40 overflow-hidden rounded-card border border-linha bg-white">
            <div className="p-4 text-corpo text-cinza">Aba ativa: <strong className="text-noite">{aba}</strong></div>
            <BarraAbas contida itens={ABAS} ativoId={aba} aoEscolher={setAba} />
          </div>
        </Bloco>
      </div>
    </div>
  )
}
