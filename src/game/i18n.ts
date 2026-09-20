export type Language = "pt" | "en" | "fr" | "de" | "zh";

export interface Strings {
  langName: string;
  play: string;
  settings: string;
  language: string;
  ranking: string;
  start: string;
  touchStart: string;
  best: string;
  coins: string;
  difficulty: string;
  difficultyEasy: string;
  difficultyMedium: string;
  difficultyHard: string;
  difficultyEasyDesc: string;
  difficultyMediumDesc: string;
  difficultyHardDesc: string;
  // settings
  graphics: string;
  quality: string;
  qualityHigh: string;
  qualityLow: string;
  vsync: string;
  fullscreen: string;
  enter: string;
  exit: string;
  sound: string;
  volume: string;
  screenShake: string;
  screenFlash: string;
  hudSize: string;
  hudNormal: string;
  hudLarge: string;
  hudHuge: string;
  hudSmall: string;
  hudTiny: string;
  textSize: string;
  textSmall: string;
  textNormal: string;
  textLarge: string;
  install: string;
  accessibility: string;
  keyboardOnly: string;
  on: string;
  off: string;
  // ranking
  noScores: string;
  wave: string;
  rank: string;
  name: string;
  score: string;
  clear: string;
  // in-game / overlays
  paused: string;
  resume: string;
  quit: string;
  youDied: string;
  newRecord: string;
  finalScore: string;
  kills: string;
  time: string;
  enterName: string;
  namePlaceholder: string;
  save: string;
  skip: string;
  playAgain: string;
  menu: string;
  // shop / armory
  shopTitle: string;
  shopSubtitle: string;
  weaponsTitle: string;
  powerupsTitle: string;
  slotsTitle: string;
  emptySlot: string;
  buy: string;
  sell: string;
  equipped: string;
  maxSlots: string;
  notEnoughCoins: string;
  nextWave: string;
  // weapons
  katana: string;
  katanaDesc: string;
  bow: string;
  bowDesc: string;
  hammer: string;
  hammerDesc: string;
  shield: string;
  shieldDesc: string;
  mine: string;
  mineDesc: string;
  mineTutorial: string;
  // upgrades
  speedUp: string;
  speedDesc: string;
  heartUp: string;
  heartDesc: string;
  dashCdUp: string;
  dashCdDesc: string;
  dashDistUp: string;
  dashDistDesc: string;
  // controls / ui
  tagline: string;
  dashLabel: string;
  ready: string;
  slotHint: string;
  // shop tabs
  tabWeapons: string;
  tabStats: string;
  waveCleared: string;
  waveClearedTitle: string;
  enemiesLeft: string;
  yourStats: string;
  statSpeed: string;
  statHearts: string;
  statDashCd: string;
  statDashDist: string;
  owned: string;
  inHand: string;
  preview: string;
  dmg: string;
  spd: string;
  range: string;
  weaponDetails: string;
  mute: string;
  pause: string;
  speedBoost: string;
  healthBoost: string;
  dashCooldownBoost: string;
  dashDistanceBoost: string;
  parried: string;
  massacre: string;
  tripleKill: string;
  shogunDefeated: string;
  shogunArrived: string;
  healthPickup: string;
}

export const LANGS: Language[] = ["pt", "en", "fr", "de", "zh"];

