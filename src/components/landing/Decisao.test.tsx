// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { Decisao } from './Decisao'

afterEach(cleanup)
const montar = () => render(<MemoryRouter><Decisao /></MemoryRouter>)

describe('Decisao', () => {
  it('marca o exemplo como ilustrativo e leva a /app', () => {
    montar()
    expect(screen.getByText(/exemplo ilustrativo/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /ver a minha cidade/i }).getAttribute('href')).toBe('/app')
  })
  it('a chave troca o critério de ordem', () => {
    montar()
    const chave = screen.getByRole('button', { name: /começar pelo mais rápido/i })
    expect(chave.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(chave)
    expect(chave.getAttribute('aria-pressed')).toBe('true')
    const capacitar = screen.getAllByRole('listitem').find((li) => /capacitar/i.test(li.textContent ?? ''))!
    expect(capacitar.getAttribute('data-posicao')).toBe('1')
  })
  it('anuncia a posição para leitores de tela e avisa a nova ordem', () => {
    montar()
    const chave = screen.getByRole('button', { name: /começar pelo mais rápido/i })
    fireEvent.click(chave)
    const capacitar = screen.getAllByRole('listitem').find((li) => /capacitar/i.test(li.textContent ?? ''))!
    expect(capacitar.textContent).toMatch(/posição 1/i)
    expect(screen.getByRole('status').textContent).toMatch(/capacitar as equipes/i)
  })
})
