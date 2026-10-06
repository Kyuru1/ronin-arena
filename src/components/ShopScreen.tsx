import { useEffect, useRef, useState } from "react";
import { DIFFICULTY_RULES, isPowerUpAtLimit, type HudStats, type MagicType, type PowerUp, type Weapon, type WeaponUpgrade } from "../game/engine";
import { GAMEPLAY_TEXT, type GameplayStrings } from "../game/gameplayText";
import type { Language, Strings } from "../game/i18n";
import PixelSprite from "./PixelSprite";
import WeaponPreview from "./WeaponPreview";
import { CoinBox, PxButton, PxFrame } from "./PixelUi";
import CharacterDetails from "./CharacterDetails";
import { useMenuNavigation } from "./useMenuNavigation";
import { localizedWeapon } from "../game/localizedContent";
import { RACE_CONFIG } from "../game/races";
import "../shop-hud.css";

interface WeaponShopInfo { id: Weapon; cost: number; sellRefund: number; dmg: number; spd: number; range: number; }
const ALL_WEAPONS: WeaponShopInfo[] = [
  { id: "katana", cost: 25, sellRefund: 15, dmg: 2, spd: 5, range: 3 }, { id: "bow", cost: 35, sellRefund: 20, dmg: 3, spd: 3, range: 5 },
  { id: "hammer", cost: 55, sellRefund: 30, dmg: 5, spd: 1, range: 3 }, { id: "shield", cost: 35, sellRefund: 20, dmg: 0, spd: 4, range: 2 },
  { id: "mine", cost: 28, sellRefund: 16, dmg: 5, spd: 2, range: 4 }, { id: "book", cost: 65, sellRefund: 36, dmg: 4, spd: 3, range: 4 },
  { id: "staff", cost: 75, sellRefund: 42, dmg: 2, spd: 2, range: 4 },
  { id: "boomerang", cost: 58, sellRefund: 32, dmg: 3, spd: 3, range: 5 },
  { id: "shuriken", cost: 48, sellRefund: 27, dmg: 2, spd: 5, range: 5 },
  { id: "spear", cost: 68, sellRefund: 38, dmg: 5, spd: 1, range: 5 },
];
const POWERUPS: Array<{ id: PowerUp; nameKey: keyof Strings; descKey: keyof Strings; cost: number; icon: string }> = [
  { id: "speed", nameKey: "speedUp", descKey: "speedDesc", cost: 20, icon: "icoSpeed" }, { id: "heart", nameKey: "heartUp", descKey: "heartDesc", cost: 30, icon: "icoHeart" },
  { id: "dashCd", nameKey: "dashCdUp", descKey: "dashCdDesc", cost: 25, icon: "icoClock" }, { id: "dashDist", nameKey: "dashDistUp", descKey: "dashDistDesc", cost: 25, icon: "icoDash" },
];
const UPGRADE_TYPES: WeaponUpgrade[] = ["damage", "speed", "range", "form"];
const MAGIC_TYPES: MagicType[] = ["fire", "ice", "poison", "water"];
type Tab = "menu" | "weapons" | "stats" | "upgrades" | "character";
const SHOP_GUIDE = {
  pt: { recommended: "RECOMENDADO AGORA", opportunities: "MELHORIAS DISPONÍVEIS", newItems: "ARMAS QUE VOCÊ PODE COMPRAR", visited: "VISTO", available: "DISPONÍVEL", owned: "EQUIPADA", inspect: "TOQUE PARA VER", buyAction: "COMPRAR E EQUIPAR", sellAction: "VENDER E REMOVER", reorder: "TROCAR POSIÇÃO", chooseSlot: "ESCOLHA A PRIMEIRA ARMA", chooseTarget: "AGORA ESCOLHA O DESTINO", done: "POSIÇÕES TROCADAS", nextWarning: "AINDA HÁ MELHORIAS QUE VOCÊ PODE COMPRAR.", stay: "CONTINUAR NA LOJA", leave: "IR MESMO ASSIM", noMoney: "MOEDAS INSUFICIENTES", max: "NÍVEL MÁXIMO", noEvolution: "ESTA ARMA NÃO POSSUI EVOLUÇÃO", missing: "FALTAM", level: "NÍVEL", beforeAfter: "ANTES → DEPOIS", feedbackBuy: "COMPRA REALIZADA", feedbackUpgrade: "MELHORIA APLICADA", feedbackSell: "ARMA VENDIDA", active: "ATIVA" },
  en: { recommended: "RECOMMENDED NOW", opportunities: "AVAILABLE UPGRADES", newItems: "WEAPONS YOU CAN BUY", visited: "VIEWED", available: "AVAILABLE", owned: "EQUIPPED", inspect: "SELECT TO INSPECT", buyAction: "BUY AND EQUIP", sellAction: "SELL AND REMOVE", reorder: "REORDER", chooseSlot: "CHOOSE THE FIRST WEAPON", chooseTarget: "NOW CHOOSE ITS DESTINATION", done: "POSITIONS SWAPPED", nextWarning: "YOU STILL HAVE AFFORDABLE UPGRADES.", stay: "STAY IN SHOP", leave: "LEAVE ANYWAY", noMoney: "NOT ENOUGH COINS", max: "MAX LEVEL", noEvolution: "THIS WEAPON HAS NO EVOLUTION", missing: "MISSING", level: "LEVEL", beforeAfter: "BEFORE → AFTER", feedbackBuy: "PURCHASE COMPLETE", feedbackUpgrade: "UPGRADE APPLIED", feedbackSell: "WEAPON SOLD", active: "ACTIVE" },
} as const;

