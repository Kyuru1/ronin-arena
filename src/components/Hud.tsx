import { useRef, useState } from "react";
import { GAMEPLAY_TEXT, type GameplayStrings } from "../game/gameplayText";
import type { HudStats } from "../game/engine";
import { RACE_CONFIG } from "../game/races";
import type { Language, Strings } from "../game/i18n";
import { localizedWeapon } from "../game/localizedContent";
import { formatTime } from "../game/storage";
import PixelSprite from "./PixelSprite";
import WeaponPreview from "./WeaponPreview";

function Heart({ filled }: { filled: boolean }) {
  return <svg viewBox="0 0 7 6" className="h-7 w-9 sm:h-8 sm:w-10" shapeRendering="crispEdges"><g fill={filled ? "#ff4353" : "#2a0e13"}><rect x="1" y="0" width="2" height="1" /><rect x="4" y="0" width="2" height="1" /><rect x="0" y="1" width="7" height="2" /><rect x="1" y="3" width="5" height="1" /><rect x="2" y="4" width="3" height="1" /><rect x="3" y="5" width="1" height="1" /></g>{filled && <rect x="1" y="1" width="1" height="1" fill="#ffd2b5" />}</svg>;
}

type HudButtonId = "dash" | "ability";
type HudPosition = { x: number; y: number };
type HudPositions = Partial<Record<HudButtonId, HudPosition>>;

const HUD_POSITION_KEY = "ronin.hud.positions.v1";
const HUD_HINTS_KEY = "ronin.hud.hints.v1";

