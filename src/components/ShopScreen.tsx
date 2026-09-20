import { useState } from "react";
import { isPowerUpAtLimit, type HudStats, type MagicType, type PowerUp, type Weapon, type WeaponUpgrade } from "../game/engine";
import { GAMEPLAY_TEXT, type GameplayStrings } from "../game/gameplayText";
import type { Language, Strings } from "../game/i18n";
import PixelSprite from "./PixelSprite";
import WeaponPreview from "./WeaponPreview";
import { CoinBox, PxButton, PxFrame } from "./PixelUi";

export const WEAPON_ICON: Record<Weapon, string> = {
  katana: "icoKatana",
  bow: "icoBow",
  hammer: "icoHammer",
  shield: "icoShield",
  mine: "icoMine",
  book: "icoBook",
};

interface WeaponShopInfo {
  id: Weapon;
  cost: number;
  sellRefund: number;
  dmg: number;
  spd: number;
  range: number;
}

const ALL_WEAPONS: WeaponShopInfo[] = [
  { id: "katana", cost: 25, sellRefund: 15, dmg: 2, spd: 5, range: 3 },
  { id: "bow", cost: 35, sellRefund: 20, dmg: 3, spd: 3, range: 5 },
  { id: "hammer", cost: 55, sellRefund: 30, dmg: 5, spd: 1, range: 3 },
  { id: "shield", cost: 35, sellRefund: 20, dmg: 0, spd: 4, range: 2 },
  { id: "mine", cost: 28, sellRefund: 16, dmg: 5, spd: 2, range: 4 },
  { id: "book", cost: 65, sellRefund: 36, dmg: 4, spd: 3, range: 4 },
];

const ALL_POWERUPS: Array<{ id: PowerUp; nameKey: keyof Strings; descKey: keyof Strings; cost: number; icon: string }> = [
  { id: "speed", nameKey: "speedUp", descKey: "speedDesc", cost: 20, icon: "icoSpeed" },
  { id: "heart", nameKey: "heartUp", descKey: "heartDesc", cost: 30, icon: "icoHeart" },
  { id: "dashCd", nameKey: "dashCdUp", descKey: "dashCdDesc", cost: 25, icon: "icoClock" },
  { id: "dashDist", nameKey: "dashDistUp", descKey: "dashDistDesc", cost: 25, icon: "icoDash" },
];

const MAGIC_TYPES: MagicType[] = ["fire", "ice", "poison", "water"];
const UPGRADE_TYPES: WeaponUpgrade[] = ["damage", "speed", "range", "form"];

function Price({ cost }: { cost: number }) {
  return <span className="inline-flex items-center gap-1"><PixelSprite name="coin" scale={1} />{cost}</span>;
}

