import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import { Button, Card, Splash } from '@/components/ui'
import { Marca } from '@/components/layout/Marca'

/**
 * Portaria do sistema. Acesso ao /app exige sessão **e** credenciamento —
 * é a mesma regra que a RLS aplica no banco, aqui só para dar uma tela
 * decente em vez de uma lista vazia.
 */
export function RequireCredential({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Splash texto="Verificando credenciamento…" />
  if (!session) return <Navigate to="/login" replace state={{ de: location.pathname }} />
  if (!profile?.credenciado) return <AguardandoCredenciamento />

  return <>{children}</>
}

function AguardandoCredenciamento() {
  const { profile, sair, recarregarPerfil } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-6">
      <Card className="w-full max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <Marca />
        </div>
        <h1 className="mb-3 text-[22px] text-petroleo">Aguardando credenciamento</h1>
        <p className="mx-auto mb-6 max-w-md text-sm text-cinza">
          Sua conta foi criada
          {profile?.nome ? `, ${profile.nome.split(' ')[0]}` : ''}. O acesso à
          plataforma é concedido individualmente pela coordenação do CIIDCMIL. Assim
          que seu credenciamento for aprovado, entre novamente.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => void recarregarPerfil()}>Já fui credenciado</Button>
          <Button variante="ghost" onClick={() => void sair()}>
            Sair
          </Button>
        </div>
      </Card>
    </div>
  )
}
