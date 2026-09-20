import type { Weapon } from "./audio";

/**
 * Pixel-art weapon renderers. These are the EXACT routines used to draw the
 * weapon in the player's hand, so the shop preview always matches in-game.
 * Every function draws with the grip at (0,0) pointing along +X.
 */
export interface WeaponDrawOpts {
  /** blade/handle length in px */
  len: number;
  /** bow draw amount: 0 = slack, 1 = fully pulled back */
  draw01?: number;
  /** 0..1 glint alpha for the katana edge highlight */
  glint?: number;
  /** 0..1 position of the glint along the blade */
  glintP?: number;
  /** evolved weapon shape */
  form?: number;
}

/** Default rest length used both for previews and idle stance. */
export const WEAPON_REST_LEN: Record<Weapon, number> = {
  katana: 34,
  bow: 24,
  hammer: 36,
  shield: 28,
  mine: 9,
  book: 18,
  staff: 25,
};

export function drawWeaponArt(ctx: CanvasRenderingContext2D, weapon: Weapon, o: WeaponDrawOpts) {
  const L = Math.max(8, Math.round(o.len));
  switch (weapon) {
    case "bow":
      drawBow(ctx, o.draw01 ?? 0, o.form ?? 0);
      break;

    case "hammer":
      drawHammer(ctx, L, o.form ?? 0);
      break;
    case "shield":
      drawShield(ctx);
      break;
    case "mine":
      drawMine(ctx);
      break;
    case "book":
      drawBook(ctx, o.form ?? 0);
      break;
    default:
      drawKatana(ctx, L, o.glint ?? 0, o.glintP ?? 0, o.form ?? 0);
  }
}


