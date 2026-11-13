// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FONTES } from './fontes'
import { TerritorioFontes } from './TerritorioFontes'

afterEach(cleanup)

describe('TerritorioFontes', () => {
  it('mostra um botão por fonte, todos fechados', () => {
    render(<TerritorioFontes />)
    for (const f of FONTES) expect(screen.getByRole('button', { name: f.nome }).getAttribute('aria-expanded')).toBe('false')
  })
  it('abre a frase da fonte clicada e fecha a anterior', () => {
    render(<TerritorioFontes />)
    fireEvent.click(screen.getByRole('button', { name: FONTES[0].nome }))
    expect(screen.getByText(FONTES[0].frase)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: FONTES[1].nome }))
    expect(screen.getByRole('button', { name: FONTES[0].nome }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByRole('button', { name: FONTES[1].nome }).getAttribute('aria-expanded')).toBe('true')
  })
  it('clicar de novo na fonte aberta fecha o painel', () => {
    render(<TerritorioFontes />)
    const b = screen.getByRole('button', { name: FONTES[2].nome })
    fireEvent.click(b); fireEvent.click(b)
    expect(b.getAttribute('aria-expanded')).toBe('false')
  })
})
