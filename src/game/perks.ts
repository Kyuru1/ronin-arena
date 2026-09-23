export type Perk =
  | "bladeMonk"
  | "bloodContract"
  | "bottomlessPocket"
  | "predatorInstinct"
  | "sharpGlass"
  | "kyuEcho"
  | "cursedArsenal"
  | "lastBullet";

export interface PerkConfig {
  id: Perk;
  name: string;
  description: string;
  accent: string;
}

export const PERK_CONFIG: Record<Perk, PerkConfig> = {
  bladeMonk: {
    id: "bladeMonk",
    name: "MONGE DA LÂMINA ÚNICA",
    description: "Usa somente a katana e não pode comprar, vender ou equipar outras armas. A katana causa +85% de dano, ataca 35% mais rápido e o dash recarrega 20% mais rápido.",
    accent: "#ffd44a",
  },
  bloodContract: {
    id: "bloodContract",
    name: "CONTRATO DE SANGUE",
    description: "Enquanto estiver abaixo de 30% da vida máxima, causa +75% de dano e ataca 35% mais rápido. O bônus desliga imediatamente ao recuperar vida acima do limite.",
    accent: "#ff5a68",
  },
  bottomlessPocket: {
    id: "bottomlessPocket",
    name: "BOLSO SEM FUNDO",
    description: "Aumenta o inventário de 4 para 6 armas ou equipamentos, mas reduz a velocidade base de movimento em 12 pontos.",
    accent: "#b78cff",
  },
  predatorInstinct: {
    id: "predatorInstinct",
    name: "INSTINTO PREDADOR",
    description: "Cada abate concede por 2,5 segundos +28 de velocidade de movimento e +40% de velocidade de ataque. Novos abates renovam a duração.",
    accent: "#ff914d",
  },
  sharpGlass: {
    id: "sharpGlass",
    name: "VIDRO AFIADO",
    description: "Todos os ataques causam +35% de dano, mas a vida máxima inicial cai de 5 para 3 antes dos modificadores da raça e dos upgrades.",
    accent: "#7ee7ff",
  },
  kyuEcho: {
    id: "kyuEcho",
    name: "ECO DE KYU",
    description: "Carrega um eco a cada 6 segundos. O próximo ataque iniciado consome a carga e causa +65% de dano em todos os alvos atingidos por aquele ataque.",
    accent: "#69d7ff",
  },
  cursedArsenal: {
    id: "cursedArsenal",
    name: "ARSENAL AMALDIÇOADO",
    description: "Ataques de qualquer arma causam +20% de dano, incluindo magia, invocações e minas, mas a velocidade base de movimento é reduzida em 8 pontos.",
    accent: "#d65cff",
  },
  lastBullet: {
    id: "lastBullet",
    name: "ÚLTIMA BALA",
    description: "Com o arco, disparos totalmente carregados causam +100% de dano. Na forma de pistola automática, cada sexto disparo causa +100% de dano. Não altera outras armas.",
    accent: "#ffcf5a",
  },
};

export const PERKS = Object.values(PERK_CONFIG);

export function isPerk(value: unknown): value is Perk {
  return typeof value === "string" && value in PERK_CONFIG;
}
