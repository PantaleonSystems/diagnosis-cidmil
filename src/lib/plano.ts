/**
 * Plano de ação — direção, intensidade e prioridade.
 *
 * O plano não repete o diagnóstico em outras palavras: ele diz o próximo
 * passo concreto de cada métrica frágil e o que esse passo destrava.
 *
 * Tudo aqui é DERIVADO, nada é opinião:
 *   - régua   → o texto do nível seguinte já descreve o estado a alcançar
 *   - cálculo → a fórmula diz o número exato que falta para subir de nota
 *   - ordem   → o que destrava nível primeiro, depois o impacto real por ponto
 */
import { PILARES, type Metrica, type Pilar } from '@/data/metricas'
import {
  calcularNota,
  prioridade,
  type DadosBrutos,
  type Nota,
  type Prioridade,
} from '@/lib/calculos'
import { MINIMO_GOVERNANCA, type ResultadoIndice } from '@/lib/isps'

/** Respostas da avaliação, indexadas pelo número da métrica. */
export type RespostasPlano = Record<number, { nota: Nota; dadosBrutos: DadosBrutos }>

export interface Acao {
  prioridade: Prioridade
  metrica?: Metrica
  titulo: string
  /** onde a cidade está hoje, nas palavras da própria métrica */
  situacaoAtual: string
  /** o que precisa passar a existir — direção concreta */
  proximoPasso: string
  /** o que esse passo destrava ou quanto move o índice */
  ganho: string
  prazo: 'Curto prazo' | 'Médio prazo' | 'Longo prazo'
  responsavel: string
}

/** Decimal em português — o plano é lido por gestor, não por programador. */
const n = (v: number, casas = 2) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

/** Quantas opções de desbloqueio mostrar antes de voltar às outras direções. */
const MAX_DESTRAVA = 3
const MAX_ACOES_METRICA = 6
/**
 * Teto por pilar. A alavancagem de P1 (0,0292) e P3 (0,0286) é um empate
 * técnico; sem este limite, uma diferença de 2% faria o plano inteiro sair de
 * um pilar só. Um plano de direção precisa cobrir frentes.
 */
const MAX_POR_PILAR = 2

const PRAZO: Record<Prioridade, Acao['prazo']> = {
  Alta: 'Curto prazo',
  Média: 'Médio prazo',
  Baixa: 'Longo prazo',
}

const RESPONSAVEL: Record<number, string> = {
  1: 'Conselho Municipal de Saúde',
  2: 'Secretaria de Saúde · Participação Social',
  3: 'Secretaria de Saúde · Comunicação e RH',
  4: 'Secretaria de Saúde · Infraestrutura e Inovação',
  5: 'Secretaria de Saúde · Planejamento',
}

/* -------------------------------------------------------------------------- */
/*  Alavancagem                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Quanto UM ponto numa métrica deste pilar move o ISPS.
 *
 * O peso do pilar sozinho engana: o Pilar 1 pesa 35% mas tem 12 métricas,
 * então cada uma vale quase o mesmo que uma do Pilar 3 (20% em 7 métricas).
 * Priorizar pelo peso do pilar seria erro de leitura.
 */
export function alavancagem(pilar: Pilar): number {
  return pilar.peso / pilar.metricas.length
}

/* -------------------------------------------------------------------------- */
/*  Próximo passo                                                             */
/* -------------------------------------------------------------------------- */

const THRESH_PERCENT = [0, 25, 50, 75] // nota n exige passar de THRESH[n]
const THRESH_DENS = [0.5, 1, 2, 4] // nota n+1 exige atingir THRESH[n]

