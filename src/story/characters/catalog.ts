import type { FacingDirection } from '../storyPlayer';

export const DIRECTIONS = ['down', 'up', 'left', 'right'] as const satisfies readonly FacingDirection[];
export type CharacterCategory = 'protagonist' | 'npc' | 'child' | 'animal' | 'special';
export type HumanPart = 'backpack' | 'leftLeg' | 'rightLeg' | 'body' | 'clothes' | 'leftArm' | 'rightArm' | 'neck' | 'head' | 'hair' | 'face' | 'eyes' | 'accessory';
export const HUMAN_PARTS: readonly HumanPart[] = ['backpack', 'leftLeg', 'rightLeg', 'body', 'clothes', 'leftArm', 'rightArm', 'neck', 'head', 'hair', 'face', 'eyes', 'accessory'];

export interface HumanDesign {
  id: string;
  category: Exclude<CharacterCategory, 'animal'>;
  atlasColumn: number;
  logicalHeight: number;
  fps: number;
  frameWidth: number;
  frameHeight: number;
  parts: readonly HumanPart[];
}

export const PROTAGONIST: HumanDesign = {
  id: 'player', category: 'protagonist', atlasColumn: 0,
  logicalHeight: 30, fps: 8, frameWidth: 56, frameHeight: 64, parts: HUMAN_PARTS,
};

/** Each entry points to its own atlas column and native directional views. */
export const RESIDENTS: Record<string, HumanDesign> = {
  jeff:   { id: 'jeff', category: 'special', atlasColumn: 1, logicalHeight: 32, fps: 7, frameWidth: 56, frameHeight: 64, parts: HUMAN_PARTS },
  ketlin: { id: 'ketlin', category: 'special', atlasColumn: 2, logicalHeight: 31, fps: 7, frameWidth: 56, frameHeight: 64, parts: HUMAN_PARTS },
  shorum: { id: 'shorum', category: 'npc', atlasColumn: 3, logicalHeight: 29, fps: 6, frameWidth: 56, frameHeight: 64, parts: HUMAN_PARTS },
  kuon:   { id: 'kuon', category: 'npc', atlasColumn: 4, logicalHeight: 29, fps: 6, frameWidth: 56, frameHeight: 64, parts: HUMAN_PARTS },
  mikah:  { id: 'mikah', category: 'npc', atlasColumn: 5, logicalHeight: 31, fps: 7, frameWidth: 56, frameHeight: 64, parts: HUMAN_PARTS },
  jangi:  { id: 'jangi', category: 'npc', atlasColumn: 6, logicalHeight: 31, fps: 7, frameWidth: 56, frameHeight: 64, parts: HUMAN_PARTS },
  mibah:  { id: 'mibah', category: 'child', atlasColumn: 7, logicalHeight: 25, fps: 8, frameWidth: 56, frameHeight: 64, parts: HUMAN_PARTS },
};

export type AnimalSpecies = 'dog' | 'chicken';
export const ANIMALS: Record<AnimalSpecies, { category: 'animal'; width: number; height: number; fps: number }> = {
  dog: { category: 'animal', width: 40, height: 32, fps: 6 },
  chicken: { category: 'animal', width: 28, height: 28, fps: 7 },
};