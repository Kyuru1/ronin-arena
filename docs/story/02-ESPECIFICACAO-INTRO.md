# Modo História — especificação da primeira versão jogável

## Fluxo obrigatório

`Menu principal → Nome do protagonista → Cutscene de viagem → Transição → Exterior de Kyuneth`

## Menu

- Adicionar `HISTÓRIA` sem alterar o funcionamento de Jogar, Coop e demais opções.
- O botão abre a criação do protagonista.

## Nome do protagonista

- Mostrar: “Antes de continuar, diga seu nome.”
- Aceitar confirmação por Enter e botão.
- Não aceitar nome vazio.
- Limitar e normalizar o texto para uso seguro na interface.
- Persistir o nome durante a sessão e usá-lo nas falas.

## Cutscene inicial

O protagonista viaja em direção a Kyuneth usando roupa simples/equipamento inicial. Ele não usa armadura carmesim e não deve parecer um guerreiro poderoso.

Falas, em ordem:

1. “Meu nome é [NOME].”
2. “Depois de tantos anos vivendo de um lugar para outro, eu só queria encontrar um pouco de paz.”
3. “Me disseram que Kyuneth é uma vila pequena, próxima ao mar.”
4. “Uma vila tranquila, cercada por árvores, areia e pessoas simples.”
5. “Talvez eu consiga começar de novo lá.”
6. “Não estou procurando glória, riquezas ou aventuras.”
7. “Só preciso de um trabalho, uma casa e um lugar onde ninguém precise fugir.”
8. “Espero que Kyuneth seja realmente como dizem.”

A imagem final mostra a vila à distância.

## Regras do diálogo

- Uma fala aparece por vez com efeito de escrita.
- M1/clique durante a escrita completa apenas a fala atual.
- O clique seguinte avança apenas uma fala.
- Um evento de clique nunca pode consumir duas falas.
- Mostrar um indicador discreto de M1.
- Movimento fica bloqueado durante toda a cutscene.
- As falas vivem em uma lista editável, separada da interface.

## Exterior de Kyuneth

- Começar na entrada principal depois de uma transição curta.
- Permitir caminhada livre com câmera acompanhando o protagonista.
- Mostrar claramente entrada, praça, prefeitura, ferraria, casas, praia e caminho bloqueado para a Arena.
- Não iniciar conversas, missões, combate ou lojas.
- Não permitir entrada em edifícios ou acesso à Arena.

## Estrutura expansível

- `PlayerData`: dados persistentes da sessão da história.
- `NameInputState`: captura e validação do nome.
- `IntroCutsceneState`: apresentação e sequência inicial.
- `DialogueController`: escrita e avanço M1 determinístico.
- `KyunethExteriorScene`: mapa, colisões, câmera e movimento.
- Dados narrativos separados de controle de interface e renderização.

## Fora do escopo

Arena jogável, combate, quests, interiores, loja completa, ferreiro funcional, diálogos de NPCs, bosses, história ramificada e armadura carmesim.

## Critérios de aceite

- O botão História aparece e os botões existentes continuam funcionais.
- Nome não vazio é aceito, persistido na sessão e interpolado corretamente.
- A cutscene mantém a ordem e a semântica de um clique por ação.
- Não há movimento durante a cutscene.
- A transição termina sem travar e carrega Kyuneth.
- O protagonista tem aparência simples e pode caminhar pela vila.
- Todos os pontos externos previstos são legíveis e nenhum interior é necessário.
# Revisão obrigatória: protagonista explorável

O mesmo protagonista criado pelo jogador atravessa a cutscene e a cena de Kyuneth. A cutscene anima sua representação sem aceitar input. Após a transição e a apresentação curta de chegada, o mapa posiciona o protagonista na entrada, mostra o sprite desde o primeiro quadro e libera as teclas de movimento. A câmera acompanha os pés da entidade.

Movimento segue as teclas remapeadas da Arena, setas e os controles touch; a direção visual muda nos quatro sentidos. Colisões cobrem prédios, árvores, palmeiras, cercas, fonte, bancas e objetos de trabalho. O jogador desliza ao longo dos obstáculos em vez de atravessá-los. O nome permanece em `sessionStorage`, mas posição e direção pertencem à entidade da sessão do modo História.

Antes de declarar concluído, reproduzir a entrada em navegador e confirmar movimento, câmera, sprite, colisão e ausência de erros JavaScript após a última fala. A compilação isolada não verifica este fluxo.