/** Menor valor do campo variável que eleva a nota. Null se já está no topo. */
function valorParaSubir(metrica: Metrica, dados: DadosBrutos, nota: Nota) {
  if (metrica.tipo === 'regua' || nota >= 4) return null

  const campo =
    metrica.tipo === 'faixa' ? metrica.campos[0] : metrica.campos[1]
  const atual = dados[campo.id] ?? 0

  // candidato analítico, conforme o tipo
  let candidato: number
  if (metrica.tipo === 'percentual') {
    const total = dados[metrica.campos[0].id] ?? 0
    if (total <= 0) return null
    candidato = Math.floor((total * THRESH_PERCENT[nota]) / 100) + 1
    if (candidato > total) return null // impossível: passaria de 100%
  } else if (metrica.tipo === 'densidade') {
    const base = dados[metrica.campos[0].id] ?? 0
    if (base <= 0) return null
    candidato = Math.ceil((THRESH_DENS[nota] * base) / metrica.por)
  } else {
    // (não usar `n` como nome aqui: sombrearia o formatador de decimais)
    const faixa = metrica.faixas.find(([, notaDaFaixa]) => notaDaFaixa === nota)
    candidato = faixa ? faixa[0] + 1 : atual + 1
  }

  // confere com a fórmula real; ajusta se o arredondamento ficou curto
  for (let v = Math.max(candidato, atual + 1); v <= candidato + 10; v++) {
    if (calcularNota(metrica, { ...dados, [campo.id]: v }) > nota) {
      return { campo, alvo: v, delta: v - atual, atual }
    }
  }
  return null
}

/** Onde a métrica está hoje, nas palavras dela mesma. */
function descreverSituacao(
  metrica: Metrica,
  nota: Nota,
  dados: DadosBrutos,
): string {
  if (metrica.tipo === 'regua') return `Nível ${nota}: "${metrica.niveis[nota]}"`

  if (metrica.tipo === 'percentual') {
    const total = dados[metrica.campos[0].id] ?? 0
    const parte = dados[metrica.campos[1].id] ?? 0
    const pct = total > 0 ? (parte / total) * 100 : 0
    return `${parte} de ${total} (${pct.toFixed(0)}%) — nota ${nota}`
  }
  if (metrica.tipo === 'densidade') {
    const base = dados[metrica.campos[0].id] ?? 0
    const qtd = dados[metrica.campos[1].id] ?? 0
    const d = base > 0 ? (qtd / base) * metrica.por : 0
    return `${qtd} para ${base.toLocaleString('pt-BR')} hab. (${n(d, 1)} por ${metrica.por.toLocaleString('pt-BR')}) — nota ${nota}`
  }
  return `${dados[metrica.campos[0].id] ?? 0} — nota ${nota}`
}

/** O que precisa passar a existir. É aqui que mora a direção. */
function descreverProximoPasso(
  metrica: Metrica,
  nota: Nota,
  dados: DadosBrutos,
): string {
  if (nota >= 4) return 'Já está no patamar de referência — manter.'

  if (metrica.tipo === 'regua') {
    // a própria rúbrica descreve o estado a alcançar
    return `Alcançar o nível ${nota + 1}: "${metrica.niveis[nota + 1]}"`
  }

  const passo = valorParaSubir(metrica, dados, nota)
  if (!passo) return `Elevar "${metrica.campos.at(-1)?.label}" para subir de nota.`

  return (
    `${passo.campo.label}: de ${passo.atual} para ${passo.alvo} ` +
    `(mais ${passo.delta}) — chega à nota ${nota + 1}.`
  )
}

/* -------------------------------------------------------------------------- */
/*  Montagem                                                                  */
/* -------------------------------------------------------------------------- */

export interface Diagnostico {
  fortes: string[]
  atencao: string[]
  acoes: Acao[]
  resumo: string
  /** pontos que faltam no Pilar 1 para destravar a Regra de Ouro */
  deficitGovernanca: number
}

interface Candidata {
  metrica: Metrica
  pilar: Pilar
  nota: Nota
  dados: DadosBrutos
  destrava: boolean
  peso: number
}

const pilarDe = (numero: number) =>
  PILARES.find((p) => p.metricas.some((m) => m.numero === numero))!

