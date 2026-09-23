import type { AvatarId } from "../game/auth";
import type { MagicType, Perk, Weapon, WeaponLevels } from "../game/engine";
import { PERK_CONFIG } from "../game/perks";
import { RACE_CONFIG, type RaceId } from "../game/races";
import type { Language } from "../game/i18n";
import PixelSprite from "./PixelSprite";
import WeaponPreview from "./WeaponPreview";

export interface CharacterDetailsData {
  avatarId?: AvatarId;
  hp?: number;
  maxHp?: number;
  baseDamage?: number;
  damageMultiplier?: number;
  effectiveDamage?: number;
  moveSpeed?: number;
  attackSpeedMultiplier?: number;
  dashCooldown?: number;
  dashSpeedMult?: number;
  raceId?: RaceId;
  perk?: Perk | null;
  weapons?: Weapon[];
  weaponLevels?: WeaponLevels;
  activeSlot?: number;
  activePotions?: Array<{ type: string; time: number }>;
  magicType?: MagicType;
  gameMode?: "solo" | "coop";
  coins?: number;
  wave?: number;
  kills?: number;
  score?: number;
  time?: number;
  perkBuffT?: number;
  perkEchoReady?: boolean;
}

const WEAPON_NAMES: Record<Weapon, string> = {
  katana: "Katana",
  bow: "Arco",
  hammer: "Martelo",
  shield: "Escudo",
  mine: "Mina",
  book: "Livro Arcano",
  staff: "Cajado",
  harp: "Arpa Divina",
  godslayer: "Godslayer",
};

function number(value: number | undefined, digits = 0, missing = "Not recorded") {
  return value === undefined || !Number.isFinite(value) ? missing : value.toFixed(digits);
}

function Stat({ label, value, tone = "text-[#ffe2c4]" }: { label: string; value: string; tone?: string }) {
  return <div className="character-stat"><span>{label}</span><strong className={tone}>{value}</strong></div>;
}

