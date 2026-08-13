import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { Button, Vazio } from '@/components/ui'

/** Estado inicial de todas as telas internas: nenhuma cidade selecionada. */
export function SemCidade() {
  const navigate = useNavigate()
  return (
    <>
      <Topbar
        titulo="Nenhuma cidade selecionada"
        sub="O diagnóstico é sempre de uma cidade — escolha ou cadastre uma para começar"
      />
      <Vazio
        titulo="Comece cadastrando uma cidade"
        descricao="A avaliação do módulo Saúde pertence a uma cidade. Cadastre a primeira para abrir o rascunho e iniciar a coleta de dados."
        acao={<Button onClick={() => navigate('/app/cidades')}>Ir para Cidades</Button>}
      />
    </>
  )
}
