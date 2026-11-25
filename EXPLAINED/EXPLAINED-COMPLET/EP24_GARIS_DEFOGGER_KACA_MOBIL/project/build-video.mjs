// EP24 GARIS DEFOGGER (KINTSUGI). Panels are obsidian lacquer cards with a gold hairline and a gold seam crack across
// the corner; titles in a high-contrast serif, a small gold tag above. They rise and settle like a lid set down on a box.
// Every word anchor used by world3d.js and mix.py is scanned from those files into extraAt, so none can be forgotten.
// Run from project/: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const OBS = "#141417", GOLD = "#E5A93C", GOLDL = "#FFD56B", PORC = "#F7F7F9", HEAT = "#FF8A3A";
const TT = "'Cormorant Garamond',serif", SN = "Inter,sans-serif", MN = "'IBM Plex Mono',monospace";

const scan = (f, re) => [...readFileSync(f, "utf8").matchAll(re)].map((m) => m[1]);
const extraAt = [...new Set([...scan("world3d.js", /A\("(s\d:[^"]+)"\)/g), ...scan("mix.py", /AT\["(s\d:[^"]+)"\]/g), ...scan("mix.py", /"(s\d:[^"]+)"/g)])];

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 24</div>
  <div class="card"><div class="big">Garis ini<br><span>pemanas</span></div></div>
  <div class="ln" data-at="s1:dicetak" data-fx="lit">Dicetak langsung di kaca</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">DEFOGGER</div>
  <div class="ln" data-at="s2:embun" data-fx="lit">Menghapus embun</div>
  <div class="ln" data-at="s2:es" data-fx="lit">dan bunga es</div>
  <div class="ln c" data-at="s2:spion" data-fx="lit">Pandangan lewat spion tengah</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">KENAPA KACA BURAM</div>
  <div class="ln c" data-at="s3:dingin" data-fx="lit">Kaca lebih dingin dari titik embun</div>
  <div class="ln c" data-at="s3:menempel" data-fx="lit">Uap air menempel jadi titik air</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">BAHAN GARIS</div>
  <div class="ln" data-at="s4:keramik" data-fx="lit">Keramik + perak</div>
  <div class="ln" data-at="s4:dipanggang" data-fx="lit">Dicetak, lalu dipanggang</div>
  <div class="ln" data-at="s4:sejajar" data-fx="lit">Sejajar, sisi ke sisi</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">ARUS JADI PANAS</div>
  <div class="ln" data-at="s5:tombolnya" data-fx="lit">Tombol ditekan, arus mengalir</div>
  <div class="card" data-at="s5:panas" data-fx="lit"><div class="big sm">Hambatan &rarr; <span class="h">panas</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">KACA MENGHANGAT</div>
  <div class="ln" data-at="s6:menguap" data-fx="lit">Embun menguap, es mencair</div>
  <div class="card" data-at="s6:menit" data-fx="lit"><div class="big sm">Mati sendiri<br><span>&plusmn;10&ndash;15 menit</span></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card" data-at="s7:watt" data-fx="lit"><div class="big sm"><span>&plusmn;150 W</span> &asymp; lampu depan</div></div>
  <div class="ln" data-at="s7:Heinz" data-fx="lit">Heinz Kunert &middot; Jerman &middot; awal 1960-an</div>
  <div class="ln" data-at="s7:paten" data-fx="lit">Lebih dari 50 paten kaca kendaraan</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">RAWAT GARISNYA</div>
  <div class="ln h" data-at="s8:tergores" data-fx="lit">Mudah putus kalau tergores</div>
  <div class="ln" data-at="s8:lembut" data-fx="lit">Bersihkan dengan lembut</div>
  <div class="ln c" data-at="s8:Episode" data-fx="lit">Berikutnya: bintik hitam di tepi kaca</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:600;font-size:27px;letter-spacing:.16em;color:${GOLDL};background:rgba(20,20,23,.88);padding:8px 18px 7px;margin-bottom:16px;border:1.5px solid ${GOLD};border-radius:3px}
.card{position:relative;display:table;background:rgba(20,20,23,.9);border:2px solid ${GOLD};border-radius:10px;padding:14px 32px 22px;margin-bottom:16px;box-shadow:0 22px 50px rgba(0,0,0,.45);overflow:hidden}
.card::after{content:"";position:absolute;right:-10px;top:18px;width:150px;height:3px;background:linear-gradient(90deg,rgba(229,169,60,0),${GOLDL});transform:rotate(-28deg);box-shadow:0 0 10px rgba(255,213,107,.8)}
.big{font-family:${TT};font-weight:700;font-size:104px;line-height:.98;color:${PORC};letter-spacing:-.005em}
.big span{color:${GOLDL}}.big span.h{color:${HEAT}}.big.sm{font-size:74px;line-height:1.04}
.ln{display:table;font-family:${SN};font-weight:700;font-size:40px;line-height:1.2;color:${PORC};background:rgba(20,20,23,.86);padding:10px 24px 12px 22px;margin-bottom:12px;border-left:8px solid ${GOLD};border-radius:0 8px 8px 0;max-width:880px}
.ln.c{border-left-color:#9DB6C6}.ln.h{border-left-color:${HEAT}}
#chip{font-family:${MN};font-size:25px;font-weight:600;color:${PORC};opacity:.8;letter-spacing:.06em;background:rgba(20,20,23,.6);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "24", bg: "#3a322b", vig: 0.3, grain: 0.05, capfloor: 0.12, html, css, chipFont: MN, chipColor: PORC, sig: "EP24_GARIS_DEFOGGER_KACA_MOBIL",
  extraAt,
  // panels rise and settle like a lacquer lid set onto its box
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:34,scale:.97,filter:'blur(6px)'},{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-18,filter:'blur(4px)',duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.45},{opacity:1,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:800;font-size:56px;line-height:1.16;color:${PORC};text-transform:uppercase;letter-spacing:.01em;background:rgba(20,20,23,.88);padding:10px 24px 14px;border-radius:10px;border-bottom:3px solid ${GOLD}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${PORC}",scale:1},{color:"${GOLDL}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${PORC}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Garis Defogger", "#3a322b");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
