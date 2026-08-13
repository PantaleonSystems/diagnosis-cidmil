import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Marca } from '@/components/layout/Marca'
import { Button, Erro, Field, Input, Splash } from '@/components/ui'

/** Painel esquerdo compartilhado por login e cadastro. */
export function PainelMarca({ children }: { children: ReactNode }) {
  return (
    <div className="hidden flex-col justify-between bg-[linear-gradient(160deg,#0B3D4A_0%,#0A7C93_100%)] p-[60px] text-white lg:flex">
      <div className="w-fit rounded-xl bg-white px-5 py-4">
        <Marca />
      </div>
      {children}
      <div className="text-[12.5px] text-[#9FD4DE]">
        CIIDCMIL · acesso restrito a avaliadores credenciados
      </div>
    </div>
  )
}

export function Login() {
  const { entrar, session, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { de?: string } }

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (loading) return <Splash />
  if (session) return <Navigate to={location.state?.de ?? '/app'} replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await entrar(email.trim(), senha)
      navigate(location.state?.de ?? '/app', { replace: true })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <PainelMarca>
        <div>
          <h2 className="mb-3.5 max-w-[400px] text-3xl tracking-[-0.3px]">
            Plataforma de Diagnóstico das Cidades MIL
          </h2>
          <p className="max-w-[400px] text-[15px] text-[#CDEEF4]">
            Avaliação objetiva e auditável do impacto social em saúde, alinhada ao
            framework da UNESCO para Cidades MIL.
          </p>
        </div>
      </PainelMarca>

      <div className="flex items-center justify-center bg-white p-10">
        <form onSubmit={enviar} className="w-full max-w-[380px]">
          <div className="mb-6 lg:hidden">
            <Marca />
          </div>

          <h1 className="mb-1.5 text-[22px] text-petroleo">Entrar</h1>
          <p className="mb-7 text-sm text-cinza">
            Acesse com suas credenciais institucionais.
          </p>

          <div className="mb-6 flex items-start gap-2.5 rounded-[9px] border border-aviso-borda bg-aviso-bg px-3.5 py-3 text-xs text-aviso-txt">
            <span aria-hidden>🔒</span>
            <span>
              Área restrita. O acesso é concedido individualmente pela coordenação do
              CIIDCMIL.
            </span>
          </div>

          <Erro>{erro}</Erro>

          <Field label="E-mail institucional">
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@ciidcmil.org"
            />
          </Field>

          <Field label="Senha">
            <Input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
            />
          </Field>

          <Button type="submit" disabled={enviando} className="w-full py-3.5">
            {enviando ? 'Entrando…' : 'Acessar o sistema →'}
          </Button>

          <p className="mt-4.5 text-center text-xs text-cinza-cl">
            Ainda não tem conta?{' '}
            <Link to="/signup" className="font-semibold text-ciano-esc hover:underline">
              Solicitar credenciamento
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
