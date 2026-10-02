import { Topbar } from '@/components/layout/AppShell'
import { PrimeirosPassos } from '@/components/layout/PrimeirosPassos'

/** Estado inicial das telas internas: nenhuma cidade selecionada. */
export function SemCidade() {
  return (
    <>
      <Topbar
        titulo="Bem-vindo ao diagnóstico Cidades MIL"
        sub="O diagnóstico é sempre de uma cidade — comece cadastrando a sua"
      />
      <PrimeirosPassos />
    </>
  )
}
