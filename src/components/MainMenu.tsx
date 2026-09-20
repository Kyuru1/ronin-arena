import { useState } from "react";
import { GAMEPLAY_TEXT } from "../game/gameplayText";
import type { Difficulty } from "../game/engine";
import { I18N, LANGS, type Language } from "../game/i18n";
import { formatTime, type ScoreEntry } from "../game/storage";
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
  hudScale: 0.65 | 0.85 | 1 | 1.25 | 1.5;
  keyboardOnly: boolean;
}

type MenuTab = "main" | "settings" | "language" | "ranking";

export default function MainMenu({ onStart, difficulty, onDifficulty, scores, best, isTouch, opts, onOpts, onClearScores, onFullscreen }: {
  onStart: () => void;
  difficulty: Difficulty;
  onDifficulty: (difficulty: Difficulty) => void;
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
  const g = GAMEPLAY_TEXT[opts.language];

  if (tab !== "main") {
    return (
      <div className="px-backdrop absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
        <PxFrame className="anim-pop my-auto w-full max-w-xl p-4 sm:p-6">
          {tab === "settings" && <div className="flex flex-col gap-3">
            <PxHeading>{t.settings}</PxHeading>
            <div className="grid gap-2 sm:grid-cols-2">
              <PxRow label={t.quality}>{(["high", "low"] as const).map((quality) => <PxChip key={quality} on={opts.quality === quality} onClick={() => onOpts({ quality })}>{quality === "high" ? t.qualityHigh : t.qualityLow}</PxChip>)}</PxRow>
              <PxRow label={t.vsync}><PxChip on={opts.vsync} onClick={() => onOpts({ vsync: !opts.vsync })}>{opts.vsync ? t.on : t.off}</PxChip></PxRow>
              <PxRow label={t.screenShake}><PxChip on={opts.shake} onClick={() => onOpts({ shake: !opts.shake })}>{opts.shake ? t.on : t.off}</PxChip></PxRow>
              <PxRow label={t.screenFlash}><PxChip on={opts.flash} onClick={() => onOpts({ flash: !opts.flash })}>{opts.flash ? t.on : t.off}</PxChip></PxRow>
              <PxRow label={t.sound}><PxChip on={opts.sound} onClick={() => onOpts({ sound: !opts.sound })}>{opts.sound ? t.on : t.off}</PxChip></PxRow>
              <PxRow label={t.fullscreen}><PxChip on onClick={onFullscreen}>{t.enter}</PxChip></PxRow>
            </div>
            <div className="px-inset p-3"><div className="mb-2 flex justify-between font-pixel text-[7px]"><span>{t.volume}</span><span className="text-[#ffd44a]">{Math.round(opts.volume * 100)}%</span></div><input type="range" min={0} max={100} value={Math.round(opts.volume * 100)} onChange={(event) => onOpts({ volume: Number(event.target.value) / 100 })} className="slider w-full" /></div>
            <div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px]">{t.hudSize}</div><div className="flex flex-wrap gap-1">{([0.65, 0.85, 1, 1.25, 1.5] as const).map((size) => <PxChip key={size} on={opts.hudScale === size} onClick={() => onOpts({ hudScale: size })}>{size === 0.65 ? t.hudTiny : size === 0.85 ? t.hudSmall : size === 1 ? t.hudNormal : size === 1.25 ? t.hudLarge : t.hudHuge}</PxChip>)}</div></div>
            <div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px]">{t.accessibility}</div><PxRow label={t.keyboardOnly}><PxChip on={opts.keyboardOnly} onClick={() => onOpts({ keyboardOnly: !opts.keyboardOnly })}>{opts.keyboardOnly ? t.on : t.off}</PxChip></PxRow></div>
          </div>}

          {tab === "language" && <div className="flex flex-col gap-2"><PxHeading>{t.language}</PxHeading>{LANGS.map((language) => <PxButton key={language} tone="menu" active={opts.language === language} onClick={() => onOpts({ language })} className="text-[9px]">{I18N[language].langName}{opts.language === language && <span className="ml-auto text-[#ffd44a]">■</span>}</PxButton>)}</div>}

          {tab === "ranking" && <div className="flex flex-col gap-2"><PxHeading>{t.ranking} · TOP 50</PxHeading><div className="px-inset"><div className="ranking-head"><span>#</span><span>{t.name}</span><span>{t.score}</span><span>{t.wave}</span><span>{t.time}</span></div><div className="scrollbar-thin max-h-[55vh] overflow-y-auto">{scores.length === 0 ? <div className="p-8 text-center font-pixel text-[8px] text-[#6c3a42]">{t.noScores}</div> : scores.slice(0, 50).map((score, index) => <div key={`${score.date}-${index}`} className={`ranking-row ${index < 3 ? "is-top" : ""}`}><span>{index + 1}</span><span>{score.name}</span><span>{score.score.toLocaleString()}</span><span>{score.wave}</span><span>{formatTime(score.time)}</span></div>)}</div></div>{scores.length > 0 && <PxButton tone="dark" onClick={onClearScores} className="py-2 text-[7px]">{t.clear}</PxButton>}</div>}

          <PxButton tone="dark" onClick={() => setTab("main")} className="mt-4 w-full py-3 text-[8px]">◀ {t.menu}</PxButton>
        </PxFrame>
      </div>
    );
  }

  const basics = [
    { icon: "player", title: g.move, detail: isTouch ? g.touchMove : g.moveHelp },
    { icon: "icoCrosshair", title: g.aim, detail: isTouch ? g.touchAim : g.aimHelp },
    { icon: "icoKatana", title: g.attack, detail: isTouch ? g.touchAttack : g.attackHelp },
    { icon: "icoDash", title: g.dash, detail: isTouch ? g.touchDash : g.dashHelp },
  ];

  return (
    <div className="menu-arena absolute inset-0 z-20 overflow-y-auto">
      <div className="menu-grid mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-4 py-6 sm:px-8">
        <header className="flex items-end justify-between border-b-4 border-[#6b2530] pb-4">
          <div>
            <div className="font-pixel text-[8px] text-[#e6535c]">RONIN</div>
            <h1 className="font-pixel mt-2 text-[24px] leading-none text-[#f4e4cf] sm:text-[42px]">ARENA <span className="text-[#e6535c]">CARMESIM</span></h1>
            <p className="font-pixel mt-3 max-w-2xl text-[7px] leading-5 text-[#91b9b5] sm:text-[8px]">{g.menuLead}</p>
          </div>
          <div className="hidden items-end gap-2 sm:flex"><PixelSprite name="grunt" scale={3} className="opacity-70" /><PixelSprite name="player" scale={5} className="anim-bob" /><PixelSprite name="boss" scale={2} className="opacity-80" /></div>
        </header>

        <main className="py-5">
          <section className="mb-4">
            <div className="mb-2 font-pixel text-[7px] text-[#ffd44a]">{t.difficulty}</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <PxButton key={level} tone="menu" active={difficulty === level} onClick={() => onDifficulty(level)} className="min-h-14 flex-col items-start gap-1 px-3 py-3 text-left">
                  <strong className="font-pixel text-[8px]">{t[`difficulty${level[0].toUpperCase()}${level.slice(1)}` as "difficultyEasy" | "difficultyMedium" | "difficultyHard"]}</strong>
                  <span className="font-pixel text-[5px] leading-4 text-[#a9c3be]">{t[`difficulty${level[0].toUpperCase()}${level.slice(1)}Desc` as "difficultyEasyDesc" | "difficultyMediumDesc" | "difficultyHardDesc"]}</span>
                </PxButton>
              ))}
            </div>
          </section>
          <button onClick={onStart} className="menu-play group w-full">
            <span className="font-pixel text-[16px] sm:text-[24px]">▶ {t.play}</span>
            <span className="font-pixel text-[7px] text-[#3c171b]">{isTouch ? t.touchStart : t.start}</span>
          </button>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">{basics.map((item) => <div key={item.title} className="menu-control"><PixelSprite name={item.icon} scale={2} /><div><strong>{item.title}</strong><span>{item.detail}</span></div></div>)}</div>

          <div className="mt-3 flex items-center gap-3 border-l-4 border-[#ffd44a] bg-[#10282b] px-4 py-3"><PixelSprite name="coin" scale={2} /><div className="font-pixel text-[7px] leading-5 text-[#b6ddd8]"><strong className="text-[#ffd44a]">{g.shopSoon}</strong><br />{g.shopHelp}</div></div>
        </main>

        <footer className="grid gap-2 border-t-4 border-[#35141b] pt-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <PxButton tone="menu" onClick={() => setTab("settings")} className="text-[8px]"><PixelSprite name="icoGear" scale={1} />{t.settings}</PxButton>
          <PxButton tone="menu" onClick={() => setTab("language")} className="text-[8px]"><PixelSprite name="icoGlobe" scale={1} />{t.language}</PxButton>
          <PxButton tone="menu" onClick={() => setTab("ranking")} className="text-[8px]"><PixelSprite name="icoTrophy" scale={1} />{t.ranking}</PxButton>
          <div className="menu-record"><span>{t.best}</span><strong>{best.toLocaleString()}</strong></div>
        </footer>
      </div>
    </div>
  );
}
