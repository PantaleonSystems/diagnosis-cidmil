import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { MODULO_SAUDE } from '@/data/metricas'

/**
 * Ponte entre o catálogo tipado do front (`src/data/metricas.ts`, usado para
 * renderizar) e as linhas do banco (usadas como chave estrangeira em
 * `respostas`). Os dois nascem do mesmo arquivo — ver scripts/gen-seed.ts —,
 * então aqui só precisamos do de-para número ↔ uuid.
 */
interface CatalogoContextValue {
  idPorNumero: Map<number, string>
  numeroPorId: Map<string, number>
  carregando: boolean
  erro: string | null
}

const CatalogoContext = createContext<CatalogoContextValue | null>(null)

export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [linhas, setLinhas] = useState<{ id: string; numero: number }[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    supabase
      .from('metricas')
      .select('id, numero, pilares!inner(modulo_id)')
      .eq('pilares.modulo_id', MODULO_SAUDE)
      .then(({ data, error }) => {
        if (!vivo) return
        if (error) setErro(error.message)
        else setLinhas((data ?? []) as { id: string; numero: number }[])
        setCarregando(false)
      })
    return () => {
      vivo = false
    }
  }, [])

  const value = useMemo(() => {
    const idPorNumero = new Map<number, string>()
    const numeroPorId = new Map<string, number>()
    for (const l of linhas) {
      idPorNumero.set(l.numero, l.id)
      numeroPorId.set(l.id, l.numero)
    }
    return { idPorNumero, numeroPorId, carregando, erro }
  }, [linhas, carregando, erro])

  return <CatalogoContext value={value}>{children}</CatalogoContext>
}

export function useCatalogo(): CatalogoContextValue {
  const ctx = use(CatalogoContext)
  if (!ctx) throw new Error('useCatalogo precisa estar dentro de <CatalogoProvider>')
  return ctx
}
