/**
 * Confere cada notícia de src/data/noticias.ts na fonte: status, título e data.
 * Uso: npm run noticias:verificar. O resultado orienta quem marca `verificada: true`.
 */
import { NOTICIAS } from '../src/data/noticias'
import { extrairMeta } from './noticiasMeta'

for (const n of NOTICIAS) {
  try {
    const r = await fetch(n.fonte.url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (verificador de notícias)' } })
    const meta = extrairMeta(r.ok ? await r.text() : '')
    const dataOk = meta.data ? (meta.data === n.data ? 'confere' : `DIFERE (${meta.data})`) : 'sem data na página'
    console.log(`${r.ok ? 'OK ' : 'ERRO'} ${r.status} · ${n.id}\n   título na fonte: ${meta.titulo ?? '—'}\n   data: ${dataOk}\n   marcada como verificada: ${n.verificada}`)
  } catch (e) {
    console.log(`ERRO · ${n.id}: ${String(e)}`)
  }
}
