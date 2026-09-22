import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/**
 * BETA: acesso público, sem tela de login.
 *
 * O visitante não digita nada — o app abre uma sessão anônima do Supabase em
 * segundo plano. Isso mantém a RLS ligada e preserva a autoria (`criado_por`,
 * `avaliador_id`), coisa que liberar o papel `anon` sem sessão destruiria.
 *
 * A sessão fica no localStorage, então a mesma pessoa volta como o mesmo
 * usuário enquanto não limpar o navegador.
 *
 * Para voltar ao acesso credenciado: `git revert` do commit que removeu o
 * login e recriar as policies originais (ver a migration de BETA).
 */
interface AuthContextValue {
  session: Session | null
  /** true enquanto a sessão anônima ainda não foi estabelecida */
  loading: boolean
  /** falha ao alcançar o Supabase — o app não tem como funcionar sem sessão */
  erro: string | null
  tentarNovamente: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let vivo = true

    async function garantirSessao() {
      setErro(null)

      const { data, error } = await supabase.auth.getSession()
      if (!vivo) return

      if (error) {
        setErro(traduzErro(error.message))
        setLoading(false)
        return
      }

      if (data.session) {
        setSession(data.session)
        setLoading(false)
        return
      }

      // primeira visita: cria a sessão anônima
      const { data: nova, error: erroAnon } = await supabase.auth.signInAnonymously()
      if (!vivo) return

      if (erroAnon) {
        setErro(traduzErro(erroAnon.message))
      } else {
        setSession(nova.session)
      }
      setLoading(false)
    }

    void garantirSessao()

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      if (vivo) setSession(s)
    })

    return () => {
      vivo = false
      sub.subscription.unsubscribe()
    }
  }, [tentativa])

  const value = useMemo(
    () => ({
      session,
      loading,
      erro,
      tentarNovamente: () => {
        setLoading(true)
        setTentativa((t) => t + 1)
      },
    }),
    [session, loading, erro],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

/**
 * Distingue serviço fora do ar de erro de configuração.
 *
 * Antes, qualquer falha virava a mesma mensagem genérica e as pessoas achavam
 * que tinham errado a senha quando o Supabase é que estava pausado.
 */
function traduzErro(msg: string): string {
  const m = msg.toLowerCase()
  if (
    m.includes('failed to fetch') ||
    m.includes('networkerror') ||
    m.includes('load failed')
  )
    return 'Não foi possível alcançar o servidor. Verifique sua conexão — se o problema persistir, o serviço pode estar temporariamente indisponível.'
  if (m.includes('anonymous sign-ins are disabled'))
    return 'O acesso anônimo está desligado no Supabase. Habilite em Authentication → Providers → Anonymous.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Muitos acessos em sequência. Aguarde um instante e recarregue a página.'
  return msg
}
