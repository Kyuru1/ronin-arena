import { drawStoryCharacter, drawStoryContact } from './storyCharacters';
import type { FacingDirection, StoryPlayerEntity } from './storyPlayer';

/** Kyuneth materials and sprites. World coordinates/physics belong to the scene.
 * Like Game.buildFloor, expensive surface detail is baked once. Each art pixel
 * covers two world units; the visible canvas, camera and movement scale stay intact.
 */
export interface VillageBuilding {
  kind: string; x: number; y: number; w: number; h: number;
  wall: string; roof: string; door: string; accent: string; label: string;
}
type Ctx = CanvasRenderingContext2D;
type Point = readonly [number, number];
type Paint = (c: Ctx) => void;
interface Sprite { image: HTMLCanvasElement; shadow: HTMLCanvasElement; x: number; y: number; w: number; h: number; depth: number; }
export type Walker = StoryPlayerEntity;
const W = 2000, H = 1400, PIXEL = 2;
const WOOD = ['#b28754', '#c39762', '#b78c5b', '#a87c4e'];
const LEAVES = ['#315d43', '#3d7750', '#579151', '#75a65b', '#9abe70'];
const q = (n: number) => Math.round(n / PIXEL) * PIXEL;
function box(c: Ctx, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color; c.fillRect(q(x), q(y), Math.max(2, q(w)), Math.max(2, q(h)));
}
function polygon(c: Ctx, points: readonly Point[], color: string) {
  c.fillStyle = color; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(q(x), q(y)) : c.moveTo(q(x), q(y)));
  c.closePath(); c.fill();
}
function line(c: Ctx, points: readonly Point[], color: string, width = 2) {
  c.strokeStyle = color; c.lineWidth = width; c.lineJoin = 'miter';
  c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(q(x), q(y)) : c.moveTo(q(x), q(y))); c.stroke();
}
// Stepped ellipse: no anti-aliased curves or blurred outlines in sprite silhouettes.
function disc(c: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
  for (let row = -ry; row <= ry; row += PIXEL) {
    const half = q(rx * Math.sqrt(Math.max(0, 1 - row * row / (ry * ry))));
    if (half > 0) box(c, x - half, y + row, half * 2, PIXEL, color);
  }
}
function hash(x: number, y: number, seed = 0) {
  let n = Math.imul(x + seed * 71, 374761393) ^ Math.imul(y + 29, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function canvas(w: number, h: number) {
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w / PIXEL); cv.height = Math.ceil(h / PIXEL);
  const c = cv.getContext('2d')!; c.scale(1 / PIXEL, 1 / PIXEL); c.imageSmoothingEnabled = false;
  return { cv, c };
}
function planks(c: Ctx, x: number, y: number, w: number, h: number, vertical = false, old = false) {
  box(c, x, y, w, h, '#684d38');
  const count = Math.ceil((vertical ? w : h) / 14);
  for (let i = 0; i < count; i++) {
    const color = old ? ['#7e8067', '#9b9674', '#8b886b', '#aaa17e'][i % 4] : WOOD[i % 4];
    const px = x + (vertical ? i * 14 : 0), py = y + (vertical ? 0 : i * 14);
    const pw = vertical ? Math.min(12, w - i * 14) : w;
    const ph = vertical ? h : Math.min(12, h - i * 14);
    box(c, px, py, pw, ph, color);
    box(c, px, py, vertical ? 2 : pw, vertical ? ph : 2, old ? '#b3b08a' : '#d5ad75');
    for (let j = 0; j < (vertical ? h : w); j += 43) {
      const v = hash(i, j, 9);
      box(c, px + (vertical ? 4 : j + 6), py + (vertical ? j + 8 : 6), vertical ? 2 : 10 + v * 15, vertical ? 12 : 2, old ? '#717762' : '#8d6743');
    }
    for (const n of [4, (vertical ? h : w) - 6]) box(c, px + (vertical ? 5 : n), py + (vertical ? n : 5), 2, 2, '#65563f');
  }
}
function stone(c: Ctx, x: number, y: number, w: number, h: number, seed: number) {
  polygon(c, [[x+4,y],[x+w-6,y],[x+w,y+4],[x+w-2,y+h-2],[x+4,y+h],[x,y+h-5]], '#586b62');
  polygon(c, [[x+4,y],[x+w-6,y],[x+w-2,y+4],[x+w-4,y+h-5],[x+4,y+h-4],[x+2,y+4]], ['#a2aa87','#b5b596','#929e82'][seed % 3]);
  line(c, [[x+5,y+2],[x+w-8,y+2]], '#c6caac');
  if(seed%4===0) line(c, [[x+w-8,y+4],[x+w-12,y+8],[x+w-10,y+12]], '#7e8d76');
}
function pot(c: Ctx, x: number, y: number, flowers = true) {
  polygon(c, [[x-10,y-16],[x+10,y-16],[x+7,y],[x-7,y]], '#78543d');
  box(c,x-7,y-14,10,12,'#b8895b'); box(c,x-12,y-19,24,5,'#d1a56d');
  for(let i=0;i<3;i++) {
    const px=x-8+i*8; line(c,[[px,y-17],[px-2,y-30+i*2]],'#407b4f',3);
    box(c,px-7,y-25+i*2,8,4,'#699557');
    if(flowers){box(c,px-5,y-34+i*2,8,6,'#a27ab3');box(c,px-2,y-33+i*2,3,2,'#eee0a0');}
  }
}
function crate(c: Ctx,x:number,y:number,w=34,h=30) {
  box(c,x+3,y-h+3,w,h,'#594b35'); planks(c,x,y-h,w,h,true);
  box(c,x,y-h,w,4,'#dab47a'); box(c,x,y-4,w,4,'#78583b');
  line(c,[[x+3,y-6],[x+w-4,y-h+5]],'#e0b679',5);
}
function barrel(c:Ctx,x:number,y:number) {
  disc(c,x,y-18,17,23,'#614c38');
  for(let i=-12;i<=12;i+=6) box(c,x+i,y-33,4,32,WOOD[(i+12)/6%4]);
  disc(c,x,y-37,15,7,'#d5b47b'); disc(c,x,y-37,11,4,'#92754d');
  box(c,x-16,y-26,32,4,'#66736c');box(c,x-15,y-8,30,4,'#67756d');box(c,x-12,y-26,16,2,'#a0ac98');
}
function building(c: Ctx, b: VillageBuilding) {
  const {x,y,w,h,kind}=b; const base=y+h;
  // Side wall, foundation and porch keep all buildings in the same 3/4 projection.
  polygon(c,[[x+w-20,y+14],[x+w,y+2],[x+w,base],[x+w-20,base+8]],'#795e40');
  for(let sx=x;sx<x+w;sx+=34) stone(c,sx,base-20,32,25,Math.floor(sx/34));
  planks(c,x+4,y+40,w-28,h-60,kind==='storehouse'||kind==='forge',kind==='fisher');
  box(c,x+5,y+40,w-30,22,'#77694b');box(c,x+5,y+60,w-30,7,'#978253');
  for(const bx of [x+6,x+w-35]) {box(c,bx,y+48,10,h-58,'#715136');box(c,bx,y+48,3,h-58,'#c09a60');}
  planks(c,x-10,base-4,w+16,25,true,kind==='fisher');
  for(let i=0;i<3;i++) {box(c,x+w/2-35-i*6,base+23+i*6,70+i*12,6,'#786d51');box(c,x+w/2-35-i*6,base+23+i*6,70+i*12,2,'#cbbb8a');}
  // Roof shapes differ, while ridge/eave construction stays believable.
  const ridgeY=y-48-(kind==='townHall'?12:0), ridgeX=x+w*(kind==='garden'?.40:kind==='fisher'?.44:.51);
  const roof:Point[]=kind==='fisher'
    ? [[x-20,y+17],[x+32,y-15],[ridgeX,ridgeY],[x+w-28,y-27],[x+w+16,y+14],[x+w-1,y+62],[x+1,y+62]]
    :kind==='tea'||kind==='garden'
      ? [[x-23,y+18],[x+34,y-22],[ridgeX,ridgeY],[x+w-35,y-25],[x+w+18,y+12],[x+w-3,y+62],[x,y+62]]
      :[[x-22,y+10],[ridgeX,ridgeY],[x+w+19,y+10],[x+w-2,y+62],[x+1,y+62]];
  polygon(c,roof,'#324c3f');
  c.save(); c.beginPath(); roof.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.clip();
  const colors=kind==='forge'?['#635d50','#777060','#6b6558','#837865']:kind==='garden'||kind==='tea'?['#a28c62','#af996b','#95815b','#b3a076']:['#527762','#668a6b','#5d8065','#769570'];
  for(let row=0;row<9;row++) for(let col=0;col<w/26+3;col++) {
    const tx=x-30+col*27+(row%2)*13, ty=ridgeY+row*15;
    polygon(c,[[tx,ty],[tx+24,ty],[tx+28,ty+13],[tx+2,ty+13]],colors[(row*3+col)%4]);
    line(c,[[tx+3,ty+12],[tx+26,ty+12]],'#3f5c4b',2);
    line(c,[[tx+3,ty+2],[tx+19,ty+2]],kind==='forge'?'#969079':kind==='tea'||kind==='garden'?'#c0ac7b':'#8caa7d',2);
    if((col+row*3)%7===0) box(c,tx+17,ty+7,3,4,'#485f49');
  }
  c.restore();
  line(c,[[x-20,y+12],[ridgeX,ridgeY],[x+w+18,y+12]],kind==='forge'?'#928a6e':'#b3b07b',4);
  box(c,x,y+59,w,8,'#3e5140');box(c,x+3,y+59,w-6,2,'#98a270');
  // Deep eave, exposed rafters and staggered repair tiles anchor the roof to its walls.
  box(c,x+8,y+67,w-18,10,'#514a36');
  for(let rx=x+18;rx<x+w-14;rx+=47){box(c,rx,y+66,6,13,'#7e6746');box(c,rx+2,y+67,2,9,'#c9a877');}
  for(const [u,v] of [[.16,.24],[.68,.33],[.41,.55]] as const){
    const px=x+u*w,py=ridgeY+v*(y+56-ridgeY);
    box(c,px,py,24,3,kind==='forge'?'#aba18a':'#b1bd94');
    box(c,px+5,py+3,3,3,'#425a48');
  }
  // Recessed door with casing, ironwork and wear at the threshold.
  const dx=x+w/2-23;
  box(c,dx-6,base-80,58,78,'#5b4935');planks(c,dx,base-73,46,68,true);
  box(c,dx+3,base-72,4,62,'#715637');box(c,dx+36,base-37,4,4,'#d4cc87');
  for(const hinge of [base-65,base-20]) box(c,dx+2,hinge,10,3,'#535d4e');
  for(const wx of [x+33,x+w-94]) {
    box(c,wx-6,y+83,64,52,'#614e38');box(c,wx,y+87,50,41,'#3e6665');
    box(c,wx+3,y+90,43,32,'#81b8ad');box(c,wx+4,y+91,17,9,'#bfd9be');
    box(c,wx+23,y+87,4,42,'#d6bb7e');box(c,wx,y+106,49,4,'#d6bb7e');
    box(c,wx-8,y+131,68,5,'#705938');box(c,wx-8,y+131,68,2,'#d9bc81');
    planks(c,wx-16,y+88,9,43,true);planks(c,wx+55,y+88,9,43,true);
  }
  // The porch shades its supports; the open center always reads as the entrance.
  const porchY=base-96;
  for(const px of [x+19,x+w-34]) {
    box(c,px,porchY+7,8,96,'#634c36');box(c,px,porchY+7,2,93,'#d8ac70');
    line(c,[[px+4,porchY+31],[px+20,porchY+11]],'#806447',4);
  }
  planks(c,x+6,porchY,w-24,18,true);
  box(c,x+6,porchY+18,w-24,8,'#6e5c41');
  for(const [rx,rw] of [[x+18,w/2-57],[x+w/2+39,w/2-71]]) {
    for(let p=rx;p<rx+rw;p+=19) box(c,p,base-32,4,31,'#866541');
    box(c,rx,base-34,rw,4,'#dfbb7f');
  }
  pot(c,x+34,base+6);pot(c,x+w-35,base+8,kind!=='forge');
  box(c,dx-25,base-103,94,22,'#533f2f');box(c,dx-23,base-101,90,18,b.accent);
  c.font='bold 8px monospace';c.textAlign='center';c.fillStyle='#fff0be';c.fillText(b.label,x+w/2,base-88,86);
  if(kind==='townHall') {
    box(c,ridgeX-3,ridgeY-46,6,46,'#b59863');polygon(c,[[ridgeX+3,ridgeY-45],[ridgeX+40,ridgeY-37],[ridgeX+27,ridgeY-21],[ridgeX+3,ridgeY-24]],'#977bab');
    disc(c,ridgeX,y+4,17,17,'#c8bd8a');disc(c,ridgeX,y+4,12,12,'#4e695b');line(c,[[ridgeX,y-5],[ridgeX,y+4],[ridgeX+8,y+7]],'#efe0a8',2);
    box(c,x+104,base-103,w-205,7,'#6c503a');
    for(let bx=x+111;bx<x+w-105;bx+=20){box(c,bx,base-95,5,26,'#a68152');box(c,bx+2,base-95,2,26,'#e0bd7d');}
    box(c,x+116,base-75,w-230,4,'#d9bc7c');
  } else if(kind==='forge') {
    for(let i=0;i<5;i++) {stone(c,x+w-70,y-65+i*16,36,16,i);}
    box(c,x+w-75,y-73,46,9,'#434b43');box(c,x+w-69,y-69,34,4,'#161e1c');
    box(c,x+w-79,y+17,46,17,'#4a5144');
    for(let i=0;i<3;i++){const sx=x+46+i*23;box(c,sx,base-118,4,28,'#a9bcb4');box(c,sx-6,base-94,16,4,'#d0b278');box(c,sx,base-90,4,8,'#6a4936');}
    for(const [fx,fy] of [[x+19,y+86],[x+w-57,y+72],[x+w-112,base-115]] as const){
      box(c,fx,fy,30,3,'#5c5443');box(c,fx+5,fy+4,21,3,'#73634d');
    }
    box(c,x+w-97,base-135,31,42,'#5b4b3b');box(c,x+w-92,base-130,21,30,'#796145');
  } else if(kind==='fisher') {
    for(let i=0;i<6;i++) line(c,[[x+180+i*7,y+73],[x+200+i*7,y+133]],'#aaad85');
    for(let i=0;i<6;i++) line(c,[[x+183,y+80+i*9],[x+234,y+80+i*9]],'#d4c9a0');
    box(c,x+14,base-94,26,13,'#617f77');box(c,x+17,base-91,20,7,'#9fc4b5');
    line(c,[[x+44,base-96],[x+44,base-51]],'#917953',3);
  } else if(kind==='tea') {
    polygon(c,[[x+5,y+58],[x+104,y+58],[x+118,y+82],[x-3,y+82]],'#a58ab5');
    for(let i=0;i<4;i++) box(c,x+8+i*28,y+60,10,22,'#dfd3ae');
    for(let i=0;i<3;i++){box(c,x+w-70+i*13,base-93,9,8,'#ad8654');box(c,x+w-70+i*13,base-95,9,3,'#e1c291');}
  } else if(kind==='garden') {
    for(let i=0;i<4;i++) {box(c,x+8+i*7,y+74+i*17,8,14,LEAVES[2]);box(c,x+5+i*7,y+79+i*17,4,4,'#a27bad');}
    line(c,[[x+w-52,base-118],[x+w-42,base-78],[x+w-35,base-43]],'#54744d',3);
    for(const [gx,gy] of [[x+w-47,base-100],[x+w-31,base-73],[x+w-42,base-53]] as const){box(c,gx,gy,8,6,'#6b9a58');box(c,gx+4,gy-4,5,5,'#af87bb');}
  } else {
    crate(c,x+w-82,base-2);crate(c,x+w-62,base-31,26,23);
    box(c,x+25,base-115,48,5,'#6c5137');box(c,x+29,base-112,5,25,'#b58d59');
    for(let i=0;i<3;i++){box(c,x+37+i*10,base-105,6,10,'#907044');box(c,x+39+i*10,base-108,2,4,'#ddba74');}
  }
}

function palm(c: Ctx, x: number, y: number, scale: number, seed: number) {
  c.save();c.translate(q(x),q(y));c.scale(scale,scale);
  polygon(c,[[-5,0],[7,0],[3,-45],[-8,-80],[-13,-78],[-4,-44]],'#65553b');
  for(let i=0;i<10;i++){box(c,-6-i*.7,-i*8,8,5,i%2?'#b39962':'#928252');}
  const cx=-9,cy=-84;
  const tips:Point[]=[[-72,-76],[-61,-116],[-25,-135],[23,-130],[55,-99],[60,-68],[-48,-50],[26,-47]];
  tips.forEach(([tx,ty],i)=>{
    const bend=seed%3*3;
    polygon(c,[[cx,cy],[cx+(tx-cx)*.50,cy+(ty-cy)*.30-10],[tx,ty+bend],[tx-5,ty+10+bend],[cx+(tx-cx)*.50,cy+(ty-cy)*.55+4]],LEAVES[i%2+1]);
    line(c,[[cx,cy],[cx+(tx-cx)*.52,cy+(ty-cy)*.43],[tx-3,ty+bend]],LEAVES[3],2);
    for(let j=1;j<5;j++){const t=j/6;const px=cx+(tx-cx)*t,py=cy+(ty-cy)*t;line(c,[[px,py],[px-5,py+8]],LEAVES[2],2);}
  });
  disc(c,-12,-78,5,5,'#b1995c');disc(c,-3,-76,5,6,'#6d6041');c.restore();
}
function tree(c:Ctx,x:number,y:number,seed:number,scale=1) {
  c.save();c.translate(q(x),q(y));c.scale(scale,scale);
  polygon(c,[[-13,0],[-4,-30],[-7,-78],[4,-84],[12,-29],[18,0]],'#5d5037');
  box(c,-3,-69,6,64,'#a28751');line(c,[[-3,-25],[-23,-52],[-20,-69]],'#6c603d',6);
  line(c,[[5,-43],[25,-62],[31,-70]],'#654e36',6);
  // The crown is cut from irregular leaf masses, not repeated circles.
  const masses:Point[]=seed%2
    ? [[-34,-83],[0,-110],[38,-91],[22,-64],[-12,-61]]
    : [[-30,-85],[4,-113],[40,-90],[15,-68],[-13,-62]];
  const leafMarks:Point[]=[[-13,-9],[-4,-16],[10,-13],[19,-6],[-19,1],[-7,3],[6,-1],[16,8],[-10,14],[5,15]];
  masses.forEach(([mx,my],i)=>{
    const r=27+(i+seed)%3*4,shift=(seed+i)%3*2;
    polygon(c,[[mx-r+8,my-13],[mx-r+2,my-4],[mx-r,my+7],[mx-r+9,my+15],[mx-11,my+21],[mx+11,my+20],[mx+r-5,my+13],[mx+r,my+1],[mx+r-6,my-12],[mx+14,my-21],[mx-3,my-25],[mx-r+13,my-21]],LEAVES[0]);
    polygon(c,[[mx-r+10,my-12],[mx-r+6,my-2],[mx-r+12,my+10],[mx-8,my+16],[mx+10,my+13],[mx+r-10,my+8],[mx+r-7,my-6],[mx+12,my-17],[mx-5,my-20]],LEAVES[1]);
    for(const [j,[lx,ly]] of leafMarks.entries()){
      const px=mx+lx+shift,py=my+ly+(i%2)*2;
      polygon(c,[[px-5,py-2],[px,py-7],[px+7,py-5],[px+9,py+1],[px+2,py+3],[px-4,py+2]],LEAVES[2+(j+i)%2]);
      if(j%3===0) box(c,px-1,py-7,6,2,LEAVES[4]);
    }
    if(seed%2===0&&i%2===0) {box(c,mx+4,my+4,6,6,'#d9ba63');box(c,mx+4,my+3,4,2,'#ede3a0');}
  });c.restore();
}
function coastX(y:number) { return 146+Math.sin(y/122)*12+Math.sin(y/53)*5; }
function grassX(y:number) { return 380+Math.sin(y/117)*17+Math.sin(y/39)*7; }
const TRAILS:ReadonlyArray<{points:readonly Point[];width:number}>=[
  {points:[[990,1400],[982,1180],[1010,1000],[992,895]],width:126},
  {points:[[713,776],[560,753],[430,785],[345,778]],width:88},
  {points:[[1268,610],[1432,510],[1600,405],[1780,294],[2000,248]],width:76},
  {points:[[760,610],[640,548],[560,532]],width:60},
  {points:[[1245,890],[1395,980],[1500,1045]],width:56},
  {points:[[765,910],[650,1030],[540,1070]],width:54},
  {points:[[1000,420],[1000,525]],width:100},
];
function segmentDistance(x:number,y:number,a:Point,b:Point){const dx=b[0]-a[0],dy=b[1]-a[1];const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);}
function pathDistance(x:number,y:number){let result=Infinity;for(const path of TRAILS)for(let i=1;i<path.points.length;i++)result=Math.min(result,segmentDistance(x,y,path.points[i-1],path.points[i])-path.width/2);return result;}
function inSquare(x:number,y:number){
  const edge = 1 + .035*Math.sin(x/37) + .025*Math.sin(y/29);
  return Math.pow((x-995)/385,4)+Math.pow((y-730)/238,4)<edge;
}
// Four drawn variants per material. These are stamps, not a noise texture:
// each mark describes grass blades, trampled sand, shells or a water ripple.
function surfaceStamp(c:Ctx,x:number,y:number,material:'grass'|'path'|'sand'|'water',variant:number){
  if(material==='grass'){
    const blades=[
      [[4,22],[21,6],[26,25]], [[7,9],[25,16],[11,27]],
      [[4,16],[18,25],[27,5]], [[10,5],[23,22],[5,27]],
    ][variant];
    for(const [bx,by] of blades){
      box(c,x+bx,y+by,2,7,'#587e4e');
      box(c,x+bx-3,y+by+3,3,3,'#6c9658');
      box(c,x+bx+2,y+by+2,4,3,'#b6bf78');
    }
    if(variant===1||variant===3){
      box(c,x+16,y+12,5,3,'#789e5a');
      box(c,x+19,y+9,2,3,'#d2ce90');
    }
  } else if(material==='path'){
    const marks=[
      [[5,9,13],[23,24,6]],[[10,24,15],[3,4,8]],
      [[4,21,9],[19,8,11]],[[12,5,13],[4,27,8]],
    ][variant];
    for(const [mx,my,mw] of marks){
      box(c,x+mx,y+my,mw,2,'#b5a074');
      box(c,x+mx+3,y+my-2,Math.max(3,mw-6),2,'#dec997');
    }
  } else if(material==='sand'){
    const shell=([[9,23],[25,8],[7,7],[24,24]] as const)[variant];
    box(c,x+shell[0],y+shell[1],6,3,'#f0e4bc');
    box(c,x+shell[0]+2,y+shell[1]+3,5,2,'#adac8a');
    box(c,x+4+(variant%2)*11,y+12,11,2,'#c9bc92');
  } else {
    const yy=variant%2?10:22;
    box(c,x+4,y+yy,16,2,'#76b3b5');
    box(c,x+12,y+yy+3,13,2,'#9ccbc5');
  }
}
function terrain(buildings:VillageBuilding[]) {
  const {cv,c}=canvas(W,H);
  box(c,0,0,W,H,'#8fac68');
  // Material boundaries are painted first; individual stamps follow on clean interiors.
  for(let y=0;y<H;y+=8)for(let x=0;x<W;x+=8){
    const shore=coastX(y),edge=grassX(y),d=pathDistance(x,y);
    let color='#8eaa68';
    if(x<shore-94) color='#478ea0';
    else if(x<shore-40) color='#579eaa';
    else if(x<shore) color='#81bab6';
    else if(x<shore+18) color='#aaaF8b';
    else if(x<shore+42) color='#c5bd91';
    else if(x<edge) color='#decfa2';
    else if(d<0 || inSquare(x,y)) color='#d5c18d';
    else if(x>1400&&y>750) color='#91ad6d';
    box(c,x,y,8,8,color);
    const squareEdge=!inSquare(x,y)&&(inSquare(x+8,y)||inSquare(x-8,y)||inSquare(x,y+8)||inSquare(x,y-8));
    if(x>edge&&((d>-5&&d<8)||squareEdge)&&((x/8+y/8)%3!==0)&&!inSquare(x,y)) {
      box(c,x,y,3,5,'#62834e');box(c,x+2,y-3,2,7,'#a6b976');
    }
  }
  for(let y=0,ty=0;y<H-40;y+=40,ty++)for(let x=0,tx=0;x<W-40;x+=40,tx++){
    const placement=hash(tx,ty,41);
    if(placement<.26)continue;
    const variant=Math.floor(hash(tx,ty,13)*4),sx=x+q((hash(tx,ty,19)-.5)*14),sy=y+q((hash(tx,ty,29)-.5)*14);
    const shore=coastX(sy+16),edge=grassX(sy+16),d=pathDistance(sx+16,sy+16);
    if(sx+32<shore-46) surfaceStamp(c,sx,sy,'water',variant);
    else if(sx>shore+38&&sx+32<edge-8) surfaceStamp(c,sx,sy,'sand',variant);
    else if(sx>edge+24&&d>36&&!inSquare(sx+16,sy+16)) surfaceStamp(c,sx,sy,'grass',variant);
    else if(sx>edge+24&&(d<-34||inSquare(sx+16,sy+16))) surfaceStamp(c,sx,sy,'path',variant);
  }
  // Taller grass gathers in sheltered edges, leaving the traversable lane readable.
  for(const [px,py,pw] of [[488,652,67],[559,669,49],[1294,457,58],[1480,456,83],
    [640,981,51],[760,1052,70],[827,1142,48],[1118,1053,78],[1289,1117,63],
    [472,1218,69],[565,1263,46],[1437,1201,74],[1748,1130,57]] as const){
    polygon(c,[[px-6,py+10],[px+7,py+3],[px+pw-13,py],[px+pw+4,py+9],[px+pw-6,py+23],[px+14,py+24]],'#83a366');
    for(const offset of [8,27,49]){
      if(offset>pw-5)continue;
      box(c,px+offset,py+7,2,11,'#5c874f');
      box(c,px+offset-4,py+13,5,3,'#6e9958');
      box(c,px+offset+1,py+5,4,3,'#b9c47c');
    }
  }
  // Worn islands have deliberate placement along traffic and gathering zones.
  for(const [px,py,pw] of [[715,603,38],[786,571,23],[850,694,43],[771,759,26],[855,825,35],
    [927,604,20],[1078,589,32],[1156,750,39],[1202,812,24],[1092,878,42],
    [935,883,26],[1014,547,28],[1272,699,30],[720,845,21],[1246,873,18]] as const){
    polygon(c,[[px-3,py+8],[px+5,py+2],[px+pw-8,py],[px+pw+2,py+6],[px+pw-5,py+13],[px+8,py+14]],'#c4ad7e');
    box(c,px+7,py+2,Math.max(8,pw-20),2,'#e0cd9d');
  }
  for(const [px,py,pw,ph] of [[803,632,72,23],[884,717,58,18],[1110,715,73,20],[1203,776,55,17],
    [793,845,47,18],[1061,852,61,22],[943,570,63,18],[727,733,45,16]] as const){
    polygon(c,[[px-7,py+ph/2],[px+8,py+2],[px+pw-16,py-2],[px+pw+5,py+ph/3],[px+pw-7,py+ph],[px+12,py+ph+3]],'#c9b481');
    line(c,[[px+10,py+4],[px+pw-18,py+2]],'#ddc896',2);
  }
  // Low, hand-placed stepping stones link the well to the hall, market and homes.
  for(const [sx,sy,sw] of [[963,564,22],[994,575,24],[1017,587,17],[950,619,20],
    [1058,674,19],[1084,690,25],[1113,707,18],[936,839,22],[966,856,24],
    [1030,844,20],[1060,829,17],[864,731,20],[841,750,18]] as const){
    stone(c,sx,sy,sw,11,Math.floor((sx+sy)/17)%3);
  }
  // Walk-worn footsteps follow specific routes, not a full-map scatter.
  for(const path of TRAILS)for(let i=1;i<path.points.length;i++){
    const a=path.points[i-1],b=path.points[i],distance=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let s=18;s<distance;s+=27){const t=s/distance,off=(Math.floor(s/27)%2?6:-6);const px=a[0]+(b[0]-a[0])*t,py=a[1]+(b[1]-a[1])*t;box(c,px+off,py,3,6,'#b9a575');}
  }
  for(const b of buildings){
    const bx=b.x+b.w/2,by=b.y+b.h;
    for(let i=0;i<5;i++)stone(c,bx-27+(i%2)*4,by+36+i*13,48-i*3,11,i);
    for(let i=0;i<5;i++){const px=b.x+12+i*(b.w-20)/5;box(c,px,by+10,2,8,'#648350');box(c,px-4,by+15,8,2,'#7d9658');}
  }
  // Masonry paving around the communal water source.
  for(let y=670;y<=850;y+=24)for(let x=895;x<1090;x+=32){
    const px=x+(Math.floor(y/24)%2)*13,dist=Math.hypot((px-990), (y-760)*1.2);
    if(dist<96)stone(c,px,y,28,21,Math.floor(x+y)%7);
  }
  // Pier deck and fishing yard retain the previous footprint.
  planks(c,116,728,250,82,true,true);
  for(const px of [125,345]) {box(c,px,718,10,108,'#695e43');box(c,px-4,718,18,4,'#baae7d');}
  for(const [x,y] of [[206,420],[274,520],[226,880],[315,940],[238,1280]]){box(c,x,y,10,4,'#f1e7c7');box(c,x+3,y-2,5,2,'#f8efd5');box(c,x+3,y+4,7,2,'#b8ab87');}
  for(const [x,y] of [[245,340],[285,680],[220,1010]]){disc(c,x,y,28,12,'#b4b38a');disc(c,x-2,y-2,22,7,'#8cb7ab');line(c,[[x-12,y-5],[x+5,y-5]],'#dde1b8');}
  return cv;
}

