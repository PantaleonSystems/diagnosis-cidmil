import { describe, expect, it } from 'vitest'
import { NOTICIAS, TEMAS, ehRecente, noticiasVisiveis, rotuloRecencia, type Noticia } from './noticias'

const HOJE = new Date('2026-11-13T12:00:00')
const base: Noticia = {
  id: 'x', tema: 'cidade', titulo: 'T', resumo: 'R', conexao: 'C',
  fonte: { nome: 'F', url: 'https://exemplo.gov.br/a' }, data: '2026-11-10', verificada: true,
}

describe('rotuloRecencia', () => {
  it.each([
    ['2026-11-13', 'Hoje'], ['2026-11-12', 'Ontem'], ['2026-11-10', 'Há 3 dias'],
    ['2026-09-29', 'Há 45 dias'], ['2026-09-28', '28 set 2026'], ['2026-04-10', '10 abr 2026'],
    ['2026-12-01', '1 dez 2026'],
  ])('%s → %s', (data, esperado) => {
    expect(rotuloRecencia(data, HOJE)).toBe(esperado)
  })
})

describe('noticiasVisiveis', () => {
  it('descarta não verificadas e datas futuras, e ordena da mais nova para a mais antiga', () => {
    const lista: Noticia[] = [
      { ...base, id: 'velha', data: '2026-04-10' },
      { ...base, id: 'nao', verificada: false },
      { ...base, id: 'futura', data: '2026-12-01' },
      { ...base, id: 'nova', data: '2026-11-06' },
    ]
    expect(noticiasVisiveis(lista, HOJE).map((n) => n.id)).toEqual(['nova', 'velha'])
  })
})

describe('NOTICIAS (conteúdo)', () => {
  it('ids únicos e fontes https sem parâmetros de rastreio', () => {
    expect(new Set(NOTICIAS.map((n) => n.id)).size).toBe(NOTICIAS.length)
    for (const n of NOTICIAS) {
      expect(n.fonte.url.startsWith('https://')).toBe(true)
      expect(n.fonte.url).not.toContain('utm_')
    }
  })
  it('textos curtos e sem linguagem de afiliação', () => {
    for (const n of NOTICIAS) {
      expect(n.titulo.length).toBeLessThanOrEqual(80)
      expect(n.resumo.length).toBeLessThanOrEqual(140)
      expect(n.conexao.length).toBeLessThanOrEqual(120)
      expect(`${n.resumo} ${n.conexao}`.toLowerCase()).not.toMatch(/faz parte|endossa|é um programa cidades mil/)
    }
  })
  it('todo tema tem rótulo', () => {
    for (const n of NOTICIAS) expect(TEMAS[n.tema].rotulo.length).toBeGreaterThan(0)
  })
})

const arquivos = Object.keys(import.meta.glob('../../public/noticias/*'))
describe('imagens das notícias', () => {
  it('toda imagem tem arquivo local, texto alternativo e crédito', () => {
    for (const n of NOTICIAS.filter((x) => x.imagem)) {
      expect(n.imagem!.src.startsWith('/noticias/'), n.id).toBe(true)
      expect(arquivos.some((a) => a.endsWith(n.imagem!.src.replace('/noticias/', '/noticias/'))), n.id).toBe(true)
      expect(n.imagem!.alt.length, n.id).toBeGreaterThan(10)
      expect(n.imagem!.credito.length, n.id).toBeGreaterThan(5)
    }
  })
})

describe('ehRecente', () => {
  it('só considera recente até 45 dias', () => {
    expect(ehRecente('2026-11-13', HOJE)).toBe(true)
    expect(ehRecente('2026-09-29', HOJE)).toBe(true)
    expect(ehRecente('2026-09-28', HOJE)).toBe(false)
    expect(ehRecente('2027-01-01', HOJE)).toBe(false)
  })
})
