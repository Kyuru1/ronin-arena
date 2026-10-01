# Kyuneth — passe visual sem mudanças de gameplay

## Limite desta tarefa

O pedido atual é exclusivamente visual. Não alterar controle, câmera, colisões, dimensões do mundo, menus, diálogos, save ou progressão. A Arena de Kyu Arena define nitidez, contorno e escala de pixel; Moonlighter serve apenas de referência para densidade ambiental, organização, materiais e sombras — nunca para copiar arquitetura, paleta, personagens ou interface.

## Elementos redesenhados

- `kyunethArt.ts`: o pontilhado de cor por célula do terreno foi substituído por materiais separados (água profunda/rasa, areia úmida/seca, caminho e grama) e quatro padrões pixelados autorais por material. Após comparar uma captura, a grade repetitiva foi removida; as marcas agora têm disposição controlada e zonas gastas da praça são colocadas em trajetos úteis.
- A praça recebeu desgaste e pedras baixas em torno dos percursos entre prefeitura, fonte, banca e casas. Nada disso adiciona colisão.
- As casas usam diferentes perfis de telhado, tábuas, sombra sob beiral, vigas, reparos e objetos ligados ao uso do prédio. Prefeitura, ferraria, casa do pescador, casa-flor, armazém e casa de chá continuam nas posições originais.
- As copas deixaram de ser círculos sobrepostos e ganharam recortes irregulares, grupos de folhas e variação de massa. As sombras projetadas das silhuetas existentes ficaram mais legíveis.
- `storyCharacters.ts`: o viajante recebeu luz e sombra nos tecidos, mochila mais legível e mesma fábrica de sprites com contorno da Arena. Jeff, Ketlin e Shorum receberam volumes de roupa diferentes. NPCs agora piscam e os moradores têm repouso sutil; Jeff movimenta o martelo apenas como ambientação.
- `IntroCutsceneState.tsx`: relevo menos triangular, telhados com peças, árvores com copas pixeladas, estrada com desgaste, cultivo, pedras costeiras, varal, duas fileiras de fachadas ligadas a uma rua, construções em planos próximos, aves e pequenas ondas. A sequência, câmera e diálogos permanecem intactos.

## Revisão comparativa

- **Mapa anterior:** vegetação e piso repetitivos, fachadas semelhantes. **Atual:** diferença de materiais e usos mais clara, porém ainda há espaço para desenho de ativos bitmap feitos manualmente.
- **Prólogo anterior:** montanhas triangulares e caminho largo de cor quase uniforme. **Atual:** relevo em terraços, bordas e marcas de passagem, primeiro plano e sinais de comunidade. O enquadramento panorâmico ainda é mais simples que a referência de acabamento; não afirmar que o objetivo artístico final foi alcançado.
- **Arena:** preservados pixels nítidos, contorno escuro dos personagens e leitura rápida. A vila mantém a paleta tropical oposta ao carmesim.
- **Moonlighter:** apenas integração de sombra, material e detalhes funcionais; nenhum ativo ou composição foi copiado.

## Validação

`npx tsc --noEmit` e `npm run build` passaram. Capturas do prólogo e da praça foram comparadas visualmente após cada correção de repetição. O teste de percurso existente voltou a passar: oito falas, entrada, quatro direções, câmera, colisão da fonte, Escape e nenhum erro de página.

## Próximo critério artístico

Uma futura passagem de arte deve comparar *sprites e tiles finais* lado a lado com a Arena, especialmente telhados, paredes, copas e o panorama do prólogo. Se continuarem parecendo formas de canvas, substituí-los por sprites bitmap pixelados feitos em uma escala única, sem mudar a geometria ou a lógica do mundo.
