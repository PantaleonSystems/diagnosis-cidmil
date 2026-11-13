import { describe, expect, it, vi } from 'vitest'
import { pausarEmAndamento } from './pausaAnimacoes'

const falsa = (playState: string) => ({ playState, pause: vi.fn(), play: vi.fn() }) as unknown as Animation

describe('pausarEmAndamento', () => {
  it('só pausa e retoma o que está rodando; o que já terminou não reinicia', () => {
    const rodando = falsa('running'), terminada = falsa('finished')
    const retomar = pausarEmAndamento([rodando, terminada])
    expect(rodando.pause).toHaveBeenCalledTimes(1)
    expect(terminada.pause).not.toHaveBeenCalled()
    retomar()
    expect(rodando.play).toHaveBeenCalledTimes(1)
    expect(terminada.play).not.toHaveBeenCalled()
  })
})
