// EP04 GANDHI NUKLIR. "Papan strategi kertas": papercraft hex board on a desk, panels unfold from a crease. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CRM = "#F4EEDC", TER = "#C65D3B", TEA = "#2A7F7A", SAF = "#F2A541", INK = "#2B2B2B", RED = "#D33A2C", BG = "#CDB48C";
const D = "Fraunces,serif", M = "'IBM Plex Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">FAKTA GAME &middot; EP 04</div>
  <div class="pc"><div class="big">Gandhi<br><span>Nuklir</span></div><div class="sub">katanya, gara-gara bug</div></div>
  <div class="stamp" data-at="s1:mitos" data-fx="stamp">MITOS?</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">VERSI CERITANYA</div>
  <div class="pc"><div class="ln">Agresi Gandhi <b class="mono big2" data-at="s2:satu" data-fx="pop">1</b></div>
  <div class="chip t" data-at="s2:demokrasi" data-fx="left">DEMOKRASI <span class="mono">&minus;2</span></div>
  <div class="eq mono" data-at="s2:minus" data-fx="pop">1 &minus; 2 = <span class="r">&minus;1</span></div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">8 BIT TANPA TANDA</div>
  <div class="pc code"><div class="ln mono">1 &minus; 2 = ?</div><div class="eq mono" data-at="s3:meluap" data-fx="pop">&minus;1 &rarr; <span class="y">255</span></div>
  <div class="ln" data-at="s3:sekitar" data-fx="pop"><b class="mono r">&plusmn;25&times;</b> lebih agresif</div></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">ASAL CERITANYA</div>
  <div class="pc"><div class="eq mono sm" data-at="s4:wiki" data-fx="pop">TV TROPES &middot; 2012</div>
  <div class="ln" data-at="s4:dua" data-fx="pop"><b class="mono">21</b> tahun setelah rilis</div></div>
  <div class="stamp s2" data-at="s4:bukti" data-fx="stamp">TANPA BUKTI</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">BANTAHAN 1 &middot; DESAINER CIV II</div>
  <div class="pc"><div class="ln">Brian Reynolds membantah</div><div class="ln" data-at="s5:tiga" data-fx="pop">Cuma <b class="mono">3</b> tingkat agresi</div>
  <div class="ln" data-at="s5:sepertiga" data-fx="pop"><b class="y2">Sepertiga</b> pemimpin setara Gandhi</div>
  <div class="cd mono" data-at="s5:variabel" data-fx="left">// tidak ada unsigned</div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">BANTAHAN 2 &middot; SID MEIER</div>
  <div class="pc"><div class="ln" data-at="s6:memoarnya" data-fx="pop">Memoar <b class="mono">2020</b> menegaskan</div><div class="cd mono" data-at="s6:bahasa" data-fx="left">int x = &minus;1; <span class="g">// signed</span></div>
  <div class="ln" data-at="s6:tetap" data-fx="pop"><b class="mono">&minus;1</b> tetap <b class="mono">&minus;1</b></div>
  <div class="ln" data-at="s6:tidak" data-fx="pop">Pemerintahan <b class="r">&#10005;</b> agresi AI</div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">PLOT TWIST &middot; CIV V &middot; 2010</div>
  <div class="pc"><div class="ln" data-at="s7:Desainer" data-fx="pop">Gandhi diberi nilai tertinggi</div><div class="eq mono" data-at="s7:dua" data-fx="pop">NUKE = <span class="r">12</span></div>
  <div class="ln" data-at="s7:lelucon" data-fx="pop">Jon Shafer: <b class="y2">sengaja, lelucon</b></div>
  <div class="sub" data-at="s7:Bisa" data-fx="fade">mungkin dari sinilah mitosnya</div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">JADI</div>
  <div class="pc"><div class="old">MITOS?</div>
  <div class="ln q" data-at="s8:Kamu" data-fx="pop">Kamu dulu percaya?</div></div>
  <div class="stamp s3" data-at="s8:bukan" data-fx="stamp">LELUCON,<br>BUKAN BUG</div>
