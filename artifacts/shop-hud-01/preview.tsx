import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/index.css';
import '../../src/responsive-panels.css';
import ShopScreen from '../../src/components/ShopScreen';
import Hud from '../../src/components/Hud';
import { Game } from '../../src/game/engine';
import { I18N } from '../../src/game/i18n';
const params = new URLSearchParams(location.search);
const game = new Game(document.createElement('canvas'));
game.phase = 'paused';
game.raceId = 'ronin'; game.hp = 3; game.maxHp = 3;
game.coins = Number(params.get('coins') ?? 24);
(window as any).testGame = game;
function Preview() {
  const [stats, setStats] = useState(() => game.stats());
  const [closed, setClosed] = useState(false);
  const update = (action: () => unknown) => { action(); setStats(game.stats()); };
  (window as any).refreshStats = () => setStats(game.stats());
  const touch = params.has('mobile');
  return <div data-device={touch ? 'mobile' : 'desktop'} style={{position:'fixed', inset:0, background:'#09202c'}}>
    {params.has('hud') ? <Hud stats={stats} best={3450} onPause={()=>{}} onSelectSlot={slot=>update(()=>game.switchSlot(slot))} onDash={()=>{}} onRaceAbility={()=>{}} raceAbilityBinding="F" onSpectate={()=>{}} onPotionDismiss={()=>{}} hudScale={1} hudEditMode={false} showContextHints={true} hudDensity="expanded" onHudEditDone={()=>{}} language="pt" t={I18N.pt} isTouch={touch} muted={false} onMute={()=>{}} /> : closed ? <p id="closed">Próxima onda</p> : <ShopScreen wave={1} stats={stats} onBuyWeapon={(w,c)=>update(()=>game.buyWeapon(w,c))} onSellWeapon={(s,c)=>update(()=>game.sellWeapon(s,c))} onSelectSlot={s=>update(()=>game.switchSlot(s))} onReorderWeapons={(a,b)=>update(()=>game.reorderWeapons(a,b))} onBuyPowerUp={(p,c)=>update(()=>game.buyPowerUp(p,c))} onUpgradeWeapon={(w,k,c)=>update(()=>game.buyWeaponUpgrade(w,k,c))} onMagicType={m=>update(()=>game.setMagicType(m))} onCloseShop={()=>setClosed(true)} language="pt" t={I18N.pt} abilityBinding="F · Y / TRIÂNGULO" isTouch={touch} />}
  </div>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