function Price({ cost }: { cost: number }) { return <span className="inline-flex items-center gap-1"><PixelSprite name="coin" scale={1} />{cost}</span>; }
function weaponName(w: Weapon, t: Strings, g: GameplayStrings, language: Language, form = 0) {
  const localized = localizedWeapon(language, w); if (localized) return localized[0];
  if (w === "harp") return "ARPA DIVINA"; if (w === "godslayer") return "GODSLAYER"; if (w === "book") return g.book; if (w === "staff") return form ? g.necromancerStaff : g.staff;
  if (w === "bow" && form) return g.automaticPistol; if (w === "hammer" && form) return g.titanHammer; return t[w as keyof Strings] as string;
}
function weaponDescription(w: Weapon, t: Strings, g: GameplayStrings, language: Language) { const localized = localizedWeapon(language, w); if (localized) return localized[1]; return w === "book" ? g.bookDesc : w === "staff" ? g.staffDesc : t[`${w}Desc` as keyof Strings] as string; }
function upgradeCost(weapon: Weapon, kind: WeaponUpgrade, level: number) {
  if (kind === "form") return weapon === "hammer" ? 130 : weapon === "book" ? 120 : weapon === "katana" ? 115 : weapon === "staff" ? 110 : weapon === "bow" ? 105 : 100;
  return (kind === "damage" ? 20 : kind === "speed" ? 24 : 22) + level * 18;
}
function upgradeDescription(kind: WeaponUpgrade, weapon: Weapon, language: Language) {
  if (language !== "pt") return kind === "damage" ? "Increases this weapon's damage." : kind === "speed" ? "Reduces the time between attacks." : kind === "range" ? "Extends the weapon's reach." : `Changes ${weapon} into its evolved form.`;
  if (kind === "damage") return "Aumenta o dano causado por cada ataque.";
  if (kind === "speed") return "Reduz o tempo entre ataques e dispara mais vezes.";
  if (kind === "range") return "Aumenta a distância que o ataque alcança.";
  if (weapon === "katana") return "Transforma a espada em uma lâmina com golpes mais amplos.";
  if (weapon === "bow") return "Transforma o arco em uma pistola automática.";
  if (weapon === "hammer") return "Transforma o martelo em um martelo titã com impacto maior.";
  if (weapon === "book") return "Desbloqueia a evolução do livro arcano.";
  if (weapon === "staff") return "Transforma o cajado em um cajado necromante.";
  if (weapon === "spear") return "A lança fica maior e mais rápida; cada golpe aplica sangramento permanente e cumulativo.";
  if (weapon === "boomerang") return "Aumenta o bumerangue e permite atingir todos os inimigos encontrados durante o percurso.";
  return "Transforma a shuriken em uma lâmina gigante que explode em oito direções ao alcançar sua distância máxima.";
}
function upgradeLabel(weapon: Weapon, kind: WeaponUpgrade, fallback: string) {
  const labels: Partial<Record<Weapon, Partial<Record<WeaponUpgrade, string>>>> = {
    katana: { damage: "CORTE", speed: "FLUIDEZ", range: "LÂMINA" }, boomerang: { damage: "IMPACTO", speed: "GIRO", range: "RETORNO" }, shuriken: { damage: "CORTE", speed: "CADÊNCIA", range: "ALCANCE" }, spear: { damage: "PONTA", speed: "ESTOCADA", range: "HASTE" }, bow: { damage: "IMPACTO", speed: "CADÊNCIA", range: "PRECISÃO" }, hammer: { damage: "IMPACTO", speed: "BALANÇO", range: "ONDA" },
    shield: { damage: "REFLEXÃO", speed: "RECARGA", range: "COBERTURA" }, mine: { damage: "EXPLOSÃO", speed: "ARMAMENTO", range: "RAIO" }, book: { damage: "POTÊNCIA", speed: "CONJURAÇÃO", range: "ÁREA" }, staff: { damage: "VÍNCULO", speed: "RITUAL", range: "ALCANCE" },
  };
  return labels[weapon]?.[kind] ?? fallback;
}
function Pips({ value, color }: { value: number; color: string }) { return <span className="inline-flex gap-[3px]">{Array.from({ length: 5 }).map((_, i) => <i key={i} className="h-2 w-2 border-2 border-[#070305]" style={{ background: i < value ? color : "#2a0e13" }} />)}</span>; }

