import { SPR, buildSprites, type Sprite } from "./sprites";
import { Sfx, unlockAudio, setVolume, type Weapon } from "./audio";
import { drawWeaponArt } from "./weaponArt";
import { I18N, type Language } from "./i18n";
export type { Weapon } from "./audio";

export type Phase = "menu" | "playing" | "paused" | "upgrade" | "dying" | "dead";
export type PowerUp = "speed" | "heart" | "dashCd" | "dashDist";
export type WeaponUpgrade = "damage" | "speed" | "range" | "form";
export type MagicType = "fire" | "ice" | "poison" | "water";
export type Difficulty = "easy" | "medium" | "hard";
export type Perk = "bladeMonk" | "bloodContract" | "bottomlessPocket" | "predatorInstinct" | "sharpGlass" | "kyuEcho" | "cursedArsenal" | "lastBullet";
export type WeaponLevels = Record<Weapon, Record<WeaponUpgrade, number>>;

export const DIFFICULTY_RULES = {
  easy: {
    limits: { maxHp: 60, speed: 400, dashMax: 1, dashSpeedMult: 6 },
    damageTaken: 0.5,
    coinMultiplier: 2,
  },
  medium: {
    limits: { maxHp: 30, speed: 200, dashMax: 2, dashSpeedMult: 3 },
    damageTaken: 1,
    coinMultiplier: 1,
  },
  hard: {
    limits: { maxHp: 15, speed: 154, dashMax: 4, dashSpeedMult: 1.5 },
    damageTaken: 2,
    coinMultiplier: 1,
  },
} as const;

export const STAT_LIMITS = DIFFICULTY_RULES.medium.limits;

export function isPowerUpAtLimit(
  stats: Pick<HudStats, "maxHp" | "speedBonus" | "dashMax" | "dashSpeedMult">,
  power: PowerUp,
  difficulty: Difficulty = "medium",
): boolean {
  const limits = DIFFICULTY_RULES[difficulty].limits;
  if (power === "speed") return 108 + stats.speedBonus >= limits.speed;
  if (power === "heart") return stats.maxHp >= limits.maxHp;
  if (power === "dashCd") return stats.dashMax <= limits.dashMax;
  return stats.dashSpeedMult >= limits.dashSpeedMult;
}

export interface UpgradeOffer {
  wave: number;
}

export interface SavedRun {
  version: 2;
  savedAt: number;
  atShop: boolean;
  stats: HudStats;
}

export interface HudStats {
  hp: number;
  maxHp: number;
  score: number;
  coins: number;
  wave: number;
  combo: number;
  comboP: number;
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
  potionTutorial: boolean;
  activePotion: PotionType | null;
  activePotions: Array<{ type: Exclude<PotionType, "health">; time: number }>;
  potionTime: number;
  weaponLevels: WeaponLevels;
  magicType: MagicType;
  difficulty: Difficulty;
  perk: Perk | null;
}

export interface GameOpts {
  shake: number;
  flash: number;
  volume: number;
  quality: "high" | "low";
  vsync: boolean;
  language: Language;
  keyboardOnly: boolean;
  keyboardBindings: KeyboardBindings;
  inputMode: InputMode;
}

export type KeyboardAction = "up" | "down" | "left" | "right" | "attack" | "dash" | "prev" | "next" | "pause";
export type KeyboardBindings = Record<KeyboardAction, string>;
export type InputMode = "keyboard" | "keyboardMouse" | "gamepad" | "touch";

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
  | "crawler"
  | "bomber"
  | "bombMinion"
  | "ram"
  | "warlock"
  | "golem"
  | "boss";

interface Summon {
  x: number; y: number; vx: number; vy: number; r: number; life: number; maxLife: number;
  kind: "summoned" | "revived"; type: EnemyType; attackCd: number; flash: number;
}

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
  noDrop?: boolean;
  scaleY: number;
  baseSpeed: number;
  fireT: number;
  fireTick: number;
  poisonT: number;
  poisonTick: number;
  freezeT: number;
  freezeImmune: number;
  slowT: number;
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
  dmg: number;
  color?: string;
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
  color?: string;
}

interface PsychicZone {
  x: number;
  y: number;
  r: number;
  life: number;
  maxLife: number;
  type: MagicType;
}

export type PotionType = "health" | "strength" | "speed" | "agility";

interface ArenaProp {
  x: number; y: number; kind: "tree" | "crate"; life: number; t: number;
}

interface Pickup {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  kind: "heart" | "gem" | "coin" | PotionType;
  magnet: boolean;
  credited?: boolean;
  potion?: PotionType;
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
  hammer: { wind: 0.16, strike: 0.2, rec: 0.22, cd: 0.28, arc: 2.2, range: 36, dmg: 6, kb: 360 },
  shield: { wind: 0.06, strike: 0.12, rec: 0.14, cd: 0.16, arc: 1.85, range: 28, dmg: 0, kb: 0 },
  mine: { wind: 0, strike: 0, rec: 0, cd: 0.45, arc: 0, range: 12, dmg: 6, kb: 0 },
  book: { wind: 0, strike: 0, rec: 0, cd: 0.5, arc: 1.7, range: 78, dmg: 2, kb: 180 },
  staff: { wind: 0.12, strike: 0.12, rec: 0.18, cd: 0.55, arc: 1.2, range: 42, dmg: 2, kb: 110 },
};

