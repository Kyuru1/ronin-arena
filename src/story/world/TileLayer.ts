import { materialAt } from './maps';
import { rect as r, surface } from './pixel';
import type { Material, WorldScene } from './types';
const ramps:Record<Material,string[]>={
 grass:['#7d995b','#6f8d53','#91a76a','#5f804f'],flowers:['#7d995b','#6f8d53','#c8b981','#a7b37b'],shade:['#607e50','#587349','#75915b','#456548'],
 sand:['#d4c28f','#c7b482','#e3d3a2','#b9aa7a'],packed:['#c3af7c','#b3a073','#d5c28e','#a28f67'],wet:['#a8b79a','#96a990','#c1c3a0','#88a493'],
 earth:['#8b7e57','#7a704e','#a09363','#686849'],stone:['#b4af8d','#92967d','#d2c7a0','#7e8973'],wood:['#a58658','#745c40','#c4a373','#584e3b'],water:['#397f85','#347680','#4e9494','#68a8a0']};
// Hand-placed motifs, independent of tile coordinates; six non-identical rotations of detail.
const motifs=[[[2,4],[11,12],[8,2]],[[5,9],[13,3],[1,14]],[[9,7],[3,1],[14,14]],[[1,8],[10,14],[12,4]],[[6,3],[2,12],[13,9]],[[3,6],[11,1],[7,13]]];
export class TileLayer {
 image:HTMLCanvasElement;
 constructor(readonly scene:WorldScene){
  const {image,ctx}=surface(scene.width,scene.height);this.image=image;
  const atlas=new Map<string,HTMLCanvasElement>();
  scene.tiles.forEach((row,ty)=>row.forEach((tile,tx)=>{
   const key=tile.material+tile.variant;let sprite=atlas.get(key);
   if(!sprite){const s=surface(16,16),colors=ramps[tile.material];r(s.ctx,0,0,16,16,colors[0]);
    if(tile.material==='stone'){
     const layouts=[[[0,0,10,7],[11,0,5,7],[0,8,5,8],[6,8,10,8]],[[0,0,6,9],[7,0,9,4],[7,5,9,4],[0,10,16,6]],[[0,0,16,6],[0,7,8,9],[9,7,7,9]]];
     r(s.ctx,0,0,16,16,colors[3]);
     for(const [j,[x,y,w,h]] of layouts[tile.variant%3].entries()){
      const tone=['#b5b18e','#a9aa88','#bdb794','#aeb092'][(j+tile.variant)%4];
      r(s.ctx,x+1,y+1,w-1,h-1,tone);r(s.ctx,x+2,y+1,w-3,1,colors[2]);
      r(s.ctx,x+w-2,y+h-2,1,1,colors[1]);
     }    }else if(tile.material==='wood'){
     for(let y=0;y<16;y+=4){r(s.ctx,0,y,16,1,colors[1]);r(s.ctx,1,y+1,14,1,colors[2]);r(s.ctx,(tile.variant+y)%13,y+2,4,1,colors[1]);}r(s.ctx,2,1,1,1,colors[3]);r(s.ctx,13,13,1,1,colors[3]);
    }else for(const [i,[x,y]] of motifs[tile.variant%6].entries()){
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
    const tone=source?[source[j],source[j+1],source[j+2]]:rgb[material][((x*7+y*11)%61===0)?1:0];
    raster.data.set([...tone,255],i);
   }
   // Sparse edge flecks avoid a perfect vector cut without adding an outline to every tile.
   if(material!=='water'&&materialAt(x-1,y)!==material&&(x+y)%3===0)raster.data.set([...rgb[material][2],255],i);
  }
  ctx.putImageData(raster,0,0);
 } draw(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){ctx.drawImage(this.image,x,y,w,h,x,y,w,h);}
}

