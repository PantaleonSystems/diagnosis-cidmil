# Metodologia de coleta — Módulo Saúde

> **Status: proposta.** Este documento descreve *como pretendemos* obter cada dado das
> 43 métricas (63–105). As fontes citadas são pontos de partida conhecidos, **não
> verificados campo a campo** — cada uma precisa ser validada antes de virar
> procedimento oficial. Nenhum número aqui é dado real de município.

Serve a três propósitos: orientar o avaliador humano hoje, dar rastreabilidade ao
diagnóstico (de onde veio cada nota), e mapear o que pode ser automatizado depois.

---

## 1. O teto realista da automação

O framework tem duas naturezas de métrica, e elas se automatizam de forma muito
diferente:

| Natureza | Qtd | O que é | Automação |
|---|---:|---|---|
| **Numérica** (percentual, densidade, faixa) | **15** | Contagens objetivas: quantos profissionais, quantos bairros, quantas estações | Viável — é dado tabular |
| **Régua 0–4** | **28** | Maturidade institucional: *existe plano? é atualizado? tem simulação?* | Não raspável — exige evidência + julgamento |

**Só 35% das métricas são candidatas a robô.** As 28 réguas descrevem qualidade de
processo, não quantidade de coisas. Nenhum crawler decide se um plano anticrise é
"detalhado por cenário, com recursos e testes" ou apenas "atualizado, com fluxos, mas
sem simulações" — isso é leitura de documento com critério.

O que a automação pode fazer pelas réguas é diferente e ainda assim valioso: **reunir a
evidência** (baixar o plano do diário oficial, localizar a ata, achar o organograma) para
que o avaliador julgue em minutos em vez de horas.

## 2. Níveis de obtenção

Cada métrica recebe um nível, que indica o esforço e o caminho de automação:

| Nível | Significado | Caminho |
|:---:|---|---|
| **A** | Base pública estruturada | API / download direto. Automatizável primeiro. |
| **B** | Público, mas não estruturado | Diário oficial, portais, atas em PDF. Precisa de raspagem + extração. |
| **C** | Existe, mas fechado | Ofício à secretaria ou pedido via LAI (Lei 12.527/2011). Não automatizável sem convênio. |
| **D** | Não existe como registro | Entrevista, visita, análise documental. Irredutivelmente humano. |

## 3. Fontes recorrentes

Referências que aparecem em várias métricas. **Confirmar disponibilidade e formato antes
de depender de qualquer uma:**

- **CNES** — Cadastro Nacional de Estabelecimentos de Saúde (DATASUS). Unidades, leitos,
  equipamentos e profissionais por município.
- **DATASUS / TabNet** — séries epidemiológicas e de produção assistencial.
- **IBGE** — população, malha de setores censitários (base para tudo que é "por bairro"
  ou "por 10 mil habitantes").
- **SIOPS** — orçamento e gasto público em saúde.
- **Portal da Transparência municipal** e **Diário Oficial** — atos, contratos, planos.
- **Atas do Conselho Municipal de Saúde** — pauta, frequência, composição.
- **Dados abertos CNPJ (Receita Federal)** — empresas por CNAE, para métricas de startups.
- **Órgão ambiental estadual** (ex.: CETESB em SP) — licenciamento e monitoramento do ar.
- **LAI** — quando nada disso cobre, o pedido formal é o caminho. Prazo legal de 20 dias,
  prorrogável por 10.

---

## 4. Pilar 1 — Governança Participativa e Transparência

Peso 0,35 · 12 métricas · **é o pilar da Regra de Ouro** (média < 2,0 trava a cidade no
Nível 2), então é onde o rigor da coleta mais importa.

