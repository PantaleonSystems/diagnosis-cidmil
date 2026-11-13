// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Demonstracao, NUMEROS_DEMO } from './Demonstracao'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} unobserve() {} })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('Demonstracao', () => {
  it('avisa que os números são ilustrativos', () => {
    render(<Demonstracao />)
    expect(screen.getByText(/exemplo ilustrativo/i)).toBeTruthy()
  })
  it('mostra os quatro números combinados', () => {
    expect(NUMEROS_DEMO.map((n) => n.valor)).toEqual([24, 18, 7, 12])
    render(<Demonstracao />)
    for (const n of NUMEROS_DEMO) expect(screen.getByText(String(n.valor))).toBeTruthy()
  })
  it('tem o plano de ação em quatro ícones rotulados', () => {
    render(<Demonstracao />)
    for (const r of ['Objetivo', 'Meta', 'Responsável', 'Prazo']) expect(screen.getByText(r)).toBeTruthy()
  })
  it('nenhum parágrafo passa de 25 palavras', () => {
    const { container } = render(<Demonstracao />)
    for (const p of container.querySelectorAll('p')) expect((p.textContent ?? '').trim().split(/\s+/).length).toBeLessThanOrEqual(25)
  })
})
