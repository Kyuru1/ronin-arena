import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import type { InputMode, KeyboardBindings } from '../../game/engine';
import { moveStoryPlayer, type StoryPlayerEntity } from '../storyPlayer';
import { viewport } from './Camera';
import { canOccupy, KYUNETH, landmarkAt } from './maps';
import { WorldRenderer } from './WorldRenderer';
import type { Position } from './types';
interface Props {
 player:StoryPlayerEntity;
 mode:'intro'|'explore';
 target?:Position;
 inputMode?:InputMode;
 movementKeys?:Pick<KeyboardBindings,'up'|'down'|'left'|'right'>;
 isTouch?:boolean;
 onBack:()=>void;
 onLandmark?:(label:string)=>void;
 children?:(paused:boolean)=>ReactNode;
}
/** React owns UI/lifecycle; all world composition belongs to WorldRenderer. */
export default function GameCanvas(props:Props){
 const canvasRef=useRef<HTMLCanvasElement>(null),latest=useRef(props),keys=useRef(new Set<string>()),touches=useRef(new Set<string>());
 latest.current=props;
 const [paused,setPaused]=useState(false),[fullscreenError,setFullscreenError]=useState('');
 const pausedRef=useRef(false),pauseButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{pausedRef.current=paused;keys.current.clear();touches.current.clear();if(paused)pauseButton.current?.focus();},[paused]);
 useEffect(()=>{
  const canvas=canvasRef.current!,ctx=canvas.getContext('2d')!;
  const renderer=new WorldRenderer(KYUNETH);
  let frame=0,last=performance.now(),elapsed=0,lastLabel='';
  const clear=()=>{keys.current.clear();touches.current.clear();};
  const down=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();clear();if(!e.repeat)setPaused(p=>!p);return;}
   const bindings=latest.current.movementKeys;
   if(['arrowup','arrowdown','arrowleft','arrowright',...Object.values(bindings??{}).map(key=>key.toLowerCase())].includes(e.key.toLowerCase())){e.preventDefault();keys.current.add(e.key.toLowerCase());}
  };
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());
  const blur=()=>{clear();setPaused(true);};
  const render=(now:number)=>{
   const dt=Math.min(.04,Math.max(0,(now-last)/1000));last=now;
   const p=latest.current,box=canvas.getBoundingClientRect(),view=viewport(box.width,box.height,devicePixelRatio||1);
   if(canvas.width!==view.physicalW||canvas.height!==view.physicalH){canvas.width=view.physicalW;canvas.height=view.physicalH;}
   ctx.imageSmoothingEnabled=false;
   if(!pausedRef.current){
    elapsed+=dt;renderer.update(dt);
    if(p.mode==='intro'&&p.target){
     const dx=p.target.x-p.player.x,dy=p.target.y-p.player.y,length=Math.hypot(dx,dy);
     moveStoryPlayer(p.player,length>1?dx/length*.33:0,length>1?dy/length*.33:0,dt,(x,y)=>canOccupy(KYUNETH,x,y));
    }else if(elapsed>2.2){
     const binding=p.movementKeys??{up:'w',down:'s',left:'a',right:'d'};
     const held=(action:keyof typeof binding)=>keys.current.has(binding[action].toLowerCase())||keys.current.has('arrow'+action)||touches.current.has(action);
     let dx=Number(held('right'))-Number(held('left')),dy=Number(held('down'))-Number(held('up'));
     const pad=p.inputMode==='gamepad'?Array.from(navigator.getGamepads?.()??[]).find(Boolean):null;
     if(pad){dx+=Math.abs(pad.axes[0]??0)>.18?pad.axes[0]:0;dy+=Math.abs(pad.axes[1]??0)>.18?pad.axes[1]:0;dx+=Number(pad.buttons[15]?.pressed??false)-Number(pad.buttons[14]?.pressed??false);dy+=Number(pad.buttons[13]?.pressed??false)-Number(pad.buttons[12]?.pressed??false);}
     moveStoryPlayer(p.player,dx,dy,dt,(x,y)=>canOccupy(KYUNETH,x,y));
    }
   }else p.player.walking=false;
   ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#10171a';ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.setTransform(view.scale,0,0,view.scale,view.left,view.top);
   renderer.draw(ctx,p.player,view.w,view.h,pausedRef.current?0:dt,p.mode==='intro');
   const label=landmarkAt(p.player.x,p.player.y);if(label!==lastLabel){lastLabel=label;p.onLandmark?.(label);}
   frame=requestAnimationFrame(render);
  };
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
  frame=requestAnimationFrame(render);
  return()=>{cancelAnimationFrame(frame);clear();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);};
 },[props.player,props.mode]);
 const touch=(direction:string,down:boolean)=>(e:PointerEvent<HTMLButtonElement>)=>{e.preventDefault();if(down){touches.current.add(direction);e.currentTarget.setPointerCapture(e.pointerId);}else touches.current.delete(direction);};
 const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await canvasRef.current?.closest('.story-mode')?.requestFullscreen();setFullscreenError('');}catch{setFullscreenError('TELA CHEIA INDISPONÍVEL NESTA JANELA.');}};
 return <>
  <canvas ref={canvasRef} className="world-canvas" aria-label="Mundo pixel art de Kyuneth" />
  {props.children?.(paused)}
  <button className="kyuneth-menu-button world-pause-button" type="button" onClick={()=>setPaused(true)}>ESC · PAUSA</button>
  {props.isTouch&&props.mode==='explore'&&!paused&&<div className="kyuneth-dpad" aria-label="Controles de movimento">{(['up','left','down','right'] as const).map((dir,i)=><button key={dir} aria-label={['Mover para cima','Mover para esquerda','Mover para baixo','Mover para direita'][i]} onPointerDown={touch(dir,true)} onPointerUp={touch(dir,false)} onPointerCancel={touch(dir,false)} onLostPointerCapture={touch(dir,false)}>{['▲','◀','▼','▶'][i]}</button>)}</div>}
  {paused&&<div className="world-pause" role="dialog" aria-modal="true" aria-label="Jogo pausado"><div className="world-pause-card">
   <span>KYU ARENA · HISTÓRIA</span><h2>PAUSA</h2>
   <button ref={pauseButton} onClick={()=>setPaused(false)}>CONTINUAR</button>
   <button onClick={fullscreen}>ALTERNAR TELA CHEIA</button>
   <button onClick={props.onBack}>VOLTAR AO MENU</button>
   {fullscreenError&&<p role="status">{fullscreenError}</p>}
  </div></div>}
 </>;
}