export function montarPlano(
  resultado: ResultadoIndice,
  respostas: RespostasPlano,
  nomeCidade: string,
): Diagnostico {
  const respondidas: Candidata[] = []
  for (const [chave, r] of Object.entries(respostas)) {
    const numero = Number(chave)
    const pilar = pilarDe(numero)
    const metrica = pilar?.metricas.find((m) => m.numero === numero)
    if (!pilar || !metrica) continue
    respondidas.push({
      metrica,
      pilar,
      nota: r.nota,
      dados: r.dadosBrutos ?? {},
      destrava: false,
      peso: alavancagem(pilar),
    })
  }

  /* --------------------------------------- déficit da Regra de Ouro ------ */
  const p1 = resultado.pilares.find((p) => p.pilar.numero === 1)
  const somaP1 = (p1?.media ?? 0) * (p1?.respondidas || 1)
  const necessarioP1 = MINIMO_GOVERNANCA * (p1?.respondidas || 0)
  const deficitGovernanca = resultado.travado
    ? Math.max(1, Math.ceil(necessarioP1 - somaP1))
    : 0

  // as métricas do Pilar 1 que ainda têm espaço são as que destravam
  if (resultado.travado) {
    for (const c of respondidas) {
      if (c.pilar.numero === 1 && c.nota < 4) c.destrava = true
    }
  }

  /* ---------------------------------------------------- pontos fortes ---- */
  const fortes: string[] = []
  for (const p of [...resultado.pilares]
    .filter((p) => p.respondidas > 0)
    .sort((a, b) => b.media - a.media)
    .slice(0, 2)) {
    if (p.media >= 3)
      fortes.push(`${p.pilar.nome} é o pilar mais maduro (${n(p.media, 1)} de 4,0)`)
  }
  for (const c of respondidas.filter((c) => c.nota === 4).slice(0, 3))
    fortes.push(`${c.metrica.titulo} — patamar de referência`)
  if (fortes.length === 0)
    fortes.push(
      'Nenhuma métrica alcançou o patamar de referência ainda — há espaço de avanço em todos os pilares.',
    )

  /* ------------------------------------------------ pontos de atenção ---- */
  const atencao: string[] = []
  if (resultado.travado)
    atencao.push(
      `Governança em ${n(resultado.mediaGovernanca)} trava a cidade no Nível 2 — ` +
        `faltam ${deficitGovernanca} ponto${deficitGovernanca > 1 ? 's' : ''} para destravar`,
    )
  for (const p of resultado.pilares.filter(
    (p) => p.respondidas > 0 && p.media < 2 && p.pilar.numero !== 1,
  ))
    atencao.push(`${p.pilar.nome} com média baixa (${n(p.media, 1)})`)
  for (const c of respondidas
    .filter((c) => c.nota <= 1)
    .sort((a, b) => a.nota - b.nota)
    .slice(0, 4))
    atencao.push(`${c.metrica.titulo} — nota ${c.nota}`)
  if (atencao.length === 0)
    atencao.push('Nenhuma métrica em situação crítica entre as respondidas.')

  /* ------------------------------------------------------------ ações ---- */
  // ordena por criticidade dentro de cada grupo; o agrupamento vem depois
  const porUrgencia = (a: Candidata, b: Candidata) =>
    b.peso - a.peso || a.nota - b.nota

  const melhoraveis = respondidas.filter((c) => c.nota < 4)

  /*
   * O desbloqueio costuma exigir poucos pontos, então listar todas as métricas
   * do Pilar 1 afogaria as demais direções. Mostramos as melhores opções de
   * desbloqueio e voltamos à ordem por alavancagem para o resto do plano.
   */
  const destravam = melhoraveis
    .filter((c) => c.destrava)
    .sort(porUrgencia)
    .slice(0, MAX_DESTRAVA)

  // exclui TODAS as candidatas de desbloqueio, não só as já escolhidas: senão
  // as demais métricas do Pilar 1 voltariam pela ordenação de alavancagem
  const demais: Candidata[] = []
  const porPilar = new Map<number, number>()
  for (const c of destravam) {
    porPilar.set(c.pilar.numero, (porPilar.get(c.pilar.numero) ?? 0) + 1)
  }
  for (const c of melhoraveis.filter((c) => !c.destrava).sort(porUrgencia)) {
    if (demais.length >= MAX_ACOES_METRICA - destravam.length) break
    const usados = porPilar.get(c.pilar.numero) ?? 0
    if (usados >= MAX_POR_PILAR) continue
    porPilar.set(c.pilar.numero, usados + 1)
    demais.push(c)
  }

  const acoes: Acao[] = []

  if (resultado.travado) {
    const plural = deficitGovernanca > 1
    acoes.push({
      prioridade: 'Alta',
      titulo: `Destravar o Nível ${resultado.nivelReal + 1}: elevar a Governança Participativa`,
      situacaoAtual: `Pilar 1 em ${n(resultado.mediaGovernanca)} — abaixo do mínimo de ${n(MINIMO_GOVERNANCA, 1)}`,
      proximoPasso:
        `${plural ? 'Somar' : 'Somar'} ${deficitGovernanca} ponto${plural ? 's' : ''} em qualquer combinação ` +
        `de métricas do Pilar 1 leva a média a ${n(MINIMO_GOVERNANCA, 1)}. As opções abaixo são as de menor esforço.`,
      ganho:
        `Destrava o Nível ${resultado.nivelReal + 1} imediatamente. É a maior alavancagem do diagnóstico: ` +
        `move pouco o ISPS, mas muda o patamar da cidade.`,
      prazo: 'Curto prazo',
      responsavel: RESPONSAVEL[1],
    })
  }

  for (const c of [...destravam, ...demais]) {
    const prio = prioridade(c.nota)
    acoes.push({
      prioridade: prio,
      metrica: c.metrica,
      titulo: `${c.metrica.titulo} (métrica ${c.metrica.numero})`,
      situacaoAtual: descreverSituacao(c.metrica, c.nota, c.dados),
      proximoPasso: descreverProximoPasso(c.metrica, c.nota, c.dados),
      ganho: c.destrava
        ? `Contribui para destravar o Nível ${resultado.nivelReal + 1} (Regra de Ouro).`
        : `Cada ponto aqui move o ISPS em ${n(c.peso, 3)} — ${c.pilar.nome}.`,
      prazo: PRAZO[prio],
      responsavel: RESPONSAVEL[c.pilar.numero],
    })
  }

  const melhor = [...resultado.pilares]
    .filter((p) => p.respondidas > 0)
    .sort((a, b) => b.media - a.media)[0]
  if (melhor && melhor.media >= 3) {
    acoes.push({
      prioridade: 'Baixa',
      titulo: `Sustentar ${melhor.pilar.nome}`,
      situacaoAtual: `Média ${n(melhor.media, 1)} — o pilar mais maduro da cidade`,
      proximoPasso:
        'Monitoramento anual para evitar regressão enquanto o esforço se concentra nos pilares frágeis.',
      ganho: 'Preserva o patamar já conquistado.',
      prazo: 'Longo prazo',
      responsavel: 'Monitoramento contínuo',
    })
  }

  /* ----------------------------------------------------------- resumo ---- */
  const criticas = respondidas.filter((c) => c.nota <= 1).length
  const isps = n(resultado.isps)
  const resumo = resultado.travado
    ? `${nomeCidade} tem ISPS ${isps}, que por si só renderia o Nível ${resultado.nivelReal + 1}. ` +
      `A Regra de Ouro a mantém no Nível ${resultado.nivelExibido + 1} porque a governança participativa ` +
      `está em ${n(resultado.mediaGovernanca)}. ${deficitGovernanca > 1 ? 'Faltam' : 'Falta'} ${deficitGovernanca} ` +
      `ponto${deficitGovernanca > 1 ? 's' : ''} no Pilar 1 — a intervenção de menor esforço e maior efeito do diagnóstico.`
    : `${nomeCidade} tem ISPS ${isps}, com ${respondidas.length} métricas avaliadas e ${criticas} ` +
      `em situação crítica. O avanço depende de elevar as métricas de maior alavancagem, ` +
      `listadas a seguir na ordem em que rendem mais.`

  return { fortes, atencao, acoes, resumo, deficitGovernanca }
}
