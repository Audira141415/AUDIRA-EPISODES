// EP03 NAMA MARIO / COMICFORGE. A printed comic page in space; the camera reads it panel by panel.
// Narration boxes are yellow caption boxes with ink borders that drop in like a turned page. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#121014", YEL = "#FFE100", MAG = "#E5007D", CYA = "#00A3E0", RED = "#ED1C24", PAP = "#FFF6E0", SKY = "#2B2E8C";
const BG = "Bangers,Impact,sans-serif", OS = "Oswald,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">FAKTA GAME · EP 03</div>
  <div class="ttl">NAMANYA DARI<br><span>PEMILIK GUDANG?</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">DEBUT · DONKEY KONG · ARKADE 1981</div>
  <div class="bx">Sebelum jadi Mario, namanya...</div>
  <div class="row"><b class="c" data-at="s2:Ossan" data-fx="slam">OSSAN <small>= bapak-bapak</small></b><b class="c y" data-at="s2:Jumpman" data-fx="slam">JUMPMAN <small>buku petunjuk</small></b><b class="c cy" data-at="s2:Mister" data-fx="slam">MR. VIDEO?</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">KATA SHIGERU MIYAMOTO</div>
  <div class="bx">Kalau namanya Mr. Video...</div>
  <b class="c m" data-at="s3:hilang" data-fx="slam">HILANG DARI MUKA BUMI!</b>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">NINTENDO OF AMERICA · 1981</div>
  <div class="bx" data-at="s4:menyewa" data-fx="zig">Sewa gudang di Tukwila, dekat Seattle</div>
  <b class="c y" data-at="s4:Mario" data-fx="slam">PEMILIK: MARIO SEGALE</b>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">BUKU GAME OVER · DAVID SHEFF</div>
  <div class="ttl sm m">VERSI A</div>
  <div class="row"><b class="c" data-at="s5:telat" data-fx="slam">Tagih sewa telat</b><b class="c m" data-at="s5:berdebat" data-fx="slam">Debat!</b><b class="c y" data-at="s5:Mario" data-fx="slam">JUMPMAN JADI MARIO</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag cyt">MANTAN MANAJER GUDANG</div>
  <div class="ttl sm c2">VERSI B</div>
  <div class="row"><b class="c" data-at="s6:lelucon" data-fx="slam">Cuma lelucon</b><b class="c cy" data-at="s6:tidak" data-fx="slam">Pemilik tak pernah terlihat</b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag ink">MARIO SEGALE</div>
  <div class="bx q" data-at="s7:2018" data-fx="zig">Wafat 2018, usia 84 tahun</div>
  <div class="row"><b class="c q" data-at="s7:menghindari" data-fx="slam">Menghindari ketenaran</b><b class="c q" data-at="s7:pekerjaannya" data-fx="slam">Ingin dikenal dari pekerjaannya</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="ttl sm">VERSI A <span>ATAU B?</span></div>
  <div class="bx" data-at="s8:Kamu" data-fx="zig">Tulis jawabanmu di komentar!</div>
