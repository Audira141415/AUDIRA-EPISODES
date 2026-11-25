// EP20 Angry Birds: game ke-52 Rovio. PIXELSTORY: full-frame 16-bit world (world2d.js); HUD = one pixel tag +
// one pixel card per beat (max title + 1 card per frame). Run from this folder: node build-video.mjs
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "./lib/hflib.mjs";
import { writeWorld } from "./lib/shell.mjs";

const ANCHORS = JSON.parse(readFileSync("world2d.js", "utf8").match(/export const ANCHORS = (\[[\s\S]*?\]);/)[1].replace(/,\s*\]/, "]"));
const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1a1020", GOLD = "#ffd34d", ORG = "#e07a3a", MINT = "#6fc3a8", CRM = "#f6e7c1", BG = "#1a1020";
const H = "Silkscreen,monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s1:Lalu">
  <div class="c" data-at="s1:51" data-fx="lit"><b class="ct nb" data-from="0" data-to="51" data-a="s1:51" data-d="3.6">0</b> GAME<b class="l2" data-at="s1:hit" data-fx="lit"><br><span>BELUM ADA HIT</span></b></div>
</div>
<div class="p" data-in="s1:Lalu" data-out="s2">
  <div class="c" data-at="s1:game#2+0.6" data-fx="lit">GAME <span>KE-52</span><b class="l2" data-at="s1:menyelamatkan" data-fx="lit"><br>PENYELAMAT STUDIO</b></div>
</div>
<div class="p" data-in="s2" data-out="s2:Bertahun-tahun">
  <div class="tag">LEVEL 1 &middot; FINLANDIA</div>
  <div class="c" data-at="s2:mahasiswa" data-fx="lit">3 MAHASISWA<b class="l2" data-at="s2:2003" data-fx="lit"><br><span>ROVIO &middot; 2003</span></b></div>
</div>
<div class="p" data-in="s2:Bertahun-tahun" data-out="s3">
  <div class="c" data-at="s2:pesanan" data-fx="lit">GAME PESANAN<br><span>UNTUK KLIEN</span></div>
</div>
<div class="p" data-in="s3" data-out="s3:Uangnya">
  <div class="tag">AWAL 2009</div>
  <div class="c" data-at="s3:bangkrut" data-fx="lit">DI AMBANG <span>BANGKRUT</span><b class="l2" data-at="s3:menyusut" data-fx="lit"><br>KARYAWAN <b class="ct nb" data-from="50" data-to="12" data-a="s3:menyusut" data-d="1.5">50</b></b></div>
</div>
<div class="p" data-in="s3:Uangnya" data-out="s4">
  <div class="c" data-at="s3:satu" data-fx="lit">DANA:<br><span>1 GAME LAGI</span></div>
</div>
<div class="p" data-in="s4" data-out="s4:Musuhnya">
  <div class="tag">LEVEL 2 &middot; DESAINER</div>
  <div class="c" data-at="s4:marah" data-fx="lit">BURUNG <span>MARAH</span><b class="l2" data-at="s4:sayap" data-fx="lit"><br>TANPA SAYAP &amp; KAKI</b></div>
</div>
<div class="p" data-in="s4:Musuhnya" data-out="s5">
  <div class="c" data-at="s4:hijau" data-fx="lit">MUSUH: <span>BABI HIJAU</span><b class="l2" data-at="s4:konon" data-fx="lit"><br>KONON: BERITA FLU BABI</b></div>
</div>
<div class="p" data-in="s5" data-out="s5:Digarap">
  <div class="tag">CARA MAIN</div>
  <div class="c" data-at="s5:tarik" data-fx="lit">TARIK &middot; <b class="l2" data-at="s5:lepaskan" data-fx="lit">LEPAS</b><b class="l2" data-at="s5:robohkan" data-fx="lit"><br><span>ROBOHKAN!</span></b></div>
</div>
<div class="p" data-in="s5:Digarap" data-out="s6">
  <div class="c" data-at="s5:bulan" data-fx="lit">8 BULAN<b class="l2" data-at="s5:membengkak" data-fx="lit"><br><span>&euro;<b class="ct nb" data-from="25000" data-to="100000" data-a="s5:membengkak" data-d="1.9" data-sep=".">25.000</b></span></b></div>
