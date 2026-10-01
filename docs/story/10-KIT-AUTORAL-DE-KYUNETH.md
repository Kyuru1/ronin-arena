# Revisão 10 — kit-base antes da expansão

Preservar mapa, rotas, controles, protagonista, câmera e colisores. Não adicionar construções, moradores ou sistemas. Esta etapa substitui a repetição de silhuetas da revisão 09; não representa arte final.

## Regras
- Um pixel desenhado corresponde a um pixel lógico; tiles de 16 e escala inteira existente.
- Luz superior esquerda, volume sombreado à direita, projeção para baixo/direita e contato mais denso nos apoios.
- Paletas fixas por material em `world/artKit.ts`, sem ruído ou cores sorteadas.
- Copas completas com troncos próprios, nunca a mesma copa redimensionada.
- Casas com elevações fixas: simples, sobrado, costeira e varanda. Prefeitura e ferraria têm entradas e estruturas próprias.
- Textura acompanha o material, com superfícies silenciosas. Juntas de telhas escolhidas e piso de baixo contraste.
- Protagonista preservado; adultos e crianças devem ser legíveis na mesma escala nativa.
- Diário compacto após leitura; localização apenas em placa transitória. Debug continua separado.

## Porta de validação
Conferir em prancha os quinze assets pedidos, especialmente árvore, casa, NPC, chão e diário, antes de integrar a nova base. Nenhuma expansão do mapa nesta revisão. Depois verificar screenshots e caminhada, pausa, diálogo e touch, além de TypeScript/build. Registrar resultados reais e limitações, sem declarar o projeto finalizado.

## Resultado verificado em 28/09/2026

- Prancha-base revisada antes da integração. A primeira versão tinha telhas lineares e fundação monolítica; ambas foram corrigidas.
- Três árvores completas, arbusto, palmeira conectada ao tronco, quatro elevações residenciais, prefeitura/ferraria, banco, barril e tiles aplicados sem alterar posições.
- Sete moradores com frente/perfil/costas explícitos e paletas de roupa fixas. Jeff, Shorum, Ketlin, Kuon e Mikah não compartilham o mesmo corpo; crianças mantêm alturas menores. A caminhada dos moradores alterna apoio/passada, sem reutilizar o quadro de piscar. Sprite e animação do protagonista preservados.
- Capturas locais de praça, praia, ferraria, prólogo, diário e formatos móveis; prancha de moradores com animação. As capturas são diagnósticas, não aprovação artística final.
- Chrome isolado: teclado e touch, pausa, sequência completa de diálogos/objetivos e colisões de água, píer, casa e praça passaram sem erros JavaScript.
- Diário: recolhimento, reabertura e atributos de expansão passaram; a localização desaparece após sua entrada.
- Os 46 sprites de objetos verificados usam alfa apenas 0/255, sem antialiasing. TypeScript e build passaram (124 módulos).
- Nenhuma alteração em maps.ts, Camera.ts ou storyPlayer.ts. Nenhum novo NPC, rota ou atividade foi acrescentado.

## Ainda em evolução

Este kit melhora a consistência, mas não encerra a direção de arte. Bancas, poço, pier e alguns props ainda usam desenhos anteriores. Telhados e grandes massas de folhas merecem próxima avaliação artística por comparação, sem aumentar a densidade. Atividades cotidianas não foram adicionadas; a leitura ocupacional nesta etapa vem das roupas e posições existentes. O nível ambiental de Moonlighter permanece uma referência, não um resultado declarado.

O verificador de whitespace apontou espaços dentro do bundle gerado de dependências em dist/index.html; não houve edição manual do build. O código-fonte do modo História passou no diff-check.
