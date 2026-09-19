import { useState } from "react";
import { type ScoreEntry, formatTime } from "../game/storage";
import { I18N, LANGS, type Language } from "../game/i18n";
import PixelSprite from "./PixelSprite";
import { PxButton, PxChip, PxFrame, PxHeading, PxRow } from "./PixelUi";

export interface UiOpts {
  sound: boolean;
  volume: number;
  shake: boolean;
  flash: boolean;
  quality: "high" | "low";
  vsync: boolean;
  language: Language;
  hudScale: 1 | 1.25 | 1.5;
}

type MenuTab = "main" | "settings" | "language" | "ranking";

export default function MainMenu({
  onStart,
  scores,
  best,
  isTouch,
  opts,
  onOpts,
  onClearScores,
  onFullscreen,
}: {
  onStart: () => void;
  scores: ScoreEntry[];
  best: number;
  isTouch: boolean;
  opts: UiOpts;
  onOpts: (o: Partial<UiOpts>) => void;
  onClearScores: () => void;
  onFullscreen: () => void;
}) {
  const [tab, setTab] = useState<MenuTab>("main");
  const t = I18N[opts.language];

  const back = () => setTab("main");

  return (
    <div className="px-backdrop absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
      <div className="px-vignette pointer-events-none absolute inset-0" />

      {/* Title block above the frame */}
      <div className="relative my-auto flex w-full max-w-md flex-col items-center">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-2 flex items-end gap-3">
            <PixelSprite name="grunt" scale={3} className="anim-bob opacity-80" style={{ animationDelay: "0.3s" }} />
            <PixelSprite name="player" scale={4} className="anim-bob" />
            <PixelSprite name="ninja" scale={3} className="anim-bob opacity-80" style={{ animationDelay: "0.6s", transform: "scaleX(-1)" }} />
          </div>
          <div className="font-pixel text-[8px] tracking-[0.35em] text-[#d9464f]">RONIN</div>
          <h1 className="font-pixel text-shadow-pix text-[22px] leading-none text-[#ffe2c4] sm:text-[32px]">
            ARENA
            <br />
            <span className="text-[#e0444d]">CARMESIM</span>
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-[3px] w-6 bg-[#8c2a35]" />
            <span className="font-pixel text-[7px] text-[#a35662] sm:text-[8px]">{t.tagline}</span>
            <span className="h-[3px] w-6 bg-[#8c2a35]" />
          </div>
        </div>

        <PxFrame className="anim-pop w-full p-4 sm:p-5">
          {tab === "main" && (
            <div className="flex flex-col gap-2">
              <PxButton tone="red" onClick={onStart} className="w-full py-4 text-[12px] sm:text-[14px]">
                <PixelSprite name="icoPlay" scale={1} />
                {t.play}
              </PxButton>

              <PxButton tone="menu" onClick={() => setTab("settings")} className="text-[9px] sm:text-[10px]">
                <PixelSprite name="icoGear" scale={1} />
                {t.settings}
              </PxButton>
              <PxButton tone="menu" onClick={() => setTab("language")} className="text-[9px] sm:text-[10px]">
                <PixelSprite name="icoGlobe" scale={1} />
                {t.language}
                <span className="ml-auto text-[7px] text-[#a35662]">{I18N[opts.language].langName}</span>
              </PxButton>
              <PxButton tone="menu" onClick={() => setTab("ranking")} className="text-[9px] sm:text-[10px]">
                <PixelSprite name="icoTrophy" scale={1} />
                {t.ranking}
              </PxButton>

              <div className="px-inset mt-2 flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <PixelSprite name="icoSkull" scale={1} />
                  <span className="font-pixel text-[7px] text-[#a35662]">{t.best}</span>
                </div>
                <span className="font-pixel text-[11px] text-[#ffd44a]">{best.toLocaleString()}</span>
              </div>
              <div className="font-pixel mt-1 text-center text-[6px] text-[#6c3a42] sm:text-[7px]">
                <span className="anim-caret">▶</span> {isTouch ? t.touchStart : t.start}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="anim-slide flex flex-col gap-2">
              <PxHeading>{t.graphics}</PxHeading>
              <PxRow label={t.quality}>
                {(["high", "low"] as const).map((q) => (
                  <PxChip key={q} on={opts.quality === q} onClick={() => onOpts({ quality: q })}>
                    {q === "high" ? t.qualityHigh : t.qualityLow}
                  </PxChip>
                ))}
              </PxRow>
              <PxRow label={t.vsync}>
                <PxChip on={opts.vsync} onClick={() => onOpts({ vsync: !opts.vsync })}>
                  {opts.vsync ? t.on : t.off}
                </PxChip>
              </PxRow>
              <PxRow label={t.fullscreen}>
                <PxChip on onClick={onFullscreen}>
                  {t.enter}
                </PxChip>
              </PxRow>
              <PxRow label={t.screenShake}>
                <PxChip on={opts.shake} onClick={() => onOpts({ shake: !opts.shake })}>
                  {opts.shake ? t.on : t.off}
                </PxChip>
              </PxRow>
              <PxRow label={t.screenFlash}>
                <PxChip on={opts.flash} onClick={() => onOpts({ flash: !opts.flash })}>
                  {opts.flash ? t.on : t.off}
                </PxChip>
              </PxRow>
              <PxRow label={t.hudSize}>
                {([1, 1.25, 1.5] as const).map((size) => (
                  <PxChip key={size} on={opts.hudScale === size} onClick={() => onOpts({ hudScale: size })}>
                    {size === 1 ? t.hudNormal : size === 1.25 ? t.hudLarge : t.hudHuge}
                  </PxChip>
                ))}
              </PxRow>

              <PxHeading className="mt-2">{t.sound}</PxHeading>
              <PxRow label={t.sound}>
                <PxChip on={opts.sound} onClick={() => onOpts({ sound: !opts.sound })}>
                  {opts.sound ? t.on : t.off}
                </PxChip>
              </PxRow>
              <div className="px-inset px-3 py-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-pixel text-[8px] text-[#ffe2c4]">{t.volume}</span>
                  <span className="font-pixel text-[8px] text-[#ffd44a]">{Math.round(opts.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(opts.volume * 100)}
                  onChange={(e) => onOpts({ volume: Number(e.target.value) / 100 })}
                  className="slider w-full"
                />
              </div>

              <PxButton tone="dark" onClick={back} className="mt-2 w-full py-3 text-[8px] sm:text-[9px]">
                ◀ {t.menu}
              </PxButton>
            </div>
          )}

          {tab === "language" && (
            <div className="anim-slide flex flex-col gap-2">
              <PxHeading>{t.language}</PxHeading>
              {LANGS.map((lng) => (
                <PxButton
                  key={lng}
                  tone="menu"
                  active={opts.language === lng}
                  onClick={() => onOpts({ language: lng })}
                  className="text-[9px] sm:text-[10px]"
                >
                  {I18N[lng].langName}
                  {opts.language === lng && <span className="ml-auto text-[#ffd44a]">■</span>}
                </PxButton>
              ))}
              <PxButton tone="dark" onClick={back} className="mt-2 w-full py-3 text-[8px] sm:text-[9px]">
                ◀ {t.menu}
              </PxButton>
            </div>
          )}

          {tab === "ranking" && (
            <div className="anim-slide flex flex-col gap-2">
              <PxHeading>{t.ranking}</PxHeading>
              <div className="px-inset">
                <div className="font-pixel flex items-center gap-2 border-b-[3px] border-[#070305] bg-[#2a0e13] px-3 py-2 text-[6px] text-[#a35662] sm:text-[7px]">
                  <span className="w-5">{t.rank}</span>
                  <span className="grow">{t.name}</span>
                  <span className="w-16 text-right">{t.score}</span>
                  <span className="w-8 text-right">{t.wave}</span>
                  <span className="w-10 text-right">{t.time}</span>
                </div>
                {scores.length === 0 ? (
                  <div className="font-pixel px-3 py-6 text-center text-[8px] text-[#6c3a42]">
                    {t.noScores}
                  </div>
                ) : (
                  <div className="scrollbar-thin max-h-[36vh] overflow-y-auto">
                    {scores.map((s, i) => (
                      <div
                        key={i}
                        className={`font-pixel flex items-center gap-2 px-3 py-2 text-[7px] sm:text-[8px] ${
                          i % 2 ? "bg-[#140609]" : "bg-[#0c0407]"
                        } ${i === 0 ? "text-[#ffd44a]" : "text-[#ffe2c4]"}`}
                      >
                        <span className="w-5">{i + 1}</span>
                        <span className="grow truncate uppercase">{s.name}</span>
                        <span className="w-16 text-right">{s.score.toLocaleString()}</span>
                        <span className="w-8 text-right text-[#a35662]">{s.wave}</span>
                        <span className="w-10 text-right text-[#a35662]">{formatTime(s.time)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                {scores.length > 0 && (
                  <PxButton tone="dark" onClick={onClearScores} className="flex-1 py-3 text-[7px] sm:text-[8px]">
                    {t.clear}
                  </PxButton>
                )}
                <PxButton tone="dark" onClick={back} className="flex-1 py-3 text-[7px] sm:text-[8px]">
                  ◀ {t.menu}
                </PxButton>
              </div>
            </div>
          )}
        </PxFrame>

      </div>
    </div>
  );
}
