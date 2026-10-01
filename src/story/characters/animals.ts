import type { FacingDirection } from '../storyPlayer';
import { rect, surface } from '../world/pixel';
import { ANIMALS, type AnimalSpecies } from './catalog';

const cache = new Map<string, HTMLCanvasElement>();
type C = CanvasRenderingContext2D;
function dog(c: C, direction: FacingDirection, frame: number) {
  const ink = '#3b3028', fur = '#d99e62', light = '#f1cf93', shade = '#a7653f', ear = '#805039';
  const step = [0, 1, 0, -1][frame];
  if (direction === 'left' || direction === 'right') {
    const right = direction === 'right';
    const mx = (x: number, w: number) => right ? x : 40 - x - w;
    rect(c, mx(5, 12), 13, 12, 4, ink); rect(c, mx(5, 12), 13, 11, 3, fur);
    rect(c, mx(9, 20), 14, 20, 12, ink); rect(c, mx(10, 18), 15, 18, 9, fur);
    rect(c, mx(15, 8), 19, 8, 5, light); rect(c, mx(28, 10), 5, 10, 10, ink);
    rect(c, mx(28, 9), 6, 9, 8, fur); rect(c, mx(29, 4), 6, 4, 5, ear);
    rect(c, mx(33, 4), 4, 4, 3, light); rect(c, mx(36, 2), 2, 2, 2, ink);
    rect(c, mx(31, 2), 2, 2, 2, ink);
    rect(c, mx(13, 4), 4, 5 + step, 3, shade); rect(c, mx(23, 4), 4, 5 - step, 3, shade);
    rect(c, mx(12, 6), 6, 2, 2, ink); rect(c, mx(22, 6), 6, 2, 2, ink);
  } else {
    rect(c, 8, 13, 24, 14, ink); rect(c, 9, 14, 22, 12, fur);
    rect(c, 12, 20, 16, 7, light);
    rect(c, 9 + step, 26, 6, 5, shade); rect(c, 25 - step, 26, 6, 5, shade);
    rect(c, 10 + step, 29, 6, 2, ink); rect(c, 24 - step, 29, 6, 2, ink);
    if (direction === 'down') {
      rect(c, 7, 10, 8, 11, ear); rect(c, 25, 10, 8, 11, ear);
      rect(c, 11, 9, 18, 15, ink); rect(c, 12, 10, 16, 13, fur);
      rect(c, 14, 16, 3, 3, ink); rect(c, 23, 16, 3, 3, ink);
      rect(c, 17, 19, 6, 4, light); rect(c, 19, 20, 2, 2, ink);
    } else {
      rect(c, 13, 7, 14, 12, ink); rect(c, 14, 8, 12, 11, fur);
      rect(c, 9, 9, 7, 8, ear); rect(c, 24, 9, 7, 8, ear);
      rect(c, 18, 6, 4, 3, shade); rect(c, 19, 4, 2, 3, ink);
      rect(c, 16, 18, 8, 3, light);
    }
  }
  if (frame === 2) rect(c, direction === 'left' ? 33 : direction === 'right' ? 5 : 8, direction === 'up' ? 10 : 16, 2, 2, shade);
}
function chicken(c: C, direction: FacingDirection, frame: number) {
  const ink = '#5a4631', white = '#fff0d1', shade = '#d2c7a5', red = '#b55345', gold = '#dd9a3f';
  const step = [0, 1, 0, -1][frame];
  if (direction === 'left' || direction === 'right') {
    const right = direction === 'right';
    const mx = (x: number, w: number) => right ? x : 28 - x - w;
    rect(c, mx(3, 17), 11, 17, 12, ink); rect(c, mx(4, 16), 12, 15, 10, white);
    rect(c, mx(8, 7), 17, 7, 5, shade); rect(c, mx(17, 8), 8, 8, 10, ink);
    rect(c, mx(18, 7), 9, 7, 8, white); rect(c, mx(20, 3), 6, 3, 4, red);
    rect(c, mx(23, 2), 2, 2, 2, ink); rect(c, mx(25, 3), 3, 3, 2, gold);
    rect(c, mx(7, 3), 8, 3, 7, white);
    rect(c, mx(10, 2), 2, 4 + step, 4, gold); rect(c, mx(17, 2), 2, 4 - step, 4, gold);
  } else {
    rect(c, 5, 11, 18, 13, ink); rect(c, 6, 12, 16, 11, white);
    rect(c, 8, 18, 12, 5, shade);
    rect(c, 8 + step, 23, 3, 4, gold); rect(c, 17 - step, 23, 3, 4, gold);
    if (direction === 'down') {
      rect(c, 9, 7, 10, 12, ink); rect(c, 10, 8, 8, 10, white);
      rect(c, 11, 5, 6, 4, red); rect(c, 11, 13, 2, 2, ink); rect(c, 16, 13, 2, 2, ink);
      rect(c, 12, 16, 4, 3, gold);
    } else {
      rect(c, 9, 5, 10, 13, ink); rect(c, 10, 6, 8, 11, white);
      rect(c, 11, 3, 6, 5, red); rect(c, 7, 13, 3, 4, shade); rect(c, 18, 13, 3, 4, shade);
      rect(c, 12, 17, 4, 3, shade);
    }
  }
  if (frame === 2) {
    rect(c, direction === 'left' ? 17 : direction === 'right' ? 8 : 6, 17, 2, 2, shade);
    if (direction === 'left' || direction === 'right') rect(c, direction === 'left' ? 21 : 5, 8, 2, 2, white);
  }
}
export function animalFrame(species: AnimalSpecies, direction: FacingDirection, walking: boolean, frame: number) {
  const index = walking ? ((Math.floor(frame) % 4) + 4) % 4 : 0;
  const key = species + ':' + direction + ':' + index;
  let image = cache.get(key); if (image) return image;
  const design = ANIMALS[species], canvas = surface(design.width, design.height);
  if (species === 'dog') dog(canvas.ctx, direction, index);
  else chicken(canvas.ctx, direction, index);
  cache.set(key, canvas.image); return canvas.image;
}