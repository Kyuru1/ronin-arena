import type { FacingDirection } from './storyPlayer';
type Views = { down:string[]; up:string[]; right:string[] };
/** Explicit front, profile and back drawings; left uses the matching profile. */
const worker:Views={
 down:[
 '....hhhh.....','...hHHHhh....','..hhsssshh...','..hsessesh...','...shhhhs....',
 '..vvsssstdd..','.svvaaatdds.','.svvaAAaatds.',
 '.ssvaAAaatss.','..vvaAAaadd..','...aaaaaaa...','...lLLLll....',
 '...lL..ll....','...ll..ll....','..fff..fff...',
 ],
 up:[
 '....hhhh.....','...hHHHhh....','..hhHHhhhh...','..hhhhhhhh...','...hhhhhh....',
 '..vvssssddd..','.svvtaaatdds.','.svvtattatds.','.ssvtaaatdss.',
 '..vvtaaatdd..','...aaaaaaa...','...lLLLll....','...lL..ll....','...ll..ll....','..fff..fff...',
 ],
 right:[
 '....hhhhh....','...hHHHhhh...','...hhssssh...','...hhssesh...','....hsshhs...',
 '...vvsssd....','..vvtAAatd...','..vvtAAats...','..vvtAAass...',
 '...vtAAad....','...aaaaaa....','....lLLll....','....lL.ll....','....ll.ll....','...fff.fff...',
 ],
};
const child:Views={
 down:[
 '...hhhh....','..hHHHhh...','..hsssssh..','..hsesesh..','...sssss...',
 '..vttttdds.','..svtttdss.','...vtttdd..','...ccllc...',
 '...lL.ll...','...ll.ll...','..fff.fff..',
 ],
 up:[
 '...hhhh....','..hHHHhh...','..hhHHhhh..','..hhhhhhh..','...hhhhh...',
 '..vttttdds.','..svtttdss.','...vtttdd..','...ccllc...',
 '...lL.ll...','...ll.ll...','..fff.fff..',
 ],
 right:[
 '....hhhh...','...hHHhhh..','...hhsssh..','...hhsess..','....sssss..',
 '...vtttd...','...vtttss..','...vtttd...','...ccllc...',
 '....lLll...','....l.ll...','...ff.fff..',
 ],
};
const girl:Views={
 down:['..hh...hh..','.hHHh.hHHh.','..hsssssh..','..hsesesh..','...sssss...','..vttttdd..','..svtttdss.','...vtttdd..','..vvtttddd.','...l..ll...','...l..ll...','..ff..fff..'],
 up:['..hh...hh..','.hHHh.hHHh.','..hhHHhhh..','..hhhhhhh..','...hhhhh...','..vttttdd..','..svtttdss.','...vtttdd..','..vvtttddd.','...l..ll...','...l..ll...','..ff..fff..'],
 right:['...hh.hh...','..hHHhHHh..','...hhsssh..','...hhsess..','....sssss..','...vtttd...','...vtttss..','...vtttd...','..vvtttdd..','....l.ll...','....l.ll...','...ff.fff..'],
};
const mayor:Views={
 down:[
 '....hhhh.....','...hHHHhh....','...hsssshh...','...hsesshh...','....sssshh...',
 '...vcttcdh...','..vvcttcddh..','..svcttcdsh..','..sscttcss...',
 '....ccccd....','...vvtttdd...','...vvtttdd...','..vvvtttddd..','...l...ll....','..fff..fff...',
 ],
 up:[
 '....hhhh.....','...hHHHhh....','...hhHHhhh...','...hhhhhhh...','....hhHhhh...',
 '...vthhhdd...','..vvthhhddd..','..svtthhdss..','..svtttddss..',
 '....ccccd....','...vvtttdd...','...vvtttdd...','..vvvtttddd..','...l...ll....','..fff..fff...',
 ],
 right:[
 '....hhhhh....','...hHHHhhh...','...hhssssh...','...hhssesh...','...hhhssss...',
 '...vhhttd....','...vhhttdd...','...vhtttss...','....tttcss...',
 '....ccccd....','...vvtttdd...','...vvtttdd...','...vvtttddd..','....l..ll....','...ff..fff...',
 ],
};
const porter:Views={
 down:[
 '.....hhhh......','....hHHHhh.....','...hhsssshh....','...hsessesh....','....ssssss.....',
 '..vvcsttcdd....','.vvvctttcddd...','.svvctttcddss..','.ssvctttcdsss..',
 '..vvctttcddd...','...cccccccc....','...lLLLLlll....','...lll..lll....','...ll....ll....','..ffff..ffff...',
 ],
 up:[
 '.....hhhh......','....hHHHhh.....','...hhHHhhhh....','...hhhhhhhh....','....hhhhhh.....',
 '..vvctttcdd....','.vvvctttcddd...','.svvctttcddss..','.ssvctttcdsss..',
 '..vvctttcddd...','...cccccccc....','...lLLLLlll....','...lll..lll....','...ll....ll....','..ffff..ffff...',
 ],
 right:[
 '.....hhhhh.....','....hHHHhhh....','....hhssssh....','....hhssesh....','.....hsssss....',
 '...vvcttdd.....','..vvvcttddd....','..vvvcttdsss...','..vvvcttddss...',
 '...vvcttddd....','....ccccccc....','....lLLLLll....','....lll.lll....','....ll...ll....','...ffff.ffff...',
 ],
};
const trader:Views={
 down:[
 '....cccc......','...cAAAcc.....','..cccccccc....','...hsssshh....','...hsesssh....','....sssss.....',
 '...vctttdd....','..svctttdds...','..svcaAadds...','...vcaAadd....',
 '....cccccc....','....lLLll.....','....ll.ll.....','...fff.fff....',
 ],
 up:[
 '....cccc......','...cAAAcc.....','..cccccccc....','...hhHHhhh....','...hhhhhhh....','....hhhhh.....',
 '...vctttdd....','..svctttdds...','..svctttdds...','...vctttdd....',
 '....cccccc....','....lLLll.....','....ll.ll.....','...fff.fff....',
 ],
 right:[
 '....cccc......','...cAAAcc.....','...cccccccc...','...hhssssh....','...hhssesh....','....hsssss....',
 '...vvcttd.....','...vvcttds....','...vvcaAss....','....vcaAd.....',
 '....cccccc....','....lLLll.....','....ll.ll.....','...fff.fff....',
 ],
};
const resident:Views={
 down:[
 '.....hhhh....','....hHHhhh...','...hhssshhh..','...hseseshh..','...hhsssshh..',
 '...hvcttdhh..','...hvcttdsh..','...svcttss...','....vcttd....',
 '....ccccd....','...vvtttdd...','...vttttdd...','....ll.ll....','...fff.fff...',
 ],
 up:[
 '.....hhhh....','....hHHhhh...','...hhHHhhhh..','...hhhHhhhh..','...hhhhhhhh..',
 '...hvhhhdhh..','...hvthhdsh..','...svthtss...','....vcttd....',
 '....ccccd....','...vvtttdd...','...vttttdd...','....ll.ll....','...fff.fff...',
 ],
 right:[
 '.....hhhh....','....hHHhhh...','....hhsssh...','....hhsess...','....hhhsss...',
 '....hvttd....','....hvttds...','....hvttss...','.....vttd....',
 '....ccccd....','....vvttdd...','....vtttdd...','.....l.ll....','....ff.fff...',
 ],
};
export const npcPalette = { h:'#483930',H:'#99754f',s:'#d6ad89',e:'#262c29',t:'#a8784e',v:'#c19761',d:'#79583e',c:'#c8b17c',l:'#38433d',L:'#66705a',f:'#27342f',a:'#68503a',A:'#95764e' };
const clothes:Record<string,{t:string;v:string;d:string}>={
 ketlin:{t:'#8a728e',v:'#b29aa5',d:'#62556d'},
 shorum:{t:'#566c61',v:'#87977a',d:'#394e45'},
 kuon:{t:'#5e8790',v:'#91aaa1',d:'#405e68'},
 mikah:{t:'#aa835e',v:'#ccb184',d:'#795b47'},
 jangi:{t:'#bda15e',v:'#d5bd7e',d:'#897b4a'},
 mibah:{t:'#aa7b83',v:'#c49b96',d:'#785b6a'},
};
export function npcColors(role:string){return {...npcPalette,...clothes[role]};}
export function baseNpc(role:string,direction:FacingDirection):string[]|undefined {
 const models:Record<string,Views>={jeff:worker,jangi:child,mibah:girl,ketlin:mayor,shorum:porter,kuon:trader,mikah:resident};
 const model=models[role];
 return model?.[direction==='left'?'right':direction];
}
