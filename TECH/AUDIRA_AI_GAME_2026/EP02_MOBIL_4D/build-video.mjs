// EP02 CAR-5. Night blueprint, CAD callouts and mono type; panels are drawn on by a scan line. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CY = "#39D0FF", RD = "#FF5A50", WHT = "#EAF6FF", NV = "#06122B", AM = "#FFD166";
const G = '"Space Grotesk",sans-serif', M = '"JetBrains Mono",monospace';

const html = `
<div id="scrim"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="dim">AI BIKIN GAME / EP 02</div>
  <div class="prompt" data-at="s1:Ketik" data-fx="fade">&gt; mobil<i></i></div>
  <div class="hh" data-at="s1:menyetirnya" data-fx="up">LALU KAMU <span>SETIR.</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="dim">ROBLOX / BETA PUBLIK / FEB 2026</div>
  <div class="hh">BUKAN <span>GAMBAR.</span></div>
  <div class="ln" data-at="s2:4D" data-fx="up"><b>4D GENERATION</b> objek 3D + perilaku</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="dim">MODEL 3D BIASA</div>
  <div class="hh" data-at="s3:bongkah" data-fx="up">1 MESH <span>= 1 BONGKAH</span></div>
  <div class="ln" data-at="s3:patung" data-fx="up"><b class="r">PATUNG</b> bukan kendaraan</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="dim">SCHEMA</div>
  <div class="hh" data-at="s4:namanya" data-fx="up">CAR<span>-5</span></div>
  <div class="ln nb" data-at="s4:lima" data-fx="up"><b>5 MESH</b> terpisah dan bernama</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="dim">SKRIP DISESUAIKAN (RETARGET)</div>
  <div class="ln" data-at="s5:skrip" data-fx="up"><b class="a">SKRIP</b> dipasang ke tiap bagian</div>
  <div class="ln" data-at="s5:ukuran" data-fx="up"><b class="a">UKURAN</b> mengikuti mobil baru</div>
  <div class="ln" data-at="s5:berputar" data-fx="up"><b>RODA</b> berputar dan berbelok</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="dim">3D + INTERAKTIVITAS</div>
  <div class="hh big nb" data-at="s6:dimensi" data-fx="up">4<span>D</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="dim">WISH MASTER / DATA ROBLOX &amp; DEVELOPER</div>
  <div class="ln nb" data-at="s7:160.000" data-fx="up"><b><i class="ct" data-from="0" data-to="160000" data-a="s7:160.000" data-suf="+"></i></b> objek saat akses awal</div>
  <div class="ln nb" data-at="s7:64" data-fx="up"><b class="a">+64%</b> waktu main, klaim developer</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="dim">BETA FEB 2026 / TARGET ROBLOX</div>
  <div class="ln nb" data-at="s8:dua" data-fx="up"><b>2</b> schema awal</div>
  <div class="ln nb" data-at="s8:ribuan" data-fx="up"><b class="a">RIBUAN</b> jenis benda</div>
  <div class="prompt sm" data-at="s8:Kalau" data-fx="fade">&gt; apa yang kamu buat?<i></i></div>
</div>`;

const css = `
#scrim{position:absolute;left:0;right:0;top:0;height:640px;background:linear-gradient(180deg,rgba(6,18,43,.9),rgba(6,18,43,.68) 62%,rgba(6,18,43,0));z-index:9;pointer-events:none}
.dim{font-family:${M};font-weight:700;font-size:25px;color:${CY};letter-spacing:.02em;padding-bottom:10px;margin-bottom:16px;border-bottom:2px dashed rgba(57,208,255,.6)}
.hh{font-family:${G};font-weight:700;font-size:96px;line-height:1;letter-spacing:-.03em;color:${WHT};margin-bottom:14px}.hh span{color:${RD}}.hh.big{font-size:230px;line-height:.9}
.prompt{font-family:${M};font-weight:700;font-size:92px;color:#fff;margin-bottom:14px}.prompt.sm{font-size:48px;color:${AM};margin-top:14px}.prompt i{display:inline-block;width:.55em;height:.9em;background:${CY};margin-left:.1em;vertical-align:-.1em}
.ln{font-family:${G};font-weight:500;font-size:34px;line-height:1.2;color:${WHT};padding:10px 0 12px;display:flex;align-items:baseline;gap:18px;flex-wrap:wrap}
.ln b{font-family:${M};font-weight:800;font-size:58px;line-height:1;color:${CY}}.ln b.r{color:${RD}}.ln b.a{color:${AM}}.ln i{font-style:normal}
.nb{font-variant-numeric:tabular-nums}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: NV, vig: 0.5, grain: 0.05, capfloor: 0.55, html, css, chipFont: M, chipColor: WHT,
  extraAt: ["s1:Ketik", "s1:mobil", "s1:masuk", "s1:menyetirnya", "s3:bongkah", "s3:rodanya", "s4:schema", "s4:namanya", "s4:lima", "s4:bodi", "s4:roda", "s5:skrip", "s5:ukuran", "s5:berputar", "s5:berbelok", "s6:dimensi", "s7:pesawat", "s7:naga", "s7:160.000", "s7:64", "s8:dua", "s8:ribuan"],
  // Panels are plotted left to right, like a pen plotter.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(0 100% 0 0)',opacity:1},{clipPath:'inset(0 -5% 0 0)',duration:.42,ease:'power2.inOut'},a-.04)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0 0 0 100%)',duration:.2,ease:'power2.in'},b-.2)`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 100% 0 0)'});tl.to('#outro',{clipPath:'inset(0 0% 0 0)',duration:.5,ease:'power3.inOut'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:54px;right:104px;top:1310px;height:230px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:left;font-family:${G};font-weight:700;font-size:60px;line-height:1.14;letter-spacing:-.015em;color:${WHT};text-shadow:0 2px 12px #000}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WHT}"},{color:"${AM}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WHT}",duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 -3% 0 0)",duration:.16,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Car-5", NV);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
