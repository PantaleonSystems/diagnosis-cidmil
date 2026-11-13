import { describe, expect, it } from 'vitest'
import { extrairMeta } from './noticiasMeta'

describe('extrairMeta', () => {
  it('lê título, descrição e data publicada', () => {
    const html = `<html><head><title>Outro</title>
      <meta property="og:title" content="Política Nacional">
      <meta property="og:description" content="Resumo da fonte">
      <meta property="article:published_time" content="2026-10-28T10:00:00-03:00"></head></html>`
    expect(extrairMeta(html)).toEqual({ titulo: 'Política Nacional', descricao: 'Resumo da fonte', data: '2026-10-28' })
  })
  it('cai para <title> e datePublished em JSON-LD', () => {
    const html = `<title>Só título</title><script type="application/ld+json">{"datePublished":"2026-04-10T08:00:00Z"}</script>`
    expect(extrairMeta(html)).toEqual({ titulo: 'Só título', descricao: null, data: '2026-04-10' })
  })
  it('HTML vazio devolve nulos', () => {
    expect(extrairMeta('')).toEqual({ titulo: null, descricao: null, data: null })
  })
})
