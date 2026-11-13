// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TEMAS, type Noticia, type TemaNoticia } from '@/data/noticias'
import { CartaoNoticia } from './CartaoNoticia'
import { CenaTema } from './CenasTema'

afterEach(cleanup)
const HOJE = new Date('2026-11-13T12:00:00')
const n: Noticia = {
  id: 'x', tema: 'ia', titulo: 'Título da notícia', resumo: 'Resumo em texto nosso.', conexao: 'Se relaciona com a saúde.',
  fonte: { nome: 'Ministério da Saúde', url: 'https://www.gov.br/saude/x' }, data: '2026-11-10', verificada: true,
}

describe('CartaoNoticia', () => {
  it('mostra título, tema, recência e fonte sem abrir nada', () => {
    render(<CartaoNoticia noticia={n} hoje={HOJE} />)
    expect(screen.getByText('Título da notícia')).toBeTruthy()
    expect(screen.getByText(TEMAS.ia.rotulo)).toBeTruthy()
    expect(screen.getByText('Há 3 dias')).toBeTruthy()
    expect(screen.getByText(/Ministério da Saúde/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /ver conexão/i }).getAttribute('aria-expanded')).toBe('false')
  })
  it('o cartão inteiro leva à notícia em nova aba, por um único link seguro', () => {
    const { container } = render(<CartaoNoticia noticia={n} hoje={HOJE} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    const a = links[0]
    expect(a.getAttribute('href')).toBe('https://www.gov.br/saude/x')
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toContain('noopener')
    expect(a.textContent).toMatch(/Título da notícia/)
    expect(a.textContent).toMatch(/abre em nova aba/i)
    expect(container.querySelector('a.cartao-noticia__link')).toBeTruthy()
  })
  it('ao abrir mostra o resumo e a conexão', () => {
    render(<CartaoNoticia noticia={n} hoje={HOJE} />)
    fireEvent.click(screen.getByRole('button', { name: /ver conexão/i }))
    expect(screen.getByRole('button', { name: /fechar/i }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText(/conexão com cidades mil/i)).toBeTruthy()
    expect(screen.getByText('Se relaciona com a saúde.')).toBeTruthy()
  })
  it('com imagem mostra a foto com texto alternativo e crédito, sem a ilustração', () => {
    const com = { ...n, imagem: { src: '/noticias/x.jpg', alt: 'Pessoas em um evento', credito: 'Foto: Fulana/MDHC' } }
    const { container } = render(<CartaoNoticia noticia={com} hoje={HOJE} />)
    const img = screen.getByRole('img', { name: 'Pessoas em um evento' })
    expect(img.getAttribute('src')).toBe('/noticias/x.jpg')
    expect(img.getAttribute('loading')).toBe('lazy')
    expect(screen.getByText('Foto: Fulana/MDHC')).toBeTruthy()
    expect(container.querySelector('svg.cena')).toBeNull()
  })
  it('sem imagem usa a ilustração do tema', () => {
    const { container } = render(<CartaoNoticia noticia={n} hoje={HOJE} />)
    expect(container.querySelector('svg.cena')).toBeTruthy()
  })
  it('o painel fechado não recebe foco (inert)', () => {
    const { container } = render(<CartaoNoticia noticia={n} hoje={HOJE} />)
    expect(container.querySelector('.clique-detalhe')?.hasAttribute('inert')).toBe(true)
  })
})

describe('CenaTema', () => {
  it.each(['ia', 'cidade', 'cidadao', 'mil'] as TemaNoticia[])('desenha a cena do tema %s', (tema) => {
    const { container } = render(<CenaTema tema={tema} />)
    expect(container.querySelector('svg[aria-hidden="true"]')?.getAttribute('data-tema')).toBe(tema)
  })
})
