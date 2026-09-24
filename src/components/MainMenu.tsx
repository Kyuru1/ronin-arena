import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Difficulty, KeyboardAction, KeyboardBindings, Perk } from "../game/engine";
import { I18N, LANGS, type Language } from "../game/i18n";
import type { ScoreEntry } from "../game/storage";
import AccountPanel from "./AccountPanel";
import type { PlayerProfile } from "../game/auth";
import PixelSprite from "./PixelSprite";
import { PxButton, PxChip, PxFrame, PxHeading, PxRow } from "./PixelUi";
import { useMenuNavigation } from "./useMenuNavigation";
import CharacterDetails from "./CharacterDetails";
import { PERKS } from "../game/perks";
import { formatTime } from "../game/storage";
import { MENU_UI, PERK_TEXT } from "../game/localizedContent";

export interface UiOpts {
  sound: boolean;
  soundEffects: boolean;
  music: boolean;
  volume: number;
  shake: boolean;
  flash: boolean;
  quality: "high" | "low";
  vsync: boolean;
  language: Language;
  hudScale: 0.65 | 0.85 | 1 | 1.25 | 1.5;
  textScale: 0.85 | 1 | 1.15;
  keyboardOnly: boolean;
  keyboardBindings: KeyboardBindings;
}

type MenuTab = "main" | "settings" | "language" | "ranking" | "account" | "controls";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }> ;
}

