// EP25 BINTIK HITAM FRIT KACA MOBIL — THERMALFORGE
// Ironbow thermal panels: dark plates, warm orange accents, solid labels ≥85% opacity.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#0d0907", INK = "#fff9c4", WARM = "#ff8f00", COLD = "#42a5f5", DARK = "rgba(13,9,7,0.92)";
const TT = "Outfit,sans-serif", MN = "'Space Mono',monospace", SN = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 25</div>
  <div class="card"><div class="big">Bintik hitam<br><span class="sm">di kaca</span> <span>mobilmu</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">FRIT</div>
  <div class="ln w" data-at="s2:dipanggang" data-fx="lit">Cat keramik &middot; dipanggang ke kaca</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">PEMASANGAN KACA</div>
  <div class="ln c" data-at="s3:karet" data-fx="lit">Dulu: karet gasket</div>
  <div class="ln w" data-at="s3:uretan" data-fx="lit">Sekarang: lem uretan</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">PELINDUNG UV</div>
  <div class="ln w" data-at="s4:payung" data-fx="lit">Frit = payung lem dari sinar UV</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">GRIP &amp; SAMARAN</div>
  <div class="ln w" data-at="s5:mencengkeram" data-fx="lit">Permukaan kasar bantu lem mencengkeram</div>
  <div class="ln c" data-at="s5:menyembunyikan" data-fx="lit">Menyembunyikan jalur lem</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">TUNGKU &amp; PANAS</div>
  <div class="ln w" data-at="s6:dipanaskan" data-fx="lit">Hitam lebih cepat panas</div>
  <div class="ln c" data-at="s6:terdistorsi" data-fx="lit">Batas tajam &rarr; distorsi</div>
  <div class="ln g" data-at="s6:bertahap" data-fx="lit">Bintik membuat panas bertahap</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">HALFTONE</div>
  <div class="ln w" data-at="s7:koran" data-fx="lit">Trik yang sama dengan titik koran</div>
  <div class="ln c" data-at="s7:silau" data-fx="lit">Bintik di spion &rarr; anti-silau</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:bekerja" data-fx="lit"><div class="big sm2">Bekerja <span>seumur kaca</span></div></div>
  <div class="ln g" data-at="s8:Episode" data-fx="lit">Berikutnya: tabung kecil di hidung pesawat</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.12em;color:${INK};background:rgba(191,54,12,0.85);padding:9px 18px 8px;margin-bottom:16px;box-shadow:5px 5px 0 rgba(255,143,0,.35)}
.card{display:table;background:${DARK};border-radius:8px;padding:16px 30px 22px;margin-bottom:16px;box-shadow:10px 10px 0 rgba(255,143,0,.25),0 22px 44px rgba(0,0,0,.5);border:2px solid rgba(255,143,0,.3)}
.big{font-family:${TT};font-weight:900;font-size:96px;line-height:1.0;color:${INK};letter-spacing:-.01em}
.big span{color:${WARM}}.big .sm{font-size:62px;color:${INK}}.big.sm2{font-size:70px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.22;color:${INK};background:${DARK};padding:10px 24px 12px 22px;margin-bottom:12px;border-left:12px solid ${WARM};border-radius:0 8px 8px 0;box-shadow:6px 6px 0 rgba(255,143,0,.2);max-width:880px}
.ln.c{border-left-color:${COLD}}.ln.w{border-left-color:${WARM}}.ln.g{border-left-color:#66bb6a}
#chip{font-family:${MN};font-size:27px;font-weight:700;color:${INK};opacity:.75;letter-spacing:.06em;background:rgba(13,9,7,.75);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "25", bg: BG, vig: 0.4, grain: 0.06, capfloor: 0.12, html, css, chipFont: MN, chipColor: INK,
  sig: "EP25_BINTIK_HITAM_FRIT_KACA_MOBIL",
  extraAt: [
    "s1:Pita", "s1:bintik-bintik", "s1:kaca", "s1:menempel",
    "s2:frit", "s2:keramik", "s2:dipanggang", "s2:menyatu", "s2:dikerok",
    "s3:Mobil", "s3:karet", "s3:merekatkan", "s3:rangka", "s3:uretan",
    "s4:rusak", "s4:ultraviolet", "s4:payung", "s4:sinar",
    "s5:permukaan", "s5:mencengkeram", "s5:menyembunyikan", "s5:pandangan",
    "s6:bintik", "s6:dipanaskan", "s6:dibengkokkan", "s6:hitam", "s6:panas",
    "s6:batasnya", "s6:terdistorsi", "s6:bertahap",
    "s7:halftone", "s7:koran", "s7:gradasi", "s7:spion", "s7:silau",
    "s8:bekerja", "s8:AUDIRA", "s8:Episode"
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:40,scale:.92},{opacity:1,y:0,scale:1,duration:.45,ease:'back.out(1.2)'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-30,scale:.95,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.75,x:-8},{opacity:1,x:0,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:50});tl.to('#outro',{opacity:1,y:0,duration:.5,ease:'power3.out'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:56px;line-height:1.16;color:#fff9c4;text-transform:uppercase;letter-spacing:.01em;background:rgba(13,9,7,.92);padding:10px 24px 14px;border-radius:10px;box-shadow:8px 8px 0 rgba(255,143,0,.4)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff9c4",scale:1},{color:"#ff8f00",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff9c4",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bintik Hitam Frit Kaca Mobil", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
