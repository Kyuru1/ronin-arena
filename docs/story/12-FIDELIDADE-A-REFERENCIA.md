# Revisão 12 — fidelidade à referência definitiva

A imagem anexada em 29/09/2026 é a fonte visual obrigatória: costa turquesa à esquerda, praça de pedra, prefeitura ao fundo, ferraria à direita, casas de madeira e telhas verdes/laranja, copas volumosas e moradores compactos. Esta revisão substitui o acabamento simplificado da revisão 11, preservando narrativa, combate e persistência.

Sprites raster independentes derivados da referência entram em atlas locais, com recortes explícitos, ancoragem pelos pés, transparência binária e cache. Não são um fundo estático: objetos e personagens continuam na fila de profundidade. Dois pixels de arte por unidade do mundo permitem materiais detalhados com escala física inteira. As dimensões dos colisores e as rotas são preservadas; quatro árvores são reposicionadas com seus apoios. Adornos não bloqueiam os caminhos.

Validar TypeScript, build, carregamento dos atlas, orientação, caminhada, pausa, oclusão, desktop e retrato. Capturar o renderer real e comparar diretamente com a referência. Registrar diferenças observadas sem declarar reprodução idêntica.

Os seis atlas foram produzidos com a ferramenta imagegen integrada, tendo a imagem anexada como referência obrigatória. Prompts completos em `artifacts/kyuneth-12/prompts.md`. Os arquivos originais ficam em `src/story/assets/`; a quantização de alfa e os recortes são feitos pelo carregador de sprites, sem dependência remota em runtime.

## Implementação

- Seis atlas em `src/story/assets/`, produzidos com imagegen integrada a partir da referência, sem serviços externos em runtime. Recomprimidos sem perda de pixels: 10.983.303 para 2.495.439 bytes.
- `referenceArt.ts` centraliza imagens, recortes inspecionados individualmente, alfa binário e cache. A dimensão real da folha de caminhada é 1254 × 1254: suas divisões são arredondadas a pixels inteiros, evitando corrupção por índices fracionários.
- Casas com telhados verdes/alaranjados, varandas, janelas, fundações e portas detalhadas; copas completas, palmeiras, barris, caixas, poço, comércio, redes e barco. Ferraria com ferramentas, minério, carrinho, lenha, bigorna e fogo.
- Terreno em resolução 2× com pedra, madeira, areia, água e grama; mantém máscaras de materiais, faixa de praia e geometria do píer.
- Moradores de alturas e silhuetas diferentes; viajante com roupa simples, bolsa e lenço. Folha de caminhada separada com quatro vistas e quatro quadros. NPCs mantêm rotas e recebem respiração e movimento de membros. Cão e galinhas têm animação discreta.
- Abertura no acesso sul habitado em (400,536), com alvos do prólogo y=520−12×fala e enquadramento olhando para a vila; a mesma entidade atravessa a transição. Falas e controles preservados.
- Quatro árvores foram deslocadas com seus colisores para não ocultar bancas e circulação. Esta mudança substitui a preservação estrita de posições da revisão 11. Cachorro, galinhas e lenha não têm colisores novos.

## Comparação direta

Capturas reais em `artifacts/kyuneth-12/`: praça, praia, ferraria, prólogo, exploração, personagens, pausa e enquadramentos móveis. Em relação à referência: costa na esquerda e ferraria à direita, prefeitura ao norte, casas ao redor da praça com poço, árvores frutíferas, bancas e objetos cotidianos. Os materiais e sprites agora derivam diretamente da imagem aprovada, com detalhe e cores mais próximos que o kit anterior.

A vila permanece um mapa explorável com câmera que segue o jogador, portanto seu enquadramento varia com a posição. Não é uma reprodução pixel a pixel da composição fixa. Há diferenças de posições, desenho de casas e padrões do terreno; a folha de caminhada também tem pequenas variações em relação ao idle. Os testes de celular são em navegador emulado, não em hardware físico.

## Validação final

- `npx tsc --noEmit`: passou.
- `npm run build`: passou, 131 módulos. `dist/index.html` regenerado: 4.197.175 bytes, aproximadamente 2,76 MB gzip.
- Chrome headless abriu o HTML de produção, entrou pelo menu em História, preencheu o nome e carregou o prólogo/atlas sem erros JavaScript ou do service worker.
- Interface: computador → História → nome → oito falas → chegada → caminhada → pausa → continuar. Capturas em 1366 × 768, 390 × 844 e 844 × 390, sem erros JavaScript.
- Celular emulado em DPR 3: escolha de celular, falas por toque, direcional pressionado e captura. Falha de decode de imagem foi injetada pelo teste; `TENTAR NOVAMENTE` recuperou o carregamento e permitiu seguir o fluxo.
- Renderer: 136 objetos com pixels de alfa exclusivamente 0/255; quatro direções dos oito personagens e quadros de caminhada distintos; seis combinações de viewport/DPR sem barras e com pixels inteiros.
- Busca de caminhos com raio 5 confirmou acesso da entrada à praça, prefeitura, ferraria e praia após reposicionar as árvores.

Relatórios reproduzíveis em `artifacts/kyuneth-12/`: `render-report.json`, `ui-report.json`, `touch-report.json` e `production-report.json`. Scripts de captura/verificação acompanham as evidências; usam o Playwright e Chrome locais disponíveis nesta máquina.
