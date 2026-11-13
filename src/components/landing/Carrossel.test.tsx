// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Carrossel } from './Carrossel'

const itens = [<p key="a">Um</p>, <p key="b">Dois</p>, <p key="c">Três</p>]
const tela = (reduzido: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduzido && q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
const oculta = (v: boolean) => Object.defineProperty(document, 'hidden', { configurable: true, get: () => v })

beforeEach(() => { vi.useFakeTimers(); tela(false); oculta(false) })
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals() })

const atual = () => screen.getAllByRole('button', { name: /ir para/i }).findIndex((b) => b.getAttribute('aria-current') === 'true')

describe('Carrossel', () => {
  it('descreve região, slides e bolinhas', () => {
    render(<Carrossel rotulo="Notícias" itens={itens} />)
    expect(screen.getByRole('region', { name: 'Notícias' }).getAttribute('aria-roledescription')).toBe('carousel')
    expect(screen.getByRole('group', { name: '1 de 3' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /ir para/i })).toHaveLength(3)
  })
  it('Próximo e Anterior mudam o item atual e avisam', () => {
    const onMudar = vi.fn()
    render(<Carrossel rotulo="N" itens={itens} onMudar={onMudar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(atual()).toBe(1)
    expect(onMudar).toHaveBeenCalledWith(1)
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(atual()).toBe(2)
  })
  it('só o slide atual fica acessível ao teclado (inert nos outros)', () => {
    render(<Carrossel rotulo="N" itens={itens} />)
    expect(screen.getByRole('group', { name: '2 de 3' }).hasAttribute('inert')).toBe(true)
    expect(screen.getByRole('group', { name: '1 de 3' }).hasAttribute('inert')).toBe(false)
  })
  it('autoavança, e para ao focar, com a aba oculta e ao pausar', () => {
    render(<Carrossel rotulo="N" itens={itens} autoavancoMs={1000} />)
    act(() => { vi.advanceTimersByTime(1000) })
    expect(atual()).toBe(1)
    fireEvent.focusIn(screen.getByRole('region'))
    act(() => { vi.advanceTimersByTime(5000) })
    expect(atual()).toBe(1)
    fireEvent.focusOut(screen.getByRole('region'))
    oculta(true); fireEvent(document, new Event('visibilitychange'))
    act(() => { vi.advanceTimersByTime(5000) })
    expect(atual()).toBe(1)
    oculta(false); fireEvent(document, new Event('visibilitychange'))
    fireEvent.click(screen.getByRole('button', { name: /pausar/i }))
    act(() => { vi.advanceTimersByTime(5000) })
    expect(atual()).toBe(1)
  })
  it('com movimento reduzido não avança sozinho', () => {
    tela(true)
    render(<Carrossel rotulo="N" itens={itens} autoavancoMs={1000} />)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(atual()).toBe(0)
    expect(screen.queryByRole('button', { name: /pausar/i })).toBeNull()
  })
  it('aria-live fica polite só sem autoavanço', () => {
    const { container, rerender } = render(<Carrossel rotulo="N" itens={itens} />)
    expect(container.querySelector('[aria-live]')?.getAttribute('aria-live')).toBe('polite')
    rerender(<Carrossel rotulo="N" itens={itens} autoavancoMs={1000} />)
    expect(container.querySelector('[aria-live]')?.getAttribute('aria-live')).toBe('off')
  })
})

describe('Carrossel controlado', () => {
  it('segue a prop indice quando ela muda', () => {
    const { rerender } = render(<Carrossel rotulo="N" itens={itens} indice={0} />)
    expect(atual()).toBe(0)
    rerender(<Carrossel rotulo="N" itens={itens} indice={2} />)
    expect(atual()).toBe(2)
  })
})

describe('Carrossel pausado', () => {
  it('vira polite quando o autoavanço está parado por foco', () => {
    const { container } = render(<Carrossel rotulo="N" itens={itens} autoavancoMs={1000} />)
    expect(container.querySelector('[aria-live]')?.getAttribute('aria-live')).toBe('off')
    fireEvent.focusIn(screen.getByRole('region'))
    expect(container.querySelector('[aria-live]')?.getAttribute('aria-live')).toBe('polite')
  })
})

describe('Carrossel: deslizar não abre o link', () => {
  it('um arrasto de mais de 40 px cancela o clique seguinte no conteúdo', () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault())
    render(<Carrossel rotulo="N" itens={[<a key="a" href="#x" onClick={onClick}>Link</a>, <p key="b">B</p>]} />)
    const regiao = screen.getByRole('region')
    fireEvent.pointerDown(regiao, { clientX: 200 })
    fireEvent.pointerUp(regiao, { clientX: 100 })
    fireEvent.click(screen.getByRole('link', { hidden: true, name: 'Link' }))
    expect(onClick).not.toHaveBeenCalled()
  })
  it('um toque simples ainda clica', () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault())
    render(<Carrossel rotulo="N" itens={[<a key="a" href="#x" onClick={onClick}>Link</a>, <p key="b">B</p>]} />)
    const regiao = screen.getByRole('region')
    fireEvent.pointerDown(regiao, { clientX: 200 })
    fireEvent.pointerUp(regiao, { clientX: 198 })
    fireEvent.click(screen.getByRole('link', { name: 'Link' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
