// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FONTES } from './fontes'
import { FontesCompartilham } from './FontesCompartilham'

const tela = (reduzido: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduzido && q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
beforeEach(() => vi.useFakeTimers())
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals() })

describe('FontesCompartilham', () => {
  it('tem um botão por fonte, com o nome acessível', () => {
    tela(false)
    render(<FontesCompartilham />)
    for (const f of FONTES) expect(screen.getByRole('button', { name: f.nome })).toBeTruthy()
  })
  it('clicar liga a fonte na hora; ligando as seis aparece o selo', () => {
    tela(false)
    const { container } = render(<FontesCompartilham />)
    const b = screen.getByRole('button', { name: FONTES[0].nome })
    expect(b.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(b)
    expect(b.getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelector('[data-completo="true"]')).toBeNull()
    for (const f of FONTES) fireEvent.click(screen.getByRole('button', { name: f.nome }))
    expect(container.querySelector('[data-completo="true"]')).toBeTruthy()
  })
  it('liga uma a uma sozinha e reinicia depois', () => {
    tela(false)
    render(<FontesCompartilham />)
    act(() => { vi.advanceTimersByTime(900 + 700 * 6 + 100) })
    expect(screen.getAllByRole('button').every((x) => x.getAttribute('aria-pressed') === 'true')).toBe(true)
    act(() => { vi.advanceTimersByTime(8000) })
    expect(screen.getAllByRole('button').some((x) => x.getAttribute('aria-pressed') === 'false')).toBe(true)
  })
  it('com movimento reduzido já vem tudo ligado e sem animação', () => {
    tela(true)
    const { container } = render(<FontesCompartilham />)
    expect(screen.getAllByRole('button').every((x) => x.getAttribute('aria-pressed') === 'true')).toBe(true)
    expect(container.querySelector('animateMotion')).toBeNull()
  })
})
