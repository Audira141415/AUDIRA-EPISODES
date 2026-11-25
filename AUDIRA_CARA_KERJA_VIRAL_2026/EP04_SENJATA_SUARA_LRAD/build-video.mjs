// EP04 THE BEAM. Blueprint-hologram look: navy grid, cyan wavefronts, amber measurements, panels that glitch in. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CY = "#38E1FF", AM = "#FFB547", RED = "#FF4B3A", INK = "#040914";

// dB ladder: bar width follows dB linearly, label says what the level means
const rung = (db, txt, cls, a) => `<div class="rg ${cls}" data-at="${a}" data-fx="left"><b>${db}</b><i style="width:${(db - 40) * 4.2}px"></i><span>${txt}</span></div>`;
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 04</div>
  <div class="h0">SENJATA<br><i>SUARA</i></div>
  <div class="db"><b class="ct" data-from="0" data-to="160" data-a="s1:sampai" data-d="1.2">0</b><span>dB</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">LRAD &middot; LONG RANGE ACOUSTIC DEVICE</div>
  <div class="ro" data-at="s2:komunikasi" data-fx="left"><b>ALAT KOMUNIKASI</b><span>menurut pembuatnya, Genasys</span></div>
  <div class="ro r" data-at="s2:nada" data-fx="left"><b>NADA PERINGATAN</b><span>di sekitar 2&ndash;4 kHz, bisa menyakitkan</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">KENAPA TERARAH?</div>
  <div class="cmp"><div data-at="s3:ukuran" data-fx="pop"><b>KECIL</b><span>gelombang menyebar ke segala arah</span></div><div class="c" data-at="s3:lebar" data-fx="pop"><b>LEBAR</b><span>&#8776; 6&times; panjang gelombang (perkiraan) &#8594; berkas</span></div></div>
  <div class="srcl" data-at="s3:gelombang" data-fx="fade">Simulasi medan gelombang dari puluhan sumber sefase. Skala diperbesar.</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">INTERFERENSI</div>
  <div class="ro" data-at="s4:menguatkan" data-fx="left"><b>DEPAN: SALING MENGUATKAN</b><span>puncak bertemu puncak</span></div>
  <div class="ro" data-at="s4:meredam" data-fx="left"><b>SAMPING: SALING MEREDAM</b><span>puncak bertemu lembah</span></div>
  <div class="big" data-at="s4:derajat" data-fx="pop">&#8776; 30&deg;</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">SKALA DESIBEL</div>
  <div class="note" data-at="s5:sepuluh" data-fx="up">+10 dB = intensitas &times;10</div>
  ${rung(60, "percakapan", "", "s5:Desibel")}
  ${rung(85, "batas paparan kerja (NIOSH, 8 jam)", "", "s5:sepuluh")}
  ${rung(120, "ambang rasa sakit", "r", "s5:sakit")}
  ${rung(160, "puncak LRAD, diukur 1 m", "r", "s5:meter")}
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">JARAK &amp; ARAH</div>
  <div class="ro" data-at="s6:melemah" data-fx="left"><b>&minus;6 dB / JARAK &times;2</b><span>perkiraan hukum kuadrat terbalik, di luar medan dekat</span></div>
  <div class="ro r" data-at="s6:sempit" data-fx="left"><b>DI DEPAN CORONG: PALING KERAS</b><span>di samping berkas jauh lebih pelan</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st r">PITTSBURGH &middot; G20 2009</div>
  <div class="ro r" data-at="s7:permanen" data-fx="left"><b>GANGGUAN PENDENGARAN PERMANEN</b><span>gugatan Karen Piper vs Kota Pittsburgh</span></div>
  <div class="tel" data-at="s7:dolar" data-fx="up"><b>US$72.000</b><span>penyelesaian, November 2012 (ACLU Pennsylvania)</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:Jadi" data-fx="up">IA MEMBIDIK SUARA.<br><i>MENJAUH. TUTUP TELINGA.</i></div>
  <div class="srcl" data-at="s8:terbaik" data-fx="fade">Sumber: lembar data Genasys LRAD; ACLU-PA; NIDCD; NIOSH; Pontianak Post 2 Nov 2026; Wikipedia &ldquo;LRAD&rdquo;. Visual adalah simulasi skematik.</div>
