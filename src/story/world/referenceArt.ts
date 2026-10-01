import buildingsUrl from '../assets/kyuneth-buildings-trees.png';
import propsUrl from '../assets/kyuneth-props.png';
import residentsUrl from '../assets/kyuneth-residents.png';
import dailyUrl from '../assets/kyuneth-daily-life.png';
import terrainUrl from '../assets/kyuneth-terrain.png';
import walkUrl from '../assets/kyuneth-traveler-walk.png';
import { materialAt } from './maps';
import type { Material, WorldScene } from './types';
import { surface } from './pixel';
import type { ObjectKind } from './types';
import type { FacingDirection } from '../storyPlayer';
import { setCharacterAtlases, characterAtlasesReady, residentSource, protagonistSource } from '../characters/atlas';

type Box = readonly [number, number, number, number];
interface Stamp { image: HTMLCanvasElement; width: number; height: number; }
const sheets: HTMLImageElement[] = [];
const cutouts = new Map<string, HTMLCanvasElement>();
let pending: Promise<void> | undefined;
/** One shared decode, including across the intro/exploration remount. */
export function loadKyunethArt(): Promise<void> {
 return pending ??= Promise.all([buildingsUrl, propsUrl, residentsUrl, terrainUrl, walkUrl, dailyUrl].map(url => new Promise<HTMLImageElement>((resolve,reject) => {
  const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Não foi possível carregar a arte de Kyuneth.'));image.src=url;
 }))).then(images=>{sheets.splice(0,sheets.length,...images);setCharacterAtlases(images[2],images[4]);}).catch(error=>{pending=undefined;throw error;});
}
export function artReady(){return sheets.length===6&&characterAtlasesReady();}
/** Atlas boundaries were inspected individually; the generated layout is not assumed to be a perfect grid. */
function cut(sheet:number,key:string,box:Box):HTMLCanvasElement {
 const cached=cutouts.get(key);if(cached)return cached;
 const [x,y,w,h]=box;
 if(![x,y,w,h].every(Number.isInteger))throw new Error(`Recorte não inteiro: ${key}`);
 const s=surface(w,h);s.ctx.drawImage(sheets[sheet],x,y,w,h,0,0,w,h);
 const data=s.ctx.getImageData(0,0,w,h);let left=w,top=h,right=0,bottom=0;
 for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
  const a=(yy*w+xx)*4+3,opaque=data.data[a]>=200;data.data[a]=opaque?255:0;
  if(opaque){left=Math.min(left,xx);right=Math.max(right,xx);top=Math.min(top,yy);bottom=Math.max(bottom,yy);}
 }
 s.ctx.putImageData(data,0,0);
 const result=surface(Math.max(1,right-left+1),Math.max(1,bottom-top+1));
 result.ctx.drawImage(s.image,left,top,result.image.width,result.image.height,0,0,result.image.width,result.image.height);
 cutouts.set(key,result.image);return result.image;
}
const architecture:Record<string,{box:Box;width:number}>={
 hall:{box:[8,55,416,465],width:118},house0:{box:[426,150,330,360],width:94},
 house1:{box:[758,116,356,398],width:100},forge:{box:[1115,53,421,451],width:104},
 house2:{box:[8,594,384,370],width:98},house3:{box:[8,594,384,370],width:102},
 tree0:{box:[391,531,375,441],width:82},tree1:{box:[768,532,380,440],width:80},
 tree2:{box:[391,531,375,441],width:71},palm:{box:[1151,521,385,458],width:85},
};
const furniture:Partial<Record<ObjectKind,{box:Box;width:number}>>={
 well:{box:[804,53,296,343],width:44},boat:{box:[1135,91,379,308],width:64},
 bench:{box:[57,472,352,195],width:36},barrel:{box:[516,423,191,244],width:17},
 crate:{box:[846,456,220,211],width:18},pot:{box:[1192,405,297,290],width:21},
 bush:{box:[22,708,412,287],width:38},flowers:{box:[22,708,412,287],width:22},
 furnace:{box:[448,676,340,320],width:34},laundry:{box:[816,718,330,267],width:52},
 rock:{box:[1192,735,327,252],width:22},
};
export function environmentStamp(kind:ObjectKind,variant:number):Stamp|undefined{
 if(!artReady())return;
 const extra:Partial<Record<ObjectKind,{box:Box;width:number}>>={
   anvil:{box:[19,151,331,327],width:26},cart:{box:[412,160,333,320],width:32},tools:{box:[772,134,370,340],width:30},logs:{box:[1170,127,352,366],width:26},
   dog:{box:variant%2?[448,676,264,235]:[97,672,262,235],width:18},chicken:{box:[785,689,194,223],width:10},
  };
  const detail=kind==='house'&&variant===3?{box:[1037,530,490,414] as Box,width:102}:extra[kind];
  if(detail){const image=cut(5,`daily:${kind}:${variant%2}`,detail.box);return {image,width:detail.width,height:Math.round(detail.width*image.height/image.width*2)/2};}
 const a=architecture[kind==='house'||kind==='tree'?kind+variant% (kind==='house'?4:3):kind];
 const prop=kind==='stall'?{box:(variant?[65,51,343,332]:[431,50,368,332]) as Box,width:54}:furniture[kind];
 const item=a??prop;if(!item)return;
 const image=cut(a?0:1,`${kind}:${kind==='stall'||a?variant:0}`,item.box);
 const width=item.width,height=Math.round(width*(kind==='tree'?.95:image.height/image.width)*2)/2;
 return {image,width,height};
}
/** Compatibility exports for the visual verification pages; character art lives in characters/. */
export function residentSprite(role:string,direction:FacingDirection){return role==='player'?protagonistSource(direction,1):residentSource(role,direction);}
export function travelerFrame(direction:FacingDirection,frame:number){return protagonistSource(direction,frame);}
const terrainCache=new WeakMap<WorldScene,HTMLCanvasElement>();
/** Material masks and pier collision remain authoritative; only their pigment changes. */
export function referenceTerrain(scene:WorldScene){
 if(!artReady())return;
 const cached=terrainCache.get(scene);if(cached)return cached;
 const size=192,textures:Uint8ClampedArray[]=[];
 for(let i=0;i<6;i++){
  const tile=surface(size,size);tile.ctx.drawImage(sheets[3],i%3*512,Math.floor(i/3)*512,512,512,0,0,size,size);
  textures.push(tile.ctx.getImageData(0,0,size,size).data);
 }
 const materials:Record<Material,number>={grass:0,shade:0,flowers:0,sand:1,wet:1,packed:2,earth:2,stone:3,water:4,wood:5};
 const w=scene.width*2,h=scene.height*2,result=surface(w,h),data=result.ctx.createImageData(w,h);
 for(let y=0;y<scene.height;y++)for(let x=0;x<scene.width;x++){
  const material=scene.tiles[Math.floor(y/16)][Math.floor(x/16)].material==='wood'?'wood':materialAt(x,y),texture=textures[materials[material]];
  const shade=material==='shade'?.93:material==='earth'?.88:material==='wet'?.89:1;
  for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
   const xx=x*2+dx,yy=y*2+dy,source=((yy%size)*size+xx%size)*4,target=(yy*w+xx)*4;
   for(let channel=0;channel<3;channel++){
    const color=texture[source+channel]*shade;
    data.data[target+channel]=material==='water'?Math.round(color*.7+[27,157,173][channel]*.3):Math.round(color);
   }
   data.data[target+3]=255;
  }
 }
 result.ctx.putImageData(data,0,0);
 const c=result.ctx;c.scale(2,2);
 // Short grass fingers break the meeting of meadow and traveled path at half-pixel resolution.
 for(let y=2;y<scene.height-3;y+=2)for(let x=2;x<scene.width-3;x++){
  if(materialAt(x,y)!=='grass')continue;
  const next=materialAt(x,y+2);if(next!=='packed'&&next!=='sand'&&next!=='stone')continue;
  if((x+y)%5<2){c.fillStyle='#9db543';c.fillRect(x,y,1,2.5);c.fillStyle='#c2ce61';c.fillRect(x,y,0.5,1);}
 }
 // The six wooden pilings have weathered faces, iron nails and an actual top plane.
 for(const x of [50,92,135,171])for(const y of [449,477]){
  c.fillStyle='#60452e';c.fillRect(x-2,y-8,5,13);c.fillStyle='#ae783d';c.fillRect(x-1.5,y-7,2,11);
  c.fillStyle='#e5b85e';c.fillRect(x-2,y-9,4,3);c.fillStyle='#f6cf82';c.fillRect(x-1.5,y-9,3,1);
  c.fillStyle='#4a4530';c.fillRect(x-1,y+1,1,1);
 }
 // Shells and starfish are confined to the beach, tied to the fishing neighborhood.
 for(const [x,y] of [[144,380],[147,489],[155,552],[144,302],[155,654]]){
  c.fillStyle='#aa623b';c.fillRect(x-3,y,7,1);c.fillRect(x,y-3,1,7);c.fillRect(x-2,y-2,1,1);c.fillRect(x+2,y+2,1,1);
  c.fillStyle='#e89b52';c.fillRect(x-1,y-1,3,3);c.fillStyle='#f6c781';c.fillRect(x,y-1,1,1);
 }
 terrainCache.set(scene,result.image);return result.image;
}
