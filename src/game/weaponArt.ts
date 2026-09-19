import type { Weapon } from "./audio";

/**
 * Pixel-art weapon renderers. These are the EXACT routines used to draw the
 * weapon in the player's hand, so the shop preview always matches in-game.
 * Every function draws with the grip at (0,0) pointing along +X.
 */
export interface WeaponDrawOpts {
  /** blade/handle length in px (katana/axe/hammer) */
  len: number;
  /** bow draw amount: 0 = slack, 1 = fully pulled back */
  draw01?: number;
  /** 0..1 glint alpha for the katana edge highlight */
  glint?: number;
  /** 0..1 position of the glint along the blade */
  glintP?: number;
}

/** Default rest length used both for previews and idle stance. */
export const WEAPON_REST_LEN: Record<Weapon, number> = {
  katana: 34,
  bow: 24,
  axe: 38,
  hammer: 36,
  shield: 28,
  mine: 12,
};

export function drawWeaponArt(ctx: CanvasRenderingContext2D, weapon: Weapon, o: WeaponDrawOpts) {
  const L = Math.max(8, Math.round(o.len));
  switch (weapon) {
    case "bow":
      drawBow(ctx, o.draw01 ?? 0);
      break;
    case "axe":
      drawAxe(ctx, L);
      break;
    case "hammer":
      drawHammer(ctx, L);
      break;
    case "shield":
      drawShield(ctx);
      break;
    case "mine":
      drawMine(ctx);
      break;
    default:
      drawKatana(ctx, L, o.glint ?? 0, o.glintP ?? 0);
  }
}

function drawKatana(ctx: CanvasRenderingContext2D, L: number, glint: number, glintP: number) {
  ctx.fillStyle = "#070508";
  ctx.fillRect(-10, -2, 13, 5);
  ctx.fillStyle = "#891f2d";
  ctx.fillRect(-9, -1, 10, 3);
  ctx.fillStyle = "#d34a4e";
  ctx.fillRect(-7, -1, 2, 1);
  ctx.fillRect(-2, 1, 2, 1);
  ctx.fillStyle = "#f2c58d";
  ctx.fillRect(-11, -3, 3, 7);
  ctx.fillStyle = "#0c080b";
  ctx.fillRect(1, -5, 3, 10);
  ctx.fillStyle = "#d34a4e";
  ctx.fillRect(1, -4, 2, 8);

  const segments = Math.max(3, Math.floor((L - 4) / 3));
  for (let i = 0; i < segments; i++) {
    const p = i / segments;
    const x = 4 + i * 3;
    const curve = Math.round(p * p * 5);
    const width = i > segments - 3 ? 2 : 3;
    ctx.fillStyle = "#08070a";
    ctx.fillRect(x, -2 - curve, 4, width + 2);
    ctx.fillStyle = "#c9b9aa";
    ctx.fillRect(x, -1 - curve, 3, width);
    ctx.fillStyle = "#fff0dc";
    ctx.fillRect(x, -1 - curve, 3, 1);
    if (i % 3 === 0) {
      ctx.fillStyle = "#8b3036";
      ctx.fillRect(x + 1, 1 - curve, 1, 1);
    }
  }
  ctx.fillStyle = "#fff0dc";
  ctx.fillRect(L - 2, -7, 2, 2);
  if (glint > 0.02) {
    const gx = 6 + Math.round((L - 12) * glintP);
    const gy = -1 - Math.round(((gx - 4) / Math.max(1, L - 4)) ** 2 * 5);
    ctx.fillStyle = `rgba(255,255,255,${glint})`;
    ctx.fillRect(gx - 2, gy - 2, 5, 5);
  }
}

/** 1px pixel line (Bresenham-free lerp, good enough at this scale). */
function pixLine(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  ctx.fillStyle = color;
  for (let i = 0; i <= steps; i++) {
    ctx.fillRect(Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps), 1, 1);
  }
}

function drawBow(ctx: CanvasRenderingContext2D, draw01: number) {
  const pull = Math.max(0, Math.min(1, draw01));
  const nockX = Math.round(-1 - pull * 8);
  const tipX = 5 + Math.round(pull);

  // Compact yumi silhouette: recurved tips, pale inner laminate and red grip.
  const limb: Array<[number, number]> = [[2, -10], [5, -9], [7, -6], [8, -3], [7, 0], [8, 3], [7, 6], [5, 9], [2, 10]];
  for (let i = 0; i < limb.length - 1; i++) {
    const [x0, y0] = limb[i];
    const [x1, y1] = limb[i + 1];
    pixLine(ctx, x0, y0, x1, y1, "#070508");
    pixLine(ctx, x0 + 1, y0, x1 + 1, y1, i % 2 ? "#d45a3f" : "#9c2931");
  }
  ctx.fillStyle = "#f2c58d";
  ctx.fillRect(2, -10, 2, 1);
  ctx.fillRect(2, 9, 2, 1);
  ctx.fillStyle = "#d9b073";
  ctx.fillRect(6, -2, 3, 5);
  ctx.fillStyle = "#681923";
  ctx.fillRect(7, -2, 2, 5);

  pixLine(ctx, tipX - 3, -10, nockX, 0, pull > 0.8 ? "#ffffff" : "#ead8b8");
  pixLine(ctx, tipX - 3, 10, nockX, 0, pull > 0.8 ? "#ffffff" : "#ead8b8");

  const shaftL = 14;
  ctx.fillStyle = "#f3dfbd";
  ctx.fillRect(nockX, 0, shaftL, 1);
  ctx.fillStyle = "#c7333e";
  ctx.fillRect(nockX, -1, 3, 1);
  ctx.fillRect(nockX + 1, 1, 3, 1);
  const hx = nockX + shaftL;
  ctx.fillStyle = "#d8e0df";
  ctx.fillRect(hx, -1, 3, 3);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(hx + 1, 0, 2, 1);
}

