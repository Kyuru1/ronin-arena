import React from 'react';
import { createRoot } from 'react-dom/client';
import KyunethExteriorScene from '/src/story/KyunethExteriorScene';
import DialogueController from '/src/story/DialogueController';
import IntroCutsceneState from '/src/story/IntroCutsceneState';
import { createStoryPlayer } from '/src/story/storyPlayer';
import { loadKyunethArt } from '/src/story/world/referenceArt';
import '/src/index.css';
import '/src/story/story.css';
import '/src/story/visual-pass.css';
await loadKyunethArt();
const player = createStoryPlayer('Akira');
player.x=421; player.y=314;
window.testPlayer=player;
window.completions=0;
const mode=new URLSearchParams(location.search).get('mode');
const done=()=>{window.completions++;};
createRoot(document.getElementById('root')!).render(<section className="story-mode">
{mode==='intro'?<IntroCutsceneState player={player} onComplete={done} onBack={()=>{}}/>:mode==='cast'?<DialogueController dialogue={{id:'cast',participants:[{id:'player',name:'Akira',portrait:'player'},{id:'ketlin',name:'Ketlin',portrait:'ketlin'},{id:'jeff',name:'Jeff',portrait:'jeff'}],lines:[{speaker:'jeff',text:'Olá.'},{speaker:'ketlin',text:'Bem-vindo.'},{speaker:'player',text:'Obrigado.'}]}} onComplete={done}/>:mode==='empty'?<DialogueController dialogue={{id:'empty',participants:[],lines:[]}} onComplete={done}/>:<KyunethExteriorScene player={player} isTouch={false} inputMode="keyboard" movementKeys={{up:'w',down:'s',left:'a',right:'d'}} onBack={()=>{}}/>}
</section>);