function Pips({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return <span className="inline-flex gap-[3px]">{Array.from({ length: max }).map((_, i) => (
    <span key={i} className="h-2 w-2 border-2 border-[#070305]" style={{ background: i < value ? color : "#2a0e13" }} />
  ))}</span>;
}

function weaponName(w: Weapon, t: Strings, g: GameplayStrings) {
  return w === "book" ? g.book : (t[w] as string);
}

function weaponDescription(w: Weapon, t: Strings, g: GameplayStrings) {
  if (w === "book") return g.bookDesc;
  return t[`${w}Desc` as keyof Strings] as string;
}

function upgradeCost(weapon: Weapon, kind: WeaponUpgrade, level: number) {
  if (kind === "form") return weapon === "hammer" ? 130 : 100;
  const base = kind === "damage" ? 20 : kind === "speed" ? 24 : 22;
  return base + level * 18;
}

type Tab = "weapons" | "stats";

export default function ShopScreen({
  wave, stats, onBuyWeapon, onSellWeapon, onSelectSlot, onBuyPowerUp, onUpgradeWeapon, onMagicType, onCloseShop, language, t,
}: {
  wave: number;
  stats: HudStats;
  onBuyWeapon: (w: Weapon, cost: number) => void;
  onSellWeapon: (slotIndex: number, refund: number) => void;
  onSelectSlot: (slotIndex: number) => void;
  onBuyPowerUp: (p: PowerUp, cost: number) => void;
  onUpgradeWeapon: (w: Weapon, upgrade: WeaponUpgrade, cost: number) => void;
  onMagicType: (type: MagicType) => void;
  onCloseShop: () => void;
  language: Language;
  t: Strings;
}) {
  const [tab, setTab] = useState<Tab>("weapons");
  const [selected, setSelected] = useState<Weapon>(stats.weapons[stats.activeSlot] ?? "katana");
  const g = GAMEPLAY_TEXT[language];
  const info = ALL_WEAPONS.find((weapon) => weapon.id === selected) ?? ALL_WEAPONS[0];
  const ownedIndex = stats.weapons.indexOf(selected);
  const owned = ownedIndex >= 0;
  const active = ownedIndex === stats.activeSlot;
  const full = stats.weapons.length >= 4;
  const levels = stats.weaponLevels[selected];
  const isPowerUpMaxed = (power: PowerUp) => isPowerUpAtLimit(stats, power);

  return (
    <div className="px-backdrop absolute inset-0 z-30 flex items-center justify-center overflow-y-auto p-2 sm:p-5">
      <PxFrame title={`${t.waveCleared} · ${t.wave} ${wave}`} icon="icoTrophy" className="anim-pop relative my-auto flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden p-3 pt-7 sm:p-5 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1">
            <button className={`shop-tab ${tab === "weapons" ? "is-active" : ""}`} onClick={() => setTab("weapons")}>{t.tabWeapons} + {g.upgrades}</button>
            <button className={`shop-tab ${tab === "stats" ? "is-active" : ""}`} onClick={() => setTab("stats")}>{t.tabStats}</button>
          </div>
          <CoinBox coins={stats.coins} />
        </div>

        <div className="px-divider my-3" />

        {tab === "weapons" ? (
          <div className="scrollbar-thin grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[190px_1fr_280px]">
            <div className="flex flex-col gap-1">
              <div className="font-pixel mb-1 text-[7px] text-[#ffd44a]">{t.weaponsTitle}</div>
              {ALL_WEAPONS.map((weapon) => {
                const index = stats.weapons.indexOf(weapon.id);
                return (
                  <button key={weapon.id} onClick={() => setSelected(weapon.id)} className={`pxb pxb-menu font-pixel !py-2 text-[7px] ${selected === weapon.id ? "is-active" : ""}`}>
                    <PixelSprite name={WEAPON_ICON[weapon.id]} scale={1} />
                    <span className="truncate">{weaponName(weapon.id, t, g, stats.weaponLevels[weapon.id].form)}</span>
                    {index >= 0 && <span className="ml-auto bg-[#ffd44a] px-1 text-[6px] text-[#351c00]">{index + 1}</span>}
                  </button>
                );
              })}
              <div className="mt-2 grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((index) => {
                  const weapon = stats.weapons[index];
                  return weapon ? (
                    <button key={index} onClick={() => { onSelectSlot(index); setSelected(weapon); }} className={`px-tile !h-11 !w-auto ${index === stats.activeSlot ? "outline outline-2 outline-[#ffd44a]" : ""}`}>
                      <PixelSprite name={WEAPON_ICON[weapon]} scale={2} />
                    </button>
                  ) : <div key={index} className="px-empty flex h-11 items-center justify-center text-[7px] text-[#6c3a42]">{index + 1}</div>;
                })}
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <div className="px-inset relative flex min-h-32 items-center justify-center overflow-hidden">
                <WeaponPreview weapon={selected} scale={3} angle={-30} form={levels.form} />
                <span className="font-pixel absolute left-3 top-3 text-[7px] text-[#ffd44a]">{weaponName(selected, t, g, levels.form)}</span>
                <span className="font-pixel absolute bottom-3 right-3 text-[6px] text-[#a35662]">{g.weaponLevel} {levels.damage + levels.speed + levels.range + levels.form}</span>
              </div>
              <div className="px-inset p-3">
                <p className="font-pixel text-[7px] leading-5 text-[#d8a9a0]">{weaponDescription(selected, t, g)}</p>
                {selected === "shield" && <p className="font-pixel mt-2 text-[6px] leading-4 text-[#7ed9d1]">{g.shieldHint}</p>}
                <div className="mt-3 grid grid-cols-3 gap-2 text-[6px] text-[#a35662]">
                  <span>{t.dmg}<Pips value={info.dmg + levels.damage} color="#e0444d" /></span>
                  <span>{t.spd}<Pips value={Math.min(5, info.spd + levels.speed)} color="#ffd44a" /></span>
                  <span>{t.range}<Pips value={Math.min(5, info.range + levels.range)} color="#62b7c8" /></span>
                </div>
              </div>
              <div className="flex gap-2">
                {owned ? <>
                  {!active && <PxButton tone="gold" onClick={() => onSelectSlot(ownedIndex)} className="flex-1 py-3 text-[7px]">{t.equipped}</PxButton>}
                  <PxButton tone="dark" disabled={stats.weapons.length <= 1} onClick={() => onSellWeapon(ownedIndex, info.sellRefund)} className="flex-1 py-3 text-[7px]">{t.sell} <Price cost={info.sellRefund} /></PxButton>
                </> : <PxButton tone="gold" disabled={stats.coins < info.cost || full} onClick={() => onBuyWeapon(selected, info.cost)} className="w-full py-3 text-[8px]">{full ? t.maxSlots : <>{t.buy} <Price cost={info.cost} /></>}</PxButton>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-pixel text-[7px] text-[#ffd44a]">{g.upgrades}</div>
              {!owned ? <div className="px-inset p-4 text-center font-pixel text-[7px] leading-5 text-[#a35662]">{t.buy} {weaponName(selected, t, g, levels.form)}</div> : UPGRADE_TYPES.map((kind) => {
                const allowed = kind !== "form" || selected === "bow" || selected === "hammer";
                const level = levels[kind];
                const max = kind === "form" ? 1 : 3;
                const cost = upgradeCost(selected, kind, level);
                if (!allowed) return kind === "form" ? <div key={kind} className="px-inset p-2 font-pixel text-[6px] leading-4 text-[#6c3a42]">{g.formLocked}</div> : null;
                return (
                  <div key={kind} className="px-inset flex items-center gap-2 p-2">
                    <div className="min-w-0 grow">
                      <div className="font-pixel text-[7px] text-[#ffe2c4]">{g[kind]}</div>
                      <div className="mt-1 flex gap-1">{Array.from({ length: max }).map((_, i) => <i key={i} className={`h-2 w-5 border-2 border-[#070305] ${i < level ? "bg-[#e0444d]" : "bg-[#2a0e13]"}`} />)}</div>
                    </div>
                    <PxButton tone="red" disabled={level >= max || stats.coins < cost} onClick={() => onUpgradeWeapon(selected, kind, cost)} className="px-2 py-2 text-[6px]">{level >= max ? g.max : <><Price cost={cost} /></>}</PxButton>
                  </div>
                );
              })}

              {owned && selected === "book" && <div className="px-inset p-2">
                <div className="font-pixel mb-2 text-[7px] text-[#ffd44a]">{g.magic}</div>
                <div className="grid grid-cols-2 gap-1">{MAGIC_TYPES.map((magic) => (
                  <button key={magic} onClick={() => onMagicType(magic)} className={`magic-option ${stats.magicType === magic ? "is-active" : ""}`}>
                    <strong>{g[magic]}</strong><span>{g[`${magic}Desc` as keyof typeof g]}</span>
                  </button>
                ))}</div>
              </div>}
            </div>
          </div>
        ) : (
          <div className="scrollbar-thin grid min-h-0 flex-1 gap-3 overflow-y-auto md:grid-cols-2">
            <div className="px-inset p-4">
              <div className="font-pixel mb-3 text-[9px] text-[#ffd44a]">{t.yourStats}</div>
              <div className="grid grid-cols-2 gap-2 font-pixel text-[7px]">
                <div className="stat-readout"><span>{t.statHearts}</span><strong>{stats.hp}/{stats.maxHp}</strong></div>
                <div className="stat-readout"><span>{t.statSpeed}</span><strong>{108 + stats.speedBonus}</strong></div>
                <div className="stat-readout"><span>{t.statDashCd}</span><strong>{stats.dashMax.toFixed(1)}s</strong></div>
                <div className="stat-readout"><span>{t.statDashDist}</span><strong>x{stats.dashSpeedMult.toFixed(2)}</strong></div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{ALL_POWERUPS.map((power) => (
              <div key={power.id} className="px-inset flex flex-col p-3">
                {(() => {
                  const maxed = isPowerUpMaxed(power.id);
                  return <>
                <div className="flex items-center gap-2"><PixelSprite name={power.icon} scale={2} /><strong className="font-pixel text-[7px]">{t[power.nameKey] as string}</strong></div>
                <p className="font-pixel my-2 grow text-[6px] leading-4 text-[#a35662]">{t[power.descKey] as string}</p>
                <PxButton tone="red" disabled={maxed || stats.coins < power.cost} onClick={() => onBuyPowerUp(power.id, power.cost)} className="py-2 text-[7px]">{maxed ? g.max : <>{g.improve} <Price cost={power.cost} /></>}</PxButton>
                  </>;
                })()}
              </div>
            ))}</div>
          </div>
        )}

        <div className="px-divider my-3" />
        <PxButton tone="green" onClick={onCloseShop} className="w-full py-3 text-[9px] sm:text-[10px]">▶ {t.nextWave} · {t.wave} {wave + 1}</PxButton>
      </PxFrame>
    </div>
  );
}
