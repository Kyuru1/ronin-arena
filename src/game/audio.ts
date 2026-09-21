// Tiny WebAudio synth for chunky retro SFX. No assets needed.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let volume = 0.45;
let musicGain: GainNode | null = null;
let musicTimer = 0;
let musicStep = 0;

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.value = muted ? 0 : volume;
}

export function getVolume() {
  return volume;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ac();
  startMusic();
}

export function setMuted(m: boolean) {
  muted = m;
  if (master) master.gain.value = m ? 0 : volume;
}

export function isMuted() {
  return muted;
}

function noiseBuffer(c: AudioContext, dur: number) {
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function tone(
  type: OscillatorType,
  f0: number,
  f1: number,
  dur: number,
  vol = 0.3,
  delay = 0,
) {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master!);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, vol: number, f0: number, f1: number, q = 1, delay = 0) {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur);
  const filt = c.createBiquadFilter();
  filt.type = "bandpass";
  filt.Q.value = q;
  filt.frequency.setValueAtTime(f0, t);
  filt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filt).connect(g).connect(master!);
  src.start(t);
  src.stop(t + dur + 0.02);
}

function musicNote(freq: number, dur: number, vol: number, delay = 0, type: OscillatorType = "triangle") {
  const c = ac();
  if (!c || !master) return;
  if (!musicGain) {
    musicGain = c.createGain();
    musicGain.gain.value = 0.16;
    musicGain.connect(master);
  }
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(musicGain);
  o.start(t);
  o.stop(t + dur + 0.03);
}

function musicDrum(accent: boolean) {
  const c = ac();
  if (!c || !master) return;
  if (!musicGain) {
    musicGain = c.createGain();
    musicGain.gain.value = 0.16;
    musicGain.connect(master);
  }
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(accent ? 115 : 155, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
  g.gain.setValueAtTime(accent ? 0.55 : 0.28, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g).connect(musicGain);
  o.start(t);
  o.stop(t + 0.22);
}

function musicHat(open = false) {
  const c = ac();
  if (!c || !master || !musicGain) return;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, open ? 0.12 : 0.045);
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = open ? 4200 : 6500;
  const g = c.createGain();
  g.gain.setValueAtTime(open ? 0.16 : 0.1, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.12 : 0.045));
  src.connect(filter).connect(g).connect(musicGain);
  src.start(t);
  src.stop(t + (open ? 0.14 : 0.06));
}

/** Fast procedural arcade theme: driving bass, syncopated drums and a playful lead. */
export function startMusic() {
  if (musicTimer || typeof window === "undefined") return;
  const lead = [440, 523.25, 659.25, 783.99, 659.25, 523.25, 440, 392, 440, 523.25, 698.46, 783.99, 880, 783.99, 698.46, 523.25];
  const bass = [110, 110, 130.81, 146.83, 110, 164.81, 146.83, 130.81];
  const tick = () => {
    const step = musicStep++ % 32;
    const bar = Math.floor(musicStep / 32);
    if (step % 4 === 0) musicDrum(step % 8 === 0);
    if (step % 4 === 2 || step % 8 === 6) musicDrum(false);
    musicHat(step % 8 === 7);
    if (step % 2 === 0) musicNote(bass[(Math.floor(step / 2) + bar) % bass.length], 0.16, 0.2, 0, "sawtooth");
    const phrase = lead[(step + bar * 2) % lead.length];
    if (step % 4 !== 3) musicNote(phrase, step % 2 ? 0.08 : 0.12, 0.12, 0, step % 8 === 6 ? "square" : "triangle");
    if (step === 7 || step === 15 || step === 23 || step === 31) musicNote(phrase * 2, 0.13, 0.08, 0.01, "square");
  };
  tick();
  musicTimer = window.setInterval(tick, 100);
}

export type Weapon = "katana" | "bow" | "hammer" | "shield" | "mine" | "book" | "staff";