export const I18N = {
  pt: {
    langName: "Português",
    play: "JOGAR",
    settings: "CONFIGURAÇÕES",
    language: "IDIOMA",
    ranking: "RANKING",
    start: "PRESSIONE ENTER PARA JOGAR",
    touchStart: "TOQUE PARA JOGAR",
    best: "RECORDE",
    coins: "MOEDAS",
    difficulty: "DIFICULDADE",
    difficultyEasy: "FÁCIL", difficultyMedium: "MÉDIO", difficultyHard: "DIFÍCIL",
    difficultyEasyDesc: "2x moedas, metade do dano e limites em dobro.",
    difficultyMediumDesc: "Regras padrão. Chefes ficam brutais nas ondas altas.",
    difficultyHardDesc: "2x dano sofrido. Chefes eliminam em um golpe.",
    graphics: "GRÁFICOS",
    quality: "QUALIDADE",
    qualityHigh: "ALTA",
    qualityLow: "BAIXA",
    vsync: "VSYNC",
    fullscreen: "TELA CHEIA",
    enter: "ENTRAR",
    exit: "SAIR",
    sound: "SOM",
    volume: "VOLUME",
    screenShake: "TREMOR DE TELA",
    screenFlash: "FLASH DE TELA",
    hudSize: "TAMANHO DA HUD",
    hudNormal: "NORMAL",
    hudLarge: "GRANDE",
    hudHuge: "ENORME",
    hudSmall: "PEQUENA", hudTiny: "MINÚSCULA", textSize: "TAMANHO DO TEXTO", textSmall: "PEQUENO", textNormal: "NORMAL", textLarge: "GRANDE", install: "INSTALAR JOGO", accessibility: "ACESSIBILIDADE", keyboardOnly: "SOMENTE TECLADO",
    on: "LIGADO",
    off: "DESLIGADO",
    noScores: "SEM RECORDES AINDA",
    wave: "ONDA",
    rank: "POS",
    name: "NOME",
    score: "PONTOS",
    clear: "",
    paused: "PAUSADO",
    resume: "CONTINUAR",
    quit: "SAIR",
    youDied: "VOCÊ MORREU",
    newRecord: "NOVO RECORDE",
    finalScore: "PONTUAÇÃO",
    kills: "ABATES",
    time: "TEMPO",
    enterName: "DIGITE SEU NOME",
    namePlaceholder: "RONIN",
    save: "SALVAR",
    skip: "PULAR",
    playAgain: "JOGAR DE NOVO",
    menu: "MENU",
    shopTitle: "ARMARIA & FERREIRO",
    shopSubtitle: "Compre armas e aprimoramentos antes da próxima onda.",
    weaponsTitle: "ARSENAL (MÁX 4 ARMAS)",
    powerupsTitle: "APRIMORAMENTOS",
    slotsTitle: "ARMAS EQUIPADAS (TECLAS 1, 2, 3, 4)",
    emptySlot: "VAZIO",
    buy: "COMPRAR",
    sell: "VENDER",
    equipped: "EQUIPADO",
    maxSlots: "SLOTS CHEIOS (MAX 4)",
    notEnoughCoins: "MOEDAS INSUFICIENTES",
    nextWave: "IR PARA A PRÓXIMA ONDA",
    katana: "KATANA",
    katanaDesc: "Cortes rápidos e fluidos como ventoinha. Alcance equilibrado.",
    bow: "ARCO E FLECHA",
    bowDesc: "Dispara flechas velozes à distância. Perfeito para manter espaço.",
    hammer: "MARTELO ONI",
    hammerDesc: "Impacto esmagador que cria onda de choque e atordoa inimigos.",
    shield: "ESCUDO DE AÇO",
    shieldDesc: "Defesa direcional. Mire e pressione M1 para refletir projéteis.",
    mine: "MINA TERRESTRE",
    mineDesc: "Coloque no chão. Explode quando um inimigo se aproxima (máx. 6).",
    mineTutorial: "MINA: MIRE E CLIQUE PARA COLOCAR NO CHÃO",
    speedUp: "+ VELOCIDADE",
    speedDesc: "+18 velocidade de movimento do Ronin.",
    heartUp: "+ CORAÇÃO / CURA",
    heartDesc: "+1 coração máximo e recupera 2 de vida.",
    dashCdUp: "- COOLDOWN DASH",
    dashCdDesc: "-0.8s de tempo de recarga do dash (base 6s).",
    dashDistUp: "+ DISTÂNCIA DASH",
    dashDistDesc: "+25% de velocidade e alcance da investida.",
    tagline: "Uma arena carmesim. Uma lâmina. Sobreviva.",
    dashLabel: "DASH",
    ready: "PRONTO",
    slotHint: "Troque com 1/2/3/4 ou scroll",
    tabWeapons: "ARMAS",
    tabStats: "ESTATÍSTICAS",
    waveCleared: "ONDA LIMPA", waveClearedTitle: "ONDA {wave} LIMPA",
    enemiesLeft: "INIMIGOS",
    yourStats: "SEU RONIN",
    statSpeed: "VELOCIDADE",
    statHearts: "CORAÇÕES",
    statDashCd: "RECARGA DO DASH",
    statDashDist: "ALCANCE DO DASH",
    owned: "NA MOCHILA",
    inHand: "NA MÃO",
    preview: "MODELO REAL",
    dmg: "DANO",
    spd: "VELOC.",
    range: "ALCANCE",
    weaponDetails: "DETALHES",
    mute: "ATIVAR/DESATIVAR SOM",
    pause: "PAUSAR",
    speedBoost: "VELOCIDADE +",
    healthBoost: "VIDA +",
    dashCooldownBoost: "RECARGA DASH -",
    dashDistanceBoost: "DISTÂNCIA DASH +",
    parried: "APAROU!",
    massacre: "MASSACRE!",
    tripleKill: "ABATE TRIPLO!",
    shogunDefeated: "SHOGUN DERROTADO!",
    shogunArrived: "O SHOGUN CHEGOU",
    healthPickup: "+1 VIDA",
  },
  en: {
    langName: "English",
    play: "PLAY",
    settings: "SETTINGS",
    language: "LANGUAGE",
    ranking: "RANKING",
    start: "PRESS ENTER TO PLAY",
    touchStart: "TAP TO PLAY",
    best: "BEST",
    coins: "COINS",
    difficulty: "DIFFICULTY",
    difficultyEasy: "EASY", difficultyMedium: "MEDIUM", difficultyHard: "HARD",
    difficultyEasyDesc: "2x coins, half damage taken, double stat limits.",
    difficultyMediumDesc: "Standard rules. Bosses get brutal in later waves.",
    difficultyHardDesc: "2x damage taken. Bosses kill in one hit.",
    graphics: "GRAPHICS",
    quality: "QUALITY",
    qualityHigh: "HIGH",
    qualityLow: "LOW",
    vsync: "VSYNC",
    fullscreen: "FULLSCREEN",
    enter: "ENTER",
    exit: "EXIT",
    sound: "SOUND",
    volume: "VOLUME",
    screenShake: "SCREEN SHAKE",
    screenFlash: "SCREEN FLASH",
    hudSize: "HUD SIZE",
    hudNormal: "NORMAL",
    hudLarge: "LARGE",
    hudHuge: "HUGE",
    hudSmall: "SMALL", hudTiny: "TINY", textSize: "TEXT SIZE", textSmall: "SMALL", textNormal: "NORMAL", textLarge: "LARGE", install: "INSTALL GAME", accessibility: "ACCESSIBILITY", keyboardOnly: "KEYBOARD ONLY",
    on: "ON",
    off: "OFF",
    noScores: "NO SCORES YET",
    wave: "WAVE",
    rank: "POS",
    name: "NAME",
    score: "SCORE",
    clear: "",
    paused: "PAUSED",
    resume: "RESUME",
    quit: "QUIT",
    youDied: "YOU DIED",
    newRecord: "NEW RECORD",
    finalScore: "SCORE",
    kills: "KILLS",
    time: "TIME",
    enterName: "ENTER YOUR NAME",
    namePlaceholder: "RONIN",
    save: "SAVE",
    skip: "SKIP",
    playAgain: "PLAY AGAIN",
    menu: "MENU",
    shopTitle: "ARMORY & BLACKSMITH",
    shopSubtitle: "Purchase weapons and powerups before the next wave.",
    weaponsTitle: "WEAPONS (MAX 4 SLOTS)",
    powerupsTitle: "POWERUPS",
    slotsTitle: "EQUIPPED SLOTS (KEYS 1, 2, 3, 4)",
    emptySlot: "EMPTY",
    buy: "BUY",
    sell: "SELL",
    equipped: "EQUIPPED",
    maxSlots: "SLOTS FULL (MAX 4)",
    notEnoughCoins: "NOT ENOUGH COINS",
    nextWave: "PROCEED TO NEXT WAVE",
    katana: "KATANA",
    katanaDesc: "Fast and fluid fan slashes. Balanced range and speed.",
    bow: "BOW & ARROW",
    bowDesc: "Shoots swift arrows at distance. Great for keeping space.",
    hammer: "ONI HAMMER",
    hammerDesc: "Crushing slam creating a shockwave that stuns surrounding foes.",
    shield: "STEEL SHIELD",
    shieldDesc: "Directional defense. Aim and press M1 to reflect projectiles.",
    mine: "LAND MINE",
    mineDesc: "Place it on the ground. Explodes near enemies (max 6).",
    mineTutorial: "MINE: AIM AND CLICK TO PLACE ON THE GROUND",
    speedUp: "+ SPEED",
    speedDesc: "+18 movement speed for the Ronin.",
    heartUp: "+ HEART / HEAL",
    heartDesc: "+1 max heart and heals 2 HP.",
    dashCdUp: "- DASH COOLDOWN",
    dashCdDesc: "-0.8s dash recharge cooldown (6s base).",
    dashDistUp: "+ DASH DISTANCE",
    dashDistDesc: "+25% burst speed and dash travel distance.",
    tagline: "One crimson arena. One blade. Survive.",
    dashLabel: "DASH",
    ready: "READY",
    slotHint: "Switch with 1/2/3/4 or scroll",
    tabWeapons: "WEAPONS",
    tabStats: "STATS",
    waveCleared: "WAVE CLEARED", waveClearedTitle: "WAVE {wave} CLEARED",
    enemiesLeft: "ENEMIES",
    yourStats: "YOUR RONIN",
    statSpeed: "SPEED",
    statHearts: "HEARTS",
    statDashCd: "DASH COOLDOWN",
    statDashDist: "DASH RANGE",
    owned: "IN BAG",
    inHand: "IN HAND",
    preview: "REAL MODEL",
    dmg: "DMG",
    spd: "SPEED",
    range: "RANGE",
    weaponDetails: "DETAILS",
    mute: "TOGGLE SOUND",
    pause: "PAUSE",
    speedBoost: "SPEED +",
    healthBoost: "HEALTH +",
    dashCooldownBoost: "DASH COOLDOWN -",
    dashDistanceBoost: "DASH DISTANCE +",
    parried: "PARRIED!",
    massacre: "MASSACRE!",
    tripleKill: "TRIPLE KILL!",
    shogunDefeated: "SHOGUN DEFEATED!",
    shogunArrived: "THE SHOGUN HAS ARRIVED",
    healthPickup: "+1 HP",
  },
  fr: {
    langName: "Français",
    play: "JOUER",
    settings: "PARAMÈTRES",
    language: "LANGUE",
    ranking: "CLASSEMENT",
    start: "APPUYEZ SUR ENTRÉE POUR JOUER",
    touchStart: "TOUCHEZ POUR JOUER",
    best: "RECORD",
    coins: "PIÈCES",
    difficulty: "DIFFICULTÉ",
    difficultyEasy: "FACILE", difficultyMedium: "MOYEN", difficultyHard: "DIFFICILE",
    difficultyEasyDesc: "2x pièces, moitié des dégâts, limites doublées.",
    difficultyMediumDesc: "Règles standard. Les boss deviennent redoutables.",
    difficultyHardDesc: "2x dégâts subis. Les boss tuent en un coup.",
    graphics: "GRAPHISMES",
    quality: "QUALITÉ",
    qualityHigh: "ÉLEVÉE",
    qualityLow: "BASSE",
    vsync: "VSYNC",
    fullscreen: "PLEIN ÉCRAN",
    enter: "ENTRER",
    exit: "SORTIR",
    sound: "SON",
    volume: "VOLUME",
    screenShake: "TREMBLEMENT",
    screenFlash: "FLASH ÉCRAN",
    hudSize: "TAILLE DE L'ATH",
    hudNormal: "NORMALE",
    hudLarge: "GRANDE",
    hudHuge: "ÉNORME",
    hudSmall: "PETITE", hudTiny: "MINUSCULE", textSize: "TAILLE DU TEXTE", textSmall: "PETIT", textNormal: "NORMAL", textLarge: "GRAND", install: "INSTALLER LE JEU", accessibility: "ACCESSIBILITÉ", keyboardOnly: "CLAVIER UNIQUEMENT",
    on: "ACTIVÉ",
    off: "DÉSACTIVÉ",
    noScores: "AUCUN SCORE",
    wave: "VAGUE",
    rank: "POS",
    name: "NOM",
    score: "SCORE",
    clear: "",
    paused: "EN PAUSE",
    resume: "REPRENDRE",
    quit: "QUITTER",
    youDied: "VOUS ÊTES MORT",
    newRecord: "NOUVEAU RECORD",
    finalScore: "SCORE",
    kills: "VICTIMES",
    time: "TEMPS",
    enterName: "ENTREZ VOTRE NOM",
    namePlaceholder: "RONIN",
    save: "ENREGISTRER",
    skip: "PASSER",
    playAgain: "REJOUER",
    menu: "MENU",
    shopTitle: "ARMURERIE & FORGERON",
    shopSubtitle: "Achetez des armes et des améliorations avant la vague.",
    weaponsTitle: "ARSENAL (MAX 4 SLOTS)",
    powerupsTitle: "AMÉLIORATIONS",
    slotsTitle: "SLOTS ÉQUIPÉS (TOUCHES 1, 2, 3, 4)",
    emptySlot: "VIDE",
    buy: "ACHETER",
    sell: "VENDRE",
    equipped: "ÉQUIPÉ",
    maxSlots: "SLOTS PLEINS (MAX 4)",
    notEnoughCoins: "PIÈCES INSUFFISANTES",
    nextWave: "PASSER À LA VAGUE SUIVANTE",
    katana: "KATANA",
    katanaDesc: "Coups rapides et fluides en éventail. Portée équilibrée.",
    bow: "ARC ET FLÈCHES",
    bowDesc: "Tire des flèches rapides à distance. Idéal pour garder l'espace.",
    hammer: "MARTEAU ONI",
    hammerDesc: "Frappe écrasante créant une onde de choc étourdissante.",
    shield: "BOUCLIER D'ACIER",
    shieldDesc: "Défense directionnelle. Visez et appuyez sur M1 pour renvoyer les projectiles.",
    mine: "MINE TERRESTRE",
    mineDesc: "Posez-la au sol. Explose près des ennemis (max. 6).",
    mineTutorial: "MINE : VISEZ ET CLIQUEZ POUR LA POSER AU SOL",
    speedUp: "+ VITESSE",
    speedDesc: "+18 vitesse de déplacement pour le Ronin.",
    heartUp: "+ CŒUR / SOIN",
    heartDesc: "+1 cœur max et soigne 2 PV.",
    dashCdUp: "- COOLDOWN DASH",
    dashCdDesc: "-0,8s de temps de recharge du dash (base 6s).",
    dashDistUp: "+ DISTANCE DASH",
    dashDistDesc: "+25% de vitesse et de distance de projection.",
    tagline: "Une arène carmin. Une lame. Survivez.",
    dashLabel: "DASH",
    ready: "PRÊT",
    slotHint: "Changer avec 1/2/3/4 ou molette",
    tabWeapons: "ARMES",
    tabStats: "STATISTIQUES",
    waveCleared: "VAGUE NETTOYÉE", waveClearedTitle: "VAGUE {wave} NETTOYÉE",
    enemiesLeft: "ENNEMIS",
    yourStats: "VOTRE RONIN",
    statSpeed: "VITESSE",
    statHearts: "CŒURS",
    statDashCd: "RECHARGE DU DASH",
    statDashDist: "PORTÉE DU DASH",
    owned: "DANS LE SAC",
    inHand: "EN MAIN",
    preview: "MODÈLE RÉEL",
    dmg: "DÉGÂTS",
    spd: "VITESSE",
    range: "PORTÉE",
    weaponDetails: "DÉTAILS",
    mute: "ACTIVER/DÉSACTIVER LE SON",
    pause: "PAUSE",
    speedBoost: "VITESSE +",
    healthBoost: "VIE +",
    dashCooldownBoost: "RECHARGE DASH -",
    dashDistanceBoost: "DISTANCE DASH +",
    parried: "PARÉ!",
    massacre: "MASSACRE!",
    tripleKill: "TRIPLE ÉLIMINATION!",
    shogunDefeated: "SHOGUN VAINCU!",
    shogunArrived: "LE SHOGUN EST ARRIVÉ",
    healthPickup: "+1 PV",
  },
} as unknown as Record<Language, Strings>;

