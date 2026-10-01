# Revisão do prólogo e da chegada — 25/09/2026

## Prioridade e diagnóstico

O protagonista aparecia na tela de Kyuneth, mas o primeiro quadro de animação podia receber um tempo ligeiramente negativo. Isso selecionava um sprite inexistente, interrompia o desenho do canvas e, junto com ele, o loop de movimento. A câmera inicial também enquadrava a praça em vez do ponto de chegada, deixando o jogador fora da tela.

## Implementação verificada

- A mesma entidade `StoryPlayerEntity` é criada após o nome e atravessa prólogo, transição e exterior.
- Durante as falas e a apresentação da chegada, o movimento fica bloqueado. Após a entrada, WASD, setas, controles touch e eixo do gamepad usam o mapeamento recebido do jogo.
- O movimento é bidirecional nos eixos e resolve colisões por deslizamento. Construções, cercas, árvores, palmeiras, fonte, mobiliário e limites compartilham a disposição do cenário.
- O sprite do viajante tem poses frontal, dorsal e lateral, ciclo de caminhada, sombra de contato e roupa simples sem carmesim.
- A câmera começa na entrada, segue o protagonista com suavização e respeita os limites do mapa.
- O prólogo recebeu bordas de caminho quebradas, chão gasto, marcas de rodas, vegetação de margem, sol pixelado e marcas de relevo ao fundo. A vila existente foi preservada.

## Verificação executada

- `npx tsc --noEmit` e `npm run build`: sem erros.
- Jornada no navegador local: menu → nome → oito falas individuais → entrada → praça → menu.
- Durante a chegada: posição do jogador permaneceu estável.
- Após a chegada: caminhada para norte, oeste, sul e leste detectada no canvas; a câmera acompanhou a subida.
- Fonte: o personagem parou ao colidir.
- Escape: retorno ao menu.
- Erros de página/console: nenhum no percurso testado.

## Limite desta revisão

O teste automatizado de navegador cobre desktop e a colisão da fonte. A inspeção visual cobre capturas do prólogo e da entrada; controles touch/gamepad, todas as bordas e todas as colisões ainda merecem uma passada manual em dispositivo e com controle físico. O acabamento autoral do prólogo pode continuar a evoluir sem alterar o fluxo ou reconstruir o mapa.
