import { Camera } from './Camera';
import { AssetManager } from './AssetManager';
import { TileLayer } from './TileLayer';
import { drawStoryCharacter, drawStoryContact } from '../storyCharacters';
import type { StoryPlayerEntity } from '../storyPlayer';
import type { Npc, Position, WorldScene } from './types';
import { rect as r } from './pixel';
import { canOccupy, shore } from './maps';
interface Actor extends Npc { walking:boolean; clock:number; waypoint:number }
export class WorldRenderer {
 readonly camera=new Camera();
 readonly assets=new AssetManager();
 readonly terrain:TileLayer;
 readonly actors:Actor[];
 time=0;
 constructor(readonly scene:WorldScene){
  this.terrain=new TileLayer(scene);
  this.actors=scene.npcs.map(n=>({...n,walking:false,clock:0,waypoint:1}));
  scene.objects.forEach(o=>this.assets.get(o.kind,o.variant));
 }
 update(dt:number){
  this.time+=dt;
  for(const n of this.actors){n.walking=false;if(!n.route)continue;const p=n.route[n.waypoint%n.route.length],dx=p.x-n.x,dy=p.y-n.y,length=Math.hypot(dx,dy);
   if(length<1){n.waypoint++;continue;}const step=Math.min(length,(n.speed??10)*dt),x=n.x+dx/length*step,y=n.y+dy/length*step;
   if(canOccupy(this.scene,x,y,3)){n.x=x;n.y=y;n.walking=true;n.clock+=dt;}else n.waypoint++;
   n.direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
  }
 }
 draw(c:CanvasRenderingContext2D,player:StoryPlayerEntity,w:number,h:number,dt:number,dialogue=false){
  const cam=this.camera.follow(player,w,h,this.scene,dt,dialogue?-Math.min(65,h*.22):25);
  c.save();c.beginPath();c.rect(0,0,w,h);c.clip();c.translate(-cam.x,-cam.y);
  this.terrain.draw(c,cam.x,cam.y,w,h);
  this.water(c,cam,w,h);
  const visible=this.scene.objects.filter(o=>o.x>cam.x-100&&o.x<cam.x+w+100&&o.y>cam.y-30&&o.y<cam.y+h+120);
  // Ground shadow layer always precedes the shared depth-sorted object/entity layer.
  c.globalAlpha=.24;
  for(const o of visible){const a=this.assets.get(o.kind,o.variant);c.drawImage(a.shadow,o.x-a.anchor.x,o.y-a.anchor.y);}
  c.globalAlpha=1;
  for(const n of [...this.actors,player])drawStoryContact(c,n.x,n.y,10);
  const queue:{y:number;draw:()=>void}[]=visible.map(o=>({y:o.y,draw:()=>{
   const a=this.assets.get(o.kind,o.variant);c.drawImage(a.image,o.x-a.anchor.x,o.y-a.anchor.y);
  }}));
  for(const n of this.actors)queue.push({y:n.y,draw:()=>drawStoryCharacter(c,n.x,n.y,n.walking?n.clock:this.time,n.shirt,n.id,n.walking,n.direction==='left'?-1:1,1,n.direction)});
  queue.push({y:player.y,draw:()=>drawStoryCharacter(c,player.x,player.y,player.walking?player.walkTime:this.time,player.shirt,'player',player.walking,player.direction==='left'?-1:1,1,player.direction)});
  queue.sort((a,b)=>a.y-b.y).forEach(item=>item.draw());
  this.particles(c,visible.filter(o=>o.kind==='furnace'));
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
   r(c,x,y,2,3,'#bad0ad');if((y+phase)%3===0)r(c,x-2,y+1,1,1,'#e0ddbb');
  }
 }
 private particles(c:CanvasRenderingContext2D,fires:Position[]){
  for(const f of fires){
   r(c,f.x-2,f.y-8+Math.floor(this.time*6)%3,3,4,'#f4cd70');
   for(let i=0;i<7;i++){const age=(this.time*.25+i/7)%1,x=Math.round(f.x+age*17+Math.sin(age*8+i)*2),y=Math.round(f.y-29-age*37),size=2+Math.floor(age*5);
    c.globalAlpha=(1-age)*.4;r(c,x,y,size,size,'#ddd2b1');r(c,x+1,y-1,size-2,1,'#eee1bf');}
  }c.globalAlpha=1;
  for(let i=0;i<12;i++){const x=Math.round(205+(i*79)%500+Math.sin(this.time*.4+i)*5),y=Math.round(190+(i*101+this.time*5)%440);r(c,x,y,2,1,i%3?'#c5bd76':'#e7d49a');}
 }
}

