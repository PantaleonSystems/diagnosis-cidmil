# Landing: hero com notícias, demonstração e blocos visuais · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a hero por um carrossel de notícias verificadas que mostra que a transformação das cidades "é agora", e refazer os blocos de fontes, entregas e saúde com símbolo e movimento em vez de texto.

**Architecture:** Notícias vivem em um arquivo de dados tipado (`src/data/noticias.ts`) com regra de "só aparece se verificada" e rótulo de recência calculado a partir da data de hoje. Um carrossel genérico acessível alimenta a hero e o bloco "O que a cidade recebe". As cenas (fontes que compartilham, pessoas no centro, avaliação que gera projetos) são SVG animado por CSS/SMIL, portadas dos mockups aprovados. O mapa que se aproxima sai da hero e vira o capítulo "demonstração".

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind 4, vitest + @testing-library/react (jsdom por arquivo), tsx para scripts.

**Spec:** `docs/superpowers/specs/2026-11-13-landing-design.md` (seção "Revisão 2"). Protótipos aprovados: `.superpowers/brainstorm/80944-1794579723/content/blocos-visuais-v3.html` (blocos 2 e 3, copiar a lógica de lá). Plano anterior, já executado na mesma branch: `docs/superpowers/plans/2026-11-13-landing-nova-historia.md`.

## Global Constraints

- Branch: continuar em `landing-nova-historia` (ainda não enviada ao GitHub).
- Só `transform`, `opacity` e `stroke-dashoffset` animam; `prefers-reduced-motion` desliga rotação, autoavanço e fluxos (conteúdo sempre completo e legível).
- Tokens de movimento e classes de clique de `src/styles/movimento.css`; cores só as de `src/index.css` (`marca #0a5a96`, `noite #052f4d`, `marca-fundo #e6f2fa`, `linha #dfeaf2`, avisos `#e0603e #e6a93e #3db18c`).
- Público da landing: instituições com missão em cidades, tecnologia e ética para o cidadão. Botão principal: "Ver uma cidade em demonstração" (âncora `#demonstracao`). Botão "Falar com a equipe" só aparece se `CONTATO_URL` estiver preenchido em `src/data/contato.ts` (começa vazio; não inventar endereço).
- Pouco texto: nenhum parágrafo da landing com mais de 25 palavras, e cada cena com no máximo uma palavra ou expressão curta de rótulo. Linguagem de lugares e relações, nunca "base de dados" solta.
- Notícias: só aparece quem tem `verificada: true`; textos nossos (resumo e conexão), nunca copiados; sempre com data, nome da fonte e link `https` sem parâmetros `utm_*`; linguagem de relação ("se relaciona com", "conecta com"), nunca "faz parte" nem endosso da UNESCO, do Ministério ou do BNDES. Imagens de terceiros não são usadas (ilustração própria por tema).
- Números da demonstração: 24 fontes analisadas, 18 indicadores avaliados, 7 lacunas identificadas, 12 ações propostas, sempre com o rótulo "Exemplo ilustrativo".
- Símbolo da Saúde: coração com pulsação (`M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z` mais a linha `M7.5 12.2h2.3l1.4-3 1.8 5.4 1.4-2.4H17`).
- Mobile primeiro (375 px), sem rolagem horizontal, alvo de toque mínimo 44 px.
- Não reutilizar nomes que só diferem na caixa (macOS): evitar `decisao.ts` × `Decisao.tsx`.
- Verificação: `npm test`, `npm run lint`, `npm run build`.

## Review Focus

