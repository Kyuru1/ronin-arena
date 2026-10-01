# Revisão 13 — estrutura visual exclusiva dos personagens

A aparência dos personagens do modo História reside em `src/story/characters/`. Esta revisão preserva `storyPlayer.ts`, rotas de NPC, `maps.ts`, câmera, colisores, controles e o fluxo narrativo. A referência visual e os atlas da revisão 12 continuam sendo a fonte das pessoas.

## Responsabilidades

- `catalog.ts`: identidade de protagonista, moradores, criança, personagens especiais e animais; altura, velocidade visual e partes disponíveis. Cada morador usa sua coluna própria no atlas.
- `atlas.ts`: recortes e cache de quadros de tamanho fixo, com âncora comum nos pés. Frente, costas e ambos os perfis têm fontes direcionais explícitas. A linha esquerda dos moradores é orientada para a esquerda uma vez; ela não reutiliza a linha direita.
- `parts.ts`: divide cada pixel opaco humano em uma das camadas de corpo, cabeça, cabelo, rosto, olhos, roupa, braços, pernas, mochila ou acessório. A classificação mantém as camadas editáveis separadamente sem alterar a entidade física.
- `protagonist.ts`: compõe o viajante a partir da própria folha de caminhada. Cabeça, cabelo, rosto, roupa e tronco vêm da mesma pose estável em todos os quadros da direção; os braços e pernas vêm dos quatro quadros desenhados da folha. Idle usa a mesma identidade da caminhada. `ProtagonistAppearance` permite substituir qualquer camada por um canvas próprio e ajustar o olhar em até um pixel, independentemente do movimento.
- `residents.ts`: mantém quadros base e partes próprios para os sete moradores, incluindo a criança e os dois especiais.
- `animals.ts`: cão e galinha possuem desenhos pixelados específicos para frente, costas e cada perfil, com quatro variações de passo.
- `animation.ts`: guarda o estado visual por ID, incluindo idle, início, parada, virada e caminhada. Não controla posição.
- `renderer.ts`: compõe as partes em resolução nativa e desenha por âncora nos pés. O `WorldRenderer` apenas o chama dentro da fila de profundidade.

`referenceArt.ts` decodifica as folhas uma vez e passa as de pessoas ao módulo exclusivo. `storyCharacters.ts` permanece somente como fachada do renderer legado. Animais entram na mesma fila visual dos demais atores e mantêm as coordenadas e a ausência de colisão existentes.

## Critérios visuais

A pose de costas usa sua própria linha do atlas e mantém cabelo, ombros, lenço, alça da bolsa, braços alternados, pernas e sombra de contato nos mesmos pontos de ancoragem. A folha do protagonista fornece movimentos de membros desenhados; a composição congela cabeça e tronco por direção para evitar mudanças de identidade e largura. Moradores recebem passos de um pixel aplicados apenas às camadas de braços e pernas, sem saltar o sprite inteiro. Os perfis são conferidos individualmente.

A folha de comparação `artifacts/kyuneth-13/characters.html` e `verify.mjs` renderiza os dez personagens parados e caminhando em quatro direções. O relatório verifica existência de quadros, quatro estados de caminhada distintos, estabilidade dos pixels da cabeça e do centro do tronco, e diferenças entre frente/costas e esquerda/direita. As capturas permitem inspeção visual direta; o teste automatizado complementa, mas não substitui, essa inspeção.
## Verificação executada

Em 29/09/2026, `npx tsc --noEmit` e `npm run build` passaram. `artifacts/kyuneth-13/report.json` registra dez personagens × quatro direções, idle e quatro quadros de caminhada, sem erros de identidade de cabeça/tronco ou perfis coincidentes. O teste confirmou que trocar apenas o cabelo e deslocar apenas o olhar alteram o quadro do protagonista. As imagens `protagonist.png`, `residents.png` e `animals.png` foram inspecionadas visualmente.

Os verificadores existentes `artifacts/kyuneth-12/verify-render.mjs` e `verify-ui.mjs` passaram: atlas/terreno e o fluxo menu → prólogo → exploração → pausa → continuar permaneceram funcionais.

