# Landing Cidades MIL — nova história · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a landing atual por uma história em capítulos ("A cidade do gestor") com mapa que se aproxima, componentes de clique distintos, rolagem narrativa e tela de carregamento com o mesmo mapa.

**Architecture:** Componentes React em `src/components/landing/` com CSS próprio de movimento (tokens do transitions.dev em variáveis CSS). O mapa usa três camadas pré-desenhadas animadas só com `transform` e `opacity` via Web Animations API. Dados do mapa são gerados uma vez por script e versionados (nenhuma chamada ao IBGE em tempo de execução). GSAP + ScrollTrigger entra apenas no capítulo do cálculo.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind 4, vitest, react-router-dom 7. Nova dependência: `gsap` (carregada de forma lazy).

**Spec:** `docs/superpowers/specs/2026-11-13-landing-design.md`. Protótipos aprovados: `.superpowers/brainstorm/80944-1794579723/content/{mapa-liso,botao-ver-cidade,sensacao-cliques-rolagem,primeira-tela}.html` (copiar a lógica de lá; o código do mapa liso é a referência de `calcularZoom`).

## Global Constraints

- Animações só com `transform` e `opacity`; nada de mudar `viewBox`, `width` ou `top` por quadro.
- Tokens de tempo: 40, 80, 150, 250, 350, 400, 500 ms. Curvas: `--ease-smooth-out: cubic-bezier(.22,1,.36,1)`; `--ease-bounce: cubic-bezier(.34,1.36,.64,1)`; zoom do mapa 2200 ms `cubic-bezier(.65,0,.35,1)`.
- `prefers-reduced-motion: reduce` troca todo movimento por dissolvência de no máximo 200 ms e o mapa fica estático.
- Cores só as de `src/index.css` (`marca #0a5a96`, `noite #052f4d`, `marca-fundo #e6f2fa`, `linha #dfeaf2`); contraste mínimo 4,5:1.
- No máximo um número em destaque por seção e três cards visíveis de uma vez; o resto aparece ao clicar.
- Botão principal: texto "Ver a minha cidade", mapa que se aproxima no hover e pino que cai (variante B do protótipo `botao-ver-cidade.html`), levando a `/app`.
- Mobile primeiro (375 px), sem rolagem horizontal; alvo de toque mínimo 44 px.
- Textos em português do Brasil, linguagem simples, sem jargão técnico.
- Não alterar rotas nem páginas de `/app` além da tela de carregamento (`Splash`).
- Testes de componente: o projeto só tem `vitest` sem DOM. A Task 1 instala `jsdom` e `@testing-library/react` (devDependencies); cada teste de componente começa com `// @vitest-environment jsdom` e simula `window.matchMedia` e `IntersectionObserver` quando precisa.
- Comandos de verificação: `npm test`, `npm run lint`, `npm run build`.

## Review Focus

