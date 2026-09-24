import { useEffect, useRef, useState } from "react";
import { GAMEPLAY_TEXT } from "../game/gameplayText";
import type { HudStats } from "../game/engine";
import { RACE_CONFIG } from "../game/races";
import type { Language, Strings } from "../game/i18n";
import { formatTime } from "../game/storage";
import PixelSprite from "./PixelSprite";
import WeaponPreview from "./WeaponPreview";

function Heart({ filled }: { filled: boolean }) {
  return <svg viewBox="0 0 7 6" className="h-7 w-9 sm:h-8 sm:w-10" shapeRendering="crispEdges"><g fill={filled ? "#ff4353" : "#2a0e13"}><rect x="1" y="0" width="2" height="1" /><rect x="4" y="0" width="2" height="1" /><rect x="0" y="1" width="7" height="2" /><rect x="1" y="3" width="5" height="1" /><rect x="2" y="4" width="3" height="1" /><rect x="3" y="5" width="1" height="1" /></g>{filled && <rect x="1" y="1" width="1" height="1" fill="#ffd2b5" />}</svg>;
}

export default function Hud({ stats, best, onPause, onSelectSlot, onDash, onRaceAbility, raceAbilityBinding, onSpectate, onPotionDismiss, hudScale, language, t }: {
  stats: HudStats;
  best: number;
  onPause: () => void;
  onSpectate: (direction: -1 | 1) => void;
  onMute: () => void;
  onSelectSlot: (slot: number) => void;
  onDash: () => void;
  onRaceAbility: () => void;
  raceAbilityBinding: string;
  onPotionDismiss: (neverAgain: boolean) => void;
  muted: boolean;
  hudScale: 0.65 | 0.85 | 1 | 1.25 | 1.5;
  language: Language;
  t: Strings;
}) {
  type DashPosition = { x: number; y: number };
  const isTouchPointer = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  const clampDashPosition = (x: number, y: number): DashPosition => ({ x: Math.max(8, Math.min(window.innerWidth - 76, x)), y: Math.max(70, Math.min(window.innerHeight - 84, y)) });
  const defaultDashPosition = (): DashPosition => clampDashPosition(window.innerWidth - 84, window.innerHeight - 100);
  const [dashPos, setDashPos] = useState<DashPosition | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = JSON.parse(localStorage.getItem("ronin.dash.position") ?? "null") as DashPosition | null;
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return clampDashPosition(saved.x, saved.y);
    } catch { /* use mobile default below */ }
    return window.matchMedia?.("(pointer: coarse)").matches ? defaultDashPosition() : null;
  });
  const dashWasDragged = useRef(false);
  useEffect(() => {
    if (!isTouchPointer) return;
    const clamp = () => setDashPos((current) => clampDashPosition(current?.x ?? defaultDashPosition().x, current?.y ?? defaultDashPosition().y));
    clamp();
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, [isTouchPointer]);
  const moveDash = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "touch") return;
    event.preventDefault();
    event.stopPropagation();
    dashWasDragged.current = false;
    const start = dashPos ?? defaultDashPosition();
    const startX = event.clientX;
    const startY = event.clientY;
    let position = start;
    const move = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return;
      const dx = next.clientX - startX;
      const dy = next.clientY - startY;
      if (Math.hypot(dx, dy) > 7) dashWasDragged.current = true;
      position = clampDashPosition(start.x + dx, start.y + dy);
      setDashPos(position);
      next.preventDefault();
    };
    const end = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (dashWasDragged.current) {
        try { localStorage.setItem("ronin.dash.position", JSON.stringify(position)); } catch { /* ignore */ }
      }
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const activateDash = () => {
    if (dashWasDragged.current) { dashWasDragged.current = false; return; }
    onDash();
  };
  const g = GAMEPLAY_TEXT[language];
  const comboMult = Math.min(1 + stats.combo * 0.12, 6);
  const dashProgress = stats.dashReady ? 1 : 1 - stats.dashCd / stats.dashMax;
  const waveProgress = stats.waveTotal ? 1 - stats.waveLeft / stats.waveTotal : 0;
  const healthSegments = Math.min(20, Math.max(1, Math.ceil(stats.maxHp)));
  const filledHeartSegments = Math.ceil((stats.hp / stats.maxHp) * healthSegments);
  const potionNames = { health: "VIDA", strength: "FORCA", speed: "VELOCIDADE", agility: "AGILIDADE" } as const;
  const potionSprites = { health: "potionHealth", strength: "potionStrength", speed: "potionSpeed", agility: "potionAgility" } as const;
  const race = RACE_CONFIG[stats.raceId];
  const raceAbilityReady = stats.raceAbilityCd <= 0 && stats.raceAbilityT <= 0 && !stats.isSpectating;
  const raceAbilityState = stats.raceAbilityT > 0 ? `${stats.raceAbilityT.toFixed(1)}s` : raceAbilityReady ? "READY" : `${Math.ceil(stats.raceAbilityCd)}s`;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2 sm:p-3">
      <div className="combat-topbar grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <section className="combat-panel justify-self-start">
          <div className="grid grid-cols-5 gap-1 sm:grid-cols-10">{Array.from({ length: healthSegments }).map((_, index) => <Heart key={index} filled={index < filledHeartSegments} />)}</div>
          <span className="mt-2 block font-pixel text-[5px] text-[#7db7b1]">{g.shopSoon}</span>
          {stats.activePotions.length > 0 && <div className="potion-stack potion-stack-fly" style={{ transform: `scale(${hudScale})`, transformOrigin: "top left" }}>{stats.activePotions.map((potion) => <div key={potion.type} className="potion-active font-pixel"><PixelSprite name={potionSprites[potion.type]} scale={2} /><div><strong>{potionNames[potion.type]}</strong><span>{Math.ceil(potion.time)}S</span></div></div>)}</div>}
        </section>

        <section className="combat-wave justify-self-center">
          <div className="font-pixel text-[10px] text-[#ffe2c4] sm:text-[12px]">{t.wave} {stats.wave}</div>
          <div className="mt-1 h-3 w-28 border-2 border-[#070305] bg-[#291018] sm:w-40"><div className="h-full bg-[#e0444d]" style={{ width: `${Math.max(0, Math.min(100, waveProgress * 100))}%` }} /></div>
          <div className="font-pixel mt-1 text-[6px] text-[#b78c91]">{stats.waveLeft} {t.enemiesLeft} · {formatTime(stats.time)}</div>
        </section>

        <section className="combat-panel justify-self-end text-right">
          <div><strong className="font-pixel text-[18px] text-white sm:text-[24px]">{stats.score.toLocaleString()} PONTOS</strong><div className="font-pixel text-[6px] text-[#858585]">RECORDE {best.toLocaleString()}</div></div>
          <div className="flex items-center justify-end gap-2"><span className="combat-kills font-pixel">ABATES {stats.kills}</span><div className="pointer-events-auto"><button onClick={onPause} className="hud-icon text-[12px] sm:text-[15px]" aria-label={t.pause}>Ⅱ</button></div></div>
        </section>
      {stats.isSpectating && <div className="pointer-events-auto absolute left-1/2 top-20 flex -translate-x-1/2 items-center gap-3 border-2 border-[#070305] bg-[#160b12]/95 px-3 py-2 font-pixel text-[7px] text-[#ffd44a]">
        <button onClick={() => onSpectate(-1)} aria-label="Jogador anterior">◀</button>
        <span>ESPECTANDO {stats.spectatedName ?? "ALIADO"}</span>
        <button onClick={() => onSpectate(1)} aria-label="Próximo jogador">▶</button>
      </div>}

      </div>

      <button onClick={onRaceAbility} disabled={!raceAbilityReady} className={`pointer-events-auto absolute bottom-3 left-3 flex h-[70px] w-[92px] flex-col items-center justify-center gap-1 border-4 bg-[#0b1215] font-pixel shadow-[0_4px_0_#070305] ${stats.raceAbilityT > 0 ? "anim-pulse" : ""}`} style={{ borderColor: race.color, backgroundColor: `${race.color}20` }} title={`${race.ability.name}: ${raceAbilityState}`} aria-label="Habilidade Especial"><strong className="text-center text-[6px]" style={{ color: race.color }}>{race.ability.name}</strong><span className="text-[15px]" style={{ color: race.color }}>{race.icon}</span><span className="text-[7px] text-[#ff6a68]">{raceAbilityState}</span><span className="text-[5px] text-[#d8c2b8]">{raceAbilityBinding}</span></button>
      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2"><PixelSprite name="coin" scale={3} /><strong className="font-pixel text-[15px] text-[#ffd44a]">{Math.round(stats.coins)}</strong></div>
      {stats.combo > 1 && <div key={stats.combo} className="combat-combo anim-pop absolute left-1/2 top-24 -translate-x-1/2"><strong className="font-pixel text-shadow-pix">COMBO x{comboMult.toFixed(1)}</strong><span className="font-pixel">{stats.combo} {t.kills}</span><div className="combat-combo-track"><i style={{ width: `${stats.comboP * 100}%` }} /></div></div>}

      {stats.potionTutorial && <div className="potion-tutorial-backdrop pointer-events-auto"><div className="potion-tutorial">
        <strong>POCOES · EFEITOS</strong><span className="potion-health">VIDA: RECUPERA 2 CORACOES</span><span className="potion-strength">FORCA: +50% DANO · 8S</span><span className="potion-speed">VELOCIDADE: +45% MOVIMENTO · 8S</span><span className="potion-agility">AGILIDADE: -50% RECARGA DO DASH · 8S</span><div className="potion-tutorial-actions"><button onClick={() => onPotionDismiss(false)}>ENTENDI</button><button onClick={() => onPotionDismiss(true)}>ENTENDI E NAO MOSTRAR NOVAMENTE</button></div>
      </div></div>}
      {stats.mineTutorial && <div className="font-pixel absolute bottom-28 left-1/2 w-[min(90%,460px)] -translate-x-1/2 border-4 border-[#070305] bg-[#10282b]/95 px-4 py-3 text-center text-[7px] leading-5 text-[#ffd44a] shadow-[0_5px_0_#070305]">{t.mineTutorial}</div>}

      <div className="pointer-events-auto mx-auto flex max-w-full items-end justify-center gap-2 pb-1" style={{ transform: `scale(${hudScale})`, transformOrigin: "bottom center" }}>
        <button onClick={activateDash} onPointerDown={moveDash} style={dashPos && isTouchPointer ? { position: "fixed", left: dashPos.x, top: dashPos.y, zIndex: 30 } : undefined} className={`dash-gauge dash-action mobile-dash-button ${stats.dashReady ? "is-ready" : ""}`} title={`${g.dash}: ${stats.dashReady ? t.ready : `${stats.dashCd.toFixed(1)}s`}`} aria-label={g.dash}>
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="#0b1215" stroke="#352029" strokeWidth="5" /><circle cx="26" cy="26" r="22" fill="none" stroke={stats.dashReady ? "#ffd44a" : "#e0444d"} strokeWidth="5" strokeDasharray={`${dashProgress * 138.23} 138.23`} /></svg>
          <PixelSprite name="player" scale={2} className={stats.dashReady ? "anim-bob" : "opacity-50"} />
          <strong>{stats.dashReady ? "DASH" : `${Math.ceil(stats.dashCd)}s`}</strong>
        </button>

        <div className="weapon-rail">{Array.from({ length: stats.maxWeaponSlots }, (_, index) => index).map((index) => {
          const weapon = stats.weapons[index];
          const active = index === stats.activeSlot;
          if (!weapon) return <div key={index} className="weapon-slot is-empty"><span>{index + 1}</span></div>;
          const levels = stats.weaponLevels[weapon];
          const totalLevel = levels.damage + levels.speed + levels.range + levels.form;
          const label = weapon === "harp" ? "ARPA DIVINA" : weapon === "godslayer" ? "GODSLAYER" : weapon === "book" ? g.book : weapon === "bow" && levels.form > 0 ? g.automaticPistol : weapon === "hammer" && levels.form > 0 ? g.titanHammer : weapon === "staff" && levels.form > 0 ? g.necromancerStaff : weapon === "staff" ? g.staff : (t[weapon] as string);
          return <button key={index} onClick={() => onSelectSlot(index)} className={`weapon-slot ${active ? "is-active" : ""}`} title={label}>
            <span className="slot-key">{index + 1}</span><WeaponPreview weapon={weapon} form={levels.form} scale={active ? 2 : 1} className="weapon-slot-preview" /><span className="slot-name">{label}</span><span className="slot-level">{g.level}{totalLevel}{weapon === "book" ? ` · ${g[stats.magicType]}` : ""}</span>
          </button>;
        })}</div>
      </div>
    </div>
  );
}