| Nº | Métrica | Dado necessário | Onde buscar | Nível |
|---:|---|---|---|:---:|
| 101 | Participação nas decisões | Nº de reuniões do Conselho no ano; quantas com pauta de origem comunitária | Atas do Conselho Municipal de Saúde (Diário Oficial ou secretaria executiva) | **B** |
| 99 | Comitês de bioética ativos | Contagem de comitês em atuação | Registro CEP/CONEP na Plataforma Brasil; confirmar atividade com a instituição | **B** |
| 100 | Registro seguro e integrado | Existência e maturidade do prontuário eletrônico | Contratos de TI no portal de transparência + entrevista com a TI da secretaria | **C** |
| 75 | Plano anticrise | Existência, data de atualização, se há simulações | Diário Oficial; Plano Municipal de Saúde; Plano de Contingência | **B** |
| 76 | Canal entre instituições | Existência e adesão a plataforma comum | Entrevista com a secretaria | **C** |
| 78 | Mapa de doações | Existência de cadastro de parceiros | Portal da transparência; secretaria | **C** |
| 84 | Canal oficial entre vinculadas | Formalização e adesão | Entrevista com a secretaria | **C** |
| 85 | Canal com a população | Existência de ouvidoria, canal digital, tempo de resposta | Site da prefeitura; Ouvidoria SUS; teste próprio de tempo de resposta | **B** |
| 102 | Cobertura de UBS por bairro | Nº de bairros; quantos com UBS/hospital | **CNES** (unidades georreferenciadas) × **IBGE** (setores censitários) | **A** |
| 103 | Acessibilidade | Barreiras física, econômica e informacional | Visita às unidades; laudos NBR 9050 | **D** |
| 104 | Aceitabilidade | Protocolos de humanização, respeito cultural | Análise documental + entrevista | **D** |
| 105 | Qualidade (ONU) | Insumos, pessoal, saneamento, certificações | CNES (equipes) + certificações ONA/JCI + inspeção sanitária | **C** |

## 5. Pilar 2 — Engajamento Comunitário e Cocriação

Peso 0,25 · 9 métricas

| Nº | Métrica | Dado necessário | Onde buscar | Nível |
|---:|---|---|---|:---:|
| 96 | Associações na coleta | Nº de bairros; quantos com associação ativa | Cadastro de entidades da prefeitura; conselhos locais | **C** |
| 64 | Responsabilidade social | Total de instituições; quantas com projeto p/ vulneráveis | CNES (denominador) + relatórios de gestão | **C** |
| 74 | Pesquisa epidemiológica | Regularidade e granularidade da coleta | Relatórios da vigilância epidemiológica | **B** |
| 86 | Medicina preventiva | Frequência das ações comunitárias | Programação da Atenção Básica; e-SUS APS | **C** |
| 87 | Controle de assintomáticos | Existência de rastreamento ativo | Protocolos da vigilância | **C** |
| 93 | Pesquisa com IA/tecnologia | Ferramentas em uso na coleta | Entrevista com a vigilância | **D** |
| 94 | Jogos e gamificação | Iniciativas em uso regular | Entrevista; busca em comunicação institucional | **D** |
| 97 | Inovações da cidade | Contagem de inovações registradas | INPI; editais municipais de inovação; incubadoras locais | **B** |
| 98 | Inovações com tech emergente | Quantas usam IA/IoT/blockchain/biotec | Mesma base da 97, com classificação manual | **B** |

## 6. Pilar 3 — Comunicação, Letramento MIL e Prevenção

Peso 0,20 · 7 métricas

| Nº | Métrica | Dado necessário | Onde buscar | Nível |
|---:|---|---|---|:---:|
| 63 | Campanhas preventivas | Total de instituições; quantas com campanha estruturada | CNES (denominador) + comunicação da secretaria | **C** |
| 70 | Profissionais capacitados em MIL | Total de profissionais; capacitados nos últimos 2 anos | **CNES** (denominador) + RH/Educação Permanente da secretaria (numerador) | **C** |
| 71 | Oferta de alimentos saudáveis | Diversidade e incentivo público | Programas de segurança alimentar; feiras municipais | **C** |
| 72 | Sistema contra desinformação | Existência de monitoramento e resposta | Entrevista com a comunicação da secretaria | **D** |
| 83 | Manuais de saúde preventiva | Existência, atualidade, formatos | Site da prefeitura; unidades de saúde | **B** |
| 89 | Manuais de saúde mental | Existência e divulgação | Idem 83; CAPS | **B** |
| 95 | Acesso à internet e saúde online | % da população com acesso e uso ativo | **IBGE** (PNAD Contínua TIC, recorte municipal quando houver) + uso do sistema de agendamento | **A/C** |

> A métrica 70 é o exemplo canônico do cálculo cego: 120 capacitados em 500 profissionais
> = 24% → nota 1. O denominador é público (CNES); o numerador exige a secretaria.

## 7. Pilar 4 — Infraestrutura, Inovação e Acesso Equitativo

Peso 0,15 · 11 métricas — **o pilar mais automatizável**, com 6 métricas numéricas.

