// EP42 DETEKTOR ASAP IONISASI. INFLATABLE: bouncy PVC dome, colorful ion balls.
// Run from project/: node build-video.mjs
import { copyFileSync, mkdirSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#B8E8FF", INK = "#2D1B4E", CORAL = "#FF6B8A", MINT = "#7EEDC6", YELLOW = "#FFD166", VIOLET = "#8b5cf6", WHITE = "#FFF4F8";
const SANS = "'Arial Black', Arial, Helvetica, sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 42</div>
  <div class="card"><div class="big">ASAP?<br><span class="sm">Bukan dicium, tapi diukur arusnya</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">RUANG IONISASI</div>
  <div class="ln m" data-at="s2:ruang" data-fx="lit">Ruang kecil berisi udara</div>
  <div class="ln v" data-at="s2:pelat" data-fx="lit">Dua pelat logam + tegangan baterai</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">AMERISIUM-241</div>
  <div class="ln c" data-at="s3:amerisium" data-fx="lit">Sumber Am-241 &lt; 1 mikrogram</div>
  <div class="ln v" data-at="s3:paruhnya" data-fx="lit">Waktu paruh &plusmn;432 tahun</div>
  <div class="ln y" data-at="s3:aktif" data-fx="lit">Aktif sepanjang umur detektor</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">PARTIKEL ALFA</div>
  <div class="ln c" data-at="s4:alfa" data-fx="lit">Memancarkan partikel alfa</div>
  <div class="ln m" data-at="s4:menabrak" data-fx="lit">Menabrak O&#8322; &amp; N&#8322;</div>
  <div class="ln v" data-at="s4:ion" data-fx="lit">Udara berubah jadi ion bermuatan</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">ARUS TETAP</div>
  <div class="ln c" data-at="s5:positif" data-fx="lit">Ion &oplus; &rarr; pelat &ominus;</div>
  <div class="ln m" data-at="s5:mengalir" data-fx="lit">Arus kecil mengalir siang &amp; malam</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">ALARM!</div>
  <div class="ln c" data-at="s6:asap" data-fx="lit">Asap menyerap partikel alfa</div>
  <div class="ln v" data-at="s6:turun" data-fx="lit">Arus turun &rarr; alarm berbunyi</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">AMANKAH?</div>
  <div class="ln m" data-at="s7:alfa" data-fx="lit">Alfa hanya beberapa cm di udara</div>
  <div class="ln v" data-at="s7:dosis" data-fx="lit">2 detektor &asymp; radiasi alam 12 jam</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:detektormu" data-fx="lit"><div class="big sm">Biarkan utuh <span>&amp; terpasang</span></div></div>
  <div class="ln y" data-at="s8:Episode" data-fx="lit">Berikutnya: kabel internet bawah laut</div>
</div>`;

const css = `
.tag{display:table;font-family:${SANS};font-weight:900;font-size:28px;letter-spacing:.1em;color:${WHITE};background:${INK};padding:9px 20px 8px;margin-bottom:14px;border-radius:20px;box-shadow:6px 6px 0 rgba(139,92,246,.5)}
.card{display:table;background:${WHITE};border-radius:20px;padding:14px 28px 20px;margin-bottom:14px;box-shadow:8px 8px 0 ${MINT},0 16px 40px rgba(45,27,78,.3)}
.big{font-family:${SANS};font-weight:900;font-size:96px;line-height:1.0;color:${INK}}
.big span{color:${CORAL}}.big .sm{font-size:56px;color:${INK};line-height:1.1}
.ln{display:table;font-family:${SANS};font-weight:800;font-size:39px;line-height:1.2;color:${INK};background:${WHITE};padding:10px 22px 12px 20px;margin-bottom:10px;border-left:12px solid ${MINT};border-radius:0 16px 16px 0;box-shadow:6px 6px 0 rgba(45,27,78,.2);max-width:880px}
.ln.c{border-left-color:${CORAL}}.ln.v{border-left-color:${VIOLET}}.ln.m{border-left-color:${MINT}}.ln.y{border-left-color:${YELLOW}}
#chip{font-family:${SANS};font-size:26px;font-weight:900;color:${INK};opacity:.7;letter-spacing:.06em;background:rgba(255,244,248,.7);padding:3px 10px;border-radius:8px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
mkdirSync("hf/assets/audio", { recursive: true });
copyFileSync("../audio/VO_MASTER.wav", "hf/assets/audio/mix.wav");
const { AT, K } = writeWorld(TL, at, {
  ep: "42", bg: BG, vig: 0.22, grain: 0.04, capfloor: 0.1, html, css, chipFont: SANS, chipColor: INK, sig: "EP42_DETEKTOR_ASAP_IONISASI_AMERISIUM",
  extraAt: [
    "s1:Detektor", "s1:ionisasi", "s1:arus", "s1:melemah",
    "s2:Kuncinya", "s2:kecil", "s2:ionisasi", "s2:logam", "s2:baterai",
    "s3:amerisium", "s3:mikrogram", "s3:logam", "s3:aktif", "s3:detektor",
    "s4:Amerisium", "s4:partikel", "s4:oksigen", "s4:merebut", "s4:bermuatan",
    "s5:Ion", "s5:negatif", "s5:Hasilnya", "s5:terus", "s5:malam",
    "s6:Saat", "s6:partikel", "s6:mengikat", "s6:Arus", "s6:alarm",
    "s7:Lalu", "s7:Partikel", "s7:sentimeter", "s7:Menurut", "s7:radiasi", "s7:jam",
    "s8:Jadi", "s8:utuh", "s8:AUDIRA", "s8:Cara", "s8:berikutnya",
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
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",scale:1},{color:"${CORAL}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Detektor Asap Ionisasi", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
