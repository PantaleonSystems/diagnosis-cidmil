# SPEC: vídeo pitch Cidades MIL (para aprovação)

> Status: **proposta, nada foi produzido.** Este é o briefing do filme, com número onde
> normalmente haveria adjetivo. Quando aprovado, vira o `SPEC.md` do projeto HyperFrames.

```text
GOAL:    quem assistir toca no link e testa a plataforma.
OUTPUT:  HyperFrames, 1080 x 1920 (9:16), 30 fps, mp4
TIME:    34 s x 30 fps = 1020 frames
SOM:     sem narração e sem legenda. Música instrumental leve + efeitos nas ações visíveis,
         se houver fonte de música (ver "Pendências"); senão, entrega muda e avisa.
```

## Roteiro em uma linha

Abertura: **"Toda a teoria das Cidades MIL. Em um único link."**
Meio: quatro verbos, cada um com telas reais do app: **ENXERGAR, MEDIR, CENTRALIZAR, PROPOR.**
Visão: coleta automática de dados, marcada **EM CONSTRUÇÃO**.
Fecho: **"Informação com ética. Decisão com a cidade."** + logo + link + "BETA aberto".

## LOOK

- **Chão de abertura e de fecho:** azul da marca `#0A5A96`, chapado, sem gradiente, sem textura.
  Texto em branco `#FFFFFF`. Uma palavra por quadro em azul claro `#9CCBEA` (o acento, que carrega sentido).
- **Chão das cenas de produto:** `#F4F9FC`. Tinta `#052F4D`. Palavra-chave do verbo em `#054C7C`.
- **Cores semânticas do app** (só onde o próprio app as usa): laranja `#E0603E` alerta, verde `#3DB18C` melhora.
- **Tipografia:** Montserrat 700 nos títulos (112 px nas frases, 96 px nas palavras-chave, tracking -2%,
  entrelinha 1,05); Inter 400/700 nos textos pequenos (mínimo 28 px depois de qualquer ampliação). Ambas já vêm no HyperFrames.
- **Alinhamento:** títulos à esquerda, margem de 96 px. Nada centrado por padrão; o centro é só o fecho.
- **Produto:** capturas em vídeo do app real (390 x 844, escala 3x), ampliadas de 1,6 a 2x e **recortadas** no que a cena usa.
  Nunca uma janelinha no meio de um quadro vazio. Largura da tela de produto: 920 px, sombra 0 24 px blur 48 px,
  opacidade 0,16 na cor `#052F4D`. Nada inclinado em 3D.
- **Cursor:** 54 px (5% da largura), entra de fora do quadro, o clique causa a próxima coisa no mesmo quadro.
- **Logo:** o arquivo do app, `public/logo-cidades-mil.svg`, sem redesenhar. Não fica no canto. Aparece na abertura
  e no fecho, a 28% da largura (302 px).
- **Segurança de enquadramento:** conteúdo dentro de 90% (margens de 96 px); a frase de abertura dentro do recorte 4:5
  central (y de 285 a 1635), porque o WhatsApp mostra a miniatura recortada.

## MOTION

- **Chegada:** `expo.out`, 18 frames. **Câmera e inundação de cor:** `power2.inOut`, 14 a 18 frames.
  **Saída e zoom:** `power3.in`, 8 a 10 frames (saída 40 a 50% mais curta que a chegada).
- **Títulos:** entram palavra a palavra, desfoque 6 px para 0 em 4 frames, 3 frames entre palavras, **sem deslizar**.
  Depois de pousar, o título fica imóvel até sair.
- **Mola:** só em posição e tamanho (chave do simulador, bolhas do GUT), amortecimento 0,85. Opacidade e cor nunca quicam.
- **Sobreposição:** o próximo elemento começa quando o anterior está em 30 a 50%.
- **Transições (4 tipos, cada uma com causa na tela):** inundação de cor (da abertura para ENXERGAR e de PROPOR para o
  fecho); o cartão tocado vira a tela; troca com desfoque no mesmo palco (entre os verbos); varredura horizontal curta
  (de ENXERGAR para MEDIR).
- **Proibido:** respiração, flutuação, pulsar em loop; título que continua se mexendo; aro de clique; tudo entrando igual.

## SHOTS (frames a 30 fps)