- Notícia antiga apresentada como "agora": a recência só diz "há N dias" até 45 dias; depois mostra a data (teste com datas de 3, 30 e 200 dias).
- Link quebrado ou fonte que mudou: o script de verificação acusa status ≠ 200 e título que não bate; item sem verificação não aparece.
- Zero notícias verificadas: a hero continua inteira (título, botão) sem carrossel vazio.
- Carrossel com autoavanço e leitor de tela: avanço automático para ao focar, ao passar o mouse e com a aba oculta, e `aria-live` só liga quando o autoavanço está desligado.
- Arrastar horizontal no celular não pode travar a rolagem vertical da página (`touch-action: pan-y`).

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/data/noticias.ts` (novo) | tipo `Noticia`, lista `NOTICIAS`, `noticiasVisiveis`, `rotuloRecencia` |
| `src/data/contato.ts` (novo) | `CONTATO_URL` opcional |
| `scripts/verificar-noticias.ts` (novo) + `scripts/noticiasMeta.ts` | confere cada link e extrai título/data; função pura `extrairMeta(html)` |
| `src/components/landing/Carrossel.tsx` + `carrossel.ts` (novos) | carrossel acessível e lógica de índice |
| `src/components/landing/CartaoNoticia.tsx` + `CenasTema.tsx` (novos) | cartão de notícia e ilustração por tema |
| `src/components/landing/HeroNoticias.tsx` (novo) | composição da hero |
| `src/components/landing/Demonstracao.tsx` (novo) | capítulo `demonstracao` (mapa + números) |
| `src/components/landing/FontesCompartilham.tsx`, `RecebeCena.tsx` (novos) | blocos 2 e 3 |
| `src/components/landing/iconesAreas.tsx`, `capitulos.ts`, `Landing.tsx`, `BotaoVerCidade.tsx`, `NavLanding.tsx`, `TerritorioFontes.tsx` (modificar/remover) | ajustes |
| `.claude/skills/cidades-mil-design/SKILL.md`, spec | regras novas |

---

### Task 1: Dados das notícias e recência

**Files:**
- Create: `src/data/noticias.ts`, `src/data/noticias.test.ts`, `src/data/contato.ts`

**Interfaces:**
- Produces: `type TemaNoticia = 'ia' | 'cidade' | 'cidadao' | 'mil'`; `interface Noticia { id: string; tema: TemaNoticia; titulo: string; resumo: string; conexao: string; fonte: { nome: string; url: string }; data: string /* AAAA-MM-DD */; verificada: boolean }`; `NOTICIAS: Noticia[]`; `noticiasVisiveis(lista: Noticia[], hoje: Date): Noticia[]` (só verificadas, com data ≤ hoje, ordenadas da mais nova para a mais antiga); `rotuloRecencia(data: string, hoje: Date): string` (0 dia → "Hoje"; 1 → "Ontem"; 2–45 → "Há N dias"; acima disso → "12 abr 2026"; data futura → data formatada); `TEMAS: Record<TemaNoticia, { rotulo: string }>` com "A IA nas cidades", "A cidade que se organiza", "O cidadão no centro", "Os fundamentos MIL"; `CONTATO_URL: string` (vazio).

- [ ] **Step 1: Write the failing test** (`noticias.test.ts`): `rotuloRecencia('2026-11-13', new Date('2026-11-13T12:00:00'))` → `'Hoje'`; `('2026-11-12', …)` → `'Ontem'`; `('2026-11-10', …)` → `'Há 3 dias'`; `('2026-04-10', …)` → `'10 abr 2026'`; `noticiasVisiveis` descarta `verificada:false` e data futura e ordena por data decrescente; para toda notícia de `NOTICIAS`: `fonte.url` começa com `https://` e não contém `utm_`, `titulo.length ≤ 80`, `resumo.length ≤ 140`, `conexao.length ≤ 120`, ids únicos; `conexao` e `resumo` não contêm "faz parte" nem "endossa".
- [ ] **Step 2: Run** `npx vitest run src/data/noticias.test.ts` — esperado FAIL (módulo não existe).
- [ ] **Step 3: Implement** o módulo. `NOTICIAS` começa com as três notícias do material do usuário e `verificada: false` em todas: Ministério das Cidades seleciona municípios (`2026-04-10`, tema `cidade`, fonte `https://www.gov.br/cidades/pt-br/assuntos/noticias-1/noticia-mcid-n-2093/`), Política Nacional de Informação e Saúde Digital (`2026-10-28`, tema `ia`, fonte `https://www.gov.br/saude/pt-br/assuntos/noticias/2026/outubro/brasil-institui-politica-nacional-de-informacao-e-saude-digital-e-consolida-transformacao-digital-do-sus`), Ramallah e UNESCO (`2026-11-06`, tema `mil`, fonte `https://www.unesco.org/en/articles/ramallah-municipality-launches-media-and-information-literacy-friendly-city-initiative-partnership`); tema `cidadao` fica sem item até a Task 2 achar um verificável. Textos do resumo e da conexão escritos por nós, curtos.
- [ ] **Step 4: Run** o teste — esperado PASS.
- [ ] **Step 5: Commit** `feat: dados das notícias e rótulo de recência`

### Task 2: Verificar as fontes (portão de publicação)

**Files:**
- Create: `scripts/noticiasMeta.ts`, `scripts/noticiasMeta.test.ts`, `scripts/verificar-noticias.ts`
- Modify: `package.json` (`"noticias:verificar": "tsx scripts/verificar-noticias.ts"`), `src/data/noticias.ts` (campos e `verificada`)

