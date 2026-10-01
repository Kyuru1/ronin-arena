import type { FacingDirection } from '../storyPlayer';
import { polygon, surface } from '../world/pixel';
import { CharacterAnimation } from './animation';
import { animalFrame } from './animals';
import { ANIMALS, PROTAGONIST, RESIDENTS, type AnimalSpecies, type HumanPart } from './catalog';
import { HUMAN_DRAW_ORDER } from './parts';
import { protagonistParts, type ProtagonistAppearance } from './protagonist';
import { residentParts } from './residents';

const frameCache = new Map<string, HTMLCanvasElement>();
function limbOffset(part: HumanPart, frame: number): [number, number] {
  const stride = [1, 0, -1, 0][frame], lift = [0, -1, 0, 1][frame];
  if (part === 'leftArm') return [0, -stride + Math.min(0, lift)];
  if (part === 'rightArm') return [0, stride + Math.max(0, lift)];
  if (part === 'leftLeg') return [-stride, Math.max(0, -stride) + lift];
  if (part === 'rightLeg') return [stride, Math.max(0, stride) - lift];
  return [0, 0];
}

/** Compose each authored pose from independently addressable parts at a fixed feet anchor. */
export function humanFrame(role: string, direction: FacingDirection, walking: boolean, frame: number, appearance?: ProtagonistAppearance) {
  const index = walking ? ((Math.floor(frame) % 4) + 4) % 4 : 0;
  const key = role + ':' + direction + ':' + (walking ? 'walk:' : 'idle:') + index;
  const cached = appearance ? undefined : frameCache.get(key); if (cached) return cached;
  const parts = role === 'player' ? protagonistParts(direction, walking, index) : residentParts(role, direction);
  if (!parts) return undefined;
  const result = surface(56, 64);
  for (const part of HUMAN_DRAW_ORDER) {
    const [dx, dy] = walking && role !== 'player' ? limbOffset(part, index) : [0, 0];
    const gazeX = part === 'eyes' && role === 'player' ? Math.max(-1, Math.min(1, Math.round(appearance?.gaze?.x ?? 0))) : 0;
    const gazeY = part === 'eyes' && role === 'player' ? Math.max(-1, Math.min(1, Math.round(appearance?.gaze?.y ?? 0))) : 0;
    result.ctx.drawImage(appearance?.parts?.[part] ?? parts[part], dx + gazeX, dy + gazeY);
  }
  if (!appearance) frameCache.set(key, result.image); return result.image;
}

export class CharacterRenderer {
  readonly animation = new CharacterAnimation();
  private protagonistAppearance?: ProtagonistAppearance;
  setProtagonistAppearance(appearance?: ProtagonistAppearance) { this.protagonistAppearance = appearance; }
  drawHuman(c: CanvasRenderingContext2D, id: string, role: string, x: number, feet: number, direction: FacingDirection, walking: boolean, now: number) {
    const design = role === 'player' ? PROTAGONIST : RESIDENTS[role]; if (!design) return;
    const pose = this.animation.pose(id, direction, walking, now, design.fps);
    const image = humanFrame(role, pose.direction, pose.action === 'walk', pose.frame, role === 'player' ? this.protagonistAppearance : undefined);
    if (!image) return;
    c.save(); c.imageSmoothingEnabled = false;
    c.drawImage(image, Math.round(x * 2) / 2 - image.width / 4, Math.round(feet * 2) / 2 - image.height / 2, image.width / 2, image.height / 2);
    c.restore();
  }
  drawAnimal(c: CanvasRenderingContext2D, id: string, species: AnimalSpecies, x: number, feet: number, direction: FacingDirection, walking: boolean, now: number) {
    const design = ANIMALS[species];
    const pose = this.animation.pose(id, direction, walking, now, design.fps);
    const image = animalFrame(species, pose.direction, pose.action === 'walk', pose.frame);
    c.save(); c.imageSmoothingEnabled = false;
    c.drawImage(image, Math.round(x * 2) / 2 - image.width / 4, Math.round(feet * 2) / 2 - image.height / 2, image.width / 2, image.height / 2);
    c.restore();
  }
}

export function drawCharacterContact(c: CanvasRenderingContext2D, x: number, y: number, width = 15) {
  const half = Math.round(width / 2);
  c.save(); c.translate(Math.round(x), Math.round(y)); c.globalAlpha = .24;
  polygon(c, [[-half, 0], [-half + 3, -2], [half - 2, -2], [half + 3, 1], [half + 2, 3], [-half + 1, 3]], '#243d3b');
  c.globalAlpha = .35; c.fillStyle = '#243d3b'; c.fillRect(-half + 2, -1, width - 4, 2);
  c.restore();
}