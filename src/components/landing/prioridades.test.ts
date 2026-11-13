import { describe, expect, it } from 'vitest'
import { PRIORIDADES, motivo, ordenar, rotulo } from './prioridades'

describe('ordenar', () => {
  it('mais urgente primeiro; empate fica com o mais simples', () => {
    expect(ordenar(PRIORIDADES, 'urgencia').map((p) => p.id)).toEqual(['escuta', 'capacitar', 'plano', 'dados'])
  })
  it('mais fácil primeiro; empate fica com o mais urgente', () => {
    expect(ordenar(PRIORIDADES, 'facil').map((p) => p.id)).toEqual(['capacitar', 'escuta', 'plano', 'dados'])
  })
  it('não altera a lista original', () => {
    const copia = [...PRIORIDADES]
    ordenar(PRIORIDADES, 'facil')
    expect(PRIORIDADES).toEqual(copia)
  })
})

describe('rotulo', () => {
  it('traduz os níveis em palavras', () => {
    expect(rotulo('urgencia', 3)).toBe('alta')
    expect(rotulo('urgencia', 1)).toBe('baixa')
    expect(rotulo('complexidade', 1)).toBe('simples')
    expect(rotulo('complexidade', 3)).toBe('complexa')
  })
})

describe('motivo', () => {
  const escuta = PRIORIDADES.find((p) => p.id === 'escuta')!
  const dados = PRIORIDADES.find((p) => p.id === 'dados')!
  it('explica o primeiro lugar pelo critério escolhido', () => {
    expect(motivo(escuta, 'urgencia', 0)).toMatch(/primeiro.*urgência é alta/i)
  })
  it('explica por que o que é complexo fica para depois quando o critério é a facilidade', () => {
    expect(motivo(dados, 'facil', 3)).toMatch(/complexa/i)
  })
})
