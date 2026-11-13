// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroNoticias } from './HeroNoticias'

const HOJE = new Date('2026-11-13T12:00:00')
beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} })))
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.resetModules(); vi.doUnmock('@/data/contato') })
const montar = () => render(<MemoryRouter><HeroNoticias hoje={HOJE} /></MemoryRouter>)

describe('HeroNoticias', () => {
  it('abre com a frase central e o botão para a demonstração', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/o futuro das cidades já começou/i)
    expect(screen.getByRole('link', { name: /ver uma cidade em demonstração/i }).getAttribute('href')).toBe('#demonstracao')
  })
  it('leva à beta em /app, o sistema que a pessoa pode testar', () => {
    montar()
    expect(screen.getByRole('link', { name: /testar a beta/i }).getAttribute('href')).toBe('/app')
  })
  it('mostra o selo com a data da notícia mais nova e um slide por notícia verificada', () => {
    montar()
    expect(screen.getByText(/atualizado em 09\/11\/2026/i)).toBeTruthy()
    expect(screen.getAllByRole('group', { name: /^\d de \d$/ }).length).toBeGreaterThanOrEqual(3)
  })
  it('os temas levam ao primeiro cartão do tema', () => {
    montar()
    const mil = screen.getByRole('button', { name: /^mil$/i })
    fireEvent.click(mil)
    expect(mil.getAttribute('aria-pressed')).toBe('true')
  })
  it('o ponto pulsante do selo some quando a notícia mais nova já não é recente', () => {
    const { container, unmount } = render(<MemoryRouter><HeroNoticias hoje={HOJE} /></MemoryRouter>)
    expect(container.querySelector('p.selo-atualizado .ponto-vivo')).toBeTruthy()
    unmount()
    const velho = render(<MemoryRouter><HeroNoticias hoje={new Date('2027-06-01T12:00:00')} /></MemoryRouter>)
    expect(velho.container.querySelector('p.selo-atualizado')).toBeTruthy()
    expect(velho.container.querySelector('p.selo-atualizado .ponto-vivo')).toBeNull()
  })
  it('não mostra "Falar com a equipe" sem contato configurado', () => {
    montar()
    expect(screen.queryByRole('link', { name: /falar com a equipe/i })).toBeNull()
  })
  it('com contato configurado o botão aparece', async () => {
    vi.doMock('@/data/contato', () => ({ CONTATO_URL: 'mailto:equipe@exemplo.org', CONTATO_DESENVOLVIMENTO: '' }))
    const { HeroNoticias: H } = await import('./HeroNoticias')
    render(<MemoryRouter><H hoje={HOJE} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /falar com a equipe/i }).getAttribute('href')).toBe('mailto:equipe@exemplo.org')
  })
})
