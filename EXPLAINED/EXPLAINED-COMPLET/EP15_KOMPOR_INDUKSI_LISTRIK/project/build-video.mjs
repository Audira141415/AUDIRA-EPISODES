// EP15 KOMPOR INDUKSI. THERMALFORGE: the film is a thermal-camera view (ironbow palette). Panels are solid dark sensor
// plates with a cyan tag strip and a yellow-hot accent word; they slide in like a HUD readout. A static ironbow
// temperature scale sits at the right edge as part of the camera HUD.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const VOID = "#0A0A10", VIO = "#310E68", AMB = "#EA5E28", YEL = "#F7D038", CY = "#00E5FF";
const TT = "'Space Grotesk',sans-serif", MN = "'JetBrains Mono',monospace";

const html = `
<div id="scale"><div class="bar"></div><div class="hi">PANAS</div><div class="lo">DINGIN</div></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 15</div>
  <div class="card"><div class="big">Kompor induksi<br><span class="sm">yang panas justru</span> <span>pancinya</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">DI BAWAH KACA</div>
  <div class="ln" data-at="s2:kawat" data-fx="lit">Gulungan kawat tembaga</div>
  <div class="ln c" data-at="s2:mengalir" data-fx="lit">Arus listrik bolak-balik</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">MEDAN MAGNET</div>
  <div class="ln c" data-at="s3:berbalik" data-fx="lit">Ikut terus berbalik arah</div>
  <div class="ln" data-at="s3:menembus" data-fx="lit">Menembus kaca, kaca tidak dipanaskan</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">PANCI BESI</div>
  <div class="card" data-at="s4:Namanya" data-fx="lit"><div class="big sm2">Arus <span>pusar</span></div></div>
  <div class="ln c" data-at="s4:pusar" data-fx="lit">arus eddy, berputar di dasar panci</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">HAMBATAN</div>
  <div class="card" data-at="s5:Hambatan" data-fx="lit"><div class="big sm2">Listrik <span>&rarr; panas</span></div></div>
  <div class="ln" data-at="s5:panas" data-fx="lit">Langsung di dalam logam panci</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">HARUS MENGANDUNG BESI</div>
  <div class="ln g" data-at="s6:aluminium" data-fx="lit">Aluminium / tembaga biasa: tidak panas</div>
  <div class="ln" data-at="s6:menempel" data-fx="lit">Tes magnet: menempel kuat = cocok</div>
  <div class="ln c" data-at="s6:hangat" data-fx="lit">Kaca hanya hangat, tertular panci</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">KUNCINYA: KECEPATAN</div>
  <div class="ln g" data-at="s7:lima" data-fx="lit">Listrik rumah: 50 kali per detik</div>
  <div class="ln" data-at="s7:ribu" data-fx="lit">Induksi: puluhan ribu kali per detik</div>
  <div class="ln c" data-at="s7:transistor" data-fx="lit">Paten 1906, modern 1970-an berkat transistor</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:tungkunya" data-fx="lit"><div class="big sm2">Pancimu <span>tungkunya</span></div></div>
  <div class="ln c" data-at="s8:Episode" data-fx="lit">Berikutnya: layar sentuh HP</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.14em;color:${VOID};background:${CY};padding:8px 18px 7px;margin-bottom:16px}
.card{display:table;background:rgba(10,10,16,.92);border:2px solid ${VIO};border-left:10px solid ${AMB};padding:12px 30px 18px;margin-bottom:16px;box-shadow:0 0 0 2px rgba(0,229,255,.25),0 22px 44px rgba(0,0,0,.5)}
.big{font-family:${TT};font-weight:700;font-size:92px;line-height:1.0;color:#F4EEFF;letter-spacing:-.02em}
.big span{color:${YEL}}.big .sm{font-size:56px;color:#C9B8F2}.big.sm2{font-size:76px;line-height:1.05}
.ln{display:table;font-family:${TT};font-weight:700;font-size:42px;line-height:1.18;color:#F4EEFF;background:rgba(10,10,16,.92);padding:10px 24px 12px 22px;margin-bottom:12px;border-left:12px solid ${AMB};max-width:860px}
.ln.c{border-left-color:${CY}}.ln.g{border-left-color:#7A5BD6}
#chip{font-family:${MN};font-size:24px;font-weight:700;color:${CY};opacity:.8;letter-spacing:.06em}
#scale{position:absolute;left:1004px;top:430px;width:60px;height:560px;z-index:10}
#scale .bar{position:absolute;left:0;top:0;width:20px;height:520px;background:linear-gradient(180deg,#FFFFFF 0%,${YEL} 14%,${AMB} 38%,#9B1D8C 62%,${VIO} 84%,${VOID} 100%);border:2px solid rgba(0,229,255,.55)}
#scale .hi,#scale .lo{position:absolute;left:-6px;font-family:${MN};font-weight:700;font-size:15px;letter-spacing:.06em;color:#F4EEFF;transform:rotate(-90deg);transform-origin:0 0}
#scale .hi{top:-12px;left:-4px;transform:none;color:${YEL}}#scale .lo{top:532px;left:-12px;transform:none;color:#B9A6FF}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "15", bg: VOID, vig: 0.4, grain: 0.06, capfloor: 0.3, html, css, chipFont: MN, chipColor: CY, sig: "EP15_KOMPOR_INDUKSI_LISTRIK",
  extraAt: ["s1:pancimu", "s2:kawat", "s2:menyala", "s2:mengalir", "s3:berbalik", "s3:magnet", "s3:menembus", "s4:diletakkan", "s4:memancing",
    "s4:Namanya", "s4:pusar", "s5:menghambat", "s5:Hambatan", "s5:panas", "s6:besi", "s6:aluminium", "s6:magnet", "s6:menempel", "s6:cocok",
    "s6:hangat", "s7:Kuncinya", "s7:lima", "s7:ribu", "s7:dipatenkan", "s7:enam", "s7:tujuh", "s7:transistor", "s8:tungkunya", "s8:Matikan",
    "s8:berhenti", "s8:AUDIRA", "s8:Episode"],
  // panels slide in from the left edge like a sensor readout locking on
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-70,clipPath:'inset(0 100% 0 0)'},{opacity:1,x:0,clipPath:'inset(0 0% 0 0)',duration:.42,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:40,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.45},{opacity:1,duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,scale:1.04});tl.to('#outro',{opacity:1,scale:1,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${TT};font-weight:700;font-size:58px;line-height:1.16;color:#F4EEFF;text-transform:uppercase;letter-spacing:.01em;background:rgba(18,8,36,.92);padding:10px 24px 14px;border:2px solid rgba(0,229,255,.35)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#F4EEFF",scale:1},{color:"${YEL}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F4EEFF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kompor Induksi", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
