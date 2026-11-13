// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FONTES } from './fontes'
import { TerritorioFontes } from './TerritorioFontes'

afterEach(cleanup)

describe('TerritorioFontes', () => {
  it('mostra o nome e a frase de cada fonte sem precisar clicar', () => {
    render(<TerritorioFontes />)
    for (const f of FONTES) {
      expect(screen.getByText(f.nome)).toBeTruthy()
      expect(screen.getByText(f.frase)).toBeTruthy()
    }
  })
  it('numera as três etapas do caminho', () => {
    render(<TerritorioFontes />)
    for (const t of [/1 · de onde vem/i, /2 · reunimos e conferimos/i, /3 · o que a cidade recebe/i]) {
      expect(screen.getByText(t)).toBeTruthy()
    }
  })
  it('tem o caminho descrito para leitores de tela', () => {
    const { container } = render(<TerritorioFontes />)
    expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toMatch(/fontes.*cidade.*diagnóstico/i)
  })
})
