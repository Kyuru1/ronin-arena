import { useCallback, useEffect, useRef, useState } from "react";
import { Game, type Difficulty, type InputMode, type Perk, type HudStats, type MagicType, type PowerUp, type SavedRun, type UpgradeOffer, type Weapon, type WeaponUpgrade } from "./game/engine";
import { isMuted, setMuted, setVolume, setSoundEffectsEnabled, setMusicEnabled, unlockAudio, Sfx } from "./game/audio";
import { loadRemoteScores, saveRemoteScore, type ScoreEntry } from "./game/storage";
import { I18N } from "./game/i18n";
import Hud from "./components/Hud";
import MobilePanelNavigation from "./components/MobilePanelNavigation";
import "./responsive-panels.css";
import { GameOverScreen, PauseScreen, SavedRunPrompt } from "./components/Screens";
import MainMenu, { type UiOpts } from "./components/MainMenu";
import ShopScreen from "./components/ShopScreen";
import TutorialScreen from "./components/TutorialScreen";
import InputModeScreen from "./components/InputModeScreen";
import CoopLobbyModal from "./components/CoopLobbyModal";
import RaceReveal from "./components/RaceReveal";
import { coopNet } from "./game/coopNet";
import type { RaceId } from "./game/races";

import { supabase } from "./lib/supabase";
import { loadProfile, type PlayerProfile } from "./game/auth";

type UiPhase = "menu" | "input-select" | "tutorial" | "playing" | "paused" | "upgrade" | "dead";

const emptyStats: HudStats = {
  hp: 5,
  maxHp: 5,
  score: 0,
  coins: 0,
  wave: 1,
  combo: 0,
  comboP: 0,
  kills: 0,
  time: 0,
  dashReady: true,
  dashCd: 0,
  dashMax: 6,
  chain: 0,
  chainP: 0,
  weapons: ["katana"],
  weaponsUsed: ["katana"],
  activeSlot: 0,
  waveTotal: 0,
  waveLeft: 0,
  speedBonus: 0,
  dashSpeedMult: 1,
  mineTutorial: false,
  potionTutorial: false,
  activePotion: null,
  activePotions: [],
  potionTime: 0,
  weaponLevels: {
    katana: { damage: 0, speed: 0, range: 0, form: 0 },
    bow: { damage: 0, speed: 0, range: 0, form: 0 },
    hammer: { damage: 0, speed: 0, range: 0, form: 0 },
    shield: { damage: 0, speed: 0, range: 0, form: 0 },
    mine: { damage: 0, speed: 0, range: 0, form: 0 },
    book: { damage: 0, speed: 0, range: 0, form: 0 },
    staff: { damage: 0, speed: 0, range: 0, form: 0 },
    harp: { damage: 0, speed: 0, range: 0, form: 0 },
    godslayer: { damage: 0, speed: 0, range: 0, form: 0 },
    boomerang: { damage: 0, speed: 0, range: 0, form: 0 },
    shuriken: { damage: 0, speed: 0, range: 0, form: 0 },
    spear: { damage: 0, speed: 0, range: 0, form: 0 },
  },
  magicType: "fire",
  difficulty: "medium",
  perk: null,
  raceId: "ronin",
  raceAbilityT: 0,
  raceAbilityCd: 0,
  avatarId: "samurai",
  gameMode: "solo",
  baseDamage: 2,
  damageMultiplier: 1.1,
  effectiveDamage: 2.2,
  moveSpeed: 113.4,
  attackSpeedMultiplier: 1,
  effectiveDashCooldown: 6,
  maxWeaponSlots: 4,
  perkBuffT: 0,
  perkEchoReady: false,
  isSpectating: false,
  spectatedName: null,
};

const OPT_KEY = "ronin.options.v2";
const NAME_KEY = "ronin.lastname";
const TUTORIAL_KEY = "ronin.tutorial.hidden.v1";
const POTION_TUTORIAL_KEY = "ronin.potion.tutorial.hidden.v1";
const RACE_REVEAL_KEY = "ronin.race.reveal.hidden.v1";
const RUN_KEY = "ronin.run.save.v2";