- Mapa durante redimensionamento ou rotação do celular: recalcular camadas sem salto (teste em `calcularZoom` com larguras diferentes).
- Aba em segundo plano e volta: o ciclo do mapa retoma sem ficar preso em camada invisível.
- Revelações que só funcionam com hover: tudo precisa funcionar por toque e teclado (Enter/Espaço, foco visível).
- Rolagem muito rápida ou `#âncora` direto: capítulo ativo e entradas não ficam escondidos (`opacity:0` preso).
- Usuário com `prefers-reduced-motion`: conteúdo completo visível sem nenhum movimento essencial.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/styles/movimento.css` (novo, importado em `src/index.css`) | tokens de tempo/curva, famílias de clique, `reveal`, `reduced-motion` |
| `src/lib/mapaLanding.ts` (novo) | funções puras: `simplificar`, `caminhoSvg`, `enquadrar`, `calcularZoom` |
| `scripts/gen-mapa-landing.ts` (novo) | baixa malhas do IBGE, gera `src/data/mapa-ufs.json` e `src/data/mapa-cidade-demo.json` |
| `src/components/landing/MapaAproximacao.tsx` (novo) | camadas + ciclo Brasil→estado→município |
| `src/components/landing/BotaoVerCidade.tsx` (novo) | botão com mapa que se aproxima e pino |
| `src/components/landing/NavLanding.tsx` (novo) | nav translúcida com marcadores de capítulo |
| `src/components/landing/Capitulo.tsx` (novo) | wrapper de seção com entrada na rolagem e id de capítulo |
| `src/components/landing/capitulos.ts` (novo) | `escolherCapituloAtivo`, hook `useCapituloAtivo` |
| `src/components/landing/TerritorioFontes.tsx` (novo) | capítulo "os dados chegam" |
| `src/components/landing/SimuladorIndice.tsx` (modificar) | capítulo "o cálculo" com selo de consistência |
| `src/components/landing/indice.ts` (modificar) | `nivelConsistencia` |
| `src/components/landing/Frentes.tsx` + `iconesFrentes.tsx` (novos) | cinco frentes com ícone e painel que abre |
| `src/components/landing/Decisao.tsx` (novo) | capítulo final "o que fazer primeiro" + CTA |
| `src/pages/Landing.tsx` (reescrever) | compõe os capítulos |
| `src/components/ui/index.tsx` (`Splash`) | carregamento com o mapa se desenhando |
| `.claude/skills/cidades-mil-design/SKILL.md` (novo) | regras de design do projeto |

---

### Task 1: Tokens de movimento e famílias de clique

**Files:**
- Create: `src/styles/movimento.css`, `src/lib/tokensMovimento.ts`, `src/lib/tokensMovimento.test.ts`
- Modify: `src/index.css` (adicionar `@import "./styles/movimento.css";` logo após o `@import "tailwindcss"`), `package.json` (`npm i -D jsdom @testing-library/react`)

**Interfaces:**
- Produces: `export const DURACOES = { micro: 40, rapida: 80, curta: 150, media: 250, longa: 350, lenta: 400, enorme: 500 } as const`; `export const CURVAS = { suave: 'cubic-bezier(.22,1,.36,1)', mola: 'cubic-bezier(.34,1.36,.64,1)', zoom: 'cubic-bezier(.65,0,.35,1)' } as const`; classes CSS `.clique-convite`, `.clique-escolha`, `.clique-detalhe`, `.clique-controle`, `.reveal` (+ `.reveal.visivel`).

- [ ] **Step 1: Write the failing test** em `tokensMovimento.test.ts`: `expect(Object.values(DURACOES)).toEqual([40,80,150,250,350,400,500])`; `expect(CURVAS.suave).toBe('cubic-bezier(.22,1,.36,1)')`; e que o CSS contém as mesmas curvas (`readFileSync('src/styles/movimento.css')` contém `--ease-smooth-out: cubic-bezier(.22,1,.36,1)`).
- [ ] **Step 2: Run** `npx vitest run src/lib/tokensMovimento.test.ts` — esperado FAIL (módulo não existe).
- [ ] **Step 3: Implement** `tokensMovimento.ts` e `movimento.css`. CSS: variáveis `--dur-*` e `--ease-*`; as quatro famílias com movimentos distintos (convite: onda que se expande do ponto do clique no `:active`; escolha: o item selecionado sobe 2 px e ganha anel; detalhe: painel abre com `grid-template-rows 0fr→1fr` + opacidade; controle: chave que desliza com `--ease-bounce`); `.reveal` começa `opacity:0; transform:translateY(16px)` e `.reveal.visivel` volta ao normal em 500 ms `--ease-smooth-out`; no bloco `@media (prefers-reduced-motion: reduce)` zerar transforms e usar só `opacity` em 150 ms; `.reveal` visível por padrão quando `@media (scripting: none)`.
- [ ] **Step 4: Run** o teste — esperado PASS; `npm run build` sem erro.
- [ ] **Step 5: Commit** `feat: tokens de movimento e famílias de clique`

### Task 2: Dados do mapa e funções puras

**Files:**
- Create: `scripts/gen-mapa-landing.ts`, `src/lib/mapaLanding.ts`, `src/lib/mapaLanding.test.ts`, `src/data/mapa-ufs.json`, `src/data/mapa-cidade-demo.json`
- Modify: `package.json` (script `"mapa:gen": "tsx scripts/gen-mapa-landing.ts"`)

**Interfaces:**
- Produces (em `mapaLanding.ts`): `type Vista = [x: number, y: number, w: number, h: number]`; `simplificar(pontos: [number, number][], tolerancia: number): [number, number][]` (Douglas-Peucker; anel fechado dividido no ponto mais distante do primeiro); `caminhoSvg(aneis: [number, number][][]): string`; `projetar(lon: number, lat: number): [number, number]` com `[(lon+74)*cos(-14°)*40, (6-lat)*40]`; `enquadrar(bbox: Vista, aspecto: number, folga = 1.25): Vista`; `calcularZoom(de: Vista, para: Vista, largura: number, altura: number): { s: number; tx: number; ty: number }`.
- `mapa-ufs.json`: `Record<codigoIBGE, string>` (27 UFs, caminhos SVG, ≤ 30 KB). `mapa-cidade-demo.json`: `{ codigo: '3551405', nome: 'Serra Azul', uf: '35', caminho: string }`.

- [ ] **Step 1: Write the failing tests** (`mapaLanding.test.ts`): `simplificar` de um anel quadrado com ponto colinear devolve 5 pontos (anel fechado mantém início = fim) e nunca devolve vazio; `enquadrar([0,0,100,50], 1540/1620)` devolve vista com razão `w/h ≈ 0.9506` contendo o bbox com folga de 1,25; `calcularZoom(V, V, 400, 420)` devolve `{s:1, tx:0, ty:0}` (±1e-9); para `de=[0,30,1540,1620]`, `para=[400,500,385,405]`, `largura=400, altura=420` o ponto central de `para` cai em `(200, 210)` após aplicar `translate(tx,ty) scale(s)` ao ponto de `de` equivalente (testar a invariante); `calcularZoom` com `largura=320` e `largura=1000` mantém `s` igual (só `tx,ty` mudam).
- [ ] **Step 2: Run** `npx vitest run src/lib/mapaLanding.test.ts` — esperado FAIL.
- [ ] **Step 3: Implement** `mapaLanding.ts` seguindo a lógica de `mapa-liso.html` (`zoom`, `enquadra`, `proj`, `pathDe`). Implementar `gen-mapa-landing.ts`: baixa `https://servicodados.ibge.gov.br/api/v3/malhas/estados?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=UF` (ou usa o `br_paths.json` do protótipo como ponto de partida) e `malhas/municipios/3551405?formato=application/vnd.geo+json&qualidade=minima`; simplifica com tolerância que mantenha ≤ 30 KB; grava os dois JSON. Rodar `npm run mapa:gen` uma vez e commitar a saída.
- [ ] **Step 4: Run** os testes e `npm run build` — esperado PASS; conferir `ls -l src/data/mapa-*.json` ≤ 30 KB e ≤ 4 KB.
- [ ] **Step 5: Commit** `feat: dados do mapa da landing e funções de enquadramento`