function bench(c:Ctx,x:number,y:number,w=74){
  box(c,x+5,y-4,6,14,'#514b36');box(c,x+w-12,y-4,6,14,'#514b36');
  planks(c,x,y-14,w,17);planks(c,x,y-39,w,14);box(c,x+6,y-30,5,24,'#775c3d');box(c,x+w-12,y-30,5,24,'#775c3d');
}
function fence(c:Ctx,x:number,y:number,w:number){
  box(c,x,y-24,w,5,'#685a3d');box(c,x,y-23,w,2,'#bcab72');
  box(c,x,y-10,w,5,'#836d45');
  for(let i=0;i<w;i+=32){polygon(c,[[x+i,y],[x+i,y-32],[x+i+4,y-36],[x+i+9,y-32],[x+i+9,y]],'#7d6841');box(c,x+i,y-30,3,29,'#c3ad76');}
}
function fountain(c:Ctx){
  disc(c,990,777,62,36,'#4f685e');disc(c,990,765,62,37,'#9baa8b');
  for(let i=0;i<12;i++){const a=i*Math.PI/6;stone(c,982+Math.cos(a)*54,757+Math.sin(a)*28,17,15,i);}
  disc(c,990,762,49,27,'#507e7c');disc(c,988,758,45,22,'#81b7b0');
  box(c,981,711,18,52,'#60796b');box(c,981,711,6,51,'#c6c9a3');
  disc(c,990,713,29,13,'#667f6f');disc(c,990,708,29,10,'#c5caa6');disc(c,990,707,22,6,'#8cb4a5');
  box(c,986,685,8,21,'#b9c9a4');box(c,986,685,3,21,'#f0e8b9');
}
function market(c:Ctx){
  const x=1110,y=620;
  for(const dx of [8,139]){box(c,x+dx,y-17,7,97,'#554f36');box(c,x+dx,y-17,2,97,'#be995f');}
  polygon(c,[[x-8,y+17],[x+24,y-22],[x+142,y-22],[x+165,y+17]],'#514e3b');
  for(let i=0;i<7;i++)polygon(c,[[x+24+i*17,y-20],[x+41+i*17,y-20],[x+16+i*24,y+17],[x-8+i*24,y+17]],i%2?'#a089ac':'#e0cd93');
  for(let i=0;i<7;i++){box(c,x-8+i*24,y+17,24,9,i%2?'#7c6888':'#b9a972');box(c,x-6+i*24,y+18,19,2,i%2?'#c2a8c7':'#efdeb0');}
  planks(c,x,y+48,158,20);box(c,x+7,y+70,7,13,'#655135');box(c,x+141,y+70,7,13,'#655135');
  for(let i=0;i<3;i++){box(c,x+8+i*48,y+31,42,18,'#6f5638');box(c,x+10+i*48,y+43,38,4,'#cfaa6b');for(let f=0;f<5;f++){disc(c,x+15+i*48+f*6,y+35-(f%2)*4,5,4,i===0?'#dec07a':i===1?'#7eac62':'#b292bd');box(c,x+14+i*48+f*6,y+31-(f%2)*4,3,2,'#ece0a6');}}
  crate(c,x-42,y+75);barrel(c,x+189,y+63);
}
function forge(c:Ctx){
  for(let row=0;row<5;row++)for(let col=0;col<3;col++)stone(c,1328+col*17+(row%2)*3,642+row*16,17,16,row+col);
  box(c,1338,671,36,46,'#3d3c31');box(c,1344,680,25,35,'#6e4830');box(c,1332,721,50,7,'#515447');
  // Anvil with horn and sloped waist, mounted on an end-grain stump.
  barrel(c,1329,795);polygon(c,[[1298,754],[1345,754],[1364,747],[1357,762],[1339,766],[1337,780],[1348,783],[1348,789],[1313,789],[1313,783],[1322,779],[1320,766],[1302,762]],'#455851');
  line(c,[[1299,754],[1345,754],[1361,748]],'#b4c5b5',3);
  for(let i=0;i<5;i++){box(c,1720+i*8,700-i*9,45,9,'#6b5034');disc(c,1724+i*8,704-i*9,4,4,'#c3a070');}
  for(const [x,y,r] of [[1740,630,15],[1770,650,18],[1730,658,12],[1760,615,11]]){polygon(c,[[x-r,y],[x-r/2,y-r],[x+r/2,y-r+3],[x+r,y],[x+r/2,y+9],[x-r/2,y+8]],'#536b66');line(c,[[x-r,y],[x-r/2,y-r],[x+r/2,y-r+3]],'#97aba0',3);}
  planks(c,1710,750,82,31);line(c,[[1710,769],[1689,798]],'#7d613b',5);
  for(const x of [1726,1781]){disc(c,x,790,14,14,'#3c4c3e');disc(c,x,790,9,9,'#a29467');line(c,[[x-8,782],[x+8,798]],'#514d38',3);}
  box(c,1285,802,54,6,'#98754b');box(c,1292,793,9,26,'#574f37');box(c,1285,790,24,7,'#8b9c90');
  barrel(c,1810,748);crate(c,1732,843);
}

