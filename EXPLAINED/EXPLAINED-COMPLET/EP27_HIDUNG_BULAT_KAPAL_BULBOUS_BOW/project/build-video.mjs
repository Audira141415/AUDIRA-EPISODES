// EP27 BULBOUS BOW (UKIYOFORGE). Panels are woodblock cartouches: washi slips with a carved ink border, a vermilion
// tag block and a serif title; they slide in from the right like a print being laid on the block.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1D1A17", WASHI = "#F3E9D2", VERM = "#D24A2C", PRUS = "#1F3A5F", OCHRE = "#D9A441";
const TT = "'Shippori Mincho B1',serif", SN = "'Zen Kaku Gothic New',sans-serif", MN = "'Space Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 27</div>
  <div class="card"><div class="big">Kapal ini <span>sengaja</span><br>membuat ombak</div></div>
  <div class="ln" data-at="s1:hemat" data-fx="lit">Justru supaya lebih hemat</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">HALUAN BULAT</div>
  <div class="ln v" data-at="s2:bulbous" data-fx="lit"><i>Bulbous bow</i></div>
  <div class="ln" data-at="s2:permukaan" data-fx="lit">Ujung depan, di bawah permukaan air</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">TANPA HALUAN BULAT</div>
  <div class="ln v" data-at="s3:gelombang" data-fx="lit">Gelombang haluan menyedot tenaga</div>
  <div class="ln" data-at="s3:Makin" data-fx="lit">Makin cepat, makin besar</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">GELOMBANG DARI BOLA</div>
  <div class="ln b" data-at="s4:lembah" data-fx="lit">Membentuk lembah, bukan puncak</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">LEMBAH + PUNCAK</div>
  <div class="ln w" data-at="s5:meniadakan" data-fx="lit">Saling meniadakan</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">HASILNYA</div>
  <div class="card" data-at="s6:sepuluh" data-fx="lit"><div class="big sm2">Hemat BBM <span>&plusmn;10&ndash;15%</span></div></div>
  <div class="ln g" data-at="s6:rentang" data-fx="lit">Hanya di rentang kecepatan tertentu</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">NORMANDIE &middot; 1935</div>
  <div class="ln" data-at="s7:knot" data-fx="lit">Lebih dari 30 knot</div>
  <div class="ln v" data-at="s7:persen" data-fx="lit">Tenaga &plusmn;30% lebih kecil dari Queen Mary</div>
  <div class="ln b" data-at="s7:dipotong" data-fx="lit">Kapal kontainer lebih pelan: hidung dipotong, diganti</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:kecepatannya" data-fx="lit"><div class="big sm2">Bentuk hidung<br><span>ikut kecepatan</span></div></div>
  <div class="ln g" data-at="s8:Episode" data-fx="lit">Berikutnya: butiran silika gel</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.12em;color:${WASHI};background:${VERM};padding:9px 18px 8px;margin-bottom:16px;box-shadow:0 0 0 3px ${INK}}
.card{display:table;background:${WASHI};padding:16px 30px 22px;margin-bottom:16px;border:5px solid ${INK};box-shadow:12px 12px 0 ${PRUS}}
.big{font-family:${TT};font-weight:800;font-size:92px;line-height:1.04;color:${INK}}
.big span{color:${VERM}}.big.sm2{font-size:70px;line-height:1.08}
.ln{display:table;font-family:${SN};font-weight:900;font-size:41px;line-height:1.2;color:${INK};background:${WASHI};padding:10px 24px 12px 22px;margin-bottom:12px;border:3px solid ${INK};border-left:14px solid ${OCHRE};max-width:880px}
.ln.v{border-left-color:${VERM}}.ln.b{border-left-color:#2A4F8F}.ln.g{border-left-color:#6F9B5A}.ln.w{border-left-color:${PRUS};background:#FFFDF6}
#chip{font-family:${MN};font-size:26px;font-weight:700;color:${INK};opacity:.78;letter-spacing:.06em;background:rgba(243,233,210,.75);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "27", bg: "#EFE3C8", vig: 0.3, grain: 0.08, capfloor: 0.12, html, css, chipFont: MN, chipColor: INK, sig: "EP27_HIDUNG_BULAT_KAPAL_BULBOUS_BOW",
  extraAt: ["s1:ombak", "s1:hemat", "s2:haluan", "s3:atas", "s3:Makin", "s3:besar", "s3:menyedot", "s4:Bola", "s4:mengalir", "s4:lembah", "s4:puncak",
    "s5:pas", "s5:lembah", "s5:puncak", "s5:meniadakan", "s6:tenaga", "s6:menghemat", "s6:sepuluh", "s6:persen", "s6:Tapi", "s6:rentang",
    "s7:Normandie", "s7:knot", "s7:persen", "s7:Sebaliknya", "s7:dipotong", "s7:diganti", "s8:AUDIRA", "s8:Episode", "s8:kecepatannya", "s2:permukaan", "s2:bulbous"],
  // a print slip laid on the block: slides in from the right with a slight skew, lifts off upward
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:120,skewX:-6},{opacity:1,x:0,skewX:0,duration:.45,ease:'power4.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-30,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.8,x:-6},{opacity:1,x:0,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:56px;line-height:1.18;color:${WASHI};text-transform:uppercase;background:rgba(29,26,23,.92);padding:10px 24px 14px;border:3px solid ${WASHI};box-shadow:8px 8px 0 ${VERM}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WASHI}",scale:1},{color:"${OCHRE}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WASHI}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:16},{x:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bulbous Bow", "#EFE3C8");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
