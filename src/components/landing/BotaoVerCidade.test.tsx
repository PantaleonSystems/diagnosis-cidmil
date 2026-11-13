// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { BotaoVerCidade } from './BotaoVerCidade'

afterEach(cleanup)

describe('BotaoVerCidade', () => {
  it('leva à demonstração e usa o texto combinado', () => {
    render(<MemoryRouter><BotaoVerCidade /></MemoryRouter>)
    const a = screen.getByRole('link', { name: /ver uma cidade em demonstração/i })
    expect(a.getAttribute('href')).toBe('#demonstracao')
  })
  it('esconde o pino das tecnologias assistivas', () => {
    const { container } = render(<MemoryRouter><BotaoVerCidade /></MemoryRouter>)
    expect(container.querySelector('svg.btn-cidade__pino')?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('BotaoVerCidade com rota', () => {
  it('rota normal usa o router', () => {
    render(<MemoryRouter><BotaoVerCidade to="/app">Entrar</BotaoVerCidade></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Entrar' }).getAttribute('href')).toBe('/app')
  })
})
