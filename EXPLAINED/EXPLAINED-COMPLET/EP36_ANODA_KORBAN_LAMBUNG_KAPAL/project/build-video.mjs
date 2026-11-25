// EP36 ANODA KORBAN (ABYSSFORGE): a submersible dive along a steel hull. Panels are sonar HUD read-outs: deep navy glass
// with a cyan scan edge, a depth tag in mono, Chakra Petch titles; they boot in with a scan line (clip from the left).
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CY = "#56F0FF", MG = "#FF5AD8", AMB = "#FFB060", INK = "#021019";
const TT = "'Chakra Petch',sans-serif", MN = "'Space Mono',monospace", SN = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 36</div>
  <div class="card"><div class="big">Logam yang<br><span>sengaja habis</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">AIR LAUT</div>
  <div class="ln" data-at="s2:menghantarkan" data-fx="lit">Garamnya menghantarkan listrik</div>
  <div class="ln m" data-at="s2:berkarat" data-fx="lit">Lambung pelan-pelan berkarat</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">KARAT = REAKSI LISTRIK</div>
  <div class="ln" data-at="s3:elektron" data-fx="lit">Atom besi melepas elektron</div>
  <div class="ln a" data-at="s3:larut" data-fx="lit">Besinya larut ke air</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">PENANGKALNYA</div>
  <div class="card" data-at="s4:seng" data-fx="lit"><div class="big sm2">Seng <span>/ aluminium</span></div></div>
  <div class="ln" data-at="s4:air" data-fx="lit">Dilas atau dibaut, di bawah garis air</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">BATERAI KECIL</div>
  <div class="card" data-at="s5:volt" data-fx="lit"><div class="big sm2">&plusmn;0,5 V <span>lebih negatif</span></div></div>
  <div class="ln" data-at="s5:mengalir" data-fx="lit">Elektron: balok &rarr; lambung</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">ANODA KORBAN</div>
  <div class="ln" data-at="s6:larut" data-fx="lit">Balok yang larut, baja aman</div>
  <div class="ln" data-at="s6:buritan" data-fx="lit">Terbanyak di buritan</div>
  <div class="ln m" data-at="s6:terendam" data-fx="lit">Syaratnya: harus terendam</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">PENGORBANAN TERUKUR</div>
  <div class="card" data-at="s7:sebelas" data-fx="lit"><div class="big sm2">1 A &times; 1 tahun<br><span>&asymp; 11 kg seng</span></div></div>
  <div class="ln a" data-at="s7:Davy" data-fx="lit">Humphry Davy &middot; 1824</div>
  <div class="ln m" data-at="s7:dihentikan" data-fx="lit">Teritip tumbuh, proyek dihentikan</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:pengawal" data-fx="lit"><div class="big sm2">Pengawal <span>yang rela habis</span></div></div>
  <div class="ln" data-at="s8:Episode" data-fx="lit">Berikutnya: batu di rel kereta</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.14em;color:${INK};background:${CY};padding:8px 18px 7px;margin-bottom:14px;box-shadow:0 0 26px rgba(86,240,255,.55)}
.card{display:table;background:rgba(2,16,25,.82);border:2px solid rgba(86,240,255,.7);border-left:10px solid ${CY};padding:14px 30px 20px;margin-bottom:14px;box-shadow:0 0 40px rgba(86,240,255,.25),0 24px 50px rgba(0,0,0,.5)}
.big{font-family:${TT};font-weight:700;font-size:96px;line-height:1.0;color:#EAFDFF;letter-spacing:-.01em;text-shadow:0 0 18px rgba(86,240,255,.35)}
.big span{color:${CY}}.big.sm2{font-size:72px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:41px;line-height:1.2;color:#EAFDFF;background:rgba(2,16,25,.8);padding:10px 24px 12px 22px;margin-bottom:10px;border-left:10px solid ${CY};max-width:900px}
.ln.m{border-left-color:${MG}}.ln.a{border-left-color:${AMB}}
#chip{font-family:${MN};font-size:26px;font-weight:700;color:#BFF8FF;opacity:.75;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
// every anchor used by world3d.js and mix.py (world-only anchors would otherwise repeat the previous frame)
export const WORDS = ["s1:habis", "s2:Garamnya", "s2:menghantarkan", "s2:listrik", "s2:Akibatnya", "s2:berkarat", "s3:besi", "s3:elektron", "s3:larut",
  "s4:Penangkalnya", "s4:seng", "s4:Balok", "s4:dilas", "s4:dibaut", "s4:air", "s5:volt", "s5:baja", "s5:tersambung", "s5:baterai", "s5:elektron", "s5:mengalir",
  "s6:larut", "s6:elektron", "s6:korban", "s6:buritan", "s6:terendam", "s6:udara", "s7:ampere", "s7:setahun", "s7:sebelas", "s7:seng", "s7:Davy", "s7:Tembaganya",
  "s7:teritip", "s7:subur", "s7:dihentikan", "s8:naik", "s8:pengawal", "s8:AUDIRA", "s8:Episode"];
const { AT, K } = writeWorld(TL, at, {
  ep: "36", bg: "#0B3A52", vig: 0.5, grain: 0.06, capfloor: 0.35, html, css, chipFont: MN, chipColor: "#BFF8FF", sig: "EP36_ANODA_KORBAN_LAMBUNG_KAPAL",
  extraAt: WORDS,
  // panels boot like a sonar read-out: a scan wipe from the left with a short cyan flicker
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,clipPath:'inset(0 100% 0 0)',x:-18},{opacity:1,clipPath:'inset(0 0% 0 0)',x:0,duration:.45,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,clipPath:'inset(0 0 0 100%)',duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.55,filter:'brightness(.75)'},{opacity:1,filter:'brightness(1.15)',duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,scale:.94});tl.to('#outro',{opacity:1,scale:1,duration:.5,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:58px;line-height:1.16;color:#EAFDFF;text-transform:uppercase;letter-spacing:.01em;background:rgba(2,16,25,.86);padding:10px 24px 14px;border-radius:6px;border-bottom:4px solid ${CY}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#EAFDFF",scale:1},{color:"${CY}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#EAFDFF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Anoda Korban", "#0B3A52");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
