// EP04 THE LOAD PATH. Drafting-sheet panels that wipe open like a blueprint unrolled; force colours match the 3D. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const COMP = "#FF8A3D", TENS = "#58B5FF", INK = "#071726", PAPER = "#F4F1EA";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">HOW THE WORLD WORKS &middot; EP 04</div>
  <div class="h0">JEMBATAN</div>
  <div class="tl">Bagaimana beban ribuan ton berpindah?</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">JENIS BEBAN</div>
  <div class="ro" data-at="s2:mati" data-fx="up"><b>BEBAN MATI</b><span>berat jembatan sendiri</span></div>
  <div class="ro" data-at="s2:hidup" data-fx="up"><b>BEBAN HIDUP</b><span>kendaraan dan manusia, berubah terus</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">SATU SEGMEN DEK</div>
  <div class="du"><div class="c" data-at="s3:Tekan" data-fx="pop"><b>TEKAN</b><span>memampatkan</span></div><div class="t" data-at="s3:Tarik" data-fx="pop"><b>TARIK</b><span>meregangkan</span></div></div>
  <div class="ch" data-at="s3:geser" data-fx="fade">+ gaya geser &amp; momen lentur. Lenturan diperbesar.</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">TIGA CARA MENYALURKAN BEBAN</div>
  <div class="ro" data-at="s4:Balok" data-fx="up"><b>BALOK</b><span>berat turun ke pilar</span></div>
  <div class="ro" data-at="s4:Rangka" data-fx="up"><b>RANGKA</b><span>dibagi ke batang tekan dan tarik</span></div>
  <div class="ro" data-at="s4:Lengkung" data-fx="up"><b>LENGKUNG</b><span>tekan didorong ke tumpuan</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">BENTANG PANJANG</div>
  <div class="ro" data-at="s5:gantung" data-fx="up"><b>GANTUNG</b><span>dek &#8594; kabel utama &#8594; angkur</span></div>
  <div class="ro" data-at="s5:kabel-tetap" data-fx="up"><b>KABEL-TETAP</b><span>dek &#8594; kabel &#8594; pilon</span></div>
  <div class="srcl" data-at="s5:Suramadu" data-fx="fade">Suramadu: bentang utama 434 m, pilon 146 m. Model 3D adalah ilustrasi, bukan replika.</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">JALUR BEBAN</div>
  <div class="path"><span class="c" data-at="s6:dek" data-fx="fade">DEK</span><span class="t" data-at="s6:Kabel" data-fx="fade">KABEL</span><span class="c" data-at="s6:Pilon" data-fx="fade">PILON</span><span class="c" data-at="s6:fondasi" data-fx="fade">FONDASI</span><span class="c" data-at="s6:tanah" data-fx="fade">TANAH</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">GERAK TERMAL &middot; DIPERBESAR</div>
  <div class="ro" data-at="s7:Panas" data-fx="up"><b>MEMUAI</b><span>panas, celah menyempit</span></div>
  <div class="ro" data-at="s7:dingin" data-fx="up"><b>MENYUSUT</b><span>dingin, celah melebar</span></div>
  <div class="ch" data-at="s7:meter" data-fx="fade">Sambungan ekspansi: 30&ndash;1.000 mm</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:Jadi" data-fx="up">BEBAN TIDAK DILAWAN.<br><i>DIANTARKAN.</i></div>
  <div class="srcl" data-at="s8:tanah" data-fx="fade">Sumber: PBS Building Big, Wikipedia (Bridge, Structural load, Expansion joint, Suramadu)</div>
</div>`;

const css = `
.st{display:inline-block;font-family:Roboto,sans-serif;font-weight:700;font-size:27px;letter-spacing:.09em;color:${INK};background:${PAPER};padding:6px 12px;margin-bottom:12px}
.h0{font-family:"League Gothic",sans-serif;font-size:216px;line-height:.96;letter-spacing:.012em;color:#fff;text-shadow:0 5px 34px rgba(30,20,10,.55)}
.h2{font-family:"League Gothic",sans-serif;font-size:104px;line-height:1.02;letter-spacing:.012em;color:#fff;text-shadow:0 4px 26px rgba(10,10,10,.75)}
.h2 i{font-style:normal;color:${COMP}}
.tl{font-family:Roboto,sans-serif;font-weight:700;font-size:39px;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.75);margin-top:4px}
.ro{background:rgba(7,23,38,.76);border-left:6px solid ${PAPER};padding:10px 18px;margin-top:9px}
.ro b{display:block;font-family:"League Gothic",sans-serif;font-weight:400;font-size:66px;line-height:1.04;letter-spacing:.02em;color:#fff}
.ro span{display:block;font-family:Roboto,sans-serif;font-weight:700;font-size:31px;line-height:1.16;color:#D5E5F2}
.du{display:flex;gap:12px}.du>div{flex:1;background:rgba(7,23,38,.76);padding:10px 18px}
.du .c{border-top:9px solid ${COMP}}.du .t{border-top:9px solid ${TENS}}
.du b{display:block;font-family:"League Gothic",sans-serif;font-weight:400;font-size:88px;line-height:1;letter-spacing:.02em}
.du .c b{color:${COMP}}.du .t b{color:${TENS}}
.du span{display:block;font-family:Roboto,sans-serif;font-weight:700;font-size:31px;color:#fff}
.ch{font-family:Roboto,sans-serif;font-weight:700;font-size:31px;line-height:1.18;color:#fff;margin-top:10px;text-shadow:0 2px 10px #000}
.path{display:flex;gap:7px}
.path span{flex:1;text-align:center;font-family:"League Gothic",sans-serif;font-size:50px;letter-spacing:.015em;padding:8px 0;background:rgba(7,23,38,.82);color:#fff}
.path span.c{border-bottom:7px solid ${COMP}}.path span.t{border-bottom:7px solid ${TENS}}
.srcl{font-family:Roboto,sans-serif;font-weight:500;font-size:26px;line-height:1.22;color:#fff;margin-top:12px;text-shadow:0 2px 10px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: INK, vig: 0.3, grain: 0.035, capfloor: 0.34, html, css,
  extraAt: ["s2:mati", "s2:hidup", "s3:Tekan", "s3:Tarik", "s3:melengkung", "s4:Balok", "s4:Rangka", "s4:Lengkung", "s5:gantung", "s5:kabel-tetap", "s5:Suramadu", "s6:truk", "s6:dek", "s6:Kabel", "s6:Pilon", "s6:fondasi", "s6:tanah", "s7:Panas", "s7:dingin", "s7:Bantalan", "s7:meter", "s8:Jadi", "s8:tanah"],
  // A panel is drawn on like a sheet unrolled from the left; on exit it rolls back.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(0 100% 0 0)',opacity:1},{clipPath:'inset(0 0% 0 0)',duration:.36,ease:'power3.out'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0 0 0 100%)',duration:.2,ease:'power3.in'},b-.34)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Roboto,sans-serif;font-weight:900;font-size:60px;line-height:1.26;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 5px;box-shadow:inset 0 0 0 0 ${COMP}}`,
// Active word sits on a load bar that drops into place under it.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0px 0 0 #FF8A3D"},{color:"#FFD9B8",boxShadow:"inset 0 -9px 0 0 #FF8A3D",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0px 0 0 #FF8A3D",duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0},{opacity:1,duration:.1,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Load Path", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
