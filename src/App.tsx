import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { AppRoutes } from '@/routes'
import { supabaseConfigurado } from '@/lib/supabase'
import { Button, Splash } from '@/components/ui'
import { Marca } from '@/components/layout/Marca'

function App() {
  if (!supabaseConfigurado) return <FaltaConfiguracao />

  return (
    <BrowserRouter>
      <AuthProvider>
        <Sessao />
      </AuthProvider>
    </BrowserRouter>
  )
}

/**
 * A sessão anônima é pré-requisito de tudo: sem ela a RLS devolve listas
 * vazias e as telas pareceriam apenas "sem dados". Melhor segurar aqui e
 * dizer o que houve.
 */
function Sessao() {
  const { loading, erro, tentarNovamente } = useAuth()

  if (loading) return <Splash texto="Abrindo o diagnóstico…" />
  if (erro) return <FalhaDeAcesso mensagem={erro} aoTentar={tentarNovamente} />

  return <AppRoutes />
}

function FalhaDeAcesso({
  mensagem,
  aoTentar,
}: {
  mensagem: string
  aoTentar: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-6">
      <div className="w-full max-w-lg rounded-card border border-linha bg-white p-8 text-center shadow-card">
        <div className="mb-6 flex justify-center">
          <Marca />
        </div>
        <h1 className="mb-3 text-xl text-petroleo">Não foi possível abrir o sistema</h1>
        <p className="mx-auto mb-6 max-w-md text-sm text-cinza">{mensagem}</p>
        <Button onClick={aoTentar}>Tentar novamente</Button>
      </div>
    </div>
  )
}

/** Erro de setup explícito — melhor do que a aplicação quebrar num fetch. */
function FaltaConfiguracao() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-6">
      <div className="max-w-lg rounded-card border border-linha bg-white p-8 shadow-card">
        <h1 className="mb-3 text-xl text-petroleo">Supabase não configurado</h1>
        <p className="mb-4 text-sm text-cinza">
          Copie <code className="rounded bg-app-bg px-1">.env.example</code> para{' '}
          <code className="rounded bg-app-bg px-1">.env.local</code> e preencha com a
          URL e a chave <strong>publishable</strong> do seu projeto (Project Settings →
          API). Depois reinicie o{' '}
          <code className="rounded bg-app-bg px-1">npm run dev</code>.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-app-bg p-4 text-xs text-tinta">
          {`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...`}
        </pre>
      </div>
    </div>
  )
}

export default App
