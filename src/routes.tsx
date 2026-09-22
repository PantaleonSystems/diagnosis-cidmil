import { Navigate, Route, Routes } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'
import { Avaliacao } from '@/pages/Avaliacao'
import { Resultados } from '@/pages/Resultados'
import { Plano } from '@/pages/Plano'
import { Cidades } from '@/pages/Cidades'
import { AppShell } from '@/components/layout/AppShell'

/**
 * BETA: sem rotas de autenticação. "Acessar" leva direto ao dashboard.
 * /login e /signup ficam redirecionando para não quebrar links já enviados.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/app" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="avaliacao" element={<Avaliacao />} />
        <Route path="resultados" element={<Resultados />} />
        <Route path="plano" element={<Plano />} />
        <Route path="cidades" element={<Cidades />} />
      </Route>

      {/* links antigos continuam funcionando */}
      <Route path="/login" element={<Navigate to="/app" replace />} />
      <Route path="/signup" element={<Navigate to="/app" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
