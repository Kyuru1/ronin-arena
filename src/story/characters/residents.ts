import type { FacingDirection } from '../storyPlayer';
import { residentSource } from './atlas';
import { RESIDENTS } from './catalog';
import { splitHumanSprite, type PartLayers } from './parts';

const cache = new Map<string, PartLayers>();

/** The eight atlas columns retain separate garments, hair, faces and profiles. */
export function residentParts(role: string, direction: FacingDirection): PartLayers | undefined {
  if (!RESIDENTS[role]) return undefined;
  const key = role + ':' + direction;
  const cached = cache.get(key); if (cached) return cached;
  const image = residentSource(role, direction); if (!image) return undefined;
  const parts = splitHumanSprite(image, direction, false);
  cache.set(key, parts); return parts;
}