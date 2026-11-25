// EP16 LAYAR SENTUH HP. CIRCUITFORGE: panels are silkscreened board labels: a dark solder-mask plate with a gold
// edge, a cyan pin-header tag and an amber accent word; they power on with a short scan wipe like a test probe.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const MASK = "#06170f", GOLD = "#d4af37", AMB = "#ffb703", CY = "#00f0ff", SILK = "#f1f5f9", GRN = "#22c55e";
const TT = "'IBM Plex Sans',sans-serif", MN = "'IBM Plex Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 16</div>
  <div class="card"><div class="big">Layar HP<br><span class="sm">membaca</span> <span>listrik</span><br><span class="sm">bukan tekanan</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">DUA JENIS LAYAR</div>
  <div class="ln c" data-at="s2:kapasitif" data-fx="lit">Hampir semua ponsel: kapasitif</div>
  <div class="ln" data-at="s2:resistif" data-fx="lit">Layar lama resistif: harus ditekan</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">DI BAWAH KACA</div>
  <div class="ln c" data-at="s3:bening" data-fx="lit">Lapisan bening penghantar listrik</div>
  <div class="ln" data-at="s3:indium" data-fx="lit">Biasanya indium tin oxide (ITO)</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">JARING TAK TERLIHAT</div>
  <div class="ln" data-at="s4:mendatar" data-fx="lit">Garis mendatar = baris</div>
  <div class="ln c" data-at="s4:tegak" data-fx="lit">Garis tegak = kolom</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">TIAP PERSILANGAN</div>
  <div class="card" data-at="s5:kapasitor" data-fx="lit"><div class="big sm2">Kapasitor <span>kecil</span></div></div>
  <div class="ln c" data-at="s5:denyut" data-fx="lit">Chip kirim denyut ke tiap baris, ukur tiap kolom</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">JARI MENDEKAT</div>
  <div class="ln" data-at="s6:turun" data-fx="lit">Medan tertarik ke jari, kapasitansi turun</div>
  <div class="ln c" data-at="s6:bersamaan" data-fx="lit">Beberapa jari terbaca bersamaan</div>
  <div class="ln g" data-at="s6:gagal" data-fx="lit">Sarung tangan tebal: sering gagal</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">TITIK UKUR</div>
  <div class="card" data-at="s7:titik" data-fx="lit"><div class="big sm2">12 &times; 16 = <span>192</span></div></div>
  <div class="ln c" data-at="s7:tujuh" data-fx="lit">Dikembangkan di CERN, 1970-an</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:dicuri" data-fx="lit"><div class="big sm2">Listrik yang <span>dicuri jarimu</span></div></div>
  <div class="ln c" data-at="s8:Episode" data-fx="lit">Berikutnya: sprinkler pemadam gedung</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.14em;color:${MASK};background:${CY};padding:8px 18px 7px;margin-bottom:16px;clip-path:polygon(0 0,100% 0,100% 70%,96% 100%,0 100%)}
.card{display:table;background:rgba(6,23,15,.93);border:3px solid ${GOLD};border-radius:10px;padding:12px 30px 18px;margin-bottom:16px;box-shadow:0 0 24px rgba(255,183,3,.18),0 22px 44px rgba(0,0,0,.5)}
.big{font-family:${TT};font-weight:700;font-size:90px;line-height:1.0;color:${SILK};letter-spacing:-.02em}
.big span{color:${AMB}}.big .sm{font-size:56px;color:#a9c9b8}.big.sm2{font-size:74px;line-height:1.05}
.ln{display:table;font-family:${TT};font-weight:700;font-size:41px;line-height:1.18;color:${SILK};background:rgba(6,23,15,.93);padding:10px 24px 12px 22px;margin-bottom:12px;border-left:12px solid ${AMB};border-radius:0 8px 8px 0;max-width:860px}
.ln.c{border-left-color:${CY}}.ln.g{border-left-color:${GRN}}
#chip{font-family:${MN};font-size:24px;font-weight:700;color:${GOLD};opacity:.85;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "16", bg: MASK, vig: 0.4, grain: 0.05, capfloor: 0.3, html, css, chipFont: MN, chipColor: GOLD, sig: "EP16_LAYAR_SENTUH_HP",
  extraAt: ["s1:tekanan", "s1:listrik", "s2:kapasitif", "s2:resistif", "s2:ditekan", "s2:bersentuhan", "s3:kacanya", "s3:bening", "s3:menghantarkan",
    "s3:indium", "s4:mendatar", "s4:tegak", "s4:jaring", "s4:mata", "s5:kapasitor", "s5:denyut", "s5:mengukur", "s5:Chip", "s6:Tubuhmu",
    "s6:mendekat", "s6:tertarik", "s6:turun", "s6:mencatat", "s6:beberapa", "s6:bersamaan", "s6:Sarung", "s6:gagal", "s7:Jaring", "s7:dua",
    "s7:enam", "s7:seratus", "s7:titik", "s7:CERN", "s7:tujuh", "s7:akselerator", "s8:tekanan", "s8:dicuri", "s8:AUDIRA", "s8:Episode"],
  // panels power on: a probe-scan wipe from top to bottom
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:-20,clipPath:'inset(0 0 100% 0)'},{opacity:1,y:0,clipPath:'inset(0 0 0% 0)',duration:.42,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-14,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.45},{opacity:1,duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:30});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${TT};font-weight:700;font-size:58px;line-height:1.16;color:${SILK};text-transform:uppercase;letter-spacing:.01em;background:rgba(6,23,15,.92);padding:10px 24px 14px;border-radius:10px;border:2px solid rgba(212,175,55,.6)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${SILK}",scale:1},{color:"${AMB}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${SILK}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Layar Sentuh HP", MASK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
