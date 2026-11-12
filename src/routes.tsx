import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Landing } from '@/pages/Landing'

// A landing é a primeira tela e abre direto; o resto carrega sob demanda,
// para quem chega pelo celular baixar só o que vai usar.
const AreaDoApp = lazy(() => import('@/pages/AreaDoApp'))
const Inicio = lazy(() => import('@/pages/Inicio').then((m) => ({ default: m.Inicio })))
const Rede = lazy(() => import('@/pages/Rede').then((m) => ({ default: m.Rede })))
const AmbienteCidade = lazy(() => import('@/pages/AmbienteCidade').then((m) => ({ default: m.AmbienteCidade })))
const RedirecionaCidadeAntiga = lazy(() => import('@/pages/AmbienteCidade').then((m) => ({ default: m.RedirecionaCidadeAntiga })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Dados = lazy(() => import('@/pages/Dados').then((m) => ({ default: m.Dados })))
const Avaliacao = lazy(() => import('@/pages/Avaliacao').then((m) => ({ default: m.Avaliacao })))
const Resultados = lazy(() => import('@/pages/Resultados').then((m) => ({ default: m.Resultados })))
const Plano = lazy(() => import('@/pages/Plano').then((m) => ({ default: m.Plano })))
const Conexoes = lazy(() => import('@/pages/Conexoes').then((m) => ({ default: m.Conexoes })))
const Galeria = lazy(() => import('@/pages/lab/Galeria').then((m) => ({ default: m.Galeria })))
const Jornada = lazy(() => import('@/pages/lab/Jornada').then((m) => ({ default: m.Jornada })))

/**
 * BETA: sem rotas de autenticação. "Acessar" leva direto ao dashboard.
 * /login e /signup ficam redirecionando para não quebrar links já enviados.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/app" element={<AreaDoApp />}>
        {/* Início: nenhuma cidade aberta */}
        <Route index element={<Inicio />} />
        <Route path="rede" element={<Rede />} />

        {/* Ambiente de uma cidade */}
        <Route path="cidades/:cidadeId" element={<AmbienteCidade />}>
          <Route index element={<Dashboard />} />
          <Route path="dados" element={<Dados />} />
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