| Frames | Cena | Movimento principal | O que o espectador lê (janela) | Som | Passagem |
|---|---|---|---|---|---|
| 0 a 120 (0 a 4 s) | **Abertura** | Quadro 0 já tem "Toda a teoria das Cidades MIL." na tela. "Em um único link." pousa palavra a palavra (frames 18 a 42). A logo desenha o anel em 24 frames (de 60 a 84). | As duas frases, 2 s cheios | tick suave nas palavras novas | a logo cresce até virar o chão: inundação de cor para `#F4F9FC` (frames 104 a 120) |
| 120 a 300 (4 a 10 s) | **ENXERGAR** | Palavra-chave pousa em 12 frames. Em seguida o app: lista de cidades, o cursor toca em "Município Exemplo" (clique no frame 170), a tela vira o Panorama e a régua dos 4 níveis preenche (nota 2,55). | "ENXERGAR", a nota e o nível | clique no 170; pop na nota | desfoque no mesmo palco |
| 300 a 480 (10 a 16 s) | **MEDIR** | Panorama de perto: cinco áreas crescem; o radar se forma; zoom no aviso da Regra de Ouro; depois a régua de um indicador na avaliação guiada. | "MEDIR", "Nota calculada, não digitada" | tick na régua | varredura horizontal curta |
| 480 a 600 (16 a 20 s) | **CENTRALIZAR** | A tela da Rede: as cidades lado a lado, com a semelhança. Empurra 1,6x em um par de cidades. | "CENTRALIZAR", "uma cidade ao lado da outra" | pop | desfoque no palco |
| 600 a 840 (20 a 28 s) | **PROPOR** | (a) Conclusões 600 a 660: o cursor confirma, o quadro "Seu plano está tomando forma" conta de 0 a 1 e a frase muda. (b) Simulador 660 a 750 (o pico): as três chaves de Governança ligam, o marcador vai de 2,55 a 2,64, aparece "Nível 3 (Participativa)" e o aviso verde. (c) Prioridade 750 a 800: bolhas e lista se reordenam. (d) Decisão 800 a 840: "Aceitar" ganha o verde. | "PROPOR", "2,55 → 2,64", "Nível 3" | clique em cada toque; pop no número; riser curto antes do pico | o botão "Aceitar" cresce até o fecho (inundação de cor para `#0A5A96`, frames 826 a 840) |
| 840 a 900 (28 a 30 s) | **EM CONSTRUÇÃO** | Cinco quadradinhos (bases públicas) ligam-se por linhas ao anel da logo, que se completa. Etiqueta "EM CONSTRUÇÃO" em Inter 700. | "Coleta automática de dados", "EM CONSTRUÇÃO" | tick | o anel vira o fecho |
| 900 a 1020 (30 a 34 s) | **Fecho** | "Informação com ética. Decisão com a cidade." palavra a palavra (900 a 948). Logo a 28% da largura. Botão retangular (raio 16 px) "Teste agora" e o endereço. Frames 960 a 1020 totalmente parados. | a frase, depois "BETA aberto · diagnosis-cidmil.vercel.app" | riser até o frame 948, impacto na logo, música com fade | fim (60 frames de espera) |

## OBJETOS (tudo vem do app real)

- Telas: capturas em vídeo do site publicado, estado da cidade de demonstração (nota 2,55).
  A cidade de demonstração é fictícia e o app a marca como "DEMONSTRAÇÃO"; essa marca fica visível.
- Números da cena PROPOR: 2,55 e 2,64 foram conferidos no app (simulador com as três ações de Governança).
  **Nenhum número inventado** em nenhuma cena.
- Cena EM CONSTRUÇÃO é a única que não é produto: é gráfico e vem rotulada como visão.

## BANNED

Os padrões de vídeo gerado (vazio escuro com elementos flutuando, brilho, gradiente roxo ou azul, vidro, tudo centrado,
tudo aparecendo de uma vez, texto que se mexe enquanto se lê, logo no canto, três cartões em fila, título sobre captura
escurecida, painel inventado) **mais**, neste filme:
- navy escuro como chão (o azul é o da marca, `#0A5A96`, chapado);
- pílulas e chips decorativos (o BETA e os chips que aparecem são os do próprio app);
- rótulos numerados "01/02";
- aros de clique, respiração, loops decorativos;
- afirmar como pronto o que é visão (coleta automática, bases externas).

## QA (quadros a conferir)

| Quadro | Deve mostrar |
|---|---|
| 0 | a frase de abertura inteira legível, sem a logo ainda (miniatura boa) |
| 84 | a logo com o anel completo, a 28% da largura, sem cortar |
| 170 | o cursor no cartão da cidade, o toque acontecendo |
| 260 | a nota 2,55 e a régua dos níveis, legíveis a 360 px |
| 330 | as cinco áreas crescendo, o radar |
| 740 | o simulador em 2,64, "Nível 3 (Participativa)" e o aviso verde |
| 870 | "EM CONSTRUÇÃO" legível |
| 1000 | frase de fecho, logo, botão e endereço, tudo parado |

## Pendências para começar

1. **Aprovar este SPEC** (frases, ordem, cenas, o que é visão).
2. **Capturas:** gravar o app real com ações roteirizadas, sem gravar nada no banco. As capturas usam só leitura e o
   estado local da aba; cada captura cria uma sessão anônima, como qualquer visita.
3. **Música:** o HyperFrames busca trilha pelo catálogo da HeyGen (precisa de login) ou usa um arquivo seu. Sem uma
   fonte, o vídeo sai mudo e eu aviso.
4. **Endereço:** `diagnosis-cidmil.vercel.app` ou um endereço próprio mais curto, se existir.
5. **Citar a UNESCO?** Não está no filme. Só entra se a equipe confirmar como a relação deve ser citada.