### Task 3: Componente MapaAproximacao

**Files:**
- Create: `src/components/landing/MapaAproximacao.tsx`, `src/components/landing/MapaAproximacao.test.tsx`

**Interfaces:**
- Consumes: `calcularZoom`, `enquadrar`, `Vista` (Task 2); `CURVAS` (Task 1); `useReducedMotion` de `@/lib/movimento`.
- Produces: `export function MapaAproximacao(props: { className?: string; onFase?: (fase: 'brasil' | 'estado' | 'municipio') => void; ciclo?: boolean }): JSX.Element` — `ciclo` padrão `true`; com `ciclo=false` ou reduced-motion mostra só a camada do município com o Brasil ao fundo estático.

- [ ] **Step 1: Write the failing test** (vitest + `@testing-library/react` se já existir; caso contrário `react-dom/server` `renderToString`): renderiza 3 `<svg class="camada">`; a camada 1 tem 27 `path.uf` e exatamente um com `.dest`; `aria-hidden="true"` no contêiner e `role="img"` com `aria-label="Mapa do Brasil aproximando de Serra Azul"` no wrapper; com `matchMedia` simulando reduced-motion não chama `Element.prototype.animate`.
- [ ] **Step 2: Run** — esperado FAIL.
- [ ] **Step 3: Implement** `MapaAproximacao` portando `rodaB()` do protótipo: três camadas, `ResizeObserver` que recalcula `calcularZoom` quando o contêiner muda de tamanho (cancelar animações e reiniciar o ciclo), ciclo: espera 1600 ms → zoom Brasil→estado (2200 ms) → estado→município com o estado clareando para opacidade .3 até 45% → espera 2400 ms → dissolve 700 ms de volta ao Brasil. `document.visibilitychange`: pausar (`animation.pause()`) quando oculta e retomar ao voltar. Limpeza completa no unmount (`cancel()` de todas as animações, desconectar o observer). Espessura do traço da cidade proporcional à vista (`V2[2]*0.012`).
- [ ] **Step 4: Run** os testes; `npm run build`.
- [ ] **Step 5: Verificação visual:** `npm run dev`, abrir a rota `/` no navegador, conferir os três estágios sem salto e sem quadro azul sólido; medir quadros com o mesmo script `video-pitch/tools/mede-mapa.mjs` apontado para a página (esperado: sem quadros > 25 ms em CPU 4×).
- [ ] **Step 6: Commit** `feat: mapa que se aproxima em camadas`

