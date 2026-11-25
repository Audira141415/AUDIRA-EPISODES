// EP38 ENKLAVE INDIA–BANGLADESH: SULAMFORGE. A big kantha cloth in a beech frame. The border is told through four
// nested appliqué patches in alternating thread colours (BANGLADESH > INDIA > BANGLADESH > INDIA); the camera pulls
// out layer by layer in the hook and dives back in for the counts 102 / 21 / 1. Other beats live elsewhere on the same
// cloth: Dahala Khagrabari with a stitched football pitch and a CHITMAHAL tag, cards + chess king tagged KONON beside
// a brass 1713 plaque, the 1947 line sewn in red with 111 + 51 trapped patches, a village of appliqué houses
// (51.549 orang, 2010), and a clock that spins to midnight 31 JULI 2015 while the 162 patches are re-stitched.
// Panels are cream fabric labels with running-stitch borders. AUDIRA is a woven maker's label on the cloth.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CARD = "#F3E9D2", INK = "#2A1A22", PLUM = "#3A1626", GOLD = "#D4A63A", RED = "#B5222F", SAF = "#E07F1F", IGR = "#138808", BGR = "#006A4E", BG = "#1A0D13";
const HEAD = `'Fraunces',Georgia,serif`, MONO = `'IBM Plex Mono',Consolas,monospace`;

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d) => `<b class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}">0</b>`;

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&family=IBM+Plex+Mono:wght@500;600&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 38", "FAKTA SEJARAH NEGARA")}
  <div class="cd h1">Enklave di dalam <em>enklave</em></div>
  <div class="stamp" data-at="s1:Satu-satunya" data-fx="stampc">SATU-SATUNYA DI DUNIA</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  ${kk("No. 02", "TINGKAT TIGA")}
  ${row("DAHALA KHAGRABARI", "kebun, &plusmn;7.000 m&sup2;", "s2:Dahala")}
  ${row("&asymp; 1 LAPANGAN SEPAK BOLA", "", "s2:lapangan", "gd")}
  <div class="stamp" data-at="s2:chitmahal" data-fx="stampc">CHITMAHAL</div>
</div>
<div class="p" data-in="s3" data-out="s3:Catatan">
  ${kk("No. 03", "ASAL-USUL")}
  <div class="stamp" data-at="s3:Konon" data-fx="stampc">KONON</div>
  ${row("TARUHAN KARTU ATAU CATUR", "antara dua raja (legenda)", "s3:taruhan", "rd")}
</div>
<div class="p" data-in="s3:Catatan" data-out="s4">
  ${kk("No. 03", "CATATAN SEJARAH")}
  ${row("PERJANJIAN 1713", "Koch Bihar &amp; Kekaisaran Mughal", "s3:1713")}
  <div class="note" data-at="s3:menetapkan" data-fx="fade">batasnya tidak ditetapkan dengan jelas</div>
</div>
<div class="p" data-in="s4" data-out="s4:Koch">
  ${kk("No. 04", "PEMBAGIAN")}
  <div class="cd mega" data-at="s4:1947" data-fx="card"><b>1947</b><small>India dibagi</small></div>
</div>
<div class="p" data-in="s4:Koch" data-out="s5">
  ${kk("No. 04", "SETELAH 1947")}
  ${row("KOCH BIHAR &rarr; INDIA", "", "s4:Koch", "in")}
  ${row("SEKITARNYA &rarr; PAKISTAN TIMUR", "", "s4:Pakistan", "bd")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("No. 05", "BERSARANG")}
  <div class="cd stat in" data-at="s5:seratus-0.5" data-fx="card"><b>${ct(102, "s5:seratus-0.5", 0.45)}</b><span>enklave India di Bangladesh</span></div>
  <div class="cd stat bd" data-at="s5:dua#2-0.4" data-fx="card"><b>${ct(21, "s5:dua#2-0.4", 0.4)}</b><span>enklave Bangladesh di dalamnya</span></div>
  <div class="cd stat gd" data-at="s5:Dahala" data-fx="card"><b>1</b><span>enklave tingkat tiga</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("No. 06", "SENSUS 2010")}
  <div class="cd stat" data-at="s6:lima-0.5" data-fx="card"><b>${ct(51549, "s6:lima-0.5", 1.4)}</b><span>orang</span></div>
  ${row("TINGGAL DI ENKLAVE", "", "s6:tinggal")}
  <div class="stamp" data-at="s6:tanpa" data-fx="stampc">NYARIS TANPA PEMERINTAHAN</div>
</div>
<div class="p" data-in="s7" data-out="s7:Tengah">
  ${kk("No. 07", "PERJANJIAN TUKAR")}
  ${row("DITANDATANGANI 1974", "", "s7:1974")}
  <div class="cd stat" data-at="s7:empat-0.4" data-fx="card"><b>${ct(41, "s7:empat-0.4", 0.4)}</b><span>tahun kemudian</span></div>
</div>
<div class="p" data-in="s7:Tengah" data-out="s8">
  ${kk("31 JULI 2015", "00.00")}
  <div class="cd stat gd" data-at="s7:seratus-0.5" data-fx="card"><b>${ct(162, "s7:seratus-0.5", 0.5)}</b><span>enklave ditukar</span></div>
  ${row("WARGA MEMILIH", "kewarganegaraannya sendiri", "s7:memilih")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("No. 08", "KAIN AUDIRA")}
  <div class="cd h2">Peta paling rumit,<br><em>akhirnya disederhanakan</em></div>
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  ${kk("No. 08", "PERTANYAAN")}
  <div class="cd q">Kalau kamu tinggal di enklave, negara mana yang kamu pilih? Tulis di komentar.</div>
