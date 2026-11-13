---
name: cidades-mil-design
description: Regras de design e movimento da plataforma Cidades MIL (landing e telas). Use ao criar ou mudar telas, componentes, animações, cliques, rolagem, mapas ou carregamento, para manter a identidade e evitar a "cara de IA".
---

# Design Cidades MIL

Público da landing: instituições com missão em cidades, tecnologia e ética para o cidadão, e também gestor, secretário e prefeito (+40 anos), distantes da tecnologia. Querem algo **entendível, vivo, profissional e moderno**. Referências de linguagem: IPS Brasil e normas visuais do IBGE.

Doc de origem: `docs/superpowers/specs/2026-11-13-landing-design.md`.

## Pouco texto, muito símbolo
- Nenhum parágrafo da landing com mais de 25 palavras (há teste: `src/pages/Landing.texto.test.tsx`).
- Cada cena tem uma palavra ou expressão curta de rótulo; o resto é símbolo e movimento.
- Mostrar um mockup animado ao usuário antes de construir uma cena nova.
- Pessoas no centro, tecnologia em volta, ética no anel (balança); evitar velocímetro frio e flecha.

## Notícias e a hero
- A hero é um carrossel de notícias verificadas ("o futuro das cidades já começou"). Dados em `src/data/noticias.ts`; só aparece quem tem `verificada: true`.
- Conferir cada fonte com `npm run noticias:verificar` e lendo a página; texto de resumo e conexão é nosso; link `https` sem `utm_*`; foto só quando a página da fonte traz a foto da própria notícia (nunca o logotipo do órgão, que sugeriria endosso): copiada sem alteração para `public/noticias/`, com `alt` e crédito visível no cartão; sem foto, a ilustração do tema. O cartão inteiro abre a fonte em nova aba (link esticado no título).
- Linguagem de relação ("se relaciona com", "conecta com"), nunca "faz parte" nem endosso da UNESCO, de ministério ou do BNDES.
- Recência: "Hoje", "Ontem", "Há N dias" até 45 dias; depois a data.
- Contato: `CONTATO_URL` (equipe que coordena as Cidades MIL) fica vazio até haver endereço; o e-mail de `src/data/contato.ts` (`CONTATO_DESENVOLVIMENTO`) é de quem desenvolve o software.

## Carrossel
`Carrossel` é o padrão para sequências (notícias, cenas): rótulos de slide, só o atual no teclado (`inert`), pausa por foco, mouse, aba oculta e botão, sem autoavanço com movimento reduzido.

## Princípios
1. Pouca informação por vez. Um número em destaque por seção; no máximo três cards visíveis.
2. O que é clicável revela mais (painel, frase, acordeão). Nada de grade de métricas de uma vez.
3. Ambientes limpos, gráficos elegantes, textos curtos em português simples, sem jargão.
4. Uma seção leva à próxima: a página conta uma história (cidade → dados → cálculo → frentes → decisão).
5. Cada clique e cada rolagem têm sensação própria.

## Movimento
- Tokens em `src/styles/movimento.css` e `src/lib/tokensMovimento.ts`: 40/80/150/250/350/400/500 ms; curva suave `cubic-bezier(.22,1,.36,1)`; mola `cubic-bezier(.34,1.36,.64,1)`; zoom do mapa `cubic-bezier(.65,0,.35,1)`.
- Anime só `transform` e `opacity` (e `stroke-dashoffset`). Nunca `viewBox`, `width`, `top` por quadro.
- Mapa: camadas pré-desenhadas + Web Animations API (`MapaAproximacao`). Medir com CPU 4×: nenhum quadro > 25 ms.
- `prefers-reduced-motion`: sem deslocamento, só dissolvência curta; conteúdo sempre completo.
- GSAP/ScrollTrigger só onde a rolagem precisa guiar a cena (hoje: capítulo do cálculo), sempre via `import()`.

## Quatro famílias de clique (cada uma com movimento próprio)
| Classe | Quando | Movimento |
|---|---|---|
| `.clique-convite` | chamada principal | onda a partir do toque, `scale(.97)` |
| `.clique-escolha` | escolher uma opção | sobe 2 px e ganha anel |
| `.clique-detalhe` | revelar mais | painel abre por `grid-template-rows` + opacidade |
| `.clique-controle` | ligar/desligar, reordenar | chave com mola |
Botão principal: `BotaoVerCidade` (mapa que se aproxima + pino que cai).

## Acessibilidade
- Alvo de toque ≥ 44 px; foco visível; tudo que abre usa `aria-expanded`/`aria-pressed`.
- Nada que dependa só de hover. Contraste ≥ 4,5:1 com as cores de `src/index.css`.

## Evitar
- Cards de métrica em fileira, bordas e sombras iguais em tudo, radar decorativo, grafo frio de nós.
- Spinner genérico no carregamento (usar `Splash`, o mapa se desenhando).
- Números e texto demais na mesma tela; animações todas iguais.
- Nomes de arquivo que só diferem na caixa (macOS: `Decisao.tsx` × `decisao.ts`, `Carrossel.tsx` × `carrossel.ts`).

## Mapas
Contornos do IBGE gerados por `npm run mapa:gen` (`src/data/mapa-ufs.json`, `mapa-cidade-demo.json`); a landing não chama o IBGE em tempo de execução.
