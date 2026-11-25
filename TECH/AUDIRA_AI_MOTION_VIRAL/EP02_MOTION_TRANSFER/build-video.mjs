// EP02 CAPTURE STAGE. Telemetry look: condensed type, mono labels, no filled cards, panels wipe in as scan lines. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CY = "#3DF5E0", MG = "#FF3D9A", AM = "#FFC247", W = "#F4F8FF";
const D = "'League Gothic',sans-serif", M = "'JetBrains Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="l">REC / AI MOTION TANPA RIBET / EP 02</div>
  <div class="h"><span class="c">KAMU</span> BERGERAK.<br><span class="m" data-at="s1:karakter" data-fx="fade">KARAKTERMU</span> <span data-at="s1:karakter" data-fx="fade">TAMPIL.</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="l">MOTION TRANSFER</div>
  <div class="h">DALANG <span class="m">DIGITAL</span></div>
  <div class="d" data-at="s2:tali"><b class="c">VIDEO</b> = tali</div>
  <div class="d" data-at="s2:wayangnya"><b class="m">GAMBAR</b> = wayang</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="l">TIGA INPUT</div>
  <div class="d" data-at="s3:Video"><b class="c">VIDEO</b> gerak + timing</div>
  <div class="d" data-at="s3:Gambar"><b class="m">GAMBAR</b> siapa yang tampil</div>
  <div class="d" data-at="s3:Prompt"><b class="a">PROMPT</b> suasana + cahaya</div>
  <div class="d n" data-at="s3:neon">&gt; kota neon, malam</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="l" style="color:${AM}">ATURAN TERPENTING</div>
  <div class="h">PROPORSI <span class="a">HARUS SAMA</span></div>
  <div class="d" data-at="s4:seluruh"><b class="c">OK</b> seluruh badan + seluruh badan</div>
  <div class="d" data-at="s4:wajah"><b style="color:#FF5040">RUSAK</b> joget penuh + wajah saja</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="l">SAAT MEREKAM</div>
  <div class="d" data-at="s5:satu"><b class="c">1</b> orang, kontras dengan latar</div>
  <div class="d" data-at="s5:telapak"><b class="c">POSE AWAL</b> telapak ke kamera</div>
  <div class="d" data-at="s5:tiga"><b class="a nb">3 - 30 s</b> video di Kling</div>
  <div class="d" data-at="s5:orientasi"><b class="m">ORIENTASI</b> ikut video / gambar</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="l">PILIHAN ALAT</div>
  <div class="t" data-at="s6:Kling"><u>KLING MOTION CONTROL</u></div>
  <div class="t" data-at="s6:Runway"><u>RUNWAY ACT-TWO</u><i class="nb">5 kredit/detik, maks 30 s</i></div>
  <div class="t" data-at="s6:Wan"><u>WAN 2.2 ANIMATE</u><i>bobot terbuka, butuh GPU kuat</i></div>
</div>
<div class="p" data-in="s7" data-out="@END">
  <div class="l" style="color:${AM}">SATU BATAS</div>
  <div class="h" data-at="s7:rekamanmu">REKAMANMU SENDIRI,<br><span class="c">ATAU YANG SUDAH IZIN</span></div>
</div>`;

const css = `
#chip{text-shadow:0 2px 6px #000}
.l{font-family:${M};font-weight:700;font-size:26px;letter-spacing:.06em;color:${CY};margin-bottom:8px;text-shadow:0 2px 6px #000}
.h{font-family:${D};font-size:128px;line-height:.96;color:${W};letter-spacing:.005em;text-shadow:0 4px 22px rgba(0,0,0,.75)}
.c{color:${CY}}.m{color:${MG}}.a{color:${AM}}
.d{font-family:${M};font-weight:500;font-size:34px;line-height:1.2;color:${W};padding:9px 14px;margin-top:8px;background:rgba(6,10,18,.74);border-left:6px solid ${CY}}
.d b{font-family:${D};font-weight:400;font-size:52px;margin-right:12px;vertical-align:-5px}.d.n{color:${AM};border-color:${AM}}
.t{padding:9px 14px;margin-top:10px;background:rgba(6,10,18,.74);border-left:6px solid ${MG}}.t u{display:block;text-decoration:none;font-family:${D};font-size:70px;line-height:1;color:${W}}.t i{display:block;font-style:normal;font-family:${M};font-size:30px;color:${CY};margin-top:4px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: "#05070C", vig: .5, grain: .05, capfloor: .55, html, css, chipFont: M, chipColor: W,
  extraAt: ["s1:bergerak", "s2:tali", "s2:wayangnya", "s4:proporsi", "s4:rusak", "s5:telapak", "s7:batas", "s3:Video", "s3:Gambar", "s3:Prompt", "s3:neon", "s6:Kling", "s6:Wan"],
  // A scan line reveals each panel top to bottom.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(0 0 100% 0)',opacity:1},{clipPath:'inset(0 0 -8% 0)',duration:.34,ease:'none'},a-.05);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(100% 0 -8% 0)',duration:.18,ease:'none'},b-.18)`,
  fxExtra: `up:(e,t)=>{tl.fromTo(e,{x:-30,opacity:0},{x:0,opacity:1,duration:.22,ease:'power3.out'},t);},`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 0 100% 0)'});tl.to('#outro',{clipPath:'inset(0 0 0% 0)',duration:.42,ease:'none'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'League Gothic',sans-serif;font-size:78px;line-height:1.04;color:${W};text-transform:uppercase;text-shadow:0 3px 14px #000,0 0 3px #000}
.w{display:inline-block}`,
(id, w) => `tl.set("#${id}",{color:"${CY}",scale:1.06},${w.start.toFixed(3)});tl.set("#${id}",{color:"${W}",scale:1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0},{opacity:1,duration:.08,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Capture Stage", "#05070C");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