</div>`;

const stitch = (c) => `outline:3px dashed ${c};outline-offset:-11px`;
const css = `
.p{transform-origin:0% 0%}
.cd{position:relative;background:${CARD};border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.5),0 2px 0 rgba(255,255,255,.55) inset;${stitch("rgba(181,34,47,.55)")}}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;font-size:26px;line-height:1;letter-spacing:.18em;color:#F0D79A;background:${PLUM};padding:14px 24px 13px;border-radius:5px;margin-bottom:20px;box-shadow:0 10px 24px rgba(0,0,0,.5);${stitch("rgba(212,166,58,.75)")};outline-offset:-7px}
.kk i{font-style:normal;color:#E7B85A;border-right:2px dashed ${GOLD};padding-right:16px}
.h1{display:inline-block;padding:20px 38px 24px;font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:86px;line-height:1.0;color:${INK};max-width:900px;box-sizing:border-box}
.h1 em,.h2 em{font-style:italic;font-weight:600;color:${RED}}
.h2{display:inline-block;padding:20px 36px 22px;font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:66px;line-height:1.04;color:${INK}}
.row{flex-direction:column;margin-top:16px;padding:16px 32px 18px;max-width:880px;box-sizing:border-box;border-left:14px solid ${GOLD}}
.row b{display:block;font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:46px;line-height:1.08;letter-spacing:.02em;color:${INK}}
.row span{display:block;margin-top:6px;font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:600;font-size:38px;line-height:1.12;color:#5A4038}
.row.rd{border-left-color:${RED}}.row.in{border-left-color:${SAF}}.row.bd{border-left-color:${BGR}}.row.gd{border-left-color:${GOLD}}
.mega,.stat{display:flex;align-items:baseline;gap:22px;width:max-content;max-width:900px;box-sizing:border-box;margin-top:16px;padding:6px 34px 12px;border-left:14px solid ${GOLD}}
.mega b,.stat b{font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;font-variant-numeric:tabular-nums;font-size:128px;line-height:1.05;color:${INK}}
.stat b{font-size:88px}
.stat.in{border-left-color:${SAF}}.stat.in b{color:#C2610F}
.stat.bd{border-left-color:${BGR}}.stat.bd b{color:${BGR}}
.stat.gd{border-left-color:${GOLD}}.stat.gd b{color:#A87A18}
.mega small,.stat span{font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:600;font-size:40px;color:#5A4038;max-width:430px;line-height:1.08}
.note{display:inline-block;margin-top:16px;font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:600;font-size:36px;line-height:1.22;color:#F6EBD3;background:rgba(42,20,30,.88);border-left:5px solid ${GOLD};padding:11px 22px;max-width:840px;border-radius:4px}
.stamp{display:inline-block;margin-top:20px;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;font-size:40px;letter-spacing:.14em;color:#FBF1DC;background:${RED};padding:14px 30px 12px;border-radius:5px;transform:rotate(-2deg);box-shadow:0 12px 28px rgba(0,0,0,.5);${stitch("rgba(255,236,200,.8)")};outline-offset:-8px}
.q{margin-top:22px;padding:20px 32px 22px;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:40px;line-height:1.22;color:#FBF1DC;background:${PLUM};border-left:14px solid ${RED};max-width:880px;box-sizing:border-box;${stitch("rgba(212,166,58,.7)")}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP38_ENKLAVE_INDIA_BANGLADESH",
  ep: "38", bg: BG, vig: 0.42, grain: 0.05, capfloor: 0.45, html, css, chipFont: MONO, chipColor: "#F0D79A",
  chip: "ILUSTRASI &middot; SULAMAN REKA ULANG",
  extraAt: ["s1:India", "s1:Bangladesh", "s1:India#2", "s1:Bangladesh#2", "s1:Satu-satunya",
    "s2:Dahala", "s2:kebun", "s2:lapangan", "s2:perbatasan", "s2:Petak", "s2:chitmahal",
    "s3:Konon", "s3:kartu", "s3:catur", "s3:Catatan", "s3:1713", "s3:menetapkan", "s3:jelas",
    "s4:1947", "s4:dibagi", "s4:Koch", "s4:Pakistan", "s4:Ratusan", "s4:terjebak", "s4:tetangga",
    "s5:seratus", "s5:dua#2", "s5:Dahala", "s5:tingkat",
    "s6:Sensus", "s6:tinggal", "s6:lima", "s6:ribu", "s6:tanpa",
    "s7:1974", "s7:empat", "s7:baru", "s7:kemudian", "s7:Tengah", "s7:Juli", "s7:seratus", "s7:ditukar", "s7:memilih",
    "s8:Peta", "s8:disederhanakan", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.stat')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:22},{opacity:1,y:0,duration:.5,ease:'power2.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.35,opacity:0},{scale:1,opacity:1,duration:.32,ease:'power3.out',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:18},{opacity:1,y:0,duration:.55,ease:'power2.out'},a-.1)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-14,duration:.32,ease:'power2.in'},b-.32)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:60px;line-height:1.16;color:#FBF1DC;text-shadow:0 3px 0 #1a0d13,0 0 18px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.9)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FBF1DC"},{color:"#F2C14E",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FBF1DC",duration:.16},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.24,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Enklave India Bangladesh", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
