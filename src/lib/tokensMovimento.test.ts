import { describe, expect, it } from 'vitest'
import { CURVAS, DURACOES } from './tokensMovimento'

const css = Object.values(
  import.meta.glob('../styles/movimento.css', { query: '?raw', import: 'default', eager: true }),
)[0] as string

describe('tokens de movimento', () => {
  it('mantém as durações do transitions.dev', () => {
    expect(Object.values(DURACOES)).toEqual([40, 80, 150, 250, 350, 400, 500])
  })
  it('mantém a curva suave', () => {
    expect(CURVAS.suave).toBe('cubic-bezier(.22,1,.36,1)')
  })
  it('o CSS usa as mesmas curvas', () => {
    expect(css).toContain('--ease-smooth-out: cubic-bezier(.22,1,.36,1)')
    expect(css).toContain('--ease-bounce: cubic-bezier(.34,1.36,.64,1)')
  })
})