**Interfaces:**
- Produces: `extrairMeta(html: string): { titulo: string | null; descricao: string | null; data: string | null }` (lê `og:title`/`<title>`, `og:description`/`description`, `article:published_time`/`datePublished`, devolvendo `AAAA-MM-DD`); `npm run noticias:verificar` imprime por notícia: status HTTP, título encontrado, data encontrada e se bate com `Noticia.data`.

- [ ] **Step 1: Write the failing test:** `extrairMeta` com um HTML de exemplo contendo `<meta property="og:title" content="X">`, `<meta property="article:published_time" content="2026-10-28T10:00:00-03:00">` devolve `{ titulo: 'X', data: '2026-10-28', descricao: null }`; HTML vazio devolve três `null`.
- [ ] **Step 2: Run** `npx vitest run scripts/noticiasMeta.test.ts` — esperado FAIL.
- [ ] **Step 3: Implement** `extrairMeta` (regex simples sobre as tags) e o script, que usa `fetch` com `User-Agent` genérico e `redirect: 'follow'`.
- [ ] **Step 4: Run** o teste — esperado PASS.
- [ ] **Step 5: Executar a verificação de verdade:** `npm run noticias:verificar`. Para cada notícia, ler a página (também pela ferramenta de leitura web quando o `fetch` for bloqueado), conferir título, data e o que a notícia afirma, e só então ajustar `titulo`, `resumo`, `conexao` e marcar `verificada: true`. O que não puder ser confirmado (status ≠ 200, data diferente, afirmação que a página não sustenta) continua `false` e é anotado no commit. Procurar ao menos uma notícia verificável para o tema `cidadao` (ex.: letramento, participação, acesso à informação) e, se achar, incluir.
- [ ] **Step 6: Commit** `feat: script de verificação e notícias conferidas`

### Task 3: Carrossel acessível

**Files:**
- Create: `src/components/landing/carrossel.ts`, `src/components/landing/carrossel.test.ts`, `src/components/landing/Carrossel.tsx`, `src/components/landing/Carrossel.test.tsx`
- Modify: `src/styles/movimento.css`

**Interfaces:**
- Produces: `proximoIndice(atual: number, total: number, delta: number): number` (circular; `total ≤ 0` devolve 0); `Carrossel(props: { rotulo: string; itens: ReactNode[]; autoavancoMs?: number; indiceInicial?: number; onMudar?: (i: number) => void; className?: string })` — região com `role="region"`, `aria-roledescription="carousel"`, `aria-label={rotulo}`; cada item `role="group"` `aria-roledescription="slide"` `aria-label="N de M"`; botões "Anterior" e "Próximo" e uma bolinha por item (`aria-label="Ir para N"`, `aria-current` no atual); `aria-live="polite"` só quando o autoavanço está desligado; arrastar com `touch-action: pan-y`; classe `.carrossel` com trilho `transform: translateX(-N00%)` e `.is-ativo` no item atual.

- [ ] **Step 1: Write the failing tests:** `proximoIndice(0,3,-1)` → 2; `(2,3,1)` → 0; `(0,0,1)` → 0. No componente (jsdom, `matchMedia` e `IntersectionObserver` simulados, `vi.useFakeTimers`): renderiza N bolinhas e N slides com "1 de N"; clicar em "Próximo" marca o segundo `aria-current`; com `autoavancoMs=1000` o índice avança após 1000 ms, para ao receber foco dentro da região e depois de `document.hidden = true`; com `prefers-reduced-motion` o autoavanço não roda; `aria-live` é `polite` só sem autoavanço.
- [ ] **Step 2: Run** `npx vitest run src/components/landing/carrossel.test.ts src/components/landing/Carrossel.test.tsx` — esperado FAIL.
- [ ] **Step 3: Implement** `proximoIndice` e o componente (hook interno `useAutoavanco` com `setTimeout`, limpeza no unmount, pausa por `mouseenter`, `focusin`, `visibilitychange`; arraste por `pointerdown/up` com limite de 40 px) e as classes no CSS (trilho, bolinha que alarga no ativo).
- [ ] **Step 4: Run** os testes e `npm run build` — esperado PASS.
- [ ] **Step 5: Commit** `feat: carrossel acessível com autoavanço pausável`

### Task 4: Cartão de notícia e cenas por tema

