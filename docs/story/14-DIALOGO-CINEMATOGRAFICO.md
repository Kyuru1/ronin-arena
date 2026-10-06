# Missão de produção 1 — diálogo cinematográfico

Escopo: sistema reutilizável de falas, retratos e foco, integrado ao monólogo de chegada e a uma primeira conversa com Ketlin. Esta missão não implementa a entrada na Arena nem o Capítulo 1.

## Contrato
- Participantes possuem ID estável, nome e papel visual. Falas referenciam IDs; o elenco pode conter mais de dois personagens, enquanto a apresentação mantém dois assentos e troca o ouvinte quando necessário.
- M1/toque revela a fala; um novo acionamento avança. Cliques duplos não saltam falas. Enter/Espaço também acionam, sem repetição por tecla segurada.
- Pausa suspende digitação e entrada. Encerramento é idempotente, desmonta a caixa e devolve movimento. Não há contador nem pulo de conteúdo inédito.
- Retratos recortam os sprites nativos, sem suavização; o falante recebe cor e contraste, o ouvinte é atenuado. Respeitar movimento reduzido.
- Ao aproximar-se de Ketlin, a conversa ocorre uma vez por visita ao modo História. Nenhum estado novo é persistido. A câmera continua seguindo a mesma entidade.
- Kyuneth é apresentada primeiro como lar; a conversa apresenta Ketlin, indica Jeff e sugere uma casa. A notícia dos dois desaparecidos fica para uma etapa posterior do Prólogo, quando o jogador já conhece a vila.

## Verificação exigida
Conversa completa e alternância de foco; revelar/avançar; clique duplo; pausa; encerramento único; movimento bloqueado e restaurado; janela, tela pequena e tela cheia; TypeScript e build. Resultados registrados em artifacts/dialogue-01/.

## Resultado da implementação

Implementado e verificado localmente: 13 cenários automatizados aprovados, sem erros de execução no navegador. O relatório está em `artifacts/dialogue-01/report.json`; capturas incluem falantes alternados, uma fala tardia, janela, celular, paisagem e tela cheia. A revisão visual das capturas confirmou leitura do texto, bustos consistentes com o mapa e enquadramento sem cortes. TypeScript e build de produção foram executados. O roteiro de boas-vindas preserva a revelação dos desaparecidos para mais tarde; capítulos e entrada na Arena continuam fora deste escopo.
