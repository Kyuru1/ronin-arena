import { Camera } from './Camera';
import { AssetManager } from './AssetManager';
import { TileLayer } from './TileLayer';
import { CharacterRenderer, drawCharacterContact } from '../characters/renderer';
import type { StoryPlayerEntity } from '../storyPlayer';
import type { Npc, Position, WorldScene } from './types';
import { polygon as poly, rect as r } from './pixel';
import { canOccupy, shore } from './maps';
interface Actor extends Npc { walking:boolean; waypoint:number }
export class WorldRenderer {
 readonly camera=new Camera();
 readonly assets=new AssetManager();
 readonly characters=new CharacterRenderer();
 readonly terrain:TileLayer;
 readonly actors:Actor[];
 time=0;
 constructor(readonly scene:WorldScene){
  this.terrain=new TileLayer(scene);
  this.actors=scene.npcs.map(n=>({...n,walking:false,waypoint:1}));
  scene.objects.filter(o=>o.kind!=='dog'&&o.kind!=='chicken').forEach(o=>this.assets.get(o.kind,o.variant));
 }
 update(dt:number){
  this.time+=dt;
  for(const n of this.actors){n.walking=false;if(!n.route)continue;const p=n.route[n.waypoint%n.route.length],dx=p.x-n.x,dy=p.y-n.y,length=Math.hypot(dx,dy);
   if(length<1){n.waypoint++;continue;}const step=Math.min(length,(n.speed??10)*dt),x=n.x+dx/length*step,y=n.y+dy/length*step;
   if(canOccupy(this.scene,x,y,3)){n.x=x;n.y=y;n.walking=true;}else n.waypoint++;
   n.direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
  }
 }
 draw(c:CanvasRenderingContext2D,player:StoryPlayerEntity,w:number,h:number,dt:number,dialogue=false){
  const cam=this.camera.follow(player,w,h,this.scene,dt,dialogue?Math.min(40,h*.1):25);
  c.save();c.beginPath();c.rect(0,0,w,h);c.clip();c.translate(-cam.x,-cam.y);
  this.terrain.draw(c,cam.x,cam.y,w,h);
  this.water(c,cam,w,h);
  const within=(o:WorldScene['objects'][number])=>o.x>cam.x-100&&o.x<cam.x+w+100&&o.y>cam.y-30&&o.y<cam.y+h+120;
  const visible=this.scene.objects.filter(o=>o.kind!=='dog'&&o.kind!=='chicken'&&within(o));
  const animals=this.scene.objects.filter(o=>(o.kind==='dog'||o.kind==='chicken')&&within(o));
  // Ground shadow layer always precedes the shared depth-sorted object/entity layer.
  c.globalAlpha=.25;
  for(const o of visible){const a=this.assets.get(o.kind,o.variant);c.drawImage(a.shadow,o.x-a.anchor.x,o.y-a.anchor.y);}
  c.globalAlpha=1;
  // Contact is specific to each base: foundations, trunks, or small props.
  for(const o of visible){
   const base=o.collider;if(!base)continue;
   if(o.kind==='bench'){
    c.globalAlpha=.3;
    r(c,o.x-12,o.y+1,4,2,'#293e35');r(c,o.x+10,o.y+1,4,2,'#293e35');
    continue;
   }
   const half=Math.max(3,base.w*.46),depth=Math.min(6,base.h*.28);
   c.globalAlpha=.22;
   poly(c,[[o.x-half,o.y],[o.x-half+3,o.y-2],[o.x+half-2,o.y-1],[o.x+half+3,o.y+depth-1],[o.x+half-1,o.y+depth+1],[o.x-half+1,o.y+depth]],'#263d35');
   c.globalAlpha=.22;r(c,o.x-half+2,o.y,half*2-3,2,'#293e35');
  }c.globalAlpha=1;
  for(const n of [...this.actors,player])drawCharacterContact(c,n.x,n.y,15);
  for(const animal of animals)drawCharacterContact(c,animal.x,animal.y,animal.kind==='dog'?11:7);
  const queue:{y:number;draw:()=>void}[]=visible.map(o=>({y:o.y,draw:()=>{
   const a=this.assets.get(o.kind,o.variant),x=o.x-a.anchor.x,y=o.y-a.anchor.y;
   if(o.kind==='tree'||o.kind==='palm'){
    // Only the crown shifts by one native pixel. Trunks and depth anchors stay put.
    const split=a.anchor.y-32,sway=Math.sin(this.time*.8+o.x*.07)>.8?.5:0,d=a.pixelRatio??1;
    c.drawImage(a.image,0,0,a.width*d,split*d,x+sway,y,a.width,split);
    c.drawImage(a.image,0,split*d,a.width*d,(a.height-split)*d,x,y+split,a.width,a.height-split);
   }else if(o.kind==='laundry'){
    const d=a.pixelRatio??1,shift=Math.sin(this.time*1.8+o.x)>.4?.5:0;
    c.drawImage(a.image,0,0,a.width*d,98*d,x,y,a.width,98);
    c.drawImage(a.image,0,98*d,a.width*d,20*d,x+shift,y+98,a.width,20);
    c.drawImage(a.image,0,118*d,a.width*d,26*d,x,y+118,a.width,26);
   }else c.drawImage(a.image,x,y,a.width,a.height);
  }}));
  for(const n of this.actors)queue.push({y:n.y,draw:()=>this.characters.drawHuman(c,n.id,n.id,n.x,n.y,n.direction,n.walking,this.time)});
  for(const animal of animals)queue.push({y:animal.y,draw:()=>this.characters.drawAnimal(c,animal.id,animal.kind as 'dog'|'chicken',animal.x,animal.y,animal.kind==='dog'?'right':animal.variant%2?'left':'down',false,this.time)});
  queue.push({y:player.y,draw:()=>this.characters.drawHuman(c,'player','player',player.x,player.y,player.direction,player.walking,this.time)});
  queue.sort((a,b)=>a.y-b.y).forEach(item=>item.draw());
  this.particles(c,visible.filter(o=>o.kind==='furnace'));
  this.forgeHeat(c,visible.filter(o=>o.kind==='forge'));
  // Leaves drift from a few actual crowns; the breeze uses the same world in
  // the prologue and exploration, with no separate cutscene backdrop.
  for(const o of visible.filter(o=>o.kind==='tree'&&o.variant===1)){
   const age=(this.time*.12+o.x*.003)%1;
   c.globalAlpha=Math.min(1,(1-age)*3);
   r(c,o.x+Math.floor(age*23+Math.sin(age*12)*3),o.y-43+Math.floor(age*50),3,1,'#c0ba72');
  }c.globalAlpha=1;
  c.restore();
 }
 private water(c:CanvasRenderingContext2D,cam:Position,w:number,h:number){
  const phase=Math.floor(this.time*3);
  for(let y=Math.max(0,Math.floor(cam.y/16));y<Math.min(this.scene.tiles.length,Math.ceil((cam.y+h)/16));y++)for(let x=Math.max(0,Math.floor(cam.x/16));x<Math.min(this.scene.tiles[y].length,Math.ceil((cam.x+w)/16));x++){
   if(this.scene.tiles[y][x].material!=='water')continue;
   if((x*7+y*3)%5===0){r(c,x*16+((phase+x)%5),y*16+6,6,1,'#69aaa2');r(c,x*16+2,y*16+8,3,1,'#4c9595');}

  }
  for(let y=Math.max(0,cam.y);y<Math.min(this.scene.height,cam.y+h);y+=4){
   const x=shore(y)-1-Math.floor((Math.sin(this.time*1.4+y*.04)+1)*2);
   if(this.scene.tiles[Math.floor(y/16)][Math.floor(x/16)].material==='wood')continue;
   r(c,x,y,2,3,'#fff8db');r(c,x-2,y+1,2,1,'#d7f4df');
   const foam=x-5-Math.floor(Math.sin(y*.22+this.time)*3);
   r(c,foam,y,2,2,'#ddf8ec');r(c,foam-2,y+2,2,1,'#b0ebe5');
   if((y+phase)%3===0){r(c,x-3,y+1,2,1,'#edf0d4');r(c,x+1,y+2,2,1,'#edf0d4');}
   // A broken second ripple moves offshore while the coastline remains unchanged.
   const ripple=x-9-Math.floor((Math.sin(this.time*.8+y*.026)+1)*3);
   if((Math.floor(y/4)+phase)%5<3){r(c,ripple,y,3,1,'#8dcac3');r(c,ripple+1,y+1,2,2,'#6bb8b7');}
  }
 }
 private forgeHeat(c:CanvasRenderingContext2D,forges:Position[]){
  for(const f of forges){
   // Tiny pixel sparks stay confined to the forge mouth, never wash the village orange.
   const flicker=Math.floor(this.time*7)%3;
   r(c,f.x+24,f.y-12-flicker,1,3,'#fff2a4');r(c,f.x+29,f.y-9+flicker,1,2,'#ffb73c');
   for(let i=0;i<4;i++){
    const age=(this.time*.19+i/4)%1,x=f.x+27+Math.floor(age*15),y=f.y-68-Math.floor(age*29);
    c.globalAlpha=(1-age)*.3;r(c,x,y,3+Math.floor(age*4),3,'#d4d4ba');
   }
   c.globalAlpha=1;
  }
 }
 private particles(c:CanvasRenderingContext2D,fires:Position[]){
  for(const f of fires){
   r(c,f.x-2,f.y-8+Math.floor(this.time*6)%3,3,4,'#f4cd70');
   for(let i=0;i<7;i++){const age=(this.time*.25+i/7)%1,x=Math.round(f.x+age*17+Math.sin(age*8+i)*2),y=Math.round(f.y-29-age*37),size=2+Math.floor(age*5);
    c.globalAlpha=(1-age)*.4;r(c,x,y,size,size,'#ddd2b1');r(c,x+1,y-1,size-2,1,'#eee1bf');}
  }c.globalAlpha=1;
  // Ambient motion remains tied to foliage, water and the forge, not unrelated flecks.
 }
}
