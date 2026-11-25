// EP05 PIXEL ACRE. Low-res farm painted 4x, bitmap headings in hard-edged boxes, panels snap in by frames with no easing. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PINK = "#FF5FA8", LEAF = "#2F7A3F", SUN = "#FFD65A", PLUM = "#2B1D3A", PAPER = "#FFF8E7", RED = "#D23B4E", BG = "#4AA8E8";
const S = 'Silkscreen,monospace', O = 'Outfit,sans-serif';

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="box k">MMORPG: MAIN GAME BISA JADI UANG? / EP 05</div>
  <div class="box h">MENANAM<br>= <span>KRIPTO?</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="box k">PIXELS / JARINGAN RONIN</div>
  <div class="box h">GAME FARMING</div>
  <div class="box r" data-at="s2:Gratis" data-fx="pop"><b>GRATIS</b><span>untuk dimainkan</span></div>
  <div class="box r" data-at="s2:sepuluh" data-fx="pop"><b>10 JUTA+</b><span>pemain, klaim situs resmi</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="box k">PUTARAN HARIAN</div>
  <div class="row3"><b class="box" data-at="s3:Tanam" data-fx="pop">TANAM</b><b class="box" data-at="s3:panen" data-fx="pop">PANEN</b><b class="box" data-at="s3:masak" data-fx="pop">MASAK</b></div>
  <div class="box r" data-at="s3:energi" data-fx="pop"><b>ENERGI</b><span>1% tiap 5 menit, atau lewat makanan</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="box k">LAHAN MEMBEDAKAN HASIL</div>
  <div class="box r" data-at="s4:Speck" data-fx="pop"><b>SPECK</b><span>gratis, hasil terbatas</span></div>
  <div class="box r" data-at="s4:NFT" data-fx="pop"><b class="pk">LAHAN NFT</b><span>hasil tertinggi</span></div>
  <div class="box r" data-at="s4:sharecropper" data-fx="pop"><b class="lf">SHARECROPPER</b><span>tanpa lahan, kerja di sana</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="box k">DUA MATA UANG</div>
  <div class="box r" data-at="s5:Koin" data-fx="pop"><b>KOIN</b><span>kebutuhan harian</span></div>
  <div class="box r" data-at="s5:premium" data-fx="pop"><b class="pk">PIXEL</b><span>premium, lewat tugas dan hadiah musiman</span></div>
  <div class="box r" data-at="s5:Ronin" data-fx="pop"><b class="lf">RONIN</b><span>tempat PIXEL diperdagangkan</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="box k">REWARD TIDAK OTOMATIS</div>
  <div class="box h nb" data-at="s6:84" data-fx="pop" style="font-family:Outfit,sans-serif;font-weight:900"><span>&minus;84%</span></div>
  <div class="box r" data-at="s6:84" data-fx="pop"><b>INFLASI</b><span>koin harian, Chapter 2.5, klaim studio</span></div>
  <div class="box r" data-at="s6:mengambil" data-fx="pop"><b class="rd">MASALAH</b><span>nilai mengalir ke pengguna yang cuma mengambil</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="box k">GRAFIK ILUSTRASI, DUA TITIK BERSUMBER</div>
  <div class="box r nb" data-at="s7:Harga" data-fx="pop"><b>US$1,02</b><span>puncak, Mar 2024</span></div>
  <div class="box r nb" data-at="s7:99" data-fx="pop"><b class="rd">US$0,0042</b><span>4 Nov 2026, CoinGecko</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="box h sm" data-at="s8:Jadi" data-fx="pop">MAIN &ne;<br><span>OTOMATIS UANG</span></div>
  <div class="row3"><b class="box" data-at="s8:peluang" data-fx="pop">PELUANG?</b><b class="box" data-at="s8:hiburan" data-fx="pop">HIBURAN?</b></div>
  <div class="box k" data-at="s8:Menurut" data-fx="pop">BUKAN SARAN INVESTASI</div>
</div>`;

const css = `
#chip{text-shadow:2px 2px 0 #2B1D3A,-2px 2px 0 #2B1D3A,2px -2px 0 #2B1D3A,-2px -2px 0 #2B1D3A}
@font-face{font-family:Silkscreen;src:url('assets/fonts/silkscreen-700.woff2') format('woff2');font-weight:700}
.box{display:block;background:${PAPER};color:${PLUM};border:6px solid ${PLUM};box-shadow:6px 6px 0 rgba(43,29,58,.55)}
.k{display:inline-block;font-family:${S};font-weight:700;font-size:26px;line-height:1.2;padding:4px 12px;margin-bottom:12px;letter-spacing:-.02em}
.h{font-family:${S};font-weight:700;font-size:88px;line-height:1.02;padding:10px 16px;margin-bottom:10px;letter-spacing:-.03em}.h span{color:${PINK}}.h.sm{font-size:70px}
.r{display:flex;align-items:center;gap:14px;padding:8px 14px;margin-bottom:10px}
.r b{flex:none;font-family:${S};font-weight:700;font-size:40px;line-height:1.05;letter-spacing:-.03em}.r span{font-family:${O};font-weight:700;font-size:29px;line-height:1.14}
.pk{color:#C22A7E}.lf{color:${LEAF}}.rd{color:${RED}}
.row3{display:flex;gap:8px;margin-bottom:10px}.row3 b{flex:1;text-align:center;font-family:${S};font-weight:700;font-size:38px;padding:12px 0;letter-spacing:-.03em;background:${SUN}}
.nb{font-variant-numeric:tabular-nums}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: BG, vig: 0, grain: 0.0, capfloor: 0, html, css, chipFont: O, chipColor: PAPER,
  extraAt: ["s1:kripto", "s2:sepuluh", "s3:Tanam", "s3:panen", "s3:masak", "s3:energi", "s3:lima", "s3:makanan", "s4:Speck", "s4:NFT", "s4:sharecropper", "s5:Koin", "s5:PIXEL", "s5:Ronin", "s6:Chapter", "s6:mengambil", "s7:Harga", "s7:tetap"],
  // Hard steps only: this film has no soft easing.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:32,opacity:0},{y:0,opacity:1,duration:.2,ease:'steps(4)'},a-.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-32,opacity:0,duration:.13,ease:'steps(3)'},b-.13)`,
  fxExtra: `pop:(e,t)=>tl.fromTo(e,{scale:.7,opacity:0},{scale:1,opacity:1,duration:.16,ease:'steps(3)'},t),`,
  // Closes with a chunky pixel iris.
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 62%)'});tl.to('#outro',{clipPath:'circle(125% at 50% 62%)',duration:.5,ease:'steps(10)'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1310px;height:230px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${O};font-weight:800;font-size:60px;line-height:1.14;color:#FFFFFF;text-shadow:4px 0 0 ${PLUM},-4px 0 0 ${PLUM},0 4px 0 ${PLUM},0 -4px 0 ${PLUM},4px 4px 0 ${PLUM},-4px 4px 0 ${PLUM},4px -4px 0 ${PLUM},-4px -4px 0 ${PLUM}}
.w{display:inline-block}`,
(id, w) => `tl.set("#${id}",{color:"${SUN}"},${w.start.toFixed(3)});tl.set("#${id}",{color:"#FFFFFF"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:10},{y:0,duration:.1,ease:"steps(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pixel Acre", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
