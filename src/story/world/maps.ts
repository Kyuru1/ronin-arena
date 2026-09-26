import { TILE_SIZE, type Material, type WorldScene, type WorldObject, type ObjectKind, type Rect } from './types';
const W = 800, H = 864;
const paths = [[400,848,400,402,19],[400,402,400,210,23],[224,322,580,322,18],[398,440,160,440,16],[400,505,608,505,16],[570,325,708,204,13]];
function distance(x:number,y:number,ax:number,ay:number,bx:number,by:number) { const dx=bx-ax,dy=by-ay;const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-ax-dx*t,y-ay-dy*t); }
export function shore(y:number) { return 105 + Math.round(Math.sin(y/85)*12+Math.sin(y/31)*4); }
export function materialAt(x:number,y:number):Material {
  const coast=shore(y);
  if(x<coast)return 'water'; if(x<coast+14)return 'wet'; if(x<coast+65)return 'sand';
  const edge=Math.round(Math.sin(y*.31)*1.5+Math.sin(x*.23));
  if(x>320+edge&&x<481+edge&&y>284+edge&&y<406+edge)return 'stone';
  if(paths.some(([ax,ay,bx,by,r])=>distance(x,y,ax,ay,bx,by)<r+edge))return 'packed';
  if((x>207+edge&&x<291+edge&&y>471+edge&&y<530+edge)||(x>543+edge&&x<655+edge&&y>337+edge&&y<392+edge))return 'earth';
  const meadows = [[278,278,46,30],[516,418,45,39],[295,577,70,55],[673,578,73,47],[204,187,47,55],[659,198,78,45],[320,467,34,23]];
  if(meadows.some(([cx,cy,rx,ry])=>((x-cx)/rx)**2+((y-cy)/ry)**2 < 1+Math.sin(x*.17)*.09+Math.cos(y*.13)*.1))return 'shade';
  if((x>213&&x<280&&y>488&&y<504)||(x>540&&x<646&&y>248&&y<257))return 'flowers';
  return 'grass';
}
const footprint:Partial<Record<ObjectKind,Rect>>={house:{x:-37,y:-35,w:74,h:37},hall:{x:-49,y:-47,w:98,h:49},forge:{x:-42,y:-32,w:84,h:34},tree:{x:-5,y:-5,w:10,h:8},palm:{x:-4,y:-4,w:8,h:7},well:{x:-15,y:-9,w:30,h:18},stall:{x:-23,y:-10,w:46,h:12},bench:{x:-15,y:-4,w:30,h:7},fence:{x:-16,y:-3,w:32,h:5},furnace:{x:-11,y:-9,w:22,h:12},anvil:{x:-9,y:-4,w:18,h:7},cart:{x:-15,y:-8,w:30,h:10},rock:{x:-8,y:-5,w:16,h:8},barrel:{x:-6,y:-5,w:12,h:7},crate:{x:-7,y:-5,w:14,h:7},boat:{x:-24,y:-8,w:48,h:12}};
const objects:WorldObject[]=[];
function put(kind:ObjectKind,x:number,y:number,variant=0){objects.push({id:`${kind}-${objects.length}`,kind,x,y,variant,collider:kind==='house'?{x:-37-(variant%2)*4,y:-35-(variant%2)*6,w:74+(variant%2)*8,h:37+(variant%2)*6}:footprint[kind]});}
// Authored neighborhoods: each cluster leaves a continuous walkable route.
put('hall',402,245,0);put('house',234,311,0);put('house',575,237,1);put('forge',589,323,2);put('house',247,481,2);put('house',602,485,3);
put('well',400,350);put('bench',347,378);put('bench',456,310,1);put('bench',444,393);
put('stall',474,353,0);put('stall',303,353,1);put('cart',639,363);put('furnace',542,325);put('anvil',567,354);put('tools',617,337);put('rock',616,368,2);put('rock',623,378,1);
put('sign',329,256,0);put('sign',696,203,1);put('sign',378,584,2);
put('boat',137,422,0);put('net',164,414);put('crate',175,430);put('barrel',181,446);put('boat',144,539,1);put('rock',123,501,2);put('rock',143,509,1);

