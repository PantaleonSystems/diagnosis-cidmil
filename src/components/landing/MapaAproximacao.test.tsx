// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MapaAproximacao } from './MapaAproximacao'

function simular(reduzido: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: reduzido && q.includes('reduce'),
    addEventListener: () => {}, removeEventListener: () => {},
  }))
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} unobserve() {} })
}

describe('MapaAproximacao', () => {
  beforeEach(() => { (Element.prototype as unknown as { animate: unknown }).animate = vi.fn(() => ({ finished: new Promise(() => {}), cancel() {}, pause() {}, play() {} })) })
  afterEach(() => { cleanup(); vi.unstubAllGlobals() })

  it('desenha três camadas com 27 estados e um destaque', () => {
    simular(false)
    const { container, getByRole } = render(<MapaAproximacao />)
    expect(container.querySelectorAll('svg.camada')).toHaveLength(3)
    const c1 = container.querySelector('svg.camada')!
    expect(c1.querySelectorAll('path.uf')).toHaveLength(27)
    expect(c1.querySelectorAll('path.uf.dest')).toHaveLength(1)
    expect(getByRole('img').getAttribute('aria-label')).toBe('Mapa do Brasil aproximando de Serra Azul')
  })
  it('em reduced-motion não anima', () => {
    simular(true)
    render(<MapaAproximacao />)
    expect(Element.prototype.animate).not.toHaveBeenCalled()
  })
})