export default function CharacterDetails({ data, abilityBinding = "F · Y / TRIANGLE", language = "en" }: { data: CharacterDetailsData; abilityBinding?: string; language?: Language }) {
  const pt = language === "pt";
  const label = (portuguese: string, english: string) => pt ? portuguese : english;
  const race = data.raceId ? RACE_CONFIG[data.raceId] : null;
  const perk = data.perk ? PERK_CONFIG[data.perk] : null;
  const weapons = data.weapons ?? [];
  const current = weapons[data.activeSlot ?? 0] ?? weapons[0];
  const effects = [
    ...(data.activePotions ?? []).map((effect) => `${effect.type.toUpperCase()} ${Math.ceil(effect.time)}s`),
    ...(data.perkBuffT && data.perkBuffT > 0 ? [`PERK ATIVA ${data.perkBuffT.toFixed(1)}s`] : []),
    ...(data.perkEchoReady ? ["ECO PRONTO"] : []),
  ];

  return <section className="character-details">
    <div className="character-details-grid">
      <div className="character-portrait">
        <div className="character-portrait-glow" style={{ borderColor: race?.color ?? "#6c3a42" }}>
          <PixelSprite name={data.avatarId === "samurai" ? "player" : data.avatarId ?? "player"} scale={5} />
        </div>
        <strong>{data.avatarId ?? "samurai"}</strong>
        <span>{data.gameMode === "coop" ? label("COOPERATIVO", "CO-OP") : "SOLO"}</span>
        <div className="character-current-weapon">
          {current && <WeaponPreview weapon={current} form={data.weaponLevels?.[current]?.form ?? 0} scale={2} />}
          <span>{current ? WEAPON_NAMES[current] : label("ARMA NÃO REGISTRADA", "WEAPON NOT RECORDED")}</span>
        </div>
      </div>

      <div className="character-stats-grid">
        <Stat label={label("VIDA", "HEALTH")} value={data.hp === undefined || data.maxHp === undefined ? label("Não registrado", "Not recorded") : `${number(data.hp, 1)} / ${number(data.maxHp, 1)}`} tone="text-[#ff7c76]" />
        <Stat label={label("DANO BASE", "BASE DAMAGE")} value={number(data.baseDamage, 1)} />
        <Stat label={label("MULT. DE DANO", "DAMAGE MULT.")} value={data.damageMultiplier === undefined ? label("Não registrado", "Not recorded") : `x${number(data.damageMultiplier, 2)}`} tone="text-[#ffd44a]" />
        <Stat label={label("DANO EFETIVO", "EFFECTIVE DAMAGE")} value={number(data.effectiveDamage, 1)} tone="text-[#ff9b68]" />
        <Stat label={label("MOVIMENTO", "MOVEMENT")} value={number(data.moveSpeed, 0)} tone="text-[#86e7ff]" />
        <Stat label={label("VEL. DE ATAQUE", "ATTACK SPEED")} value={data.attackSpeedMultiplier === undefined ? label("Não registrado", "Not recorded") : `x${number(data.attackSpeedMultiplier, 2)}`} />
        <Stat label={label("RECARGA DO DASH", "DASH COOLDOWN")} value={data.dashCooldown === undefined ? label("Não registrado", "Not recorded") : `${number(data.dashCooldown, 2)}s`} />
        <Stat label={label("FORÇA DO DASH", "DASH POWER")} value={data.dashSpeedMult === undefined ? label("Não registrado", "Not recorded") : `x${number(data.dashSpeedMult, 2)}`} />
        <Stat label={label("WAVE / ABATES", "WAVE / KILLS")} value={data.wave === undefined ? label("Não registrado", "Not recorded") : `${data.wave} / ${data.kills ?? 0}`} />
        <Stat label={label("MOEDAS / SCORE", "COINS / SCORE")} value={data.coins === undefined ? label("Não registrado", "Not recorded") : `${data.coins} / ${(data.score ?? 0).toLocaleString()}`} />
      </div>
    </div>

    <div className="character-arsenal">
      <strong>{label("ARSENAL DA RUN", "RUN ARSENAL")}</strong>
      <div>{weapons.length ? weapons.map((weapon, index) => <span key={`${weapon}-${index}`} className={index === data.activeSlot ? "is-active" : ""}><WeaponPreview weapon={weapon} form={data.weaponLevels?.[weapon]?.form ?? 0} scale={1} />{WEAPON_NAMES[weapon]}{data.weaponLevels && <small>D{data.weaponLevels[weapon].damage} V{data.weaponLevels[weapon].speed} A{data.weaponLevels[weapon].range} F{data.weaponLevels[weapon].form}</small>}</span>) : <em>{label("Armas não registradas neste ranking antigo.", "Weapons were not recorded in this older ranking.")}</em>}</div>
    </div>

    {effects.length > 0 && <div className="character-effects"><strong>{label("EFEITOS ATIVOS", "ACTIVE EFFECTS")}</strong>{effects.map((effect) => <span key={effect}>{effect}</span>)}</div>}

    <div className="character-lore-grid">
      <article style={{ borderColor: perk?.accent ?? "#6c3a42" }}>
        <strong>PERK · {perk?.name ?? label("SEM PERK", "NO PERK")}</strong>
        <p>{perk?.description ?? label("Nenhuma perk foi registrada para esta run.", "No perk was recorded for this run.")}</p>
      </article>
      <article style={{ borderColor: race?.color ?? "#6c3a42" }}>
        <strong>{label("RAÇA", "RACE")} · {race?.name ?? label("NÃO REGISTRADA", "NOT RECORDED")}</strong>
        <p>{race ? race.description + " " + race.passive : label("A raça não foi registrada neste ranking antigo.", "Race was not recorded in this older ranking.")}</p>
      </article>
      <article className="character-ability" style={{ borderColor: race?.color ?? "#6c3a42" }}>
        <div><strong>{label("HABILIDADE", "ABILITY")} · {race?.ability.name ?? "—"}</strong><p>{race ? race.ability.description + " " + label("Recarga", "Cooldown") + ": " + race.ability.cooldown + "s." : "—"}</p></div>
        <kbd>{abilityBinding}</kbd>
      </article>
    </div>
  </section>;
}

