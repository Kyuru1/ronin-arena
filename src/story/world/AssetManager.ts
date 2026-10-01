import { INK, polygon as poly, rect as r, surface } from './pixel';
import { environmentStamp } from './referenceArt';
import type { ObjectKind, PixelAsset } from './types';
import { pigments, drawHouse, drawTree, drawBush, drawBench, drawBarrel, drawTreeShadow } from './artKit';
type C = CanvasRenderingContext2D;
const wood = pigments.wood, leaf = pigments.leaf;
function foliage(c:C,kind:ObjectKind,v:number) {
 if(kind==='tree')drawTree(c,v);
 else if(kind==='bush')drawBush(c);
 else if(kind==='palm'){
  poly(c,[[-4,2],[0,-16],[5,-34],[10,-54],[15,-55],[13,-35],[8,-16],[4,2]],wood[0]);
  poly(c,[[-1,0],[3,-18],[8,-37],[11,-51],[13,-51],[11,-34],[6,-16],[2,0]],wood[2]);
  for(const [x,y] of [[1,-5],[3,-14],[5,-23],[8,-33],[10,-42]]){r(c,x,y,4,2,wood[1]);r(c,x,y-1,3,1,wood[3]);}
  // Seven individually shaped fronds meet at the crown, with no radial formula.
  const fronds=[
   [[12,-54],[7,-64],[4,-73],[6,-83],[10,-76],[12,-64],[15,-55]],
   [[12,-54],[1,-61],[-12,-64],[-23,-62],[-28,-57],[-18,-59],[-8,-56],[2,-54],[10,-51]],
   [[12,-54],[-1,-54],[-16,-50],[-24,-43],[-27,-35],[-17,-42],[-5,-46],[5,-48],[14,-51]],
   [[12,-54],[20,-65],[32,-73],[42,-73],[49,-68],[37,-69],[29,-63],[21,-55],[14,-50]],
   [[13,-54],[26,-59],[39,-57],[48,-51],[50,-45],[40,-50],[29,-51],[19,-49],[12,-50]],
   [[13,-52],[26,-49],[35,-42],[38,-32],[35,-25],[31,-36],[24,-41],[15,-46],[10,-50]],
   [[12,-51],[6,-45],[0,-39],[-4,-30],[-3,-23],[1,-32],[9,-39],[15,-46]],
  ];
  for(const shape of fronds)poly(c,shape,leaf[0]);
  for(const shape of [
   [[12,-56],[8,-65],[6,-77],[9,-72],[11,-63]],
   [[9,-55],[-5,-60],[-19,-61],[-12,-62],[1,-59]],
   [[8,-52],[-6,-49],[-20,-42],[-14,-48],[-2,-52]],
   [[15,-55],[26,-66],[37,-71],[43,-70],[32,-67],[23,-59]],
   [[17,-54],[29,-56],[41,-53],[46,-49],[35,-53],[25,-53]],
   [[17,-50],[27,-46],[34,-39],[35,-34],[29,-41],[21,-46]],
   [[11,-47],[3,-39],[-1,-31],[0,-38],[6,-45]],
  ])poly(c,shape,leaf[2]);
  r(c,8,-52,4,5,wood[0]);r(c,13,-50,4,4,wood[1]);r(c,9,-51,2,2,wood[2]);

 } else for(const [x,y] of [[-8,-2],[-2,-5],[6,1],[11,-3]]){r(c,x,y-5,1,7,leaf[1]);r(c,x-2,y-3,2,1,leaf[3]);r(c,x-2,y-7,5,3,['#c992a5','#e6c76e','#c5c7df'][v%3]);r(c,x,y-7,1,2,'#f2deb0');}
}
function props(c:C,k:ObjectKind,v:number){
 switch(k){
 case 'barrel':drawBarrel(c);break;
 case 'crate':
  poly(c,[[-8,-13],[-5,-17],[7,-16],[9,-13],[8,1],[-7,1]],wood[0]);
  r(c,-7,-12,12,12,wood[2]);poly(c,[[5,-12],[8,-14],[7,-1],[5,0]],wood[1]);
  poly(c,[[-7,-13],[-4,-16],[6,-15],[4,-12]],wood[3]);
  for(let y=-10;y<-1;y+=4){r(c,-6,y,10,1,wood[0]);r(c,-5,y+1,5,1,wood[3]);}
  poly(c,[[-6,-12],[-4,-12],[5,-2],[3,-2]],wood[3]);
  r(c,-5,-12,1,1,'#696e5d');r(c,3,-2,1,1,wood[0]);r(c,0,-7,3,1,wood[1]);break;
 case 'pot':
  poly(c,[[-5,-11],[5,-11],[7,-7],[6,-2],[3,1],[-3,1],[-6,-3],[-7,-7]],'#835441');poly(c,[[-4,-10],[2,-10],[4,-6],[2,-2],[-3,-2],[-5,-6]],'#bd8560');r(c,-4,-8,2,4,'#d3a070');r(c,-6,-13,12,3,'#d3a070');r(c,-4,-13,8,1,wood[0]);
  for(let x=-4;x<5;x+=3){r(c,x,-19,2,7,leaf[2]);r(c,x-1,-20,3,2,['#c69bab','#dbb465','#abbfa8'][v%3]);}break;
 case 'rock':
  {const shapes=[
   [[-10,-3],[-9,-7],[-6,-7],[-5,-11],[0,-12],[6,-10],[8,-7],[10,-3],[8,1],[3,2],[-6,1]],
   [[-10,-2],[-8,-7],[-3,-9],[1,-14],[5,-13],[7,-8],[9,-6],[8,0],[2,2],[-7,1]],
   [[-11,-2],[-9,-8],[-6,-10],[0,-10],[3,-8],[7,-7],[11,-2],[9,1],[-6,2]],
  ];poly(c,shapes[v%3],'#4c6058');
  poly(c,[[-8,-4],[-6,-8],[-2,-10],[3,-9],[6,-6],[4,-3],[-1,-2]],'#a9b298');
  poly(c,[[4,-3],[6,-6],[9,-3],[7,0],[-5,0],[-7,-2]],'#74877a');
  r(c,-5,-8,4,1,'#d1cfaa');r(c,-6,-7,2,1,'#c0c3a0');
  poly(c,[[0,-9],[1,-5],[4,-4],[1,-4],[-1,-7]],'#7c9080');
  r(c,-8,-1,4,2,'#57744c');r(c,-6,-2,3,1,'#84995e');
  if(v===2){r(c,3,-5,2,1,'#bca578');r(c,-3,-4,2,1,'#d0b177');}break;}
 case 'bench':drawBench(c);break;
 case 'fence':
  for(const y of [-12,-6]){poly(c,[[-16,y],[0,y+1],[16,y-1],[16,y+2],[0,y+4],[-16,y+3]],wood[0]);poly(c,[[-15,y],[0,y+1],[15,y],[15,y+1],[0,y+2],[-15,y+1]],wood[2]);}
  for(const [x,top] of [[-15,-18],[11,-16]]){poly(c,[[x,1],[x,top+2],[x+2,top],[x+4,top+1],[x+4,2]],wood[0]);r(c,x+1,top+2,2,-top-1,wood[2]);r(c,x+1,top+2,1,6,wood[3]);r(c,x+1,-10,1,1,'#45564d');}break;
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
  for(let i=0;i<3;i++){const x=-19+i*13;poly(c,[[x,-23],[x+9,-23],[x+10,-14],[x+8,-7],[x+3,-8],[x,-7]],i%2?'#aa8eaa':'#e1cfa5');r(c,x+7,-22,2,13,i%2?'#7f718a':'#b7aa87');r(c,x+2,-22,1,11,i%2?'#c4adbd':'#f1dfb8');r(c,x,-24,2,3,wood[0]);}break;
 case 'boat':
  poly(c,[[-26,-6],[-23,-10],[-17,-13],[-8,-14],[12,-12],[20,-9],[27,-4],[24,0],[16,4],[-12,5],[-20,2]],wood[0]);poly(c,[[-22,-6],[-17,-10],[-6,-11],[14,-9],[23,-4],[16,1],[-14,2],[-20,-1]],wood[2]);poly(c,[[-18,-6],[-13,-8],[13,-6],[18,-3],[12,0],[-12,0]],wood[0]);for(const x of [-10,2,12])r(c,x,-9,3,11,wood[3]);r(c,-8,-20,2,25,wood[1]);r(c,-16,2,24,1,wood[1]);r(c,-19,-7,3,1,wood[3]);break;
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
  const stamp=environmentStamp(kind,variant);
  if(stamp){
   const {image,ctx}=surface(320,288),anchor={x:72,y:120};ctx.scale(2,2);
   const foot=['house','hall','forge'].includes(kind)?7:kind==='well'?5:2;
   ctx.drawImage(stamp.image,anchor.x-stamp.width/2,anchor.y-stamp.height+foot,stamp.width,stamp.height);
   const shadow=surface(160,144),pixels=ctx.getImageData(0,0,320,288).data;
   shadow.ctx.fillStyle=pigments.shadow;
   if(kind==='tree'){shadow.ctx.translate(anchor.x,anchor.y);drawTreeShadow(shadow.ctx,variant);}
   else for(let y=0;y<120;y++)for(let x=0;x<160;x++)if(pixels[((y*2)*320+x*2)*4+3]){
    const height=120-y;shadow.ctx.fillRect(Math.round(x+height*.32),Math.round(120+height*.17),2,1);
   }
   const asset={image,shadow:shadow.image,anchor,width:160,height:144,pixelRatio:2};this.cache.set(key,asset);return asset;
  }
  const {image,ctx}=surface(160,144);const anchor={x:72,y:120};ctx.translate(anchor.x,anchor.y);
  if(['house','hall','forge'].includes(kind))drawHouse(ctx,kind,variant);
  else if(['tree','palm','bush','flowers'].includes(kind))foliage(ctx,kind,variant);
  else props(ctx,kind,variant);
  if(kind==='palm'){
   // Serrated pinnae follow the existing seven connected fronds.
   for(const [x,y,dir] of [[-19,-59,-1],[-12,-59,-1],[-5,-57,-1],[-16,-45,-1],[-8,-48,-1],[0,-50,-1],[24,-62,1],[31,-67,1],[39,-69,1],[29,-54,1],[37,-52,1],[27,-44,1],[32,-38,1]]){
    poly(ctx,[[x,y],[x+dir*5,y+2],[x+dir*6,y+6],[x+dir*2,y+3]],leaf[1]);r(ctx,x,y,3,1,leaf[3]);
   }
  }
  if(kind==='house'||kind==='hall'){
   const x=kind==='hall'?-36:-27;
   r(ctx,x-2,-16,16,4,wood[0]);r(ctx,x-1,-15,14,2,wood[2]);
   for(const dx of [1,6,10]){r(ctx,x+dx,-19,1,4,leaf[1]);r(ctx,x+dx-1,-21,3,2,'#cfb6c7');r(ctx,x+dx,-21,1,1,'#f4dfad');}
  }
  if(kind==='stall'){
   for(const x of [-17,-7,7,17]){r(ctx,x-3,-17,6,5,wood[0]);r(ctx,x-2,-17,4,3,variant?'#8fac55':'#e2b75a');r(ctx,x-1,-18,2,2,variant?'#c1ce7a':'#f1d187');}
   r(ctx,-21,-8,42,1,wood[3]);r(ctx,-18,-5,2,4,wood[2]);r(ctx,17,-5,2,4,wood[2]);
  }
  if(kind==='well'){
   // Shingled green shelter matches the civic roofs; stone lip catches the sun.
   for(const [y,left,right] of [[-37,-8,8],[-34,-13,13],[-31,-18,18]]){
    r(ctx,left,y,right-left,2,pigments.roof[1]);r(ctx,left,y,right-left,1,pigments.roof[2]);r(ctx,left+5,y,1,2,pigments.roof[0]);
   }
   r(ctx,-13,-10,26,2,pigments.stone[2]);r(ctx,-12,-10,23,1,pigments.stone[3]);r(ctx,-10,-7,20,4,'#25454b');r(ctx,-8,-6,10,1,'#519b9c');
  }
  if(kind==='forge'){
   r(ctx,12,-25,24,22,'#323d3e');r(ctx,15,-21,18,16,'#614a39');
   poly(ctx,[[17,-5],[17,-13],[20,-11],[22,-20],[25,-13],[28,-17],[31,-9],[31,-5]],'#ad6136');
   poly(ctx,[[19,-5],[20,-12],[22,-10],[24,-16],[26,-10],[29,-12],[29,-5]],'#e3a149');
   poly(ctx,[[22,-5],[22,-9],[24,-12],[26,-8],[26,-5]],'#f6d477');
   r(ctx,11,-4,27,4,pigments.stone[0]);r(ctx,12,-4,25,1,pigments.stone[2]);
  }
  if(kind==='boat'){
   for(const x of [-15,-5,6,16]){r(ctx,x,-6,1,5,wood[1]);r(ctx,x,-8,3,1,wood[3]);}
   poly(ctx,[[-21,-2],[-19,-1],[-10,3],[0,4],[10,2],[19,-1],[21,-2],[18,1],[9,4],[-1,5],[-11,4]],wood[3]);
  }
  // Project the actual alpha silhouette southeast; no shared oval shadow.
  const shadow=surface(160,144),pixels=ctx.getImageData(0,0,160,144).data;
  shadow.ctx.fillStyle=pigments.shadow;
  if(kind==='tree'){shadow.ctx.translate(anchor.x,anchor.y);drawTreeShadow(shadow.ctx,variant);}
  else for(let y=0;y<120;y++)for(let x=0;x<160;x++)if(pixels[(y*160+x)*4+3]){
   const height=120-y;shadow.ctx.fillRect(Math.round(x+height*.38),Math.round(120+height*.2),2,1);
  }
  const asset={image,shadow:shadow.image,anchor,width:160,height:144};this.cache.set(key,asset);return asset;
 }
}


