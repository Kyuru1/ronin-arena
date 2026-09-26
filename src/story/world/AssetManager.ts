import { INK, polygon as poly, rect as r, surface } from './pixel';
import type { ObjectKind, PixelAsset } from './types';
type C = CanvasRenderingContext2D;
const wood = ['#594838','#886542','#bc925e','#dec08a'];
const leaf = ['#284d40','#386448','#52834f','#79a25d','#adc47b'];

function windowArt(c:C,x:number,y:number,wide=12){
 r(c,x-2,y-2,wide+4,16,wood[0]);r(c,x,y,wide,12,'#263c3b');
 r(c,x+1,y+1,wide-3,5,'#82aba0');r(c,x+2,y+2,3,3,'#c5d6af');
 r(c,x+Math.floor(wide/2),y,1,12,wood[2]);r(c,x,y+6,wide,1,wood[2]);
 r(c,x-3,y+12,wide+6,2,wood[3]);r(c,x-5,y,3,11,wood[1]);r(c,x+wide+2,y,3,11,wood[1]);
}
function house(c:C,kind:ObjectKind,v:number){
 const w=kind==='hall'?100:kind==='forge'?88:74+(v%2)*8;
 const x=-w/2, top=kind==='hall'?-69:-54-(v%2)*6;
 r(c,x-2,-20,w+4,23,INK);r(c,x,-20,w,20,'#756753');
 for(let row=0;row<3;row++)for(let col=0;col<w/9;col++)r(c,x+col*9+(row%2)*3,-18+row*6,7,4,(row+col)%3?'#a18f6d':'#c3b18b');
 r(c,x,top+22,w,-top-31,'#c8af7b');r(c,x+w-13,top+22,13,-top-30,'#ac8859');
 for(let yy=top+28;yy<-11;yy+=5){r(c,x+2,yy,w-16,1,'#ad8e61');r(c,x+4+(yy%3)*2,yy+1,8,1,'#ddc797');}
 for(const xx of [x+2,x+w-17,x+w-3]){r(c,xx,top+21,3,-top-28,wood[0]);r(c,xx,top+22,1,-top-29,wood[2]);}
 r(c,-9,-28,18,29,wood[0]);r(c,-6,-26,12,25,wood[1]);
 for(let i=0;i<3;i++)r(c,-5+i*4,-25,1,22,wood[2]);r(c,3,-13,2,2,'#e4c87b');
 windowArt(c,x+13,-31);if(kind!=='forge')windowArt(c,x+w-31,-31);
 const roofColors=v%3===0?['#3b564b','#58705a','#79916a','#a0ad7d']:v%3===1?['#704a3e','#9c6650','#bd8660','#dab383']:['#4b4e49','#6b7263','#8f9476','#b4b28b'];
 const roofTop=top-17, roofBottom=top+25;
 poly(c,[[x-7,roofBottom],[x+4,roofTop],[x+w-10,roofTop],[x+w+8,roofBottom],[x+w+7,roofBottom+5],[x-7,roofBottom+5]],INK);
 // Every shingle is bounded by the stepped roof silhouette; rows have staggered joints.
 for(let yy=roofTop+2;yy<roofBottom;yy++){
   const t=(yy-roofTop)/(roofBottom-roofTop),l=Math.ceil(x+4-10*t),right=Math.floor(x+w-10+17*t);
   r(c,l,yy,right-l,1,roofColors[1]);
   for(let xx=l;xx<right;xx++){
    const row=Math.floor((yy-roofTop)/6),col=Math.floor((xx-x+row%2*5)/10);
    const edge=(yy-roofTop)%6===5,joint=(xx-x+row%2*5)%10===0;
    if(edge||joint)r(c,xx,yy,1,1,roofColors[0]);
    else if((yy-roofTop)%6===1)r(c,xx,yy,1,1,roofColors[(col+row+v)%4===0?3:2]);
   }
 }
 r(c,x+3,roofTop,w-12,2,roofColors[3]);r(c,x-7,roofBottom,w+15,2,wood[0]);r(c,x-6,roofBottom,w+13,1,roofColors[2]);
 r(c,x,roofBottom+2,w,4,'#594c3b');
 // Porch posts, deep eave shade and individual planks.
 r(c,x-4,-5,w+8,8,wood[0]);
 for(let xx=x-2;xx<x+w+4;xx+=6){r(c,xx,-4,5,6,wood[2]);r(c,xx,-4,5,1,wood[3]);}
 if(v===2||kind==='forge'){
  r(c,x+w-24,roofTop-10,11,23,'#514d42');
  for(let y=roofTop-8;y<roofTop+12;y+=4)r(c,x+w-23,y,8,2,'#a59879');r(c,x+w-27,roofTop-12,16,4,wood[0]);
 }
 if(kind==='house'&&v===1){
  poly(c,[[-9,top+12],[6,top-4],[22,top+12]],wood[0]);poly(c,[[-6,top+11],[6,top-1],[18,top+11]],'#c1a577');
  windowArt(c,1,top+7,10);r(c,-11,top+12,35,2,wood[0]);
 }
 if(kind==='house'&&v===3){
  r(c,x-9,-24,25,4,wood[0]);r(c,x-8,-23,23,2,'#bc9a69');r(c,x-8,-21,2,22,wood[0]);
  r(c,x-7,-20,1,20,wood[2]);r(c,x-7,-9,21,2,wood[1]);
 }
 // Broken grain and weathered plank ends are sparse, never full-surface noise.
 for(const [xx,yy] of [[x+8,-12],[x+w-24,-18],[x+20,top+31]]){r(c,xx,yy,5,1,'#92764e');r(c,xx+2,yy+1,3,1,'#dac08b');}
 if(kind==='hall'){
  r(c,-2,roofTop-19,2,20,wood[2]);poly(c,[[0,roofTop-18],[15,roofTop-15],[12,roofTop-7],[0,roofTop-9]],'#997ca3');
  r(c,-15,-37,30,6,wood[0]);r(c,-13,-36,26,3,'#d8bb7e');
 } else if(kind==='forge') {
  r(c,14,-31,21,17,'#3c3a31');r(c,17,-29,16,2,wood[2]);
  for(let i=0;i<3;i++){r(c,19+i*6,-26,2,10,'#bac2ad');r(c,17+i*6,-20,6,2,'#6f7469');}
 }
}
function canopy(c:C,x:number,y:number,size:number,v:number){
  const shape=[[x-size,y-4],[x-size+2,y-10],[x-size+8,y-10],[x-size+8,y-15],[x-5,y-18],[x+2,y-17],[x+6,y-20],[x+14,y-17],[x+15,y-12],[x+size-2,y-9],[x+size+1,y-3],[x+size-2,y+2],[x+size-5,y+2],[x+size-5,y+7],[x+7,y+10],[x+2,y+8],[x-4,y+12],[x-12,y+9],[x-14,y+5],[x-size,y+4]];
 poly(c,shape,leaf[0]);poly(c,shape.map(([a,b])=>[x+(a-x)*.88,y-3+(b-y)*.83]),leaf[1]);
 for(const [dx,dy,s] of [[-9,-9,7],[1,-15,8],[10,-7,6],[-13,0,5],[0,0,9],[12,2,4]]){
  poly(c,[[x+dx-s,y+dy],[x+dx-3,y+dy-5],[x+dx+4,y+dy-6],[x+dx+s,y+dy],[x+dx+3,y+dy+3],[x+dx-s+2,y+dy+3]],leaf[2]);
  r(c,x+dx-3,y+dy-5,s,2,leaf[3]);r(c,x+dx-1,y+dy-6,3,1,leaf[4]);
 }
 if(v===1)for(const [dx,dy] of [[-12,-2],[7,-10],[12,5]]){r(c,x+dx,y+dy,3,3,'#d7ab57');r(c,x+dx,y+dy,1,1,'#f1d387');}
}
function foliage(c:C,kind:ObjectKind,v:number){
 if(kind==='tree'){
  poly(c,[[-7,2],[-4,-29],[-11,-40],[-6,-41],[0,-32],[6,-44],[9,-41],[4,-25],[8,2]],wood[0]);
  r(c,-2,-30,3,30,wood[2]);r(c,-4,-4,2,6,wood[1]);
    poly(c,[[-3,-18],[-20,-35],[-17,-38],[0,-24],[16,-40],[19,-36],[4,-17]],wood[0]);
  if(v===0){canopy(c,-16,-36,20,v);canopy(c,16,-41,22,v);canopy(c,-4,-53,22,v);}
  else if(v===1){canopy(c,-18,-35,23,v);canopy(c,15,-32,21,v);canopy(c,8,-53,23,v);canopy(c,-18,-52,17,v);}
  else {canopy(c,-14,-44,21,v);canopy(c,18,-37,20,v);canopy(c,4,-60,19,v);}
 } else if(kind==='palm'){
  poly(c,[[-4,2],[0,-19],[7,-43],[12,-57],[16,-56],[12,-39],[7,-17],[3,2]],wood[0]);
  for(let i=0;i<11;i++){r(c,1+i,-i*5,4,3,i%2?wood[2]:wood[1]);r(c,2+i,-i*5,2,1,wood[3]);}
  const ox=12,oy=-53;
  for(const [dx,dy] of [[-35,6],[-29,-15],[-8,-25],[23,-21],[34,-2],[24,18],[-17,20]]){
   poly(c,[[ox,oy-2],[ox+dx*.6,oy+dy-6],[ox+dx,oy+dy],[ox+dx*.85,oy+dy+8],[ox+dx*.4,oy+dy+2]],leaf[0]);
   poly(c,[[ox,oy-2],[ox+dx*.6,oy+dy-4],[ox+dx,oy+dy],[ox+dx*.4,oy+dy]],leaf[2]);
   poly(c,[[ox,oy-2],[ox+dx*.6,oy+dy-4],[ox+dx*.8,oy+dy-2],[ox+dx*.3,oy+dy-1]],leaf[3]);
  }
  r(c,8,-50,4,5,wood[0]);r(c,14,-48,4,4,wood[1]);
 } else if(kind==='bush') canopy(c,0,-7,15,v);
 else for(const [x,y] of [[-8,-2],[-2,-5],[6,1],[11,-3]]){r(c,x,y-5,1,7,leaf[1]);r(c,x-2,y-3,2,1,leaf[3]);r(c,x-2,y-7,5,3,['#c992a5','#e6c76e','#c5c7df'][v%3]);r(c,x,y-7,1,2,'#f2deb0');}
}
function props(c:C,k:ObjectKind,v:number){
 switch(k){
 case 'barrel':
  poly(c,[[-6,0],[-8,-3],[-8,-14],[-5,-18],[5,-18],[8,-14],[8,-3],[5,0]],wood[0]);
  r(c,-6,-14,12,12,wood[1]);for(let x=-5;x<6;x+=3)r(c,x,-14,1,12,wood[2]);
  r(c,-6,-14,12,2,'#777d6b');r(c,-7,-5,14,2,'#414e47');r(c,-5,-17,10,3,wood[2]);r(c,-3,-16,6,1,wood[3]);break;
 case 'crate':
  r(c,-8,-15,16,16,wood[0]);r(c,-7,-14,14,13,wood[2]);for(let y=-12;y<-1;y+=4)r(c,-6,y,12,1,wood[0]);
  poly(c,[[-6,-13],[-4,-13],[7,-2],[4,-2]],wood[3]);r(c,-7,-14,14,1,wood[3]);r(c,6,-13,1,13,wood[1]);break;
 case 'pot':
  poly(c,[[-6,-11],[6,-11],[5,-1],[2,1],[-3,1],[-5,-2]],'#835441');r(c,-5,-10,3,7,'#bd8560');r(c,-7,-13,14,3,'#d3a070');r(c,-5,-13,10,1,wood[0]);
  for(let x=-4;x<5;x+=3){r(c,x,-19,2,7,leaf[2]);r(c,x-1,-20,3,2,['#c69bab','#dbb465','#abbfa8'][v%3]);}break;
 case 'rock':
  poly(c,[[-10,-2],[-8,-9],[-2,-13],[6,-10],[10,-4],[8,1],[-6,2]],'#515f58');poly(c,[[-8,-4],[-5,-10],[0,-12],[6,-9],[4,-3]],'#a0aa8d');poly(c,[[4,-3],[6,-9],[9,-4],[7,0],[-5,0]],'#748374');r(c,-5,-9,5,2,'#c3c5a1');if(v===2){r(c,2,-6,3,2,'#b39560');r(c,-4,-4,2,2,'#d0b177');}break;
 case 'bench':
  r(c,-15,-14,30,7,wood[0]);r(c,-14,-13,28,2,wood[2]);r(c,-14,-10,28,2,wood[3]);r(c,-15,-5,30,5,wood[0]);r(c,-14,-5,28,2,wood[2]);r(c,-12,-3,3,6,wood[0]);r(c,10,-3,3,6,wood[0]);break;
 case 'fence':
  for(const y of [-12,-6]){r(c,-16,y,32,3,wood[0]);r(c,-16,y,32,1,wood[2]);}
  for(const x of [-15,11]){r(c,x,-17,4,19,wood[0]);r(c,x+1,-17,2,18,wood[2]);r(c,x+1,-18,2,1,wood[3]);}break;
 case 'stall':
  for(const x of [-21,20]){r(c,x,-32,3,34,wood[0]);r(c,x,-31,1,31,wood[2]);}
  r(c,-25,-32,50,3,wood[0]);poly(c,[[-22,-39],[20,-39],[27,-24],[-28,-24]],wood[0]);
  for(let x=-24;x<25;x+=7){poly(c,[[x+2,-37],[x+7,-37],[x+9,-25],[x,-25]],x%2? '#d9c99a':v?'#648e80':'#b98369');r(c,x,-25,7,4,x%2?'#c7b584':v?'#416a5b':'#975c4d');}
  r(c,-23,-11,46,11,wood[0]);r(c,-22,-10,44,4,wood[2]);for(let x=-21;x<22;x+=6)r(c,x,-5,4,5,wood[1]);
  for(let i=0;i<6;i++){r(c,-19+i*7,-14,5,3,wood[0]);r(c,-18+i*7,-15,3,3,i%2?'#d0a64f':'#87a156');}break;
 case 'well':
  poly(c,[[-17,-7],[-12,-13],[10,-13],[18,-7],[18,1],[11,7],[-12,7],[-17,1]],wood[0]);
  for(let y=-10;y<6;y+=5)for(let x=-14;x<15;x+=8)r(c,x+(y%2),y,7,4,y===-10?'#c8bd92':'#92977b');
  r(c,-10,-8,21,6,'#364f4a');r(c,-7,-7,14,2,'#69988a');
  for(const x of [-15,13]){r(c,x,-33,3,30,wood[0]);r(c,x,-33,1,29,wood[2]);}
  poly(c,[[-23,-29],[-10,-40],[10,-40],[24,-29]],INK);poly(c,[[-20,-30],[-9,-38],[9,-38],[21,-30]],'#a37753');r(c,-18,-30,36,2,wood[3]);r(c,-1,-30,1,20,'#bca572');r(c,-5,-13,9,6,wood[0]);r(c,-4,-12,7,4,wood[2]);break;
 case 'furnace':
  r(c,-11,-26,22,27,INK);for(let y=-24;y<0;y+=5)for(let x=-10;x<10;x+=7)r(c,x,y,6,4,'#8b8066');
  r(c,-6,-15,12,14,'#392e2d');r(c,-4,-9,8,7,'#c36338');r(c,-2,-7,4,5,'#efb45d');r(c,-1,-4,2,2,'#f3d791');r(c,-8,-28,16,3,'#c2b391');break;
 case 'anvil':
  r(c,-5,-6,10,7,wood[0]);r(c,-7,-2,14,3,'#586561');poly(c,[[-13,-15],[10,-15],[14,-12],[7,-10],[3,-10],[2,-6],[-4,-6],[-5,-10],[-11,-11]],'#394b4a');r(c,-12,-15,21,2,'#a0b4a8');r(c,-6,-12,13,2,'#6a8780');break;
 case 'tools':
  r(c,-13,-22,26,3,wood[0]);for(let i=0;i<4;i++){r(c,-10+i*7,-21,2,18,wood[2]);r(c,-12+i*7,-22,6,4,'#95a399');}break;
 case 'sign':
  r(c,-2,-25,3,27,wood[0]);r(c,-16,-25,32,14,wood[0]);r(c,-15,-24,30,11,wood[2]);r(c,-12,-22,23,1,wood[3]);
  if(v===1){r(c,-1,-22,2,8,'#79454b');r(c,-4,-19,8,2,'#79454b');}else{r(c,-8,-20,14,2,wood[0]);r(c,3,-22,3,6,wood[0]);}break;
 case 'cart':
  for(const x of [-14,12]){r(c,x,-6,4,10,wood[0]);r(c,x+1,-5,1,7,wood[2]);}
  r(c,-14,-18,29,17,wood[0]);r(c,-12,-16,25,12,wood[1]);for(let y=-15;y<-3;y+=4)r(c,-12,y,25,1,wood[3]);r(c,15,-9,12,2,wood[0]);r(c,-8,-22,9,6,'#85906a');r(c,3,-21,8,6,'#c6a16b');break;
 case 'laundry':
  for(const x of [-25,24]){r(c,x,-27,2,29,wood[0]);r(c,x,-27,1,26,wood[2]);}
  for(let x=-24;x<24;x++)r(c,x,-25+Math.round(3*(1-(x/24)**2)),1,1,wood[0]);
  for(let i=0;i<3;i++){const x=-19+i*13;r(c,x,-23,10,16,i%2?'#aa8eaa':'#e1cfa5');r(c,x+7,-22,2,14,i%2?'#7f718a':'#b7aa87');r(c,x,-24,2,3,wood[0]);}break;
 case 'boat':
  poly(c,[[-26,-7],[-19,-14],[17,-12],[28,-4],[18,4],[-17,4]],wood[0]);poly(c,[[-22,-6],[-17,-11],[16,-9],[23,-4],[16,1],[-16,1]],wood[2]);poly(c,[[-18,-6],[-15,-8],[15,-7],[18,-4],[14,-1],[-14,-1]],wood[0]);for(const x of [-10,2,12])r(c,x,-9,3,11,wood[3]);r(c,-8,-20,2,25,wood[1]);break;
 case 'net':
  for(let y=-13;y<3;y+=3)for(let x=-16;x<17;x+=3)r(c,x+(y%2),y,2,1,'#938970');r(c,-18,-15,2,18,wood[0]);r(c,17,-15,2,18,wood[0]);break;
 case 'steps':for(let y=-4;y<5;y+=3){r(c,-17,y,34,3,'#706b55');r(c,-16,y,32,1,'#c0b78e');}break;
 default:break;
 }
}
/** Sprite atlas cached at native resolution, generated entirely from local authored art. */
export class AssetManager {
 private cache = new Map<string,PixelAsset>();
 get(kind:ObjectKind,variant=0):PixelAsset{
  const key=kind+variant,existing=this.cache.get(key);if(existing)return existing;
  const {image,ctx}=surface(160,144);const anchor={x:72,y:120};ctx.translate(anchor.x,anchor.y);
  if(['house','hall','forge'].includes(kind))house(ctx,kind,variant);
  else if(['tree','palm','bush','flowers'].includes(kind))foliage(ctx,kind,variant);
  else props(ctx,kind,variant);
  // Project the actual alpha silhouette southeast; no shared oval shadow.
  const shadow=surface(160,144),pixels=ctx.getImageData(0,0,160,144).data;
  shadow.ctx.fillStyle='#263d35';
  for(let y=0;y<120;y++)for(let x=0;x<160;x++)if(pixels[(y*160+x)*4+3]){
   const height=120-y;shadow.ctx.fillRect(Math.round(x+height*.38),Math.round(120+height*.2),1,1);
  }
  const asset={image,shadow:shadow.image,anchor,width:160,height:144};this.cache.set(key,asset);return asset;
 }
}


