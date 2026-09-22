import { useState } from "react";
import { GAMEPLAY_TEXT } from "../game/gameplayText";
import type { HudStats } from "../game/engine";
import type { Language, Strings } from "../game/i18n";
import { formatTime } from "../game/storage";
import PixelSprite from "./PixelSprite";
import WeaponPreview from "./WeaponPreview";

function Heart({ filled }: { filled: boolean }) {
  return <svg viewBox="0 0 7 6" className="h-3 w-4 sm:h-4 sm:w-5" shapeRendering="crispEdges"><g fill={filled ? "#ff4353" : "#2a0e13"}><rect x="1" y="0" width="2" height="1" /><rect x="4" y="0" width="2" height="1" /><rect x="0" y="1" width="7" height="2" /><rect x="1" y="3" width="5" height="1" /><rect x="2" y="4" width="3" height="1" /><rect x="3" y="5" width="1" height="1" /></g>{filled && <rect x="1" y="1" width="1" height="1" fill="#ffd2b5" />}</svg>;
}

export default function Hud({ stats, best, onPause, onSelectSlot, onDash, onPotionDismiss, hudScale, language, t }: {
  stats: HudStats;
  best: number;
  onPause: () => void;
  onMute: () => void;
  onSelectSlot: (slot: number) => void;
  onDash: () => void;
  onPotionDismiss: (neverAgain: boolean) => void;
  muted: boolean;
  hudScale: 0.65 | 0.85 | 1 | 1.25 | 1.5;
  language: Language;
  t: Strings;
}) {
  const [dashPos, setDashPos] = useState(() => { try { return JSON.parse(localStorage.getItem("ronin.dash.position") ?? "null") as { x: number; y: number } | null; } catch { return null; } });
  const moveDash = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "touch") return;
    const move = (next: PointerEvent) => { const pos = { x: Math.max(8, Math.min(window.innerWidth - 78, next.clientX - 34)), y: Math.max(70, Math.min(window.innerHeight - 88, next.clientY - 34)) }; setDashPos(pos); try { localStorage.setItem("ronin.dash.position", JSON.stringify(pos)); } catch { /* ignore */ } };
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const g = GAMEPLAY_TEXT[language];
  const comboMult = Math.min(1 + stats.combo * 0.12, 6);
  const dashProgress = stats.dashReady ? 1 : 1 - stats.dashCd / stats.dashMax;
  const isTouchPointer = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  const waveProgress = stats.waveTotal ? 1 - stats.waveLeft / stats.waveTotal : 0;
  const healthSegments = Math.min(20, Math.max(1, stats.maxHp));
  const filledHeartSegments = Math.ceil((stats.hp / stats.maxHp) * healthSegments);
  const potionNames = { health: "VIDA", strength: "FORCA", speed: "VELOCIDADE", agility: "AGILIDADE" } as const;
  const potionSprites = { health: "potionHealth", strength: "potionStrength", speed: "potionSpeed", agility: "potionAgility" } as const;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2 sm:p-3">
      <div className="combat-topbar grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <section className="combat-panel justify-self-start">
          <div className="flex items-center justify-between gap-2">
            <span className="hud-label">HP</span>
            <span className="font-pixel text-[6px] text-[#ffd2b5]">{stats.hp}/{stats.maxHp}</span>
          </div>
          <div className="combat-health-track" aria-label={`Vida ${stats.hp} de ${stats.maxHp}`}>
            <div className="combat-health-fill" style={{ width: `${Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100))}%` }} />
          </div>
          <div className="grid grid-cols-10 gap-[2px]">{Array.from({ length: healthSegments }).map((_, index) => <Heart key={index} filled={index < filledHeartSegments} />)}</div>
          <div className="mt-1 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><PixelSprite name="coin" scale={2} /><span className="font-pixel text-[10px] text-[#ffd44a]">{stats.coins}</span></div><span className="font-pixel text-[5px] text-[#7db7b1]">{g.shopSoon}</span></div>
          {stats.activePotions.length > 0 && <div className="potion-stack" style={{ transform: `scale(${hudScale})`, transformOrigin: "top left" }}>{stats.activePotions.map((potion) => <div key={potion.type} className="potion-active font-pixel"><PixelSprite name={potionSprites[potion.type]} scale={2} /><div><strong>{potionNames[potion.type]}</strong><span>{Math.ceil(potion.time)}S</span></div></div>)}</div>}
        </section>

        <section className="combat-wave justify-self-center">
          <div className="font-pixel text-[10px] text-[#ffe2c4] sm:text-[12px]">{t.wave} {stats.wave}</div>
          <div className="mt-1 h-3 w-28 border-2 border-[#070305] bg-[#291018] sm:w-40"><div className="h-full bg-[#e0444d]" style={{ width: `${Math.max(0, Math.min(100, waveProgress * 100))}%` }} /></div>
          <div className="font-pixel mt-1 text-[6px] text-[#b78c91]">{stats.waveLeft} {t.enemiesLeft} · {formatTime(stats.time)}</div>
        </section>

        <section className="combat-panel justify-self-end text-right">
          <span className="hud-label">{t.score}</span>
          <strong className="font-pixel block text-[15px] text-white sm:text-[20px]">{stats.score.toLocaleString()}</strong>
          <div className="flex items-center justify-end gap-2"><span className="font-pixel text-[6px] text-[#b78c91]">{t.best} {best.toLocaleString()}</span><span className="combat-kills font-pixel">KO {stats.kills}</span></div>
          <div className="pointer-events-auto mt-1 flex justify-end gap-1"><button onClick={onPause} className="hud-icon" aria-label={t.pause}>II</button></div>
        </section>
      </div>

      {stats.combo > 1 && <div key={stats.combo} className="combat-combo anim-pop absolute left-1/2 top-24 -translate-x-1/2"><strong className="font-pixel text-shadow-pix">COMBO x{comboMult.toFixed(1)}</strong><span className="font-pixel">{stats.combo} {t.kills}</span><div className="combat-combo-track"><i style={{ width: `${stats.comboP * 100}%` }} /></div></div>}

      {stats.potionTutorial && <div className="potion-tutorial-backdrop pointer-events-auto"><div className="potion-tutorial">
        <strong>POCOES · EFEITOS</strong><span className="potion-health">VIDA: RECUPERA 2 CORACOES</span><span className="potion-strength">FORCA: +50% DANO · 8S</span><span className="potion-speed">VELOCIDADE: +45% MOVIMENTO · 8S</span><span className="potion-agility">AGILIDADE: -50% RECARGA DO DASH · 8S</span><div className="potion-tutorial-actions"><button onClick={() => onPotionDismiss(false)}>ENTENDI</button><button onClick={() => onPotionDismiss(true)}>ENTENDI E NAO MOSTRAR NOVAMENTE</button></div>
      </div></div>}
      {stats.mineTutorial && <div className="font-pixel absolute bottom-28 left-1/2 w-[min(90%,460px)] -translate-x-1/2 border-4 border-[#070305] bg-[#10282b]/95 px-4 py-3 text-center text-[7px] leading-5 text-[#ffd44a] shadow-[0_5px_0_#070305]">{t.mineTutorial}</div>}

      <div className="pointer-events-auto mx-auto flex max-w-full items-end justify-center gap-2 pb-1" style={{ transform: `scale(${hudScale})`, transformOrigin: "bottom center" }}>
        <button onClick={onDash} onPointerDown={moveDash} style={dashPos && isTouchPointer ? { position: "fixed", left: dashPos.x, top: dashPos.y, zIndex: 30 } : undefined} className={`dash-gauge dash-action mobile-dash-button ${stats.dashReady ? "is-ready" : ""}`} title={`${g.dash}: ${stats.dashReady ? t.ready : `${stats.dashCd.toFixed(1)}s`}`} aria-label={g.dash}>
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="#0b1215" stroke="#352029" strokeWidth="5" /><circle cx="26" cy="26" r="22" fill="none" stroke={stats.dashReady ? "#ffd44a" : "#e0444d"} strokeWidth="5" strokeDasharray={`${dashProgress * 138.23} 138.23`} /></svg>
          <PixelSprite name="player" scale={2} className={stats.dashReady ? "anim-bob" : "opacity-50"} />
          <strong>{stats.dashReady ? "DASH" : `${Math.ceil(stats.dashCd)}s`}</strong>
        </button>

        <div className="weapon-rail">{Array.from({ length: stats.perk === "bottomlessPocket" ? 6 : 4 }, (_, index) => index).map((index) => {
          const weapon = stats.weapons[index];
          const active = index === stats.activeSlot;
          if (!weapon) return <div key={index} className="weapon-slot is-empty"><span>{index + 1}</span></div>;
          const levels = stats.weaponLevels[weapon];
          const totalLevel = levels.damage + levels.speed + levels.range + levels.form;
          const label = weapon === "book" ? g.book : weapon === "bow" && levels.form > 0 ? g.automaticPistol : weapon === "hammer" && levels.form > 0 ? g.titanHammer : weapon === "staff" && levels.form > 0 ? g.necromancerStaff : weapon === "staff" ? g.staff : (t[weapon] as string);
          return <button key={index} onClick={() => onSelectSlot(index)} className={`weapon-slot ${active ? "is-active" : ""}`} title={label}>
            <span className="slot-key">{index + 1}</span><WeaponPreview weapon={weapon} form={levels.form} scale={active ? 2 : 1} className="weapon-slot-preview" /><span className="slot-name">{label}</span><span className="slot-level">{g.level}{totalLevel}{weapon === "book" ? ` · ${g[stats.magicType]}` : ""}</span>
          </button>;
        })}</div>
      </div>
    </div>
  );
}

