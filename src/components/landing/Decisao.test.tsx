// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Decisao } from './Decisao'

beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} })))
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const montar = () => render(<MemoryRouter><Decisao /></MemoryRouter>)
const linha = (re: RegExp) => screen.getAllByRole('listitem').find((li) => re.test(li.textContent ?? ''))!

describe('Decisao', () => {
  it('marca o exemplo como ilustrativo e leva a /app', () => {
    montar()
    expect(screen.getByText(/exemplo ilustrativo/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /ver a minha cidade/i }).getAttribute('href')).toBe('/app')
  })
  it('cada tarefa mostra urgência, complexidade, prazo e o porquê da posição', () => {
    montar()
    const escuta = linha(/canal de escuta/i)
    expect(escuta.textContent).toMatch(/urgência alta/i)
    expect(escuta.textContent).toMatch(/complexidade moderada/i)
    expect(escuta.textContent).toMatch(/60 dias/)
    expect(escuta.textContent).toMatch(/primeiro porque a urgência é alta/i)
  })
  it('trocar o critério reordena e muda o porquê', () => {
    montar()
    const facil = screen.getByRole('button', { name: /mais fácil primeiro/i })
    expect(facil.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(facil)
    expect(facil.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: /mais urgente primeiro/i }).getAttribute('aria-pressed')).toBe('false')
    const capacitar = linha(/capacitar/i)
    expect(capacitar.getAttribute('data-posicao')).toBe('1')
    expect(capacitar.textContent).toMatch(/primeiro porque é simples de fazer/i)
  })
  it('anuncia a posição para leitores de tela e avisa a nova ordem', () => {
    montar()
    fireEvent.click(screen.getByRole('button', { name: /mais fácil primeiro/i }))
    expect(linha(/capacitar/i).textContent).toMatch(/posição 1/i)
    expect(screen.getByRole('status').textContent).toMatch(/capacitar as equipes/i)
  })
})
