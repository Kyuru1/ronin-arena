import type { FacingDirection } from '../storyPlayer';
import { protagonistSource } from './atlas';
import { combineStableIdentity, splitHumanSprite, type PartLayers } from './parts';

export interface ProtagonistAppearance {
  parts?: Partial<PartLayers>;
  gaze?: { x: number; y: number };
}

const cache = new Map<string, PartLayers>();
const IDLE_FRAME = 1;

/** The protagonist owns independent layers; NPC pose synthesis never touches them. */
export function protagonistParts(direction: FacingDirection, walking: boolean, frame: number): PartLayers | undefined {
  const index = walking ? ((Math.floor(frame) % 4) + 4) % 4 : IDLE_FRAME;
  const key = direction + ':' + index;
  const cached = cache.get(key); if (cached) return cached;
  const stable = protagonistSource(direction, IDLE_FRAME);
  const motion = protagonistSource(direction, index);
  if (!stable || !motion) return undefined;
  const base = splitHumanSprite(stable, direction, true);
  const layers = index === IDLE_FRAME ? base : combineStableIdentity(base, splitHumanSprite(motion, direction, true));
  cache.set(key, layers); return layers;
}