### Task 4: Botão "Ver a minha cidade" e primeira tela

**Files:**
- Create: `src/components/landing/BotaoVerCidade.tsx`
- Modify: `src/pages/Landing.tsx` (apenas o `<header>` hero; o resto vem nas próximas tarefas)

**Interfaces:**
- Consumes: `MapaAproximacao` (Task 3); classes `.clique-convite` (Task 1).
- Produces: `export function BotaoVerCidade(props: { to?: string; children?: ReactNode }): JSX.Element` — `to` padrão `/app`; renderiza `<Link>` com ícone de mapa e pino SVG; hover/foco: mapa `scale(1.55)` em 550 ms `--ease-smooth-out`, pino cai de `translateY(-60px)` para `translateY(12px)` com `--ease-bounce` atraso 120 ms, fundo vira `--color-marca`; `:active` `scale(.97)`; em dispositivos sem hover o efeito dispara ao `:focus-visible`/`:active`.

- [ ] **Step 1: Write the failing test:** renderiza e verifica `getByRole('link', { name: /ver a minha cidade/i })` com `href="/app"`, e que o pino existe com `aria-hidden`.
- [ ] **Step 2: Run** — esperado FAIL.
- [ ] **Step 3: Implement** o botão e reescrever o hero: mapa em tela cheia atrás (opacidade suave, centrado na cidade), título "A sua cidade, entendida de ponta a ponta" (ajustar copy depois com o cliente), subtítulo de uma frase, `BotaoVerCidade`, rótulo "Sua cidade" ligado ao pino. Remover o card de radar do hero (sem mais `RadarChart` na landing).
- [ ] **Step 4: Run** `npm test`, `npm run lint`, `npm run build`.
- [ ] **Step 5: Verificação visual** em 375 px e 1280 px (tabs do navegador): botão com o hover B, texto legível sobre o mapa, sem rolagem horizontal.
- [ ] **Step 6: Commit** `feat: primeira tela com mapa e botão Ver a minha cidade`

### Task 5: Nav translúcida e capítulos

**Files:**
- Create: `src/components/landing/capitulos.ts`, `src/components/landing/capitulos.test.ts`, `src/components/landing/NavLanding.tsx`, `src/components/landing/Capitulo.tsx`
- Modify: `src/pages/Landing.tsx` (trocar `<nav>` por `NavLanding`, envolver seções em `Capitulo`)

**Interfaces:**
- Produces: `export const CAPITULOS = [{ id: 'cidade', rotulo: 'A cidade' }, { id: 'dados', rotulo: 'Os dados' }, { id: 'calculo', rotulo: 'O cálculo' }, { id: 'frentes', rotulo: 'As frentes' }, { id: 'decisao', rotulo: 'A decisão' }] as const`; `escolherCapituloAtivo(visiveis: Record<string, number>): string | null` (devolve o id com maior razão de interseção; empate fica com o primeiro da lista; tudo 0 devolve `null`); `useCapituloAtivo(): string | null`; `Capitulo(props: { id: typeof CAPITULOS[number]['id']; children: ReactNode; className?: string })` aplica `.reveal` + `.visivel` ao entrar (IntersectionObserver, `threshold [0, .25, .6]`), com `id` e `scroll-margin-top` para a nav.

