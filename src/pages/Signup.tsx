import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Marca } from '@/components/layout/Marca'
import { PainelMarca } from '@/pages/Login'
import { Button, Erro, Field, Input, Splash } from '@/components/ui'

export function Signup() {
  const { cadastrar, session, loading } = useAuth()

  const [nome, setNome] = useState('')
  const [organizacao, setOrganizacao] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  if (loading) return <Splash />
  if (session && !enviado) return <Navigate to="/app" replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)

    if (senha !== confirmacao) {
      setErro('As senhas não conferem.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter ao menos 6 caracteres.')
      return
    }

    setEnviando(true)
    try {
      await cadastrar({
        nome: nome.trim(),
        organizacao: organizacao.trim(),
        email: email.trim(),
        senha,
      })
      setEnviado(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível criar a conta.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <PainelMarca>
        <div>
          <h2 className="mb-3.5 max-w-[400px] text-3xl tracking-[-0.3px]">
            Solicite seu credenciamento
          </h2>
          <p className="max-w-[400px] text-[15px] text-[#CDEEF4]">
            Cada avaliador é habilitado individualmente pela coordenação. Sua conta fica
            pendente até a aprovação.
          </p>
        </div>
      </PainelMarca>

      <div className="flex items-center justify-center bg-white p-10">
        {enviado ? (
          <div className="w-full max-w-[380px] text-center">
            <div className="mb-6 flex justify-center">
              <Marca />
            </div>
            <h1 className="mb-3 text-[22px] text-petroleo">Conta criada</h1>
            <p className="mb-7 text-sm text-cinza">
              Sua solicitação foi registrada. A coordenação do CIIDCMIL avaliará o
              credenciamento — assim que for aprovado, você poderá acessar a plataforma.
            </p>
            <Link to="/login">
              <Button className="w-full">Ir para o login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="w-full max-w-[380px]">
            <div className="mb-6 lg:hidden">
              <Marca />
            </div>

            <h1 className="mb-1.5 text-[22px] text-petroleo">Criar conta</h1>
            <p className="mb-7 text-sm text-cinza">
              A conta fica pendente até o credenciamento pela coordenação.
            </p>

            <Erro>{erro}</Erro>

            <Field label="Nome completo">
              <Input
                required
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
              />
            </Field>

            <Field label="Organização">
              <Input
                required
                autoComplete="organization"
                value={organizacao}
                onChange={(e) => setOrganizacao(e.target.value)}
                placeholder="Instituição ou secretaria"
              />
            </Field>

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

            <Field label="Senha" hint="Mínimo de 6 caracteres.">
              <Input
                type="password"
                required
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </Field>

            <Field label="Confirmar senha">
              <Input
                type="password"
                required
                autoComplete="new-password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
              />
            </Field>

            <Button type="submit" disabled={enviando} className="w-full py-3.5">
              {enviando ? 'Criando conta…' : 'Solicitar credenciamento'}
            </Button>

            <p className="mt-4.5 text-center text-xs text-cinza-cl">
              Já tem conta?{' '}
              <Link to="/login" className="font-semibold text-ciano-esc hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
