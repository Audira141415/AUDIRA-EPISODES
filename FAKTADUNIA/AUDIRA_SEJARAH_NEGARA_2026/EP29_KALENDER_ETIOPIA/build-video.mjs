// EP29 KALENDER ETIOPIA: STAINEDGLASS. A stone chamber with leaded windows lit by morning light. The 13-month window
// (12 panels of 30 day-diamonds + the small Pagumen oculus) lights panel by panel; then a glass map of Ethiopia, the
// evangelist roundels, Enkutatash jewels on a plinth with the AUDIRA brass plaque, two timeline bands (Annianus vs
// Dionysius, 8 panes apart), a Gregorian lancet that turns 8 -> 7, and a green-yellow-red millennium rose with bunting.
// Panels are leaded dark-glass plaques that rise and settle. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#0A0708", GOLD = "#E9BE45", CREAM = "#F6E9C8", RUBY = "#C0182E", EMER = "#0F8E3C", SAPH = "#2A5CC8";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const chip = (txt, a, cls = "") => `<i class="ch ${cls}" data-at="${a}" data-fx="stampc">${txt}</i>`;

let html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,600;1,700&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 29</div>
  <div class="cd h1">13 BULAN<br>SETAHUN</div>
  <div class="cd yr" data-at="s1:2019" data-fx="card" data-d="flex"><small>TAHUN DI SANA</small><b>2019</b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kk">ETIOPIA</div>
  ${row("KALENDER ETIOPIA", "kalender resmi negara", "s2:Kalender")}
  <div class="chips">${chip("BUKAN MASEHI", "s2:bukan", "rd")}</div>
  ${row("GEREJA ORTODOKS", "juga memakainya", "s2:gereja", "gr")}
</div>
<div class="p" data-in="s3" data-out="s3:Setiap">
  <div class="kk">SATU TAHUN</div>
  <div class="cd mega" data-at="s3:dua" data-fx="card"><b>12</b><small>BULAN &times; 30 HARI</small></div>
  ${row("+ PAGUMEN", "bulan ke-13, hanya 5 hari", "s3:Pagumen", "gd")}
</div>
<div class="p" data-in="s3:Setiap" data-out="s3:Keempat">
  <div class="kk">SETIAP 4 TAHUN</div>
  ${row("PAGUMEN 6 HARI", "satu hari tambahan, tanpa kecuali", "s3:enam", "rd")}
</div>
<div class="p" data-in="s3:Keempat" data-out="s4">
  <div class="kk">NAMA 4 TAHUN DALAM SIKLUS</div>
  <div class="chips">${chip("YOHANES", "s3:Yohanes")}${chip("MATIUS", "s3:Matius")}${chip("MARKUS", "s3:Markus")}${chip("LUKAS", "s3:Lukas", "rd")}</div>
  ${row("TAHUN LUKAS = TAHUN KABISAT", "", "s3:kabisatnya", "rd")}
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kk">TAHUN BARU</div>
  <div class="cd x" data-at="s4:Januari" data-fx="card">1 JANUARI</div>
  <div class="cd mega" data-at="s4:sebelas" data-fx="card"><b>11</b><small>SEPTEMBER</small></div>
  ${row("ENKUTATASH", "artinya &ldquo;hadiah permata&rdquo;", "s4:Enkutatash", "gd")}
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kk">ASAL SELISIH</div>
  <div class="cd h2">Kenapa tahunnya<br>tertinggal?</div>
  <div class="chips">${chip("8 TAHUN LEBIH AWAL", "s5:delapan", "rd")}</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kk">TERTINGGAL DARI MASEHI</div>
  ${row("JANUARI &ndash; SEPTEMBER", "tertinggal 8 tahun", "s6:delapan", "rd")}
  ${row("SETELAH 11 SEPTEMBER", "tertinggal 7 tahun", "s6:tujuh", "gr")}
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kk">MILENIUM ETIOPIA</div>
  <div class="cd x" data-at="s7:2000" data-fx="card">TAHUN 2000</div>
  <div class="cd mega" data-at="s7:2007" data-fx="card"><b>2007</b><small>11 SEPTEMBER</small></div>
  ${row("ADDIS ABABA", "bendera hijau, kuning, merah", "s7:Addis", "gr")}
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="cd h2">Satu planet,<br>banyak cara<br>menghitung waktu</div>
  <div class="cd q" data-at="s8:Menurut" data-fx="card">Kalau setahun ada 13 bulan, bulan tambahannya mau dipakai untuk apa? Tulis di komentar!</div>
