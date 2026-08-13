import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/db'

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  entrar: (email: string, senha: string) => Promise<void>
  cadastrar: (dados: {
    nome: string
    organizacao: string
    email: string
    senha: string
  }) => Promise<void>
  sair: () => Promise<void>
  recarregarPerfil: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function buscarPerfil(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Falha ao carregar o perfil:', error.message)
    return null
  }
  return data as Profile | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let vivo = true

    const aplicar = async (s: Session | null) => {
      if (!vivo) return
      setSession(s)
      setProfile(s ? await buscarPerfil(s.user.id) : null)
      if (vivo) setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => aplicar(data.session))

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      // onAuthStateChange roda dentro do lock do SDK: não fazer await aqui.
      void aplicar(s)
    })

    return () => {
      vivo = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const recarregarPerfil = useCallback(async () => {
    if (!session) return
    setProfile(await buscarPerfil(session.user.id))
  }, [session])

  const entrar = useCallback(async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })
    if (error) throw new Error(traduzErro(error.message))
  }, [])

  const cadastrar = useCallback(
    async ({
      nome,
      organizacao,
      email,
      senha,
    }: {
      nome: string
      organizacao: string
      email: string
      senha: string
    }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        // lido pelo trigger handle_new_user() para preencher profiles
        options: { data: { nome, organizacao } },
      })
      if (error) throw new Error(traduzErro(error.message))
    },
    [],
  )

  const sair = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({ session, profile, loading, entrar, cadastrar, sair, recarregarPerfil }),
    [session, profile, loading, entrar, cadastrar, sair, recarregarPerfil],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

/** Mensagens do Supabase Auth em português, para o avaliador entender. */
function traduzErro(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'Confirme o e-mail antes de entrar.'
  if (m.includes('user already registered'))
    return 'Já existe uma conta com este e-mail.'
  if (m.includes('password should be at least'))
    return 'A senha precisa ter ao menos 6 caracteres.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Muitas tentativas. Aguarde um instante e tente de novo.'
  return msg
}
