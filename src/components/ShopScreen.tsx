import { useEffect, useState } from "react";
import { isPowerUpAtLimit, type HudStats, type MagicType, type PowerUp, type Weapon, type WeaponUpgrade } from "../game/engine";
import { GAMEPLAY_TEXT, type GameplayStrings } from "../game/gameplayText";
import type { Language, Strings } from "../game/i18n";
import PixelSprite from "./PixelSprite";
import WeaponPreview from "./WeaponPreview";
import { CoinBox, PxButton, PxFrame } from "./PixelUi";
import { useMenuNavigation } from "./useMenuNavigation";

interface WeaponShopInfo { id: Weapon; cost: number; sellRefund: number; dmg: number; spd: number; range: number; }
const ALL_WEAPONS: WeaponShopInfo[] = [
  { id: "katana", cost: 25, sellRefund: 15, dmg: 2, spd: 5, range: 3 }, { id: "bow", cost: 35, sellRefund: 20, dmg: 3, spd: 3, range: 5 },
  { id: "hammer", cost: 55, sellRefund: 30, dmg: 5, spd: 1, range: 3 }, { id: "shield", cost: 35, sellRefund: 20, dmg: 0, spd: 4, range: 2 },
  { id: "mine", cost: 28, sellRefund: 16, dmg: 5, spd: 2, range: 4 }, { id: "book", cost: 65, sellRefund: 36, dmg: 4, spd: 3, range: 4 },
  { id: "staff", cost: 75, sellRefund: 42, dmg: 2, spd: 2, range: 4 },
];
const POWERUPS: Array<{ id: PowerUp; nameKey: keyof Strings; descKey: keyof Strings; cost: number; icon: string }> = [
  { id: "speed", nameKey: "speedUp", descKey: "speedDesc", cost: 20, icon: "icoSpeed" }, { id: "heart", nameKey: "heartUp", descKey: "heartDesc", cost: 30, icon: "icoHeart" },
  { id: "dashCd", nameKey: "dashCdUp", descKey: "dashCdDesc", cost: 25, icon: "icoClock" }, { id: "dashDist", nameKey: "dashDistUp", descKey: "dashDistDesc", cost: 25, icon: "icoDash" },
];
const UPGRADE_TYPES: WeaponUpgrade[] = ["damage", "speed", "range", "form"];
const MAGIC_TYPES: MagicType[] = ["fire", "ice", "poison", "water"];
type Tab = "menu" | "weapons" | "stats" | "upgrades";

function Price({ cost }: { cost: number }) { return <span className="inline-flex items-center gap-1"><PixelSprite name="coin" scale={1} />{cost}</span>; }
function weaponName(w: Weapon, t: Strings, g: GameplayStrings, form = 0) {
  if (w === "book") return g.book; if (w === "staff") return form ? g.necromancerStaff : g.staff;
  if (w === "bow" && form) return g.automaticPistol; if (w === "hammer" && form) return g.titanHammer; return t[w] as string;
}
function weaponDescription(w: Weapon, t: Strings, g: GameplayStrings) { return w === "book" ? g.bookDesc : w === "staff" ? g.staffDesc : t[`${w}Desc` as keyof Strings] as string; }
function upgradeCost(weapon: Weapon, kind: WeaponUpgrade, level: number) {
  if (kind === "form") return weapon === "hammer" ? 130 : weapon === "book" ? 120 : weapon === "katana" ? 115 : weapon === "staff" ? 110 : weapon === "bow" ? 105 : 100;
  return (kind === "damage" ? 20 : kind === "speed" ? 24 : 22) + level * 18;
}
function upgradeDescription(kind: WeaponUpgrade, weapon: Weapon, language: Language) {
  if (language !== "pt") return kind === "damage" ? "Increases this weapon's damage." : kind === "speed" ? "Reduces the time between attacks." : kind === "range" ? "Extends the weapon's reach." : `Changes ${weapon} into its evolved form.`;
  if (kind === "damage") return "Aumenta o dano causado por cada ataque.";
  if (kind === "speed") return "Reduz o tempo entre ataques e dispara mais vezes.";
  if (kind === "range") return "Aumenta a distância que o ataque alcança.";
  if (weapon === "katana") return "Transforma a espada em uma lâmina com golpes mais amplos.";
  if (weapon === "bow") return "Transforma o arco em uma pistola automática.";
  if (weapon === "hammer") return "Transforma o martelo em um martelo titã com impacto maior.";
  return weapon === "book" ? "Desbloqueia a forma evoluída do livro arcano." : "Transforma o cajado em um cajado necromante.";
}
function upgradeLabel(weapon: Weapon, kind: WeaponUpgrade, fallback: string) {
  const labels: Partial<Record<Weapon, Partial<Record<WeaponUpgrade, string>>>> = {
    katana: { damage: "CORTE", speed: "FLUIDEZ", range: "LÂMINA" }, bow: { damage: "IMPACTO", speed: "CADÊNCIA", range: "PRECISÃO" }, hammer: { damage: "IMPACTO", speed: "BALANÇO", range: "ONDA" },
    shield: { damage: "REFLEXÃO", speed: "RECARGA", range: "COBERTURA" }, mine: { damage: "EXPLOSÃO", speed: "ARMAMENTO", range: "RAIO" }, book: { damage: "POTÊNCIA", speed: "CONJURAÇÃO", range: "ÁREA" }, staff: { damage: "VÍNCULO", speed: "RITUAL", range: "ALCANCE" },
  };
  return labels[weapon]?.[kind] ?? fallback;
}
function Pips({ value, color }: { value: number; color: string }) { return <span className="inline-flex gap-[3px]">{Array.from({ length: 5 }).map((_, i) => <i key={i} className="h-2 w-2 border-2 border-[#070305]" style={{ background: i < value ? color : "#2a0e13" }} />)}</span>; }

