// EP05 PlayStation lahir dari pembatalan Nintendo. ARCADECRT: game world (world2d.js) on the CRT of an AUDIRA arcade
// cabinet; HUD = one neon stage label + one neon callout per chapter (max 2 text elements per frame).
// Run from this folder: node build-video.mjs
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "./lib/hflib.mjs";
import { writeWorld } from "./lib/shell.mjs";

const ANCHORS = JSON.parse(readFileSync("world2d.js", "utf8").match(/export const ANCHORS = (\[[\s\S]*?\]);/)[1].replace(/,\s*\]/, "]"));
const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#07040C", CY = "#39E6FF", MG = "#FF4FD8", YL = "#FFD34D", BG = "#05030A";
const H = "Silkscreen,monospace", B = "'Pixelify Sans',sans-serif";

const html = `
<div id="capband"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="c" data-at="s1:seratus" data-fx="lit"><b class="ct nb" data-from="0" data-to="100" data-a="s1:seratus" data-d="1" data-pre="&gt;" data-suf=" JUTA">&gt;0 JUTA</b><br><span>UNIT TERJUAL</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">STAGE 1 &middot; 1988</div>
  <div class="c" data-at="s2:Play" data-fx="lit">PROYEK:<br><span>PLAY STATION</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">STAGE 2 &middot; SANG OTAK</div>
  <div class="c" data-at="s3:merancang" data-fx="lit">KEN KUTARAGI<b class="l2" data-at="s3:Bapak" data-fx="lit"><br><span>&#9733; BAPAK PLAYSTATION</span></b></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">STAGE 3 &middot; KONTRAK</div>
  <div class="c" data-at="s4:hak" data-fx="lit">HAK GAME CD<br><span>&rarr; SONY</span><b class="l2" data-at="s4:takut" data-fx="lit"><br>YAMAUCHI <span>TAKUT</span></b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">STAGE 4 &middot; CES JUNI 1991</div>
  <div class="c" data-at="s5:Keesokan" data-fx="lit">KEESOKAN PAGINYA<b class="l2" data-at="s5:Philips" data-fx="lit"><br><span>NINTENDO + PHILIPS</span></b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">STAGE 5 &middot; BANGKIT</div>
  <div class="c" data-at="s6:dua" data-fx="lit">&plusmn;<b class="ct nb" data-from="0" data-to="200" data-a="s6:dua" data-d="1.8">0</b> PROTOTIPE<b class="l2" data-at="s6:memutuskan" data-fx="lit"><br><span>OHGA: BUAT SENDIRI</span></b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">STAGE 6 &middot; 3 DES 1994</div>
  <div class="c" data-at="s7:Totalnya" data-fx="lit"><b class="ct nb" data-from="0" data-to="102.49" data-dec="2" data-a="s7:Totalnya" data-d="2.2">0,00</b><br><span>JUTA UNIT</span></div>
</div>
<div class="p" data-in="s8" data-out="s8:Ikuti">
  <div class="tag">CONTINUE?</div>
  <div class="c" data-at="s8:lahirlah" data-fx="lit">LAHIRLAH<br><span>RAKSASA BARU</span></div>
</div>`;

const css = `
.p{top:352px;left:80px;right:80px;text-align:center}
.tag{display:inline-block;font-family:${H};font-size:40px;letter-spacing:.05em;color:${CY};background:rgba(7,4,12,.78);padding:6px 20px 10px;margin:0 0 14px;border:3px solid ${CY};box-shadow:0 0 18px ${CY},inset 0 0 12px rgba(57,230,255,.35);text-shadow:0 0 12px ${CY}}
.c{display:block;margin:0 auto;width:max-content;max-width:900px;font-family:${H};font-size:54px;line-height:1.12;color:#fff;background:rgba(7,4,12,.82);padding:14px 28px 18px;border:4px solid ${MG};box-shadow:0 0 26px ${MG},inset 0 0 16px rgba(255,79,216,.3);text-shadow:0 0 14px ${MG},4px 4px 0 ${INK}}
.c span{color:${YL};text-shadow:0 0 16px #FF8A00,4px 4px 0 ${INK}}
.c .l2{font-weight:400}
#capband{position:absolute;left:40px;right:40px;top:1336px;height:212px;z-index:9;background:rgba(7,4,12,.84);border-top:4px solid ${CY};border-bottom:4px solid ${MG};box-shadow:0 0 22px rgba(57,230,255,.35);border-radius:10px}
#chip{top:312px;left:0;right:0;text-align:center;font-size:24px;opacity:.9;text-shadow:0 3px 0 ${INK}}`;

mkdirSync("hf/assets/lib", { recursive: true });
mkdirSync("hf/assets/audio", { recursive: true });
copyFileSync("world2d.js", "hf/assets/lib/world2d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: BG, vig: 0.25, grain: 0.03, capfloor: 0.4, html, css, chipFont: "Silkscreen,monospace", chipColor: "#B9A6E0", sig: "EP05_PLAYSTATION_DARI_NINTENDO",
  extraAt: ANCHORS,
  // HUD powers on like a CRT: a thin horizontal line that opens vertically
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scaleY:.04},{opacity:1,scaleY:1,duration:.24,ease:'power3.out'},a+.05);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scaleY:.04,duration:.14,ease:'power2.in'},b-.16);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:0,scale:1.12},{opacity:1,scale:1,duration:.22,ease:'back.out(2)'},t),`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1340px;height:200px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;text-wrap:balance;font-family:'Pixelify Sans',sans-serif;font-weight:700;font-size:64px;line-height:1.14;color:#fff;text-shadow:5px 0 0 ${INK},-5px 0 0 ${INK},0 5px 0 ${INK},0 -5px 0 ${INK},4px 4px 0 ${INK},-4px 4px 0 ${INK},4px -4px 0 ${INK},-4px -4px 0 ${INK},0 10px 0 rgba(7,4,12,.6)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",scale:1},{color:"${YL}",scale:1.04,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",scale:1,duration:.08,ease:"power2.out"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:20,opacity:0},{y:0,opacity:1,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "PlayStation dari Nintendo", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
