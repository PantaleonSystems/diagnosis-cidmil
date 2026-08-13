import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCatalogo } from '@/lib/catalogo'
import type { Metrica } from '@/data/metricas'
import type { DadosBrutos, Nota } from '@/lib/calculos'
import type { Resposta } from '@/types/db'

export interface RespostaLocal {
  dadosBrutos: DadosBrutos
  nota: Nota
}

/** Respostas indexadas pelo número da métrica. */
export type RespostasPorMetrica = Record<number, RespostaLocal>

export type EstadoSalvamento = 'ocioso' | 'salvando' | 'salvo' | 'erro'

const DEBOUNCE_MS = 600

/**
 * Carrega e persiste as respostas de uma avaliação.
 *
 * A UI atualiza na hora (otimista) e o banco recebe um upsert com debounce —
 * digitar num campo numérico não dispara uma requisição por tecla.
 */
export function useRespostas(avaliacaoId: string | null) {
  const { idPorNumero, numeroPorId, carregando: carregandoCatalogo } = useCatalogo()
  const [respostas, setRespostas] = useState<RespostasPorMetrica>({})
  const [carregando, setCarregando] = useState(true)
  const [estado, setEstado] = useState<EstadoSalvamento>('ocioso')
  const [erro, setErro] = useState<string | null>(null)

  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const pendentes = useRef(0)

  // Carga inicial
  useEffect(() => {
    if (!avaliacaoId || carregandoCatalogo) return
    let vivo = true
    setCarregando(true)

    supabase
      .from('respostas')
      .select('*')
      .eq('avaliacao_id', avaliacaoId)
      .then(({ data, error }) => {
        if (!vivo) return
        if (error) {
          setErro(error.message)
        } else {
          const mapa: RespostasPorMetrica = {}
          for (const r of (data ?? []) as Resposta[]) {
            const numero = numeroPorId.get(r.metrica_id)
            if (numero !== undefined) {
              mapa[numero] = { dadosBrutos: r.dados_brutos ?? {}, nota: r.nota as Nota }
            }
          }
          setRespostas(mapa)
        }
        setCarregando(false)
      })

    return () => {
      vivo = false
    }
  }, [avaliacaoId, carregandoCatalogo, numeroPorId])

  // Limpa timers pendentes ao desmontar
  useEffect(() => {
    const mapa = timers.current
    return () => {
      for (const t of mapa.values()) clearTimeout(t)
      mapa.clear()
    }
  }, [])

  const persistir = useCallback(
    async (metrica: Metrica, valor: RespostaLocal) => {
      if (!avaliacaoId) return
      const metricaId = idPorNumero.get(metrica.numero)
      if (!metricaId) {
        setErro(
          `Métrica ${metrica.numero} não existe no banco. Rode o seed do catálogo.`,
        )
        setEstado('erro')
        return
      }

      pendentes.current += 1
      setEstado('salvando')

      const { error } = await supabase.from('respostas').upsert(
        {
          avaliacao_id: avaliacaoId,
          metrica_id: metricaId,
          dados_brutos: valor.dadosBrutos,
          nota: valor.nota,
        },
        { onConflict: 'avaliacao_id,metrica_id' },
      )

      pendentes.current -= 1
      if (error) {
        setErro(error.message)
        setEstado('erro')
      } else if (pendentes.current === 0) {
        setErro(null)
        setEstado('salvo')
      }
    },
    [avaliacaoId, idPorNumero],
  )

  /** Atualiza a resposta na tela e agenda a gravação. */
  const registrar = useCallback(
    (metrica: Metrica, valor: RespostaLocal, imediato = false) => {
      setRespostas((atual) => ({ ...atual, [metrica.numero]: valor }))

      const anterior = timers.current.get(metrica.numero)
      if (anterior) clearTimeout(anterior)

      if (imediato) {
        void persistir(metrica, valor)
        return
      }

      timers.current.set(
        metrica.numero,
        setTimeout(() => {
          timers.current.delete(metrica.numero)
          void persistir(metrica, valor)
        }, DEBOUNCE_MS),
      )
    },
    [persistir],
  )

  const notas = useCallback(() => {
    const mapa: Record<number, Nota> = {}
    for (const [numero, r] of Object.entries(respostas)) mapa[Number(numero)] = r.nota
    return mapa
  }, [respostas])

  return {
    respostas,
    notas: notas(),
    registrar,
    carregando: carregando || carregandoCatalogo,
    estado,
    erro,
  }
}
