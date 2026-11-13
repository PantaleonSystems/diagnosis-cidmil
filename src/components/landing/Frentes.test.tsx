// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PILARES } from '@/data/metricas'
import { Frentes } from './Frentes'
import { IconeFrente } from './iconesFrentes'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const tela = (largo: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: largo && q.includes('min-width'), addEventListener() {}, removeEventListener() {} }))

describe('Frentes', () => {
  it('mostra cinco botões, um por pilar', () => {
    tela(false)
    render(<Frentes />)
    for (const p of PILARES) expect(screen.getByRole('button', { name: new RegExp(p.curto) })).toBeTruthy()
  })
  it('abre uma por vez e mostra a descrição', () => {
    tela(false)
    render(<Frentes />)
    const b1 = screen.getByRole('button', { name: new RegExp(PILARES[0].curto) })
    const b2 = screen.getByRole('button', { name: new RegExp(PILARES[1].curto) })
    expect(b1.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(b2)
    expect(b1.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByText(PILARES[1].descricao)).toBeTruthy()
  })
  it('a primeira já vem aberta', () => {
    tela(true)
    render(<Frentes />)
    expect(screen.getByRole('button', { name: new RegExp(PILARES[0].curto) }).getAttribute('aria-expanded')).toBe('true')
  })
  it('tem ícone para os números 1 a 5', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      const { container } = render(<IconeFrente numero={n} />)
      expect(container.querySelector('svg path, svg circle, svg rect')).toBeTruthy()
      cleanup()
    }
  })
})
