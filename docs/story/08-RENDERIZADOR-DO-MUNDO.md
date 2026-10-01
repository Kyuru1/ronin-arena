# 08 — Reconstrução do renderizador do mundo

Este pedido substitui os limites do passe 07: é autorizado reconstruir mapa, câmera, colisões visuais e prólogo mantendo React/Vite/TypeScript, narrativa, identidade e a separação da Arena.

O mundo usa Canvas 2D, mapa em pixels lógicos e tiles de 16 px. React mantém fluxo, diálogos, HUD e pausa. GameCanvas administra ciclo e viewport; WorldRenderer compõe terreno, sombras, objetos/entidades ordenados pelos pés e partículas. Camera arredonda a posição apenas ao desenhar. AssetManager guarda sprites locais gerados em resolução nativa, sem rede, filtros ou interpolação. Dados das cenas ficam em maps.ts; colisões são derivadas dos mesmos objetos desenhados.

Migração: praça como primeiro recorte; validar escala/câmera/sombras; expandir vila, praia e ferraria; usar a mesma vila no caminho top-down do prólogo. A entidade do protagonista atravessa as cenas. Esc pausa; tela cheia usa API do navegador. Escala inteira no framebuffer físico com margens, inclusive em DPR fracionado; viewport lógico adapta-se a janelas pequenas.

Direção: materiais costeiros, verdes quentes, areia, madeira envelhecida e telhas de cerâmica/verde; contornos escuros e luz do alto esquerdo. Moonlighter é referência de acabamento apenas. Nada de ativos, mapas ou paleta copiados.

Critérios: tipos e build; fluxo completo; movimento e colisões; oclusão por posição; nitidez em diferentes tamanhos; comparação visual da praça, praia, ferraria e prólogo em movimento. Registrar limitações reais da revisão, sem equiparar build aprovado a acabamento artístico aprovado.

## Implementação ativa e revisão de 25/09/2026

- A integração interrompida foi concluída: ambas as cenas usam `GameCanvas` e `WorldRenderer`; o cenário legado deixou de ser importado. React administra nome, narrativa, HUD, pausa e transição.
- Mapa autoral de 800 × 864 pixels lógicos, tiles de 16 pixels, texturas locais em cache e máscaras por pixel para costa/caminhos. Praça, prefeitura, residências, mercado, ferraria e praia usam dados separados dos desenhos.
- Assets ambientais nativos têm materiais, variantes, contornos rasterizados, beirais e projeção de sombra pela silhueta. Objetos e atores compartilham ordenação vertical. Colisores de casas acompanham as variantes; água usa a mesma borda do terreno, com exceção explícita do píer.
- Prólogue top-down com a mesma entidade e a mesma escala; câmera deixa espaço para o diálogo. Pausa congela mundo e typewriter; controles remapeados, setas, gamepad e touch são tratados pelo Canvas. Tela cheia é acionada pelo painel React.
- Viewport usa escala inteira em pixels físicos, sem suavização; modo vertical admite até 640 pixels lógicos de altura para reduzir margens excessivas. Em janelas largas mantém letterboxing.

Validação realizada no Chromium local: fluxo nome → prólogo → pausa/retomada → chegada → movimento; bloqueio de água e casas; passagem no píer; posição inicial livre; invariantes de escala com DPR 1, 1.25, 2 e 3; capturas da praça, praia, ferraria e prólogo, incluindo 390 × 844 e 844 × 390. Os artefatos e scripts de QA ficam em `.local/visual-qa/`, ignorados pelo Git.

Na medição em 180 frames reais, o desenho teve mediana de 3,3 ms e percentil 95 de 6,8 ms neste ambiente. É uma medida local de renderização, não uma garantia de FPS em todos os dispositivos. Uma medição sintética sem intervalos apresentou picos e não foi usada como medida de estabilidade.

Limites: sem interiores, quests ou combate na vila; acabamento usa arte rasterizada autoral em código, sem assets externos. Steam/empacotamento desktop não foi implementado. Tela cheia e gamepad físico ainda exigem verificação no dispositivo final. O passe visual foi revisado por capturas e movimento no navegador; isso não equivale a afirmar paridade artística com Moonlighter.

Verificações finais: TypeScript sem erros; `npm run build` concluído (120 módulos, `dist/index.html` regenerado). A repetição das verificações funcionais e responsivas passou sem erros de JavaScript. O `git diff --check` da fonte passou; no bundle gerado, a dependência Supabase inclui whitespace em uma string — o arquivo não foi corrigido manualmente.
