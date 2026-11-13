---
name: react-bits
description: Como usar componentes do React Bits (micro-interações, textos animados, fundos) no projeto Cidades MIL, com o comando de instalação, quais servem e as regras. Use ao precisar de um controle ou efeito interativo pronto (chave, segmentado, cartão que vira, tooltip, status) antes de escrever do zero.
---

# React Bits no projeto Cidades MIL

Biblioteca aberta de componentes React (`https://reactbits.dev`). O catálogo completo e atualizado está em `https://reactbits.dev/llms.txt`; ler esse arquivo quando precisar de um componente que não está abaixo.

## Como instalar um componente (versão grátis)

Variante do projeto: **TypeScript + Tailwind** (`TS-TW`).

```bash
npx shadcn@latest add https://reactbits.dev/r/<Componente>-TS-TW
```

- `<Componente>` em PascalCase (ex.: `FlipCard`). Alternativa: `npx jsrepo@latest add https://reactbits.dev/r/<Componente>-TS-TW`.
- Se o comando pedir `components.json`, rodar `npx shadcn@latest init` só depois de avisar o usuário (ele cria arquivos na raiz), ou copiar o código do componente manualmente da página do site para `src/components/ui/`.
- O componente é copiado para o projeto: depois de instalar, **ele passa a ser nosso código**: ler, ajustar às regras abaixo e cobrir com teste.
- Conferir e instalar as dependências do componente (muitas usam `gsap`, `motion`, `three` ou `ogl`). Três.js e ogl só com justificativa: pesam no celular.
- **Nunca** usar comandos `@reactbits-starter/...`: são do React Bits Pro, pago e com licença.

## O que serve para nós (Micro, leves)

| Necessidade | Componente |
|---|---|
| Alternar critério (urgente × fácil) | `RubberSegment` |
| Chave liga/desliga | `SquishSwitch` |
| Cartão que vira para mostrar o nome (13 áreas) | `FlipCard` |
| Tooltip com rótulos nos ícones da navegação | `WarmTooltip` |
| Estado de uma evidência (pendente, em revisão, validada) | `StatusMark` |
| Medidor de cobertura | `SloshGauge` |
| Seleção com destaque que desliza | `GlideSelect` |
| Caixa de seleção | `SpringCheck` |
| Linha de lista deslizável | `SwipeRow` |

Evitar: fundos 3D, `PaperCrumple`, `Shredder`, `SlingButton` e outros "de impressionar": viram cara de template.

## Regras

- Licença: livre para usar no produto; não revender o componente como biblioteca.
- `prefers-reduced-motion`: ajustar o componente para parar o movimento e manter o conteúdo.
- Acessibilidade: rótulo, foco visível, teclado e alvo de toque de 44 px conferidos antes de aceitar.
- Cores e tempos do projeto (`src/index.css`, `src/styles/movimento.css`); trocar os do componente.
- Preferir o que já existe no projeto ou uma implementação curta nossa quando o componente trouxer mais dependência do que valor.
