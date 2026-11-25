// EP11 TERMOS AIR PANAS. THERMALFORGE: ironbow thermal-vision panels.
// Dark purple backgrounds with warm-to-cool gradient accents, infrared readout style.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const VOID = "#1B0533", HOT = "#FF5722", WARM = "#E8A838", CYAN = "#00A5CF", COOL = "#2D1B69";
const MN = "'Space Mono',monospace", SN = "Nunito,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 11</div>
  <div class="card"><div class="big">Termos pertama<br>untuk <span>gas cair</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">JAMES DEWAR &middot; 1892</div>
  <div class="ln h" data-at="s2:mendidih" data-fx="heat">Oksigen cair cepat mendidih</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">BOTOL BERDINDING GANDA</div>
  <div class="ln c" data-at="s3:botol" data-fx="heat">Kaca di dalam kaca</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">3 JALAN PANAS</div>
  <div class="ln h" data-at="s4:Konduksi" data-fx="heat">Konduksi: lewat sentuhan</div>
  <div class="ln w" data-at="s4:konveksi" data-fx="heat">Konveksi: lewat aliran udara</div>
  <div class="ln h" data-at="s4:radiasi" data-fx="heat">Radiasi: sinar inframerah</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">VAKUM</div>
  <div class="card" data-at="s5:hampir" data-fx="heat"><div class="big sm">Konduksi + konveksi<br><span>hampir berhenti</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">LAPISAN PERAK</div>
  <div class="ln s" data-at="s6:memantulkan" data-fx="heat">Memantulkan panas kembali</div>
  <div class="ln w" data-at="s6:bocor" data-fx="heat">Bocor paling banyak lewat leher</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">NITROGEN &middot; &minus;196 &deg;C</div>
  <div class="card" data-at="s7:Thermos" data-fx="heat"><div class="big sm">Merek <span>Thermos</span><br>1904</div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:memperlambat" data-fx="heat"><div class="big sm">Bukan menghasilkan,<br><span>memperlambat</span></div></div>
  <div class="ln c" data-at="s8:AUDIRA" data-fx="heat">Berikutnya: ritsleting</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:26px;letter-spacing:.14em;color:${WARM};background:rgba(232,168,56,.08);border:1px solid rgba(232,168,56,.2);padding:8px 18px 7px;margin-bottom:14px;text-transform:uppercase}
.card{display:table;background:rgba(27,5,51,.88);border:1px solid rgba(232,168,56,.18);border-radius:4px;padding:14px 28px 18px;margin-bottom:14px;box-shadow:0 0 28px rgba(255,87,34,.1),inset 0 0 50px rgba(232,168,56,.03)}
.big{font-family:${MN};font-weight:900;font-size:82px;line-height:1.06;color:${WARM};letter-spacing:-.02em}
.big span{color:${HOT}}.big.sm{font-size:60px;line-height:1.1}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.2;color:#FFE8B0;background:rgba(27,5,51,.82);padding:10px 22px 12px 20px;margin-bottom:10px;border-left:10px solid ${WARM};border-radius:0 4px 4px 0;box-shadow:0 0 18px rgba(232,168,56,.08)}
.ln.h{border-left-color:${HOT};color:#FFD6D6}.ln.c{border-left-color:${CYAN};color:#B0E8FF}.ln.w{border-left-color:${WARM}}.ln.s{border-left-color:#C0C0C0;color:#E8E8E8}
#chip{font-family:${MN};font-size:25px;font-weight:700;color:${WARM};opacity:.7;letter-spacing:.08em;background:rgba(27,5,51,.6);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "11", bg: VOID, vig: 0.4, grain: 0.04, capfloor: 0.1, html, css, chipFont: MN, chipColor: WARM, sig: "EP11_TERMOS_AIR_PANAS",
  extraAt: [
    "s1:kopi", "s1:gas", "s1:cair", "s1:dingin",
    "s2:James", "s2:Dewar", "s2:oksigen", "s2:mendidih", "s2:menguap", "s2:panas",
    "s3:gabus", "s3:jerami", "s3:Dewar", "s3:botol", "s3:kaca", "s3:berdinding", "s3:ganda",
    "s4:Panas", "s4:tiga", "s4:Konduksi", "s4:bersentuhan", "s4:konveksi", "s4:udara", "s4:radiasi", "s4:inframerah",
    "s5:menyedot", "s5:celah", "s5:dinding", "s5:Tanpa", "s5:konduksi", "s5:konveksi", "s5:hampir", "s5:berhenti", "s5:partikel", "s5:panas",
    "s6:Radiasi", "s6:lapisan", "s6:perak", "s6:memantulkan", "s6:cermin", "s6:leher", "s6:bocor", "s6:tutupnya", "s6:dinding",
    "s7:nitrogen", "s7:minus", "s7:Celsius", "s7:mematenkannya", "s7:Thermos", "s7:menggugat", "s7:kalah",
    "s8:memperlambat", "s8:AUDIRA", "s8:Episode",
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:.92,y:16},{opacity:1,scale:1,y:0,duration:.4,ease:'power2.out'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scale:.96,y:-12,duration:.25,ease:'power2.in'},b-.25);}`,
  fxExtra: `heat:(e,t)=>tl.fromTo(e,{opacity:.75,x:-4},{opacity:1,x:0,duration:.22,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:30});tl.to('#outro',{opacity:1,y:0,duration:.4,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:56px;line-height:1.16;color:#FFE8B0;text-transform:uppercase;letter-spacing:.02em;background:rgba(27,5,51,.85);padding:10px 22px 14px;border-radius:6px;border:1px solid rgba(232,168,56,.12);box-shadow:0 0 20px rgba(255,87,34,.08)}
.w{display:inline-block;margin:0 .18em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFE8B0",scale:1},{color:"${HOT}",scale:1.04,duration:.07,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFE8B0",scale:1,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:12},{y:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Termos Air Panas", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