**Files:**
- Create: `src/components/landing/CartaoNoticia.tsx`, `src/components/landing/CartaoNoticia.test.tsx`, `src/components/landing/CenasTema.tsx`
- Modify: `src/styles/movimento.css`

**Interfaces:**
- Consumes: `Noticia`, `TEMAS`, `rotuloRecencia` (Task 1).
- Produces: `CenaTema(props: { tema: TemaNoticia; className?: string })` (SVG animado por tema: `ia` com faísca e chips que se ligam; `cidade` com prédios que acendem em sequência; `cidadao` com pessoas e coração; `mil` com globo e selo); `CartaoNoticia(props: { noticia: Noticia; hoje?: Date })` — mostra a cena, o rótulo do tema, o `rotuloRecencia`, o nome da fonte e o título; um botão "Ver conexão" (`aria-expanded`) abre (`.clique-detalhe`) o resumo, a linha "Conexão com Cidades MIL" e o link da fonte com `target="_blank"` e `rel="noopener noreferrer"`.

- [ ] **Step 1: Write the failing test** (jsdom): renderiza o título, "Há 3 dias" (com `hoje` fixo), o nome da fonte; o painel começa fechado (`aria-expanded="false"`); clicar abre e mostra o link com `href` igual à `fonte.url` e `rel` contendo `noopener`; o texto "Conexão com Cidades MIL" só aparece aberto.
- [ ] **Step 2: Run** `npx vitest run src/components/landing/CartaoNoticia.test.tsx` — esperado FAIL.
- [ ] **Step 3: Implement** os dois componentes; cada cena é um `<svg aria-hidden>` com animação só de `transform`/`opacity`/`stroke-dashoffset` iniciada quando o cartão tem `.is-ativo` (classe vinda do carrossel); `reduced-motion` mostra a cena parada.
- [ ] **Step 4: Run** o teste e `npm run build`.
- [ ] **Step 5: Commit** `feat: cartão de notícia com ilustração por tema`

### Task 5: Nova hero e botões para instituições

**Files:**
- Create: `src/components/landing/HeroNoticias.tsx`, `src/components/landing/HeroNoticias.test.tsx`
- Modify: `src/pages/Landing.tsx`, `src/components/landing/BotaoVerCidade.tsx` (+ teste), `src/components/landing/NavLanding.tsx`, `src/components/landing/Decisao.tsx`

**Interfaces:**
- Consumes: `Carrossel` (T3), `CartaoNoticia` (T4), `noticiasVisiveis`/`NOTICIAS`/`TEMAS` (T1), `CONTATO_URL`.
- Produces: `HeroNoticias(props: { hoje?: Date })` — título "O futuro das cidades já começou.", uma linha de apoio de até 25 palavras ("Governos, universidades e cidades já transformam informação em decisão. A Cidades MIL torna isso visível e medível."), selo vivo "Atualizado em DD/MM/AAAA" (data da notícia mais nova visível) com ponto pulsante, o carrossel de cartões e quatro ícones de tema que levam ao primeiro cartão do tema; botão principal "Ver uma cidade em demonstração" apontando para `#demonstracao`; botão "Falar com a equipe" apenas se `CONTATO_URL` não for vazio. Sem notícias visíveis: renderiza só título, linha e botões. `BotaoVerCidade` ganha a prop `to` já existente e o texto padrão passa a ser "Ver uma cidade em demonstração" (aceita âncora `#…` sem usar `Link` do router).

- [ ] **Step 1: Write the failing tests:** com 3 notícias visíveis e `hoje` fixo, o selo mostra a data da mais nova e há 3 slides; com lista vazia não existe `role="region"` de carrossel e o botão principal continua; o botão "Falar com a equipe" não existe quando `CONTATO_URL === ''`; o botão principal tem `href="#demonstracao"`; `BotaoVerCidade` com `to="#demonstracao"` renderiza `<a href="#demonstracao">`.
- [ ] **Step 2: Run** `npx vitest run src/components/landing/HeroNoticias.test.tsx src/components/landing/BotaoVerCidade.test.tsx` — esperado FAIL.
- [ ] **Step 3: Implement**; em `Landing.tsx` trocar o `<Capitulo id="cidade">` antigo (mapa) por `HeroNoticias`; a nav passa a ter o botão compacto "Ver a demonstração" (`#demonstracao`); o fecho em `Decisao` usa o mesmo botão (sem entrar em `/app` ainda: a demonstração rola até o capítulo).
- [ ] **Step 4: Run** `npm test` e `npm run build`.
- [ ] **Step 5: Verificação visual** a 375 px e 1280 px (mostrar a hero e um clique em "Ver conexão"); conferir que o primeiro cartão aparece sem rolar no celular.
- [ ] **Step 6: Commit** `feat: hero com carrossel de notícias para instituições`

