// EP26 TABUNG PITOT. INFLATABLE: puffy vinyl toys, glossy saturated, candy palette sky-blue.
// Run from project/: node build-video.mjs
import { copyFileSync, mkdirSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#87DEFF", INK = "#2a3a5a", PINK = "#e6394e", MINT = "#5fe0a8", VIOLET = "#8b5cf6", YELLOW = "#ffd23f", WHITE = "#fff4f8";
const SANS = "'Arial Black', Arial, Helvetica, sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 26</div>
  <div class="card"><div class="big">PITOT<br><span class="sm">Spidometer di hidung pesawat</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">HENRI PITOT</div>
  <div class="ln m" data-at="s2:pitot" data-fx="lit">Tabung pitot dari Prancis</div>
  <div class="ln v" data-at="s2:mengukur" data-fx="lit">1732: mengukur arus Sungai Seine</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">POSISI</div>
  <div class="ln p" data-at="s3:tiga" data-fx="lit">3 tabung di dekat hidung</div>
  <div class="ln v" data-at="s3:kokpit" data-fx="lit">Di bawah jendela kokpit</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">TEKANAN TOTAL</div>
  <div class="ln m" data-at="s4:menabrak" data-fx="lit">Udara menabrak &rarr; terhenti di tabung</div>
  <div class="ln p" data-at="s4:tekanan" data-fx="lit">Tekanan naik = tekanan total</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">LUBANG STATIS</div>
  <div class="ln v" data-at="s5:statis" data-fx="lit">Di sisi badan, tidak menghadap angin</div>
  <div class="ln y" data-at="s5:merasakan" data-fx="lit">Hanya merasakan tekanan sekitar</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">PERHITUNGAN</div>
  <div class="ln m" data-at="s6:Selisih" data-fx="lit">Selisih tekanan &rarr; angka kecepatan</div>
  <div class="ln p" data-at="s6:empat" data-fx="lit">2&times; kecepatan = 4&times; selisih</div>
  <div class="ln y" data-at="s6:pemanas" data-fx="lit">Pemanas anti-es di ketinggian</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">ANCAMAN TAWON</div>
  <div class="ln p" data-at="s7:tawon" data-fx="lit">Musuh tak terduga: tawon!</div>
  <div class="ln v" data-at="s7:Boeing" data-fx="lit">1996: Boeing 757 jatuh ke laut</div>
  <div class="ln y" data-at="s7:Brisbane" data-fx="lit">Brisbane: 93 tabung tersumbat sarang</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:ditutup" data-fx="lit"><div class="big sm">Selalu ditutup <span>saat parkir</span></div></div>
  <div class="ln y" data-at="s8:Episode" data-fx="lit">Berikutnya: hidung bulat kapal</div>
</div>`;

const css = `
.tag{display:table;font-family:${SANS};font-weight:900;font-size:28px;letter-spacing:.1em;color:${WHITE};background:${INK};padding:9px 20px 8px;margin-bottom:14px;border-radius:20px;box-shadow:6px 6px 0 rgba(139,92,246,.5)}
.card{display:table;background:${WHITE};border-radius:20px;padding:14px 28px 20px;margin-bottom:14px;box-shadow:8px 8px 0 ${MINT},0 16px 40px rgba(42,58,90,.3)}
.big{font-family:${SANS};font-weight:900;font-size:96px;line-height:1.0;color:${INK}}
.big span{color:${PINK}}.big .sm{font-size:56px;color:${INK};line-height:1.1}
.ln{display:table;font-family:${SANS};font-weight:800;font-size:39px;line-height:1.2;color:${INK};background:${WHITE};padding:10px 22px 12px 20px;margin-bottom:10px;border-left:12px solid ${MINT};border-radius:0 16px 16px 0;box-shadow:6px 6px 0 rgba(42,58,90,.2);max-width:880px}
.ln.p{border-left-color:${PINK}}.ln.v{border-left-color:${VIOLET}}.ln.m{border-left-color:${MINT}}.ln.y{border-left-color:${YELLOW}}
#chip{font-family:${SANS};font-size:26px;font-weight:900;color:${INK};opacity:.7;letter-spacing:.06em;background:rgba(255,244,248,.7);padding:3px 10px;border-radius:8px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
copyFileSync("kit3d.js", L + "kit3d.js");
mkdirSync("hf/assets/audio", { recursive: true });
copyFileSync("../audio/VO_MASTER.wav", "hf/assets/audio/mix.wav");
const { AT, K } = writeWorld(TL, at, {
  ep: "26", bg: BG, vig: 0.22, grain: 0.04, capfloor: 0.1, html, css, chipFont: SANS, chipColor: INK, sig: "EP26_TABUNG_PITOT_HIDUNG_PESAWAT",
  extraAt: [
    "s1:Pesawat", "s1:tabung", "s1:angin",
    "s2:Namanya", "s2:insinyur", "s2:Henri", "s2:arus",
    "s3:Pesawat", "s3:membawa", "s3:hidung",
    "s4:Lubang", "s4:terbang", "s4:Udara", "s4:terhenti", "s4:naik", "s4:disebut", "s4:total",
    "s5:Pesawat", "s5:lubang", "s5:sisi", "s5:tekanan",
    "s6:diubah", "s6:kecepatan", "s6:Kalau", "s6:Tabungnya", "s6:es", "s6:ketinggian",
    "s7:Musuh", "s7:justru", "s7:satu", "s7:diduga", "s7:tersumbat", "s7:pesawatnya", "s7:jatuh", "s7:memasang", "s7:tercatat", "s7:tawon#2",
    "s8:Karena", "s8:tabung", "s8:selalu", "s8:pesawat", "s8:AUDIRA", "s8:Cara",
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:0.6,y:30},{opacity:1,scale:1,y:0,duration:.5,ease:'back.out(1.6)'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scale:0.85,y:-20,duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.78,scale:0.96},{opacity:1,scale:1,duration:.25,ease:'back.out(1.3)'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,scale:0.7});tl.to('#outro',{opacity:1,scale:1,duration:.5,ease:'back.out(1.5)'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SANS};font-weight:900;font-size:57px;line-height:1.16;color:${INK};text-transform:uppercase;letter-spacing:.01em;background:rgba(255,244,248,.92);padding:10px 24px 14px;border-radius:16px;box-shadow:6px 6px 0 rgba(139,92,246,.4)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",scale:1},{color:"${PINK}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Tabung Pitot", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
