import { SPR, buildSprites, type Sprite } from "./sprites";
import { Sfx, unlockAudio, setVolume, type Weapon } from "./audio";
import { drawWeaponArt } from "./weaponArt";
import { I18N, type Language } from "./i18n";
export type { Weapon } from "./audio";

export type Phase = "menu" | "playing" | "paused" | "upgrade" | "dying" | "dead";
export type PowerUp = "speed" | "heart" | "dashCd" | "dashDist";

export interface UpgradeOffer {
  wave: number;
}

export interface HudStats {
  hp: number;
  maxHp: number;
  score: number;
  coins: number;
  wave: number;
  combo: number;
  kills: number;
  time: number;
  dashReady: boolean;
  dashCd: number;
  dashMax: number;
  chain: number;
  chainP: number;
  weapons: Weapon[];
  activeSlot: number;
  waveTotal: number;
  waveLeft: number;
  speedBonus: number;
  dashSpeedMult: number;
  mineTutorial: boolean;
}

export interface GameOpts {
  shake: number;
  flash: number;
  volume: number;
  quality: "high" | "low";
  vsync: boolean;
  language: Language;
}

type EnemyType =
  | "grunt"
  | "bat"
  | "spitter"
  | "brute"
  | "ninja"
  | "hound"
  | "wisp"
  | "archer"
  | "oni"
  | "shield"
  | "slime"
  | "monk"
  | "demon"
  | "skeleton"
  | "boss";

interface Enemy {
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  r: number;
  speed: number;
  flash: number;
  stun: number;
  t: number;
  cd: number;
  state: number;
  touchCd: number;
  face: number;
  spawnT: number;
  score: number;
  dmg: number;
  scaleY: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  drag: number;
  kind: 0 | 1 | 2 | 3; // 0 square, 1 ring, 2 spark-line, 3 streak
  rot?: number;
}

interface FloatText {
  x: number;
  y: number;
  vy: number;
  life: number;
  max: number;
  text: string;
  color: string;
  size: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  r: number;
}

interface PlayerArrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  pierce: number;
  rot: number;
  dmg: number;
  hitSet: Set<Enemy>;
}

interface Shockwave {
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
  maxLife: number;
}

interface Pickup {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  kind: "heart" | "gem" | "coin";
  magnet: boolean;
}

interface SpawnMark {
  x: number;
  y: number;
  t: number;
  max: number;
  type: EnemyType;
}

interface Impact {
  x: number;
  y: number;
  a: number;
  life: number;
  max: number;
  heavy: boolean;
}

interface LandMine {
  x: number;
  y: number;
  armT: number;
  life: number;
}

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

function angDiff(a: number, b: number) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

const WEAPON_CONFIG: Record<
  Weapon,
  { wind: number; strike: number; rec: number; cd: number; arc: number; range: number; dmg: number; kb: number }
