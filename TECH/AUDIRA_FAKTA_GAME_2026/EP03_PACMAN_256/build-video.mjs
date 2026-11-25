// EP03 LABIRIN 1 BYTE. Neon maze in a black void under an 8-lamp binary register. Panels draw in like scanlines, leave by a glitch slice. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const VOID = "#050510", BLU = "#2B3BFF", DOT = "#FFE8C2", YEL = "#FFD400", MAG = "#FF2E88", CYA = "#2EE6FF";
const D = "'Major Mono Display',monospace", M = "'Space Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="pn tag">FAKTA GAME / EP 03</div>
  <div class="pn big">level <span>256</span></div>
  <div class="pn h m" data-at="s1:tidak" data-fx="scan">tidak bisa diselesaikan</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="pn tag">ARCADE</div>
  <div class="pn big" data-at="s2:1980" data-fx="scan"><span>1980</span></div>
  <div class="row"><b class="pn c" data-at="s2:Makan" data-fx="scan">makan titik</b><b class="pn c" data-at="s2:hindari" data-fx="scan">hindari 4 hantu</b></div>
  <div class="pn c y" data-at="s2:ikon" data-fx="scan">ikon buah = level</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="pn tag" data-at="s3:Delapan" data-fx="scan">8 BIT = 1 BYTE</div>
  <div class="pn num" data-at="s3:nol" data-fx="scan">1 BYTE = 0&ndash;255</div>
  <div class="stamp" data-at="s3:integer" data-fx="stamp">INTEGER OVERFLOW</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="pn h" data-at="s4:tujuh" data-fx="scan">maks. <span>7</span> buah</div>
  <div class="pn h m" data-at="s4:buah#2" data-fx="scan">level 256 &rarr; 256 buah</div>
  <div class="pn c mg" data-at="s4:menimpa" data-fx="scan">SISI KANAN TERTIMPA</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="pn tag">TITIK DI LABIRIN</div>
  <div class="pn barw"><div class="bar"><div class="fill" data-at="s5:Titik" data-fx="fill"></div><div class="rest" id="rest"></div></div></div>
  <div class="stamp" data-at="s5:kill" data-fx="stamp">KILL SCREEN</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="pn tag">SKOR SEMPURNA</div>
  <div class="pn num"><b class="ct" data-from="0" data-to="3333360" data-a="s6:tiga" data-d="4.1">0</b></div>
  <div class="pn c" data-at="s6:tanpa" data-fx="scan">TANPA MATI SEKALI PUN</div>
  <div class="pn plate" data-at="s6:Billy" data-fx="scan">BILLY MITCHELL &middot; <span>1999</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="pn tag" data-at="s7:1982" data-fx="scan">SURAT &middot; 1982</div>
  <div class="pn c" data-at="s7:Jeffrey" data-fx="scan">untuk Jeffrey Yee, 8 tahun</div>
  <div class="pn num y" data-at="s7:enam" data-fx="scan">6 JUTA+</div>
  <div class="stamp" data-at="s7:terbukti" data-fx="stamp">BELUM TERBUKTI</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="pn big sm" data-at="s8:byte" data-fx="scan"><span>1 byte</span> kecil</div>
  <div class="pn h y" data-at="s8:Kamu" data-fx="scan">kamu sampai level berapa?</div>
