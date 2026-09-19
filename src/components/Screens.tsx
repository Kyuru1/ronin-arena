import { useState } from "react";
import type { HudStats } from "../game/engine";
import { formatTime, type ScoreEntry } from "../game/storage";
import type { Strings } from "../game/i18n";
import PixelSprite from "./PixelSprite";
import { PxButton, PxFrame, PxHeading } from "./PixelUi";

function StatCell({ label, value, gold }: { label: string; value: string | number; gold?: boolean }) {
  return (
    <div className="px-inset flex flex-col items-center px-2 py-2">
      <span className="font-pixel text-[6px] text-[#a35662]">{label}</span>
      <span className={`font-pixel mt-1 text-[10px] ${gold ? "text-[#ffd44a]" : "text-[#ffe2c4]"}`}>{value}</span>
    </div>
  );
}

export function PauseScreen({
  onResume,
  onQuit,
  stats,
  t,
}: {
  onResume: () => void;
  onQuit: () => void;
  stats: HudStats;
  t: Strings;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#070305]/85 p-3">
      <PxFrame title={t.paused} className="anim-pop w-full max-w-xs p-4 pt-6 sm:p-5 sm:pt-7">
        <div className="flex flex-col items-center gap-3">
          <PixelSprite name="player" scale={4} />
          <div className="grid w-full grid-cols-2 gap-2">
            <StatCell label={t.score} value={stats.score.toLocaleString()} gold />
            <StatCell label={t.wave} value={stats.wave} />
            <StatCell label={t.kills} value={stats.kills} />
            <StatCell label={t.time} value={formatTime(stats.time)} />
          </div>
          <PxButton tone="red" onClick={onResume} className="w-full py-3 text-[10px] sm:text-[11px]">
            ▶ {t.resume}
          </PxButton>
          <PxButton tone="dark" onClick={onQuit} className="w-full py-2.5 text-[8px] sm:text-[9px]">
            {t.quit}
          </PxButton>
        </div>
      </PxFrame>
    </div>
  );
}

export function GameOverScreen({
  stats,
  scores,
  rank,
  pendingScore,
  defaultName,
  onSubmitName,
  onRestart,
  onMenu,
  t,
}: {
  stats: HudStats;
  scores: ScoreEntry[];
  rank: number;
  pendingScore: boolean;
  defaultName: string;
  onSubmitName: (name: string) => void;
  onRestart: () => void;
  onMenu: () => void;
  t: Strings;
}) {
  const [name, setName] = useState(defaultName);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#12040a]/88 p-3">
      <PxFrame
        title={t.youDied}
        icon="icoSkull"
        className="anim-pop w-full max-w-sm p-4 pt-6 sm:p-5 sm:pt-7"
      >
        <div className="flex flex-col items-center gap-3">
          {/* Score */}
          <div className="px-inset flex w-full flex-col items-center px-3 py-3">
            <span className="font-pixel text-[7px] text-[#a35662]">{t.finalScore}</span>
            <span className="font-pixel text-shadow-pix anim-shake mt-1 text-[24px] text-[#ffe2c4] sm:text-[28px]">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="grid w-full grid-cols-3 gap-2">
            <StatCell label={t.kills} value={stats.kills} />
            <StatCell label={t.wave} value={stats.wave} />
            <StatCell label={t.time} value={formatTime(stats.time)} />
          </div>

          {pendingScore ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitName(name);
              }}
              className="w-full"
            >
              <PxHeading>{t.enterName}</PxHeading>
              <div className="relative">
                <input
                  autoFocus
                  value={name}
                  maxLength={12}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="px-input font-pixel text-[10px]"
                />
                <span className="font-pixel anim-caret pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#ffd44a]">
                  _
                </span>
              </div>
              <PxButton type="submit" tone="gold" className="mt-3 w-full py-3 text-[9px] sm:text-[10px]">
                {t.save}
              </PxButton>
            </form>
          ) : (
            <>
              {rank >= 0 && (
                <div className="font-pixel flex items-center gap-2 border-[3px] border-[#070305] bg-[#3a2200] px-3 py-1.5 text-[8px] text-[#ffd44a]">
                  <PixelSprite name="icoTrophy" scale={1} />#{rank + 1} · {t.ranking}
                </div>
              )}
              <div className="px-inset scrollbar-thin max-h-[22vh] w-full overflow-y-auto">
                {scores.slice(0, 6).map((s, i) => (
                  <div
                    key={i}
                    className={`font-pixel flex items-center gap-2 px-3 py-1.5 text-[7px] sm:text-[8px] ${
                      i % 2 ? "bg-[#140609]" : "bg-[#0c0407]"
                    } ${i === rank ? "text-[#ffd44a]" : "text-[#ffe2c4]"}`}
                  >
                    <span className="w-4">{i + 1}</span>
                    <span className="grow truncate uppercase">{s.name}</span>
                    <span>{s.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <PxButton tone="red" onClick={onRestart} className="w-full py-3.5 text-[11px] sm:text-[12px]">
                ▶ {t.playAgain}
              </PxButton>
              <PxButton tone="dark" onClick={onMenu} className="w-full py-2.5 text-[8px] sm:text-[9px]">
                {t.menu}
              </PxButton>
            </>
          )}
        </div>
      </PxFrame>
    </div>
  );
}
