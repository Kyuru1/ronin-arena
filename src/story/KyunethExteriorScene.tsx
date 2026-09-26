import { useEffect, useState } from 'react';
import type { InputMode, KeyboardBindings } from '../game/engine';
import type { StoryPlayerEntity } from './storyPlayer';
import GameCanvas from './world/GameCanvas';
export default function KyunethExteriorScene({player,isTouch,inputMode,movementKeys,onBack}:{player:StoryPlayerEntity;isTouch:boolean;inputMode:InputMode;movementKeys:Pick<KeyboardBindings,'up'|'down'|'left'|'right'>;onBack:()=>void}){
 const [landmark,setLandmark]=useState('CAMINHO COSTEIRO'),[arrival,setArrival]=useState(true);
 useEffect(()=>{const timer=window.setTimeout(()=>setArrival(false),2200);return()=>window.clearTimeout(timer);},[]);
 return <div className="kyuneth-state"><GameCanvas player={player} mode="explore" isTouch={isTouch} inputMode={inputMode} movementKeys={movementKeys} onBack={onBack} onLandmark={setLandmark}>
  {()=> <>
   <header className="kyuneth-hud"><div><span>KYUNETH</span><strong>{landmark}</strong></div><div className="kyuneth-objective"><span>PRÓLOGO</span><strong>CONHEÇA A VILA</strong></div></header>
   {!isTouch&&<div className="kyuneth-controls-hint"><b>{Object.values(movementKeys).join(' / ').toUpperCase()}</b> OU SETAS · CAMINHAR</div>}
   <div className={`kyuneth-arrival ${arrival?'is-visible':''}`}><span>VOCÊ CHEGOU A</span><strong>KYUNETH</strong><small>UMA VILA À BEIRA-MAR</small></div>
  </>}
 </GameCanvas></div>;
}
