// EP44 FRESNEL LENS (GLASSCRAFT). A night lighthouse scene: rotating flash lens, Fresnel exhibit lens
// with morph targets, prism ray diagram, 30 km sight line. Panels are frosted glass cards with cyan/magenta
// accents on a dark navy background. Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#E8F0FF", DARK = "#070B18", CYAN = "#5EE7FF", MAGENTA = "#FF5FD2", AMBER = "#FFD29A";
const HD = "Arial Black,Arial,sans-serif", MN = "'Courier New',monospace", SN = "Arial,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 44</div>
  <div class="card"><div class="big">Kaca <span>berputar</span><br><div class="sm">bukan lampu berkedip</div></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">AUGUSTIN FRESNEL &middot; 1823</div>
  <div class="ln c" data-at="s2:Cordouan" data-fx="lit">Cordouan, Prancis</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">MASALAH LENSA TEBAL</div>
  <div class="ln m" data-at="s3:berat" data-fx="lit">Berat, cahaya terserap</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">IDE FRESNEL</div>
  <div class="ln c" data-at="s4:permukaan" data-fx="lit">Hanya permukaan yang membelokkan</div>
  <div class="ln m" data-at="s4:dibuang" data-fx="lit">Tengah bisa dibuang</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">CINCIN BERTINGKAT</div>
  <div class="card" data-at="s5:bertingkat" data-fx="lit"><div class="big sm2">Tipis <span>&amp; ringan</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">PRISMA ATAS &amp; BAWAH</div>
  <div class="ln c" data-at="s6:ditangkap" data-fx="lit">Cahaya ditangkap &rarr; berkas tajam</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">KILATAN &amp; JANGKAUAN</div>
  <div class="card" data-at="s7:tiga" data-fx="lit"><div class="big sm2">30 <span>km</span></div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:lampu" data-fx="lit"><div class="big sm2">Satu lampu<br><span>menjaga cakrawala</span></div></div>
  <div class="ln c" data-at="s8:berikutnya" data-fx="lit">Berikutnya: detektor asap ionisasi</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.12em;color:${CYAN};background:rgba(94,231,255,.12);padding:9px 18px 8px;margin-bottom:16px;transform:rotate(-0.6deg);box-shadow:0 0 24px rgba(94,231,255,.25);border:1px solid rgba(94,231,255,.35)}
.card{display:table;background:rgba(240,250,255,.08);border-radius:8px;padding:14px 30px 20px;margin-bottom:16px;box-shadow:0 0 30px rgba(94,231,255,.2),0 20px 40px rgba(7,11,24,.5);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(4px)}
.big{font-family:${HD};font-weight:900;font-size:96px;line-height:1.0;color:${INK};letter-spacing:-.01em}
.big span{color:${CYAN}}.big .sm{font-size:54px;color:rgba(232,240,255,.7)}.big.sm2{font-size:68px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:41px;line-height:1.2;color:${INK};background:rgba(240,250,255,.06);padding:10px 24px 12px 22px;margin-bottom:12px;border-left:4px solid ${CYAN};border-radius:0 6px 6px 0;box-shadow:0 0 20px rgba(94,231,255,.15);max-width:880px}
.ln.c{border-left-color:${CYAN}}.ln.m{border-left-color:${MAGENTA}}
#chip{font-family:${MN};font-size:27px;font-weight:700;color:${INK};opacity:.65;letter-spacing:.06em;background:rgba(7,11,24,.5);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "44", bg: "#070B18", vig: 0.35, grain: 0.04, capfloor: 0.12, html, css, chipFont: MN, chipColor: INK, sig: "EP44_RUMAH_LAMPU_MERCUSUAR_LENSA_FRESNEL",
  extraAt: [
    "s1:lampunya", "s1:berputar",
    "s2:Augustin", "s2:Cordouan", "s2:seribu",
    "s3:berat", "s3:terserap",
    "s4:permukaan", "s4:tengahnya", "s4:dibuang",
    "s5:dipotong", "s5:bertingkat", "s5:ringan", "s5:sama",
    "s6:atas", "s6:Prisma", "s6:ditangkap", "s6:cakrawala", "s6:tajam",
    "s7:menyapu", "s7:Pola", "s7:kelas", "s7:dua", "s7:setengah", "s7:tiga", "s7:kilometer",
    "s8:lampu", "s8:AUDIRA", "s8:berikutnya",
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:.9,y:20},{opacity:1,scale:1,y:0,duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scale:.95,y:-14,duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.75,x:-4},{opacity:1,x:0,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.5,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:58px;line-height:1.16;color:#E8F0FF;text-transform:uppercase;letter-spacing:.01em;background:rgba(7,11,24,.88);padding:10px 24px 14px;border-radius:10px;box-shadow:0 0 24px rgba(94,231,255,.3)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#E8F0FF",scale:1},{color:"#5EE7FF",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#E8F0FF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Lensa Fresnel Mercusuar", "#070B18");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
