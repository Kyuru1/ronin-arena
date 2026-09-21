# Patch Notes - Hoje

## 1. Autenticacao e perfil

- O cadastro com email agora informa corretamente quando a conta foi criada, mas ainda precisa ser confirmada pelo link enviado ao email.
- As mensagens de login e cadastro foram separadas para diferenciar email nao confirmado, credenciais invalidas e limite temporario de tentativas.
- O login social do Google foi removido temporariamente.
- O painel de perfil passou a proteger o envio contra cliques duplicados.
- O nome do jogador e normalizado e deve ser unico, ignorando maiusculas, minusculas e espacos extras.
- A exclusao da conta remove os dados associados ao usuario autenticado.

## 2. Ranking global

- O ranking global passou a ser associado ao `user_id` autenticado.
- Nomes antigos do ranking sao preservados mesmo quando o perfil correspondente nao esta disponivel.
- Entradas antigas sem avatar recebem o visual padrao do samurai.
- A foto do ranking ficou menor verticalmente para deixar mais espaco para nome, wave, pontos e abates.
- O ranking continua separado por dificuldade e limitado aos 50 melhores resultados.
- Foi preparada a limpeza de registros de ranking sem autenticacao e a protecao contra nomes duplicados no banco.

## 3. Loja e arsenal

- A loja foi reorganizada em tres categorias iniciais: armas, estatisticas e upgrades.
- A tela mostra menos informacoes ao mesmo tempo, facilitando a leitura e a escolha.
- O upgrade de forma agora usa a arma selecionada, em vez de apontar visualmente para a ultima arma da lista.
- Katana, arco, martelo, livro arcano e cajado possuem formas evoluidas.
- Foram corrigidos sprites, textos cortados e detalhes visuais dos itens.

## 4. Pocoes e efeitos

- A pocao de Vida recupera 2 coracoes, respeitando o limite maximo de vida.
- A pocao de Forca aumenta o dano causado em 50% durante 8 segundos.
- A pocao de Velocidade aumenta a velocidade de movimento em 45% durante 8 segundos.
- A pocao de Agilidade reduz a recarga do dash em 50% durante 8 segundos.
- O tutorial de pocoes pausa a partida na primeira coleta e mostra os efeitos antes de continuar.
- O jogador pode escolher nao mostrar o tutorial novamente.
- A HUD exibe a pocao ativa, seu icone e o tempo restante.

## 5. Movimento e combate

- O movimento do Ronin agora responde diretamente a direcao pressionada, com mais precisao.
- Ao soltar a tecla ou parar o analogico, o personagem para instantaneamente, sem deslizar.
- O dash continua usando seu proprio impulso e nao perde o comportamento de atravessar a arena.
- Teclado, mouse e controle deixaram de sobrescrever indevidamente o estado de ataque uns dos outros.

## 6. Controles e acessibilidade

- Foi adicionada uma aba de Controles ao menu principal.
- O jogador pode consultar os comandos de teclado e controle.
- As teclas podem ser remapeadas e ficam salvas nas configuracoes.
- Menus e loja agora podem ser navegados pelo teclado e pelo controle.
- Foi adicionada uma tela para escolher teclado, teclado e mouse ou gamepad antes da partida.
- O menu de pausa permite ajustar som, volume, efeitos, escala da HUD, tela cheia e modo somente teclado.

## 7. Arena e conteudo anterior

- Inimigos e projeteis aumentam o dano conforme as waves avancam.
- Chefes aparecem a cada 5 waves, com dois chefes por rodada a partir da wave 15.
- Novos inimigos aparecem conforme as waves avancam, incluindo rastejadores, bombardeiros, feiticeiros e golems.
- A arena recebeu cores, rachaduras, petalas, lanternas e detalhes de pixel art para ficar mais viva.
- Personagens, inimigos e projeteis receberam ajustes de tamanho, contraste e leitura durante o combate.
- Rastros e corpos no chao sao limpos a cada tres waves para manter a arena legivel.