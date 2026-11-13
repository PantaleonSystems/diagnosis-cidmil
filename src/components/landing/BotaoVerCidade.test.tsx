// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { BotaoVerCidade } from './BotaoVerCidade'

afterEach(cleanup)

describe('BotaoVerCidade', () => {
  it('leva a /app e usa o texto combinado', () => {
    render(<MemoryRouter><BotaoVerCidade /></MemoryRouter>)
    const a = screen.getByRole('link', { name: /ver a minha cidade/i })
    expect(a.getAttribute('href')).toBe('/app')
  })
  it('esconde o pino das tecnologias assistivas', () => {
    const { container } = render(<MemoryRouter><BotaoVerCidade /></MemoryRouter>)
    expect(container.querySelector('svg.btn-cidade__pino')?.getAttribute('aria-hidden')).toBe('true')
  })
})
