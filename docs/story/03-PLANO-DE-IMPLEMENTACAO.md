# Modo História — plano e decisões da V1

## Fonte de verdade

1. `02-ESPECIFICACAO-INTRO.md` define comportamento e aceite.
2. `01-VISUAL-KYUNETH.md` define a composição e a identidade visual de base.
3. `04-BRIEFING-VIDA-E-PROFUNDIDADE.md` define a evolução visual do mapa sem reconstruí-lo.
4. `05-ACABAMENTO-E-REFERENCIAS.md` registra a hierarquia das imagens e o acabamento de materiais, sombras e camadas.
5. Este documento registra como a versão foi implementada e o que continua pendente.

Se uma ideia futura conflitar com o escopo da V1, preservar a V1 e registrar a expansão antes de codificá-la.

## Arquitetura escolhida

O modo História fica isolado da engine de combate:

- `src/story/StoryMode.tsx`: máquina de estados local (`name`, `intro`, `transition`, `kyuneth`).
- `src/story/storyContent.ts`: falas e textos narrativos.
- `src/story/DialogueController.tsx`: escrita e avanço M1 determinístico.
- `src/story/NameInputState.tsx`: formulário e validação.
- `src/story/IntroCutsceneState.tsx`: cenário da viagem e apresentação narrativa.
- `src/story/KyunethExteriorScene.tsx`: canvas da vila, câmera, colisões e controles.
- `src/story/storyPlayer.ts`: entidade persistente do protagonista durante todo o fluxo, com estado de posição/direção e movimento que desliza ao longo das colisões.
- `src/story/kyunethArt.ts`: renderizador visual separado, materiais/sprites cacheados, sombras e ordenação por profundidade.
- `src/story/types.ts`: `PlayerData` e tipos compartilhados.
- `src/story/story.css`: apresentação visual exclusiva do modo.

`App.tsx` conhece apenas a nova fase `story`, e `MainMenu.tsx` recebe o callback `onStory`. A engine atual de Arena não ganha condicionais de narrativa.

## Decisões da primeira versão

- O nome usa `sessionStorage`: persiste durante a sessão, mas não cria ainda um save narrativo permanente.
- A cutscene é desenhada com composição pixel-art em CSS/canvas e movimento ambiental leve; não exige ativos externos.
- O exterior é um mapa top-down desenhado por primitivas pixeladas, com colisões declarativas para prédios e limites.
- O protagonista tem roupa areia/azul-petróleo, mochila simples e sem elementos carmesim.
- A saída da Arena é visível, porém bloqueada e não interativa.
- Placas e HUD de exploração dão legibilidade sem iniciar diálogos de NPC.

## Pontos de extensão futuros

- Entidades/NPCs podem ser adicionados à cena sem alterar o controlador de diálogo.
- Novos capítulos podem reutilizar `DialogueController` e ampliar a máquina de estados.
- Portas podem virar gatilhos de cenas interiores quando esses mapas existirem.
- Quests e persistência permanente devem receber documentos próprios antes da implementação.

## Checklist de verificação

- `npx tsc --noEmit` para validar tipos e `npm run build` para gerar a distribuição (Vite não substitui a validação de tipos).
- Testar confirmação do nome por Enter e botão.
- Testar clique durante e depois do typewriter.
- Testar retorno ao menu pela tela de criação, cutscene e vila.
- Testar movimento, colisões e câmera em tamanhos desktop e mobile.
- Confirmar que Jogar e Coop continuam acessíveis.
- Reproduzir o fluxo no navegador: protagonista visível na entrada, bloqueado durante a apresentação, depois navegável por teclas configuradas/setas/touch; testar fonte, cercas, árvores e retorno por Escape.
