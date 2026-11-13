// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Landing } from './Landing'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} unobserve() {} })
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} unobserve() {} takeRecords() { return [] } })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('Landing: pouco texto', () => {
  it('nenhum parágrafo passa de 25 palavras', () => {
    const { container } = render(<MemoryRouter><Landing /></MemoryRouter>)
    const longos = [...container.querySelectorAll('p')]
      .map((p) => (p.textContent ?? '').trim())
      .filter((t) => t.split(/\s+/).length > 25)
    expect(longos).toEqual([])
  })
})
