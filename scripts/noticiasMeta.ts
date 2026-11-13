/** Extrai título, descrição e data publicada de uma página de notícia (regex simples, suficiente para og:* e JSON-LD). */
export function extrairMeta(html: string): { titulo: string | null; descricao: string | null; data: string | null } {
  const meta = (chave: string) => {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${chave}["'][^>]*content=["']([^"']*)["']`, 'i')
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${chave}["']`, 'i')
    return html.match(re)?.[1] ?? html.match(re2)?.[1] ?? null
  }
  const titulo = meta('og:title') ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null
  const descricao = meta('og:description') ?? meta('description')
  const bruta = meta('article:published_time') ?? html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1] ?? null
  const data = bruta?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null
  return { titulo: titulo || null, descricao: descricao || null, data }
}
