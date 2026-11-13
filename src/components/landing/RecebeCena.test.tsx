// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RecebeCena } from './RecebeCena'

beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} })))
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('RecebeCena', () => {
  it('tem três cenas, uma palavra de rótulo cada', () => {
    render(<RecebeCena />)
    expect(screen.getAllByRole('group', { name: /^\d de 3$/ })).toHaveLength(3)
    for (const r of ['Avaliação', 'Pessoas no centro', 'Atividades']) expect(screen.getByText(r)).toBeTruthy()
  })
  it('nenhum texto dentro das cenas passa de três palavras', () => {
    const { container } = render(<RecebeCena />)
    for (const t of container.querySelectorAll('.rc-rotulo, svg text')) expect((t.textContent ?? '').trim().split(/\s+/).length).toBeLessThanOrEqual(3)
  })
  it('o carrossel troca de cena', () => {
    render(<RecebeCena />)
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByRole('button', { name: 'Ir para 2' }).getAttribute('aria-current')).toBe('true')
  })
  it('a cena das pessoas mostra as seis tecnologias e a balança da ética', () => {
    const { container } = render(<RecebeCena />)
    expect(container.querySelectorAll('.rc-tec')).toHaveLength(6)
    expect(container.querySelector('.rc-etica')).toBeTruthy()
  })
})
