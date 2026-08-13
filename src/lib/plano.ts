/**
 * Plano de ação derivado das notas reais.
 *
 * O protótipo trazia o plano escrito à mão; aqui ele nasce do diagnóstico —
 * é o que faz a avaliação virar recomendação em vez de texto decorativo.
 */
import { PILARES, type Metrica, type Pilar } from '@/data/metricas'
import { prioridade, type Nota, type Prioridade } from '@/lib/calculos'
import { MINIMO_GOVERNANCA, type ResultadoIndice } from '@/lib/isps'

export interface Acao {
  prioridade: Prioridade
  titulo: string
  descricao: string
  prazo: 'Curto prazo' | 'Médio prazo' | 'Longo prazo'
  responsavel: string
}

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

export interface Diagnostico {
  fortes: string[]
  atencao: string[]
  acoes: Acao[]
  resumo: string
}

interface MetricaComNota {
  metrica: Metrica
  pilar: Pilar
  nota: Nota
}

function metricasRespondidas(notas: Record<number, Nota>): MetricaComNota[] {
  const lista: MetricaComNota[] = []
  for (const pilar of PILARES) {
    for (const metrica of pilar.metricas) {
      const nota = notas[metrica.numero]
      if (nota !== undefined) lista.push({ metrica, pilar, nota })
    }
  }
  return lista
}

export function montarPlano(
  resultado: ResultadoIndice,
  notas: Record<number, Nota>,
  nomeCidade: string,
): Diagnostico {
  const respondidas = metricasRespondidas(notas)
  const pilaresComDados = resultado.pilares.filter((p) => p.respondidas > 0)

  /* --------------------------------------------------------- pontos fortes */
  const fortes: string[] = []

  for (const p of [...pilaresComDados].sort((a, b) => b.media - a.media).slice(0, 2)) {
    if (p.media >= 3)
      fortes.push(
        `${p.pilar.nome} é o pilar mais maduro (${p.media.toFixed(1)} de 4,0)`,
      )
  }

  for (const { metrica, nota } of respondidas
    .filter((m) => m.nota === 4)
    .slice(0, 3)) {
    fortes.push(`${metrica.titulo} — nota máxima (${nota})`)
  }

  if (fortes.length === 0)
    fortes.push(
      'Nenhuma métrica alcançou o patamar de referência ainda — há espaço de avanço em todos os pilares.',
    )

  /* ------------------------------------------------------ pontos de atenção */
  const atencao: string[] = []

  if (resultado.travado)
    atencao.push(
      `Governança participativa abaixo do mínimo (${resultado.mediaGovernanca.toFixed(1)}) — trava o índice no Nível 2`,
    )

  for (const p of pilaresComDados.filter(
    (p) => p.media < 2 && !(resultado.travado && p.pilar.numero === 1),
  ))
    atencao.push(`${p.pilar.nome} com média baixa (${p.media.toFixed(1)})`)

  for (const { metrica, nota } of respondidas
    .filter((m) => m.nota <= 1)
    .sort((a, b) => a.nota - b.nota)
    .slice(0, 4))
    atencao.push(`${metrica.titulo} — nota ${nota}`)

  if (atencao.length === 0)
    atencao.push('Nenhuma métrica em situação crítica entre as respondidas.')

  /* ---------------------------------------------------- ações priorizadas */
  const acoes: Acao[] = []

  if (resultado.travado) {
    acoes.push({
      prioridade: 'Alta',
      titulo: 'Fortalecer a governança participativa (Pilar 1)',
      descricao:
        `Enquanto o Pilar 1 estiver abaixo de ${MINIMO_GOVERNANCA.toFixed(1)}, a cidade fica travada no Nível 2 ` +
        'pela Regra de Ouro. Reformar os canais de participação e abrir a pauta do Conselho de Saúde ' +
        'é a intervenção de maior alavancagem no índice.',
      prazo: 'Curto prazo',
      responsavel: RESPONSAVEL[1],
    })
  }

  // as métricas mais frágeis viram ações concretas
  for (const { metrica, pilar, nota } of respondidas
    .filter((m) => m.nota <= 2)
    .sort((a, b) => a.nota - b.nota || b.pilar.peso - a.pilar.peso)
    .slice(0, 5)) {
    const prio = prioridade(nota)
    acoes.push({
      prioridade: prio,
      titulo: `Elevar "${metrica.titulo}" (métrica ${metrica.numero})`,
      descricao:
        `Hoje em nota ${nota} (${nota <= 1 ? 'situação crítica' : 'em desenvolvimento'}), ` +
        `no ${pilar.nome} — peso de ${Math.round(pilar.peso * 100)}% no índice. ` +
        `${metrica.dica}`,
      prazo: PRAZO[prio],
      responsavel: RESPONSAVEL[pilar.numero],
    })
  }

  const melhor = [...pilaresComDados].sort((a, b) => b.media - a.media)[0]
  if (melhor && melhor.media >= 3) {
    acoes.push({
      prioridade: 'Baixa',
      titulo: `Sustentar o desempenho em ${melhor.pilar.nome}`,
      descricao:
        'Manter o patamar já alcançado com monitoramento anual, evitando regressão ' +
        'enquanto o esforço se concentra nos pilares mais frágeis.',
      prazo: 'Longo prazo',
      responsavel: 'Monitoramento contínuo',
    })
  }

  /* ---------------------------------------------------------------- resumo */
  const criticas = respondidas.filter((m) => m.nota <= 1).length
  const resumo = resultado.travado
    ? `${nomeCidade} apresenta ISPS de ${resultado.isps.toFixed(2).replace('.', ',')}, ` +
      `mas a baixa participação cidadã na governança limita seu avanço. Pela Regra de Ouro do ` +
      `framework, elevar o Pilar 1 acima de ${MINIMO_GOVERNANCA.toFixed(1)} é a condição para a cidade ` +
      `alcançar o Nível ${resultado.nivelReal + 1}.`
    : `${nomeCidade} apresenta ISPS de ${resultado.isps.toFixed(2).replace('.', ',')}, ` +
      `com ${respondidas.length} métricas avaliadas e ${criticas} em situação crítica. ` +
      `O avanço de nível depende de elevar as métricas de menor nota nos pilares de maior peso.`

  return { fortes, atencao, acoes, resumo }
}