function drawAxe(ctx: CanvasRenderingContext2D, L: number) {
  // Long wrapped haft with a steel pommel.
  ctx.fillStyle = "#070508";
  ctx.fillRect(-9, -3, L + 8, 7);
  ctx.fillStyle = "#5b271f";
  ctx.fillRect(-8, -2, L + 6, 5);
  ctx.fillStyle = "#a94a32";
  ctx.fillRect(-6, -1, L + 3, 2);
  for (let x = -6; x < L - 5; x += 5) {
    ctx.fillStyle = "#d17a4d";
    ctx.fillRect(x, -2, 2, 1);
    ctx.fillRect(x + 2, 2, 2, 1);
  }
  ctx.fillStyle = "#b8c2c0";
  ctx.fillRect(-10, -3, 3, 7);

  // Symmetrical double crescent head with clearly exposed cutting edges.
  ctx.fillStyle = "#070508";
  ctx.fillRect(L - 7, -13, 15, 27);
  ctx.fillStyle = "#353c43";
  ctx.fillRect(L - 5, -11, 11, 23);
  ctx.fillStyle = "#6f7880";
  ctx.fillRect(L - 8, -10, 4, 21);
  ctx.fillRect(L + 5, -10, 4, 21);
  ctx.fillRect(L - 6, -12, 4, 5);
  ctx.fillRect(L + 3, -12, 4, 5);
  ctx.fillRect(L - 6, 8, 4, 5);
  ctx.fillRect(L + 3, 8, 4, 5);
  ctx.fillStyle = "#dbe3df";
  ctx.fillRect(L - 9, -9, 2, 19);
  ctx.fillRect(L + 8, -9, 2, 19);
  ctx.fillRect(L - 7, -12, 3, 2);
  ctx.fillRect(L + 5, -12, 3, 2);
  ctx.fillRect(L - 7, 11, 3, 2);
  ctx.fillRect(L + 5, 11, 3, 2);
  ctx.fillStyle = "#8e2430";
  ctx.fillRect(L - 3, -5, 7, 11);
  ctx.fillStyle = "#e3574f";
  ctx.fillRect(L - 1, -3, 3, 7);
}

function drawHammer(ctx: CanvasRenderingContext2D, L: number) {
  ctx.fillStyle = "#08070a";
  ctx.fillRect(-7, -2, L + 5, 5);
  ctx.fillStyle = "#64201e";
  ctx.fillRect(-6, -1, L + 3, 3);
  ctx.fillStyle = "#0a0709";
  ctx.fillRect(L - 6, -9, 15, 18);
  ctx.fillStyle = "#5f1a27";
  ctx.fillRect(L - 4, -7, 11, 14);
  ctx.fillStyle = "#ba3742";
  ctx.fillRect(L - 3, -6, 8, 4);
  ctx.fillStyle = "#e35a59";
  ctx.fillRect(L - 3, -5, 2, 8);
}

function drawShield(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#090507";
  ctx.fillRect(6, -10, 8, 20);
  ctx.fillStyle = "#721e29";
  ctx.fillRect(7, -8, 6, 16);
  ctx.fillStyle = "#b53842";
  ctx.fillRect(8, -6, 4, 12);
  ctx.fillStyle = "#ffd0a2";
  ctx.fillRect(9, -2, 2, 4);
}

function drawMine(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#070508";
  ctx.fillRect(1, -7, 15, 14);
  ctx.fillStyle = "#3d4147";
  ctx.fillRect(3, -5, 11, 10);
  ctx.fillStyle = "#777f86";
  ctx.fillRect(5, -3, 7, 6);
  ctx.fillStyle = "#e0444d";
  ctx.fillRect(8, -1, 2, 2);
  ctx.fillStyle = "#c9b9aa";
  ctx.fillRect(0, -1, 3, 2);
  ctx.fillRect(14, -1, 3, 2);
}

/**
 * Renders a weapon into an offscreen canvas exactly as it appears in-game,
 * scaled up with nearest-neighbour. Used by the shop preview.
 */
export function renderWeaponPreview(weapon: Weapon, scale = 3, angleDeg = -35): HTMLCanvasElement {
  const len = WEAPON_REST_LEN[weapon];
  // generous bounds around the grip origin
  const W = 72;
  const H = 56;
  const c = document.createElement("canvas");
  c.width = W * scale;
  c.height = H * scale;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.scale(scale, scale);
  // put the grip a bit left/bottom so the whole weapon fits when rotated
  ctx.translate(weapon === "bow" || weapon === "shield" ? 30 : 22, 34);
  ctx.rotate((angleDeg * Math.PI) / 180);
  drawWeaponArt(ctx, weapon, {
    len,
    draw01: weapon === "bow" ? 0.55 : 0,
    glint: 0.4,
    glintP: 0.6,
  });
  return c;
}