</div>`;

const css = `
.p{left:70px;right:120px}
.tag{display:inline-block;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:26px;letter-spacing:.06em;color:${CRM};background:${TER};padding:8px 18px 7px;margin:0 0 -4px 22px;border-radius:4px 4px 0 0;position:relative;z-index:2}
.pc{position:relative;background:${CRM};color:${INK};border:3px solid ${INK};border-radius:8px;padding:22px 30px 24px;box-shadow:0 3px 0 #b9a880,0 14px 26px rgba(43,31,15,.35);background-image:linear-gradient(180deg,rgba(0,0,0,0) 49.4%,rgba(43,43,43,.10) 50%,rgba(255,255,255,.35) 50.6%,rgba(0,0,0,0) 52%)}
.pc.code{background-color:#1f5f5b;color:${CRM};border-color:${INK};background-image:repeating-linear-gradient(0deg,rgba(244,238,220,.09) 0 2px,transparent 2px 32px),repeating-linear-gradient(90deg,rgba(244,238,220,.09) 0 2px,transparent 2px 32px)}
.big{font-family:Fraunces,serif;font-weight:800;font-size:118px;line-height:.96;letter-spacing:-.01em}.big span{color:${RED}}
.sub{font-family:Fraunces,serif;font-style:italic;font-weight:500;font-size:38px;margin-top:10px;color:#5a4f44}
.ln{font-family:Fraunces,serif;font-weight:700;font-size:50px;line-height:1.16;margin:6px 0}
.mono{font-family:'IBM Plex Mono',monospace;font-weight:700}
.big2{font-size:62px;background:${CRM};border:3px solid ${INK};border-radius:8px;padding:0 16px;display:inline-block}
.eq{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:78px;line-height:1.1;margin:6px 0}.eq.sm{font-size:56px}
.r{color:${RED}}.y{color:${SAF}}.g{color:${TEA}}.code .ln{color:${CRM}}
.y2{background:${SAF};padding:0 10px;border-radius:4px}
.chip{display:inline-block;font-family:Fraunces,serif;font-weight:700;font-size:44px;padding:8px 22px;border-radius:6px;border:3px solid ${INK};margin:10px 0}.chip.t{background:${TEA};color:${CRM}}.chip .mono{color:${SAF}}
.cd{display:inline-block;font-size:40px;font-weight:600;background:${INK};color:${CRM};padding:10px 20px;border-radius:6px;margin:10px 0}.cd .g{color:#8fd3c9}
.stamp{position:absolute;right:-6px;top:58px;font-family:Fraunces,serif;font-weight:900;font-size:76px;line-height:1;color:${RED};border:7px solid ${RED};border-radius:10px;padding:8px 18px;background:rgba(244,238,220,.55);transform-origin:50% 50%;z-index:3;mix-blend-mode:multiply}
.stamp.s2{top:auto;bottom:-40px;right:10px;font-size:58px}
.stamp.s3{top:auto;bottom:-150px;right:-10px;font-size:58px;text-align:center;color:${TEA};border-color:${TEA}}
.old{font-family:Fraunces,serif;font-weight:900;font-size:70px;color:${RED};text-decoration:line-through;text-decoration-thickness:7px;opacity:.75}
.q{font-size:54px}
#chip{font-family:'IBM Plex Mono',monospace;font-weight:600;color:${INK};background:${CRM};padding:3px 12px;border-radius:4px;top:176px;font-size:20px;border:2px solid ${INK}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: BG, vig: 0.3, grain: 0.06, capfloor: 0.18, html, css, chipFont: "'IBM Plex Mono',monospace", chipColor: INK,
  extraAt: ["s1:mitos", "s2:demokrasi", "s2:minus", "s2:Satu", "s2:Gandhi", "s3:minus#2", "s3:meluap", "s3:Gandhi", "s3:menembakkan", "s3:dua", "s4:menyebar", "s4:Klaim", "s5:tiga", "s5:sepertiga", "s5:Brian", "s6:memoarnya", "s6:tidak", "s6:pemerintahan", "s6:Sid", "s7:Plot", "s7:2010", "s7:dua", "s7:lelucon", "s7:membangun", "s7:memakai", "s8:bukan", "s8:Kamu"],
  // Paper fold: the card unfolds downward from its top crease, and folds away on its bottom crease.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{rotationX:-96,transformPerspective:1300,transformOrigin:'50% 0%',opacity:1,y:-10},{rotationX:0,y:0,opacity:1,duration:.55,ease:'back.out(1.25)'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{rotationX:94,transformPerspective:1300,transformOrigin:'50% 100%',y:30,opacity:0,duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `pop:(e,t)=>tl.fromTo(e,{rotationX:-80,transformPerspective:800,transformOrigin:'50% 0%',opacity:0},{rotationX:0,opacity:1,duration:.38,ease:'back.out(1.6)'},t),
 stamp:(e,t)=>tl.fromTo(e,{scale:2.2,rotation:-12,opacity:0},{scale:1,rotation:-7,opacity:1,duration:.18,ease:'power4.in'},t),`,
  // Outro closes like a sheet of paper folding down over the board.
  outroIn: `gsap.set('#outro',{opacity:0,rotationX:-90,transformPerspective:1600,transformOrigin:'50% 0%'});tl.to('#outro',{opacity:1,rotationX:0,duration:.6,ease:'power3.out'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Fraunces,serif;font-weight:700;font-size:64px;line-height:1.16;color:#fff;text-shadow:4px 0 0 ${INK},-4px 0 0 ${INK},0 4px 0 ${INK},0 -4px 0 ${INK},3px 3px 0 ${INK},-3px 3px 0 ${INK},3px -3px 0 ${INK},-3px -3px 0 ${INK},0 8px 0 rgba(43,43,43,.6)}
.w{display:inline-block;margin:0 .1em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",rotation:0},{color:"${SAF}",rotation:-2,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",rotation:0,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{rotationX:-70,transformPerspective:700,transformOrigin:'50% 0%',opacity:0},{rotationX:0,opacity:1,duration:.2,ease:"back.out(1.6)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Gandhi Nuklir", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
