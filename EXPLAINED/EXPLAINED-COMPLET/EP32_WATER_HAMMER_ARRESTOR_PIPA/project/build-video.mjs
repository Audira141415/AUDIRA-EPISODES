// EP32 WATER HAMMER ARRESTOR. INFLATABLE: candy studio sweep, glossy vinyl toys,
// pastel pink/lilac/mint, underdamped inflate/bounce, big rounded shadows.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#e9b6cf", INK = "#3a1d4a", PINK = "#ff4a5e", MINT = "#5fe0a8", VIOLET = "#8b5cf6", YELLOW = "#ffd23f", WHITE = "#fff4f8";
const SANS = "'Arial Black', Arial, Helvetica, sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 32</div>
  <div class="card"><div class="big">DUG!<br><span class="sm">Tabrakan air di pipa</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">WATER HAMMER</div>
  <div class="ln m" data-at="s2:momentum" data-fx="lit">Air di pipa membawa momentum</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">KATUP MENUTUP</div>
  <div class="ln p" data-at="s3:menutup" data-fx="lit">Menutup dalam sekejap</div>
  <div class="ln v" data-at="s3:mengerem" data-fx="lit">Air tidak sempat mengerem</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">LONJAKAN TEKANAN</div>
  <div class="ln v" data-at="s4:dimampatkan" data-fx="lit">Air hampir tidak bisa dimampatkan</div>
  <div class="ln p" data-at="s4:gelombang" data-fx="lit">Gelombang &gt; 1.000 m/detik</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">KERUSAKAN</div>
  <div class="ln y" data-at="s5:dentuman" data-fx="lit">Dentuman yang kamu dengar</div>
  <div class="ln p" data-at="s5:merusak" data-fx="lit">Merusak katup &amp; sambungan</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">ARRESTOR</div>
  <div class="ln m" data-at="s6:piston" data-fx="lit">Piston bercincin karet</div>
  <div class="ln v" data-at="s6:bantalan" data-fx="lit">Bantalan udara bertekanan tersegel</div>
  <div class="ln y" data-at="s6:pegasan" data-fx="lit">Tabrakan &rarr; pegasan lembut</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">KENAPA TERSEGEL?</div>
  <div class="ln v" data-at="s7:larut" data-fx="lit">Udara biasa habis larut ke air</div>
  <div class="ln p" data-at="s7:empat" data-fx="lit">1 m/s &rarr; &plusmn;14 bar</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:menahan" data-fx="lit"><div class="big sm">10 cm <span>vs</span> tabrakan</div></div>
  <div class="ln y" data-at="s8:Episode" data-fx="lit">Berikutnya: jalur penyelamat rem blong</div>
</div>`;

const css = `
.tag{display:table;font-family:${SANS};font-weight:900;font-size:28px;letter-spacing:.1em;color:${WHITE};background:${INK};padding:9px 20px 8px;margin-bottom:14px;border-radius:20px;box-shadow:6px 6px 0 rgba(139,92,246,.5)}
.card{display:table;background:${WHITE};border-radius:20px;padding:14px 28px 20px;margin-bottom:14px;box-shadow:8px 8px 0 ${MINT},0 16px 40px rgba(58,29,74,.3)}
.big{font-family:${SANS};font-weight:900;font-size:96px;line-height:1.0;color:${INK}}
.big span{color:${PINK}}.big .sm{font-size:56px;color:${INK};line-height:1.1}
.ln{display:table;font-family:${SANS};font-weight:800;font-size:39px;line-height:1.2;color:${INK};background:${WHITE};padding:10px 22px 12px 20px;margin-bottom:10px;border-left:12px solid ${MINT};border-radius:0 16px 16px 0;box-shadow:6px 6px 0 rgba(58,29,74,.2);max-width:880px}
.ln.p{border-left-color:${PINK}}.ln.v{border-left-color:${VIOLET}}.ln.m{border-left-color:${MINT}}.ln.y{border-left-color:${YELLOW}}
#chip{font-family:${SANS};font-size:26px;font-weight:900;color:${INK};opacity:.7;letter-spacing:.06em;background:rgba(255,244,248,.7);padding:3px 10px;border-radius:8px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "32", bg: BG, vig: 0.22, grain: 0.04, capfloor: 0.1, html, css, chipFont: SANS, chipColor: INK, sig: "EP32_WATER_HAMMER_ARRESTOR_PIPA",
  extraAt: [
    "s1:dug", "s1:mesin", "s1:cuci", "s1:bukan", "s1:tabrakan", "s1:air#2",
    "s2:palu", "s2:kereta",
    "s3:katup",
    "s4:geraknya", "s4:Lonjakan", "s4:merambat",
    "s5:dengar", "s5:Tekanannya",
    "s6:tabung", "s6:mendadak", "s6:mendorong", "s6:tersegel", "s6:Saat",
    "s7:tersegel", "s7:Kantong", "s7:lama-lama", "s7:air", "s7:Padahal", "s7:melaju", "s7:seketika", "s7:hitungan",
    "s8:tabung", "s8:sepuluh", "s8:AUDIRA", "s8:Cara",
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
writeIndex(".", TL, "Water Hammer Arrestor", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
