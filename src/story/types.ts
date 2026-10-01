export interface PlayerData { name: string; }
export type StoryState = 'name' | 'intro' | 'transition' | 'kyuneth';
export interface DialogueParticipant {
  id: string;
  name: string;
  /** Role from the story character catalog. */
  portrait: string;
}
export interface DialogueLine { speaker: string; text: string; }
export interface DialogueSequence {
  id: string;
  participants: DialogueParticipant[];
  lines: DialogueLine[];
}