- [ ] **Step 1: Write the failing tests** (`capitulos.test.ts`): `escolherCapituloAtivo({cidade:0.2, dados:0.7})` → `'dados'`; `({})` e `({cidade:0})` → `null`; empate `({cidade:.5, dados:.5})` → `'cidade'`.
- [ ] **Step 2: Run** — esperado FAIL.
- [ ] **Step 3: Implement.** Nav: fixa, `backdrop-filter: blur(14px)`, fundo `rgb(255 255 255 / .72)`, sem borda dura (máscara de gradiente na base), marca + `SeloBeta` à esquerda, marcadores de capítulo (pontos com rótulo que aparece ao passar/focar) no centro em telas ≥ md, botão "Ver a minha cidade" (versão compacta) à direita; no celular só marca + botão. Ponto ativo cresce com `--ease-bounce`. Cliques nos marcadores rolam suave (`scrollIntoView({behavior})`, sem comportamento animado em reduced-motion). Garantir que `.reveal` nunca fique escondido se o IntersectionObserver não existir (mostrar tudo).
- [ ] **Step 4: Run** testes, lint, build.
- [ ] **Step 5: Verificação visual:** rolar a página, o ponto ativo muda; abrir `/#frentes` direto e ver a seção visível.
- [ ] **Step 6: Commit** `feat: nav translúcida e capítulos com entrada na rolagem`

### Task 6: Capítulo "Os dados chegam" (território de fontes)

**Files:**
- Create: `src/components/landing/TerritorioFontes.tsx`, `src/components/landing/fontes.ts`, `src/components/landing/fontes.test.ts`
- Modify: `src/pages/Landing.tsx`

**Interfaces:**
- Produces: `export const FONTES: { id: string; nome: string; frase: string; x: number; y: number }[]` com 5 fontes (ex.: Secretaria de Saúde, Cadastro municipal, Escolas, Assistência social, Biblioteca); `x`/`y` em 0–100 (% do mapa da cidade); `export function TerritorioFontes(): JSX.Element` — mapa da cidade (caminho de `mapa-cidade-demo.json`) com pontos clicáveis (`<button>`), linhas finas que se desenham do ponto até o centro quando o capítulo entra; clicar abre uma frase humana ao lado (família `.clique-detalhe`), um painel por vez.

- [ ] **Step 1: Write the failing test:** `FONTES` tem 5 itens, ids únicos, `x`/`y` entre 0 e 100, `frase.length ≤ 140`.
- [ ] **Step 2: Run** — esperado FAIL.
- [ ] **Step 3: Implement.** Pontos com alvo de toque ≥ 44 px (área invisível maior), `aria-expanded`, `aria-controls`; selecionado ganha anel e a linha até o centro engrossa; sem rótulos permanentes (só o nome da fonte selecionada). Texto do capítulo: título "Os dados chegam de onde já estão", uma frase de apoio.
- [ ] **Step 4: Run** testes, lint, build.
- [ ] **Step 5: Verificação visual** por toque (emulação mobile) e teclado (Tab/Enter).
- [ ] **Step 6: Commit** `feat: capítulo dos dados com território de fontes`

### Task 7: Capítulo "O cálculo" com selo de consistência

**Files:**
- Modify: `src/components/landing/SimuladorIndice.tsx`, `src/components/landing/indice.ts`, `src/components/landing/indice.test.ts`, `package.json` (+`gsap`)
- Create: `src/components/landing/useScrubCalculo.ts`

**Interfaces:**
- Produces: `export type NivelConsistencia = 'inicial' | 'parcial' | 'completa'`; `export function nivelConsistencia(preenchidas: number, total: number): NivelConsistencia` (`total ≤ 0` → `'inicial'`; razão `< 0.5` → `'inicial'`; `< 1` → `'parcial'`; `≥ 1` → `'completa'`; valores negativos e `preenchidas > total` tratados como 0 e `total`); `useScrubCalculo(ref: RefObject<HTMLElement>, onProgresso: (p: number) => void): void` — `import('gsap')` e `import('gsap/ScrollTrigger')` lazy, `scrub: .6`; em reduced-motion chama `onProgresso(1)` uma vez.

