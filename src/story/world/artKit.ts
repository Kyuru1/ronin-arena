import { polygon as p, rect as r } from './pixel';
import type { Material, ObjectKind } from './types';
type C = CanvasRenderingContext2D;

/** Native pixels, fixed pigment ramps. Light comes from the upper left. */
export const pigments = {
 wood: ['#40352c', '#80563a', '#ba8751', '#e5bf7d'],
 leaf: ['#1e4140', '#306348', '#548c46', '#86b451', '#bdd26d'],
 stone: ['#505e59', '#82938b', '#b7bda1', '#e0d8b4'],
 roof: ['#253f40', '#416b62', '#6e9380', '#abc19a'],
 clay: ['#604332', '#996143', '#c58956', '#e4ba79'],
 sand: ['#f2d58f', '#dfbf79', '#ffe7a6', '#c2a264'],
 grass: ['#a3bb4d', '#8fa640', '#c1cf65', '#718e39'],
 shadow: '#293e35',
} as const;
const w = pigments.wood, l = pigments.leaf;
type Shape = number[][];
function masses(c:C, shapes:Shape[], color:string) { for(const shape of shapes)p(c,shape,color); }

/** Branches and crown lobes are composed in explicit back-to-front order. */
export function drawTree(c:C, variant:number) {
 // Root flare and fork stay attached to the original foot anchor.
 const lean=variant===2?4:0;
 p(c,[[-8,2],[-4,-5],[-5,-20],[-7,-31],[-18,-42],[-15,-45],[-2,-33],[6+lean,-46],[10+lean,-46],[4,-28],[4,-8],[9,2],[3,1],[0,-2],[-4,2]],w[0]);
 p(c,[[-3,-27],[0,-24],[0,-10],[3,-1],[-1,-3],[-4,0]],w[2]);
 p(c,[[0,-26],[3,-31],[6,-41],[8,-42],[5,-28],[2,-22]],w[1]);
 r(c,-3,-21,1,10,w[3]);r(c,1,-15,1,9,w[1]);r(c,-1,-6,1,4,w[3]);
 // Each tuple is a distinct branch volume: x, y, width, height, illumination.
 const crowns:number[][][]=[
  [[14,-43,24,17,0],[-33,-42,29,19,1],[-11,-39,29,18,0],[4,-52,31,24,1],[-37,-53,26,21,1],[-22,-62,30,24,2],[-7,-69,27,24,2],[16,-56,24,20,1],[-13,-50,31,23,2],[-28,-44,22,16,2],[8,-41,25,16,1]],
  [[8,-39,25,14,0],[-33,-38,25,17,0],[-11,-40,28,17,1],[-36,-49,28,20,1],[-25,-58,29,21,2],[-7,-63,23,22,2],[10,-55,25,20,1],[-8,-48,29,23,2],[-24,-38,21,15,1],[15,-39,18,14,1]],
  [[3,-42,26,18,0],[-21,-43,24,17,1],[-13,-58,26,23,1],[-4,-71,23,22,2],[1,-55,24,23,2],[-24,-44,24,17,1],[-7,-43,24,18,2],[14,-39,15,13,1]],
 ];
 for(const [index,[x,y,width,height,light]] of crowns[variant%3].entries()){
  const points=[[3,0],[width-8,0],[width-8,2],[width-3,2],[width-3,5],[width,5],[width,height-5],[width-3,height-5],[width-3,height-2],[width-8,height-2],[width-8,height],[5,height],[5,height-2],[1,height-2],[1,height-5],[-1,height-5],[-1,6],[1,6],[1,2],[3,2]];
  p(c,points.map(([xx,yy])=>[x+xx,y+yy]),index<3?l[0]:l[1]);
  p(c,[[x+3,y+2],[x+width-8,y+2],[x+width-8,y+4],[x+width-3,y+4],[x+width-2,y+height-7],[x+width-6,y+height-3],[x+7,y+height-2],[x+2,y+height-6],[x+1,y+7]],l[1]);
  // Interlocking leaf silhouettes keep the canopy connected, with no outlined bubbles.
  p(c,[[x+3,y+3],[x+8,y+3],[x+8,y+1],[x+width-10,y+1],[x+width-10,y+4],[x+width-5,y+4],[x+width-5,y+7],[x+width-2,y+7],[x+width-2,y+10],[x+width-8,y+10],[x+width-8,y+13],[x+width-13,y+13],[x+width-13,y+height-4],[x+5,y+height-4],[x+5,y+height-7],[x+1,y+height-7],[x+1,y+7],[x+3,y+7]],l[light>0?2:1]);
  if(light>0){
   p(c,[[x+5,y+3],[x+10,y+3],[x+10,y+2],[x+width-10,y+2],[x+width-10,y+5],[x+width-7,y+5],[x+width-7,y+7],[x+width-12,y+7],[x+width-12,y+9],[x+7,y+9],[x+7,y+7],[x+3,y+7],[x+3,y+5]],l[3]);
  }
  const fans=[[3,4],[9,2],[width-8,5],[width-12,10],[5,height-7],[width-7,height-5],[11,height-4]];
  for(const [i,[dx,dy]] of fans.entries()){
   // Three angular blades, asymmetrically attached to one stem.
   const color=l[light===0?2:i<2?3:2];
   p(c,[[x+dx-2,y+dy+1],[x+dx,y+dy-1],[x+dx+3,y+dy],[x+dx+2,y+dy+2],[x+dx+5,y+dy+1],[x+dx+6,y+dy+3],[x+dx+1,y+dy+4],[x+dx-1,y+dy+3],[x+dx-4,y+dy+4],[x+dx-3,y+dy+2]],color);
   if(light===2&&i<2){r(c,x+dx,y+dy,2,1,l[4]);}
   if(i>3)r(c,x+dx+1,y+dy+4,3,1,l[1]);
  }
  // Negative pockets remain only underneath branch junctions.
  if(index%3===1){r(c,x+8,y+height-2,3,1,l[0]);r(c,x+10,y+height-3,2,1,l[1]);}

 }
 if(variant===1)for(const [x,y] of [[-23,-37],[-10,-48],[9,-33],[25,-41]]){
  p(c,[[x,y-3],[x+3,y-2],[x+4,y+2],[x+2,y+5],[x-1,y+4],[x-2,y+1]],'#845635');
  r(c,x-1,y,4,3,'#d59138');r(c,x,y-1,2,3,'#f4c660');r(c,x,y-4,1,2,l[0]);r(c,x+1,y-4,3,1,l[2]);
 }
}