### Task 6: Capítulo "demonstração"

**Files:**
- Create: `src/components/landing/Demonstracao.tsx`, `src/components/landing/Demonstracao.test.tsx`
- Modify: `src/components/landing/capitulos.ts` (+ `capitulos.test.ts`), `src/pages/Landing.tsx`

**Interfaces:**
- Consumes: `MapaAproximacao` (existente), `useAnimado` de `@/lib/movimento`.
- Produces: `CAPITULOS` passa a ser `cidade → demonstracao → dados → calculo → frentes → decisao`, com `{ id: 'demonstracao', rotulo: 'A demonstração' }` (e `cidade` renomeado para `'O momento'`); `Demonstracao()` — pergunta curta como título ("E se fosse possível entender uma cidade antes de planejar?"), o mapa que se aproxima, quatro medidores com ícone (24 fontes, 18 indicadores, 7 lacunas, 12 ações) que contam de zero ao entrar na tela (`useAnimado`), selo "Exemplo ilustrativo" e uma faixa com quatro ícones do plano de ação (objetivo, meta, responsável, prazo) sem frases.

- [ ] **Step 1: Write the failing tests:** `CAPITULOS.map(c => c.id)` igual à ordem acima; `Demonstracao` renderiza "Exemplo ilustrativo", os quatro valores finais com `useAnimado` simulado em reduced-motion (24, 18, 7, 12) e nenhum parágrafo com mais de 25 palavras.
- [ ] **Step 2: Run** os dois arquivos de teste — esperado FAIL.
- [ ] **Step 3: Implement** e inserir `<Capitulo id="demonstracao">` logo depois da hero.
- [ ] **Step 4: Run** `npm test` e `npm run build`.
- [ ] **Step 5: Commit** `feat: capítulo de demonstração com mapa e números ilustrativos`

### Task 7: Blocos 2 e 3 com símbolos e movimento

**Files:**
- Create: `src/components/landing/FontesCompartilham.tsx`, `src/components/landing/FontesCompartilham.test.tsx`, `src/components/landing/RecebeCena.tsx`, `src/components/landing/RecebeCena.test.tsx`
- Modify: `src/pages/Landing.tsx`, `src/styles/movimento.css`
- Delete: `src/components/landing/TerritorioFontes.tsx`, `src/components/landing/TerritorioFontes.test.tsx`

**Interfaces:**
- Consumes: `Carrossel` (T3), `FONTES` de `fontes.ts` (seis fontes; usar só `id` e `nome` como `aria-label`).
- Produces: `FontesCompartilham()` — a cena do mockup v3: seis símbolos ao redor da cidade centralizada, fios que se desenham um a um e bolinhas que vão e voltam (SMIL `animateMotion`), selo verde quando as seis estão ligadas, ciclo que recomeça; cada símbolo é `button` com `aria-label` do nome da fonte e `aria-pressed` quando ligado (clicar liga na hora); `RecebeCena()` — `Carrossel` com três cenas e uma palavra de rótulo cada: "Avaliação" (prancheta que gera três projetos), "Pessoas no centro" (pessoas, tecnologia em órbita, coração, anel da meta e balança da ética), "Atividades" (três tarefas que trocam de lugar); sem nenhuma frase.

- [ ] **Step 1: Write the failing tests:** `FontesCompartilham` tem 6 botões com os nomes de `FONTES`; clicar num botão muda `aria-pressed` para `true`; após ligar os seis aparece o selo (`data-completo="true"`); em reduced-motion os seis já vêm ligados. `RecebeCena` tem 3 slides com os rótulos "Avaliação", "Pessoas no centro", "Atividades"; nenhum texto com mais de 3 palavras dentro das cenas.
- [ ] **Step 2: Run** os dois arquivos — esperado FAIL.
- [ ] **Step 3: Implement** portando `blocos-visuais-v3.html`; órbita e contra-rotação só com `transform`; ao final remover `TerritorioFontes` e a coluna de textos "3 · O que a cidade recebe".
- [ ] **Step 4: Run** `npm test`, `npm run lint`, `npm run build`.
- [ ] **Step 5: Verificação visual** a 375 px e 1280 px das duas cenas e das três páginas do carrossel.
- [ ] **Step 6: Commit** `feat: blocos de fontes e entregas com símbolos e movimento`

