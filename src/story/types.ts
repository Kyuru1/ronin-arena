export interface PlayerData {
  name: string;
}

export type StoryState = "name" | "intro" | "transition" | "kyuneth";

export interface DialogueLine {
  speaker: string;
  text: string;
}