export const Sfx = {
  // A crisp metallic "shing" for the katana; heavier thumps/twangs for other weapons.
  swing(weapon: Weapon = "katana") {
    if (weapon === "katana") {
      noise(0.1, 0.22, 3400, 950, 2.2);
      tone("triangle", 1900, 2600, 0.05, 0.08);
    } else if (weapon === "bow") {
      noise(0.08, 0.24, 2800, 600, 1.6);
      tone("triangle", 440, 880, 0.08, 0.16);
    } else if (weapon === "book") {
      tone("sine", 280, 920, 0.16, 0.14);
      tone("triangle", 620, 220, 0.2, 0.08, 0.03);
    } else if (weapon === "hammer") {
      noise(0.22, 0.32, 1400, 220, 1.1);
      tone("sawtooth", 240, 80, 0.2, 0.18);
    } else if (weapon === "shield") {
      noise(0.14, 0.28, 1800, 300, 1.8);
      tone("square", 600, 180, 0.12, 0.16);
    } else if (weapon === "mine") {
      tone("square", 520, 260, 0.08, 0.13);
      tone("sine", 180, 120, 0.12, 0.1, 0.04);
    }
  },
  charge() {
    tone("triangle", 90, 420, 0.16, 0.14);
    noise(0.18, 0.1, 300, 1400, 1.2);
  },
  impact(heavy = false) {
    tone("square", heavy ? 200 : 340, 60, heavy ? 0.14 : 0.08, 0.22);
    tone("triangle", heavy ? 900 : 1500, 300, 0.05, 0.12);
    noise(heavy ? 0.16 : 0.09, heavy ? 0.36 : 0.28, heavy ? 1300 : 2000, 240, 0.9);
  },
  /** charge 0..1 — full-draw shots are louder and higher pitched. */
  bowShoot(charge = 0) {
    const f = 1 + charge * 0.9;
    tone("triangle", 520 * f, 210 * f, 0.09, 0.16 + charge * 0.12);
    noise(0.09, 0.2, 2400 * f, 700, 1.5);
    if (charge >= 0.99) {
      tone("triangle", 880, 1500, 0.08, 0.14, 0.03);
      noise(0.16, 0.16, 3400, 500, 1.6);
    }
  },
  /** creak + hum while pulling the string; a small "full draw" tick. */
  bowDraw() {
    noise(0.08, 0.08, 900, 400, 2);
  },
  bowFull() {
    tone("triangle", 1200, 1600, 0.05, 0.12);
  },
  hammerSlam() {
    tone("sawtooth", 160, 40, 0.28, 0.35);
    noise(0.25, 0.4, 600, 60, 1.1);
  },
  shieldBash() {
    tone("square", 900, 250, 0.1, 0.25);
    tone("triangle", 400, 120, 0.15, 0.2);
    noise(0.15, 0.3, 1900, 400, 1.5);
  },
  mineExplode() {
    tone("sawtooth", 150, 35, 0.32, 0.38);
    noise(0.35, 0.45, 1200, 70, 0.7);
  },
  hit() {
    tone("square", 320, 90, 0.1, 0.25);
    noise(0.1, 0.3, 1600, 300, 0.8);
  },
  kill(combo = 0) {
    const p = 1 + Math.min(combo, 20) * 0.05;
    noise(0.14, 0.3, 1800 * p, 150, 0.85);
    tone("sine", 150 * p, 48, 0.2, 0.3);
    tone("triangle", 740 * p, 1180 * p, 0.07, 0.14);
    tone("triangle", 1100 * p, 1760 * p, 0.1, 0.1, 0.045);
    if (combo >= 5) tone("sine", 520 * p, 780 * p, 0.16, 0.1, 0.08);
  },
  crit(n: number) {
    for (let i = 0; i < Math.min(n, 4); i++) {
      tone("square", 600 + i * 220, 1000 + i * 260, 0.09, 0.16, i * 0.045);
    }
    noise(0.2, 0.24, 3200, 600, 1.6);
  },
  hurt() {
    tone("sawtooth", 260, 55, 0.32, 0.34);
    tone("square", 140, 60, 0.28, 0.2, 0.02);
    noise(0.22, 0.3, 480, 110, 0.6);
  },
  dash() {
    noise(0.22, 0.24, 480, 2600, 1.3);
    tone("sine", 300, 900, 0.14, 0.1);
  },
  parry() {
    tone("square", 1500, 2600, 0.06, 0.22);
    tone("square", 2200, 1100, 0.1, 0.16, 0.03);
    noise(0.08, 0.24, 4000, 1200, 2);
  },
  coin() {
    tone("sine", 987, 1318, 0.06, 0.2);
    tone("sine", 1318, 1760, 0.09, 0.18, 0.04);
  },
  pickup() {
    tone("square", 900, 1360, 0.06, 0.18);
    tone("square", 1360, 1820, 0.08, 0.14, 0.05);
  },
  treeBreak() {
    noise(0.2, 0.34, 720, 180, 1.1);
    tone("sawtooth", 180, 70, 0.2, 0.2);
    tone("triangle", 420, 130, 0.12, 0.13, 0.04);
  },
  crateBreak() {
    noise(0.12, 0.3, 1500, 420, 1.4);
    tone("square", 260, 90, 0.16, 0.22);
    tone("triangle", 880, 420, 0.1, 0.14, 0.03);
  },
  heal() {
    tone("triangle", 540, 1080, 0.16, 0.22);
    tone("triangle", 810, 1620, 0.2, 0.16, 0.08);
  },
  spawn() {
    tone("sine", 130, 340, 0.16, 0.1);
  },
  wave() {
    tone("sawtooth", 120, 90, 0.5, 0.26);
    tone("square", 180, 360, 0.3, 0.18, 0.08);
    tone("square", 240, 480, 0.34, 0.16, 0.2);
  },
  boss() {
    tone("sawtooth", 70, 55, 1.1, 0.4);
    tone("square", 110, 90, 0.8, 0.24, 0.1);
    noise(0.9, 0.3, 400, 60, 0.5);
  },
  shoot() {
    tone("sawtooth", 760, 200, 0.13, 0.14);
  },
  equip() {
    tone("square", 480, 720, 0.05, 0.18);
    noise(0.08, 0.2, 2200, 800, 1.8);
  },
  buy() {
    tone("sine", 880, 1200, 0.07, 0.2);
    tone("sine", 1200, 1760, 0.1, 0.25, 0.05);
  },
  sell() {
    noise(0.12, 0.25, 1800, 600, 1.2);
    tone("sine", 600, 900, 0.08, 0.18, 0.03);
  },
  death() {
    tone("sawtooth", 420, 40, 0.9, 0.36);
    tone("square", 200, 30, 0.7, 0.24, 0.05);
    noise(0.8, 0.32, 800, 55, 0.5);
  },
  start() {
    tone("square", 330, 660, 0.12, 0.2);
    tone("square", 494, 988, 0.16, 0.18, 0.1);
    tone("square", 660, 1320, 0.18, 0.16, 0.22);
  },
};
