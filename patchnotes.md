# Patch Notes

## Patch Notes 1 - Arsenal Evoluido

- Katana, arco, martelo e livro arcano agora possuem upgrade de Forma.
- A katana evoluida ganha uma lamina maior, alcance ampliado e um corte que acerta inimigos durante o dash.
- O arco evolui para uma pistola automatica, e o martelo evolui para uma versao de alcance gigante.
- O livro em Forma Psiquica troca o livro pelas maos do Ronin e invoca fogo, gelo, veneno ou agua em areas no chao.

## Patch Notes 2 - HUD, Pausa e Acessibilidade

- A HUD de combate ficou transparente, menor e menos intrusiva para manter a arena visivel.
- O painel de vida agora mostra a quantidade real de coracoes, de 5 ate o limite de 20.
- Foram adicionados os tamanhos de HUD minuscula e pequena, alem dos tamanhos existentes.
- O menu de pausa agora permite alterar som, volume, efeitos, HUD, tela cheia e modo somente teclado durante a partida.

## Patch Notes 3 - Desafio de Arena

- Inimigos e projeteis aumentam o dano conforme as waves avancam.
- Chefes chegam a cada 5 waves, com dois chefes por rodada a partir da wave 15.
- O ranking mantem apenas os 50 melhores resultados.
- Rastros e corpos no chao sao limpos a cada tres waves concluidas para manter a arena legivel.

## Patch Notes 4 - Ranking Global

- Foi adicionado o ranking global de jogadores.
- O ranking e baseado na dificuldade e pontuado por wave, pontos e abates.

## Patch Notes 5 - Perks e Necromancia

- Perks foram adicionadas antes do inicio da partida, alterando dano, velocidade, armas extras, efeitos amaldiçoados e ataques especiais.
- No dificil, as perks mais fortes ficam bloqueadas.
- Foi adicionado o Cajado de Invocacao, com magia em area azul/preta e aliados invocados.
- A forma evoluida, Cajado de Necromante, aumenta o alcance e pode ressuscitar inimigos.
- Menu e loja ficaram mais limpos, com abas melhores para armas e upgrades.
- Foram corrigidos textos cortados, sprites errados e detalhes da HUD.

## Patch Notes 6 - Arena Mais Viva e Novos Inimigos

- Novos tipos de inimigos surgem conforme as waves avancam, incluindo rastejadores rapidos, bombardeiros, feiticeiros e golems.
- A arena recebeu cores melhores, detalhes no chao, rachaduras, petalas e lanternas.
- Personagens e inimigos ficaram maiores, com mais contraste e saturacao.
- Projeteis especiais ficaram mais faceis de identificar durante o combate.

## Patch Notes 7 - Autenticacao e Ranking

- O cadastro por email agora informa corretamente quando a conta foi criada e aguarda a confirmacao pelo link enviado ao email.
- As mensagens de login diferenciam email nao confirmado, credenciais invalidas e limite temporario de tentativas.
- O login social do Google foi removido temporariamente.
- O ranking passou a ser associado ao `user_id` autenticado.
- Nomes antigos sao preservados mesmo quando o perfil correspondente nao esta disponivel.
- Entradas antigas sem avatar usam o visual padrao do samurai, e a foto do ranking ficou menor verticalmente.
- O nome do jogador deve ser unico, ignorando maiusculas, minusculas e espacos extras.
- Foi definida a limpeza de rankings sem usuario autenticado.

## Patch Notes 8 - Controles e Pocoes

- Foi adicionada uma aba de Controles ao menu, com comandos de teclado e controle.
- Teclas podem ser remapeadas e ficam salvas nas configuracoes.
- Menus e loja agora podem ser navegados por teclado e gamepad.
- Foi adicionada a selecao de teclado, teclado e mouse ou gamepad antes da partida.
- A pocao de Vida recupera 2 coracoes, respeitando o limite maximo de vida.
- A pocao de Forca aumenta o dano em 50% por 8 segundos.
- A pocao de Velocidade aumenta o movimento em 45% por 8 segundos.
- A pocao de Agilidade reduz a recarga do dash em 50% por 8 segundos.
- O tutorial de pocoes pausa a partida, explica os efeitos e pode ser ocultado permanentemente.
- A HUD mostra a pocao ativa, seu icone e o tempo restante.
- O movimento do Ronin agora para instantaneamente ao soltar a tecla ou o analogico, sem deslizar.
- Teclado, mouse e controle deixaram de sobrescrever indevidamente o estado de ataque uns dos outros.