export function drawBush(c:C) {
 p(c,[[-16,-3],[-17,-8],[-14,-12],[-10,-12],[-8,-16],[-2,-17],[3,-14],[7,-15],[12,-12],[12,-8],[17,-6],[18,-1],[14,2],[7,1],[3,3],[-4,2],[-8,3],[-14,1]],l[0]);
 p(c,[[-14,-7],[-12,-10],[-7,-11],[-5,-14],[0,-15],[4,-10],[8,-12],[10,-9],[9,-5],[15,-4],[15,-1],[8,-1],[3,0],[-2,-2],[-7,0],[-13,-1]],l[1]);
 masses(c,[[[-12,-8],[-7,-10],[-3,-7],[-5,-3],[-12,-3]],[[-5,-12],[-1,-14],[2,-11],[1,-7],[-3,-8]],[[4,-7],[8,-9],[10,-6],[7,-3],[3,-3]]],l[2]);
 r(c,-10,-8,4,1,l[3]);r(c,-3,-12,3,1,l[3]);
}

export function drawTreeShadow(c:C,variant:number) {
 const silhouettes:Shape[] = [
 [[-3,0],[4,-1],[10,5],[24,4],[32,7],[44,7],[52,12],[51,17],[44,19],[33,18],[26,22],[13,20],[8,16],[-5,17],[-13,13],[-12,8],[-3,6]],
 [[-4,0],[3,-1],[8,5],[20,5],[27,7],[37,7],[43,11],[40,17],[30,17],[25,20],[14,18],[6,19],[-3,15],[-11,15],[-16,10],[-11,6],[-3,5]],
 [[-2,0],[3,0],[9,7],[20,8],[25,11],[35,12],[41,17],[38,21],[30,21],[23,24],[15,21],[10,17],[1,16],[-5,12],[-2,8]],
 ];
 p(c,silhouettes[variant===0?0:variant===1?1:2],pigments.shadow);
}

