import { useMemo, useState } from 'react';
import DialogueController from './DialogueController';
import { createIntroDialogue } from './storyContent';
import type { StoryPlayerEntity } from './storyPlayer';
import GameCanvas from './world/GameCanvas';
export default function IntroCutsceneState({player,onComplete,onBack}:{player:StoryPlayerEntity;onComplete:()=>void;onBack:()=>void}){
 const [line,setLine]=useState(0);
 const dialogue=useMemo(()=>({id:'arrival-monologue',participants:[{id:'player',name:player.name,portrait:'player'}],lines:createIntroDialogue(player.name).map(l=>({...l,speaker:'player'}))}),[player.name]);
 const target={x:400,y:520-line*12};
 return <div className="story-intro-state"><GameCanvas player={player} mode="intro" target={target} onBack={onBack}>
  {paused=><>
   <div hidden={paused}><DialogueController dialogue={dialogue} paused={paused} onLineChange={setLine} onComplete={onComplete}/></div>
  </>}
 </GameCanvas></div>;
}
