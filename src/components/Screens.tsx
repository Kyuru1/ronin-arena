import { useState } from "react";
import type { HudStats } from "../game/engine";
import { formatTime, type ScoreEntry } from "../game/storage";
import type { Strings } from "../game/i18n";
import type { UiOpts } from "./MainMenu";
import PixelSprite from "./PixelSprite";
import { PxButton, PxChip, PxFrame, PxHeading, PxRow } from "./PixelUi";

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
  onSave,
  onQuit,
  stats,
  t,
  opts,
  onOpts,
  onFullscreen,
}: {
  onResume: () => void;
  onSave: () => void;
  onQuit: () => void;
  stats: HudStats;
  t: Strings;
  opts: UiOpts;
  onOpts: (options: Partial<UiOpts>) => void;
  onFullscreen: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-[#070305]/85 p-3">
      <PxFrame title={t.paused} className="anim-pop my-auto w-full max-w-xs p-4 pt-6 sm:p-5 sm:pt-7">
        <div className="flex flex-col items-center gap-3">
          <PixelSprite name="player" scale={4} />
          <div className="grid w-full grid-cols-2 gap-2">
            <StatCell label={t.score} value={stats.score.toLocaleString()} gold />
            <StatCell label={t.wave} value={stats.wave} />
            <StatCell label={t.kills} value={stats.kills} />
            <StatCell label={t.time} value={formatTime(stats.time)} />
          </div>
          <PxButton tone="menu" onClick={() => setSettingsOpen((open) => !open)} className="w-full py-2.5 text-[8px] sm:text-[9px]">{t.settings}</PxButton>
          <PxButton tone="gold" onClick={onSave} className="w-full py-2.5 text-[8px] sm:text-[9px]">SALVAR RUN</PxButton>
          <PxButton tone="red" onClick={onResume} className="w-full py-3 text-[10px] sm:text-[11px]">
            ▶ {t.resume}
          </PxButton>
          <PxButton tone="dark" onClick={onQuit} className="w-full py-2.5 text-[8px] sm:text-[9px]">
            {t.quit}
          </PxButton>
        </div>
      </PxFrame>
      {settingsOpen && <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-[#070305]/70 p-3 sm:p-6">
        <PxFrame title={t.settings} className="anim-pop w-full max-w-xl p-4 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-2">
            <PxRow label={t.screenShake}><PxChip on={opts.shake} onClick={() => onOpts({ shake: !opts.shake })}>{opts.shake ? t.on : t.off}</PxChip></PxRow>
            <PxRow label={t.screenFlash}><PxChip on={opts.flash} onClick={() => onOpts({ flash: !opts.flash })}>{opts.flash ? t.on : t.off}</PxChip></PxRow>
            <PxRow label={t.sound}><PxChip on={opts.sound} onClick={() => onOpts({ sound: !opts.sound })}>{opts.sound ? t.on : t.off}</PxChip></PxRow>
            <PxRow label={t.keyboardOnly}><PxChip on={opts.keyboardOnly} onClick={() => onOpts({ keyboardOnly: !opts.keyboardOnly })}>{opts.keyboardOnly ? t.on : t.off}</PxChip></PxRow>
            <PxRow label={t.fullscreen}><PxChip on onClick={onFullscreen}>{t.enter}</PxChip></PxRow>
          </div>
          <div className="px-inset mt-3 p-3"><div className="mb-2 flex justify-between font-pixel text-[6px]"><span>{t.volume}</span><span className="text-[#ffd44a]">{Math.round(opts.volume * 100)}%</span></div><input type="range" min={0} max={100} value={Math.round(opts.volume * 100)} onChange={(event) => onOpts({ volume: Number(event.target.value) / 100 })} className="slider w-full" /></div>
          <div className="px-inset mt-3 p-3"><div className="mb-2 font-pixel text-[6px]">{t.hudSize}</div><div className="flex flex-wrap gap-1">{([0.65, 0.85, 1, 1.25, 1.5] as const).map((size) => <PxChip key={size} on={opts.hudScale === size} onClick={() => onOpts({ hudScale: size })}>{size === 0.65 ? t.hudTiny : size === 0.85 ? t.hudSmall : size === 1 ? t.hudNormal : size === 1.25 ? t.hudLarge : t.hudHuge}</PxChip>)}</div></div>
          <PxButton tone="dark" onClick={() => setSettingsOpen(false)} className="mt-4 w-full py-3 text-[8px]">◀ {t.paused}</PxButton>
        </PxFrame>
      </div>}
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
            <div className="w-full">
              <PxHeading>{t.ranking}</PxHeading>
              <div className="px-inset mb-3 p-3 text-center font-pixel text-[8px] text-[#ffe2c4]">RECORDE DE: {defaultName}</div>
              <PxButton tone="gold" onClick={() => onSubmitName(defaultName)} className="w-full py-3 text-[9px] sm:text-[10px]">
                {t.save}
              </PxButton>
              <PxButton tone="dark" onClick={onRestart} className="mt-2 w-full py-2.5 text-[8px]">▶ {t.playAgain}</PxButton>
              <PxButton tone="dark" onClick={onMenu} className="mt-2 w-full py-2.5 text-[8px]">← {t.menu}</PxButton>
            </div>          ) : (
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