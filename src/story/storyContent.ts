import type { DialogueLine } from "./types";

export const STORY_SESSION_KEY = "kyu.story.player.v1";

export function createIntroDialogue(playerName: string): DialogueLine[] {
  return [
    { speaker: "PLAYER", text: `Meu nome é ${playerName}.` },
    {
      speaker: "PLAYER",
      text: "Depois de tantos anos vivendo de um lugar para outro, eu só queria encontrar um pouco de paz.",
    },
    {
      speaker: "PLAYER",
      text: "Me disseram que Kyuneth é uma vila pequena, próxima ao mar.",
    },
    {
      speaker: "PLAYER",
      text: "Uma vila tranquila, cercada por árvores, areia e pessoas simples.",
    },
    { speaker: "PLAYER", text: "Talvez eu consiga começar de novo lá." },
    {
      speaker: "PLAYER",
      text: "Não estou procurando glória, riquezas ou aventuras.",
    },
    {
      speaker: "PLAYER",
      text: "Só preciso de um trabalho, uma casa e um lugar onde ninguém precise fugir.",
    },
    {
      speaker: "PLAYER",
      text: "Espero que Kyuneth seja realmente como dizem.",
    },
  ];
}

export function createKetlinDialogue(playerName: string): import('./types').DialogueSequence {
  return {
    id: 'ketlin-welcome',
    participants: [
      { id: 'player', name: playerName, portrait: 'player' },
      { id: 'ketlin', name: 'Ketlin', portrait: 'ketlin' },
    ],
    lines: [
      { speaker: 'ketlin', text: 'Você veio pela estrada do sul? Entre, pode descansar. Aqui o vento costuma trazer mais areia do que visitas.' },
      { speaker: 'player', text: `Sou ${playerName}. Me disseram que talvez houvesse trabalho por aqui. Estou procurando um lugar para ficar.` },
      { speaker: 'ketlin', text: 'Eu sou Ketlin. Sempre há alguma coisa para fazer em Kyuneth. E ninguém precisa procurar casa de estômago vazio.' },
      { speaker: 'player', text: 'Faz tempo que ninguém me recebe assim. Obrigado.' },
      { speaker: 'ketlin', text: 'Jeff, nosso ferreiro, vive dizendo que faltam mãos na oficina. Posso apresentá-los.' },
      { speaker: 'player', text: 'Eu sei trabalhar. E... há algum lugar onde eu possa ficar?' },
      { speaker: 'ketlin', text: 'Há uma casa vazia perto da praça. Vamos conversar sobre ela quando você conhecer melhor a vila.' },
      { speaker: 'player', text: 'Faz tempo que não penso em ficar num lugar. Obrigado.' },
      { speaker: 'ketlin', text: 'Seja bem-vindo a Kyuneth. Por aqui, sempre há lugar para mais uma pessoa à mesa.' },
    ],
  };
}
