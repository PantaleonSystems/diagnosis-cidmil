/**
 * Cadastra a cidade-demonstração "Município de Aurora" com uma avaliação
 * completa do módulo Saúde.
 *
 *   SEED_EMAIL=... SEED_SENHA=... npm run seed:demo
 *
 * Os dados são FICTÍCIOS. A cidade é cadastrada com "(demonstração)" no nome
 * para que ninguém a confunda com estatística municipal real.
 *
 * O ponto central: as notas não são digitadas em lugar nenhum. Para as
 * métricas de cálculo o script informa apenas os números brutos e deriva a
 * nota com o mesmo `calcularNota()` que o app usa — e aborta se o perfil
 * resultante divergir do pretendido. Isso garante que a tela de Avaliação
 * exiba números que realmente produzem as notas gravadas.
 */
import { PILARES, type Metrica } from '../src/data/metricas.ts'
import { calcularNota, type DadosBrutos, type Nota } from '../src/lib/calculos.ts'
import { consolidar, NIVEIS, type NotasPorMetrica } from '../src/lib/isps.ts'

const CIDADE = {
  nome: 'Município de Aurora (demonstração)',
  uf: 'SP',
  pais: 'Brasil',
  populacao: 128_400,
}

/** Métricas de cálculo: só os números brutos. A nota vem da fórmula. */
const BRUTOS: Record<number, DadosBrutos> = {
  // Pilar 1 — governança
  101: { reunioes_total: 12, reunioes_comunidade: 2 }, //      16,7% → 1
  102: { bairros_total: 42, bairros_cobertos: 19 }, //         45,2% → 2
  99: { comites: 3 }, //                                       faixa 2–3 → 2
  // Pilar 2 — engajamento
  96: { bairros_total: 42, bairros_associacoes: 27 }, //       64,3% → 3
  64: { instituicoes_total: 18, instituicoes_projetos: 8 }, // 44,4% → 2
  98: { inovacoes_total: 14, inovacoes_emergentes: 9 }, //     64,3% → 3
  97: { inovacoes: 14 }, //                                    faixa 11–20 → 3
  // Pilar 3 — comunicação
  63: { instituicoes_total: 18, instituicoes_campanhas: 15 }, // 83,3% → 4
  70: { prof_total: 500, prof_mil: 120 }, //                   24% → 1 (exemplo do doc)
  // Pilar 4 — infraestrutura
  65: { populacao: 128_400, espacos: 62 }, //                  4,83 / 10 mil → 4
  66: { espacos_total: 62, espacos_gratuitos: 51 }, //         82,3% → 4
  68: { startups: 18 }, //                                     faixa 11–25 → 3
  69: { startups_alimentacao: 7 }, //                          faixa 6–10 → 3
  82: { fabricas_total: 34, fabricas_controle: 24 }, //        70,6% → 3
  91: { estacoes: 5 }, //                                      faixa 4–5 → 3
}

/** Métricas de régua: o nível escolhido pelo avaliador é a própria nota. */
const REGUAS: Record<number, Nota> = {
  // Pilar 1 — fraco de propósito, para acionar a Regra de Ouro
  100: 2, 75: 2, 76: 2, 78: 1, 84: 2, 85: 2, 103: 2, 104: 2, 105: 3,
  // Pilar 2
  74: 2, 86: 3, 87: 3, 93: 3, 94: 3,
  // Pilar 3
  71: 3, 72: 2, 83: 4, 89: 4, 95: 4,
  // Pilar 4
  67: 4, 79: 1, 81: 3, 90: 4, 92: 4,
  // Pilar 5
  73: 2, 77: 2, 80: 3, 88: 3,
}

/** Perfil pretendido por pilar — o script aborta se não bater. */
const PERFIL_ESPERADO: Record<number, number> = {
  1: 1.92, 2: 2.78, 3: 3.14, 4: 3.27, 5: 2.5,
}

// ---------------------------------------------------------------------------

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY
const email = process.env.SEED_EMAIL
const senha = process.env.SEED_SENHA

if (!url || !anon || !email || !senha) {
  console.error(
    'Faltam variáveis. Use:\n  SEED_EMAIL=... SEED_SENHA=... npm run seed:demo\n' +
      '(VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY vêm do .env.local)',
  )
  process.exit(1)
}

const todas: Metrica[] = PILARES.flatMap((p) => p.metricas)

