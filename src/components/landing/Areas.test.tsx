// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MODULOS } from '@/data/metricas'
import { Areas } from './Areas'
import { IconeArea } from './iconesAreas'

afterEach(cleanup)

describe('Areas', () => {
  it('tem um cartão por área, com o nome acessível', () => {
    render(<Areas />)
    expect(screen.getAllByRole('button')).toHaveLength(MODULOS.length)
    for (const m of MODULOS) expect(screen.getByRole('button', { name: new RegExp(m.nome) })).toBeTruthy()
  })
  it('o nome só aparece de verdade ao tocar: um cartão por vez', () => {
    render(<Areas />)
    const a = screen.getByRole('button', { name: /Educação/ })
    const b = screen.getByRole('button', { name: /Segurança/ })
    expect(a.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(a)
    expect(a.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(b)
    expect(a.getAttribute('aria-pressed')).toBe('false')
    expect(b.getAttribute('aria-pressed')).toBe('true')
  })
  it('diz quais áreas estão ativas', () => {
    render(<Areas />)
    expect(screen.getByRole('button', { name: /Saúde.*ativa/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Educação.*em breve/i })).toBeTruthy()
  })
  it('todo módulo tem ícone', () => {
    for (const m of MODULOS) {
      const { container } = render(<IconeArea id={m.id} />)
      expect(container.querySelector('svg path, svg circle, svg rect'), m.id).toBeTruthy()
      cleanup()
    }
  })
})