</div>`;

const css = `
.tag{display:inline-block;font-family:Oswald,sans-serif;font-weight:700;font-size:28px;letter-spacing:.08em;color:#fff;background:${MAG};padding:5px 16px 6px;border:5px solid ${INK};box-shadow:6px 6px 0 ${INK};transform:rotate(-1.5deg);margin-bottom:18px}
.tag.cyt{background:${CYA}}.tag.ink{background:${INK};color:${PAP};border-color:${PAP}}
.ttl{display:block;font-family:Bangers,Impact,sans-serif;font-size:122px;line-height:.94;letter-spacing:.02em;color:#fff;text-shadow:6px 0 0 ${INK},-6px 0 0 ${INK},0 6px 0 ${INK},0 -6px 0 ${INK},5px 5px 0 ${INK},-5px 5px 0 ${INK},5px -5px 0 ${INK},-5px -5px 0 ${INK},11px 13px 0 ${INK}}
.ttl span{color:${YEL}}.ttl.sm{font-size:104px;margin-bottom:16px}.ttl.m{color:${YEL}}.ttl.c2{color:${PAP}}
.bx{display:table;font-family:Oswald,sans-serif;font-weight:600;font-size:40px;line-height:1.15;color:${INK};background:${YEL};border:5px solid ${INK};box-shadow:8px 8px 0 ${INK};padding:10px 22px 12px;margin-bottom:20px;max-width:880px}
.bx.q{background:${PAP}}
.row{display:flex;flex-wrap:wrap;gap:14px 14px;align-items:flex-start}
.c{display:inline-block;font-family:Bangers,Impact,sans-serif;font-weight:400;font-size:52px;letter-spacing:.03em;line-height:1;color:${INK};background:${PAP};border:5px solid ${INK};box-shadow:7px 7px 0 ${INK};padding:9px 18px 7px;margin-bottom:6px}
.c small{font-family:Oswald,sans-serif;font-weight:600;font-size:28px;letter-spacing:0;color:#8E0050}
.c.y{background:${YEL}}.c.cy{background:${CYA};color:#fff}.c.cy small{color:#fff}.c.m{background:${RED};color:${YEL};font-size:60px}
.c.q{background:#2C2A66;color:${PAP};border-color:${PAP};box-shadow:7px 7px 0 ${INK};font-size:44px}
#chip{font-weight:700;color:${INK};background:${PAP};padding:2px 12px;border:3px solid ${INK};top:176px;font-size:20px;opacity:1}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: SKY, vig: 0.18, grain: 0.04, capfloor: 0, html, css, chipFont: OS, chipColor: INK, sig: "EP03_NAMA_MARIO",
  extraAt: ["s1:pemilik", "s2:1981", "s2:Ossan", "s2:Jumpman", "s2:Mister", "s3:kalau", "s3:hilang", "s4:menyewa", "s4:Tukwila", "s4:Seattle", "s4:Pemiliknya", "s4:Mario",
    "s5:Segale", "s5:telat", "s5:berdebat", "s5:Minoru", "s5:Setelah", "s5:Mario", "s6:Tapi", "s6:Don", "s6:lelucon", "s6:tidak", "s6:pernah", "s6:Segale",
    "s7:2018", "s7:delapan", "s7:obituarinya", "s7:menghindari", "s8:Kamu"],
  // Caption boxes swing down from their top edge like a page corner, then get flicked off to the left.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{rotationX:-88,opacity:0,transformPerspective:900,transformOrigin:'50% 0%'},{rotationX:0,opacity:1,duration:.42,ease:'back.out(1.6)'},a-.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:-160,rotation:-5,opacity:0,duration:.16,ease:'power2.in'},b-.16)`,
  fxExtra: `slam:(e,t)=>tl.fromTo(e,{scale:2.1,rotation:-8,opacity:0},{scale:1,rotation:-1.5,opacity:1,duration:.22,ease:'power4.in'},t),
 zig:(e,t)=>tl.fromTo(e,{x:-70,skewX:12,opacity:0},{x:0,skewX:0,opacity:1,duration:.3,ease:'back.out(2)'},t),`,
  // Outro: a diagonal page turn wipes the AUDIRA card in.
  outroIn: `gsap.set('#outro',{clipPath:'polygon(0% 0%,0% 0%,-40% 100%,-40% 100%)'});tl.to('#outro',{clipPath:'polygon(0% 0%,140% 0%,100% 100%,-40% 100%)',duration:.6,ease:'power3.inOut'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px;display:flex;justify-content:center;align-items:flex-end}
.capin{position:relative;max-width:880px;text-align:center;font-family:Bangers,Impact,sans-serif;font-weight:400;font-size:64px;line-height:1.08;letter-spacing:.02em;color:${INK};background:${PAP};border:5px solid ${INK};box-shadow:9px 9px 0 ${INK};padding:10px 24px 8px}
.w{display:inline-block;margin:0 .12em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",scale:1},{color:"${RED}",scale:1.12,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",scale:1,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{rotation:-3,scale:.8,opacity:0},{rotation:0,scale:1,opacity:1,duration:.16,ease:"back.out(2.4)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Nama Mario", SKY);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
