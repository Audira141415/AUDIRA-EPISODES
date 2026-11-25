// EP04 CLAY CAT HOST. Playful: rounded clay chips, chunky Nunito, every UI move stepped at 12 fps with squash. Run from this folder: node build-video.mjs
import { copyFileSync, writeFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PLUM = "#4A2444", CREAM = "#FFF4E0", TEAL = "#1E9A8E", ORG = "#E9782E", YEL = "#F6C445", PNK = "#E96F90";
const F = "Nunito,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="chipk" style="background:${PLUM};color:${CREAM}">AI MOTION TANPA RIBET / EP 04</div>
  <div class="hh">Hewan AI<br><span>bisa bicara.</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="chipk" style="background:${PLUM};color:${CREAM}">URUTANNYA</div>
  <div class="ordr"><b class="b1" data-at="s2:Suara" data-fx="pop">1 SUARA</b><b class="b2" data-at="s2:wajah" data-fx="pop">2 WAJAH</b></div>
  <div class="tip" data-at="s2:patokan" data-fx="pop">Rekaman jadi patokan mulut</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="chipk" style="background:${TEAL};color:#fff">KARAKTER</div>
  <div class="tip" data-at="s3:wajah" data-fx="pop">Wajah menghadap depan</div>
  <div class="tip" data-at="s3:mulut" data-fx="pop">Mulut terlihat, cahaya rata</div>
  <div class="tip y" data-at="s3:Punya" data-fx="pop">Punya taring? Harus kelihatan.</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="chipk" style="background:${ORG};color:#fff">SUARA / TTS</div>
  <div class="tip" data-at="s4:Tanda" data-fx="pop">Tanda baca = jeda</div>
  <div class="tip y" data-at="s4:akting" data-fx="pop">Jeda = akting</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="chipk" style="background:${PNK};color:#fff">JALUR 1 / SUARA</div>
  <div class="hh sm" data-at="s5:Hedra" data-fx="pop">Hedra</div>
  <div class="tip" data-at="s5:Satu" data-fx="pop">1 gambar + 1 rekaman</div>
  <div class="tip" data-at="s5:sepuluh" data-fx="pop">Sampai 10 menit, cocok ngobrol</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="chipk" style="background:${TEAL};color:#fff">JALUR 2 / AKTING</div>
  <div class="hh sm" data-at="s6:Runway" data-fx="pop">Runway Act-Two</div>
  <div class="tip" data-at="s6:rekam" data-fx="pop">Kamu berakting, karakter mengikuti</div>
  <div class="tip y" data-at="s6:Standard" data-fx="pop">Paket Standard ke atas</div>
</div>
<div class="p" data-in="s7" data-out="@END">
  <div class="tip" data-at="s7:nyata" data-fx="pop">Tampak nyata? Beri label AI.</div>
  <div class="tip" data-at="s7:Kartun" data-fx="pop">Kartun: tidak wajib di YouTube</div>
  <div class="tip y" data-at="s7:boneka" data-fx="pop">Aku boneka kode, bukan hasil AI</div>
</div>`;

const css = `
#chip{text-shadow:0 2px 0 rgba(74,36,68,.5)}
.chipk{display:inline-block;font-family:${F};font-weight:900;font-size:27px;letter-spacing:.03em;border-radius:30px;padding:8px 22px;margin-bottom:10px}
.hh{font-family:${F};font-weight:900;font-size:98px;line-height:1;color:${PLUM};letter-spacing:-.02em;text-shadow:0 5px 0 rgba(255,255,255,.55)}.hh span{color:${ORG}}.hh.sm{font-size:74px;margin-bottom:6px}
.tip{background:${CREAM};color:${PLUM};font-family:${F};font-weight:900;font-size:40px;line-height:1.14;padding:12px 22px;border-radius:30px;margin-bottom:9px;box-shadow:0 7px 0 rgba(74,36,68,.26)}.tip.y{background:${YEL}}
.ordr{display:flex;gap:12px;margin-bottom:9px}.ordr b{flex:1;text-align:center;font-family:${F};font-weight:900;font-size:50px;padding:16px 0;border-radius:32px;color:#fff;box-shadow:0 7px 0 rgba(74,36,68,.26)}.b1{background:${TEAL}}.b2{background:${ORG}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
// The world needs word times for the lip sync, so they are appended as a data module next to it.
writeFileSync("PROJECT/HyperFrames_Remotion/assets/lib/words.js", "export default " + JSON.stringify(TL.words.map((w) => ({ text: w.text, start: w.start, end: w.end }))));
const src = readFileSync("world3d.js", "utf8");
writeFileSync("PROJECT/HyperFrames_Remotion/assets/lib/world3d.js", `import WORDS from "./words.js";\n` + src.replace("export function create(canvas, K, AT, W) {", "export function create(canvas, K, AT, W = WORDS) {"));
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: "#F2BE96", vig: .1, grain: .03, capfloor: 0, html, css, chipFont: F, chipColor: "#fff", chip: "BONEKA 3D DARI KODE, BUKAN HASIL AI",
  extraAt: ["s2:Suara", "s2:wajah", "s3:Karakter", "s3:Punya", "s4:Suara", "s5:Hedra", "s6:Jalur", "s6:Standard", "s7:Rahasiaku", "s7:label"],
  // Twelve-step squash so panels read as hand-moved objects.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{scale:.72,y:42,opacity:0},{scale:1,y:0,opacity:1,duration:.34,ease:'steps(4)'},a-.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{scale:.82,y:-30,opacity:0,duration:.17,ease:'steps(2)'},b-.17)`,
  fxExtra: `pop:(e,t)=>tl.fromTo(e,{scale:.6,opacity:0},{scale:1,opacity:1,duration:.25,ease:'steps(3)'},t),`,
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 58%)'});tl.to('#outro',{clipPath:'circle(130% at 50% 58%)',duration:.58,ease:'steps(7)'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Nunito,sans-serif;font-weight:900;font-size:60px;line-height:1.13;color:${CREAM};-webkit-text-stroke:0;text-shadow:3px 0 0 ${PLUM},-3px 0 0 ${PLUM},0 3px 0 ${PLUM},0 -3px 0 ${PLUM},3px 3px 0 ${PLUM},-3px 3px 0 ${PLUM},3px -3px 0 ${PLUM},-3px -3px 0 ${PLUM},0 8px 0 ${PLUM}}
.w{display:inline-block}`,
(id, w) => `tl.set("#${id}",{color:"${YEL}",y:-6},${w.start.toFixed(3)});tl.set("#${id}",{color:"${CREAM}",y:0},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.17,ease:"steps(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Clay Cat Host", "#F2BE96");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
