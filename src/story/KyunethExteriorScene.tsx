import { useEffect, useMemo, useRef, useState } from 'react';
import type { InputMode, KeyboardBindings } from '../game/engine';
import type { StoryPlayerEntity } from './storyPlayer';
import GameCanvas from './world/GameCanvas';
import DialogueController from './DialogueController';
import { createKetlinDialogue } from './storyContent';
import TravelJournal from './TravelJournal';
export default function KyunethExteriorScene({player,isTouch,inputMode,movementKeys,onBack}:{player:StoryPlayerEntity;isTouch:boolean;inputMode:InputMode;movementKeys:Pick<KeyboardBindings,'up'|'down'|'left'|'right'>;onBack:()=>void}){
 const [landmark,setLandmark]=useState('CAMINHO COSTEIRO'),[arrival,setArrival]=useState(true);
 const [conversation,setConversation]=useState(false);
 const greeted=useRef(false);
 const dialogue=useMemo(()=>createKetlinDialogue(player.name),[player.name]);
 const approach=(id:string)=>{if(id==='ketlin'&&!greeted.current){greeted.current=true;player.walking=false;player.direction='up';setConversation(true);}};
 const [showLocation,setShowLocation]=useState(true);
 useEffect(()=>{setShowLocation(true);const timer=window.setTimeout(()=>setShowLocation(false),3600);return()=>window.clearTimeout(timer);},[landmark]);
 useEffect(()=>{const timer=window.setTimeout(()=>setArrival(false),2200);return()=>window.clearTimeout(timer);},[]);
 return <div className="kyuneth-state"><GameCanvas player={player} mode="explore" isTouch={isTouch} inputMode={inputMode} movementKeys={movementKeys} onBack={onBack} onLandmark={setLandmark} movementLocked={conversation} onNpcNearby={approach}>
  {paused=> <>
   {conversation&&<DialogueController dialogue={dialogue} paused={paused} onComplete={()=>setConversation(false)}/>}
   {!arrival&&<div hidden={paused||conversation}><TravelJournal landmark={landmark} paused={paused}/></div>}
   {!arrival&&!conversation&&!paused&&<div className={`village-location ${showLocation?'is-visible':''}`} aria-live="polite"><span>Kyuneth</span><strong>{landmark.replace(' · EM BREVE','').toLocaleLowerCase('pt-BR')}</strong></div>}
   <div className={`kyuneth-arrival ${arrival?'is-visible':''}`}><span>VOCÊ CHEGOU A</span><strong>KYUNETH</strong><small>UMA VILA À BEIRA-MAR</small></div>
  </>}
 </GameCanvas></div>;
}