const createWeaponLevels = (): WeaponLevels => ({
  katana: { damage: 0, speed: 0, range: 0, form: 0 },
  bow: { damage: 0, speed: 0, range: 0, form: 0 },
  hammer: { damage: 0, speed: 0, range: 0, form: 0 },
  shield: { damage: 0, speed: 0, range: 0, form: 0 },
  mine: { damage: 0, speed: 0, range: 0, form: 0 },
  book: { damage: 0, speed: 0, range: 0, form: 0 },
  staff: { damage: 0, speed: 0, range: 0, form: 0 },
});

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  W = 480;
  H = 270;
  worldW = 720;
  worldH = 405;
  cameraX = 120;
  cameraY = 67;
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
  dashSpeedMult = 1.25;
  dashDx = 0;
  dashDy = 0;
  speedBonus = 0;
  difficulty: Difficulty = "medium";
  perk: Perk | null = null;
  perkBuffT = 0;
  perkEchoT = 0;

  // Weapons in slots (up to 4)
  weapons: Weapon[] = ["katana"];
  activeSlot = 0;
  weaponLevels = createWeaponLevels();
  magicType: MagicType = "fire";
  magicCd = 0;

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
  dashHitSet = new Set<Enemy>();
  dashSlashes: { x: number; y: number; a: number; life: number; max: number }[] = [];
  enemyDashFx: { x: number; y: number; a: number; life: number; max: number; color: string }[] = [];
  shockwaves: Shockwave[] = [];
  psychicZones: PsychicZone[] = [];
  mines: LandMine[] = [];

  // World entities
  enemies: Enemy[] = [];
  summons: Summon[] = [];
  parts: Particle[] = [];
  texts: FloatText[] = [];
  shots: Projectile[] = [];
  pickups: Pickup[] = [];
  props: ArenaProp[] = [];
  propTimer = 7;
  potionTutorialT = 0;
  potionTutorialSeen = false;
  potionTutorialEnabled = true;
  potionDisplayT = 0;
  lastPotion: PotionType | null = null;
  strengthT = 0;
  speedT = 0;
  agilityT = 0;
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
  opts: GameOpts = { shake: 1, flash: 1, volume: 0.45, quality: "high", vsync: true, language: "pt", keyboardOnly: false, keyboardBindings: { up: "w", down: "s", left: "a", right: "d", attack: " ", dash: "shift", prev: "q", next: "e", pause: "escape" }, inputMode: "keyboardMouse" };

  // Input
  keys = new Set<string>();
  mouseX = 0;
  mouseY = 0;
  mouseActive = false;
  keyboardAimAngle = 0;
  attackHeld = false;
  keyboardAttackHeld = false;
  pointerAttackHeld = false;
  dashQueued = false;
  moveStick: { id: number; ox: number; oy: number; x: number; y: number } | null = null;
  aimStick: { id: number; ox: number; oy: number; x: number; y: number } | null = null;
  gamepadButtons: boolean[] = [];

  onStats: (s: HudStats) => void = () => {};
  onGameOver: (s: HudStats) => void = () => {};
  onUpgrade: (offer: UpgradeOffer) => void = () => {};
  onPause: () => void = () => {};

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

  setPerk(perk: Perk | null) {
    this.perk = perk;
    this.pushStats(true);
  }
  saveRun(atShop = false): SavedRun {
    return { version: 2, savedAt: Date.now(), atShop, stats: this.stats() };
  }

  restoreRun(saved: SavedRun): boolean {
    if (saved.version !== 2 || !saved.stats || saved.stats.hp <= 0) return false;
    const s = saved.stats;
    this.difficulty = s.difficulty;
    this.perk = s.perk;
    this.hp = s.hp;
    this.maxHp = s.maxHp;
    this.score = s.score;
    this.coins = s.coins;
    this.wave = s.wave;
    this.kills = s.kills;
    this.elapsed = s.time;
    this.speedBonus = s.speedBonus;
    this.dashMax = s.dashMax;
    this.dashSpeedMult = s.dashSpeedMult;
    this.weapons = [...s.weapons];
    this.activeSlot = Math.min(s.activeSlot, this.weapons.length - 1);
    this.weaponLevels = JSON.parse(JSON.stringify(s.weaponLevels)) as WeaponLevels;
    this.magicType = s.magicType;
    this.resetTransientState();
    this.enforceStatLimits();
    if (saved.atShop) {
      this.phase = "upgrade";
      this.waveTotal = 0;
      this.waveSpawned = 0;
      this.waveLeft = 0;
      this.pushStats(true);
    } else {
      this.phase = "playing";
      this.beginWave();
    }
    return true;
  }

  private resetTransientState() {
    this.enemies.length = 0;
    this.summons.length = 0;
    this.parts.length = 0;
    this.texts.length = 0;
    this.shots.length = 0;
    this.arrows.length = 0;
    this.enemyDashFx.length = 0;
    this.marks.length = 0;
    this.pickups.length = 0;
    this.mines.length = 0;
    this.psychicZones.length = 0;
    this.dashSlashes.length = 0;
    this.dashHitSet.clear();
    this.waveClearT = -1;
    this.dashT = 0;
    this.dashCd = 0;
    this.cameraX = clamp(this.px - this.W / 2, 0, Math.max(0, this.worldW - this.W));
    this.cameraY = clamp(this.py - this.H / 2, 0, Math.max(0, this.worldH - this.H));
  }

  setDifficulty(difficulty: Difficulty) {
    this.difficulty = difficulty;
    this.enforceStatLimits();
    this.pushStats(true);
  }

  setOpts(o: Partial<GameOpts>) {
    Object.assign(this.opts, o);
    if (this.opts.keyboardOnly) {
      this.mouseActive = false;
      this.attackHeld = false;
      this.aimStick = null;
    }
    setVolume(this.opts.volume);
  }

  setKeyboardBindings(bindings: KeyboardBindings) {
    this.opts.keyboardBindings = { ...this.opts.keyboardBindings, ...bindings };
  }

  setPotionTutorialHidden(hidden: boolean) {
    this.potionTutorialEnabled = !hidden;
    this.potionTutorialSeen = hidden;
  }

  resize(cw: number, ch: number) {
    const AREA = 480 * 270;
    const aspect = clamp(cw / Math.max(1, ch), 0.58, 2.2);
    let h = Math.round(Math.sqrt(AREA / aspect));
    let w = Math.round(h * aspect);
    w = Math.max(220, Math.min(760, w - (w % 2)));
    h = Math.max(220, Math.min(620, h - (h % 2)));
    this.W = w;
    this.H = h;
    this.worldW = Math.round(w * 1.5);
    this.worldH = Math.round(h * 1.5);
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = false;
    this.px = clamp(this.px, 16, this.worldW - 16);
    this.py = clamp(this.py, 16, this.worldH - 16);
    this.cameraX = clamp(this.px - w / 2, 0, Math.max(0, this.worldW - w));
    this.cameraY = clamp(this.py - h / 2, 0, Math.max(0, this.worldH - h));
    this.buildFloor();
  }

  private buildFloor() {
    const W = this.worldW;
    const H = this.worldH;
    const f = document.createElement("canvas");
    f.width = W;
    f.height = H;
    const c = f.getContext("2d")!;
    c.fillStyle = "#1b0a11";
    c.fillRect(0, 0, W, H);
    const T = 24;
    for (let y = 0; y < H; y += T) {
      for (let x = 0; x < W; x += T) {
        const odd = ((x / T + y / T) | 0) % 2 === 0;
        c.fillStyle = odd ? "#35121e" : "#270d17";
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
        // Small cracks and petals keep the arena from reading as a flat grid.
        if (Math.random() < 0.13) {
          const cx = x + 5 + ((Math.random() * (T - 10)) | 0);
          const cy = y + 5 + ((Math.random() * (T - 10)) | 0);
          c.fillStyle = "rgba(8,3,7,0.46)";
          c.fillRect(cx, cy, 5, 1);
          c.fillRect(cx + 3, cy + 1, 1, 3);
          c.fillStyle = "rgba(255,116,112,0.24)";
          c.fillRect(cx - 1, cy - 2, 2, 1);
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
    // Four low-profile shrine lanterns add life near the edges without covering play space.
    const lanterns = [
      { x: 28, y: 28 }, { x: W - 28, y: 28 },
      { x: 28, y: H - 28 }, { x: W - 28, y: H - 28 },
    ];
    for (const lantern of lanterns) {
      c.fillStyle = "rgba(8,3,7,0.7)";
      c.fillRect(lantern.x - 7, lantern.y + 7, 14, 2);
      c.fillStyle = "#4d2330";
      c.fillRect(lantern.x - 4, lantern.y - 6, 8, 12);
      c.fillStyle = "#9d3a45";
      c.fillRect(lantern.x - 3, lantern.y - 5, 6, 8);
      c.fillStyle = "#ffd26a";
      c.fillRect(lantern.x - 1, lantern.y - 3, 3, 4);
      c.fillStyle = "rgba(255,190,93,0.18)";
      c.fillRect(lantern.x - 8, lantern.y - 10, 16, 16);
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
    // Stepped corner brackets make the playable boundary legible during dashes.
    c.strokeStyle = "rgba(255, 212, 74, 0.42)";
    c.lineWidth = 2;
    const bracket = 18;
    for (const [x, y, sx, sy] of [[B + 4, B + 4, 1, 1], [W - B - 4, B + 4, -1, 1], [B + 4, H - B - 4, 1, -1], [W - B - 4, H - B - 4, -1, -1]] as const) {
      c.beginPath();
      c.moveTo(x, y + sy * bracket);
      c.lineTo(x, y);
      c.lineTo(x + sx * bracket, y);
      c.stroke();
    }
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
    this.keyboardAttackHeld = false;
    this.pointerAttackHeld = false;
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

    const bindings = this.opts.keyboardBindings;
    if (k === bindings.attack) {
      this.keyboardAttackHeld = true;
      this.attackHeld = true;
    }
    if (k === bindings.dash) this.dashQueued = true;

    // Fast slot hotkeys 1, 2, 3, 4
    if (k === "1") this.switchSlot(0);
    if (k === "2") this.switchSlot(1);
    if (k === "3") this.switchSlot(2);
    if (k === "4") this.switchSlot(3);
    if (k === bindings.prev) this.prevWeapon();
    if (k === bindings.next) this.nextWeapon();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    this.keys.delete(k);
    if (k === this.opts.keyboardBindings.attack) this.keyboardAttackHeld = false;
    this.attackHeld = this.keyboardAttackHeld || this.pointerAttackHeld;
  };

  private toCanvas(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * this.W + this.cameraX,
      y: ((e.clientY - r.top) / r.height) * this.H + this.cameraY,
    };
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.opts.inputMode === "keyboard" || this.opts.inputMode === "gamepad") return;
    unlockAudio();
    if (this.phase !== "playing") return;
    const p = this.toCanvas(e);
    this.canvas.setPointerCapture?.(e.pointerId);
    if (e.pointerType === "mouse") {
      this.mouseX = p.x;
      this.mouseY = p.y;
      this.mouseActive = true;
      if (e.button === 2) this.dashQueued = true;
      else {
        this.pointerAttackHeld = true;
        this.attackHeld = true;
      }
      return;
    }
    if (p.x - this.cameraX < this.W * 0.45) {
      if (!this.moveStick) this.moveStick = { id: e.pointerId, ox: p.x, oy: p.y, x: p.x, y: p.y };
    } else {
      if (!this.aimStick) this.aimStick = { id: e.pointerId, ox: p.x, oy: p.y, x: p.x, y: p.y };
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.opts.inputMode === "keyboard" || this.opts.inputMode === "gamepad") return;
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
    if (this.opts.inputMode === "keyboard" || this.opts.inputMode === "gamepad") return;
    if (e.pointerType === "mouse") {
      this.pointerAttackHeld = false;
      this.attackHeld = this.keyboardAttackHeld;
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
    if (this.perk === "bladeMonk") return;
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

  reorderWeapons(fromIndex: number, toIndex: number): boolean {
    if (this.perk === "bladeMonk" || fromIndex === toIndex) return false;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= this.weapons.length || toIndex >= this.weapons.length) return false;
    const [weapon] = this.weapons.splice(fromIndex, 1);
    this.weapons.splice(toIndex, 0, weapon);
    if (this.activeSlot === fromIndex) this.activeSlot = toIndex;
    else if (fromIndex < this.activeSlot && toIndex >= this.activeSlot) this.activeSlot--;
    else if (fromIndex > this.activeSlot && toIndex <= this.activeSlot) this.activeSlot++;
    this.pushStats(true);
    return true;
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
    const maxWeapons = this.perk === "bladeMonk" ? 1 : this.perk === "bottomlessPocket" ? 6 : 4;
    if (this.weapons.length >= maxWeapons) return false;
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

  buyWeaponUpgrade(weapon: Weapon, upgrade: WeaponUpgrade, cost: number): boolean {
    if (!this.weapons.includes(weapon) || this.coins < cost) return false;
    const max = upgrade === "form" ? 1 : 3;
    if (this.weaponLevels[weapon][upgrade] >= max) return false;
    if (upgrade === "form" && weapon !== "katana" && weapon !== "bow" && weapon !== "hammer" && weapon !== "book" && weapon !== "staff") return false;
    this.coins -= cost;
    this.weaponLevels[weapon][upgrade]++;
    Sfx.buy();
    this.pushStats(true);
    return true;
  }

  setMagicType(type: MagicType) {
    this.magicType = type;
    Sfx.equip();
    this.pushStats(true);
  }

  buyPowerUp(power: PowerUp, cost: number): boolean {
    if (this.coins < cost) return false;
    const atLimit = power === "dashDist" && this.perk === "bladeMonk"
      ? this.dashSpeedMult >= this.limits().dashSpeedMult
      : isPowerUpAtLimit(this, power, this.difficulty);
    if (atLimit) return false;
    this.coins -= cost;
    if (power === "speed") {
      this.speedBonus = Math.min(this.limits().speed - 108, this.speedBonus + 18);
      this.addScore(40, this.px, this.py - 16, I18N[this.opts.language].speedBoost, "#ffae57");
    } else if (power === "heart") {
      this.maxHp = Math.min(this.limits().maxHp, this.maxHp + 1);
      this.hp = Math.min(this.maxHp, this.hp + 2);
      this.addScore(40, this.px, this.py - 16, I18N[this.opts.language].healthBoost, "#ff4f58");
    } else if (power === "dashCd") {
      this.dashMax = Math.max(this.limits().dashMax, this.dashMax - 0.8);
      this.dashCd = 0;
      this.addScore(40, this.px, this.py - 16, I18N[this.opts.language].dashCooldownBoost, "#f8d7a5");
    } else if (power === "dashDist") {
      this.dashSpeedMult = Math.min(this.limits().dashSpeedMult, this.dashSpeedMult + 0.25);
      this.addScore(40, this.px, this.py - 16, I18N[this.opts.language].dashDistanceBoost, "#f8d7a5");
    }

    const limits = this.limits();
    this.maxHp = Math.min(this.maxHp, limits.maxHp);
    this.speedBonus = Math.min(this.speedBonus, limits.speed - 108);
    this.dashMax = Math.max(this.dashMax, limits.dashMax);
    this.dashSpeedMult = Math.min(this.dashSpeedMult, limits.dashSpeedMult);

    Sfx.buy();
    this.pushStats(true);
    return true;
  }

  closeShop() {
    this.wave++;
    if ((this.wave - 1) % 3 === 0) this.clearDecals();
    this.phase = "playing";
    this.last = performance.now();
    // re-center the player and give a short breather before the ring closes in
    this.iframe = Math.max(this.iframe, 0.8);
    this.beginWave();
  }

  private clearDecals() {
    this.dctx?.clearRect(0, 0, this.worldW, this.worldH);
  }

  /* ----------------------------- lifecycle ----------------------------- */

  reset() {
    this.enemies.length = 0;
    this.summons.length = 0;
    this.parts.length = 0;
    this.texts.length = 0;
    this.shots.length = 0;
    this.arrows.length = 0;
    this.enemyDashFx.length = 0;
    this.shockwaves.length = 0;
    this.psychicZones.length = 0;
    this.dashHitSet.clear();
    this.dashSlashes.length = 0;
    this.mines.length = 0;
    this.pickups.length = 0;
    this.marks.length = 0;
    this.potionDisplayT = 0;
    this.lastPotion = null;
    this.afterimages.length = 0;
    this.impacts.length = 0;
    this.trail.length = 0;
    this.px = this.worldW / 2;
    this.py = this.worldH / 2;
    this.cameraX = (this.worldW - this.W) / 2;
    this.cameraY = (this.worldH - this.H) / 2;
    this.pvx = this.pvy = 0;
    this.hp = this.maxHp = this.perk === "sharpGlass" ? 3 : 5;
    this.coins = 0;
    this.iframe = 0;
    this.dashT = this.dashCd = 0;
    this.dashMax = 6;
    this.dashSpeedMult = 1.25;
    this.speedBonus = 0;
    this.weapons = ["katana"];
    this.activeSlot = 0;
    this.weaponLevels = createWeaponLevels();
    this.perkBuffT = 0; this.perkEchoT = 0;
    this.magicType = "fire";
    this.magicCd = 0;
    this.keyboardAimAngle = 0;
    this.atkT = this.atkCd = this.atkWind = this.atkDur = this.atkRec = 0;
    this.atkChain = 0;
    this.atkChainT = 0;
    this.bowCharge = 0;
    this.bowHolding = false;
    this.bowReleasing = 0;
    this.bowFireCd = 0;
    this.bowFullSfx = false;
    this.mineHeld = false;
    this.attackHeld = false;
    this.keyboardAttackHeld = false;
    this.pointerAttackHeld = false;
    this.gamepadButtons = [];
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
    this.clearDecals();
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
    if (this.phase === "playing") {
      this.phase = "paused";
      this.onPause();
    }
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

  dismissPotionTutorial() {
    if (!this.potionTutorialT) return;
    this.potionTutorialT = 0;
    this.potionTutorialSeen = true;
    this.phase = "playing";
    this.last = performance.now();
    this.pushStats(true);
  }

  private limits() {
    const base = DIFFICULTY_RULES[this.difficulty].limits;
    return this.perk === "bladeMonk"
      ? { ...base, dashSpeedMult: base.dashSpeedMult * 1.5 }
      : base;
  }

  private enforceStatLimits() {
    const limits = this.limits();
    this.maxHp = Math.min(this.maxHp, limits.maxHp);
    this.speedBonus = Math.min(this.speedBonus, limits.speed - 108);
    this.dashMax = Math.max(this.dashMax, limits.dashMax);
    this.dashSpeedMult = Math.min(this.dashSpeedMult, limits.dashSpeedMult);
    this.hp = clamp(this.hp, 0, this.maxHp);
  }
  stats(): HudStats {
    this.enforceStatLimits();
    return {
      hp: this.hp,
      maxHp: this.maxHp,
      score: Math.floor(this.score),
      coins: this.coins,
      wave: this.wave,
      combo: this.combo,
      comboP: clamp(this.comboT / 3.2, 0, 1),
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
      potionTutorial: this.potionTutorialT > 0,
      activePotion: this.strengthT > 0 ? "strength" : this.speedT > 0 ? "speed" : this.agilityT > 0 ? "agility" : null,
      activePotions: ([
        ["strength", this.strengthT],
        ["speed", this.speedT],
        ["agility", this.agilityT],
      ] as const).filter(([, time]) => time > 0).map(([type, time]) => ({ type, time })),
      potionTime: Math.max(this.strengthT, this.speedT, this.agilityT),
      weaponLevels: this.weaponLevels,
      magicType: this.magicType,
      difficulty: this.difficulty,
      perk: this.perk,
    };
  }

  private pushStats(force = false) {
    this.waveLeft = Math.max(0, this.waveTotal - this.waveSpawned) + this.marks.length + this.enemies.length;
    const s = this.stats();
    const key = `${s.hp}|${s.score}|${s.coins}|${s.wave}|${s.combo}|${s.kills}|${s.dashReady}|${Math.ceil(s.dashCd * 10)}|${s.activeSlot}|${s.weapons.join(",")}|${Math.floor(s.time)}|${s.waveLeft}|${s.maxHp}|${s.speedBonus}|${s.dashSpeedMult}|${s.dashMax}|${s.mineTutorial}|${JSON.stringify(s.activePotions)}|${JSON.stringify(s.weaponLevels)}|${s.magicType}|${s.difficulty}`;
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
    this.px = this.worldW / 2 + Math.cos(this.idleT * 0.5) * 3;
    this.py = this.worldH / 2 + Math.sin(this.idleT * 0.7) * 2;
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
    this.potionTutorialT = Math.max(0, this.potionTutorialT - dt);
    this.potionDisplayT = Math.max(0, this.potionDisplayT - dt);
    this.strengthT = Math.max(0, this.strengthT - dt);
    this.speedT = Math.max(0, this.speedT - dt);
    this.agilityT = Math.max(0, this.agilityT - dt);
    this.updateProps(dt);
    this.updateGamepad();
    this.decayFx(realDt);

    if (this.combo > 0) {
      this.comboT -= dt;
      if (this.comboT <= 0) this.combo = 0;
    }

    this.updatePlayer(dt);
    this.updateCamera(dt);
    this.updateEnemies(dt);
    this.updateSummons(dt);
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
    for (let i = this.dashSlashes.length - 1; i >= 0; i--) {
      this.dashSlashes[i].life -= dt;
      if (this.dashSlashes[i].life <= 0) this.dashSlashes.splice(i, 1);
    }
    for (let i = this.enemyDashFx.length - 1; i >= 0; i--) {
      this.enemyDashFx[i].life -= dt;
      if (this.enemyDashFx[i].life <= 0) this.enemyDashFx.splice(i, 1);
    }
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
    for (let i = this.psychicZones.length - 1; i >= 0; i--) {
      this.psychicZones[i].life -= dt;
      if (this.psychicZones[i].life <= 0) this.psychicZones.splice(i, 1);
    }
    this.glint = Math.max(0, this.glint - dt * 2.2);
  }

  private aimAngle(): number {
    if (this.aimStick) {
      const dx = this.aimStick.x - this.aimStick.ox;
      const dy = this.aimStick.y - this.aimStick.oy;
      if (Math.hypot(dx, dy) > 6) return Math.atan2(dy, dx);
    }
    if (this.opts.inputMode === "keyboard") return this.keyboardAimAngle;
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

  private updateCamera(dt: number) {
    const marginX = this.W * 0.35;
    const marginY = this.H * 0.35;
    const left = this.cameraX + marginX;
    const right = this.cameraX + this.W - marginX;
    const top = this.cameraY + marginY;
    const bottom = this.cameraY + this.H - marginY;
    let targetX = this.cameraX;
    let targetY = this.cameraY;
    if (this.px < left) targetX = this.px - marginX;
    else if (this.px > right) targetX = this.px - this.W + marginX;
    if (this.py < top) targetY = this.py - marginY;
    else if (this.py > bottom) targetY = this.py - this.H + marginY;
    targetX = clamp(targetX, 0, Math.max(0, this.worldW - this.W));
    targetY = clamp(targetY, 0, Math.max(0, this.worldH - this.H));
    const follow = Math.min(1, dt * 5.5);
    this.cameraX += (targetX - this.cameraX) * follow;
    this.cameraY += (targetY - this.cameraY) * follow;
  }

  private updatePlayer(dt: number) {
    const k = this.keys;
    const bindings = this.opts.keyboardBindings;
    let mx = 0;
    let my = 0;
    if (k.has(bindings.left) || k.has("arrowleft")) mx -= 1;
    if (k.has(bindings.right) || k.has("arrowright")) mx += 1;
    if (k.has(bindings.up) || k.has("arrowup")) my -= 1;
    if (k.has(bindings.down) || k.has("arrowdown")) my += 1;
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
    const pad = navigator.getGamepads?.()[0];
    if (pad && this.opts.inputMode === "gamepad") {
      mx += Math.abs(pad.axes[0] ?? 0) > 0.18 ? pad.axes[0] : 0;
      my += Math.abs(pad.axes[1] ?? 0) > 0.18 ? pad.axes[1] : 0;
      const aimX = Math.abs(pad.axes[2] ?? 0) > 0.18 ? pad.axes[2] : 0;
      const aimY = Math.abs(pad.axes[3] ?? 0) > 0.18 ? pad.axes[3] : 0;
      if (Math.hypot(aimX, aimY) > 0.18) {
        this.keyboardAimAngle = Math.atan2(aimY, aimX);
        this.mouseX = this.px + aimX * 100;
        this.mouseY = this.py + aimY * 100;
        this.mouseActive = true;
      }
    }
    const ml = Math.hypot(mx, my);
    if (ml > 1) {
      mx /= ml;
      my /= ml;
    }
    if (this.opts.inputMode === "keyboard" && ml > 0.01) this.keyboardAimAngle = Math.atan2(my, mx);

    const SPEED = (108 + this.speedBonus - (this.perk === "bottomlessPocket" ? 12 : 0) - (this.perk === "cursedArsenal" ? 8 : 0) + (this.perk === "predatorInstinct" && this.perkBuffT > 0 ? 28 : 0)) * (this.speedT > 0 ? 1.45 : 1);

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
        const slowing = this.atkT > 0 ? 0.5 : this.currentWeapon === "bow" && this.bowHolding ? 0.72 : 1;
        const maxS = SPEED * slowing;
        this.pvx = mx * maxS;
        this.pvy = my * maxS;
        this.walkT += dt * 11;
      } else {
        this.pvx = 0;
        this.pvy = 0;
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
    if (this.px > this.worldW - M) {
      this.px = this.worldW - M;
      this.pvx = 0;
    }
    if (this.py < M + 4) {
      this.py = M + 4;
      this.pvy = 0;
    }
    if (this.py > this.worldH - M) {
      this.py = this.worldH - M;
      this.pvy = 0;
    }
    if (this.dashT > 0 && this.currentWeapon === "katana" && this.weaponLevels.katana.form > 0) {
      this.cutDuringDash();
      if (this.dashSlashes.length < 18) this.dashSlashes.push({ x: this.px, y: this.py, a: Math.atan2(this.dashDy, this.dashDx), life: 0.24, max: 0.24 });
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
        this.dashHitSet.clear();
    this.dashSlashes.length = 0;
        this.dashCd = this.dashMax * (this.agilityT > 0 ? 0.5 : 1);
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
      if (this.currentWeapon !== "bow" && this.currentWeapon !== "mine" && this.currentWeapon !== "book" && this.currentWeapon !== "staff") {
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
      this.updateBow(wantAttack, dt);
    } else if (this.currentWeapon === "book") {
      this.updateMagic(wantAttack, dt);
    } else if (this.currentWeapon === "staff") {
      this.updateStaff(wantAttack, dt);
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

  private updateGamepad() {
    const pad = navigator.getGamepads?.()[0];
    if (!pad || this.phase !== "playing" || this.opts.inputMode !== "gamepad") return;
    const pressed = (index: number) => Boolean(pad.buttons[index]?.pressed);
    const justPressed = (index: number) => pressed(index) && !this.gamepadButtons[index];
    this.attackHeld = this.keyboardAttackHeld || this.pointerAttackHeld || pressed(0) || pressed(7);
    if (justPressed(1) || justPressed(2)) this.dashQueued = true;
    if (justPressed(4) || justPressed(14)) this.prevWeapon();
    if (justPressed(5) || justPressed(15)) this.nextWeapon();
    if (justPressed(9)) this.onPause();
    this.gamepadButtons = pad.buttons.map((button) => button.pressed);
  }

  private updateStaff(wantAttack: boolean, dt: number) {
    void dt;
    if (!wantAttack || this.atkCd > 0 || this.dashT > 0 || this.summons.length >= 6) return;
    const a = this.aimAngle();
    const evolved = this.weaponLevels.staff.form > 0;
    const area = evolved ? 92 + this.weaponLevels.staff.range * 10 : 62 + this.weaponLevels.staff.range * 7;
    const color = evolved ? "#9f63ff" : "#4db9ff";
    this.spawnSummon(this.px + Math.cos(a) * 18, this.py + Math.sin(a) * 18, "summoned");
    this.burst(this.px + Math.cos(a) * 28, this.py + Math.sin(a) * 28, evolved ? 28 : 20, color, evolved ? 150 : 110);
    for (const enemy of this.enemies.slice()) {
      if (Math.hypot(enemy.x - this.px, enemy.y - this.py) <= area) {
        this.damageEnemy(enemy, (evolved ? 4 : 2) + this.weaponLevels.staff.damage, a);
        if (enemy.hp <= 0) this.killEnemy(enemy, a);
      }
    }
    this.atkCd = 0.62 / (1 + this.weaponLevels.staff.speed * 0.12);
    this.atkAngle = a;
    this.glint = 1;
    Sfx.swing("staff");
  }

  private spawnSummon(x: number, y: number, kind: "summoned" | "revived", type: EnemyType = "skeleton") {
    if (this.summons.length >= 6) return;
    this.summons.push({ x, y, vx: 0, vy: 0, r: 8, life: kind === "revived" ? 22 : 16, maxLife: kind === "revived" ? 22 : 16, kind, type, attackCd: 0.4, flash: 0 });
    this.burst(x, y, 12, kind === "revived" ? "#9f63ff" : "#4db9ff", 100);
  }

  private updateSummons(dt: number) {
    for (let i = this.summons.length - 1; i >= 0; i--) {
      const s = this.summons[i]; s.life -= dt; s.attackCd -= dt;
      if (s.life <= 0) { this.summons.splice(i, 1); continue; }
      let target: Enemy | null = null; let best = Infinity;
      for (const e of this.enemies) { const d = Math.hypot(e.x - s.x, e.y - s.y); if (d < best) { best = d; target = e; } }
      if (target) { const a = Math.atan2(target.y - s.y, target.x - s.x); if (best > 20) { s.vx += Math.cos(a) * 260 * dt; s.vy += Math.sin(a) * 260 * dt; } const sp = Math.hypot(s.vx, s.vy); if (sp > 74) { s.vx = s.vx / sp * 74; s.vy = s.vy / sp * 74; } if (best < target.r + 10 && s.attackCd <= 0) { target.hp -= this.playerDamage(1 + Math.floor(this.weaponLevels.staff.damage / 2)); target.flash = 0.12; s.attackCd = s.kind === "revived" ? 0.55 : 0.72; this.burst(target.x, target.y, 4, s.kind === "revived" ? "#b276ff" : "#69d7ff", 60); if (target.hp <= 0) this.killEnemy(target, a, false); } }
      s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.92; s.vy *= 0.92;
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
      this.atkCd = 0.38 / (1 + this.weaponLevels.shield.speed * 0.14);
      this.hitSet.clear();
      Sfx.shieldBash();
      return;
    }
    if (this.opts.inputMode !== "keyboard") {
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
    }

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
    const weapon = this.currentWeapon;
    const base = WEAPON_CONFIG[weapon] ?? WEAPON_CONFIG.katana;
    const levels = this.weaponLevels[weapon];
    const speed = 1 + levels.speed * 0.14;
    const evolvedHammer = weapon === "hammer" && levels.form > 0;
    const evolvedKatana = weapon === "katana" && levels.form > 0;
    return {
      ...base,
      wind: base.wind / speed,
      strike: base.strike / speed,
      rec: base.rec / speed,
      cd: base.cd / speed,
      range: base.range + levels.range * 5 + (weapon === "staff" && levels.form > 0 ? 28 : 0) + (evolvedHammer ? 28 : 0) + (evolvedKatana ? 24 : 0),
      dmg: (base.dmg + levels.damage * (weapon === "hammer" ? 2 : 1) + (evolvedHammer ? 5 : 0) + (evolvedKatana ? 2 : 0)) * (this.perk === "bladeMonk" ? 1.85 : 1) * (this.perk === "bloodContract" && this.hp / Math.max(1, this.maxHp) < 0.3 ? 1.75 : 1) * (this.perk === "sharpGlass" ? 1.35 : 1) * (this.perk === "cursedArsenal" ? 1.2 : 1) * (this.perk === "kyuEcho" && this.perkEchoT >= 6 ? 1.65 : 1),
      kb: base.kb + levels.range * 25 + (evolvedHammer ? 180 : 0) + (evolvedKatana ? 80 : 0),
    };
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
    const evolvedKatana = this.currentWeapon === "katana" && this.weaponLevels.katana.form > 0;
    return (evolvedKatana ? 28 : 16) + Math.abs(Math.sin(this.idleT * 2.1)) * 1.5;
  }

  /* ------------------- special attack actions ------------------- */

  /** Bow: while held, the string is drawn back; on release the arrow flies
   *  with speed / damage / pierce scaled by how far it was pulled. */
  private updateBow(want: boolean, dt: number) {
    const levels = this.weaponLevels.bow;
    const automatic = levels.form > 0;
    const speed = 1 + levels.speed * 0.14;

    if (automatic) {
      this.bowHolding = want;
      this.bowCharge = want ? 1 : 0;
      this.bowFireCd = Math.max(0, this.bowFireCd - dt);
      if (want && this.bowFireCd <= 0 && this.dashT <= 0) {
        this.releaseBow(true);
        this.bowFireCd = 0.2 / speed;
      }
      return;
    }

    if (this.bowReleasing > 0) {
      this.bowReleasing -= dt;
      if (this.bowReleasing <= 0) this.bowFireCd = 0.16 / speed;
      return;
    }
    if (this.bowFireCd > 0) {
      this.bowFireCd = Math.max(0, this.bowFireCd - dt);
      this.bowCharge = Math.max(0, this.bowCharge - dt * 3);
      return;
    }
    if (this.dashT > 0) {
      this.bowHolding = false;
      this.bowCharge = 0;
      return;
    }
    if (want) {
      const wasFull = this.bowCharge >= 1;
      this.bowHolding = true;
      this.bowCharge = Math.min(1, this.bowCharge + (dt * speed) / 0.45);
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
      this.bowHolding = false;
      this.bowFullSfx = false;
      this.releaseBow(false);
    } else {
      this.bowCharge = Math.max(0, this.bowCharge - dt * 3.5);
    }
  }

  private releaseBow(automatic = false) {
    const levels = this.weaponLevels.bow;
    const charge = automatic ? 0.55 : this.bowCharge;
    this.bowCharge = 0;
    const ang = this.aimAngle();
    const sp = automatic ? 680 : 300 + charge * 300;
    const dmg = (automatic ? 2 + levels.damage : 2 + Math.round(charge * 4) + levels.damage) * (this.perk === "bloodContract" && this.hp / Math.max(1, this.maxHp) < 0.3 ? 1.75 : 1) * (this.perk === "sharpGlass" ? 1.35 : 1) * (this.perk === "cursedArsenal" ? 1.2 : 1);
    const pierce = automatic ? 1 : 1 + Math.round(charge * 3);
    this.bowReleasing = automatic ? 0.03 : 0.14;
    this.arrows.push({
      x: this.px + Math.cos(ang) * 12,
      y: this.py + Math.sin(ang) * 12,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      life: 1.2 + levels.range * 0.25,
      pierce,
      rot: ang,
      dmg,
      hitSet: new Set(),
    });
    Sfx.bowShoot(charge);
    this.glint = 1;
    this.burst(this.px + Math.cos(ang) * 16, this.py + Math.sin(ang) * 16, automatic ? 3 : charge >= 0.99 ? 8 : 4, "#ffd0a2", 110);
    if (!automatic && charge >= 0.99) this.shake = Math.max(this.shake, 4);
  }

  private updateMagic(want: boolean, dt: number) {
    this.magicCd = Math.max(0, this.magicCd - dt);
    if (!want || this.magicCd > 0 || this.dashT > 0) return;
    const speed = 1 + this.weaponLevels.book.speed * 0.14;
    this.magicCd = 0.72 / speed;
    this.castMagic();
  }

  private castMagic() {
    if (this.weaponLevels.book.form > 0) {
      this.castPsychicMagic();
      return;
    }
    const levels = this.weaponLevels.book;
    const angle = this.aimAngle();
    const baseRange = 72 + levels.range * 7;
    const range = this.magicType === "fire" ? baseRange * 0.78 : this.magicType === "water" ? baseRange * 1.15 : baseRange;
    const color = this.magicColor();
    let hits = 0;

    for (const enemy of this.enemies.slice()) {
      const dx = enemy.x - this.px;
      const dy = enemy.y - this.py;
      const distance = Math.hypot(dx, dy);
      const enemyAngle = Math.atan2(dy, dx);
      if (distance > range + enemy.r || Math.abs(angDiff(enemyAngle, angle)) > 0.72) continue;
      hits++;
      this.applyMagicHit(enemy, enemyAngle, levels);
    }

    const sourceX = this.px + Math.cos(angle) * 16;
    const sourceY = this.py + Math.sin(angle) * 16;
    this.spawnMagicSparks(sourceX, sourceY, angle, this.magicType, 24 + hits * 4);
    this.burst(sourceX, sourceY, 10 + hits * 2, color, 130);
    this.shake = Math.max(this.shake, this.magicType === "water" ? 6 : 3);
    Sfx.swing("book");
  }

  private castPsychicMagic() {
    const levels = this.weaponLevels.book;
    const angle = this.aimAngle();
    const reach = 64 + levels.range * 9;
    const radius = 30 + levels.range * 5;
    // Place the psychic field at the cursor when aiming with a mouse. The
    // range remains a maximum, so a nearby cursor creates a nearby spell.
    const aimX = this.mouseActive ? this.mouseX : this.px + Math.cos(angle) * reach;
    const aimY = this.mouseActive ? this.mouseY : this.py + Math.sin(angle) * reach;
    const dx = aimX - this.px;
    const dy = aimY - this.py;
    const distance = Math.hypot(dx, dy);
    const scale = distance > reach ? reach / distance : 1;
    const x = clamp(this.px + dx * scale, 18, this.worldW - 18);
    const y = clamp(this.py + dy * scale, 18, this.worldH - 18);
    let hits = 0;

    for (const enemy of this.enemies.slice()) {
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distance = Math.hypot(dx, dy);
      if (distance > radius + enemy.r) continue;
      hits++;
      this.applyMagicHit(enemy, Math.atan2(enemy.y - y, enemy.x - x), levels);
    }

    this.psychicZones.push({ x, y, r: radius, life: 0.6, maxLife: 0.6, type: this.magicType });
    if (this.psychicZones.length > 4) this.psychicZones.shift();
    this.spawnPsychicGroundFx(x, y, radius, this.magicType, hits);
    this.shake = Math.max(this.shake, this.magicType === "water" ? 6 : 3);
    Sfx.swing("book");
  }

  private applyMagicHit(enemy: Enemy, enemyAngle: number, levels: WeaponLevels["book"]): void {
    const direct = this.magicType === "fire" ? 4 + levels.damage * 2 : this.magicType === "water" ? 2 + levels.damage : 1 + levels.damage;
    const killed = this.damageEnemy(enemy, direct, enemyAngle);
    if (killed) return;
    if (this.magicType === "fire") {
      enemy.fireT = Math.max(enemy.fireT, 3);
      enemy.fireTick = Math.min(enemy.fireTick || 0.5, 0.5);
    } else if (this.magicType === "poison") {
      enemy.poisonT = Math.max(enemy.poisonT, 5);
      enemy.poisonTick = Math.min(enemy.poisonTick || 0.5, 0.5);
    } else if (this.magicType === "ice" && enemy.freezeImmune <= 0) {
      enemy.freezeT = 2;
      enemy.freezeImmune = 12;
      enemy.slowT = 7;
    } else if (this.magicType === "water") {
      const push = 420 + levels.range * 45;
      enemy.vx += Math.cos(enemyAngle) * push;
      enemy.vy += Math.sin(enemyAngle) * push;
    }
  }

  private magicColor(): string {
    return this.magicType === "fire" ? "#ff5a3d" : this.magicType === "ice" ? "#86e7ff" : this.magicType === "poison" ? "#8cdf55" : "#62a9ff";
  }

  private spawnMagicSparks(x: number, y: number, angle: number, type: MagicType, count: number) {
    for (let i = 0; i < count; i++) {
      const spread = type === "water" ? 0.42 : type === "poison" ? 0.98 : 0.74;
      const sparkAngle = angle + rnd(-spread, spread);
      const speed = type === "ice" ? rnd(130, 285) : type === "water" ? rnd(85, 190) : rnd(90, 235);
      const fire = type === "fire";
      const poison = type === "poison";
      const ice = type === "ice";
      const water = type === "water";
      this.parts.push({
        x: x + Math.cos(sparkAngle) * rnd(0, 10),
        y: y + Math.sin(sparkAngle) * rnd(0, 10),
        vx: Math.cos(sparkAngle) * speed,
        vy: Math.sin(sparkAngle) * speed + (fire ? -rnd(20, 70) : poison ? -rnd(8, 42) : water ? rnd(-30, 30) : 0),
        life: fire ? rnd(0.22, 0.5) : poison ? rnd(0.35, 0.7) : rnd(0.18, 0.42),
        max: poison ? 0.7 : 0.5,
        size: fire ? rnd(2, 4) : poison ? rnd(2, 5) : ice ? rnd(1, 3) : 2,
        color: i % 6 === 0 ? "#ffffff" : fire ? pick(["#ff5a3d", "#ffb347", "#ffd44a"]) : poison ? pick(["#8cdf55", "#d8ff6a", "#4d9b52"]) : ice ? pick(["#86e7ff", "#d9fbff", "#4aaee8"]) : pick(["#62a9ff", "#c1f6ff", "#3992d8"]),
        drag: poison ? 2.1 : 3.5,
        kind: fire ? (i % 3 === 0 ? 3 : 0) : poison ? 0 : ice ? 2 : (i % 2 === 0 ? 3 : 2),
        rot: water ? angle + (i % 2 ? Math.PI / 2 : -Math.PI / 2) : sparkAngle,
      });
    }
  }

  private spawnPsychicGroundFx(x: number, y: number, r: number, type: MagicType, hits: number) {
    const count = 36 + hits * 4;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const d = Math.sqrt(Math.random()) * r;
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d * 0.56;
      const fire = type === "fire";
      const poison = type === "poison";
      const ice = type === "ice";
      const water = type === "water";
      const color = fire ? pick(["#ff5a3d", "#ffb347", "#ffd44a"]) : poison ? pick(["#8cdf55", "#d8ff6a", "#4d9b52"]) : ice ? pick(["#86e7ff", "#d9fbff", "#4aaee8"]) : pick(["#62a9ff", "#c1f6ff", "#3992d8"]);
      this.parts.push({
        x: px,
        y: py,
        vx: fire ? rnd(-45, 45) : water ? Math.cos(a) * rnd(45, 120) : Math.cos(a) * rnd(15, 90),
        vy: fire ? -rnd(70, 165) : poison ? -rnd(12, 65) : ice ? -rnd(35, 115) : Math.sin(a) * rnd(20, 75),
        life: fire ? rnd(0.3, 0.65) : poison ? rnd(0.45, 0.8) : rnd(0.25, 0.58),
        max: poison ? 0.8 : 0.65,
        size: fire ? rnd(2, 5) : poison ? rnd(3, 6) : ice ? rnd(1, 3) : 2,
        color,
        drag: poison ? 1.8 : 2.8,
        kind: fire ? (i % 4 === 0 ? 3 : 0) : poison ? 0 : ice ? 2 : (i % 2 === 0 ? 3 : 2),
        rot: water ? a + Math.PI / 2 : a,
      });
    }
  }
  private cutDuringDash() {
    const angle = Math.atan2(this.dashDy, this.dashDx);
    const damage = (4 + this.weaponLevels.katana.damage * 2) * (this.perk === "sharpGlass" ? 1.35 : 1) * (this.perk === "cursedArsenal" ? 1.2 : 1);
    for (const enemy of this.enemies.slice()) {
      if (this.dashHitSet.has(enemy)) continue;
      if (Math.hypot(enemy.x - this.px, enemy.y - this.py) > enemy.r + 17) continue;
      this.dashHitSet.add(enemy);
      this.damageEnemy(enemy, damage, angle);
      this.slashSpark(enemy.x, enemy.y, angle);
      this.impacts.push({ x: enemy.x, y: enemy.y, a: angle, life: 0.18, max: 0.18, heavy: true });
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
        dmg: 4 + this.weaponLevels.shield.damage * 2,
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
      x: clamp(this.px + Math.cos(a) * 15, 12, this.worldW - 12),
      y: clamp(this.py + Math.sin(a) * 15, 12, this.worldH - 12),
      armT: 0.45,
      life: 24,
    });
    this.atkCd = this.swingData().cd;
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
      const mineRange = 58 + this.weaponLevels.mine.range * 9;
      const mineDamage = 6 + this.weaponLevels.mine.damage * 2;
      this.shockwaves.push({ x: mine.x, y: mine.y, r: 5, maxR: mineRange, life: 0.3, maxLife: 0.3 });
      this.burst(mine.x, mine.y, 28, "#ff765d", 230);
      this.shake = Math.max(this.shake, 10);
      Sfx.mineExplode();
      for (const enemy of this.enemies.slice()) {
        const d = Math.hypot(enemy.x - mine.x, enemy.y - mine.y);
        if (d <= mineRange + enemy.r) this.damageEnemy(enemy, mineDamage, Math.atan2(enemy.y - mine.y, enemy.x - mine.x));
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

  private updateEnemyStatus(e: Enemy, dt: number): boolean {
    e.freezeImmune = Math.max(0, e.freezeImmune - dt);
    e.freezeT = Math.max(0, e.freezeT - dt);
    e.slowT = Math.max(0, e.slowT - dt);
    e.speed = e.baseSpeed * (e.slowT > 0 && e.freezeT <= 0 ? 0.45 : 1);

    if (e.fireT > 0) {
      e.fireT = Math.max(0, e.fireT - dt);
      e.fireTick -= dt;
      if (e.fireTick <= 0) {
        e.fireTick = 0.5;
        if (!this.statusDamage(e, this.playerDamage(2 + Math.floor(this.weaponLevels.book.damage / 2)), "#ff5a3d")) return false;
      }
    }
    if (e.poisonT > 0) {
      e.poisonT = Math.max(0, e.poisonT - dt);
      e.poisonTick -= dt;
      if (e.poisonTick <= 0) {
        e.poisonTick = 0.5;
        if (!this.statusDamage(e, this.playerDamage(3 + this.weaponLevels.book.damage), "#8cdf55")) return false;
      }
    }
    return true;
  }

  private statusDamage(e: Enemy, damage: number, color: string): boolean {
    if (!this.enemies.includes(e)) return false;
    e.hp -= damage;
    e.flash = 0.12;
    this.burst(e.x, e.y, 4, color, 70);
    if (e.hp <= 0) {
      this.killEnemy(e, Math.atan2(e.y - this.py, e.x - this.px));
      return false;
    }
    return true;
  }

  private playerDamage(dmg: number): number {
    return this.strengthT > 0 ? dmg * 1.5 : dmg;
  }

  private shieldFacing(x: number, y: number): boolean {
    if (this.currentWeapon !== "shield") return false;
    const sourceAngle = Math.atan2(y - this.py, x - this.px);
    return Math.abs(angDiff(sourceAngle, this.aimAngle())) <= 0.95;
  }

  private damageEnemy(e: Enemy, dmg: number, ang: number): boolean {
    dmg = this.playerDamage(dmg);
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

  private killEnemy(e: Enemy, ang: number, allowRevive = true) {
    const idx = this.enemies.indexOf(e);
    if (idx >= 0) this.enemies.splice(idx, 1);
    if (allowRevive && this.currentWeapon === "staff" && this.weaponLevels.staff.form > 0 && Math.random() < 0.5) this.spawnSummon(e.x, e.y, "revived", e.type);

    this.combo++;
    this.comboT = 3.2;
    if (this.perk === "predatorInstinct") this.perkBuffT = 2.5;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.kills++;
    const mult = this.comboMult();
    const gained = Math.round(e.score * mult);
    this.addScore(gained, e.x, e.y - 6, `+${gained}`, mult >= 2 ? "#ffbd86" : "#ffffff");

    const col = bloodColor(e.type);
    this.burst(e.x, e.y, 18, col, 200);
    this.gibs(e.x, e.y, e.type);
    const big = e.type === "brute" || e.type === "oni" || e.type === "shield" || e.type === "boss";
    this.shockwaves.push({
      x: e.x,
      y: e.y,
      r: 4,
      maxR: big ? 28 : 18,
      life: big ? 0.34 : 0.22,
      maxLife: big ? 0.34 : 0.22,
      color: big ? "#ffd27a" : col,
    });
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

    this.shake = Math.max(this.shake, big ? 8 : 4.5);
    Sfx.kill(this.combo);

    // Three coins per kill make the first shop visit immediately useful.
    if (!e.noDrop) {
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
    const hpB = Math.floor(w / 3) + Math.floor(Math.max(0, w - 8) * 0.45);
    const spB = w * 0.9 + Math.max(0, w - 10) * 0.65;
    const enemyDamage = 1 + Math.floor(Math.max(0, w - 1) / 5);
    switch (type) {
      case "grunt":
        return { hp: 2 + hpB, r: 6, speed: 52 + spB, score: 10, dmg: enemyDamage };
      case "bat":
        return { hp: 1 + Math.floor(hpB / 2), r: 6, speed: 70 + spB, score: 15, dmg: enemyDamage };
      case "spitter":
        return { hp: 3 + hpB, r: 6, speed: 40 + spB * 0.4, score: 20, dmg: enemyDamage };
      case "brute":
        return { hp: 9 + hpB * 2, r: 10, speed: 36 + spB * 0.5, score: 45, dmg: enemyDamage };
      case "ninja":
        return { hp: 3 + hpB, r: 6, speed: 96 + spB, score: 28, dmg: enemyDamage };
      case "hound":
        return { hp: 3 + hpB, r: 7, speed: 88 + spB, score: 25, dmg: enemyDamage };
      case "wisp":
        return { hp: 3 + Math.floor(hpB * 0.7), r: 6, speed: 60 + spB * 0.5, score: 30, dmg: enemyDamage };
      case "archer":
        return { hp: 4 + hpB, r: 7, speed: 40 + spB * 0.4, score: 34, dmg: enemyDamage };
      case "oni":
        return { hp: 11 + hpB * 2, r: 9, speed: 44 + spB * 0.5, score: 55, dmg: enemyDamage };
      case "shield":
        return { hp: 13 + hpB * 2, r: 9, speed: 38 + spB * 0.4, score: 60, dmg: enemyDamage };
      case "slime":
        return { hp: 5 + hpB, r: 8, speed: 42 + spB * 0.5, score: 32, dmg: enemyDamage };
      case "monk":
        return { hp: 6 + hpB, r: 7, speed: 52 + spB * 0.6, score: 42, dmg: enemyDamage };
      case "demon":
        return { hp: 12 + hpB * 2, r: 9, speed: 60 + spB * 0.7, score: 70, dmg: enemyDamage };
      case "skeleton":
        return { hp: 6 + hpB, r: 7, speed: 58 + spB * 0.6, score: 38, dmg: enemyDamage };
      case "crawler":
        return { hp: 5 + hpB, r: 6, speed: 112 + spB * 1.1, score: 48, dmg: enemyDamage };
      case "bomber":
        return { hp: 8 + hpB, r: 8, speed: 48 + spB * 0.45, score: 64, dmg: enemyDamage };
      case "bombMinion":
        return { hp: 4 + hpB, r: 7, speed: 62 + spB * 0.55, score: 52, dmg: this.wave <= 10 ? 2 : 5 };
      case "ram":
        return { hp: 12 + hpB * 2, r: 10, speed: 34 + spB * 0.35, score: 78, dmg: this.wave <= 10 ? 5 : 10 };
      case "warlock":
        return { hp: 10 + Math.floor(hpB * 1.3), r: 8, speed: 48 + spB * 0.45, score: 82, dmg: enemyDamage };
      case "golem":
        return { hp: 24 + hpB * 3, r: 13, speed: 28 + spB * 0.35, score: 120, dmg: enemyDamage };
      case "boss":
        return { hp: 68 + w * 8, r: 18, speed: 34 + w * 0.7, score: 1500, dmg: this.difficulty === "hard" ? Number.POSITIVE_INFINITY : 3 + Math.floor(Math.max(0, w - 1) / 10) * 5 };
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
      noDrop: type === "ram",
      scaleY: 1,
      baseSpeed: s.speed,
      fireT: 0,
      fireTick: 0,
      poisonT: 0,
      poisonTick: 0,
      freezeT: 0,
      freezeImmune: 0,
      slowT: 0,
    });
    this.burst(x, y, 10, "#d83b4a", 110);
    Sfx.spawn();
  }

  private randomEdge() {
    const m = 20;
    const side = (Math.random() * 4) | 0;
    if (side === 0) return { x: rnd(m, this.worldW - m), y: m };
    if (side === 1) return { x: rnd(m, this.worldW - m), y: this.worldH - m };
    if (side === 2) return { x: m, y: rnd(m, this.worldH - m) };
    return { x: this.worldW - m, y: rnd(m, this.worldH - m) };
  }

  private chooseType(): EnemyType {
    const table: EnemyType[] = [];
    const add = (ty: EnemyType, n: number) => {
      for (let i = 0; i < n; i++) table.push(ty);
    };
    const w = this.wave;
    add("grunt", 38);
    if (w >= 6) add("bat", 16);
    if (w >= 6) add("spitter", 12);
    if (w >= 6) add("brute", 10);
    if (w >= 6) add("hound", 12);
    if (w >= 6) add("ninja", 12);
    if (w >= 7) add("slime", 10);
    if (w >= 6) add("wisp", 7);
    if (w >= 6) add("archer", 7);
    if (w >= 6) add("skeleton", 12);
    if (w >= 6) add("crawler", 11);
    if (w >= 6) add("bomber", 8);
    if (w >= 6) add("bombMinion", 7);
    if (w >= 6) add("ram", 6);
    if (w >= 6) add("shield", 9);
    if (w >= 6) add("warlock", 9);
    if (w >= 6) add("monk", 10);
    if (w >= 6) add("oni", 8);
    if (w >= 6) add("golem", 7);
    if (w >= 6) add("demon", 8);
    return pick(table) ?? "grunt";
  }

  /** How many mobs a wave contains in total. */
  private waveQuota(w: number): number {
    const lateWave = Math.max(0, w - 4);
    return Math.min(8 + (w - 1) * 2 + Math.floor(lateWave * lateWave * 0.32), 110);
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
      const rx = clamp(this.worldW / 2 + Math.cos(a) * (this.worldW / 2 - 26), 20, this.worldW - 20);
      const ry = clamp(this.worldH / 2 + Math.sin(a) * (this.worldH / 2 - 26), 20, this.worldH - 20);
      this.queueMark(rx, ry, 0.55 + i * 0.045, this.chooseType());
    }
    if (this.wave >= 6 && this.wave % 3 === 0) {
      const extra = this.wave >= 12 ? 2 : 1;
      for (let k = 0; k < extra; k++) {
        const p = this.randomEdge();
        this.queueMark(p.x, p.y, 1.0, "brute");
      }
    }
    if (this.wave >= 6 && this.wave % 5 === 0) {
      const bosses = this.wave >= 15 ? 2 : 1;
      for (let i = 0; i < bosses; i++) {
        const p = this.randomEdge();
        this.queueMark(p.x, p.y, 1.3 + i * 0.25, "boss");
      }
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
    const cap = Math.min(18 + this.wave * 3, 72);
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
        if (e.type === "spitter" || e.type === "archer" || e.type === "wisp" || e.type === "monk" || e.type === "warlock") {
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
      // Credit every coin immediately, while keeping the pickup animation alive.
      const coinValue = DIFFICULTY_RULES[this.difficulty].coinMultiplier;
      for (const p of this.pickups) {
        if (p.kind === "coin" && !p.credited) {
          this.coins += coinValue;
          p.credited = true;
        }
        p.magnet = true;
      }
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

  private explodeBombMinion(e: Enemy) {
    const radius = 42;
    const damage = this.wave <= 10 ? 2 : 5;
    const dx = this.px - e.x;
    const dy = this.py - e.y;
    const distance = Math.hypot(dx, dy);
    const index = this.enemies.indexOf(e);
    if (index >= 0) this.enemies.splice(index, 1);
    this.shockwaves.push({ x: e.x, y: e.y, r: 5, maxR: radius, life: 0.38, maxLife: 0.38, color: "#ff7b38" });
    this.burst(e.x, e.y, 34, "#ff8b3d", 240);
    this.gibs(e.x, e.y, e.type);
    this.bloodDecal(e.x, e.y + 3, 8, "#e85b32");
    this.shake = Math.max(this.shake, 9);
    Sfx.bombExplode();
    if (distance <= radius) this.hurtPlayer(damage, dx / (distance || 1), dy / (distance || 1));
  }

  private ramCrash(e: Enemy) {
    const index = this.enemies.indexOf(e);
    if (index >= 0) this.enemies.splice(index, 1);
    this.enemyDashFx.push({ x: e.x, y: e.y, a: Math.atan2(e.vy, e.vx), life: 0.26, max: 0.26, color: "#ffd27a" });
    this.shockwaves.push({ x: e.x, y: e.y, r: 4, maxR: 24, life: 0.28, maxLife: 0.28, color: "#ffd27a" });
    this.burst(e.x, e.y, 20, "#b7794d", 180);
    this.gibs(e.x, e.y, e.type);
    Sfx.ramImpact();
    this.shake = Math.max(this.shake, 7);
  }

  private updateEnemies(dt: number) {
    const arr = this.enemies;
    for (let i = arr.length - 1; i >= 0; i--) {
      const e = arr[i];
      if (!this.updateEnemyStatus(e, dt)) continue;
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

      if (e.freezeT <= 0 && e.stun <= 0 && e.spawnT <= 0) {
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
          case "crawler":
          case "demon": {
            e.cd -= dt;
            if (e.state === 0) {
              e.vx += nx * e.speed * 3 * dt;
              e.vy += ny * e.speed * 3 * dt;
              if (e.cd <= 0 && dist < (e.type === "demon" ? 180 : e.type === "crawler" ? 170 : 150)) {
                e.state = 1;
                e.cd = e.type === "demon" ? 0.55 : e.type === "crawler" ? 0.24 : 0.35;
                this.enemyDashFx.push({ x: e.x, y: e.y, a: Math.atan2(ny, nx), life: 0.3, max: 0.3, color: e.type === "crawler" ? "#ffb05d" : "#ff5361" });
                Sfx.enemyDash();
              }
            } else if (e.state === 1) {
              e.vx *= 1 - Math.min(1, dt * 8);
              e.vy *= 1 - Math.min(1, dt * 8);
              if (e.cd <= 0) {
                e.state = 2;
                e.cd = e.type === "demon" ? 0.75 : e.type === "crawler" ? 0.32 : 0.42;
                const dashSpeed = e.type === "demon" ? 340 : e.type === "ninja" ? 320 : e.type === "crawler" ? 360 : 270;
                e.vx = nx * dashSpeed;
                e.vy = ny * dashSpeed;
                this.burst(e.x, e.y, 8, e.type === "crawler" ? "#ffb05d" : "#ff5361", 100);
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
          case "monk":
          case "warlock": {
            e.cd -= dt;
            const wanted = e.type === "wisp" ? 125 : e.type === "archer" ? 145 : e.type === "warlock" ? 135 : 100;
            const err = dist - wanted;
            e.vx += nx * Math.sign(err) * e.speed * 4 * dt;
            e.vy += ny * Math.sign(err) * e.speed * 4 * dt;
            const circle = e.type === "wisp" ? 2.3 : 1.2;
            e.vx += -ny * e.speed * circle * dt;
            e.vy += nx * e.speed * circle * dt;
            if (e.cd <= 0 && dist < 210) {
              e.cd = e.type === "archer" ? rnd(1.2, 1.8) : e.type === "warlock" ? rnd(2.1, 2.8) : rnd(1.7, 2.5);
              e.flash = 0.1;
              const sp = e.type === "archer" ? 160 : e.type === "wisp" ? 125 : e.type === "warlock" ? 118 : 108;
              const volley = e.type === "monk" ? 3 : e.type === "warlock" ? 5 : 1;
              for (let v = 0; v < volley; v++) {
                const a = Math.atan2(ny, nx) + (v - (volley - 1) / 2) * (e.type === "warlock" ? 0.18 : 0.24);
                this.shots.push({ x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 4, r: 3, dmg: e.dmg, color: e.type === "warlock" ? "#ad73ff" : undefined });
              }
              this.burst(e.x + nx * 6, e.y + ny * 6, 4, e.type === "warlock" ? "#a677ff" : "#ff764f", 60);
              Sfx.enemyShoot(e.type === "warlock" ? "magic" : "arrow");
            }
            break;
          }
          case "brute":
          case "oni":
          case "shield":
          case "golem": {
            e.vx += nx * e.speed * 3 * dt;
            e.vy += ny * e.speed * 3 * dt;
            break;
          }
          case "bomber": {
            e.cd -= dt;
            const wanted = 75;
            e.vx += nx * Math.sign(dist - wanted) * e.speed * 3.5 * dt;
            e.vy += ny * Math.sign(dist - wanted) * e.speed * 3.5 * dt;
            if (e.cd <= 0 && dist < 145) {
              e.cd = 2.8;
              for (let v = 0; v < 6; v++) {
                const a = (v / 6) * TAU + e.t * 0.4;
                this.shots.push({ x: e.x, y: e.y, vx: Math.cos(a) * 100, vy: Math.sin(a) * 100, life: 2.2, r: 3, dmg: e.dmg, color: "#ffb25b" });
              }
              this.burst(e.x, e.y, 12, "#ffb25b", 95);
              Sfx.enemyShoot("burst");
            }
            break;
          }
          case "bombMinion": {
            e.vx += nx * e.speed * 4.2 * dt;
            e.vy += ny * e.speed * 4.2 * dt;
            if (dist < e.r + 10) {
              this.explodeBombMinion(e);
              continue;
            }
            break;
          }
          case "ram": {
            if (e.state === 0) {
              e.vx += nx * e.speed * 2.8 * dt;
              e.vy += ny * e.speed * 2.8 * dt;
              if (dist < 112) {
                e.state = 1;
                e.cd = 0.58;
                e.vx *= 0.2;
                e.vy *= 0.2;
                this.burst(e.x, e.y, 8, "#ffd27a", 48);
                Sfx.enemyCharge();
              }
            } else if (e.state === 1) {
              e.cd -= dt;
              e.vx *= 1 - Math.min(1, dt * 10);
              e.vy *= 1 - Math.min(1, dt * 10);
              if (e.cd <= 0) {
                e.state = 2;
                e.vx = nx * 330;
                e.vy = ny * 330;
                this.enemyDashFx.push({ x: e.x, y: e.y, a: Math.atan2(ny, nx), life: 0.42, max: 0.42, color: "#ffd27a" });
                this.burst(e.x, e.y, 12, "#ffd27a", 105);
                Sfx.enemyDash();
              }
            }
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
                this.shots.push({ x: e.x, y: e.y, vx: Math.cos(a) * 115, vy: Math.sin(a) * 115, life: 4, r: 4, dmg: e.dmg });
              }
              this.shake = Math.max(this.shake, 4);
              this.burst(e.x, e.y, 18, "#ff3c4a", 120);
              Sfx.enemyShoot("burst");
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

      const damp = ((e.type === "bat" || e.type === "crawler") && e.state === 2) || (e.type === "ram" && e.state === 2) ? 1.2 : 6.5;
      e.vx -= e.vx * Math.min(1, damp * dt);
      e.vy -= e.vy * Math.min(1, damp * dt);
      const maxV = e.type === "bat" || e.type === "crawler" || e.type === "ram" ? 340 : e.speed * 1.6 + 220;
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
      if (e.x > this.worldW - M) {
        e.x = this.worldW - M;
        e.vx = -Math.abs(e.vx) * 0.4;
      }
      if (e.y < M) {
        e.y = M;
        e.vy = Math.abs(e.vy) * 0.4;
      }
      if (e.y > this.worldH - M) {
        e.y = this.worldH - M;
        e.vy = -Math.abs(e.vy) * 0.4;
      }

      if (e.type === "ram" && e.state === 2 && (e.x === M || e.x === this.worldW - M || e.y === M || e.y === this.worldH - M)) {
        this.ramCrash(e);
        continue;
      }

      if (e.type === "ram" && e.state === 2 && dist < e.r + 10 && e.spawnT <= 0) {
        this.hurtPlayer(e.dmg, nx, ny);
        this.ramCrash(e);
        continue;
      }
      if (e.type !== "ram" && e.type !== "bombMinion" && dist < e.r + 8 && e.touchCd <= 0 && e.spawnT <= 0) {
        if (this.shieldFacing(e.x, e.y)) {
          const away = Math.atan2(e.y - this.py, e.x - this.px);
          e.touchCd = 0.55;
          e.vx += Math.cos(away) * 420;
          e.vy += Math.sin(away) * 420;
          e.stun = Math.max(e.stun, 0.22);
          this.burst(e.x, e.y, 8, "#ffd0a2", 110);
          Sfx.parry();
          continue;
        }
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
        if (this.shieldFacing(s.x, s.y)) {
          this.burst(s.x, s.y, 8, "#ffd0a2", 100);
          Sfx.parry();
          continue;
        }
        this.hurtPlayer(s.dmg, (this.px - s.x) / (d || 1), (this.py - s.y) / (d || 1));
        continue;
      }
      if (s.life <= 0 || s.x < 8 || s.y < 8 || s.x > this.worldW - 8 || s.y > this.worldH - 8) {
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

      if (a.pierce <= 0 || a.life <= 0 || a.x < 8 || a.y < 8 || a.x > this.worldW - 8 || a.y > this.worldH - 8) {
        this.burst(a.x, a.y, 5, "#ffd0a2", 70);
        this.arrows.splice(i, 1);
      }
    }
  }

  private updateProps(dt: number) {
    this.propTimer -= dt;
    if (this.propTimer <= 0 && this.props.length < 5) {
      const kind = Math.random() < 0.58 ? "crate" : "tree";
      this.props.push({ x: rnd(28, this.worldW - 28), y: rnd(34, this.worldH - 34), kind, life: kind === "crate" ? 2 : 3, t: 0 });
      this.propTimer = rnd(7, 13);
    }
    for (let i = this.props.length - 1; i >= 0; i--) {
      const prop = this.props[i];
      prop.t += dt;
      if (Math.hypot(this.px - prop.x, this.py - prop.y) > 18) continue;
      this.props.splice(i, 1);
      if (prop.kind === "tree") Sfx.treeBreak();
      else Sfx.crateBreak();
      const potion: PotionType = pick(["health", "strength", "speed", "agility"]);
      this.pickups.push({ x: prop.x, y: prop.y, vx: rnd(-20, 20), vy: rnd(-35, -10), t: 0, kind: potion, potion, magnet: false });
      this.burst(prop.x, prop.y, 12, potion === "health" ? "#ff4d6d" : potion === "strength" ? "#ff8a45" : potion === "speed" ? "#ffd44a" : "#8c8cff", 100);
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
          const coinValue = DIFFICULTY_RULES[this.difficulty].coinMultiplier;
          if (!p.credited) this.coins += coinValue;
          this.addScore(5 * coinValue, p.x, p.y - 6, `+${coinValue}`, "#ffd747");
          this.burst(p.x, p.y, 6, "#ffd747", 75);
          Sfx.coin();
        } else {
          if (p.potion === "health") {
            this.hp = Math.min(this.maxHp, this.hp + 2);
            this.addScore(0, p.x, p.y - 8, "+2 VIDA", "#ff4d6d");
            Sfx.heal();
          }
          if (p.potion === "strength") this.strengthT = 8;
          if (p.potion === "speed") this.speedT = 8;
          if (p.potion === "agility") this.agilityT = 8;
          this.lastPotion = p.potion ?? null;
          this.potionDisplayT = p.potion === "health" ? 0 : 8;
          if (p.potion && this.potionTutorialEnabled && !this.potionTutorialSeen) {
            this.potionTutorialSeen = true;
            this.potionTutorialT = 1;
            this.phase = "paused";
            this.pushStats(true);
          }
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
    this.hp -= dmg * DIFFICULTY_RULES[this.difficulty].damageTaken;
    this.iframe = 0.18;
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

  private drawPsychicZones(ctx: CanvasRenderingContext2D) {
    for (const zone of this.psychicZones) {
      const p = clamp(zone.life / zone.maxLife, 0, 1);
      const fire = zone.type === "fire";
      const poison = zone.type === "poison";
      const ice = zone.type === "ice";
      const color = fire ? "#ff5a3d" : poison ? "#8cdf55" : ice ? "#86e7ff" : "#62a9ff";
      ctx.save();
      ctx.globalAlpha = 0.22 + p * 0.42;
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * TAU + zone.life * (fire ? 8 : poison ? -4 : 5);
        const d = zone.r * (0.12 + ((i * 11) % 17) / 19);
        const x = Math.round(zone.x + Math.cos(a) * d);
        const y = Math.round(zone.y + Math.sin(a) * d * 0.56);
        ctx.fillStyle = i % 7 === 0 ? "#ffffff" : color;
        if (fire) {
          ctx.fillRect(x - 1, y - 5 - (i % 4), 3, 7 + (i % 5));
          ctx.fillStyle = "#ffd44a";
          ctx.fillRect(x, y - 3 - (i % 3), 1, 4);
        } else if (poison) {
          ctx.fillRect(x - 3, y - 2, 6, 4);
          ctx.fillStyle = "#d8ff6a";
          ctx.fillRect(x - 1, y - 3, 3, 2);
        } else if (ice) {
          ctx.fillRect(x, y - 5, 2, 8);
          ctx.fillRect(x - 3, y + 2, 8, 1);
        } else {
          ctx.fillRect(x - 4, y, 9, 2);
          ctx.fillRect(x - 2, y - 2, 5, 1);
          ctx.fillRect(x, y + 2, 2, 2);
        }
      }
      ctx.restore();
    }
  }
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
    ctx.translate(ox - Math.round(this.cameraX), oy - Math.round(this.cameraY));

    ctx.drawImage(this.floor, 0, 0);
    ctx.drawImage(this.decal, 0, 0);
    this.drawPsychicZones(ctx);

    // Shockwave rings from Hammer slams
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = (sw.life / sw.maxLife) * 0.75;
      ctx.strokeStyle = sw.color ?? "#ff9a60";
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

    // Random arena props
    for (const prop of this.props) {
      ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(Math.round(prop.x - 9), Math.round(prop.y + 6), 18, 3);
      if (prop.kind === "crate") {
        ctx.fillStyle = "#9b5937"; ctx.fillRect(Math.round(prop.x - 7), Math.round(prop.y - 6), 14, 12);
        ctx.fillStyle = "#ffd08a"; ctx.fillRect(Math.round(prop.x - 5), Math.round(prop.y - 4), 10, 2);
      } else {
        ctx.fillStyle = "#51352a"; ctx.fillRect(Math.round(prop.x - 3), Math.round(prop.y - 2), 6, 10);
        ctx.fillStyle = "#3e8b4d"; ctx.fillRect(Math.round(prop.x - 10), Math.round(prop.y - 10), 20, 11);
        ctx.fillStyle = "#75c85d"; ctx.fillRect(Math.round(prop.x - 6), Math.round(prop.y - 13), 12, 5);
      }
    }
    // Pickups (Hearts, Coins and potions)
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
    for (const s of this.summons) this.drawSummon(s);

    // Enemy Projectiles
    for (const s of this.shots) {
      const color = s.color ?? "#ffe1b5";
      const length = Math.min(13, Math.max(5, Math.hypot(s.vx, s.vy) * 0.045));
      const angle = Math.atan2(s.vy, s.vx);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(s.x - Math.cos(angle) * length, s.y - Math.sin(angle) * length);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(s.x - 2), Math.round(s.y - 2), 4, 4);
      ctx.fillStyle = "#fff4d0";
      ctx.fillRect(Math.round(s.x - 1), Math.round(s.y - 1), 2, 2);
      ctx.restore();
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

    // Evolved katana leaves a bright cutting thread along the entire dash.
    for (const slash of this.dashSlashes) {
      const fade = clamp(slash.life / slash.max, 0, 1);
      const length = 28 + fade * 20;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = fade * 0.72;
      ctx.strokeStyle = "#ba9cff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(slash.x - Math.cos(slash.a) * length * 0.58, slash.y - Math.sin(slash.a) * length * 0.58);
      ctx.lineTo(slash.x + Math.cos(slash.a) * length * 0.42, slash.y + Math.sin(slash.a) * length * 0.42);
      ctx.stroke();
      ctx.globalAlpha = fade;
      ctx.strokeStyle = "#fff3dc";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    for (const dash of this.enemyDashFx) {
      const fade = clamp(dash.life / dash.max, 0, 1);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = fade * 0.7;
      ctx.strokeStyle = dash.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dash.x - Math.cos(dash.a) * 17, dash.y - Math.sin(dash.a) * 17);
      ctx.lineTo(dash.x + Math.cos(dash.a) * 9, dash.y + Math.sin(dash.a) * 9);
      ctx.stroke();
      ctx.globalAlpha = fade;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#fff4d0";
      ctx.stroke();
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

  private blit(spr: Sprite, x: number, y: number, flip: number, white: number, scaleY = 1, scaleX = 1) {
    const ctx = this.ctx;
    const img = white ? spr.white : spr.canvas;
    const w = spr.w;
    const h = spr.h;
    if (flip < 0 || scaleY !== 1 || scaleX !== 1) {
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y + h / 2));
      ctx.scale((flip < 0 ? -1 : 1) * scaleX, scaleY);
      ctx.drawImage(img, Math.round(-w / 2), -h);
      ctx.restore();
    } else {
      ctx.drawImage(img, Math.round(x - w / 2), Math.round(y - h / 2));
    }
  }

  private drawSummon(s: Summon) {
    const ctx = this.ctx; const color = s.kind === "revived" ? "#a56cff" : "#55c9ff";
    ctx.save(); ctx.filter = s.kind === "revived" ? "hue-rotate(245deg) saturate(2) brightness(.72)" : "hue-rotate(165deg) saturate(2)";
    this.blit(SPR[s.type], s.x, s.y + Math.sin(this.elapsed * 8 + s.x) * 1.2, 1, 0, 1, 1.07); ctx.restore();
    ctx.globalAlpha = 0.6; ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(s.x, s.y + 2, 10 + Math.sin(this.elapsed * 7) * 1.5, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
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
    if ((e.type === "bat" || e.type === "ninja" || e.type === "hound" || e.type === "crawler" || e.type === "demon") && e.state === 1) {
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = "#ff5961";
      ctx.beginPath();
      ctx.arc(e.x, e.y, 10 + Math.sin(e.t * 30) * 2, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (e.type === "ram" && e.state === 1) {
      const pulse = 12 + Math.sin(e.t * 18) * 2;
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(e.t * 18) * 0.12;
      ctx.strokeStyle = "#ffd27a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, pulse, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "#fff0b8";
      ctx.fillRect(Math.round(e.x - 2), Math.round(e.y - 2), 4, 4);
      ctx.restore();
    }
    if (e.type === "ram" && e.state === 2) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(e.t * 24) * 0.2;
      ctx.strokeStyle = "#ff765d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r + 4, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    if (e.type === "bombMinion") {
      const pulse = 0.45 + Math.sin(e.t * 16) * 0.25;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#ff6a38";
      ctx.fillRect(Math.round(e.x - 2), Math.round(e.y - e.r - 5), 4, 3);
      ctx.restore();
    }
    ctx.save();
    ctx.filter = "saturate(2) contrast(1.22) brightness(1.1)";
    this.blit(spr, e.x, e.y + bob, e.face, e.flash > 0 ? 1 : 0, e.scaleY, 1.08);
    ctx.restore();
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
    if (phase === 0 && this.currentWeapon !== "bow" && this.currentWeapon !== "book") {
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
    if (this.trail.length > 1 && this.currentWeapon !== "bow" && this.currentWeapon !== "book") {
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
      this.blit(SPR.player, bx, by, this.face, 0, squash, window.matchMedia?.("(max-width: 640px)").matches ? 1.22 : 1.08);
      if (this.currentWeapon === "book" && this.weaponLevels.book.form > 0) this.drawPsychicHands(this.aimAngle());
    }

    if (phase === 1 && this.trail.length > 4 && this.currentWeapon !== "bow" && this.currentWeapon !== "book") {
      const n = this.trail.length;
      this.drawWeapon(this.trail[n - 4].a, this.bladeLen() * 0.92, 0.22);
      this.drawWeapon(this.trail[Math.max(0, n - 8)].a, this.bladeLen() * 0.84, 0.11);
    }

    // the bow always tracks the aim; melee weapons use the swing timeline
    const weaponAngle = this.currentWeapon === "bow" || this.currentWeapon === "shield" || this.currentWeapon === "mine" || this.currentWeapon === "book" || this.currentWeapon === "staff"
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

  private drawPsychicHands(angle: number) {
    const ctx = this.ctx;
    const pulse = 0.55 + Math.sin(this.idleT * 10) * 0.2;
    for (const side of [-1, 1]) {
      const spread = angle + side * 0.9;
      const x = Math.round(this.px + Math.cos(spread) * 12);
      const y = Math.round(this.py + Math.sin(spread) * 8 - 2);
      ctx.fillStyle = "#27183b";
      ctx.fillRect(x - 3, y - 3, 6, 6);
      ctx.fillStyle = "#d9b08f";
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.fillStyle = "#8cecff";
      ctx.globalAlpha = pulse;
      ctx.fillRect(x - 4, y - 4, 2, 2);
      ctx.fillRect(x + 3, y + 2, 2, 2);
      ctx.globalAlpha = 1;
    }
  }
  private drawWeapon(angle: number, len: number, alpha: number) {
    if (this.currentWeapon === "book" && this.weaponLevels.book.form > 0) return;
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
      form: this.weaponLevels[this.currentWeapon].form,
    });

    ctx.restore();
  }

  private pushTrail() {
    if (this.atkT <= 0 || this.currentWeapon === "bow" || this.currentWeapon === "shield" || this.currentWeapon === "mine" || this.currentWeapon === "book" || this.currentWeapon === "staff") return;
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
    case "crawler":
      return "#e7943d";
    case "bomber":
      return "#ffad59";
    case "bombMinion":
      return "#ff7b38";
    case "ram":
      return "#b7794d";
    case "warlock":
      return "#a778ff";
    case "golem":
      return "#b78055";
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
    case "crawler":
      return ["#713322", "#c56333", "#ffc066"];
    case "bomber":
      return ["#723027", "#dd6340", "#ffc267"];
    case "bombMinion":
      return ["#5e2026", "#d83b3f", "#ff9d3f"];
    case "ram":
      return ["#523022", "#98613e", "#d99a62"];
    case "warlock":
      return ["#321d58", "#7348b5", "#bf95ff"];
    case "golem":
      return ["#4c3030", "#88594a", "#d89a67"];
  }
}

function prevent(e: Event) {
  e.preventDefault();
}
