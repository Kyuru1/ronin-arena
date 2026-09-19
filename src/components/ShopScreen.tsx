import { useState } from "react";
import type { Weapon, PowerUp, HudStats } from "../game/engine";
import type { Strings } from "../game/i18n";
import PixelSprite from "./PixelSprite";
import WeaponPreview from "./WeaponPreview";
import { CoinBox, PxButton, PxFrame } from "./PixelUi";

export const WEAPON_ICON: Record<Weapon, string> = {
  katana: "icoKatana",
  bow: "icoBow",
  axe: "icoAxe",
  hammer: "icoHammer",
  shield: "icoShield",
  mine: "icoMine",
};

interface WeaponShopInfo {
  id: Weapon;
  nameKey: keyof Strings;
  descKey: keyof Strings;
  cost: number;
  sellRefund: number;
  dmg: number;
  spd: number;
  range: number;
}

const ALL_WEAPONS: WeaponShopInfo[] = [
  { id: "katana", nameKey: "katana", descKey: "katanaDesc", cost: 25, sellRefund: 15, dmg: 2, spd: 5, range: 3 },
  { id: "bow", nameKey: "bow", descKey: "bowDesc", cost: 35, sellRefund: 20, dmg: 3, spd: 3, range: 5 },
  { id: "axe", nameKey: "axe", descKey: "axeDesc", cost: 40, sellRefund: 22, dmg: 4, spd: 2, range: 4 },
  { id: "hammer", nameKey: "hammer", descKey: "hammerDesc", cost: 50, sellRefund: 28, dmg: 5, spd: 1, range: 3 },
  { id: "shield", nameKey: "shield", descKey: "shieldDesc", cost: 30, sellRefund: 18, dmg: 0, spd: 4, range: 2 },
  { id: "mine", nameKey: "mine", descKey: "mineDesc", cost: 24, sellRefund: 14, dmg: 5, spd: 2, range: 4 },
];

interface PowerUpShopInfo {
  id: PowerUp;
  nameKey: keyof Strings;
  descKey: keyof Strings;
  cost: number;
  icon: string;
}

const ALL_POWERUPS: PowerUpShopInfo[] = [
  { id: "speed", nameKey: "speedUp", descKey: "speedDesc", cost: 20, icon: "icoSpeed" },
  { id: "heart", nameKey: "heartUp", descKey: "heartDesc", cost: 30, icon: "icoHeart" },
  { id: "dashCd", nameKey: "dashCdUp", descKey: "dashCdDesc", cost: 25, icon: "icoClock" },
  { id: "dashDist", nameKey: "dashDistUp", descKey: "dashDistDesc", cost: 25, icon: "icoDash" },
];

function Pips({ n, max = 5, color }: { n: number; max?: number; color: string }) {
  return (
    <span className="inline-flex gap-[3px]">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="inline-block h-[8px] w-[8px] border-2 border-[#070305]"
          style={{ background: i < n ? color : "#2a0e13" }}
        />
      ))}
    </span>
  );
}

function Price({ cost }: { cost: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <PixelSprite name="coin" scale={1} />
      {cost}
    </span>
  );
}

function StatBar({ label, value, max, text, color }: { label: string; value: number; max: number; text: string; color: string }) {
  const p = Math.max(0, Math.min(1, value / max));
  return (
    <div className="px-inset px-3 py-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-pixel text-[7px] text-[#a35662]">{label}</span>
        <span className="font-pixel text-[8px] text-[#ffe2c4]">{text}</span>
      </div>
      <div className="h-[10px] border-[3px] border-[#070305] bg-[#2a0e13]">
        <div className="h-full" style={{ width: `${p * 100}%`, background: color }} />
      </div>
    </div>
  );
}

type Tab = "weapons" | "stats";

