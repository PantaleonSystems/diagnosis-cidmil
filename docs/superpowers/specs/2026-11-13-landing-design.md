# Landing Cidades MIL — design da nova história

Data: 2026-11-13 · Status: implementado na branch `landing-nova-historia` (plano em docs/superpowers/plans)

## Objetivo
Tirar a "cara de IA" da landing e entregar uma página leve, dinâmica e profissional para gestor, secretário e prefeito acima de 40 anos, distantes da tecnologia: entendível, viva, moderna. A ferramenta é um sistema conectado (dados, cadastros, vários lugares) que centraliza e calcula e entrega **consistência**, não só um índice.

Fora de escopo: o app interno (fica para outra etapa), além da tela de carregamento ao entrar.

## Princípios
- Pouca informação por vez; o que é clicável revela mais.
- Ambientes limpos, gráficos elegantes, um número em destaque por vez.
- Seções com sequência de história, uma levando à outra.
- Cada clique e cada rolagem têm uma sensação própria; nada igual.
- Referência de linguagem: IPS Brasil e normas visuais do IBGE.

## Espinha da história: "A cidade do gestor"
1. **Primeira tela:** mapa que se aproxima (Brasil → estado → município) em camadas (`transform` e `opacity`, WAAPI), sem recalcular o desenho a cada quadro. Botão "Ver a minha cidade": o mapa se aproxima dentro do botão e o pino cai (variante B aprovada). Mapas reais das malhas do IBGE.
2. **Os dados chegam:** território com fontes (cadastros, órgãos, secretarias) ligadas à cidade; pontos clicáveis abrem uma frase humana. Substitui o grafo frio da Rede.
3. **O cálculo:** o dado entra, é conferido e vira um selo de consistência junto com o índice; um número em destaque por vez.
4. **As cinco frentes:** ícones; cada um abre um painel ao clicar.
5. **A decisão:** "o que fazer primeiro", fechando a história e levando ao botão.

## Componentes e movimento
- **Nav:** translúcida e fina, marca + um botão; marcadores de capítulo que acompanham a rolagem.
- **Cliques em quatro famílias:** convite, escolha, detalhe, controle, cada uma com movimento próprio.
- **Rolagem em capítulos:** texto entra subindo suave; número do capítulo marca o ponto da história.
- **Carregamento ao entrar no sistema:** o mapa se desenhando + "Preparando a sua cidade".
- **Acessibilidade:** `prefers-reduced-motion` troca movimento por dissolvência; foco visível; contraste AA.

## Construção
- CSS puro com os tokens do transitions.dev (40/80/150/250/350/400/500 ms; `cubic-bezier(.22,1,.36,1)`; bounce `cubic-bezier(.34,1.36,.64,1)`) e molas de `src/lib/movimento.ts`.
- GSAP + ScrollTrigger só na rolagem em capítulos.
- react-bits: 3 a 5 componentes pequenos copiados; sem instalar o pacote.
- taste-skill: só como lista de ideias, sem instalação.
- transitions.dev: tokens e 3 a 4 transições grátis.
- Criar skill do projeto `cidades-mil-design` com estas regras, depois da aprovação.
- Alvos de código: `src/pages/Landing.tsx`, `src/components/landing/*` (RedeCidades, SimuladorIndice, indice).

## Critérios de pronto
- Animação do mapa a 60 qps no celular real, sem salto nem quadro vazio.
- Nenhuma seção com mais de um número em destaque ou mais de três cards visíveis de uma vez.
- Cada família de clique com movimento distinto e `reduced-motion` funcionando.
- Mobile primeiro (375 px) sem rolagem horizontal; testado em produção na Vercel.

## Riscos
- Desempenho em celular fraco: validar com a página `mapa-liso` e em aparelho real antes de fechar.
- Excesso de movimento: limitar a um movimento principal por tela.
- Licença react-bits (MIT + Commons Clause): usar só componentes copiados e conferir o uso.

## Revisão 1 (após teste do usuário)
- **Hero:** linguagem "reunimos dados da rede, de plataformas e de portais de transparência e os processamos"; verbos Analisar · Diagnosticar · Medir · Propor · Ajudar.
- **Fontes:** o diagrama virou um caminho legível em três etapas (1 De onde vem → 2 Reunimos e conferimos → 3 O que a cidade recebe), com nomes sempre visíveis e linhas que fluem. Linguagem de lugares (portais, cadastros públicos, projetos, valores da cidade), sem "bases" soltas.
- **Cálculo:** mesma troca de linguagem (fontes, não "dados"/"bases").
- **13 áreas:** cartões inclinados com símbolo; o nome aparece no hover, foco ou toque.
- **Prioridades:** quadro de gestão com urgência, complexidade, prazo e o porquê de cada posição.
- **Pendente (decidido adiar):** deixar o usuário escolher onde observar no mapa durante a ampliação.

## Revisão 2 (hero em notícias e blocos visuais)
- **Público:** instituições com missão em cidades, tecnologia e ética para o cidadão (além do gestor municipal). Botão principal: "Ver uma cidade em demonstração".
- **Hero:** "O futuro das cidades já começou." com um carrossel de notícias verificadas (IA, cidade, cidadão, fundamentos MIL), selo "Atualizado em" e recência ("Há 3 dias"). Cada cartão tem ilustração própria, data, fonte e um "Ver conexão" que abre o resumo e o link.
- **Política de notícias:** só entram verificadas na fonte; textos nossos; linguagem de relação, nunca de afiliação ou endosso; sem imagens de terceiros; sem `utm_*`.
- **Demonstração:** o mapa que se aproxima passa para um capítulo próprio, com quatro números ilustrativos e o plano de ação em ícones.
- **Blocos novos:** fontes que compartilham com a cidade (fios e bolinhas que vão e voltam); "O que a cidade recebe" vira carrossel de cenas (Avaliação, Pessoas no centro com tecnologia em órbita e a balança da ética, Atividades).
- **Pouco texto:** nenhum parágrafo com mais de 25 palavras; símbolo e movimento no lugar de frases.
- **Saúde:** coração com pulsação.
- **Depois:** notícias atualizáveis sem deploy (tabela no Supabase) e escolha de onde observar no mapa.
