import type { HudStats } from "../game/engine";
import { formatTime } from "../game/storage";
import type { Strings } from "../game/i18n";
import PixelSprite from "./PixelSprite";
import { WEAPON_ICON } from "./ShopScreen";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 7 6" className="h-5 w-6 sm:h-6 sm:w-7" shapeRendering="crispEdges">
      <g fill={filled ? "#ff4353" : "#2a0e13"}>
        <rect x="1" y="0" width="2" height="1" />
        <rect x="4" y="0" width="2" height="1" />
        <rect x="0" y="1" width="7" height="2" />
        <rect x="1" y="3" width="5" height="1" />
        <rect x="2" y="4" width="3" height="1" />
        <rect x="3" y="5" width="1" height="1" />
      </g>
      {filled && <rect x="1" y="1" width="1" height="1" fill="#ffd2b5" />}
    </svg>
  );
}

export default function Hud({
  stats,
  best,
  onPause,
  onMute,
  onSelectSlot,
  muted,
  hudScale,
  t,
}: {
  stats: HudStats;
  best: number;
  onPause: () => void;
  onMute: () => void;
  onSelectSlot: (slot: number) => void;
  muted: boolean;
  hudScale: 1 | 1.25 | 1.5;
  t: Strings;
}) {
  const mult = Math.min(1 + stats.combo * 0.12, 6);
  const dashP = stats.dashReady ? 1 : 1 - stats.dashCd / stats.dashMax;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 sm:p-3">
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: hearts, coins, combo */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-[2px] drop-shadow-[0_2px_0_#070305]">
            {Array.from({ length: stats.maxHp }).map((_, i) => (
              <Heart key={i} filled={i < stats.hp} />
            ))}
          </div>
          <div className="flex items-center gap-1 border-[3px] border-[#070305] bg-[#2a1a04] px-2 py-1 self-start">
            <PixelSprite name="coin" scale={2} />
            <span className="font-pixel text-[9px] text-[#ffd44a] sm:text-[10px]">{stats.coins}</span>
          </div>
          <div className="h-5">
            {stats.combo > 1 && (
              <div
                key={stats.combo}
                className="anim-pop font-pixel text-shadow-pix text-[9px] sm:text-xs"
                style={{ color: mult >= 3 ? "#ff7c4d" : mult >= 2 ? "#ffd44a" : "#ff9e88" }}
              >
                x{mult.toFixed(1)} · {stats.combo} {t.kills}
              </div>
            )}
          </div>
        </div>

        {/* Center: score */}
        <div className="flex flex-col items-center">
          <div key={stats.score} className="anim-pop font-pixel text-shadow-pix text-lg text-white sm:text-2xl">
            {stats.score.toLocaleString()}
          </div>
          <div className="font-pixel text-[7px] text-[#a35662] sm:text-[8px]">
            {t.best} {best.toLocaleString()}
          </div>
        </div>

        {/* Right: wave/time/dash + buttons */}
        <div className="flex flex-col items-end gap-1">
          <div className="font-pixel text-shadow-pix text-[9px] text-[#ffe2c4] sm:text-xs">
            {t.wave} {stats.wave}
          </div>
          {/* enemies remaining in this wave */}
          <div className="border-[3px] border-[#070305] bg-[#0c0407] p-[2px]">
            <div className="relative h-[8px] w-[64px] bg-[#2a0e13]">
              <div
                className="absolute inset-y-0 left-0 bg-[#e0444d]"
                style={{ width: `${stats.waveTotal ? (stats.waveLeft / stats.waveTotal) * 100 : 0}%` }}
              />
            </div>
            <div className="font-pixel mt-[2px] text-center text-[6px] text-[#ffe2c4]">
              {t.enemiesLeft} {stats.waveLeft}
            </div>
          </div>
          <div className="font-pixel text-[7px] text-[#a35662] sm:text-[9px]">{formatTime(stats.time)}</div>

          <div className="pointer-events-auto mt-1 flex gap-1">
            <button
              onClick={onMute}
              className="pxb pxb-dark font-pixel h-7 w-7 text-[8px] sm:h-8 sm:w-8"
              aria-label={t.mute}
            >
              {muted ? "✕" : "♪"}
            </button>
            <button
              onClick={onPause}
              className="pxb pxb-dark font-pixel h-7 w-7 text-[8px] sm:h-8 sm:w-8"
              aria-label={t.pause}
            >
              II
            </button>
          </div>
        </div>
      </div>

      {stats.mineTutorial && (
        <div className="font-pixel absolute bottom-20 left-1/2 -translate-x-1/2 border-[3px] border-[#070305] bg-[#23131a]/95 px-4 py-3 text-center text-[7px] leading-relaxed text-[#ffd44a] shadow-[0_4px_0_#070305] sm:text-[8px]">
          {t.mineTutorial}
        </div>
      )}

      {/* Bottom: dash status and weapon hotbar */}
      <div
        className="pointer-events-auto flex items-end justify-center gap-3 pb-1"
        style={{ transform: `scale(${hudScale})`, transformOrigin: "bottom center" }}
      >
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16" title={`${t.dashLabel}: ${stats.dashReady ? t.ready : `${stats.dashCd.toFixed(1)}s`}`}>
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="#0c0407" stroke="#3a1219" strokeWidth="4" />
            <circle
              cx="24" cy="24" r="20" fill="none" stroke={stats.dashReady ? "#ffd44a" : "#e0444d"}
              strokeWidth="4" strokeLinecap="square" strokeDasharray={`${dashP * 125.66} 125.66`}
            />
          </svg>
          <div className={`relative flex items-center ${stats.dashReady ? "anim-bob" : "opacity-55"}`}>
            <span className="mr-[-2px] flex flex-col gap-[2px]">
              <i className="block h-[2px] w-2 bg-[#ff8a62]" />
              <i className="block h-[2px] w-3 bg-[#ffd44a]" />
              <i className="block h-[2px] w-2 bg-[#ff8a62]" />
            </span>
            <PixelSprite name="player" scale={2} />
          </div>
          <span className="font-pixel absolute -bottom-1 bg-[#070305] px-1 text-[5px] text-[#ffe2c4]">
            {stats.dashReady ? t.ready : `${Math.ceil(stats.dashCd)}s`}
          </span>
        </div>

        <div className="flex items-end justify-center gap-1 rounded-none border-b-[3px] border-[#070305] bg-[#0c0407]/80 px-1 pt-1">
        {[0, 1, 2, 3].map((idx) => {
          const w = stats.weapons[idx];
          const isActive = idx === stats.activeSlot;
          if (!w) {
            return (
              <div key={idx} className="px-empty flex h-14 w-14 items-center justify-center">
                <span className="font-pixel text-[7px] text-[#4a1420]">{idx + 1}</span>
              </div>
            );
          }
          return (
            <button
              key={idx}
              onClick={() => onSelectSlot(idx)}
              className={`weapon-hud-slot relative flex h-14 items-center justify-center border-[3px] border-[#070305] ${
                isActive
                  ? "is-active -translate-y-2 w-[76px] bg-[#3a1219] shadow-[inset_0_0_0_3px_#ffd44a,0_5px_0_0_#070305]"
                  : "w-14 bg-[#120508] shadow-[inset_0_0_0_2px_#4a1420,0_4px_0_0_#070305]"
              }`}
              title={t[w] as string}
            >
              <PixelSprite name={WEAPON_ICON[w]} scale={isActive ? 3 : 2} />
              <span
                className={`font-pixel absolute left-[2px] top-[1px] text-[6px] ${
                  isActive ? "text-[#ffd44a]" : "text-[#a35662]"
                }`}
              >
                {idx + 1}
              </span>
              {isActive && (
                <span className="font-pixel absolute -top-4 left-1/2 w-24 -translate-x-1/2 truncate text-center text-[5px] text-[#ffd44a]">
                  {t[w] as string}
                </span>
              )}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