> = {
  katana: { wind: 0.05, strike: 0.12, rec: 0.09, cd: 0.12, arc: 1.55, range: 34, dmg: 2, kb: 160 },
  bow: { wind: 0.12, strike: 0.08, rec: 0.12, cd: 0.18, arc: 0.8, range: 24, dmg: 3, kb: 120 },
  axe: { wind: 0.11, strike: 0.16, rec: 0.15, cd: 0.2, arc: 2.45, range: 38, dmg: 4, kb: 250 },
  hammer: { wind: 0.16, strike: 0.2, rec: 0.22, cd: 0.28, arc: 2.2, range: 36, dmg: 6, kb: 360 },
  shield: { wind: 0.06, strike: 0.12, rec: 0.14, cd: 0.16, arc: 1.85, range: 28, dmg: 0, kb: 0 },
  mine: { wind: 0, strike: 0, rec: 0, cd: 0.45, arc: 0, range: 12, dmg: 6, kb: 0 },
};

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  W = 480;
  H = 270;
  phase: Phase = "menu";

  private floor!: HTMLCanvasElement;
  private decal!: HTMLCanvasElement;
  private dctx!: CanvasRenderingContext2D;

  // Player stats & inventory
  px = 0;
  py = 0;
  pvx = 0;
  pvy = 0;
  hp = 5;
  maxHp = 5;
  coins = 0;
  face = 1;
  iframe = 0;
  dashT = 0;
  dashCd = 0;
  dashMax = 6;
  dashSpeedMult = 1;
  dashDx = 0;
  dashDy = 0;
  speedBonus = 0;

  // Weapons in slots (up to 4)
  weapons: Weapon[] = ["katana"];
  activeSlot = 0;

  atkT = 0;
  atkCd = 0;
  atkAngle = 0;
  atkDir = 1;
  atkChain = 0;
  atkChainT = 0;
  // bow: hold to draw the string, release to let the arrow fly
  bowCharge = 0; // 0..1
  bowHolding = false;
  bowReleasing = 0; // short snap-back animation timer
  bowFireCd = 0;
  bowFullSfx = false;
  bowDrawSfxT = 0;
  mineHeld = false;
  mineTutorialT = 0;
  hitSet = new Set<Enemy>();
  walkT = 0;
  atkWind = 0;
  atkDur = 0;
  atkRec = 0;
  leanX = 0;
  leanY = 0;
  idleT = 0;
  glint = 0;
  trail: { a: number; r: number; life: number }[] = [];
  impacts: Impact[] = [];
  arrows: PlayerArrow[] = [];
  shockwaves: Shockwave[] = [];
  mines: LandMine[] = [];

  // World entities
  enemies: Enemy[] = [];
  parts: Particle[] = [];
  texts: FloatText[] = [];
  shots: Projectile[] = [];
  pickups: Pickup[] = [];
  marks: SpawnMark[] = [];
  afterimages: { x: number; y: number; life: number }[] = [];

  // Meta stats
  score = 0;
  kills = 0;
  combo = 0;
  comboT = 0;
  maxCombo = 0;
  elapsed = 0;
  wave = 1;
  waveTotal = 0; // mobs this wave will spawn in total
  waveSpawned = 0; // how many have been queued so far
  waveLeft = 0; // legacy mirror (kept for HUD convenience)
  waveClearT = -1; // countdown after clearing a wave (-1 = idle)
  spawnTimer = 1.0;
  shake = 0;
  flash = 0;
  flashColor = "255,255,255";
  hitstop = 0;
  banner = "";
  bannerT = 0;
  deathT = 0;
  vignettePulse = 0;
  opts: GameOpts = { shake: 1, flash: 1, volume: 0.45, quality: "high", vsync: true, language: "pt" };

  // Input
  keys = new Set<string>();
  mouseX = 0;
  mouseY = 0;
  mouseActive = false;
  attackHeld = false;
  dashQueued = false;
  moveStick: { id: number; ox: number; oy: number; x: number; y: number } | null = null;
  aimStick: { id: number; ox: number; oy: number; x: number; y: number } | null = null;

  onStats: (s: HudStats) => void = () => {};
  onGameOver: (s: HudStats) => void = () => {};
  onUpgrade: (offer: UpgradeOffer) => void = () => {};

  private raf = 0;
  private last = 0;
  private lastRender = 0;
  private lastStats = "";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    buildSprites();
    this.resize(canvas.clientWidth || 960, canvas.clientHeight || 540);
    this.bind();
    this.reset();
    this.phase = "menu";
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  get currentWeapon(): Weapon {
    return this.weapons[this.activeSlot] ?? "katana";
  }

  /* ----------------------------- setup ----------------------------- */

  setOpts(o: Partial<GameOpts>) {
    Object.assign(this.opts, o);
    setVolume(this.opts.volume);
  }

  resize(cw: number, ch: number) {
    const AREA = 480 * 270;
    const aspect = clamp(cw / Math.max(1, ch), 0.58, 2.2);
    let h = Math.round(Math.sqrt(AREA / aspect));
    let w = Math.round(h * aspect);
    w = Math.max(220, Math.min(760, w - (w % 2)));
    h = Math.max(220, Math.min(620, h - (h % 2)));
    const dx = (w - this.W) / 2;
    const dy = (h - this.H) / 2;
    this.W = w;
    this.H = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = false;
    this.px = clamp(this.px + dx, 16, w - 16);
    this.py = clamp(this.py + dy, 16, h - 16);
    this.buildFloor();
  }

  private buildFloor() {
    const { W, H } = this;
    const f = document.createElement("canvas");
    f.width = W;
    f.height = H;
    const c = f.getContext("2d")!;
    c.fillStyle = "#16090d";
    c.fillRect(0, 0, W, H);
    const T = 24;
    for (let y = 0; y < H; y += T) {
      for (let x = 0; x < W; x += T) {
        const odd = ((x / T + y / T) | 0) % 2 === 0;
        c.fillStyle = odd ? "#240d13" : "#1d0a0f";
        c.fillRect(x, y, T, T);
        c.fillStyle = "rgba(0,0,0,0.22)";
        c.fillRect(x, y + T - 1, T, 1);
        c.fillRect(x + T - 1, y, 1, T);
        c.fillStyle = "rgba(255,255,255,0.035)";
        c.fillRect(x, y, T, 1);
        for (let i = 0; i < 5; i++) {
          c.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.15)";
          c.fillRect(x + ((Math.random() * T) | 0), y + ((Math.random() * T) | 0), 1, 1);
        }
      }
    }
    // Glowing arena seal
    const cx = W / 2;
    const cy = H / 2;
    c.strokeStyle = "rgba(220,45,60,0.14)";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(cx, cy, Math.min(W, H) * 0.3, 0, TAU);
    c.stroke();
    c.beginPath();
    c.arc(cx, cy, Math.min(W, H) * 0.22, 0, TAU);
    c.stroke();
    c.strokeStyle = "rgba(255,141,80,0.08)";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * Math.min(W, H) * 0.22, cy + Math.sin(a) * Math.min(W, H) * 0.22);
      c.lineTo(cx + Math.cos(a) * Math.min(W, H) * 0.3, cy + Math.sin(a) * Math.min(W, H) * 0.3);
      c.stroke();
    }
    // Arena borders
    const B = 10;
    c.fillStyle = "#090507";
    c.fillRect(0, 0, W, B);
    c.fillRect(0, H - B, W, B);
    c.fillRect(0, 0, B, H);
    c.fillRect(W - B, 0, B, H);
    c.fillStyle = "#491320";
    for (let x = 0; x < W; x += 16) {
      c.fillRect(x + 1, B - 3, 14, 3);
      c.fillRect(x + 1, H - B, 14, 3);
    }
    for (let y = 0; y < H; y += 16) {
      c.fillRect(B - 3, y + 1, 3, 14);
      c.fillRect(W - B, y + 1, 3, 14);
    }
    c.fillStyle = "rgba(0,0,0,0.4)";
    c.fillRect(0, B, W, 4);
    c.fillStyle = "#8c2835";
    c.fillRect(B - 1, B - 1, W - B * 2 + 2, 1);
    c.fillRect(B - 1, H - B, W - B * 2 + 2, 1);
    this.floor = f;

    const d = document.createElement("canvas");
    d.width = W;
    d.height = H;
    this.decal = d;
    this.dctx = d.getContext("2d")!;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    const cv = this.canvas;
    cv.removeEventListener("pointerdown", this.onPointerDown);
    cv.removeEventListener("pointermove", this.onPointerMove);
    cv.removeEventListener("pointerup", this.onPointerUp);
    cv.removeEventListener("pointercancel", this.onPointerUp);
    cv.removeEventListener("wheel", this.onWheel);
    cv.removeEventListener("contextmenu", prevent);
  }

  private bind() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    const cv = this.canvas;
    cv.addEventListener("pointerdown", this.onPointerDown);
    cv.addEventListener("pointermove", this.onPointerMove);
    cv.addEventListener("pointerup", this.onPointerUp);
    cv.addEventListener("pointercancel", this.onPointerUp);
    cv.addEventListener("wheel", this.onWheel, { passive: false });
    cv.addEventListener("contextmenu", prevent);
  }

  private onWheel = (e: WheelEvent) => {
    if (this.phase !== "playing") return;
    e.preventDefault();
    if (e.deltaY > 0) this.nextWeapon();
    else if (e.deltaY < 0) this.prevWeapon();
  };

  private onBlur = () => {
    this.keys.clear();
    this.attackHeld = false;
    this.moveStick = null;
    this.aimStick = null;
    if (this.phase === "playing") this.pause();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "tab"].includes(k)) {
      e.preventDefault();
    }
    if (this.keys.has(k)) return;
    this.keys.add(k);
    if (this.phase !== "playing") return;

    if (k === " " || k === "j") this.attackHeld = true;
    if (k === "shift" || k === "k" || k === "l") this.dashQueued = true;

    // Fast slot hotkeys 1, 2, 3, 4
    if (k === "1") this.switchSlot(0);
    if (k === "2") this.switchSlot(1);
    if (k === "3") this.switchSlot(2);
    if (k === "4") this.switchSlot(3);
    if (k === "q") this.prevWeapon();
    if (k === "e") this.nextWeapon();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    this.keys.delete(k);
    if (k === " " || k === "j") this.attackHeld = false;
  };

  private toCanvas(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * this.W,
      y: ((e.clientY - r.top) / r.height) * this.H,
    };
  }

  private onPointerDown = (e: PointerEvent) => {
    unlockAudio();
    if (this.phase !== "playing") return;
    const p = this.toCanvas(e);
    this.canvas.setPointerCapture?.(e.pointerId);
    if (e.pointerType === "mouse") {
      this.mouseX = p.x;
      this.mouseY = p.y;
      this.mouseActive = true;
      if (e.button === 2) this.dashQueued = true;
      else this.attackHeld = true;
      return;
    }
    if (p.x < this.W * 0.45) {
      if (!this.moveStick) this.moveStick = { id: e.pointerId, ox: p.x, oy: p.y, x: p.x, y: p.y };
    } else {
      if (!this.aimStick) this.aimStick = { id: e.pointerId, ox: p.x, oy: p.y, x: p.x, y: p.y };
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    const p = this.toCanvas(e);
    if (e.pointerType === "mouse") {
      this.mouseX = p.x;
      this.mouseY = p.y;
      this.mouseActive = true;
      return;
    }
    if (this.moveStick && this.moveStick.id === e.pointerId) {
      this.moveStick.x = p.x;
      this.moveStick.y = p.y;
    } else if (this.aimStick && this.aimStick.id === e.pointerId) {
      this.aimStick.x = p.x;
      this.aimStick.y = p.y;
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === "mouse") {
      this.attackHeld = false;
      return;
    }
    if (this.moveStick?.id === e.pointerId) this.moveStick = null;
    if (this.aimStick?.id === e.pointerId) this.aimStick = null;
  };

  touchDash() {
    this.dashQueued = true;
  }

  /* ---------------------- weapon slots & shop ---------------------- */

  switchSlot(slotIndex: number) {
    if (slotIndex >= 0 && slotIndex < this.weapons.length && slotIndex !== this.activeSlot) {
      this.activeSlot = slotIndex;
      this.atkT = 0;
      this.atkWind = 0;
      this.atkRec = 0;
      this.atkCd = 0.08;
      this.trail.length = 0;
      this.bowHolding = false;
      this.bowCharge = 0;
      this.bowReleasing = 0;
      this.bowFireCd = 0;
      Sfx.equip();
      this.pushStats(true);
    }
  }

  nextWeapon() {
    if (this.weapons.length <= 1) return;
    this.switchSlot((this.activeSlot + 1) % this.weapons.length);
  }

  prevWeapon() {
    if (this.weapons.length <= 1) return;
    this.switchSlot((this.activeSlot - 1 + this.weapons.length) % this.weapons.length);
  }

  buyWeapon(weapon: Weapon, cost: number): boolean {
    if (this.coins < cost) return false;
    if (this.weapons.includes(weapon)) return false;
    if (this.weapons.length >= 4) return false;
    this.coins -= cost;
    this.weapons.push(weapon);
    this.activeSlot = this.weapons.length - 1;
    if (weapon === "mine") this.mineTutorialT = 6;
    Sfx.buy();
    this.pushStats(true);
    return true;
  }

  sellWeapon(slotIndex: number, refund: number): boolean {
    if (this.weapons.length <= 1) return false; // keep at least 1 weapon
    if (slotIndex < 0 || slotIndex >= this.weapons.length) return false;
    this.weapons.splice(slotIndex, 1);
    this.coins += refund;
    if (this.activeSlot >= this.weapons.length) {
      this.activeSlot = this.weapons.length - 1;
    }
    Sfx.sell();
    this.pushStats(true);
    return true;
  }

  buyPowerUp(power: PowerUp, cost: number): boolean {
    if (this.coins < cost) return false;
    this.coins -= cost;
    if (power === "speed") {
      this.speedBonus += 18;
      this.addScore(40, this.px, this.py - 16, I18N[this.opts.language].speedBoost, "#ffae57");
    } else if (power === "heart") {
      this.maxHp += 1;
      this.hp = Math.min(this.maxHp, this.hp + 2);
      this.addScore(40, this.px, this.py - 16, I18N[this.opts.language].healthBoost, "#ff4f58");
    } else if (power === "dashCd") {
      this.dashMax = Math.max(1.5, this.dashMax - 0.8);
      this.dashCd = 0;
      this.addScore(40, this.px, this.py - 16, I18N[this.opts.language].dashCooldownBoost, "#f8d7a5");
    } else if (power === "dashDist") {
      this.dashSpeedMult += 0.25;
      this.addScore(40, this.px, this.py - 16, I18N[this.opts.language].dashDistanceBoost, "#f8d7a5");
    }
    Sfx.buy();
    this.pushStats(true);
    return true;
  }

  closeShop() {
    this.wave++;
    this.phase = "playing";
    this.last = performance.now();
    // re-center the player and give a short breather before the ring closes in
    this.iframe = Math.max(this.iframe, 0.8);
    this.beginWave();
  }

  /* ----------------------------- lifecycle ----------------------------- */

  reset() {
    this.enemies.length = 0;
    this.parts.length = 0;
    this.texts.length = 0;
    this.shots.length = 0;
    this.arrows.length = 0;
    this.shockwaves.length = 0;
    this.mines.length = 0;
    this.pickups.length = 0;
    this.marks.length = 0;
    this.afterimages.length = 0;
    this.impacts.length = 0;
    this.trail.length = 0;
    this.px = this.W / 2;
    this.py = this.H / 2;
    this.pvx = this.pvy = 0;
    this.hp = this.maxHp = 5;
    this.coins = 0;
    this.iframe = 0;
    this.dashT = this.dashCd = 0;
    this.dashMax = 6;
    this.dashSpeedMult = 1;
    this.speedBonus = 0;
    this.weapons = ["katana"];
    this.activeSlot = 0;
    this.atkT = this.atkCd = this.atkWind = this.atkDur = this.atkRec = 0;
    this.atkChain = 0;
    this.atkChainT = 0;
    this.bowCharge = 0;
    this.bowHolding = false;
    this.bowReleasing = 0;
    this.bowFireCd = 0;
    this.bowFullSfx = false;
    this.mineHeld = false;
    this.mineTutorialT = 0;
    this.leanX = this.leanY = 0;
    this.idleT = 0;
    this.glint = 0;
    this.score = 0;
    this.kills = 0;
    this.combo = 0;
    this.comboT = 0;
    this.maxCombo = 0;
    this.elapsed = 0;
    this.wave = 1;
    this.waveTotal = 0;
    this.waveSpawned = 0;
    this.waveLeft = 0;
    this.waveClearT = -1;
    this.spawnTimer = 0.8;
    this.shake = 0;
    this.flash = 0;
    this.hitstop = 0;
    this.deathT = 0;
    this.banner = "";
    this.bannerT = 0;
    if (this.dctx) this.dctx.clearRect(0, 0, this.W, this.H);
    this.pushStats(true);
  }

  startGame() {
    unlockAudio();
    this.reset();
    this.phase = "playing";
    Sfx.start();
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * TAU;
      this.parts.push({
        x: this.px + Math.cos(a) * 8,
        y: this.py + Math.sin(a) * 8,
        vx: Math.cos(a) * 90,
        vy: Math.sin(a) * 90,
        life: 0.5,
        max: 0.5,
        size: 2,
        color: "#ff6a63",
        drag: 3,
        kind: 0,
      });
    }
    this.beginWave();
  }

  pause() {
    if (this.phase === "playing") this.phase = "paused";
  }
  resume() {
    if (this.phase === "paused") {
      this.phase = "playing";
      this.last = performance.now();
    }
  }
  togglePause() {
    if (this.phase === "playing") this.pause();
    else if (this.phase === "paused") this.resume();
  }

  stats(): HudStats {
    return {
      hp: this.hp,
      maxHp: this.maxHp,
      score: Math.floor(this.score),
      coins: this.coins,
      wave: this.wave,
      combo: this.combo,
      kills: this.kills,
      time: this.elapsed,
      dashReady: this.dashCd <= 0,
      dashCd: this.dashCd,
      dashMax: this.dashMax,
      chain: this.atkChain,
      chainP: clamp(this.atkChainT / 0.85, 0, 1),
      weapons: this.weapons,
      activeSlot: this.activeSlot,
      waveTotal: this.waveTotal,
      waveLeft: this.waveLeft,
      speedBonus: this.speedBonus,
      dashSpeedMult: this.dashSpeedMult,
      mineTutorial: this.mineTutorialT > 0,
    };
  }

  private pushStats(force = false) {
    this.waveLeft = Math.max(0, this.waveTotal - this.waveSpawned) + this.marks.length + this.enemies.length;
    const s = this.stats();
    const key = `${s.hp}|${s.score}|${s.coins}|${s.wave}|${s.combo}|${s.kills}|${s.dashReady}|${Math.ceil(s.dashCd * 10)}|${s.activeSlot}|${s.weapons.join(",")}|${Math.floor(s.time)}|${s.waveLeft}|${s.maxHp}|${s.speedBonus}|${s.dashSpeedMult}|${s.dashMax}|${s.mineTutorial}`;
    if (force || key !== this.lastStats) {
      this.lastStats = key;
      this.onStats(s);
    }
  }

  /* ----------------------------- loop ----------------------------- */

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    if (!this.opts.vsync && now - this.lastRender < 8) return;
    this.lastRender = now;
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.05) dt = 0.05;

    if (this.phase === "playing" || this.phase === "dying") {
      let scale = 1;
      if (this.hitstop > 0) {
        this.hitstop -= dt;
        scale = 0;
      }
      const maxStep = 1 / 50;
      let remaining = dt;
      let guard = 0;
      while (remaining > 0.0001 && guard < 4) {
        const step = Math.min(remaining, maxStep);
        this.update(step * scale, step);
        remaining -= step;
        guard++;
      }
    } else if (this.phase === "menu") {
      this.menuUpdate(dt);
    } else if (this.phase === "paused") {
      this.decayFx(dt * 0.35);
    }
    this.render();
    this.pushStats();
  };

  private menuUpdate(dt: number) {
    this.idleT += dt;
    this.px = this.W / 2 + Math.cos(this.idleT * 0.5) * 3;
    this.py = this.H / 2 + Math.sin(this.idleT * 0.7) * 2;
    this.face = Math.cos(this.idleT * 0.5) >= 0 ? 1 : -1;
    this.updateParticles(dt);
    this.updateTexts(dt);
  }

  /* ----------------------------- update ----------------------------- */

  private update(dt: number, realDt: number) {
    if (this.phase !== "playing" && this.phase !== "dying") return;
    if (dt <= 0) return;

    if (this.phase === "dying") {
      this.deathT += dt;
      this.updateParticles(dt);
      this.updateTexts(dt);
      this.updateFx(dt);
      this.decayFx(realDt);
      if (this.deathT > 1.1) {
        this.phase = "dead";
        this.onGameOver(this.stats());
      }
      return;
    }

    this.elapsed += dt;
    this.idleT += dt;
    this.mineTutorialT = Math.max(0, this.mineTutorialT - dt);
    this.decayFx(realDt);

    if (this.combo > 0) {
      this.comboT -= dt;
      if (this.comboT <= 0) this.combo = 0;
    }

    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateShots(dt);
    this.updatePlayerProjectiles(dt);
    this.updateMines(dt);
    this.updatePickups(dt);
    this.updateSpawns(dt);
    this.updateParticles(dt);
    this.updateTexts(dt);
    this.updateFx(dt);
  }

  private decayFx(dt: number) {
    this.shake = Math.max(0, this.shake - dt * 42);
    this.flash = Math.max(0, this.flash - dt * 4.2);
    this.bannerT = Math.max(0, this.bannerT - dt);
    this.vignettePulse = Math.max(0, this.vignettePulse - dt * 2);
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].life -= dt * 3.2;
      if (this.afterimages[i].life <= 0) this.afterimages.splice(i, 1);
    }
  }

  private updateFx(dt: number) {
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].life -= dt * 6.5;
      if (this.trail[i].life <= 0) this.trail.splice(i, 1);
    }
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      this.impacts[i].life -= dt;
      if (this.impacts[i].life <= 0) this.impacts.splice(i, 1);
    }
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= dt;
      sw.r = sw.maxR * (1 - sw.life / sw.maxLife);
      if (sw.life <= 0) this.shockwaves.splice(i, 1);
    }
    this.glint = Math.max(0, this.glint - dt * 2.2);
  }

  private aimAngle(): number {
    if (this.aimStick) {
      const dx = this.aimStick.x - this.aimStick.ox;
      const dy = this.aimStick.y - this.aimStick.oy;
      if (Math.hypot(dx, dy) > 6) return Math.atan2(dy, dx);
    }
    if (this.mouseActive) return Math.atan2(this.mouseY - this.py, this.mouseX - this.px);
    const near = this.nearestEnemy(240);
    if (near) return Math.atan2(near.y - this.py, near.x - this.px);
    return this.face > 0 ? 0 : Math.PI;
  }

  private nearestEnemy(maxD: number): Enemy | null {
    let best: Enemy | null = null;
    let bd = maxD * maxD;
    for (const e of this.enemies) {
      const d = (e.x - this.px) ** 2 + (e.y - this.py) ** 2;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  }

  /* ----------------------------- player ----------------------------- */

  private updatePlayer(dt: number) {
    const k = this.keys;
    let mx = 0;
    let my = 0;
    if (k.has("a") || k.has("arrowleft")) mx -= 1;
    if (k.has("d") || k.has("arrowright")) mx += 1;
    if (k.has("w") || k.has("arrowup")) my -= 1;
    if (k.has("s") || k.has("arrowdown")) my += 1;
    if (this.moveStick) {
      const dx = this.moveStick.x - this.moveStick.ox;
      const dy = this.moveStick.y - this.moveStick.oy;
      const len = Math.hypot(dx, dy);
      if (len > 4) {
        const n = Math.min(1, len / 26);
        mx += (dx / len) * n;
        my += (dy / len) * n;
      }
    }
    const ml = Math.hypot(mx, my);
    if (ml > 1) {
      mx /= ml;
      my /= ml;
    }

    const SPEED = 108 + this.speedBonus;
    const accel = 1100;
    const friction = 1000;

    if (this.dashT > 0) {
      this.dashT -= dt;
      const t = clamp(this.dashT / 0.17, 0, 1);
      const sp = 300 * this.dashSpeedMult * (0.45 + t * 0.85);
      this.pvx = this.dashDx * sp;
      this.pvy = this.dashDy * sp;
      if (Math.random() < dt * 90) this.afterimages.push({ x: this.px, y: this.py, life: 1 });
      this.parts.push({
        x: this.px + rnd(-4, 4),
        y: this.py + rnd(-2, 8),
        vx: rnd(-14, 14),
        vy: rnd(-14, 14),
        life: 0.3,
        max: 0.3,
        size: 1,
        color: "#ff7364",
        drag: 3,
        kind: 0,
      });
    } else {
      if (ml > 0.01) {
        this.pvx += mx * accel * dt;
        this.pvy += my * accel * dt;
        const sp = Math.hypot(this.pvx, this.pvy);
        const slowing = this.atkT > 0 ? 0.5 : this.currentWeapon === "bow" && this.bowHolding ? 0.72 : 1;
        const maxS = SPEED * slowing;
        if (sp > maxS) {
          this.pvx = (this.pvx / sp) * maxS;
          this.pvy = (this.pvy / sp) * maxS;
        }
        this.walkT += dt * 11;
      } else {
        const sp = Math.hypot(this.pvx, this.pvy);
        const nf = Math.max(0, sp - friction * dt);
        if (sp > 0.001) {
          this.pvx = (this.pvx / sp) * nf;
          this.pvy = (this.pvy / sp) * nf;
        }
        this.walkT = 0;
      }
    }

    this.px += this.pvx * dt;
    this.py += this.pvy * dt;
    const M = 14;
    if (this.px < M) {
      this.px = M;
      this.pvx = 0;
    }
    if (this.px > this.W - M) {
      this.px = this.W - M;
      this.pvx = 0;
    }
    if (this.py < M + 4) {
      this.py = M + 4;
      this.pvy = 0;
    }
    if (this.py > this.H - M) {
      this.py = this.H - M;
      this.pvy = 0;
    }

    this.iframe = Math.max(0, this.iframe - dt);
    this.dashCd = Math.max(0, this.dashCd - dt);
    this.atkCd = Math.max(0, this.atkCd - dt);
    this.atkChainT = Math.max(0, this.atkChainT - dt);
    if (this.atkChainT <= 0) this.atkChain = 0;

    // Dash
    if (this.dashQueued) {
      this.dashQueued = false;
      if (this.dashCd <= 0 && this.dashT <= 0) {
        let dx = mx;
        let dy = my;
        if (Math.hypot(dx, dy) < 0.1) {
          const a = this.aimAngle();
          dx = Math.cos(a);
          dy = Math.sin(a);
        }
        const l = Math.hypot(dx, dy) || 1;
        this.dashDx = dx / l;
        this.dashDy = dy / l;
        this.dashT = 0.17;
        this.dashCd = this.dashMax;
        this.iframe = Math.max(this.iframe, 0.26);
        this.shake = Math.max(this.shake, 3);
        Sfx.dash();
        for (let i = 0; i < 10; i++) {
          this.parts.push({
            x: this.px,
            y: this.py + rnd(-4, 6),
            vx: -this.dashDx * rnd(40, 110) + rnd(-20, 20),
            vy: -this.dashDy * rnd(40, 110) + rnd(-20, 20),
            life: 0.35,
            max: 0.35,
            size: 2,
            color: "#ff6a63",
            drag: 4,
            kind: 0,
          });
        }
      }
    }

    // Strike timeline
    if (this.atkWind > 0) {
      this.atkWind -= dt;
      const back = -1.3;
      this.leanX += (Math.cos(this.atkAngle) * back - this.leanX) * Math.min(1, dt * 26);
      this.leanY += (Math.sin(this.atkAngle) * back * 0.6 - this.leanY) * Math.min(1, dt * 26);
      if (this.atkWind <= 0) {
        this.atkT = this.atkDur;
        this.hitSet.clear();
        this.trail.length = 0;
        this.glint = 1;

        Sfx.swing(this.currentWeapon);
        const p =
          this.currentWeapon === "hammer"
            ? 60
            : this.currentWeapon === "axe"
              ? 74
              : this.currentWeapon === "shield"
                ? 80
                : 88;
        this.pvx += Math.cos(this.atkAngle) * p;
        this.pvy += Math.sin(this.atkAngle) * p;
        this.leanX = Math.cos(this.atkAngle) * 2;
        this.leanY = Math.sin(this.atkAngle) * 1.1;
        this.shake = Math.max(this.shake, 1.2);

        for (let i = 0; i < 6; i++) {
          const a = this.atkAngle + rnd(-1.2, 1.2);
          this.parts.push({
            x: this.px + Math.cos(a) * 16,
            y: this.py + Math.sin(a) * 16,
            vx: Math.cos(a) * rnd(40, 130),
            vy: Math.sin(a) * rnd(40, 130),
            life: 0.25,
            max: 0.25,
            size: 1,
            color: "#ffd0b1",
            drag: 4,
            kind: 0,
          });
        }
      }
    } else if (this.atkT > 0) {
      this.atkT -= dt;
      if (this.currentWeapon !== "bow" && this.currentWeapon !== "mine") {
        this.doSwingHits();
      }
      if (this.atkT <= 0) {
        this.atkRec = this.swingData().rec;
      }
    } else if (this.atkRec > 0) {
      this.atkRec -= dt;
      this.leanX -= this.leanX * Math.min(1, dt * 9);
      this.leanY -= this.leanY * Math.min(1, dt * 9);
    }

    const wantAttack = this.attackHeld || !!this.aimStick;
    if (this.currentWeapon === "shield") this.atkAngle = this.aimAngle();
    if (this.currentWeapon === "bow") {
      // hold to draw the string, release to let the arrow fly
      this.updateBow(wantAttack, dt);
    } else if (this.currentWeapon === "mine") {
      if (wantAttack && !this.mineHeld && this.atkCd <= 0 && this.dashT <= 0) this.placeMine();
      this.mineHeld = wantAttack;
    } else {
      const busy = this.atkWind > 0 || this.atkT > 0 || this.atkCd > 0;
      if (wantAttack && !busy && this.dashT <= 0) this.startAttack();
    }

    if (Math.abs(this.pvx) > 6) this.face = this.pvx > 0 ? 1 : -1;
    else if (this.atkWind > 0 || this.atkT > 0 || this.currentWeapon === "shield") {
      this.face = Math.cos(this.atkAngle) >= 0 ? 1 : -1;
    }
    // while drawing the bow the body tracks the aim
    if (this.currentWeapon === "bow" && (this.bowHolding || this.bowCharge > 0.02)) {
      this.face = Math.cos(this.aimAngle()) >= 0 ? 1 : -1;
    }
  }

  private startAttack() {
    let a = this.aimAngle();
    if (this.currentWeapon === "shield") {
      this.atkAngle = a;
      this.atkWind = 0;
      this.atkDur = 0.22;
      this.atkT = this.atkDur;
      this.atkRec = 0.08;
      this.atkCd = 0.38;
      this.hitSet.clear();
      Sfx.shieldBash();
      return;
    }
    let best: Enemy | null = null;
    let bestScore = Infinity;
    for (const e of this.enemies) {
      const d = Math.hypot(e.x - this.px, e.y - this.py);
      if (d > 70) continue;
      const ang = Math.atan2(e.y - this.py, e.x - this.px);
      const diff = Math.abs(angDiff(ang, a));
      if (diff < 0.85 && d + diff * 30 < bestScore) {
        bestScore = d + diff * 30;
        best = e;
      }
    }
    if (best) a = Math.atan2(best.y - this.py, best.x - this.px);

    this.atkChain = this.atkChainT > 0 ? (this.atkChain % 2) + 1 : 1;
    this.atkChainT = 0.85;
    this.atkAngle = a;
    this.atkDir = this.atkChain === 2 ? -1 : 1;
    const t = this.swingData();
    this.atkWind = t.wind;
    this.atkDur = t.strike;
    this.atkRec = t.rec;
    this.atkCd = t.wind + t.strike + t.rec + t.cd;
    this.atkT = 0;
    this.hitSet.clear();
    this.trail.length = 0;
  }

  private swingData() {
    return WEAPON_CONFIG[this.currentWeapon] ?? WEAPON_CONFIG.katana;
  }

  private atkPhase(): 0 | 1 | 2 {
    if (this.atkWind > 0) return 0;
    if (this.atkT > 0) return 1;
    return 2;
  }

  private phaseProgress(): number {
    const t = this.swingData();
    if (this.atkWind > 0) return 1 - this.atkWind / t.wind;
    if (this.atkWind <= 0 && this.atkT <= 0 && this.atkRec <= 0) return 0;
    if (this.atkT > 0) return 1 - this.atkT / t.strike;
    if (this.atkRec > 0) return 1 - this.atkRec / t.rec;
    return 0;
  }

  private swingAngleNow(): number {
    const t = this.swingData();
    const arc = t.arc;
    const back = arc / 2 + 1.15;
    if (this.atkWind <= 0 && this.atkT <= 0 && this.atkRec <= 0) return this.restAngle();
    if (this.atkWind > 0) {
      const p = clamp(this.phaseProgress(), 0, 1);
      const e = 1 - (1 - p) ** 3;
      return this.atkAngle - this.atkDir * back * e;
    }
    if (this.atkT > 0) {
      const p = clamp(this.phaseProgress(), 0, 1);
      const e = 0.5 - 0.5 * Math.cos(p * Math.PI);
      return this.atkAngle - this.atkDir * (arc / 2) + this.atkDir * arc * e;
    }
    const p = clamp(this.phaseProgress(), 0, 1);
    const e = 1 - (1 - p) ** 2;
    const from = this.atkAngle + this.atkDir * (arc / 2);
    return from + angDiff(this.restAngle(), from) * e;
  }

  private restAngle(): number {
    const base = this.face > 0 ? 0.95 : Math.PI - 0.95;
    return base + Math.sin(this.idleT * 2.1) * 0.08 - this.pvy * 0.0014;
  }

  private bladeLen(): number {
    const t = this.swingData();
    if (this.atkWind > 0) {
      const p = clamp(this.phaseProgress(), 0, 1);
      return 16 + t.range * 0.42 * p;
    }
    if (this.atkT > 0) {
      const p = clamp(this.phaseProgress(), 0, 1);
      return t.range * (0.78 + 0.22 * Math.sin(p * Math.PI));
    }
    if (this.atkRec > 0) {
      const p = clamp(this.phaseProgress(), 0, 1);
      return t.range * (1 - 0.45 * p);
    }
    return 16 + Math.abs(Math.sin(this.idleT * 2.1)) * 1.5;
  }

  /* ------------------- special attack actions ------------------- */

  /** Bow: while held, the string is drawn back; on release the arrow flies
   *  with speed / damage / pierce scaled by how far it was pulled. */
  private updateBow(want: boolean, dt: number) {
    if (this.bowReleasing > 0) {
      this.bowReleasing -= dt;
      if (this.bowReleasing <= 0) {
        this.bowFireCd = 0.16;
      }
      return;
    }
    if (this.bowFireCd > 0) {
      this.bowFireCd = Math.max(0, this.bowFireCd - dt);
      this.bowCharge = Math.max(0, this.bowCharge - dt * 3);
      return;
    }
    if (this.dashT > 0) {
      if (this.bowHolding) {
        this.bowHolding = false;
        this.bowCharge = 0;
      }
      return;
    }
    if (want) {
      const wasFull = this.bowCharge >= 1;
      this.bowHolding = true;
      this.bowCharge = Math.min(1, this.bowCharge + dt / 0.45);
      // creak while pulling; a tick the instant it hits full draw
      this.bowDrawSfxT -= dt;
      if (this.bowCharge < 1 && this.bowDrawSfxT <= 0) {
        this.bowDrawSfxT = 0.12;
        Sfx.bowDraw();
      }
      if (this.bowCharge >= 1 && !wasFull && !this.bowFullSfx) {
        this.bowFullSfx = true;
        Sfx.bowFull();
        this.glint = 1;
      }
    } else if (this.bowHolding) {
      // let go
      this.bowHolding = false;
      this.bowFullSfx = false;
      this.releaseBow();
    } else {
      // string relaxes back to rest
      this.bowCharge = Math.max(0, this.bowCharge - dt * 3.5);
    }
  }

  private releaseBow() {
    const charge = this.bowCharge;
    this.bowCharge = 0;
    const ang = this.aimAngle();
    const sp = 300 + charge * 300;
    const dmg = 2 + Math.round(charge * 4);
    const pierce = 1 + Math.round(charge * 3);
    this.bowReleasing = 0.14;
    this.arrows.push({
      x: this.px + Math.cos(ang) * 12,
      y: this.py + Math.sin(ang) * 12,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      life: 1.8,
      pierce,
      rot: ang,
      dmg,
      hitSet: new Set(),
    });
    Sfx.bowShoot(charge);
    this.glint = 1;
    if (charge >= 0.99) {
      this.shake = Math.max(this.shake, 4);
      this.burst(this.px + Math.cos(ang) * 16, this.py + Math.sin(ang) * 16, 8, "#ffd0a2", 120);
    } else {
      this.burst(this.px + Math.cos(ang) * 16, this.py + Math.sin(ang) * 16, 4, "#ffd0a2", 80);
    }
  }

  private doSwingHits() {
    const t = this.swingData();
    const p = clamp(this.phaseProgress(), 0, 1);
    if (p > 0.9) return;
    const range = this.bladeLen();
    const arcHalf = t.arc / 2 + 0.25;
    const cur = this.swingAngleNow();
    let hitsThisFrame = 0;
    let killedThisFrame = false;

    const snapshot = this.currentWeapon === "shield" ? [] : this.enemies.slice();
    for (const e of snapshot) {
      if (this.hitSet.has(e)) continue;
      const dx = e.x - this.px;
      const dy = e.y - this.py;
      const d = Math.hypot(dx, dy);
      if (d > range + e.r) continue;
      const ang = Math.atan2(dy, dx);
      if (
        Math.abs(angDiff(ang, cur)) > arcHalf * 0.6 &&
        Math.abs(angDiff(ang, this.atkAngle)) > arcHalf
      ) {
        continue;
      }
      this.hitSet.add(e);
      killedThisFrame = this.damageEnemy(e, t.dmg, ang) || killedThisFrame;
      hitsThisFrame++;
    }

    // Shield or weapon parry / reflection of projectiles
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      const dx = s.x - this.px;
      const dy = s.y - this.py;
      const d = Math.hypot(dx, dy);
      if (d > range + 8) continue;
      const ang = Math.atan2(dy, dx);
      if (Math.abs(angDiff(ang, this.atkAngle)) > arcHalf) continue;
      if (this.currentWeapon !== "shield") continue;
      this.shots.splice(i, 1);
      const speed = Math.max(260, Math.hypot(s.vx, s.vy) * 1.5);
      this.arrows.push({
        x: s.x,
        y: s.y,
        vx: Math.cos(this.atkAngle) * speed,
        vy: Math.sin(this.atkAngle) * speed,
        life: 1.4,
        pierce: 1,
        rot: this.atkAngle,
        dmg: 4,
        hitSet: new Set(),
      });
      this.impacts.push({ x: s.x, y: s.y, a: ang, life: 0.22, max: 0.22, heavy: false });
      this.burst(s.x, s.y, 10, "#ffba78", 130);
      this.addScore(15, s.x, s.y, I18N[this.opts.language].parried, "#ffba78");
      this.shake = Math.max(this.shake, 4);
      this.hitstop = Math.max(this.hitstop, 0.045);
      Sfx.parry();
    }

    // Hammer ground slam shockwave
    if (this.currentWeapon === "hammer" && hitsThisFrame > 0 && this.hitSet.size === hitsThisFrame) {
      const hx = this.px + Math.cos(this.atkAngle) * 26;
      const hy = this.py + Math.sin(this.atkAngle) * 26;
      this.triggerHammerSlam(hx, hy);
    }

    if (hitsThisFrame > 0 && !killedThisFrame) {
      const heavy = this.currentWeapon !== "katana";
      this.hitstop = Math.max(this.hitstop, heavy ? 0.06 : 0.035);
      this.shake = Math.max(this.shake, heavy ? 5 : 3);
    }
  }

  private placeMine() {
    const a = this.aimAngle();
    if (this.mines.length >= 6) this.mines.shift();
    this.mines.push({
      x: clamp(this.px + Math.cos(a) * 15, 12, this.W - 12),
      y: clamp(this.py + Math.sin(a) * 15, 12, this.H - 12),
      armT: 0.45,
      life: 24,
    });
    this.atkCd = WEAPON_CONFIG.mine.cd;
    Sfx.swing("mine");
  }

  private updateMines(dt: number) {
    for (let i = this.mines.length - 1; i >= 0; i--) {
      const mine = this.mines[i];
      mine.armT -= dt;
      mine.life -= dt;
      const target = mine.armT <= 0 && this.enemies.find((e) => Math.hypot(e.x - mine.x, e.y - mine.y) < e.r + 14);
      if (!target && mine.life > 0) continue;

      this.mines.splice(i, 1);
      this.shockwaves.push({ x: mine.x, y: mine.y, r: 5, maxR: 58, life: 0.3, maxLife: 0.3 });
      this.burst(mine.x, mine.y, 28, "#ff765d", 230);
      this.shake = Math.max(this.shake, 10);
      Sfx.mineExplode();
      for (const enemy of this.enemies.slice()) {
        const d = Math.hypot(enemy.x - mine.x, enemy.y - mine.y);
        if (d <= 58 + enemy.r) this.damageEnemy(enemy, 6, Math.atan2(enemy.y - mine.y, enemy.x - mine.x));
      }
    }
  }

  private triggerHammerSlam(x: number, y: number) {
    Sfx.hammerSlam();
    this.shake = Math.max(this.shake, 9);
    this.shockwaves.push({
      x,
      y,
      r: 6,
      maxR: 52,
      life: 0.25,
      maxLife: 0.25,
    });
    for (const e of this.enemies) {
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < 52 && !this.hitSet.has(e)) {
        this.hitSet.add(e);
        e.stun = 0.5;
        this.damageEnemy(e, 3, Math.atan2(e.y - y, e.x - x));
      }
    }
  }

  private damageEnemy(e: Enemy, dmg: number, ang: number): boolean {
    const heavy = this.currentWeapon !== "katana";
    e.hp -= dmg;
    e.flash = 0.14;
    e.stun = 0.16;
    const tank = e.type === "brute" || e.type === "oni" || e.type === "shield" || e.type === "boss";
    const kb = this.swingData().kb * (tank ? 0.4 : 1);
    e.vx += Math.cos(ang) * kb;
    e.vy += Math.sin(ang) * kb;
    e.scaleY = 1.35;

    const hx = this.px + Math.cos(ang) * (this.bladeLen() * 0.86);
    const hy = this.py + Math.sin(ang) * (this.bladeLen() * 0.86);
    this.impacts.push({
      x: hx,
      y: hy,
      a: ang,
      life: heavy ? 0.24 : 0.18,
      max: heavy ? 0.24 : 0.18,
      heavy,
    });
    this.slashSpark(hx, hy, ang);

    if (e.hp <= 0) {
      this.killEnemy(e, ang);
      return true;
    } else {
      Sfx.impact(heavy);
      this.burst(e.x, e.y, 6, bloodColor(e.type), 100);
      this.bloodDecal(e.x, e.y + 4, 3, bloodColor(e.type));
      return false;
    }
  }

  private killEnemy(e: Enemy, ang: number) {
    const idx = this.enemies.indexOf(e);
    if (idx >= 0) this.enemies.splice(idx, 1);

    this.combo++;
    this.comboT = 3.2;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.kills++;
    const mult = this.comboMult();
    const gained = Math.round(e.score * mult);
    this.addScore(gained, e.x, e.y - 6, `+${gained}`, mult >= 2 ? "#ffbd86" : "#ffffff");

    const col = bloodColor(e.type);
    this.burst(e.x, e.y, 18, col, 200);
    this.gibs(e.x, e.y, e.type);
    this.bloodDecal(e.x, e.y + 4, e.type === "brute" ? 11 : 7, col);
    this.parts.push({
      x: e.x,
      y: e.y,
      vx: 0,
      vy: 0,
      life: 0.3,
      max: 0.3,
      size: e.type === "brute" ? 26 : 16,
      color: "#ffffff",
      drag: 0,
      kind: 1,
    });

    const big = e.type === "brute" || e.type === "oni" || e.type === "shield" || e.type === "boss";
    this.shake = Math.max(this.shake, big ? 8 : 4.5);
    Sfx.kill(this.combo);

    // Three coins per kill make the first shop visit immediately useful.
    for (let c = 0; c < 3; c++) {
      this.pickups.push({
        x: e.x + rnd(-4, 4),
        y: e.y + rnd(-4, 4),
        vx: rnd(-50, 50),
        vy: rnd(-60, -15),
        t: 0,
        kind: "coin",
        magnet: false,
      });
    }

    // Occasional health heart drop
    const r = Math.random();
    if (this.hp < this.maxHp && r < 0.08) {
      this.pickups.push({
        x: e.x,
        y: e.y,
        vx: rnd(-30, 30),
        vy: rnd(-40, -10),
        t: 0,
        kind: "heart",
        magnet: false,
      });
    }

    let inSwing = 0;
    this.hitSet.forEach((h) => {
      if (h.hp <= 0) inSwing++;
    });
    if (inSwing >= 3) {
      this.shake = Math.max(this.shake, 9);
      const t = I18N[this.opts.language];
      this.banner = inSwing >= 5 ? t.massacre : t.tripleKill;
      this.bannerT = 1.1;
      Sfx.crit(inSwing);
    } else if (this.combo > 0 && this.combo % 10 === 0) {
      this.banner = `COMBO ${this.combo}!`;
      this.bannerT = 1.0;
      Sfx.crit(3);
    }
    if (e.type === "boss") {
      this.banner = I18N[this.opts.language].shogunDefeated;
      this.bannerT = 2.2;
      this.shake = 16;
    }
    void ang;
  }

  comboMult() {
    return Math.min(1 + this.combo * 0.12, 6);
  }

  private addScore(n: number, x: number, y: number, label: string, color: string) {
    this.score += n;
    this.texts.push({
      x,
      y,
      vy: -34,
      life: 0.75,
      max: 0.75,
      text: label,
      color,
      size: label.length > 6 ? 6 : 8,
    });
  }

  /* ----------------------------- enemies ----------------------------- */

  private enemyStats(type: EnemyType) {
    const w = this.wave;
    const hpB = Math.floor(w / 3);
    const spB = w * 0.9;
    switch (type) {
      case "grunt":
        return { hp: 2 + hpB, r: 6, speed: 52 + spB, score: 10, dmg: 1 };
      case "bat":
        return { hp: 1 + Math.floor(hpB / 2), r: 6, speed: 70 + spB, score: 15, dmg: 1 };
      case "spitter":
        return { hp: 3 + hpB, r: 6, speed: 40 + spB * 0.4, score: 20, dmg: 1 };
      case "brute":
        return { hp: 9 + hpB * 2, r: 10, speed: 36 + spB * 0.5, score: 45, dmg: 2 };
      case "ninja":
        return { hp: 3 + hpB, r: 6, speed: 96 + spB, score: 28, dmg: 2 };
      case "hound":
        return { hp: 3 + hpB, r: 7, speed: 88 + spB, score: 25, dmg: 1 };
      case "wisp":
        return { hp: 3 + Math.floor(hpB * 0.7), r: 6, speed: 60 + spB * 0.5, score: 30, dmg: 1 };
      case "archer":
        return { hp: 4 + hpB, r: 7, speed: 40 + spB * 0.4, score: 34, dmg: 2 };
      case "oni":
        return { hp: 11 + hpB * 2, r: 9, speed: 44 + spB * 0.5, score: 55, dmg: 2 };
      case "shield":
        return { hp: 13 + hpB * 2, r: 9, speed: 38 + spB * 0.4, score: 60, dmg: 2 };
      case "slime":
        return { hp: 5 + hpB, r: 8, speed: 42 + spB * 0.5, score: 32, dmg: 1 };
      case "monk":
        return { hp: 6 + hpB, r: 7, speed: 52 + spB * 0.6, score: 42, dmg: 2 };
      case "demon":
        return { hp: 12 + hpB * 2, r: 9, speed: 60 + spB * 0.7, score: 70, dmg: 2 };
      case "skeleton":
        return { hp: 6 + hpB, r: 7, speed: 58 + spB * 0.6, score: 38, dmg: 2 };
      case "boss":
        return { hp: 55 + w * 6, r: 18, speed: 34 + w * 0.6, score: 1500, dmg: 3 };
    }
  }

  private spawnEnemy(type: EnemyType, x: number, y: number) {
    const s = this.enemyStats(type);
    this.enemies.push({
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      hp: s.hp,
      maxHp: s.hp,
      r: s.r,
      speed: s.speed,
      flash: 0,
      stun: 0,
      t: Math.random() * 10,
      cd: rnd(0.6, 2),
      state: 0,
      touchCd: 0,
      face: 1,
      spawnT: 0.28,
      score: s.score,
      dmg: s.dmg,
      scaleY: 1,
    });
    this.burst(x, y, 10, "#d83b4a", 110);
    Sfx.spawn();
  }

  private randomEdge() {
    const m = 20;
    const side = (Math.random() * 4) | 0;
    if (side === 0) return { x: rnd(m, this.W - m), y: m };
    if (side === 1) return { x: rnd(m, this.W - m), y: this.H - m };
    if (side === 2) return { x: m, y: rnd(m, this.H - m) };
    return { x: this.W - m, y: rnd(m, this.H - m) };
  }

  private chooseType(): EnemyType {
    const table: EnemyType[] = [];
    const add = (ty: EnemyType, n: number) => {
      for (let i = 0; i < n; i++) table.push(ty);
    };
    const w = this.wave;
    add("grunt", 38);
    if (w >= 2) add("bat", 16);
    if (w >= 3) add("spitter", 12);
    if (w >= 4) add("brute", 10);
    if (w >= 5) add("hound", 12);
    if (w >= 6) add("ninja", 12);
    if (w >= 7) add("slime", 10);
    if (w >= 8) add("wisp", 10);
    if (w >= 9) add("archer", 11);
    if (w >= 11) add("skeleton", 12);
    if (w >= 13) add("shield", 9);
    if (w >= 15) add("monk", 10);
    if (w >= 17) add("oni", 8);
    if (w >= 20) add("demon", 8);
    return pick(table) ?? "grunt";
  }

  /** How many mobs a wave contains in total. */
  private waveQuota(w: number): number {
    return Math.min(8 + (w - 1) * 3 + Math.floor((w - 1) * (w - 1) * 0.18), 72);
  }

  /** Arms the current wave: sets the quota and drops the first ring of marks. */
  private beginWave() {
    this.waveTotal = this.waveQuota(this.wave);
    this.waveLeft = this.waveTotal;
    this.waveSpawned = 0;
    this.spawnTimer = 0.4;
    this.banner = `${I18N[this.opts.language].wave} ${this.wave}`;
    this.bannerT = 1.6;
    Sfx.wave();

    // opening ring
    const ring = Math.min(6 + this.wave, 16, this.waveTotal);
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * TAU + Math.random() * 0.3;
      const rx = clamp(this.W / 2 + Math.cos(a) * (this.W / 2 - 26), 20, this.W - 20);
      const ry = clamp(this.H / 2 + Math.sin(a) * (this.H / 2 - 26), 20, this.H - 20);
      this.queueMark(rx, ry, 0.55 + i * 0.045, this.chooseType());
    }
    if (this.wave % 3 === 0) {
      const extra = this.wave >= 12 ? 2 : 1;
      for (let k = 0; k < extra; k++) {
        const p = this.randomEdge();
        this.queueMark(p.x, p.y, 1.0, "brute");
      }
    }
    if (this.wave % 10 === 0) {
      const p = this.randomEdge();
      this.queueMark(p.x, p.y, 1.3, "boss");
      this.banner = I18N[this.opts.language].shogunArrived;
      this.bannerT = 2;
      Sfx.boss();
    }
    this.pushStats(true);
  }

  /** Adds a spawn telegraph and consumes one unit of the wave quota. */
  private queueMark(x: number, y: number, t: number, type: EnemyType) {
    if (this.waveSpawned >= this.waveTotal) return;
    this.waveSpawned++;
    this.marks.push({ x, y, t, max: t, type });
  }

  private updateSpawns(dt: number) {
    for (let i = this.marks.length - 1; i >= 0; i--) {
      const m = this.marks[i];
      m.t -= dt;
      if (m.t <= 0) {
        this.marks.splice(i, 1);
        this.spawnEnemy(m.type, m.x, m.y);
      }
    }

    // trickle the remaining quota in while the arena isn't over capacity
    const cap = Math.min(18 + this.wave * 3, 60);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.waveSpawned < this.waveTotal && this.enemies.length + this.marks.length < cap) {
      const base = clamp(0.8 - this.wave * 0.03, 0.14, 0.8);
      this.spawnTimer = base * rnd(0.7, 1.2);
      const batch = 1 + (this.wave >= 6 ? 1 : 0) + (this.wave >= 14 ? 1 : 0);
      for (let b = 0; b < batch; b++) {
        const p = this.randomEdge();
        this.queueMark(p.x, p.y, 0.5, this.chooseType());
      }
    }

    // Last few stragglers: pull ranged enemies toward the player so the wave
    // can't stall with an archer kiting in a corner.
    if (this.waveSpawned >= this.waveTotal && this.marks.length === 0 && this.enemies.length <= 3) {
      for (const e of this.enemies) {
        if (e.type === "spitter" || e.type === "archer" || e.type === "wisp" || e.type === "monk") {
          const dx = this.px - e.x;
          const dy = this.py - e.y;
          const d = Math.hypot(dx, dy) || 1;
          e.vx += (dx / d) * e.speed * 2.5 * dt;
          e.vy += (dy / d) * e.speed * 2.5 * dt;
        }
      }
    }

    // wave cleared: everything spawned, nothing pending, nothing alive
    if (
      this.waveSpawned >= this.waveTotal &&
      this.marks.length === 0 &&
      this.enemies.length === 0 &&
      this.waveClearT < 0
    ) {
      this.waveClearT = 1.25; // small breather before the shop
      this.banner = I18N[this.opts.language].waveCleared;
      this.bannerT = 1.4;
      Sfx.crit(4);
      // vacuum coins so nothing gets lost
      for (const p of this.pickups) p.magnet = true;
    }
    if (this.waveClearT >= 0) {
      this.waveClearT -= dt;
      if (this.waveClearT < 0) {
        this.waveClearT = -1;
        this.phase = "upgrade";
        this.onUpgrade({ wave: this.wave });
      }
    }
  }

  private updateEnemies(dt: number) {
    const arr = this.enemies;
    for (let i = arr.length - 1; i >= 0; i--) {
      const e = arr[i];
      e.t += dt;
      e.flash = Math.max(0, e.flash - dt);
      e.stun = Math.max(0, e.stun - dt);
      e.touchCd = Math.max(0, e.touchCd - dt);
      e.spawnT = Math.max(0, e.spawnT - dt);
      e.scaleY += (1 - e.scaleY) * Math.min(1, dt * 12);

      const dx = this.px - e.x;
      const dy = this.py - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      e.face = dx > 0 ? 1 : -1;

      if (e.stun <= 0 && e.spawnT <= 0) {
        switch (e.type) {
          case "grunt":
          case "skeleton":
          case "slime": {
            const wob = Math.sin(e.t * (e.type === "slime" ? 2.5 : 4) + e.x) * 0.5;
            e.vx += (nx * Math.cos(wob) - ny * Math.sin(wob)) * e.speed * 6 * dt;
            e.vy += (ny * Math.cos(wob) + nx * Math.sin(wob)) * e.speed * 6 * dt;
            break;
          }
          case "bat":
          case "ninja":
          case "hound":
          case "demon": {
            e.cd -= dt;
            if (e.state === 0) {
              e.vx += nx * e.speed * 3 * dt;
              e.vy += ny * e.speed * 3 * dt;
              if (e.cd <= 0 && dist < (e.type === "demon" ? 180 : 150)) {
                e.state = 1;
                e.cd = e.type === "demon" ? 0.55 : 0.35;
              }
            } else if (e.state === 1) {
              e.vx *= 1 - Math.min(1, dt * 8);
              e.vy *= 1 - Math.min(1, dt * 8);
              if (e.cd <= 0) {
                e.state = 2;
                e.cd = e.type === "demon" ? 0.75 : 0.42;
                const dashSpeed = e.type === "demon" ? 340 : e.type === "ninja" ? 320 : 270;
                e.vx = nx * dashSpeed;
                e.vy = ny * dashSpeed;
                this.burst(e.x, e.y, 5, "#ff5361", 70);
              }
            } else if (e.cd <= 0) {
              e.state = 0;
              e.cd = rnd(0.8, 1.7);
            }
            break;
          }
          case "spitter":
          case "archer":
          case "wisp":
          case "monk": {
            e.cd -= dt;
            const wanted = e.type === "wisp" ? 125 : e.type === "archer" ? 145 : 100;
            const err = dist - wanted;
            e.vx += nx * Math.sign(err) * e.speed * 4 * dt;
            e.vy += ny * Math.sign(err) * e.speed * 4 * dt;
            const circle = e.type === "wisp" ? 2.3 : 1.2;
            e.vx += -ny * e.speed * circle * dt;
            e.vy += nx * e.speed * circle * dt;
            if (e.cd <= 0 && dist < 210) {
              e.cd = e.type === "archer" ? rnd(1.2, 1.8) : rnd(1.7, 2.5);
              e.flash = 0.1;
              const sp = e.type === "archer" ? 160 : e.type === "wisp" ? 125 : 108;
              const volley = e.type === "monk" ? 3 : 1;
              for (let v = 0; v < volley; v++) {
                const a = Math.atan2(ny, nx) + (v - (volley - 1) / 2) * 0.24;
                this.shots.push({ x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 4, r: 3 });
              }
              this.burst(e.x + nx * 6, e.y + ny * 6, 4, "#ff764f", 60);
              Sfx.shoot();
            }
            break;
          }
          case "brute":
          case "oni":
          case "shield": {
            e.vx += nx * e.speed * 3 * dt;
            e.vy += ny * e.speed * 3 * dt;
            break;
          }
          case "boss": {
            e.cd -= dt;
            e.vx += nx * e.speed * 4 * dt;
            e.vy += ny * e.speed * 4 * dt;
            if (e.cd <= 0) {
              e.cd = 3.2;
              for (let v = 0; v < 8; v++) {
                const a = (v / 8) * TAU + e.t * 0.25;
                this.shots.push({ x: e.x, y: e.y, vx: Math.cos(a) * 115, vy: Math.sin(a) * 115, life: 4, r: 4 });
              }
              this.shake = Math.max(this.shake, 4);
              this.burst(e.x, e.y, 18, "#ff3c4a", 120);
              Sfx.shoot();
            }
            break;
          }
        }
      }

      // Separation
      for (let j = i - 1; j >= 0; j--) {
        const o = arr[j];
        const ox = e.x - o.x;
        const oy = e.y - o.y;
        const dd = ox * ox + oy * oy;
        const min = e.r + o.r;
        if (dd < min * min && dd > 0.01) {
          const d2 = Math.sqrt(dd);
          const push = ((min - d2) / min) * 140 * dt;
          const ux = ox / d2;
          const uy = oy / d2;
          e.vx += ux * push;
          e.vy += uy * push;
          o.vx -= ux * push;
          o.vy -= uy * push;
        }
      }

      const damp = e.type === "bat" && e.state === 2 ? 1.2 : 6.5;
      e.vx -= e.vx * Math.min(1, damp * dt);
      e.vy -= e.vy * Math.min(1, damp * dt);
      const maxV = e.type === "bat" ? 300 : e.speed * 1.6 + 220;
      const sp = Math.hypot(e.vx, e.vy);
      if (sp > maxV) {
        e.vx = (e.vx / sp) * maxV;
        e.vy = (e.vy / sp) * maxV;
      }
      e.x += e.vx * dt;
      e.y += e.vy * dt;

      const M = 12;
      if (e.x < M) {
        e.x = M;
        e.vx = Math.abs(e.vx) * 0.4;
      }
      if (e.x > this.W - M) {
        e.x = this.W - M;
        e.vx = -Math.abs(e.vx) * 0.4;
      }
      if (e.y < M) {
        e.y = M;
        e.vy = Math.abs(e.vy) * 0.4;
      }
      if (e.y > this.H - M) {
        e.y = this.H - M;
        e.vy = -Math.abs(e.vy) * 0.4;
      }

      if (dist < e.r + 8 && e.touchCd <= 0 && e.spawnT <= 0) {
        e.touchCd = 0.8;
        this.hurtPlayer(e.dmg, nx, ny);
      }
    }
  }

  private updateShots(dt: number) {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (Math.random() < dt * 30) {
        this.parts.push({
          x: s.x,
          y: s.y,
          vx: rnd(-8, 8),
          vy: rnd(-8, 8),
          life: 0.3,
          max: 0.3,
          size: 1,
          color: "#ff8a68",
          drag: 2,
          kind: 0,
        });
      }
      const d = Math.hypot(s.x - this.px, s.y - this.py);
      if (d < 9) {
        this.shots.splice(i, 1);
        this.hurtPlayer(1, (this.px - s.x) / (d || 1), (this.py - s.y) / (d || 1));
        continue;
      }
      if (s.life <= 0 || s.x < 8 || s.y < 8 || s.x > this.W - 8 || s.y > this.H - 8) {
        this.burst(s.x, s.y, 4, "#ff8a68", 60);
        this.shots.splice(i, 1);
      }
    }
  }

  private updatePlayerProjectiles(dt: number) {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.life -= dt;

      if (Math.random() < dt * 45) {
        this.parts.push({
          x: a.x,
          y: a.y,
          vx: rnd(-10, 10),
          vy: rnd(-10, 10),
          life: 0.2,
          max: 0.2,
          size: 1,
          color: "#ffd0a2",
          drag: 3,
          kind: 0,
        });
      }

      // Check hit against enemies
      for (const e of this.enemies) {
        if (a.hitSet.has(e)) continue;
        const d = Math.hypot(e.x - a.x, e.y - a.y);
        if (d < e.r + 6) {
          a.hitSet.add(e);
          a.pierce -= 1;
          this.damageEnemy(e, a.dmg, a.rot);
          this.burst(a.x, a.y, 6, "#ffd0a2", 90);
          if (a.pierce <= 0) break;
        }
      }

      if (a.pierce <= 0 || a.life <= 0 || a.x < 8 || a.y < 8 || a.x > this.W - 8 || a.y > this.H - 8) {
        this.burst(a.x, a.y, 5, "#ffd0a2", 70);
        this.arrows.splice(i, 1);
      }
    }
  }

  private updatePickups(dt: number) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.t += dt;
      const d = Math.hypot(this.px - p.x, this.py - p.y);
      if (d < 52 || p.magnet) {
        p.magnet = true;
        const s = p.kind === "coin" ? 480 : p.kind === "gem" ? 460 : 340;
        p.vx += ((this.px - p.x) / (d || 1)) * s * dt * 3.5;
        p.vy += ((this.py - p.y) / (d || 1)) * s * dt * 3.5;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx -= p.vx * Math.min(1, dt * 3);
      p.vy -= p.vy * Math.min(1, dt * 3);

      if (d < 10) {
        this.pickups.splice(i, 1);
        if (p.kind === "heart") {
          this.hp = Math.min(this.maxHp, this.hp + 1);
          this.addScore(0, p.x, p.y - 8, I18N[this.opts.language].healthPickup, "#ff4d6d");
          this.burst(p.x, p.y, 12, "#ff4d6d", 110);
          this.flash = Math.max(this.flash, 0.12 * this.opts.flash);
          this.flashColor = "255,90,120";
          Sfx.heal();
        } else if (p.kind === "coin") {
          this.coins += 1;
          this.addScore(5, p.x, p.y - 6, "+1", "#ffd747");
          this.burst(p.x, p.y, 6, "#ffd747", 75);
          Sfx.coin();
        } else {
          const v = Math.round(25 * this.comboMult());
          this.addScore(v, p.x, p.y - 8, `+${v}`, "#ffbd86");
          this.burst(p.x, p.y, 8, "#ffbd86", 90);
          Sfx.pickup();
        }
      }
      if (p.t > 14) this.pickups.splice(i, 1);
    }
  }

  private hurtPlayer(dmg: number, nx: number, ny: number) {
    if (this.iframe > 0 || this.dashT > 0 || this.phase !== "playing") return;
    this.hp -= dmg;
    this.iframe = 1.05;
    this.combo = 0;
    this.pvx = nx * 190;
    this.pvy = ny * 190;
    this.shake = Math.max(this.shake, 12);
    this.flash = Math.max(this.flash, 0.35 * this.opts.flash);
    this.flashColor = "255,60,60";
    this.hitstop = Math.max(this.hitstop, 0.09);
    this.vignettePulse = 1;
    this.burst(this.px, this.py, 16, "#ff4d6d", 170);
    Sfx.hurt();
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  private die() {
    this.phase = "dying";
    this.deathT = 0;
    this.shake = 20;
    this.flash = 0.6 * this.opts.flash;
    this.flashColor = "255,255,255";
    Sfx.death();
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * TAU;
      const s = rnd(40, 220);
      this.parts.push({
        x: this.px,
        y: this.py,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rnd(0.5, 1.2),
        max: 1.2,
        size: rnd(1, 3) | 0,
        color: pick(["#f5d3bd", "#e8464a", "#ff7769", "#9e323c"]),
        drag: 1.6,
        kind: 0,
      });
    }
    this.parts.push({
      x: this.px,
      y: this.py,
      vx: 0,
      vy: 0,
      life: 0.6,
      max: 0.6,
      size: 60,
      color: "#ffffff",
      drag: 0,
      kind: 1,
    });
  }

  /* ----------------------------- fx ----------------------------- */

  private burst(x: number, y: number, n: number, color: string, speed: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const s = rnd(speed * 0.25, speed);
      this.parts.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rnd(0.25, 0.6),
        max: 0.6,
        size: Math.random() < 0.3 ? 2 : 1,
        color,
        drag: 3.4,
        kind: 0,
      });
    }
  }

  private gibs(x: number, y: number, type: EnemyType) {
    const col = gibColor(type);
    const n = type === "brute" ? 9 : 5;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const s = rnd(60, 170);
      this.parts.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rnd(0.5, 0.9),
        max: 0.9,
        size: type === "brute" ? 3 : 2,
        color: pick(col),
        drag: 2.2,
        kind: 0,
      });
    }
  }

  private slashSpark(x: number, y: number, ang: number) {
    const heavy = this.currentWeapon !== "katana";
    const n = heavy ? 10 : 6;
    for (let i = 0; i < n; i++) {
      const a = ang + rnd(-0.9, 0.9);
      const s = rnd(90, heavy ? 280 : 210);
      this.parts.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rnd(0.18, 0.3),
        max: 0.3,
        size: 2,
        color: pick(["#ffe1bd", "#ffffff", "#ff8d73"]),
        drag: 4,
        kind: 2,
        rot: a,
      });
    }
  }

  private bloodDecal(x: number, y: number, r: number, color: string) {
    const c = this.dctx;
    c.globalAlpha = 0.6;
    c.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * TAU;
      const d = Math.random() * r;
      const s = Math.max(1, (Math.random() * r * 0.7) | 0);
      c.fillRect(
        Math.round(x + Math.cos(a) * d),
        Math.round(y + Math.sin(a) * d * 0.6),
        s,
        Math.max(1, (s * 0.7) | 0),
      );
    }
    c.globalAlpha = 1;
  }

  private updateParticles(dt: number) {
    const arr = this.parts;
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.life -= dt;
      if (p.life <= 0) {
        arr.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const f = Math.min(1, p.drag * dt);
      p.vx -= p.vx * f;
      p.vy -= p.vy * f;
    }
    const capP = this.opts.quality === "low" ? 220 : 600;
    if (arr.length > capP) arr.splice(0, arr.length - capP);
    if (this.dctx) {
      this.dctx.globalCompositeOperation = "destination-out";
      this.dctx.fillStyle = `rgba(0,0,0,${dt * 0.05})`;
      this.dctx.fillRect(0, 0, this.W, this.H);
      this.dctx.globalCompositeOperation = "source-over";
    }
  }

  private updateTexts(dt: number) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy += 40 * dt;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  /* ----------------------------- render ----------------------------- */

  private render() {
    const ctx = this.ctx;
    const { W, H } = this;
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#080305";
    ctx.fillRect(0, 0, W, H);

    const sh = this.shake * this.opts.shake;
    const ox = sh > 0 ? Math.round(rnd(-sh, sh)) : 0;
    const oy = sh > 0 ? Math.round(rnd(-sh, sh)) : 0;
    ctx.translate(ox, oy);

    ctx.drawImage(this.floor, 0, 0);
    ctx.drawImage(this.decal, 0, 0);

    // Shockwave rings from Hammer slams
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = (sw.life / sw.maxLife) * 0.75;
      ctx.strokeStyle = "#ff9a60";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Spawn telegraph marks
    for (const m of this.marks) {
      const p = 1 - m.t / m.max;
      const r = 3 + p * 11;
      ctx.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(p * 14));
      ctx.strokeStyle = "#dc3c4b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(m.x, m.y, r, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(220,60,75,0.16)";
      ctx.beginPath();
      ctx.arc(m.x, m.y, r * 0.8, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Armed land mines
    for (const mine of this.mines) {
      const armed = mine.armT <= 0;
      const pulse = 0.55 + Math.sin(mine.life * 9) * 0.25;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(Math.round(mine.x - 7), Math.round(mine.y + 3), 14, 3);
      ctx.fillStyle = "#111417";
      ctx.fillRect(Math.round(mine.x - 6), Math.round(mine.y - 3), 12, 7);
      ctx.fillStyle = "#596168";
      ctx.fillRect(Math.round(mine.x - 4), Math.round(mine.y - 2), 8, 5);
      ctx.globalAlpha = armed ? pulse : 0.35;
      ctx.fillStyle = armed ? "#ff4050" : "#ffd44a";
      ctx.fillRect(Math.round(mine.x - 1), Math.round(mine.y - 1), 2, 2);
      ctx.globalAlpha = 1;
    }

    // Pickups (Hearts & Coins)
    for (const p of this.pickups) {
      const bob = Math.sin(p.t * 6) * 1.5;
      if (p.kind === "heart") {
        this.blit(SPR.heart, p.x, p.y + bob, 1, 0, 1);
        ctx.globalAlpha = 0.25 + 0.2 * Math.sin(p.t * 8);
        ctx.fillStyle = "#ff4d6d";
        ctx.fillRect(p.x - 5, p.y + bob - 4, 10, 8);
        ctx.globalAlpha = 1;
      } else if (p.kind === "coin") {
        this.blit(SPR.coin, p.x, p.y + bob, 1, 0, 1);
        ctx.globalAlpha = 0.25 + 0.2 * Math.sin(p.t * 10);
        ctx.fillStyle = "#ffd747";
        ctx.fillRect(p.x - 3, p.y + bob - 3, 6, 6);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = "#ff9a76";
        ctx.fillRect(Math.round(p.x - 2), Math.round(p.y + bob - 2), 4, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(p.x - 1), Math.round(p.y + bob - 1), 1, 1);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#ff9a76";
        ctx.fillRect(Math.round(p.x - 4), Math.round(p.y + bob - 4), 8, 8);
        ctx.globalAlpha = 1;
      }
    }

    // Shadows
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (const e of this.enemies) this.shadow(e.x, e.y + e.r + 1, e.r + 2);
    if (this.phase !== "dying" && this.phase !== "dead") {
      this.shadow(this.px + this.leanX * 0.4, this.py + 8, 7);
    }

    // Enemies sorted by Y
    const list = [...this.enemies].sort((a, b) => a.y - b.y);
    for (const e of list) this.drawEnemy(e);

    // Enemy Projectiles
    for (const s of this.shots) {
      ctx.fillStyle = "#ffe1b5";
      ctx.fillRect(Math.round(s.x - 2), Math.round(s.y - 2), 4, 4);
      ctx.fillStyle = "#ff7665";
      ctx.fillRect(Math.round(s.x - 3), Math.round(s.y - 1), 6, 2);
      ctx.fillRect(Math.round(s.x - 1), Math.round(s.y - 3), 2, 6);
    }

    // Player Bow Arrows
    for (const a of this.arrows) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-6, -1, 12, 2);
      ctx.fillStyle = "#d9343f";
      ctx.fillRect(4, -2, 4, 4);
      ctx.fillStyle = "#8a242d";
      ctx.fillRect(-8, -2, 3, 4);
      ctx.restore();
    }

    // Afterimages
    for (const a of this.afterimages) {
      ctx.globalAlpha = a.life * 0.35;
      this.blit(SPR.player, a.x, a.y, this.face, 1, 1);
      ctx.globalAlpha = 1;
    }

    if (this.phase !== "dying" && this.phase !== "dead") this.drawPlayer();

    // Particles
    for (const p of this.parts) {
      const a = clamp(p.life / p.max, 0, 1);
      if (p.kind === 1) {
        ctx.globalAlpha = a * 0.8;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1 + a * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.15 - a), 0, TAU);
        ctx.stroke();
      } else if (p.kind === 2 || p.kind === 3) {
        const l = p.kind === 3 ? 11 : 5;
        ctx.globalAlpha = a;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.kind === 3 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - Math.cos(p.rot ?? 0) * l, p.y - Math.sin(p.rot ?? 0) * l);
        ctx.stroke();
      } else {
        ctx.globalAlpha = a > 0.35 ? 1 : a / 0.35;
        ctx.fillStyle = p.color;
        const s = Math.max(1, Math.round(p.size * (0.5 + a * 0.5)));
        ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
      }
    }
    ctx.globalAlpha = 1;

    // Impact crescents
    for (const im of this.impacts) {
      const p = 1 - im.life / im.max;
      const r = 9 + p * (im.heavy ? 28 : 17);
      const half = 0.55 + p * 0.7;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = (1 - p) * 0.9;
      ctx.strokeStyle = im.heavy ? "#ffe9a8" : "#ffffff";
      ctx.lineWidth = 1 + (1 - p) * 2;
      ctx.beginPath();
      ctx.arc(im.x, im.y, r, im.a - half, im.a + half);
      ctx.stroke();
      ctx.globalAlpha = (1 - p) * 0.35;
      ctx.strokeStyle = im.heavy ? "#ff8b61" : "#ffb190";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(im.x, im.y, r * 0.62, im.a - half * 0.7, im.a + half * 0.7);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // Floating text numbers
    ctx.textAlign = "center";
    for (const t of this.texts) {
      const a = clamp(t.life / t.max, 0, 1);
      ctx.globalAlpha = a;
      ctx.font = `${t.size}px "Press Start 2P", monospace`;
      ctx.fillStyle = "#000000";
      ctx.fillText(t.text, Math.round(t.x) + 1, Math.round(t.y) + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, Math.round(t.x), Math.round(t.y));
    }
    ctx.globalAlpha = 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.drawSticks();
    this.drawBanner();
    this.drawVignette();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(${this.flashColor},${Math.min(0.75, this.flash)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  private shadow(x: number, y: number, r: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.42, 0, 0, TAU);
    ctx.fill();
  }

  private blit(spr: Sprite, x: number, y: number, flip: number, white: number, scaleY = 1) {
    const ctx = this.ctx;
    const img = white ? spr.white : spr.canvas;
    const w = spr.w;
    const h = spr.h;
    if (flip < 0 || scaleY !== 1) {
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y + h / 2));
      ctx.scale(flip < 0 ? -1 : 1, scaleY);
      ctx.drawImage(img, Math.round(-w / 2), -h);
      ctx.restore();
    } else {
      ctx.drawImage(img, Math.round(x - w / 2), Math.round(y - h / 2));
    }
  }

  private drawEnemy(e: Enemy) {
    const ctx = this.ctx;
    const spr = SPR[e.type];
    const bob =
      e.type === "bat" || e.type === "wisp"
        ? Math.sin(e.t * 12) * 2
        : Math.sin(e.t * 9) * 0.8;
    if (e.spawnT > 0) {
      const p = 1 - e.spawnT / 0.28;
      ctx.globalAlpha = p;
      this.blit(spr, e.x, e.y + bob, e.face, 1, 0.4 + p * 0.6);
      ctx.globalAlpha = 1;
      return;
    }
    if ((e.type === "bat" || e.type === "ninja" || e.type === "hound" || e.type === "demon") && e.state === 1) {
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = "#ff5961";
      ctx.beginPath();
      ctx.arc(e.x, e.y, 10 + Math.sin(e.t * 30) * 2, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    this.blit(spr, e.x, e.y + bob, e.face, e.flash > 0 ? 1 : 0, e.scaleY);
    if (e.maxHp > 2 && (e.hp < e.maxHp || e.type === "boss")) {
      const w = e.type === "boss" ? 46 : 14;
      const x = Math.round(e.x - w / 2);
      const y = Math.round(e.y - e.r - 8);
      ctx.fillStyle = "#080507";
      ctx.fillRect(x - 1, y - 1, w + 2, 4);
      ctx.fillStyle = e.type === "boss" ? "#f04a4f" : "#c93442";
      ctx.fillRect(x, y, Math.max(1, Math.round((e.hp / e.maxHp) * w)), 2);
      if (e.type === "boss") {
        ctx.font = `5px "Press Start 2P", monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffe2c4";
        ctx.fillText("SHOGUN", e.x, y - 3);
      }
    }
  }

  /* ----------------------------- player + weapons ----------------------------- */

  private drawPlayer() {
    const ctx = this.ctx;
    const phase = this.atkPhase();
    this.pushTrail();

    // Combo indicator ring
    if (this.combo > 1) {
      const p = clamp(this.comboT / 3.2, 0, 1);
      const m = this.comboMult();
      ctx.strokeStyle = m >= 3 ? "#ff604f" : m >= 2 ? "#ffae72" : "#ff8f79";
      ctx.globalAlpha = 0.45 + 0.2 * Math.sin(performance.now() / 120);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.px, this.py + 2, 14, -Math.PI / 2, -Math.PI / 2 + p * TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Telegraph arc during windup
    if (phase === 0 && this.currentWeapon !== "bow") {
      const t = this.swingData();
      const p = clamp(this.phaseProgress(), 0, 1);
      const back = t.arc / 2 + 1.15;
      ctx.save();
      ctx.globalAlpha = 0.1 + p * 0.22;
      ctx.strokeStyle = this.currentWeapon === "katana" ? "#ffd0b1" : "#ff764f";
      ctx.lineWidth = this.currentWeapon === "katana" ? 1 : 2;
      ctx.beginPath();
      ctx.arc(
        this.px,
        this.py,
        t.range - 2,
        this.atkAngle - this.atkDir * back,
        this.atkAngle - this.atkDir * (t.arc / 2),
        this.atkDir < 0,
      );
      ctx.stroke();
      ctx.restore();
    }

    const blink = this.iframe > 0 && Math.floor(this.iframe * 18) % 2 === 0;
    const bob = this.walkT > 0 ? Math.abs(Math.sin(this.walkT)) * 1.4 : 0;
    const bx = this.px + this.leanX;
    const by = this.py + this.leanY - bob;

    // Katana / Axe / Shield swing ribbon trail
    if (this.trail.length > 1 && this.currentWeapon !== "bow") {
      const n = this.trail.length;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const tr = this.trail[i];
          const rr = tr.r;
          const x = this.px + Math.cos(tr.a) * rr;
          const y = this.py + Math.sin(tr.a) * rr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = n - 1; i >= 0; i--) {
          const tr = this.trail[i];
          const rr = (tr.r - 10) * (0.5 + tr.life * 0.5);
          ctx.lineTo(this.px + Math.cos(tr.a) * rr, this.py + Math.sin(tr.a) * rr);
        }
        ctx.closePath();
        if (pass === 0) {
          ctx.fillStyle =
            this.currentWeapon === "katana"
              ? "rgba(255,120,110,0.32)"
              : "rgba(255,150,90,0.34)";
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(255,255,255,${0.3 + this.glint * 0.25})`;
          ctx.fill();
        }
      }
      const head = this.trail[n - 1];
      const prev = this.trail[Math.max(0, n - 3)];
      ctx.strokeStyle = `rgba(255,255,255,${0.55 + this.glint * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.px + Math.cos(prev.a) * prev.r, this.py + Math.sin(prev.a) * prev.r);
      ctx.lineTo(this.px + Math.cos(head.a) * head.r, this.py + Math.sin(head.a) * head.r);
      ctx.stroke();
      ctx.restore();
    }

    if (!blink) {
      const squash = this.atkT > 0 ? 1.04 : this.dashT > 0 ? 1.12 : 1;
      this.blit(SPR.player, bx, by, this.face, 0, squash);
    }

    if (phase === 1 && this.trail.length > 4 && this.currentWeapon !== "bow") {
      const n = this.trail.length;
      this.drawWeapon(this.trail[n - 4].a, this.bladeLen() * 0.92, 0.22);
      this.drawWeapon(this.trail[Math.max(0, n - 8)].a, this.bladeLen() * 0.84, 0.11);
    }

    // the bow always tracks the aim; melee weapons use the swing timeline
    const weaponAngle = this.currentWeapon === "bow" || this.currentWeapon === "shield" || this.currentWeapon === "mine"
      ? this.aimAngle()
      : this.swingAngleNow();
    this.drawWeapon(weaponAngle, this.bladeLen(), 1);

    // Bow: aim dots + charge bar while the string is being drawn
    if (this.currentWeapon === "bow" && (this.bowHolding || this.bowCharge > 0.02)) {
      const a = this.aimAngle();
      const reach = 70 + this.bowCharge * 90;
      ctx.fillStyle = this.bowCharge >= 1 ? "#ff5361" : "#ffd0a2";
      ctx.globalAlpha = 0.35 + this.bowCharge * 0.45;
      for (let i = 1; i <= 10; i++) {
        const d = (i / 10) * reach;
        ctx.fillRect(Math.round(this.px + Math.cos(a) * d) - 1, Math.round(this.py + Math.sin(a) * d) - 1, 2, 2);
      }
      ctx.globalAlpha = 1;

      // pixel charge bar above the head
      const bw = 20;
      const bx = Math.round(this.px - bw / 2);
      const by = Math.round(this.py - 22);
      ctx.fillStyle = "#070305";
      ctx.fillRect(bx - 1, by - 1, bw + 2, 6);
      ctx.fillStyle = "#2a0e13";
      ctx.fillRect(bx, by, bw, 4);
      const cw = Math.round(bw * this.bowCharge);
      ctx.fillStyle = this.bowCharge >= 1 ? "#ff5361" : "#ffd44a";
      ctx.fillRect(bx, by, cw, 4);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(bx, by, cw, 1);
      if (this.bowCharge >= 1) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bx - 2, by - 2, 2, 2);
        ctx.fillRect(bx + bw, by - 2, 2, 2);
      }
    }

  }

  private drawWeapon(angle: number, len: number, alpha: number) {
    const ctx = this.ctx;
    const L = Math.max(8, Math.round(len));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(Math.round(this.px + this.leanX), Math.round(this.py + this.leanY));
    ctx.rotate(angle);

    drawWeaponArt(ctx, this.currentWeapon, {
      len: L,
      // bow: rest nock (0.18) while idle, pulled back while charging,
      // snapping forward while the release animation plays
      draw01:
        this.currentWeapon === "bow"
          ? this.bowReleasing > 0
            ? this.bowCharge
            : 0.18 + this.bowCharge * 0.82
          : 0,
      glint: this.atkT > 0 ? this.glint : 0,
      glintP: clamp(this.phaseProgress(), 0, 1),
    });

    ctx.restore();
  }

  private pushTrail() {
    if (this.atkT <= 0 || this.currentWeapon === "bow" || this.currentWeapon === "shield" || this.currentWeapon === "mine") return;
    const a = this.swingAngleNow();
    const r = this.bladeLen();
    const last = this.trail[this.trail.length - 1];
    if (last && Math.abs(angDiff(a, last.a)) < 0.02 && Math.abs(r - last.r) < 1) return;
    this.trail.push({ a, r, life: 1 });
    if (this.trail.length > 16) this.trail.shift();
  }

  private drawSticks() {
    const ctx = this.ctx;
    const draw = (s: { ox: number; oy: number; x: number; y: number }, color: string) => {
      const dx = s.x - s.ox;
      const dy = s.y - s.oy;
      const len = Math.hypot(dx, dy);
      const cl = Math.min(len, 24);
      const nx = len > 0.01 ? (dx / len) * cl : 0;
      const ny = len > 0.01 ? (dy / len) * cl : 0;
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.ox, s.oy, 26, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s.ox + nx, s.oy + ny, 9, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    if (this.moveStick) draw(this.moveStick, "#ff7569");
    if (this.aimStick) draw(this.aimStick, "#ffb08a");
  }

  private drawBanner() {
    if (this.bannerT <= 0 || !this.banner) return;
    const ctx = this.ctx;
    const t = this.bannerT;
    const a = clamp(t * 2.2, 0, 1);
    const pop = t > 1.2 ? 1 + (t - 1.2) * 0.9 : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(this.W / 2, this.H * 0.26);
    ctx.scale(pop, pop);
    ctx.textAlign = "center";
    ctx.font = `14px "Press Start 2P", monospace`;
    ctx.fillStyle = "#240508";
    ctx.fillText(this.banner, 2, 2);
    ctx.fillStyle = "#ffcc9b";
    ctx.fillText(this.banner, 0, 0);
    ctx.restore();
  }

  private drawVignette() {
    const ctx = this.ctx;
    const { W, H } = this;
    const lowHp = this.hp <= 2 && this.phase === "playing";
    const intensity = 0.55 + this.vignettePulse * 0.35;
    const g = ctx.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.34,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.72,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(${lowHp ? "60,0,10" : "0,0,0"},${intensity})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (lowHp) {
      const pulse = 0.12 + Math.sin(performance.now() / 180) * 0.07;
      ctx.fillStyle = `rgba(255,0,40,${Math.max(0, pulse)})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.opts.quality === "high") {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    }
  }
}

function bloodColor(t: EnemyType) {
  switch (t) {
    case "grunt":
    case "ninja":
    case "hound":
    case "archer":
    case "oni":
    case "shield":
    case "monk":
    case "demon":
    case "boss":
      return "#e33b4a";
    case "bat":
    case "wisp":
      return "#a82b55";
    case "spitter":
    case "slime":
      return "#b02d48";
    case "skeleton":
      return "#d8b7a4";
    case "brute":
      return "#c73443";
  }
}

function gibColor(t: EnemyType) {
  switch (t) {
    case "grunt":
    case "ninja":
    case "hound":
    case "archer":
    case "oni":
    case "shield":
    case "monk":
    case "demon":
    case "boss":
      return ["#791c2c", "#d83949", "#ff6670"];
    case "bat":
    case "wisp":
      return ["#3d122a", "#822146", "#e2446b"];
    case "spitter":
    case "slime":
      return ["#48162e", "#a82847", "#ed4a62"];
    case "skeleton":
      return ["#80675e", "#d9c0ad", "#f4dfce"];
    case "brute":
      return ["#591523", "#9b2635", "#e5424f"];
  }
}

function prevent(e: Event) {
  e.preventDefault();
}
