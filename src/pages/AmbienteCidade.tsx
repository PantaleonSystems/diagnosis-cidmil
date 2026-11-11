import { Link, Navigate, Outlet } from 'react-router-dom'
import { caminhoDaCidade, useCidades } from '@/lib/cidadeAtiva'
import { ehDemonstracao } from '@/lib/cidades'
import { Button } from '@/components/ui'

/** Layout de /app/cidades/:id: só entra se a cidade existe. */
export function AmbienteCidade() {
  const { cidadeAtiva } = useCidades()

  if (!cidadeAtiva) {
    return (
      <div className="mx-auto max-w-md pt-16 text-center">
        <h1 className="text-titulo font-extrabold text-petroleo">Cidade não encontrada</h1>
        <p className="mt-2 text-corpo text-cinza">
          Essa cidade não existe mais ou o link está incorreto. Volte para a lista e escolha de novo.
        </p>
        <Link to="/app">
          <Button className="alvo mt-6">Ver todas as cidades</Button>
        </Link>
      </div>
    )
  }
  return <Outlet />
}

/** Links antigos (/app/avaliacao, /app/resultados, /app/plano) levam à última cidade aberta. */
export function RedirecionaCidadeAntiga({ sub }: { sub: string }) {
  const { ultimaVisitada, cidades } = useCidades()
  const alvo = ultimaVisitada ?? cidades.find((c) => !ehDemonstracao(c)) ?? cidades[0]
  return <Navigate to={alvo ? caminhoDaCidade(alvo.id, sub) : '/app'} replace />
}
