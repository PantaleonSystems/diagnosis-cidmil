// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NavLanding } from './NavLanding'

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} unobserve() {} takeRecords() { return [] } })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('NavLanding', () => {
  it('sempre leva à beta: botão "Testar a beta" aponta para /app', () => {
    render(<MemoryRouter><NavLanding /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /testar a beta/i }).getAttribute('href')).toBe('/app')
  })
})