function drawStaff(ctx: CanvasRenderingContext2D, L: number, form: number) {
  const glow = form > 0 ? "#9f6cff" : "#4da9ff";
  ctx.fillStyle = "#070508";
  ctx.fillRect(-2, -2, 4, L + 4);
  ctx.fillStyle = form > 0 ? "#241634" : "#19304a";
  ctx.fillRect(-1, -1, 2, L + 2);
  ctx.fillStyle = "#d9b45c";
  ctx.fillRect(-3, -4, 6, 3);
  ctx.fillStyle = glow;
  ctx.fillRect(-2, -8, 4, 4);
  ctx.fillRect(-4, -6, 2, 2);
  ctx.fillRect(3, -6, 2, 2);
}
function drawKatana(ctx: CanvasRenderingContext2D, L: number, glint: number, glintP: number, form: number) {
  const bladeLen = form > 0 ? L + 14 : L;
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

  const segments = Math.max(3, Math.floor((bladeLen - 4) / 3));
  for (let i = 0; i < segments; i++) {
    const p = i / segments;
    const x = 4 + i * 3;
    const curve = Math.round(p * p * 5);
    const width = i > segments - 3 ? 2 : 3;
    ctx.fillStyle = "#08070a";
    ctx.fillRect(x, -2 - curve, 4, width + 2);
    ctx.fillStyle = form > 0 ? "#a88df0" : "#c9b9aa";
    ctx.fillRect(x, -1 - curve, 3, width);
    ctx.fillStyle = "#fff0dc";
    ctx.fillRect(x, -1 - curve, 3, 1);
    if (i % 3 === 0) {
      ctx.fillStyle = "#8b3036";
      ctx.fillRect(x + 1, 1 - curve, 1, 1);
    }
  }
  ctx.fillStyle = "#fff0dc";
  ctx.fillRect(bladeLen - 2, -7, 2, 2);
  if (glint > 0.02) {
    const gx = 6 + Math.round((bladeLen - 12) * glintP);
    const gy = -1 - Math.round(((gx - 4) / Math.max(1, bladeLen - 4)) ** 2 * 5);
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

function drawBow(ctx: CanvasRenderingContext2D, draw01: number, form: number) {
  if (form > 0) {
    drawPistol(ctx);
    return;
  }
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

function drawPistol(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#070508";
  ctx.fillRect(-4, -4, 17, 8);
  ctx.fillRect(0, 3, 6, 7);
  ctx.fillStyle = "#626a72";
  ctx.fillRect(-2, -2, 14, 4);
  ctx.fillStyle = "#c9d2d2";
  ctx.fillRect(2, -2, 9, 1);
  ctx.fillStyle = "#8e2430";
  ctx.fillRect(1, 3, 4, 6);
  ctx.fillStyle = "#e3574f";
  ctx.fillRect(2, 4, 1, 4);
  ctx.fillStyle = "#ffd44a";
  ctx.fillRect(12, -1, 2, 3);
}

function drawHammer(ctx: CanvasRenderingContext2D, L: number, form: number) {
  const evolved = form > 0;
  const headW = evolved ? 24 : 15;
  const headH = evolved ? 26 : 18;
  ctx.fillStyle = "#08070a";
  ctx.fillRect(-7, -3, L + 7, 7);
  ctx.fillStyle = "#64201e";
  ctx.fillRect(-6, -2, L + 5, 4);
  ctx.fillStyle = "#0a0709";
  ctx.fillRect(L - 7, -Math.floor(headH / 2), headW, headH);
  ctx.fillStyle = evolved ? "#773044" : "#5f1a27";
  ctx.fillRect(L - 5, -Math.floor(headH / 2) + 2, headW - 4, headH - 4);
  ctx.fillStyle = evolved ? "#e25762" : "#ba3742";
  ctx.fillRect(L - 3, -Math.floor(headH / 2) + 3, headW - 8, 5);
  ctx.fillStyle = "#f08a78";
  ctx.fillRect(L - 2, -Math.floor(headH / 2) + 4, 3, evolved ? 13 : 8);
  if (evolved) {
    ctx.fillStyle = "#ffd44a";
    ctx.fillRect(L + headW - 10, -3, 3, 6);
  }
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

function drawBook(ctx: CanvasRenderingContext2D, form: number) {
  if (form > 0) {
    ctx.fillStyle = "#29143b";
    ctx.fillRect(1, -7, 5, 5);
    ctx.fillRect(8, 2, 5, 5);
    ctx.fillStyle = "#d9b08f";
    ctx.fillRect(2, -6, 3, 3);
    ctx.fillRect(9, 3, 3, 3);
    ctx.fillStyle = "#8cecff";
    ctx.fillRect(6, -3, 2, 2);
    return;
  }
  ctx.fillStyle = "#070508";
  ctx.fillRect(2, -7, 13, 15);
  ctx.fillStyle = "#4f245f";
  ctx.fillRect(3, -6, 11, 13);
  ctx.fillStyle = "#9a55a5";
  ctx.fillRect(5, -5, 7, 10);
  ctx.fillStyle = "#f0d8a8";
  ctx.fillRect(7, -3, 4, 6);
  ctx.fillStyle = "#63d8ff";
  ctx.fillRect(8, -1, 2, 3);
  ctx.fillStyle = "#d9b45c";
  ctx.fillRect(3, -6, 1, 13);
}

function drawMine(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#070508";
  ctx.fillRect(2, -5, 10, 10);
  ctx.fillStyle = "#3d4147";
  ctx.fillRect(3, -4, 8, 8);
  ctx.fillStyle = "#777f86";
  ctx.fillRect(5, -2, 4, 4);
  ctx.fillStyle = "#e0444d";
  ctx.fillRect(6, -1, 2, 2);
  ctx.fillStyle = "#c9b9aa";
  ctx.fillRect(0, -1, 3, 2);
  ctx.fillRect(11, -1, 3, 2);
}

/**
 * Renders a weapon into an offscreen canvas exactly as it appears in-game,
 * scaled up with nearest-neighbour. Used by the shop preview.
 */
export function renderWeaponPreview(weapon: Weapon, scale = 3, angleDeg = -35, form = 0): HTMLCanvasElement {
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
    form,
  });
  return c;
}