function montarRespostas() {
  const notas: NotasPorMetrica = {}
  const linhas: { numero: number; dados: DadosBrutos; nota: Nota }[] = []

  for (const m of todas) {
    let nota: Nota
    let dados: DadosBrutos = {}

    if (m.tipo === 'regua') {
      const escolhido = REGUAS[m.numero]
      if (escolhido === undefined)
        throw new Error(`Métrica ${m.numero} (régua) sem nível definido no script.`)
      nota = escolhido
    } else {
      dados = BRUTOS[m.numero]
      if (!dados)
        throw new Error(`Métrica ${m.numero} (${m.tipo}) sem números brutos no script.`)
      nota = calcularNota(m, dados) // a nota sai da fórmula, não do script
    }

    notas[m.numero] = nota
    linhas.push({ numero: m.numero, dados, nota })
  }

  return { notas, linhas }
}

async function api(caminho: string, init: RequestInit, token?: string) {
  const r = await fetch(`${url}${caminho}`, {
    ...init,
    headers: {
      apikey: anon!,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  const texto = await r.text()
  if (!r.ok) throw new Error(`${caminho} → HTTP ${r.status}: ${texto.slice(0, 300)}`)
  return texto ? JSON.parse(texto) : null
}

async function main() {
  const { notas, linhas } = montarRespostas()

  // 1. confere o perfil ANTES de gravar qualquer coisa
  const resultado = consolidar(notas)
  console.log('\nPerfil derivado dos dados brutos:')
  for (const p of resultado.pilares) {
    const esperado = PERFIL_ESPERADO[p.pilar.numero]
    const ok = Math.abs(p.media - esperado) < 0.02
    console.log(
      `  P${p.pilar.numero} ${p.media.toFixed(2)} (esperado ~${esperado})  ${ok ? '✓' : '✗ DIVERGIU'}`,
    )
    if (!ok) throw new Error(`Pilar ${p.pilar.numero} fora do perfil pretendido.`)
  }
  console.log(
    `\n  ISPS ${resultado.isps.toFixed(2)} · Nível ${resultado.nivelExibido + 1} (${NIVEIS[resultado.nivelExibido]})`,
  )
  if (resultado.travado)
    console.log(
      `  ⚠ Regra de Ouro ativa: governança ${resultado.mediaGovernanca.toFixed(2)} < 2,0` +
        ` — sem ela seria Nível ${resultado.nivelReal + 1} (${NIVEIS[resultado.nivelReal]})`,
    )

  // 2. autentica como avaliador — passa pela RLS igual ao app
  const sessao = await api('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password: senha }),
  })
  const token: string = sessao.access_token
  const userId: string = sessao.user.id

  // 3. cidade
  const [cidade] = await api(
    '/rest/v1/cidades',
    {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ ...CIDADE, criado_por: userId }),
    },
    token,
  )
  console.log(`\ncidade: ${cidade.nome}`)

  // 4. avaliação em rascunho
  const [avaliacao] = await api(
    '/rest/v1/avaliacoes',
    {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        cidade_id: cidade.id,
        modulo_id: 'saude',
        ano: new Date().getFullYear(),
        status: 'rascunho',
        avaliador_id: userId,
      }),
    },
    token,
  )

  // 5. respostas
  const metricasDb: { id: string; numero: number }[] = await api(
    '/rest/v1/metricas?select=id,numero',
    { method: 'GET' },
    token,
  )
  const idPorNumero = new Map(metricasDb.map((m) => [m.numero, m.id]))

  const payload = linhas.map((l) => {
    const metricaId = idPorNumero.get(l.numero)
    if (!metricaId) throw new Error(`Métrica ${l.numero} não existe no banco.`)
    return {
      avaliacao_id: avaliacao.id,
      metrica_id: metricaId,
      dados_brutos: l.dados,
      nota: l.nota,
    }
  })

  await api(
    '/rest/v1/respostas',
    {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(payload),
    },
    token,
  )
  console.log(`${payload.length} respostas gravadas`)

  // 6. conclui
  await api(
    `/rest/v1/avaliacoes?id=eq.${avaliacao.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        isps: resultado.isps,
        status: 'concluida',
        concluida_em: new Date().toISOString(),
      }),
    },
    token,
  )
  console.log(`avaliação concluída · ISPS ${resultado.isps.toFixed(2)}\n`)
}

main().catch((e) => {
  console.error('\nFALHOU:', e.message)
  process.exit(1)
})
