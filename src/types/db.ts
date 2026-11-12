/**
 * Tipos das tabelas do Supabase (espelham supabase/migrations/*_schema.sql).
 *
 * Quando o schema mudar, atualize aqui — ou gere com
 * `npx supabase gen types typescript --linked > src/types/db.ts`.
 */
import type { TipoMetrica } from '@/data/metricas'

export interface Profile {
  id: string
  nome: string
  organizacao: string
  papel: 'avaliador' | 'admin'
  credenciado: boolean
  created_at: string
  updated_at: string
}

export interface Modulo {
  id: string
  nome: string
  icone: string
  ativo: boolean
  ordem: number
}

export interface PilarRow {
  id: string
  modulo_id: string
  numero: number
  nome: string
  descricao: string
  peso: number
  cor: string
  central: string
}

export interface MetricaRow {
  id: string
  pilar_id: string
  numero: number
  titulo: string
  tipo: TipoMetrica
  config: Record<string, unknown>
  fonte: string
  dica: string
  ordem: number
}

export interface Cidade {
  id: string
  nome: string
  uf: string
  pais: string
  populacao: number | null
  /** código IBGE de 7 dígitos (municípios brasileiros); único quando preenchido */
  codigo_ibge: string | null
  /** cidade de demonstração (dados de exemplo) */
  demonstracao: boolean
  criado_por: string
  created_at: string
  updated_at: string
}

export type StatusAvaliacao = 'rascunho' | 'concluida'

export interface Avaliacao {
  id: string
  cidade_id: string
  modulo_id: string
  ano: number
  status: StatusAvaliacao
  isps: number | null
  avaliador_id: string
  concluida_em: string | null
  created_at: string
  updated_at: string
}

export interface Resposta {
  id: string
  avaliacao_id: string
  metrica_id: string
  dados_brutos: Record<string, number>
  nota: number
  observacao: string
  /** de onde veio o dado: preenchido por uma pessoa ou coletado automaticamente */
  origem: 'declarado' | 'automatico'
  created_at: string
  updated_at: string
}

/** Cidade com a avaliação mais recente, para a lista de cidades. */
export interface CidadeComAvaliacao extends Cidade {
  avaliacoes: Pick<Avaliacao, 'id' | 'ano' | 'status' | 'isps' | 'updated_at'>[]
}