</div>`;

const css = `
.st{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:800;font-size:25px;letter-spacing:.08em;color:${INK};background:${CY};padding:6px 12px;margin-bottom:14px}
.st.r{background:${RED};color:#fff}
.h0{font-family:"Bebas Neue",sans-serif;font-size:220px;line-height:.86;color:#fff;text-shadow:0 0 40px rgba(56,225,255,.35)}
.h0 i{font-style:normal;color:${CY}}
.db{display:flex;align-items:baseline;gap:10px;margin-top:6px}
.db b{font-family:"Bebas Neue",sans-serif;font-weight:400;font-size:150px;line-height:1;color:${AM}}
.db span{font-family:"JetBrains Mono",monospace;font-weight:800;font-size:48px;color:${AM}}
.h2{font-family:"Bebas Neue",sans-serif;font-size:118px;line-height:.95;color:#fff;text-shadow:0 0 30px rgba(56,225,255,.3)}
.h2 i{font-style:normal;color:${CY}}
.ro{background:rgba(4,9,20,.8);border:1px solid rgba(56,225,255,.35);border-left:6px solid ${CY};padding:10px 18px;margin-top:10px}
.ro.r{border-left-color:${RED}}
.ro b{display:block;font-family:"Bebas Neue",sans-serif;font-weight:400;font-size:62px;line-height:1.02;color:#fff;letter-spacing:.01em}
.ro span{display:block;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:26px;line-height:1.22;color:#BFD8F2}
.cmp{display:flex;gap:12px;width:880px}.cmp>div{flex:1;background:rgba(4,9,20,.82);padding:10px 18px;border-top:8px solid ${AM}}
.cmp>div.c{border-color:${CY}}
.cmp b{display:block;font-family:"Bebas Neue",sans-serif;font-size:76px;line-height:1;color:#fff}
.cmp span{display:block;font-family:"JetBrains Mono",monospace;font-size:25px;line-height:1.2;color:#BFD8F2}
.big{font-family:"Bebas Neue",sans-serif;font-size:170px;line-height:1;color:${AM};margin-top:6px;text-shadow:0 0 30px rgba(255,181,71,.4)}
.note{font-family:"JetBrains Mono",monospace;font-weight:800;font-size:34px;color:${AM};margin-bottom:6px}
.rg{display:flex;align-items:center;gap:14px;margin-top:10px;background:rgba(4,9,20,.8);padding:8px 14px;width:900px}
.rg b{font-family:"Bebas Neue",sans-serif;font-weight:400;font-size:64px;line-height:1;color:#fff;width:96px}
.rg i{display:block;height:22px;background:${CY};flex:none}
.rg.r i{background:${RED}}
.rg span{font-family:"JetBrains Mono",monospace;font-weight:600;font-size:23px;line-height:1.15;color:#BFD8F2}
.tel{margin-top:12px;background:rgba(4,9,20,.82);padding:10px 18px;width:760px}
.tel b{display:block;font-family:"Bebas Neue",sans-serif;font-size:130px;line-height:1;color:${AM}}
.tel span{display:block;font-family:"JetBrains Mono",monospace;font-size:26px;color:#BFD8F2}
.srcl{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:23px;line-height:1.3;color:#fff;margin-top:14px;text-shadow:0 2px 10px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: INK, vig: 0.45, grain: 0.05, capfloor: 0.45, html, css,
  extraAt: ["s1:sampai", "s2:LRAD", "s2:nada", "s3:senter", "s3:ukuran", "s3:lebar", "s3:gelombang", "s4:menguatkan", "s4:meredam", "s4:derajat", "s5:sepuluh", "s5:sakit", "s5:meter", "s6:melemah", "s6:sempit", "s6:sampingnya", "s7:Pittsburgh", "s7:permanen", "s7:dolar", "s8:membidik", "s8:Menjauh"],
  // Glitch in: the panel arrives in three horizontal slices that settle; exit is a hard flicker.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:1,clipPath:'inset(0 0 66% 0)',x:-24},{clipPath:'inset(0 0 33% 0)',x:16,duration:.06,ease:'none'},a-.16);tl.to(p,{clipPath:'inset(0 0 0% 0)',x:0,duration:.08,ease:'none'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:.2,x:12,duration:.05},b-.3);tl.to(p,{opacity:.8,x:-8,duration:.05},b-.25);tl.to(p,{opacity:0,duration:.06},b-.2);}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Bebas Neue",sans-serif;font-size:84px;line-height:1.02;letter-spacing:.01em;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 6px}`,
// Active word glows cyan like a wavefront passing.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",textShadow:"0 3px 12px rgba(0,0,0,.95)"},{color:"#38E1FF",textShadow:"0 0 22px rgba(56,225,255,.9)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",textShadow:"0 3px 12px rgba(0,0,0,.95)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0},{opacity:1,duration:.08,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Beam", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
