// EP05 LAYER STACK. Swiss: paper, ink, one red. Hard rectangular blocks, panels cut in by mask with no fades. Run from this folder: node build-video.mjs
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#111111", RED = "#E6331F", W = "#FFFFFF";
const D = "'Archivo Black',sans-serif", M = "'IBM Plex Mono',monospace";
const s5 = TL.scenes.find((s) => s.id === "s5");
const rmStart = +(at("s5:Panel") - .12).toFixed(2);
const rmDur = +Math.min(17.5, s5.end - rmStart - .1).toFixed(2);

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="k">AI MOTION TANPA RIBET / EP 05</div>
  <div class="h" data-at="s1:Seluruhnya" data-fx="pop">SELURUHNYA<br><span>KODE.</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="k">BUKAN SLIDESHOW</div>
  <div class="r" data-at="s2:Kamera"><b>1</b>KAMERA BERGERAK</div>
  <div class="r" data-at="s2:Lapisan"><b>2</b>LAPISAN BERKEDALAMAN</div>
  <div class="r" data-at="s2:kata"><b>3</b>GERAK TERIKAT KATA</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="k">CLAUDE = PENULIS KODE</div>
  <div class="h sm" data-at="s3:angka" data-fx="pop">ARAHKAN<br><span>DENGAN ANGKA</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="k">HYPERFRAMES</div>
  <div class="h sm">HTML <span>&rarr;</span> MP4</div>
  <div class="r" data-at="s4:GSAP"><b>+</b>GSAP / THREE.JS</div>
  <div class="r" data-at="s4:render"><b>=</b>RENDER ULANG SAMA</div>
  <div class="r" data-at="s4:Apache"><b>&copy;</b>LISENSI APACHE 2.0</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="k">REMOTION</div>
  <div class="h sm">NOMOR FRAME + REACT</div>
  <div id="rmslot"></div>
  <div class="r" data-at="s5:Gratis"><b>0</b>INDIVIDU, MAKS 3 KARYAWAN</div>
  <div class="r" data-at="s5:lisensi"><b>$</b>LEBIH BESAR: BELI LISENSI</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="k">YANG TERASA MAHAL</div>
  <div class="h sm">SUARA <span>DULU</span>,<br>ANIMASI IKUT</div>
</div>
<div class="p" data-in="s7" data-out="@END">
  <div class="k">FRAME DEMI FRAME</div>
  <div class="rev" data-at="s7:periksa" data-fx="fade"><img src="assets/img/review.jpg" alt=""><i id="scan"></i></div>
  <div class="h xs" data-at="s7:Slide" data-fx="pop">SLIDE MENJELASKAN.<br><span>MOTION MENUNJUKKAN.</span></div>
</div>
<video id="rmv" class="clip" muted playsinline data-start="${rmStart}" data-duration="${rmDur}" data-track-index="5" src="assets/video/remotion.mp4" style="position:absolute;left:56px;top:430px;width:914px;height:500px;z-index:12;object-fit:cover"></video>`;

const css = `
#chip{color:${INK};opacity:1;background:${W};padding:2px 8px;left:56px}
.k{display:inline-block;background:${INK};color:${W};font-family:${M};font-weight:700;font-size:27px;padding:7px 14px;margin-bottom:0}
.h{background:${W};color:${INK};font-family:${D};font-size:96px;line-height:.98;padding:16px 18px;letter-spacing:-.02em}.h span{color:${RED}}.h.sm{font-size:66px}.h.xs{font-size:47px;margin-top:0}
.r{display:flex;align-items:center;gap:16px;background:${W};color:${INK};font-family:${D};font-size:43px;padding:10px 18px;border-top:3px solid ${INK}}.r b{flex:none;font-weight:400;color:${RED};width:44px}
#rmslot{height:556px}
.rev{position:relative;height:640px;background:${W};overflow:hidden;border-top:3px solid ${INK}}.rev img{width:100%;display:block}#scan{position:absolute;left:0;top:0;width:33.3%;height:33.3%;border:7px solid ${RED};box-sizing:border-box}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: "#F1EFE8", vig: 0, grain: .025, capfloor: 0, html, css, chipFont: M, chipColor: INK, chip: "VIDEO INI DIBUAT DENGAN KODE",
  extraAt: ["s1:kode", "s2:Kamera", "s2:Lapisan", "s2:kata", "s3:Claude", "s3:Tugasmu", "s3:angka", "s4:HyperFrames", "s4:GSAP", "s4:render", "s5:Remotion", "s5:Panel", "s6:suara", "s6:Angka", "s6:Ganti", "s7:periksa", "s7:Slide"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(0 100% 0 0)',opacity:1},{clipPath:'inset(0 -2% 0 0)',duration:.26,ease:'power4.inOut'},a-.08);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0 -2% 0 100%)',duration:.16,ease:'power4.in'},b-.16)`,
  fxExtra: `up:(e,t)=>{tl.fromTo(e,{clipPath:'inset(0 100% 0 0)',opacity:1},{clipPath:'inset(0 -2% 0 0)',duration:.2,ease:'power3.out'},t);},`,
  hud: `(t)=>{const s=q('#scan');if(s){const p=Math.max(0,t-(AT['s7:periksa']||0));const i=Math.floor(p*5);s.style.left=(i%3)*33.3+'%';s.style.top=(Math.floor(i/3)%3)*33.3+'%';}}`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 100% 0 0)'});tl.to('#outro',{clipPath:'inset(0 0% 0 0)',duration:.36,ease:'power4.inOut'},OUT-.1);`,
});
// The shell writes the Remotion clip into the world composition; give its host the wrapper timing it needs.
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;line-height:1.3;font-family:'Archivo Black',sans-serif;font-size:50px;color:${W}}
.w{display:inline-block;background:${INK};padding:4px 11px;margin:0 -2px}`,
(id, w) => `tl.set("#${id}",{backgroundColor:"${RED}"},${w.start.toFixed(3)});tl.set("#${id}",{backgroundColor:"${INK}"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 -3% 0 0)',duration:.1,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Layer Stack", "#F1EFE8");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro, "remotion", rmStart, rmDur);