export function drawBench(c:C) {
 // Back, seat, brackets and two actual supports; no uniformly rounded box.
 p(c,[[-16,-14],[-12,-16],[12,-16],[15,-14],[14,-7],[-15,-7]],w[0]);
 r(c,-13,-14,25,2,w[2]);r(c,-12,-14,21,1,w[3]);r(c,-13,-10,25,2,w[2]);
 r(c,-11,-8,2,10,w[0]);r(c,10,-8,2,10,w[0]);
 p(c,[[-14,-6],[13,-6],[17,-3],[16,0],[-16,0],[-17,-2]],w[0]);
 p(c,[[-13,-5],[12,-5],[15,-3],[-15,-3]],w[3]);r(c,-14,-2,28,1,w[2]);
 r(c,-12,0,3,3,w[0]);r(c,10,0,3,3,w[0]);r(c,-11,0,1,2,w[2]);r(c,11,0,1,2,w[2]);
 r(c,-4,-13,5,1,w[1]);r(c,3,-10,3,1,w[3]);
}

export function drawBarrel(c:C) {
 p(c,[[-5,-19],[4,-19],[7,-17],[8,-12],[8,-5],[6,-1],[3,1],[-4,1],[-7,-2],[-8,-8],[-7,-16]],w[0]);
 p(c,[[-6,-15],[-2,-16],[4,-15],[6,-11],[6,-5],[4,-1],[-4,-1],[-6,-5]],w[1]);
 r(c,-5,-14,3,11,w[2]);r(c,-4,-13,1,8,w[3]);r(c,0,-14,2,13,w[2]);r(c,3,-13,1,11,w[0]);
 p(c,[[-6,-17],[-3,-18],[3,-18],[6,-16],[4,-14],[-4,-14]],w[2]);
 r(c,-3,-17,6,1,w[3]);r(c,-3,-16,1,2,w[0]);
 for(const y of [-13,-4]){r(c,-6,y,12,2,'#4d6058');r(c,-5,y,6,1,'#94a28b');r(c,4,y+1,2,1,'#303f39');}
}

