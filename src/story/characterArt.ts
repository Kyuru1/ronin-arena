import type { FacingDirection } from './storyPlayer';

/** Authored pixel layers: each pose is assembled before Arena's outline pass. */
const front = [
 '.....hhhhhhh....','...hhhHHHHhhhh..','..hhHHHHHHHhhh..','.hhhHHHhHHHhhhh.',
 '.hhHHHhhhhHHhhh.','.hhhhshhhsshhhh.','..hhssssssssh...','..hseessesssh...',
 '...sesssesss....','...sssSSssss....','....sssssss.....','.....sssss......',
];
const back = [
 '......hhhh......','....hhHHHhhh....','...hhHHHHHhhh...','..hhHHHHHHhhhh..',
 '..hhhHHHHHhhhh..','..hhhhHHHhhhhh..','..hhhhHHhhhhhh..','...hhhhhhhhhh...',
 '...hhhhhhhhh....','....hhhhhhh.....','.....hhhhh......','......hhh.......',
];
const profile = [
 '......hhhh......','....hhHHHhhh....','...hhHHHHHhhh...','..hhHHHHHhhhhh..',
 '..hhHHHHhhsshh..','..hhhHHhhhsssh..','..hhhhhhssssss..','...hhhhhssesss..',
 '...hhhhsss essss'.replace(' ',''),'....hhhssSsss...','.....hhsssss....','......ssss......',
];
interface Look { hair:string; light:string; shirt:string; shade:string; highlight:string; skin:string; height:number; width:number; skirt?:boolean; }
const looks:Record<string,Look> = {
 player:{hair:'#292a32',light:'#52505a',shirt:'#d9cda5',shade:'#958666',highlight:'#f5e6bc',skin:'#e1af83',height:29,width:10},
 jeff:{hair:'#382823',light:'#70513a',shirt:'#896042',shade:'#4e3730',highlight:'#be9161',skin:'#ca936b',height:30,width:13},
 ketlin:{hair:'#302631',light:'#675068',shirt:'#e5d5ae',shade:'#a89c83',highlight:'#f4e7c5',skin:'#e6b994',height:29,width:9,skirt:true},
 shorum:{hair:'#989b93',light:'#e0d8bc',shirt:'#b69a60',shade:'#77633f',highlight:'#ddc58a',skin:'#cda583',height:28,width:9},
 kuon:{hair:'#272c32',light:'#4b5863',shirt:'#47647b',shade:'#2d3d52',highlight:'#7e99a5',skin:'#d3a27b',height:25,width:12},
 mikah:{hair:'#593b30',light:'#996244',shirt:'#589b91',shade:'#345d62',highlight:'#9dc5a8',skin:'#bf8967',height:28,width:10,skirt:true},
 jangi:{hair:'#342b27',light:'#775140',shirt:'#ae985b',shade:'#6c693f',highlight:'#e5c777',skin:'#b6805d',height:31,width:9},
 mibah:{hair:'#a2a2aa',light:'#e2dfd0',shirt:'#95768e',shade:'#624f70',highlight:'#bea1b4',skin:'#ddaf8c',height:27,width:10,skirt:true},
};
export function characterArt(role:string,direction:FacingDirection,frame:number,walking:boolean) {
 const look=looks[role]??looks.player, side=direction==='left'||direction==='right', rear=direction==='up';
 const width=24,height=34,grid=Array.from({length:height},()=>Array<string>(width).fill('.'));
 const put=(x:number,y:number,color:string)=>{if(x>=0&&x<width&&y>=0&&y<height)grid[y][x]=color;};
 const block=(x:number,y:number,w:number,h:number,color:string)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,color);};
 const foot=height-2,contact=walking&&(frame===0||frame===2),stride=walking?[2,0,-2,0][frame]:0;
 const bob=contact?1:0,top=foot-look.height+bob,hip=foot-7,bodyY=top+12;
 const left=12-Math.floor((side?8:look.width)/2),bodyWidth=side?8:look.width;
 // Back leg first; bent knees and alternating feet change silhouette, not only height.
 for(let leg=0;leg<2;leg++){
  const swing=leg===0?stride:-stride,x=side?10+swing:leg===0?left+1:left+bodyWidth-4;
  const lift=walking&&swing<0?2:0;
  block(x,hip,3,foot-hip-lift,'l');block(x,hip,1,foot-hip-lift-1,'L');
  if(side&&swing){block(x-Math.sign(swing),hip+3,3,2,'l');}
  if(!side&&swing){
   block(x,hip+3,3,foot-hip-3,'.');
   const knee=x+(leg===0?-1:1)*(swing>0?1:0);
   block(knee,hip+3,3,foot-hip-lift-3,'l');block(knee,hip+3,1,2,'L');
  }
  block(x-1,foot-lift-1,4,2,'f');block(x,foot-lift-1,2,1,'b');
 }
 block(left,bodyY,bodyWidth,hip-bodyY+1,'t');block(left,bodyY,2,hip-bodyY,'v');block(left+bodyWidth-2,bodyY,2,hip-bodyY+1,'d');
 // Shaped shoulders, neck, stitched collar, and folds in the sunlit cloth.
 block(left,bodyY,1,2,'.');block(left+bodyWidth-1,bodyY,1,2,'.');
 block(left+3,bodyY,bodyWidth-6,1,'s');block(left+3,bodyY+1,bodyWidth-6,1,'c');
 block(left+2,bodyY+3,1,2,'v');block(left+bodyWidth-3,hip-3,1,2,'d');
 block(left,hip,1,1,'.');block(left+bodyWidth-1,hip,1,1,'.');
 block(left+1,hip-1,bodyWidth-2,2,'b');put(left+bodyWidth-4,hip-1,'B');
 // Collar opening, hems and sleeve folds use the same warm cloth ramp.
 if(!rear){put(left+Math.floor(bodyWidth/2),bodyY+1,'d');put(left+Math.floor(bodyWidth/2),bodyY+2,'c');}
 block(left+1,hip-3,2,1,'v');block(left+bodyWidth-3,hip-2,1,1,'d');
 if(look.skirt){
  for(let y=hip-1;y<foot;y++){
   const spread=Math.floor((y-hip+1)/3);block(left-spread,y,bodyWidth+spread*2,1,'k');
   block(left+1-spread,y,2,1,'K');block(left+bodyWidth-2+spread,y,2,1,'q');
   if(y>hip)put(left+4,y,'q');
  }
  block(left-1,foot-1,bodyWidth+2,1,'q');
 }
 if(role==='kuon'){block(left+2,bodyY,2,hip-bodyY-1,'c');block(left+bodyWidth-4,bodyY,2,hip-bodyY-1,'c');block(left,hip-1,bodyWidth,2,'a');}
 if(role==='player'){
  // A teal woven sash crosses the simple tunic and attaches to a travel bag.
  for(let y=bodyY;y<hip;y++){const x=rear?left+2+Math.floor((y-bodyY)/2):left+bodyWidth-3-Math.floor((y-bodyY)/2);block(x,y,2,1,'a');}
  const bagX=side?left-3:left-2;
  block(bagX,bodyY+4,4,6,'b');block(bagX,bodyY+4,3,2,'B');put(bagX+1,bodyY+6,'c');put(bagX+1,bodyY+8,'B');
 }else if(role==='jeff'){
  block(left+1,bodyY,bodyWidth-2,2,'c');block(left+3,bodyY+2,bodyWidth-6,hip-bodyY+2,'b');block(left+4,bodyY+3,3,3,'B');block(left+3,hip,bodyWidth-6,3,'b');block(left+4,hip+1,2,1,'B');block(left+3,hip-2,5,1,'d');
  block(left+bodyWidth-3,hip-1,1,4,'B');block(left+bodyWidth-4,hip-2,3,2,'L');
 }else if(role==='jangi'||role==='mibah'){
  block(left,bodyY,bodyWidth,3,'a');block(left+bodyWidth-3,bodyY+2,2,4,'a');
 }
 // Arms counter-swing against their corresponding legs.
 for(let arm=0;arm<(side?1:2);arm++){
  const swing=arm===0?-stride:stride,x=side?12+Math.sign(swing)*2:(arm===0?left-2:left+bodyWidth)+(swing>0?(arm===0?1:-1):0);
  const y=bodyY+1+(swing>0?1:swing<0?-1:0),length=3+(swing>0?1:0);
  block(x,y,2,2,role==='jeff'?'c':arm===0?'v':'d');block(x,y+2,2,length,'s');
  block(x+(swing>0?1:0),y+length+1,2,2,role==='jeff'?'b':'s');put(x,y+length,'S');
 }
 const head=rear?back:side?profile:front;
 head.forEach((row,y)=>[...row].forEach((color,x)=>{if(color!=='.')put(x+4,top+y,color);}));
 if(!walking&&frame===1){for(const row of grid)for(let x=0;x<width;x++)if(row[x]==='e'||row[x]==='w')row[x]='s';}
 // Hair, beard and occupation accessories are authored per resident.
 if(role==='jeff'&&!rear){block(side?15:9,top+10,side?3:6,2,'h');put(side?16:11,top+10,'H');}
 if(role==='ketlin'){block(side?7:17,top+6,2,8,'h');put(side?8:17,top+8,'H');}
 if(role==='ketlin'||role==='kuon'){block(side?8:10,top-2,5,3,'h');block(side?9:11,top-2,3,1,'H');}
 if(role==='jeff'&&!rear){block(side?15:8,top+9,side?3:9,2,'h');block(side?16:10,top+10,side?2:5,2,'H');}
 if(role==='mikah'){for(const [x,y] of [[5,2],[17,2],[4,5],[17,6],[5,8],[16,9]])block(x,top+y,2,2,'h');}
 if(role==='mibah'){block(6,top+5,2,7,'h');block(17,top+5,2,7,'H');}
 if(role==='shorum'&&!rear){block(side?10:8,top+3,side?4:8,3,'s');block(side?10:8,top+3,side?2:3,1,'S');}
 if(role==='shorum'){block(20,bodyY+4,1,foot-bodyY-3,'b');block(18,bodyY+3,3,1,'B');if(!rear)block(side?15:10,top+10,3,2,'H');}
 if(!walking&&frame===2){block(side?13:left-2,bodyY+3,2,3,'s');put(side?14:left-1,bodyY+3,'S');}
 if(role==='mikah'&&!rear){block(15,hip-3,6,4,'b');block(16,hip-3,4,1,'B');block(16,hip-1,4,1,'B');block(16,hip-5,1,2,'B');block(19,hip-5,1,2,'B');}
 return {rows:grid.map(row=>row.join('')),palette:{h:look.hair,H:look.light,s:look.skin,S:'#bf896a',w:'#f9e7c2',e:'#211e29',t:look.shirt,v:look.highlight,d:look.shade,c:'#f0dfb6',l:'#34434c',L:'#627675',f:'#242831',b:'#695039',B:'#ab8658',k:role==='ketlin'?'#947cac':role==='mibah'?'#d8c9aa':look.shirt,K:role==='ketlin'?'#c2a6c6':role==='mibah'?'#f0dfbb':look.highlight,q:role==='ketlin'?'#64526f':role==='mibah'?'#a69a83':look.shade,a:role==='player'?'#467f7b':role==='jangi'?'#dbb65e':'#b39aaa'}};
}
