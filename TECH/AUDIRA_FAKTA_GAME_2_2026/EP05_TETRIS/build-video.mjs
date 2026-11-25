// EP05 TETRIS, RISOFORGE. A riso-printed 1980s Moscow computing lab whose back wall is a giant stacking playfield.
// Spot inks (fluo pink, blue, yellow) overprint by multiply; panels are zine slips fed through the drum. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const TL = loadTimeline(".");
const at = anchors(TL);
const PINK = "#FF48B0", BLUE = "#0078BF", YEL = "#FFE800", PAPER = "#F6F0E2", INK = "#1D1A2A", NAVY = "#1B3A8C";
const H = "Archivo Black,sans-serif", M = "Space Mono,monospace";

// ---------- the playfield stack: a deterministic tiling of a 10 x 16 well, dropped in a physically valid order ----------
const BASE = [
  [[0, 0], [1, 0], [2, 0], [3, 0]], // I
  [[0, 0], [1, 0], [0, 1], [1, 1]], // O
  [[0, 0], [1, 0], [2, 0], [1, 1]], // T
  [[0, 0], [1, 0], [1, 1], [2, 1]], // S
  [[1, 0], [2, 0], [0, 1], [1, 1]], // Z
  [[0, 0], [1, 0], [2, 0], [0, 1]], // J
  [[0, 0], [1, 0], [2, 0], [2, 1]], // L
];
const norm = (cs) => { const mx = Math.min(...cs.map((c) => c[0])), my = Math.min(...cs.map((c) => c[1])); return cs.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
const ORI = BASE.map((b) => { const out = [], seen = new Set(); let c = b; for (let r = 0; r < 4; r++) { const n = norm(c), k = JSON.stringify(n); if (!seen.has(k)) { seen.add(k); out.push(n); } c = c.map(([x, y]) => [y, -x]); } return out; });
const W = 10, HR = 16;
function tile(seed) {
  const rnd = mulberry(seed), g = Array.from({ length: HR }, () => Array(W).fill(-1)), pcs = [];
  let nodes = 0;
  const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const go = () => {
    if (++nodes > 200000) return false;
    let ex = -1, ey = -1;
    outer: for (let y = 0; y < HR; y++) for (let x = 0; x < W; x++) if (g[y][x] < 0) { ex = x; ey = y; break outer; }
    if (ex < 0) return true;
    for (const k of shuf([0, 1, 2, 3, 4, 5, 6])) for (const o of shuf(ORI[k])) {
      const dx = ex - o[0][0], dy = ey - o[0][1], cs = o.map(([x, y]) => [x + dx, y + dy]);
      if (!cs.every(([x, y]) => x >= 0 && x < W && y >= 0 && y < HR && g[y][x] < 0)) continue;
      cs.forEach(([x, y]) => (g[y][x] = pcs.length)); pcs.push({ k, c: cs });
      if (go()) return true;
      pcs.pop(); cs.forEach(([x, y]) => (g[y][x] = -1));
    }
    return false;
  };
  return go() ? { g, pcs } : null;
}
let T = null; for (let s = 505; !T; s++) T = tile(s);
// drop order: a piece that sits under another piece in any column lands first
const n = T.pcs.length, deps = Array.from({ length: n }, () => new Set());
for (let x = 0; x < W; x++) for (let y = 1; y < HR; y++) { const a = T.g[y - 1][x], b = T.g[y][x]; if (a !== b) deps[b].add(a); }
const minY = T.pcs.map((p) => Math.min(...p.c.map((c) => c[1])));
const done = new Set(), order = [];
while (order.length < n) {
  const ready = [...Array(n).keys()].filter((i) => !done.has(i) && [...deps[i]].every((d) => done.has(d)));
  const pool = ready.length ? ready : [...Array(n).keys()].filter((i) => !done.has(i));
  pool.sort((a, b) => minY[a] - minY[b] || a - b);
  done.add(pool[0]); order.push(pool[0]);
}
const K0 = Object.fromEntries(TL.scenes.flatMap((s) => [[s.id, s.start], [s.id + "e", s.end]]));
const PRE = 15, HOOK = 13, srnd = mulberry(77);
const P = order.map((i, q) => {
  const p = T.pcs[i];
  let t = -1, fall = 0.55;
  if (q >= PRE && q < PRE + HOOK) t = 0.75 + (q - PRE) * 0.56;
  else if (q >= PRE + HOOK) { const r = q - PRE - HOOK, m = n - PRE - HOOK; t = K0.s2 + 1.2 + (r * (K0.s7e - 1.5 - K0.s2 - 1.2)) / (m - 1); fall = 1.1; }
  const xs = p.c.map((c) => c[0]), lo = -Math.min(...xs), hi = W - 1 - Math.max(...xs);
  const dx = Math.max(lo, Math.min(hi, Math.round(srnd() * 6 - 3)));
  return { t: +t.toFixed(3), f: fall, k: p.k, c: p.c, dx };
});

// ---------- panels: zine slips ----------
const html = `
<div class="mk mk1"></div><div class="mk mk2"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">FAKTA GAME &middot; EP 05</div>
  <div class="ttl">PENCIPTA<br>TETRIS</div>
  <div class="row"><b class="slip y">ROYALTI: <span class="pk">0</span></b><b class="slip">10+ TAHUN</b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">PENCIPTANYA</div>
  <div class="ttl md">ALEXEY<br>PAJITNOV</div>
  <div class="row"><b class="slip y" data-at="s2:Pertengahan" data-fx="ink">PERTENGAHAN 80-AN</b><b class="slip b" data-at="s2:Elektronika" data-fx="ink">ELEKTRONIKA 60</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">TANPA GRAFIS</div>
  <div class="mono" data-at="s3:kepingan" data-fx="ink">[][][][]</div>
  <div class="slip h" data-at="s3:kurung" data-fx="ink">kurung siku + spasi</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">DARI PENTOMINO</div>
  <div class="row"><b class="slip" data-at="s4:dua" data-fx="ink">12 bentuk &middot; 5 kotak</b></div>
  <div class="row"><b class="slip y" data-at="s4:tujuh" data-fx="ink">7 bentuk &middot; 4 kotak</b></div>
  <div class="row wb"><b class="wd" data-at="s4:tetra" data-fx="ink">TETRA</b><b class="op" data-at="s4:tenis" data-fx="ink">+</b><b class="wd" data-at="s4:tenis" data-fx="ink">TENIS<i class="ball"></i></b></div>
  <div class="row wb"><b class="op" data-at="s4:favoritnya" data-fx="ink">=</b><b class="wd big" data-at="s4:favoritnya" data-fx="stamp">TETRIS</b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">VERSI BERWARNA</div>
  <div class="ttl md">IBM PC</div>
  <div class="slip h y" data-at="s5:Vadim" data-fx="ink">bersama Vadim Gerasimov, 16 tahun</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">HAK DIKELOLA NEGARA</div>
  <div class="slip h">Menyebar ke luar negeri</div>
  <div class="row"><b class="stampx" data-at="s6:ELORG" data-fx="stamp">ELORG</b><b class="slip y" data-at="s6:royalti" data-fx="ink">ROYALTI: <span class="pk">0</span></b></div>
</div>
<div class="p" data-in="s7" data-out="s7:Baru">
  <div class="tag">VERSI GAME BOY</div>
  <div class="ttl" data-at="s7:juta" data-fx="stamp">35 JUTA+</div>
  <div class="slip h" data-at="s7:kopi" data-fx="ink">kopi terjual</div>
</div>
<div class="p" data-in="s7:Baru" data-out="s8">
  <div class="tag" data-at="s7:1996" data-fx="ink">1996 &middot; HAKNYA KEMBALI</div><br>
  <div class="slip h" data-at="s7:Company" data-fx="ink">The Tetris Company</div>
  <div class="row"><b class="slip b" data-at="s7:Henk" data-fx="ink">+ HENK ROGERS</b><b class="slip y" data-at="s7:akhirnya" data-fx="ink">akhirnya dibayar</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="ttl sm" data-at="s8:jutaan" data-fx="ink">JUTAAN<br>KETAGIHAN</div>
  <div class="slip h" data-at="s8:lama" data-fx="ink">penciptanya lama tak dapat apa-apa</div>
  <div class="slip h y" data-at="s8:Kamu" data-fx="ink">Pernah main sampai lupa waktu?</div>
</div>`;

const css = `
#root{background:${PAPER}}
.p{left:60px;right:100px}
.tag{display:inline-block;font-family:'Space Mono',monospace;font-weight:700;font-size:26px;letter-spacing:.16em;color:${INK};background:${YEL};padding:6px 16px;border:3px solid ${INK};margin-bottom:16px;mix-blend-mode:multiply}
.ttl{display:table;background:rgba(246,240,226,.92);padding:10px 18px 6px 12px;font-family:'Archivo Black',sans-serif;font-size:118px;line-height:.94;color:${BLUE};text-shadow:7px 5px 0 ${PINK};mix-blend-mode:multiply;margin-bottom:18px;letter-spacing:-.01em}
.ttl.md{font-size:96px}.ttl.sm{font-size:84px}
.slip{display:inline-block;font-family:'Archivo Black',sans-serif;font-size:42px;line-height:1.1;color:${NAVY};background:${PAPER};padding:12px 20px 14px;border:3px dashed ${INK};box-shadow:7px 7px 0 rgba(0,120,191,.55);margin-bottom:16px}
.slip.h{display:table;font-size:40px}
.slip.y{background:${YEL}}.slip.b{background:${BLUE};color:${PAPER}}
.pk{color:${PINK};text-shadow:3px 2px 0 ${BLUE}}
.row{display:flex;flex-wrap:wrap;gap:16px;align-items:center}
.mono{display:inline-block;font-family:'Space Mono',monospace;font-weight:700;font-size:112px;line-height:1;color:${PAPER};background:#26306e;padding:18px 28px;border:4px solid ${INK};box-shadow:9px 9px 0 ${PINK};margin-bottom:18px;letter-spacing:.02em}
.wb{gap:12px;margin-bottom:10px}
.wd{position:relative;font-family:'Archivo Black',sans-serif;font-size:64px;color:${BLUE};text-shadow:5px 4px 0 ${PINK};mix-blend-mode:multiply;padding:0 6px}
.wd.big{font-size:84px;color:${PINK};text-shadow:6px 5px 0 ${BLUE}}
.op{font-family:'Archivo Black',sans-serif;font-size:58px;color:${INK}}
.ball{position:absolute;right:-30px;top:-14px;width:40px;height:40px;border-radius:50%;background:${YEL};border:3px solid ${INK};box-shadow:inset -6px -5px 0 rgba(0,120,191,.45)}
.stampx{font-family:'Archivo Black',sans-serif;font-size:76px;color:#E8344E;border:7px solid #E8344E;padding:4px 22px;transform:rotate(-4deg);mix-blend-mode:multiply;letter-spacing:.06em}
.mk{position:absolute;top:126px;width:44px;height:44px;z-index:9;opacity:.75;background:linear-gradient(${INK},${INK}) center/2px 100% no-repeat,linear-gradient(${INK},${INK}) center/100% 2px no-repeat}
.mk::after{content:'';position:absolute;inset:9px;border:2px solid ${INK};border-radius:50%}
.mk1{left:22px}.mk2{right:22px}
#chip{font-family:'Space Mono',monospace;font-weight:700;color:${INK};background:rgba(246,240,226,.85);padding:2px 10px;top:182px;font-size:20px;opacity:.9}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: PAPER, vig: 0.1, grain: 0.09, capfloor: 0, html, css, chipFont: M, chipColor: INK, sig: "EP05_TETRIS",
  K: { P },
  extraAt: ["s1:royalti", "s2:Akademi", "s2:membuat", "s3:grafis", "s4:pentomino", "s4:menyederhanakannya", "s4:tetromino", "s5:berwarna", "s6:menyebar", "s6:Tapi", "s6:dikelola", "s7:Game", "s7:setelah", "s7:mendirikan", "s7:menerima", "s8:Jadi", "s8:ketagihan", "s8:Ikuti", "s8:penciptanya"],
  // A zine slip fed out of the drum: the sheet prints top-down in stepped passes, a little off register.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(0% 0% 100% 0%)',x:-16,y:6,opacity:1},{clipPath:'inset(0% 0% 0% 0%)',duration:.36,ease:'steps(6)'},a-.06);tl.to(p,{x:0,y:0,duration:.2,ease:'steps(3)'},a+.3);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(100% 0% 0% 0%)',x:14,duration:.16,ease:'steps(4)'},b-.16)`,
  fxExtra: `ink:(e,t)=>tl.fromTo(e,{x:-12,y:7,opacity:0},{x:0,y:0,opacity:1,duration:.24,ease:'steps(4)'},t),`,
  // Closes with a stepped print pass across the sheet.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0% 100% 0% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'steps(9)'},OUT-.2);`,
});
const nCap = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:54px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Archivo Black',sans-serif;font-size:56px;line-height:1.2;color:${PAPER};text-shadow:4px 0 0 ${INK},-4px 0 0 ${INK},0 4px 0 ${INK},0 -4px 0 ${INK},3px 3px 0 ${INK},-3px 3px 0 ${INK},3px -3px 0 ${INK},-3px -3px 0 ${INK},8px 8px 0 ${PINK}}
.w{display:inline-block;margin:0 .16em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${PAPER}",y:0},{color:"${YEL}",y:-6,duration:.05,ease:"steps(2)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${PAPER}",y:0,duration:.08,ease:"steps(2)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:-10,opacity:0},{x:0,opacity:1,duration:.15,ease:"steps(3)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pencipta Tetris", PAPER);
console.log("pieces", P.length, "reveals", Object.keys(AT).length, "caption groups", nCap, "duration", TL.duration, "outro", K.outro);