export default function MainMenu({ onStart, onPerk, difficulty, onDifficulty, scores, opts, onOpts, onFullscreen, profile, onProfile, openAccount, onOpenCoop }: {
  onStart: (difficulty?: Difficulty) => void;
  onPerk: (perk: Perk | null) => void;

  difficulty: Difficulty;
  onDifficulty: (difficulty: Difficulty) => void;
  scores: ScoreEntry[];
  opts: UiOpts;
  onOpts: (o: Partial<UiOpts>) => void;
  onFullscreen: () => void;
  profile: PlayerProfile | null;
  onProfile: (profile: PlayerProfile | null) => void;
  openAccount: boolean;
  onOpenCoop?: () => void;
}) {
  useMenuNavigation();
  const [tab, setTab] = useState<MenuTab>("main");
  const [accountNotice, setAccountNotice] = useState<string | null>(null);
  const [playStep, setPlayStep] = useState<"difficulty" | "perk" | null>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [rankingDifficulty, setRankingDifficulty] = useState<Difficulty>("medium");
  const [capturing, setCapturing] = useState<KeyboardAction | null>(null);
  const [selectedRanking, setSelectedRanking] = useState<ScoreEntry | null>(null);
  const labels = opts.language === "en" ? { controls: "CONTROLS", keyboard: "KEYBOARD · CLICK TO REMAP", gamepad: "GAMEPAD", up: "MOVE UP", down: "MOVE DOWN", left: "MOVE LEFT", right: "MOVE RIGHT", attack: "ATTACK", dash: "DASH", special: "SPECIAL ABILITY", prev: "PREVIOUS WEAPON", next: "NEXT WEAPON", move: "MOVE", aim: "AIM", leftStick: "LEFT STICK", rightStick: "RIGHT STICK", attackPad: "A or RT", dashPad: "B or RB", specialPad: "Y / TRIANGLE", swapPad: "LB / RB or D-PAD", pause: "PAUSE", pausePad: "MENU / START", hint: "KEYBOARD AND CONTROLLER WORK TOGETHER WHEN A CONTROLLER IS CONNECTED.", press: "PRESS", space: "SPACE", details: "DETAILS", close: "CLOSE", run: "RUN OF", score: "SCORE", wave: "WAVE", kills: "KILLS", coins: "COINS" } : opts.language === "fr" ? { controls: "COMMANDES", keyboard: "CLAVIER · CLIQUEZ POUR REMAPPER", gamepad: "MANETTE", up: "MONTER", down: "DESCENDRE", left: "GAUCHE", right: "DROITE", attack: "ATTAQUER", dash: "DASH", special: "CAPACITÉ SPÉCIALE", prev: "ARME PRÉCÉDENTE", next: "ARME SUIVANTE", move: "BOUGER", aim: "VISER", leftStick: "STICK GAUCHE", rightStick: "STICK DROIT", attackPad: "A ou RT", dashPad: "B ou RB", specialPad: "Y / TRIANGLE", swapPad: "LB / RB ou CROIX", pause: "PAUSE", pausePad: "MENU / START", hint: "CLAVIER ET MANETTE FONCTIONNENT ENSEMBLE.", press: "APPUYEZ", space: "ESPACE", details: "DÉTAILS", close: "FERMER", run: "RUN DE", score: "SCORE", wave: "VAGUE", kills: "ÉLIMINATIONS", coins: "PIÈCES" } : opts.language === "de" ? { controls: "STEUERUNG", keyboard: "TASTATUR · KLICKEN ZUM BELEGEN", gamepad: "CONTROLLER", up: "NACH OBEN", down: "NACH UNTEN", left: "NACH LINKS", right: "NACH RECHTS", attack: "ANGRIFF", dash: "DASH", special: "SPEZIALFÄHIGKEIT", prev: "VORHERIGE WAFFE", next: "NÄCHSTE WAFFE", move: "BEWEGEN", aim: "ZIELEN", leftStick: "LINKER STICK", rightStick: "RECHTER STICK", attackPad: "A oder RT", dashPad: "B oder RB", specialPad: "Y / DREIECK", swapPad: "LB / RB oder KREUZ", pause: "PAUSE", pausePad: "MENÜ / START", hint: "TASTATUR UND CONTROLLER FUNKTIONIEREN ZUSAMMEN.", press: "DRÜCKEN", space: "LEERTASTE", details: "DETAILS", close: "SCHLIESSEN", run: "RUN VON", score: "PUNKTE", wave: "WELLE", kills: "BESIEGT", coins: "MÜNZEN" } : opts.language === "zh" ? { controls: "操作", keyboard: "键盘·点击重新绑定", gamepad: "手柄", up: "向上移动", down: "向下移动", left: "向左移动", right: "向右移动", attack: "攻击", dash: "冲刺", special: "特殊技能", prev: "上一把武器", next: "下一把武器", move: "移动", aim: "瞄准", leftStick: "左摇杆", rightStick: "右摇杆", attackPad: "A 或 RT", dashPad: "B 或 RB", specialPad: "Y / 三角", swapPad: "LB / RB 或方向键", pause: "暂停", pausePad: "菜单 / START", hint: "连接手柄后，键盘和手柄可以同时使用。", press: "按下", space: "空格", details: "详情", close: "关闭", run: "玩家", score: "分数", wave: "波次", kills: "击杀", coins: "金币" } : { controls: "CONTROLES", keyboard: "TECLADO · CLIQUE PARA REMAPEAR", gamepad: "CONTROLE", up: "MOVER CIMA", down: "MOVER BAIXO", left: "MOVER ESQUERDA", right: "MOVER DIREITA", attack: "ATACAR", dash: "DASH", special: "HABILIDADE ESPECIAL", prev: "ARMA ANTERIOR", next: "PRÓXIMA ARMA", move: "MOVER", aim: "MIRAR", leftStick: "ANALÓGICO ESQUERDO", rightStick: "ANALÓGICO DIREITO", attackPad: "A ou RT", dashPad: "B ou RB", specialPad: "Y / TRIÂNGULO", swapPad: "LB / RB ou DIRECIONAL", pause: "PAUSAR", pausePad: "MENU / START", hint: "TECLADO E CONTROLE FUNCIONAM JUNTOS QUANDO O CONTROLE ESTIVER CONECTADO.", press: "PRESSIONE", space: "ESPAÇO", details: "DETALHES", close: "FECHAR", run: "RUN DE", score: "PONTOS", wave: "ONDA", kills: "ABATES", coins: "MOEDAS" };
  const bindingLabels: Array<[KeyboardAction, string]> = [["up", labels.up], ["down", labels.down], ["left", labels.left], ["right", labels.right], ["attack", labels.attack], ["dash", labels.dash], ["specialAbility", labels.special], ["prev", labels.prev], ["next", labels.next]];
  useEffect(() => {
    if (!capturing) return;
    const onCapture = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const value = event.key.toLowerCase();
      onOpts({ keyboardBindings: { ...opts.keyboardBindings, [capturing]: value } });
      setCapturing(null);
    };
    window.addEventListener("keydown", onCapture, true);
    return () => window.removeEventListener("keydown", onCapture, true);
  }, [capturing, onOpts, opts.keyboardBindings]);
  const keyLabel = (key: string) => key === " " ? labels.space : key === "escape" ? "ESC" : key.length === 1 ? key.toUpperCase() : key.toUpperCase();
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
  const menuText = MENU_UI[opts.language];

  useEffect(() => {
    if (openAccount) setTab("account");
  }, [openAccount]);

  if (tab !== "main") {
    return (
      <div className="px-backdrop absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
        <PxFrame className={`anim-pop my-auto w-full p-4 sm:p-6 ${tab === "account" ? "max-w-3xl" : "max-w-xl"}`}>
          {tab === "settings" && <div className="flex flex-col gap-3">
            <PxHeading>{t.settings}</PxHeading>
            <div className="grid gap-2 sm:grid-cols-2">
              <PxRow label={t.quality}>{(["high", "low"] as const).map((quality) => <PxChip key={quality} on={opts.quality === quality} onClick={() => onOpts({ quality })}>{quality === "high" ? t.qualityHigh : t.qualityLow}</PxChip>)}</PxRow>
              <PxRow label={t.vsync}><PxChip on={opts.vsync} onClick={() => onOpts({ vsync: !opts.vsync })}>{opts.vsync ? t.on : t.off}</PxChip></PxRow>
              <PxRow label={t.screenShake}><PxChip on={opts.shake} onClick={() => onOpts({ shake: !opts.shake })}>{opts.shake ? t.on : t.off}</PxChip></PxRow>
              <PxRow label={t.screenFlash}><PxChip on={opts.flash} onClick={() => onOpts({ flash: !opts.flash })}>{opts.flash ? t.on : t.off}</PxChip></PxRow>
              <PxRow label={t.sound}><PxChip on={opts.sound} onClick={() => onOpts({ sound: !opts.sound })}>{opts.sound ? t.on : t.off}</PxChip></PxRow><PxRow label="EFEITOS SONOROS"><PxChip on={opts.soundEffects} onClick={() => onOpts({ soundEffects: !opts.soundEffects })}>{opts.soundEffects ? t.on : t.off}</PxChip></PxRow><PxRow label="MÚSICA"><PxChip on={opts.music} onClick={() => onOpts({ music: !opts.music })}>{opts.music ? t.on : t.off}</PxChip></PxRow>
              <PxRow label={t.fullscreen}><PxChip on onClick={onFullscreen}>{t.enter}</PxChip></PxRow>
            </div>
            <div className="px-inset p-3"><div className="mb-2 flex justify-between font-pixel text-[7px]"><span>{t.volume}</span><span className="text-[#ffd44a]">{Math.round(opts.volume * 100)}%</span></div><input type="range" min={0} max={100} value={Math.round(opts.volume * 100)} onChange={(event) => onOpts({ volume: Number(event.target.value) / 100 })} className="slider w-full" /></div>
            <div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px]">{t.hudSize}</div><div className="flex flex-wrap gap-1">{([0.65, 0.85, 1, 1.25, 1.5] as const).map((size) => <PxChip key={size} on={opts.hudScale === size} onClick={() => onOpts({ hudScale: size })}>{size === 0.65 ? t.hudTiny : size === 0.85 ? t.hudSmall : size === 1 ? t.hudNormal : size === 1.25 ? t.hudLarge : t.hudHuge}</PxChip>)}</div></div><div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px]">{t.textSize}</div><div className="flex flex-wrap gap-1">{([0.85, 1, 1.15] as const).map((size) => <PxChip key={size} on={opts.textScale === size} onClick={() => onOpts({ textScale: size })}>{size === 0.85 ? t.textSmall : size === 1 ? t.textNormal : t.textLarge}</PxChip>)}</div></div>
            <div className="px-inset p-3"><div className="mb-2 font-pixel text-[7px]">{t.accessibility}</div><PxRow label={t.keyboardOnly}><PxChip on={opts.keyboardOnly} onClick={() => onOpts({ keyboardOnly: !opts.keyboardOnly })}>{opts.keyboardOnly ? t.on : t.off}</PxChip></PxRow></div>
          </div>}

          {tab === "language" && <div className="flex flex-col gap-2"><PxHeading>{t.language}</PxHeading>{LANGS.map((language) => <PxButton key={language} tone="menu" active={opts.language === language} onClick={() => onOpts({ language })} className="text-[9px]">{I18N[language].langName}{opts.language === language && <span className="ml-auto text-[#ffd44a]">■</span>}</PxButton>)}</div>}

          {tab === "controls" && <div className="flex flex-col gap-3"><PxHeading>{labels.controls}</PxHeading><div className="controls-grid"><div className="px-inset p-3"><h3 className="controls-title">{labels.keyboard}</h3><div className="controls-list">{bindingLabels.map(([action, label]) => <div key={action} className="control-bind"><span>{label}</span><button onClick={() => setCapturing(action)} className={capturing === action ? "is-capturing" : ""}>{capturing === action ? labels.press : keyLabel(opts.keyboardBindings[action])}</button></div>)}</div></div><div className="px-inset p-3"><h3 className="controls-title">{labels.gamepad}</h3><div className="controls-list">{[[labels.move, labels.leftStick], [labels.aim, labels.rightStick], [labels.attack, labels.attackPad], [labels.dash, labels.dashPad], [labels.special, labels.specialPad], [labels.next, labels.swapPad], [labels.pause, labels.pausePad]].map(([action, binding]) => <div key={action} className="control-pad-row"><span>{action}</span><strong>{binding}</strong></div>)}</div></div></div><div className="px-inset p-3 text-center font-pixel text-[7px] leading-5 text-[#91b9b5]">{labels.hint}</div></div>}

          {tab === "account" && (
            <div className="flex flex-col gap-3">
              {accountNotice && (
                <div className="px-inset p-3 text-center font-pixel text-[8px] text-[#ffd44a] bg-[#422006]/80 border border-[#b45309]">
                  {accountNotice}
                </div>
              )}
              <AccountPanel profile={profile} onProfile={onProfile} />
            </div>
          )}

          {tab === "ranking" && <div className="flex flex-col gap-2">
            <PxHeading>{t.ranking} · TOP 50</PxHeading>
            <div className="flex gap-1">{(["easy", "medium", "hard"] as const).map((level) => { const key = `difficulty${level[0].toUpperCase()}${level.slice(1)}` as "difficultyEasy" | "difficultyMedium" | "difficultyHard"; return <PxChip key={level} on={rankingDifficulty === level} onClick={() => setRankingDifficulty(level)}>{t[key]}</PxChip>; })}</div>
            <div className="px-inset">
              <div className="ranking-head ranking-row-detailed"><span>#</span><span>{t.name}</span><span>{labels.details}</span><span>{t.wave}</span><span>{t.score}</span><span>{t.kills}</span></div>
              <div className="scrollbar-thin max-h-[75vh] overflow-y-auto">
                {scores.filter((score) => score.difficulty === rankingDifficulty).slice(0, 50).length === 0
                  ? <div className="p-8 text-center font-pixel text-[8px] text-[#6c3a42]">{t.noScores}</div>
                  : scores.filter((score) => score.difficulty === rankingDifficulty).slice(0, 50).map((score, index) =>
                    <div key={`${score.date}-${index}`} className={`ranking-row ranking-row-detailed ${index < 3 ? "is-top" : ""}`}>
                      <span>{index + 1}</span>
                      <span className="flex min-w-0 items-center gap-2 overflow-hidden"><PixelSprite name={score.avatarId === "samurai" ? "player" : score.avatarId ?? "player"} scale={1} /><span className="min-w-0 truncate">{score.name}</span></span>
                      <button className="ranking-details-button" onClick={() => setSelectedRanking(score)}>{labels.details}</button>
                      <span>{score.wave}</span><span>{score.score.toLocaleString()}</span><span>{score.kills}</span>
                    </div>)}
              </div>
            </div>
          </div>}
          {createPortal(selectedRanking && <div className="ranking-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Detalhes da run de ${selectedRanking.name}`} onMouseDown={(event) => { if (event.currentTarget === event.target) setSelectedRanking(null); }}>
            <PxFrame title={`${labels.run} ${selectedRanking.name}`} className="ranking-modal anim-pop">
              <div className="ranking-modal-summary">
                <strong>{selectedRanking.name}</strong>
                <span>SCORE {selectedRanking.score.toLocaleString()}</span>
                <span>WAVE {selectedRanking.wave}</span>
                <span>{selectedRanking.kills} {labels.kills}</span>
                <span>{selectedRanking.coins ?? "—"} {labels.coins}</span>
                <span>{formatTime(selectedRanking.time)}</span>
              </div>
              <CharacterDetails data={{
                ...selectedRanking.details,
                avatarId: selectedRanking.avatarId,
                raceId: selectedRanking.raceId,
                perk: selectedRanking.perk,
                weapons: selectedRanking.weapons,
                gameMode: selectedRanking.gameMode,
                coins: selectedRanking.coins,
                wave: selectedRanking.wave,
                kills: selectedRanking.kills,
                score: selectedRanking.score,
                time: selectedRanking.time,
              }} abilityBinding="F · Y / TRIANGLE" language={opts.language} />
              <PxButton tone="dark" onClick={() => setSelectedRanking(null)} className="mt-3 w-full py-3 text-[8px]">{labels.close}</PxButton>
            </PxFrame>
          </div>, document.body)}

          <PxButton tone="dark" onClick={() => setTab("main")} className="mt-4 w-full py-3 text-[8px]">◀ {t.menu}</PxButton>
        </PxFrame>
      </div>
    );
  }

  if (playStep === "perk") {
    const available = difficulty === "hard" ? PERKS.filter((perk) => !["bladeMonk", "bloodContract", "sharpGlass", "lastBullet"].includes(perk.id)) : PERKS;
    return (
      <div className="px-backdrop absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
        <PxFrame title={menuText.perkTitle} className="anim-pop w-full max-w-5xl p-4 sm:p-6 lg:p-8">
          <div className="mb-4 text-center font-pixel text-[8px] leading-5 text-[#91b9b5] sm:text-[9px]">{menuText.perkLead}</div>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">{available.map((perk) => { const text = PERK_TEXT[opts.language][perk.id]; return <PxButton key={perk.id} tone="menu" onClick={() => { onPerk(perk.id); setPlayStep(null); onStart(difficulty); }} className="min-h-28 flex-col items-start gap-3 p-4 text-left sm:min-h-32 sm:p-5"><strong className="font-pixel text-[9px] leading-5 text-[#ffd44a] sm:text-[10px]">{text[0]}</strong><span className="font-pixel text-[7px] leading-5 text-[#a9c3be] sm:text-[8px] sm:leading-6">{text[1]}</span></PxButton>; })}</div>
          <PxButton tone="dark" onClick={() => setPlayStep("difficulty")} className="mt-4 w-full py-4 text-[9px] sm:text-[10px]">{menuText.back}</PxButton>
        </PxFrame>
      </div>
    );
  }
  if (playStep === "difficulty") {
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
                <PxButton key={level} tone="menu" active={difficulty === level} onClick={() => { onDifficulty(level); setPlayStep("perk"); }} className="min-h-32 flex-col items-center justify-center gap-3 px-3 py-4 text-center">
                  <strong className="font-pixel text-[9px]">{t[titleKey]}</strong>
                  <span className="font-pixel text-[5px] leading-4 text-[#a9c3be]">{t[descKey]}</span>
                </PxButton>
              );
            })}
          </div>
          <PxButton tone="dark" onClick={() => setPlayStep(null)} className="mt-5 w-full py-3 text-[8px]">◀ {t.menu}</PxButton>
        </PxFrame>
      </div>
    );
  }

  return (
    <div className="menu-arena absolute inset-0 z-20 overflow-y-auto">
      <div className="menu-grid mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center px-4 py-6 sm:px-8">
        <header className="menu-title-panel w-full text-center"><img src={`${import.meta.env.BASE_URL}kyu-arena-logo.png`} alt="KYU ARENA" className="mx-auto max-h-[38dvh] w-auto max-w-[min(76vw,430px)] object-contain drop-shadow-[0_0_22px_rgba(224,68,77,.35)]" /></header>

        <main className="menu-actions flex w-full max-w-sm flex-col items-center gap-3 py-6">
          <button onClick={() => setPlayStep("difficulty")} className="menu-play group w-full">
            <span className="font-pixel text-[16px] sm:text-[22px]">▶ {t.play}</span>
          </button>
          <button
            onClick={() => {
              if (!profile) {
                setAccountNotice(menuText.loginCoop);
                setTab("account");
              } else if (onOpenCoop) {
                onOpenCoop();
              }
            }}
            className="menu-play group w-full border-[#38bdf8] hover:border-[#7dd3fc] bg-gradient-to-r from-[#0c4a6e]/70 via-[#075985]/60 to-[#0c4a6e]/70 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          >
            <span className="font-pixel text-[13px] sm:text-[16px] text-[#7dd3fc] flex items-center justify-center gap-2">
                👥 {menuText.coop}
            </span>
          </button>
        </main>

        <footer className="menu-options grid w-full max-w-2xl grid-cols-2 gap-2">
          <PxButton tone="menu" onClick={() => setTab("settings")} className="justify-center text-[8px]"><PixelSprite name="icoGear" scale={1} />{t.settings}</PxButton>
          <PxButton tone="menu" onClick={() => setTab("controls")} className="justify-center text-[8px]"><PixelSprite name="icoBook" scale={1} />{labels.controls}</PxButton>
          <PxButton tone="menu" onClick={() => setTab("language")} className="justify-center text-[8px]"><PixelSprite name="icoGlobe" scale={1} />{t.language}</PxButton>
          <PxButton tone="menu" onClick={() => setTab("ranking")} className="justify-center text-[8px]"><PixelSprite name="icoTrophy" scale={1} />{t.ranking}</PxButton>
          <PxButton tone="menu" onClick={() => setTab("account")} className="min-w-0 justify-center overflow-hidden text-[8px]"><PixelSprite name="player" scale={1} /><span className="min-w-0 max-w-full truncate">{profile ? profile.username : menuText.profile}</span></PxButton>
          <PxButton tone="gold" onClick={() => void installGame()} disabled={!installPrompt} className="menu-install justify-center text-[8px]">↓ {t.install}</PxButton>
        </footer>
      </div>
    </div>
  );
}