</div>`;

const css = `
.pn{display:block;width:fit-content;position:relative;background:rgba(5,5,16,.84);border:3px solid ${BLU};box-shadow:inset 0 0 0 1px rgba(46,230,255,.28),0 0 26px rgba(43,59,255,.55);margin-bottom:14px;color:${DOT}}
.pn::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,rgba(0,0,0,0) 2px 5px);pointer-events:none}
.tag{font-family:'Space Mono',monospace;font-weight:700;font-size:26px;letter-spacing:.12em;color:${CYA};padding:6px 16px}
.big{font-family:'Major Mono Display',monospace;font-size:104px;line-height:1;padding:14px 24px 18px;color:${DOT};text-shadow:0 0 18px rgba(255,212,0,.35)}.big span{color:${YEL}}.big.sm{font-size:74px}
.h{font-family:'Major Mono Display',monospace;font-size:46px;line-height:1.15;padding:12px 20px}.h span{color:${YEL}}
.m{font-size:38px}
.num{font-family:'Space Mono',monospace;font-weight:700;font-size:64px;line-height:1;padding:14px 22px;color:${YEL};font-variant-numeric:tabular-nums}
.num.y{font-size:80px}
.c{font-family:'Space Mono',monospace;font-weight:700;font-size:34px;padding:10px 18px}
.y{color:${YEL};border-color:${YEL}}.mg{color:${MAG};border-color:${MAG}}
.row{display:flex;flex-wrap:wrap;gap:14px}
.plate{font-family:'Space Mono',monospace;font-weight:700;font-size:36px;padding:12px 20px;color:#fff;border-color:${CYA}}.plate span{color:${YEL}}
.stamp{display:inline-block;font-family:'Space Mono',monospace;font-weight:700;font-size:60px;letter-spacing:.04em;color:${MAG};border:6px solid ${MAG};padding:6px 20px;background:rgba(5,5,16,.85);box-shadow:0 0 30px rgba(255,46,136,.6);margin-top:6px}
.barw{padding:16px 18px}.bar{position:relative;width:700px;height:44px;border:3px solid ${DOT};display:flex}
.fill{width:86%;height:100%;background:repeating-linear-gradient(90deg,${YEL} 0 22px,rgba(0,0,0,0) 22px 30px);transform-origin:0 50%}
.rest{width:14%;height:100%;background:repeating-linear-gradient(90deg,${MAG} 0 6px,${CYA} 6px 10px,rgba(0,0,0,0) 10px 16px)}
#chip{font-family:'Space Mono',monospace;font-weight:700;color:${CYA};background:rgba(5,5,16,.8);padding:2px 12px;top:176px;font-size:20px;border:1px solid ${BLU}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: VOID, vig: 0.5, grain: 0.05, capfloor: 0.35, html, css, chipFont: M, chipColor: CYA,
  extraAt: ["s2:naik", "s2:hantu", "s2:ikon", "s2:empat", "s3:nol", "s3:Lewat", "s3:itu", "s3:kembali", "s3:Delapan", "s3:byte", "s4:meluap", "s4:menggambar", "s4:menggambar#2", "s4:tujuh", "s4:Gambarnya", "s4:acak", "s4:Tapi", "s5:dimakan", "s6:tiga", "s6:puluh#2", "s6:Billy", "s7:melewati"],
  // Scanline wipe: the panel is drawn line by line, top to bottom.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:1,clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.42,ease:'steps(14)'},a-.06)`,
  // Exit: horizontal glitch slices that jump sideways, then gone.
  panelOut: `(tl,p,b)=>{tl.to(p,{x:-24,clipPath:'inset(0% 0% 0% 0%)',duration:.04,ease:'steps(1)'},b-.2);tl.to(p,{x:32,clipPath:'inset(28% 0% 50% 0%)',duration:.05,ease:'steps(1)'},b-.15);tl.to(p,{x:-44,clipPath:'inset(60% 0% 22% 0%)',duration:.05,ease:'steps(1)'},b-.1);tl.to(p,{opacity:0,duration:.03,ease:'steps(1)'},b-.05);}`,
  fxExtra: `scan:(e,t)=>tl.fromTo(e,{opacity:1,clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.3,ease:'steps(9)'},t),
 fill:(e,t)=>tl.fromTo(e,{opacity:1,scaleX:0},{scaleX:1,duration:2.6,ease:'power2.out'},t),`,
  hud: `(t)=>{const r=q('#rest');if(r)r.style.opacity=(Math.floor(t*7)%2)?1:.25;}`,
  // Outro is drawn in like a CRT frame, scanline by scanline.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0% 0% 100% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'steps(16)'},OUT-.2);`,
});
// Captions: punctuation-only tokens join the previous word.
const words = [];
for (const w of TL.words) { if (/^[.,:;?!]+$/.test(w.text) && words.length) { const p = words[words.length - 1]; words[words.length - 1] = { ...p, text: p.text + w.text, end: w.end }; } else words.push({ ...w }); }
const n = writeCaptions(".", { ...TL, words }, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Space Mono',monospace;font-weight:700;font-size:50px;line-height:1.22;color:#fff;text-shadow:4px 0 0 #000,-4px 0 0 #000,0 4px 0 #000,0 -4px 0 #000,3px 3px 0 #000,-3px 3px 0 #000,3px -3px 0 #000,-3px -3px 0 #000,0 0 18px rgba(43,59,255,.8)}
.w{display:inline-block;margin:0 .16em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",y:0},{color:"${YEL}",y:-5,duration:.05,ease:"steps(2)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",y:0,duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:1,clipPath:"inset(0% 0% 100% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.14,ease:"steps(5)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Labirin 1 Byte", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
