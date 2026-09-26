import { useMemo, useState } from 'react';
import DialogueController from './DialogueController';
import { createIntroDialogue } from './storyContent';
import type { StoryPlayerEntity } from './storyPlayer';
import GameCanvas from './world/GameCanvas';
export default function IntroCutsceneState({player,onComplete,onBack}:{player:StoryPlayerEntity;onComplete:()=>void;onBack:()=>void}){
 const [line,setLine]=useState(0);
 const dialogue=useMemo(()=>createIntroDialogue(player.name).map(l=>({...l,speaker:player.name})),[player.name]);
 const target={x:400,y:640-line*20};
 return <div className="story-intro-state"><GameCanvas player={player} mode="intro" target={target} onBack={onBack}>
  {paused=><>
   <div className="story-chapter-card"><span>PRÓLOGO · CAMINHO COSTEIRO</span><strong>O CAMINHO PARA KYUNETH</strong></div>
   <div hidden={paused}><DialogueController lines={dialogue} paused={paused} onLineChange={setLine} onComplete={onComplete} onBack={onBack}/></div>
  </>}
 </GameCanvas></div>;
}