## Patch Notes 9 - Camera e Enquadramento

- A camera agora acompanha o Ronin apos aproximadamente 1,5 tamanhos de personagem a partir do centro da tela.
- O personagem permanece mais proximo do centro durante a movimentacao pela arena.

## Patch Notes 10 - Progressao de Inimigos

- Inimigos de projeteis e o Minion Bomba passam a surgir a partir da wave 3.
- Ninjas e golems passam a surgir a partir da wave 5.
- Os demais tipos de inimigos e spawns especiais passam a surgir a partir da wave 7.

## Patch Notes 11 - Bosses Variantes

- Um boss surge a cada 5 waves, sempre usando a aparencia de um NPC da arena.
- Bosses possuem muito mais vida, tamanho maior e barra de vida propria.
- Bosses velozes, como morcegos e ninjas, podem atravessar a arena com um dash muito mais longo.
- Bosses de projeteis disparam rajadas maiores, e o boss golem combina projeteis com uma onda de choque.

## Patch Notes 12 - Cooperativo por Codigo

- Novo modo cooperativo para 2 jogadores, sem localhost: crie uma sala e convide pelo codigo KYU na tela.
- Qualquer pessoa com o codigo de convite entra na sala, de qualquer lugar.
- Moedas em coop valem 2x e sao divididas igualmente: cada moeda coletada credita o valor para os dois jogadores.
- A loja entre waves agora e sincronizada: a proxima wave so comeca quando os dois jogadores fecharem a loja.
- Se os dois ronins cairem, a partida acaba para os dois; se um parceiro desconectar no meio da run, ela termina na hora.
- Caixas e arvores continuam drops pessoais; moedas e coracoes sao do grupo, coletados pelo jogador mais proximo.
- Ranking permanece desativado no cooperativo.

## Patch Notes 13 - Coop Online e Skins

- O cooperativo agora usa Supabase Realtime para salas por codigo, permitindo convidar outro jogador sem IP, porta, tunel ou servidor local.
- A tela de coop foi finalizada com criacao de sala, entrada por codigo, estado de pronto e inicio sincronizado pelo anfitriao.
- O modo coop recebeu vida individual para cada jogador, mantendo apenas as moedas como recurso compartilhado.
- Inimigos passam a escolher o alvo mais proximo entre anfitriao e parceiro, deixando o combate mais justo para os dois jogadores.
- A loja entre waves respeita o pronto dos dois jogadores antes de iniciar a proxima onda.
- Foram adicionadas skins jogaveis para o Ronin, com escolha no perfil e uso tanto no modo normal quanto no cooperativo.
- A tela de pausa do singleplayer agora mostra a skin selecionada pelo jogador.
- Os nomes dos jogadores foram reduzidos e ajustados para evitar quebra vertical nas telas de perfil, selecao e coop.
- Efeitos visuais das pocoes ficaram mais fluidos, com destaque melhor durante coleta e ativacao.
- Controles de celular receberam ajustes para reduzir movimento preso ou personagem andando sozinho apos toque, cancelamento ou troca de foco.
- Ranking continua desativado no cooperativo enquanto o modo online passa por testes de estabilidade.



## 2026-09-24 — Novas armas, evoluções e raridades

### Novas armas

- **Bumerangue:** é lançado, percorre até cinco inimigos próximos e retorna ao jogador.
- **Shuriken:** projétil rápido, de baixo dano e longo alcance, com recarga base curta.
- **Lança:** estocada lenta e poderosa; a colisão é uma faixa fina que começa no meio do cabo e segue até a ponta.

### Evoluções

- **Bumerangue Colossal:** fica maior e passa a causar dano em todos os inimigos atravessados pelo sprite.
- **Shuriken Gigante:** fica maior, explode ao fim do alcance e lança oito shurikens radiais; recarga de 1,5 segundo.
- **Lança Sangrenta:** aumenta o tamanho e a velocidade, aplicando sangramento cumulativo que dura até o inimigo morrer.

### Raridades de raças

- **Divine — 0,1%:** branco forte e brilhante.
- **Mythic — 0,9%:** vermelho chama.
- **Lendária — 4%:** amarelo.
- **Épica — 12%:** roxo.
- **Azul — 17%:** ciano fraco.
- **Incomum — 28%:** verde claro fraco.
- **Comum — 40%:** branco/cinza fraco.

As raridades também controlam a cor da habilidade, do nome e dos efeitos visuais da raça.