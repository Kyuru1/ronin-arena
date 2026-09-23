export type RaceId = "godHunter" | "oniBlood" | "spiritualHeir" | "ronin" | "survivor";
export type RaceRarity = "legendary" | "rare" | "common";

export interface RaceConfig {
  id: RaceId;
  name: string;
  rarity: RaceRarity;
  description: string;
  passive: string;
  icon: string;
  color: string;
  weight: number;
  modifiers: {
    damage: number;
    maxHp: number;
    moveSpeed: number;
    dashCooldown: number;
    attackSpeed: number;
    attributeLimit: number;
    initialProgress: number;
  };
  ability: {
    name: string;
    description: string;
    duration: number;
    cooldown: number;
    damage: number;
    moveSpeed: number;
    dashCooldown: number;
    attackSpeed: number;
    invulnerable: boolean;
    contactImmune: boolean;
    healMaxHpFraction: number;
  };
}

export const RARITY_WEIGHTS: Record<RaceRarity, number> = {
  legendary: 5,
  rare: 20,
  common: 50,
};

const ability = (overrides: Partial<RaceConfig["ability"]>): RaceConfig["ability"] => ({
  name: "",
  description: "",
  duration: 0,
  cooldown: 30,
  damage: 1,
  moveSpeed: 1,
  dashCooldown: 1,
  attackSpeed: 1,
  invulnerable: false,
  contactImmune: false,
  healMaxHpFraction: 0,
  ...overrides,
});

const modifiers = (overrides: Partial<RaceConfig["modifiers"]>): RaceConfig["modifiers"] => ({
  damage: 1,
  maxHp: 1,
  moveSpeed: 1,
  dashCooldown: 1,
  attackSpeed: 1,
  attributeLimit: 1,
  initialProgress: 0,
  ...overrides,
});

export const RACE_CONFIG: Record<RaceId, RaceConfig> = {
  godHunter: {
    id: "godHunter",
    name: "CAÇADOR DE DEUSES",
    rarity: "legendary",
    description: "Poder divino duplica todo dano e rompe os limites normais de progressão.",
    passive: "Dano x2 e atributos iniciam na metade da progressão até limites dobrados.",
    icon: "✦",
    color: "#ffd44a",
    weight: RARITY_WEIGHTS.legendary,
    modifiers: modifiers({ damage: 2, attributeLimit: 2, initialProgress: 0.5 }),
    ability: ability({
      name: "IMORTALIDADE",
      description: "Ignora todo dano e morte durante 5 segundos.",
      duration: 5,
      cooldown: 40,
      invulnerable: true,
    }),
  },
  oniBlood: {
    id: "oniBlood",
    name: "SANGUE ONI",
    rarity: "rare",
    description: "Uma linhagem agressiva que troca resistência por força bruta.",
    passive: "+25% de dano e -10% de vida máxima.",
    icon: "鬼",
    color: "#d65cff",
    weight: RARITY_WEIGHTS.rare,
    modifiers: modifiers({ damage: 1.25, maxHp: 0.9 }),
    ability: ability({
      name: "FÚRIA ONI",
      description: "+40% de dano e +20% de movimento por 6 segundos.",
      duration: 6,
      cooldown: 30,
      damage: 1.4,
      moveSpeed: 1.2,
    }),
  },
  spiritualHeir: {
    id: "spiritualHeir",
    name: "HERDEIRO ESPIRITUAL",
    rarity: "rare",
    description: "Mobilidade sobrenatural para atravessar o campo de batalha.",
    passive: "-20% na recarga do dash e +10% de movimento.",
    icon: "◇",
    color: "#75d9ff",
    weight: RARITY_WEIGHTS.rare,
    modifiers: modifiers({ moveSpeed: 1.1, dashCooldown: 0.8 }),
    ability: ability({
      name: "PASSO ESPIRITUAL",
      description: "Movimento e dash extremos; ignora dano de contato por 4 segundos.",
      duration: 4,
      cooldown: 25,
      moveSpeed: 1.65,
      dashCooldown: 0.25,
      contactImmune: true,
    }),
  },
  ronin: {
    id: "ronin",
    name: "RONIN",
    rarity: "common",
    description: "Equilibrado, confiável e preparado para qualquer arma.",
    passive: "+10% de dano e +5% de movimento.",
    icon: "刀",
    color: "#86efac",
    weight: RARITY_WEIGHTS.common,
    modifiers: modifiers({ damage: 1.1, moveSpeed: 1.05 }),
    ability: ability({
      name: "FOCO",
      description: "+20% de dano e +15% de velocidade de ataque por 5 segundos.",
      duration: 5,
      cooldown: 30,
      damage: 1.2,
      attackSpeed: 1.15,
    }),
  },
  survivor: {
    id: "survivor",
    name: "SOBREVIVENTE",
    rarity: "common",
    description: "Resistência simples e uma reserva de vida para momentos críticos.",
    passive: "+10% de vida máxima.",
    icon: "♥",
    color: "#ff8a68",
    weight: RARITY_WEIGHTS.common,
    modifiers: modifiers({ maxHp: 1.1 }),
    ability: ability({
      name: "SEGUNDO FÔLEGO",
      description: "Recupera 20% da vida máxima sem ultrapassar o limite.",
      cooldown: 35,
      healMaxHpFraction: 0.2,
    }),
  },
};

export const RACE_IDS = Object.keys(RACE_CONFIG) as RaceId[];

let forcedRace: RaceId | null = null;

/** Gancho temporário de desenvolvimento. Use forceRace(null) para voltar ao sorteio normal. */
export function forceRace(race: RaceId | null) {
  forcedRace = race;
}

export function isRaceId(value: unknown): value is RaceId {
  return typeof value === "string" && value in RACE_CONFIG;
}

export function rollRace(random = Math.random): RaceId {
  if (forcedRace) return forcedRace;
  const total = RACE_IDS.reduce((sum, id) => sum + RACE_CONFIG[id].weight, 0);
  let roll = Math.max(0, Math.min(0.999999999, random())) * total;
  for (const id of RACE_IDS) {
    roll -= RACE_CONFIG[id].weight;
    if (roll < 0) return id;
  }
  return "ronin";
}

export function raceRarityLabel(rarity: RaceRarity) {
  return rarity === "legendary" ? "LENDÁRIA" : rarity === "rare" ? "RARA" : "COMUM";
}

