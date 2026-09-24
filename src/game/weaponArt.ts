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
  katana: 28,
  bow: 24,
  hammer: 36,
  shield: 28,
  mine: 9,
  book: 18,
  staff: 25,
  harp: 28,
  godslayer: 52,
  boomerang: 22,
  shuriken: 18,
  spear: 54,
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
    case "staff":
      drawStaff(ctx, L, o.form ?? 0);
      break;
    case "harp":
      drawHarp(ctx);
      break;
    case "godslayer":
      drawGodslayer(ctx, L);
      break;
    case "boomerang":
      drawBoomerang(ctx, o.form ?? 0);
      break;
    case "shuriken":
      drawShuriken(ctx, o.form ?? 0);
      break;
    case "spear":
      drawSpear(ctx, L, o.form ?? 0);
      break;
    default:
      drawKatana(ctx, L, o.glint ?? 0, o.glintP ?? 0, o.form ?? 0);
  }
}

function drawBoomerang(ctx: CanvasRenderingContext2D, form: number) {
  const s = form > 0 ? 1.45 : 1;
  ctx.save(); ctx.scale(s, s);
  ctx.fillStyle = "#080608"; ctx.fillRect(-9, -9, 7, 18); ctx.fillRect(-8, 3, 18, 7);
  ctx.fillStyle = "#a12d36"; ctx.fillRect(-7, -7, 3, 13); ctx.fillRect(-6, 5, 13, 3);
  ctx.fillStyle = "#ffd06e"; ctx.fillRect(-5, -5, 2, 8); ctx.fillRect(-4, 4, 9, 2);
  ctx.restore();
}
function drawShuriken(ctx: CanvasRenderingContext2D, form: number) {
  const s = form > 0 ? 1.8 : 1;
  ctx.save(); ctx.scale(s, s); ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#09080b"; ctx.fillRect(-2, -11, 5, 22); ctx.fillRect(-11, -2, 22, 5);
  ctx.fillStyle = "#aab4bd"; ctx.fillRect(-1, -9, 3, 18); ctx.fillRect(-9, -1, 18, 3);
  ctx.fillStyle = "#e5edf0"; ctx.fillRect(-1, -1, 3, 3); ctx.restore();
}
function drawSpear(ctx: CanvasRenderingContext2D, L: number, form: number) {
  const length = L + (form > 0 ? 18 : 0);
  const shaftWidth = form > 0 ? 3 : 2;
  ctx.fillStyle = "#080608"; ctx.fillRect(-12, -shaftWidth, length + 12, shaftWidth * 2 + 1);
  ctx.fillStyle = form > 0 ? "#6f2d55" : "#774523"; ctx.fillRect(-10, -1, length + 8, 3);
  ctx.fillStyle = "#d19a52"; for (let x = -8; x < length - 4; x += 8) ctx.fillRect(x, -2, 2, 5);
  ctx.fillStyle = "#09080b"; ctx.fillRect(length - 3, -7, 12, 15);
  ctx.fillStyle = form > 0 ? "#c18cff" : "#d9e1df"; ctx.fillRect(length - 1, -5, 7, 11); ctx.fillRect(length + 6, -2, 6, 5);
  ctx.fillStyle = "#fff4df"; ctx.fillRect(length + 7, -1, 4, 2);
}


function drawStaff(ctx: CanvasRenderingContext2D, L: number, form: number) {
  const evolved = form > 0;
  const glow = evolved ? "#b35cff" : "#4da9ff";
  const core = evolved ? "#2c143d" : "#17344d";
  // layered wood / metal shaft with a crystal head, readable at game scale.
  ctx.fillStyle = "#070508";
  ctx.fillRect(-3, -2, 6, L + 5);
  ctx.fillStyle = core;
  ctx.fillRect(-1, 0, 3, L + 1);
  ctx.fillStyle = evolved ? "#6b348d" : "#2b78a1";
  ctx.fillRect(0, 2, 1, L - 2);
  for (let y = 5; y < L; y += 7) {
    ctx.fillStyle = "#d4a552";
    ctx.fillRect(-3, y, 6, 1);
  }
  ctx.fillStyle = "#070508";
  ctx.fillRect(-6, -10, 12, 10);
  ctx.fillStyle = evolved ? "#6330a0" : "#20598d";
  ctx.fillRect(-4, -8, 8, 7);
  ctx.fillStyle = glow;
  ctx.fillRect(-3, -11, 6, 5);
  ctx.fillRect(-5, -8, 2, 3);
  ctx.fillRect(4, -8, 2, 3);
  ctx.fillStyle = "#f1e8ff";
  ctx.fillRect(-1, -10, 2, 3);
  if (evolved) {
    ctx.fillStyle = "#c77dff";
    ctx.fillRect(-7, -4, 2, 2);
    ctx.fillRect(6, -4, 2, 2);
  }
}
function drawHarp(ctx: CanvasRenderingContext2D) {
  // A compact gold concert harp: heavy pillar, curved neck and a broad sound box.
  ctx.fillStyle = "#080608";
  ctx.fillRect(-7, -17, 5, 35);
  ctx.fillRect(-9, 15, 26, 5);
  ctx.fillRect(13, -13, 5, 29);
  ctx.fillStyle = "#713315";
  ctx.fillRect(-6, -15, 3, 31);
  ctx.fillRect(-8, 16, 22, 2);
  ctx.fillRect(14, -11, 2, 25);
  ctx.fillStyle = "#f0a329";
  ctx.fillRect(-7, -17, 5, 3);
  ctx.fillRect(-9, 15, 26, 3);
  ctx.fillRect(-5, -14, 3, 29);
  ctx.fillRect(-2, -17, 5, 3);
  ctx.fillRect(1, -15, 8, 2);
  ctx.fillRect(8, -13, 5, 2);
  ctx.fillRect(12, -11, 4, 4);
  ctx.fillRect(14, -8, 3, 22);
  ctx.fillRect(11, 13, 6, 3);
  ctx.fillStyle = "#ffe166";
  ctx.fillRect(-4, -15, 2, 28);
  ctx.fillRect(0, -15, 2, 1);
  ctx.fillRect(4, -14, 3, 1);
  ctx.fillRect(15, -7, 1, 18);
  ctx.fillStyle = "#f9f5df";
  for (let x = 0; x <= 12; x += 2) {
    const top = -14 + Math.floor(x / 3);
    const bottom = 14 - Math.floor((12 - x) / 5);
    ctx.fillRect(x, top, 1, bottom - top);
  }
  ctx.fillStyle = "#d5ecff";
  ctx.fillRect(2, -12, 1, 22);
  ctx.fillRect(8, -10, 1, 21);
}
function drawGodslayer(ctx: CanvasRenderingContext2D, L:number) {
  ctx.fillStyle="#070508"; ctx.fillRect(-11,-3,14,7); ctx.fillRect(2,-6,L+8,12);
  ctx.fillStyle="#7c2140"; ctx.fillRect(-10,-1,12,3);
  ctx.fillStyle="#ffd44a"; ctx.fillRect(1,-5,5,10); ctx.fillRect(6,-4,L-3,8);
  ctx.fillStyle="#fff7d0"; ctx.fillRect(7,-3,L-7,2);
  ctx.fillStyle="#e0444d"; ctx.fillRect(L+2,-2,6,4); ctx.fillRect(L+6,-4,3,8);
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
