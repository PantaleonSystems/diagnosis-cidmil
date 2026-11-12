/**
 * Estado do fluxo "O que fazer primeiro".
 *
 * Versão de teste: fica só neste aparelho, nesta aba (sessionStorage), e some
 * ao fechar. Ainda não é gravado no banco: a gravação vem depois que a equipe
 * fechar o método.
 */
import { useCallback, useEffect, useState } from 'react'
import type { Gut } from '@/lib/priorizar'

export type SituacaoConclusao = 'pendente' | 'confirmada' | 'descartada'
export type Decisao = 'aceita' | 'adiada' | 'descartada'
export type Prazo = 'Curto' | 'Médio' | 'Longo'

export interface DecisaoDaAcao {
  decisao: Decisao | null
  prazo: Prazo
  motivo: string
}

export interface EstadoPriorizar {
  conclusoes: Record<string, SituacaoConclusao>
  /** texto editado de uma conclusão */
  textos: Record<string, string>
  /** ações ligadas no simulador; null = ainda não escolheu (usa a sugestão) */
  marcadas: number[] | null
  gut: Record<number, Gut>
  decisoes: Record<number, DecisaoDaAcao>
}

export const ESTADO_INICIAL: EstadoPriorizar = {
  conclusoes: {},
  textos: {},
  marcadas: null,
  gut: {},
  decisoes: {},
}

const chave = (cidadeId: string) => `cidadesmil:priorizar:${cidadeId}`

function ler(cidadeId: string): EstadoPriorizar {
  try {
    const bruto = sessionStorage.getItem(chave(cidadeId))
    if (!bruto) return ESTADO_INICIAL
    return { ...ESTADO_INICIAL, ...(JSON.parse(bruto) as Partial<EstadoPriorizar>) }
  } catch {
    return ESTADO_INICIAL
  }
}

export function useEstadoPriorizar(cidadeId: string) {
  const [estado, setEstado] = useState<EstadoPriorizar>(() => ler(cidadeId))

  // outra cidade, outro estado
  useEffect(() => {
    setEstado(ler(cidadeId))
  }, [cidadeId])

  const atualizar = useCallback(
    (mudar: (atual: EstadoPriorizar) => EstadoPriorizar) => {
      setEstado((atual) => {
        const novo = mudar(atual)
        try {
          sessionStorage.setItem(chave(cidadeId), JSON.stringify(novo))
        } catch {
          // sem armazenamento: continua funcionando, só não lembra
        }
        return novo
      })
    },
    [cidadeId],
  )

  const recomecar = useCallback(() => {
    try {
      sessionStorage.removeItem(chave(cidadeId))
    } catch {
      // idem
    }
    setEstado(ESTADO_INICIAL)
  }, [cidadeId])

  return { estado, atualizar, recomecar }
}