- [ ] **Step 1: Write the failing tests** em `indice.test.ts`: `nivelConsistencia(0, 10)` → `'inicial'`; `(5, 10)` → `'parcial'`; `(10, 10)` → `'completa'`; `(12, 10)` → `'completa'`; `(-3, 10)` → `'inicial'`; `(0, 0)` → `'inicial'`.
- [ ] **Step 2: Run** `npx vitest run src/components/landing/indice.test.ts` — esperado FAIL só nos novos.
- [ ] **Step 3: Implement.** `npm i gsap`. Refatorar `SimuladorIndice` para ter um número em destaque (o índice) e um selo de consistência ("Dados conferidos" com nível em palavras e ícone); o progresso de rolagem (`useScrubCalculo`) guia a sequência: dados entram → conferência → selo → índice; os detalhes por pilar ficam em acordeão (família `.clique-detalhe`), fechado por padrão. Não alterar a fórmula de cálculo existente.
- [ ] **Step 4: Run** `npm test`, lint, build; confirmar no `npm run build` que `gsap` entra num chunk separado (saída do Vite lista chunk próprio).
- [ ] **Step 5: Verificação visual:** rolar devagar e rápido; em reduced-motion o capítulo aparece completo.
- [ ] **Step 6: Commit** `feat: capítulo do cálculo com selo de consistência`

### Task 8: Capítulo "As cinco frentes"

**Files:**
- Create: `src/components/landing/Frentes.tsx`, `src/components/landing/iconesFrentes.tsx`, `src/components/landing/Frentes.test.tsx`
- Modify: `src/pages/Landing.tsx`

**Interfaces:**
- Consumes: `PILARES` de `@/data/metricas` (5 itens, `numero`, `nome`, `descricao`, `peso`, `cor`).
- Produces: `export function IconeFrente(props: { numero: number; className?: string }): JSX.Element` (SVG de linha 24×24 por pilar); `export function Frentes(): JSX.Element` — fileira de cinco ícones clicáveis (família `.clique-escolha`); clicar abre um painel (família `.clique-detalhe`) com nome, descrição e "peso X%"; um aberto por vez; o primeiro vem aberto no desktop e fechado no celular.

- [ ] **Step 1: Write the failing test:** renderiza 5 botões com nomes dos pilares; clicar no segundo mostra sua descrição e esconde a do primeiro; `aria-expanded` coerente; `IconeFrente` existe para os números 1–5.
- [ ] **Step 2: Run** — esperado FAIL.
- [ ] **Step 3: Implement** e substituir as seções `#conceito`/`#pilares` antigas pelas frentes; manter a faixa dos treze módulos só como linha discreta (chips pequenos) abaixo, sem cards grandes.
- [ ] **Step 4: Run** testes, lint, build.
- [ ] **Step 5: Verificação visual** em 375 px (cinco ícones cabem sem rolagem horizontal).
- [ ] **Step 6: Commit** `feat: capítulo das cinco frentes com ícones`

### Task 9: Capítulo final "O que fazer primeiro" e rodapé

**Files:**
- Create: `src/components/landing/Decisao.tsx`
- Modify: `src/pages/Landing.tsx` (remover seções antigas restantes: "como funciona" em cards, faixa beta em card gradiente; manter aviso BETA em uma linha)

**Interfaces:**
- Consumes: `BotaoVerCidade` (Task 4).
- Produces: `export function Decisao(): JSX.Element` — mostra três prioridades de exemplo (rótulo "Exemplo ilustrativo") em lista que se reordena ao clicar em "Priorizar" (família `.clique-controle`), e fecha com `BotaoVerCidade`.