### Task 8: Símbolo da Saúde

**Files:**
- Modify: `src/components/landing/iconesAreas.tsx`, `src/components/landing/Areas.test.tsx`

**Interfaces:**
- Produces: `IconeArea({ id: 'saude' })` renderiza o coração com pulsação (dois `path`).

- [ ] **Step 1: Write the failing test:** `IconeArea id="saude"` contém dois `path` e o primeiro tem `d` que começa com `M12 20s-7-4.4-7-10`.
- [ ] **Step 2: Run** `npx vitest run src/components/landing/Areas.test.tsx` — esperado FAIL.
- [ ] **Step 3: Implement** a troca do traço `saude`.
- [ ] **Step 4: Run** o teste — esperado PASS.
- [ ] **Step 5: Commit** `feat: coração com pulsação como símbolo da Saúde`

### Task 9: Pente fino de texto

**Files:**
- Create: `src/pages/Landing.texto.test.tsx`
- Modify: `src/pages/Landing.tsx`, `src/components/landing/Frentes.tsx`, `src/components/landing/SimuladorIndice.tsx`

**Interfaces:**
- Consumes: todos os capítulos montados.
- Produces: regra automática — nenhum `<p>` da landing com mais de 25 palavras.

- [ ] **Step 1: Write the failing test** (jsdom): monta `<Landing />` dentro de `MemoryRouter` (com `matchMedia`, `IntersectionObserver`, `ResizeObserver` simulados e reduced-motion ligado) e falha se algum `p` tiver mais de 25 palavras, listando os textos.
- [ ] **Step 2: Run** `npx vitest run src/pages/Landing.texto.test.tsx` — esperado FAIL com a lista dos parágrafos longos.
- [ ] **Step 3: Implement** o encurtamento dos parágrafos apontados (títulos de capítulo mantêm uma linha de apoio curta; painel das frentes passa a mostrar só nome, peso e uma frase de até 12 palavras; texto do cálculo corta o aviso longo para uma linha).
- [ ] **Step 4: Run** `npm test` — esperado PASS.
- [ ] **Step 5: Commit** `feat: textos curtos em toda a landing`

### Task 10: Skill, spec e verificação final

**Files:**
- Modify: `.claude/skills/cidades-mil-design/SKILL.md`, `docs/superpowers/specs/2026-11-13-landing-design.md`

- [ ] **Step 1: Write** na skill: regra "pouco texto, símbolo e movimento", política de notícias (verificadas, recência, relação e não afiliação, sem imagem de terceiros) e o carrossel como padrão; na spec, a seção "Revisão 2" (público instituições, hero em notícias, demonstração, blocos novos).
- [ ] **Step 2: Run** `npm test && npm run lint && npm run build` — esperado tudo verde.
- [ ] **Step 3: Verificação real:** `npm run preview`, abrir a 375 e 1280 px; rolar a página inteira; conferir hero, carrossel (setas, bolinhas, arrasto, pausa ao passar o mouse), demonstração, blocos 2 e 3, 13 áreas; testar `prefers-reduced-motion`; rodar `npm run noticias:verificar` e anexar a saída ao resumo.
- [ ] **Step 4: Commit** `docs: skill e spec da revisão 2`.

---

## Self-Review

- **Cobertura:** hero em notícias com selo de atualização e recência (T1, T2, T4, T5); notícias e previews verificados antes de aparecer (T2); carrossel (T3); demonstração com mapa (T6); blocos 2 e 3 (T7); símbolo da Saúde (T8); pouco texto (T9); skill e spec (T10); público instituições e botões (T5).
- **Consistência de tipos:** `Noticia`, `TemaNoticia`, `TEMAS`, `rotuloRecencia` (T1) usados em T4 e T5; `Carrossel` (T3) usado em T5 e T7; `CAPITULOS` mudado em T6 e consumido por `NavLanding` (T5 já aponta `#demonstracao`; a nav lê `CAPITULOS`, então T6 mantém tudo coerente).
- **Fora deste plano (decisão do usuário):** deixar o visitante escolher onde observar no mapa; manter as notícias atualizáveis sem deploy (tabela no Supabase com leitura pública) fica como etapa seguinte, depois de validar o formato dos cartões.
- **Proporção:** tarefas listam assinaturas, valores fixos e testes; corpos de função e SVG vêm dos mockups aprovados.
