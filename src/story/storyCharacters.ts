import { makeSprite, type Sprite } from '../game/sprites';
import type { FacingDirection } from './storyPlayer';

/** Arena's one-pixel outline and compact sprite proportions. */
const TRAVELER = [
  '...hhhHHh...','..hhHHHHhh..','..hssssssh..','..hsessesh..',
  '...ssssss...','..bctvvtcc..','..bbtvvtdcs.','..bbtddtdcs.',
  '...cccccc...','...lLLLLl...','...ll..ll...','...ll..ll...','..ff....ff..',
];
const BACK_TRAVELER = [
  '...hhhHHh...','..hhHHHHhh..','..hbbbbbbh..','..hbbBBbbh..',
  '...bbbbbb...','..cctvvtdcc.','..cctvddtcc.','..cctdddtcc.',
  '...cccccc...','...lLLLLl...','...ll..ll...','...ll..ll...','..ff....ff..',
];
const SIDE_TRAVELER = [
  '...hhhHHh...','..hhHHHHhh..','..hsssshh...','..hssesshh..',
  '...sssshh...','..bctvvtc...','..bbtvvtdcs.','..bbtddtdcs.',
  '...cccccc...','...lLLLLl...','...ll..ll...','...ll..ll...','..ff....ff..',
];
const DESIGNS: Record<string, string[]> = {
  jeff: ['....hhhh....','...hHHhhh...','..hssssssh..','..hsessesh..','...shhhhs...',
    '.ssvttttdss.','.sstaaa atss.'.replace(' ',''),'..vtaaaadt..','...aaaaaa...','...lL..Ll...','..fff..fff..'],
  ketlin: ['....hhhh....','...hHHhhh...','...hsssshh..','...hsesshh..','....sssshh..','...cttttch..',
    '...cvvtdcs..','...svttdcs..','....cccc....','....tvdt....','...vvttdd...','...vtttdd...','...ttttdd...','....ll.ll...','...ff..ff...'],
  shorum: ['.....hhhhhh.....','....hhHHhhhh....','...hhsssssshh...','...hssessessh...',
    '....ssssssss....','..sscvttttdcss..','.ssscvvttddcsss.','.ssscvvttddcsss.',
    '..sscvttttdcss..','...vvttttttdd...','...cccccccccc...','....lLLLLLLl....','....lll..lll....','....lll..lll....','...ffff..ffff...'],
  kuon: ['....hhhh....','...hHHhhh...','..hhsssshh..','..hsessesh..','...ssssss...',
    '...cttttc...','..scttttcs..','..scttttcs..','...cccccc...','...llllll...','...ll..ll...','..fff..fff..'],
  mikah: ['.....hhhh...','....hHHhhh..','...hhsssshh.','...hsessshh.','...hhssshhh.',
    '...hcttchhh.','....cttcs.h.','...scttcs...','....cccc....','....tttt....','....l.ll....','...ff.ff....'],
  jangi: ['...hhhh...','..hHHhhh..','..ssssss..','..sesses..','...ssss...',
    '..stttts..','..stttts..','...cccc...','...l.l....','..ff.ff...'],
  mibah: ['..hh..hh..','.hHHhhHHh.','..ssssss..','..sesses..','...ssss...',
    '..stttts..','..stttts..','..tttttt..','...l.l....','..ff.ff...'],
};
const cache = new Map<string, Sprite[]>();
function tint(hex:string,delta:number){
  const value=hex.replace('#','');
  if(value.length!==6)return hex;
  const channels=[0,2,4].map(i=>Math.max(0,Math.min(255,parseInt(value.slice(i,i+2),16)+delta)));
  return '#'+channels.map(channel=>channel.toString(16).padStart(2,'0')).join('');
}
function frames(role:string, shirt:string, direction:FacingDirection) {
  const key=role+shirt+direction;
  let result=cache.get(key); if(result)return result;
  const source=role==='player'&&direction==='up'?BACK_TRAVELER:role==='player'&&(direction==='left'||direction==='right')?SIDE_TRAVELER:DESIGNS[role] || TRAVELER;
  const width=Math.max(...source.map(row=>row.length));
    const rows=source.map(row=>row.padEnd(width,'.')).map((row,index)=>{
    if(role==='player')return row;
    // Back views replace the face with hair; side views expose only the leading eye.
    if(direction==='up')return index<5?row.replace(/[se]/g,'h'):row;
    if(direction==='left'||direction==='right'){
      let seen=false;
      return row.split('').map(pixel=>{if(pixel!=='e')return pixel;if(seen)return 's';seen=true;return 'e';}).join('');
    }
    return row;
  });
  const palette={h:role==='mikah'?'#643d45':'#47332d',H:'#977451',s:'#ddb194',e:'#271e29',t:shirt,v:tint(shirt,25),d:tint(shirt,-30),c:'#dfc790',l:'#31333d',L:'#57605b',f:'#17141d',b:'#826043',B:'#b58b5b',a:'#745039'};
  result=[0,1,2,3].map(frame=>{
    const map=rows.map(row=>row.split(''));
    if(frame===2)for(const row of map)for(let x=0;x<row.length;x++)if(row[x]==='e')row[x]='s';
    if(frame===1||frame===3){
      const last=map.length-1,foot=map[last],half=Math.floor(width/2),left=frame===1;
      for(let x=0;x<width;x++)if(foot[x]==='f' && (x<half)===left){map[last-1][x]='f';foot[x]='.';}
    }
    return makeSprite(map.map(row=>row.join('')),palette);
  });
  cache.set(key,result);return result;
}
export function drawStoryCharacter(c:CanvasRenderingContext2D,x:number,feet:number,time:number,shirt:string,role='player',walking=false,facing=1,scale=3,direction:FacingDirection='down'){
  const set=frames(role,shirt,direction);
  // A first animation-frame timestamp can precede performance.now() from mount.
  // Normalize it so a negative remainder never selects an absent sprite frame.
  const phase=Number.isFinite(time)?Math.max(0,time):0;
  const idleBlink=Math.floor(phase*1.4)%9===0?2:0;
  const s=set[walking?Math.floor(phase*7)%set.length:idleBlink];
  c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(feet));
  if(facing<0)c.scale(-1,1);
  c.drawImage(s.canvas,-Math.floor(s.w/2)*scale,-s.h*scale,s.w*scale,s.h*scale);
  c.restore();
}
export function drawStoryContact(c:CanvasRenderingContext2D,x:number,y:number,width=24){
  c.save();c.globalAlpha=.22;c.fillStyle='#263c34';c.fillRect(Math.round(x-width/2+4),Math.round(y),width,4);
  c.globalAlpha=.36;c.fillRect(Math.round(x-width/2),Math.round(y-2),width/3,3);c.fillRect(Math.round(x+width/6),Math.round(y-2),width/3,3);c.restore();
}


