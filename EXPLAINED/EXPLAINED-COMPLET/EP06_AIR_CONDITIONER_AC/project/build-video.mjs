// EP06 AIR CONDITIONER. PAPERWORLD rebuild r13: a chibi paper guide walks through a 1902 print shop, a cutaway house
// with a split AC (roof unit) and a sunburst chart stage. Panels are cream cardstock notes with an offset coloured card behind them (a second paper
// layer), a serif title and a coral tag strip; they unfold upward from a slight tilt like a card standing up.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#3B2A22", PAPER = "#F7EFDF", CORAL = "#C4614F", MINT = "#3E8F75", GOLD = "#C38F2B";
const TT = "Fraunces,serif", MN = "'Space Mono',monospace", SN = "Nunito,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 06</div>
  <div class="card"><div class="big">AC pertama<br><span class="sm">dibuat untuk</span> <span>kertas</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">BROOKLYN &middot; 1902</div>
  <div class="ln h" data-at="s2:lembap" data-fx="lit">Udara lembap, warna cetakan meleset</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">WILLIS CARRIER &middot; 1902</div>
  <div class="ln c" data-at="s3:mendinginkan" data-fx="lit">Mendinginkan + mengatur kelembapan</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">AC DI KAMARMU</div>
  <div class="ln c" data-at="s4:evaporator" data-fx="lit">Pipa evaporator sangat dingin</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">AIR DARI UDARA</div>
  <div class="card" data-at="s5:bocor" data-fx="lit"><div class="big sm2">Embun, <span>bukan bocor</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">UNIT LUAR</div>
  <div class="ln g" data-at="s6:inverter" data-fx="lit">Inverter: kecepatan naik turun</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card" data-at="s7:tiga" data-fx="lit"><div class="big sm2">Panas &gt; <span>3&times;</span> listrik</div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:pendingin" data-fx="lit"><div class="big sm2">Pendingin <span>+ pengering</span></div></div>
  <div class="ln g" data-at="s8:Episode" data-fx="lit">Berikutnya: korek api gas</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.12em;color:#FFF8EC;background:${CORAL};padding:9px 18px 8px;margin-bottom:16px;transform:rotate(-1.2deg);box-shadow:5px 5px 0 rgba(59,42,34,.28)}
.card{display:table;background:${PAPER};border-radius:6px;padding:14px 30px 20px;margin-bottom:16px;box-shadow:10px 10px 0 #9DD1BB,0 22px 44px rgba(59,42,34,.35)}
.big{font-family:${TT};font-weight:900;font-size:98px;line-height:1.0;color:${INK};letter-spacing:-.01em}
.big span{color:${CORAL}}.big .sm{font-size:64px;color:${INK}}.big.sm2{font-size:70px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:41px;line-height:1.2;color:${INK};background:${PAPER};padding:10px 24px 12px 22px;margin-bottom:12px;border-left:12px solid ${GOLD};border-radius:0 6px 6px 0;box-shadow:6px 6px 0 rgba(59,42,34,.25);max-width:880px}
.ln.c{border-left-color:#6EAA93}.ln.h{border-left-color:${CORAL}}.ln.g{border-left-color:#5F7CB6}
#chip{font-family:${MN};font-size:27px;font-weight:700;color:${INK};opacity:.75;letter-spacing:.06em;background:rgba(247,239,223,.7);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "06", bg: "#EADCC3", vig: 0.32, grain: 0.07, capfloor: 0.1, html, css, chipFont: MN, chipColor: INK, sig: "EP06_AIR_CONDITIONER_AC",
  extraAt: ["s2:meleset", "s6:membuang", "s1:kertas", "s7:sembilan", "s2:percetakan", "s2:mengembang", "s3:Willis", "s3:mengatur", "s4:dua", "s4:Kipas", "s5:selang", "s5:bocor", "s6:refrigeran", "s6:kompresor", "s6:inverter", "s7:tujuh", "s7:tiga", "s8:AUDIRA", "s8:Episode", "s2:Udaranya", "s2:Kertasnya", "s2:warna", "s3:merancang", "s3:udara", "s3:kelembapannya", "s4:unit", "s4:dingin",
    "s5:menyentuh", "s5:tetesan", "s5:ditampung", "s5:menetes", "s6:Panas", "s6:tembaga", "s6:kondensor", "s6:kipasnya", "s6:Kecepatannya",
    "s7:PK", "s7:split", "s7:dua", "s8:pengering", "s2:sebuah", "s2:Brooklyn", "s2:masalah", "s5:sendiri", "s6:luar", "s5:mengembun", "s3:mendinginkan", "s4:evaporator"],
  // panels stand up like a paper card hinged at its bottom edge
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,rotationX:-62,y:26,transformPerspective:900,transformOrigin:'50% 100%'},{opacity:1,rotationX:0,y:0,duration:.5,ease:'back.out(1.3)'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,rotationX:50,y:-16,transformPerspective:900,transformOrigin:'50% 0%',duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.82,x:-6},{opacity:1,x:0,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:58px;line-height:1.16;color:#FFF8EC;text-transform:uppercase;letter-spacing:.01em;background:rgba(59,42,34,.9);padding:10px 24px 14px;border-radius:12px;box-shadow:8px 8px 0 rgba(196,97,79,.92)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFF8EC",scale:1},{color:"#F2D58E",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFF8EC",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Air Conditioner", "#EADCC3");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