export default function Hud({ stats, best, onPause, onSelectSlot, onDash, onRaceAbility, raceAbilityBinding, onSpectate, onPotionDismiss, hudScale, hudEditMode, showContextHints, hudDensity, onHudEditDone, language, t, isTouch }: {
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
  hudEditMode: boolean;
  showContextHints: boolean;
  hudDensity: "compact" | "expanded";
  onHudEditDone: () => void;
  language: Language;
  t: Strings;
  isTouch: boolean;
}) {
  const profile = isTouch ? "mobile" : "desktop";
  const [positions, setPositions] = useState<Record<string, HudPositions>>(() => {
    try { return JSON.parse(localStorage.getItem(HUD_POSITION_KEY) ?? "{}") as Record<string, HudPositions>; }
    catch { return {}; }
  });
  const dragged = useRef<HudButtonId | null>(null);
  const [dismissedHints, setDismissedHints] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(HUD_HINTS_KEY) ?? "[]") as string[]; }
    catch { return []; }
  });
  const buttonSize = (id: HudButtonId) => id === "ability" ? { width: isTouch ? 96 : 116, height: isTouch ? 80 : 90 } : { width: isTouch ? 68 : 70, height: isTouch ? 68 : 70 };
  const clampPosition = (id: HudButtonId, x: number, y: number): HudPosition => {
    const size = buttonSize(id);
    return { x: Math.max(8, Math.min(window.innerWidth - size.width - 8, x)), y: Math.max(70, Math.min(window.innerHeight - size.height - 8, y)) };
  };
  const defaultPosition = (id: HudButtonId): HudPosition => {
    const size = buttonSize(id);
    if (id === "dash") return isTouch ? { x: window.innerWidth - size.width - 12, y: window.innerHeight - size.height - 104 } : { x: 12, y: window.innerHeight - size.height - buttonSize("ability").height - 28 };
    return { x: 12, y: window.innerHeight - size.height - 12 };
  };
  const positionFor = (id: HudButtonId) => clampPosition(id, positions[profile]?.[id]?.x ?? defaultPosition(id).x, positions[profile]?.[id]?.y ?? defaultPosition(id).y);
  const resetPositions = () => {
    setPositions((current) => {
      const updated = { ...current };
      delete updated[profile];
      try { localStorage.setItem(HUD_POSITION_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  };
  const dismissHint = (id: string) => {
    setDismissedHints((current) => {
      if (current.includes(id)) return current;
      const updated = [...current, id];
      try { localStorage.setItem(HUD_HINTS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  };
  const moveButton = (id: HudButtonId) => (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!hudEditMode) return;
    event.preventDefault();
    event.stopPropagation();
    dragged.current = null;
    const start = positionFor(id);
    const startX = event.clientX;
    const startY = event.clientY;
    let position = start;
    const move = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return;
      const dx = next.clientX - startX;
      const dy = next.clientY - startY;
      if (Math.hypot(dx, dy) > 4) dragged.current = id;
      const raw = clampPosition(id, start.x + dx, start.y + dy);
      position = clampPosition(id, Math.round(raw.x / 8) * 8, Math.round(raw.y / 8) * 8);
      setPositions((current) => ({ ...current, [profile]: { ...current[profile], [id]: position } }));
      next.preventDefault();
    };
    const end = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      setPositions((current) => {
        const updated = { ...current, [profile]: { ...current[profile], [id]: position } };
        try { localStorage.setItem(HUD_POSITION_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const activateDash = () => {
    if (hudEditMode || dragged.current === "dash") { dragged.current = null; return; }
    dismissHint("dash");
    onDash();
  };
  const activateAbility = () => {
    if (hudEditMode || dragged.current === "ability") { dragged.current = null; return; }
    dismissHint("ability");
    onRaceAbility();
  };
  const g = GAMEPLAY_TEXT[language];
  const comboMult = Math.min(1 + stats.combo * 0.12, 6);
  const dashProgress = stats.dashReady ? 1 : 1 - stats.dashCd / stats.dashMax;
  const waveProgress = stats.waveTotal ? 1 - stats.waveLeft / stats.waveTotal : 0;
  const healthSegments = Math.min(8, Math.max(1, Math.ceil(stats.maxHp)));
  const filledHeartSegments = Math.ceil((stats.hp / stats.maxHp) * healthSegments);
  const potionText = {
    pt:{health:"VIDA",strength:"FORÇA",speed:"VELOCIDADE",agility:"AGILIDADE",title:"POÇÕES · EFEITOS",healthDesc:"VIDA: RECUPERA 2 CORAÇÕES",strengthDesc:"FORÇA: +50% DANO · 8S",speedDesc:"VELOCIDADE: +45% MOVIMENTO · 8S",agilityDesc:"AGILIDADE: -50% RECARGA DO DASH · 8S",ok:"ENTENDI",hide:"ENTENDI E NÃO MOSTRAR NOVAMENTE"},
    en:{health:"HEALTH",strength:"STRENGTH",speed:"SPEED",agility:"AGILITY",title:"POTIONS · EFFECTS",healthDesc:"HEALTH: RESTORES 2 HEARTS",strengthDesc:"STRENGTH: +50% DAMAGE · 8S",speedDesc:"SPEED: +45% MOVEMENT · 8S",agilityDesc:"AGILITY: -50% DASH COOLDOWN · 8S",ok:"GOT IT",hide:"GOT IT · DO NOT SHOW AGAIN"},
    fr:{health:"VIE",strength:"FORCE",speed:"VITESSE",agility:"AGILITÉ",title:"POTIONS · EFFETS",healthDesc:"VIE : RÉCUPÈRE 2 CŒURS",strengthDesc:"FORCE : +50% DÉGÂTS · 8S",speedDesc:"VITESSE : +45% MOUVEMENT · 8S",agilityDesc:"AGILITÉ : -50% RECHARGE DASH · 8S",ok:"COMPRIS",hide:"COMPRIS · NE PLUS AFFICHER"},
    de:{health:"LEBEN",strength:"STÄRKE",speed:"TEMPO",agility:"AGILITÄT",title:"TRÄNKE · EFFEKTE",healthDesc:"LEBEN: STELLT 2 HERZEN HER",strengthDesc:"STÄRKE: +50% SCHADEN · 8S",speedDesc:"TEMPO: +45% BEWEGUNG · 8S",agilityDesc:"AGILITÄT: -50% DASH-AUFLADUNG · 8S",ok:"VERSTANDEN",hide:"VERSTANDEN · NICHT MEHR ZEIGEN"},
    zh:{health:"生命",strength:"力量",speed:"速度",agility:"敏捷",title:"药水·效果",healthDesc:"生命：恢复2颗心",strengthDesc:"力量：伤害+50%·8秒",speedDesc:"速度：移动+45%·8秒",agilityDesc:"敏捷：冲刺冷却-50%·8秒",ok:"知道了",hide:"知道了·不再显示"},
  }[language];
  const potionNames = potionText;
  const potionSprites = { health: "potionHealth", strength: "potionStrength", speed: "potionSpeed", agility: "potionAgility" } as const;
  const race = RACE_CONFIG[stats.raceId];
  const raceAbilityReady = stats.raceAbilityCd <= 0 && stats.raceAbilityT <= 0 && !stats.isSpectating;
  const raceAbilityState = stats.raceAbilityT > 0 ? `${stats.raceAbilityT.toFixed(1)}s` : raceAbilityReady ? t.ready : `${Math.ceil(stats.raceAbilityCd)}s`;
  const activeWeapon = stats.weapons[stats.activeSlot];
  const activeLevels = activeWeapon ? stats.weaponLevels[activeWeapon] : null;
  const activeWeaponName = activeWeapon ? (localizedWeapon(language, activeWeapon)?.[0] ?? weaponFallback(activeWeapon, activeLevels?.form ?? 0, g, t)) : "—";
  const hint = !showContextHints || hudEditMode || stats.isSpectating ? null
    : stats.wave === 1 && stats.time < 5 && !dismissedHints.includes("move") ? { id: "move", text: isTouch ? "MOVIMENTO · ARRASTE O LADO ESQUERDO" : "MOVIMENTO · USE WASD OU AS SETAS" }
    : stats.wave === 1 && stats.time < 11 && !dismissedHints.includes("attack") ? { id: "attack", text: isTouch ? "MIRE E ATAQUE · ARRASTE O LADO DIREITO" : "MIRE COM O MOUSE · SEGURE O CLIQUE PARA ATACAR" }
    : stats.dashReady && !dismissedHints.includes("dash") ? { id: "dash", text: isTouch ? "DASH PRONTO · TOQUE NO BOTÃO À DIREITA" : "DASH PRONTO · USE SHIFT PARA ESCAPAR" }
    : raceAbilityReady && stats.time > 12 && !dismissedHints.includes("ability") ? { id: "ability", text: `HABILIDADE PRONTA · USE ${raceAbilityBinding}` }
    : stats.weapons.length > 1 && !dismissedHints.includes("weapons") ? { id: "weapons", text: isTouch ? "TROQUE DE ARMA · TOQUE NOS SLOTS" : "TROQUE DE ARMA · Q / E OU NÚMEROS" }
    : null;

  return (
    <div className={`arena-hud ${isTouch ? "is-touch" : ""} pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2 sm:p-3 hud-${hudDensity} ${hudEditMode ? "hud-is-editing" : ""}`}>
      <div className="combat-topbar grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <section className="combat-panel combat-health justify-self-start">
          <div className="health-caption"><span>{language === "pt" ? "VIDA" : "HEALTH"}</span><strong>{Number(stats.hp.toFixed(1))} / {stats.maxHp}</strong></div>
          {stats.maxHp <= 8 ? <div className="health-hearts">{Array.from({ length: healthSegments }).map((_, index) => <Heart key={index} filled={index < filledHeartSegments} />)}</div> : <div className="health-track" role="meter" aria-label={language === "pt" ? "Vida" : "Health"} aria-valuemin={0} aria-valuemax={stats.maxHp} aria-valuenow={stats.hp}><i style={{ width: `${Math.max(0, Math.min(100, stats.hp / stats.maxHp * 100))}%` }} /></div>}
          {stats.activePotions.length > 0 && <div className="potion-stack potion-stack-fly" style={{ transform: `scale(${hudScale})`, transformOrigin: "top left" }}>{stats.activePotions.map((potion) => <div key={potion.type} className="potion-active font-pixel"><PixelSprite name={potionSprites[potion.type]} scale={2} /><div><strong>{potionNames[potion.type]}</strong><span>{Math.ceil(potion.time)}S</span></div></div>)}</div>}
        </section>

        <section className="combat-wave justify-self-center">
          <div className="font-pixel text-[10px] text-[#ffe2c4] sm:text-[12px]">{t.wave} {stats.wave}</div>
          <div className="mt-1 h-3 w-28 border-2 border-[#070305] bg-[#291018] sm:w-40"><div className="h-full bg-[#e0444d]" style={{ width: `${Math.max(0, Math.min(100, waveProgress * 100))}%` }} /></div>

          <div className="hud-wave-detail font-pixel mt-1 text-[6px] text-[#ffe2c4]"><span>{stats.waveLeft} {t.enemiesLeft}</span><span>{formatTime(stats.time)}</span></div>
        </section>

        <section className="combat-panel combat-score justify-self-end text-right">
          <div className="hud-wallet"><PixelSprite name="coin" scale={2} /><strong>{Math.round(stats.coins)}</strong><span>{language === "pt" ? "MOEDAS" : "COINS"}</span></div><div className="hud-score-line">{stats.score.toLocaleString()} {language === "pt" ? "pontos" : "points"}<span> · {language === "pt" ? "Recorde" : "Best"} {best.toLocaleString()}</span></div>
          <div className="flex items-center justify-end gap-2"><span className="combat-kills font-pixel">ABATES {stats.kills}</span><div className="pointer-events-auto"><button onClick={onPause} className="hud-icon text-[12px] sm:text-[15px]" aria-label={t.pause}>Ⅱ</button></div></div>
        </section>
      {stats.isSpectating && <div className="pointer-events-auto absolute left-1/2 top-20 flex -translate-x-1/2 items-center gap-3 border-2 border-[#070305] bg-[#160b12]/95 px-3 py-2 font-pixel text-[7px] text-[#ffd44a]">
        <button onClick={() => onSpectate(-1)} aria-label="Jogador anterior">◀</button>
        <span>ESPECTANDO {stats.spectatedName ?? "ALIADO"}</span>
        <button onClick={() => onSpectate(1)} aria-label="Próximo jogador">▶</button>
      </div>}

      </div>

      {isTouch && <div className="mobile-aim-assist-label">AUXÍLIO DE MIRA · ALVO FIXADO</div>}
      {hint && <div className="hud-context-hint"><span>{hint.text}</span><button onClick={() => dismissHint(hint.id)} aria-label="Fechar dica">×</button></div>}
      {hudEditMode && <div className="hud-edit-panel"><strong>ARRASTE OS BOTÕES DA HUD</strong><button onClick={resetPositions}>RESTAURAR PADRÃO</button><button onClick={onHudEditDone}>CONCLUIR</button></div>}
      <button onClick={activateAbility} onPointerDown={moveButton("ability")} disabled={!hudEditMode && !raceAbilityReady} className={`hud-race-ability ${raceAbilityReady ? "is-ready" : ""} pointer-events-auto fixed flex h-[70px] w-[92px] flex-col items-center justify-center gap-1 border-4 bg-[#0b1215] font-pixel shadow-[0_4px_0_#070305] ${hudEditMode ? "is-editing" : ""} ${stats.raceAbilityT > 0 ? "anim-pulse" : ""}`} style={{ left: positionFor("ability").x, top: positionFor("ability").y, borderColor: race.color, backgroundColor: `${race.color}20` }} title={`${race.ability.name}: ${race.ability.description} · ${raceAbilityBinding}`} aria-label={`${race.ability.name}: ${raceAbilityState}. ${race.ability.description}. ${raceAbilityBinding}`}><strong className="text-center text-[6px]" style={{ color: race.color }}>{race.ability.name}</strong><span className="text-[15px]" style={{ color: race.color }}>{race.icon}</span><span className="text-[7px] text-[#ff6a68]">{raceAbilityState}</span><span className="text-[5px] text-[#d8c2b8]">{raceAbilityBinding}</span></button>
      {!isTouch && <button onClick={activateDash} onPointerDown={moveButton("dash")} style={{ left: positionFor("dash").x, top: positionFor("dash").y }} className={`pointer-events-auto fixed dash-gauge dash-action desktop-dash-button ${hudEditMode ? "is-editing" : ""} ${stats.dashReady ? "is-ready" : ""}`} title={`${g.dash}: ${stats.dashReady ? t.ready : `${stats.dashCd.toFixed(1)}s`}`} aria-label={g.dash}>
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="#0b1215" stroke="#352029" strokeWidth="5" /><circle cx="26" cy="26" r="22" fill="none" stroke={stats.dashReady ? "#ffd44a" : "#e0444d"} strokeWidth="5" strokeDasharray={`${dashProgress * 138.23} 138.23`} /></svg>
        <PixelSprite name="player" scale={2} className={stats.dashReady ? "anim-bob" : "dash-player-recharging"} style={{ "--dash-progress": dashProgress } as React.CSSProperties} />
        <strong>{stats.dashReady ? "DASH" : `${Math.ceil(stats.dashCd)}s`}</strong>
      </button>}

      {stats.combo > 1 && <div key={stats.combo} className="combat-combo anim-pop absolute left-1/2 top-24 -translate-x-1/2"><strong className="font-pixel text-shadow-pix">COMBO x{comboMult.toFixed(1)}</strong><span className="font-pixel">{stats.combo} {t.kills}</span><div className="combat-combo-track"><i style={{ width: `${stats.comboP * 100}%` }} /></div></div>}

      {stats.potionTutorial && <div className="potion-tutorial-backdrop pointer-events-auto"><div className="potion-tutorial">
        <strong>{potionText.title}</strong><span className="potion-health">{potionText.healthDesc}</span><span className="potion-strength">{potionText.strengthDesc}</span><span className="potion-speed">{potionText.speedDesc}</span><span className="potion-agility">{potionText.agilityDesc}</span><div className="potion-tutorial-actions"><button onClick={() => onPotionDismiss(false)}>{potionText.ok}</button><button onClick={() => onPotionDismiss(true)}>{potionText.hide}</button></div>
      </div></div>}
      {stats.mineTutorial && <div className="font-pixel absolute bottom-28 left-1/2 w-[min(90%,460px)] -translate-x-1/2 border-4 border-[#070305] bg-[#10282b]/95 px-4 py-3 text-center text-[7px] leading-5 text-[#ffd44a] shadow-[0_5px_0_#070305]">{t.mineTutorial}</div>}

      <div className="hud-arsenal-position pointer-events-auto mx-auto flex max-w-full items-end justify-center gap-2 pb-1">
        {isTouch && <button onClick={activateDash} onPointerDown={moveButton("dash")} style={{ position: "fixed", left: positionFor("dash").x, top: positionFor("dash").y, zIndex: 30 }} className={`dash-gauge dash-action mobile-dash-button ${hudEditMode ? "is-editing" : ""} ${stats.dashReady ? "is-ready" : ""}`} title={`${g.dash}: ${stats.dashReady ? t.ready : `${stats.dashCd.toFixed(1)}s`}`} aria-label={g.dash}>
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="#0b1215" stroke="#352029" strokeWidth="5" /><circle cx="26" cy="26" r="22" fill="none" stroke={stats.dashReady ? "#ffd44a" : "#e0444d"} strokeWidth="5" strokeDasharray={`${dashProgress * 138.23} 138.23`} /></svg>
          <PixelSprite name="player" scale={2} className={stats.dashReady ? "anim-bob" : "dash-player-recharging"} style={{ "--dash-progress": dashProgress } as React.CSSProperties} />
          <strong>{stats.dashReady ? "DASH" : `${Math.ceil(stats.dashCd)}s`}</strong>
        </button>}

        <div className="weapon-hud-group" style={{ zoom: isTouch ? Math.min(hudScale, 1) : Math.max(.85, hudScale) }}><div className="active-weapon-readout"><span>ARMA ATIVA</span><strong>{activeWeaponName}</strong><small>{isTouch ? "TOQUE PARA TROCAR" : `Q / E · 1–${stats.maxWeaponSlots}`}</small></div><div className="weapon-rail">{Array.from({ length: stats.maxWeaponSlots }, (_, index) => index).map((index) => {
          const weapon = stats.weapons[index];
          const active = index === stats.activeSlot;
          if (!weapon) return <div key={index} className="weapon-slot is-empty"><span>{index + 1}</span></div>;
          const levels = stats.weaponLevels[weapon];
          const totalLevel = levels.damage + levels.speed + levels.range + levels.form;
          const label = localizedWeapon(language, weapon)?.[0] ?? (weapon === "book" ? g.book : weapon === "bow" && levels.form > 0 ? g.automaticPistol : weapon === "hammer" && levels.form > 0 ? g.titanHammer : weapon === "staff" && levels.form > 0 ? g.necromancerStaff : weapon === "staff" ? g.staff : (t[weapon as keyof Strings] as string));
          return <button key={index} onClick={() => { dismissHint("weapons"); onSelectSlot(index); }} className={`weapon-slot ${active ? "is-active" : ""}`} title={label} aria-label={`${index + 1}: ${label}`} aria-pressed={active}>
            <span className="slot-key">{index + 1}</span><WeaponPreview weapon={weapon} form={levels.form} scale={active ? 2 : 1} className="weapon-slot-preview" /><span className="slot-name">{label}</span><span className="slot-level">{g.level}{totalLevel}{weapon === "book" ? ` · ${g[stats.magicType]}` : ""}</span>
          </button>;
        })}</div></div>
      </div>
    </div>
  );
}

function weaponFallback(weapon: string, form: number, g: GameplayStrings, t: Strings): string {
  if (weapon === "book") return g.book;
  if (weapon === "bow" && form > 0) return g.automaticPistol;
  if (weapon === "hammer" && form > 0) return g.titanHammer;
  if (weapon === "staff") return form > 0 ? g.necromancerStaff : g.staff;
  return String(t[weapon as keyof Strings] ?? weapon).toUpperCase();
}





