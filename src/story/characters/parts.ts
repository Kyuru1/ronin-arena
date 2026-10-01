import type { FacingDirection } from '../storyPlayer';
import { surface } from '../world/pixel';
import { HUMAN_PARTS, type HumanPart } from './catalog';

export type PartLayers = Record<HumanPart, HTMLCanvasElement>;
const MOTION_PARTS: readonly HumanPart[] = ['leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
export const HUMAN_DRAW_ORDER: readonly HumanPart[] = ['backpack', 'leftLeg', 'rightLeg', 'leftArm', 'rightArm', 'body', 'clothes', 'neck', 'head', 'hair', 'face', 'eyes', 'accessory'];

function selectPart(x: number, y: number, rgba: Uint8ClampedArray, at: number, top: number, direction: FacingDirection, protagonist: boolean): HumanPart {
  const headEnd = top + Math.round((63 - top) * .48);
  const legStart = top + Math.round((63 - top) * .78);
  const r = rgba[at], g = rgba[at + 1], b = rgba[at + 2];
  const brown = r > b * 1.2 && g > b * .95 && r < 190 && g < 145;
  if (y >= legStart) return x < 28 ? 'leftLeg' : 'rightLeg';
  if (y < headEnd) {
    const faceZone = y > top + Math.round((headEnd - top) * .48) && y < headEnd - 2;
    const skin = r > g * 1.16 && g > b * 1.08 && r > 110;
    if (faceZone && skin) return 'face';
    if (faceZone && x > 17 && x < 39 && r < 85 && g < 80 && b < 85) return 'eyes';
    if (r < 135 && g < 130 && b < 145) return 'hair';
    return 'head';
  }
  const side = x < 16 || x >= 40;
  if (protagonist && brown && (direction === 'left' ? x < 26 : direction === 'right' ? x > 30 : x < 15 || x > 41)) return 'backpack';
  if (side) return x < 28 ? 'leftArm' : 'rightArm';
  if (y < headEnd + 3) return 'neck';
  if (protagonist && b > r * .95 && g > r * .8 && y < headEnd + 10) return 'accessory';
  return y < headEnd + 6 ? 'body' : 'clothes';
}

/** Every opaque source pixel belongs to exactly one editable visual part. */
export function splitHumanSprite(source: HTMLCanvasElement, direction: FacingDirection, protagonist: boolean): PartLayers {
  const width = source.width, height = source.height;
  const src = source.getContext('2d')!.getImageData(0, 0, width, height);
  let top = height;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (src.data[(y * width + x) * 4 + 3]) top = Math.min(top, y);
  const layers = {} as PartLayers;
  for (const part of HUMAN_PARTS) {
    const canvas = surface(width, height);
    const out = canvas.ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const at = (y * width + x) * 4;
      if (!src.data[at + 3] || selectPart(x, y, src.data, at, top, direction, protagonist) !== part) continue;
      out.data[at] = src.data[at]; out.data[at + 1] = src.data[at + 1];
      out.data[at + 2] = src.data[at + 2]; out.data[at + 3] = src.data[at + 3];
    }
    canvas.ctx.putImageData(out, 0, 0);
    layers[part] = canvas.image;
  }
  return layers;
}

/** A single authored head and torso survive all walking frames in one direction. */
export function combineStableIdentity(base: PartLayers, motion: PartLayers): PartLayers {
  const result = { ...base };
  for (const part of MOTION_PARTS) result[part] = motion[part];
  return result;
}