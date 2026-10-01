# Revisão 11 — proposta visual aprovada

Aplicar a direção aprovada em 29/09/2026: vila costeira luminosa, madeira mel, telhas verdes, areia quente e mar turquesa; personagens com contorno da Arena, roupa simples e vistas coerentes.

Escopo autorizado: arte nativa, animação visual e enquadramento/zoom. Preservar mapa 800 × 864, posições, colisores, movimento, rotas, diálogos, menus, persistência e gameplay. A aprovação posterior substitui a restrição anterior de não programar.

- Viewport usa escala física inteira, ocupa a tela e preserva o seguimento existente.
- Personagens recebem desenhos nativos maiores, quatro fases de passada com braços opostos às pernas, frente/costas/perfil e idle independente.
- Paletas e volumes ambientais seguem luz superior esquerda, contato nos apoios, telhados com espessura e vegetação com recortes de folhas.
- Objetos novos desenhados dentro dos sprites são apenas detalhes visuais, sem entidades nem colisores novos.
- Validar TypeScript/build, comparar capturas de praça/praia/prólogo e inspecionar sprites e viewport em desktop e celular. Registrar limites reais; a imagem conceitual não equivale a screenshot do jogo.

## Implementação e validação — 29/09/2026

- Viajante e sete moradores com novos desenhos nativos, cabelo, acessórios, avental, bengala, cesta e roupas distintas. Ketlin usa blusa clara e saia lilás; Mibah, xale e saia clara; o viajante mantém túnica simples e bolsa.
- Passadas em quatro direções usam pernas/joelhos e braços em oposição, com assentamento de um pixel. Piscar e gesto de idle ficam separados da caminhada e têm fases diferentes por morador.
- Viewport preenche a tela com escala inteira no framebuffer, inclusive em retrato. O seguimento e os limites do mundo permanecem os existentes.
- Paleta costeira, telhas menores com espessura de beiral, detalhes de madeira, floreiras, folhas agrupadas, palmeiras serrilhadas, bancas com produtos, poço, fogo e ondas em duas faixas. Nenhum objeto/collider/rota foi adicionado ao mapa.
- `npx tsc --noEmit` passou. Chrome headless percorreu a interface real: escolha de computador, História, nome, prólogo, falas até a chegada, pausa/continuar e caminhada; nenhum erro JavaScript foi capturado e o nome permaneceu na sessão.
- Capturas da interface em 1366 × 768, 390 × 844 e 844 × 390; inspeção adicional do cálculo de viewport em Full HD, ultrawide e DPR 3. Sprites ambientais com alfa somente 0/255.
- Evidências em `artifacts/kyuneth-11/`: `praca.png`, `praia.png`, `ferraria.png`, `personagens.png`, `prologo-interface.png`, `exploracao-interface.png`, `celular-vertical.png` e `celular-horizontal.png`.

A referência aprovada orientou paleta, materiais, roupas e proporções. As capturas são da implementação no canvas, não da imagem gerada. A densidade dos materiais permanece mais simples que a ilustração conceitual; não se declara equivalência pixel a pixel nem acabamento comercial idêntico. O teste móvel exercitou enquadramento responsivo; não é uma validação de hardware touch físico.

## Continuação — volumes e materiais

Copas redesenhadas como volumes de ramos sobrepostos, com três composições distintas, folhas interligadas e sombra inferior; retirado o passe antigo de detalhes aplicado por máscara em AssetManager. Venezianas, recuo de janelas, dobradiças, grãos da porta e faces das telhas receberam acabamento adicional. Bolsa, gola e barba dos personagens foram refinadas. Nenhuma mudança em mapa, colisores, rotas, diálogos ou controles.

Verificação final deste passe: TypeScript e build passaram (124 módulos); capturas do renderer sem erros JavaScript e alfa parcial dos sprites ambientais igual a zero. Evidências atualizadas em artifacts/kyuneth-11, incluindo caminhada.webp com os quatro quadros reais a 8 fps nas quatro direções. O fluxo de interface já havia passado na revisão 11 e não foi alterado neste passe. A imagem conceitual continua mais detalhada que os ativos nativos; as capturas registram o resultado real sem alegar reprodução idêntica.
