import { useCallback, useEffect, useRef, useState } from "react";
import { Game, type HudStats, type PowerUp, type UpgradeOffer, type Weapon } from "./game/engine";
import { isMuted, setMuted, setVolume, unlockAudio } from "./game/audio";
import { clearScores, loadScores, saveScore, type ScoreEntry } from "./game/storage";
import { I18N } from "./game/i18n";
import Hud from "./components/Hud";
import { GameOverScreen, PauseScreen } from "./components/Screens";
import MainMenu, { type UiOpts } from "./components/MainMenu";
import ShopScreen from "./components/ShopScreen";

type UiPhase = "menu" | "playing" | "paused" | "upgrade" | "dead";

const emptyStats: HudStats = {
  hp: 5,
  maxHp: 5,
  score: 0,
  coins: 0,
  wave: 1,
  combo: 0,
  kills: 0,
  time: 0,
  dashReady: true,
  dashCd: 0,
  dashMax: 6,
  chain: 0,
  chainP: 0,
  weapons: ["katana"],
  activeSlot: 0,
  waveTotal: 0,
  waveLeft: 0,
  speedBonus: 0,
  dashSpeedMult: 1,
  mineTutorial: false,
};

const OPT_KEY = "ronin.options.v2";
const NAME_KEY = "ronin.lastname";

const defaultOpts: UiOpts = {
  sound: true,
  shake: true,
  flash: true,
  volume: 0.45,
  quality: "high",
  vsync: true,
  language: "pt",
  hudScale: 1.25,
};