export default function ShopScreen({ wave, stats, onBuyWeapon, onSellWeapon, onSelectSlot, onReorderWeapons, onBuyPowerUp, onUpgradeWeapon, onMagicType, onCloseShop, language, t, abilityBinding, isTouch }: {
  wave: number; stats: HudStats; onBuyWeapon: (w: Weapon, cost: number) => void; onSellWeapon: (slot: number, refund: number) => void; onSelectSlot: (slot: number) => void; onReorderWeapons: (from: number, to: number) => void; onBuyPowerUp: (p: PowerUp, cost: number) => void; onUpgradeWeapon: (w: Weapon, upgrade: WeaponUpgrade, cost: number) => void; onMagicType: (type: MagicType) => void; onCloseShop: () => void; language: Language; t: Strings; abilityBinding: string; isTouch: boolean;
}) {

  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useMenuNavigation(true, root);
  const [tab, setTab] = useState<Tab>("menu");
  const [selected, setSelected] = useState<Weapon>(stats.weapons[stats.activeSlot] ?? "katana");
  const [slotToMove, setSlotToMove] = useState<number | null>(null);
  const [dragged, setDragged] = useState<number | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [sellConfirm, setSellConfirm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const pt = language === "pt";
  const copy = (a: string, b: string) => pt ? a : b;
  const g = GAMEPLAY_TEXT[language];
  const guide = pt ? SHOP_GUIDE.pt : SHOP_GUIDE.en;
  const maxWeapons = stats.maxWeaponSlots;
  const info = ALL_WEAPONS.find(item => item.id === selected);
  const owned = stats.weapons.includes(selected);
  const selectedIndex = stats.weapons.indexOf(selected);
  const levels = stats.weaponLevels[selected];
  const racial = (stats.raceId === "divinity" && ["harp", "godslayer"].includes(selected)) || (stats.raceId === "elf" && selected === "bow");
  const canSell = owned && !!info && !racial && stats.weapons.length > 1;
  const canEvolve = (weapon: Weapon) => ["katana", "bow", "hammer", "book", "staff", "boomerang", "shuriken", "spear"].includes(weapon);
  const affordableWeapons = stats.weapons.length >= maxWeapons ? 0 : ALL_WEAPONS.filter(item => !stats.weapons.includes(item.id) && item.cost <= stats.coins).length;
  const affordableStats = POWERUPS.filter(power => !isPowerUpAtLimit(stats, power.id, stats.difficulty) && power.cost <= stats.coins).length;
  const affordableUpgrades = stats.weapons.reduce((total, weapon) => total + UPGRADE_TYPES.filter(kind =>
    (kind !== "form" || canEvolve(weapon)) && stats.weaponLevels[weapon][kind] < (kind === "form" ? 1 : 3) &&
    upgradeCost(weapon, kind, stats.weaponLevels[weapon][kind]) <= stats.coins).length, 0);
  const affordableTotal = affordableWeapons + affordableStats + affordableUpgrades;
  const recommendedTab: Tab = stats.hp < stats.maxHp && stats.coins >= 30 && !isPowerUpAtLimit(stats, "heart", stats.difficulty) ? "stats" : affordableUpgrades ? "upgrades" : affordableStats ? "stats" : affordableWeapons ? "weapons" : "character";
  const tabs: { id: Tab; name: string; detail: string; icon: string; count?: number }[] = [
    { id: "weapons", name: copy("Armas", "Weapons"), detail: copy("Encontre seu próximo estilo de combate.", "Find your next fighting style."), icon: "icoSword", count: affordableWeapons },
    { id: "upgrades", name: copy("Melhorar arma", "Upgrade weapon"), detail: copy("Fortaleça as armas que já são suas.", "Strengthen the weapons you own."), icon: "icoAnvil", count: affordableUpgrades },
    { id: "stats", name: "Ronin", detail: copy("Mais vida, mobilidade e sobrevivência.", "More health, mobility and survival."), icon: "icoHeart", count: affordableStats },
    { id: "character", name: copy("Sua jornada", "Your journey"), detail: copy("Consulte sua raça, perk e atributos.", "Review your race, perk and stats."), icon: "icoTrophy" },
  ];
  const name = (weapon: Weapon) => weaponName(weapon, t, g, language, stats.weaponLevels[weapon].form);
  const openTab = (next: Tab) => { setTab(next); setLeaveConfirm(false); setSellConfirm(false); setReorderMode(false); setSlotToMove(null); };
  const select = (weapon: Weapon) => { setSelected(weapon); setSellConfirm(false); };
  const announce = (message: string) => setFeedback(message);
  const race = RACE_CONFIG[stats.raceId];
  const baseLimits = DIFFICULTY_RULES[stats.difficulty].limits;
  const limits = { hp: Math.min(50, Math.max(1, Math.floor(baseLimits.maxHp * race.modifiers.maxHp * race.modifiers.attributeLimit))), speed: baseLimits.speed * race.modifiers.attributeLimit, dash: baseLimits.dashMax / race.modifiers.attributeLimit, distance: baseLimits.dashSpeedMult * race.modifiers.attributeLimit };
  const powerComparison = (power: PowerUp) => power === "speed" ? `${108 + stats.speedBonus} → ${Math.min(limits.speed, 126 + stats.speedBonus)}` : power === "heart" ? `${stats.maxHp} → ${Math.min(limits.hp, Math.floor(stats.maxHp) + 1)} ♥` : power === "dashCd" ? `${stats.dashMax.toFixed(1)}s → ${Math.max(limits.dash, stats.dashMax - .8).toFixed(1)}s` : `×${stats.dashSpeedMult.toFixed(2)} → ×${Math.min(limits.distance, stats.dashSpeedMult + .25).toFixed(2)}`;
  const missingText = (cost: number) => copy(`Faltam ${Math.max(0, cost - stats.coins)} moedas`, `Need ${Math.max(0, cost - stats.coins)} more coins`);

  useEffect(() => {
    content.current?.scrollTo(0, 0);
    root.current?.querySelector<HTMLElement>(".shop-section-title")?.focus({ preventScroll: true });
  }, [tab]);
  useEffect(() => { if (!feedback) return; const id = window.setTimeout(() => setFeedback(""), 3200); return () => clearTimeout(id); }, [feedback]);
  useEffect(() => {
    if (tab === "upgrades" && !stats.weapons.includes(selected)) setSelected(stats.weapons[stats.activeSlot] ?? stats.weapons[0] ?? "katana");
  }, [stats.activeSlot, stats.weapons, selected, tab]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable=true]")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (sellConfirm) setSellConfirm(false);
        else if (leaveConfirm) setLeaveConfirm(false);
        else openTab("menu");
      }
      const shortcuts: Record<string, Tab> = { "1": "weapons", "2": "upgrades", "3": "stats", "4": "character" };
      if (shortcuts[event.key]) openTab(shortcuts[event.key]);
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [sellConfirm, leaveConfirm]);

  const renderWeapon = (weapon: Weapon) => {
    const item = ALL_WEAPONS.find(entry => entry.id === weapon);
    const index = stats.weapons.indexOf(weapon);
    const buyable = index < 0 && !!item && item.cost <= stats.coins && stats.weapons.length < maxWeapons;
    return <button key={weapon} aria-pressed={selected === weapon} onClick={() => select(weapon)} className={`store-weapon ${selected === weapon ? "is-selected" : ""} ${buyable ? "is-affordable" : ""}`}>
      <WeaponPreview weapon={weapon} form={stats.weaponLevels[weapon].form} scale={2} />
      <span><strong>{name(weapon)}</strong><small>{index >= 0 ? index === stats.activeSlot ? copy("✓ Em uso", "✓ Active") : copy(`No arsenal · slot ${index + 1}`, `Owned · slot ${index + 1}`) : buyable ? copy("Disponível para comprar", "Ready to buy") : copy("Selecione para conhecer", "Select to inspect")}</small></span>
      {index < 0 && item && <Price cost={item.cost} />}
    </button>;
  };
  const renderUpgrade = (kind: WeaponUpgrade) => {
    const level = levels[kind], max = kind === "form" ? 1 : 3;
    const allowed = kind !== "form" || canEvolve(selected);
    const cost = upgradeCost(selected, kind, level), maxed = level >= max;
    const available = allowed && !maxed && stats.coins >= cost;
    return <article key={kind} className={`store-card ${available ? "is-affordable" : ""}`}>
      <div className="store-card-heading"><h3>{g[kind]}{pt && kind !== "form" && <small>{upgradeLabel(selected, kind, g[kind])}</small>}</h3><span className="store-badge">{guide.level} {level}/{max}</span></div>
      <p>{allowed ? upgradeDescription(kind, selected, language) : guide.noEvolution}</p>
      <div className="store-comparison">{!allowed ? "—" : maxed ? copy("✓ Concluído", "✓ Complete") : kind === "form" ? copy("Original → Evoluída", "Original → Evolved") : `${copy("Nível", "Level")} ${level} → ${level + 1}`}</div>
      <div className="store-levels" aria-label={`${guide.level} ${level}/${max}`}>{Array.from({ length: max }, (_, i) => <i key={i} className={i < level ? "is-filled" : ""} />)}</div>
      <div className="store-purchase">
        <span>{allowed && !maxed ? <>{copy("Custo", "Cost")} <Price cost={cost} /></> : copy("Sem custo adicional", "No further cost")}</span>
        <PxButton tone="gold" disabled={!available} onClick={() => { onUpgradeWeapon(selected, kind, cost); announce(`${guide.feedbackUpgrade} · ${name(selected)} · ${g[kind]}`); }}>
          {!allowed ? copy("Não se aplica", "Not applicable") : maxed ? guide.max : !available ? missingText(cost) : copy("Melhorar", "Upgrade")}
        </PxButton>
      </div>
    </article>;
  };

  return <div ref={root} className="px-backdrop store-backdrop absolute inset-0 z-30">
    <PxFrame title={t.waveClearedTitle.replace("{wave}", String(wave))} className="shop-frame store-frame">
      <header className="store-header">
        <button className="store-back" data-menu-back onClick={() => { if (sellConfirm) setSellConfirm(false); else if (leaveConfirm) setLeaveConfirm(false); else openTab("menu"); }} disabled={tab === "menu" && !leaveConfirm}>
          <span aria-hidden="true">←</span> {copy("Voltar", "Back")} {!isTouch && <kbd>Esc</kbd>}
        </button>
        <div className="store-heading"><h1>{copy("LOJA DA ARENA", "ARENA SHOP")}</h1></div>
        <CoinBox coins={stats.coins} label={copy("SEU SALDO", "BALANCE")} />
      </header>
      <nav className="store-nav" aria-label={copy("Seções da loja", "Shop sections")}>
        <button aria-current={tab === "menu" ? "page" : undefined} onClick={() => openTab("menu")}>{copy("Visão geral", "Overview")}</button>
        {tabs.map(item => <button key={item.id} aria-current={tab === item.id ? "page" : undefined} onClick={() => openTab(item.id)}>{item.name}{item.count !== undefined && item.count > 0 && <span aria-label={copy("opções acessíveis", "affordable options")}>{item.count}</span>}</button>)}
      </nav>
      <div className={`store-notice ${feedback ? "has-feedback" : ""}`} role="status" aria-live="polite">{feedback || copy("Escolha, compare e fortaleça seu Ronin. As moedas não gastas ficam com você.", "Choose, compare and strengthen your Ronin. Unspent coins stay with you.")}</div>
      <div ref={content} className="shop-content scrollbar-thin">
        <h2 className="shop-section-title" tabIndex={-1}>{tab === "menu" ? copy("ESCOLHA SUA MELHORIA", "CHOOSE YOUR UPGRADE") : tabs.find(item => item.id === tab)?.name}</h2>
        {tab === "menu" && <>
          <div className="store-welcome">
            <div><span className="store-eyebrow">{affordableTotal ? copy("UMA BOA PRÓXIMA ESCOLHA", "A GOOD NEXT CHOICE") : copy("SEU RONIN ESTÁ PRONTO", "YOUR RONIN IS READY")}</span>
              <h3>{affordableTotal ? recommendedTab === "upgrades" ? copy("Dê mais força ao seu arsenal.", "Give your arsenal an edge.") : recommendedTab === "stats" ? copy("Prepare-se para durar mais.", "Prepare to survive longer.") : copy("Experimente uma nova arma.", "Try a new weapon.") : copy("Guarde moedas para a próxima visita.", "Save coins for your next visit.")}</h3>
              <p>{affordableTotal ? copy("As opções marcadas cabem no seu saldo atual. Cada compra atualiza as possibilidades.", "Marked options fit your current balance. Each purchase updates your choices.") : copy("Nenhuma compra cabe no saldo atual. Você pode consultar sua jornada ou seguir para a arena.", "Nothing fits your balance yet. Review your journey or return to the arena.")}</p>
              <button className="store-text-link" onClick={() => openTab(recommendedTab)}>{copy("Ver", "View")} {tabs.find(item => item.id === recommendedTab)?.name} →</button>
            </div>
            <div className="store-welcome-art" aria-hidden="true"><WeaponPreview weapon={stats.weapons[stats.activeSlot] ?? "katana"} form={stats.weaponLevels[stats.weapons[stats.activeSlot] ?? "katana"].form} scale={3} angle={-30} /><span>RONIN / {String(wave + 1).padStart(2, "0")}</span></div>
          </div>
          <div className="store-categories">{tabs.map((item, i) => <button key={item.id} className={`store-category ${recommendedTab === item.id && affordableTotal ? "is-recommended" : ""}`} onClick={() => openTab(item.id)}>
            <span className="store-category-number">0{i + 1}<span>↗</span></span><h3>{item.name}</h3><p>{item.detail}</p>
            <span className="store-category-status">{item.count === undefined ? copy("Ver detalhes", "View details") : item.count > 0 ? copy(`${item.count} opções no seu saldo`, `${item.count} affordable options`) : copy("Explorar opções", "Explore options")}</span>
          </button>)}</div>
        </>}
        {(tab === "weapons" || tab === "upgrades") && <div className={`store-workbench ${tab === "upgrades" ? "is-upgrades" : "is-weapons"}`}>
          <aside className="store-catalog"><p className="store-caption">{tab === "weapons" ? copy("Selecione para ver detalhes. A compra só acontece no botão Comprar.", "Select to inspect. Only the Buy button makes a purchase.") : copy("Escolha a arma que quer fortalecer.", "Choose the weapon to upgrade.")}</p>
            <div className="store-weapon-list">{(tab === "weapons" ? [...ALL_WEAPONS.map(item => item.id), ...stats.weapons.filter(weapon => !ALL_WEAPONS.some(item => item.id === weapon))] : stats.weapons).map(renderWeapon)}</div>
            {tab === "weapons" && <section className="store-arsenal"><div className="store-card-heading"><h3>{copy("Seu arsenal", "Your arsenal")} <small>{stats.weapons.length}/{maxWeapons}</small></h3><button className="store-text-link" disabled={stats.weapons.length < 2} onClick={() => { setReorderMode(!reorderMode); setSlotToMove(null); }}>{reorderMode ? copy("Cancelar", "Cancel") : copy("Reordenar", "Reorder")}</button></div>
              <p>{reorderMode ? slotToMove === null ? copy("Selecione a primeira arma.", "Select the first weapon.") : copy("Selecione outra arma para trocar de posição.", "Select another weapon to swap positions.") : copy("Toque numa arma para usá-la. Arraste ou use Reordenar para trocar posições.", "Select a weapon to equip it. Drag or use Reorder to swap positions.")}</p>
              <div className="store-slots">{Array.from({ length: maxWeapons }, (_, index) => {
                const weapon = stats.weapons[index];
                return weapon ? <button key={index} title={name(weapon)} aria-label={`Slot ${index + 1}: ${name(weapon)}`} aria-pressed={index === stats.activeSlot} draggable={!isTouch && !reorderMode} onDragStart={() => setDragged(index)} onDragEnd={() => setDragged(null)} onDragOver={event => event.preventDefault()} onDrop={() => { if (dragged !== null && dragged !== index) { onReorderWeapons(dragged, index); announce(guide.done); } setDragged(null); }}
                  onClick={() => { if (reorderMode) { if (slotToMove === null) setSlotToMove(index); else { onReorderWeapons(slotToMove, index); setSlotToMove(null); setReorderMode(false); announce(guide.done); } } else { onSelectSlot(index); select(weapon); } }}
                  className={`${index === stats.activeSlot ? "is-active" : ""} ${slotToMove === index ? "is-moving" : ""}`}><span>{index + 1}</span><WeaponPreview weapon={weapon} form={stats.weaponLevels[weapon].form} scale={1} /><small>{index === stats.activeSlot ? copy("Em uso", "Active") : copy("Usar", "Equip")}</small></button> : <div key={index}><span>{index + 1}</span><small>{copy("Livre", "Empty")}</small></div>;
              })}</div>
            </section>}
          </aside>
          <section className="store-selection" aria-label={name(selected)}>
            <div className={`store-weapon-hero ${tab === "upgrades" ? "is-compact" : ""}`}><div><span className="store-eyebrow">{owned ? selectedIndex === stats.activeSlot ? copy("ARMA EM USO", "ACTIVE WEAPON") : copy("NO SEU ARSENAL", "IN YOUR ARSENAL") : copy("CONHEÇA SUA PRÓXIMA ARMA", "YOUR NEXT WEAPON")}</span><h3>{name(selected)}</h3><p>{weaponDescription(selected, t, g, language)}</p></div><WeaponPreview weapon={selected} form={levels.form} scale={2} angle={-30} /></div>
            {tab === "upgrades" ? <><div className="store-upgrades">{UPGRADE_TYPES.map(renderUpgrade)}</div>{selected === "book" && <section className="store-card"><h3>{g.magic}</h3><div className="store-magic">{MAGIC_TYPES.map(magic => <button key={magic} aria-pressed={stats.magicType === magic} onClick={() => onMagicType(magic)}><strong>{g[magic]}</strong><span>{g[`${magic}Desc` as keyof typeof g]}</span></button>)}</div></section>}</> : <>
              {info && <div className="store-ratings" aria-label={copy("Perfil relativo da arma, de 0 a 5", "Relative weapon profile, 0 to 5")}>{[[t.dmg, info.dmg, "#fa858a"], [t.spd, info.spd, "#e9c675"], [t.range, info.range, "#8bd1cd"]].map(([label, value, color]) => <div key={String(label)}><span>{label}</span><Pips value={Number(value)} color={String(color)} /><small>{value}/5</small></div>)}</div>}
              <p className="store-caption">{copy("O perfil compara o estilo das armas; não representa o dano final da sua run.", "This profile compares weapon styles, not your run's final damage.")}</p>
              <section className="store-card store-buy-box">
                {owned ? <>
                  <div className="store-card-heading"><h3>{copy("Esta arma já é sua", "You own this weapon")}</h3><span className="store-badge">SLOT {selectedIndex + 1}</span></div>
                  <div className="store-owned-actions"><PxButton tone="gold" disabled={selectedIndex === stats.activeSlot} onClick={() => { onSelectSlot(selectedIndex); announce(copy("Arma em uso", "Weapon equipped")); }}>{selectedIndex === stats.activeSlot ? copy("✓ Em uso", "✓ Active") : copy("Usar esta arma", "Equip weapon")}</PxButton><PxButton onClick={() => openTab("upgrades")}>{copy("Melhorar arma", "Upgrade weapon")} →</PxButton></div>
                  {canSell && info ? sellConfirm ? <div className="store-sell-confirm"><p>{copy(`Remover ${name(selected)} do arsenal por ${info.sellRefund} moedas?`, `Remove ${name(selected)} for ${info.sellRefund} coins?`)}</p><button onClick={() => setSellConfirm(false)}>{copy("Cancelar", "Cancel")}</button><button onClick={() => { onSellWeapon(selectedIndex, info.sellRefund); setSellConfirm(false); announce(guide.feedbackSell); }}>{copy("Confirmar venda", "Confirm sale")}</button></div> : <button className="store-sell" onClick={() => setSellConfirm(true)}>{copy("Vender arma", "Sell weapon")} · +<Price cost={info.sellRefund} /></button> : <p className="store-caption">{racial ? copy("Arma racial: permanece com você.", "Racial weapon: stays with you.") : copy("Mantenha pelo menos uma arma no arsenal.", "Keep at least one weapon in your arsenal.")}</p>}
                </> : info && <>
                  <div className="store-card-heading"><h3>{copy("Adicionar ao arsenal", "Add to your arsenal")}</h3><Price cost={info.cost} /></div>
                  <p>{stats.weapons.length >= maxWeapons ? copy("Arsenal cheio. Venda uma arma para abrir espaço.", "Arsenal full. Sell a weapon to make room.") : stats.coins >= info.cost ? copy(`Após a compra: ${stats.coins - info.cost} moedas. A arma será equipada automaticamente.`, `After purchase: ${stats.coins - info.cost} coins. The weapon equips automatically.`) : missingText(info.cost)}</p>
                  <PxButton tone="gold" disabled={stats.coins < info.cost || stats.weapons.length >= maxWeapons} onClick={() => { onBuyWeapon(selected, info.cost); announce(`${guide.feedbackBuy} · ${name(selected)}`); }}>{stats.weapons.length >= maxWeapons ? copy("Arsenal cheio", "Arsenal full") : stats.coins < info.cost ? missingText(info.cost) : <>{copy("Comprar e equipar", "Buy and equip")} · <Price cost={info.cost} /></>}</PxButton>
                </>}
              </section>
            </>}
          </section>
        </div>}
        {tab === "stats" && <>
          <p className="store-caption">{copy("Compare os atributos antes de comprar. Valores base; raça, perk e efeitos podem aplicar modificadores.", "Compare before buying. Base values; race, perk and effects may apply modifiers.")}</p>
          <div className="store-stat-readouts"><div><span>{copy("Vida atual", "Current health")}</span><strong>{stats.hp.toFixed(1)} / {stats.maxHp}</strong></div><div><span>{copy("Movimento base", "Base movement")}</span><strong>{108 + stats.speedBonus}</strong></div><div><span>{copy("Recarga base do dash", "Base dash cooldown")}</span><strong>{stats.dashMax.toFixed(1)}s</strong></div><div><span>{copy("Força do dash", "Dash power")}</span><strong>×{stats.dashSpeedMult.toFixed(2)}</strong></div></div>
          <div className="store-powerups">{POWERUPS.map(power => {
            const maxed = isPowerUpAtLimit(stats, power.id, stats.difficulty), available = !maxed && stats.coins >= power.cost;
            return <article key={power.id} className={`store-card ${available ? "is-affordable" : ""}`}><div className="store-card-heading"><PixelSprite name={power.icon} scale={2} /><h3>{t[power.nameKey] as string}</h3></div><div className="store-comparison">{powerComparison(power.id)}</div><p>{t[power.descKey] as string}</p><div className="store-purchase"><span>{copy("Custo", "Cost")} <Price cost={power.cost} /></span><PxButton tone="gold" disabled={!available} onClick={() => { onBuyPowerUp(power.id, power.cost); announce(`${guide.feedbackUpgrade} · ${t[power.nameKey]}`); }}>{maxed ? guide.max : available ? copy("Melhorar Ronin", "Upgrade Ronin") : missingText(power.cost)}</PxButton></div></article>;
          })}</div>
        </>}
        {tab === "character" && <CharacterDetails data={{
          avatarId: stats.avatarId, hp: stats.hp, maxHp: stats.maxHp, baseDamage: stats.baseDamage,
          damageMultiplier: stats.damageMultiplier, effectiveDamage: stats.effectiveDamage, moveSpeed: stats.moveSpeed,
          attackSpeedMultiplier: stats.attackSpeedMultiplier, dashCooldown: stats.effectiveDashCooldown,
          dashSpeedMult: stats.dashSpeedMult, raceId: stats.raceId, perk: stats.perk, weapons: stats.weapons,
          weaponLevels: stats.weaponLevels, activeSlot: stats.activeSlot, activePotions: stats.activePotions,
          magicType: stats.magicType, gameMode: stats.gameMode, coins: stats.coins, wave: stats.wave,
          kills: stats.kills, score: stats.score, time: stats.time, perkBuffT: stats.perkBuffT, perkEchoReady: stats.perkEchoReady,
        }} abilityBinding={abilityBinding} language={language} />}
      </div>
      <footer className="store-footer">
        {leaveConfirm ? <div className="store-leave-confirm"><div><strong>{copy("Guardar suas moedas e seguir?", "Save your coins and continue?")}</strong><p>{copy("Ainda há opções no seu saldo. Você pode guardar as moedas para depois.", "You can still afford items. You may save your coins for later.")}</p></div><button data-menu-back onClick={() => setLeaveConfirm(false)}>{copy("Continuar comprando", "Keep shopping")}</button><PxButton tone="gold" onClick={onCloseShop}>{copy("Guardar e seguir", "Save and continue")} →</PxButton></div> : <>
          <div className="store-footer-copy"><strong>{affordableTotal ? copy(`${affordableTotal} opções cabem no seu saldo`, `${affordableTotal} options fit your balance`) : copy("Nenhuma compra disponível com este saldo", "No purchases available at this balance")}</strong><span>{copy("São alternativas de compra, não um pacote.", "These are alternatives, not a bundle.")}</span></div>
          <PxButton tone="gold" onClick={() => affordableTotal > 0 ? setLeaveConfirm(true) : onCloseShop()}>{copy("Começar onda", "Start wave")} {wave + 1} <span aria-hidden="true">→</span></PxButton>
        </>}
      </footer>
    </PxFrame>
  </div>;
}