</div>
<div class="p" data-in="s6" data-out="s6:Februari">
  <div class="tag">LEVEL 3 &middot; RILIS</div>
  <div class="c" data-at="s6:11" data-fx="lit">11 DES 2009<b class="l2" data-at="s6:US$0,99" data-fx="lit"><br><span>US$0,99</span></b></div>
</div>
<div class="p" data-in="s6:Februari" data-out="s7">
  <div class="c" data-at="s6:nomor" data-fx="lit"><span>#1</span> APP BERBAYAR<b class="l2" data-at="s6:Inggris" data-fx="lit"><br>INGGRIS &rarr; AMERIKA</b></div>
</div>
<div class="p" data-in="s7" data-out="s7:Filmnya">
  <div class="tag">UNDUHAN</div>
  <div class="c" data-at="s7:menembus" data-fx="lit"><b class="ct nb" data-from="0" data-to="1" data-a="s7:menembus" data-d=".5">0</b> MILIAR<b class="l2" data-at="s7:5" data-fx="lit"><br><span>&gt;5 MILIAR</span></b></div>
</div>
<div class="p" data-in="s7:Filmnya" data-out="s7:Tahun">
  <div class="c" data-at="s7:US$352" data-fx="lit">FILM:<br><span>US$352 JUTA</span></div>
</div>
<div class="p" data-in="s7:Tahun" data-out="s8">
  <div class="c" data-at="s7:Sega" data-fx="lit">SEGA BELI ROVIO<b class="l2" data-at="s7:€706" data-fx="lit"><br><span>&euro;706 JUTA &middot; 2023</span></b></div>
</div>
<div class="p" data-in="s8" data-out="s8:Tulis">
  <div class="c" data-at="s8:latihan" data-fx="lit">51 GAME =<br><span>LATIHAN</span></div>
</div>
<div class="p" data-in="s8:Tulis" data-out="s8:AUDIRA">
  <div class="c" data-at="s8:Tulis" data-fx="lit">TULIS DI<br><span>KOMENTAR</span></div>
</div>`;

const css = `
.p{top:260px;left:70px;right:70px;text-align:center}
.tag{display:inline-block;font-family:${H};font-size:42px;letter-spacing:.04em;color:${INK};background:${MINT};padding:6px 20px 10px;margin:0 0 18px;border:5px solid ${INK};box-shadow:6px 6px 0 ${INK}}
.c{display:block;margin:0 auto;width:max-content;max-width:860px;font-family:${H};font-size:62px;line-height:1.14;color:${CRM};background:rgba(26,16,32,.9);padding:16px 30px 20px;border:6px solid ${ORG};box-shadow:8px 8px 0 ${INK},inset 0 0 0 4px ${INK};text-shadow:4px 4px 0 ${INK}}
.c span{color:${GOLD}}
.c .l2{font-weight:400}
#chip{top:200px;font-size:32px;opacity:.9;text-shadow:0 3px 0 ${INK}}`;

mkdirSync("hf/assets/lib", { recursive: true });
mkdirSync("hf/assets/audio", { recursive: true });
copyFileSync("world2d.js", "hf/assets/lib/world2d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "20", bg: BG, vig: 0.22, grain: 0.03, capfloor: 0.42, html, css, chipFont: "Silkscreen,monospace", chipColor: CRM, sig: "EP20_ANGRY_BIRDS_GAME_KE52",
  extraAt: ANCHORS,
  // pixel HUD: cards step in like a game dialog box (stepped scale, no smooth blur)
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:.6},{opacity:1,scale:1,duration:.2,ease:'steps(4)'},a+.05);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scale:.6,duration:.12,ease:'steps(3)'},b-.14);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:0,scale:1.15},{opacity:1,scale:1,duration:.18,ease:'steps(3)'},t),`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Pixelify Sans',sans-serif;font-weight:700;font-size:62px;line-height:1.14;color:#fff;text-shadow:5px 0 0 ${INK},-5px 0 0 ${INK},0 5px 0 ${INK},0 -5px 0 ${INK},4px 4px 0 ${INK},-4px 4px 0 ${INK},4px -4px 0 ${INK},-4px -4px 0 ${INK},0 10px 0 rgba(26,16,32,.6)}
.w{display:inline-block;margin:0 .14em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",scale:1},{color:"${GOLD}",scale:1.04,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",scale:1,duration:.08,ease:"power2.out"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:20,opacity:0},{y:0,opacity:1,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Angry Birds game ke-52", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
