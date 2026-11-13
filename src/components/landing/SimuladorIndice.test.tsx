// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SimuladorIndice } from './SimuladorIndice'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('SimuladorIndice: ajuste dos pilares', () => {
  it('o painel fechado fica fora do foco do teclado (inert) e abre ao clicar', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
    const { container } = render(<SimuladorIndice />)
    const painel = container.querySelector('#ajuste-pilares') as HTMLElement
    expect(painel.hasAttribute('inert')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /ajustar os cinco pilares/i }))
    expect(painel.hasAttribute('inert')).toBe(false)
  })
})