/** Shared construction grammar with explicit elevations and material choices. */
const houses = [
 {left:-37,right:37,ridge:-70,eave:-32,door:-7,windows:[-27,18],roof:pigments.roof,porch:false},
 {left:-41,right:41,ridge:-86,eave:-43,door:12,windows:[-27],roof:pigments.clay,porch:false},
 {left:-37,right:37,ridge:-64,eave:-30,door:-17,windows:[12],roof:pigments.roof,porch:true},
 {left:-41,right:41,ridge:-73,eave:-36,door:10,windows:[-28],roof:pigments.roof,porch:true},
];
function window(c:C,x:number,y:number) {
 r(c,x-1,y-1,12,14,w[0]);r(c,x,y,10,10,'#324940');
 r(c,x+1,y+1,7,4,'#829d83');r(c,x+1,y+1,3,2,'#bfcc9f');
 r(c,x+5,y,1,10,w[2]);r(c,x,y+5,10,1,w[2]);
 r(c,x-3,y+11,16,2,w[2]);r(c,x-2,y+11,13,1,w[3]);
 // Hinged shutters and a recessed sill make the opening sit inside the wall.
 r(c,x-5,y,3,11,w[0]);r(c,x-4,y,2,10,w[2]);r(c,x+12,y,3,11,w[0]);r(c,x+12,y,2,10,w[1]);
 for(const yy of [y+2,y+5,y+8]){r(c,x-4,yy,2,1,w[3]);r(c,x+12,yy,2,1,w[2]);}
 r(c,x+1,y+7,3,2,'#5e8074');r(c,x+6,y+7,3,2,'#3e6059');r(c,x-2,y+13,14,2,w[0]);
}
export function drawRoof(c:C,left:number,right:number,top:number,bottom:number,colors:readonly string[]=pigments.roof) {
 const outline=[[left,bottom],[left+3,bottom-10],[left+8,top+9],[left+13,top],[right-15,top],[right-8,top+11],[right-3,bottom-8],[right,bottom],[right-1,bottom+3],[left+1,bottom+3]];
 p(c,outline,w[0]);
 // Clip the fixed course drawing to this roof. Joints are selected, not a full brick grid.
 c.save();c.beginPath();
 // An integer scanline clip avoids antialiased diagonal mask pixels.
 for(let y=top;y<bottom+3;y++){
  const xs:number[]=[];
  outline.forEach(([x1,y1],i)=>{const [x2,y2]=outline[(i+1)%outline.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))xs.push(x1+(y-y1)*(x2-x1)/(y2-y1));});
  xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)c.rect(Math.ceil(xs[i]),y,Math.ceil(xs[i+1])-Math.ceil(xs[i]),1);
 }
 c.clip();
 r(c,left+1,top+2,right-left-2,bottom-top-1,colors[1]);
 const joints=[[-43,-32,-20,-9,3,15,27,39],[-47,-37,-25,-13,-2,10,22,34,45],[-43,-31,-19,-8,4,17,29,40],[-48,-36,-24,-12,0,12,24,36,46],[-42,-30,-18,-6,6,18,30,42],[-47,-35,-23,-11,1,13,25,37,47],[-43,-32,-20,-8,4,16,28,40]];
 for(let row=0;row<7;row++){
  const y=top+5+row*6;if(y>=bottom)break;
  const breaks=[left-4,...joints[row].filter(x=>x>left&&x<right),right+4];
  for(let i=0;i<breaks.length-1;i++){
   const x=breaks[i],end=breaks[i+1],drop=i===1?1:0;
   p(c,[[x+1,y],[end-1,y],[end,y+3+drop],[end-2,y+5],[x+2,y+5],[x,y+3]],colors[0]);
   p(c,[[x+2,y],[end-2,y],[end-1,y+3],[end-3,y+4],[x+2,y+4]],colors[(i+row)%4===0?2:1]);
   r(c,x+2,y,end-x-4,2,colors[(row+i)%5===0?3:2]);
   r(c,x+2,y+1,1,2,colors[2]);r(c,x+3,y+2,Math.max(1,end-x-6),1,(row+i)%3===0?colors[2]:colors[1]);
   if((row+i)%3===0){r(c,x+4,y+2,Math.max(1,end-x-10),1,colors[2]);r(c,end-5,y+3,2,1,colors[0]);}
   if((row+i)%4===1)r(c,end-4,y+4,2,1,colors[3]);
  }
 }
 // Three broad pigment planes, not scattered sparkling pixels.
 r(c,left+13,top+2,right-left-28,1,colors[3]);
 c.restore();
 r(c,left+1,bottom+1,right-left-2,3,w[0]);r(c,left+2,bottom+1,right-left-4,1,w[1]);r(c,left+2,bottom,right-left-5,1,colors[2]);
}
export function drawHouse(c:C,kind:ObjectKind,variant:number) {
 const plan=kind==='hall'?{left:-50,right:50,ridge:-89,eave:-43,door:-9,windows:[-36,26],roof:pigments.roof,porch:false}
 :kind==='forge'?{left:-44,right:44,ridge:-73,eave:-34,door:-26,windows:[],roof:pigments.clay,porch:false}:houses[variant%houses.length];
 const {left:a,right:b,eave,door}=plan;
 r(c,a,-13,b-a,16,pigments.stone[0]);r(c,a+1,-12,b-a-2,12,pigments.stone[1]);
 r(c,a+1,-6,b-a-2,1,pigments.stone[0]);
 for(const [x,len] of [[a+2,15],[a+20,13],[a+36,18],[b-19,16]]){r(c,x,-10,len,1,pigments.stone[2]);r(c,x+len,-9,1,3,pigments.stone[0]);r(c,x+6,-4,len-5,1,pigments.stone[2]);r(c,x+4,-5,1,5,pigments.stone[0]);}
 r(c,a,eave,b-a,-eave-12,'#dbc493');r(c,b-12,eave,12,-eave-12,'#a68959');
 for(const y of [-37,-31,-25,-19])if(y>eave){r(c,a+3,y,b-a-17,1,'#b59d6c');r(c,a+5,y+1,b-a-23,1,'#e2ce9d');}
 for(const [x,y] of [[a+9,-20],[a+19,-25],[b-23,-18]]){r(c,x,y,5,1,w[2]);r(c,x+1,y+1,2,1,w[3]);}
 for(const x of [a,a+4,b-13,b-3]){r(c,x,eave,3,-eave-12,w[0]);r(c,x,eave,1,-eave-12,w[2]);}
 r(c,door-3,-31,20,32,w[0]);r(c,door-2,-31,18,2,w[3]);r(c,door-2,-29,2,29,w[2]);r(c,door,-28,13,27,w[1]);r(c,door+1,-27,2,24,w[2]);r(c,door+6,-27,1,25,w[0]);r(c,door+10,-14,2,2,w[3]);
 // Door planks have two grain marks and forged hinges, not uniform pinstripes.
 r(c,door+3,-23,1,7,w[0]);r(c,door+4,-16,1,4,w[2]);r(c,door+9,-26,1,7,w[2]);
 r(c,door+1,-22,3,1,'#3c4440');r(c,door+1,-6,3,1,'#3c4440');r(c,door+10,-15,2,1,'#edcd82');
 for(const x of plan.windows)window(c,x,-29);
 drawRoof(c,a-7,b+7,plan.ridge,eave,plan.roof);
 // The eave casts a deep band above the sunlit plaster; brackets support it.
 r(c,a+3,eave+3,b-a-6,3,'#675a41');
 for(const x of [a+7,b-10]){r(c,x,eave+4,3,5,w[0]);r(c,x,eave+4,1,4,w[2]);}
 // Timber grain and foundation moss occur at structural edges only.
 r(c,a+6,-17,9,1,w[3]);r(c,b-10,-22,1,7,w[0]);
 r(c,a+2,0,9,2,l[1]);r(c,b-9,1,6,1,l[2]);
 // A few chipped edges give foundation stones thickness.
 for(const [x,y] of [[a+4,-9],[a+23,-3],[b-20,-9],[b-7,-3]]){
  r(c,x,y,5,1,pigments.stone[3]);r(c,x+5,y+1,1,2,pigments.stone[0]);
 }
 r(c,door-4,1,23,3,pigments.stone[0]);r(c,door-4,1,22,1,pigments.stone[3]);r(c,door-6,4,27,3,pigments.stone[1]);r(c,door-6,4,26,1,pigments.stone[2]);
 if(kind==='house'&&variant===1){
  // Taller gabled sleeping loft, structurally tied into the lower roof.
  p(c,[[-27,-50],[-27,-65],[-13,-79],[2,-65],[2,-50]],w[0]);
  p(c,[[-24,-51],[-24,-64],[-13,-75],[-1,-64],[-1,-51]],'#c4ac79');
  window(c,-18,-65);p(c,[[-30,-64],[-13,-82],[5,-64],[1,-63],[-13,-76],[-27,-62]],w[0]);
  p(c,[[-27,-64],[-13,-79],[2,-64],[0,-64],[-13,-76]],w[2]);
 } else if(kind==='hall'){
  // Civic entry: broad steps, portico and muted woven banner.
  r(c,-18,-39,36,5,w[0]);r(c,-17,-39,34,2,w[3]);
  for(const x of [-17,14]){r(c,x,-34,3,35,w[0]);r(c,x,-33,1,33,w[2]);}
  for(const [y,len] of [[2,40],[5,46],[8,52]]){r(c,-len/2,y,len,3,pigments.stone[1]);r(c,-len/2,y,len,1,pigments.stone[3]);}
  for(const x of [-27,22]){
   r(c,x,-40,8,19,'#675572');r(c,x+1,-39,2,16,'#a68cad');
   p(c,[[x,-21],[x+8,-21],[x+8,-17],[x+4,-19],[x,-17]],'#675572');
   r(c,x+3,-34,2,8,'#e6d7b7');r(c,x+1,-31,6,2,'#e6d7b7');
  }
 } else if(kind==='forge'){
  r(c,10,-30,29,28,'#343c34');r(c,12,-27,23,3,w[2]);
  for(const x of [16,24,31]){r(c,x,-23,2,14,pigments.stone[2]);r(c,x-2,-19,6,3,pigments.stone[0]);}
  r(c,20,-85,14,35,pigments.stone[0]);r(c,21,-83,10,31,pigments.stone[1]);
  for(const y of [-81,-73,-65,-57]){r(c,22,y,9,1,pigments.stone[2]);r(c,27,y+1,1,3,pigments.stone[0]);}
  r(c,17,-87,20,4,w[0]);r(c,18,-87,18,1,pigments.stone[2]);
 } else if(plan.porch){
  const left=variant===2?a-4:a-7,right=variant===2?b+4:4;
  r(c,left,-6,right-left,8,w[0]);r(c,left+1,-5,right-left-2,2,w[2]);
  for(const x of [left+2,right-4]){r(c,x,-24,3,25,w[0]);r(c,x,-23,1,23,w[2]);}
  p(c,[[left-2,-23],[left+2,-31],[right-4,-31],[right+2,-23]],w[0]);
  r(c,left,-24,right-left,2,w[2]);r(c,left+2,-30,right-left-6,1,w[3]);
 }
}