I18N.de = {
  ...I18N.en,
  langName: "Deutsch", difficulty: "SCHWIERIGKEIT", difficultyEasy: "LEICHT", difficultyMedium: "MITTEL", difficultyHard: "SCHWER", difficultyEasyDesc: "2x Münzen, halber Schaden, doppelte Attributgrenzen.", difficultyMediumDesc: "Standardregeln. Bosse werden später brutal.", difficultyHardDesc: "2x erlittener Schaden. Bosse töten mit einem Treffer.", play: "SPIELEN", settings: "EINSTELLUNGEN", language: "SPRACHE", ranking: "RANGLISTE",
  start: "ENTER DRÜCKEN ZUM SPIELEN", touchStart: "ZUM SPIELEN TIPPEN", best: "REKORD", coins: "MÜNZEN",
  graphics: "GRAFIK", quality: "QUALITÄT", qualityHigh: "HOCH", qualityLow: "NIEDRIG", fullscreen: "VOLLBILD",
  enter: "ÖFFNEN", exit: "BEENDEN", sound: "TON", volume: "LAUTSTÄRKE", screenShake: "BILDSCHIRMWACKELN",
  screenFlash: "BILDSCHIRMBLITZ", on: "AN", off: "AUS", noScores: "NOCH KEINE ERGEBNISSE", wave: "WELLE",
  hudSize: "HUD-GRÖSSE", hudNormal: "NORMAL", hudLarge: "GROSS", hudHuge: "RIESIG", hudSmall: "KLEIN", hudTiny: "WINZIG", textSize: "TEXTGRÖSSE", textSmall: "KLEIN", textNormal: "NORMAL", textLarge: "GROSS", install: "SPIEL INSTALLIEREN", accessibility: "BARRIEREFREIHEIT", keyboardOnly: "NUR TASTATUR",
  rank: "PLATZ", name: "NAME", score: "PUNKTE", clear: "RANGLISTE LÖSCHEN", paused: "PAUSIERT",
  resume: "FORTSETZEN", quit: "BEENDEN", youDied: "DU BIST GESTORBEN", newRecord: "NEUER REKORD",
  finalScore: "PUNKTE", kills: "BESIEGT", time: "ZEIT", enterName: "NAMEN EINGEBEN", save: "SPEICHERN",
  skip: "ÜBERSPRINGEN", playAgain: "NOCHMAL SPIELEN", menu: "MENÜ", shopTitle: "WAFFENKAMMER & SCHMIEDE",
  shopSubtitle: "Kaufe Waffen und Verbesserungen vor der nächsten Welle.", weaponsTitle: "WAFFEN (MAX. 4 PLÄTZE)",
  powerupsTitle: "VERBESSERUNGEN", slotsTitle: "AUSGERÜSTETE WAFFEN (TASTEN 1–4)", emptySlot: "LEER",
  buy: "KAUFEN", sell: "VERKAUFEN", equipped: "AUSGERÜSTET", maxSlots: "ALLE PLÄTZE BELEGT",
  notEnoughCoins: "NICHT GENUG MÜNZEN", nextWave: "ZUR NÄCHSTEN WELLE", katanaDesc: "Schnelle, flüssige Hiebe mit ausgewogener Reichweite.",
  bow: "BOGEN", bowDesc: "Feuert schnelle Pfeile aus sicherer Entfernung.",
  hammer: "ONI-HAMMER",
  hammerDesc: "Wuchtiger Schlag mit Schockwelle, der Gegner betäubt.", shield: "STAHLSCHILD",
  shieldDesc: "Richtet sich zur Maus aus und reflektiert Projektile mit M1.", mine: "LANDMINE",
  mineDesc: "Auf den Boden legen. Explodiert bei Gegnernähe (max. 6).", mineTutorial: "MINE: ZIELEN UND KLICKEN, UM SIE ABZULEGEN",
  speedUp: "+ TEMPO", speedDesc: "+18 Bewegungstempo.", heartUp: "+ HERZ / HEILUNG", heartDesc: "+1 maximales Herz und 2 Heilung.",
  dashCdUp: "- DASH-AUFLADUNG", dashCdDesc: "-0,8 s Dash-Aufladezeit.", dashDistUp: "+ DASH-DISTANZ",
  dashDistDesc: "+25 % Dash-Tempo und Reichweite.", tagline: "Eine karminrote Arena. Eine Klinge. Überlebe.", ready: "BEREIT",
  slotHint: "Wechseln mit 1/2/3/4 oder Mausrad", tabWeapons: "WAFFEN", tabStats: "WERTE", waveCleared: "WELLE GESCHAFFT", waveClearedTitle: "WELLE {wave} GESCHAFFT",
  enemiesLeft: "GEGNER", yourStats: "DEIN RONIN", statSpeed: "TEMPO", statHearts: "HERZEN", statDashCd: "DASH-AUFLADUNG",
  statDashDist: "DASH-REICHWEITE", owned: "IM INVENTAR", inHand: "IN DER HAND", preview: "VORSCHAU", dmg: "SCHADEN",
  spd: "TEMPO", range: "REICHW.", weaponDetails: "DETAILS", mute: "TON UMSCHALTEN", pause: "PAUSE",
  speedBoost: "TEMPO +", healthBoost: "LEBEN +", dashCooldownBoost: "DASH-AUFLADUNG -", dashDistanceBoost: "DASH-DISTANZ +",
  parried: "PARIERT!", massacre: "MASSAKER!", tripleKill: "DREIFACH-KILL!", shogunDefeated: "SHOGUN BESIEGT!",
  shogunArrived: "DER SHOGUN IST DA", healthPickup: "+1 LP",
};

