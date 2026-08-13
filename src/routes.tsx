import { Navigate, Route, Routes } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Dashboard } from '@/pages/Dashboard'
import { Avaliacao } from '@/pages/Avaliacao'
import { Resultados } from '@/pages/Resultados'
import { Plano } from '@/pages/Plano'
import { Cidades } from '@/pages/Cidades'
import { AppShell } from '@/components/layout/AppShell'
import { RequireCredential } from '@/components/auth/RequireCredential'

export function AppRoutes() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* protegidas: exigem sessão E credenciamento */}
      <Route
        path="/app"
        element={
          <RequireCredential>
            <AppShell />
          </RequireCredential>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="avaliacao" element={<Avaliacao />} />
        <Route path="resultados" element={<Resultados />} />
        <Route path="plano" element={<Plano />} />
        <Route path="cidades" element={<Cidades />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