function loadOpts(): UiOpts {
  try {
    const raw = localStorage.getItem(OPT_KEY);
    if (!raw) return defaultOpts;
    return { ...defaultOpts, ...(JSON.parse(raw) as Partial<UiOpts>) };
  } catch {
    return defaultOpts;
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  const [phase, setPhase] = useState<UiPhase>("menu");
  const [menuClosing, setMenuClosing] = useState(false);
  const [stats, setStats] = useState<HudStats>(emptyStats);
  const [finalStats, setFinalStats] = useState<HudStats>(emptyStats);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [rank, setRank] = useState(-1);
  const [pendingScore, setPendingScore] = useState(false);
  const [upgrade, setUpgrade] = useState<UpgradeOffer | null>(null);
  const [muted, setMutedState] = useState(false);
  const [opts, setOpts] = useState<UiOpts>(defaultOpts);
  const [isTouch, setIsTouch] = useState(false);

  /* boot */
  useEffect(() => {
    const o = loadOpts();
    setOpts(o);
    setMuted(!o.sound);
    setVolume(o.volume);
    setMutedState(!o.sound);
    document.fonts?.load('10px "Press Start 2P"').catch(() => {});
    setScores(loadScores());
    setIsTouch(
      typeof window !== "undefined" &&
        (window.matchMedia?.("(pointer: coarse)").matches || "ontouchstart" in window),
    );
  }, []);

  /* create engine once */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const game = new Game(canvas);
    gameRef.current = game;
    game.onStats = (s) => setStats(s);
    game.onGameOver = (s) => {
      setFinalStats(s);
      setPendingScore(s.score > 0);
      setRank(-1);
      setPhase("dead");
    };
    game.onUpgrade = (offer) => {
      setUpgrade(offer);
      setPhase("upgrade");
    };

    let pending = 0;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const w = e.contentRect.width;
      const h = e.contentRect.height;
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => game.resize(w, h));
    });
    ro.observe(wrap);
    game.resize(wrap.clientWidth, wrap.clientHeight);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(pending);
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    unlockAudio();
    setRank(-1);
    setPendingScore(false);
    setMenuClosing(true);
    window.setTimeout(() => {
      g.startGame();
      setPhase("playing");
      setMenuClosing(false);
    }, 260);
  }, []);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (g.phase === "playing") {
      g.pause();
      setPhase("paused");
    } else if (g.phase === "paused") {
      g.resume();
      setPhase("playing");
    }
  }, []);

  const pauseFromFocusLoss = useCallback(() => {
    const g = gameRef.current;
    if (g?.phase !== "playing") return;
    g.pause();
    setPhase("paused");
  }, []);

  const toMenu = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    g.reset();
    g.phase = "menu";
    setPhase("menu");
    setStats(emptyStats);
    setUpgrade(null);
    setScores(loadScores());
  }, []);

  const submitName = useCallback(
    (name: string) => {
      const clean = (name.trim() || I18N[opts.language].namePlaceholder).slice(0, 12).toUpperCase();
      try {
        localStorage.setItem(NAME_KEY, clean);
      } catch {
        /* ignore */
      }
      const { list, rank: r } = saveScore({
        name: clean,
        score: finalStats.score,
        wave: finalStats.wave,
        kills: finalStats.kills,
        time: finalStats.time,
        date: Date.now(),
      });
      setScores(list);
      setRank(r);
      setPendingScore(false);
    },
    [finalStats, opts.language],
  );

  const lastName = (() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
      return "";
    }
  })();

  const selectSlot = useCallback((slot: number) => {
    gameRef.current?.switchSlot(slot);
  }, []);

  const buyWeapon = useCallback((w: Weapon, cost: number) => {
    gameRef.current?.buyWeapon(w, cost);
  }, []);

  const sellWeapon = useCallback((slot: number, refund: number) => {
    gameRef.current?.sellWeapon(slot, refund);
  }, []);

  const buyPowerUp = useCallback((power: PowerUp, cost: number) => {
    gameRef.current?.buyPowerUp(power, cost);
  }, []);

  const closeShop = useCallback(() => {
    gameRef.current?.closeShop();
    setUpgrade(null);
    setPhase("playing");
  }, []);

  const applyOpts = useCallback((p: Partial<UiOpts>) => {
    setOpts((prev) => {
      const next = { ...prev, ...p };
      setMuted(!next.sound);
      setVolume(next.volume);
      setMutedState(!next.sound);
      gameRef.current?.setOpts({
        shake: next.shake ? 1 : 0,
        flash: next.flash ? 1 : 0,
        volume: next.volume,
        quality: next.quality,
        vsync: next.vsync,
      });
      try {
        localStorage.setItem(OPT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    const nextSound = isMuted();
    applyOpts({ sound: nextSound });
    setMutedState(!nextSound);
  }, [applyOpts]);

  const toggleFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  /* push persisted options to the engine on mount */
  useEffect(() => {
    gameRef.current?.setOpts({
      shake: opts.shake ? 1 : 0,
      flash: opts.flash ? 1 : 0,
      volume: opts.volume,
      quality: opts.quality,
      vsync: opts.vsync,
      language: opts.language,
    });
  }, [opts]);

  /* hotkeys */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const g = gameRef.current;
      if (!g) return;
      if (k === "escape" || k === "p") {
        e.preventDefault();
        if (g.phase === "playing" || g.phase === "paused") togglePause();
      } else if (k === "m") {
        toggleMute();
      } else if (g.phase === "menu" && (k === "enter" || k === " ")) {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start, togglePause, toggleMute]);

  /* pause when the player leaves the game window/tab */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) pauseFromFocusLoss();
    };
    window.addEventListener("blur", pauseFromFocusLoss);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", pauseFromFocusLoss);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pauseFromFocusLoss]);

  const best = scores.length ? scores[0].score : 0;
  const t = I18N[opts.language];

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#070305]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(117,16,29,0.25),transparent_65%)]" />

      <div ref={wrapRef} className="relative h-full w-full max-w-[1500px]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-contain" />

        {(phase === "playing" || phase === "paused") && (
          <Hud
            stats={stats}
            best={best}
            muted={muted}
            onMute={toggleMute}
            onPause={togglePause}
            onSelectSlot={selectSlot}
            hudScale={opts.hudScale}
            t={t}
          />
        )}

        {isTouch && phase === "playing" && (
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              gameRef.current?.touchDash();
            }}
            className={`pxb font-pixel absolute bottom-16 right-4 z-10 h-16 w-16 text-[9px] ${
              stats.dashReady ? "pxb-red" : "pxb-dark"
            }`}
          >
            {stats.dashReady ? t.dashLabel : `${Math.ceil(stats.dashCd)}s`}
          </button>
        )}

        {phase === "menu" && (
          <div className={menuClosing ? "anim-menu-out" : ""}>
            <MainMenu
              onStart={start}
              scores={scores}
              best={best}
              isTouch={isTouch}
              opts={opts}
              onOpts={applyOpts}
              onFullscreen={toggleFullscreen}
              onClearScores={() => {
                clearScores();
                setScores([]);
              }}
            />
          </div>
        )}

        {phase === "paused" && <PauseScreen stats={stats} onResume={togglePause} onQuit={toMenu} t={t} />}
        {phase === "dead" && (
          <GameOverScreen
            stats={finalStats}
            scores={scores}
            rank={rank}
            pendingScore={pendingScore}
            defaultName={lastName}
            onSubmitName={submitName}
            onRestart={start}
            onMenu={toMenu}
            t={t}
          />
        )}
        {phase === "upgrade" && upgrade && (
          <ShopScreen
            wave={upgrade.wave}
            stats={stats}
            onBuyWeapon={buyWeapon}
            onSellWeapon={sellWeapon}
            onSelectSlot={selectSlot}
            onBuyPowerUp={buyPowerUp}
            onCloseShop={closeShop}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