I18N.zh = {
  ...I18N.en,
  langName: "中文", difficulty: "难度", difficultyEasy: "简单", difficultyMedium: "普通", difficultyHard: "困难", difficultyEasyDesc: "双倍金币、受到一半伤害、属性上限翻倍。", difficultyMediumDesc: "标准规则。后期首领非常凶猛。", difficultyHardDesc: "受到双倍伤害。首领一击必杀。", play: "开始游戏", settings: "设置", language: "语言", ranking: "排行榜", start: "按回车键开始",
  touchStart: "点击开始", best: "最高纪录", coins: "金币", graphics: "画面", quality: "画质", qualityHigh: "高",
  qualityLow: "低", fullscreen: "全屏", enter: "进入", exit: "退出", sound: "声音", volume: "音量",
  screenShake: "屏幕震动", screenFlash: "屏幕闪光", on: "开", off: "关", noScores: "暂无纪录", wave: "波次",
  hudSize: "界面大小", hudNormal: "普通", hudLarge: "大", hudHuge: "特大", hudSmall: "小", hudTiny: "极小", textSize: "文字大小", textSmall: "小", textNormal: "普通", textLarge: "大", install: "安装游戏", accessibility: "无障碍", keyboardOnly: "仅键盘",
  rank: "排名", name: "名字", score: "分数", clear: "清除排行榜", paused: "已暂停", resume: "继续", quit: "退出",
  youDied: "你已阵亡", newRecord: "新纪录", finalScore: "最终分数", kills: "击杀", time: "时间",
  enterName: "输入名字", save: "保存", skip: "跳过", playAgain: "再玩一次", menu: "菜单",
  shopTitle: "武器库与铁匠铺", shopSubtitle: "在下一波敌人来临前购买武器和强化。", weaponsTitle: "武器（最多4件）",
  powerupsTitle: "强化", slotsTitle: "已装备武器（按键1至4）", emptySlot: "空", buy: "购买", sell: "出售",
  equipped: "已装备", maxSlots: "武器栏已满", notEnoughCoins: "金币不足", nextWave: "进入下一波",
  katana: "武士刀", katanaDesc: "快速流畅的斩击，范围与速度均衡。", bow: "弓箭", bowDesc: "从远处射出高速箭矢。",
  hammer: "鬼锤", hammerDesc: "重击产生冲击波并击晕敌人。",
  shield: "钢盾", shieldDesc: "跟随鼠标方向，按鼠标左键反射投射物。", mine: "地雷",
  mineDesc: "放置在地面，敌人靠近时爆炸（最多6枚）。", mineTutorial: "地雷：瞄准并点击鼠标左键放置",
  speedUp: "+ 移动速度", speedDesc: "+18移动速度。", heartUp: "+ 生命 / 治疗", heartDesc: "+1最大生命并恢复2点生命。",
  dashCdUp: "- 冲刺冷却", dashCdDesc: "冲刺冷却减少0.8秒。", dashDistUp: "+ 冲刺距离", dashDistDesc: "冲刺速度和距离增加25%。",
  tagline: "猩红竞技场。一把刀。活下去。", dashLabel: "冲刺", ready: "就绪", slotHint: "按1/2/3/4或滚轮切换",
  tabWeapons: "武器", tabStats: "属性", waveCleared: "波次完成", waveClearedTitle: "第{wave}波完成", enemiesLeft: "敌人", yourStats: "浪人属性",
  statSpeed: "速度", statHearts: "生命", statDashCd: "冲刺冷却", statDashDist: "冲刺距离", owned: "背包中",
  inHand: "手持", preview: "预览", dmg: "伤害", spd: "速度", range: "范围", weaponDetails: "详情",
  mute: "切换声音", pause: "暂停", speedBoost: "速度 +", healthBoost: "生命 +", dashCooldownBoost: "冲刺冷却 -",
  dashDistanceBoost: "冲刺距离 +", parried: "已反弹！", massacre: "大屠杀！", tripleKill: "三连杀！",
  shogunDefeated: "将军已被击败！", shogunArrived: "将军出现了", healthPickup: "+1 生命",
};
