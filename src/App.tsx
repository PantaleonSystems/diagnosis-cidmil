import { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes'
import { Splash } from '@/components/ui'

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Splash texto="Carregando…" />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  )
}

export default App
