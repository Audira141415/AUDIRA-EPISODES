// EP10 REM ABS. LIDARFORGE: neon-void point-cloud world. Dark panels with cyan scan-lines,
// amber data readouts, coral highlights on locked wheels. Laser sweep wipes between road and lab sets.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const VOID = "#0A0C1A", CYAN = "#00E5FF", AMBER = "#FFB300", CORAL = "#FF5252", GRID = "#1A1E3A";
const MN = "'Space Mono',monospace", SN = "Nunito,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 10</div>
  <div class="card"><div class="big">Rem dilepas<br><span>15&times;</span>/detik</div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">RODA TERKUNCI</div>
  <div class="ln r" data-at="s2:terkunci" data-fx="scan">Roda berhenti, ban terseret</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">GRIP &amp; STEERING</div>
  <div class="ln c" data-at="s3:mencengkeram" data-fx="scan">Berputar &gt; terseret = grip kuat</div>
  <div class="ln r" data-at="s3:dibelokkan" data-fx="scan">Terkunci = tak bisa belok</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">4 KOMPONEN ABS</div>
  <div class="ln c" data-at="s4:sensor" data-fx="scan">Sensor kecepatan roda</div>
  <div class="ln a" data-at="s4:komputer" data-fx="scan">Komputer pengendali</div>
  <div class="ln c" data-at="s4:katup" data-fx="scan">Katup tekanan</div>
  <div class="ln a" data-at="s4:pompa" data-fx="scan">Pompa hidraulik</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">SENSOR &rarr; ECU</div>
  <div class="card" data-at="s5:melambat" data-fx="scan"><div class="big sm">Roda <span>melambat</span><br>= hampir terkunci</div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">SIKLUS ABS</div>
  <div class="ln c" data-at="s6:menutup" data-fx="scan">Katup tutup &rarr; tekanan turun</div>
  <div class="ln a" data-at="s6:Pompa" data-fx="scan">Pompa kembalikan tekanan</div>
  <div class="ln r" data-at="s6:getaran" data-fx="scan">Getaran di pedal = ABS aktif</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">MERCEDES &middot; BOSCH &middot; 1978</div>
  <div class="card" data-at="s7:detik" data-fx="scan"><div class="big sm">15&times; dalam <span>1 detik</span></div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:arahkan" data-fx="scan"><div class="big sm">Tetap injak,<br><span>arahkan</span> setir</div></div>
  <div class="ln c" data-at="s8:AUDIRA" data-fx="scan">Berikutnya: termos air panas</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:26px;letter-spacing:.16em;color:${CYAN};background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.25);padding:8px 18px 7px;margin-bottom:14px;text-transform:uppercase}
.card{display:table;background:rgba(10,12,26,.88);border:1px solid rgba(0,229,255,.2);border-radius:4px;padding:14px 28px 18px;margin-bottom:14px;box-shadow:0 0 32px rgba(0,229,255,.12),inset 0 0 60px rgba(0,229,255,.03)}
.big{font-family:${MN};font-weight:900;font-size:88px;line-height:1.05;color:${CYAN};letter-spacing:-.02em}
.big span{color:${CORAL}}.big.sm{font-size:64px;line-height:1.1}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.2;color:#E0E8FF;background:rgba(10,12,26,.82);padding:10px 22px 12px 20px;margin-bottom:10px;border-left:10px solid ${CYAN};border-radius:0 4px 4px 0;box-shadow:0 0 20px rgba(0,229,255,.08)}
.ln.r{border-left-color:${CORAL};color:#FFD6D6}.ln.a{border-left-color:${AMBER};color:#FFE8B0}.ln.c{border-left-color:${CYAN}}
#chip{font-family:${MN};font-size:25px;font-weight:700;color:${CYAN};opacity:.7;letter-spacing:.08em;background:rgba(10,12,26,.6);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "10", bg: VOID, vig: 0.45, grain: 0.05, capfloor: 0.1, html, css, chipFont: MN, chipColor: CYAN, sig: "EP10_REM_ABS_KENDARAAN",
  extraAt: [
    "s1:dilepas", "s1:lima",
    "s2:diinjak", "s2:terkunci", "s2:terseret",
    "s3:terseret", "s3:parah", "s3:mencengkeram", "s3:lemah", "s3:dibelokkan", "s3:Setir", "s3:meluncur", "s3:lurus",
    "s4:sensor", "s4:komputer", "s4:katup", "s4:pompa",
    "s5:melambat", "s5:hampir",
    "s6:menutup", "s6:membuang", "s6:berputar", "s6:Pompa", "s6:siklus", "s6:getaran",
    "s7:Kaki", "s7:Sistem", "s7:detik", "s7:dipasang", "s7:delapan",
    "s8:injak", "s8:arahkan", "s8:AUDIRA",
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-20,clipPath:'inset(0 100% 0 0)'},{opacity:1,x:0,clipPath:'inset(0 0% 0 0)',duration:.4,ease:'power2.out'},a-.08);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:20,clipPath:'inset(0 0 0 100%)',duration:.25,ease:'power2.in'},b-.25);}`,
  fxExtra: `scan:(e,t)=>tl.fromTo(e,{opacity:.7,y:4},{opacity:1,y:0,duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,scale:.95});tl.to('#outro',{opacity:1,scale:1,duration:.4,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:56px;line-height:1.16;color:#E0E8FF;text-transform:uppercase;letter-spacing:.02em;background:rgba(10,12,26,.85);padding:10px 22px 14px;border-radius:6px;border:1px solid rgba(0,229,255,.15);box-shadow:0 0 24px rgba(0,229,255,.1)}
.w{display:inline-block;margin:0 .18em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#E0E8FF",scale:1},{color:"${CYAN}",scale:1.04,duration:.07,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#E0E8FF",scale:1,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:12},{y:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Rem ABS Kendaraan", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
