import type { FacingDirection } from './storyPlayer';
import { CharacterRenderer, drawCharacterContact } from './characters/renderer';

const legacyRenderer = new CharacterRenderer();

/** Compatibility entry point for the retired renderer in kyunethArt.ts. */
export function drawStoryCharacter(
  c: CanvasRenderingContext2D, x: number, feet: number, time: number,
  _shirt: string, role = 'player', walking = false, _facing = 1, _scale = 3,
  direction: FacingDirection = 'down',
) {
  legacyRenderer.drawHuman(c, role, role, x, feet, direction, walking, time);
}
export { drawCharacterContact as drawStoryContact };