import type { FacingDirection } from '../storyPlayer';
import { surface } from '../world/pixel';
import { PROTAGONIST, RESIDENTS } from './catalog';

type Box = readonly [number, number, number, number];
let residents: HTMLImageElement | undefined;
let traveler: HTMLImageElement | undefined;
const cache = new Map<string, HTMLCanvasElement>();

/** The world loader owns decoding; only this module knows character atlas geometry. */
export function setCharacterAtlases(residentSheet: HTMLImageElement, travelerSheet: HTMLImageElement) {
  residents = residentSheet;
  traveler = travelerSheet;
  cache.clear();
}
export function characterAtlasesReady() { return Boolean(residents && traveler); }

function extract(sheet: HTMLImageElement, box: Box) {
  const [x, y, w, h] = box;
  const result = surface(w, h);
  result.ctx.drawImage(sheet, x, y, w, h, 0, 0, w, h);
  const pixels = result.ctx.getImageData(0, 0, w, h);
  let left = w, top = h, right = -1, bottom = -1;
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const at = (yy * w + xx) * 4 + 3;
    pixels.data[at] = pixels.data[at] >= 200 ? 255 : 0;
    if (pixels.data[at]) { left = Math.min(left, xx); top = Math.min(top, yy); right = Math.max(right, xx); bottom = Math.max(bottom, yy); }
  }
  result.ctx.putImageData(pixels, 0, 0);
  if (right < left) throw new Error('Quadro de personagem vazio no atlas.');
  const trimmed = surface(right - left + 1, bottom - top + 1);
  trimmed.ctx.drawImage(result.image, left, top, trimmed.image.width, trimmed.image.height, 0, 0, trimmed.image.width, trimmed.image.height);
  return trimmed.image;
}

function normalize(source: HTMLCanvasElement, logicalHeight: number) {
  const result = surface(56, 64);
  const height = logicalHeight * 2;
  const width = Math.min(52, Math.max(1, Math.round(source.width / source.height * height)));
  result.ctx.drawImage(source, Math.floor((56 - width) / 2), 63 - height, width, height);
  return result.image;
}

/** All four frames share a fixed canvas, feet anchor, scale and atlas direction. */
export function protagonistSource(direction: FacingDirection, frame: number) {
  if (!traveler) return undefined;
  const index = ((Math.floor(frame) % 4) + 4) % 4;
  const row = direction === 'down' ? 0 : direction === 'up' ? 1 : direction === 'left' ? 2 : 3;
  const key = 'traveler:' + row + ':' + index;
  let image = cache.get(key); if (image) return image;
  const left = Math.round(index * traveler.width / 4), right = Math.round((index + 1) * traveler.width / 4);
  const top = Math.round(row * traveler.height / 4), bottom = Math.round((row + 1) * traveler.height / 4);
  image = normalize(extract(traveler, [left + 30, top + 5, right - left - 60, bottom - top - 10]), PROTAGONIST.logicalHeight);
  cache.set(key, image); return image;
}

const RESIDENT_ROWS: Record<FacingDirection, [number, number]> = {
  down: [28, 252], up: [291, 245], left: [542, 238], right: [783, 241],
};
/** Left and right use separate painted rows; the left atlas row is oriented to the right and is flipped once. */
export function residentSource(role: string, direction: FacingDirection) {
  if (!residents) return undefined;
  const design = RESIDENTS[role]; if (!design) return undefined;
  const key = 'resident:' + role + ':' + direction;
  let image = cache.get(key); if (image) return image;
  const [y, h] = RESIDENT_ROWS[direction];
  image = normalize(extract(residents, [design.atlasColumn * 192, y, 192, h]), design.logicalHeight);
  if (direction === 'left') {
    const flipped = surface(image.width, image.height);
    flipped.ctx.translate(image.width, 0); flipped.ctx.scale(-1, 1);
    flipped.ctx.drawImage(image, 0, 0); image = flipped.image;
  }
  cache.set(key, image); return image;
}