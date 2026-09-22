// Pixel-art sprite factory: builds tiny canvases from string maps, with auto outline.

export interface Sprite {
  canvas: HTMLCanvasElement;
  white: HTMLCanvasElement; // white silhouette for hit-flash
  w: number;
  h: number;
}

const OUTLINE = "#09070b";

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export function makeSprite(rows: string[], palette: Record<string, string>): Sprite {
  const iw = rows[0].length;
  const ih = rows.length;
  const w = iw + 2;
  const h = ih + 2;

  const grid: (string | null)[][] = [];
  for (let y = 0; y < ih; y++) {
    const line: (string | null)[] = [];
    for (let x = 0; x < iw; x++) {
      const ch = rows[y][x];
      line.push(palette[ch] ? palette[ch] : null);
    }
    grid.push(line);
  }

  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d")!;
  // outline pass
  ctx.fillStyle = OUTLINE;
  for (let y = 0; y < ih; y++) {
    for (let x = 0; x < iw; x++) {
      if (!grid[y][x]) continue;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [-0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        const empty = nx < 0 || ny < 0 || nx >= iw || ny >= ih || !grid[ny][nx];
        if (empty) ctx.fillRect(nx + 1, ny + 1, 1, 1);
      }
    }
  }
  for (let y = 0; y < ih; y++) {
    for (let x = 0; x < iw; x++) {
      const col = grid[y][x];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x + 1, y + 1, 1, 1);
    }
  }

  // white silhouette
  const white = makeCanvas(w, h);
  const wctx = white.getContext("2d")!;
  wctx.drawImage(canvas, 0, 0);
  wctx.globalCompositeOperation = "source-in";
  wctx.fillStyle = "#ffffff";
  wctx.fillRect(0, 0, w, h);

  return { canvas, white, w, h };
}

/* ---------------- sprite definitions ---------------- */

export const SPR: Record<string, Sprite> = {};

let built = false;

export function ensureSprites() {
  if (built) return;
  buildSprites();
}

