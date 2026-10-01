import { referenceTerrain } from './referenceArt';
import { materialAt } from './maps';
import { drawBaseTile, pigments } from './artKit';
import { polygon as poly, rect as r, surface } from './pixel';
import type { Material, WorldScene } from './types';
const ramps:Record<Material,string[]>={
 grass:[...pigments.grass],flowers:[...pigments.grass],shade:['#799653','#6c8949','#a1b76b','#49694a'],
 sand:[...pigments.sand],packed:['#efd18e','#dcb975','#ffe2a0','#c6a368'],wet:['#dcc487','#cbb778','#efd397','#aed4b2'],
 earth:['#8b7e57','#7a704e','#a09363','#686849'],stone:['#b4af8d','#92967d','#d2c7a0','#7e8973'],wood:['#a58658','#745c40','#c4a373','#584e3b'],water:['#269cab','#238f9e','#46b5bb','#8cd9d1']};
// Hand-placed motifs, independent of tile coordinates; six non-identical rotations of detail.
const motifs=[[[2,4],[11,12],[8,2]],[[5,9],[13,3],[1,14]],[[9,7],[3,1],[14,14]],[[1,8],[10,14],[12,4]],[[6,3],[2,12],[13,9]],[[3,6],[11,1],[7,13]]];
export class TileLayer {
 image:HTMLCanvasElement;
 private density=1;
 constructor(readonly scene:WorldScene){
  const reference=referenceTerrain(scene);if(reference){this.image=reference;this.density=2;return;}
  const {image,ctx}=surface(scene.width,scene.height);this.image=image;
  const atlas=new Map<string,HTMLCanvasElement>();
  scene.tiles.forEach((row,ty)=>row.forEach((tile,tx)=>{
   const key=tile.material+tile.variant;let sprite=atlas.get(key);
   if(!sprite){const s=surface(16,16),colors=ramps[tile.material];r(s.ctx,0,0,16,16,colors[0]);
    if(drawBaseTile(s.ctx,tile.material,tile.variant)){
     // Native kit only; tile positions and material masks remain unchanged.
    }else if(tile.material==='wood'){
     for(let y=0;y<16;y+=4){r(s.ctx,0,y,16,1,colors[1]);r(s.ctx,1,y+1,14,1,colors[2]);r(s.ctx,(tile.variant+y)%13,y+2,4,1,colors[1]);}r(s.ctx,2,1,1,1,colors[3]);r(s.ctx,13,13,1,1,colors[3]);
    }else if(!['grass','flowers','shade'].includes(tile.material))for(const [i,[x,y]] of motifs[tile.variant%6].entries()){
     if(tile.material!=='water'&&(i>0||tile.variant%3!==0))continue;
     r(s.ctx,x,y,tile.material==='water'?4:2,1,colors[1+i%2]);
     if(['grass','flowers','shade'].includes(tile.material)){r(s.ctx,x,y-1,1,2,colors[1]);r(s.ctx,x+1,y-2,1,1,colors[2]);}
    }
    sprite=s.image;atlas.set(key,sprite);
   }ctx.drawImage(sprite,tx*16,ty*16);
  }));
  const raster=ctx.getImageData(0,0,scene.width,scene.height);
  const textureData=new Map<string,Uint8ClampedArray>();
  for(const [key,sprite] of atlas)textureData.set(key,sprite.getContext('2d')!.getImageData(0,0,16,16).data);
  const color=(hex:string)=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
  const rgb=Object.fromEntries(Object.entries(ramps).map(([k,v])=>[k,v.map(color)])) as Record<Material,number[][]>;
  for(let y=0;y<scene.height;y++)for(let x=0;x<scene.width;x++){
   const tile=scene.tiles[Math.floor(y/16)][Math.floor(x/16)];if(tile.material==='wood')continue;
   const material=materialAt(x,y),i=(y*scene.width+x)*4;
   if(material!==tile.material){
    const source=textureData.get(material+tile.variant),j=((y%16)*16+x%16)*4;
    const tone=source?[source[j],source[j+1],source[j+2]]:rgb[material][0];
    raster.data.set([...tone,255],i);
   }
   // Sparse edge flecks avoid a perfect vector cut without adding an outline to every tile.
   if(material!=='water'&&materialAt(x-1,y)!==material&&(x+y)%3===0)raster.data.set([...rgb[material][2],255],i);
  }
  ctx.putImageData(raster,0,0);
  this.details(ctx);
  // Authored fringe along existing paths: native-pixel grass teeth and worn margins.
  for(let y=2;y<scene.height-3;y+=3)for(let x=2;x<scene.width-3;x++){
   const material=materialAt(x,y);
   if(material!=='grass'&&material!=='shade')continue;
   if(materialAt(x,y+3)==='packed'||materialAt(x,y+3)==='sand'){
    if((x+Math.floor(y/7))%7<3){r(ctx,x,y,1,3,pigments.grass[1]);r(ctx,x,y-1,1,1,pigments.grass[2]);}
   }
  }
  // Pier pilings and rope are painted on the existing wooden footprint.
  for(const x of [50,92,135,171])for(const y of [449,477]){
   r(ctx,x-2,y-3,5,6,pigments.wood[0]);r(ctx,x-1,y-4,3,3,pigments.wood[2]);r(ctx,x-1,y-4,2,1,pigments.wood[3]);
  }
 }
 private details(ctx:CanvasRenderingContext2D){
  // Broad, low-contrast grass islands, clipped to the unchanged material mask.
  // No world geometry or walkable edge is modified by these painted accents.
  const patches=[[256,253,42,16],[284,575,38,24],[469,609,28,18],[682,546,35,16],[211,737,30,28],[555,753,38,19],[293,327,27,16],[498,476,32,12],[202,458,20,11],[446,802,24,18]];
  for(const [cx,cy,rx,ry] of patches)for(let y=cy-ry;y<cy+ry;y++)for(let x=cx-rx;x<cx+rx;x++){
   const edge=1+Math.sin(y*.19)*.13+Math.sin(x*.22)*.1;
   if(((x-cx)/rx)**2+((y-cy)/ry)**2<edge&&materialAt(x,y)==='grass')r(ctx,x,y,1,1,'#98b246');
  }
  // Small authored grass groups leave generous areas of quiet ground.
  const tufts=[[219,277],[285,302],[502,290],[666,325],[527,409],[291,450],[298,548],[463,550],[509,590],[345,718],[468,754],[290,783],[640,735],[693,609],[214,630],[552,462],[697,226],[445,232],[207,370],[464,472],[253,710],[623,658],[375,823],[276,213],[446,665],[506,708],[325,511],[568,550],[718,467],[223,837],[578,808]];
  for(const [cx,cy] of tufts)for(const [dx,dy] of [[0,0],[6,3],[-5,4],[3,-6]]){
   const x=cx+dx,y=cy+dy;if(!['grass','shade'].includes(materialAt(x,y)))continue;
   r(ctx,x,y,4,1,'#637f4c');r(ctx,x+1,y-3,1,3,'#69864e');r(ctx,x+3,y-2,1,2,'#a5b778');r(ctx,x-1,y-1,1,1,'#91a565');
  }
  // Shore debris occurs near boats and the tide line, not on every sand tile.
  for(const [x,y,v] of [[144,380,0],[147,468,1],[163,516,0],[156,590,1],[147,665,0],[157,749,1],[129,303,1],[159,829,0]]){
   if(materialAt(x,y)!=='sand')continue;
   poly(ctx,[[x-2,y],[x-1,y-2],[x+2,y-2],[x+3,y],[x+1,y+1]],v?'#eee0b7':'#a7a990');
   r(ctx,x,y-1,1,2,v?'#c2a981':'#d3cda7');r(ctx,x+4,y+3,2,1,'#bbaa7d');
  }
  // Worn footfalls follow existing approach routes, with uneven spacing.
  for(const [x,y] of [[397,816],[400,793],[397,766],[402,727],[398,696],[403,661],[397,610],[401,570],[380,441],[351,439],[504,320],[531,321],[400,277]]){
   if(materialAt(x,y)!=='packed')continue;
   r(ctx,x-3,y,2,3,'#b8a374');r(ctx,x+2,y+5,2,3,'#b8a374');r(ctx,x-1,y+2,1,1,'#d5c38f');
  }
  // A ragged stone/grass seam replaces an abrupt plaza rectangle visually.
  for(let y=280;y<412;y++)for(let x=316;x<486;x++){
   if(materialAt(x,y)!=='stone')continue;
   if(materialAt(x,y+2)!=='stone'&&(x%7<3))r(ctx,x,y,1,2,'#9caa79');
   if(materialAt(x+2,y)!=='stone'&&(y%9<4))r(ctx,x,y,2,1,'#829465');
  }
 } draw(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){ctx.drawImage(this.image,x*this.density,y*this.density,w*this.density,h*this.density,x,y,w,h);}
}