export default function ShopScreen({
  wave,
  stats,
  onBuyWeapon,
  onSellWeapon,
  onSelectSlot,
  onBuyPowerUp,
  onCloseShop,
  t,
}: {
  wave: number;
  stats: HudStats;
  onBuyWeapon: (w: Weapon, cost: number) => void;
  onSellWeapon: (slotIndex: number, refund: number) => void;
  onSelectSlot: (slotIndex: number) => void;
  onBuyPowerUp: (p: PowerUp, cost: number) => void;
  onCloseShop: () => void;
  t: Strings;
}) {
  const [tab, setTab] = useState<Tab>("weapons");
  const [sel, setSel] = useState<Weapon>(stats.weapons[stats.activeSlot] ?? "katana");
  const { coins, weapons, activeSlot } = stats;

  const selInfo = ALL_WEAPONS.find((w) => w.id === sel)!;
  const selOwnedIdx = weapons.indexOf(sel);
  const selOwned = selOwnedIdx >= 0;
  const selInHand = selOwnedIdx === activeSlot;
  const isFull = weapons.length >= 4;
  const canAfford = coins >= selInfo.cost;

  return (
    <div className="px-backdrop absolute inset-0 z-30 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
      <div className="px-vignette pointer-events-none absolute inset-0" />

      <PxFrame
        title={`${t.waveCleared} · ${t.wave} ${wave}`}
        icon="icoTrophy"
        className="anim-pop relative my-auto flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden p-4 pt-7 sm:p-5 sm:pt-8"
      >
        {/* header: tabs + coins */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1">
            {(["weapons", "stats"] as Tab[]).map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`font-pixel border-[3px] border-[#070305] px-4 py-2 text-[8px] sm:text-[9px] ${
                  tab === id
                    ? "bg-[#e0444d] text-[#2a0509] shadow-[inset_0_3px_0_0_rgba(255,255,255,0.3)]"
                    : "bg-[#1d0a0e] text-[#a35662] shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.4)]"
                }`}
              >
                {id === "weapons" ? t.tabWeapons : t.tabStats}
              </button>
            ))}
          </div>
          <CoinBox coins={coins} />
        </div>

        <div className="px-divider my-3" />

        {/* ================= WEAPONS TAB ================= */}
        {tab === "weapons" && (
          <div className="anim-slide scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto sm:flex-row">
            {/* left: catalogue list */}
            <div className="flex shrink-0 flex-col gap-1 sm:w-44">
              {ALL_WEAPONS.map((w) => {
                const ownedIdx = weapons.indexOf(w.id);
                const owned = ownedIdx >= 0;
                const active = sel === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSel(w.id)}
                    className={`pxb pxb-menu font-pixel !py-2.5 text-[8px] ${active ? "is-active" : ""}`}
                  >
                    <PixelSprite name={WEAPON_ICON[w.id]} scale={1} />
                    <span className="truncate">{t[w.nameKey] as string}</span>
                    {owned && (
                      <span className="ml-auto border-2 border-[#070305] bg-[#ffd44a] px-[4px] text-[6px] text-[#3a2200]">
                        {ownedIdx + 1}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* equipped hotbar mirror */}
              <div className="mt-2 grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((i) => {
                  const w = weapons[i];
                  const isAct = i === activeSlot;
                  if (!w) {
                    return (
                      <div key={i} className="px-empty flex h-9 items-center justify-center">
                        <span className="font-pixel text-[6px] text-[#4a1420]">{i + 1}</span>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        onSelectSlot(i);
                        setSel(w);
                      }}
                      className={`flex h-9 items-center justify-center border-[3px] border-[#070305] ${
                        isAct ? "bg-[#3a1219] shadow-[inset_0_0_0_2px_#ffd44a]" : "bg-[#120508] shadow-[inset_0_0_0_2px_#4a1420]"
                      }`}
                    >
                      <PixelSprite name={WEAPON_ICON[w]} scale={1} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* right: preview + details */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="px-inset relative flex items-center justify-center overflow-hidden py-3">
                {/* stage backdrop */}
                <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "repeating-linear-gradient(0deg,#0c0407 0 2px,#140609 2px 4px)" }} />
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[6px] bg-[#2a0e13]" />
                <span className="font-pixel absolute left-2 top-2 text-[6px] text-[#a35662]">{t.preview}</span>
                <WeaponPreview weapon={sel} scale={3} angle={-35} className="relative" />
              </div>

              <div className="px-inset p-3">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[10px] text-[#ffe2c4]">{t[selInfo.nameKey] as string}</span>
                  {selOwned && (
                    <span className="font-pixel border-2 border-[#070305] bg-[#153a1c] px-2 py-[2px] text-[6px] text-[#9be3a7]">
                      {selInHand ? t.inHand : t.owned} · {selOwnedIdx + 1}
                    </span>
                  )}
                </div>
                <p className="font-pixel mt-2 text-[7px] leading-relaxed text-[#a35662]">
                  {t[selInfo.descKey] as string}
                </p>
                <div className="font-pixel mt-3 grid grid-cols-3 gap-2 text-[6px] text-[#a35662]">
                  <div className="flex flex-col gap-1">
                    {t.dmg}
                    <Pips n={selInfo.dmg} color="#e0444d" />
                  </div>
                  <div className="flex flex-col gap-1">
                    {t.spd}
                    <Pips n={selInfo.spd} color="#ffd44a" />
                  </div>
                  <div className="flex flex-col gap-1">
                    {t.range}
                    <Pips n={selInfo.range} color="#ff9a60" />
                  </div>
                </div>
              </div>

              {/* action */}
              <div className="flex gap-2">
                {selOwned ? (
                  <>
                    {!selInHand && (
                      <PxButton tone="gold" onClick={() => onSelectSlot(selOwnedIdx)} className="flex-1 py-3 text-[8px]">
                        {t.equipped}
                      </PxButton>
                    )}
                    <PxButton
                      tone="dark"
                      disabled={weapons.length <= 1}
                      onClick={() => onSellWeapon(selOwnedIdx, selInfo.sellRefund)}
                      className="flex-1 py-3 text-[8px]"
                    >
                      {t.sell} <Price cost={selInfo.sellRefund} />
                    </PxButton>
                  </>
                ) : (
                  <PxButton
                    tone="gold"
                    disabled={!canAfford || isFull}
                    onClick={() => {
                      onBuyWeapon(sel, selInfo.cost);
                    }}
                    className="flex-1 py-3 text-[8px]"
                  >
                    {isFull ? t.maxSlots : (
                      <>
                        {t.buy} <Price cost={selInfo.cost} />
                      </>
                    )}
                  </PxButton>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STATS TAB ================= */}
        {tab === "stats" && (
          <div className="anim-slide scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto sm:flex-row">
            {/* left: current ronin */}
            <div className="flex shrink-0 flex-col gap-2 sm:w-52">
              <div className="px-inset flex items-center gap-3 px-3 py-3">
                <div className="px-tile">
                  <PixelSprite name="player" scale={3} />
                </div>
                <span className="font-pixel text-[8px] text-[#ffe2c4]">{t.yourStats}</span>
              </div>
              <StatBar label={t.statHearts} value={stats.maxHp} max={12} text={`${stats.hp}/${stats.maxHp}`} color="#ff4353" />
              <StatBar label={t.statSpeed} value={108 + stats.speedBonus} max={220} text={`${108 + stats.speedBonus}`} color="#ffd44a" />
              <StatBar label={t.statDashCd} value={6.5 - stats.dashMax} max={5} text={`${stats.dashMax.toFixed(1)}s`} color="#f8d7a5" />
              <StatBar label={t.statDashDist} value={stats.dashSpeedMult} max={2.5} text={`x${stats.dashSpeedMult.toFixed(2)}`} color="#ff9a60" />
            </div>

            {/* right: purchasable upgrades */}
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              {ALL_POWERUPS.map((p) => {
                const ok = coins >= p.cost;
                return (
                  <div key={p.id} className="px-inset flex flex-col p-3">
                    <div className="flex items-center gap-2">
                      <div className="px-tile !h-10 !w-10">
                        <PixelSprite name={p.icon} scale={2} />
                      </div>
                      <div className="font-pixel text-[8px] text-[#ffe2c4]">{t[p.nameKey] as string}</div>
                    </div>
                    <div className="font-pixel mt-2 grow text-[6px] leading-relaxed text-[#a35662]">
                      {t[p.descKey] as string}
                    </div>
                    <PxButton tone="red" disabled={!ok} onClick={() => onBuyPowerUp(p.id, p.cost)} className="mt-3 w-full py-2 text-[7px]">
                      {t.buy} <Price cost={p.cost} />
                    </PxButton>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-divider my-3" />

        <PxButton tone="green" onClick={onCloseShop} className="w-full py-3.5 text-[10px] sm:text-[11px]">
          ▶ {t.nextWave} — {t.wave} {wave + 1}
        </PxButton>
      </PxFrame>
    </div>
  );
}