export function drawBaseTile(c:C,material:Material,variant=0):boolean {
 if(material==='grass'||material==='shade'||material==='flowers'){
  r(c,0,0,16,16,material==='shade'?'#8ca443':pigments.grass[0]);
  // Only two of six variants carry a small directional blade group.
  if(variant===1){r(c,3,10,4,1,pigments.grass[1]);r(c,4,8,1,2,pigments.grass[1]);r(c,6,9,1,1,pigments.grass[2]);}
  if(variant===4){r(c,10,4,3,1,pigments.grass[1]);r(c,11,2,1,2,pigments.grass[1]);}
  return true;
 }
 if(material==='sand'){
  r(c,0,0,16,16,pigments.sand[0]);
  if(variant===2){r(c,3,10,6,1,pigments.sand[1]);r(c,4,9,4,1,pigments.sand[2]);}
  return true;
 }
 if(material==='stone'){
  r(c,0,0,16,16,'#a4ac81');
  const shapes:Shape[][]=[
   [[[1,1],[7,0],[9,2],[8,7],[2,8],[0,6]],[[11,0],[16,1],[16,8],[11,7],[10,4]],[[1,10],[7,9],[9,12],[8,16],[0,16]],[[11,10],[15,10],[16,13],[15,16],[10,15]]],
   [[[0,0],[9,0],[8,5],[2,6],[0,4]],[[11,1],[16,0],[16,9],[10,8]],[[1,8],[7,7],[8,10],[7,16],[0,16]],[[10,11],[16,11],[16,16],[9,16]]],
   [[[1,0],[6,1],[6,8],[1,9],[0,6]],[[8,0],[16,0],[16,7],[9,6]],[[1,11],[6,10],[10,12],[9,16],[0,16]],[[11,9],[16,10],[16,16],[12,16]]],
  ];
  const tones=['#c7c8ad','#babc9e','#d0ccb0','#bfc3a5'];
  shapes[variant%3].forEach((shape,i)=>{p(c,shape,tones[i]);const [x,y]=shape[0];r(c,x+1,y+1,3,1,'#e1dcba');});
  return true;
 }
 return false;
}
