// EP03 TRANSFORM BAY. Product-film restraint: Montserrat in white and amber on black, hairline rules, panels glide on one horizontal axis. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AM = "#FFB25A", W = "#F7F7F5";
const F = "Montserrat,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="l">AI MOTION TANPA RIBET &mdash; EP 03</div>
  <div class="h">Sedan tua<br><span>jadi mobil balap.</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="l">KUNCINYA</div>
  <div class="h">Dua gambar.</div>
  <div class="k" data-at="s2:awal"><u>FRAME AWAL</u><i>Start and End Frames, Kling</i></div>
  <div class="k" data-at="s2:akhir"><u>FRAME AKHIR</u><i>First and last frame, Veo</i></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="l">GAMBAR KEDUA DARI GAMBAR PERTAMA</div>
  <div class="k" data-at="s3:sudut"><u>SUDUT KAMERA</u><i>sama</i></div>
  <div class="k" data-at="s3:posisi"><u>POSISI</u><i>sama</i></div>
  <div class="k" data-at="s3:cahaya"><u>CAHAYA</u><i>sama</i></div>
  <div class="k hi" data-at="s3:mobilnya"><u>MOBIL</u><i>satu-satunya yang berubah</i></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="l">PANDUAN KLING</div>
  <div class="h sm" data-at="s4:semirip">Semirip mungkin.</div>
  <div class="k" data-at="s4:pindah"><u>TERLALU BEDA</u><i>bisa pindah shot</i></div>
  <div class="st"><b data-at="s4:sedan" data-fx="fade">SEDAN</b><b data-at="s4:rangka" data-fx="fade">RANGKA</b><b data-at="s4:balap" data-fx="fade">BALAP</b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="l">PROMPT = PROSES</div>
  <div class="pr" data-at="s5:Panel">panel bodi terbuka,</div>
  <div class="pr" data-at="s5:rangka">rangka bergeser,</div>
  <div class="pr" data-at="s5:roda">roda melebar,</div>
  <div class="pr" data-at="s5:kamera">kamera diam</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="l">COMPOSITING</div>
  <div class="h sm" data-at="s6:Frame">Akhir klip 1<br><span>= awal klip 2</span></div>
  <div class="st"><b data-at="s6:percikan" data-fx="fade">API</b><b data-at="s6:bayangan" data-fx="fade">BAYANGAN</b><b data-at="s6:bass" data-fx="fade">BASS</b></div>
</div>
<div class="p" data-in="s7" data-out="@END">
  <div class="l">SEBELUM UNGGAH</div>
  <div class="k" data-at="s7:realistis"><u>REALISTIS</u><i>YouTube wajib label AI</i></div>
  <div class="k" data-at="s7:logo"><u>LOGO MEREK</u><i>hindari milik orang</i></div>
</div>`;

const css = `
#chip{opacity:.68}
.l{font-family:${F};font-weight:700;font-size:25px;letter-spacing:.2em;color:${AM};padding-bottom:10px;border-bottom:1px solid rgba(255,178,90,.65);margin-bottom:14px}
.h{font-family:${F};font-weight:800;font-size:84px;line-height:1.04;letter-spacing:-.03em;color:${W}}.h span{color:${AM}}.h.sm{font-size:72px}
.k{display:flex;justify-content:space-between;align-items:baseline;gap:18px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.22)}
.k u{text-decoration:none;font-family:${F};font-weight:800;font-size:36px;letter-spacing:-.01em;color:${W};white-space:nowrap}.k i{font-style:normal;font-family:${F};font-weight:500;font-size:29px;color:${AM};text-align:right}.k.hi u{color:${AM}}
.st{display:flex;gap:10px;margin-top:16px}.st b{flex:1;text-align:center;font-family:${F};font-weight:800;font-size:31px;letter-spacing:.02em;padding:12px 0;border:1px solid ${AM};color:${AM}}
.pr{font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:43px;line-height:1.28;color:${W}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: "#050506", vig: .3, grain: .035, capfloor: .3, html, css, chipFont: F, chipColor: W, chip: "MOBIL FIKTIF. ILUSTRASI 3D, BUKAN HASIL AI",
  extraAt: ["s1:balap", "s2:awal", "s2:akhir", "s2:mengisi", "s3:sudut", "s3:sama", "s4:sedan", "s4:rangka", "s4:balap", "s5:Panel", "s5:rangka", "s5:roda", "s5:diam", "s6:percikan", "s6:bayangan", "s6:bass", "s6:mendarat", "s6:sambungannya", "s7:label"],
  // One lateral glide, in from the right and out to the left, like the camera slider.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{x:70,opacity:0},{x:0,opacity:1,duration:.5,ease:'power4.out'},a-.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:-60,opacity:0,duration:.22,ease:'power2.in'},b-.22)`,
  fxExtra: `up:(e,t)=>tl.fromTo(e,{x:32,opacity:0},{x:0,opacity:1,duration:.34,ease:'power4.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0});tl.to('#outro',{opacity:1,duration:.5,ease:'power2.inOut'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Montserrat,sans-serif;font-weight:700;font-size:54px;line-height:1.18;letter-spacing:-.01em;color:${W};text-shadow:0 2px 12px rgba(0,0,0,.9)}
.w{display:inline-block;box-shadow:inset 0 0 0 0 ${AM}}`,
(id, w) => `tl.set("#${id}",{color:"${AM}"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${W}"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:14,opacity:0},{x:0,opacity:1,duration:.16,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Transform Bay", "#050506");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
