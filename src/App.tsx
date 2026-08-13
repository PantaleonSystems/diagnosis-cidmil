import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { AppRoutes } from '@/routes'
import { supabaseConfigurado } from '@/lib/supabase'

function App() {
  if (!supabaseConfigurado) return <FaltaConfiguracao />

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
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
          URL e a chave <strong>anon</strong> do seu projeto (Project Settings → API).
          Depois reinicie o <code className="rounded bg-app-bg px-1">npm run dev</code>.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-app-bg p-4 text-xs text-tinta">
          {`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
        </pre>
      </div>
    </div>
  )
}

export default App