| Nº | Métrica | Dado necessário | Onde buscar | Nível |
|---:|---|---|---|:---:|
| 65 | Espaços de atividade física | População; nº de espaços | **IBGE** (população) + cadastro da secretaria de esportes ou **OpenStreetMap** | **A/B** |
| 66 | Espaços esportivos gratuitos | Total de espaços; quantos gratuitos | Secretaria de esportes | **C** |
| 67 | Medicamentos gratuitos | Amplitude da farmácia básica | REMUME municipal (relação de medicamentos) | **B** |
| 68 | Startups de saúde | Contagem | **Dados abertos CNPJ** por CNAE + associações de startups | **B** |
| 69 | Startups de alimentação | Contagem | Idem 68 | **B** |
| 79 | IA/blockchain no rastreio | Maturidade tecnológica da cadeia | Contratos de TI; entrevista | **C** |
| 81 | Pesquisa interconectada | Parcerias nacionais/internacionais | Currículo Lattes de grupos locais; convênios publicados | **B** |
| 82 | Controle de poluição em fábricas | Total de fábricas; quantas com controle | **Órgão ambiental estadual** (licenças) + CNPJ por CNAE industrial | **B** |
| 90 | Resíduos sanitários | Maturidade do PGRSS | Plano de Gerenciamento de Resíduos; contratos de coleta | **B** |
| 91 | Estações de medição do ar | Contagem | Rede estadual de monitoramento da qualidade do ar | **A** |
| 92 | Atenção pós-epidemia | Existência de acompanhamento longitudinal | Protocolos assistenciais; entrevista | **C** |

## 8. Pilar 5 — Planejamento, Monitoramento e Impacto

Peso 0,05 · 4 métricas — todas de régua.

| Nº | Métrica | Dado necessário | Onde buscar | Nível |
|---:|---|---|---|:---:|
| 73 | Processamento integrado | Grau de interoperabilidade dos sistemas | Entrevista com a TI; contratos | **C** |
| 77 | Integração hospital–comunidade | Compartilhamento de dados entre níveis | Entrevista; arquitetura de sistemas | **C** |
| 80 | Planejamento epidemiológico | Existência e detalhe do plano preventivo | **Plano Municipal de Saúde** (obrigatório, público) | **B** |
| 88 | Redes neurais no diagnóstico | Estágio de adoção de IA | Entrevista; contratos de TI | **D** |

---

## 9. Distribuição por nível

| Nível | Métricas | Leitura |
|:---:|---:|---|
| **A** — base estruturada | ~3 | Automatizar primeiro: 102, 91, 65 (parcial) |
| **B** — público não estruturado | ~17 | Onde a raspagem tem maior retorno |
| **C** — via secretaria / LAI | ~17 | Depende de relação institucional, não de tecnologia |
| **D** — campo | ~6 | Sempre humano |

A conclusão prática: **o gargalo não é técnico, é institucional.** Cerca de 40% das
métricas dependem de dado que a prefeitura tem mas não publica. Um convênio de acesso com
a secretaria destrava mais métricas do que qualquer robô.

## 10. Roadmap de automação

**Fase 1 — Denominadores automáticos.** CNES e IBGE resolvem a metade de baixo de várias
frações (total de profissionais, de instituições, de bairros, população). O avaliador só
informa o numerador. Ganho imediato, risco baixo.

**Fase 2 — Coleta assistida das réguas.** Robô que localiza e anexa a evidência (plano no
diário oficial, ata do conselho, REMUME) ao card da métrica. Não decide a nota — reduz o
tempo de busca. É aqui que está o maior ganho de produtividade.

**Fase 3 — Raspagem dos níveis B.** Diário Oficial, portal da transparência, dados abertos
CNPJ. Exige extração de texto e classificação; sujeito a mudança de layout, então precisa
de monitoramento.

**Fase 4 — Convênio de dados.** Integração direta com a secretaria para os níveis C. É o
que mais destrava, e é negociação, não engenharia.

## 11. Como isso vira código

A tabela `metricas` já tem a coluna **`fonte`**, hoje vazia. O texto da coluna "Onde
buscar" deste documento deve populá-la, para que a metodologia apareça no card de cada
métrica na tela de Avaliação — o avaliador lê onde buscar o dado sem sair da tela.

O caminho: acrescentar `fonte` e `nivelObtencao` a cada métrica em
[`src/data/metricas.ts`](../src/data/metricas.ts), rodar `npm run seed:gen` e aplicar com
`npx supabase db push`. Fonte única, sem divergência entre documento, banco e interface.

---

## Pendências

- [ ] Validar cada fonte citada — disponibilidade, formato, recorte municipal
- [ ] Confirmar se a PNAD TIC tem desagregação municipal utilizável (métrica 95)
- [ ] Definir a janela temporal padrão (ano de referência) para cada dado
- [ ] Escrever o protocolo de evidência das réguas: que documento sustenta cada nível
- [ ] Popular `metricas.fonte` a partir deste documento