</div>`;
// digit runs get EB Garamond (Cinzel numerals read as letters)
html = html.replace(/>([^<]+)</g, (m, s) => ">" + s.replace(/(\d[\d.,]*)/g, '<u class="g">$1</u>') + "<");

const plate = `linear-gradient(170deg,rgba(28,22,26,.94),rgba(12,10,14,.94))`;
const css = `
.g{font-family:'EB Garamond',Georgia,serif;font-weight:700;text-decoration:none;font-style:inherit}
.cd{position:relative;background:${plate};border:3px solid #15161A;outline:2px solid ${GOLD};outline-offset:-8px;border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.6)}
.kk{display:inline-block;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:29px;line-height:1.1;letter-spacing:.12em;color:#1a1208;background:linear-gradient(180deg,#F6D46A,#D9A42A);padding:10px 22px 8px;border:3px solid #15161A;margin-bottom:22px;box-shadow:0 8px 20px rgba(0,0,0,.55)}
.h1{display:inline-block;padding:22px 36px 18px;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:96px;line-height:1.02;color:${CREAM};text-shadow:0 0 22px rgba(240,190,80,.35)}
.h2{display:inline-block;padding:20px 32px 16px;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:60px;line-height:1.1;color:${CREAM}}
.yr{display:flex;align-items:center;gap:22px;width:max-content;margin-top:20px;padding:4px 34px 6px}
.yr small{font-family:Cinzel,Georgia,serif;font-weight:700;font-size:34px;line-height:1.1;color:${CREAM};width:150px}
.yr b{font-family:'EB Garamond',Georgia,serif;font-weight:700;font-size:150px;line-height:1.05;color:#FFD86A;text-shadow:0 0 30px rgba(255,200,80,.85),0 0 70px rgba(255,170,40,.5)}
.chips{display:flex;flex-wrap:wrap;gap:14px;margin-top:20px;align-items:center;max-width:900px}
.ch{font-style:normal;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:40px;line-height:1.1;letter-spacing:.05em;padding:10px 22px 8px;color:#1a1208;background:linear-gradient(180deg,#F6D46A,#D9A42A);border:3px solid #15161A;box-shadow:0 10px 24px rgba(0,0,0,.55)}
.ch.rd{color:${CREAM};background:linear-gradient(180deg,#D8303D,#9A1022)}
.row{margin-top:18px;padding:14px 30px 16px;border-left:16px solid ${GOLD};max-width:880px;box-sizing:border-box}
.row b{display:block;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:48px;line-height:1.1;color:${CREAM}}
.row span{display:block;margin-top:4px;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-weight:600;font-size:40px;line-height:1.2;color:#E9D8AE}
.row.rd{border-left-color:${RUBY}}.row.gr{border-left-color:${EMER}}.row.gd{border-left-color:#F2C232}
.mega{display:flex;align-items:baseline;gap:22px;width:max-content;padding:2px 34px 8px;margin-top:18px}
.mega b{font-family:'EB Garamond',Georgia,serif;font-weight:700;font-size:140px;line-height:1.05;color:#FFD86A;text-shadow:0 0 26px rgba(255,200,80,.6)}
.mega small{font-family:Cinzel,Georgia,serif;font-weight:700;font-size:46px;color:${CREAM}}
.x{display:inline-block;margin-top:16px;padding:10px 28px 8px;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:46px;color:#9a9088;text-decoration:line-through;text-decoration-color:${RUBY};text-decoration-thickness:7px}
.note{display:inline-block;margin-top:16px;max-width:860px;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-weight:700;font-size:36px;line-height:1.2;color:${CREAM};background:rgba(12,10,14,.86);border:2px solid ${GOLD};padding:8px 20px}
.q{margin-top:24px;padding:18px 30px;font-family:'EB Garamond',Georgia,serif;font-weight:700;font-size:46px;line-height:1.18;color:${CREAM};max-width:860px;box-sizing:border-box;border-left:16px solid ${SAPH}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP29_KALENDER_ETIOPIA",
  ep: "29", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.42, html, css, chipFont: "Cinzel,Georgia,serif", chipColor: CREAM,
  chip: "ILUSTRASI &middot; KACA PATRI ORISINAL",
  extraAt: ["s1:satu#2", "s1:bulan", "s1:tiga", "s2:Etiopia", "s2:Etiopia#2", "s2:Ortodoks", "s3:dua", "s3:hari", "s3:puluh", "s3:Sisanya", "s3:lima",
    "s3:ketiga", "s3:Pagumen", "s3:Pagumen#2", "s3:enam", "s3:Keempat", "s3:Yohanes", "s3:Matius", "s3:Markus", "s3:Lukas", "s3:kabisatnya",
    "s4:sebelas", "s4:Enkutatash", "s4:hadiah", "s4:permata", "s5:Sekitar", "s5:Aleksandria", "s5:Annianus", "s5:Eropa", "s5:Dionysius", "s5:delapan",
    "s6:Januari", "s6:September", "s6:September#2", "s6:Setelah", "s6:delapan", "s6:tujuh", "s7:milenium", "s7:2000", "s7:tapi", "s7:2007", "s7:bendera",
    "s7:hijau", "s7:kuning", "s7:merah", "s7:Addis", "s8:planet", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.mega')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:30,filter:'brightness(2.2)'},{opacity:1,y:0,filter:'brightness(1)',duration:.45,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.6,opacity:0},{scale:1,opacity:1,duration:.22,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:36},{opacity:1,y:0,duration:.42,ease:'power3.out'},a-.08)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-24,duration:.24,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'EB Garamond',Georgia,serif;font-weight:700;font-size:66px;line-height:1.12;color:#F6EBD0;text-shadow:0 3px 0 #120c0a,0 0 18px rgba(0,0,0,.95),0 0 4px rgba(0,0,0,.95)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#F6EBD0"},{color:"#FFD24A",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F6EBD0",duration:.14},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.22,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kalender Etiopia 13 Bulan", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
