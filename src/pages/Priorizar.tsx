import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topbar } from '@/components/layout/AppShell'
import { Chip } from '@/components/mobile/Chip'
import { Conclusoes } from '@/components/priorizar/Conclusoes'
import { Decisao } from '@/components/priorizar/Decisao'
import { Prioridade } from '@/components/priorizar/Prioridade'
import { Simulador } from '@/components/priorizar/Simulador'
import { Aviso, Button, Splash, Vazio } from '@/components/ui'
import { useCidades } from '@/lib/cidadeAtiva'
import { useEstadoPriorizar } from '@/lib/estadoPriorizar'
import { acoesPossiveis, conclusoes, simular } from '@/lib/priorizar'
import { useRespostas } from '@/lib/respostas'

const PASSOS = ['Conclusões', 'E se fizermos', 'O que primeiro', 'Decisão'] as const

/**
 * O que fazer primeiro: da leitura dos números à decisão.
 * Versão de teste: o que o consultor decide fica só nesta aba, ainda não vai para o banco.
 */
export function Priorizar() {
  const navigate = useNavigate()
  const { cidadeAtiva, avaliacaoAtiva, caminhoCidade } = useCidades()
  const { respostas, carregando } = useRespostas(avaliacaoAtiva?.id ?? null)
  const { estado, atualizar, recomecar } = useEstadoPriorizar(cidadeAtiva?.id ?? 'sem-cidade')
  const [passo, setPasso] = useState(0)

  const [verTodas, setVerTodas] = useState(false)

  const lista = useMemo(() => conclusoes(respostas), [respostas])
  const acoesPadrao = useMemo(() => acoesPossiveis(respostas), [respostas])
  const todasAcoes = useMemo(() => acoesPossiveis(respostas, 500, { semTeto: true }), [respostas])

  // o que o consultor confirma no passo 1 define com o que os passos seguintes trabalham
  const idsLiberados = useMemo(
    () => [...new Set(lista.filter((c) => estado.conclusoes[c.id] === 'confirmada').flatMap((c) => c.acoes))],
    [lista, estado.conclusoes],
  )
  const projecao = useMemo(
    () => (idsLiberados.length > 0 ? simular(respostas, idsLiberados) : null),
    [respostas, idsLiberados],
  )
  const filtrado = idsLiberados.length > 0 && !verTodas
  const acoes = useMemo(
    () => (filtrado ? todasAcoes.filter((a) => idsLiberados.includes(a.id)) : acoesPadrao),
    [filtrado, todasAcoes, idsLiberados, acoesPadrao],
  )

  if (!cidadeAtiva) return null
  if (carregando) return <Splash texto="Lendo os resultados…" />

  if (Object.keys(respostas).length === 0) {
    return (
      <>
        <Topbar titulo="O que fazer primeiro" sub={cidadeAtiva.nome} />
        <Vazio
          titulo="Ainda não dá para priorizar"
          descricao="Preencha as métricas da avaliação. Com as notas, o sistema sugere o que fazer primeiro."
          acao={<Button onClick={() => navigate(caminhoCidade('avaliacao'))}>Ir para a avaliação</Button>}
        />
      </>
    )
  }

  // sem escolha ainda, o simulador já começa com as ações que ajudam a liberar a Regra de Ouro
  const idsDisponiveis = new Set(acoes.map((a) => a.id))
  const marcadas = (estado.marcadas ?? acoes.filter((a) => a.ajudaDestravar).map((a) => a.id)).filter((id) =>
    idsDisponiveis.has(id),
  )

  return (
    <>
      <Topbar
        titulo="O que fazer primeiro"
        sub={`${cidadeAtiva.nome} · da leitura dos números à decisão`}
        acao={
          <Button variante="ghost" className="alvo" onClick={recomecar}>
            Recomeçar
          </Button>
        }
      />

      <div className="mb-4">
        <Aviso>
          Versão de teste: o que você decidir aqui fica só nesta aba e ainda não é gravado no sistema.
        </Aviso>
      </div>

      <div
        className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0"
        role="group"
        aria-label="Passos"
      >
        {PASSOS.map((nome, i) => (
          <Chip key={nome} ativo={passo === i} onClick={() => setPasso(i)}>
            {i + 1} · {nome}
          </Chip>
        ))}
      </div>

      <div className="max-w-2xl">
        {passo === 0 && (
          <Conclusoes
            conclusoes={lista}
            estado={estado}
            atualizar={atualizar}
            idsLiberados={idsLiberados}
            projecao={projecao}
          />
        )}
        {passo > 0 && idsLiberados.length > 0 && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-linha bg-marca-fundo px-3 py-2.5 text-[12.5px] leading-snug text-noite">
            <span>
              {filtrado
                ? `Mostrando as ${acoes.length} ações das conclusões que você confirmou.`
                : 'Mostrando todas as ações possíveis, não só as das conclusões confirmadas.'}
            </span>
            <button
              type="button"
              className="alvo shrink-0 font-bold text-marca-escura"
              onClick={() => setVerTodas(!verTodas)}
            >
              {filtrado ? 'Ver todas' : 'Só as confirmadas'}
            </button>
          </div>
        )}
        {passo === 1 && (
          <Simulador
            respostas={respostas}
            acoes={acoes}
            marcadas={marcadas}
            alternar={(id) =>
              atualizar((e) => {
                const atual = e.marcadas ?? marcadas
                return {
                  ...e,
                  marcadas: atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
                }
              })
            }
          />
        )}
        {passo === 2 && (
          <Prioridade
            acoes={acoes}
            gut={estado.gut}
            mudar={(id, valor) =>
              atualizar((e) => {
                const gut = { ...e.gut }
                if (valor) gut[id] = valor
                else delete gut[id]
                return { ...e, gut }
              })
            }
          />
        )}
        {passo === 3 && (
          <Decisao
            acoes={acoes}
            gut={estado.gut}
            decisoes={estado.decisoes}
            mudar={(id, parcial, base) =>
              atualizar((e) => ({
                ...e,
                decisoes: { ...e.decisoes, [id]: { ...base, ...e.decisoes[id], ...parcial } },
              }))
            }
          />
        )}

        <div className="mt-6 flex gap-3 pb-4">
          {passo > 0 && (
            <Button variante="ghost" className="alvo flex-1" onClick={() => setPasso(passo - 1)}>
              Voltar
            </Button>
          )}
          {passo < PASSOS.length - 1 && (
            <Button className="alvo flex-[2]" onClick={() => setPasso(passo + 1)}>
              Próximo: {PASSOS[passo + 1]}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
