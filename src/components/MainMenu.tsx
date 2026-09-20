import { useEffect, useState } from "react";
import type { Difficulty } from "../game/engine";
import { I18N, LANGS, type Language } from "../game/i18n";
import type { ScoreEntry } from "../game/storage";
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
  textScale: 0.85 | 1 | 1.15;
  keyboardOnly: boolean;
}

type MenuTab = "main" | "settings" | "language" | "ranking";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }> ;
}

export default function MainMenu({ onStart, difficulty, onDifficulty, scores, best, opts, onOpts, onFullscreen }: {
  onStart: (difficulty?: Difficulty) => void;
  difficulty: Difficulty;
  onDifficulty: (difficulty: Difficulty) => void;
  scores: ScoreEntry[];
  best: number;
  opts: UiOpts;
  onOpts: (o: Partial<UiOpts>) => void;
  onFullscreen: () => void;
}) {
  const [tab, setTab] = useState<MenuTab>("main");
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [rankingDifficulty, setRankingDifficulty] = useState<Difficulty>("medium");
  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);
  const installGame = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };
  const t = I18N[opts.language];

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
            <div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px]">{t.hudSize}</div><div className="flex flex-wrap gap-1">{([0.65, 0.85, 1, 1.25, 1.5] as const).map((size) => <PxChip key={size} on={opts.hudScale === size} onClick={() => onOpts({ hudScale: size })}>{size === 0.65 ? t.hudTiny : size === 0.85 ? t.hudSmall : size === 1 ? t.hudNormal : size === 1.25 ? t.hudLarge : t.hudHuge}</PxChip>)}</div></div><div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px]">{t.textSize}</div><div className="flex flex-wrap gap-1">{([0.85, 1, 1.15] as const).map((size) => <PxChip key={size} on={opts.textScale === size} onClick={() => onOpts({ textScale: size })}>{size === 0.85 ? t.textSmall : size === 1 ? t.textNormal : t.textLarge}</PxChip>)}</div></div>
            <div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px]">{t.accessibility}</div><PxRow label={t.keyboardOnly}><PxChip on={opts.keyboardOnly} onClick={() => onOpts({ keyboardOnly: !opts.keyboardOnly })}>{opts.keyboardOnly ? t.on : t.off}</PxChip></PxRow></div>
          </div>}

          {tab === "language" && <div className="flex flex-col gap-2"><PxHeading>{t.language}</PxHeading>{LANGS.map((language) => <PxButton key={language} tone="menu" active={opts.language === language} onClick={() => onOpts({ language })} className="text-[9px]">{I18N[language].langName}{opts.language === language && <span className="ml-auto text-[#ffd44a]">■</span>}</PxButton>)}</div>}

          {tab === "ranking" && <div className="flex flex-col gap-2"><PxHeading>{t.ranking} · TOP 50</PxHeading><div className="flex gap-1">{(["easy", "medium", "hard"] as const).map((level) => { const key = `difficulty${level[0].toUpperCase()}${level.slice(1)}` as "difficultyEasy" | "difficultyMedium" | "difficultyHard"; return <PxChip key={level} on={rankingDifficulty === level} onClick={() => setRankingDifficulty(level)}>{t[key]}</PxChip>; })}</div><div className="px-inset"><div className="ranking-head"><span>#</span><span>{t.name}</span><span>{t.wave}</span><span>{t.score}</span><span>{t.kills}</span></div><div className="scrollbar-thin max-h-[75vh] overflow-y-auto">{scores.filter((score) => score.difficulty === rankingDifficulty).slice(0, 50).length === 0 ? <div className="p-8 text-center font-pixel text-[8px] text-[#6c3a42]">{t.noScores}</div> : scores.filter((score) => score.difficulty === rankingDifficulty).slice(0, 50).map((score, index) => <div key={`${score.date}-${index}`} className={`ranking-row ranking-row-four ${index < 3 ? "is-top" : ""}`}><span>{index + 1}</span><span>{score.name}</span><span>{score.wave}</span><span>{score.score.toLocaleString()}</span><span>{score.kills}</span></div>)}</div></div></div>}

          <PxButton tone="dark" onClick={() => setTab("main")} className="mt-4 w-full py-3 text-[8px]">◀ {t.menu}</PxButton>
        </PxFrame>
      </div>
    );
  }

  if (difficultyOpen) {
    return (
      <div className="px-backdrop absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
        <PxFrame title={t.difficulty} className="anim-pop w-full max-w-2xl p-4 sm:p-6">
          <div className="mb-4 text-center font-pixel text-[7px] leading-5 text-[#91b9b5] sm:text-[8px]">
            {t.start}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["easy", "medium", "hard"] as const).map((level) => {
              const titleKey = `difficulty${level[0].toUpperCase()}${level.slice(1)}` as "difficultyEasy" | "difficultyMedium" | "difficultyHard";
              const descKey = `${titleKey}Desc` as "difficultyEasyDesc" | "difficultyMediumDesc" | "difficultyHardDesc";
              return (
                <PxButton key={level} tone="menu" active={difficulty === level} onClick={() => { onDifficulty(level); onStart(level); }} className="min-h-32 flex-col items-center justify-center gap-3 px-3 py-4 text-center">
                  <strong className="font-pixel text-[9px]">{t[titleKey]}</strong>
                  <span className="font-pixel text-[5px] leading-4 text-[#a9c3be]">{t[descKey]}</span>
                </PxButton>
              );
            })}
          </div>
          <PxButton tone="dark" onClick={() => setDifficultyOpen(false)} className="mt-5 w-full py-3 text-[8px]">◀ {t.menu}</PxButton>
        </PxFrame>
      </div>
    );
  }

  return (
    <div className="menu-arena absolute inset-0 z-20 overflow-y-auto">
      <div className="menu-grid mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center px-4 py-6 sm:px-8">
        <header className="w-full border-b-4 border-[#6b2530] pb-5 text-center">
          <div className="font-pixel text-[8px] tracking-[0.35em] text-[#e6535c]">KYU</div>
          <h1 className="font-pixel mt-3 text-[28px] leading-none text-[#f4e4cf] sm:text-[46px]">KYU<span className="text-[#e6535c]">-ARENA</span></h1>
        </header>

        <main className="flex w-full max-w-sm flex-col items-center gap-3 py-7">
          <button onClick={() => setDifficultyOpen(true)} className="menu-play group w-full">
            <span className="font-pixel text-[16px] sm:text-[22px]">▶ {t.play}</span>
          </button>
        </main>

        <footer className="flex w-full max-w-sm flex-col gap-2 border-t-4 border-[#35141b] pt-5">
          <PxButton tone="menu" onClick={() => setTab("settings")} className="justify-center text-[8px]"><PixelSprite name="icoGear" scale={1} />{t.settings}</PxButton>
          <PxButton tone="menu" onClick={() => setTab("language")} className="justify-center text-[8px]"><PixelSprite name="icoGlobe" scale={1} />{t.language}</PxButton>
          <PxButton tone="menu" onClick={() => setTab("ranking")} className="justify-center text-[8px]"><PixelSprite name="icoTrophy" scale={1} />{t.ranking}</PxButton>{installPrompt && <PxButton tone="gold" onClick={() => void installGame()} className="justify-center text-[8px]">↓ {t.install}</PxButton>}
          <div className="menu-record mt-2 text-center"><span>{t.best}</span><strong>{best.toLocaleString()}</strong></div>
        </footer>
      </div>
    </div>
  );
}
