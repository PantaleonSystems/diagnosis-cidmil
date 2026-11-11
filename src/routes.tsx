import { Navigate, Route, Routes } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'
import { Avaliacao } from '@/pages/Avaliacao'
import { Resultados } from '@/pages/Resultados'
import { Plano } from '@/pages/Plano'
import { Inicio } from '@/pages/Inicio'
import { Rede } from '@/pages/Rede'
import { Conexoes } from '@/pages/Conexoes'
import { AmbienteCidade, RedirecionaCidadeAntiga } from '@/pages/AmbienteCidade'
import { AppShell } from '@/components/layout/AppShell'
import { Galeria } from '@/pages/lab/Galeria'
import { Jornada } from '@/pages/lab/Jornada'

/**
 * BETA: sem rotas de autenticação. "Acessar" leva direto ao dashboard.
 * /login e /signup ficam redirecionando para não quebrar links já enviados.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/app" element={<AppShell />}>
        {/* Início: nenhuma cidade aberta */}
        <Route index element={<Inicio />} />
        <Route path="rede" element={<Rede />} />

        {/* Ambiente de uma cidade */}
        <Route path="cidades/:cidadeId" element={<AmbienteCidade />}>
          <Route index element={<Dashboard />} />
          <Route path="avaliacao" element={<Avaliacao />} />
          <Route path="resultados" element={<Resultados />} />
          <Route path="plano" element={<Plano />} />
          <Route path="conexoes" element={<Conexoes />} />
        </Route>

        {/* links antigos continuam funcionando */}
        <Route path="cidades" element={<Navigate to="/app" replace />} />
        <Route path="avaliacao" element={<RedirecionaCidadeAntiga sub="avaliacao" />} />
        <Route path="resultados" element={<RedirecionaCidadeAntiga sub="resultados" />} />
        <Route path="plano" element={<RedirecionaCidadeAntiga sub="plano" />} />
      </Route>

      {/* Laboratório de design mobile (interno, noindex) */}
      <Route path="/lab" element={<Galeria />} />
      <Route path="/lab/jornada" element={<Jornada />} />

      {/* links antigos continuam funcionando */}
      <Route path="/login" element={<Navigate to="/app" replace />} />
      <Route path="/signup" element={<Navigate to="/app" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
