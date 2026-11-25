// EP13 PULPEN BOLPOIN — MANUSCRIPT style. Candlelit scriptorium with a giant cutaway ballpoint.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const ROOM = "#0E0906", PARCH = "#E8D5AC", INK = "#2A1A10", GOLD = "#E6B94C", RUBRIC = "#B0301E", LAPIS = "#24418C";
const SR = "Georgia,'Times New Roman',serif", MN = "'Courier New',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 13</div>
  <div class="card"><div class="big">Bola yang<br><span>menggelinding</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">JOHN LOUD &middot; 1888</div>
  <div class="ln r" data-at="s2:kayu" data-fx="lit">Menandai kayu dan kertas kasar</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">L&Aacute;SZL&Oacute; B&Iacute;R&Oacute;</div>
  <div class="ln b" data-at="s3:koran" data-fx="lit">Tinta koran: cepat kering, tapi kental</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">PATEN &middot; 1938</div>
  <div class="ln g" data-at="s4:terjepit" data-fx="lit">Bola terjepit di dudukan, bebas berputar</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">TABUNG TINTA</div>
  <div class="card" data-at="s5:gravitasi" data-fx="lit"><div class="big sm2">Gravitasi<br>+ <span>kapiler</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">MEKANISME</div>
  <div class="ln g" data-at="s6:basah" data-fx="lit">Basah &rarr; tempel &rarr; kering &rarr; isi ulang</div>
  <div class="ln r" data-at="s6:Alur" data-fx="lit">Alur dudukan menjaga tinta</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">FISHER SPACE PEN</div>
  <div class="ln b" data-at="s7:gas" data-fx="lit">Gas menekan tinta &rarr; menulis terbalik</div>
  <div class="ln g" data-at="s7:air" data-fx="lit">Bahkan di bawah air</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:menggelinding" data-fx="lit"><div class="big sm2">Jejak bola<br><span>menggelinding</span></div></div>
  <div class="ln g" data-at="s8:AUDIRA" data-fx="lit">Berikutnya: eskalator</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:26px;letter-spacing:.14em;color:${PARCH};background:${INK};padding:8px 16px 7px;margin-bottom:14px;border-left:6px solid ${GOLD};box-shadow:4px 4px 0 rgba(166,122,34,.45)}
.card{display:table;background:${PARCH};border-radius:4px;padding:14px 28px 18px;margin-bottom:14px;box-shadow:8px 8px 0 rgba(42,26,16,.3),0 20px 40px rgba(14,9,6,.5)}
.big{font-family:${SR};font-weight:900;font-size:92px;line-height:1.05;color:${INK};letter-spacing:-.01em}
.big span{color:${RUBRIC}}.big.sm2{font-size:68px;line-height:1.08}
.ln{display:table;font-family:${SR};font-weight:700;font-size:40px;line-height:1.2;color:${PARCH};background:rgba(14,9,6,.82);padding:10px 22px 12px 20px;margin-bottom:10px;border-left:10px solid ${GOLD};border-radius:0 4px 4px 0;box-shadow:5px 5px 0 rgba(42,26,16,.35);max-width:880px}
.ln.r{border-left-color:${RUBRIC}}.ln.b{border-left-color:${LAPIS}}.ln.g{border-left-color:#3E7F6A}
#chip{font-family:${MN};font-size:25px;font-weight:700;color:${PARCH};opacity:.7;letter-spacing:.08em;background:rgba(14,9,6,.6);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "13", bg: ROOM, vig: 0.36, grain: 0.08, capfloor: 0.1, html, css,
  chipFont: MN, chipColor: PARCH, sig: "EP13_PULPEN_BOLPOIN",
  extraAt: [
    "s1:bola", "s1:berputar",
    "s2:kayu", "s2:Goresannya",
    "s3:koran", "s3:kental",
    "s4:ujungnya", "s4:terjepit", "s4:mematenkan",
    "s5:tabung", "s5:turun", "s5:gravitasi", "s5:kapiler", "s5:membasahi",
    "s6:menggeser", "s6:basah", "s6:Alur",
    "s7:gravitasi", "s7:terbalik", "s7:menjauh", "s7:angkasa", "s7:gas", "s7:disegel", "s7:air", "s7:terbalik#2",
    "s8:menggelinding", "s8:AUDIRA",
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:20,scale:.96},{opacity:1,y:0,scale:1,duration:.45,ease:'power3.out'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-14,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.8,x:-5},{opacity:1,x:0,duration:.28,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:36});tl.to('#outro',{opacity:1,y:0,duration:.4,ease:'power3.out'},OUT-.1);`,
});

const SN = "Georgia,'Times New Roman',serif";
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:800;font-size:56px;line-height:1.16;color:#F3E4C4;text-transform:uppercase;letter-spacing:.01em;background:rgba(14,9,6,.88);padding:10px 22px 14px;border-radius:10px;box-shadow:6px 6px 0 rgba(230,185,76,.5)}
.w{display:inline-block;margin:0 .18em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#F3E4C4",scale:1},{color:"#E6B94C",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F3E4C4",scale:1,duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:12},{y:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pulpen Bolpoin", ROOM);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
