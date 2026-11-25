// EP28 SILICA GEL (SATELLITEBRIEFING). Panels are analyst briefing cards: near-black glass slabs with an amber corner
// bracket, a mono "TARGET" kicker and a condensed title; they scan in with a horizontal wipe like a HUD readout.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFBE55", ICE = "#90CAF9", VOID = "#070B0E", WHITE = "#F2F5F6", BLUE = "#2E70CE";
const TT = "'Barlow Condensed',sans-serif", MN = "'JetBrains Mono',monospace", SN = "'Barlow',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 28</div>
  <div class="card"><div class="big">Silika gel <span>tidak</span><br>menyerap seperti spons</div></div>
  <div class="ln a" data-at="s1:menempel" data-fx="lit">Air menempel di dinding pori</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">TARGET 02 &middot; BAHAN</div>
  <div class="ln" data-at="s2:silikon" data-fx="lit">Silikon dioksida, sama seperti kuarsa</div>
  <div class="ln a" data-at="s2:acak" data-fx="lit">Atom acak, penuh pori</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">ARSIP &middot; 1919</div>
  <div class="ln" data-at="s3:keras" data-fx="lit">Namanya gel, tapi keras dan kering</div>
  <div class="ln a" data-at="s3:Walter" data-fx="lit">Paten: Walter Patrick, Johns Hopkins</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">ZOOM &middot; DALAM BUTIR</div>
  <div class="card" data-at="s4:dua" data-fx="lit"><div class="big sm2">Pori &plusmn;<span>2,4 nm</span></div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">PROSES</div>
  <div class="ln i" data-at="s5:adsorpsi" data-fx="lit">Adsorpsi: menempel di permukaan</div>
  <div class="ln" data-at="s5:meresap" data-fx="lit">Bukan meresap ke dalam bahan</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">UJI SERAP</div>
  <div class="ln i" data-at="s6:sepertiga" data-fx="lit">Menahan air &plusmn;1/3 beratnya</div>
  <div class="ln a" data-at="s6:seratus" data-fx="lit">Dipakai lagi setelah dipanaskan &plusmn;120 &deg;C</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">1 GRAM SILIKA GEL</div>
  <div class="ln i" data-at="s7:enam" data-fx="lit">Permukaan dalam 600&ndash;800 m&sup2;</div>
  <div class="ln a" data-at="s7:lapangan" data-fx="lit">Lapangan basket: 420 m&sup2;</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:dimakan" data-fx="lit"><div class="big sm2">Jangan <span>dimakan</span></div></div>
  <div class="ln a" data-at="s8:Episode" data-fx="lit">Berikutnya: bola pemadam api otomatis</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:27px;letter-spacing:.14em;color:${VOID};background:${AMB};padding:8px 16px 7px;margin-bottom:14px}
.card{display:table;position:relative;background:rgba(7,11,14,.86);padding:14px 30px 20px;margin-bottom:16px;border:2px solid rgba(144,202,249,.5);box-shadow:0 0 0 1px rgba(255,190,85,.25),0 18px 40px rgba(0,0,0,.5)}
.card:before{content:"";position:absolute;left:-8px;top:-8px;width:38px;height:38px;border-left:6px solid ${AMB};border-top:6px solid ${AMB}}
.big{font-family:${TT};font-weight:800;font-size:96px;line-height:.98;color:${WHITE};text-transform:uppercase;letter-spacing:.01em}
.big span{color:${AMB}}.big.sm2{font-size:80px}
.ln{display:table;font-family:${SN};font-weight:700;font-size:40px;line-height:1.2;color:${WHITE};background:rgba(7,11,14,.86);padding:10px 24px 12px 22px;margin-bottom:12px;border-left:10px solid ${BLUE};max-width:880px}
.ln.a{border-left-color:${AMB}}.ln.i{border-left-color:${ICE}}
#chip{font-family:${MN};font-size:24px;font-weight:700;color:${AMB};opacity:.85;letter-spacing:.08em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "28", bg: VOID, vig: 0.5, grain: 0.06, capfloor: 0.45, html, css, chipFont: MN, chipColor: AMB, sig: "EP28_BUTIRAN_PENYERAP_SILIKA_GEL",
  extraAt: ["s1:menempel", "s2:sepatu", "s2:tas", "s2:botol", "s2:Bahannya", "s2:silikon", "s2:kuarsa", "s2:acak", "s3:gel", "s3:keras", "s3:dipatenkan", "s3:Walter",
    "s4:jaringan", "s4:dua", "s4:nanometer", "s5:masuk", "s5:menempel", "s5:adsorpsi", "s5:meresap", "s6:menahan", "s6:sepertiga", "s6:jenuh", "s6:dipanaskan", "s6:seratus",
    "s7:enam", "s7:delapan", "s7:lapangan", "s7:empat", "s8:dimakan", "s8:AUDIRA", "s8:Episode", "s1:spons", "s3:belas", "s4:mikroskop", "s8:tersedak"],
  // HUD readout: wipes in left to right with a scan line feel, cuts out with a quick collapse
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.42,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scaleY:.2,duration:.22,ease:'power2.in'},b-.22);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.78,x:-6},{opacity:1,x:0,duration:.28,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0});tl.to('#outro',{opacity:1,duration:.4,ease:'power2.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${TT};font-weight:800;font-size:64px;line-height:1.1;color:${WHITE};text-transform:uppercase;background:rgba(7,11,14,.9);padding:8px 24px 12px;border-bottom:5px solid ${AMB}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WHITE}",scale:1},{color:"${AMB}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WHITE}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:.4},{opacity:1,duration:.15,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Silika Gel", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