const defaultOpts: UiOpts = {
  sound: true,
  soundEffects: true,
  music: true,
  showHitboxes: false,
  shake: true,
  flash: true,
  volume: 0.45,
  quality: "high",
  vsync: true,
  language: "pt",
  hudScale: 1,
  textScale: 1,
  keyboardOnly: false,
  keyboardBindings: { up: "w", down: "s", left: "a", right: "d", attack: " ", dash: "shift", specialAbility: "f", prev: "q", next: "e", pause: "escape" },
};

function loadOpts(): UiOpts {
  try {
    const raw = localStorage.getItem(OPT_KEY);
    if (!raw) return defaultOpts;
    const saved = JSON.parse(raw) as Partial<UiOpts>;
    return { ...defaultOpts, ...saved, keyboardBindings: { ...defaultOpts.keyboardBindings, ...saved.keyboardBindings } };
  } catch {
    return defaultOpts;
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const profileRef = useRef<PlayerProfile | null>(null);

  const [phase, setPhase] = useState<UiPhase>("menu");
  const [menuClosing, setMenuClosing] = useState(false);
  const [stats, setStats] = useState<HudStats>(emptyStats);
  const [finalStats, setFinalStats] = useState<HudStats>(emptyStats);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [rank, setRank] = useState(-1);
  const [pendingScore, setPendingScore] = useState(false);
  const [scoreSaving, setScoreSaving] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState<UpgradeOffer | null>(null);
  const [muted, setMutedState] = useState(false);
  const [opts, setOpts] = useState<UiOpts>(defaultOpts);
  const [isTouch, setIsTouch] = useState(false);
  const [deviceChosen, setDeviceChosen] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [savedRun, setSavedRun] = useState<SavedRun | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("keyboardMouse");
  const [coopModalOpen, setCoopModalOpen] = useState(false);
  const [isCoopGame, setIsCoopGame] = useState(false);
  const [rematchWaiting, setRematchWaiting] = useState(false);
  const [rematchVotes, setRematchVotes] = useState(0);
  const [raceReveal, setRaceReveal] = useState<RaceId | null>(null);


  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let disposed = false;
    const syncProfile = async (user: { id: string; user_metadata: Record<string, unknown> } | null) => {
      if (!user) { if (!disposed) setProfile(null); return; }
      const optimistic: PlayerProfile = {
        id: user.id,
        username: String(user.user_metadata.username ?? "RONIN").trim().toUpperCase().slice(0, 12) || "RONIN",
        avatarId: (user.user_metadata.avatar_id ?? "samurai") as PlayerProfile["avatarId"],
      };
      if (!disposed) setProfile(optimistic);
      try {
        const loaded = await loadProfile(user as Parameters<typeof loadProfile>[0]);
        if (!disposed) setProfile(loaded);
      } catch { /* keep cached metadata available while the profile query recovers */ }
    };
    void client.auth.getSession().then(({ data: { session } }) => syncProfile(session?.user ?? null));
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      void syncProfile(session?.user ?? null);
    });
    return () => { disposed = true; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    const playButtonSound = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button:not(:disabled)");
      if (!button) return;
      unlockAudio();
      Sfx.uiClick();
    };
    document.addEventListener("click", playButtonSound);
    return () => document.removeEventListener("click", playButtonSound);
  }, []);
  /* boot */
  useEffect(() => {
    const o = loadOpts();
    setOpts(o);
    setMuted(!o.sound);
    setVolume(o.volume);
    setSoundEffectsEnabled(o.soundEffects !== false);
    setMusicEnabled(o.music !== false);
    setMutedState(!o.sound);
    document.fonts?.load('10px "Press Start 2P"').catch(() => {});
    void loadRemoteScores().then(setScores);
    setIsTouch(
      typeof window !== "undefined" &&
        (window.matchMedia?.("(pointer: coarse)").matches || "ontouchstart" in window),
    );
    try {
      const raw = localStorage.getItem(RUN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedRun;
        if (parsed.version === 2 && parsed.stats?.hp > 0) setSavedRun(parsed);
        else localStorage.removeItem(RUN_KEY);
      }
      localStorage.removeItem("ronin.run.save.v1");
    } catch {
      localStorage.removeItem(RUN_KEY);
    }
  }, []);

  /* create engine once */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const game = new Game(canvas);
    gameRef.current = game;
    try { game.setPotionTutorialHidden(localStorage.getItem(POTION_TUTORIAL_KEY) === "1"); } catch { /* ignore */ }
    game.onStats = (s) => setStats(s);
    game.onGameOver = (s) => {
      try { localStorage.removeItem(RUN_KEY); } catch { /* ignore storage errors */ }
      setSavedRun(null);
      setFinalStats(s);
      setPendingScore(s.score > 0 && !game.isCoop);
      setScoreSaving(false);
      setScoreError(null);
      setRank(-1);
      setRematchWaiting(false);
      setRematchVotes(0);
      setPhase("dead");
    };
    game.onUpgrade = (offer) => {
      if (!game.isCoop) {
        try { localStorage.setItem(RUN_KEY, JSON.stringify(game.saveRun(true))); } catch { /* ignore storage errors */ }
      }
      setUpgrade(offer);
      setPhase("upgrade");
    };
    game.onPause = () => {
      setPhase(game.phase === "paused" ? "paused" : "playing");
    };

    let pending = 0;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const w = e.contentRect.width;
      const h = e.contentRect.height;
      if (w < 2 || h < 2) return;
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

  const launchRun = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    game.setPerk(selectedPerk.current);
    game.setPlayerAvatar(profileRef.current?.avatarId ?? "samurai");
    try { localStorage.removeItem(RUN_KEY); } catch { /* ignore storage errors */ }
    const race = game.startGame();
    let raceRevealHidden = false;
    try { raceRevealHidden = localStorage.getItem(RACE_REVEAL_KEY) === "1"; } catch { /* ignore storage errors */ }
    if (raceRevealHidden) {
      setRaceReveal(null);
      setPhase("playing");
    } else {
      // Pausing only one client in a coop room would desync it from the host.
      if (!game.isCoop) game.pause();
      setRaceReveal(race);
      setPhase(game.isCoop ? "playing" : "paused");
    }
    setRank(-1);
    setPendingScore(false);
    setScoreSaving(false);
    setScoreError(null);
    setMenuClosing(false);
  }, []);

  const handleOpenCoop = useCallback(() => {
    setCoopModalOpen(true);
  }, []);

  const handleStartCoop = useCallback((isHost: boolean, coopDifficulty: Difficulty) => {
    const game = gameRef.current;
    if (!game) return;
    const roomPlayers = coopNet.roomPlayers();
    setIsCoopGame(true);
    game.isCoop = true;
    game.setOpts({ inputMode });
    game.isHost = isHost;
    game.setDifficulty(coopDifficulty);
    selectedPerk.current = coopNet.roomState?.players[profileRef.current?.id ?? coopNet.playerId ?? ""]?.perk ?? null;
    game.setPlayerAvatar(profileRef.current?.avatarId ?? "samurai");
    game.setCoopPlayers(profileRef.current?.id ?? coopNet.playerId ?? "", profileRef.current?.username ?? "RONIN", roomPlayers);
    game.onGamePacketOut = (packet) => coopNet.sendPacket(packet);
    coopNet.onGamePacket = (packet, senderId) => gameRef.current?.applyPeerPacket(packet, senderId);
    coopNet.onPeerLeft = () => gameRef.current?.coopPeerLeft();
    coopNet.onRematchUpdate = (votes) => {
      setRematchVotes(Object.keys(votes).length);
      setRematchWaiting(!!votes[coopNet.playerId ?? ""]);
    };
    coopNet.onRematchLobby = () => {
      const currentGame = gameRef.current;
      if (currentGame) {
        currentGame.isCoop = false;
        currentGame.peerRonin = null;
        currentGame.reset();
        currentGame.phase = "menu";
      }
      // Keep the existing realtime room and all of its members. Every client returns to the same lobby.
      setIsCoopGame(false);
      setRematchWaiting(false);
      setRematchVotes(0);
      setPhase("menu");
      setCoopModalOpen(true);
    };
    unlockAudio();
    setCoopModalOpen(false);
    launchRun();
  }, [launchRun, inputMode]);
  const selectedPerk = useRef<Perk | null>(null);
  const choosePerk = useCallback((perk: Perk | null) => { selectedPerk.current = perk; gameRef.current?.setPerk(perk); }, []);

  const start = useCallback((selectedDifficulty: Difficulty = difficulty) => {
    if (!gameRef.current) return;
    gameRef.current.setDifficulty(selectedDifficulty);
    unlockAudio();
    setMenuClosing(true);
    window.setTimeout(() => {
      let hidden = false;
      try {
        hidden = localStorage.getItem(TUTORIAL_KEY) === "1";
      } catch {
        /* ignore */
      }
      if (isTouch) {
        setInputMode("touch");
        gameRef.current?.setOpts({ inputMode: "touch" });
        if (hidden) launchRun();
        else { setPhase("tutorial"); setMenuClosing(false); }
      } else { setPhase("input-select"); setMenuClosing(false); }
    }, 220);
  }, [difficulty, isTouch, launchRun]);

  const chooseInputMode = useCallback((mode: InputMode) => {
    setInputMode(mode);
    gameRef.current?.setOpts({ inputMode: mode });
    let hidden = false;
    try { hidden = localStorage.getItem(TUTORIAL_KEY) === "1"; } catch { /* ignore */ }
    if (hidden) launchRun();
    else setPhase("tutorial");
  }, [launchRun]);

  const restartRun = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    if (game.isCoop || isCoopGame) {
      coopNet.leaveRoom();
      game.isCoop = false;
      game.peerRonin = null;
      setIsCoopGame(false);
      game.reset();
      game.phase = "menu";
      setPhase("menu");
      return;
    }
    game.setDifficulty(difficulty);
    game.setPerk(selectedPerk.current);
    game.setPlayerAvatar(profileRef.current?.avatarId ?? "samurai");
    try { localStorage.removeItem(RUN_KEY); } catch { /* ignore storage errors */ }
    const race = game.startGame();
    let raceRevealHidden = false;
    try { raceRevealHidden = localStorage.getItem(RACE_REVEAL_KEY) === "1"; } catch { /* ignore storage errors */ }
    if (raceRevealHidden) {
      setRaceReveal(null);
      setPhase("playing");
    } else {
      game.pause();
      setRaceReveal(race);
      setPhase("paused");
    }
    setRank(-1);
    setPendingScore(false);
    setScoreSaving(false);
    setScoreError(null);
    setMenuClosing(false);
  }, [difficulty, isCoopGame]);

  const requestCoopRematch = useCallback(() => {
    if (!coopNet.roomState?.started) return;
    setRematchWaiting(true);
    coopNet.requestRematch();
  }, []);

  const finishTutorial = useCallback((neverAgain: boolean) => {
    if (neverAgain) {
      try {
        localStorage.setItem(TUTORIAL_KEY, "1");
      } catch {
        /* ignore */
      }
    }
    launchRun();
  }, [launchRun]);

  const dismissPotionTutorial = useCallback((neverAgain: boolean) => {
    if (neverAgain) {
      try { localStorage.setItem(POTION_TUTORIAL_KEY, "1"); } catch { /* ignore */ }
    }
    gameRef.current?.dismissPotionTutorial();
  }, []);

  const saveRun = useCallback(() => {
    const game = gameRef.current;
    if (!game || game.phase !== "paused") return;
    try {
      localStorage.setItem(RUN_KEY, JSON.stringify(game.saveRun(false)));
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const discardSavedRun = useCallback(() => {
    try { localStorage.removeItem(RUN_KEY); } catch { /* ignore storage errors */ }
    setSavedRun(null);
  }, []);

  const continueSavedRun = useCallback(() => {
    const saved = savedRun;
    const game = gameRef.current;
    if (!saved || !game) return;
    if (!game.restoreRun(saved)) {
      discardSavedRun();
      return;
    }
    selectedPerk.current = saved.stats.perk;
    setDifficulty(saved.stats.difficulty);
    setRaceReveal(null);
    if (saved.atShop) setUpgrade({ wave: saved.stats.wave });
    setPhase(saved.atShop ? "upgrade" : "playing");
    setSavedRun(null);
  }, [discardSavedRun, savedRun]);
  const dismissRaceReveal = useCallback((hideForever: boolean) => {
    if (hideForever) {
      try { localStorage.setItem(RACE_REVEAL_KEY, "1"); } catch { /* ignore storage errors */ }
    }
    setRaceReveal(null);
    const game = gameRef.current;
    if (!game) return;
    if (game.phase === "paused") game.resume();
    setPhase(game.phase === "paused" ? "paused" : "playing");
  }, []);
  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (g.phase === "playing") {
      g.pause();
      setPhase(gameRef.current?.phase === "paused" ? "paused" : "playing");
    } else if (g.phase === "paused") {
      g.resume();
      setPhase(gameRef.current?.phase === "paused" ? "paused" : "playing");
    }
  }, []);

  const pauseFromFocusLoss = useCallback(() => {
    const g = gameRef.current;
    if (g?.phase !== "playing") return;
    g.pause();
    setPhase(gameRef.current?.phase === "paused" ? "paused" : "playing");
  }, []);

  const toMenu = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (g.isCoop || isCoopGame) {
      coopNet.leaveRoom();
      g.isCoop = false;
      g.peerRonin = null;
      setIsCoopGame(false);
    }
    g.reset();
    g.phase = "menu";
    setPhase("menu");
    setStats(emptyStats);
    setUpgrade(null);
    setPendingScore(false);
    setScoreError(null);
    void loadRemoteScores().then(setScores);
  }, [isCoopGame]);

  const submitName = useCallback(async (profileOverride?: PlayerProfile) => {
    if (scoreSaving) return;
    let activeProfile = profileOverride ?? profileRef.current;
    if (!activeProfile && supabase) {
      const { data: authData } = await supabase.auth.getSession();
      if (authData.session?.user) {
        try {
          activeProfile = await loadProfile(authData.session.user);
          setProfile(activeProfile);
        } catch {
          setScoreError("Sua conta ainda está carregando. Tente salvar novamente em alguns segundos.");
          return;
        }
      }
    }
    if (!activeProfile) {
      setScoreError("Entre em uma conta para salvar esta pontuação no ranking.");
      return;
    }
    const entry: ScoreEntry = {
      name: activeProfile.username,
      avatarId: activeProfile.avatarId,
      score: finalStats.score,
      wave: finalStats.wave,
      kills: finalStats.kills,
      time: finalStats.time,
      difficulty: finalStats.difficulty,
      date: Date.now(),
      userId: activeProfile.id,
      raceId: finalStats.raceId,
      perk: finalStats.perk,
      weapons: finalStats.weaponsUsed,
      coins: finalStats.coins,
      gameMode: finalStats.gameMode,
      details: {
        hp: finalStats.hp,
        maxHp: finalStats.maxHp,
        baseDamage: finalStats.baseDamage,
        damageMultiplier: finalStats.damageMultiplier,
        effectiveDamage: finalStats.effectiveDamage,
        moveSpeed: finalStats.moveSpeed,
        attackSpeedMultiplier: finalStats.attackSpeedMultiplier,
        dashCooldown: finalStats.effectiveDashCooldown,
        dashSpeedMult: finalStats.dashSpeedMult,
        activeSlot: finalStats.activeSlot,
        weaponLevels: finalStats.weaponLevels,
        activePotions: finalStats.activePotions,
        magicType: finalStats.magicType,
        perkBuffT: finalStats.perkBuffT,
        perkEchoReady: finalStats.perkEchoReady,
      },
    };
    setScoreSaving(true);
    setScoreError(null);
    try {
      const { list, rank: r } = await saveRemoteScore(entry);
      setScores(list);
      setRank(r);
      setPendingScore(false);
    } catch (error) {
      setScoreError(error instanceof Error ? error.message : "Não foi possível salvar no ranking. Tente novamente.");
    } finally {
      setScoreSaving(false);
    }
  }, [finalStats, scoreSaving]);
  useEffect(() => {
    if (!pendingScore || !profile || phase !== "menu") return;
    void submitName(profile);
  }, [pendingScore, profile, phase, submitName]);
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

  const reorderWeapons = useCallback((from: number, to: number) => {
    gameRef.current?.reorderWeapons(from, to);
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

  const upgradeWeapon = useCallback((weapon: Weapon, upgrade: WeaponUpgrade, cost: number) => {
    gameRef.current?.buyWeaponUpgrade(weapon, upgrade, cost);
  }, []);

  const selectMagic = useCallback((type: MagicType) => {
    gameRef.current?.setMagicType(type);
  }, []);

  const closeShop = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    if (game.closeShop()) {
      setUpgrade(null);
      setPhase("playing");
    }
  }, []);

  const applyOpts = useCallback((p: Partial<UiOpts>) => {
    setOpts((prev) => {
      const next = { ...prev, ...p };
      setMuted(!next.sound);
      setVolume(next.volume);
      setSoundEffectsEnabled(next.soundEffects !== false);
      setMusicEnabled(next.music !== false);
      setMutedState(!next.sound);
      gameRef.current?.setOpts({
        shake: next.shake ? 1 : 0,
        flash: next.flash ? 1 : 0,
        volume: next.volume,
        soundEffects: next.soundEffects,
        music: next.music,
        showHitboxes: next.showHitboxes,
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
      keyboardOnly: opts.keyboardOnly,
      keyboardBindings: opts.keyboardBindings,
      inputMode,
    });
  }, [inputMode, opts]);

  /* hotkeys */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const g = gameRef.current;
      if (!g) return;
      if (k === opts.keyboardBindings.pause || k === "p") {
        e.preventDefault();
        if (g.phase === "playing" || g.phase === "paused") togglePause();
      } else if (k === "m") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts.keyboardBindings.pause, start, togglePause, toggleMute]);

  /* Keep the visible pause screen in sync when the browser suspends the game. */
  useEffect(() => {
    const recoverMobileViewport = () => {
      requestAnimationFrame(() => requestAnimationFrame(() => gameRef.current?.recoverViewport()));
    };
    const onVisibilityChange = () => {
      if (document.hidden) pauseFromFocusLoss();
      else recoverMobileViewport();
    };
    const onPageHide = () => {
      if (gameRef.current?.isCoop) coopNet.leaveRoom();
      pauseFromFocusLoss();
    };
    window.addEventListener("blur", pauseFromFocusLoss);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("resize", recoverMobileViewport);
    window.addEventListener("orientationchange", recoverMobileViewport);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("blur", pauseFromFocusLoss);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("resize", recoverMobileViewport);
      window.removeEventListener("orientationchange", recoverMobileViewport);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pauseFromFocusLoss]);

  const best = scores.length ? scores[0].score : 0;
  const t = I18N[opts.language];

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#070305] ui-text-${opts.textScale === 0.85 ? "small" : opts.textScale === 1.15 ? "large" : "normal"}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(117,16,29,0.25),transparent_65%)]" />

      {deviceChosen && phase === "menu" && <div className="social-links" aria-label="Comunidades oficiais">
        <a
          className="social-link social-link-discord"
          href="https://discord.gg/AGfUnjtE32"
          target="_blank"
          rel="noreferrer"
          aria-label="Entrar no Discord"
          title="Discord"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.32 4.37A19.8 19.8 0 0 0 15.36 2.8a13.6 13.6 0 0 0-.64 1.32 18.4 18.4 0 0 0-5.44 0 13.6 13.6 0 0 0-.65-1.32 19.8 19.8 0 0 0-4.95 1.57C.55 9.05-.3 13.6.12 18.08a20 20 0 0 0 6.08 3.08 14.8 14.8 0 0 0 1.3-2.1 12.9 12.9 0 0 1-2.05-.98l.5-.39a14.2 14.2 0 0 0 12.1 0l.5.39c-.66.39-1.35.72-2.06.98.38.73.82 1.43 1.3 2.1a20 20 0 0 0 6.09-3.08c.5-5.2-.84-9.7-3.56-13.71ZM8.02 15.32c-1.18 0-2.15-1.08-2.15-2.41s.95-2.42 2.15-2.42c1.2 0 2.17 1.1 2.15 2.42 0 1.33-.95 2.41-2.15 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41s.95-2.42 2.15-2.42c1.2 0 2.17 1.1 2.15 2.42 0 1.33-.95 2.41-2.15 2.41Z" />
          </svg>
        </a>
        <a
          className="social-link social-link-tiktok"
          href="https://www.tiktok.com/@kyuarena"
          target="_blank"
          rel="noreferrer"
          aria-label="Abrir TikTok"
          title="TikTok"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.34 5.47A5.24 5.24 0 0 1 16.05 2h-3.47v13.02a2.76 2.76 0 1 1-2.02-2.65V8.85a6.23 6.23 0 1 0 5.5 6.18V8.42a8.43 8.43 0 0 0 4.93 1.58V6.55a5.13 5.13 0 0 1-3.65-1.08Z" />
          </svg>
        </a>
      </div>}

      <div ref={wrapRef} data-device={isTouch ? "mobile" : "desktop"} className="relative h-full w-full max-w-[1500px]">
        {deviceChosen && isTouch && (phase !== "playing" || coopModalOpen) && <MobilePanelNavigation />}
        {!deviceChosen && <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#070305] p-4">
          <div className="flex w-full max-w-md flex-col gap-5 text-center font-pixel text-[#ffe2c4]">
            <h2 className="text-sm">{({ pt: "COMPUTADOR OU CELULAR?", en: "COMPUTER OR PHONE?", fr: "ORDINATEUR OU MOBILE ?", de: "COMPUTER ODER HANDY?", zh: "电脑还是手机？" })[opts.language]}</h2>
            {([false, true] as const).map((mobile) => <button key={String(mobile)} className="pxb pxb-menu min-h-16 p-4 text-xs" onClick={() => {
              const mode: InputMode = mobile ? "touch" : "keyboardMouse";
               if (mobile && !document.fullscreenElement) { document.documentElement.requestFullscreen?.().catch(() => {}); }
               setIsTouch(mobile); setInputMode(mode); gameRef.current?.setOpts({ inputMode: mode }); setDeviceChosen(true);
               setPhase("menu");
            }}>{mobile ? ({ pt: "CELULAR", en: "PHONE", fr: "MOBILE", de: "HANDY", zh: "手机" })[opts.language] : ({ pt: "COMPUTADOR", en: "COMPUTER", fr: "ORDINATEUR", de: "COMPUTER", zh: "电脑" })[opts.language]}</button>)}
          </div>
        </div>}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-contain" />

        {(phase === "playing" || phase === "paused") && (
          <Hud
            stats={stats}
            best={best}
            muted={muted}
            onMute={toggleMute}
            onPause={togglePause}
            onSelectSlot={selectSlot}
            isTouch={isTouch}
            onDash={() => gameRef.current?.touchDash()}
            onRaceAbility={() => gameRef.current?.touchRaceAbility()}
            raceAbilityBinding={opts.keyboardBindings.specialAbility === " " ? "ESPAÇO" : opts.keyboardBindings.specialAbility.toUpperCase()}
            onSpectate={(direction) => gameRef.current?.spectateNext(direction)}
            onPotionDismiss={dismissPotionTutorial}
            hudScale={opts.hudScale}
            language={opts.language}
            t={t}
          />
        )}
        {raceReveal && <RaceReveal raceId={raceReveal} binding={opts.keyboardBindings.specialAbility === " " ? "ESPAÇO" : opts.keyboardBindings.specialAbility.toUpperCase()} onContinue={() => dismissRaceReveal(false)} onHideForever={() => dismissRaceReveal(true)} />}



        {phase === "menu" && (
          <div className={menuClosing ? "anim-menu-out" : ""}>
            <MainMenu
              onStart={start}
              onPerk={choosePerk}
              difficulty={difficulty}
              onDifficulty={setDifficulty}
              scores={scores}
              opts={opts}
              onOpts={applyOpts}
              onFullscreen={toggleFullscreen}
              profile={profile}
              onProfile={setProfile}
              openAccount={pendingScore}
              onOpenCoop={handleOpenCoop}
            />
          </div>
        )}
        {coopModalOpen && profile && (
          <CoopLobbyModal profile={profile} onClose={() => setCoopModalOpen(false)} onStartCoop={handleStartCoop} />
        )}
        {phase === "menu" && savedRun && (
          <SavedRunPrompt
            wave={savedRun.stats.wave}
            atShop={savedRun.atShop}
            onContinue={continueSavedRun}
            onDiscard={discardSavedRun}
          />
        )}

        {phase === "input-select" && <InputModeScreen language={opts.language} onSelect={chooseInputMode} />}
        {phase === "tutorial" && <TutorialScreen language={opts.language} isTouch={isTouch} inputMode={inputMode} onBegin={finishTutorial} />}
        {phase === "paused" && <PauseScreen stats={stats} avatarId={profile?.avatarId ?? "samurai"} waitingForHost={!!(gameRef.current?.isCoop && !gameRef.current.isHost && gameRef.current.pausedByHost)} onResume={togglePause} onSave={saveRun} onQuit={toMenu} t={t} opts={opts} onOpts={applyOpts} onFullscreen={toggleFullscreen} />}
        {phase === "dead" && (
          <GameOverScreen
            stats={finalStats}
            scores={scores}
            rank={rank}
            pendingScore={pendingScore}
            defaultName={profile?.username ?? lastName}
            onSubmitName={() => void submitName()}
            scoreSaving={scoreSaving}
            scoreError={scoreError}
            onRestart={isCoopGame ? requestCoopRematch : restartRun}
            onMenu={toMenu}
            rematchWaiting={rematchWaiting}
            rematchVotes={rematchVotes}
            rematchTotal={coopNet.roomState ? Object.keys(coopNet.roomState.players).length : 0}
            t={t}
            isCoop={isCoopGame}
          />
        )}
        {phase === "upgrade" && upgrade && (
          <ShopScreen
            wave={upgrade.wave}
            stats={stats}
            onBuyWeapon={buyWeapon}
            onSellWeapon={sellWeapon}
            onSelectSlot={selectSlot}
            onReorderWeapons={reorderWeapons}
            onBuyPowerUp={buyPowerUp}
            onUpgradeWeapon={upgradeWeapon}
            onMagicType={selectMagic}
            onCloseShop={closeShop}
            language={opts.language}
            t={t}
            abilityBinding={opts.keyboardBindings.specialAbility === " " ? "ESPAÇO · Y / TRIÂNGULO" : opts.keyboardBindings.specialAbility.toUpperCase() + " · Y / TRIÂNGULO"}
          />
        )}
      </div>
    </div>
  );
}