for(const [x,y,v] of [[211,249,0],[204,338,1],[258,337,2],[527,235,1],[653,486,0],[213,482,1],[540,369,2],[493,357,1]] ) {put('barrel',x,y,v);put('crate',x+13,y+5,(v+1)%3);}
for(const [x,y,v] of [[205,313,0],[263,313,1],[364,247,2],[444,247,1],[569,487,0],[638,486,1],[217,483,2],[281,483,0]])put('pot',x,y,v);
put('laundry',263,537);put('laundry',617,540,1);put('steps',402,256);put('steps',247,489);
for(const [x,y] of [[202,512],[234,512],[266,512],[534,262],[566,262],[598,262],[630,262],[340,601],[340,633],[461,615],[461,647]])put('fence',x,y);
for(const [x,y,v] of [[196,208,0],[281,236,1],[483,219,2],[668,257,0],[309,429,1],[489,468,2],[205,556,0],[673,546,1],[306,624,2],[493,662,0],[329,176,1],[638,184,2],[334,329,2],[496,402,0]])put('tree',x,y,v);
for(const [x,y,v] of [[149,226,0],[169,351,1],[148,579,2],[177,660,0],[710,443,1],[706,632,2]])put('palm',x,y,v);
for(const [x,y] of [[326,295],[465,283],[345,415],[459,419],[288,498],[217,456],[660,466],[318,575],[479,565],[524,205]]){put('bush',x,y,objects.length%3);put('flowers',x+14,y+7,objects.length%3);put('flowers',x-11,y+12,objects.length%3);}
for(const [x,y,v] of [[188,397,0],[172,518,1],[198,608,2],[727,291,1],[655,614,0],[358,689,1]])put('rock',x,y,v);
// Southern verge also gives the dialogue camera room to frame the traveler above the overlay.
for(const [x,y,v] of [[289,747,0],[519,770,1],[320,835,2],[630,741,0],[208,803,1]])put('tree',x,y,v);
put('palm',155,753,1);put('bush',467,726,0);put('flowers',458,733,2);put('rock',346,783,1);
export const KYUNETH:WorldScene={id:'kyuneth',width:W,height:H,spawn:{x:400,y:648},objects,npcs:[
{id:'jeff',x:566,y:373,shirt:'#b8794d',direction:'up'}, {id:'ketlin',x:421,y:272,shirt:'#997caa',direction:'down'},
{id:'shorum',x:511,y:278,shirt:'#646c67',direction:'left'}, {id:'kuon',x:354,y:344,shirt:'#648b94',direction:'right',route:[{x:354,y:344},{x:353,y:394}],speed:9},
{id:'mikah',x:280,y:367,shirt:'#b28b77',direction:'right'}, {id:'jangi',x:427,y:426,shirt:'#c49a55',direction:'left',route:[{x:427,y:426},{x:458,y:441}],speed:12},
{id:'mibah',x:451,y:446,shirt:'#a8789e',direction:'up'}],interactions:[{x:402,y:265,label:'PREFEITURA DE KETLIN',radius:56,available:false},{x:587,y:355,label:'FERRARIA DE JEFF',radius:64,available:false},{x:696,y:203,label:'CAMINHO DA ARENA · EM BREVE',radius:45,available:false}],tiles:Array.from({length:H/TILE_SIZE},(_,ty)=>Array.from({length:W/TILE_SIZE},(_,tx)=>({material:materialAt(tx*16+8,ty*16+8),variant:(tx*7+ty*11+(tx*ty)%7)%6}))) };
for(let ty=28;ty<30;ty++)for(let tx=3;tx<11;tx++)KYUNETH.tiles[ty][tx]={material:'wood',variant:tx%6};
export function canOccupy(scene:WorldScene,x:number,y:number,radius=5){
 if(x<radius||y<radius||x>scene.width-radius||y>scene.height-radius)return false;
 for(const [dx,dy] of [[-radius,0],[radius,0],[0,-radius],[0,radius]])if(scene.tiles[Math.floor((y+dy)/16)]?.[Math.floor((x+dx)/16)]?.material!=='wood'&&materialAt(x+dx,y+dy)==='water')return false;
 return !scene.objects.some(o=>{const r=o.collider;if(!r)return false;const nx=Math.max(o.x+r.x,Math.min(x,o.x+r.x+r.w)),ny=Math.max(o.y+r.y,Math.min(y,o.y+r.y+r.h));return Math.hypot(x-nx,y-ny)<radius;});
}
export function landmarkAt(x:number,y:number){return KYUNETH.interactions.find(p=>Math.hypot(x-p.x,y-p.y)<p.radius)?.label ?? (x<190?'PRAIA DE KYUNETH':y>555?'CAMINHO COSTEIRO':x>310&&x<490&&y>280&&y<440?'PRAÇA CENTRAL':'VILA DE KYUNETH');}