export function buildSprites() {
  if (built) return;
  built = true;

  // The player is a masked ronin with a red headband and dark lacquer armor.
  SPR.player = makeSprite(
    [
      "....rrrr....",
      "...rrrrrr...",
      "..hhhhhhhh..",
      "..hkkkkkkh..",
      "..hkeeeekh..",
      "...aaaaaa...",
      "..saaaaaas..",
      "..saaaaaas..",
      "...bbbbbb...",
      "...llllll...",
      "...ll..ll...",
      "...ll..ll...",
      "..ff....ff..",
    ],
    {
      r: "#d9343f",
      h: "#e6b89c",
      k: "#19131c",
      e: "#ffbf70",
      a: "#481923",
      s: "#7f2631",
      b: "#9c2634",
      l: "#25101a",
      f: "#100b11",
    },
  );

  const recolorRonin = (name: string, band: string, armor: string, accent: string) => {
    const source = SPR.player;
    const canvas = makeCanvas(source.w, source.h);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(source.canvas, 0, 0);
    const data = ctx.getImageData(0, 0, source.w, source.h);
    for (let i = 0; i < data.data.length; i += 4) {
      const hex = `#${[data.data[i], data.data[i + 1], data.data[i + 2]].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
      const next = hex === "#d9343f" ? band : hex === "#481923" ? armor : hex === "#9c2634" ? accent : null;
      if (!next) continue;
      data.data[i] = Number.parseInt(next.slice(1, 3), 16);
      data.data[i + 1] = Number.parseInt(next.slice(3, 5), 16);
      data.data[i + 2] = Number.parseInt(next.slice(5, 7), 16);
    }
    ctx.putImageData(data, 0, 0);
    const white = makeCanvas(source.w, source.h);
    const wctx = white.getContext("2d")!;
    wctx.drawImage(canvas, 0, 0);
    wctx.globalCompositeOperation = "source-in";
    wctx.fillStyle = "#ffffff";
    wctx.fillRect(0, 0, source.w, source.h);
    SPR[name] = { canvas, white, w: source.w, h: source.h };
  };
  recolorRonin("azureRonin", "#38bdf8", "#123a73", "#2563eb");
  recolorRonin("violetRonin", "#b58cff", "#45236b", "#7c3aed");
  recolorRonin("goldRonin", "#ffd44a", "#79520f", "#d99318");
  recolorRonin("jadeRonin", "#5eead4", "#155e5b", "#0f9b84");
  recolorRonin("shadowRonin", "#94a3b8", "#1f2937", "#475569");

  // Playful character skins. They share the player footprint so gameplay collision stays identical.
  SPR.bananaSamurai = makeSprite([
    "....yyyy....", "...yyyyyy...", "..yy....yy..", "..yykkkk.yy.", "...ykeeky...", "...yyyyyy...", "....aaaa....", "...aaaaaa...", "....bbbb....", "...bb..bb...", "..dd....dd.."
  ], { y: "#ffd84a", k: "#2c2230", e: "#fff1af", a: "#a83b46", b: "#f2bf30", d: "#301b1c" });
  SPR.strawberryKnight = makeSprite([
    "...rrrrrr...", "..rrrrrrrr..", ".rrwwrrwwrr.", ".rrrkkkkrrr.", ".rrkkeeekrr.", "...rrrrrr...", "...gggggg...", "..gggggggg..", "...gg..gg...", "..dd....dd.."
  ], { r: "#ef4d5c", w: "#fff1c0", k: "#352033", e: "#ffe0a8", g: "#4aab5b", d: "#301a21" });
  SPR.orangeRonin = makeSprite([
    "...oooooo...", "..oooooooo..", ".oooggggooo.", ".oo.kkkk.oo.", ".oo.keek.oo.", "..oooooooo..", "...nnnnnn...", "..nnnnnnnn..", "...nn..nn...", "..dd....dd.."
  ], { o: "#ff9b3d", g: "#58ad54", k: "#302034", e: "#fff0bb", n: "#d9682f", d: "#311923" });
  SPR.snowRonin = makeSprite([
    "....cccc....", "...cccccc...", "..cckkkkcc..", "..cckeekcc..", "...cccccc...", "...wwwwww...", "..wwwwwwww..", "...wwwwww...", "....wwww....", "...dd..dd..."
  ], { c: "#77cbe0", k: "#26324a", e: "#ffcc70", w: "#effcff", d: "#435166" });
  SPR.suitedHero = makeSprite([
    "....hhhh....", "...hhhhhh...", "..hkkkkkkh..", "..hkeeeekh..", "...wwwwww...", "...bbbbbb...", "..bbbbbbbb..", "...bbrrbb...", "...bb..bb...", "..dd....dd.."
  ], { h: "#e6b89c", k: "#282031", e: "#fff0bb", w: "#f8f2e9", b: "#28354a", r: "#df4a54", d: "#171c2b" });
  SPR.dressHero = makeSprite([
    "....hhhh....", "...hhhhhh...", "..hkkkkkkh..", "..hkeeeekh..", "...pppppp...", "..pppppppp..", ".pppppppppp.", "...pppppp...", "..pp....pp..", ".dd......dd."
  ], { h: "#e9b99b", k: "#4b2438", e: "#fff0bb", p: "#ee79b6", d: "#4d2141" });
  SPR.grunt = makeSprite(
    [
      "..gggggg..",
      ".gggggggg.",
      "gg.gggg.gg",
      "ggeggggegg",
      "gggggggggg",
      "gg.wwww.gg",
      ".gggggggg.",
      "..gg..gg..",
      "..gg..gg..",
      ".dd....dd.",
    ],
    { g: "#8d2734", e: "#ffd0a2", w: "#f4c7ad", d: "#260e17" },
  );

  SPR.bat = makeSprite(
    [
      "ww........ww",
      "wwww.bb.wwww",
      ".wwwbbbbwww.",
      "..wwbeebww..",
      "...wbbbbw...",
      "....bbbb....",
      ".....bb.....",
    ],
    { w: "#531b36", b: "#210d1d", e: "#ff5361" },
  );

  SPR.brute = makeSprite(
    [
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "..hhhhhhhhhhhh..",
      "..hheeehheeehh..",
      "..hhhhhhhhhhhh..",
      "..hh.wwwwww.hh..",
      "...hhhhhhhhhh...",
      ".aabbbbbbbbbbaa.",
      "aaabbbbbbbbbbaaa",
      "aaabbbbbbbbbbaaa",
      ".aabbbbbbbbbbaa.",
      "...bbbbbbbbbb...",
      "...bbbb..bbbb...",
      "...llll..llll...",
      "...llll..llll...",
      "..dddd....dddd..",
    ],
    {
      h: "#9f3840",
      e: "#ffd0a2",
      w: "#f4c7ad",
      a: "#541422",
      b: "#6e1c2a",
      l: "#260d17",
      d: "#0e0810",
    },
  );

  SPR.spitter = makeSprite(
    [
      "...cccc...",
      "..cccccc..",
      ".cccccccc.",
      ".cc.ee.cc.",
      ".cccccccc.",
      "..cccccc..",
      ".rrrrrrrr.",
      "rrrrrrrrrr",
      "rrrrrrrrrr",
      ".rrrrrrrr.",
      ".rrrrrrrr.",
      "..rr..rr..",
    ],
    { c: "#260f22", e: "#ff934f", r: "#722039" },
  );

  // Additional enemies
  SPR.ninja = makeSprite(
    [
      "...rrrr...",
      "..rkkkkr..",
      ".kkkeekkk.",
      ".kkkkkkkk.",
      "..kkkkkk..",
      ".rrkkkkrr.",
      "...kkk....",
      "..kk.kk...",
      ".dd...dd..",
    ],
    { r: "#f0444e", k: "#150b14", e: "#ffbf70", d: "#300f1b" },
  );

  SPR.hound = makeSprite(
    [
      "....hh....",
      "...hhhh...",
      ".hheehhhh.",
      "hhhhhhhhhh",
      "hh.rrrr.hh",
      ".hhhhhhhh.",
      "...hh.hh..",
      "..dd...dd.",
    ],
    { h: "#6e1e2b", e: "#ffcf9c", r: "#c93240", d: "#180b11" },
  );

  SPR.wisp = makeSprite(
    [
      "...ppp...",
      ".ppppppp.",
      ".pp.e.pp.",
      "ppppppppp",
      ".ppppppp.",
      "...ppp...",
      "....p....",
    ],
    { p: "#821f46", e: "#ff6d78" },
  );

  SPR.archer = makeSprite(
    [
      "...aaaa...",
      "..aaaaaa..",
      ".a.eeee.a.",
      ".aaaaaaaa.",
      "...tttt...",
      "..tttttt..",
      "..tt..tt..",
      ".dd....dd.",
    ],
    { a: "#502039", e: "#ffd19e", t: "#8c2737", d: "#1b0d17" },
  );

  SPR.oni = makeSprite(
    [
      "..hh..hh..",
      ".hhhhhhhh.",
      "hhhhhhhhhh",
      "hhee..eehh",
      "hhhhhhhhhh",
      "hh.wwww.hh",
      ".hhhhhhhh.",
      "..hh..hh..",
      ".dd....dd.",
    ],
    { h: "#b43742", e: "#ffe0ad", w: "#40101c", d: "#1a0911" },
  );

  SPR.shield = makeSprite(
    [
      "...sssss...",
      "..sssssss..",
      ".ss.eee.ss.",
      ".sssssssss.",
      ".sshhhhsss.",
      ".sshhhhsss.",
      ".sshhhhsss.",
      "...s...s...",
      "..dd...dd..",
    ],
    { s: "#4a1727", e: "#ffcc91", h: "#932c39", d: "#160a11" },
  );

  SPR.slime = makeSprite(
    [
      "...ssss...",
      ".ssssssss.",
      "ssssssssss",
      "sseessssss",
      "ssssssssss",
      ".ssssssss.",
      "..s....s..",
    ],
    { s: "#70233b", e: "#ffdfaf" },
  );

  SPR.monk = makeSprite(
    [
      "....mmmm....",
      "...mmmmmm...",
      "..mm.eemm...",
      "..mmmmmmmm..",
      "...yyyyyy...",
      "..yyyyyyyy..",
      "..yyyyyyyy..",
      "...yy..yy...",
      "..dd....dd..",
    ],
    { m: "#36152b", e: "#ffcc9d", y: "#8f2938", d: "#180a12" },
  );

  SPR.demon = makeSprite(
    [
      "..dd....dd..",
      ".dddd..dddd.",
      "dddddddddddd",
      "ddeeddddeedd",
      "dddddddddddd",
      ".dd.wwww.dd.",
      ".dddddddddd.",
      "...dd..dd...",
      "..dd....dd..",
    ],
    { d: "#be303d", e: "#fff0b8", w: "#4a1020" },
  );

  SPR.skeleton = makeSprite(
    [
      "...bbbb...",
      ".bbbbb.bb.",
      ".b.eeee.b.",
      ".bbbbbbbb.",
      "...b.bb...",
      ".rrbbbbrr.",
      "...bb.bb..",
      "..dd...dd.",
    ],
    { b: "#dac0aa", e: "#ff4b5b", r: "#631b2b", d: "#190e13" },
  );

  // Later-wave enemies use brighter, distinct palettes for quick combat reads.
  SPR.crawler = makeSprite(
    [
      "...cccc...",
      ".ccccc.cc.",
      "cc.eee..cc",
      "cccccccccc",
      ".cc.rr.cc.",
      "cc..cc..cc",
      "d...cc...d",
    ],
    { c: "#c65b32", e: "#fff0ae", r: "#7b2830", d: "#291116" },
  );

  SPR.bomber = makeSprite(
    [
      "....bbbb....",
      "...bbbbbb...",
      "..bb.eebb...",
      ".bbbbbbbbbb.",
      ".bb.oooo.bb.",
      ".bbbbbbbbbb.",
      "...bb..bb...",
      "..dd....dd..",
    ],
    { b: "#d75c3e", e: "#fff0b8", o: "#ffbd58", d: "#321018" },
  );

  SPR.bombMinion = makeSprite(
    [
      "....rrrr....",
      "...rrrrrr...",
      "..rr.eerrr..",
      ".rrrrrrrrrr.",
      ".rrr.oooo.rr",
      ".rrrrrrrrrr.",
      "..rr.rr.rr..",
      "..dd....dd..",
    ],
    { r: "#b9343e", e: "#fff0b8", o: "#ff9d3f", d: "#2b1015" },
  );

  SPR.ram = makeSprite(
    [
      "....hhhh....",
      "...hhhhhh...",
      "..hh.eehh...",
      ".hhhhhhhhhh.",
      "hhhhhhhhhhhh",
      "..bbbbbbbb..",
      ".bbbbbbbbbb.",
      "dd..dddd..dd",
    ],
    { h: "#7d4b31", e: "#ffe0b0", b: "#b7794d", d: "#241116" },
  );

  SPR.warlock = makeSprite(
    [
      "....pppp....",
      "...pppppp...",
      "..pp.eeeepp.",
      "..pppppppp..",
      "...vvvvvv...",
      "..vvvvvvvv..",
      ".vv..vv..vv.",
      "dd...vv...dd",
    ],
    { p: "#7547ba", e: "#f4dcff", v: "#3b1c60", d: "#150b25" },
  );

  SPR.golem = makeSprite(
    [
      "...gggggg...",
      ".gggggggggg.",
      "gg.gggggg.gg",
      "gg.eegg.ee.g",
      "gggggggggggg",
      "gg.rrrrrr.gg",
      ".gggggggggg.",
      ".ggg.ggg.ggg.",
      "dd...gg...dd",
    ],
    { g: "#95654f", e: "#fff0bb", r: "#5b3b3c", d: "#25151b" },
  );

  SPR.boss = makeSprite(
    [
      ".......rrrrrrrr.......",
      "......rrrrrrrrrr......",
      ".....rhhhhhhhhhhhr....",
      "....rhhhhhhhhhhhhhr...",
      "....hhheeehhheeehhh...",
      "...hhhhhhhhhhhhhhhh...",
      "...hhh.wwwwwwww.hhh...",
      "....hhhhhhhhhhhhhh....",
      "..aaaabbbbbbbbbbaaaa..",
      ".aaaabbbbbbbbbbbbaaaa.",
      "aaaabbbbbbbbbbbbaaaaa",
      ".aaaabbbbbbbbbbbbaaaa.",
      "...bbbbbbbbbbbbbbbb...",
      "...bbbbbbb..bbbbbbb...",
      "...llllll....llllll...",
      "..dddddd......dddddd..",
    ],
    {
      r: "#ec4b53",
      h: "#c44248",
      e: "#ffe7b8",
      w: "#3a0c1a",
      a: "#6d1b2b",
      b: "#8e2635",
      l: "#2b0c18",
      d: "#0b070c",
    },
  );

  // Pickups & Icons
  SPR.heart = makeSprite(["..r.r..", ".rrrrr.", ".rrrrr.", "..rrr..", "...r..."], {
    r: "#ff4353",
  });

  SPR.coin = makeSprite(
    [
      "..yyyy..",
      ".yyyyyy.",
      "yy.dd.yy",
      "yy.dd.yy",
      ".yyyyyy.",
      "..yyyy..",
    ],
    { y: "#ffcf48", d: "#9b6a15" }
  );

  /* ---------- UI icons (weapons / powerups), 12x12 ---------- */
  SPR.icoKatana = makeSprite(
    [
      "..........ww",
      ".........wsw",
      "........wsw.",
      ".......wsw..",
      "......wsw...",
      ".....wsw....",
      "....wsw.....",
      "..ggsw......",
      ".grgg.......",
      "rrrg........",
      "rr..........",
      "............",
    ],
    { w: "#fff0dc", s: "#c9b9aa", g: "#f2c58d", r: "#891f2d" },
  );
  SPR.icoBow = makeSprite(
    [
      "..g.........",
      ".gb.........",
      "..b.b.......",
      "...b.b......",
      "....brb.....",
      "wwwwwwwwws..",
      "....brb.....",
      "...b.b......",
      "..b.b.......",
      ".gb.........",
      "..g.........",
      "............",
    ],
    { b: "#9c2931", r: "#681923", w: "#f3dfbd", s: "#d8e0df", g: "#f2c58d" },
  );
  SPR.icoHammer = makeSprite(
    [
      "....mmmmmm..",
      "....mmmmmm..",
      "....mrrrrm..",
      "....mmmmmm..",
      "....mmmmmm..",
      "......hh....",
      "......hh....",
      "......hh....",
      "......hh....",
      "......hh....",
      "......hh....",
      "............",
    ],
    { m: "#5f1a27", r: "#ba3742", h: "#64201e" },
  );
  SPR.icoShield = makeSprite(
    [
      "..ssssssss..",
      ".ssrrrrrrss.",
      ".ssr....rss.",
      ".ssr.gg.rss.",
      ".ssr.gg.rss.",
      ".ssr....rss.",
      ".ssrrrrrrss.",
      "..ssssssss..",
      "...ssssss...",
      "....ssss....",
      ".....ss.....",
      "............",
    ],
    { s: "#721e29", r: "#b53842", g: "#ffd0a2" },
  );
  SPR.icoMine = makeSprite(
    [
      "............",
      ".....rr.....",
      "....ssss....",
      "..ssssssss..",
      ".sswwsswwss.",
      "ssssrrrrssss",
      ".ssssssssss.",
      "..ssssssss..",
      "...ssssss...",
      "............",
      "............",
      "............",
    ],
    { s: "#555d63", w: "#aab1b5", r: "#e0444d" },
  );
  SPR.icoBook = makeSprite(
    [
      "..bbbbbbbb..",
      ".bppppppppb.",
      ".bpwwppwwpb.",
      ".bpwwppwwpb.",
      ".bpppyppppb.",
      ".bppyyypppb.",
      ".bpppyppppb.",
      ".bpwwppwwpb.",
      ".bpwwppwwpb.",
      ".bppppppppb.",
      "..bbbbbbbb..",
      "............",
    ],
    { b: "#4f245f", p: "#9a55a5", w: "#f0d8a8", y: "#63d8ff" },
  );
  SPR.icoSpeed = makeSprite(
    [
      "......yy....",
      ".....yy.....",
      "....yy......",
      "...yyyyyy...",
      "..yyyyyy....",
      ".....yy.....",
      "....yy......",
      "...yy.......",
      "..yy........",
      "............",
      "............",
      "............",
    ],
    { y: "#ffd44a" },
  );
  SPR.potionHealth = makeSprite(["...rr...", "..rrrr..", "..rwwr..", ".rwwwwr.", ".rwwwwr.", ".rrrrrr.", "..rrrr..", "........"], { r: "#e0444d", w: "#ffd2b5" });
  SPR.potionStrength = makeSprite(["...oo...", "..oooo..", "..owwo..", ".owwwwo.", ".owwwwo.", ".oooooo.", "..oooo..", "........"], { o: "#ff8a45", w: "#ffe2c4" });
  SPR.potionSpeed = makeSprite(["...yy...", "..yyyy..", "..ywwy..", ".ywwwwy.", ".ywwwwy.", ".yyyyyy.", "..yyyy..", "........"], { y: "#ffd44a", w: "#fff0a8" });
  SPR.potionAgility = makeSprite(["...pp...", "..pppp..", "..pwwp..", ".pwwwwp.", ".pwwwwp.", ".pppppp.", "..pppp..", "........"], { p: "#8c8cff", w: "#e4e1ff" });
  SPR.icoHeart = makeSprite(
    [
      "..rr...rr...",
      ".rrrr.rrrr..",
      "rrwrrrrrrrr.",
      "rrrrrrrrrrr.",
      "rrrrrrrrrrr.",
      ".rrrrrrrrr..",
      "..rrrrrrr...",
      "...rrrrr....",
      "....rrr.....",
      ".....r......",
      "............",
      "............",
    ],
    { r: "#ff4353", w: "#ffd2b5" },
  );
  SPR.icoClock = makeSprite(
    [
      "...cccccc...",
      "..c......c..",
      ".c...w....c.",
      "c....w.....c",
      "c....w.....c",
      "c....wwww..c",
      "c..........c",
      "c..........c",
      ".c........c.",
      "..c......c..",
      "...cccccc...",
      "............",
    ],
    { c: "#f8d7a5", w: "#ff6a63" },
  );
  SPR.icoDash = makeSprite(
    [
      "............",
      "..y....y....",
      "...y....y...",
      "....y....y..",
      ".....y....y.",
      "....y....y..",
      "...y....y...",
      "..y....y....",
      "............",
      "............",
      "............",
      "............",
    ],
    { y: "#ff8a62" },
  );
  SPR.icoSkull = makeSprite(
    [
      "...wwwwww...",
      "..wwwwwwww..",
      ".wwwwwwwwww.",
      ".ww.wwww.ww.",
      ".ww.wwww.ww.",
      ".wwwwwwwwww.",
      "..wwwwwwww..",
      "...w.ww.w...",
      "...wwwwww...",
      "............",
      "............",
      "............",
    ],
    { w: "#ffe2c4" },
  );
  SPR.icoGear = makeSprite(
    [
      "....g..g....",
      "...gggggg...",
      "..gg.gg.gg..",
      "gggg....gggg",
      ".gg......gg.",
      ".gg......gg.",
      "gggg....gggg",
      "..gg.gg.gg..",
      "...gggggg...",
      "....g..g....",
      "............",
      "............",
    ],
    { g: "#ffe2c4" },
  );
  SPR.icoGlobe = makeSprite(
    [
      "...gggggg...",
      "..g.g..g.g..",
      ".g..g..g..g.",
      "gggggggggggg",
      "g...g..g...g",
      "g...g..g...g",
      "gggggggggggg",
      ".g..g..g..g.",
      "..g.g..g.g..",
      "...gggggg...",
      "............",
      "............",
    ],
    { g: "#ffe2c4" },
  );
  SPR.icoCrosshair = makeSprite(
    [
      ".....cc.....",
      ".....cc.....",
      "............",
      "...cccccc...",
      "...cc..cc...",
      "cc.cc..cc.cc",
      "cc.cc..cc.cc",
      "...cc..cc...",
      "...cccccc...",
      "............",
      ".....cc.....",
      ".....cc.....",
    ],
    { c: "#7ed9d1" },
  );
  SPR.icoTrophy = makeSprite(
    [
      ".yyyyyyyyyy.",
      "yy.yyyyyy.yy",
      "y..yyyyyy..y",
      "yy.yyyyyy.yy",
      "..yyyyyyyy..",
      "...yyyyyy...",
      "....yyyy....",
      ".....yy.....",
      "....yyyy....",
      "..yyyyyyyy..",
      "............",
      "............",
    ],
    { y: "#ffd44a" },
  );
  SPR.icoPlay = makeSprite(
    [
      "p...........",
      "ppp.........",
      "ppppp.......",
      "ppppppp.....",
      "ppppppppp...",
      "ppppppppppp.",
      "ppppppppp...",
      "ppppppp.....",
      "ppppp.......",
      "ppp.........",
      "p...........",
      "............",
    ],
    { p: "#2a0509" },
  );
}