function person(c:Ctx,x:number,y:number,time:number,shirt:string,role='resident',walking=false,facing=1,direction:FacingDirection='down'){
  const character=['jeff','ketlin','shorum','kuon','mikah','jangi','mibah','player'].includes(role)?role:role==='smith'?'jeff':role==='child'?(x<1100?'jangi':'mibah'):role==='fisher'?'mikah':role==='seller'?'ketlin':role==='sweeper'?'kuon':role==='carrier'?'shorum':'kuon';
  const size=character==='shorum'?4.3:character==='jeff'?3.7:character==='ketlin'?3.5:['jangi','mibah'].includes(character)?2.5:3.2;
  const bob=walking?Math.sin(time*7)*2:Math.sin(time*1.7+x*.023)*.7;
  drawStoryContact(c,x,y+1,character==='shorum'?35:character==='jeff'?29:24);
  drawStoryCharacter(c,x,y+bob,time,shirt,character,walking,facing,size,direction);
  if(role==='carrier')drawStoryContact(c,x-25,y+1,12);
  if(role==='sweeper'){
    line(c,[[x+12,y-25],[x+28,y+3]],'#a38757',3);
    polygon(c,[[x+24,y-1],[x+33,y-2],[x+42,y+8],[x+29,y+10]],'#b6a26b');
  }
  if(role==='jeff'){
    const lift=Math.round(Math.sin(time*2.4)*3);
    line(c,[[x+16,y-26-lift],[x+27,y-41-lift]],'#8f6b42',3);
    box(c,x+21,y-45-lift,14,5,'#9aafa4');
  }
}
const RESIDENTS = [
  {x:830,y:630,shirt:'#628c91',role:'kuon'}, {x:870,y:650,shirt:'#967999',role:'mikah'},
  {x:1172,y:671,shirt:'#528365',role:'ketlin'}, {x:1225,y:718,shirt:'#927da3',role:'resident'},
  {x:1085,y:878,shirt:'#699771',role:'jangi'}, {x:1128,y:860,shirt:'#ab8495',role:'mibah'},
  {x:1305,y:813,shirt:'#6f8b86',role:'jeff'}, {x:310,y:710,shirt:'#688c83',role:'mikah'},
  {x:625,y:1180,shirt:'#948968',role:'kuon'}, {x:845,y:907,shirt:'#9a8968',role:'resident'},
  {x:1648,y:896,shirt:'#a17655',role:'shorum'},
];
function sprite(x:number,y:number,w:number,h:number,depth:number,paint:Paint):Sprite{
  const {cv,c}=canvas(w,h);c.translate(-x,-y);paint(c);
  const {cv:shadow,c:s}=canvas(w,h);s.drawImage(cv,0,0,w,h);s.globalCompositeOperation='source-in';box(s,0,0,w,h,'#233f35');
  return {image:cv,shadow,x,y,w,h,depth};
}
function projectShadow(c:Ctx,s:Sprite,alpha=.24){
  // Project the actual silhouette onto the ground towards SE. Contact is a
  // shorter, darker projection; the far shadow is a lighter stepped band.
  for(const [length,flatten,opacity] of [[.39,.23,alpha*.39],[.32,.19,alpha*.8],[.08,.045,alpha*1.35]]) {
    c.save();c.globalAlpha=opacity;c.transform(1,0,-length,-flatten,length*s.depth,(1+flatten)*s.depth);
    c.drawImage(s.shadow,s.x,s.y,s.w,s.h);c.restore();
  }
}
function furniture(c:Ctx){
  bench(c,731,650,72);bench(c,1172,868,88);bench(c,782,908,66);
  for(const [x,y] of [[665,550],[1280,565],[720,1090],[1370,420],[921,822],[1060,804]])pot(c,x,y);
  crate(c,675,1115);barrel(c,650,1110);barrel(c,1298,409);
  // Notice board and bell: community facilities beside the town hall approach.
  for(const x of [725,781])box(c,x,430,7,66,'#65573b');
  planks(c,720,425,74,42);box(c,728,433,18,23,'#e0d4a8');box(c,751,435,15,17,'#b4c5ab');box(c,772,431,15,25,'#d9c093');
  for(let i=0;i<3;i++)box(c,731,439+i*5,11,2,'#998967');
  box(c,1257,402,7,62,'#705c3d');line(c,[[1259,405],[1284,405],[1284,419]],'#6b6450',4);
  polygon(c,[[1278,418],[1289,418],[1292,435],[1274,435]],'#b7aa70');box(c,1273,435,20,4,'#e0ce90');
  // Fishing gear: fixed meshes, clear tools, no random detail scatter.
  for(let i=0;i<6;i++){line(c,[[250+i*7,860],[263+i*7,905]],'#9f9d78');line(c,[[250,861+i*8],[298,861+i*8]],'#c3b78b');}
  crate(c,306,878);crate(c,332,916,40,28);
  for(let i=0;i<3;i++){disc(c,341+i*10,893,7,3,'#a6b6a5');box(c,345+i*10,891,4,2,'#ced8b8');}
  line(c,[[340,860],[379,906]],'#715f43',4);polygon(c,[[373,899],[381,897],[391,912],[383,916]],'#c3a373');
  // Clothes line and hammock belong to the southern gardens.
  for(const x of [399,607])box(c,x,849,6,41,'#755d3d');line(c,[[402,854],[504,863],[610,853]],'#615e43');
  ['#ba9bbe','#e0d0a2','#7daba5','#c5c8a0'].forEach((col,i)=>{polygon(c,[[420+i*43,858],[444+i*43,861],[446+i*43,886],[422+i*43,883]],col);box(c,422+i*43,858,2,5,'#77633f');});
  line(c,[[1500,1190],[1500,1235]],'#665839',6);line(c,[[1635,1190],[1635,1235]],'#665839',6);
  polygon(c,[[1500,1200],[1567,1220],[1635,1199],[1610,1230],[1566,1238],[1521,1230]],'#a793b4');
  line(c,[[1502,1201],[1566,1225],[1633,1200]],'#e0d2ac',3);
}
function boat(c:Ctx){
  polygon(c,[[31,867],[65,853],[122,874],[108,918],[78,931],[39,917]],'#4b5f4e');
  polygon(c,[[35,867],[66,857],[117,876],[104,913],[78,925],[43,913]],'#987c4e');
  polygon(c,[[43,876],[66,866],[108,881],[97,908],[77,917],[50,907]],'#605d41');
  for(const y of [879,895,910])box(c,49,y,50,5,'#cab07a');
  box(c,65,829,5,75,'#665a3a');polygon(c,[[72,833],[103,872],[72,872]],'#e0d7b5');line(c,[[72,833],[72,872],[103,872]],'#a69a72',2);
}
function animal(c:Ctx,x:number,y:number,dog:boolean,t:number){
  const step=q(Math.sin(t*5)*2);const col=dog?'#b49563':'#e2d9b1';
  box(c,x-12,y-10,26,17,'#4e5740');box(c,x-10,y-11,23,14,col);
  box(c,x+8,y-19,12,14,col);box(c,x+16,y-15,2,2,'#364a3a');
  box(c,x-8,y+5+step,4,7,'#715d3d');box(c,x+8,y+5-step,4,7,'#715d3d');
  if(dog){box(c,x+6,y-19,5,9,'#77613e');line(c,[[x-12,y-6],[x-19,y-15]],col,4);}else box(c,x+18,y-13,7,3,'#c3a459');
}