export default function ShopScreen({ wave, stats, onBuyWeapon, onSellWeapon, onSelectSlot, onReorderWeapons, onBuyPowerUp, onUpgradeWeapon, onMagicType, onCloseShop, language, t }: {
  wave: number; stats: HudStats; onBuyWeapon: (w: Weapon, cost: number) => void; onSellWeapon: (slot: number, refund: number) => void; onSelectSlot: (slot: number) => void; onReorderWeapons: (from: number, to: number) => void; onBuyPowerUp: (p: PowerUp, cost: number) => void; onUpgradeWeapon: (w: Weapon, upgrade: WeaponUpgrade, cost: number) => void; onMagicType: (type: MagicType) => void; onCloseShop: () => void; language: Language; t: Strings;
}) {
  useMenuNavigation();
  const [tab, setTab] = useState<Tab>("menu"); const [selected, setSelected] = useState<Weapon>(stats.weapons[stats.activeSlot] ?? "katana"); const [dragged, setDragged] = useState<number | null>(null);
  const g = GAMEPLAY_TEXT[language]; const maxWeapons = stats.perk === "bottomlessPocket" ? 6 : 4; const info = ALL_WEAPONS.find((item) => item.id === selected) ?? ALL_WEAPONS[0]; const selectedIndex = stats.weapons.indexOf(selected); const owned = selectedIndex >= 0; const levels = stats.weaponLevels[selected];
  const select = (weapon: Weapon) => setSelected(weapon);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTab("menu");
      if (tab === "menu" && event.key === "1") setTab("weapons");
      if (tab === "menu" && event.key === "2") setTab("stats");
      if (tab === "menu" && event.key === "3") setTab("upgrades");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tab]);
  useEffect(() => {
    if (tab === "upgrades" && !stats.weapons.includes(selected)) setSelected(stats.weapons[stats.activeSlot] ?? stats.weapons[0] ?? "katana");
  }, [stats.activeSlot, stats.weapons, selected, tab]);
  const renderWeapon = (weapon: Weapon) => { const index = stats.weapons.indexOf(weapon); return <button key={weapon} onClick={() => select(weapon)} className={`pxb pxb-menu flex min-h-12 items-center gap-2 !py-2 text-left ${selected === weapon ? "is-active" : ""}`}><WeaponPreview weapon={weapon} form={stats.weaponLevels[weapon].form} scale={1} className="shop-weapon-icon" /><span className="truncate font-pixel text-[7px]">{weaponName(weapon, t, g, stats.weaponLevels[weapon].form)}</span>{index >= 0 && <span className="ml-auto bg-[#ffd44a] px-1 text-[6px] text-[#351c00]">{index + 1}</span>}</button>; };
  const renderUpgrade = (kind: WeaponUpgrade) => { const level = levels[kind]; const max = kind === "form" ? 1 : 3; const allowed = kind !== "form" || ["katana", "bow", "hammer", "book", "staff"].includes(selected); if (!allowed) return <div key={kind} className="px-inset p-3 font-pixel text-[6px] leading-4 text-[#6c3a42]">{g.formLocked}</div>; const cost = upgradeCost(selected, kind, level); return <div key={kind} className="px-inset p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><strong className="font-pixel text-[7px] text-[#ffe2c4]">{upgradeLabel(selected, kind, g[kind])}</strong><p className="mt-2 font-pixel text-[6px] leading-4 text-[#a9c3be]">{upgradeDescription(kind, selected, language)}</p><div className="mt-2 flex gap-1">{Array.from({ length: max }).map((_, i) => <i key={i} className={`h-2 w-5 border-2 border-[#070305] ${i < level ? "bg-[#e0444d]" : "bg-[#2a0e13]"}`} />)}</div></div><PxButton tone="red" disabled={level >= max || stats.coins < cost} onClick={() => onUpgradeWeapon(selected, kind, cost)} className="px-2 py-2 text-[6px]">{level >= max ? g.max : <Price cost={cost} />}</PxButton></div></div>; };

  return <div className="px-backdrop absolute inset-0 z-30 flex items-center justify-center overflow-y-auto p-2 sm:p-5"><PxFrame title={t.waveClearedTitle.replace("{wave}", String(wave))} icon="icoTrophy" className="shop-frame anim-pop relative my-auto flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden p-3 pt-10 sm:p-5 sm:pt-11">
    <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2">{tab === "menu" ? <strong className="font-pixel text-[8px] text-[#ffd44a]">ESCOLHA UMA CATEGORIA</strong> : <button className="shop-tab" onClick={() => setTab("menu")}>◀ VOLTAR</button>}</div><CoinBox coins={stats.coins} /></div><div className="px-divider my-3" />
    {tab === "menu" && <div className="grid flex-1 content-center gap-3 sm:grid-cols-3"><button className="shop-category" onClick={() => setTab("weapons")}><strong>ARMAS</strong><span>Compre, venda e organize seus slots.</span></button><button className="shop-category" onClick={() => setTab("stats")}><strong>ESTATÍSTICAS</strong><span>Melhore vida, velocidade e dash.</span></button><button className="shop-category" onClick={() => setTab("upgrades")}><strong>UPGRADES</strong><span>Evolua apenas as armas possuídas.</span></button></div>}
    {tab === "weapons" && <div className="shop-layout scrollbar-thin grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[1fr_1.2fr]"><div className="flex min-w-0 flex-col gap-2"><div className="font-pixel text-[7px] text-[#ffd44a]">{t.weaponsTitle}</div><div className="grid gap-1 sm:grid-cols-2">{ALL_WEAPONS.map((item) => renderWeapon(item.id))}</div><div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px] text-[#ffd44a]">SLOTS · ARRASTE PARA TROCAR</div><div className="grid grid-cols-4 gap-1 sm:grid-cols-6">{Array.from({ length: maxWeapons }).map((_, index) => { const weapon = stats.weapons[index]; return weapon ? <button key={weapon} draggable onDragStart={() => setDragged(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged !== null) onReorderWeapons(dragged, index); setDragged(null); }} onDragEnd={() => setDragged(null)} onClick={() => { onSelectSlot(index); select(weapon); }} className={`px-tile flex h-16 min-w-0 cursor-grab flex-col items-center justify-center gap-1 p-1 ${index === stats.activeSlot ? "outline outline-2 outline-[#ffd44a]" : ""}`}><WeaponPreview weapon={weapon} form={stats.weaponLevels[weapon].form} scale={1} /><span className="font-pixel text-[6px]">{index + 1}</span></button> : <div key={index} className="px-empty flex h-16 items-center justify-center font-pixel text-[7px] text-[#6c3a42]">{index + 1}</div>; })}</div></div></div><div className="flex min-w-0 flex-col gap-2"><div className="px-inset relative flex min-h-40 items-center justify-center overflow-hidden"><WeaponPreview weapon={selected} scale={3} angle={-30} form={levels.form} /><span className="font-pixel absolute left-3 top-3 text-[8px] text-[#ffd44a]">{weaponName(selected, t, g, levels.form)}</span></div><div className="px-inset p-3"><p className="font-pixel text-[7px] leading-5 text-[#d8a9a0]">{weaponDescription(selected, t, g)}</p><div className="mt-3 grid grid-cols-3 gap-2 text-[6px] text-[#a35662]"><span>{t.dmg}<Pips value={Math.min(5, info.dmg + levels.damage)} color="#e0444d" /></span><span>{t.spd}<Pips value={Math.min(5, info.spd + levels.speed)} color="#ffd44a" /></span><span>{t.range}<Pips value={Math.min(5, info.range + levels.range)} color="#62b7c8" /></span></div></div>{owned ? <PxButton tone="dark" disabled={stats.weapons.length <= 1} onClick={() => onSellWeapon(selectedIndex, info.sellRefund)} className="w-full py-3 text-[7px]">{t.sell} <Price cost={info.sellRefund} /></PxButton> : <PxButton tone="gold" disabled={stats.coins < info.cost || stats.weapons.length >= maxWeapons} onClick={() => onBuyWeapon(selected, info.cost)} className="w-full py-3 text-[8px]">{stats.weapons.length >= maxWeapons ? t.maxSlots : <>{t.buy} <Price cost={info.cost} /></>}</PxButton>}</div></div>}
    {tab === "upgrades" && <div className="shop-layout scrollbar-thin grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[220px_1fr]"><div className="flex min-w-0 flex-col gap-2"><div className="font-pixel text-[7px] text-[#ffd44a]">ARMAS POSSUÍDAS</div>{stats.weapons.map(renderWeapon)}</div><div className="flex min-w-0 flex-col gap-2"><div className="px-inset flex items-center gap-3 p-3"><WeaponPreview weapon={selected} form={levels.form} scale={2} /><div><strong className="font-pixel text-[8px] text-[#ffd44a]">{weaponName(selected, t, g, levels.form)}</strong><p className="mt-2 font-pixel text-[6px] leading-4 text-[#a9c3be]">{weaponDescription(selected, t, g)}</p></div></div>{UPGRADE_TYPES.map(renderUpgrade)}{selected === "book" && <div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px] text-[#ffd44a]">{g.magic}</div><div className="grid grid-cols-2 gap-1">{MAGIC_TYPES.map((magic) => <button key={magic} onClick={() => onMagicType(magic)} className={`magic-option ${stats.magicType === magic ? "is-active" : ""}`}><strong>{g[magic]}</strong><span>{g[`${magic}Desc` as keyof typeof g]}</span></button>)}</div></div>}</div></div>}
    {tab === "stats" && <div className="scrollbar-thin grid min-h-0 flex-1 gap-3 overflow-y-auto md:grid-cols-[.8fr_1.2fr]"><div className="px-inset p-4"><div className="font-pixel mb-3 text-[9px] text-[#ffd44a]">{t.yourStats}</div><div className="grid grid-cols-2 gap-2 font-pixel text-[7px]"><div className="stat-readout"><span>{t.statHearts}</span><strong>{stats.hp}/{stats.maxHp}</strong></div><div className="stat-readout"><span>{t.statSpeed}</span><strong>{108 + stats.speedBonus}</strong></div><div className="stat-readout"><span>{t.statDashCd}</span><strong>{stats.dashMax.toFixed(1)}s</strong></div><div className="stat-readout"><span>{t.statDashDist}</span><strong>x{stats.dashSpeedMult.toFixed(2)}</strong></div></div></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{POWERUPS.map((power) => { const maxed = isPowerUpAtLimit(stats, power.id, stats.difficulty); return <div key={power.id} className="px-inset flex flex-col p-3"><div className="flex items-center gap-2"><PixelSprite name={power.icon} scale={2} /><strong className="font-pixel text-[7px]">{t[power.nameKey] as string}</strong></div><p className="font-pixel my-2 grow text-[6px] leading-4 text-[#a35662]">{t[power.descKey] as string}</p><PxButton tone="red" disabled={maxed || stats.coins < power.cost} onClick={() => onBuyPowerUp(power.id, power.cost)} className="py-2 text-[7px]">{maxed ? g.max : <>{g.improve} <Price cost={power.cost} /></>}</PxButton></div>; })}</div></div>}
    <div className="px-divider my-3" /><PxButton tone="green" onClick={onCloseShop} className="w-full py-3 text-[9px] sm:text-[10px]">▶ {t.nextWave} · {t.wave} {wave + 1}</PxButton>
  </PxFrame></div>;
}