- [ ] **Step 1: Write the failing test:** renderiza o link "Ver a minha cidade" apontando para `/app` e o rótulo "Exemplo ilustrativo".
- [ ] **Step 2: Run** — esperado FAIL.
- [ ] **Step 3: Implement** e finalizar `Landing.tsx` na ordem hero → dados → cálculo → frentes → decisão → rodapé; remover imports não usados.
- [ ] **Step 4: Run** `npm test`, `npm run lint`, `npm run build`.
- [ ] **Step 5: Verificação visual** da página inteira em 375 px e 1280 px; checar contraste dos textos sobre o mapa.
- [ ] **Step 6: Commit** `feat: capítulo final e rodapé da landing`

### Task 10: Tela de carregamento com o mapa

**Files:**
- Modify: `src/components/ui/index.tsx` (`Splash`, linhas ~207-216)
- Create: `src/components/ui/Splash.test.tsx`

**Interfaces:**
- Consumes: `mapa-ufs.json` (Task 2).
- Produces: `Splash` mantém a assinatura `{ texto?: string }`; passa a desenhar o contorno do Brasil com `stroke-dashoffset` animado (apenas `stroke-dashoffset`/`opacity`) e o texto padrão "Preparando a sua cidade…".

- [ ] **Step 1: Write the failing test:** `renderToString(<Splash />)` contém "Preparando a sua cidade"; com `texto="Abrindo…"` contém "Abrindo…"; contém `role="status"`.
- [ ] **Step 2: Run** — esperado FAIL.
- [ ] **Step 3: Implement.** Contorno único a partir dos caminhos das UFs (mesmo `d` concatenado), traço fino `--color-marca`, preenchimento que sobe devagar; em reduced-motion mostra o mapa estático com o texto. Importar o JSON de forma que não pese no bundle inicial do `/app` (Splash já roda no `Suspense`; aceitar o custo de ~25 KB e conferir no build).
- [ ] **Step 4: Run** testes, lint, build; comparar o tamanho do chunk principal com o anterior (anotar no commit).
- [ ] **Step 5: Verificação visual:** entrar em `/app` com a rede lenta (throttling) e ver o carregamento.
- [ ] **Step 6: Commit** `feat: carregamento com o mapa se desenhando`

### Task 11: Skill do projeto e verificação final

**Files:**
- Create: `.claude/skills/cidades-mil-design/SKILL.md`
- Modify: `docs/superpowers/specs/2026-11-13-landing-design.md` (status → "implementado")

- [ ] **Step 1: Write** a skill com: princípios (pouca informação por vez, clique revela), tokens de movimento e curvas, as quatro famílias de clique e quando usar cada uma, regras de mapa (camadas, só `transform`/`opacity`), regras de reduced-motion, lista do que evitar (cards de métrica em fileira, bordas e sombras iguais, radar decorativo, loading com spinner), e referências ao design doc.
- [ ] **Step 2: Run** `npm test && npm run lint && npm run build` — esperado tudo verde.
- [ ] **Step 3: Verificação real:** `npm run preview`, abrir em 375 px e 1280 px, rolar a página inteira, testar teclado, reduced-motion (emulação) e rede lenta; medir quadros do mapa com CPU 4× e confirmar nenhum quadro > 25 ms; registrar o resultado no PR.
- [ ] **Step 4: Commit** `docs: skill cidades-mil-design e status da landing`; abrir PR com prévia da Vercel e pedir ao usuário que teste no celular antes de ir para a main.

---

## Self-Review

- **Cobertura do design doc:** primeira tela e botão (T3, T4), dados chegam (T6), cálculo e consistência (T7), cinco frentes (T8), decisão (T9), nav e rolagem em capítulos (T5), famílias de clique (T1 + uso em T4–T9), carregamento (T10), `reduced-motion` (T1 e demais), skill própria (T11). Instalações do spec reduzidas ao que o plano usa: tokens do transitions.dev (T1) e `gsap` (T7); react-bits fica fora até algum componente ser realmente necessário, e taste-skill só como ideias.
- **Consistência de tipos:** `Vista`, `calcularZoom`, `enquadrar` definidos em T2 e usados em T3; `CAPITULOS` em T5 define os ids usados em `Capitulo` de T6–T9 (`dados`, `calculo`, `frentes`, `decisao`, `cidade`).
- **Proporção:** tarefas listam assinaturas, valores do spec e testes; corpos de função não foram escritos.
