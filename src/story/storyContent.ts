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
      { speaker: 'ketlin', text: 'Conheça a vila com calma. Só… se ouvir alguém falando da Arena, venha conversar comigo antes de ir até lá.' },
      { speaker: 'player', text: 'Aconteceu alguma coisa?' },
      { speaker: 'ketlin', text: 'Dois dos nossos guerreiros entraram lá e não voltaram. Ainda deixamos comida à espera deles.' },
      { speaker: 'player', text: 'Não vou prometer o que não sei cumprir. Mas posso ouvir vocês e ajudar a descobrir o que aconteceu.' },
      { speaker: 'ketlin', text: 'Por enquanto, isso já significa muito. Descanse. Depois conversamos melhor.' },
    ],
  };
}
