// EP03 OTAK NPC. Manga pages: black ink on paper, red only for thought, balloons as the panels, hard cuts. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#14110F", PAP = "#F5EFE0", RED = "#E0242A";
const F = "Bangers,sans-serif", H = '"Patrick Hand",sans-serif';

const html = `
<div id="dots"></div><div id="speed"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">AI BIKIN GAME / EP 03</div>
  <div class="bal">(tells him the correct answer)<em>pemain, Where Winds Meet</em></div>
  <div class="ttl" data-at="s1:percaya" data-fx="stamp">NPC: PERCAYA!</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kk">WHERE WINDS MEET</div>
  <div class="ttl">TANPA <span>NASKAH</span></div>
  <div class="bal sm" data-at="s2:menyusun" data-fx="pop">Dia menyusun jawabannya sendiri.</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kk">NPC LAMA</div>
  <div class="ttl">DAFTAR <span>PILIHAN</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kk">NPC BARU</div>
  <div class="ttl" data-at="s4:LLM" data-fx="stamp">OTAK = <span>LLM</span></div>
  <div class="bal sm" data-at="s4:Roblox" data-fx="pop">&ldquo;You are a very busy beaver.&rdquo;<em>contoh dokumentasi Roblox</em></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kk">CARA KERJANYA</div>
  <div class="bal sm" data-at="s5:Pertanyaan" data-fx="pop">Instruksi + pertanyaan pemain = jawaban</div>
  <div class="ttl nb" data-at="s5:1.200" data-fx="stamp"><span>1.200+</span> TABEL</div>
  <div class="kk wh" data-at="s5:1.200" data-fx="pop">Total War: Pharaoh, penasihat percobaan</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kk">PUBG ALLY</div>
  <div class="ttl">OTAK + <span>TANGAN</span></div>
  <div class="bal sm" data-at="s6:komputer" data-fx="pop">AI berjalan di komputer pemain</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kk">BATASNYA</div>
  <div class="ttl" data-at="s7:dibohongi" data-fx="stamp">BISA <span>DIBOHONGI</span></div>
  <div class="bal sm" data-at="s7:petunjuk" data-fx="pop">Petunjuk teka-teki keliru</div>
  <div class="bal sm" data-at="s7:putaran" data-fx="pop">Risiko putaran tanpa akhir</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="kk">ROBLOX, SURAT Q3 2026</div>
  <div class="bal sm" data-at="s8:melatih" data-fx="pop">Model NPC dari data permainan manusia</div>
  <div class="ttl" data-at="s8:Kalau" data-fx="stamp">TEMAN <span>ATAU TIPU?</span></div>
</div>`;

const css = `
#speed{position:absolute;inset:-120px;z-index:7;pointer-events:none;opacity:0;background:repeating-conic-gradient(from 0deg at 50% 50%,rgba(20,17,15,.9) 0deg .7deg,transparent .7deg 4.1deg,rgba(20,17,15,.75) 4.1deg 4.5deg,transparent 4.5deg 9deg);-webkit-mask-image:radial-gradient(ellipse at 50% 45%,transparent 38%,#000 72%);mask-image:radial-gradient(ellipse at 50% 45%,transparent 38%,#000 72%)}
#dots{position:absolute;inset:0;z-index:6;pointer-events:none;background-image:radial-gradient(rgba(20,17,15,.2) 1.7px,transparent 2px);background-size:10px 10px;-webkit-mask-image:linear-gradient(180deg,#000 0,rgba(0,0,0,.05) 30%,rgba(0,0,0,0) 62%,#000 100%);mask-image:linear-gradient(180deg,#000 0,rgba(0,0,0,.05) 30%,rgba(0,0,0,0) 62%,#000 100%)}
.kk{display:inline-block;font-family:${H};font-size:34px;line-height:1;color:${PAP};background:${INK};padding:7px 14px 8px;margin-bottom:14px;transform:rotate(-1deg)}.kk.wh{background:${PAP};color:${INK};border:3px solid ${INK};font-size:30px;margin-top:6px}
.ttl{font-family:${F};font-size:118px;line-height:.98;letter-spacing:.015em;color:${INK};-webkit-text-stroke:0;text-shadow:5px 5px 0 ${PAP},-3px -3px 0 ${PAP},5px -3px 0 ${PAP},-3px 5px 0 ${PAP};margin-bottom:12px}.ttl span{color:${RED}}
.bal{position:relative;display:block;font-family:${H};font-size:60px;line-height:1.08;color:${INK};background:#fff;border:6px solid ${INK};border-radius:40px;padding:18px 28px 20px;margin-bottom:14px}.bal.sm{font-size:46px;border-radius:32px;padding:12px 24px 14px}
.bal em{display:block;font-style:normal;font-size:28px;color:${RED};margin-top:6px}
.nb{font-variant-numeric:tabular-nums}
#chip{color:${INK};background:${PAP};padding:1px 10px;top:176px;font-size:24px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: PAP, vig: 0.0, grain: 0.05, capfloor: 0, html, css, chipFont: H, chipColor: INK,
  extraAt: ["s1:percaya", "s2:menyusun", "s3:Tanya", "s4:otak", "s4:LLM", "s4:Roblox", "s5:Pertanyaan", "s5:Total", "s5:1.200", "s6:bertarung", "s6:mencari", "s6:komputer", "s7:dibohongi", "s7:petunjuk", "s7:putaran", "s8:melatih", "s8:Kalau"],
  hud: `(()=>{const C=["s2","s3","s4","s5","s6","s7","s8"].map(k=>K[k]).concat(AT["s4:Roblox"],AT["s5:Total"],AT["s8:Kalau"],AT["s1:percaya"]);const sp=document.getElementById("speed");return (t)=>{let o=0;for(const c of C){const d=t-c;if(d>=0&&d<.32)o=Math.max(o,1-d/.32);}sp.style.opacity=o;};})()`,
  // Hard panel cuts with an ink slam; no fades in this film.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{scale:1.22,opacity:0},{scale:1,opacity:1,duration:.1,ease:'power4.out'},a-.01)`,
  panelOut: `(tl,p,b)=>tl.set(p,{opacity:0},b-.01)`,
  fxExtra: `pop:(e,t)=>tl.fromTo(e,{scale:.3,opacity:0},{scale:1,opacity:1,duration:.16,ease:'back.out(3)'},t),stamp:(e,t)=>tl.fromTo(e,{scale:2,rotation:-5,opacity:0},{scale:1,rotation:-1.5,opacity:1,duration:.13,ease:'power4.in'},t),`,
  // Page turn into the outro.
  outroIn: `gsap.set('#outro',{clipPath:'polygon(100% 0,100% 0,100% 100%,100% 100%)'});tl.to('#outro',{clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',duration:.32,ease:'power4.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:44px;right:90px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${H};font-size:66px;line-height:1.04;color:${INK};background:#fff;border:6px solid ${INK};border-radius:38px;padding:10px 22px 14px}
.w{display:inline-block}`,
(id, w) => `tl.set("#${id}",{color:"${RED}"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${INK}"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{scale:.8},{scale:1,duration:.1,ease:"back.out(3)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Otak NPC", PAP);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
