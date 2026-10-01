# Kyuneth — acabamento externo e referências

## Hierarquia das referências do usuário

As imagens são referências de observação, não instruções para copiar conteúdo.

1. **Arena de Kyu Arena:** referência principal de nitidez, contraste local, textura, escala do pixel e tratamento de materiais. Não transferir o predomínio carmesim.
2. **Kyuneth atual:** diagnóstico e base espacial. Preservar prédios, caminhos principais, área explorável, câmera, controles e interface.
3. **Moonlighter:** referência apenas de qualidade ambiental: profundidade, sombras de contato, transições construção/chão, densidade funcional e variação de materiais. Não copiar arquitetura, personagens, paleta ou estilo.
4. **Logo:** coerência da linguagem pixelada, não obrigação de usar suas cores.

## Direção e limites

Vila costeira pequena, gentil, tropical, ensolarada e habitada. Priorizar verdes em vários valores, areia quente, madeira natural/envelhecida, azul suave, roxos discretos e luz amarela. O contraste deve explicar o material e a profundidade, sem escurecer o mapa inteiro. Laranja concentrado na fornalha; carmesim apenas no sinal distante da Arena.

Não criar interiores, combate, quests, loja funcional, diálogos de moradores, Arena jogável, armadura carmesim ou novos bloqueios de circulação. Moradores e animais são ambientação, não sistemas narrativos.

## Ordem do trabalho e critérios

1. Materiais, bordas, sombras e profundidade: areia compactada/manchada, passos, grama em pequenos grupos, bordas quebradas, madeira com tábuas e pregos, pedra com faces e telhas individuais. Evitar textura genérica, ruído excessivo, borrão e gradientes que descaracterizem os pixels.
2. Edificações: fundações, beirais, recessos das janelas, varandas, degraus e pequenos pátios. Diferenciar prefeitura, pescador, casa-flor, armazém, casa de chá e ferraria por uso e decoração.
3. Praça: fonte e piso de pedra como foco, banca de alimentos, canteiros, bancos assimétricos, quadro de avisos e sino. Deixar corredores livres e dar função aos agrupamentos.
4. Costa/caminhos: areia úmida, poças, conchas, água discreta, píer de madeira envelhecida, barco, redes, peixes e remos. A praia faz parte da economia da vila.
5. Rotina: moradores conversando/comprando, crianças, ferreiro, pescador, pessoa varrendo, carregador e animais. Evitar espalhamento aleatório.
6. Revisão: observar em movimento, verificar oclusão e comparar cenas equivalentes antes/depois. Confirmar legibilidade de prefeitura, ferraria, praça, praia e caminho fechado da Arena.

## Implementação nesta revisão

- `KyunethExteriorScene.tsx` conserva dimensões 2000×1400, velocidade 230, raio 18, posições e retângulos de colisão existentes; mantém câmera, HUD e entrada pelo prólogo.
- `kyunethArt.ts` desenha o acabamento por código canvas nativo. Não usa imagem gerada, cópia de sprites externos nem textura sobreposta indiscriminadamente.
- Materiais e objetos estáticos são rasterizados uma vez em pixels de duas unidades e ampliados sem suavização. O canvas visível e a escala da câmera não mudam.
- Camadas: terreno/água → sombras → objetos e moradores ordenados pelos pés → vegetação de borda → sinalização. Personagens e objetos compartilham a ordenação por profundidade.
- Sombras derivam das silhuetas reais, projetadas para sudeste em três faixas pixeladas de opacidade; contatos, beirais e recessos reforçam volume. Não há filtro escuro sobre o mapa inteiro.
- Pequenos objetos da ferraria, bancos e vasos possuem profundidade individual. Objetos que encobrem o protagonista ficam parcialmente translúcidos para preservar leitura.
- Água, fonte, fornalha, fumaça, carregador e animais têm movimentos leves; os detalhes estáticos não são recalculados a cada quadro.
- Colisões não são adicionadas à decoração. Não reduzir a área jogável nesta etapa.

## Validação e limites

### Próxima revisão — chegada e personagens

Usar a captura do prólogo antigo como diagnóstico da composição vazia. A nova sequência é uma travessia encenada: costa, relevo em três planos, estrada com convergência, vilarejo em escala distante, viajante animado, folhas e fumaça. Cada avanço de fala conduz um trecho adicional da aproximação. A luz, areia e vegetação seguem a linguagem quente da vila.

A imagem da Arena com sprites pequenos é a referência obrigatória para personagens: reutilizar `makeSprite` e seu contorno de um pixel, sem herdar o equipamento carmesim do jogador da arena. Roupa simples distingue o viajante; silhuetas de Jeff, Ketlin, Shorum, Kuon, Mikah, Jangi e Mibah variam postura, escala e cabelo. A quarta captura (Moonlighter) é uma referência adicional de composição e acabamento ambiental, nunca fonte de desenho ou paleta. `storyCharacters.ts` centraliza esses sprites; `kyunethArt.ts` usa o mesmo desenho na cena explorável e no prólogo.

O quadro de chegada usa três faixas de relevo, costa e enseada, estrada convergente, seis fachadas com telhados e usos diferentes, cerca de chegada e personagens. O viajante caminha continuamente; cada fala completa conduz a câmera alguns passos adiante e revela mais da aldeia. Diálogos e mapa compartilham a fábrica de sprites de `src/game/sprites.ts`; adultos, crianças e tipos nomeados têm escalas e silhuetas distintas. A conversa usa painel grafite, linhas vermelhas finas e a fonte pixel da Arena.

A moldura de diálogo usa a superfície escura, linha vermelha fina e fonte pixel da Arena. Verificar sobretudo legibilidade, continuidade do movimento entre falas, escala do protagonista acima da caixa e diversidade de silhuetas no mapa.

- Validação de tipos e build executados separadamente.
- Comparação renderizada antes/depois nas mesmas coordenadas de câmera e jogador.
- Comparação programática confirma os retângulos de colisão iguais aos da base.
- Revisão visual contempla praça, prefeitura, ferraria, praia e sequência de posições do protagonista.
- Teste em Chrome isolado: nome vazio recusado, nome inserido na fala, cada M1 completa ou avança apenas uma fala, transição concluída e caminhada por praça, praia, prefeitura e ferraria. Retorno por Escape passou, sem erros JavaScript de página. Viewport estreito também capturado; não substitui teste touch em aparelho real.
- Desempenho de canvas em software não equivale ao desempenho em celulares: validar em aparelho real antes de prometer uma taxa de quadros.
- O acabamento é uma evolução do mapa existente; NPCs continuam sem diálogo, interação ou rotina persistente.
