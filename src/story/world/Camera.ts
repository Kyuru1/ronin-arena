import type { Position, WorldScene } from './types';
export class Camera {
  x = 0; y = 0; private initialized = false;
  follow(target: Position, width: number, height: number, scene: WorldScene, dt: number, lead = 0) {
    const tx = Math.max(width / 2, Math.min(scene.width - width / 2, target.x));
    const ty = Math.max(height / 2, Math.min(scene.height - height / 2, target.y - lead));
    if (!this.initialized) { this.x = tx; this.y = ty; this.initialized = true; }
    const ease = 1 - Math.exp(-dt * 7);
    this.x += (tx - this.x) * ease; this.y += (ty - this.y) * ease;
    return { x: Math.round(this.x - width / 2), y: Math.round(this.y - height / 2) };
  }
}
/** One logical pixel always occupies a whole number of physical display pixels. */
export function viewport(width: number, height: number, dpr: number) {
  const physicalW = Math.max(1, Math.floor(width * dpr)), physicalH = Math.max(1, Math.floor(height * dpr));
  // Two art pixels per world unit; every art pixel fills an integer physical block.
  const desired = Math.min(physicalW / (height > width ? 245 : 620), physicalH / (height > width ? 470 : 350));
  const scale = Math.max(2, Math.round(desired / 2) * 2, Math.ceil(physicalW / 800 / 2) * 2, Math.ceil(physicalH / 864 / 2) * 2);
  const w = Math.ceil(physicalW / scale), h = Math.ceil(physicalH / scale);
  return { w, h, scale, physicalW, physicalH, left: Math.floor((physicalW - w * scale) / 2), top: Math.floor((physicalH - h * scale) / 2) };
}
