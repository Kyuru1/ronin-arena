/** Raster primitives: contours are scan-converted to whole logical pixels. */
export function surface(w: number, h: number) {
  const image = document.createElement('canvas'); image.width = w; image.height = h;
  const ctx = image.getContext('2d')!; ctx.imageSmoothingEnabled = false;
  return { image, ctx };
}
export function rect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
export function polygon(c: CanvasRenderingContext2D, points: number[][], color: string) {
  const min = Math.ceil(Math.min(...points.map(p => p[1]))), max = Math.max(...points.map(p => p[1]));
  for (let y = min; y < max; y++) {
    const xs: number[] = [];
    points.forEach(([x1, y1], i) => {
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    });
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) rect(c, Math.ceil(xs[i]), y, Math.ceil(xs[i + 1]) - Math.ceil(xs[i]), 1, color);
  }
}
export const INK = '#293932';
