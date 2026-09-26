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
