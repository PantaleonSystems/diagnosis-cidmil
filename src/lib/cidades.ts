import { normalizar } from '@/lib/localidades'

/**
 * Cidade de demonstração: usa o campo `demonstracao` do banco. Sem o campo
 * (dados antigos em memória), cai no reconhecimento pelo nome.
 */
export const ehDemonstracao = (c: { nome: string; demonstracao?: boolean }): boolean =>
  c.demonstracao ?? /demonstra[cç][aã]o/i.test(c.nome)

/** Nome sem o sufixo "(demonstração)". */
export const nomeCurto = (c: { nome: string }): string =>
  c.nome.replace(/\s*\(demonstra[cç][aã]o\)\s*$/i, '').trim()

/** 0–1: quão parecidos são dois índices (1 = iguais; 0 = 1,2 pontos ou mais de distância). */
export const similaridade = (a: number, b: number): number => Math.max(0, 1 - Math.abs(a - b) / 1.2)

/** UF só quando é uma sigla de verdade (cidades antigas podem ter "--" ou vazio). */
export const ufVisivel = (c: { uf: string }): string => (/^[A-Za-z]{2}$/.test(c.uf.trim()) ? c.uf.trim().toUpperCase() : '')

/** Texto de busca de uma cidade (nome + UF), sem acento. */
export const textoBusca = (c: { nome: string; uf: string }): string => normalizar(`${c.nome} ${c.uf}`)
