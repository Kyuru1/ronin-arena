# 09 — Formas, materiais e diário de viagem

Passe incremental de arte, não versão final. Este pedido autoriza apresentação de objetivos e refinamento de diálogos, mas preserva controles, movimento, câmera, colisões, mapa e narrativa do prólogo. Os limites desta etapa prevalecem sobre permissões mais amplas dos documentos anteriores.

## Direção

Luz do alto esquerdo, verdes costeiros, sombras frias e materiais quentes. Copas com massas assimétricas e recortes em degraus; objetos com contato e faces próprias; telhas sobrepostas, madeira gasta e pedra irregular. Texturas em grupos colocados, sem ruído ou filtro. Arte rasterizada em pixels inteiros, compartilhada pelo prólogo e vila. Manter o protagonista e a escala atual da Arena.

## Apresentação

Exploração mostra um diário compacto à esquerda, localização transitória e botão discreto de pausa. Instruções ficam na pausa; informações técnicas somente em desenvolvimento com `?storyDebug=1`. Controles touch continuam disponíveis como controles funcionais. Diálogos não mostram contadores. A progressão do diário apenas observa locais já visitáveis, sem recompensas, bloqueios, diálogos novos ou missões funcionais. Visitar a prefeitura significa chegar ao exterior; nenhum interior é prometido.

## Verificação

Comparar praça, praia, ferraria e prólogo com as três capturas fornecidas. Observar caminhada, oclusão, animação ambiental, pausa, sequência de falas, chegada e transições do diário. Conferir telas estreitas, TypeScript e build. Registrar evidências e limites após a revisão visual.

## Passe aplicado e revisão de 27/09/2026

- Copas com recortes assimétricos e grupos de folhas, raízes visíveis, pedras com variantes, cercas desalinhadas e bancos com extremidades trabalhadas. Madeira, vasos, caixas, tecidos e barcos receberam faces, desgaste e luz localizada. Telhas sobrepostas substituem o desenho anterior de tijolos no telhado.
- Grama com menos pontilhado repetitivo e grupos de detalhe colocados; areia com conchas e marcas próximas aos percursos; calçamento com cantos gastos e contraste mais baixo após comparação das capturas. Terreno estático continua em cache.
- Sombras projetadas continuam derivadas dos sprites, reforçadas por contato proporcional às bases. Brisa desloca apenas a copa um pixel; algumas árvores soltam folhas. A ordem de desenho por pés foi preservada.
- Diário compacto de papel com tacha, conclusão e transição entre praça, prefeitura, ferraria e praia. Visitas anteriores são lembradas durante a montagem da cena. Localização desaparece após alguns segundos. Texto de controle foi movido para a pausa; títulos internos e contadores foram removidos da apresentação normal.
- Diálogo tem moldura em madeira/verde escuro com detalhe carmesim, nome destacado e indicador de avanço somente ao completar a fala. O sprite, a escala e a animação de caminhada do protagonista permanecem iguais.

Teste em Chrome isolado: fluxo nome → oito falas → transição → exploração; pausa do typewriter; caminhada real por teclado e botão touch; quatro entradas do diário concluídas; pausa bloqueando movimento; água e casas bloqueadas, píer e praça transitáveis; nenhum erro de JavaScript na execução aprovada. Capturas de praça, praia, ferraria, prólogo, diário, 390 × 844 e 844 × 390 em `.local/visual-qa/polish-*.png`. Roteiro local em `polish.mjs`, ignorado pelo Git. Posicionamento direto foi usado para visitar todos os marcos e comparar enquadramentos; teclado e touch foram testados separadamente.

Uma execução anterior apresentou tela vazia após o prólogo; não se repetiu na execução completa aprovada. Não atribuir uma causa sem reprodução. Teste touch usa eventos de ponteiro em navegador, não aparelho físico. O passe não afirma paridade artística com Moonlighter: palmeiras, variedade de fachadas e desenho de grandes massas ainda podem evoluir nas próximas etapas. Nenhum novo mapa, interior, diálogo de NPC ou sistema de trabalho foi implementado.