export const KYUNETH_TREES:readonly (readonly [number,number,number])[]=[[470,275,1.05],[615,300,.86],[1270,185,.82],[1605,175,1.06],[1740,895,.92],[525,900,.78],[717,584,.67],[1274,944,.78],[485,1300,.92],[1790,1187,1.03]];
export const KYUNETH_FENCES:readonly (readonly [number,number,number])[]=[[440,286,245],[1260,135,360],[520,1160,185]];

export function createKyunethArt(buildings:VillageBuilding[],palms:ReadonlyArray<readonly [number,number,number]>,flowers:readonly Point[]){
  const floor=terrain(buildings);
  const objects:Sprite[]=[];
  const add=(x:number,y:number,w:number,h:number,depth:number,paint:Paint)=>objects.push(sprite(x,y,w,h,depth,paint));
  for(const b of buildings)add(b.x-30,b.y-120,b.w+66,b.h+164,b.y+b.h+8,c=>building(c,b));
  palms.forEach(([x,y,scale],i)=>add(x-90*scale,y-155*scale,180*scale,170*scale,y,c=>palm(c,x,y,scale,i)));
  KYUNETH_TREES.forEach(([x,y,scale],i)=>add(x-90*scale,y-155*scale,180*scale,170*scale,y,c=>tree(c,x,y,i,scale)));
  add(720,405,90,96,496,c=>{ // board in its own depth group
    for(const x of [725,781])box(c,x,430,7,66,'#65573b');planks(c,720,425,74,42);box(c,728,433,18,23,'#e0d4a8');box(c,751,435,15,17,'#b4c5ab');box(c,772,431,15,25,'#d9c093');
  });
  add(925,674,132,147,800,fountain);
  add(1060,590,268,126,704,market);
  for(const [x,y,w,h,depth] of [[1324,638,62,94,728],[1294,742,74,56,795],[1714,655,95,57,710],[1710,594,80,80,666],[1680,744,119,64,803],[1280,788,63,35,820],[1790,703,40,52,748],[1728,810,43,37,843]]) {
    add(x,y,w,h,depth,c=>{c.save();c.beginPath();c.rect(x,y,w,h);c.clip();forge(c);c.restore();});
  }
  // Smaller prop groups keep their own depth so they cannot cover the player
  // according to an unrelated object on the opposite side of the map.
  for(const [x,y,w,h] of [[729,609,78,54],[1170,827,94,55],[780,867,73,55],[650,512,30,42],[1265,527,30,42],[705,1052,30,42],[1355,382,30,42],[906,784,30,42],[1045,766,30,42],[633,1068,79,52],[1281,368,35,46],[1254,399,44,68],[247,851,55,58],[304,845,36,37],[330,884,43,35],[338,852,56,68],[393,845,226,52],[1490,1180,160,65]]) {
    add(x,y,w,h,y+h-5,c=>{c.save();c.beginPath();c.rect(x,y,w,h);c.clip();furniture(c);c.restore();});
  }
  add(20,822,117,117,931,boat);
  // Authored kitchen/flower beds: useful garden groups, not random obstacles.
  for(const [x,y,w] of [[675,567,94],[1178,550,104],[694,940,78],[1480,1180,82]]) {
    add(x-5,y-30,w+10,52,y+18,c=>{
      box(c,x,y,w,18,'#6c6b43');box(c,x,y+16,w,4,'#ac9b6a');
      for(let i=0;i<w-8;i+=14){
        const py=y-5+(i%3)*2;disc(c,x+i+7,py,10,8,LEAVES[1]);
        box(c,x+i+2,py-6,8,4,LEAVES[3]);box(c,x+i+5,py-10,6,5,'#ae8bbd');
        box(c,x+i+7,py-9,2,2,'#e7d9a5');
      }
    });
  }
  add(1870,110,94,236,340,c=>{
    for(const x of [1875,1936]){planks(c,x,120,20,220,true);box(c,x-4,116,28,6,'#b3a16f');}
    planks(c,1875,120,82,17);box(c,1911,177,12,78,'#855760');
  });
  for(const [x,y,w] of KYUNETH_FENCES)add(x-2,y-40,w+8,46,y,c=>fence(c,x,y,w));
  // Flowers stay on the ground layer; the arrangement follows authored beds.
  const ground=floor.getContext('2d')!;ground.save();ground.setTransform(.5,0,0,.5,0,0);
  flowers.forEach(([x,y],i)=>{for(let j=0;j<3;j++){const px=x+j*6,py=y+(j%2)*5;box(ground,px,py,2,10,'#456e43');box(ground,px-2,py-2,6,5,i%4?'#a482b2':'#ded2a3');box(ground,px,py-1,2,2,'#ece1a3');}});
  ground.restore();
  // Background continuity: tree crowns extend beyond the existing world edge.
  for(const [x,y,i] of [[500,38,3],[1710,55,4],[1959,740,5],[1900,1390,6],[425,1420,7]])add(x-94,y-170,188,190,y,c=>tree(c,x,y,i,1.15));
  const shadowLayer=canvas(W,H);objects.forEach(s=>projectShadow(shadowLayer.c,s));
  const residents=RESIDENTS.map((r,i)=>sprite(r.x-27,r.y-52,58,76,r.y+18,c=>person(c,r.x,r.y,i,r.shirt,r.role)));
  residents.forEach(s=>projectShadow(shadowLayer.c,s,.16));
  const playerImage=sprite(-28,-54,60,83,20,c=>person(c,0,0,0,'#377b73','player'));
  const carrierImage=sprite(-28,-54,60,83,20,c=>person(c,0,0,0,'#788f69','carrier'));
  const petImages=[true,false].map(dog=>sprite(-25,-24,55,40,12,c=>animal(c,0,0,dog,0)));
  const foreground=objects.filter(s=>s.depth>=1370);const middle=objects.filter(s=>s.depth<1370);
  return {
    draw(c:Ctx,time:number,player:Walker){
      c.imageSmoothingEnabled=false;c.drawImage(floor,0,0,W,H);
      // Quiet moving water and shoreline foam, in stepped pixels.
      for(let y=10;y<H;y+=49){const tide=q(Math.sin(time*.8+y*.017)*5);const edge=coastX(y);
        box(c,edge-9+tide,y,12,2,'#c2d9c5');box(c,edge-5+tide,y+2,10,2,'#a4cfc2');
        box(c,26+((Math.floor(time*5)+y)%67),y+19,18,2,'#78b6b9');}
      for(const [x,y,w] of [[48,328,34],[69,612,25],[29,1020,31],[81,1224,24]] as const){
        const sway=q(Math.sin(time*.9+y*.01)*4);
        box(c,x+sway,y,w,2,'#a4cbc4');
        box(c,x+9+sway,y+4,w-13,2,'#77b5b6');
      }
      c.drawImage(shadowLayer.cv,0,0,W,H);
      c.save();c.translate(q(player.x),q(player.y));projectShadow(c,playerImage,.2);c.restore();
      const queue:Array<{depth:number;paint:()=>void}>=middle.map(s=>({depth:s.depth,paint:()=>{
        const covers=player.y<s.depth&&player.x>s.x&&player.x<s.x+s.w&&player.y>s.y&&player.y<s.y+s.h;
        c.save();if(covers)c.globalAlpha=.72;c.drawImage(s.image,s.x,s.y,s.w,s.h);c.restore();
      }}));
      residents.forEach((s,i)=>{
        const r=RESIDENTS[i];
        queue.push({depth:s.depth,paint:()=>person(c,r.x,r.y,time+i*.37,r.shirt,r.role)});
      });
      const wx=875+Math.sin(time*.18)*118,wy=1165+Math.cos(time*.18)*5;
      for(const [s,x,y] of [[carrierImage,wx,wy],[petImages[0],895+Math.sin(time*.4)*8,905],[petImages[1],1270,1005]] as const){
        c.save();c.translate(q(x),q(y));projectShadow(c,s,.16);c.restore();
      }
      queue.push({depth:wy+18,paint:()=>person(c,wx,wy,time,'#788f69','carrier',true)});
      queue.push({depth:919,paint:()=>animal(c,895+Math.sin(time*.4)*8,905,true,time)});
      queue.push({depth:1018,paint:()=>animal(c,1270,1005,false,time)});
      queue.push({depth:player.y+18,paint:()=>person(c,player.x,player.y,player.walkTime,player.shirt,'player',player.walking,player.facing,player.direction)});
      queue.push({depth:728,paint:()=>{
        box(c,1345,702,23,12,'#ae6338');box(c,1350,691+q(Math.sin(time*7)*3),9,20,'#dca254');box(c,1353,701,6,10,'#f0d28a');
      }});
      queue.push({depth:800,paint:()=>line(c,[[983,723],[983,748+Math.sin(time*3)*3]],'#c4e0cc',2)});
      queue.sort((a,b)=>a.depth-b.depth);queue.forEach(item=>item.paint());
      // Forge flame and stepped smoke are the only concentrated warm accents.
      for(let i=0;i<3;i++){const rise=(time*13+i*26)%83;c.save();c.globalAlpha=.36*(1-rise/100);disc(c,1638+q(rise*.16),475-rise,8+i*2,6+i,'#c8ccb4');c.restore();}
      foreground.forEach(s=>c.drawImage(s.image,s.x,s.y,s.w,s.h));
      // World-space signs retain the existing destinations and stay inside bounds.
      for(const [text,x,y] of [['PRAÇA DE KYUNETH',990,490],['PRAIA E PÍER',270,665],['ENTRADA DA VILA',990,1310],['ARENA · CAMINHO FECHADO',1840,92]] as const){
        c.font='bold 12px monospace';c.textAlign='center';const width=c.measureText(text).width+20;
        box(c,x-width/2,y-14,width,24,'#3d5542');box(c,x-width/2,y-14,width,2,'#b0b77c');c.fillStyle='#eee1ae';c.fillText(text,x,y+2);
      }
    },
  };
}
