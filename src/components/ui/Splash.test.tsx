// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Splash } from './index'

afterEach(cleanup)

describe('Splash', () => {
  it('diz que está preparando a cidade e é um status', () => {
    render(<Splash />)
    expect(screen.getByRole('status').textContent).toContain('Preparando a sua cidade')
  })
  it('aceita um texto próprio', () => {
    render(<Splash texto="Abrindo…" />)
    expect(screen.getByText('Abrindo…')).toBeTruthy()
  })
  it('desenha o mapa do Brasil', () => {
    const { container } = render(<Splash />)
    expect(container.querySelectorAll('svg path.splash-uf').length).toBe(27)
  })
})
