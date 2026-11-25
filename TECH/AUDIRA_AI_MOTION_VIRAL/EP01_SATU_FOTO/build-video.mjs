// EP01 POP-UP. Warm cut paper: serif headline cards fold up from a hinge, captions sit on a torn-paper strip. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#2A1C14", CREAM = "#FFF6E4", RED = "#D9412A", GOLD = "#F3B72C";
const D = "'Playfair Display',serif", B = "Outfit,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">AI MOTION TANPA RIBET / EP 01</div>
  <div class="card"><div class="h">Satu foto.<br><i>Bisa bergerak.</i></div><div class="sub" data-at="s1:keyframe">Tanpa keyframe. Tanpa belajar animasi.</div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">ALURNYA TIGA</div>
  <div class="row" data-at="s2:Image"><b>1</b><div><u>Image AI</u><span>membuat gambar</span></div></div>
  <div class="row" data-at="s2:Video"><b>2</b><div><u>Video AI</u><span>menggerakkan</span></div></div>
  <div class="row" data-at="s2:CapCut"><b>3</b><div><u>CapCut</u><span>merapikan</span></div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">LANGKAH 1 / GAMBAR</div>
  <div class="card"><div class="h sm">9:16, satu subjek</div>
  <div class="depth"><em data-at="s3:depan">depan</em><em data-at="s3:tengah">tengah</em><em data-at="s3:belakang">belakang</em></div>
  <div class="sub" data-at="s3:bersih">Bersih dari cacat. Sumber: panduan Runway Gen-4.</div></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">LANGKAH 2 / GERAK</div>
  <div class="card" data-at="s4:Rumus"><div class="h sm">Subjek + gerakan,<br>latar + gerakan</div><div class="sub">Rumus prompt dari panduan Kling.</div></div>
  <div class="prompt" data-at="s4:Syalnya">&gt; syalnya tertiup angin</div>
  <div class="prompt" data-at="s4:awan">&gt; awan bergeser pelan</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">TAMBAH SATU, UJI SATU</div>
  <div class="prompt" data-at="s5:kamera">+ kamera mendekat</div>
  <div class="card" data-at="s5:Tulis"><div class="h sm">Tulis yang terjadi,<br>bukan yang dilarang</div></div>
  <div class="card" data-at="s5:lima" style="margin-top:10px"><div class="h sm"><i>5 atau 10 detik</i> per klip</div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">LANGKAH 3 / CAPCUT</div>
  <div class="row" data-at="s6:Susun"><b>A</b><div><u>Susun</u><span>beberapa klip</span></div></div>
  <div class="row" data-at="s6:potong"><b>B</b><div><u>Potong</u><span>tepat di awal gerakan</span></div></div>
  <div class="row" data-at="s6:Teks"><b>C</b><div><u>Teks otomatis</u><span>tak perlu mengetik</span></div></div>
</div>
<div class="p" data-in="s7" data-out="@END">
  <div class="card"><div class="h"><i data-at="s7:Viral">Viral</i> tak bisa dijamin.</div>
  <div class="sub" data-at="s7:gambar">Gambar bersih. Gerak jelas. Potongan rapi.</div></div>
</div>`;

const css = `
.tag{display:inline-block;background:${RED};color:${CREAM};font-family:${B};font-weight:700;font-size:25px;letter-spacing:.09em;padding:8px 16px;margin-bottom:12px;transform:rotate(-1deg)}
.card{background:${CREAM};color:${INK};padding:22px 26px;box-shadow:0 14px 26px rgba(40,20,5,.42),0 1px 0 rgba(255,255,255,.7) inset;border-bottom:3px solid #E2D2B4}
.h{font-family:${D};font-weight:800;font-size:82px;line-height:1.03;letter-spacing:-.01em}.h i{color:${RED}}.h.sm{font-size:58px}
.sub{font-family:${B};font-weight:500;font-size:34px;line-height:1.2;margin-top:12px;color:#5A4433}
.row{display:flex;align-items:center;gap:20px;background:${CREAM};color:${INK};padding:12px 20px;margin-bottom:10px;box-shadow:0 10px 18px rgba(40,20,5,.38)}
.row b{flex:none;width:68px;height:68px;border-radius:50%;background:${GOLD};font-family:${D};font-weight:800;font-size:44px;line-height:66px;text-align:center}
.row u{display:block;text-decoration:none;font-family:${D};font-weight:800;font-size:52px;line-height:1.05}.row span{display:block;font-family:${B};font-weight:500;font-size:31px;color:#5A4433}
.depth{display:flex;gap:10px;margin-top:12px}.depth em{flex:1;text-align:center;font-style:normal;font-family:${B};font-weight:700;font-size:34px;padding:8px 0;background:${GOLD};color:${INK}}
.prompt{background:${INK};color:${GOLD};font-family:'JetBrains Mono',monospace;font-weight:700;font-size:38px;padding:14px 20px;margin-top:10px;box-shadow:0 10px 18px rgba(20,10,0,.4)}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: "#3A2A1E", vig: .32, grain: .06, capfloor: 0, html, css, chipFont: B, chipColor: CREAM,
  extraAt: ["s1:bergerak", "s4:Syalnya", "s4:awan", "s5:kamera", "s7:hidupkan", "s3:depan", "s3:tengah", "s3:belakang"],
  // Panels fold up from a bottom hinge like the diorama itself.
  panelIn: `(tl,p,a)=>{gsap.set(p,{transformPerspective:1400,transformOrigin:'50% 100%'});tl.fromTo(p,{rotationX:-82,opacity:0},{rotationX:0,opacity:1,duration:.5,ease:'back.out(1.3)'},a-.06);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{rotationX:78,opacity:0,duration:.24,ease:'power2.in'},b-.24)`,
  fxExtra: `up:(e,t)=>{gsap.set(e,{transformPerspective:900,transformOrigin:'50% 100%'});tl.fromTo(e,{rotationX:-70,opacity:0},{rotationX:0,opacity:1,duration:.4,ease:'back.out(1.4)'},t);},`,
  outroIn: `gsap.set('#outro',{transformPerspective:1600,transformOrigin:'50% 100%',rotationX:-88,opacity:0});tl.to('#outro',{rotationX:0,opacity:1,duration:.55,ease:'power3.out'},OUT-.25);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Outfit,sans-serif;font-weight:800;font-size:58px;line-height:1.16;color:${INK}}
.capin .w{display:inline-block;background:${CREAM};padding:0 10px;margin:2px -3px;box-shadow:0 6px 10px rgba(40,20,5,.35)}`,
(id, w) => `tl.set("#${id}",{backgroundColor:"${GOLD}",y:-5},${w.start.toFixed(3)});tl.set("#${id}",{backgroundColor:"${CREAM}",y:0},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:18,opacity:0},{y:0,opacity:1,duration:.14,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pop Up", "#3A2A1E");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
