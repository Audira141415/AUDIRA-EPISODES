// EP40 EXPANSION JOINT (BUILDFORGE). A daylight construction site: bridge spanning a valley, finger joint,
// tower crane, thermometer, car crossing. Panels are blueprint-style cards with yellow construction tags
// and a bold industrial font. Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1D2733", SLAB = "#F4F1EA", WARN = "#C8322A", STEEL = "#2F5F8F", YELLOW = "#F2B51C";
const HD = "Arial Black,Arial,sans-serif", MN = "'Courier New',monospace", SN = "Arial,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 40</div>
  <div class="card"><div class="big">Gigi baja<br><span class="sm">di</span> <span>jembatan</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">SIAR MUAI</div>
  <div class="ln y" data-at="s2:melintas" data-fx="lit">Guncangan saat mobil melintas</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">BAJA &amp; BETON</div>
  <div class="ln r" data-at="s3:panas" data-fx="lit">Memanjang saat panas</div>
  <div class="ln b" data-at="s3:dingin" data-fx="lit">Memendek saat dingin</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">KOEFISIEN MUAI</div>
  <div class="card" data-at="s4:derajat" data-fx="lit"><div class="big sm2">12 / sejuta<br><span>per 1 &deg;C</span></div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">DIKUNCI MATI</div>
  <div class="ln r" data-at="s5:melengkung" data-fx="lit">Lantai melengkung &amp; retak</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">PELAT BERGERIGI</div>
  <div class="ln y" data-at="s6:sisir" data-fx="lit">Dua sisir saling menyisip</div>
  <div class="ln b" data-at="s6:rata" data-fx="lit">Permukaan tetap rata</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">HITUNGAN</div>
  <div class="card" data-at="s7:enam" data-fx="lit"><div class="big sm2">+36 cm<br><span>maks 50 cm</span></div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:bernapas" data-fx="lit"><div class="big sm2">Bernapas<br><span>tanpa patah</span></div></div>
  <div class="ln y" data-at="s8:Episode" data-fx="lit">Berikutnya: kotak hitam pesawat</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.12em;color:${INK};background:${YELLOW};padding:9px 18px 8px;margin-bottom:16px;transform:rotate(-0.8deg);box-shadow:4px 4px 0 rgba(29,39,51,.3)}
.card{display:table;background:${SLAB};border-radius:4px;padding:14px 30px 20px;margin-bottom:16px;box-shadow:8px 8px 0 ${STEEL},0 20px 40px rgba(29,39,51,.35)}
.big{font-family:${HD};font-weight:900;font-size:96px;line-height:1.0;color:${INK};letter-spacing:-.01em}
.big span{color:${WARN}}.big .sm{font-size:62px;color:${INK}}.big.sm2{font-size:68px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:41px;line-height:1.2;color:${INK};background:${SLAB};padding:10px 24px 12px 22px;margin-bottom:12px;border-left:12px solid ${YELLOW};border-radius:0 4px 4px 0;box-shadow:5px 5px 0 rgba(29,39,51,.25);max-width:880px}
.ln.r{border-left-color:${WARN}}.ln.y{border-left-color:${YELLOW}}.ln.b{border-left-color:${STEEL}}
#chip{font-family:${MN};font-size:27px;font-weight:700;color:${INK};opacity:.75;letter-spacing:.06em;background:rgba(244,241,234,.7);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "40", bg: "#9CC4E4", vig: 0.28, grain: 0.06, capfloor: 0.1, html, css, chipFont: MN, chipColor: INK, sig: "EP40_EXPANSION_JOINT_GIGI_JEMBATAN",
  extraAt: [
    "s1:sengaja", "s1:retak",
    "s2:melintas",
    "s3:panas", "s3:dingin", "s3:menyusut", "s3:umurnya",
    "s4:derajat", "s4:sejuta", "s4:panjang",
    "s5:dikunci", "s5:muai", "s5:melengkung", "s5:retak",
    "s6:terperosok", "s6:panas", "s6:dingin", "s6:sisir", "s6:menjauh", "s6:rata",
    "s7:enam", "s7:setengah", "s7:tiga",
    "s8:bernapas", "s8:AUDIRA", "s8:Episode",
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:30,scale:.92},{opacity:1,y:0,scale:1,duration:.45,ease:'back.out(1.2)'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-20,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.82,x:-5},{opacity:1,x:0,duration:.28,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:58px;line-height:1.16;color:#FFF8EC;text-transform:uppercase;letter-spacing:.01em;background:rgba(29,39,51,.9);padding:10px 24px 14px;border-radius:10px;box-shadow:6px 6px 0 rgba(242,181,28,.85)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFF8EC",scale:1},{color:"#F2D58E",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFF8EC",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Expansion Joint Gigi Jembatan", "#9CC4E4");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
